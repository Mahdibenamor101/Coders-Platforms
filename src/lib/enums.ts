// SQLite has no native enum support, so Prisma models store these as plain
// strings. These union types mirror the allowed values used across the app.

export type Role = "ADMIN" | "DISPATCHER";

export type DriverStatus = "ACTIVE" | "ON_LEAVE" | "SUSPENDED";

export type TractorStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OUT_OF_SERVICE";

export type TrailerType = "CURTAIN" | "REEFER" | "FLATBED" | "TANK" | "CONTAINER" | "TIPPER";

export type TrailerStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OUT_OF_SERVICE";

export type TripStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type MaintenanceType = "OIL_CHANGE" | "TIRES" | "BRAKES" | "INSPECTION" | "REPAIR" | "OTHER";

export type RecommendationSeverity = "INFO" | "WARNING" | "CRITICAL";

export type RecommendationCategory =
  | "MAINTENANCE"
  | "DOCUMENT_EXPIRY"
  | "DRIVER_HOURS"
  | "INSPECTION"
  | "TRIP_REMINDER";

export type RecommendationEntityType = "TRACTOR" | "TRAILER" | "DRIVER" | "TRIP";

export type WhatsAppMessageType =
  | "TRIP_ASSIGNMENT"
  | "RECOMMENDATION"
  | "MAINTENANCE_ALERT"
  | "CUSTOM";

export type WhatsAppMessageStatus = "PENDING" | "SENT" | "FAILED" | "SIMULATED";
