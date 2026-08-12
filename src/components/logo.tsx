export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0d5c42" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#logoBg)" />
      <circle cx="11" cy="35" r="2.8" fill="none" stroke="#d1fae5" strokeWidth="2" opacity="0.85" />
      <path
        d="M11 35 C 18 35, 16 22, 24 22 C 32 22, 30 12, 38 12"
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="38" cy="12" r="3.6" fill="#fbbf24" stroke="#0d5c42" strokeWidth="1.3" />
    </svg>
  );
}

export function Logo({
  size = 32,
  textClassName = "text-lg",
  showWordmark = true,
  variant = "light",
  className,
}: {
  size?: number;
  textClassName?: string;
  showWordmark?: boolean;
  variant?: "light" | "dark";
  className?: string;
}) {
  const baseColor = variant === "dark" ? "text-white" : "text-slate-900";
  const accentColor = variant === "dark" ? "text-emerald-400" : "text-emerald-600";
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className={`font-extrabold tracking-tight ${baseColor} ${textClassName}`}>
          LOGISTICS<span className={accentColor}>@MAHDI</span>
        </span>
      )}
    </span>
  );
}
