import { useEffect, useRef, useState } from "react";
import type { MetricsSample } from "@/lib/interview/types";

type PoseState = {
  ready: boolean;
  loading: boolean;
  upperBodyVisible: boolean;
  shoulderTilt: number;
  postureScore: number;
};

const INITIAL: PoseState = {
  ready: false,
  loading: false,
  upperBodyVisible: false,
  shoulderTilt: 0,
  postureScore: 0,
};

export function usePoseMetrics(
  video: HTMLVideoElement | null,
  active: boolean,
  onSample?: (s: Partial<MetricsSample>) => void,
) {
  const [state, setState] = useState<PoseState>(INITIAL);
  const rafRef = useRef<number | null>(null);
  const stopRef = useRef(false);
  const detectorRef = useRef<unknown>(null);

  useEffect(() => {
    if (!active || !video) return;
    stopRef.current = false;
    setState((s) => ({ ...s, loading: true }));

    (async () => {
      try {
        const tf = await import("@tensorflow/tfjs-core");
        await import("@tensorflow/tfjs-backend-webgl");
        await tf.setBackend("webgl");
        await tf.ready();
        const pd = await import("@tensorflow-models/pose-detection");
        const detector = await pd.createDetector(pd.SupportedModels.MoveNet, {
          modelType: pd.movenet.modelType.SINGLEPOSE_LIGHTNING,
        });
        detectorRef.current = detector;
        setState((s) => ({ ...s, ready: true, loading: false }));

        let last = 0;
        const loop = async (t: number) => {
          if (stopRef.current) return;
          if (t - last > 160 && video.readyState >= 2) {
            last = t;
            try {
              const poses = await (detector as { estimatePoses: (v: HTMLVideoElement) => Promise<Array<{ keypoints: Array<{ x: number; y: number; score?: number; name?: string }> }>> }).estimatePoses(video);
              if (!poses.length) {
                setState((s) => ({ ...s, upperBodyVisible: false, shoulderTilt: 0, postureScore: 0 }));
                onSample?.({ upperBodyVisible: false, shoulderTilt: 0, postureScore: 0 });
              } else {
                const kp = poses[0]!.keypoints;
                const by = (name: string) => kp.find((k) => k.name === name);
                const ls = by("left_shoulder");
                const rs = by("right_shoulder");
                const nose = by("nose");
                const visible = !!(ls && rs && (ls.score ?? 0) > 0.35 && (rs.score ?? 0) > 0.35);
                let tilt = 0;
                let posture = 0;
                if (visible && ls && rs) {
                  tilt = Math.atan2(rs.y - ls.y, rs.x - ls.x) * (180 / Math.PI);
                  const tiltAbs = Math.abs(tilt);
                  const midX = (ls.x + rs.x) / 2;
                  const alignDx = nose ? Math.abs(nose.x - midX) / (video.videoWidth || 1) : 0.2;
                  posture = Math.max(0, Math.min(100, 100 - tiltAbs * 3 - alignDx * 220));
                }
                setState({ ready: true, loading: false, upperBodyVisible: visible, shoulderTilt: tilt, postureScore: posture });
                onSample?.({ upperBodyVisible: visible, shoulderTilt: tilt, postureScore: posture });
              }
            } catch {
              /* skip frame */
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch {
        setState(INITIAL);
      }
    })();

    return () => {
      stopRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, video, onSample]);

  return state;
}