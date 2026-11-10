import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { domain: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    if (!process.env.CASEFILE_API_KEY || token !== process.env.CASEFILE_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domain = params.domain.toLowerCase().trim();

    // Log the lookup
    await db.caseFileLookupLog.create({
      data: {
        domain,
        endpoint: "coverage",
        status: 200,
      }
    }).catch(e => console.warn("Failed to log lookup", e));

    // C4: Safe filter for non-simulated observations
    // (aiSurface IS NULL OR aiSurface NOT IN ('guardian-simulation', 'SIMULATED_NO_PROVIDER_CALL'))
    // AND modelVersionSource != 'SIMULATED_NO_PROVIDER_CALL'
    const observations = await db.$queryRawUnsafe<any[]>(
      `SELECT id, observedAt, aiSurface 
       FROM Observation 
       WHERE domain = ?
         AND (aiSurface IS NULL OR aiSurface NOT IN ('guardian-simulation', 'SIMULATED_NO_PROVIDER_CALL'))
         AND (modelVersionSource IS NULL OR modelVersionSource != 'SIMULATED_NO_PROVIDER_CALL')
       ORDER BY observedAt ASC`,
      domain
    );

    const hasCoverage = observations.length > 0;
    
    if (!hasCoverage) {
      return NextResponse.json({
        domain,
        covered: false,
        estimate: 0
      });
    }

    const first_observed = observations[0].observedAt;
    const last_observed = observations[observations.length - 1].observedAt;
    const ai_observation_count = observations.filter(o => o.aiSurface).length;

    // Fetch lifecycle events to count claims
    const lifecycleEvents = await db.$queryRawUnsafe<any[]>(
      `SELECT id, claimHash, eventType 
       FROM ClaimLifecycleEvent 
       WHERE domain = ?
         AND (aiSurface IS NULL OR aiSurface NOT IN ('guardian-simulation', 'SIMULATED_NO_PROVIDER_CALL'))
         AND (modelVersionId IS NULL OR modelVersionId != 'SIMULATED_NO_PROVIDER_CALL')`, // using modelVersionId for events since modelVersionSource isn't on the event table in the DB schema
      domain
    );

    const uniqueClaims = new Set(lifecycleEvents.map(e => e.claimHash));
    const page_claim_count = uniqueClaims.size;
    const lifecycle_event_count = lifecycleEvents.length;

    // Calculate gaps (intervals > 2x capture cadence, assuming daily cadence = 24h * 2 = 48h = 172800000ms)
    const gaps = [];
    let previousTime = new Date(observations[0].observedAt).getTime();
    for (let i = 1; i < observations.length; i++) {
      const currentTime = new Date(observations[i].observedAt).getTime();
      const diff = currentTime - previousTime;
      if (diff > 172800000) { // 48 hours
        gaps.push({
          start: new Date(previousTime).toISOString(),
          end: new Date(currentTime).toISOString(),
          duration_days: Math.round(diff / (1000 * 60 * 60 * 24))
        });
      }
      previousTime = currentTime;
    }

    return NextResponse.json({
      domain,
      covered: true,
      depth: {
        first_observed,
        last_observed,
        page_claim_count,
        ai_observation_count,
        lifecycle_event_count,
        gaps
      },
      estimate: 150 // Standard $150 lookup tier
    });
  } catch (error) {
    console.error(`[coverage-check] Error checking coverage for ${params.domain}:`, error);
    return NextResponse.json(
      { error: "Internal server error during coverage check." },
      { status: 500 }
    );
  }
}
