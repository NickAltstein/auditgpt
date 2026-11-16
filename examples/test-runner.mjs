import { spawn } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';

function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

console.log('[test-runner] 1. Testing --demo mode...');
const demo = spawn('node', ['bin/auditgpt.js', 'test', '--demo'], { stdio: 'pipe' });
let demoOut = '';
demo.stdout.on('data', (d) => (demoOut += d.toString()));
demo.stderr.on('data', (d) => (demoOut += d.toString()));

await new Promise((resolve, reject) => {
  demo.on('close', (code) => {
    if (code !== 0) return reject(new Error(`Demo mode failed with exit code ${code}`));
    const clean = stripAnsi(demoOut);
    if (!clean.includes('SIMULATED, no tests executed')) {
      return reject(new Error(`Demo mode did not output expected SIMULATED banner. Output:\n${clean}`));
    }
    console.log('[test-runner] Demo mode passed (verified SIMULATED notice, score N/A).');
    if (existsSync('audit_results.sarif')) unlinkSync('audit_results.sarif');
    if (existsSync('audit_summary.md')) unlinkSync('audit_summary.md');
    resolve();
  });
});

console.log('[test-runner] 2. Testing live adversarial battery against examples/broken-agent.mjs...');
const agent = spawn('node', ['examples/broken-agent.mjs'], {
  env: { ...process.env, PORT: '8799' },
  stdio: 'pipe',
});

// Wait for agent to start
await new Promise((resolve) => setTimeout(resolve, 800));

const testRun = spawn('node', [
  'bin/auditgpt.js',
  'test',
  '--endpoint',
  'http://127.0.0.1:8799/agent',
  '--export-sarif',
  'test_results.sarif',
  '--export-pr-comment',
  'test_summary.md',
  '--ci',
]);

let testOut = '';
testRun.stdout.on('data', (d) => (testOut += d.toString()));
testRun.stderr.on('data', (d) => (testOut += d.toString()));

const testCode = await new Promise((resolve) => {
  testRun.on('close', resolve);
});

agent.kill();

if (testCode !== 1) {
  console.error(testOut);
  throw new Error(`Expected gate failure (exit code 1) against broken agent, got ${testCode}`);
}

if (!existsSync('test_results.sarif') || !existsSync('test_summary.md')) {
  throw new Error('SARIF or markdown report export was not created');
}

unlinkSync('test_results.sarif');
unlinkSync('test_summary.md');

console.log('[test-runner] Broken agent correctly triggered CI gate block (exit code 1).');
console.log('[test-runner] Report generation verified (SARIF + Markdown PR comment).');
console.log('\x1b[32m[test-runner] All verification checks passed.\x1b[0m');
