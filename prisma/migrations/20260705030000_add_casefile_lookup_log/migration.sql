-- CreateTable
CREATE TABLE "CaseFileLookupLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "lookupAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "CaseFileLookupLog_domain_lookupAt_idx" ON "CaseFileLookupLog"("domain", "lookupAt");
