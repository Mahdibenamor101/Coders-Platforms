"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 20000;

export function LiveRefresh() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, router]);

  return (
    <div className="flex items-center gap-4 text-sm">
      <label className="flex items-center gap-2 text-slate-600">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Actualisation auto (20s)
      </label>
      <button
        type="button"
        onClick={() => {
          router.refresh();
          setLastRefresh(new Date());
        }}
        className="btn-secondary"
      >
        Actualiser maintenant
      </button>
      {lastRefresh && (
        <span className="text-xs text-slate-400">
          Derniere actualisation : {lastRefresh.toLocaleTimeString("fr-FR")}
        </span>
      )}
    </div>
  );
}
