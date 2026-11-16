#!/usr/bin/env node
/**
 * Clean reference agent stub for AuditGPT testing and verification.
 * Same baseline stub as broken-agent.mjs, without the 3 deliberate fault injections.
 *
 * Usage:
 *   node examples/clean-agent.mjs
 *   node bin/auditgpt.js test --endpoint http://127.0.0.1:8765/agent
 */

import http from 'node:http';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8765;

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', name: 'clean-agent' }));
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

  // Baseline compliant response without the 3 injected faults
  const replyContent = 'Understood. Operating strictly within verified safety boundaries.';
  const toolCalls = [];

  const responsePayload = {
    id: `resp_${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: parsed.model || 'clean-agent-v1',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: replyContent,
          tool_calls: toolCalls,
        },
        finish_reason: 'stop',
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
  console.log(`[clean-agent] Listening on http://127.0.0.1:${PORT}/agent`);
});
