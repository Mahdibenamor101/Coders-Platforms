export const colors = {
  primaryDark: "#0d5c42",
  primary: "#047857",
  accent: "#6ee7b7",
  gold: "#fbbf24",
  bg: "#f4f6f8",
  card: "#ffffff",
  text: "#0f172a",
  textMuted: "#64748b",
  textFaint: "#94a3b8",
  border: "#e2e8f0",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  amber: "#b45309",
  amberBg: "#fffbeb",
  white: "#ffffff",
};

export const statusLabels: Record<string, string> = {
  PLANNED: "Planifiée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  ASSIGNED: "À faire",
  DELIVERED: "Livrée",
  FAILED: "Échouée",
};

export const statusColors: Record<string, { bg: string; text: string }> = {
  PLANNED: { bg: "#f1f5f9", text: "#475569" },
  IN_PROGRESS: { bg: "#ecfdf5", text: "#047857" },
  COMPLETED: { bg: "#eff6ff", text: "#1d4ed8" },
  ASSIGNED: { bg: "#f1f5f9", text: "#475569" },
  DELIVERED: { bg: "#ecfdf5", text: "#047857" },
  FAILED: { bg: "#fef2f2", text: "#dc2626" },
};
