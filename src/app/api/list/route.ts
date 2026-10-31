import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireUser();

    let list = await prisma.list.findFirst({
      where: { status: "ACTIVE" },
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
      list = await prisma.list.create({
        data: { status: "ACTIVE" },
        include: {
          items: {
            orderBy: { createdAt: "asc" },
            include: {
              createdBy: { select: { id: true, name: true } },
            },
          },
        },
      });
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
        createdBy: {
          id: item.createdBy.id,
          name: item.createdBy.name,
        },
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("list GET error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
