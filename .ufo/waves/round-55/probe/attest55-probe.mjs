#!/usr/bin/env node
/**
 * attest55-probe.mjs — FROZEN counter for kumitate round 55, claim C1 (rule `A55`), v1.
 *
 *   node .ufo/waves/round-55/probe/attest55-probe.mjs <lane> <rev>
 *
 * Counter for the `source-capture` capability acquisition (contract
 * `kumitate-source-capture-v1`): the opened-source byte-persistence gate —
 * a MECHANICAL check that every SOURCES.md row resolves to committed capture
 * bytes or an explicit exemption (routed defect R54-C1). Freeze history: v1 is
 * the first version of this rule. Frozen AND executed at base before any data
 * seat ran (base/attest55-base.txt, QUALITY Q43), with a scratch-HELD witness
 * of a synthetic conformant post-state committed at freeze
 * (witness/scratch-held-attest.txt, lesson M5).
 *
 * Scores ten checks over the committed bytes of <rev> (extracted with `git
 * archive`, never the working tree):
 *   B1  scripts/source-capture.mjs exists at rev and `node scripts/source-capture.mjs
 *       --selftest` exits 0 with final line `SOURCE_CAPTURE_SELFTEST: PASS (n/n)`,
 *       n >= 13, and >= 13 lines matching `^case <name>: PASS`.
 *   B2  the registry `.ufo/pins/source-captures.json` exists at rev and parses
 *       (version 1, captures and exemptions arrays, distinct sourceIds);
 *       `node scripts/source-capture.mjs` in the extracted tree exits 0 with
 *       `SOURCE_CAPTURE: CLEAN` and captures >= 5 (S108 backfill + S109..S112).
 *   B3  DRIFT arms, each crafted in the scratch extraction and restored: (a) one
 *       capture hash flipped -> DRIFT `hash-mismatch`; (b) one captured file
 *       deleted -> DRIFT `capture-absent`; (c) one captured file replaced by a
 *       symlink -> DRIFT `not-a-regular-file`; (d) one SOURCES row appended
 *       without a registry entry -> DRIFT `uncaptured`; (e) one capture added
 *       for a row absent from SOURCES.md -> DRIFT `orphan-capture`.
 *   B4  FAIL-CLOSED arms: (a) registry overwritten with malformed JSON -> exit 2;
 *       (b) registry version 2 -> exit 2; (c) duplicate sourceIds -> exit 2;
 *       (d) one sourceId in captures AND exemptions -> exit 2; (e) sources doc
 *       removed -> exit 2. A malformed registry or an unreadable sources doc is
 *       could-not-evaluate, never CLEAN and never a score.
 *   B5  the counter registry `.ufo/pins/counter-pins.json` carries the round-54
 *       frozen pins WITHOUT REGRESSION — the entries named attest54-probe /
 *       doctrine54-probe / counter-pins equal the round-54 plan §Counters pins
 *       by name, path and sha256 — and every registry entry's sha256 matches
 *       the blob at <rev>.
 *   B5c VACUOUS-HELD guard (R52-5 lineage): the extracted tree carries
 *       .ufo/waves/round-55/build/MutCounter55/counter-mutant.txt whose
 *       transcript shows the hold-call-deleted A55 mutant printing
 *       `ATTEST55_UNMET held=0/0` with exit 1, and this probe's own source (the
 *       JUDGED bytes, pinned in the registry under B5) carries the
 *       checks-nonempty guard.
 *   B6  pin.source-capture in the SCORECARD.md `kumitate-gate-pins-v1` block
 *       equals the sha256 of the extracted scripts/source-capture.mjs, and
 *       `node scripts/proxy-check.mjs --strict` exits 0 with `PROXY: MATCH`.
 *   B7  SKILL.md at rev names `source-capture` in the gate registry with
 *       contract `kumitate-source-capture-v1`, and the `## Verifiable checklist`
 *       carries exactly 25 items whose item 25 names `node scripts/source-capture.mjs`.
 *   B8  the three committed receipts .ufo/waves/round-55/receipts/
 *       attest-run-{1,2,3}.txt (+ sidecars) each verify `RECEIPT: VALID` exit 0
 *       under `verify --ledger` over the receipts dir (the doctored control and
 *       sidecars skip with notes, never evidence); embedded nonces pairwise
 *       distinct and distinct from every nonce in the round-48..54 corpora at
 *       rev; wall_start span >= 300 s across the three.
 *   B9  routed-defect binding (R54-C1): the registry capture for S108 resolves
 *       to committed bytes at <rev> whose sha256 equals
 *       3edddaa1959c70dbd9953648e54759b5a2bc167cd121805124e5faafa0eca40f, and
 *       corpus/lessons/round-55.md `## Mistakes` names R54-C1.
 *   B10 coverage: the union of registry capture + exempt sourceIds at <rev>
 *       equals exactly the S### row id set of corpus/SOURCES.md at <rev>.
 *
 * Predicate ATTEST55_HELD = held=10/10, exit 0. Any other reading is
 * `ATTEST55_UNMET held=<k>/10` exit 1. A crash or an unreadable extraction is
 * exit 2 (never a score). Frozen at `.ufo/waves/round-55/plan.md` § C1 before
 * any data seat ran.
 *
 * The frozen predicate sentence, byte-identical with plan.md §Claims and the
 * round report —
 * ATTEST55_HELD — node .ufo/waves/round-55/probe/attest55-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST55: ATTEST55_HELD held=10/10 checks=10 rev=<rev> rule=A55 version=v1" and exits 0.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RULE = 'A55';
const GATE = 'scripts/source-capture.mjs';
const REG = '.ufo/pins/source-captures.json';
const PINS = '.ufo/pins/counter-pins.json';
const S108_SHA = '3edddaa1959c70dbd9953648e54759b5a2bc167cd121805124e5faafa0eca40f';
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('ATTEST55: USAGE node attest55-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`ATTEST55: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
if (!/^[0-9a-f]{40,64}$/.test(rev)) {
  process.stderr.write('ATTEST55: USAGE <rev> must be a full lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
class EarlyExit extends Error {}
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });
const run = (args, opts = {}) => spawnSync(args[0], args.slice(1), { encoding: 'utf8', timeout: 120_000, maxBuffer: 32 << 20, ...opts });
const git = (args) => run(['git', '-C', lane, ...args]);

const T = mkdtempSync(join(tmpdir(), 'a55-probe.'));
try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`ATTEST55: FAIL-CLOSED rev unreadable (${tar.status})\n`);
    process.exit(2);
  }
  const g = (...a) => spawnSync('bash', ['-lc', a.join(' ')], { cwd: T, encoding: 'utf8', timeout: 120_000, maxBuffer: 32 << 20 });
  const nodeRun = (args) => spawnSync(process.execPath, args, { cwd: T, encoding: 'utf8', timeout: 120_000, maxBuffer: 32 << 20 });
  const last = (r) => `${r.stdout || ''}`.trim().split('\n').pop() || '';
  const readT = (p) => { try { return readFileSync(join(T, p)); } catch { return null; } };

  // B1 — gate exists, selftest green >= 13 cases
  {
    const gate = readT(GATE);
    if (!gate) { hold('B1', false, 'gate absent'); }
    else {
      const r = nodeRun([join(T, GATE), '--selftest']);
      const out = `${r.stdout}`;
      const passCases = (out.match(/^case [^\n]+: PASS/gm) || []).length;
      const final = last(r);
      const m = final.match(/SOURCE_CAPTURE_SELFTEST: PASS \((\d+)\/(\d+)\)/);
      hold('B1', r.status === 0 && m && +m[1] >= 13 && +m[1] === +m[2] && passCases >= 13,
        `exit=${r.status} cases=${passCases} last=${JSON.stringify(final)}`);
    }
  }
  // B2 — registry parses; gate CLEAN, captures >= 5
  {
    const regRaw = readT(REG);
    let reg = null;
    try { reg = regRaw && JSON.parse(regRaw.toString('utf8')); } catch {}
    if (!reg || reg.version !== 1 || !Array.isArray(reg.captures) || !Array.isArray(reg.exemptions)) {
      hold('B2', false, 'registry absent or malformed');
    } else {
      const r = nodeRun([join(T, GATE)]);
      const m = last(r).match(/SOURCE_CAPTURE: CLEAN captures=(\d+) exemptions=(\d+)/);
      hold('B2', r.status === 0 && m && +m[1] >= 5,
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
  }
  // B3 — five DRIFT arms over the scratch extraction
  {
    const arm = (mutate, expect) => {
      const undo = mutate();
      const r = nodeRun([join(T, GATE)]);
      const ok = r.status === 1 && last(r).includes(expect);
      undo();
      return ok;
    };
    let reg = null;
    try { reg = JSON.parse(readT(REG).toString('utf8')); } catch {}
    const cap0 = reg && reg.captures && reg.captures[0];
    if (!cap0) { hold('B3', false, 'registry absent or no captures'); } else {
    const res = [];
    // (a) hash flip
    res.push(arm(() => {
      const d = JSON.parse(readFileSync(join(T, REG)));
      d.captures[0].sha256 = '0'.repeat(64);
      writeFileSync(join(T, REG), JSON.stringify(d, null, 2));
      return () => writeFileSync(join(T, REG), readT(REG));
    }, 'hash-mismatch'));
    // (b) captured file deleted
    res.push(arm(() => {
      const bytes = readT(cap0.path);
      rmSync(join(T, cap0.path));
      return () => writeFileSync(join(T, cap0.path), bytes);
    }, 'capture-absent'));
    // (c) symlink
    res.push(arm(() => {
      const bytes = readT(cap0.path);
      rmSync(join(T, cap0.path));
      writeFileSync(join(T, cap0.path + '.real'), bytes);
      symlinkSync(join(T, cap0.path + '.real'), join(T, cap0.path));
      return () => { rmSync(join(T, cap0.path)); writeFileSync(join(T, cap0.path), bytes); rmSync(join(T, cap0.path + '.real'), { force: true }); };
    }, 'not-a-regular-file'));
    // (d) uncaptured row
    res.push(arm(() => {
      const sp = join(T, 'corpus/SOURCES.md');
      const before = readFileSync(sp);
      writeFileSync(sp, `${before}| S999 | x | docs | A | s | a | t | mined | 2026-01-01 | 90d | p |\n`);
      return () => writeFileSync(sp, before);
    }, 'uncaptured S999'));
    // (e) orphan capture
    res.push(arm(() => {
      const before = readFileSync(join(T, REG));
      const d = JSON.parse(before.toString('utf8'));
      d.captures.push({ sourceId: 'S998', path: cap0.path, sha256: cap0.sha256, bytes: cap0.bytes, captured: '2026-10-24' });
      writeFileSync(join(T, REG), JSON.stringify(d, null, 2));
      return () => writeFileSync(join(T, REG), before);
    }, 'orphan-capture S998'));
    hold('B3', res.every(Boolean), `arms=${res.map((x, i) => `${'abcde'[i]}=${x ? 'ok' : 'MISS'}`).join(',')}`);
    }
  }
  // B4 — FAIL-CLOSED arms
  {
    const runArm = (mutate) => {
      const undo = mutate();
      const r = nodeRun([join(T, GATE)]);
      undo();
      return r.status === 2;
    };
    let regOk = false;
    try { const d = JSON.parse(readT(REG).toString('utf8')); regOk = d && Array.isArray(d.captures) && d.captures.length > 0; } catch {}
    if (!regOk) { hold('B4', false, 'registry absent or no captures'); } else {
    const before = readFileSync(join(T, REG));
    const res = [];
    res.push(runArm(() => { writeFileSync(join(T, REG), '{ not json'); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const d = JSON.parse(readT(REG).toString('utf8')); d.version = 2; writeFileSync(join(T, REG), JSON.stringify(d)); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const d = JSON.parse(readT(REG).toString('utf8')); d.captures.push({ ...d.captures[0] }); writeFileSync(join(T, REG), JSON.stringify(d)); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const d = JSON.parse(readT(REG).toString('utf8')); d.exemptions.push({ ids: [d.captures[0].sourceId], reason: 'x' }); writeFileSync(join(T, REG), JSON.stringify(d)); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const sp = join(T, 'corpus/SOURCES.md'); const b = readFileSync(sp); rmSync(sp); return () => writeFileSync(sp, b); }));
    hold('B4', res.every(Boolean), `arms=${res.map((x, i) => `${'abcde'[i]}=${x ? 'ok' : 'MISS'}`).join(',')}`);
    }
  }
  // B3/B4/B9/B10 need the registry; absent registry = UNMET, never crash
  {
    const pinsRaw = readT(PINS);
    let pins = null;
    try { pins = pinsRaw && JSON.parse(pinsRaw.toString('utf8')); } catch {}
    const mut = readT('.ufo/waves/round-55/build/MutCounter55/counter-mutant.txt');
    const selfSrc = readT('.ufo/waves/round-55/probe/attest55-probe.mjs');
    const transcriptOk = Boolean(mut && /ATTEST55_UNMET held=0\/0/.test(mut.toString('utf8')) && /process_exit=1|exit=1|exit 1/.test(mut.toString('utf8')));
    const guardOk = Boolean(selfSrc && /checks\.length\s*===\s*0|checks\.length\s*<\s*1|checks\.length\s*>\s*0/.test(selfSrc.toString('utf8')));
    if (!pins || pins.version !== 1 || !Array.isArray(pins.pins) || pins.pins.length < 5) {
      hold('B5', false, `counter-pins registry absent or small; vacuous transcript=${transcriptOk} guard=${guardOk}`);
    } else {
      let ok = true; const misses = [];
      for (const p of pins.pins) {
        const bytes = readT(p.path);
        if (!bytes || sha(bytes) !== p.sha256) { ok = false; misses.push(p.name); }
      }
      const a54 = pins.pins.find((p) => p.name === 'attest54-probe');
      const d54 = pins.pins.find((p) => p.name === 'doctrine54-probe');
      const cp = pins.pins.find((p) => p.name === 'counter-pins');
      if (!a54 || a54.sha256 !== 'e2252e8e02e4c51b47868aadb8c12747a6f1c8b61f0652b0d686fd0e7d7a3137') { ok = false; misses.push('attest54-probe-pin'); }
      if (!d54 || d54.sha256 !== '556d5c6bea114e9558cdec4e66643c9b8cce9fc74071996adb4df3f8bc53bbb6') { ok = false; misses.push('doctrine54-probe-pin'); }
      if (!cp) { ok = false; misses.push('counter-pins-pin'); }
      const self = pins.pins.find((p) => p.name === 'attest55-probe');
      const selfBytes = self && readT(self.path);
      if (!self || self.path !== '.ufo/waves/round-55/probe/attest55-probe.mjs' || !selfBytes || sha(selfBytes) !== self.sha256) { ok = false; misses.push('attest55-probe-pin'); }
      const sc = pins.pins.find((p) => p.name === 'source-capture');
      const scBytes = sc && readT(sc.path);
      if (!sc || sc.path !== 'scripts/source-capture.mjs' || !scBytes || sha(scBytes) !== sc.sha256) { ok = false; misses.push('source-capture-pin'); }
      const d55 = pins.pins.find((p) => p.name === 'doctrine55-probe');
      const d55Bytes = d55 && readT(d55.path);
      if (!d55 || d55.path !== '.ufo/waves/round-55/probe/doctrine55-probe.mjs' || !d55Bytes || sha(d55Bytes) !== d55.sha256) { ok = false; misses.push('doctrine55-probe-pin'); }
      hold('B5', ok && transcriptOk && guardOk && pins.pins.length >= 5,
        `pins=${pins.pins.length} misses=${JSON.stringify(misses)} vacuous:transcript=${transcriptOk} guard=${guardOk}`);
    }
  }
  // B6 — pin.source-capture + proxy strict MATCH
  {
    const sc = readT('SCORECARD.md');
    const gate = readT(GATE);
    let pinOk = false;
    if (sc && gate) {
      const m = sc.toString('utf8').match(/pin\.source-capture=([0-9a-f]{64})/);
      pinOk = m && m[1] === sha(gate);
    }
    const r = nodeRun([join(T, 'scripts/proxy-check.mjs'), '--strict']);
    hold('B6', Boolean(pinOk && r.status === 0 && last(r).includes('PROXY: MATCH')),
      `pinOk=${Boolean(pinOk)} proxyExit=${r.status} last=${JSON.stringify(last(r))}`);
  }
  // B7 — SKILL registry row + checklist item 25
  {
    const sk = readT('SKILL.md');
    if (!sk) { hold('B7', false, 'SKILL.md absent'); }
    else {
      const txt = sk.toString('utf8');
      const rowOk = /\|\s*source-capture\s*\|\s*gate\s*\|/.test(txt) && txt.includes('kumitate-source-capture-v1');
      const items = (txt.match(/^\s*- \[/gm) || []).length;
      const itemOk = /- \[ \][^\n]*source-capture\.mjs/.test(txt);
      hold('B7', rowOk && items === 25 && itemOk, `row=${rowOk} items=${items} item25=${itemOk}`);
    }
  }
  // B8 — receipt-attest VALID over the three receipts, nonces distinct, span >= 300 s
  {
    const dir = join(T, '.ufo/waves/round-55/receipts');
    const files = ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt'];
    let ok = files.every((f) => existsSync(join(dir, f)) && existsSync(join(dir, `${f}.sha256`)));
    const nonces = new Set(); const times = [];
    if (ok) {
      for (const f of files) {
        const r = nodeRun([join(T, 'scripts/receipt-attest.mjs'), 'verify', '--ledger', dir, join(dir, f)]);
        const vline = `${r.stdout}`.match(/RECEIPT: (\w+)/);
        if (r.status !== 0 || !vline || vline[1] !== 'VALID') { ok = false; }
        const body = readFileSync(join(dir, f));
        const j = body.toString('utf8').match(/"nonce":\s*"([^"]+)"/);
        const w = body.toString('utf8').match(/run-at:\s*([^\n]+)/) || body.toString('utf8').match(/"wall_start":\s*"([^"]+)"/);
        if (j) nonces.add(j[1]); else ok = false;
        if (w) times.push(Date.parse(w[1].trim()));
      }
      const older = git(['grep', '-ohE', '"nonce":\\s*"[0-9a-f]+"', rev, '--', '.ufo/waves/round-4[89]', '.ufo/waves/round-5[0-4]']);
      if (older.status === 0) {
        for (const line of older.stdout.split('\n')) {
          const m = line.match(/"nonce":\s*"([^"]+)"/);
          if (m && nonces.has(m[1])) ok = false;
        }
      }
      const span = times.length === 3 ? Math.max(...times) - Math.min(...times) : 0;
      ok = ok && nonces.size === 3 && span >= 300_000;
      hold('B8', ok, `files=${files.length} nonces=${nonces.size} span_ms=${span}`);
    } else {
      hold('B8', false, 'receipt files missing');
    }
  }
  // B9 — R54-C1: S108 capture resolves to committed bytes with the pinned sha; lesson names R54-C1
  {
    let reg = null;
    try { reg = JSON.parse(readT(REG).toString('utf8')); } catch {}
    if (!reg) { hold('B9', false, 'registry absent'); }
    else {
    const c = reg.captures.find((x) => x.sourceId === 'S108');
    const les = readT('corpus/lessons/round-55.md');
    const capBytes = c && readT(c.path);
    const ok = c && c.sha256 === S108_SHA && capBytes && sha(capBytes) === S108_SHA
      && les && /R54-C1/.test(les.toString('utf8'));
    hold('B9', Boolean(ok), `pin=${Boolean(c)} bytes=${capBytes ? sha(capBytes).slice(0, 12) : 'absent'} lesson=${les ? /R54-C1/.test(les.toString('utf8')) : false}`);
    }
  }
  // B10 — coverage: captures ∪ exempts == SOURCES.md row ids
  {
    let reg = null;
    try { reg = JSON.parse(readT(REG).toString('utf8')); } catch {}
    const src = readT('corpus/SOURCES.md');
    if (!src || !reg) { hold('B10', false, `src=${Boolean(src)} reg=${Boolean(reg)}`); }
    else {
      const rows = new Set([...src.toString('utf8').matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)].map((m) => m[1]));
      const bound = new Set([...reg.captures.map((c) => c.sourceId), ...reg.exemptions.flatMap((x) => x.ids)]);
      const missing = [...rows].filter((r) => !bound.has(r));
      const orphans = [...bound].filter((r) => !rows.has(r));
      hold('B10', missing.length === 0 && orphans.length === 0 && rows.size >= 112,
        `rows=${rows.size} bound=${bound.size} missing=${missing.length} orphans=${orphans.length}`);
    }
  }
} catch (e) {
  if (!(e instanceof EarlyExit)) {
    process.stderr.write(`ATTEST55: FAIL-CLOSED ${e && e.stack ? e.stack.split('\n')[0] : e}\n`);
    process.exit(2);
  }
} finally {
  rmSync(T, { recursive: true, force: true });
}
if (checks.length === 0) {
  process.stdout.write(`ATTEST55: ATTEST55_UNMET held=0/0 checks=0 rev=${rev} rule=${RULE} version=v1 | hold-call-deleted\n`);
  process.exit(1);
}
const held = checks.filter((c) => c.ok).length;
const parts = checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail}`}`).join(' | ');
process.stdout.write(`ATTEST55: ${held === checks.length ? 'ATTEST55_HELD' : 'ATTEST55_UNMET'} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} version=v1 | ${parts}\n`);
process.exit(held === checks.length ? 0 : 1);
