import { motion } from "motion/react";
import { Activity, Camera, Eye, Mic, User } from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { MeterRing } from "./MeterRing";
import { cn } from "@/lib/utils";

export type LiveMetrics = {
  faceDetected: boolean;
  faceCentering: number;
  gazeScore: number;
  faceVisibility: number;
  upperBodyVisible: boolean;
  shoulderTilt: number;
  postureScore: number;
  micActive: boolean;
  cameraActive: boolean;
  speakingSec: number;
  recordingSec: number;
  modelsReady: boolean;
};

const fmt = (s: number) => {
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
};

export function LiveInsights({ m }: { m: LiveMetrics }) {
  const attention = Math.round(m.gazeScore * 0.5 + m.faceCentering * 0.5);
  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-aurora-cyan">Live Insights</p>
          <h4 className="text-sm font-medium text-foreground">On-device AI</h4>
        </div>
        <motion.span
          className={cn("size-2 rounded-full", m.modelsReady ? "bg-aurora-emerald" : "bg-amber-400")}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MeterRing value={attention} label="Attention" sublabel={`${attention}%`} />
        <MeterRing value={m.postureScore} label="Posture" sublabel={`${Math.round(m.postureScore)}%`} />
        <MeterRing value={m.faceCentering} label="Framing" sublabel={`${Math.round(m.faceCentering)}%`} />
        <MeterRing value={m.gazeScore} label="Gaze" sublabel={`${Math.round(m.gazeScore)}%`} />
      </div>

      <div className="space-y-2 border-t hairline pt-3">
        <Row icon={<User className="size-3.5" />} label="Face detected" value={m.faceDetected ? "Yes" : "No"} good={m.faceDetected} />
        <Row icon={<Activity className="size-3.5" />} label="Body visible" value={m.upperBodyVisible ? "Yes" : "No"} good={m.upperBodyVisible} />
        <Row icon={<Eye className="size-3.5" />} label="Shoulder tilt" value={`${Math.abs(m.shoulderTilt).toFixed(1)}°`} good={Math.abs(m.shoulderTilt) < 8} />
        <Row icon={<Camera className="size-3.5" />} label="Camera" value={m.cameraActive ? "Active" : "Off"} good={m.cameraActive} />
        <Row icon={<Mic className="size-3.5" />} label="Microphone" value={m.micActive ? "Active" : "Off"} good={m.micActive} />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t hairline pt-3 font-mono text-[11px]">
        <div className="rounded-lg surface-1 p-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Speaking</p>
          <p className="text-foreground">{fmt(m.speakingSec)}</p>
        </div>
        <div className="rounded-lg surface-1 p-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Recording</p>
          <p className="text-foreground">{fmt(m.recordingSec)}</p>
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Face / pose inference runs locally in your browser via TensorFlow.js. Nothing is uploaded.
      </p>
    </GlassCard>
  );
}

function Row({ icon, label, value, good }: { icon: React.ReactNode; label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="inline-flex items-center gap-2 text-muted-foreground">{icon}{label}</span>
      <span className={cn("font-mono", good ? "text-aurora-emerald" : "text-muted-foreground")}>{value}</span>
    </div>
  );
}