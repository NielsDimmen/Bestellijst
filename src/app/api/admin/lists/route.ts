import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const lists = await prisma.list.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json(
      lists.map((list) => ({
        id: list.id,
        status: list.status,
        createdAt: list.createdAt,
        sentAt: list.sentAt,
        itemCount: list._count.items,
      })),
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin lists GET error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
