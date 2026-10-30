#!/usr/bin/env node
// r9-existing-output-attack.mjs — K70AttackOutputExisting isolated counterexample.
//
// Attacks the frozen replay70-probe.mjs R9 contract edge:
//   "existing regular output file must remain byte-exact; refuse before fixture work."
//
// R9 frozen assertion (replicated verbatim semantics from the pinned probe
// sha256 63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1):
//   existing = root/existing.txt  (bytes 'do-not-overwrite\n')
//   collision = run(['--lane',lane,'--family','c1','--mode','donothing','--out',existing,'--work',root])
//   R9 ok  <=>  collision.status !== 0  &&  readFileSync(existing,'utf8') === 'do-not-overwrite\n'
//
// The harness builds a fresh sandbox per mock that mirrors the real probe root at R9
// time (tree/, result-0.txt, work-0/ decoys), runs one mock candidate, applies the
// frozen assertion, and ALSO records what the frozen probe never inspects:
// side effects (git fixture calls, mkdtemp children, stray writes, decoy loss).
// No original control is executed; mocks are self-contained. No lane/fleet writes.

import fs from 'node:fs';
import path from 'node:path';

const SCRATCH = '/fast/scratch/hyaku/kumitate-r70/K70AttackOutputExisting';
const VICTIM_BYTES = 'do-not-overwrite\n';

function makeSandbox() {
  const root = fs.mkdtempSync(path.join(SCRATCH, 'sandbox-'));
  // decoys mirroring the real probe tmp root at the moment R9 runs
  fs.mkdirSync(path.join(root, 'tree', '.ufo', 'waves'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tree', 'SKILL.md'), '# skill\n');
  fs.writeFileSync(path.join(root, 'result-0.txt'), 'LEDGER69_UNMET held=2/10\n');
  fs.mkdirSync(path.join(root, 'work-0'));
  const existing = path.join(root, 'existing.txt');
  fs.writeFileSync(existing, VICTIM_BYTES);
  return { root, existing };
}

function snapshot(root) {
  const out = [];
  (function walk(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) { out.push(r + '/'); walk(p, r); }
      else if (e.isSymbolicLink()) out.push(r + ' -> ' + fs.readlinkSync(p));
      else out.push(r);
    }
  })(root, '');
  return out.sort();
}

function frozenR9(existing, status) {
  let content = null, readErr = null;
  try { content = fs.readFileSync(existing, 'utf8'); }
  catch (e) { readErr = e.code; }
  // exact probe semantics; a thrown read maps to the probe's outer catch (REPLAY70_ERROR)
  const ok = readErr === null && status !== 0 && content === VICTIM_BYTES;
  return { ok, readErr, content };
}

// ---- mock candidates ------------------------------------------------------
// Each returns { status } and may mutate the sandbox; side effects are recorded
// on `fx` by the harness wrapper.

// M0 reference-compliant: refuse BEFORE any fixture work.
function m0_compliant_early_refuse({ existing, fx }) {
  fx.phase('arg-parse');
  if (fs.existsSync(existing)) {
    fx.note('refused on existing output before any fixture work');
    return { status: 1 };
  }
  fx.note('BUG: harness expected existing output');
  return { status: 99 };
}

// M1 classic overwrite: no exclusive create -> truncate + write, exit 0.
function m1_truncate_write({ existing, fx }) {
  fx.phase('arg-parse');
  fx.phase('fixture-work'); fx.gitCall(); fx.mkchild();
  fs.writeFileSync(existing, 'RECEIPT CONTROL-PASS donothing\n'); // default flag 'w' truncates
  return { status: 0 };
}

// M2 fixture-work-then-refuse: all fixture work first, refuse only at the end.
function m2_work_then_refuse({ existing, root, fx }) {
  fx.phase('arg-parse');
  fx.phase('git-archive-lane'); fx.gitCall();
  const child = fx.mkchild();
  fx.phase('run-private-control-copy');
  fs.writeFileSync(path.join(child, 'staged-receipt.txt'), 'LEDGER69_UNMET\nCONTROL-PASS donothing\n');
  fs.writeFileSync(path.join(root, 'residue.marker'), 'left behind: fixture work ran before refusal\n');
  fx.phase('copy-out');
  if (fs.existsSync(existing)) {
    fx.note('refused AFTER fixture work (ordering violation, outcome intact)');
    return { status: 1 };
  }
  fs.writeFileSync(existing, 'RECEIPT\n');
  return { status: 0 };
}

// M3 work-root wipe: cleanup empties the SUPPLIED work root instead of its own child.
function m3_wipe_work_root({ existing, root, fx }) {
  fx.phase('arg-parse');
  const child = fx.mkchild();
  fs.writeFileSync(path.join(child, 'tmp.txt'), 'x');
  fx.phase('refuse');
  if (fs.existsSync(existing)) {
    // buggy cleanup: treats supplied work root as its own temp dir
    for (const e of fs.readdirSync(root)) fs.rmSync(path.join(root, e), { recursive: true, force: true });
    fx.note('refused exit 1 but wiped the supplied work root (victim inside)');
    return { status: 1 };
  }
  return { status: 0 };
}

// M4 refuses but exits 0.
function m4_exit0_refuse({ existing, fx }) {
  fx.phase('arg-parse');
  if (fs.existsSync(existing)) {
    fx.note('printed refusal to stdout but exited 0');
    return { status: 0 };
  }
  return { status: 0 };
}

