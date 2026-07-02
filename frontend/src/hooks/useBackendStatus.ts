import { useEffect, useState } from "react";
import { backendStatus } from "@/lib/api";

/** Returns true/false once the health check resolves; defaults to false (mock mode). */
export function useBackendStatus() {
  const [available, setAvailable] = useState(backendStatus.isAvailable());

  useEffect(() => {
    const unsub = backendStatus.subscribe(setAvailable);
    backendStatus.checkOnce();
    return unsub;
  }, []);

  return available;
}
