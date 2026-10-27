#!/usr/bin/env node
/**
 * K68ExecReadmeFix — readme-map repair mechanics (round 68, wave w1).
 *
 * Applies the exact edits derived in repair.md to a lane-root copy:
 *   1. corpus/README.md — one row for `knowledge/mcp-deprecation-registry.md`
 *      immediately after the last knowledge row, one row for
 *      `lessons/round-68.md` immediately after the last lessons row;
 *   2. .ufo/pins/readme-map.json — both paths appended to `covered`.
 *
 * Idempotent: a path that already has a row / pin is left alone.
 * Never writes outside the root it is given.
 *
 *   node apply.mjs <lane-root>
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) {
  process.stderr.write('USAGE node apply.mjs <lane-root>\n');
  process.exit(64);
}

const KNOWLEDGE_ROW = '| `knowledge/mcp-deprecation-registry.md` | The MCP deprecation registry, re-grounded on rows opened 2026-10-27 against the installed host release `omp/18.13.1`: SEP-2596 Final 2026-06-03 (S213) + the registry\'s three-month grace → elapsed 2026-09-03, the legacy HTTP+SSE transport source re-verified at `/v18.13.1/` (S209/S212), and the S207 Deprecated table mirrored row-for-row; frontier band "MCP protocol revisions as they bear on orchestration", rows S207–S213 | `corpus/knowledge/mcp-deprecation-registry.md`; `corpus/SOURCES.md` S207–S213; `.ufo/pins/source-captures.json` |';
const LESSONS_ROW = '| `lessons/round-68.md` | Round-68: `routed-ledger` v2 (contract `kumitate-routed-ledger-v2`, rule L68) with its data `corpus/routed-ledger.md` (61 items in 12 sections) and its registry home, plus the MCP deprecation registry re-grounded at `omp/18.13.1` (rule M68, rows S207–S213); mistake mined `unexercised-counter` with the QUALITY Q64 fix | `.ufo/waves/round-68/plan.md`; `.ufo/waves/round-68/probe/`; `.ufo/waves/round-68/base/` |';

const ROWS = [
  { path: 'knowledge/mcp-deprecation-registry.md', row: KNOWLEDGE_ROW, anchor: /^\| `knowledge\/omp-installed-release-mcp-runtime\.md` \|/ },
  { path: 'lessons/round-68.md', row: LESSONS_ROW, anchor: null },
];

const readmePath = join(root, 'corpus/README.md');
const lines = readFileSync(readmePath, 'utf8').split('\n');

// Only a file that actually landed on disk gets a row: a row without its file
// is DRIFT `orphan-row`, and a pin without its file is DRIFT `stale-covered`.
const LANDED = ROWS.filter(({ path }) => existsSync(join(root, 'corpus', path)));
for (const { path } of ROWS) {
  if (!LANDED.some((r) => r.path === path)) process.stdout.write(`ABSENT file (no row/pin): ${path}\n`);
}

for (const { path, row, anchor } of LANDED) {
  if (lines.some((l) => l.startsWith(`| \`${path}\` |`))) {
    process.stdout.write(`SKIP row (present): ${path}\n`);
    continue;
  }
  let at;
  if (anchor) {
    at = lines.findIndex((l) => anchor.test(l));
    if (at < 0) throw new Error(`anchor not found for ${path}`);
  } else {
    at = lines.reduce((acc, l, i) => (l.startsWith('| `lessons/') ? i : acc), -1);
    if (at < 0) throw new Error(`no lessons row block for ${path}`);
  }
  lines.splice(at + 1, 0, row);
  process.stdout.write(`INSERT row after line ${at + 1}: ${path}\n`);
}
writeFileSync(readmePath, lines.join('\n'));

const pinsPath = join(root, '.ufo/pins/readme-map.json');
const pinsText = readFileSync(pinsPath, 'utf8');
const doc = JSON.parse(pinsText);
const add = LANDED.map((r) => r.path).filter((p) => !doc.covered.includes(p));
if (add.length === 0) {
  process.stdout.write('SKIP pins (all present)\n');
} else {
  const lines2 = pinsText.split('\n');
  const lastMember = lines2.reduce((acc, l, i) => (/^\s*"[^"]+\.md",?$/.test(l) ? i : acc), -1);
  if (lastMember < 0) throw new Error('covered member block not found');
  if (!lines2[lastMember].endsWith(',')) lines2[lastMember] += ',';
  const indent = lines2[lastMember].match(/^\s*/)[0];
  const tail = add.map((p, i) => `${indent}"${p}"${i === add.length - 1 ? '' : ','}`);
  lines2.splice(lastMember + 1, 0, ...tail);
  const next = lines2.join('\n');
  const check = JSON.parse(next);
  if (check.covered.length !== doc.covered.length + add.length) throw new Error('pin append lost a member');
  for (const p of add) if (!check.covered.includes(p)) throw new Error(`pin append lost ${p}`);
  writeFileSync(pinsPath, next);
  process.stdout.write(`INSERT pins after member line ${lastMember + 1}: ${add.join(', ')}\n`);
}
