import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

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

    const name =
      typeof raw.name === "string" ? normalizeName(raw.name) : "";
    if (!name) {
      return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
    }

    let quantity: number | null = null;
    if (raw.quantity !== undefined && raw.quantity !== null && raw.quantity !== "") {
      const q = Number(raw.quantity);
      if (!Number.isInteger(q) || q < 1) {
        return NextResponse.json(
          { error: "Hoeveelheid moet een positief geheel getal zijn" },
          { status: 400 },
        );
      }
      quantity = q;
    }

    const note =
      typeof raw.note === "string" && raw.note.trim()
        ? raw.note.trim()
        : null;

    let list = await prisma.list.findFirst({ where: { status: "ACTIVE" } });
    if (!list) {
      list = await prisma.list.create({ data: { status: "ACTIVE" } });
    }

    const existingItems = await prisma.item.findMany({
      where: { listId: list.id },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    const duplicate = existingItems.find(
      (item) => item.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      const mergedQty = (duplicate.quantity ?? 1) + (quantity ?? 1);
      const updated = await prisma.item.update({
        where: { id: duplicate.id },
        data: {
          quantity: mergedQty,
          ...(note ? { note } : {}),
        },
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
        merged: true,
      });
    }

    const created = await prisma.item.create({
      data: {
        listId: list.id,
        name,
        quantity,
        note,
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        name: created.name,
        quantity: created.quantity,
        note: created.note,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        createdBy: created.createdBy,
        merged: false,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("list items POST error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
