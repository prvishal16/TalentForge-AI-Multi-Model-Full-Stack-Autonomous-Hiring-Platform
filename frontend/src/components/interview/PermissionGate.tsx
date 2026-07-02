import { Camera, Mic, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";

export function PermissionGate({ error, onRetry }: { error?: string | null; onRetry: () => void }) {
  return (
    <GlassCard className="mx-auto max-w-md text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-aurora-violet/20 to-aurora-cyan/20 ring-1 ring-white/10">
        <ShieldCheck className="size-6 text-aurora-cyan" />
      </div>
      <h3 className="text-lg font-medium text-foreground">Camera & microphone access</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        InterviewIQ runs entirely on your device. Nothing is uploaded — recordings stay in your browser.
      </p>
      <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Camera className="size-3.5" /> Camera</span>
        <span className="inline-flex items-center gap-1.5"><Mic className="size-3.5" /> Microphone</span>
      </div>
      {error && (
        <p className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}
      <div className="mt-5">
        <AuroraButton onClick={onRetry}>Grant access</AuroraButton>
      </div>
    </GlassCard>
  );
}