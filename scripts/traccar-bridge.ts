/**
 * Bridges a self-hosted Traccar server (which understands cheap GPS tracker
 * protocols like GT06/TK103/Teltonika) to this app's device webhook
 * (/api/gps/<token>/position). Traccar has no built-in way to POST our exact
 * JSON shape, so this script polls Traccar's REST API for new positions and
 * forwards each one, once, to the right vehicle.
 *
 * Run continuously (pm2, systemd, or a Docker container) on the same
 * machine/VPS as Traccar, or anywhere with network access to it:
 *   npm run gps:bridge
 *
 * Required env vars (see .env.example):
 *   TRACCAR_URL          e.g. "http://localhost:8082" or "https://traccar.example.com"
 *   TRACCAR_EMAIL        Traccar account email (any user that can read the devices)
 *   TRACCAR_PASSWORD     Traccar account password
 *   TRACCAR_DEVICE_MAP   JSON: {"<traccar deviceId>": "<gpsDeviceToken>", ...}
 *   APP_URL              this app's base URL (already used elsewhere)
 */

const TRACCAR_URL = process.env.TRACCAR_URL;
const TRACCAR_EMAIL = process.env.TRACCAR_EMAIL;
const TRACCAR_PASSWORD = process.env.TRACCAR_PASSWORD;
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const POLL_INTERVAL_MS = Number(process.env.TRACCAR_POLL_INTERVAL_MS || 30000);

function loadDeviceMap(): Record<string, string> {
  const raw = process.env.TRACCAR_DEVICE_MAP;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    console.error("TRACCAR_DEVICE_MAP is not valid JSON, ignoring it.");
    return {};
  }
}

function assertConfigured() {
  const missing = ["TRACCAR_URL", "TRACCAR_EMAIL", "TRACCAR_PASSWORD"].filter(
    (key) => !process.env[key]
  );
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

type TraccarPosition = {
  id: number;
  deviceId: number;
  latitude: number;
  longitude: number;
  speed: number; // knots
  course: number;
  fixTime: string;
};

async function fetchLatestPositions(): Promise<TraccarPosition[]> {
  const auth = Buffer.from(`${TRACCAR_EMAIL}:${TRACCAR_PASSWORD}`).toString("base64");
  const res = await fetch(`${TRACCAR_URL}/api/positions`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) {
    throw new Error(`Traccar /api/positions returned ${res.status}`);
  }
  return res.json();
}

async function forwardToApp(token: string, position: TraccarPosition) {
  const res = await fetch(`${APP_URL}/api/gps/${token}/position`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lat: position.latitude,
      lng: position.longitude,
      speedKmh: position.speed * 1.852, // Traccar reports speed in knots
      heading: position.course,
    }),
  });
  if (!res.ok) {
    console.error(`Forward failed for device ${position.deviceId}: ${res.status}`);
  }
}

async function poll(deviceMap: Record<string, string>, lastSeen: Map<number, string>) {
  const positions = await fetchLatestPositions();
  for (const position of positions) {
    const token = deviceMap[String(position.deviceId)];
    if (!token) continue; // device not mapped to a vehicle in this app - skip

    const previous = lastSeen.get(position.deviceId);
    if (previous === position.fixTime) continue; // already forwarded

    await forwardToApp(token, position);
    lastSeen.set(position.deviceId, position.fixTime);
    console.log(
      `Forwarded device ${position.deviceId} -> token ${token.slice(0, 8)}... (${position.fixTime})`
    );
  }
}

async function main() {
  assertConfigured();
  const deviceMap = loadDeviceMap();
  if (Object.keys(deviceMap).length === 0) {
    console.warn(
      "TRACCAR_DEVICE_MAP is empty - nothing will be forwarded. Add device IDs to vehicle tokens."
    );
  }

  const lastSeen = new Map<number, string>();
  console.log(`Traccar bridge started, polling every ${POLL_INTERVAL_MS / 1000}s.`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await poll(deviceMap, lastSeen);
    } catch (err) {
      console.error("Poll failed:", err instanceof Error ? err.message : err);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main();
