import { useCallback, useEffect, useState } from "react";

export function useSpeechSynthesis() {
  const [supported] = useState<boolean>(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const update = () =>
      setVoices(
        window.speechSynthesis
          .getVoices()
          .filter((v) => v.lang.toLowerCase().startsWith("en")),
      );
    update();
    window.speechSynthesis.onvoiceschanged = update;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, opts?: { voice?: SpeechSynthesisVoice; rate?: number; volume?: number; onEnd?: () => void }) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (opts?.voice) u.voice = opts.voice;
      u.rate = opts?.rate ?? 1;
      u.volume = opts?.volume ?? 1;
      u.onstart = () => { setSpeaking(true); setPaused(false); };
      u.onend = () => { setSpeaking(false); setPaused(false); opts?.onEnd?.(); };
      u.onerror = () => { setSpeaking(false); setPaused(false); };
      window.speechSynthesis.speak(u);
    },
    [supported],
  );

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, [supported]);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [supported]);

  return { supported, voices, speaking, paused, speak, pause, resume, cancel };
}