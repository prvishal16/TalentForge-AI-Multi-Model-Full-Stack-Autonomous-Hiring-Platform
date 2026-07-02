import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Circle, Pause, Play, RotateCcw, SkipForward, StopCircle, Volume2, VolumeX,
} from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { PermissionGate } from "./PermissionGate";
import { RecordingIndicator } from "./RecordingIndicator";
import { Countdown } from "./Countdown";
import { LiveInsights, type LiveMetrics } from "./LiveInsights";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useFaceMetrics } from "@/hooks/useFaceMetrics";
import { usePoseMetrics } from "@/hooks/usePoseMetrics";
import type { Question } from "@/lib/interview/questions";
import type { MetricsSample, RecordingResult } from "@/lib/interview/types";
import { cn } from "@/lib/utils";

const CAT_TINT: Record<string, string> = {
  Technical: "text-aurora-cyan",
  Projects: "text-aurora-violet",
  Behavioral: "text-aurora-indigo",
  "Problem Solving": "text-amber-300",
  Communication: "text-aurora-emerald",
};

export function InterviewRunner({
  questions,
  onFinish,
}: {
  questions: Question[];
  onFinish: (recordings: RecordingResult[]) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permError, setPermError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [recordings, setRecordings] = useState<RecordingResult[]>([]);
  const samplesRef = useRef<MetricsSample[]>([]);
  const questionStartRef = useRef<number>(Date.now());

  const rec = useMediaRecorder(stream);
  const sr = useSpeechRecognition();
  const tts = useSpeechSynthesis();
  const currentQ = questions[idx];

  const requestMedia = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setStream(s);
      setPermError(null);
    } catch (e) {
      setPermError((e as Error).message || "Camera / microphone access denied.");
    }
  }, []);

  useEffect(() => { requestMedia(); }, [requestMedia]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
    return () => {
      if (!stream) return;
      // Only stop on unmount, not on stream change
    };
  }, [stream]);

  useEffect(() => () => { stream?.getTracks().forEach((t) => t.stop()); }, [stream]);

  // Speak question when it changes
  useEffect(() => {
    if (!currentQ || !tts.supported || muted) return;
    const voice = tts.voices.find((v) => v.name.toLowerCase().includes("google")) ?? tts.voices[0];
    tts.speak(currentQ.text, { voice, rate });
    return () => tts.cancel();
     
  }, [idx, tts.supported, tts.voices.length]);

  const onSample = useCallback((s: Partial<MetricsSample>) => {
    if (rec.state !== "recording") return;
    samplesRef.current.push({
      t: Date.now() - questionStartRef.current,
      faceDetected: s.faceDetected ?? false,
      faceCentering: s.faceCentering ?? 0,
      gazeScore: s.gazeScore ?? 0,
      faceVisibility: s.faceVisibility ?? 0,
      upperBodyVisible: s.upperBodyVisible ?? false,
      shoulderTilt: s.shoulderTilt ?? 0,
      postureScore: s.postureScore ?? 0,
    });
  }, [rec.state]);

  const face = useFaceMetrics(videoRef.current, !!stream, onSample);
  const pose = usePoseMetrics(videoRef.current, !!stream, onSample);

  const startRecording = useCallback(() => {
    samplesRef.current = [];
    questionStartRef.current = Date.now();
    sr.start();
    rec.start();
  }, [rec, sr]);

  const finalizeAndAdvance = useCallback(async () => {
    tts.cancel();
    sr.stop();
    const result = await rec.stop();
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const samples = samplesRef.current;
    const avg = (k: keyof MetricsSample) =>
      samples.length ? samples.reduce((s, x) => s + (x[k] as number || 0), 0) / samples.length : 0;
    const words = sr.transcript.trim().split(/\s+/).filter(Boolean).length;
    const wpm = result.durationMs > 0 ? Math.round(words / (result.durationMs / 60000)) : 0;
    const item: RecordingResult = {
      questionId: currentQ.id,
      blob: result.blob,
      url,
      mime: result.mime,
      durationMs: result.durationMs,
      transcript: sr.transcript,
      wpm,
      fillers: sr.fillers,
      avgAttention: Math.round((avg("gazeScore") + avg("faceCentering")) / 2),
      avgPosture: Math.round(avg("postureScore")),
      framingScore: Math.round(avg("faceCentering")),
      samples,
    };
    const updated = [...recordings, item];
    setRecordings(updated);
    if (idx + 1 >= questions.length) {
      stream?.getTracks().forEach((t) => t.stop());
      onFinish(updated);
    } else {
      rec.reset();
      setIdx(idx + 1);
    }
  }, [rec, sr, tts, currentQ, idx, questions.length, recordings, stream, onFinish]);

  const retake = useCallback(async () => {
    if (rec.state === "recording" || rec.state === "paused") {
      await rec.stop();
    }
    sr.stop();
    rec.reset();
    samplesRef.current = [];
    questionStartRef.current = Date.now();
  }, [rec, sr]);

  if (!stream) {
    return <PermissionGate error={permError} onRetry={requestMedia} />;
  }

  const liveMetrics: LiveMetrics = {
    faceDetected: face.faceDetected,
    faceCentering: face.faceCentering,
    gazeScore: face.gazeScore,
    faceVisibility: face.faceVisibility,
    upperBodyVisible: pose.upperBodyVisible,
    shoulderTilt: pose.shoulderTilt,
    postureScore: pose.postureScore,
    micActive: rec.state === "recording",
    cameraActive: !!stream,
    speakingSec: sr.transcript ? Math.round(rec.elapsed / 1000) : 0,
    recordingSec: Math.round(rec.elapsed / 1000),
    modelsReady: face.ready && pose.ready,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {/* Video stage */}
        <div className="relative overflow-hidden rounded-2xl border hairline bg-black elev-1">
          <video
            ref={videoRef}
            autoPlay muted playsInline
            className="aspect-video w-full scale-x-[-1] object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {rec.state === "recording" || rec.state === "paused" ? (
              <RecordingIndicator elapsedMs={rec.elapsed} paused={rec.state === "paused"} />
            ) : (
              <span className="rounded-full border hairline bg-black/40 px-2.5 py-1 font-mono text-[10px] text-white/80">READY</span>
            )}
            <div className="flex items-center gap-2">
              <span className="rounded-full border hairline bg-black/40 px-2.5 py-1 font-mono text-[10px] text-white/80">
                Q {idx + 1} / {questions.length}
              </span>
              {tts.speaking && (
                <span className="inline-flex items-center gap-1.5 rounded-full border hairline bg-black/40 px-2.5 py-1 text-[10px] text-white/80">
                  <motion.span className="size-1.5 rounded-full bg-aurora-cyan" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} />
                  AI is asking
                </span>
              )}
            </div>
          </div>

          {/* Live transcript overlay */}
          {sr.listening && (sr.transcript || sr.interim) && (
            <div className="absolute inset-x-0 bottom-0 max-h-[35%] overflow-y-auto bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
              <p className="text-sm text-white/90" aria-live="polite">
                {sr.transcript} <span className="text-white/50">{sr.interim}</span>
              </p>
            </div>
          )}
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <GlassCard>
              <div className="flex items-start gap-4">
                <Countdown seconds={currentQ.estSeconds} running={rec.state === "recording"} keyRef={currentQ.id} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("font-mono text-[10px] uppercase tracking-widest", CAT_TINT[currentQ.category])}>
                      {currentQ.category}
                    </span>
                    <span className="rounded-full surface-3 px-2 py-0.5 text-[10px] text-muted-foreground">{currentQ.difficulty}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">~{Math.round(currentQ.estSeconds / 60)} min</span>
                  </div>
                  <p className="mt-2 text-lg font-medium leading-snug text-foreground">{currentQ.text}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t hairline pt-4">
                <div className="flex items-center gap-1.5">
                  <IconBtn onClick={() => { if (currentQ) { const voice = tts.voices[0]; tts.speak(currentQ.text, { voice, rate }); } }} title="Replay question">
                    <Volume2 className="size-4" />
                  </IconBtn>
                  <IconBtn onClick={() => (tts.paused ? tts.resume() : tts.pause())} title="Pause voice" disabled={!tts.speaking && !tts.paused}>
                    {tts.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                  </IconBtn>
                  <IconBtn onClick={() => setMuted((m) => { const nm = !m; if (nm) tts.cancel(); return nm; })} title="Mute AI voice">
                    {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  </IconBtn>
                  <label className="ml-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    Rate
                    <input
                      type="range" min={0.8} max={1.2} step={0.05}
                      value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-24 accent-aurora-cyan"
                    />
                    <span className="w-8 font-mono text-[10px]">{rate.toFixed(2)}x</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  {rec.state === "idle" || rec.state === "stopped" ? (
                    <AuroraButton onClick={startRecording} disabled={!rec.supported}>
                      <Circle className="size-4 fill-current" /> Start recording
                    </AuroraButton>
                  ) : (
                    <>
                      {rec.state === "recording" ? (
                        <button onClick={rec.pause} className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground hover:text-foreground">
                          <Pause className="size-4" /> Pause
                        </button>
                      ) : (
                        <button onClick={rec.resume} className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground">
                          <Play className="size-4" /> Resume
                        </button>
                      )}
                      <button onClick={retake} className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                        <RotateCcw className="size-4" /> Retake
                      </button>
                      <AuroraButton onClick={finalizeAndAdvance}>
                        {idx + 1 >= questions.length ? <><StopCircle className="size-4" /> Finish</> : <><SkipForward className="size-4" /> Next</>}
                      </AuroraButton>
                    </>
                  )}
                </div>
              </div>

              {!rec.supported && (
                <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  Your browser doesn't support MediaRecorder. Try Chrome, Edge, or Firefox.
                </p>
              )}
              {!sr.supported && (
                <p className="mt-3 rounded-lg border hairline surface-1 px-3 py-2 text-xs text-muted-foreground">
                  Live transcript unavailable in this browser — the recording still captures your audio.
                </p>
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>

      <LiveInsights m={liveMetrics} />
    </div>
  );
}

function IconBtn({
  children, onClick, title, disabled,
}: { children: React.ReactNode; onClick: () => void; title: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className="grid size-9 place-items-center rounded-lg border hairline surface-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
    >
      {children}
    </button>
  );
}