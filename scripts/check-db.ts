import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Checking Observation table...")
  const obs = await prisma.observation.findMany({ orderBy: { observedAt: 'desc' }, take: 5 })
  console.log("Observations:", obs.map(o => ({ id: o.id, domain: o.domain, modelVersionSource: o.modelVersionSource, capturedAt: o.capturedAt })))

  console.log("\nChecking ClaimLifecycleEvent table...")
  const claims = await prisma.claimLifecycleEvent.findMany({ orderBy: { observedAt: 'desc' }, take: 5 })
  console.log("Lifecycle Events:", claims.map(c => ({ id: c.id, domain: c.domain, eventType: c.eventType, observedAt: c.observedAt })))
}
main().finally(() => prisma.$disconnect())
