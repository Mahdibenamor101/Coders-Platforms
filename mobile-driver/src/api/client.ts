export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};

export type TripOrderSummary = {
  id: string;
  reference: string;
  customerName: string;
  deliveryAddress: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "DELIVERED" | "FAILED";
  sequence: number;
};

export type Trip = {
  id: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  origin: string;
  destination: string;
  departureAt: string;
  tractor: { plateNumber: string };
  trailer: { plateNumber: string } | null;
  orders: TripOrderSummary[];
};

export type OrderDetail = {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string | null;
  pickupAddress: string;
  deliveryAddress: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "DELIVERED" | "FAILED";
  hazmat: boolean;
  deliveredAt: string | null;
  podNotes: string | null;
};

function buildUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

async function parseJsonResponse(res: Response) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && typeof data.error === "string") ? data.error : "Erreur serveur";
    throw new ApiError(message, res.status);
  }
  return data;
}

export function parsePersonalLink(link: string): { baseUrl: string; token: string } | null {
  try {
    const trimmed = link.trim();
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/driver\/([^/]+)/);
    if (!match) return null;
    return { baseUrl: url.origin, token: match[1] };
  } catch {
    return null;
  }
}

export async function fetchTrips(baseUrl: string, token: string): Promise<{ driver: Driver; trips: Trip[] }> {
  const res = await fetch(buildUrl(baseUrl, `/api/mobile/driver/trips?token=${encodeURIComponent(token)}`));
  return parseJsonResponse(res);
}

export async function fetchOrder(baseUrl: string, token: string, orderId: string): Promise<{ order: OrderDetail }> {
  const res = await fetch(
    buildUrl(baseUrl, `/api/mobile/driver/orders/${orderId}?token=${encodeURIComponent(token)}`)
  );
  return parseJsonResponse(res);
}

export async function startOrder(baseUrl: string, token: string, orderId: string): Promise<{ order: OrderDetail }> {
  const res = await fetch(buildUrl(baseUrl, `/api/mobile/driver/orders/${orderId}/start`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return parseJsonResponse(res);
}

export async function failOrder(
  baseUrl: string,
  token: string,
  orderId: string,
  reason: string
): Promise<{ order: OrderDetail }> {
  const res = await fetch(buildUrl(baseUrl, `/api/mobile/driver/orders/${orderId}/fail`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, reason: reason || undefined }),
  });
  return parseJsonResponse(res);
}

export async function submitPod(
  baseUrl: string,
  token: string,
  orderId: string,
  input: {
    podSignature: string;
    podNotes: string;
    podBarcode: string;
    photoUri: string | null;
  }
): Promise<{ order: OrderDetail }> {
  const formData = new FormData();
  formData.append("token", token);
  formData.append("podSignature", input.podSignature);
  formData.append("podNotes", input.podNotes);
  formData.append("podBarcode", input.podBarcode);
  if (input.photoUri) {
    const filename = input.photoUri.split("/").pop() || "photo.jpg";
    // React Native's fetch accepts this file-descriptor object shape for FormData.
    formData.append("photo", {
      uri: input.photoUri,
      name: filename,
      type: "image/jpeg",
    } as unknown as Blob);
  }

  const res = await fetch(buildUrl(baseUrl, `/api/mobile/driver/orders/${orderId}/pod`), {
    method: "POST",
    body: formData,
  });
  return parseJsonResponse(res);
}

export async function reportPosition(baseUrl: string, token: string, lat: number, lng: number): Promise<void> {
  await fetch(buildUrl(baseUrl, "/api/driver/position"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, lat, lng }),
  }).catch(() => {});
}

export async function uploadDashcamSegment(
  baseUrl: string,
  token: string,
  tripId: string,
  segmentIndex: number,
  videoUri: string
): Promise<void> {
  const formData = new FormData();
  formData.append("token", token);
  formData.append("tripId", tripId);
  formData.append("segmentIndex", String(segmentIndex));
  const filename = videoUri.split("/").pop() || `segment-${segmentIndex}.mp4`;
  formData.append("video", {
    uri: videoUri,
    name: filename,
    type: "video/mp4",
  } as unknown as Blob);

  await fetch(buildUrl(baseUrl, "/api/driver/dashcam"), {
    method: "POST",
    body: formData,
  }).catch(() => {});
}
