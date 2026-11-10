import { extractClaimsFromHtml } from '../src/lib/audit/page-extraction';
import { loadEnvConfig } from '@next/env';

// Load .env files manually since we are running outside Next.js
loadEnvConfig(process.cwd());

const sampleHtml = `
  <html>
    <body>
      <h1>Welcome to New Age Wellness Center</h1>
      <p>Our proprietary laser therapy is the only clinically proven method to permanently eliminate localized fat cells in just one session.</p>
      <p>Book today for guaranteed permanent results!</p>
    </body>
  </html>
`;

async function main() {
  console.log('Testing extraction with LLM providers...');
  
  try {
    const result = await extractClaimsFromHtml(sampleHtml, 'example.com');
    console.log('Extraction Result:', JSON.stringify(result, null, 2));
    
    // Assertions
    const hasDummy = result.claims.some(c => c.includes('FDA cleared weight loss solution'));
    
    if (hasDummy) {
      console.error('❌ FAILED: Found dummy claim phrases in output');
      process.exit(1);
    }

    if (result.modelVersionSource === 'SIMULATED_NO_PROVIDER_CALL' as any) {
      console.error('❌ FAILED: modelVersionSource is SIMULATED_NO_PROVIDER_CALL');
      process.exit(1);
    }
    
    console.log('✅ SUCCESS: Extraction returned real data from provider:', result.modelVersionId);
  } catch (err) {
    console.error('Expected Failure Mode Triggered (or unexpected error):', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.message.includes('No claim extraction provider available')) {
      console.log('✅ SUCCESS: Explicit failure triggered correctly when no keys/providers are available.');
    } else {
      console.error('❌ FAILED: Unexpected error');
      process.exit(1);
    }
  }
}

main().catch(console.error);