// M5 TOCTOU: existsSync check, then non-exclusive create after an interleave.
async function m5_toctou({ existing, fx, racer }) {
  fx.phase('arg-parse');
  if (!fs.existsSync(existing)) {
    await racer(); // attacker lands the victim file here
    fs.writeFileSync(existing, 'RECEIPT\n'); // 'w' truncates victim
    return { status: 0 };
  }
  return { status: 1 };
}

// M5b same TOCTOU window but exclusive create ('wx') — the contract-required defense.
async function m5b_toctou_excl({ existing, fx, racer }) {
  fx.phase('arg-parse');
  if (!fs.existsSync(existing)) {
    await racer();
    try { fs.writeFileSync(existing, 'RECEIPT\n', { flag: 'wx' }); }
    catch (e) {
      fx.note('exclusive create raced: ' + e.code + ' -> refuse');
      return { status: 1 };
    }
    return { status: 0 };
  }
  return { status: 1 };
}

// ---- harness ---------------------------------------------------------------
const results = [];

async function runMock(name, mock, { racer } = {}) {
  const { root, existing } = makeSandbox();
  const before = snapshot(root);
  const fxState = { gitCalls: 0, children: [], phases: [], notes: [], writes: [] };
  const fx = {
    phase: (p) => fxState.phases.push(p),
    gitCall: () => { fxState.gitCalls++; },
    mkchild: () => {
      const c = fs.mkdtempSync(path.join(root, 'workchild-'));
      fxState.children.push(path.basename(c));
      return c;
    },
    note: (n) => fxState.notes.push(n),
  };
  let status, err = null;
  try {
    const r = await mock({ existing, root, fx, racer });
    status = r.status;
  } catch (e) { err = e; status = -1; }
  const after = fs.existsSync(root) ? snapshot(root) : ['<root deleted>'];
  const r9 = frozenR9(existing, status);
  const destroyed = before.filter((e) => !after.includes(e));
  const created = after.filter((e) => !before.includes(e));
  results.push({
    mock: name,
    exit: status,
    frozenR9: r9.ok ? 'PASS' : 'MISS',
    readErr: r9.readErr,
    victimContentAfter: r9.content === null ? null : JSON.stringify(r9.content),
    gitFixtureCalls: fxState.gitCalls,
    phases: fxState.phases.join(' -> '),
    createdEntries: created,
    destroyedEntries: destroyed,
    notes: fxState.notes,
    harnessErr: err ? String(err) : null,
  });
  fs.rmSync(root, { recursive: true, force: true });
}

await runMock('M0 compliant: refuse before fixture work', m0_compliant_early_refuse);
await runMock('M1 overwrite (no exclusive create)', m1_truncate_write);
await runMock('M2 fixture-work-then-refuse (ordering violation)', m2_work_then_refuse);
await runMock('M3 refuse but wipe supplied work root', m3_wipe_work_root);
await runMock('M4 refuse with exit 0', m4_exit0_refuse);
await runMock('M5 TOCTOU check-then-create (flag w)', m5_toctou, {
  racer: async () => { /* attacker never lands: victim pre-exists in R9 */ },
});
// Deterministic race demonstration: victim does NOT exist at check time; attacker
// creates it inside the window; then the candidate creates with 'w' vs 'wx'.
async function raceDemo(createFlag) {
  const { root, existing } = makeSandbox();
  fs.rmSync(existing); // victim absent at check time — the TOCTOU window
  let landed = false;
  const racer = async () => {
    // land the victim file inside the check->create window
    fs.writeFileSync(existing, VICTIM_BYTES);
    fs.writeFileSync(path.join(root, 'attacker-landed.marker'), 'y');
    landed = true;
  };
  const fxState = { gitCalls: 0, children: [], phases: [], notes: [] };
  const fx = {
    phase: (p) => fxState.phases.push(p),
    gitCall: () => { fxState.gitCalls++; },
    mkchild: () => { const c = fs.mkdtempSync(path.join(root, 'workchild-')); fxState.children.push(path.basename(c)); return c; },
    note: (n) => fxState.notes.push(n),
  };
  let status;
  if (!fs.existsSync(existing)) {
    await racer();
    try {
      if (createFlag === 'wx') fs.writeFileSync(existing, 'RECEIPT\n', { flag: 'wx' });
      else fs.writeFileSync(existing, 'RECEIPT\n');
      status = 0;
    } catch (e) { fx.note('create failed: ' + e.code); status = 1; }
  } else status = 1;
  const content = fs.existsSync(existing) ? fs.readFileSync(existing, 'utf8') : null;
  results.push({
    mock: createFlag === 'wx' ? 'M5b race with exclusive create (wx)' : 'M5a race with plain create (w)',
    exit: status,
    frozenR9: status !== 0 && content === VICTIM_BYTES ? 'PASS' : 'MISS',
    readErr: null,
    victimContentAfter: JSON.stringify(content),
    gitFixtureCalls: fxState.gitCalls,
    phases: 'check -> racer -> create(' + createFlag + ')',
    createdEntries: ['attacker-landed.marker'],
    destroyedEntries: [],
    notes: fxState.notes.concat(['attacker landed victim in window: ' + landed]),
    harnessErr: null,
  });
  fs.rmSync(root, { recursive: true, force: true });
}
await raceDemo('w');
await raceDemo('wx');

console.log(JSON.stringify(results, null, 2));
const misses = results.filter((r) => r.frozenR9 === 'MISS').map((r) => r.mock);
const passed = results.filter((r) => r.frozenR9 === 'PASS').map((r) => r.mock);
console.log('SUMMARY frozenR9=PASS:', JSON.stringify(passed));
console.log('SUMMARY frozenR9=MISS:', JSON.stringify(misses));
