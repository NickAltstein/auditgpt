import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize((value as Record<string, unknown>)[key])}`)
    .join(",")}}`;
}

type EventRow = {
  claimHash: string;
  eventType: string;
  observedAt: Date;
  pageSnapshotHash: string;
  aiSurface: string | null;
  eventDigest: string;
  chainPosition: number;
  priorObservationId: string | null;
  latencyFromPriorEventMs: bigint | null;
  currentClaimText: string | null;
  priorClaimText: string | null;
  supportState: string | null;
  discrepancyType: string | null;
  severity: string | null;
  resolvedUrl: string | null;
};

export async function GET(
  req: Request,
  { params }: { params: { domain: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
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
        endpoint: "bundle",
        status: 200,
      }
    }).catch(e => console.warn("Failed to log lookup", e));

    // Fetch the lifecycle events for the domain, grouping properly and safely excluding simulated data.
    // Fixed B2: cs_current attaches via observationId and claimHash. cs_prior attaches via priorStateHash.
    const rawEvents = await db.$queryRawUnsafe<EventRow[]>(
      `SELECT
         c.claimHash,
         c.eventType,
         c.observedAt,
         c.pageSnapshotHash,
         c.aiSurface,
         c.eventDigest,
         c.chainPosition,
         c.priorObservationId,
         c.latencyFromPriorEventMs,
         cs_current.normalizedClaimText as currentClaimText,
         cs_prior.normalizedClaimText as priorClaimText,
         cs_current.supportState,
         cs_current.discrepancyType,
         cs_current.severity,
         o.resolvedUrl
       FROM ClaimLifecycleEvent c
       LEFT JOIN ClaimState cs_current ON c.observationId = cs_current.observationId AND c.claimHash = cs_current.claimHash
       LEFT JOIN ClaimState cs_prior ON c.priorStateHash = cs_prior.stateHash
       LEFT JOIN Observation o ON c.observationId = o.id
       WHERE c.domain = ?
         AND (c.aiSurface IS NULL OR c.aiSurface NOT IN ('guardian-simulation', 'SIMULATED_NO_PROVIDER_CALL'))
       ORDER BY c.observedAt ASC`,
      domain
    );

    // Grouping and pagination (B3, B6)
    const pageClaimsMap = new Map<string, any[]>();
    const aiObservations: any[] = [];
    const snapshotsMap = new Map<string, any>();
    const resolvedUrls = new Set<string>();

    for (const evt of rawEvents) {
      if (evt.resolvedUrl) resolvedUrls.add(evt.resolvedUrl);
      
      snapshotsMap.set(evt.pageSnapshotHash, {
        hash: evt.pageSnapshotHash,
        // Optional: fetch actual storage location from Observation if needed
      });

      const structuredEvent = {
        event_type: evt.eventType,
        observed_at: evt.observedAt.toISOString(),
        snapshot_hash: evt.pageSnapshotHash,
        source_url: evt.resolvedUrl,
        event_digest: evt.eventDigest,
        chain_position: evt.chainPosition,
        prior_observation_id: evt.priorObservationId,
        latency_from_prior_event_ms: evt.latencyFromPriorEventMs ? Number(evt.latencyFromPriorEventMs) : null,
        claim_text: evt.currentClaimText,
        prior_claim_text: evt.eventType === 'MODIFIED' || evt.eventType === 'REMOVED' ? evt.priorClaimText : null,
        analysis: evt.supportState ? {
          supportState: evt.supportState,
          discrepancyType: evt.discrepancyType,
          severity: evt.severity,
        } : null
      };

      if (evt.aiSurface) {
        aiObservations.push({ ...structuredEvent, ai_surface: evt.aiSurface });
      } else {
        const hash = evt.claimHash;
        if (!pageClaimsMap.has(hash)) pageClaimsMap.set(hash, []);
        pageClaimsMap.get(hash)!.push(structuredEvent);
      }
    }

    const page_claims = Array.from(pageClaimsMap.entries()).map(([hash, events]) => ({
      claim_hash: hash,
      events
    }));

    const firstObserved = rawEvents.length > 0 ? rawEvents[0].observedAt.toISOString() : null;
    const lastObserved = rawEvents.length > 0 ? rawEvents[rawEvents.length - 1].observedAt.toISOString() : null;

    const rawBundle = {
      crt_head: "CASEFILE-BUNDLE-V1",
      domain,
      generated_at: new Date().toISOString(),
      scope_statement: "Scrutexity acts solely as a records custodian. This bundle attests that these bytes existed on the target domains at the timestamps provided.",
      coverage: {
        total_events: rawEvents.length,
        first_observed: firstObserved,
        last_observed: lastObserved,
      },
      subject: {
        domain,
        resolved_urls: Array.from(resolvedUrls)
      },
      snapshots: Array.from(snapshotsMap.values()),
      page_claims,
      ai_observations: aiObservations
    };

    // Calculate bundle_sha256 (B1)
    const bundle_sha256 = sha256(canonicalize(rawBundle));

    const caseFile = {
      ...rawBundle,
      bundle_sha256
    };

    return NextResponse.json(caseFile);
  } catch (error) {
    console.error(`[CaseFile API] Error generating CaseFile for ${params.domain}:`, error);
    return NextResponse.json(
      { error: 'Failed to generate CaseFile' },
      { status: 500 }
    );
  }
}
