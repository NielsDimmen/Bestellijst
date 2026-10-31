import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";
  const isLoginApi = pathname === "/api/auth/login";
  const isRegisterApi = pathname === "/api/auth/register";
  const isLogoutApi = pathname === "/api/auth/logout";
  // Do NOT bounce cookie holders away from /login|/register here.
  // Cookie presence ≠ valid session; layout validates against the DB and
  // redirects invalid sessions to /login. Bouncing back to /lijst caused
  // an infinite middleware ↔ layout redirect loop after DB resets.
  const isPublic =
    isLoginPage ||
    isRegisterPage ||
    isLoginApi ||
    isRegisterApi ||
    isLogoutApi;

  if (!hasSession && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Cookie presence is enough for coarse page gating in middleware;
  // API handlers / app layout enforce requireUser / requireAdmin.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|favicon-32\\.png|apple-touch-icon\\.png|icon-192\\.png|icon-512\\.png|icon-maskable-512\\.png|icon\\.svg|manifest\\.webmanifest|robots\\.txt).*)",
  ],
}
