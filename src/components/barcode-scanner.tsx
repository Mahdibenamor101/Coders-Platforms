"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

export function BarcodeScanner({ onDetected }: { onDetected: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDetectedRef = useRef(onDetected);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    let controls: IScannerControls | null = null;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result && !cancelled) {
          cancelled = true;
          onDetectedRef.current(result.getText());
          controls?.stop();
          setScanning(false);
        }
      })
      .then((c) => {
        controls = c;
        if (cancelled) c.stop();
      })
      .catch(() => {
        setError("Impossible d'acceder a la camera. Verifiez les permissions du navigateur.");
        setScanning(false);
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [scanning]);

  return (
    <div className="space-y-2">
      {!scanning ? (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setError(null);
            setScanning(true);
          }}
        >
          Scanner un code-barres
        </button>
      ) : (
        <div className="space-y-2">
          <video ref={videoRef} className="w-full rounded-lg bg-black" muted playsInline />
          <button type="button" className="btn-secondary" onClick={() => setScanning(false)}>
            Arreter le scan
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
