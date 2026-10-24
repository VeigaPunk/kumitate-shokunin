#!/usr/bin/env node
/**
 * attest54-probe.mjs — FROZEN counter for kumitate round 54, claim C1 (rule `A54`), v1.
 *
 *   node .ufo/waves/round-54/probe/attest54-probe.mjs <lane> <rev>
 *
 * Counter for the `counter-pins` capability acquisition (contract
 * `kumitate-counter-pins-v1`): the pinned-counter registry gate — the B5d arm
 * beyond the round-53 H6 source-pin rule, a MECHANICAL check that the lane's
 * frozen round counters and the instruments they judge are byte-identical to
 * the hashes the round plans froze (planned round-53 candidate (2)). Freeze
 * history: v1 is the first version of this rule. Frozen AND executed at base
 * before any data seat ran (base/attest54-base.txt, QUALITY Q43), with a
 * scratch-HELD witness of a synthetic conformant post-state committed at freeze
 * (witness/scratch-held.txt, lesson M5).
 *
 * Scores ten checks over the committed bytes of <rev> (extracted with `git
 * archive`, never the working tree):
 *   B1  scripts/counter-pins.mjs exists at rev and `node scripts/counter-pins.mjs
 *       --selftest` exits 0 with final line `COUNTER_PINS_SELFTEST: PASS (n/n)`,
 *       n >= 10, and >= 10 lines matching `^case <name>: PASS`.
 *   B2  the registry `.ufo/pins/counter-pins.json` exists at rev and parses
 *       (version 1, pins array, distinct names); `node scripts/counter-pins.mjs`
 *       in the extracted tree exits 0 with `COUNTER_PINS: CLEAN (pins=N)` and
 *       N >= 5 (the two round-53 counters + the round-53 instrument + the two
 *       round-54 counters).
 *   B3  DRIFT arms, each crafted in the scratch extraction and restored: (a) one
 *       registry hash flipped -> `COUNTER_PINS: DRIFT` exit 1 naming the pin;
 *       (b) one pinned file deleted -> DRIFT `absent`; (c) one pinned file
 *       replaced by a symlink -> DRIFT `not-a-regular-file` (a pin binds bytes,
 *       not a name).
 *   B4  FAIL-CLOSED arms: (a) registry overwritten with malformed JSON -> exit 2;
 *       (b) registry version 2 -> exit 2; (c) duplicate pin names -> exit 2. A
 *       malformed registry is could-not-evaluate, never CLEAN and never a score.
 *   B5  the registry carries the round-53 frozen pins WITHOUT REGRESSION — the
 *       entries named attest53-probe / doctrine53-probe / receipt-attest equal
 *       the round-53 plan §Counters pins by name, path and sha256
 *       (e8d016bb36df…, da693cf1373f…, ba5139b1290b…) — and every registry
 *       entry's sha256 matches the blob at <rev> (the registry is honest at the
 *       judged revision, not only at freeze).
 *   B5c VACUOUS-HELD guard (R52-5 lineage): the extracted tree carries
 *       .ufo/waves/round-54/build/MutCounter54/counter-mutant.txt whose
 *       transcript shows the hold-call-deleted A54 mutant printing
 *       `ATTEST54_UNMET held=0/0` with exit 1, and this probe's own source (the
 *       JUDGED bytes, pinned in the registry under B5) carries the
 *       checks-nonempty guard.
 *   B6  pin.counter-pins in the SCORECARD.md `kumitate-gate-pins-v1` block
 *       equals the sha256 of the extracted scripts/counter-pins.mjs, and
 *       `node scripts/proxy-check.mjs --strict` exits 0 with `PROXY: MATCH`
 *       (the new gate travels with the pin block and the proxy stanza).
 *   B7  SKILL.md at rev names `counter-pins` in the gate registry with contract
 *       `kumitate-counter-pins-v1`, and the `## Verifiable checklist` carries exactly
 *       24 items whose item 24 names `node scripts/counter-pins.mjs` (the EXECUTED
 *       pass count is the H1 harm rule, not this check — a frozen counter reads
 *       committed bytes only).
 *   B8  the three committed receipts .ufo/waves/round-54/receipts/
 *       attest54-run-{1,2,3}.txt (+ sidecars) each verify `RECEIPT: VALID` exit 0
 *       under `verify --ledger` over the receipts dir (the doctored control and
 *       sidecars skip with notes, never evidence); embedded nonces pairwise
 *       distinct and distinct from every nonce in the round-48..53 corpora at
 *       rev; record digests pairwise distinct; span = max(wall_start) -
 *       min(wall_start) over the receipt BODY fields >= 300 s; argv is exactly
 *       the planned gate command set; the doctored control
 *       attest54-run-2-replayed.txt (prelude rewritten, sidecar untouched — the
 *       M2 forgery class) verifies `RECEIPT: TAMPERED` exit 1.
 *   B9  SCORECARD.md at rev carries a capabilities-table row `counter-pins`
 *       whose first-working round is 54 and whose evidence pointer names
 *       scripts/counter-pins.mjs (a capability enters only through a round that
 *       demonstrates it running, AXES.md §Capabilities).
 *
 * Predicate ATTEST54_HELD = held=10/10, exit 0. Any other reading is
 * `ATTEST54_UNMET held=<k>/10` exit 1. A crash or an unreadable extraction is
 * exit 2 (never a score). Frozen at `.ufo/waves/round-54/plan.md` before any
 * data seat ran; freeze repairs, if any, are named in that plan's addendum with
 * re-run base receipts.
 *
 * The frozen predicate sentence, byte-identical with plan.md §Claims and the
 * round report —
 * ATTEST54_HELD — node .ufo/waves/round-54/probe/attest54-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST54: ATTEST54_HELD held=10/10 checks=10 rev=<rev> rule=A54 version=v1" and exits 0.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RULE = 'A54';
const VERSION = 'v1';
const LANE_SENTINEL = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const REGISTRY = '.ufo/pins/counter-pins.json';
const RDIR = '.ufo/waves/round-54/receipts';
const RECEIPTS = ['attest54-run-1.txt', 'attest54-run-2.txt', 'attest54-run-3.txt'];
const DOCTORED = 'attest54-run-2-replayed.txt';
const PLANNED_ARGV = [
  ['node', 'scripts/bind-oracle.mjs', '--selftest'],
  ['node', 'scripts/sources-check.mjs'],
  ['node', 'scripts/round-gate.mjs', '--selftest'],
];
const R53_PINS = {
  'attest53-probe': { path: '.ufo/waves/round-53/probe/attest53-probe.mjs', sha256: 'e8d016bb36df69fe3e2f937bb7e85dbc68c06bf203529edf81952984ab309e33' },
  'doctrine53-probe': { path: '.ufo/waves/round-53/probe/doctrine53-probe.mjs', sha256: 'da693cf1373f38b6377653538b3dff7e232376e3356d8998eead9a5078383efd' },
  'receipt-attest': { path: 'scripts/receipt-attest.mjs', sha256: 'ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31' },
};
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('ATTEST54: USAGE node attest54-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`ATTEST54: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
// Hardening (A52 repair 6 lineage): <rev> is interpolated into a shell pipeline; only full
// hex object names are accepted, and the extraction must not contain symlinks.
if (!/^[0-9a-f]{40,64}$/.test(rev)) {
  process.stderr.write('ATTEST54: USAGE <rev> must be a full lowercase hex object name\n');
  process.exit(64);
}

const sha = (b) => createHash('sha256').update(b).digest('hex');
const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: 'utf8', timeout: 240_000, maxBuffer: 64 << 20, ...opts });

const T = mkdtempSync(join(tmpdir(), 'a54-probe.'));
const checks = [];
// Vacuous-HELD guard (B5c): a probe whose checks array is empty can never print HELD.
const hold = (id, ok, detail) => { if (typeof id === 'string') checks.push({ id, ok, detail }); };
const lastLine = (r) => `${r.stderr || ''}${r.stdout || ''}`.trim().split('\n').pop() || '';
const jsonLineOf = (file) => readFileSync(file, 'utf8').split('\n').find((l) => l.trimStart().startsWith('{'));
const cleanup = () => { try { rmSync(T, { recursive: true, force: true }); } catch {} };

try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`ATTEST54: FAIL-CLOSED git archive ${rev} exit=${tar.status}\n`);
    cleanup();
    process.exit(2);
  }
  const sym = spawnSync('bash', ['-lc', `find ${JSON.stringify(T)} -type l -print -quit`], { encoding: 'utf8', timeout: 60_000 });
  if (sym.status !== 0 || (sym.stdout || '').trim() !== '') {
    process.stderr.write('ATTEST54: FAIL-CLOSED extraction contains a symlink\n');
    cleanup();
    process.exit(2);
  }
  const gate = join(T, 'scripts', 'counter-pins.mjs');
  const tool = join(T, 'scripts', 'receipt-attest.mjs');
  const regPath = join(T, REGISTRY);
  const runGate = (args, opts = {}) => sh('node', [gate, ...args], { cwd: T, ...opts });

  // B1 — the instrument ships a hermetic selftest with >= 10 cases.
  let b1ok = false; let b1d = '';
  if (existsSync(gate)) {
    const r = runGate(['--selftest']);
    const output = `${r.stdout || ''}`;
    const last = lastLine(r);
    const cases = output.split('\n').filter((l) => /^case\s+\S+:\s+PASS\s*$/.test(l)).length;
    const summary = /COUNTER_PINS_SELFTEST: PASS \((\d+)\/(\d+)\)/.exec(output);
    b1ok = r.status === 0 && !!summary && Number(summary[1]) === Number(summary[2])
      && Number(summary[1]) >= 10 && cases >= 10 && /VERDICT: PASS/.test(last);
    b1d = b1ok ? `selftest PASS cases=${cases}` : `exit=${r.status} cases=${cases} last=${JSON.stringify(last.slice(0, 120))}`;
  } else {
    b1d = 'scripts/counter-pins.mjs absent';
  }
  hold('B1', b1ok, b1d);

  // B2 — the registry parses and the live run is CLEAN with >= 5 pins.
  let b2ok = false; let b2d = '';
  if (existsSync(regPath) && existsSync(gate)) {
    let doc = null;
    try {
      doc = JSON.parse(readFileSync(regPath, 'utf8'));
    } catch {
      b2d = 'registry unparsable';
    }
    if (doc) {
      const names = new Set((doc.pins || []).map((p) => p && p.name));
      const r = runGate([]);
      const last = lastLine(r);
      const m = /^COUNTER_PINS: CLEAN pins=(\d+)$/.exec(last);
      b2ok = r.status === 0 && !!m && Number(m[1]) >= 5 && names.size === (doc.pins || []).length
        && (doc.pins || []).length >= 5;
      b2d = b2ok ? `CLEAN pins=${m[1]} registryNames=${names.size}` : `exit=${r.status} last=${JSON.stringify(last.slice(0, 120))} registryPins=${(doc.pins || []).length}`;
    }
  } else {
    b2d = `${REGISTRY} or gate absent`;
  }
  hold('B2', b2ok, b2d);

  // B3/B4 — DRIFT and FAIL-CLOSED arms crafted in the scratch extraction.
  const mutateRegistry = (fn) => {
    const orig = readFileSync(regPath);
    let doc;
    try {
      doc = JSON.parse(orig.toString('utf8'));
    } catch {
      return { skipped: 'base registry unparsable' };
    }
    const next = fn(doc);
    writeFileSync(regPath, typeof next === 'string' ? next : JSON.stringify(next, null, 2));
    const r = runGate([]);
    writeFileSync(regPath, orig);
    return { r, last: lastLine(r) };
  };
  let b3ok = true; const b3fails = [];
  if (existsSync(regPath) && existsSync(gate)) {
    {
      const { skipped, r, last } = mutateRegistry((d) => {
        const c = JSON.parse(JSON.stringify(d));
        c.pins[0].sha256 = '0'.repeat(64);
        return c;
      });
      if (skipped) { b3ok = false; b3fails.push(`flip:${skipped}`); }
      else if (!(r.status === 1 && /COUNTER_PINS: DRIFT pins=\d+ bad=\d+ first=\S+:hash-mismatch/.test(last))) {
        b3ok = false; b3fails.push(`flip:exit=${r.status} last=${JSON.stringify(last.slice(0, 100))}`);
      }
    }
    {
      const victim = join(T, R53_PINS['receipt-attest'].path);
      const orig = readFileSync(victim);
      rmSync(victim);
      const r = runGate([]);
      writeFileSync(victim, orig);
      const last = lastLine(r);
      if (!(r.status === 1 && /first=\S+:absent/.test(last))) {
        b3ok = false; b3fails.push(`delete:exit=${r.status} last=${JSON.stringify(last.slice(0, 100))}`);
      }
    }
    {
      const victim = join(T, R53_PINS['doctrine53-probe'].path);
      const orig = readFileSync(victim);
      rmSync(victim);
      symlinkSync(join(T, 'scripts', 'counter-pins.mjs'), victim);
      const r = runGate([]);
      rmSync(victim);
      writeFileSync(victim, orig);
      const last = lastLine(r);
      if (!(r.status === 1 && /first=\S+:not-a-regular-file/.test(last))) {
        b3ok = false; b3fails.push(`symlink:exit=${r.status} last=${JSON.stringify(last.slice(0, 100))}`);
      }
    }
  } else {
    b3ok = false; b3fails.push('registry or gate absent');
  }
  hold('B3', b3ok, b3ok ? 'flip/delete/symlink arms DRIFT' : b3fails.join(';'));

  let b4ok = true; const b4fails = [];
  if (existsSync(regPath) && existsSync(gate)) {
    {
      const { skipped, r, last } = mutateRegistry(() => '{ broken');
      if (skipped) { b4ok = false; b4fails.push(`json:${skipped}`); }
      else if (!(r.status === 2 && /COUNTER_PINS: FAIL-CLOSED reason=registry not valid JSON/.test(last))) {
        b4ok = false; b4fails.push(`json:exit=${r.status} last=${JSON.stringify(last.slice(0, 100))}`);
      }
    }
    {
      const { skipped, r, last } = mutateRegistry((d) => ({ ...d, version: 2 }));
      if (skipped) { b4ok = false; b4fails.push(`version:${skipped}`); }
      else if (!(r.status === 2 && /FAIL-CLOSED reason=registry version 2 !== 1/.test(last))) {
        b4ok = false; b4fails.push(`version:exit=${r.status} last=${JSON.stringify(last.slice(0, 100))}`);
      }
    }
    {
      const { skipped, r, last } = mutateRegistry((d) => {
        const c = JSON.parse(JSON.stringify(d));
        c.pins.push({ ...c.pins[0] });
        return c;
      });
      if (skipped) { b4ok = false; b4fails.push(`dup:${skipped}`); }
      else if (!(r.status === 2 && /FAIL-CLOSED reason=duplicate pin name/.test(last))) {
        b4ok = false; b4fails.push(`dup:exit=${r.status} last=${JSON.stringify(last.slice(0, 100))}`);
      }
    }
  } else {
    b4ok = false; b4fails.push('registry or gate absent');
  }
  hold('B4', b4ok, b4ok ? 'json/version/dup arms FAIL-CLOSED' : b4fails.join(';'));

  // B5 — the round-53 pins ride without regression; every entry honest at rev.
  let b5ok = false; let b5d = '';
  if (existsSync(regPath)) {
    try {
      const doc = JSON.parse(readFileSync(regPath, 'utf8'));
      const byName = new Map((doc.pins || []).map((p) => [p.name, p]));
      const r53ok = Object.entries(R53_PINS).every(([name, want]) => {
        const got = byName.get(name);
        return got && got.path === want.path && got.sha256 === want.sha256;
      });
      let honest = true; const dishonest = [];
      for (const p of doc.pins || []) {
        const abs = join(T, p.path);
        if (!existsSync(abs) || lstatSync(abs).isDirectory() || sha(readFileSync(abs)) !== p.sha256) {
          honest = false;
          dishonest.push(p.name);
        }
      }
      const selfPin = byName.get('attest54-probe');
      const selfSrc = join(T, '.ufo/waves/round-54/probe/attest54-probe.mjs');
      const selfHonest = selfPin && existsSync(selfSrc) && selfPin.path === '.ufo/waves/round-54/probe/attest54-probe.mjs'
        && sha(readFileSync(selfSrc)) === selfPin.sha256;
      b5ok = r53ok && honest && selfHonest;
      b5d = b5ok ? `r53 pins intact, ${(doc.pins || []).length} entries honest at rev`
        : `r53ok=${r53ok} honest=${honest} dishonest=${dishonest.join(',')} selfPin=${!!selfHonest}`;
    } catch (e) {
      b5d = `registry unparsable: ${e.message}`;
    }
  } else {
    b5d = `${REGISTRY} absent`;
  }
  hold('B5', b5ok, b5d);

  // B5c — vacuous-HELD guard: committed mutant transcript + judged-bytes guard.
  let b5cok = false; let b5cd = '';
  {
    const mutant = join(T, '.ufo/waves/round-54/build/MutCounter54/counter-mutant.txt');
    const selfSrc = join(T, '.ufo/waves/round-54/probe/attest54-probe.mjs');
    if (existsSync(mutant) && existsSync(selfSrc)) {
      const mt = readFileSync(mutant, 'utf8');
      const src = readFileSync(selfSrc, 'utf8');
      const transcriptOk = /ATTEST54: ATTEST54_UNMET held=0\/0 checks=0/.test(mt) && /exit=1/.test(mt);
      const guardOk = src.includes('checks.length === 0') && /const hold = .*checks\.push/s.test(src);
      b5cok = transcriptOk && guardOk;
      b5cd = b5cok ? 'mutant transcript + guard present' : `transcript=${transcriptOk} guard=${guardOk}`;
    } else {
      b5cd = 'mutant transcript or judged source absent';
    }
  }
  hold('B5c', b5cok, b5cd);

  // B6 — pin.counter-pins matches the instrument bytes; the proxy recomputes MATCH.
  let b6ok = false; let b6d = '';
  if (existsSync(gate)) {
    const score = join(T, 'SCORECARD.md');
    const want = sha(readFileSync(gate));
    let pinOk = false;
    if (existsSync(score)) {
      const m = /pin\.counter-pins=([0-9a-f]{64})/.exec(readFileSync(score, 'utf8'));
      pinOk = !!m && m[1] === want;
    }
    const r = sh('node', [join(T, 'scripts', 'proxy-check.mjs'), '--strict'], { cwd: T });
    const last = lastLine(r);
    b6ok = pinOk && r.status === 0 && /PROXY: MATCH/.test(last);
    b6d = b6ok ? 'pin match; PROXY: MATCH' : `pinOk=${pinOk} proxyExit=${r.status} last=${JSON.stringify(last.slice(0, 140))}`;
  } else {
    b6d = 'scripts/counter-pins.mjs absent';
  }
  hold('B6', b6ok, b6d);

  // B7 — gate-registry row + exactly 24 checklist items, item 24 naming the gate.
  let b7ok = false; let b7d = '';
  {
    const skill = join(T, 'SKILL.md');
    if (existsSync(skill)) {
      const text = readFileSync(skill, 'utf8');
      const rowOk = /\|\s*counter-pins\s*\|/.test(text) && text.includes('kumitate-counter-pins-v1');
      const items = text.split('\n').filter((l) => /^\s*- \[[ x~]\]/.test(l));
      const item24 = items.length >= 24 && /node scripts\/counter-pins\.mjs/.test(items[23] || '');
      b7ok = rowOk && items.length === 24 && item24;
      b7d = b7ok ? 'registry row + 24 items, item 24 = counter-pins'
        : `row=${rowOk} items=${items.length} item24=${item24}`;
    } else {
      b7d = 'SKILL.md absent';
    }
  }
  hold('B7', b7ok, b7d);

  // B8 — the receipt set: VALID under the whole-dir ledger, planned argv, span, distinct
  // nonces (also against the 48..53 corpora), distinct record digests, doctored TAMPERED.
  let b8ok = false; let b8d = '';
  if (existsSync(tool)) {
    const rdir = join(T, RDIR);
    const runTool = (args, opts = {}) => sh('node', [tool, ...args], { cwd: T, ...opts });
    const bodies = [];
    const fails = [];
    for (const name of RECEIPTS) {
      const abs = join(rdir, name);
      if (!existsSync(abs)) {
        fails.push(`${name}:absent`);
        continue;
      }
      const r = runTool(['verify', '--ledger', rdir, abs]);
      const last = lastLine(r);
      if (!(r.status === 0 && /RECEIPT: VALID/.test(last))) {
        fails.push(`${name}:exit=${r.status} last=${JSON.stringify(last.slice(0, 80))}`);
        continue;
      }
      let body;
      try {
        body = JSON.parse(jsonLineOf(abs));
      } catch {
        fails.push(`${name}:body-unparsable`);
        continue;
      }
      bodies.push({ name, body });
    }
    if (fails.length === 0 && bodies.length === 3) {
      const argvOk = bodies.every(({ body }, i) => JSON.stringify(body.argv) === JSON.stringify(PLANNED_ARGV[i]));
      const nonces = bodies.map(({ body }) => body.nonce);
      const digests = bodies.map(({ body }) => body.digest);
      const nonceDistinct = new Set(nonces).size === 3;
      const digestDistinct = new Set(digests).size === 3;
      const starts = bodies.map(({ body }) => Date.parse(body.wall_start)).filter((n) => Number.isFinite(n));
      const span = starts.length === 3 ? (Math.max(...starts) - Math.min(...starts)) / 1000 : -1;
      let priorNonceFree = true;
      for (let round = 48; round <= 53; round++) {
        const wdir = join(T, '.ufo', 'waves', `round-${round}`);
        if (!existsSync(wdir)) continue;
        const scan = spawnSync('bash', ['-lc',
          `grep -rhoE '"nonce":"[0-9a-f]{32}"' ${JSON.stringify(wdir)} 2>/dev/null || true`],
          { encoding: 'utf8', timeout: 120_000 });
        for (const n of nonces) {
          if ((scan.stdout || '').includes(`"nonce":"${n}"`)) priorNonceFree = false;
        }
      }
      const docAbs = join(rdir, DOCTORED);
      let docOk = false; let docDetail = 'absent';
      if (existsSync(docAbs)) {
        const r = runTool(['verify', '--ledger', rdir, docAbs]);
        const last = lastLine(r);
        docOk = r.status === 1 && /RECEIPT: TAMPERED/.test(last);
        docDetail = `exit=${r.status} last=${JSON.stringify(last.slice(0, 80))}`;
      }
      b8ok = argvOk && nonceDistinct && digestDistinct && span >= 300 && priorNonceFree && docOk;
      b8d = b8ok ? `3 VALID, span=${Math.round(span)}s, nonces distinct+prior-free, doctored TAMPERED`
        : `argv=${argvOk} nonceDistinct=${nonceDistinct} digestDistinct=${digestDistinct} span=${Math.round(span)} priorFree=${priorNonceFree} doctored=${docDetail}`;
    } else {
      b8d = fails.join(';') || `bodies=${bodies.length}`;
    }
  } else {
    b8d = 'scripts/receipt-attest.mjs absent';
  }
  hold('B8', b8ok, b8d);

  // B9 — the capability row enters the SCORECARD capabilities table.
  let b9ok = false; let b9d = '';
  {
    const score = join(T, 'SCORECARD.md');
    if (existsSync(score)) {
      const line = readFileSync(score, 'utf8').split('\n').find((l) => /\|\s*`counter-pins`\s*\|/.test(l)) || '';
      const cap = line !== '';
      const round54 = /\|\s*54\s*\|\s*$/.test(line);
      const evidence = cap && line.includes('scripts/counter-pins.mjs');
      b9ok = cap && round54 && evidence;
      b9d = b9ok ? 'capability row round 54 with evidence pointer' : `cap=${cap} round54=${round54} evidence=${evidence}`;
    } else {
      b9d = 'SCORECARD.md absent';
    }
  }
  hold('B9', b9ok, b9d);

  const held = checks.filter((c) => c.ok).length;
  const total = checks.length;
  // The guard the B5c arm pins in the JUDGED bytes: an empty check list can never HELD.
  if (checks.length === 0) {
    process.stdout.write(`ATTEST54: ATTEST54_UNMET held=0/0 checks=0 rev=${rev} rule=${RULE} version=${VERSION}\nexit=1\n`);
    cleanup();
    process.exit(1);
  }
  const verdict = held === total ? 'ATTEST54_HELD' : 'ATTEST54_UNMET';
  const parts = checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${(c.detail || '').slice(0, 160)}`}`).join(' | ');
  process.stdout.write(`ATTEST54: ${verdict} held=${held}/${total} checks=${total} rev=${rev} rule=${RULE} version=${VERSION} | ${parts}\nexit=${held === total ? 0 : 1}\n`);
  cleanup();
  process.exit(held === total ? 0 : 1);
} catch (e) {
  process.stderr.write(`ATTEST54: FAIL-CLOSED ${e && e.message ? e.message : e}\n`);
  cleanup();
  process.exit(2);
}
