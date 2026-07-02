import { useEffect, useRef, useState } from "react";
import type { MetricsSample } from "@/lib/interview/types";

type FaceState = {
  ready: boolean;
  loading: boolean;
  error: string | null;
  faceDetected: boolean;
  faceCentering: number; // 0..100
  gazeScore: number;     // 0..100
  faceVisibility: number; // 0..100
};

const INITIAL: FaceState = {
  ready: false,
  loading: false,
  error: null,
  faceDetected: false,
  faceCentering: 0,
  gazeScore: 0,
  faceVisibility: 0,
};

// Runs @tensorflow-models/face-landmarks-detection MediaPipe FaceMesh
// on the given <video>. All metrics computed from real landmarks.
export function useFaceMetrics(
  video: HTMLVideoElement | null,
  active: boolean,
  onSample?: (s: Partial<MetricsSample>) => void,
) {
  const [state, setState] = useState<FaceState>(INITIAL);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<unknown>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    if (!active || !video) return;
    stopRef.current = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      try {
        const tf = await import("@tensorflow/tfjs-core");
        await import("@tensorflow/tfjs-backend-webgl");
        await tf.setBackend("webgl");
        await tf.ready();
        const fld = await import("@tensorflow-models/face-landmarks-detection");
        const detector = await fld.createDetector(
          fld.SupportedModels.MediaPipeFaceMesh,
          { runtime: "tfjs", refineLandmarks: false, maxFaces: 1 },
        );
        detectorRef.current = detector;
        setState((s) => ({ ...s, ready: true, loading: false }));

        let last = 0;
        const loop = async (t: number) => {
          if (stopRef.current) return;
          if (t - last > 120 && video.readyState >= 2) {
            last = t;
            try {
              const faces = await (detector as { estimateFaces: (v: HTMLVideoElement) => Promise<Array<{ keypoints: Array<{ x: number; y: number }>; box?: { xMin: number; yMin: number; width: number; height: number } }>> }).estimateFaces(video);
              if (!faces.length) {
                setState((s) => ({ ...s, faceDetected: false, faceCentering: 0, gazeScore: 0, faceVisibility: 0 }));
                onSample?.({ faceDetected: false, faceCentering: 0, gazeScore: 0, faceVisibility: 0 });
              } else {
                const face = faces[0]!;
                const vw = video.videoWidth || 1;
                const vh = video.videoHeight || 1;
                // Nose tip (MediaPipe index 1) as head anchor.
                const nose = face.keypoints[1] ?? face.keypoints[0]!;
                const cx = vw / 2;
                const cy = vh / 2;
                const dx = (nose.x - cx) / vw;
                const dy = (nose.y - cy) / vh;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const centering = Math.max(0, Math.min(100, 100 - dist * 260));
                // Approx gaze: nose alignment with midpoint of left(33)/right(263) eye corners.
                const le = face.keypoints[33] ?? nose;
                const re = face.keypoints[263] ?? nose;
                const emx = (le.x + re.x) / 2;
                const gazeDx = Math.abs(nose.x - emx) / vw;
                const gaze = Math.max(0, Math.min(100, 100 - gazeDx * 800));
                const bw = face.box?.width ?? Math.abs(re.x - le.x) * 2.5;
                const bh = face.box?.height ?? bw;
                const visibility = Math.max(0, Math.min(100, ((bw * bh) / (vw * vh)) * 500));
                setState({ ready: true, loading: false, error: null, faceDetected: true, faceCentering: centering, gazeScore: gaze, faceVisibility: visibility });
                onSample?.({ faceDetected: true, faceCentering: centering, gazeScore: gaze, faceVisibility: visibility });
              }
            } catch {
              /* skip frame on error */
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        setState({ ...INITIAL, error: (e as Error).message });
      }
    })();

    return () => {
      stopRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, video, onSample]);

  return state;
}