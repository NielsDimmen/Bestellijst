import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  clearedSessionCookie,
  destroySession,
} from "@/lib/auth";

async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  await destroySession(token);
}

export async function POST() {
  await clearSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", clearedSessionCookie());
  return response;
}

/** Used by the app layout to drop a stale cookie and land on /login. */
export async function GET(request: Request) {
  await clearSession();
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(SESSION_COOKIE, "", clearedSessionCookie());
  return response;
}
