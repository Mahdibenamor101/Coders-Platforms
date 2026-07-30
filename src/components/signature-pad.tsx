"use client";

import { useRef, useState } from "react";

export function SignaturePad({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [dataUrl, setDataUrl] = useState("");

  function getContext() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = getContext();
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function finishStroke() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setHasSignature(true);
    setDataUrl(canvasRef.current?.toDataURL("image/png") ?? "");
  }

  function clear() {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setDataUrl("");
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="w-full touch-none rounded-lg border border-slate-300 bg-white"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {hasSignature ? "Signature capturee" : "Faites signer le client ci-dessus"}
        </p>
        <button type="button" className="btn-secondary" onClick={clear}>
          Effacer
        </button>
      </div>
      <input type="hidden" name={name} value={dataUrl} />
    </div>
  );
}
