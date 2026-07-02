import { API_BASE_URL, HEALTH_ENDPOINT, HEALTH_TIMEOUT_MS, USE_BACKEND } from "./config";

type Listener = (available: boolean) => void;

class BackendStatus {
  private available = false;
  private checked = false;
  private listeners = new Set<Listener>();

  isAvailable() {
    return this.available;
  }

  hasChecked() {
    return this.checked;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private setAvailable(value: boolean) {
    if (this.available !== value) {
      this.available = value;
      this.listeners.forEach((fn) => fn(value));
    }
    this.checked = true;
  }

  async checkOnce() {
    if (!USE_BACKEND || !API_BASE_URL) {
      this.setAvailable(false);
      return false;
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
      const res = await fetch(`${API_BASE_URL}${HEALTH_ENDPOINT}`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timer);
      this.setAvailable(res.ok);
      return res.ok;
    } catch (err) {
      console.warn("[HybridDataLayer] Backend health check failed, using mock data.", err);
      this.setAvailable(false);
      return false;
    }
  }
}

export const backendStatus = new BackendStatus();

// Kick off an initial silent check on module load. Never throws.
void backendStatus.checkOnce();
