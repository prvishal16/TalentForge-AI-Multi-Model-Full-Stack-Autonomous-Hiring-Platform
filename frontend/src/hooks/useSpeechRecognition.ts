import { useCallback, useEffect, useRef, useState } from "react";

type SR = {
  new (): SRInstance;
};
type SRInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: unknown) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

function getSR(): SR | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { SpeechRecognition?: SR }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: SR }).webkitSpeechRecognition ||
    null
  );
}

const FILLER_RE = /\b(um+|uh+|erm|hmm+|like|you know|basically|actually|literally|sort of|kind of)\b/gi;

export function useSpeechRecognition() {
  const [supported] = useState<boolean>(() => !!getSR());
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [fillers, setFillers] = useState(0);
  const [pauses, setPauses] = useState(0);
  const recRef = useRef<SRInstance | null>(null);
  const lastFinalAtRef = useRef<number>(0);
  const shouldListenRef = useRef<boolean>(false);

  useEffect(() => () => recRef.current?.abort(), []);

  const start = useCallback(() => {
    const SRCtor = getSR();
    if (!SRCtor) return;
    setTranscript("");
    setInterim("");
    setFillers(0);
    setPauses(0);
    lastFinalAtRef.current = Date.now();
    const rec = new SRCtor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: unknown) => {
      const ev = e as { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> };
      let interimBuf = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i]!;
        const text = res[0]!.transcript;
        if (res.isFinal) {
          const now = Date.now();
          if (now - lastFinalAtRef.current > 1500) setPauses((p) => p + 1);
          lastFinalAtRef.current = now;
          setTranscript((t) => (t ? t + " " : "") + text.trim());
          const fill = (text.match(FILLER_RE) || []).length;
          if (fill) setFillers((f) => f + fill);
        } else {
          interimBuf += text;
        }
      }
      setInterim(interimBuf);
    };
    rec.onerror = () => {
      /* ignored — auto-recover on end */
    };
    rec.onend = () => {
      if (shouldListenRef.current) {
        try { rec.start(); } catch { /* noop */ }
      } else {
        setListening(false);
      }
    };
    recRef.current = rec;
    shouldListenRef.current = true;
    try { rec.start(); setListening(true); } catch { /* noop */ }
  }, []);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, interim, fillers, pauses, start, stop };
}