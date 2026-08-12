import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isGoogleOAuthConfigured, buildGoogleAuthUrl } from "@/lib/google-oauth";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", request.url));
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildGoogleAuthUrl(state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5,
  });
  return response;
}
