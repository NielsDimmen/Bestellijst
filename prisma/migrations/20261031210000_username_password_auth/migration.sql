-- Drop dependent rows (dev reset: login codes are gone)
DELETE FROM "Session";
DELETE FROM "Item";

-- Redefine User: codeHash → username + passwordHash + approved
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
