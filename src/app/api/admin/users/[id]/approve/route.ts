import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    if (existing.approved) {
      return NextResponse.json(
        { error: "Gebruiker is al goedgekeurd" },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { approved: true },
      select: {
        id: true,
        name: true,
        username: true,
        isAdmin: true,
        approved: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin user approve error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
