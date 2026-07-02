// Small helper for streaming "AI is working" style progress simulations.
// Frontend-only, no network.

export type ProgressStep = { label: string; ms?: number };

export async function streamSteps(
  steps: ProgressStep[],
  onStep: (i: number, label: string) => void,
  onProgress?: (p: number) => void,
) {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    onStep(i, step.label);
    const ms = step.ms ?? 700;
    const startTs = performance.now();
    if (onProgress) {
      // animate progress within the step
      await new Promise<void>((resolve) => {
        const id = window.setInterval(() => {
          const elapsed = performance.now() - startTs;
          const fracInStep = Math.min(1, elapsed / ms);
          const overall = (i + fracInStep) / steps.length;
          onProgress(Math.round(overall * 100));
          if (fracInStep >= 1) {
            window.clearInterval(id);
            resolve();
          }
        }, 60);
      });
    } else {
      await new Promise((r) => setTimeout(r, ms));
    }
  }
  onProgress?.(100);
}

export function pickWithSeed<T>(arr: T[], seed: number, n: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  while (out.length < Math.min(n, arr.length)) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * arr.length);
    if (!used.has(idx)) {
      used.add(idx);
      out.push(arr[idx]);
    }
  }
  return out;
}