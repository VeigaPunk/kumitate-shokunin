#!/usr/bin/env node
// K70ProbeOutputParent — isolated edge probe: missing output parent / nonexistent work root
// must fail safely against the round-70 replay implementation contract.
//
// Production candidate scripts/control-replay.mjs is NOT present in this lane checkout
// (L1-integrated later), so this probe runs a SYNTHETIC mechanism reproduction: a private
// copy of the contract-conformant mock candidate (candidate-mock/control-replay.mjs) bound
// to this seat's own synthetic pinned-source fixture lane built inside this seat's scratch.
// Findings are mechanism-only, NOT candidate verification.
//
// Contract edges under test (plan.md "Implementation contract"):
//   --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR
//   * unique mkdtemp child under the supplied work root
//   * receipts copied out before cleanup; output creation exclusive
// Safe-fail criteria (derived): nonzero exit, no lane writes, no stray/partial artifacts
// outside the supplied work root, supplied pre-existing dirs unchanged in content.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const CANDIDATE = path.join(HERE, 'candidate-mock', 'control-replay.mjs');
const FIXTURE_SRC = path.join(HERE, 'fixture-src');
const RECEIPTS = path.join(HERE, 'receipts');
const SCRATCH = path.join(process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku', 'kumitate-r70', 'K70ProbeOutputParent', 'run');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const log = [];
const say = m => { log.push(m); process.stdout.write(m + '\n'); };

const git = (cwd, ...a) => spawnSync('git', ['-C', cwd, ...a], {encoding: 'utf8'});
const scrubbedEnv = extra => {
  const env = {...process.env, ...extra};
  for (const k of Object.keys(env)) if (/^GIT_/.test(k)) delete env[k];
  return env;
};
const runCandidate = (args, extraEnv = {}) =>
  spawnSync(process.execPath, [CANDIDATE, ...args], {env: scrubbedEnv(extraEnv), encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024});
const treeHashes = dir => {
  const out = {};
  const walk = d => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      const rel = path.relative(dir, p);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else out[rel] = sha(fs.readFileSync(p));
    }
  };
  walk(dir);
  return out;
};

say('# K70ProbeOutputParent edge probe — missing output parent / nonexistent work root');
say(`node=${process.version} candidate=${CANDIDATE}`);
say(`scratch=${SCRATCH}`);

// --- real lane snapshot (read-only; never executed, never written) ---
const laneProbeDir = path.join(LANE, '.ufo/waves/round-69/probe');
const laneBefore = {
  'c1-controls.sh': sha(fs.readFileSync(path.join(laneProbeDir, 'c1-controls.sh'))),
  'c2-controls.sh': sha(fs.readFileSync(path.join(laneProbeDir, 'c2-controls.sh'))),
  controls: treeHashes(path.join(LANE, '.ufo/waves/round-69/controls')),
};
say(`lane-before c1=${laneBefore['c1-controls.sh'].slice(0, 12)} c2=${laneBefore['c2-controls.sh'].slice(0, 12)} controls=${Object.keys(laneBefore.controls).length}`);

// --- fixture lane (synthetic pinned-source; git writes confined to scratch) ---
fs.rmSync(SCRATCH, {recursive: true, force: true});
fs.mkdirSync(SCRATCH, {recursive: true});
const FX = path.join(SCRATCH, 'fixture-lane');
fs.mkdirSync(path.join(FX, '.ufo/waves/round-69/probe'), {recursive: true});
fs.mkdirSync(path.join(FX, '.ufo/waves/round-69/controls'), {recursive: true});
for (const f of ['c1-controls.sh', 'c2-controls.sh'])
  fs.copyFileSync(path.join(FIXTURE_SRC, f), path.join(FX, '.ufo/waves/round-69/probe', f));
