import { NextResponse } from "next/server";
import {
  AuthError,
  hashPassword,
  normalizeUsername,
  requireAdmin,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const userSelect = {
  id: true,
  name: true,
  username: true,
  isAdmin: true,
  approved: true,
  createdAt: true,
} as const;

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: [{ approved: "asc" }, { createdAt: "asc" }],
      select: userSelect,
    });

    return NextResponse.json(users);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin users GET error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

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
            isAdmin?: unknown;
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Wachtwoord minstens 6 tekens" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Gebruikersnaam is al in gebruik" },
        { status: 409 },
      );
    }

    const isAdmin = Boolean(raw.isAdmin);
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        isAdmin,
        approved: true,
      },
      select: userSelect,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin users POST error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
