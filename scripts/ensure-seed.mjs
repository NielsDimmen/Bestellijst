/**
 * Production seed helper (plain Node, no tsx).
 * Creates admin + ACTIVE list if missing; optionally sets cateringPhone.
 * Safe to run on every start.
 */
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

function generatePassword() {
  return randomBytes(9).toString("base64url");
}

async function main() {
  let admin = await prisma.user.findFirst({
    where: { username: "admin" },
  });

  if (!admin) {
    const password = process.env.ADMIN_PASSWORD?.trim() || generatePassword();
    const passwordHash = await hashPassword(password);
    admin = await prisma.user.create({
      data: {
        name: "Admin",
        username: "admin",
        passwordHash,
        isAdmin: true,
        approved: true,
      },
    });
    console.log(`Admin username: admin`);
    console.log(`Admin password: ${password}`);
    console.log(`Admin user id: ${admin.id}`);
  } else {
    console.log(`Admin already exists: ${admin.id} (${admin.username})`);
  }

  const activeList = await prisma.list.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!activeList) {
    const list = await prisma.list.create({
      data: { status: "ACTIVE" },
    });
    console.log(`Created ACTIVE list: ${list.id}`);
  } else {
    console.log(`ACTIVE list already exists: ${activeList.id}`);
  }

  const cateringPhone = process.env.CATERING_PHONE?.trim();
  if (cateringPhone) {
    await prisma.setting.upsert({
      where: { key: "cateringPhone" },
      update: { value: cateringPhone },
      create: { key: "cateringPhone", value: cateringPhone },
    });
    console.log(`Seeded cateringPhone: ${cateringPhone}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
