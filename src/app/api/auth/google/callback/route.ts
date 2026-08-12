import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { exchangeCodeForTokens, fetchGoogleUserInfo } from "@/lib/google-oauth";
import type { Role } from "@/lib/enums";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=google_state", request.url));
  }

  let user;
  try {
    const { access_token } = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleUserInfo(access_token);

    user = await prisma.user.findUnique({ where: { googleId: profile.sub } });

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({ where: { email: profile.email } });
      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId: profile.sub },
        });
      } else {
        const unusablePassword = await bcrypt.hash(randomUUID(), 10);
        const company = await prisma.company.create({
          data: {
            name: `Entreprise de ${profile.name}`,
            users: {
              create: {
                name: profile.name,
                email: profile.email,
                passwordHash: unusablePassword,
                googleId: profile.sub,
                role: "ADMIN",
              },
            },
          },
          include: { users: true },
        });
        user = company.users[0];
      }
    }
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_failed", request.url));
  }

  const token = await createSessionToken({
    userId: user.id,
    companyId: user.companyId,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  });

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.delete(STATE_COOKIE);
  return response;
}
