import { USE_BACKEND } from "./config";
import { backendStatus } from "./backendStatus";

/**
 * Runs `backendFn` when the backend is configured+reachable, otherwise
 * (or on any failure) transparently falls back to `mockFn`.
 * This function NEVER throws — callers always get data.
 */
export async function hybridCall<T>(
  backendFn: () => Promise<T>,
  mockFn: () => Promise<T> | T
): Promise<T> {
  if (USE_BACKEND && backendStatus.isAvailable()) {
    try {
      return await backendFn();
    } catch (err) {
      console.warn("[HybridDataLayer] Backend call failed, falling back to mock data.", err);
      backendStatus.checkOnce();
      return await mockFn();
    }
  }
  return await mockFn();
}
