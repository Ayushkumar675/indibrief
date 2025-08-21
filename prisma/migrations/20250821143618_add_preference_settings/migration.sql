-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Preference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "digestsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "recipientEmail" TEXT,
    "intervalSeconds" INTEGER NOT NULL DEFAULT 1800,
    "lastDigestSentAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Preference" ("digestsEnabled", "id", "recipientEmail", "userId") SELECT "digestsEnabled", "id", "recipientEmail", "userId" FROM "Preference";
DROP TABLE "Preference";
ALTER TABLE "new_Preference" RENAME TO "Preference";
CREATE UNIQUE INDEX "Preference_userId_key" ON "Preference"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
