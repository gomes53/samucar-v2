import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "samucar-admin";
const sessionDurationSeconds = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return "samucar-local-development-secret";
  throw new Error("ADMIN_SESSION_SECRET não está configurado.");
}

function sign(expiresAt: string) {
  return createHmac("sha256", getSecret()).update(expiresAt).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function validateAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    if (process.env.NODE_ENV !== "production") return password === "admin";
    throw new Error("ADMIN_PASSWORD não está configurada.");
  }
  return safeEqual(password, expected);
}

export function createAdminSession() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + sessionDurationSeconds);
  return {
    value: `${expiresAt}.${sign(expiresAt)}`,
    maxAge: sessionDurationSeconds,
  };
}

export async function isAdminAuthenticated() {
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;
  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Date.now() / 1000) return false;
  return safeEqual(signature, sign(expiresAt));
}

export async function setAdminSessionCookie(value: string, maxAge: number) {
  (await cookies()).set(cookieName, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}

export async function clearAdminSessionCookie() {
  (await cookies()).set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
