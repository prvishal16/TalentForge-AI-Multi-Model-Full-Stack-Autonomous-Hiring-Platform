import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useResumeExport() {
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);

  const downloadPdf = useCallback(async (nodeId: string, filename = "resume.pdf") => {
    setBusy("pdf");
    const t = toast.loading("Generating PDF…");
    try {
      const node = document.getElementById(nodeId);
      if (!node) throw new Error(`Preview node #${nodeId} not found`);
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      const x = (pageWidth - w) / 2;
      const y = 24;
      pdf.addImage(imgData, "JPEG", x, y, w, h);
      pdf.save(filename);
      toast.success("PDF downloaded", { id: t, description: filename });
    } catch (err) {
      console.error(err);
      toast.error("PDF export failed", { id: t, description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setBusy(null);
    }
  }, []);

  type Section = { label: string; body: string };

  const downloadDocx = useCallback(async (
    payload: { name: string; headline: string; contact: string; sections: Section[] },
    filename = "resume.docx",
  ) => {
    setBusy("docx");
    const t = toast.loading("Generating DOCX…");
    try {
      const [{ Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType }, { saveAs }] =
        await Promise.all([import("docx"), import("file-saver")]);

      const children: InstanceType<typeof Paragraph>[] = [];
      children.push(new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: payload.name, bold: true, size: 40 })],
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: payload.headline, italics: true, size: 22, color: "555555" })],
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: payload.contact, size: 20, color: "666666" })],
      }));
      children.push(new Paragraph({ text: "" }));

      for (const s of payload.sections) {
        if (!s.body.trim()) continue;
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: s.label.toUpperCase(), bold: true, size: 24, color: "1F2937" })],
        }));
        for (const line of s.body.split(/\n+/)) {
          if (!line.trim()) continue;
          children.push(new Paragraph({
            children: [new TextRun({ text: line.trim(), size: 22 })],
          }));
        }
        children.push(new Paragraph({ text: "" }));
      }

      const doc = new Document({
        sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } }, children }],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, filename);
      toast.success("DOCX downloaded", { id: t, description: filename });
    } catch (err) {
      console.error(err);
      toast.error("DOCX export failed", { id: t, description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setBusy(null);
    }
  }, []);

  return { busy, downloadPdf, downloadDocx };
}