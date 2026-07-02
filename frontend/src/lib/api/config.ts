// Central runtime configuration for the Hybrid Data Layer.
// Reads Vite env vars and exposes safe defaults so the app
// never crashes if a variable is missing.

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "";
export const USE_BACKEND = (import.meta.env.VITE_USE_BACKEND as string) === "true";
export const OPENROUTER_URL = (import.meta.env.VITE_OPENROUTER_URL as string) || "";
export const OPENROUTER_KEY = (import.meta.env.VITE_OPENROUTER_KEY as string) || "";

export const HEALTH_ENDPOINT = "/api/health/";
export const HEALTH_TIMEOUT_MS = 2500;
export const REQUEST_TIMEOUT_MS = 8000;
