import { NextResponse } from "next/server";
import {
  AuthError,
  SESSION_COOKIE,
  clearedSessionCookie,
  requireUser,
} from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      const response = NextResponse.json(
        { error: err.message },
        { status: err.status },
      );
      // Drop stale/invalid session cookies so middleware stops treating the
      // browser as authenticated after DB resets or expired sessions.
      if (err.status === 401) {
        response.cookies.set(SESSION_COOKIE, "", clearedSessionCookie());
      }
      return response;
    }
    console.error("me error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
