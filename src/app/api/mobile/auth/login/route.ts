import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Role } from "@/lib/enums";

/**
 * POST /api/mobile/auth/login
 * body: { email, password }
 * Used by the React Native director app. Returns the same JWT format as the
 * web session cookie, but as a bearer token the app stores itself.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse({ email: body?.email, password: body?.password });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Donnees invalides" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`mobile-login:${ip}:${email}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter quelques minutes." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email }, include: { company: true } });
  if (!user) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  const token = await createSessionToken({
    userId: user.id,
    companyId: user.companyId,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  });

  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    company: { id: user.company.id, name: user.company.name },
  });
}
