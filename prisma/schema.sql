-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoredSite" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoredSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditClaim" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "claimHash" TEXT NOT NULL,
    "claimText" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "sourceKind" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceText" TEXT,
    "section" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "crawledAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RescanLock" (
    "auditId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RescanLock_pkey" PRIMARY KEY ("auditId")
);

-- CreateTable
CREATE TABLE "ExpiryNotification" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'claim_expiry',
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "ExpiryNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpiryRescanJob" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'claim_expiry',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpiryRescanJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditUsageBucket" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostCents" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditUsageBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeployFixPR" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "prUrl" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeployFixPR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "inputType" TEXT NOT NULL DEFAULT 'website',
    "transcript" TEXT,
    "companyName" TEXT,
    "websiteUrl" TEXT,
    "industry" TEXT,
    "focusNotes" TEXT,
    "auditJson" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "score" INTEGER,
    "verdict" TEXT,
    "staleClaims" BOOLEAN NOT NULL DEFAULT false,
    "staleAt" TIMESTAMP(3),
    "previousAuditId" TEXT,
    "userId" TEXT,
    "monitoredSiteId" TEXT,
    "agencyId" TEXT,
    "clientId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "stripeSessionId" TEXT,
    "auditType" TEXT NOT NULL DEFAULT 'snapshot',

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "auditId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "agentConfigId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "triggered" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "externalId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthState" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "Consequence" (
    "id" TEXT NOT NULL,
    "claimText" TEXT NOT NULL,
    "industry" TEXT,
    "sourceSnippet" TEXT,
    "supportGap" TEXT,
    "saferFraming" TEXT NOT NULL,
    "evidenceNeeded" TEXT,
    "auditId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitorSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "lastRun" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastNotified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitorSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitorDeltaReport" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "previousAuditId" TEXT NOT NULL,
    "currentAuditId" TEXT NOT NULL,
    "riskScoreDelta" INTEGER NOT NULL,
    "newClaimsCount" INTEGER NOT NULL,
    "changedClaimsCount" INTEGER NOT NULL,
    "deltaJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitorDeltaReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "poweredByEnabled" BOOLEAN NOT NULL DEFAULT true,
    "billingTier" TEXT NOT NULL DEFAULT 'agency',
    "monthlyFee" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyClient" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistortionLog" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "answerPayload" TEXT NOT NULL,
    "sourcePayload" TEXT,
    "status" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DistortionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptDefinition" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "promptHash" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "PromptDefinition_pkey" PRIMARY KEY ("id","version")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "resolvedUrl" TEXT,
    "pageSnapshotHash" TEXT NOT NULL,
    "rawSnapshotLocation" TEXT,
    "snapshotByteLength" INTEGER,
    "snapshotStorageStatus" TEXT,
    "captureMethod" TEXT,
    "httpStatus" INTEGER,
    "contentType" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiSurface" TEXT,
    "modelProvider" TEXT,
    "modelVersionId" TEXT,
    "modelVersionSource" TEXT,
    "promptId" TEXT,
    "promptVersion" INTEGER,
    "promptText" TEXT,
    "promptHash" TEXT,
    "answerPayload" TEXT,
    "answerDigest" TEXT,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimState" (
    "id" TEXT NOT NULL,
    "observationId" TEXT NOT NULL,
    "claimHash" TEXT NOT NULL,
    "stateHash" TEXT NOT NULL,
    "claimText" TEXT NOT NULL,
    "normalizedClaimText" TEXT NOT NULL,
    "supportState" TEXT,
    "discrepancyType" TEXT,
    "severity" TEXT,
    "sourceLocator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimLifecycleEvent" (
    "id" TEXT NOT NULL,
    "claimHash" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "observationId" TEXT NOT NULL,
    "priorObservationId" TEXT,
    "pageSnapshotHash" TEXT NOT NULL,
    "priorStateHash" TEXT,
    "aiSurface" TEXT,
    "modelVersionId" TEXT,
    "promptId" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "priorObservedAt" TIMESTAMP(3),
    "chainPosition" INTEGER NOT NULL,
    "latencyFromPriorEventMs" BIGINT,
    "eventDigest" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimLifecycleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseFileLookupLog" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "lookupAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseFileLookupLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "MonitoredSite_url_key" ON "MonitoredSite"("url");

-- CreateIndex
CREATE INDEX "AuditClaim_auditId_status_idx" ON "AuditClaim"("auditId", "status");

-- CreateIndex
CREATE INDEX "AuditClaim_claimHash_idx" ON "AuditClaim"("claimHash");

-- CreateIndex
CREATE INDEX "AuditClaim_expiresAt_idx" ON "AuditClaim"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuditClaim_auditId_section_position_key" ON "AuditClaim"("auditId", "section", "position");

-- CreateIndex
CREATE INDEX "ExpiryNotification_sentAt_idx" ON "ExpiryNotification"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExpiryNotification_auditId_stage_key" ON "ExpiryNotification"("auditId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "ExpiryRescanJob_auditId_key" ON "ExpiryRescanJob"("auditId");

-- CreateIndex
CREATE INDEX "ExpiryRescanJob_status_createdAt_idx" ON "ExpiryRescanJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ExpiryRescanJob_userId_idx" ON "ExpiryRescanJob"("userId");

-- CreateIndex
CREATE INDEX "AuditUsageBucket_kind_windowEnd_idx" ON "AuditUsageBucket"("kind", "windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "DeployFixPR_auditId_key" ON "DeployFixPR"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_publicId_key" ON "Audit"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_previousAuditId_key" ON "Audit"("previousAuditId");

-- CreateIndex
CREATE INDEX "Audit_publicId_idx" ON "Audit"("publicId");

-- CreateIndex
CREATE INDEX "Audit_userId_idx" ON "Audit"("userId");

-- CreateIndex
CREATE INDEX "Audit_verified_idx" ON "Audit"("verified");

-- CreateIndex
CREATE INDEX "Audit_monitoredSiteId_idx" ON "Audit"("monitoredSiteId");

-- CreateIndex
CREATE INDEX "AgentConfig_userId_idx" ON "AgentConfig"("userId");

-- CreateIndex
CREATE INDEX "AgentRun_agentConfigId_idx" ON "AgentRun"("agentConfigId");

-- CreateIndex
CREATE INDEX "AgentRun_userId_idx" ON "AgentRun"("userId");

-- CreateIndex
CREATE INDEX "Integration_userId_idx" ON "Integration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_userId_provider_key" ON "Integration"("userId", "provider");

-- CreateIndex
CREATE INDEX "OAuthState_expiresAt_idx" ON "OAuthState"("expiresAt");

-- CreateIndex
CREATE INDEX "Consequence_industry_idx" ON "Consequence"("industry");

-- CreateIndex
CREATE UNIQUE INDEX "MonitorSubscription_userId_url_key" ON "MonitorSubscription"("userId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_userId_key" ON "Agency"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyClient_agencyId_url_key" ON "AgencyClient"("agencyId", "url");

-- CreateIndex
CREATE INDEX "DistortionLog_domain_checkedAt_idx" ON "DistortionLog"("domain", "checkedAt");

-- CreateIndex
CREATE INDEX "DistortionLog_status_idx" ON "DistortionLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DistortionLog_digest_key" ON "DistortionLog"("digest");

-- CreateIndex
CREATE UNIQUE INDEX "PromptDefinition_promptHash_key" ON "PromptDefinition"("promptHash");

-- CreateIndex
CREATE INDEX "Observation_domain_observedAt_idx" ON "Observation"("domain", "observedAt");

-- CreateIndex
CREATE INDEX "Observation_pageSnapshotHash_idx" ON "Observation"("pageSnapshotHash");

-- CreateIndex
CREATE INDEX "Observation_answerDigest_idx" ON "Observation"("answerDigest");

-- CreateIndex
CREATE INDEX "Observation_promptId_promptVersion_idx" ON "Observation"("promptId", "promptVersion");

-- CreateIndex
CREATE INDEX "ClaimState_claimHash_idx" ON "ClaimState"("claimHash");

-- CreateIndex
CREATE INDEX "ClaimState_stateHash_idx" ON "ClaimState"("stateHash");

-- CreateIndex
CREATE INDEX "ClaimState_sourceLocator_idx" ON "ClaimState"("sourceLocator");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimState_observationId_sourceLocator_key" ON "ClaimState"("observationId", "sourceLocator");

-- CreateIndex
CREATE INDEX "ClaimLifecycleEvent_domain_observedAt_idx" ON "ClaimLifecycleEvent"("domain", "observedAt");

-- CreateIndex
CREATE INDEX "ClaimLifecycleEvent_claimHash_chainPosition_idx" ON "ClaimLifecycleEvent"("claimHash", "chainPosition");

-- CreateIndex
CREATE INDEX "ClaimLifecycleEvent_eventType_idx" ON "ClaimLifecycleEvent"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimLifecycleEvent_eventDigest_key" ON "ClaimLifecycleEvent"("eventDigest");

-- CreateIndex
CREATE INDEX "CaseFileLookupLog_domain_lookupAt_idx" ON "CaseFileLookupLog"("domain", "lookupAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditClaim" ADD CONSTRAINT "AuditClaim_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RescanLock" ADD CONSTRAINT "RescanLock_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpiryNotification" ADD CONSTRAINT "ExpiryNotification_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpiryRescanJob" ADD CONSTRAINT "ExpiryRescanJob_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeployFixPR" ADD CONSTRAINT "DeployFixPR_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeployFixPR" ADD CONSTRAINT "DeployFixPR_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_previousAuditId_fkey" FOREIGN KEY ("previousAuditId") REFERENCES "Audit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_monitoredSiteId_fkey" FOREIGN KEY ("monitoredSiteId") REFERENCES "MonitoredSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AgencyClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentConfig" ADD CONSTRAINT "AgentConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentConfig" ADD CONSTRAINT "AgentConfig_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_agentConfigId_fkey" FOREIGN KEY ("agentConfigId") REFERENCES "AgentConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitorSubscription" ADD CONSTRAINT "MonitorSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitorDeltaReport" ADD CONSTRAINT "MonitorDeltaReport_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "MonitorSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyClient" ADD CONSTRAINT "AgencyClient_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_promptId_promptVersion_fkey" FOREIGN KEY ("promptId", "promptVersion") REFERENCES "PromptDefinition"("id", "version") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimState" ADD CONSTRAINT "ClaimState_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimLifecycleEvent" ADD CONSTRAINT "ClaimLifecycleEvent_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

