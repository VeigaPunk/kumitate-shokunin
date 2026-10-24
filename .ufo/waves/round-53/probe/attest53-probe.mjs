#!/usr/bin/env node
/**
 * attest53-probe.mjs — FROZEN counter for kumitate round 53, claim C1 (rule `A53`), v1.
 *
 *   node .ufo/waves/round-53/probe/attest53-probe.mjs <lane> <rev>
 *
 * Counter for the receipt-attest v3 ledger-evidence extension (contract
 * `kumitate-receipt-attest-v3`, routed defects R52-9 + R52-10). Freeze history: v1 is the
 * first version of this rule — it supersedes rule A52 (round 52), which stays frozen as
 * round-52 evidence. Frozen AND executed at base before any data seat ran
 * (base/attest53-base.txt, QUALITY Q43), with a scratch-HELD witness of a synthetic
 * conformant post-state committed at freeze (witness/scratch-held.txt, lesson M5).
 *
 * Scores seventeen checks over the committed bytes of <rev> (extracted with `git archive`,
 * never the working tree):
 *   B1  scripts/receipt-attest.mjs exists at rev and `node scripts/receipt-attest.mjs
 *       --selftest` exits 0 with final line `ATTEST_SELFTEST: PASS (n/n)` and >=30 lines
 *       matching `^case <name>: PASS` (the v2 SELFTEST contract, retained by v3).
 *   B1c CLOCK challenge (R52-1, retained): month-13 clocks with recomputed digest AND
 *       sidecar answer `RECEIPT: TAMPERED` exit 1 — a crash is not a verdict.
 *   B2  the three committed receipts .ufo/waves/round-53/receipts/attest53-run-{1,2,3}.txt
 *       (+ sidecars) each verify `RECEIPT: VALID` exit 0; embedded nonces pairwise
 *       distinct; record digests pairwise distinct (R52-10 probe-side: trailing-newline
 *       byte variance alone must not satisfy distinctness); span = max(wall_start) -
 *       min(wall_start) over the receipt BODY fields (digest-bound wall_start, never the
 *       display prelude — R52-7) is >= 300 s; argv is exactly the planned gate command.
 *   B2c CHALLENGE (retained): a fresh receipt binding a probe-issued command's argv and
 *       output hash — a verdict-printing stub cannot satisfy it.
 *   B2e STDIN challenge (A2e, retained): nonce on stdin, probe captures the child's real
 *       stdout itself.
 *   B3  the committed doctored control attest53-run-2-replayed.txt (prelude rewritten,
 *       sidecar untouched — the lesson-M2 forgery) verifies `RECEIPT: TAMPERED` exit 1.
 *   B3c CHALLENGE (retained): in-window prelude-tamper of a live receipt, sidecar arm is
 *       the only possible reject.
 *   B4  no nonce reuse: every pair of the three round-53 receipts passes
 *       `verify --ledger <receipts-dir>` (whole-dir scan skips the sidecars and the
 *       doctored control with notes, never evidence), and each embedded nonce appears in
 *       NO prior receipt corpus file under .ufo/waves/ (rounds 48–52 corpora) at rev.
 *   B4c REPLAY twin challenge (retained): semantic-body twin with recomputed digest must
 *       verify VALID alone and answer REPLAY in both directions over a 2-file ledger.
 *   B4d DIGEST-BINDING challenge (retained): corrupt inner digest with recomputed sidecar
 *       answers REPLAY.
 *   B5  pin.receipt-attest in the SCORECARD.md `kumitate-gate-pins-v1` block equals the
 *       sha256 of the extracted scripts/receipt-attest.mjs, and
 *       `node scripts/proxy-check.mjs --strict` (UFO_SRC = live origin checkout) exits 0
 *       with `PROXY: MATCH`.
 *   B5c VACUOUS-HELD guard (R52-5, retained): the extracted tree carries
 *       .ufo/waves/round-53/build/MutCounter53/counter-mutant.txt whose transcript shows
 *       the hold-call-deleted A53 mutant printing `ATTEST53_UNMET held=0/0` with exit 1,
 *       and this probe's own source (the JUDGED bytes) carries the checks-nonempty guard.
 *   B6  format compat at tip: the three round-51 receipts AND the three round-52 receipts
 *       each verify `RECEIPT: VALID` exit 0 under the v3 instrument, plus a synthesized
 *       fresh v1-format (no stdin_sha256) receipt — compat is a format property, not of
 *       six known files.
 *   B7a R52-9 Evasion challenge: a semantic-body twin reusing a live receipt's nonce,
 *       recomputed digest AND sidecar, stored under a NON-.txt name (`b7a-evil.receipt`),
 *       is ledger evidence: `verify --ledger` over a dir holding both the original
 *       (`orig.txt`) and the evasion copy answers `RECEIPT: REPLAY` exit 1 for the
 *       original, naming the evasion file. Under v2 the ledger never opened the file and
 *       the original read VALID (the routed defect, MutReceiptBytes F4).
 *   B7b any-extension prior: an attested receipt re-keyed under an extension-free name
 *       (`witness.log`) in the ledger dir is prior evidence — a fresh receipt whose nonce
 *       is rewritten to the prior's answers `RECEIPT: REPLAY` exit 1 naming witness.log.
 *   B7c same-digest exemption is extension-independent: a byte-identical duplicate of an
 *       attested receipt under a different extension (`dup.receipt`, re-pointed sidecar)
 *       verifies `RECEIPT: VALID` exit 0 under `--ledger`.
 *   B7d whole-dir robustness: a ledger dir containing a subdirectory, a foreign `.json`
 *       file and a stray `.sha256` file is scanned without a crash; the genuine receipt
 *       verifies VALID; each junk entry is skipped with a printed note.
 *
 * Predicate ATTEST53_HELD = held=17/17, exit 0. Any other reading is
 * `ATTEST53_UNMET held=<k>/17` exit 1. A crash or an unreadable extraction is exit 2
 * (never a score); a malformed verdict line from the tool simply fails its check's
 * pattern (a MISS, not a crash). Frozen at `.ufo/waves/round-53/plan.md` before any data
 * seat ran; freeze repairs, if any, are named in that plan's addendum with re-run base
 * receipts.
 *
 * The frozen predicate sentence, byte-identical with plan.md §Claims and the round
 * report —
 * ATTEST53_HELD — node .ufo/waves/round-53/probe/attest53-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST53: ATTEST53_HELD held=17/17 checks=17 rev=<rev> rule=A53 version=v1" and exits 0.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RULE = 'A53';
const VERSION = 'v1';
const ORIGIN = '/home/vgpnk/Projects/ufo-fsd-alpha';
const RECEIPTS = ['attest53-run-1.txt', 'attest53-run-2.txt', 'attest53-run-3.txt'];
const R51_RECEIPTS = ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt'];
const R52_RECEIPTS = ['attest52-run-1.txt', 'attest52-run-2.txt', 'attest52-run-3.txt'];
const RDIR = '.ufo/waves/round-53/receipts';
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('ATTEST53: USAGE node attest53-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`ATTEST53: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
// Hardening (A52 repair 6 carries): <rev> is interpolated into a shell pipeline; only full
// hex object names are accepted, and the extraction must not contain symlinks.
if (!/^[0-9a-f]{40,64}$/.test(rev)) {
  process.stderr.write('ATTEST53: USAGE <rev> must be a full lowercase hex object name\n');
  process.exit(64);
}

const sha = (b) => createHash('sha256').update(b).digest('hex');
const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: 'utf8', timeout: 240_000, maxBuffer: 64 << 20, ...opts });

const T = mkdtempSync(join(tmpdir(), 'a53-probe.'));
const checks = [];
// R52-5 guard (B5c): a probe whose checks array is empty can never print HELD.
const hold = (id, ok, detail) => { if (typeof id === 'string') checks.push({ id, ok, detail }); };
const lastLine = (r) => `${r.stderr || ''}${r.stdout || ''}`.trim().split('\n').pop() || '';
const jsonLineOf = (file) => readFileSync(file, 'utf8').split('\n').find((l) => l.trimStart().startsWith('{'));
const sortKeys = (v) => {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
  }
  return v;
};
const sidecarLine = (hash, name) => `${hash}  ${name}\n`;
const rekeySidecar = (srcSide, dstName) => {
  const parsed = /^([0-9a-f]{64})[ \t]+[*]?(\S+)$/.exec(readFileSync(srcSide, 'utf8').trim());
  return `${parsed[1]}  ${dstName}\n`;
};

try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`ATTEST53: FAIL-CLOSED git archive ${rev} exit=${tar.status}\n`);
    process.exit(2);
  }
  const sym = spawnSync('bash', ['-lc', `find ${JSON.stringify(T)} -type l -print -quit`], { encoding: 'utf8', timeout: 60_000 });
  if (sym.status !== 0 || (sym.stdout || '').trim() !== '') {
    process.stderr.write('ATTEST53: FAIL-CLOSED extraction contains a symlink\n');
    process.exit(2);
  }
  const S = join(T, 'scripts');
  const tool = join(S, 'receipt-attest.mjs');
  const runTool = (args, opts = {}) => sh('node', [tool, ...args], { cwd: T, ...opts });

  // B1
  let b1ok = false; let b1d = '';
  if (existsSync(tool)) {
    const r = runTool(['--selftest']);
    const last = lastLine(r);
    const cases = `${r.stdout || ''}`.split('\n').filter((l) => /^case\s+\S+:\s+PASS\s*$/.test(l)).length;
    b1ok = r.status === 0 && /ATTEST_SELFTEST: PASS \(/.test(last) && cases >= 30;
    b1d = b1ok ? `selftest PASS cases=${cases}` : `exit=${r.status} cases=${cases} last=${JSON.stringify(last.slice(0, 120))}`;
  } else {
    b1d = 'scripts/receipt-attest.mjs absent';
  }
  hold('B1', b1ok, b1d);

  // B1c — CLOCK challenge: rolled month-13 clocks, recomputed digest AND sidecar.
  let b1cok = false; let b1cd = '';
  if (existsSync(tool)) {
    const base = join(T, `b1c-${randomBytes(6).toString('hex')}`);
    const r = runTool(['run', '--out', base, '--', '/usr/bin/printf', '%s', 'b1c-clock']);
    const rcpt = `${base}.txt`;
    if (r.status !== 0 || !existsSync(rcpt)) {
      b1cd = `run exit=${r.status}`;
    } else {
      try {
        const lines = readFileSync(rcpt, 'utf8').split('\n');
        const ji = lines.findIndex((l) => l.trimStart().startsWith('{'));
        const body = JSON.parse(lines[ji]);
        const BAD = '2026-13-01T00:00:00.000Z';
        body.wall_start = BAD; body.wall_end = BAD;
        body.digest = sha(Buffer.from(JSON.stringify(sortKeys((({ digest, ...rest2 }) => rest2)(body))), 'utf8'));
        lines[ji] = JSON.stringify(sortKeys(body));
        const bad = `${rcpt}.rolled`;
        writeFileSync(bad, lines.join('\n'));
        writeFileSync(`${bad}.sha256`, `${sha(readFileSync(bad))}  ${bad.split('/').pop()}\n`);
        const v = runTool(['verify', bad]);
        const last = lastLine(v);
        b1cok = v.status === 1 && /RECEIPT: TAMPERED/.test(last);
        b1cd = b1cok ? `impossible clocks rejected as TAMPERED` : `exit=${v.status} last=${JSON.stringify(last.slice(0, 100))}`;
      } catch (e) {
        b1cd = `craft failed: ${e.message}`;
      }
    }
  } else b1cd = 'tool absent';
  hold('B1c', b1cok, b1cd);

  // B2 — the three committed round-53 receipts (planned argv, body-field distinctness/span).
  const rd = join(T, RDIR);
  const PLANNED_ARGV = {
    'attest53-run-1.txt': ['node', 'scripts/bind-oracle.mjs', '--selftest'],
    'attest53-run-2.txt': ['node', 'scripts/sources-check.mjs'],
    'attest53-run-3.txt': ['node', 'scripts/round-gate.mjs', '--selftest'],
  };
  const WALL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const nonces = []; const wallStarts = []; const digests = [];
  let b2ok = true; const b2miss = [];
  for (const f of RECEIPTS) {
    const p = join(rd, f);
    const side = `${p}.sha256`;
    if (!existsSync(p) || !existsSync(side)) { b2ok = false; b2miss.push(`${f}:absent`); continue; }
    const v = runTool(['verify', p]);
    const last = lastLine(v);
    if (!(v.status === 0 && /RECEIPT: VALID/.test(last))) { b2ok = false; b2miss.push(`${f}:exit=${v.status} ${last.slice(0, 80)}`); continue; }
    let nonce = null; let ws = null; let dg = null; let argv = null; let wsb = null;
    try {
      const j = JSON.parse(jsonLineOf(p));
      nonce = j.nonce; dg = j.digest; argv = j.argv; wsb = j.wall_start;
      ws = Date.parse(wsb);
    } catch (e) { b2ok = false; b2miss.push(`${f}:unparseable(${e.message})`); }
    const want = PLANNED_ARGV[f];
    if (!argv || JSON.stringify(argv) !== JSON.stringify(want)) {
      b2ok = false; b2miss.push(`${f}:argv!=planned(${JSON.stringify(argv).slice(0, 60)})`); continue;
    }
    if (!WALL_RE.test(wsb || '')) { b2ok = false; b2miss.push(`${f}:wall_start not CLOCK-shaped`); continue; }
    if (!nonce || !Number.isFinite(ws)) { b2ok = false; b2miss.push(`${f}:nonce/wall_start missing`); continue; }
    nonces.push(nonce); wallStarts.push(ws); digests.push(dg);
  }
  let span = 0;
  if (wallStarts.length === 3) span = (Math.max(...wallStarts) - Math.min(...wallStarts)) / 1000;
  const distinctN = new Set(nonces).size === nonces.length && nonces.length === 3;
  const distinctD = new Set(digests).size === digests.length && digests.length === 3;
  if (b2ok && (!distinctN || !distinctD || span < 300)) {
    b2ok = false;
    if (!distinctN) b2miss.push('nonce-not-distinct');
    if (!distinctD) b2miss.push('digest-not-distinct');
    if (span < 300) b2miss.push(`span=${Math.round(span)}s<300(body wall_start)`);
  }
  hold('B2', b2ok, b2ok ? `3 receipts VALID planned-argv body-wall_start span=${Math.round(span)}s nonces=distinct digests=distinct` : b2miss.join(';'));

  // B2c — printf challenge.
  let b2cok = false; let b2cd = '';
  if (existsSync(tool)) {
    const nonce = `a53c-${randomBytes(8).toString('hex')}`;
    const base = join(T, `challenge-${nonce}`);
    const r = runTool(['run', '--out', base, '--', '/usr/bin/printf', '%s', nonce]);
    const rcpt = `${base}.txt`;
    if (r.status !== 0 || !existsSync(rcpt)) {
      b2cd = `run exit=${r.status} last=${JSON.stringify(lastLine(r).slice(0, 100))}`;
    } else {
      const v = runTool(['verify', rcpt]);
      let j = null;
      try { j = JSON.parse(jsonLineOf(rcpt)); } catch (e) { b2cd = `challenge receipt unparseable: ${e.message}`; }
      const argvOk = j && Array.isArray(j.argv) && j.argv[j.argv.length - 1] === nonce;
      const outOk = j && j.stdout_sha256 === sha(Buffer.from(nonce, 'utf8'));
      const validOk = v.status === 0 && /RECEIPT: VALID/.test(lastLine(v));
      const sideOk = sh('/usr/bin/sha256sum', ['-c', `${rcpt}.sha256`], { cwd: T }).status === 0;
      b2cok = Boolean(argvOk && outOk && validOk && sideOk);
      b2cd = b2cok ? `challenge bound argv+stdout(${nonce.slice(0, 10)}) sha256sum -c ok`
        : `argvOk=${argvOk} outOk=${outOk} validOk=${validOk} sideOk=${sideOk}`;
    }
  } else b2cd = 'tool absent';
  hold('B2c', b2cok, b2cd);

  // B2e — STDIN challenge: nonce on stdin, probe captures the child's real stdout.
  let b2eok = false; let b2ed = '';
  if (existsSync(tool)) {
    const base = join(T, `a2e-${randomBytes(6).toString('hex')}`);
    const r = runTool(['run', '--out', base, '--stdin', '--', '/bin/cat']);
    const rcpt = `${base}.txt`;
    if (r.status !== 0 || !existsSync(rcpt)) {
      b2ed = `run exit=${r.status} last=${JSON.stringify(lastLine(r).slice(0, 100))}`;
    } else {
      try {
        const j = JSON.parse(jsonLineOf(rcpt));
        const v = runTool(['verify', rcpt]);
        const validOk = v.status === 0 && /RECEIPT: VALID/.test(lastLine(v));
        const stdinOk = j.stdin_sha256 === sha(Buffer.from(j.nonce, 'utf8'));
        const cat = sh('/bin/cat', [], { input: Buffer.from(j.nonce, 'utf8') });
        const capturedOk = cat.status === 0 && j.stdout_sha256 === sha(cat.stdout);
        const sideOk = sh('/usr/bin/sha256sum', ['-c', `${rcpt}.sha256`], { cwd: T }).status === 0;
        b2eok = Boolean(validOk && stdinOk && capturedOk && sideOk);
        b2ed = b2eok ? `stdin nonce bound, child stdout probe-captured, VALID`
          : `validOk=${validOk} stdinOk=${stdinOk} capturedOk=${capturedOk} sideOk=${sideOk}`;
      } catch (e) {
        b2ed = `craft failed: ${e.message}`;
      }
    }
  } else b2ed = 'tool absent';
  hold('B2e', b2eok, b2ed);

  // B3 — committed doctored control
  let b3ok = false; let b3d = '';
  const rp = join(rd, 'attest53-run-2-replayed.txt');
  if (existsSync(tool) && existsSync(rp)) {
    const v = runTool(['verify', rp]);
    const last = lastLine(v);
    b3ok = v.status === 1 && /RECEIPT: TAMPERED/.test(last);
    b3d = b3ok ? 'prelude-replay rejected' : `exit=${v.status} last=${JSON.stringify(last.slice(0, 120))}`;
  } else b3d = 'attest53-run-2-replayed.txt absent';
  hold('B3', b3ok, b3d);

  // B3c — live prelude-tamper challenge (sidecar arm is the only possible reject).
  let b3cok = false; let b3cd = '';
  if (existsSync(tool)) {
    const base = join(T, `challenge-tamper-${randomBytes(6).toString('hex')}`);
    const r = runTool(['run', '--out', base, '--', '/usr/bin/printf', '%s', 'a53c-tamper']);
    const rcpt = `${base}.txt`;
    if (r.status !== 0 || !existsSync(rcpt)) {
      b3cd = `run exit=${r.status}`;
    } else {
      const iso = (ms) => new Date(ms).toISOString();
      let wallStartMs = 0;
      try { wallStartMs = Date.parse(JSON.parse(jsonLineOf(rcpt)).wall_start); } catch { wallStartMs = 0; }
      if (!Number.isFinite(wallStartMs) || wallStartMs <= 0) {
        b3cd = 'fresh receipt wall_start unparseable';
      } else {
        const dir2 = mkdtempSync(join(tmpdir(), 'a53-b3c.'));
        const moved = join(dir2, rcpt.split('/').pop());
        copyFileSync(rcpt, moved);
        copyFileSync(`${rcpt}.sha256`, `${moved}.sha256`);
        const lines = readFileSync(moved, 'utf8').split('\n');
        const idx = lines.findIndex((l) => l.startsWith('run-at:'));
        if (idx === -1) {
          b3cd = 'no run-at prelude in generated receipt';
        } else {
          lines[idx] = `run-at: ${iso(wallStartMs + 30_000)}`;
          writeFileSync(moved, lines.join('\n'));
          const v = runTool(['verify', moved]);
          const last = lastLine(v);
          b3cok = v.status === 1 && /RECEIPT: TAMPERED/.test(last);
          b3cd = b3cok ? 'in-window prelude-tamper rejected by the sidecar arm' : `exit=${v.status} last=${JSON.stringify(last.slice(0, 120))}`;
        }
        rmSync(dir2, { recursive: true, force: true });
      }
    }
  } else b3cd = 'tool absent';
  hold('B3c', b3cok, b3cd);

  // B4 — ledger over round-53 receipts + zero nonce hits in prior corpora.
  let b4ok = true; const b4d = [];
  if (existsSync(tool) && existsSync(rd)) {
    for (const f of RECEIPTS) {
      const p = join(rd, f);
      if (!existsSync(p)) { b4ok = false; b4d.push(`${f}:absent`); continue; }
      const v = runTool(['verify', '--ledger', rd, p]);
      const last = lastLine(v);
      if (!(v.status === 0 && /RECEIPT: VALID/.test(last))) { b4ok = false; b4d.push(`${f}:ledger exit=${v.status} ${last.slice(0, 80)}`); }
    }
    const prior = [];
    const waves = join(T, '.ufo', 'waves');
    if (existsSync(waves)) {
      const walk = (d) => {
        for (const n of readdirSync(d)) {
          const p = join(d, n);
          let st;
          try { st = statSync(p); } catch { continue; }
          if (st.isDirectory()) { if (!/round-53$/.test(n)) walk(p); continue; }
          if (/receipt|ReRun|L1-score|attest-run|attest\d+-run|stab-r/i.test(n)) prior.push(p);
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
    if (hits > 0) { b4ok = false; b4d.push(`nonce-reuse-in-prior hits=${hits}`); }
    b4d.push(`prior-files=${prior.length}`);
  } else { b4ok = false; b4d.push('tool or receipts dir absent'); }
  hold('B4', b4ok, b4d.join(';'));

  // B4c — REPLAY twin challenge.
  let b4cok = false; let b4cd = '';
  if (existsSync(tool)) {
    const base = join(T, `b4c-${randomBytes(6).toString('hex')}`);
    const r = runTool(['run', '--out', base, '--', '/usr/bin/printf', '%s', 'b4c-original']);
    const rcpt = `${base}.txt`;
    if (r.status !== 0 || !existsSync(rcpt) || !existsSync(`${rcpt}.sha256`)) {
      b4cd = `run exit=${r.status}`;
    } else {
      try {
        const lines = readFileSync(rcpt, 'utf8').split('\n');
        const ji = lines.findIndex((l) => l.trimStart().startsWith('{'));
        const body = JSON.parse(lines[ji]);
        body.argv = [...(body.argv || []), 'b4c-evil-append'];
        const { digest, ...restB } = body;
        const canon = JSON.stringify(sortKeys(restB));
        const twinName = 'b4c-twin.txt';
        const twinPath = join(T, twinName);
        lines[ji] = canon.slice(0, -1) + `,"digest":"${sha(Buffer.from(canon, 'utf8'))}"}`;
        writeFileSync(twinPath, lines.join('\n'));
        writeFileSync(`${twinPath}.sha256`, `${sha(readFileSync(twinPath))}  ${twinName}\n`);
        const vTwin = runTool(['verify', twinPath]);
        const twinValid = vTwin.status === 0 && /RECEIPT: VALID/.test(lastLine(vTwin));
        const ledgerDir = mkdtempSync(join(tmpdir(), 'a53-b4c.'));
        copyFileSync(rcpt, join(ledgerDir, 'orig.txt'));
        writeFileSync(join(ledgerDir, 'orig.txt.sha256'), rekeySidecar(`${rcpt}.sha256`, 'orig.txt'));
        copyFileSync(twinPath, join(ledgerDir, twinName));
        writeFileSync(join(ledgerDir, `${twinName}.sha256`), rekeySidecar(`${twinPath}.sha256`, twinName));
        const vL1 = runTool(['verify', '--ledger', ledgerDir, join(ledgerDir, 'orig.txt')]);
        const vL2 = runTool(['verify', '--ledger', ledgerDir, join(ledgerDir, twinName)]);
        const replay1 = vL1.status === 1 && /RECEIPT: REPLAY/.test(lastLine(vL1));
        const replay2 = vL2.status === 1 && /RECEIPT: REPLAY/.test(lastLine(vL2));
        b4cok = twinValid && replay1 && replay2;
        b4cd = `twinValid=${twinValid} ledger(orig)=${replay1 ? 'REPLAY' : lastLine(vL1).slice(0, 60)} ledger(twin)=${replay2 ? 'REPLAY' : lastLine(vL2).slice(0, 60)}`;
        rmSync(ledgerDir, { recursive: true, force: true });
      } catch (e) {
        b4cd = `craft failed: ${e.message}`;
      }
    }
  } else b4cd = 'tool absent';
  hold('B4c', b4cok, b4cd);

  // B4d — corrupt-digest challenge.
  let b4dok = false; let b4dd = '';
  if (existsSync(tool)) {
    const base = join(T, `b4d-${randomBytes(6).toString('hex')}`);
    const r = runTool(['run', '--out', base, '--', '/usr/bin/printf', '%s', 'b4d-digest']);
    const rcpt = `${base}.txt`;
    if (r.status !== 0 || !existsSync(rcpt)) {
      b4dd = `run exit=${r.status}`;
    } else {
      try {
        const lines = readFileSync(rcpt, 'utf8').split('\n');
        const ji = lines.findIndex((l) => l.trimStart().startsWith('{'));
        const body = JSON.parse(lines[ji]);
        body.digest = 'f'.repeat(64);
        lines[ji] = JSON.stringify(body);
        const bad = `${rcpt}.baddigest`;
        writeFileSync(bad, lines.join('\n'));
        writeFileSync(`${bad}.sha256`, `${sha(readFileSync(bad))}  ${bad.split('/').pop()}\n`);
        const v = runTool(['verify', bad]);
        const last = lastLine(v);
        b4dok = v.status === 1 && /RECEIPT: REPLAY/.test(last);
        b4dd = b4dok ? 'corrupt-digest rejected as REPLAY' : `exit=${v.status} last=${JSON.stringify(last.slice(0, 100))}`;
      } catch (e) {
        b4dd = `craft failed: ${e.message}`;
      }
    }
  } else b4dd = 'tool absent';
  hold('B4d', b4dok, b4dd);

  // B5 — pin + proxy
  let b5ok = false; const b5d = [];
  const sc = join(T, 'SCORECARD.md');
  if (existsSync(tool) && existsSync(sc)) {
    const m = /pin\.receipt-attest=([0-9a-f]{64})/.exec(readFileSync(sc, 'utf8'));
    if (!m) b5d.push('pin.receipt-attest absent');
    else if (m[1] !== sha(readFileSync(tool))) b5d.push(`pin ${m[1].slice(0, 8)}!=${sha(readFileSync(tool)).slice(0, 8)}`);
    else b5d.push('pin match');
    const pr = sh('node', [join(S, 'proxy-check.mjs'), '--strict'], { cwd: T, env: { ...process.env, UFO_SRC: ORIGIN } });
    const last = lastLine(pr);
    if (!(pr.status === 0 && /PROXY: MATCH/.test(last))) { b5d.push(`proxy exit=${pr.status} ${last.slice(0, 100)}`); }
    else b5d.push('proxy MATCH');
    b5ok = b5d.length === 2 && b5d[0] === 'pin match' && /proxy MATCH/.test(b5d[1]);
  } else b5d.push('tool or SCORECARD absent');
  hold('B5', b5ok, b5d.join(';'));

  // B5c — vacuous-HELD guard: committed counter-mutant transcript + guard in the JUDGED bytes.
  let b5cok = false; let b5cd = '';
  const mutantFile = join(T, '.ufo', 'waves', 'round-53', 'build', 'MutCounter53', 'counter-mutant.txt');
  let mutantOk = false;
  if (existsSync(mutantFile)) {
    const t = readFileSync(mutantFile, 'utf8');
    mutantOk = /ATTEST53_UNMET/.test(t) && /held=0\/0/.test(t) && /exit ?1/.test(t);
  }
  let selfGuardOk = false;
  try {
    const judgedSrc = readFileSync(join(T, '.ufo', 'waves', 'round-53', 'probe', 'attest53-probe.mjs'), 'utf8');
    selfGuardOk = /checks\.length\s*>\s*0/.test(judgedSrc) && /held\s*===\s*checks\.length/.test(judgedSrc);
  } catch { selfGuardOk = false; }
  b5cok = mutantOk && selfGuardOk;
  b5cd = `mutantReceipt=${mutantOk ? 'present' : 'absent-or-malformed'} judgedSelfGuard=${selfGuardOk ? 'present' : 'absent'}`;
  hold('B5c', b5cok, b5cd);

  // B6 — r51 (v1 format) + r52 receipts still VALID under v3 + synthesized v1-format receipt.
  let b6ok = true; const b6d = [];
  const r51 = join(T, '.ufo', 'waves', 'round-51', 'receipts');
  const r52 = join(T, '.ufo', 'waves', 'round-52', 'receipts');
  if (existsSync(tool) && existsSync(r51) && existsSync(r52)) {
    for (const [dir, files] of [[r51, R51_RECEIPTS], [r52, R52_RECEIPTS]]) {
      for (const f of files) {
        const p = join(dir, f);
        if (!existsSync(p)) { b6ok = false; b6d.push(`${f}:absent`); continue; }
        const v = runTool(['verify', p]);
        const last = lastLine(v);
        if (!(v.status === 0 && /RECEIPT: VALID/.test(last))) { b6ok = false; b6d.push(`${f}:exit=${v.status} ${last.slice(0, 80)}`); }
      }
    }
    try {
      const synth = join(T, `b6-synth-${randomBytes(6).toString('hex')}`);
      const rs = runTool(['run', '--out', synth, '--', '/usr/bin/printf', '%s', 'b6-synth-v1compat']);
      const sp = `${synth}.txt`;
      if (rs.status !== 0 || !existsSync(sp)) { b6ok = false; b6d.push('synth:run-failed'); }
      else {
        const lines = readFileSync(sp, 'utf8').split('\n');
        const ji = lines.findIndex((l) => l.trimStart().startsWith('{'));
        const body = JSON.parse(lines[ji]);
        delete body.stdin_sha256;
        const { digest, ...restS } = body;
        const canon = JSON.stringify(sortKeys(restS));
        lines[ji] = canon.slice(0, -1) + `,"digest":"${sha(Buffer.from(canon, 'utf8'))}"}`;
        writeFileSync(sp, lines.join('\n'));
        writeFileSync(`${sp}.sha256`, `${sha(readFileSync(sp))}  ${sp.split('/').pop()}\n`);
        const v = runTool(['verify', sp]);
        if (!(v.status === 0 && /RECEIPT: VALID/.test(lastLine(v)))) { b6ok = false; b6d.push(`synth:exit=${v.status} ${lastLine(v).slice(0, 60)}`); }
      }
    } catch (e) { b6ok = false; b6d.push(`synth:${e.message}`); }
    if (b6d.length === 0) b6d.push('3 r51 + 3 r52 receipts + synthesized v1 receipt VALID under v3');
  } else { b6ok = false; b6d.push('tool or r51/r52 receipts absent'); }
  hold('B6', b6ok, b6d.join(';'));

  // B7a — R52-9 evasion challenge: nonce-reusing twin hidden under a non-.txt name.
  let b7aok = false; let b7ad = '';
  if (existsSync(tool)) {
    const base = join(T, `b7a-${randomBytes(6).toString('hex')}`);
    const r = runTool(['run', '--out', base, '--', '/usr/bin/printf', '%s', 'b7a-original']);
    const rcpt = `${base}.txt`;
    if (r.status !== 0 || !existsSync(rcpt) || !existsSync(`${rcpt}.sha256`)) {
      b7ad = `run exit=${r.status}`;
    } else {
      try {
        const lines = readFileSync(rcpt, 'utf8').split('\n');
        const ji = lines.findIndex((l) => l.trimStart().startsWith('{'));
        const body = JSON.parse(lines[ji]);
        const nonce = body.nonce;
        body.argv = [...(body.argv || []), 'b7a-evil-append'];
        const { digest, ...restB } = body;
        const canon = JSON.stringify(sortKeys(restB));
        const evasionName = 'b7a-evil.receipt';
        const evasionPath = join(T, evasionName);
        lines[ji] = canon.slice(0, -1) + `,"digest":"${sha(Buffer.from(canon, 'utf8'))}"}`;
        writeFileSync(evasionPath, lines.join('\n'));
        writeFileSync(`${evasionPath}.sha256`, `${sha(readFileSync(evasionPath))}  ${evasionName}\n`);
        const vE = runTool(['verify', evasionPath]);
        const evasionAloneValid = vE.status === 0 && /RECEIPT: VALID/.test(lastLine(vE));
        const ledgerDir = mkdtempSync(join(tmpdir(), 'a53-b7a.'));
        copyFileSync(rcpt, join(ledgerDir, 'orig.txt'));
        writeFileSync(join(ledgerDir, 'orig.txt.sha256'), rekeySidecar(`${rcpt}.sha256`, 'orig.txt'));
        copyFileSync(evasionPath, join(ledgerDir, evasionName));
        writeFileSync(join(ledgerDir, `${evasionName}.sha256`), rekeySidecar(`${evasionPath}.sha256`, evasionName));
        const vL = runTool(['verify', '--ledger', ledgerDir, join(ledgerDir, 'orig.txt')]);
        const replay = vL.status === 1 && /RECEIPT: REPLAY/.test(lastLine(vL));
        const named = new RegExp(`already bound to a different record in ${evasionName.replace('.', '\\.')}`).test(`${vL.stdout || ''}`);
        b7aok = evasionAloneValid && replay && named;
        b7ad = `evasionAlone=${evasionAloneValid ? 'VALID' : lastLine(vE).slice(0, 50)} ledger(orig)=${replay ? 'REPLAY' : lastLine(vL).slice(0, 50)} namesEvasionFile=${named} nonce=${nonce.slice(0, 8)}`;
        rmSync(ledgerDir, { recursive: true, force: true });
      } catch (e) {
        b7ad = `craft failed: ${e.message}`;
      }
    }
  } else b7ad = 'tool absent';
  hold('B7a', b7aok, b7ad);

  // B7b — an attested prior under ANY extension is evidence.
  let b7bok = false; let b7bd = '';
  if (existsSync(tool)) {
    const scratch = mkdtempSync(join(tmpdir(), 'a53-b7b.'));
    try {
      const priorBase = join(scratch, 'prior');
      const pr = runTool(['run', '--out', priorBase, '--', '/usr/bin/printf', '%s', 'b7b-prior']);
      const priorFile = `${priorBase}.txt`;
      if (pr.status !== 0 || !existsSync(priorFile)) {
        b7bd = `prior run exit=${pr.status}`;
      } else {
        const priorBody = JSON.parse(jsonLineOf(priorFile));
        const ledgerDir = mkdtempSync(join(tmpdir(), 'a53-b7b-ledger.'));
        try {
          const anyName = 'witness.log';
          const anyPath = join(ledgerDir, anyName);
          writeFileSync(anyPath, readFileSync(priorFile));
          writeFileSync(`${anyPath}.sha256`, rekeySidecar(`${priorFile}.sha256`, anyName));
          const subjBase = join(T, `b7b-${randomBytes(6).toString('hex')}`);
          const sr = runTool(['run', '--out', subjBase, '--', '/usr/bin/printf', '%s', 'b7b-subject']);
          const subjFile = `${subjBase}.txt`;
          if (sr.status !== 0 || !existsSync(subjFile)) {
            b7bd = `subject run exit=${sr.status}`;
          } else {
            const slines = readFileSync(subjFile, 'utf8').split('\n');
            const sji = slines.findIndex((l) => l.trimStart().startsWith('{'));
            const sbody = JSON.parse(slines[sji]);
            sbody.nonce = priorBody.nonce;
            const { digest, ...restS } = sbody;
            const canon = JSON.stringify(sortKeys(restS));
            slines[sji] = canon.slice(0, -1) + `,"digest":"${sha(Buffer.from(canon, 'utf8'))}"}`;
            writeFileSync(subjFile, slines.join('\n'));
            writeFileSync(`${subjFile}.sha256`, `${sha(readFileSync(subjFile))}  ${subjFile.split('/').pop()}\n`);
            const v = runTool(['verify', '--ledger', ledgerDir, subjFile]);
            const replay = v.status === 1 && /RECEIPT: REPLAY/.test(lastLine(v));
            const named = /already bound to a different record in witness\.log/.test(`${v.stdout || ''}`);
            b7bok = replay && named;
            b7bd = `ledger(subject)=${replay ? 'REPLAY' : lastLine(v).slice(0, 50)} namesWitnessLog=${named}`;
          }
        } finally { try { rmSync(ledgerDir, { recursive: true, force: true }); } catch {} }
      }
    } catch (e) {
      b7bd = `craft failed: ${e.message}`;
    } finally { try { rmSync(scratch, { recursive: true, force: true }); } catch {} }
  } else b7bd = 'tool absent';
  hold('B7b', b7bok, b7bd);

  // B7c — byte-identical duplicate under a different extension stays exempt.
  let b7cok = false; let b7cd = '';
  if (existsSync(tool)) {
    const base = join(T, `b7c-${randomBytes(6).toString('hex')}`);
    const r = runTool(['run', '--out', base, '--', '/usr/bin/printf', '%s', 'b7c-same-bytes']);
    const rcpt = `${base}.txt`;
    if (r.status !== 0 || !existsSync(rcpt)) {
      b7cd = `run exit=${r.status}`;
    } else {
      const ledgerDir = mkdtempSync(join(tmpdir(), 'a53-b7c.'));
      try {
        const dupName = 'dup.receipt';
        const dupPath = join(ledgerDir, dupName);
        writeFileSync(dupPath, readFileSync(rcpt));
        writeFileSync(`${dupPath}.sha256`, rekeySidecar(`${rcpt}.sha256`, dupName));
        const v = runTool(['verify', '--ledger', ledgerDir, rcpt]);
        b7cok = v.status === 0 && /RECEIPT: VALID/.test(lastLine(v));
        b7cd = b7cok ? 'same-digest duplicate under .receipt is exempt' : `exit=${v.status} ${JSON.stringify(lastLine(v).slice(0, 100))}`;
      } finally { try { rmSync(ledgerDir, { recursive: true, force: true }); } catch {} }
    }
  } else b7cd = 'tool absent';
  hold('B7c', b7cok, b7cd);

  // B7d — whole-dir robustness: subdirectory + foreign files skipped with notes, no crash.
  let b7dok = false; let b7dd = '';
  if (existsSync(tool)) {
    const base = join(T, `b7d-${randomBytes(6).toString('hex')}`);
    const r = runTool(['run', '--out', base, '--', '/usr/bin/printf', '%s', 'b7d-amid-junk']);
    const rcpt = `${base}.txt`;
    if (r.status !== 0 || !existsSync(rcpt)) {
      b7dd = `run exit=${r.status}`;
    } else {
      const ledgerDir = mkdtempSync(join(tmpdir(), 'a53-b7d.'));
      try {
        mkdirSync(join(ledgerDir, 'nested-dir'));
        writeFileSync(join(ledgerDir, 'notes.json'), '{"not":"a receipt"}\n');
        writeFileSync(join(ledgerDir, 'stray.sha256'), `${'0'.repeat(64)}  stray\n`);
        const v = runTool(['verify', '--ledger', ledgerDir, rcpt]);
        const text = `${v.stdout || ''}`;
        const valid = v.status === 0 && /RECEIPT: VALID/.test(lastLine(v));
        const dirNote = /ledger skipped nested-dir: not an attested receipt \(not a regular file\)/.test(text);
        const jsonNote = /ledger skipped notes\.json: not an attested receipt/.test(text);
        const sideNote = /ledger skipped stray\.sha256: not an attested receipt/.test(text);
        b7dok = valid && dirNote && jsonNote && sideNote;
        b7dd = `valid=${valid} dirNote=${dirNote} jsonNote=${jsonNote} sideNote=${sideNote}`;
      } finally { try { rmSync(ledgerDir, { recursive: true, force: true }); } catch {} }
    }
  } else b7dd = 'tool absent';
  hold('B7d', b7dok, b7dd);
} catch (e) {
  process.stderr.write(`ATTEST53: FAIL-CLOSED ${e.stack || e}\n`);
  process.exit(2);
} finally {
  try { rmSync(T, { recursive: true, force: true }); } catch {}
}

const held = checks.filter((c) => c.ok).length;
// R52-5 guard: the HELD label requires a non-empty check set (no vacuous held=0/0).
const label = held === checks.length && checks.length > 0 ? 'ATTEST53_HELD' : 'ATTEST53_UNMET';
process.stdout.write(`ATTEST53: ${label} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} version=${VERSION} | ${checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail.slice(0, 80)}`}`).join(' | ')}\n`);
process.exit(held === checks.length && checks.length > 0 ? 0 : 1);
