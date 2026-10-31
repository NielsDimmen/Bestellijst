import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { formatListText } from "@/lib/notify/format";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/** Regenerate German WhatsApp/outbound plaintext (translated item names/notes). */
export async function POST(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: { createdBy: { select: { name: true } } },
        },
      },
    });

    if (!list) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    const text = await formatListText({
      sentAt: list.sentAt ?? list.createdAt,
      items: list.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        note: item.note,
        addedBy: item.createdBy.name,
      })),
    });

    return NextResponse.json({ text });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin list text error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
