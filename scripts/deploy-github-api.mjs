#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Push source code -> main branch using the GitHub REST API.
 * No git / gh CLI required.
 *
 * After this push, the GitHub Actions workflow (`.github/workflows/deploy.yml`)
 * automatically:
 *   1. Detects the push
 *   2. Sets GITHUB_PAGES=true
 *   3. Runs `npm run build` (build:gh internally uses cross-env)
 *   4. Uploads the dist/ artifact
 *   5. Deploys to GitHub Pages
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
console.log(`\n[1/4] Ensuring repo ${USERNAME}/${REPO} exists…`);
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
  '.map',
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

async function pushTree({ branch, files, message }) {
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
  const baseTree = head.isNew ? undefined : await getCommitTree(head.sha);
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
console.log(`\n[2/4] Collecting source files for main…`);
const sourceFiles = [];
for await (const f of walk(ROOT)) sourceFiles.push(f);
console.log(`  ${sourceFiles.length} files queued for main`);

// ---- 4. push main ----------------------------------------------------------
console.log(`\n[3/4] Pushing main…`);
await pushTree({
  branch: 'main',
  files: sourceFiles,
  message: 'chore: deploy via API',
});

// ---- 5. final report -------------------------------------------------------
const live = `https://${USERNAME}.github.io/${REPO}/`;
const actions = `https://github.com/${USERNAME}/${REPO}/actions`;
console.log(`\n[4/4] ✓ Source pushed to main`);
console.log(`=========================================`);
console.log(`  Repo    : https://github.com/${USERNAME}/${REPO}`);
console.log(`  Live    : ${live}`);
console.log(`  Actions : ${actions}`);
console.log(`=========================================`);
console.log(`\nGitHub Actions 将在 ~30 秒内自动构建并发布到 GitHub Pages。`);
console.log(`在 Actions 页面可以查看实时进度。`);
