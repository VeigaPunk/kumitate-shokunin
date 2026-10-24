#!/usr/bin/env node
/**
 * attest58-probe.mjs — FROZEN counter for kumitate round 58, claim C1 (rule `A58`), v1.
 *
 *   node .ufo/waves/round-58/probe/attest58-probe.mjs <lane> <rev>
 *
 * Counter for the operability capability `receipt-evidence` (contract
 * `kumitate-receipt-evidence-v1`) and the `readme-map` v2 amendment
 * (contract `kumitate-readme-map-v2`) — the round-57 routed-defect repairs:
 *   R57-V1 — the cross-round nonce sweep is dead code unless its pathspecs
 *            descend: git pathspec wildcards match WHOLE paths, not prefixes,
 *            so `git grep … -- '.ufo/waves/round-4[89]'` matches nothing and
 *            a failed scan silently counted as fresh. The repaired sweep uses
 *            descending `:(glob).ufo/waves/round-4[89]/**` +
 *            `:(glob).ufo/waves/round-5[0-7]/**` pathspecs, fails closed on
 *            grep exit >= 2, and proves coverage (the pathspecs resolve to
 *            >=1 file AND >=1 nonce is swept; `--expect-sweep-nonce` then
 *            functionally proves descent).
 *   R57-V2 — a drop-one check mutant must never self-report HELD: the verdict
 *            tail pins the frozen checks count (10), so a mutant prints
 *            `ATTEST58_UNMET held=9/9 … checks-mismatch` exit 1.
 *   R57-V3 — a `covered` entry naming a directory or symlink read CLEAN:
 *            v2 lstats every member; a non-file member is DRIFT
 *            `covered-not-file`, a dangling symlink DRIFT `stale-covered`;
 *            the registry moves to version 2.
 *   R57-V4 — receipts fabricated at commit time passed `verify --ledger` and
 *            scored the old B8 HELD: every receipt now REPRODUCES — its
 *            recorded argv re-runs inside the `git archive` extraction of the
 *            judged rev and must match the recorded exit and stdout/stderr
 *            digests (B3; B4's forged control reads UNMET).
 * Freeze history: v1 is the first version of this rule. Frozen AND executed
 * at base before any data seat ran (base/attest58-base.txt, QUALITY Q43),
 * with a scratch-HELD witness of a synthetic conformant post-state committed
 * at freeze (witness/scratch-held-attest58.txt, lesson M5).
 *
 * Scores ten checks over the committed bytes of <rev> (extracted with
 * `git archive`, never the working tree):
 *   B1   scripts/receipt-evidence.mjs exists at rev; `--selftest` is green
 *        (>= 8 cases, all PASS, `VERDICT: PASS`).
 *   B2   `.ufo/waves/round-58/receipts/attest-run-{1,2,3}.txt` (+ sidecars)
 *        exist; the extraction's own receipt-attest `verify --ledger` reads
 *        `RECEIPT: VALID` for all three; embedded nonces pairwise distinct.
 *   B3   reproduction: `receipt-evidence.mjs verify --lane <lane> --rev <rev>
 *        --receipts <extraction receipts> --min-span-ms 300000
 *        --expect-sweep-nonce <r57 nonce>...` (run from the extraction's own
 *        tool copy) prints `RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 …`
 *        and exits 0 — every receipt re-ran in the extraction matches its
 *        recorded exit and stdout/stderr sha256, no receipt nonce appears in
 *        the descending round-48..57 sweep, and the three committed
 *        round-57 receipt nonces ARE found by it (descent proven).
 *   B4   forged-receipt control (R57-V4): a scratch git repo planted with a
 *        fabricated receipt — self-consistent body+sidecar, argv of
 *        attest-run-1, but a zeroed stdout digest and a nonce reused from the
 *        round-52 corpus — reads `RECEIPT_EVIDENCE: UNMET` exit 1, never
 *        HELD.
 *   B5   fail-closed controls: verify against (a) an unparseable full-hex rev
 *        and (b) a scratch repo whose round-48..57 corpora contain no nonce
 *        bytes (the pinned probes stay, so reproduction still runs) both
 *        exit 2 `RECEIPT_EVIDENCE: FAIL-CLOSED`.
 *   B6   the frozen argv: each receipt body's argv deep-equals the plan's
 *        frozen list, in order — ["node","scripts/readme-map.mjs","--selftest"],
 *        ["node","scripts/receipt-evidence.mjs","--selftest"],
 *        ["node","scripts/counter-pins.mjs"].
 *   B7   the body `wall_start` fields (never the prelude `run-at:`) span
 *        >= 300000 ms across the three receipts.
 *   B8   the drop-one kill is demonstrated and guarded: the committed mutant
 *        transcript (`.ufo/waves/round-58/controls/MutCounter58.txt`) reads
 *        `ATTEST58_UNMET held=9/9 … checks-mismatch`, and this probe's own
 *        source pins `checks.length !== 10` (R57-V2).
 *   B9   SKILL.md: the checklist carries exactly 28 items AND items 24..28
 *        bind 24→counter-pins.mjs, 25→source-capture.mjs, 26→source-dupes.mjs,
 *        27→readme-map.mjs, 28→receipt-evidence.mjs (the R56-V2/R57-2
 *        supersession convention extended).
 *   B10  readme-map v2 + pins: `.ufo/pins/readme-map.json` is version 2; the
 *        extraction's gate reads `README_MAP: CLEAN` with files=rows=covered
 *        (>= 138); its selftest is green with >= 16 cases including
 *        `covered-not-file` and `symlink-stale-covered`; SCORECARD's
 *        `kumitate-gate-pins-v1` block carries `pin.readme-map` ==
 *        sha256(gate at rev) and `pin.receipt-evidence` == sha256(tool at
 *        rev); and `node scripts/proxy-check.mjs --strict` against the
 *        extraction prints `PROXY: MATCH` exit 0.
 *
 * Predicate ATTEST58_HELD = held=10/10, exit 0. Any other reading is
 * `ATTEST58_UNMET held=<k>/10` exit 1. A crash or an unreadable extraction is
 * exit 2 (never a score). Frozen at `.ufo/waves/round-58/plan.md` § C1 before
 * any data seat ran.
 *
 * The frozen predicate sentence, byte-identical with plan.md §Claims and the
 * round report —
 * ATTEST58_HELD — node .ufo/waves/round-58/probe/attest58-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST58: ATTEST58_HELD held=10/10 checks=10 rev=<rev> rule=A58 version=v1" and exits 0.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RULE = 'A58';
const EXPECTED_CHECKS = 10;
const TOOL = 'scripts/receipt-evidence.mjs';
const GATE = 'scripts/readme-map.mjs';
const REG = '.ufo/pins/readme-map.json';
const PINS = '.ufo/pins/counter-pins.json';
const R58R = '.ufo/waves/round-58/receipts';
const R57R = '.ufo/waves/round-57/receipts';
const FROZEN_ARGV = [
  ['node', 'scripts/readme-map.mjs', '--selftest'],
  ['node', 'scripts/receipt-evidence.mjs', '--selftest'],
  ['node', 'scripts/counter-pins.mjs'],
];
const SWEEP_SPECS = [':(glob).ufo/waves/round-4[89]/**', ':(glob).ufo/waves/round-5[0-7]/**'];
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('ATTEST58: USAGE node attest58-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`ATTEST58: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
if (!/^[0-9a-f]{40,64}$/.test(rev)) {
  process.stderr.write('ATTEST58: USAGE <rev> must be a full lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });
const run = (args, opts = {}) => spawnSync(args[0], args.slice(1), { encoding: 'utf8', timeout: 120_000, maxBuffer: 32 << 20, ...opts });
const git = (args) => run(['git', '-C', lane, ...args]);

const T = mkdtempSync(join(tmpdir(), 'a58-probe.'));
try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`ATTEST58: FAIL-CLOSED rev unreadable (${tar.status})\n`);
    process.exit(2);
  }
  const nodeRun = (args, opts = {}) => spawnSync(process.execPath, args, { cwd: T, encoding: 'utf8', timeout: 300_000, maxBuffer: 32 << 20, ...opts });
  const last = (r) => `${r.stdout || ''}`.trim().split('\n').pop() || '';
  const readT = (p) => { try { return readFileSync(join(T, p)); } catch { return null; } };
  const parseReceipt = (bytes) => {
    if (!bytes) return null;
    const text = bytes.toString('utf8');
    if (!text.endsWith('\n')) return null;
    const lines = text.split('\n');
    if (lines.length !== 3 || lines[2] !== '') return null;
    try {
      const body = JSON.parse(lines[1]);
      return { body, prelude: lines[0] };
    } catch { return null; }
  };
  // A scratch git repo holding a (possibly mutated) copy of the extraction,
  // committed once; used by the B4/B5 fail-closed and forged controls.
  const mkScratch = (name, mutate) => {
    const dir = mkdtempSync(join(tmpdir(), `a58-${name}.`));
    cpSync(T, dir, { recursive: true });
    if (mutate) mutate(dir);
    const c = run(['git', '-c', 'init.defaultBranch=master', 'init', '-q'], { cwd: dir });
    if (c.status !== 0) { rmSync(dir, { recursive: true, force: true }); return null; }
    run(['git', 'add', '-A'], { cwd: dir });
    const ci = run(['git', '-c', 'user.email=st@example.invalid', '-c', 'user.name=st', 'commit', '-q', '-m', 'st'], { cwd: dir });
    if (ci.status !== 0) { rmSync(dir, { recursive: true, force: true }); return null; }
    const h = run(['git', 'rev-parse', 'HEAD'], { cwd: dir });
    if (h.status !== 0) { rmSync(dir, { recursive: true, force: true }); return null; }
    return { dir, rev: h.stdout.trim() };
  };
  // An old nonce reused by the B4 forgery, taken from the real lane's
  // round-52 corpora (the R57-V4 replay shape).
  const oldNonce = (() => {
    const g = git(['grep', '-ohE', '"nonce":\\s*"[0-9a-f]{32}"', rev, '--', ':(glob).ufo/waves/round-52/**']);
    const m = `${g.stdout || ''}`.match(/"nonce":\s*"([0-9a-f]{32})"/);
    return m ? m[1] : null;
  })();

  // B1 — tool exists, selftest green >= 8 cases
  {
    const tool = readT(TOOL);
    if (!tool) { hold('B1', false, 'tool absent'); }
    else {
      const r = nodeRun([join(T, TOOL), '--selftest']);
      const out = `${r.stdout}`;
      const passCases = (out.match(/^case [^\n]+: PASS/gm) || []).length;
      const m = out.match(/RECEIPT_EVIDENCE_SELFTEST: PASS \((\d+)\/(\d+)\)/);
      const v = /VERDICT: PASS/.test(out);
      hold('B1', r.status === 0 && m && v && +m[1] >= 8 && +m[1] === +m[2] && passCases >= 8,
        `exit=${r.status} cases=${passCases} selftest=${m ? `${m[1]}/${m[2]}` : 'none'} verdict=${v}`);
    }
  }
  // B2 — three receipts + sidecars, ledger VALID x3, nonces distinct
  {
    const names = ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt'];
    const dir = join(T, R58R);
    let ok = names.every((f) => existsSync(join(dir, f)) && existsSync(join(dir, `${f}.sha256`)));
    const nonces = new Set();
    if (ok) {
      for (const f of names) {
        const r = nodeRun([join(T, 'scripts/receipt-attest.mjs'), 'verify', '--ledger', dir, join(dir, f)]);
        if (r.status !== 0 || !/RECEIPT: VALID/.test(`${r.stdout}`)) ok = false;
        const p = parseReceipt(readFileSync(join(dir, f)));
        if (p && /^[0-9a-f]{32}$/.test(p.body.nonce || '')) nonces.add(p.body.nonce); else ok = false;
      }
      ok = ok && nonces.size === 3;
    }
    hold('B2', ok, `nonces=${nonces.size}`);
  }
  // B3 — reproduction + descending sweep + freshness (the receipt-evidence verdict)
  {
    const r57Nonces = [];
    for (const f of ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt']) {
      const p = parseReceipt(readT(join(R57R, f)));
      if (!p || !/^[0-9a-f]{32}$/.test(p.body.nonce || '')) { r57Nonces.length = 0; break; }
      r57Nonces.push(p.body.nonce);
    }
    const args = [join(T, TOOL), 'verify', '--lane', lane, '--rev', rev, '--receipts', join(T, R58R), '--min-span-ms', '300000'];
    for (const n of r57Nonces) args.push('--expect-sweep-nonce', n);
    const r = nodeRun(args);
    hold('B3', r57Nonces.length === 3 && r.status === 0 && last(r).startsWith('RECEIPT_EVIDENCE: HELD'),
      `sentinels=${r57Nonces.length} exit=${r.status} last=${JSON.stringify(last(r))}`);
  }
  // B4 — forged control: fabricated receipt (verify-clean shape, zeroed stdout digest, old nonce) reads UNMET
  {
    const victimBytes = readT(join(R58R, 'attest-run-1.txt'));
    const victim = parseReceipt(victimBytes);
    let forged = null;
    if (oldNonce && victim) {
      forged = mkScratch('forged', (dir) => {
        const sortKeys = (v) => Array.isArray(v) ? v.map(sortKeys)
          : (v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v);
        const record = { ...victim.body, digest: undefined, nonce: oldNonce, stdout_sha256: '0'.repeat(64) };
        delete record.digest;
        const digest = sha(JSON.stringify(sortKeys(record)));
        const body = { ...record, digest };
        const text = `run-at: ${victim.body.wall_start}\n${JSON.stringify(sortKeys(body))}\n`;
        writeFileSync(join(dir, R58R, 'attest-run-1.txt'), text);
        writeFileSync(join(dir, R58R, 'attest-run-1.txt.sha256'), `${sha(Buffer.from(text))}  attest-run-1.txt\n`);
      });
    }
    if (!oldNonce || !victim) { hold('B4', false, `oldNonce=${Boolean(oldNonce)} victim=${Boolean(victim)}`); }
    else if (!forged) { hold('B4', false, 'scratch-forgery-unbuildable'); }
    else {
      const r = nodeRun([join(T, TOOL), 'verify', '--lane', forged.dir, '--rev', forged.rev,
        '--receipts', join(forged.dir, R58R), '--min-span-ms', '300000']);
      const ok = r.status === 1 && last(r).startsWith('RECEIPT_EVIDENCE: UNMET');
      rmSync(forged.dir, { recursive: true, force: true });
      hold('B4', ok, `oldNonce=${Boolean(oldNonce)} exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
  }
  // B5 — fail-closed controls: unparseable rev; sweep resolves no file
  {
    const badRev = 'deadbeef'.repeat(5);
    const r1 = nodeRun([join(T, TOOL), 'verify', '--lane', lane, '--rev', badRev,
      '--receipts', join(T, R58R), '--min-span-ms', '300000']);
    const nocov = mkScratch('nocov', (dir) => {
      // Strip every nonce-bearing file from the round-48..57 corpora while
      // leaving the pinned probes in place (counter-pins must still
      // reproduce): the sweep then resolves files but zero nonces —
      // SWEEP_NO_NONCES, fail-closed. (Deleting the rounds wholesale also
      // deletes the frozen probes the third receipt re-runs.)
      const waves = join(dir, '.ufo/waves');
      for (const n of readdirSync(waves, { withFileTypes: true })) {
        if (!n.isDirectory() || !/^round-(4[89]|5[0-7])$/.test(n.name)) continue;
        const stack = [join(waves, n.name)];
        while (stack.length) {
          const d = stack.pop();
          for (const e of readdirSync(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) { stack.push(p); continue; }
            try {
              // exactly the bytes the sweep would collect: a JSON nonce
              // line. The frozen probes' sources contain the pattern as an
              // escaped regex string, which this exact-shape test spares.
              if (/"nonce":\s*"[0-9a-f]{32}"/.test(readFileSync(p).toString('utf8'))) rmSync(p);
            } catch { /* best-effort */ }
          }
        }
      }
    });
    let r2 = { status: -1, stdout: '' };
    if (nocov) {
      r2 = nodeRun([join(T, TOOL), 'verify', '--lane', nocov.dir, '--rev', nocov.rev,
        '--receipts', join(nocov.dir, R58R), '--min-span-ms', '300000']);
      rmSync(nocov.dir, { recursive: true, force: true });
    }
    hold('B5', r1.status === 2 && last(r1).startsWith('RECEIPT_EVIDENCE: FAIL-CLOSED')
        && nocov && r2.status === 2 && last(r2).startsWith('RECEIPT_EVIDENCE: FAIL-CLOSED'),
      `unparseable=exit${r1.status} nocov=exit${r2.status}`);
  }
  // B6 — frozen argv per receipt body, in order
  {
    const names = ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt'];
    let ok = true; const got = [];
    for (let i = 0; i < names.length; i++) {
      const p = parseReceipt(readT(join(R58R, names[i])));
      const want = JSON.stringify(FROZEN_ARGV[i]);
      const g = p && Array.isArray(p.body.argv) ? JSON.stringify(p.body.argv) : null;
      got.push(g === null ? 'unparsed' : `${(JSON.parse(g)).join(' ')}`);
      if (g !== want) ok = false;
    }
    hold('B6', ok, `argv=${JSON.stringify(got)}`);
  }
  // B7 — body wall_start span >= 300 s (prelude ignored)
  {
    const times = [];
    for (const f of ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt']) {
      const p = parseReceipt(readT(join(R58R, f)));
      const t = p && Date.parse(p.body.wall_start);
      if (Number.isFinite(t)) times.push(t);
    }
    const span = times.length === 3 ? Math.max(...times) - Math.min(...times) : 0;
    hold('B7', times.length === 3 && span >= 300_000, `times=${times.length} span_ms=${span}`);
  }
  // B8 — the drop-one kill: mutant transcript + this source's count pin (R57-V2)
  {
    const mut = readT('.ufo/waves/round-58/controls/MutCounter58.txt');
    const selfSrc = readT('.ufo/waves/round-58/probe/attest58-probe.mjs');
    const transcriptOk = Boolean(mut && /ATTEST58_UNMET held=9\/9/.test(mut.toString('utf8'))
      && /checks-mismatch/.test(mut.toString('utf8')));
    const guardOk = Boolean(selfSrc && selfSrc.toString('utf8').includes('checks.length !== 10'));
    hold('B8', transcriptOk && guardOk, `transcript=${transcriptOk} guard=${guardOk}`);
  }
  // B9 — checklist items === 28 with the 24..28 bindings (supersession convention)
  {
    const sk = readT('SKILL.md');
    if (!sk) { hold('B9', false, 'SKILL.md absent'); }
    else {
      const itemLines = sk.toString('utf8').split('\n').filter((l) => /^\s*- \[/.test(l));
      const items = itemLines.length;
      const bind = itemLines.slice(23, 28).every((l, i) =>
        l.includes(['counter-pins.mjs', 'source-capture.mjs', 'source-dupes.mjs', 'readme-map.mjs', 'receipt-evidence.mjs'][i]));
      hold('B9', items === 28 && bind, `items=${items} i24..28=${bind}`);
    }
  }
  // B10 — readme-map v2: registry version 2, gate CLEAN >= 138, selftest arms, pins, proxy strict
  {
    const regRaw = readT(REG);
    let reg = null;
    try { reg = regRaw && JSON.parse(regRaw.toString('utf8')); } catch {}
    let ok = Boolean(reg && reg.version === 2);
    let detail = `version=${reg ? reg.version : 'absent'}`;
    const gate = readT(GATE);
    if (ok && gate) {
      const r = nodeRun([join(T, GATE)]);
      const m = last(r).match(/README_MAP: CLEAN files=(\d+) rows=(\d+) covered=(\d+)/);
      ok = ok && r.status === 0 && m && +m[1] >= 138 && +m[1] === +m[2] && +m[2] === +m[3];
      detail += ` gateExit=${r.status} last=${JSON.stringify(last(r))}`;
      const st = nodeRun([join(T, GATE), '--selftest']);
      const out = `${st.stdout}`;
      const m2 = out.match(/README_MAP_SELFTEST: PASS \((\d+)\/(\d+)\)/);
      ok = ok && st.status === 0 && m2 && +m2[1] >= 16 && +m2[1] === +m2[2]
        && /case covered-not-file: PASS/.test(out) && /case symlink-stale-covered: PASS/.test(out);
      detail += ` selftest=${m2 ? m2[1] : 'none'}`;
    } else { ok = false; }
    const sc = readT('SCORECARD.md');
    const tool = readT(TOOL);
    if (sc && gate && tool) {
      const pinGate = sc.toString('utf8').match(/pin\.readme-map=([0-9a-f]{64})/);
      const pinTool = sc.toString('utf8').match(/pin\.receipt-evidence=([0-9a-f]{64})/);
      ok = ok && Boolean(pinGate && pinGate[1] === sha(gate) && pinTool && pinTool[1] === sha(tool));
      detail += ` pinGate=${Boolean(pinGate && pinGate[1] === sha(gate))} pinTool=${Boolean(pinTool && pinTool[1] === sha(tool))}`;
    } else { ok = false; }
    const pr = nodeRun([join(T, 'scripts/proxy-check.mjs'), '--strict']);
    ok = ok && pr.status === 0 && last(pr).includes('PROXY: MATCH');
    detail += ` proxyExit=${pr.status} last=${JSON.stringify(last(pr))}`;
    hold('B10', ok, detail);
  }
} catch (e) {
  process.stderr.write(`ATTEST58: FAIL-CLOSED ${e && e.stack ? e.stack.split('\n')[0] : e}\n`);
  process.exit(2);
} finally {
  rmSync(T, { recursive: true, force: true });
}
if (checks.length !== EXPECTED_CHECKS) {
  const held = checks.filter((c) => c.ok).length;
  process.stdout.write(`ATTEST58: ATTEST58_UNMET held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} version=v1 | checks-mismatch want=${EXPECTED_CHECKS}\n`);
  process.exit(1);
}
const held = checks.filter((c) => c.ok).length;
const parts = checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail}`}`).join(' | ');
process.stdout.write(`ATTEST58: ${held === checks.length ? 'ATTEST58_HELD' : 'ATTEST58_UNMET'} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} version=v1 | ${parts}\n`);
process.exit(held === checks.length ? 0 : 1);
