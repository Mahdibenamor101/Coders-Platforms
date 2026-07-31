"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { loginSchema, signupSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Role } from "@/lib/enums";

export type FormState = { error?: string } | undefined;

const RATE_LIMIT_MESSAGE = "Trop de tentatives. Veuillez patienter quelques minutes avant de reessayer.";

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = await getClientIp();
  if (!checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const parsed = signupSchema.safeParse({
    companyName: formData.get("companyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const { companyName, name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe deja avec cet email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const company = await prisma.company.create({
    data: {
      name: companyName,
      users: {
        create: {
          name,
          email,
          passwordHash,
          role: "ADMIN",
        },
      },
    },
    include: { users: true },
  });

  const user = company.users[0];

  const token = await createSessionToken({
    userId: user.id,
    companyId: company.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/dashboard");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const { email, password } = parsed.data;

  const ip = await getClientIp();
  if (!checkRateLimit(`login:${ip}:${email}`, 10, 15 * 60 * 1000)) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Email ou mot de passe incorrect." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Email ou mot de passe incorrect." };
  }

  const token = await createSessionToken({
    userId: user.id,
    companyId: user.companyId,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
