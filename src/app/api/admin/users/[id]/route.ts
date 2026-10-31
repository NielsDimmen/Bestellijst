import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const userSelect = {
  id: true,
  name: true,
  username: true,
  isAdmin: true,
  approved: true,
  createdAt: true,
} as const;

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
    }

    const raw =
      typeof body === "object" && body !== null
        ? (body as { name?: unknown; isAdmin?: unknown })
        : {};

    const data: { name?: string; isAdmin?: boolean } = {};

    if (raw.name !== undefined) {
      if (typeof raw.name !== "string" || !raw.name.trim()) {
        return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
      }
      data.name = raw.name.trim();
    }

    if (raw.isAdmin !== undefined) {
      if (typeof raw.isAdmin !== "boolean") {
        return NextResponse.json(
          { error: "isAdmin moet een boolean zijn" },
          { status: 400 },
        );
      }
      if (existing.id === admin.id && raw.isAdmin === false) {
        return NextResponse.json(
          { error: "Je kunt je eigen admin-rechten niet intrekken" },
          { status: 400 },
        );
      }
      data.isAdmin = raw.isAdmin;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Geen wijzigingen" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin user PATCH error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    if (id === admin.id) {
      return NextResponse.json(
        { error: "Je kunt jezelf niet verwijderen" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    // Prisma foreign key on items without cascade from User delete
    console.error("admin user DELETE error", err);
    return NextResponse.json(
      { error: "Verwijderen mislukt (gebruiker heeft mogelijk items)" },
      { status: 409 },
    );
  }
}
