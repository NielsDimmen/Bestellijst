import { prisma } from "@/lib/prisma";

/** Setting `cateringPhone`, else `CATERING_PHONE` env. */
export async function resolveCateringPhone(): Promise<string> {
  const setting = await prisma.setting.findUnique({
    where: { key: "cateringPhone" },
  });
  const fromDb = setting?.value?.trim() ?? "";
  if (fromDb) return fromDb;
  return process.env.CATERING_PHONE?.trim() ?? "";
}
