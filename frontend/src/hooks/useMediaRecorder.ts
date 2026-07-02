import { useCallback, useEffect, useRef, useState } from "react";

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const m of candidates) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}

export type RecorderState = "idle" | "recording" | "paused" | "stopped";

export function useMediaRecorder(stream: MediaStream | null) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const pausedMsRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const mime = pickMime();

  useEffect(() => {
    if (state !== "recording") return;
    const id = setInterval(() => {
      setElapsed(Date.now() - startedAtRef.current - pausedMsRef.current);
    }, 200);
    return () => clearInterval(id);
  }, [state]);

  const start = useCallback(() => {
    if (!stream || !mime) return;
    chunksRef.current = [];
    const rec = new MediaRecorder(stream, { mimeType: mime });
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorderRef.current = rec;
    startedAtRef.current = Date.now();
    pausedMsRef.current = 0;
    rec.start(1000);
    setElapsed(0);
    setState("recording");
  }, [stream, mime]);

  const pause = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.pause();
      pauseStartRef.current = Date.now();
      setState("paused");
    }
  }, []);

  const resume = useCallback(() => {
    if (recorderRef.current?.state === "paused") {
      recorderRef.current.resume();
      pausedMsRef.current += Date.now() - pauseStartRef.current;
      setState("recording");
    }
  }, []);

  const stop = useCallback(async (): Promise<{ blob: Blob; mime: string; durationMs: number } | null> => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") {
      setState("idle");
      return null;
    }
    const durationMs = Date.now() - startedAtRef.current - pausedMsRef.current;
    return new Promise((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];
        setState("stopped");
        resolve({ blob, mime, durationMs });
      };
      rec.stop();
    });
  }, [mime]);

  const reset = useCallback(() => {
    setElapsed(0);
    setState("idle");
    recorderRef.current = null;
  }, []);

  return { state, elapsed, start, pause, resume, stop, reset, supported: !!mime };
}