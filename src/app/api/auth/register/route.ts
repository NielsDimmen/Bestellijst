import { NextResponse } from "next/server";
import {
  clientIp,
  hashPassword,
  normalizeUsername,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited, recordFailure } from "@/lib/rate-limit";

const MIN_PASSWORD_LENGTH = 6;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rateKey = `register:${ip}`;

  if (isRateLimited(rateKey)) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer later opnieuw." },
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
      ? (body as {
          name?: unknown;
          username?: unknown;
          password?: unknown;
        })
      : {};

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const username =
    typeof raw.username === "string" ? normalizeUsername(raw.username) : "";
  const password = typeof raw.password === "string" ? raw.password : "";

  if (!name || !username || !password) {
    return NextResponse.json(
      { error: "Naam, gebruikersnaam en wachtwoord zijn verplicht" },
      { status: 400 },
    );
  }

  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    return NextResponse.json(
      {
        error:
          "Gebruikersnaam: 3–32 tekens, alleen letters, cijfers, . _ -",
      },
      { status: 400 },
    );
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Wachtwoord minstens ${MIN_PASSWORD_LENGTH} tekens` },
      { status: 400 },
    );
  }

  // Light rate limit: count every registration attempt
  recordFailure(rateKey);

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Gebruikersnaam is al in gebruik" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        approved: false,
        isAdmin: false,
      },
      select: {
        id: true,
        name: true,
        username: true,
        approved: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ...user,
        message: "Account aangemaakt. Wacht op goedkeuring door een admin.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Registreren mislukt" }, { status: 500 });
  }
}
