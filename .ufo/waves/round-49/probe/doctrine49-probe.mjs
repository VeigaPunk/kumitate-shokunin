#!/usr/bin/env node
/**
 * doctrine49-probe.mjs — FROZEN counter for kumitate round 49, claim C2 (rule `D49`).
 *
 *   node .ufo/waves/round-49/probe/doctrine49-probe.mjs <lane> <rev> [--file <entry>]
 *
 * Reads `corpus/knowledge/counter-amendment-discipline.md` at <rev> (or from <entry>, a worktree file, for the
 * doctored-copy control), then:
 *   - every clause line carrying `receipt:<repo-path>@sha256:<64 hex>` must name a path that exists at <rev> whose
 *     blob sha256 matches that hex;
 *   - every `S0NN` citation must name a row in `corpus/SOURCES.md` at <rev> whose status cell is `mined`;
 *   - floor: clauses >= 10, rows >= 2.
 *
 * Predicate DOCTRINE_HELD = held clauses == total clauses, rows >= 2, clauses >= 10; prints
 * `DOCTRINE49: HELD clauses=<n>/<n> rows=<m> entry_sha256=<sha> rule=D49` exit 0. Any miss prints
 * `DOCTRINE49: UNMET reason=…` exit 1. Unreadable revision exits 2.
 *
 * Frozen at `.ufo/waves/round-49/plan.md` § C2 before any data seat ran.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const ENTRY = 'corpus/knowledge/counter-amendment-discipline.md';
const [laneArg, rev, ...rest] = process.argv.slice(2);
const usage = () => { process.stderr.write('DOCTRINE49: USAGE node doctrine49-probe.mjs <lane> <rev> [--file <entry>]\n'); process.exit(64); };
if (!laneArg || !rev) usage();
let fileOverride = null;
for (let i = 0; i < rest.length; i += 1) {
  if (rest[i] === '--file' && rest[i + 1]) { fileOverride = resolve(rest[i + 1]); i += 1; } else usage();
}
const lane = resolve(laneArg);
if (!existsSync(lane)) usage();
const sha = (b) => createHash('sha256').update(b).digest('hex');
const git = (args) => spawnSync('git', ['-C', lane, ...args], { encoding: 'utf8', timeout: 120_000, maxBuffer: 64 << 20 });

const show = (path) => {
  const r = git(['show', `${rev}:${path}`]);
  return r.status === 0 ? { ok: true, text: r.stdout, bytes: Buffer.from(r.stdout) } : { ok: false, why: `absent@${rev}` };
};

let entry;
if (fileOverride) {
  if (!existsSync(fileOverride)) { process.stdout.write(`DOCTRINE49: UNMET reason=file-absent path=${fileOverride}\n`); process.exit(1); }
  const buf = readFileSync(fileOverride);
  entry = { ok: true, text: buf.toString('utf8'), bytes: buf };
} else {
  entry = show(ENTRY);
  if (!entry.ok) { process.stdout.write(`DOCTRINE49: UNMET reason=entry-absent path=${ENTRY} rev=${rev}\n`); process.exit(1); }
}

const src = show('corpus/SOURCES.md');
if (!src.ok) { process.stderr.write(`DOCTRINE49: CANNOT_EVALUATE SOURCES.md absent at ${rev}\n`); process.exit(2); }

// Parse SOURCES rows: | S### | ... | status | ...
const rows = new Map();
for (const line of src.text.split('\n')) {
  const m = /^\|\s*(S\d{3})\s*\|/.exec(line);
  if (!m) continue;
  const cells = line.split('|').map((c) => c.trim());
  // cells[0] is '' (leading pipe), cells[1] = id, ... cells[8] = status
  rows.set(m[1], { status: (cells[8] || '').toLowerCase() });
}

const TOKEN = /receipt:([A-Za-z0-9_./-]+)@sha256:([0-9a-f]{64})/g;
const clauses = [];
for (const line of entry.text.split('\n')) {
  TOKEN.lastIndex = 0;
  const found = [...line.matchAll(TOKEN)];
  for (const f of found) clauses.push({ path: f[1], hex: f[2], line: line.trim().slice(0, 80) });
}

let held = 0;
const misses = [];
for (const c of clauses) {
  const b = show(c.path);
  if (!b.ok) { misses.push(`${c.path}=absent`); continue; }
  const got = sha(Buffer.from(b.text));
  if (got !== c.hex) misses.push(`${c.path}=hash-mismatch(${got.slice(0, 8)}!=${c.hex.slice(0, 8)})`);
  else held += 1;
}

const cited = [...new Set([...entry.text.matchAll(/\b(S\d{3})\b/g)].map((m) => m[1]))];
const minedCited = cited.filter((id) => (rows.get(id)?.status || '') === 'mined');
const notMined = cited.filter((id) => !minedCited.includes(id));

const entrySha = sha(entry.bytes);
const report = (verdict, extra) => {
  process.stdout.write(`DOCTRINE49: ${verdict} ${extra} clauses=${held}/${clauses.length} rows=${minedCited.length} cited=${cited.length} entry_sha256=${entrySha} rule=D49 rev=${rev}\n`);
};
if (clauses.length < 10) { report('UNMET', `reason=clause-floor(${clauses.length}<10)`); process.exit(1); }
if (held !== clauses.length) { report('UNMET', `reason=receipts misses=${misses.slice(0, 4).join(',')}`); process.exit(1); }
if (minedCited.length < 2) { report('UNMET', `reason=row-floor(${minedCited.length}<2) not-mined=${notMined.join(',') || 'none'}`); process.exit(1); }
if (notMined.length) { report('UNMET', `reason=rows-not-mined ${notMined.join(',')}`); process.exit(1); }
report('HELD', `entry=${basename(fileOverride || ENTRY)}`);
process.exit(0);