const seeded = {};
for (const f of ['c1-donothing.txt', 'c1-autoledger.txt', 'c2-donothing.txt', 'c2-autoorigin.txt', 'c2-forgecapture.txt']) {
  const text = `SYNTHETIC seeded receipt ${f} (digest-preservation sentinel)\n`;
  fs.writeFileSync(path.join(FX, '.ufo/waves/round-69/controls', f), text);
  seeded[f] = sha(Buffer.from(text));
}
fs.writeFileSync(path.join(FX, 'SKILL.md'), '# synthetic fixture lane\n');
let g = git(FX, 'init', '-q'); if (g.status !== 0) throw Error('git init: ' + g.stderr);
const top = git(FX, 'rev-parse', '--show-toplevel').stdout.trim();
if (top !== fs.realpathSync(FX)) throw Error(`fixture toplevel ${top} != ${fs.realpathSync(FX)}`);
say(`fixture-lane toplevel verified: ${top}`);
g = git(FX, '-c', 'user.name=probe', '-c', 'user.email=probe@invalid', '-c', 'commit.gpgsign=false', 'add', '-A'); if (g.status !== 0) throw Error('git add: ' + g.stderr);
g = git(FX, '-c', 'user.name=probe', '-c', 'user.email=probe@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'K70ProbeOutputParent synthetic fixture'); if (g.status !== 0) throw Error('git commit: ' + g.stderr);
const fixtureHead = git(FX, 'rev-parse', 'HEAD').stdout.trim();
say(`fixture-lane head=${fixtureHead}`);
const controlsBefore = treeHashes(path.join(FX, '.ufo/waves/round-69/controls'));

const results = [];
const record = (id, expectation, observed, pass) => { results.push({id, expectation, observed, pass: !!pass}); say(`${pass ? 'PASS' : 'FAIL'} ${id} expect=${expectation} observed=${observed}`); };

// ---------- Case A: --out whose parent directory does not exist ----------
say('\n## Case A: missing output parent');
{
  const work = path.join(SCRATCH, 'A', 'work'); fs.mkdirSync(work, {recursive: true});
  const out = path.join(SCRATCH, 'A', 'no-parent', 'result.txt');
  const r = runCandidate(['--lane', FX, '--family', 'c1', '--mode', 'donothing', '--out', out, '--work', work]);
  record('A.exit-nonzero', 'exit!=0 (refusal)', `exit=${r.status}`, r.status !== 0);
  record('A.no-out-created', 'no out file anywhere under missing parent', `exists=${fs.existsSync(out)} parentExists=${fs.existsSync(path.dirname(out))}`, !fs.existsSync(out) && !fs.existsSync(path.dirname(out)));
  record('A.no-work-child', 'no scratch child created under supplied work root', `workEntries=${JSON.stringify(fs.readdirSync(work))}`, fs.readdirSync(work).length === 0);
  record('A.stderr-reason', 'refusal reason on stderr', JSON.stringify((r.stderr || '').trim().split('\n')[0] || ''), /cannot create out|ENOENT/.test(r.stderr || ''));
}

// ---------- Case B: --work root does not exist ----------
say('\n## Case B: nonexistent work root');
{
  const workRoot = path.join(SCRATCH, 'B', 'newroot');
  const out = path.join(SCRATCH, 'B', 'result.txt');
  fs.mkdirSync(path.dirname(out), {recursive: true});
  const r = runCandidate(['--lane', FX, '--family', 'c2', '--mode', 'donothing', '--out', out, '--work', workRoot], {MOCK_KEEP_PRIVATE: '1'});
  const text = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  record('B.exit-zero', 'exit=0 with CONTROL-PASS receipt copied out', `exit=${r.status}`, r.status === 0);
  record('B.receipt-content', 'out carries DEPREC69_UNMET + CONTROL-PASS donothing', `len=${text.length}`, text.includes('DEPREC69_UNMET') && text.includes('CONTROL-PASS donothing'));
  record('B.workroot-autocreated', 'supplied work root auto-created', `exists=${fs.existsSync(workRoot)}`, fs.existsSync(workRoot));
  const entries = fs.existsSync(workRoot) ? fs.readdirSync(workRoot) : [];
  record('B.single-child-kept', 'exactly one unique child kept (MOCK_KEEP_PRIVATE)', JSON.stringify(entries), entries.length === 1);
  if (entries.length === 1) {
    const child = path.join(workRoot, entries[0]);
    const fxRepo = path.join(child, 's', 'fx');
    const tl = git(fxRepo, 'rev-parse', '--show-toplevel');
    record('B.fixture-toplevel', 'private fixture repo toplevel inside child', `toplevel=${(tl.stdout || '').trim()}`, (tl.stdout || '').trim() === fs.realpathSync(fxRepo));
    const st = git(FX, 'status', '--porcelain');
    record('B.fixture-clean', 'fixture lane untouched by candidate run', `status=${JSON.stringify(st.stdout)}`, st.stdout.trim() === '');
    fs.rmSync(child, {recursive: true, force: true});
  }
  record('B.workroot-empty-after-cleanup', 'work root empty once child removed', `entries=${JSON.stringify(fs.existsSync(workRoot) ? fs.readdirSync(workRoot) : null)}`, fs.existsSync(workRoot) && fs.readdirSync(workRoot).length === 0);
}

// ---------- Case C: --work root path blocked by a regular file (ENOTDIR) ----------
say('\n## Case C: work root under a file component (ENOTDIR)');
{
  const cdir = path.join(SCRATCH, 'C'); fs.mkdirSync(cdir, {recursive: true});
  const blocker = path.join(cdir, 'blocker');
  fs.writeFileSync(blocker, 'not a directory\n');
  const workRoot = path.join(blocker, 'sub');
  const out = path.join(cdir, 'result.txt');
  const r = runCandidate(['--lane', FX, '--family', 'c2', '--mode', 'donothing', '--out', out, '--work', workRoot]);
  const outSize = fs.existsSync(out) ? fs.statSync(out).size : null;
  record('C.exit-nonzero', 'exit!=0 (refusal)', `exit=${r.status}`, r.status !== 0);
  record('C.no-work-created', 'nothing created under the file component', `workExists=${fs.existsSync(workRoot)}`, !fs.existsSync(workRoot));
  record('C.partial-out-leak', 'no partial/empty out artifact survives a crash after exclusive create', `outExists=${fs.existsSync(out)} size=${outSize}`, !fs.existsSync(out) || outSize > 0);
  record('C.stderr-reason', 'failure surfaced on stderr', JSON.stringify((r.stderr || '').trim().split('\n').slice(0, 2).join(' | ')), (r.stderr || '').length > 0);
}

// ---------- post conditions ----------
const controlsAfter = treeHashes(path.join(FX, '.ufo/waves/round-69/controls'));
const preserved = Object.keys(controlsBefore).every(k => controlsBefore[k] === controlsAfter[k]);
record('X.fixture-receipts-preserved', 'fixture seeded receipt digests unchanged', `before=${Object.keys(controlsBefore).length} after=${Object.keys(controlsAfter).length}`, preserved);
const laneAfter = {
  'c1-controls.sh': sha(fs.readFileSync(path.join(laneProbeDir, 'c1-controls.sh'))),
  'c2-controls.sh': sha(fs.readFileSync(path.join(laneProbeDir, 'c2-controls.sh'))),
  controls: treeHashes(path.join(LANE, '.ufo/waves/round-69/controls')),
};
const laneUnchanged = laneBefore['c1-controls.sh'] === laneAfter['c1-controls.sh'] &&
  laneBefore['c2-controls.sh'] === laneAfter['c2-controls.sh'] &&
  JSON.stringify(laneBefore.controls) === JSON.stringify(laneAfter.controls);
record('X.real-lane-untouched', 'real lane frozen scripts + receipts byte-identical', `unchanged=${laneUnchanged}`, laneUnchanged);

// ---------- receipts ----------
fs.mkdirSync(RECEIPTS, {recursive: true});
fs.writeFileSync(path.join(RECEIPTS, 'probe-results.json'), JSON.stringify({
  seat: 'K70ProbeOutputParent', kind: 'mechanism-only (synthetic reproduction; no production candidate in lane)',
  node: process.version, fixtureHead, laneBefore, laneAfter, results,
}, null, 2) + '\n');
fs.writeFileSync(path.join(RECEIPTS, 'probe.log'), log.join('\n') + '\n');
say(`\nreceipts written under ${RECEIPTS}`);

// ---------- scratch cleanup (seat rule: cleanup before yield) ----------
fs.rmSync(SCRATCH, {recursive: true, force: true});
say(`scratch cleaned: ${SCRATCH} exists=${fs.existsSync(SCRATCH)}`);
const failed = results.filter(r => !r.pass);
say(`SUMMARY ${results.length - failed.length}/${results.length} checks pass`);
process.exitCode = failed.length === 0 ? 0 : 1;
