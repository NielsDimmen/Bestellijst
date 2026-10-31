import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: {
            createdBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!list) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    return NextResponse.json({
      id: list.id,
      status: list.status,
      createdAt: list.createdAt,
      sentAt: list.sentAt,
      items: list.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        note: item.note,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        createdBy: item.createdBy,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin list GET error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
