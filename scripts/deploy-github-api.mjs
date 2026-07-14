#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Direct push of source -> main, and dist/ -> gh-pages, using the GitHub REST API.
 * No git / gh CLI required.
 *
 * Required environment:
 *   GITHUB_TOKEN     Personal Access Token (classic fine; needs 'repo' scope)
 *   GITHUB_USERNAME  The account that owns the cockpit-h5 repo
 * Optional:
 *   GITHUB_REPO      defaults to 'cockpit-h5'
 *
 * Usage:
 *   $env:GITHUB_TOKEN = 'ghp_xxx'
 *   $env:GITHUB_USERNAME = 'your-name'
 *   npm run deploy:api
 */
import { Octokit } from '@octokit/rest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// ---- 0. read env (NEVER log these) -----------------------------------------
const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;
const REPO = process.env.GITHUB_REPO || 'cockpit-h5';
if (!TOKEN) {
  console.error('✗ GITHUB_TOKEN not set');
  process.exit(1);
}
if (!USERNAME) {
  console.error('✗ GITHUB_USERNAME not set');
  process.exit(1);
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

const octokit = new Octokit({
  auth: TOKEN,
  userAgent: 'cockpit-h5-deploy/1.0',
});

// ---- 1. ensure repo exists (idempotent) ------------------------------------
console.log(`\n[1/6] Ensuring repo ${USERNAME}/${REPO} exists…`);
try {
  await octokit.repos.createForAuthenticatedUser({
    name: REPO,
    private: false,
    auto_init: true,
    description: 'Cockpit H5 — 景区智能观光车乘客端',
  });
  console.log(`  ✓ Created ${USERNAME}/${REPO}`);
} catch (e) {
  if (e.status === 422) {
    console.log(`  ✓ ${USERNAME}/${REPO} already exists`);
  } else {
    throw e;
  }
}

// ---- 2. helpers ------------------------------------------------------------
const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico',
  '.woff', '.woff2', '.ttf', '.eot',
  '.pdf', '.zip', '.mp4', '.webm',
  '.map', '.ico',
]);

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.vscode',
  '.idea',
  '.gradle',
  'build',
  'android/.gradle',
  'android/build',
  'android/app/build',
  'android/capacitor-cordova-android-plugins',
  'scripts/.deploy-cache',
]);

const SKIP_FILES = new Set([
  'preview.log',
  'vite.config.js',
  'vite.config.d.ts',
  'vite.config.js.map',
  'vite.config.d.ts.map',
  'tsconfig.tsbuildinfo',
  'tsconfig.node.tsbuildinfo',
  'package-lock.json.bak',
  '.DS_Store',
  'Thumbs.db',
]);

function isBinary(p) {
  return BINARY_EXTS.has(path.extname(p).toLowerCase());
}
function normPosix(p) {
  return p.split(path.sep).join('/');
}

async function* walk(dir, base = dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = normPosix(path.relative(base, abs));
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(rel) || SKIP_DIRS.has(entry.name)) continue;
      yield* walk(abs, base);
    } else {
      if (SKIP_FILES.has(entry.name) || SKIP_FILES.has(rel)) continue;
      yield { rel, abs };
    }
  }
}

async function getBranchHead(branch) {
  try {
    const { data } = await octokit.git.getRef({
      owner: USERNAME,
      repo: REPO,
      ref: `heads/${branch}`,
    });
    return { sha: data.object.sha, isNew: false };
  } catch (e) {
    if (e.status === 404) return { sha: null, isNew: true };
    throw e;
  }
}

async function getCommitTree(sha) {
  const { data } = await octokit.git.getCommit({
    owner: USERNAME,
    repo: REPO,
    commit_sha: sha,
  });
  return data.tree.sha;
}

