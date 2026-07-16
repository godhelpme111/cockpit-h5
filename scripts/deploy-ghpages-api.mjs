#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Push dist/ -> gh-pages branch using the GitHub REST API.
 * Bypasses the failing Actions deploy job.
 */
import { Octokit } from '@octokit/rest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;
const REPO = process.env.GITHUB_REPO || 'cockpit-h5';
if (!TOKEN || !USERNAME) {
  console.error('✗ GITHUB_TOKEN / GITHUB_USERNAME not set');
  process.exit(1);
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
process.chdir(ROOT);

const octokit = new Octokit({ auth: TOKEN, userAgent: 'cockpit-h5-ghpages/1.0' });

const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot',
  '.pdf', '.zip', '.mp4', '.webm',
  '.map',
]);

function isBinary(p) {
  return BINARY_EXTS.has(path.extname(p).toLowerCase());
}
function normPosix(p) {
  return p.split(path.sep).join('/');
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(abs);
    } else {
      yield abs;
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

console.log(`\n[1/3] Collecting dist files…`);
const files = [];
for await (const abs of walk(DIST)) {
  const rel = normPosix(path.relative(DIST, abs));
  files.push({ rel, abs });
}
console.log(`  ${files.length} files queued`);

console.log(`\n[2/3] Creating blobs…`);
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
    process.stdout.write(`  ${i}/${files.length} blobs uploaded\r`);
  }
}
process.stdout.write(`  ${files.length}/${files.length} blobs uploaded\n`);

console.log(`\n[3/3] Pushing to gh-pages…`);
const head = await getBranchHead('gh-pages');
const baseTree = head.isNew ? undefined : await getCommitTree(head.sha);
const { data: tree } = await octokit.git.createTree({
  owner: USERNAME,
  repo: REPO,
  base_tree: baseTree,
  tree: treeEntries,
});
console.log(`  ✓ tree ${tree.sha.slice(0, 7)}`);

const { data: commit } = await octokit.git.createCommit({
  owner: USERNAME,
  repo: REPO,
  message: 'chore: deploy dist via API',
  tree: tree.sha,
  parents: head.isNew ? [] : [head.sha],
});
console.log(`  ✓ commit ${commit.sha.slice(0, 7)}`);

if (head.isNew) {
  await octokit.git.createRef({
    owner: USERNAME,
    repo: REPO,
    ref: 'refs/heads/gh-pages',
    sha: commit.sha,
  });
  console.log(`  ✓ ref refs/heads/gh-pages created`);
} else {
  await octokit.git.updateRef({
    owner: USERNAME,
    repo: REPO,
    ref: 'heads/gh-pages',
    sha: commit.sha,
  });
  console.log(`  ✓ ref heads/gh-pages → ${commit.sha.slice(0, 7)}`);
}

console.log(`\n✓ Done. Live: https://${USERNAME}.github.io/${REPO}/`);
