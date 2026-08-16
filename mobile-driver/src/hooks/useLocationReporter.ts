import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { reportPosition } from "../api/client";

const PING_INTERVAL_MS = 30000;

export type LocationReporterStatus = "idle" | "active" | "denied";

/** Reports the driver's foreground position every 30s while `enabled` is true, mirroring the web portal's LocationReporter. */
export function useLocationReporter(baseUrl: string, token: string, enabled: boolean) {
  const [status, setStatus] = useState<LocationReporterStatus>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStatus("idle");
      return;
    }

    let cancelled = false;

    async function ping() {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== "granted") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const position = await Location.getCurrentPositionAsync({});
        if (cancelled) return;
        setStatus("active");
        await reportPosition(baseUrl, token, position.coords.latitude, position.coords.longitude);
      } catch {
        if (!cancelled) setStatus("denied");
      }
    }

    ping();
    intervalRef.current = setInterval(ping, PING_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [baseUrl, token, enabled]);

  return status;
}
