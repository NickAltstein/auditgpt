import * as cheerio from 'cheerio';
import { extractClaims, ExtractionResult } from '../llm-provider';

export async function extractClaimsFromHtml(html: string, domain: string): Promise<ExtractionResult> {
  // 1. Clean HTML
  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, img, svg, nav, footer').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  
  // Truncate to avoid massive payloads (roughly 60k chars = ~15k tokens)
  const truncatedText = text.slice(0, 60000);

  // 2. Extract with Multi-Provider LLM Fallback (Zero simulation guarantee)
  const result = await extractClaims(domain, truncatedText);
  
  if (!result) {
    throw new Error("No claim extraction provider available. Ensure at least one LLM API key is set and funded.");
  }
  
  return result;
}
