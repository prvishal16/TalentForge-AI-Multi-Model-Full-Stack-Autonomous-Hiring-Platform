// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "node:path";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      alias: {
        // MediaPipe runtimes we never execute. Shim their optional peers so
        // pose-detection / face-landmarks-detection compile against real
        // named exports while we run everything via the TFJS runtime.
        "@mediapipe/pose": path.resolve(__dirname, "src/shims/mediapipe-pose.ts"),
        "@mediapipe/face_mesh": path.resolve(__dirname, "src/shims/mediapipe-face-mesh.ts"),
      },
    },
    optimizeDeps: {
      include: [
        "@tensorflow/tfjs-core",
        "@tensorflow/tfjs-converter",
        "@tensorflow/tfjs-backend-webgl",
        "@tensorflow/tfjs-backend-webgpu",
        "@tensorflow-models/pose-detection",
        "@tensorflow-models/face-landmarks-detection",
      ],
    },
    ssr: {
      noExternal: [
        "@tensorflow/tfjs-core",
        "@tensorflow/tfjs-converter",
        "@tensorflow/tfjs-backend-webgl",
        "@tensorflow/tfjs-backend-webgpu",
        "@tensorflow-models/pose-detection",
        "@tensorflow-models/face-landmarks-detection",
      ],
    },
  },
});
