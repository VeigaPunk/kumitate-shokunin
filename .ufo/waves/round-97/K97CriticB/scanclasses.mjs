#!/usr/bin/env node
/**
 * scanclasses.mjs — does any real corpus/SOURCES.md blob (working tree or any git
 * object reachable in the repo's history) carry a heading line whose section
 * decision differs between the lane tool's BASE reader and the fleet census
 * `row_pass` reader? Read-only: `git cat-file`/`git rev-list` and readFileSync.
 *
 *   node scanclasses.mjs --repo <dir> [--work]
 *
 * Output: one JSON line per blob examined:
 *   {repo, src, sha, lines, diffs:[{line,baseIn,censusIn,baseHead,censusHead,rawHex}],
 *    headingsBase, headingsCensus, rowsBase, rowsCensus, classes:{...}}
 * Exit 0 always; summary line last.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const REPO = opt('--repo', null);
if (!REPO) { console.error('usage: --repo DIR'); process.exit(64); }

const BASE_H2 = /^## (.+?)\s*$/;
const BASE_H1 = /^#(?:\s|$)/;
const CEN_H2 = /^ {0,3}##[ \t]/;
const CEN_H1 = /^ {0,3}#[ \t]/;
const BASE_INDENT = /^ {1,3}(?=\S)/u;

function baseState(text) {
  const lines = text.split(/\r?\n/).map((l) => l.replace(BASE_INDENT, ''));
  const heads = new Set();
  const st = [];
  let active = null;
  for (const line of lines) {
    const m = BASE_H2.exec(line);
    if (m) { active = m[1]; heads.add(active); }
    else if (BASE_H1.test(line)) active = null;
    st.push(active);
  }
  return { lines, st, heads };
}
function censusState(text) {
  const lines = text.split('\n');
  const heads = new Set();
  const st = [];
  let active = null;
  for (const line of lines) {
    if (CEN_H2.test(line)) {
      const stripped = line.replace(/^ {0,3}/, '');
      active = stripped.slice(2).replace(/^[ \t]+|[ \t]+$/g, '');
      heads.add(active);
    } else if (CEN_H1.test(line)) active = null;
    st.push(active);
  }
  return { lines, st, heads };
}
function rowsInside(lines, st) {
  let n = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (st[i] === 'Registry' && /^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/.test(lines[i])) n += 1;
  }
  return n;
}
const hexes = (s) => [...new Set([...s].filter((c) => c.charCodeAt(0) > 126 || (c.charCodeAt(0) < 32 && c !== '\n') || c === '\r' || c === '\t'))]
  .map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);

function examine(repo, src, sha, text) {
  const b = baseState(text);
  const c = censusState(text);
  const n = Math.max(b.lines.length, c.lines.length);
  const diffs = [];
  for (let i = 0; i < n; i += 1) {
    const baseIn = b.st[i] === 'Registry';
    const censusIn = c.st[i] === 'Registry';
    const baseHead = b.st[i] ?? null;
    const censusHead = c.st[i] ?? null;
    if (baseIn !== censusIn || baseHead !== censusHead) {
      diffs.push({ line: i + 1, baseIn, censusIn, baseHead, censusHead, rawHex: hexes(b.lines[i] ?? '') });
    }
  }
  const headsBase = [...b.heads].sort();
  const headsCensus = [...c.heads].sort();
  return {
    repo, src, sha, lines: b.lines.length,
    diffs, headingsBase: headsBase, headingsCensus: headsCensus,
    rowsBase: rowsInside(b.lines, b.st), rowsCensus: rowsInside(c.lines, c.st),
  };
}

const out = [];
const push = (o) => { out.push(o); process.stdout.write(`${JSON.stringify(o)}\n`); };

// working tree
const work = join(REPO, 'corpus', 'SOURCES.md');
try { push(examine(REPO, 'worktree', 'worktree', readFileSync(work, 'utf8'))); }
catch { process.stdout.write(`${JSON.stringify({ repo: REPO, src: 'worktree', missing: true })}\n`); }

// every distinct blob reachable in history (all refs)
let hashes = [];
try {
  const listing = execFileSync('git', ['-C', REPO, 'rev-list', '--all', '--objects', '--', 'corpus/SOURCES.md'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  hashes = [...new Set(listing.split('\n').filter(Boolean).map((l) => l.split(' ')[0]))];
} catch { /* no history */ }
const batch = hashes.length
  ? execFileSync('git', ['-C', REPO, 'cat-file', '--batch'], { input: hashes.join('\n') + '\n', maxBuffer: 512 * 1024 * 1024 })
  : Buffer.alloc(0);
let pos = 0;
let examined = 0;
while (pos < batch.length) {
  const nl = batch.indexOf(10, pos);
  if (nl < 0) break;
  const header = batch.subarray(pos, nl).toString('utf8').split(' ');
  pos = nl + 1;
  if (header[1] === 'missing') continue;
  const size = Number(header[2]);
  const body = batch.subarray(pos, pos + size).toString('utf8');
  pos += size + 1;
  push(examine(REPO, 'git', header[0], body));
  examined += 1;
}
const differing = out.filter((o) => o.diffs && o.diffs.length > 0);
process.stdout.write(`${JSON.stringify({
  summary: REPO, worktree: out.some((o) => o.src === 'worktree' && (o.diffs || []).length > 0),
  blobs: examined, differing: differing.length,
  differingRefs: differing.slice(0, 5).map((o) => `${o.src}:${o.sha.slice(0, 12)}@${o.diffs[0].line}`),
  rowsBase: [...new Set(out.filter((o) => o.rowsBase !== undefined).map((o) => o.rowsBase))],
  rowsCensus: [...new Set(out.filter((o) => o.rowsCensus !== undefined).map((o) => o.rowsCensus))],
})}\n`);
