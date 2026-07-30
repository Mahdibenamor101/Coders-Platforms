"use client";

import { useEffect, useState } from "react";

const PING_INTERVAL_MS = 30000;

export function LocationReporter({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "active" | "denied" | "unsupported">("idle");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;

    function ping() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled) return;
          setStatus("active");
          fetch("/api/driver/position", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          }).catch(() => {});
        },
        () => {
          if (!cancelled) setStatus("denied");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    ping();
    const interval = setInterval(ping, PING_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  if (status === "denied") {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Position GPS non partagee - autorisez la localisation pour que le dispatcher suive votre
        position en temps reel.
      </p>
    );
  }

  return null;
}
