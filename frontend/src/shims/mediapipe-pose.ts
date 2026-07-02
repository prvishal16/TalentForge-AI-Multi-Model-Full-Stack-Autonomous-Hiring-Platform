// Shim for @mediapipe/pose. We use the TFJS runtime (MoveNet) so the MediaPipe
// runtime code path is never executed — the bundler just needs these named
// exports to resolve. Do NOT delete: @tensorflow-models/pose-detection has a
// hard `import * as t from "@mediapipe/pose"` that will break the build.
export class Pose {
  constructor(..._args: unknown[]) {}
  setOptions(_opts: unknown) {}
  onResults(_cb: unknown) {}
  async send(_data: unknown) {}
  async close() {}
}
export const POSE_CONNECTIONS: Array<[number, number]> = [];
export const POSE_LANDMARKS: Record<string, number> = {};
export const POSE_LANDMARKS_LEFT: Record<string, number> = {};
export const POSE_LANDMARKS_RIGHT: Record<string, number> = {};
export const POSE_LANDMARKS_NEUTRAL: Record<string, number> = {};
export const VERSION = "0.5.0-shim";
export default { Pose, POSE_CONNECTIONS, POSE_LANDMARKS, VERSION };