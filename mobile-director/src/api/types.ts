export type Tractor = {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number | null;
  mileage: number;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OUT_OF_SERVICE";
  lastMaintenanceDate: string | null;
  nextMaintenanceMileage: number | null;
  insuranceExpiry: string | null;
  technicalControlExpiry: string | null;
  costPerKm: number | null;
  hazmatCertified: boolean;
  fuelLevelPercent: number | null;
  adBlueLevelPercent: number | null;
  notes: string | null;
};

export type Trailer = {
  id: string;
  plateNumber: string;
  type: "CURTAIN" | "REEFER" | "FLATBED" | "TANK" | "CONTAINER" | "TIPPER";
  capacityTons: number | null;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OUT_OF_SERVICE";
  lastInspectionDate: string | null;
  nextInspectionDate: string | null;
  insuranceExpiry: string | null;
  notes: string | null;
};

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "ACTIVE" | "ON_LEAVE" | "SUSPENDED";
  hireDate: string | null;
  notes: string | null;
  skills: string | null;
  costPerKm: number | null;
  accessToken: string;
};

export type OrderSummary = {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string | null;
  pickupAddress: string;
  deliveryAddress: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "DELIVERED" | "FAILED";
  hazmat: boolean;
  weightKg: number | null;
  sequence: number | null;
  tripId: string | null;
  createdAt: string;
  requiredSkills: string | null;
  serviceDurationMin: number;
  timeWindowStart: string | null;
  timeWindowEnd: string | null;
  podNotes: string | null;
  deliveredAt: string | null;
  trip?: { id: string; status: string } | null;
};

export type Trip = {
  id: string;
  tractorId: string;
  trailerId: string | null;
  driverId: string;
  origin: string;
  destination: string;
  departureAt: string;
  estimatedArrivalAt: string | null;
  actualArrivalAt: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  cargoDescription: string | null;
  distanceKm: number | null;
  estimatedDurationMin: number | null;
  driverNotifiedAt: string | null;
  tractor: { plateNumber: string; brand?: string; model?: string };
  trailer: { plateNumber: string } | null;
  driver: { firstName: string; lastName: string; phone?: string };
  orders?: OrderSummary[];
};

export type MaintenanceRecord = {
  id: string;
  tractorId: string | null;
  trailerId: string | null;
  type: "OIL_CHANGE" | "TIRES" | "BRAKES" | "INSPECTION" | "REPAIR" | "OTHER";
  performedAt: string;
  mileage: number | null;
  cost: number | null;
  notes: string | null;
  nextDueAt: string | null;
  nextDueMileage: number | null;
  tractor?: { plateNumber: string } | null;
  trailer?: { plateNumber: string } | null;
};

export type Recommendation = {
  id: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  category: string;
  title: string;
  message: string;
  dueAt: string | null;
  resolved: boolean;
};

export type Company = {
  id: string;
  name: string;
  whatsappPhoneNumberId: string | null;
  whatsappAccessToken: string | null;
  whatsappTestRecipient: string | null;
  depotAddress: string | null;
};

export type DashboardData = {
  stats: { tractorCount: number; trailerCount: number; driverCount: number; activeTripCount: number };
  upcomingTrips: Trip[];
  recommendations: Recommendation[];
  tractorsByStatus: { status: string; _count: number }[];
  ordersByStatus: { status: string; _count: number }[];
};

export type LiveMapData = {
  drivers: { id: string; name: string; lat: number; lng: number; recordedAt: string; status: string }[];
  vehicles: { id: string; label: string; kind: "tractor" | "trailer"; lat: number; lng: number; recordedAt: string }[];
  routes: {
    id: string;
    driverName: string;
    coordinates: [number, number][];
    distanceKm: number | null;
    estimatedDurationMin: number | null;
  }[];
  center: [number, number];
};
