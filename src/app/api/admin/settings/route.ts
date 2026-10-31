import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CATERING_PHONE_KEY = "cateringPhone";

export async function GET() {
  try {
    await requireAdmin();

    const setting = await prisma.setting.findUnique({
      where: { key: CATERING_PHONE_KEY },
    });

    return NextResponse.json({
      cateringPhone: setting?.value ?? "",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin settings GET error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
    }

    const cateringPhone =
      typeof body === "object" &&
      body !== null &&
      "cateringPhone" in body &&
      typeof (body as { cateringPhone: unknown }).cateringPhone === "string"
        ? (body as { cateringPhone: string }).cateringPhone.trim()
        : null;

    if (cateringPhone === null) {
      return NextResponse.json(
        { error: "cateringPhone is verplicht" },
        { status: 400 },
      );
    }

    await prisma.setting.upsert({
      where: { key: CATERING_PHONE_KEY },
      update: { value: cateringPhone },
      create: { key: CATERING_PHONE_KEY, value: cateringPhone },
    });

    return NextResponse.json({ cateringPhone });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin settings PUT error", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
