#!/usr/bin/env node
// Generate + distribute amplify_outputs.json across the monorepo.
//
// Canonical location:  packages/shared/amplify_outputs.json  (single source of truth)
// Consumers:           apps that bundle it get a *copy* — a bundler (Metro) can't
//                      resolve a runtime file across package boundaries without
//                      watchFolders, so each app reads a local copy instead.
//
// Usage:
//   node scripts/amplify-outputs.mjs               # distribute the existing canonical
//   node scripts/amplify-outputs.mjs --generate    # ampx generate → canonical, then distribute
//
// Modes for --generate:
//   • Deployed branch: set AMPLIFY_APP_ID and AMPLIFY_BRANCH env vars.
//   • Sandbox:         run `npm run sandbox` first (it writes the canonical via
//                      --outputs-out-dir), then this script without --generate.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL = join(repoRoot, "packages/shared/amplify_outputs.json");

// Apps whose bundler needs a local copy. Add new device targets here.
const CONSUMERS = [join(repoRoot, "apps/tv/amplify_outputs.json")];

const rel = (p) => relative(repoRoot, p);

function generate() {
  const outDir = dirname(CANONICAL);
  mkdirSync(outDir, { recursive: true });

  const appId = process.env.AMPLIFY_APP_ID;
  const branch = process.env.AMPLIFY_BRANCH;
  const args = ["ampx", "generate", "outputs", "--out-dir", outDir, "--format", "json"];

  if (appId && branch) {
    args.push("--app-id", appId, "--branch", branch);
    console.log(`Generating outputs for ${appId}/${branch} → ${rel(CANONICAL)}`);
  } else {
    console.log(`Generating sandbox outputs → ${rel(CANONICAL)}`);
    console.log("(set AMPLIFY_APP_ID + AMPLIFY_BRANCH to target a deployed branch)");
  }

  execFileSync("npx", args, { stdio: "inherit", cwd: repoRoot });
}

function distribute() {
  if (!existsSync(CANONICAL)) {
    console.error(
      `✗ ${rel(CANONICAL)} not found.\n` +
        "  Generate it first:\n" +
        "    • Sandbox:  npm run sandbox   (writes it via --outputs-out-dir)\n" +
        "    • Deployed: AMPLIFY_APP_ID=... AMPLIFY_BRANCH=... npm run outputs:generate",
    );
    process.exit(1);
  }

  // Guard against copying a truncated/error file into every app.
  try {
    JSON.parse(readFileSync(CANONICAL, "utf8"));
  } catch {
    console.error(`✗ ${rel(CANONICAL)} is not valid JSON — regenerate it.`);
    process.exit(1);
  }

  for (const dest of CONSUMERS) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(CANONICAL, dest);
    console.log(`✓ ${rel(dest)}`);
  }
}

if (process.argv.includes("--generate")) generate();
distribute();
console.log("amplify_outputs.json synced.");
