#!/usr/bin/env node
/**
 * deploy-files.mjs
 * Uploads the built dist/ folder directly to Vercel via the Files API.
 * No GitHub integration required.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_NAME = 'font-extractor';
const DIST_DIR = path.resolve('./font-extractor/dist');
const API = 'https://api.vercel.com';

const headers = (extra = {}) => ({
  Authorization: `Bearer ${TOKEN}`,
  ...extra,
});

async function api(method, url, body, extraHeaders = {}) {
  const res = await fetch(`${API}${url}`, {
    method,
    headers: { ...headers(), 'Content-Type': 'application/json', ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// ─── Collect all files in dist/ recursively ───────────────────────────────────
function collectFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(collectFiles(full, base));
    } else {
      const content = fs.readFileSync(full);
      const sha1 = crypto.createHash('sha1').update(content).digest('hex');
      const relPath = path.relative(base, full).replace(/\\/g, '/');
      files.push({ full, relPath, content, sha1, size: content.length });
    }
  }
  return files;
}

// ─── Upload a single file via the blob API ────────────────────────────────────
async function uploadFile(file) {
  const res = await fetch(`${API}/v2/files`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/octet-stream',
      'x-vercel-digest': file.sha1,
      'Content-Length': String(file.size),
    },
    body: file.content,
  });
  // 200 = uploaded, 409 = already exists — both fine
  if (res.status !== 200 && res.status !== 409) {
    const t = await res.text();
    throw new Error(`File upload failed (${res.status}): ${t}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  if (!TOKEN) { console.error('❌  VERCEL_TOKEN not set'); process.exit(1); }

  // 1. Auth check
  const user = await api('GET', '/v2/user');
  console.log(`\n✅  Authenticated as: ${user.user.username} (${user.user.email})`);

  // 2. Create project (plain — no git link)
  console.log(`\n⚙️   Creating project "${PROJECT_NAME}"...`);
  let project = await api('POST', '/v9/projects', {
    name: PROJECT_NAME,
    framework: 'astro',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    installCommand: 'npm install',
  });

  if (project.error?.code === 'project_already_exists') {
    console.log(`ℹ️   Project already exists, fetching...`);
    project = await api('GET', `/v9/projects/${PROJECT_NAME}`);
  } else {
    console.log(`✅  Project ready! ID: ${project.id}`);
  }

  // 3. Collect dist/ files
  console.log(`\n📂  Scanning ${DIST_DIR}...`);
  const files = collectFiles(DIST_DIR);
  console.log(`    Found ${files.length} files to upload.`);

  // 4. Upload all files
  console.log(`\n⬆️   Uploading files...`);
  for (const file of files) {
    process.stdout.write(`    → ${file.relPath}\n`);
    await uploadFile(file);
  }
  console.log(`✅  All files uploaded.`);

  // 5. Create deployment
  console.log(`\n🚀  Creating deployment...`);
  const deployment = await api('POST', '/v13/deployments', {
    name: PROJECT_NAME,
    project: project.id,
    files: files.map(f => ({ file: f.relPath, sha: f.sha1, size: f.size })),
    projectSettings: {
      framework: 'astro',
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
    },
    target: 'production',
  });

  if (deployment.error) {
    throw new Error(JSON.stringify(deployment.error));
  }

  const url = deployment.url ? `https://${deployment.url}` : '(provisioning...)';
  console.log(`\n🌐  Deployment created!`);
  console.log(`    URL   : ${url}`);
  console.log(`    State : ${deployment.readyState ?? 'BUILDING'}`);
  console.log(`\n💡  Your site will be live in ~30–60 seconds.`);
  console.log(`    Dashboard: https://vercel.com/dashboard\n`);
})().catch(err => {
  console.error(`\n❌  Error: ${err.message}\n`);
  process.exit(1);
});
