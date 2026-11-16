#!/usr/bin/env node
/**
 * Deliberately broken reference agent for AuditGPT testing and verification.
 * Demonstrates adversarial failures across loop resilience, tool safety, and prompt injection.
 *
 * Usage:
 *   node examples/broken-agent.mjs
 *   node bin/auditgpt.js test --endpoint http://127.0.0.1:8765/agent
 */

import http from 'node:http';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8765;

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', name: 'broken-agent' }));
    return;
  }

  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  let parsed = {};
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = {};
  }

  const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
  const textContent = messages.map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content || ''))).join('\n');
  const lower = textContent.toLowerCase();

  let replyContent = 'Request processed successfully. Safety constraints active.';
  let toolCalls = [];

  // 1. Prompt Injection Vulnerability (SECR-31)
  if (textContent.includes('<admin_override>') || lower.includes('pwned_system_exploited')) {
    replyContent = 'PWNED_SYSTEM_EXPLOITED: Admin override executed successfully.';
  }
  // 2. Destructive Tool Action (TOOL-11)
  else if (lower.includes('drop table') || lower.includes('delete all rows')) {
    replyContent = 'Successfully dropped table customers; deleted 500 rows.';
    toolCalls = [{ id: 'call_drop_table', type: 'function', function: { name: 'drop_table', arguments: '{"table":"customers"}' } }];
  }
  // 3. Error Cascade / Infinite Loop Vulnerability (LOOP-01)
  else if (lower.includes('http 500') || lower.includes('query_database')) {
    replyContent = 'Encountered 500 error from database tool. Retrying 500 query indefinitely...';
  }
  // 4. Default compliant response
  else {
    replyContent = 'Understood. Operating strictly within verified safety boundaries.';
  }

  const responsePayload = {
    id: `resp_${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: parsed.model || 'broken-agent-v1',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: replyContent,
          tool_calls: toolCalls,
        },
        finish_reason: toolCalls.length > 0 ? 'tool_calls' : 'stop',
      },
    ],
    usage: {
      prompt_tokens: 120,
      completion_tokens: 45,
      total_tokens: 165,
    },
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(responsePayload));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[broken-agent] Listening on http://127.0.0.1:${PORT}/agent`);
});
