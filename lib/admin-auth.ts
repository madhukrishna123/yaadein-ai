import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "yaadein_admin_session";

const cookieMaxAgeSeconds = 60 * 60 * 12;

export function hasAdminPassword() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return isValidAdminToken(token);
}

export function isAdminRequestAuthenticated(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`))
    ?.split("=")[1];

  return isValidAdminToken(token ? decodeURIComponent(token) : undefined);
}

export function createAdminLoginResponse(nextPath: string, requestUrl: string) {
  const response = NextResponse.redirect(new URL(nextPath, requestUrl));
  response.cookies.set(ADMIN_COOKIE_NAME, adminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cookieMaxAgeSeconds
  });
  return response;
}

export function createAdminLogoutResponse(requestUrl: string) {
  const response = NextResponse.redirect(new URL("/admin/login", requestUrl));
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Admin login required" }, { status: 401 });
}

export function adminSessionToken() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "local-dev";
  return createHash("sha256").update(`${password}:${secret}`).digest("hex");
}

export function isSafeAdminNextPath(value: string | null) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function isValidAdminToken(token?: string) {
  if (!token || !hasAdminPassword()) return false;

  const expected = adminSessionToken();
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  return tokenBuffer.length === expectedBuffer.length && timingSafeEqual(tokenBuffer, expectedBuffer);
}
