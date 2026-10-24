#!/usr/bin/env node
/**
 * attest56-probe.mjs — FROZEN counter for kumitate round 56, claim C1 (rule `A56`), v1.
 *
 *   node .ufo/waves/round-56/probe/attest56-probe.mjs <lane> <rev>
 *
 * Counter for the `source-dupes` capability acquisition (contract
 * `kumitate-source-dupes-v1`): the SOURCES duplicate-URL ratchet — a MECHANICAL
 * check that the live duplicate-URL-group set over corpus/SOURCES.md equals the
 * pinned `known` set (the census W04 warning class promoted to a scored
 * contract). Freeze history: v1 is the first version of this rule. Frozen AND
 * executed at base before any data seat ran (base/attest56-base.txt, QUALITY
 * Q43), with a scratch-HELD witness of a synthetic conformant post-state
 * committed at freeze (witness/scratch-held-attest.txt, lesson M5).
 *
 * Scores ten checks over the committed bytes of <rev> (extracted with `git
 * archive`, never the working tree):
 *   B1  scripts/source-dupes.mjs exists at rev and `node scripts/source-dupes.mjs
 *       --selftest` exits 0 with final block `SOURCE_DUPES_SELFTEST: PASS (n/n)`,
 *       n >= 12, and >= 12 lines matching `^case <name>: PASS`.
 *   B2  the registry `.ufo/pins/source-dupes.json` exists at rev and parses
 *       (version 1, `known` a nonempty array of {ids>=2,url,why}); `node
 *       scripts/source-dupes.mjs` in the extracted tree exits 0 with
 *       `SOURCE_DUPES: CLEAN groups=<n> known=<n>` and n >= 4.
 *   B3  DRIFT arms, each crafted in the scratch extraction and restored: (a) a
 *       SOURCES row appended re-using an already-registered URL under a
 *       different scope -> DRIFT `new-duplicate`; (b) a pinned member's scope
 *       edited so its group stops duplicating -> DRIFT `stale-known`; (c) a
 *       `known` entry's ids edited to mismatch its live group -> DRIFT
 *       `known-mismatch`; (d) `known` emptied while live groups remain -> DRIFT
 *       `new-duplicate` (never a vacuous CLEAN).
 *   B4  FAIL-CLOSED arms: (a) registry overwritten with malformed JSON -> exit 2;
 *       (b) registry version 2 -> exit 2; (c) a row id covered by two `known`
 *       entries -> exit 2; (d) a `known` entry missing `why` -> exit 2; (e)
 *       sources doc removed -> exit 2. A malformed registry or an unreadable
 *       sources doc is could-not-evaluate, never CLEAN and never a score.
 *   B5  the counter registry `.ufo/pins/counter-pins.json` carries the round-55
 *       frozen pins WITHOUT REGRESSION — the entries named attest55-probe /
 *       doctrine55-probe / source-capture equal the round-55 plan §Counters pins
 *       by name, path and sha256 — and every registry entry's sha256 matches
 *       the blob at <rev>.
 *   B5c VACUOUS-HELD guard (R52-5 lineage): the extracted tree carries
 *       .ufo/waves/round-56/build/MutCounter56/counter-mutant.txt whose
 *       transcript shows the hold-call-deleted A56 mutant printing
 *       `ATTEST56_UNMET held=0/0` with exit 1, and this probe's own source (the
 *       JUDGED bytes, pinned in the registry under B5) carries the
 *       checks-nonempty guard.
 *   B6  pin.source-dupes in the SCORECARD.md `kumitate-gate-pins-v1` block
 *       equals the sha256 of the extracted scripts/source-dupes.mjs, and
 *       `node scripts/proxy-check.mjs --strict` exits 0 with `PROXY: MATCH`.
 *   B7  SKILL.md at rev names `source-dupes` in the gate registry with
 *       contract `kumitate-source-dupes-v1`, and the `## Verifiable checklist`
 *       carries exactly 26 items whose item 26 names `node scripts/source-dupes.mjs`.
 *   B8  the three committed receipts .ufo/waves/round-56/receipts/
 *       attest-run-{1,2,3}.txt (+ sidecars) each verify `RECEIPT: VALID` exit 0
 *       under `verify --ledger` over the receipts dir (the doctored control and
 *       sidecars skip with notes, never evidence); embedded nonces pairwise
 *       distinct and distinct from every nonce in the round-48..55 corpora at
 *       rev; wall_start span >= 300 s across the three.
 *   B9  routed-defect binding: corpus/lessons/round-56.md names BOTH R55-V1 and
 *       R55-V2 in its `## Mistakes` section, LOG.md at rev carries a round-56
 *       entry naming R55-V2 with the corrected figure `9→11`, and
 *       `.ufo/pins/source-captures.json` at rev binds captures for S113..S116.
 *   B10 coverage: the independent duplicate-group recomputation over
 *       corpus/SOURCES.md at <rev> (same normalized-url + differing-scope rule)
 *       equals exactly the `known` member sets in `.ufo/pins/source-dupes.json`.
 *
 * Predicate ATTEST56_HELD = held=10/10, exit 0. Any other reading is
 * `ATTEST56_UNMET held=<k>/10` exit 1. A crash or an unreadable extraction is
 * exit 2 (never a score). Frozen at `.ufo/waves/round-56/plan.md` § C1 before
 * any data seat ran.
 *
 * The frozen predicate sentence, byte-identical with plan.md §Claims and the
 * round report —
 * ATTEST56_HELD — node .ufo/waves/round-56/probe/attest56-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST56: ATTEST56_HELD held=10/10 checks=10 rev=<rev> rule=A56 version=v1" and exits 0.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RULE = 'A56';
const GATE = 'scripts/source-dupes.mjs';
const REG = '.ufo/pins/source-dupes.json';
const PINS = '.ufo/pins/counter-pins.json';
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('ATTEST56: USAGE node attest56-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`ATTEST56: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
if (!/^[0-9a-f]{40,64}$/.test(rev)) {
  process.stderr.write('ATTEST56: USAGE <rev> must be a full lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
class EarlyExit extends Error {}
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });
const run = (args, opts = {}) => spawnSync(args[0], args.slice(1), { encoding: 'utf8', timeout: 120_000, maxBuffer: 32 << 20, ...opts });
const git = (args) => run(['git', '-C', lane, ...args]);

const T = mkdtempSync(join(tmpdir(), 'a56-probe.'));
try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`ATTEST56: FAIL-CLOSED rev unreadable (${tar.status})\n`);
    process.exit(2);
  }
  const nodeRun = (args) => spawnSync(process.execPath, args, { cwd: T, encoding: 'utf8', timeout: 120_000, maxBuffer: 32 << 20 });
  const last = (r) => `${r.stdout || ''}`.trim().split('\n').pop() || '';
  const readT = (p) => { try { return readFileSync(join(T, p)); } catch { return null; } };

  // B1 — gate exists, selftest green >= 12 cases
  {
    const gate = readT(GATE);
    if (!gate) { hold('B1', false, 'gate absent'); }
    else {
      const r = nodeRun([join(T, GATE), '--selftest']);
      const out = `${r.stdout}`;
      const passCases = (out.match(/^case [^\n]+: PASS/gm) || []).length;
      const m = out.match(/SOURCE_DUPES_SELFTEST: PASS \((\d+)\/(\d+)\)/);
      const v = /VERDICT: PASS/.test(out);
      hold('B1', r.status === 0 && m && v && +m[1] >= 12 && +m[1] === +m[2] && passCases >= 12,
        `exit=${r.status} cases=${passCases} selftest=${m ? `${m[1]}/${m[2]}` : 'none'} verdict=${v}`);
    }
  }
  // B2 — registry parses; gate CLEAN, groups >= 4
  {
    const regRaw = readT(REG);
    let reg = null;
    try { reg = regRaw && JSON.parse(regRaw.toString('utf8')); } catch {}
    if (!reg || reg.version !== 1 || !Array.isArray(reg.known) || reg.known.length < 1
        || !reg.known.every((k) => Array.isArray(k.ids) && k.ids.length >= 2 && typeof k.url === 'string' && typeof k.why === 'string')) {
      hold('B2', false, 'registry absent or malformed');
    } else {
      const r = nodeRun([join(T, GATE)]);
      const m = last(r).match(/SOURCE_DUPES: CLEAN groups=(\d+) known=(\d+)/);
      hold('B2', r.status === 0 && m && +m[1] >= 4 && +m[1] === +m[2],
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
  }
  // B3 — four DRIFT arms over the scratch extraction
  {
    const resWhy = [];
    const arm = (mutate, expect) => {
      const undo = mutate();
      const r = nodeRun([join(T, GATE)]);
      const out = `${r.stdout || ''}`; // scan whole output — the first bad item prints as a `note` line
      const l = last(r);
      const ok = r.status === 1 && out.includes(expect);
      if (!ok) resWhy.push(`${expect}:exit=${r.status} last=${JSON.stringify(l.slice(0, 140))}`);
      undo();
      return ok;
    };
    let reg = null;
    try { reg = JSON.parse(readT(REG).toString('utf8')); } catch {}
    const k0 = reg && reg.known && reg.known[0];
    const res = [];
    if (!k0) { hold('B3', false, 'registry absent or no known entries'); } else {
    // (a) new duplicate: insert a row INSIDE the Registry section re-using k0's url under another scope
    res.push(arm(() => {
      const sp = join(T, 'corpus/SOURCES.md');
      const before = readFileSync(sp);
      const lines = before.toString('utf8').split('\n');
      let regAt = -1, endAt = -1;
      lines.forEach((l, idx) => {
        if (/^ {0,3}##[ \t]/.test(l)) {
          const h = l.replace(/^ {0,3}/, '').replace(/^##[ \t]+/, '').trim();
          if (h === 'Registry') regAt = idx;
          else if (regAt >= 0 && endAt < 0) endAt = idx;
        }
      });
      if (regAt < 0 || endAt < 0) { resWhy.push('registry-section-not-found'); return () => {}; }
      lines.splice(endAt, 0, `| S999 | x — https://${k0.url} | docs | A | newscope-x | a | t | mined | 2026-01-01 | 90d | p |`);
      writeFileSync(sp, lines.join('\n'));
      return () => writeFileSync(sp, before);
    }, 'new-duplicate'));
    // (b) stale known: edit one pinned member's scope to match the other's
    res.push(arm(() => {
      const sp = join(T, 'corpus/SOURCES.md');
      const before = readFileSync(sp);
      const lines = before.toString('utf8').split('\n');
      const i = lines.findIndex((l) => l.startsWith(`| ${k0.ids[0]} |`));
      const j = lines.findIndex((l) => l.startsWith(`| ${k0.ids[1]} |`));
      if (i < 0 || j < 0) { const u = () => {}; resWhy.push('member-row-not-found'); return u; }
      const cellsOf = (l) => l.split('|');
      const ci = cellsOf(lines[i]); const cj = cellsOf(lines[j]);
      ci[5] = cj[5]; // scope cell only — make ids[0] share ids[1]'s scope
      lines[i] = ci.join('|');
      writeFileSync(sp, lines.join('\n'));
      return () => writeFileSync(sp, before);
    }, 'stale-known'));
    // (c) known-mismatch: pin member edited to a non-member id
    res.push(arm(() => {
      const rp = join(T, REG);
      const before = readFileSync(rp);
      const d = JSON.parse(before.toString('utf8'));
      d.known[0].ids = [d.known[0].ids[0], 'S998'];
      writeFileSync(rp, JSON.stringify(d, null, 2));
      return () => writeFileSync(rp, before);
    }, 'known-mismatch'));
    // (d) empty known while live groups remain -> new-duplicate (never vacuous)
    res.push(arm(() => {
      const rp = join(T, REG);
      const before = readFileSync(rp);
      const d = JSON.parse(before.toString('utf8'));
      d.known = [];
      writeFileSync(rp, JSON.stringify(d, null, 2));
      return () => writeFileSync(rp, before);
    }, 'new-duplicate'));
    hold('B3', res.every(Boolean), `arms=${res.map((x, i) => `${'abcd'[i]}=${x ? 'ok' : 'MISS'}`).join(',')}${resWhy.length ? ` why=${resWhy.join(';')}` : ''}`);
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
    try { const d = JSON.parse(readT(REG).toString('utf8')); regOk = d && Array.isArray(d.known) && d.known.length > 0; } catch {}
    if (!regOk) { hold('B4', false, 'registry absent or no known entries'); } else {
    const before = readFileSync(join(T, REG));
    const res = [];
    res.push(runArm(() => { writeFileSync(join(T, REG), '{ not json'); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const d = JSON.parse(readT(REG).toString('utf8')); d.version = 2; writeFileSync(join(T, REG), JSON.stringify(d)); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const d = JSON.parse(readT(REG).toString('utf8')); d.known.push({ ids: [d.known[0].ids[0], 'S997'], url: 'x', why: 'overlap' }); writeFileSync(join(T, REG), JSON.stringify(d)); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const d = JSON.parse(readT(REG).toString('utf8')); delete d.known[0].why; writeFileSync(join(T, REG), JSON.stringify(d)); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const sp = join(T, 'corpus/SOURCES.md'); const b = readFileSync(sp); rmSync(sp); return () => writeFileSync(sp, b); }));
    hold('B4', res.every(Boolean), `arms=${res.map((x, i) => `${'abcde'[i]}=${x ? 'ok' : 'MISS'}`).join(',')}`);
    }
  }
  // B5/B5c — counter-pins without regression; vacuous-HELD transcript + guard
  {
    const pinsRaw = readT(PINS);
    let pins = null;
    try { pins = pinsRaw && JSON.parse(pinsRaw.toString('utf8')); } catch {}
    const mut = readT('.ufo/waves/round-56/build/MutCounter56/counter-mutant.txt');
    const selfSrc = readT('.ufo/waves/round-56/probe/attest56-probe.mjs');
    const transcriptOk = Boolean(mut && /ATTEST56_UNMET held=0\/0/.test(mut.toString('utf8')) && /exit[ =]1|exit 1|process_exit=1/.test(mut.toString('utf8')));
    const guardOk = Boolean(selfSrc && /checks\.length\s*===\s*0|checks\.length\s*<\s*1|checks\.length\s*>\s*0/.test(selfSrc.toString('utf8')));
    if (!pins || pins.version !== 1 || !Array.isArray(pins.pins) || pins.pins.length < 5) {
      hold('B5', false, `counter-pins registry absent or small; vacuous transcript=${transcriptOk} guard=${guardOk}`);
    } else {
      let ok = true; const misses = [];
      for (const p of pins.pins) {
        const bytes = readT(p.path);
        if (!bytes || sha(bytes) !== p.sha256) { ok = false; misses.push(p.name); }
      }
      const need = ['attest55-probe', 'doctrine55-probe', 'source-capture'];
      for (const n of need) {
        const p = pins.pins.find((x) => x.name === n);
        const b = p && readT(p.path);
        if (!p || !b || sha(b) !== p.sha256) { ok = false; misses.push(`${n}-pin`); }
      }
      const self = pins.pins.find((p) => p.name === 'attest56-probe');
      const selfBytes = self && readT(self.path);
      if (!self || self.path !== '.ufo/waves/round-56/probe/attest56-probe.mjs' || !selfBytes || sha(selfBytes) !== self.sha256) { ok = false; misses.push('attest56-probe-pin'); }
      const d56 = pins.pins.find((p) => p.name === 'doctrine56-probe');
      const d56Bytes = d56 && readT(d56.path);
      if (!d56 || d56.path !== '.ufo/waves/round-56/probe/doctrine56-probe.mjs' || !d56Bytes || sha(d56Bytes) !== d56.sha256) { ok = false; misses.push('doctrine56-probe-pin'); }
      const sd = pins.pins.find((p) => p.name === 'source-dupes');
      const sdBytes = sd && readT(sd.path);
      if (!sd || sd.path !== 'scripts/source-dupes.mjs' || !sdBytes || sha(sdBytes) !== sd.sha256) { ok = false; misses.push('source-dupes-pin'); }
      hold('B5', ok && transcriptOk && guardOk && pins.pins.length >= 5,
        `pins=${pins.pins.length} misses=${JSON.stringify(misses)} vacuous:transcript=${transcriptOk} guard=${guardOk}`);
    }
  }
  // B6 — pin.source-dupes + proxy strict MATCH
  {
    const sc = readT('SCORECARD.md');
    const gate = readT(GATE);
    let pinOk = false;
    if (sc && gate) {
      const m = sc.toString('utf8').match(/pin\.source-dupes=([0-9a-f]{64})/);
      pinOk = m && m[1] === sha(gate);
    }
    const r = nodeRun([join(T, 'scripts/proxy-check.mjs'), '--strict']);
    hold('B6', Boolean(pinOk && r.status === 0 && last(r).includes('PROXY: MATCH')),
      `pinOk=${Boolean(pinOk)} proxyExit=${r.status} last=${JSON.stringify(last(r))}`);
  }
  // B7 — SKILL registry row + checklist item 26
  {
    const sk = readT('SKILL.md');
    if (!sk) { hold('B7', false, 'SKILL.md absent'); }
    else {
      const txt = sk.toString('utf8');
      const rowOk = /\|\s*source-dupes\s*\|\s*gate\s*\|/.test(txt) && txt.includes('kumitate-source-dupes-v1');
      const items = (txt.match(/^\s*- \[/gm) || []).length;
      const itemOk = /- \[ \][^\n]*source-dupes\.mjs/.test(txt);
      hold('B7', rowOk && items === 26 && itemOk, `row=${rowOk} items=${items} item26=${itemOk}`);
    }
  }
  // B8 — receipt-attest VALID over the three receipts, nonces distinct, span >= 300 s
  {
    const dir = join(T, '.ufo/waves/round-56/receipts');
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
      const older = git(['grep', '-ohE', '"nonce":\\s*"[0-9a-f]+"', rev, '--', '.ufo/waves/round-4[89]', '.ufo/waves/round-5[0-5]']);
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
  // B9 — routed-defect binding: lesson names R55-V1+R55-V2; LOG carries 9→11; captures S113..S116
  {
    const les = readT('corpus/lessons/round-56.md');
    const log = readT('LOG.md');
    const regRaw = readT('.ufo/pins/source-captures.json');
    let reg = null;
    try { reg = regRaw && JSON.parse(regRaw.toString('utf8')); } catch {}
    const lesOk = les && /R55-V1/.test(les.toString('utf8')) && /R55-V2/.test(les.toString('utf8'));
    const logOk = log && /R55-V2/.test(log.toString('utf8')) && /9\s*→\s*11|9->11/.test(log.toString('utf8'));
    let capOk = false;
    if (reg && Array.isArray(reg.captures)) {
      capOk = ['S113', 'S114', 'S115', 'S116'].every((id) => {
        const c = reg.captures.find((x) => x.sourceId === id);
        const b = c && readT(c.path);
        return c && b && sha(b) === c.sha256;
      });
    }
    hold('B9', Boolean(lesOk && logOk && capOk),
      `lesson=${lesOk} log=${logOk} captures=${capOk}`);
  }
  // B10 — independent duplicate-group recomputation == known member sets
  {
    const regRaw = readT(REG);
    let reg = null;
    try { reg = regRaw && JSON.parse(regRaw.toString('utf8')); } catch {}
    const src = readT('corpus/SOURCES.md');
    if (!src || !reg) { hold('B10', false, `src=${Boolean(src)} reg=${Boolean(reg)}`); }
    else {
      const urlOf = (s) => {
        const m = s.match(/https?:\/\/[^\s|]+/);
        if (!m) return '';
        let u = m[0].replace(/#[^ ]*$/, '').replace(/\/$/, '').replace(/^[A-Za-z]+:\/\//, '');
        const n = u.indexOf('/');
        return n ? u.slice(0, n).toLowerCase() + u.slice(n) : u.toLowerCase();
      };
      const rows = [];
      let inReg = false;
      for (const line0 of src.toString('utf8').split('\n')) {
        if (/^ {0,3}##[ \t]/.test(line0)) { inReg = line0.replace(/^ {0,3}/, '').replace(/^##[ \t]+/, '').trim() === 'Registry'; continue; }
        if (/^ {0,3}#[ \t]/.test(line0)) { inReg = false; continue; }
        if (!inReg || !/^ {0,3}\|/.test(line0)) continue;
        const cells = line0.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
        if (cells.length !== 13 || !/^S[0-9]{3,}$/.test(cells[1])) continue;
        rows.push({ id: cells[1], scope: cells[5], url: urlOf(cells[2]) });
      }
      const byUrl = new Map();
      for (const r of rows) { if (!r.url) continue; if (!byUrl.has(r.url)) byUrl.set(r.url, []); byUrl.get(r.url).push(r); }
      const live = [];
      for (const [url, ms] of byUrl) {
        if (ms.length >= 2 && new Set(ms.map((m) => m.scope)).size >= 2) live.push(ms.map((m) => m.id).sort().join('+'));
      }
      const liveSet = new Set(live);
      const knownSet = new Set(reg.known.map((k) => k.ids.slice().sort().join('+')));
      const missing = [...liveSet].filter((g) => !knownSet.has(g));
      const stale = [...knownSet].filter((g) => !liveSet.has(g));
      hold('B10', missing.length === 0 && stale.length === 0 && knownSet.size >= 4,
        `live=${liveSet.size} known=${knownSet.size} missing=${missing.length} stale=${stale.length}`);
    }
  }
} catch (e) {
  if (!(e instanceof EarlyExit)) {
    process.stderr.write(`ATTEST56: FAIL-CLOSED ${e && e.stack ? e.stack.split('\n')[0] : e}\n`);
    process.exit(2);
  }
} finally {
  rmSync(T, { recursive: true, force: true });
}
if (checks.length === 0) {
  process.stdout.write(`ATTEST56: ATTEST56_UNMET held=0/0 checks=0 rev=${rev} rule=${RULE} version=v1 | hold-call-deleted\n`);
  process.exit(1);
}
const held = checks.filter((c) => c.ok).length;
const parts = checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail}`}`).join(' | ');
process.stdout.write(`ATTEST56: ${held === checks.length ? 'ATTEST56_HELD' : 'ATTEST56_UNMET'} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} version=v1 | ${parts}\n`);
process.exit(held === checks.length ? 0 : 1);
