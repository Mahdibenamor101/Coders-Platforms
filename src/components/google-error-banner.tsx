"use client";

import { useSearchParams } from "next/navigation";

const MESSAGES: Record<string, string> = {
  google_not_configured: "La connexion Google n'est pas encore configuree pour cette instance.",
  google_state: "La demande de connexion Google a expire. Reessayez.",
  google_failed: "La connexion avec Google a echoue. Reessayez ou utilisez votre email.",
};

export function GoogleErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (!error || !MESSAGES[error]) return null;

  return (
    <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {MESSAGES[error]}
    </div>
  );
}
