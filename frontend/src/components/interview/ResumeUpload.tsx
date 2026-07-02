import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X, RefreshCcw } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { extractResumeText } from "@/lib/interview/parsers";
import { parseResumeText } from "@/lib/resume/parseResume";
import { useResumeStore } from "@/state/resumeStore";
import { cn } from "@/lib/utils";

export type UploadedResume = { file: File; text: string };

export function ResumeUpload({
  value,
  onChange,
  onContinue,
}: {
  value: UploadedResume | null;
  onChange: (v: UploadedResume | null) => void;
  onContinue: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const setStoredResume = useResumeStore((s) => s.setResume);

  const handleFile = useCallback(async (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum 10MB." });
      return;
    }
    setLoading(true);
    try {
      const text = await extractResumeText(f);
      if (text.length < 100) {
        toast.error("Could not extract enough text", { description: "Try a text-based PDF or a DOCX." });
        return;
      }
      onChange({ file: f, text });
      // Also populate the global Resume store so the whole app stays in sync.
      try {
        const parsed = parseResumeText(text);
        parsed.meta.source = {
          fileName: f.name,
          sizeKB: Math.round(f.size / 1024),
          parsedAt: new Date().toISOString(),
        };
        setStoredResume(parsed);
      } catch { /* non-fatal */ }
      toast.success("Resume parsed", { description: `${f.name} · ${Math.round(text.length / 1000)}k chars` });
    } catch (e) {
      toast.error("Parse failed", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [onChange, setStoredResume]);

  return (
    <div className="space-y-4">
      {!value && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors backdrop-blur-md",
            dragOver ? "border-aurora-cyan/60 bg-aurora-cyan/5" : "border-white/10 surface-1",
          )}
        >
          <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-aurora-violet/20 to-aurora-cyan/20 ring-1 ring-white/10">
            <Upload className="size-6 text-aurora-cyan" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Upload your resume</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">Drag & drop, or browse. PDF or DOCX, up to 10MB.</p>
          <div className="mt-5">
            <AuroraButton onClick={() => inputRef.current?.click()} disabled={loading}>
              {loading ? "Parsing…" : "Browse files"}
            </AuroraButton>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </motion.div>
      )}

      {value && (
        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-aurora-cyan/10 ring-1 ring-aurora-cyan/20">
              <FileText className="size-5 text-aurora-cyan" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{value.file.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {(value.file.size / 1024).toFixed(1)} KB · {value.text.length.toLocaleString()} chars extracted
              </p>
              <p className="mt-3 line-clamp-3 rounded-lg border hairline surface-1 p-3 text-xs text-foreground/80">
                {value.text.slice(0, 400)}{value.text.length > 400 && "…"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCcw className="size-3.5" /> Replace
              </button>
              <button
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" /> Remove
              </button>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </GlassCard>
      )}

      <div className="flex justify-end">
        <AuroraButton onClick={onContinue} disabled={!value}>
          Continue
        </AuroraButton>
      </div>
    </div>
  );
}