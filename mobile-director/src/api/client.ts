import { getSession } from "../storage/session";
import type {
  Company,
  DashboardData,
  Driver,
  LiveMapData,
  MaintenanceRecord,
  OrderSummary,
  Recommendation,
  Tractor,
  Trailer,
  Trip,
} from "./types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function buildUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

async function parseJsonResponse(res: Response) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data && typeof data.error === "string" ? data.error : "Erreur serveur";
    throw new ApiError(message, res.status);
  }
  return data;
}

/** Authenticated request using the stored director session. Throws ApiError(401) if not logged in. */
async function request(path: string, options: RequestInit = {}) {
  const session = await getSession();
  if (!session) throw new ApiError("Non authentifie", 401);

  const res = await fetch(buildUrl(session.baseUrl, path), {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${session.token}`,
      ...options.headers,
    },
  });
  return parseJsonResponse(res);
}

export async function loginRequest(baseUrl: string, email: string, password: string) {
  const res = await fetch(buildUrl(baseUrl, "/api/mobile/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseJsonResponse(res) as Promise<{
    token: string;
    user: { id: string; name: string; email: string; role: string };
    company: { id: string; name: string };
  }>;
}

// Dashboard
export const fetchDashboard = () => request("/api/mobile/dashboard") as Promise<DashboardData>;

// Live map
export const fetchLiveMap = () => request("/api/mobile/live") as Promise<LiveMapData>;

// Tractors
export const fetchTractors = () => request("/api/mobile/tractors") as Promise<{ tractors: Tractor[] }>;
export const fetchTractor = (id: string) => request(`/api/mobile/tractors/${id}`) as Promise<{ tractor: Tractor }>;
export const createTractor = (data: Record<string, unknown>) =>
  request("/api/mobile/tractors", { method: "POST", body: JSON.stringify(data) }) as Promise<{ tractor: Tractor }>;
export const updateTractor = (id: string, data: Record<string, unknown>) =>
  request(`/api/mobile/tractors/${id}`, { method: "PATCH", body: JSON.stringify(data) }) as Promise<{ tractor: Tractor }>;
export const deleteTractor = (id: string) => request(`/api/mobile/tractors/${id}`, { method: "DELETE" });

// Trailers
export const fetchTrailers = () => request("/api/mobile/trailers") as Promise<{ trailers: Trailer[] }>;
export const fetchTrailer = (id: string) => request(`/api/mobile/trailers/${id}`) as Promise<{ trailer: Trailer }>;
export const createTrailer = (data: Record<string, unknown>) =>
  request("/api/mobile/trailers", { method: "POST", body: JSON.stringify(data) }) as Promise<{ trailer: Trailer }>;
export const updateTrailer = (id: string, data: Record<string, unknown>) =>
  request(`/api/mobile/trailers/${id}`, { method: "PATCH", body: JSON.stringify(data) }) as Promise<{ trailer: Trailer }>;
export const deleteTrailer = (id: string) => request(`/api/mobile/trailers/${id}`, { method: "DELETE" });

// Drivers
export const fetchDrivers = () => request("/api/mobile/drivers") as Promise<{ drivers: Driver[] }>;
export const fetchDriver = (id: string) =>
  request(`/api/mobile/drivers/${id}`) as Promise<{ driver: Driver; portalLink: string }>;
export const createDriver = (data: Record<string, unknown>) =>
  request("/api/mobile/drivers", { method: "POST", body: JSON.stringify(data) }) as Promise<{ driver: Driver }>;
export const updateDriver = (id: string, data: Record<string, unknown>) =>
  request(`/api/mobile/drivers/${id}`, { method: "PATCH", body: JSON.stringify(data) }) as Promise<{ driver: Driver }>;
export const deleteDriver = (id: string) => request(`/api/mobile/drivers/${id}`, { method: "DELETE" });
export const sendDriverLink = (id: string) => request(`/api/mobile/drivers/${id}/send-link`, { method: "POST" });

// Orders
export const fetchOrders = () => request("/api/mobile/orders") as Promise<{ orders: OrderSummary[] }>;
export const fetchOrder = (id: string) => request(`/api/mobile/orders/${id}`) as Promise<{ order: OrderSummary & { trip?: Trip | null } }>;
export const createOrder = (data: Record<string, unknown>) =>
  request("/api/mobile/orders", { method: "POST", body: JSON.stringify(data) }) as Promise<{ order: OrderSummary }>;
export const updateOrder = (id: string, data: Record<string, unknown>) =>
  request(`/api/mobile/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }) as Promise<{ order: OrderSummary }>;
export const deleteOrder = (id: string) => request(`/api/mobile/orders/${id}`, { method: "DELETE" });
export const unassignOrder = (id: string) => request(`/api/mobile/orders/${id}/unassign`, { method: "POST" });
export const runAutoPlanning = () =>
  request("/api/mobile/orders/plan", { method: "POST" }) as Promise<{
    assigned: number;
    skippedNoCoords: number;
    skippedNoCapacity: number;
    routesTouched: number;
    messages: string[];
  }>;

// Trips
export const fetchTrips = () => request("/api/mobile/trips") as Promise<{ trips: Trip[] }>;
export const fetchTrip = (id: string) => request(`/api/mobile/trips/${id}`) as Promise<{ trip: Trip }>;
export const createTrip = (data: Record<string, unknown>) =>
  request("/api/mobile/trips", { method: "POST", body: JSON.stringify(data) }) as Promise<{ trip: Trip }>;
export const deleteTrip = (id: string) => request(`/api/mobile/trips/${id}`, { method: "DELETE" });
export const updateTripStatus = (id: string, status: Trip["status"]) =>
  request(`/api/mobile/trips/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }) as Promise<{ trip: Trip }>;
export const notifyTripDriver = (id: string) => request(`/api/mobile/trips/${id}/notify`, { method: "POST" });
export const reorderTripStops = (id: string, orderIds: string[]) =>
  request(`/api/mobile/trips/${id}/reorder`, { method: "POST", body: JSON.stringify({ orderIds }) });

// Maintenance
export const fetchMaintenanceRecords = () =>
  request("/api/mobile/maintenance") as Promise<{ records: MaintenanceRecord[] }>;
export const createMaintenanceRecord = (data: Record<string, unknown>) =>
  request("/api/mobile/maintenance", { method: "POST", body: JSON.stringify(data) }) as Promise<{ record: MaintenanceRecord }>;
export const deleteMaintenanceRecord = (id: string) => request(`/api/mobile/maintenance/${id}`, { method: "DELETE" });

// Recommendations
export const fetchRecommendations = () =>
  request("/api/mobile/recommendations") as Promise<{ recommendations: Recommendation[] }>;
export const generateRecommendations = () => request("/api/mobile/recommendations/generate", { method: "POST" });
export const resolveRecommendation = (id: string) =>
  request(`/api/mobile/recommendations/${id}/resolve`, { method: "POST" });

// Settings
export const fetchSettings = () => request("/api/mobile/settings") as Promise<{ company: Company }>;
export const updateSettings = (data: Partial<Company> & { companyName: string }) =>
  request("/api/mobile/settings", { method: "PATCH", body: JSON.stringify(data) }) as Promise<{ company: Company }>;
export const sendTestWhatsApp = () => request("/api/mobile/settings/test-whatsapp", { method: "POST" });
