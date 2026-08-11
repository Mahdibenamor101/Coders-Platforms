"use client";

import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, AlertTriangle } from "lucide-react";

const SEGMENT_DURATION_MS = 2 * 60 * 1000;

type Status = "idle" | "starting" | "recording" | "denied" | "unsupported" | "error";

function pickMimeType() {
  const candidates = ["video/webm;codecs=vp8", "video/webm", "video/mp4"];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function DashcamRecorder({ token, tripId }: { token: string; tripId: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [segmentsUploaded, setSegmentsUploaded] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const segmentIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef("");
  const stoppingRef = useRef(false);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    return () => {
      stopEverything();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, []);

  function uploadSegment(blob: Blob, index: number) {
    const formData = new FormData();
    formData.append("token", token);
    formData.append("tripId", tripId);
    formData.append("segmentIndex", String(index));
    formData.append("video", blob, `segment-${index}.webm`);
    fetch("/api/driver/dashcam", { method: "POST", body: formData })
      .then((res) => {
        if (res.ok) setSegmentsUploaded((n) => n + 1);
      })
      .catch(() => {});
  }

  function startNewRecorderSegment() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, mimeTypeRef.current ? { mimeType: mimeTypeRef.current } : undefined);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || "video/webm" });
      chunksRef.current = [];
      if (blob.size > 0) {
        uploadSegment(blob, segmentIndexRef.current);
        segmentIndexRef.current += 1;
      }
      if (!stoppingRef.current) {
        startNewRecorderSegment();
      }
    };
    recorder.start();
    recorderRef.current = recorder;
  }

  async function start() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      mimeTypeRef.current = pickMimeType();
      stoppingRef.current = false;
      segmentIndexRef.current = 0;
      setSegmentsUploaded(0);
      startNewRecorderSegment();
      timerRef.current = setInterval(() => {
        recorderRef.current?.stop();
      }, SEGMENT_DURATION_MS);
      setStatus("recording");
    } catch {
      setStatus("denied");
    }
  }

  function stopEverything() {
    stoppingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    recorderRef.current?.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function stop() {
    stopEverything();
    setStatus("idle");
  }

  if (status === "unsupported") {
    return (
      <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
        Dashcam non disponible sur ce navigateur.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
          {status === "recording" ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          ) : (
            <Video className="h-4 w-4 text-slate-400" />
          )}
          Dashcam
        </div>
        {status === "recording" ? (
          <button type="button" onClick={stop} className="btn-secondary inline-flex items-center gap-1.5 text-xs">
            <VideoOff className="h-3.5 w-3.5" />
            Arreter
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={status === "starting"}
            className="btn-secondary inline-flex items-center gap-1.5 text-xs"
          >
            <Video className="h-3.5 w-3.5" />
            {status === "starting" ? "Demarrage..." : "Demarrer"}
          </button>
        )}
      </div>

      {status === "recording" && (
        <p className="mt-2 text-xs text-slate-500">{segmentsUploaded} segment(s) envoye(s).</p>
      )}
      {status === "denied" && (
        <p className="mt-2 text-xs text-amber-700">
          Acces camera refuse. Autorisez la camera pour activer la dashcam.
        </p>
      )}
      {status === "recording" && tabHidden && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          L&apos;enregistrement s&apos;interrompt si l&apos;ecran se verrouille ou l&apos;appli passe en arriere-plan.
        </p>
      )}
      <p className="mt-2 text-xs text-slate-400">
        Enregistre par segments de 2 min tant que cet ecran reste ouvert et au premier plan. Videos
        conservees 3 jours, sauf telechargement par le dispatcher.
      </p>
    </div>
  );
}
