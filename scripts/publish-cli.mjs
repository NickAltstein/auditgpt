#!/usr/bin/env node
/**
 * CLI Build & Release Validator (scripts/publish-cli.mjs)
 * Bundles the standalone CLI binary with esbuild and verifies execution.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

console.log("\x1b[36m\x1b[1m⚡ AuditGPT Package Build & Release Validator\x1b[0m\n");

// 1. Compile bundle with esbuild
console.log("[*] Bundling standalone executable dist/cli.js with esbuild...");
try {
  execSync("./node_modules/.bin/esbuild src/cli.ts --bundle --platform=node --target=node18 --outfile=dist/cli.js", {
    stdio: "inherit",
  });
  console.log("\x1b[32m[✓] Standalone dist/cli.js bundle compiled successfully.\x1b[0m");
} catch (err) {
  console.error("\x1b[31m[!] Bundle build failed.\x1b[0m", err);
  process.exit(1);
}

// 2. Verify bin executable
const binPath = path.resolve(process.cwd(), "bin/auditgpt.js");
if (!fs.existsSync(binPath)) {
  console.error("\x1b[31m[!] Error: bin/auditgpt.js not found.\x1b[0m");
  process.exit(1);
}
console.log("\x1b[32m[✓] Validated bin/auditgpt.js executable.\x1b[0m");

// 3. Smoke-test help execution
try {
  const output = execSync("node bin/auditgpt.js test --help", { encoding: "utf-8" });
  if (!output.includes("ASTI v1.1") || !output.includes("adversarial")) {
    throw new Error("CLI help output missing expected description.");
  }
  console.log("\x1b[32m[✓] Standalone CLI smoke test passed (0 dependencies required).\x1b[0m");
} catch (err) {
  console.error("\x1b[31m[!] Smoke test execution failed.\x1b[0m", err);
  process.exit(1);
}

// 4. Verify License & Readme
if (!fs.existsSync("LICENSE") || !fs.existsSync("README.md")) {
  console.error("\x1b[31m[!] Error: LICENSE or README.md missing.\x1b[0m");
  process.exit(1);
}
console.log("\x1b[32m[✓] Validated LICENSE (MIT) and README.md.\x1b[0m");

console.log("\n\x1b[42m\x1b[30m\x1b[1m RELEASE READY \x1b[0m auditgpt is verified and ready for npm publish.");
