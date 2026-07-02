// Browser-safe resume text extraction (PDF/DOCX).

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdf(file);
  if (name.endsWith(".docx")) return extractDocx(file);
  if (name.endsWith(".txt") || file.type.startsWith("text/")) return file.text();
  throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
}

async function extractPdf(file: File): Promise<string> {
  // Lazy import so pdfjs (large) never enters the initial bundle.
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } })
    .GlobalWorkerOptions.workerSrc = workerUrl;
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const pageTexts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pageTexts.push(reconstructPage(content.items as PdfItem[]));
  }
  return normalizeText(pageTexts.join("\n\n"));
}

type PdfItem = {
  str: string;
  transform: number[]; // [a,b,c,d,x,y]
  height?: number;
  width?: number;
  hasEOL?: boolean;
};

// Rebuild readable lines from pdfjs text items using their y/x positions.
// Handles single- and two-column layouts and preserves paragraph breaks.
function reconstructPage(items: PdfItem[]): string {
  const glyphs = items
    .filter((it) => typeof it?.str === "string")
    .map((it) => ({
      s: it.str,
      x: it.transform?.[4] ?? 0,
      y: it.transform?.[5] ?? 0,
      h: it.height || Math.abs(it.transform?.[3] ?? 10) || 10,
      w: it.width || 0,
    }))
    .filter((g) => g.s.length > 0);
  if (glyphs.length === 0) return "";

  // Detect two-column layout: cluster x-starts into 2 buckets.
  const xs = glyphs.map((g) => g.x).sort((a, b) => a - b);
  const minX = xs[0];
  const maxX = xs[xs.length - 1];
  const width = maxX - minX;
  let columns: { min: number; max: number }[] = [{ min: -Infinity, max: Infinity }];
  if (width > 200) {
    // Simple 1D k-means with k=2, seeded at 25% and 75%.
    let c1 = minX + width * 0.15;
    let c2 = minX + width * 0.65;
    for (let iter = 0; iter < 8; iter++) {
      const b1: number[] = [], b2: number[] = [];
      for (const x of xs) (Math.abs(x - c1) < Math.abs(x - c2) ? b1 : b2).push(x);
      if (!b1.length || !b2.length) break;
      const n1 = b1.reduce((a, v) => a + v, 0) / b1.length;
      const n2 = b2.reduce((a, v) => a + v, 0) / b2.length;
      if (Math.abs(n1 - c1) < 0.5 && Math.abs(n2 - c2) < 0.5) { c1 = n1; c2 = n2; break; }
      c1 = n1; c2 = n2;
    }
    const sep = (c1 + c2) / 2;
    const rightCount = xs.filter((x) => x >= sep).length;
    const leftCount = xs.length - rightCount;
    // Only treat as two-column when both sides have real content and columns are well separated.
    if (Math.abs(c2 - c1) > width * 0.35 && leftCount > 20 && rightCount > 20) {
      columns = [
        { min: -Infinity, max: sep },
        { min: sep, max: Infinity },
      ];
    }
  }

  const parts: string[] = [];
  for (const col of columns) {
    const colGlyphs = glyphs.filter((g) => g.x >= col.min && g.x < col.max);
    parts.push(glyphsToLines(colGlyphs));
  }
  return parts.filter(Boolean).join("\n\n");
}

function glyphsToLines(glyphs: { s: string; x: number; y: number; h: number; w: number }[]): string {
  if (!glyphs.length) return "";
  // Group into lines by y (pdfjs y grows upward → sort desc). Tolerance = half height.
  const sorted = [...glyphs].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: (typeof sorted)[] = [];
  let current: typeof sorted = [];
  let currentY = sorted[0].y;
  let currentH = sorted[0].h;
  for (const g of sorted) {
    const tol = Math.max(2, currentH * 0.55);
    if (current.length === 0 || Math.abs(g.y - currentY) <= tol) {
      current.push(g);
      currentY = current.reduce((a, x) => a + x.y, 0) / current.length;
      currentH = Math.max(currentH, g.h);
    } else {
      lines.push(current.sort((a, b) => a.x - b.x));
      current = [g];
      currentY = g.y;
      currentH = g.h;
    }
  }
  if (current.length) lines.push(current.sort((a, b) => a.x - b.x));

  // Emit each line as a string with spaces where inter-glyph gap > ~0.3 * glyph height.
  const out: string[] = [];
  let prevY: number | null = null;
  let prevH = 10;
  for (const line of lines) {
    const avgY = line.reduce((a, g) => a + g.y, 0) / line.length;
    const avgH = line.reduce((a, g) => a + g.h, 0) / line.length;
    // Blank line if vertical gap between paragraphs is larger than ~1.6x line height.
    if (prevY !== null && Math.abs(prevY - avgY) > Math.max(prevH, avgH) * 1.6) {
      out.push("");
    }
    let text = "";
    let prev: (typeof line)[number] | null = null;
    for (const g of line) {
      if (prev) {
        const gap = g.x - (prev.x + (prev.w || prev.s.length * avgH * 0.4));
        if (gap > avgH * 0.35 && !/\s$/.test(text) && !/^\s/.test(g.s)) text += " ";
      }
      text += g.s;
      prev = g;
    }
    out.push(text.replace(/\s+/g, " ").trim());
    prevY = avgY;
    prevH = avgH;
  }
  return out.join("\n");
}

function normalizeText(t: string): string {
  return t
    .replace(/\r/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\u00AD/g, "") // soft hyphen
    .replace(/[\u2022\u25E6\u25AA\u25A0\u2043\u2219\u25CF\u25CB\u25AB\u25A1\u2765\u2767\uF0B7]/g, "•")
    .replace(/\uFB01/g, "fi")
    .replace(/\uFB02/g, "fl")
    .replace(/[\u2013\u2014]/g, "–")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractDocx(file: File): Promise<string> {
  const mammoth: { extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> } =
    // @ts-expect-error - browser build ships without types
    await import("mammoth/mammoth.browser.js");
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return normalizeText(String(value ?? ""));
}