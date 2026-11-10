import { MetadataRoute } from 'next';
import { topCities } from './medspa-audit/[city]/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://auditgpt.ai';

  const staticRoutes = [
    '',
    '/snapshot',
    '/ai-answer-reality',
    '/ai-answer-reality/sample',
    '/claim-review-methodology',
    '/legal',
    '/personal-brand-audit',
    '/deployment',
    '/security',
    '/proof',
    '/sample-report',
    '/state-of-medspa-ai-answer-reality',
    // Hidden for now (noindex on-page, enterprise chassis not in the public
    // funnel): /agency, /agency-snapshot, /ai-claim-accuracy-content-stack,
    // /enforcement-heatmap, /influencer-monitoring, /consent-gap-checker,
    // /legitscript-dossier. Routes stay alive, just out of the sitemap.
    // Removed 2026-08: /how-it-works, /trust, /pricing, /auditgpt — the
    // Scrutexity claim-review marketing site was deleted from auditgpt.ai;
    // this domain is now the standalone AI-business-idea-audit product.
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const geoRoutes = topCities.map((city) => ({
    url: `${baseUrl}/medspa-audit/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...geoRoutes];
}
