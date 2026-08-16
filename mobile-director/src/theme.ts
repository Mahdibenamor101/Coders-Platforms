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
  blue: "#1d4ed8",
  blueBg: "#eff6ff",
  white: "#ffffff",
};

export const tractorTrailerStatusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  IN_USE: "En mission",
  MAINTENANCE: "En maintenance",
  OUT_OF_SERVICE: "Hors service",
};

export const driverStatusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  ON_LEAVE: "En congé",
  SUSPENDED: "Suspendu",
};

export const tripStatusLabels: Record<string, string> = {
  PLANNED: "Planifiée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export const orderStatusLabels: Record<string, string> = {
  PENDING: "En attente",
  ASSIGNED: "Assignée",
  IN_PROGRESS: "En cours",
  DELIVERED: "Livrée",
  FAILED: "Échouée",
};

export const priorityLabels: Record<string, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

const NEUTRAL = { bg: "#f1f5f9", text: "#475569" };
const GOOD = { bg: "#ecfdf5", text: "#047857" };
const WARN = { bg: "#fffbeb", text: "#b45309" };
const BAD = { bg: "#fef2f2", text: "#dc2626" };
const INFO = { bg: "#eff6ff", text: "#1d4ed8" };

export const statusColors: Record<string, { bg: string; text: string }> = {
  AVAILABLE: GOOD,
  IN_USE: INFO,
  MAINTENANCE: WARN,
  OUT_OF_SERVICE: BAD,
  ACTIVE: GOOD,
  ON_LEAVE: WARN,
  SUSPENDED: BAD,
  PLANNED: NEUTRAL,
  IN_PROGRESS: INFO,
  COMPLETED: GOOD,
  CANCELLED: BAD,
  PENDING: NEUTRAL,
  ASSIGNED: NEUTRAL,
  DELIVERED: GOOD,
  FAILED: BAD,
  LOW: NEUTRAL,
  MEDIUM: INFO,
  HIGH: WARN,
  URGENT: BAD,
};

export const severityColors: Record<string, { bg: string; text: string }> = {
  CRITICAL: BAD,
  WARNING: WARN,
  INFO: INFO,
};
