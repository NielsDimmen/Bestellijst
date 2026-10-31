import { NextResponse } from "next/server";
import {
  AuthError,
  SESSION_COOKIE,
  clientIp,
  createSession,
  normalizeUsername,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  clearFailures,
  isRateLimited,
  recordFailure,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rateKey = `login:${ip}`;

  if (isRateLimited(rateKey)) {
    return NextResponse.json(
      { error: "Te veel mislukte pogingen. Probeer later opnieuw." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const raw =
    typeof body === "object" && body !== null
      ? (body as { username?: unknown; password?: unknown })
      : {};

  const username =
    typeof raw.username === "string" ? normalizeUsername(raw.username) : "";
  const password = typeof raw.password === "string" ? raw.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Gebruikersnaam en wachtwoord zijn verplicht" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      recordFailure(rateKey);
      return NextResponse.json(
        { error: "Ongeldige inloggegevens" },
        { status: 401 },
      );
    }

    if (!user.approved) {
      recordFailure(rateKey);
      return NextResponse.json(
        { error: "Account wacht op goedkeuring" },
        { status: 403 },
      );
    }

    clearFailures(rateKey);
    const { token, expiresAt } = await createSession(user.id);

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.username,
      isAdmin: user.isAdmin,
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
    return response;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("login error", err);
    return NextResponse.json({ error: "Inloggen mislukt" }, { status: 500 });
  }
}
