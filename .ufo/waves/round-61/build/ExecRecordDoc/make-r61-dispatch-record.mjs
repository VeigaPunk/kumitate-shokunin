#!/usr/bin/env node
// make-r61-dispatch-record.mjs — assemble the kumitate-dispatch-evidence-v1 record
// for one wave from settled seat results.
//
//   node make-r61-dispatch-record.mjs <results.json> <waveDir> [--start EPOCH] [--end EPOCH]
//
// results.json: either a bare array or {members:[...]} (ufo-swarm-results-v1 shape),
// each row {name, status?, agentId?, exit?, pid?, err?, start?, end?}.
// Writes <waveDir>/launcher-progress.tsv and <waveDir>/dispatch-actual.json.
// Exit 0 written · 1 input refused (names do not match the dispatch plan) · 64 usage.
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const [resultsPath, waveDir] = positional;
if (!resultsPath || !waveDir) {
  console.error('usage: make-r61-dispatch-record.mjs <results.json> <waveDir> [--start EPOCH] [--end EPOCH]');
  process.exit(64);
}
const START = flag('--start', '');
const END = flag('--end', '');

// status -> exit. Only the 0/nonzero distinction is contractual (dispatch-evidence.mjs
// classifies dead as exit !== 0 || !session); the numbers are documentary, matching the
// round-59/60 records (launcher.py.txt: timeout -> 124, killed -> -9).
const EXIT = { completed: 0, failed: 1, timeout: 124, cancelled: -9, canceled: -9, aborted: -9 };

const oneLine = (v) => String(v ?? '').replace(/[\t\r\n]+/g, ' | ').slice(0, 400);

const raw = JSON.parse(readFileSync(resultsPath, 'utf8'));
const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.members) ? raw.members : null;
if (!rows || rows.length === 0) {
  console.error('results must be a non-empty array or {members:[...]}');
  process.exit(64);
}

// The dispatch plan is the name authority: one row per dispatched seat, no extras.
const registryPath = join(waveDir, 'swarm-registry.json');
const registry = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : null;
const planned = registry && registry.members && !Array.isArray(registry.members)
  ? registry.members
  : null;

const seen = new Set();
for (const r of rows) {
  if (!r || typeof r.name !== 'string' || !r.name) {
    console.error(`row without a name: ${JSON.stringify(r)}`);
    process.exit(1);
  }
  if (seen.has(r.name)) {
    console.error(`duplicate row for ${r.name}: one row per seat, or seats=N drifts`);
    process.exit(1);
  }
  seen.add(r.name);
}
if (planned) {
  const missing = Object.keys(planned).filter((n) => !seen.has(n));
  const extra = [...seen].filter((n) => !(n in planned));
  if (missing.length || extra.length) {
    console.error(`seat set != dispatch plan: missing=${missing.join(',') || '-'} extra=${extra.join(',') || '-'}`);
    process.exit(1);
  }
}

const tsv = [];
const members = [];
for (const r of rows) {
  const status = typeof r.status === 'string' ? r.status : (r.exit === 0 ? 'completed' : 'failed');
  if (!(status in EXIT)) {
    console.error(`row ${r.name} has status ${JSON.stringify(status)}; expected one of ${Object.keys(EXIT).join('|')}`);
    process.exit(1);
  }
  const exit = Number.isInteger(r.exit) ? r.exit : EXIT[status];
  const agentId = typeof r.agentId === 'string' && r.agentId !== '' && r.agentId !== 'null' ? r.agentId : null;
  const start = Number.isInteger(r.start) ? String(r.start) : START;
  const end = Number.isInteger(r.end) ? String(r.end) : END;
  const plan = planned ? planned[r.name] ?? {} : {};
  tsv.push(`${r.name}\tpid=${r.pid ?? '-'}\tsession=${agentId ?? 'null'}\texit=${exit}\tstart=${start}\tend=${end}\terr=${oneLine(r.err)}`);
  members.push({
    name: r.name,
    role: r.role ?? plan.role ?? 'executor',
    kind: plan.kind ?? 'spawn',
    agentId,
    exit,
    pid: r.pid ?? '-',
  });
}

let sessionIds = 0;
let exit0 = 0;
let reports = 0;
const dead = [];
for (const m of members) {
  if (m.agentId) sessionIds += 1;
  if (m.exit === 0) exit0 += 1;
  const reportPath = join(waveDir, `${m.name}.md`);
  let hasReport = false;
  try { hasReport = statSync(reportPath).size > 0; } catch { hasReport = false; }
  if (hasReport) reports += 1;
  if (m.exit !== 0 || !m.agentId) dead.push(m.name);
}

const actual = {
  schema: 'kumitate-r61-dispatch-actual',
  wave: 'kumitate-r61-w1',
  note: 'Actual settled session ids for round 61 wave w1, assembled from the dispatch results. '
    + 'members is an ARRAY (dispatch-evidence.mjs reads registry.members with Array.isArray); '
    + 'the validator template with null agentIds is not this file. dead is empty because P2 '
    + 'demands dead=0: a failed seat is re-dispatched and its row replaced, never left dead.',
  planned: members.length,
  progressLines: tsv.length,
  sessionIds,
  exit0,
  reports,
  dead,
  members,
};

writeFileSync(join(waveDir, 'launcher-progress.tsv'), `${tsv.join('\n')}\n`);
writeFileSync(join(waveDir, 'dispatch-actual.json'), `${JSON.stringify(actual, null, 1)}\n`);
console.log(`WROTE planned=${actual.planned} sessionIds=${sessionIds} exit0=${exit0} reports=${reports} dead=${dead.join(',') || 'none'}`);
console.log(`NEXT node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 61 --wave w1`);
