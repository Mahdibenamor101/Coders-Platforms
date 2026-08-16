import { NextRequest } from "next/server";
import { verifySessionToken, type SessionPayload } from "@/lib/auth";

/**
 * The native director app has no cookie jar, so it authenticates with a
 * bearer JWT (the same token format used for the web session cookie)
 * instead. Mobile API routes use this helper rather than getSession().
 */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!bearerToken) return null;
  return verifySessionToken(bearerToken);
}
