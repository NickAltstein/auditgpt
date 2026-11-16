import { build } from 'esbuild';
import { chmodSync } from 'node:fs';

await build({
  entryPoints: ['src/cli.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'bin/auditgpt.js',
});

chmodSync('bin/auditgpt.js', 0o755);
console.log('Build complete: bin/auditgpt.js');
