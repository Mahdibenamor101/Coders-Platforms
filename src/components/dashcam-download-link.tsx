"use client";

import { Download } from "lucide-react";

export function DashcamDownloadLink({
  videoUrl,
  markDownloadedAction,
}: {
  videoUrl: string;
  markDownloadedAction: () => Promise<void>;
}) {
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        markDownloadedAction();
      }}
      className="btn-secondary inline-flex items-center gap-1.5 text-xs"
    >
      <Download className="h-3.5 w-3.5" />
      Telecharger (conserver)
    </a>
  );
}
