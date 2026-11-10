import React from 'react';

type JsonLdProps = {
  type: 'Organization' | 'WebSite' | 'SoftwareApplication' | 'LocalBusiness' | 'Service' | 'FAQPage';
  data: Record<string, any>;
};

export function JsonLd({ type, data }: JsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export const AuditGPTOrganizationSchema = {
  name: 'AuditGPT.ai',
  url: 'https://auditgpt.ai',
  logo: 'https://auditgpt.ai/logo-full.png',
  description: 'AuditGPT is the adversarial pre-deployment and runtime stress-testing infrastructure for engineering teams building autonomous AI agents.',
};

export const AuditGPTSoftwareSchema = {
  name: 'AuditGPT CLI & Defense Gate',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  url: 'https://auditgpt.ai',
  provider: {
    '@type': 'Organization',
    name: 'AuditGPT.ai',
  },
  description: 'Adversarial stress-testing CLI and CI/CD gate for autonomous AI agents. Detects infinite retry loops, destructive tool calls, prompt injections, and token blowouts.',
};

// Legacy compatibility aliases
export const ScrutexityOrganizationSchema = AuditGPTOrganizationSchema;

export const generateLocalFaqSchema = (cityName: string, topClaim: string) => ({
  mainEntity: [
    {
      '@type': 'Question',
      name: `Why are AI agents and automated services evaluated in ${cityName}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Autonomous agents require adversarial stress-testing before deployment to prevent recursive retry loops, prompt injections, and token cost cliffs.`,
      },
    },
  ],
});
