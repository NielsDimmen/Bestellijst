import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

async function getOwnedOrAdminItem(id: string, userId: string, isAdmin: boolean) {
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      list: true,
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!item) return { error: NextResponse.json({ error: "Niet gevonden" }, { status: 404 }) };
  if (!isAdmin && item.createdById !== userId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { item };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const result = await getOwnedOrAdminItem(id, user.id, user.isAdmin);
    if ("error" in result && result.error) return result.error;
    const item = result.item!;

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
            quantity?: unknown;
            note?: unknown;
          })
        : {};

    const data: {
      name?: string;
      quantity?: number | null;
      note?: string | null;
    } = {};

    if (raw.name !== undefined) {
      if (typeof raw.name !== "string" || !normalizeName(raw.name)) {
        return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
      }
      data.name = normalizeName(raw.name);
    }

    if (raw.quantity !== undefined) {
      if (raw.quantity === null || raw.quantity === "") {
        data.quantity = null;
      } else {
        const q = Number(raw.quantity);
        if (!Number.isInteger(q) || q < 1) {
          return NextResponse.json(
            { error: "Hoeveelheid moet een positief geheel getal zijn" },
            { status: 400 },
          );
        }
        data.quantity = q;
      }
    }

    if (raw.note !== undefined) {
      if (raw.note === null) {
        data.note = null;
      } else if (typeof raw.note === "string") {
        data.note = raw.note.trim() || null;
      } else {
        return NextResponse.json({ error: "Ongeldige notitie" }, { status: 400 });
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Geen wijzigingen" }, { status: 400 });
    }

    const updated = await prisma.item.update({
      where: { id: item.id },
      data,
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      quantity: updated.quantity,
      note: updated.note,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      createdBy: updated.createdBy,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("item PATCH error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const result = await getOwnedOrAdminItem(id, user.id, user.isAdmin);
    if ("error" in result && result.error) return result.error;
    const item = result.item!;

    await prisma.item.delete({ where: { id: item.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("item DELETE error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
