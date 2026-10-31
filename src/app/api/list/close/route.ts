import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import {
  buildWhatsAppUrl,
  getNotifyService,
  normalizeWhatsAppPhone,
  NotifyError,
  resolveCateringPhone,
} from "@/lib/notify";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    await requireAdmin();

    const active = await prisma.list.findFirst({
      where: { status: "ACTIVE" },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: { createdBy: { select: { name: true } } },
        },
      },
    });

    if (!active) {
      return NextResponse.json(
        { error: "Geen actieve lijst gevonden" },
        { status: 404 },
      );
    }

    const sentAt = new Date();
    const notify = getNotifyService();
    const { text } = await notify.sendList({
      sentAt,
      items: active.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        note: item.note,
        addedBy: item.createdBy.name,
      })),
    });

    const rawPhone = await resolveCateringPhone();
    const whatsappUrl = buildWhatsAppUrl(rawPhone, text);
    const phoneDigits = rawPhone.trim()
      ? normalizeWhatsAppPhone(rawPhone)
      : "";
    const phone =
      phoneDigits && phoneDigits.length >= 8 ? phoneDigits : undefined;

    await prisma.$transaction(async (tx) => {
      const stillActive = await tx.list.findFirst({
        where: { id: active.id, status: "ACTIVE" },
      });
      if (!stillActive) {
        throw new NotifyError("Lijst was al afgesloten");
      }

      await tx.list.update({
        where: { id: active.id },
        data: { status: "SENT", sentAt },
      });

      await tx.list.create({
        data: { status: "ACTIVE" },
      });
    });

    return NextResponse.json({
      text,
      ...(phone ? { phone } : {}),
      ...(whatsappUrl ? { whatsappUrl } : {}),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof NotifyError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("list close error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
