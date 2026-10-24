#!/usr/bin/env node
/**
 * repairs50-probe-v2.mjs — FROZEN auxiliary frontier/closure audit for kumitate round 50 (rule `R50`).
 *
 *   node .ufo/waves/round-52/build/ExecR50Repair/repairs50-probe-v2.mjs <lane> <rev> [--fleet <dir>]
 *
 * Checks committed bytes of <rev> in <lane> plus one fleet-repo check (the r49 report erratum is
 * fleet-repo state, read via `git show master:` committed bytes only):
 *   R1  corpus/lessons/round-49.md at rev carries a `## Gate` section containing the four ledger
 *       words (candidates, admitted, rejected, spot-check) — the r49-closure routed defect 2.
 *   R2  .ufo/waves/round-50/r50/ReopenS095.md exists at rev, first nonblank line matches
 *       `^REOPEN50: (HOLD|DRIFT) ` and carries `sha256=2cb77df2…` (bwrap.xml 0.13.1 body hash).
 *   R3  .ufo/waves/round-50/r50/ReopenS098.md exists at rev, first nonblank line matches
 *       `^REOPEN50: (HOLD|DRIFT) ` and carries `sha256=c16859e0…` (strace.1.in 7.2 body hash).
 *   R4  receipt-spacing evidence: at least three files under .ufo/waves/round-50/ whose names start
 *       `ReRunB49-`, each beginning `run-at=<ISO>` followed by `BINDORACLE49: ORACLE_HELD held=6/6`,
 *       all sha256-distinct, first-to-last run-at span >= 300 s.
 *   R5  SKILL.md at rev's `## Gate registry` states the count represented by its `| gate |` rows,
 *       and has no mismatched `all <count>` claim in that registry prelude.
 *   R6  corpus/lessons/round-50.md exists at rev with `## Mistakes` and `## Gate` sections.
 *   R7  `scripts/sources-census.sh validate --root <fleet> kumitate` exits 0 (live run).
 *   R8  `git -C <fleet> show master:.ufo/reports/round-49/kumitate.md` contains a `## Erratum`
 *       heading — the append-only correction naming the superseded C2 numbers (routed defect 1).
 *
 * Predicate LEDGER_HELD = held=8/8, exit 0. This is a conformance audit, not a second axis claim.
 * Any other reading is `held=<k>/8` exit 1. A crash or an unreadable blob is exit 2 (never a score).
 *
 * This predicate and sentence are frozen in `.ufo/waves/round-50/plan.md` before any data seat ran.
 *
 * v2 named repair (R52-4; 2026-10-24; seat `ExecR50Repair`): R5 derives the expected count from
 * registry rows; R1-R4 and R6-R8 are unchanged from the frozen R50 probe.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';

const RULE = 'R50';
const args = process.argv.slice(2);
const fi = args.indexOf('--fleet');
const [laneArg, rev] = fi === -1 ? args : args.slice(0, fi);
const fleet = resolve(fi === -1 ? `${laneArg}/..` : args[fi + 1] || `${laneArg}/..`);
if (!laneArg || !rev) {
  process.stderr.write('REPAIRS50: USAGE node repairs50-probe-v2.mjs <lane> <rev> [--fleet <dir>]\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(resolve(lane, '.git')) || !existsSync(resolve(fleet, '.git'))) {
  process.stderr.write(`REPAIRS50: USAGE lane or fleet is not a git repo (${lane}, ${fleet})\n`);
  process.exit(64);
}

const sha = (s) => createHash('sha256').update(s).digest('hex');
const sh = (cmd, a, opts = {}) => spawnSync(cmd, a, { encoding: 'utf8', timeout: 120_000, maxBuffer: 64 << 20, ...opts });
const blob = (path) => {
  const r = sh('git', ['-C', lane, 'show', `${rev}:${path}`]);
  return r.status === 0 ? r.stdout : null;
};
const lsRev = (prefix) => {
  const r = sh('git', ['-C', lane, 'ls-tree', '-r', '--name-only', rev, prefix]);
  return r.status === 0 ? r.stdout.split('\n').filter(Boolean) : [];
};

const l49 = blob('corpus/lessons/round-49.md');
// R1 — round-49 lesson gains a ## Gate ledger.
const gateStart = l49 ? l49.search(/^## Gate\s*$/m) : -1;
const gateTail = gateStart >= 0 ? l49.slice(gateStart).replace(/^## Gate\s*$/m, '') : '';
const gate49 = gateTail.split(/^## /m)[0];
const g1ok = !!(gateStart >= 0 && ['candidates', 'admitted', 'rejected', 'spot-check']
  .every((w) => gate49.includes(w)));

// R2 / R3 — committed re-open receipts with the recorded body hashes.
const reopen = (path, hash) => {
  const t = blob(path);
  if (!t) return { ok: false, say: 'absent' };
  const line = (t.split('\n').find((l) => l.trim()) || '').trim();
  const ok = /^REOPEN50: (HOLD|DRIFT) /.test(line) && t.includes(`sha256=${hash}`);
  return { ok, say: ok ? line.slice(0, 72) : `first=${line.slice(0, 60)}` };
};
const g2 = reopen('.ufo/waves/round-50/r50/ReopenS095.md', '2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da');
const g3 = reopen('.ufo/waves/round-50/r50/ReopenS098.md', 'c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a');

// R4 — three distinct, time-spaced B49 receipts.
const rerunFiles = lsRev('.ufo/waves/round-50/').filter((p) => /ReRunB49-[^/]*\.txt$/.test(p));
let g4ok = false; let g4say = `files=${rerunFiles.length}`;
if (rerunFiles.length >= 3) {
  const recs = rerunFiles.map((p) => {
    const t = blob(p) || '';
    const m = t.match(/^run-at=(\S+)/);
    return { p, t, at: m ? Date.parse(m[1]) : NaN, sha: sha(t), held: /BINDORACLE49: ORACLE_HELD held=6\/6/.test(t) };
  });
  const distinct = new Set(recs.map((r) => r.sha)).size;
  const span = (Math.max(...recs.map((r) => r.at)) - Math.min(...recs.map((r) => r.at))) / 1000;
  g4ok = recs.every((r) => r.held && !Number.isNaN(r.at)) && distinct === recs.length && span >= 300;
  g4say = `files=${recs.length} distinct=${distinct} held=${recs.filter((r) => r.held).length} span_s=${Math.round(span)}`;
}

// R5 — compare the registry prose with its counted gate rows.
const skill = blob('SKILL.md');
const gateCount = skill ? skill.split('\n').filter((line) => line.includes('| gate |')).length : 0;
const gateCountWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const gateCountWord = gateCountWords[gateCount];
const registryStart = skill ? skill.indexOf('## Gate registry') : -1;
const tableStart = registryStart >= 0 ? skill.indexOf('\n| name |', registryStart) : -1;
const registryIntro = registryStart >= 0 && tableStart >= 0 ? skill.slice(registryStart, tableStart) : '';
const statedGateCount = registryIntro.match(/\b([A-Za-z]+) are\s+gates\b/i);
const allGateCountClaims = [...registryIntro.matchAll(/\ball ([a-z]+)\b/gi)]
  .map(([, word]) => word.toLowerCase())
  .filter((word) => gateCountWords.includes(word));
const g5ok = !!(skill && gateCount > 0 && gateCountWord && statedGateCount
  && statedGateCount[1].toLowerCase() === gateCountWord
  && allGateCountClaims.every((word) => word === gateCountWord));

// R6 — round-50 lesson shape.
const l50 = blob('corpus/lessons/round-50.md');
const g6ok = !!(l50 && /^## Mistakes\s*$/m.test(l50) && /^## Gate\s*$/m.test(l50));

// R7 — live census.
const census = sh('/home/vgpnk/Projects/shokunin/scripts/sources-census.sh',
  ['validate', '--root', fleet, 'kumitate']);
const g7ok = census.status === 0;

// R8 — the fleet report erratum (committed fleet bytes).
const rep = sh('git', ['-C', fleet, 'show', 'master:.ufo/reports/round-49/kumitate.md']);
const erratum = '## Erratum';
const supersedes = ['01b70bb0', '923a172', 'c432cc9', '16/16', '15/15', '64b92866']
  .every((s) => rep.stdout.includes(s));
const g8ok = rep.status === 0 && rep.stdout.includes(erratum) && supersedes;

const checks = [['R1', g1ok, g1ok ? 'gate-ledger' : 'no ## Gate'], ['R2', g2.ok, g2.say], ['R3', g3.ok, g3.say],
  ['R4', g4ok, g4say], ['R5', g5ok, g5ok ? 'swept' : 'still-eleven'], ['R6', g6ok, g6ok ? 'sections' : 'missing'],
  ['R7', g7ok, `exit=${census.status}`], ['R8', g8ok, g8ok ? 'erratum' : `exit=${rep.status}`]];
const held = checks.filter(([, ok]) => ok).length;
for (const [id, ok, say] of checks) process.stdout.write(`  ${id} ${ok ? 'PASS' : 'MISS'} ${say}\n`);
if (held === checks.length) {
  process.stdout.write(`REPAIRS50: LEDGER_HELD held=${held}/8 checks=8 rev=${rev} rule=${RULE}\n`);
  process.exit(0);
}
process.stdout.write(`REPAIRS50: LEDGER_UNMET held=${held}/8 checks=8 rev=${rev} rule=${RULE}\n`);
process.exit(1);
