#!/usr/bin/env node
// Usage: node scripts/setup-branch-protection.mjs
// Requires: GITHUB_TOKEN env var with repo admin permissions
//   Linux/macOS: GITHUB_TOKEN=ghp_xxx node scripts/setup-branch-protection.mjs
//   Windows CMD: set GITHUB_TOKEN=ghp_xxx && node scripts/setup-branch-protection.mjs
//   Windows PS:  $env:GITHUB_TOKEN="ghp_xxx"; node scripts/setup-branch-protection.mjs

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("Error: GITHUB_TOKEN environment variable is required.");
  console.error("Create a token at https://github.com/settings/tokens with 'repo' scope.");
  process.exit(1);
}

// Read repo from package.json
const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8"));
const repoUrl = pkg.repository?.url ?? "";
const match = repoUrl.match(/github\.com[/:]([^/]+\/[^/.]+)/);
if (!match) {
  console.error("Error: Could not determine GitHub repo from package.json repository.url");
  console.error(`Found: "${repoUrl}"`);
  console.error('Expected format: "https://github.com/owner/repo"');
  process.exit(1);
}
const repo = match[1];

async function protect(branch, rules) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/branches/${branch}/protection`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(rules),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.message ?? res.statusText;
    throw new Error(`Failed to protect '${branch}': ${msg} (HTTP ${res.status})`);
  }
}

const CI_CHECKS = ["Lint & Type Check", "Test", "Build"];

console.log(`Configuring branch protection for ${repo}...`);

await protect("main", {
  required_status_checks: { strict: true, contexts: CI_CHECKS },
  enforce_admins: true,
  required_pull_request_reviews: {
    required_approving_review_count: 1,
    dismiss_stale_reviews: true,
  },
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false,
});
console.log("✓ main — PRs required, 1 approval, CI must pass, no direct pushes");

await protect("develop", {
  required_status_checks: { strict: true, contexts: CI_CHECKS },
  enforce_admins: false,
  required_pull_request_reviews: null,
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false,
});
console.log("✓ develop — CI must pass, direct pushes allowed");

console.log("\nDone. Branch protection is active on main and develop.");