async function pushTree({ branch, files, message, clean = false }) {
  console.log(`  → branch ${branch}: ${files.length} files`);

  // 1) blobs
  console.log(`    creating blobs…`);
  const treeEntries = [];
  let i = 0;
  for (const f of files) {
    const buf = await fs.readFile(f.abs);
    const enc = isBinary(f.rel) ? 'base64' : 'utf-8';
    const content = enc === 'base64' ? buf.toString('base64') : buf.toString('utf-8');
    const { data } = await octokit.git.createBlob({
      owner: USERNAME,
      repo: REPO,
      content,
      encoding: enc,
    });
    treeEntries.push({ path: f.rel, mode: '100644', type: 'blob', sha: data.sha });
    i++;
    if (i % 20 === 0) {
      process.stdout.write(`    ${i}/${files.length} blobs uploaded\r`);
    }
  }
  process.stdout.write(`    ${files.length}/${files.length} blobs uploaded\n`);

  // 2) tree
  const head = await getBranchHead(branch);
  const baseTree = clean || head.isNew ? undefined : await getCommitTree(head.sha);
  const { data: tree } = await octokit.git.createTree({
    owner: USERNAME,
    repo: REPO,
    base_tree: baseTree,
    tree: treeEntries,
  });
  console.log(`  ✓ tree ${tree.sha.slice(0, 7)}`);

  // 3) commit
  const { data: commit } = await octokit.git.createCommit({
    owner: USERNAME,
    repo: REPO,
    message,
    tree: tree.sha,
    parents: head.isNew ? [] : [head.sha],
  });
  console.log(`  ✓ commit ${commit.sha.slice(0, 7)}: ${message}`);

  // 4) ref
  if (head.isNew) {
    await octokit.git.createRef({
      owner: USERNAME,
      repo: REPO,
      ref: `refs/heads/${branch}`,
      sha: commit.sha,
    });
    console.log(`  ✓ ref refs/heads/${branch} created`);
  } else {
    await octokit.git.updateRef({
      owner: USERNAME,
      repo: REPO,
      ref: `heads/${branch}`,
      sha: commit.sha,
    });
    console.log(`  ✓ ref refs/heads/${branch} → ${commit.sha.slice(0, 7)}`);
  }
}

// ---- 3. collect source files ----------------------------------------------
console.log(`\n[2/6] Collecting source files for main…`);
const sourceFiles = [];
for await (const f of walk(ROOT)) sourceFiles.push(f);
console.log(`  ${sourceFiles.length} files queued for main`);

// ---- 4. build dist/ for GitHub Pages ---------------------------------------
console.log(`\n[3/6] Building dist/ with base=/cockpit-h5/…`);
execSync('npm run build', {
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES: 'true' },
});

const distDir = path.join(ROOT, 'dist');
const distFiles = [];
for await (const f of walk(distDir)) distFiles.push(f);
console.log(`  ${distFiles.length} dist files queued`);

// ---- 5. push main ----------------------------------------------------------
console.log(`\n[4/6] Pushing main…`);
await pushTree({
  branch: 'main',
  files: sourceFiles,
  message: 'chore: deploy via API',
});

// ---- 6. push gh-pages (clean overwrite) ------------------------------------
console.log(`\n[5/6] Pushing gh-pages (clean)…`);
await pushTree({
  branch: 'gh-pages',
  files: distFiles,
  message: 'deploy: dist via API',
  clean: true,
});

// ---- 7. final report -------------------------------------------------------
const live = `https://${USERNAME}.github.io/${REPO}/`;
console.log(`\n[6/6] ✓ Deployment complete`);
console.log(`=========================================`);
console.log(`  Repo : https://github.com/${USERNAME}/${REPO}`);
console.log(`  Live : ${live}`);
console.log(`=========================================`);
console.log(`\nNext: 打开 GitHub 仓库 → Settings → Pages`);
console.log(`      Source: 'Deploy from a branch' → Branch: gh-pages / (root) → Save`);
console.log(`      等待约 1 分钟后访问上面的 Live URL 即可。`);
