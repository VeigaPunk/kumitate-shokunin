#!/usr/bin/env node
/**
 * attest51-probe.mjs — FROZEN counter for kumitate round 51, claim C1 (rule `A51`).
 *
 *   node .ufo/waves/round-51/probe/attest51-probe.mjs <lane> <rev>
 *
 * Scores five checks over the committed bytes of <rev> (extracted with `git archive`,
 * never the working tree):
 *   A1  scripts/receipt-attest.mjs exists at rev and `node scripts/receipt-attest.mjs
 *       --selftest` exits 0 with final line `ATTEST_SELFTEST: PASS`.
 *   A2  the three committed receipts .ufo/waves/round-51/receipts/attest-run-{1,2,3}.txt
 *       (+ .sha256 sidecars) each verify `RECEIPT: VALID` exit 0; embedded nonces pairwise
 *       distinct; file sha256 pairwise distinct; max(run-at) - min(run-at) >= 300 s from
 *       the `run-at:` prelude lines.
 *   A3  the committed doctored control attest-run-2-replayed.txt (run-2's receipt with
 *       only the `run-at:` prelude rewritten, sidecar untouched — the lesson-M2 forgery)
 *       verifies `RECEIPT: TAMPERED` exit 1.
 *   A4  no nonce reuse: the ledger arm — every pair of the three round-51 receipts passes
 *       `verify --ledger <receipts-dir>`, and each embedded nonce appears in NO prior
 *       receipt corpus file under .ufo/waves/ (round-48/49/50 receipt corpora) at rev (the
 *       sweep prints what it
 *       scanned; zero hits required).
 *   A5  pin.receipt-attest in the SCORECARD.md `kumitate-gate-pins-v1` block equals the
 *       sha256 of the extracted scripts/receipt-attest.mjs, and
 *       `node scripts/proxy-check.mjs --strict` (UFO_SRC = live origin checkout) exits 0
 *       with `PROXY: MATCH`.
 *
 * Predicate ATTEST_HELD = held=5/5, exit 0. Any other reading is `ATTEST_UNMET held=<k>/5`
 * exit 1. A crash, an unreadable extraction or a malformed verdict line is exit 2 (never a
 * score). Frozen at `.ufo/waves/round-51/plan.md` § C1 before any data seat ran.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const RULE = 'A51';
const ORIGIN = '/home/vgpnk/Projects/ufo-fsd-alpha';
const RECEIPTS = ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt'];
const RDIR = '.ufo/waves/round-51/receipts';
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('ATTEST51: USAGE node attest51-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`ATTEST51: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}

const sha = (b) => createHash('sha256').update(b).digest('hex');
const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: 'utf8', timeout: 240_000, maxBuffer: 64 << 20, ...opts });

const T = mkdtempSync(join(tmpdir(), 'a51-probe.'));
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });
try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`ATTEST51: FAIL-CLOSED git archive ${rev} exit=${tar.status}\n`);
    process.exit(2);
  }
  const S = join(T, 'scripts');
  const tool = join(S, 'receipt-attest.mjs');

  // A1
  let a1ok = false; let a1d = '';
  if (existsSync(tool)) {
    const r = sh('node', [tool, '--selftest'], { cwd: T });
    const last = `${r.stderr || ''}${r.stdout || ''}`.trim().split('\n').pop() || '';
    a1ok = r.status === 0 && /ATTEST_SELFTEST: PASS/.test(last);
    a1d = a1ok ? 'selftest PASS' : `exit=${r.status} last=${JSON.stringify(last.slice(0, 120))}`;
  } else {
    a1d = 'scripts/receipt-attest.mjs absent';
  }
  hold('A1', a1ok, a1d);

  const runTool = (args) => sh('node', [tool, ...args], { cwd: T });

  // A2 + A3 + A4(nonce distinctness comes from ledger arm)
  const rd = join(T, RDIR);
  const nonces = []; const runats = []; const fshas = [];
  let a2ok = true; const a2miss = [];
  for (const f of RECEIPTS) {
    const p = join(rd, f);
    const side = `${p}.sha256`;
    if (!existsSync(p) || !existsSync(side)) { a2ok = false; a2miss.push(`${f}:absent`); continue; }
    const v = runTool(['verify', p]);
    const last = `${v.stderr || ''}${v.stdout || ''}`.trim().split('\n').pop() || '';
    if (!(v.status === 0 && /RECEIPT: VALID/.test(last))) { a2ok = false; a2miss.push(`${f}:exit=${v.status} ${last.slice(0, 80)}`); continue; }
    let nonce = null; let runat = null;
    try {
      const jsonLine = readFileSync(p, 'utf8').split('\n').find((l) => l.trimStart().startsWith('{'));
      const j = JSON.parse(jsonLine);
      nonce = j.nonce; runat = j.wall_start || null;
    } catch (e) { a2ok = false; a2miss.push(`${f}:unparseable(${e.message})`); }
    const pre = readFileSync(p, 'utf8').split('\n').find((l) => l.startsWith('run-at:'));
    if (pre) runat = pre.slice('run-at:'.length).trim();
    if (!nonce || !runat) { a2ok = false; a2miss.push(`${f}:nonce/run-at missing`); continue; }
    nonces.push(nonce); runats.push(Date.parse(runat)); fshas.push(sha(readFileSync(p)));
  }
  let span = 0;
  if (runats.length === 3 && runats.every((t) => Number.isFinite(t))) span = (Math.max(...runats) - Math.min(...runats)) / 1000;
  const distinctN = new Set(nonces).size === nonces.length && nonces.length === 3;
  const distinctS = new Set(fshas).size === fshas.length && fshas.length === 3;
  if (a2ok && (!distinctN || !distinctS || span < 300)) {
    a2ok = false;
    if (!distinctN) a2miss.push('nonce-not-distinct');
    if (!distinctS) a2miss.push('sha-not-distinct');
    if (span < 300) a2miss.push(`span=${Math.round(span)}s<300`);
  }
  hold('A2', a2ok, a2ok ? `3 receipts VALID span=${Math.round(span)}s nonces=distinct sha=distinct` : a2miss.join(';'));

  // A3
  let a3ok = false; let a3d = '';
  const rp = join(rd, 'attest-run-2-replayed.txt');
  if (existsSync(tool) && existsSync(rp)) {
    const v = runTool(['verify', rp]);
    const last = `${v.stderr || ''}${v.stdout || ''}`.trim().split('\n').pop() || '';
    a3ok = v.status === 1 && /RECEIPT: TAMPERED/.test(last);
    a3d = a3ok ? 'prelude-replay rejected' : `exit=${v.status} last=${JSON.stringify(last.slice(0, 120))}`;
  } else a3d = 'attest-run-2-replayed.txt absent';
  hold('A3', a3ok, a3d);

  // A4
  let a4ok = true; const a4d = [];
  if (existsSync(tool) && existsSync(rd)) {
    for (const f of RECEIPTS) {
      const p = join(rd, f);
      if (!existsSync(p)) { a4ok = false; a4d.push(`${f}:absent`); continue; }
      const v = runTool(['verify', '--ledger', rd, p]);
      const last = `${v.stderr || ''}${v.stdout || ''}`.trim().split('\n').pop() || '';
      if (!(v.status === 0 && /RECEIPT: VALID/.test(last))) { a4ok = false; a4d.push(`${f}:ledger exit=${v.status} ${last.slice(0, 80)}`); }
    }
    // prior-corpus sweep: no new nonce appears in any round-4*/5* receipt-like file
    const prior = [];
    const waves = join(T, '.ufo', 'waves');
    if (existsSync(waves)) {
      const walk = (d) => {
        for (const n of readdirSync(d)) {
          const p = join(d, n);
          let st;
          try { st = statSync(p); } catch { continue; }
          if (st.isDirectory()) { if (!/round-51$/.test(n)) walk(p); continue; }
          if (/receipt|ReRun|L1-score/i.test(n)) prior.push(p);
        }
      };
      walk(waves);
    }
    let hits = 0;
    for (const pp of prior) {
      let txt = '';
      try { txt = readFileSync(pp, 'utf8'); } catch { continue; }
      for (const n of nonces) if (n && txt.includes(n)) hits += 1;
    }
    if (hits > 0) { a4ok = false; a4d.push(`nonce-reuse-in-prior hits=${hits}`); }
    a4d.push(`prior-files=${prior.length}`);
  } else { a4ok = false; a4d.push('tool or receipts dir absent'); }
  hold('A4', a4ok, a4d.join(';'));

  // A5
  let a5ok = false; const a5d = [];
  const sc = join(T, 'SCORECARD.md');
  if (existsSync(tool) && existsSync(sc)) {
    const m = /pin\.receipt-attest=([0-9a-f]{64})/.exec(readFileSync(sc, 'utf8'));
    if (!m) a5d.push('pin.receipt-attest absent');
    else if (m[1] !== sha(readFileSync(tool))) a5d.push(`pin ${m[1].slice(0, 8)}!=${sha(readFileSync(tool)).slice(0, 8)}`);
    else a5d.push('pin match');
    const pr = sh('node', [join(S, 'proxy-check.mjs'), '--strict'], { cwd: T, env: { ...process.env, UFO_SRC: ORIGIN } });
    const last = `${pr.stderr || ''}${pr.stdout || ''}`.trim().split('\n').pop() || '';
    if (!(pr.status === 0 && /PROXY: MATCH/.test(last))) { a5ok = false; a5d.push(`proxy exit=${pr.status} ${last.slice(0, 100)}`); }
    else a5d.push('proxy MATCH');
    a5ok = a5d.length === 2 && a5d[0] === 'pin match' && /proxy MATCH/.test(a5d[1]);
  } else a5d.push('tool or SCORECARD absent');
  hold('A5', a5ok, a5d.join(';'));
} catch (e) {
  process.stderr.write(`ATTEST51: FAIL-CLOSED ${e.stack || e}\n`);
  process.exit(2);
} finally {
  try { rmSync(T, { recursive: true, force: true }); } catch {}
}

const held = checks.filter((c) => c.ok).length;
const label = held === checks.length ? 'ATTEST_HELD' : 'ATTEST_UNMET';
process.stdout.write(`ATTEST51: ${label} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} | ${checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail.slice(0, 90)}`}`).join(' | ')}\n`);
process.exit(held === checks.length ? 0 : 1);
