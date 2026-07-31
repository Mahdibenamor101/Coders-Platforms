"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MESSAGES: Record<string, string> = {
  created: "Enregistre avec succes.",
  updated: "Modifications enregistrees.",
};

const DISPLAY_MS = 4000;

export function FlashBanner({ paramKey = "flash" }: { paramKey?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramKey);
  const [visible, setVisible] = useState(!!value && !!MESSAGES[value]);

  useEffect(() => {
    if (!value || !MESSAGES[value]) return;
    setVisible(true);
    const timeout = setTimeout(() => {
      setVisible(false);
      router.replace(pathname, { scroll: false });
    }, DISPLAY_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!value || !MESSAGES[value] || !visible) return null;

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {MESSAGES[value]}
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          router.replace(pathname, { scroll: false });
        }}
        className="ml-4 font-medium text-emerald-600 hover:text-emerald-800"
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  );
}
