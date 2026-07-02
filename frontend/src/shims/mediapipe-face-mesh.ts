// Shim for @mediapipe/face_mesh. We use the TFJS runtime for
// face-landmarks-detection, so the MediaPipe runtime is never invoked — but
// @tensorflow-models/face-landmarks-detection statically imports names from
// this module and the build fails without them.
export class FaceMesh {
  constructor(..._args: unknown[]) {}
  setOptions(_opts: unknown) {}
  onResults(_cb: unknown) {}
  async send(_data: unknown) {}
  async close() {}
}
export const FACEMESH_TESSELATION: Array<[number, number]> = [];
export const FACEMESH_RIGHT_EYE: Array<[number, number]> = [];
export const FACEMESH_LEFT_EYE: Array<[number, number]> = [];
export const FACEMESH_FACE_OVAL: Array<[number, number]> = [];
export const FACEMESH_LIPS: Array<[number, number]> = [];
export const VERSION = "0.4.0-shim";
export default { FaceMesh, FACEMESH_TESSELATION, VERSION };