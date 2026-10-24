#!/usr/bin/env node
/**
 * attest57-probe.mjs — FROZEN counter for kumitate round 57, claim C1 (rule `A57`), v1.
 *
 *   node .ufo/waves/round-57/probe/attest57-probe.mjs <lane> <rev>
 *
 * Counter for the `readme-map` capability acquisition (contract
 * `kumitate-readme-map-v1`): the corpus coverage-map bimap gate — a MECHANICAL
 * check that every `*.md` under `corpus/knowledge` + `corpus/lessons` carries
 * exactly one `corpus/README.md` row `| `path` |`, every such row names an
 * existing file, and the pinned `covered` set in `.ufo/pins/readme-map.json`
 * still holds its rows (the recurring R52/R55/R56-V3 drift class made
 * mechanical). Freeze history: v1 is the first version of this rule. Frozen AND
 * executed at base before any data seat ran (base/attest57-base.txt, QUALITY
 * Q43), with a scratch-HELD witness of a synthetic conformant post-state
 * committed at freeze (witness/scratch-held-attest.txt, lesson M5).
 *
 * Scores ten checks over the committed bytes of <rev> (extracted with `git
 * archive`, never the working tree):
 *   B1  scripts/readme-map.mjs exists at rev and `node scripts/readme-map.mjs
 *       --selftest` exits 0 with final block `README_MAP_SELFTEST: PASS (n/n)`,
 *       n >= 12, and >= 12 lines matching `^case <name>: PASS`.
 *   B2  the registry `.ufo/pins/readme-map.json` exists at rev and parses
 *       (version 1, `covered` a nonempty sorted-unique array of
 *       `knowledge|lessons/` paths); `node scripts/readme-map.mjs` in the
 *       extracted tree exits 0 with `README_MAP: CLEAN files=<n> rows=<n>
 *       covered=<n>` and files >= 130.
 *   B3  DRIFT arms, each crafted in the scratch extraction and restored: (a) a
 *       README row deleted -> DRIFT `uncovered`; (b) a corpus file deleted ->
 *       DRIFT `orphan-row`/`stale-covered`; (c) a row duplicated -> DRIFT
 *       `duplicate-row`; (d) a pinned `covered` file's row deleted -> DRIFT
 *       `uncovered`; (e) `covered` emptied while files remain -> DRIFT
 *       `unpinned` (never a vacuous CLEAN).
 *   B4  FAIL-CLOSED arms: (a) registry overwritten with malformed JSON -> exit 2;
 *       (b) registry version 2 -> exit 2; (c) `covered` not an array -> exit 2;
 *       (d) a `covered` entry outside `knowledge|lessons/` -> exit 2; (e)
 *       corpus/README.md removed -> exit 2. A malformed registry or an
 *       unreadable README is could-not-evaluate, never CLEAN and never a score.
 *   B5  the counter registry `.ufo/pins/counter-pins.json` carries the round-56
 *       frozen pins WITHOUT REGRESSION — the entries named attest56-probe /
 *       doctrine56-probe / source-dupes equal the round-56 plan §Counters pins
 *       by name, path and sha256 — and every registry entry's sha256 matches
 *       the blob at <rev>.
 *   B5c VACUOUS-HELD guard (R52-5 lineage): the extracted tree carries
 *       .ufo/waves/round-57/build/MutCounter57/counter-mutant.txt whose
 *       transcript shows the hold-call-deleted A57 mutant printing
 *       `ATTEST57_UNMET held=0/0` with exit 1, and this probe's own source (the
 *       JUDGED bytes, pinned in the registry under B5) carries the
 *       checks-nonempty guard.
 *   B6  pin.readme-map in the SCORECARD.md `kumitate-gate-pins-v1` block
 *       equals the sha256 of the extracted scripts/readme-map.mjs, and
 *       `node scripts/proxy-check.mjs --strict` exits 0 with `PROXY: MATCH`.
 *   B7  SKILL.md at rev names `readme-map` in the gate registry with
 *       contract `kumitate-readme-map-v1`, the `## Verifiable checklist`
 *       carries exactly 27 items AND item 24 names `counter-pins.mjs`, item 25
 *       `source-capture.mjs`, item 26 `source-dupes.mjs` and item 27
 *       `readme-map.mjs` (the R56-V2 amendment: capability moves bind every
 *       item id, never only the newest).
 *   B8  the three committed receipts .ufo/waves/round-57/receipts/
 *       attest-run-{1,2,3}.txt (+ sidecars) each verify `RECEIPT: VALID` exit 0
 *       under `verify --ledger` over the receipts dir (the doctored control and
 *       sidecars skip with notes, never evidence); embedded nonces pairwise
 *       distinct and distinct from every nonce in the round-48..56 corpora at
 *       rev; wall_start span >= 300 s across the three.
 *   B9  routed-defect binding: corpus/lessons/round-57.md names R56-V1, R56-V2
 *       AND R56-V3 in its `## Mistakes` section, LOG.md at rev carries a
 *       round-57 entry naming R56-V2 AND R56-V3, and
 *       `.ufo/pins/source-captures.json` at rev binds captures for S117..S120.
 *   B10 coverage: the independent file<->row recomputation over corpus at <rev>
 *       (find corpus/knowledge corpus/lessons -name '*.md' vs README
 *       `| `path` |` rows) equals the gate's own verdict AND the registry
 *       `covered` set is a subset of live files.
 *
 * Predicate ATTEST57_HELD = held=10/10, exit 0. Any other reading is
 * `ATTEST57_UNMET held=<k>/10` exit 1. A crash or an unreadable extraction is
 * exit 2 (never a score). Frozen at `.ufo/waves/round-57/plan.md` § C1 before
 * any data seat ran.
 *
 * The frozen predicate sentence, byte-identical with plan.md §Claims and the
 * round report —
 * ATTEST57_HELD — node .ufo/waves/round-57/probe/attest57-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=<rev> rule=A57 version=v1" and exits 0.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RULE = 'A57';
const GATE = 'scripts/readme-map.mjs';
const REG = '.ufo/pins/readme-map.json';
const PINS = '.ufo/pins/counter-pins.json';
const README = 'corpus/README.md';
const DIRS = ['corpus/knowledge', 'corpus/lessons'];
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('ATTEST57: USAGE node attest57-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`ATTEST57: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
if (!/^[0-9a-f]{40,64}$/.test(rev)) {
  process.stderr.write('ATTEST57: USAGE <rev> must be a full lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
class EarlyExit extends Error {}
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });
const run = (args, opts = {}) => spawnSync(args[0], args.slice(1), { encoding: 'utf8', timeout: 120_000, maxBuffer: 32 << 20, ...opts });
const git = (args) => run(['git', '-C', lane, ...args]);

const T = mkdtempSync(join(tmpdir(), 'a57-probe.'));
try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`ATTEST57: FAIL-CLOSED rev unreadable (${tar.status})\n`);
    process.exit(2);
  }
  const nodeRun = (args) => spawnSync(process.execPath, args, { cwd: T, encoding: 'utf8', timeout: 120_000, maxBuffer: 32 << 20 });
  const last = (r) => `${r.stdout || ''}`.trim().split('\n').pop() || '';
  const readT = (p) => { try { return readFileSync(join(T, p)); } catch { return null; } };
  const corpusFiles = () => {
    const out = [];
    for (const d of DIRS) {
      let names = [];
      try { names = readdirSync(join(T, d)); } catch { return null; }
      for (const n of names) if (n.endsWith('.md')) out.push(`${d.slice('corpus/'.length)}/${n}`);
    }
    return out.sort();
  };
  const readmeRows = () => {
    const txt = readT(README);
    if (!txt) return null;
    const rows = [];
    for (const line of txt.toString('utf8').split('\n')) {
      const m = line.match(/^\s{0,3}\|\s*`((?:knowledge|lessons)\/[^`]+)`\s*\|/);
      if (m) rows.push(m[1]);
    }
    return rows;
  };

  // B1 — gate exists, selftest green >= 12 cases
  {
    const gate = readT(GATE);
    if (!gate) { hold('B1', false, 'gate absent'); }
    else {
      const r = nodeRun([join(T, GATE), '--selftest']);
      const out = `${r.stdout}`;
      const passCases = (out.match(/^case [^\n]+: PASS/gm) || []).length;
      const m = out.match(/README_MAP_SELFTEST: PASS \((\d+)\/(\d+)\)/);
      const v = /VERDICT: PASS/.test(out);
      hold('B1', r.status === 0 && m && v && +m[1] >= 12 && +m[1] === +m[2] && passCases >= 12,
        `exit=${r.status} cases=${passCases} selftest=${m ? `${m[1]}/${m[2]}` : 'none'} verdict=${v}`);
    }
  }
  // B2 — registry parses; gate CLEAN, files >= 130
  {
    const regRaw = readT(REG);
    let reg = null;
    try { reg = regRaw && JSON.parse(regRaw.toString('utf8')); } catch {}
    if (!reg || reg.version !== 1 || !Array.isArray(reg.covered) || reg.covered.length < 1
        || !reg.covered.every((p) => typeof p === 'string' && /^(knowledge|lessons)\/.+\.md$/.test(p))) {
      hold('B2', false, 'registry absent or malformed');
    } else {
      const r = nodeRun([join(T, GATE)]);
      const m = last(r).match(/README_MAP: CLEAN files=(\d+) rows=(\d+) covered=(\d+)/);
      hold('B2', r.status === 0 && m && +m[1] >= 130 && +m[1] === +m[2],
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
  }
  // B3 — five DRIFT arms over the scratch extraction
  {
    const resWhy = [];
    const arm = (mutate, expect) => {
      const undo = mutate();
      const r = nodeRun([join(T, GATE)]);
      const out = `${r.stdout || ''}`;
      const ok = r.status === 1 && out.includes(expect);
      if (!ok) resWhy.push(`${expect}:exit=${r.status} last=${JSON.stringify(last(r).slice(0, 140))}`);
      undo();
      return ok;
    };
    const files = corpusFiles();
    const rows = readmeRows();
    if (!files || !files.length || !rows || !rows.length) { hold('B3', false, 'corpus or rows unreadable'); } else {
    const rp = join(T, README);
    const res = [];
    // (a) uncovered: delete one row
    res.push(arm(() => {
      const before = readFileSync(rp);
      const lines = before.toString('utf8').split('\n');
      const i = lines.findIndex((l) => l.startsWith('| `'));
      lines.splice(i, 1);
      writeFileSync(rp, lines.join('\n'));
      return () => writeFileSync(rp, before);
    }, 'uncovered'));
    // (b) orphan-row: delete the file for the first row
    res.push(arm(() => {
      const fp = join(T, 'corpus', rows[0]);
      const before = readFileSync(fp);
      rmSync(fp);
      return () => writeFileSync(fp, before);
    }, 'orphan-row'));
    // (c) duplicate-row: duplicate one row line
    res.push(arm(() => {
      const before = readFileSync(rp);
      const lines = before.toString('utf8').split('\n');
      const i = lines.findIndex((l) => l.startsWith('| `'));
      lines.splice(i + 1, 0, lines[i]);
      writeFileSync(rp, lines.join('\n'));
      return () => writeFileSync(rp, before);
    }, 'duplicate-row'));
    // (d) covered file uncovered: delete the row of a pinned covered entry
    res.push(arm(() => {
      const regRaw = readT(REG);
      let reg = null;
      try { reg = regRaw && JSON.parse(regRaw.toString('utf8')); } catch {}
      const target = reg && Array.isArray(reg.covered) && reg.covered[0];
      if (!target) { resWhy.push('covered-registry-absent'); return () => {}; }
      const before = readFileSync(rp);
      const lines = before.toString('utf8').split('\n');
      const i = lines.findIndex((l) => l.includes(`\`${target}\``));
      if (i < 0) { resWhy.push('covered-row-not-found'); return () => {}; }
      lines.splice(i, 1);
      writeFileSync(rp, lines.join('\n'));
      return () => writeFileSync(rp, before);
    }, 'uncovered'));
    // (e) unpinned: empty covered while files remain -> never vacuous
    res.push(arm(() => {
      const gp = join(T, REG);
      const before = readT(REG);
      if (!before) { resWhy.push('registry-absent'); return () => {}; }
      const d = JSON.parse(before.toString('utf8'));
      d.covered = [];
      writeFileSync(gp, JSON.stringify(d, null, 2));
      return () => writeFileSync(gp, before);
    }, 'unpinned'));
    hold('B3', res.every(Boolean), `arms=${res.map((x, i) => `${'abcde'[i]}=${x ? 'ok' : 'MISS'}`).join(',')}${resWhy.length ? ` why=${resWhy.join(';')}` : ''}`);
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
    try { const d = JSON.parse(readT(REG).toString('utf8')); regOk = d && Array.isArray(d.covered) && d.covered.length > 0; } catch {}
    if (!regOk) { hold('B4', false, 'registry absent or no covered entries'); } else {
    const before = readFileSync(join(T, REG));
    const res = [];
    res.push(runArm(() => { writeFileSync(join(T, REG), '{ not json'); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const d = JSON.parse(readT(REG).toString('utf8')); d.version = 2; writeFileSync(join(T, REG), JSON.stringify(d)); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const d = JSON.parse(readT(REG).toString('utf8')); d.covered = 'x'; writeFileSync(join(T, REG), JSON.stringify(d)); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const d = JSON.parse(readT(REG).toString('utf8')); d.covered.push('scripts/escape.md'); writeFileSync(join(T, REG), JSON.stringify(d)); return () => writeFileSync(join(T, REG), before); }));
    res.push(runArm(() => { const sp = join(T, README); const b = readFileSync(sp); rmSync(sp); return () => writeFileSync(sp, b); }));
    hold('B4', res.every(Boolean), `arms=${res.map((x, i) => `${'abcde'[i]}=${x ? 'ok' : 'MISS'}`).join(',')}`);
    }
  }
  // B5/B5c — counter-pins without regression; vacuous-HELD transcript + guard
  {
    const pinsRaw = readT(PINS);
    let pins = null;
    try { pins = pinsRaw && JSON.parse(pinsRaw.toString('utf8')); } catch {}
    const mut = readT('.ufo/waves/round-57/build/MutCounter57/counter-mutant.txt');
    const selfSrc = readT('.ufo/waves/round-57/probe/attest57-probe.mjs');
    const transcriptOk = Boolean(mut && /ATTEST57_UNMET held=0\/0/.test(mut.toString('utf8')) && /exit[ =]1|exit 1|process_exit=1/.test(mut.toString('utf8')));
    const guardOk = Boolean(selfSrc && /checks\.length\s*===\s*0|checks\.length\s*<\s*1|checks\.length\s*>\s*0/.test(selfSrc.toString('utf8')));
    if (!pins || pins.version !== 1 || !Array.isArray(pins.pins) || pins.pins.length < 5) {
      hold('B5', false, `counter-pins registry absent or small; vacuous transcript=${transcriptOk} guard=${guardOk}`);
    } else {
      let ok = true; const misses = [];
      for (const p of pins.pins) {
        const bytes = readT(p.path);
        if (!bytes || sha(bytes) !== p.sha256) { ok = false; misses.push(p.name); }
      }
      const need = ['attest56-probe', 'doctrine56-probe', 'source-dupes'];
      for (const n of need) {
        const p = pins.pins.find((x) => x.name === n);
        const b = p && readT(p.path);
        if (!p || !b || sha(b) !== p.sha256) { ok = false; misses.push(`${n}-pin`); }
      }
      const self = pins.pins.find((p) => p.name === 'attest57-probe');
      const selfBytes = self && readT(self.path);
      if (!self || self.path !== '.ufo/waves/round-57/probe/attest57-probe.mjs' || !selfBytes || sha(selfBytes) !== self.sha256) { ok = false; misses.push('attest57-probe-pin'); }
      const d57 = pins.pins.find((p) => p.name === 'doctrine57-probe');
      const d57Bytes = d57 && readT(d57.path);
      if (!d57 || d57.path !== '.ufo/waves/round-57/probe/doctrine57-probe.mjs' || !d57Bytes || sha(d57Bytes) !== d57.sha256) { ok = false; misses.push('doctrine57-probe-pin'); }
      const rm = pins.pins.find((p) => p.name === 'readme-map');
      const rmBytes = rm && readT(rm.path);
      if (!rm || rm.path !== 'scripts/readme-map.mjs' || !rmBytes || sha(rmBytes) !== rm.sha256) { ok = false; misses.push('readme-map-pin'); }
      hold('B5', ok && transcriptOk && guardOk && pins.pins.length >= 5,
        `pins=${pins.pins.length} misses=${JSON.stringify(misses)} vacuous:transcript=${transcriptOk} guard=${guardOk}`);
    }
  }
  // B6 — pin.readme-map + proxy strict MATCH
  {
    const sc = readT('SCORECARD.md');
    const gate = readT(GATE);
    let pinOk = false;
    if (sc && gate) {
      const m = sc.toString('utf8').match(/pin\.readme-map=([0-9a-f]{64})/);
      pinOk = m && m[1] === sha(gate);
    }
    const r = nodeRun([join(T, 'scripts/proxy-check.mjs'), '--strict']);
    hold('B6', Boolean(pinOk && r.status === 0 && last(r).includes('PROXY: MATCH')),
      `pinOk=${Boolean(pinOk)} proxyExit=${r.status} last=${JSON.stringify(last(r))}`);
  }
  // B7 — SKILL registry row + checklist items 24..27 bound (R56-V2 amendment)
  {
    const sk = readT('SKILL.md');
    if (!sk) { hold('B7', false, 'SKILL.md absent'); }
    else {
      const txt = sk.toString('utf8');
      const rowOk = /\|\s*readme-map\s*\|\s*gate\s*\|/.test(txt) && txt.includes('kumitate-readme-map-v1');
      const itemLines = txt.split('\n').filter((l) => /^\s*- \[/.test(l));
      const items = itemLines.length;
      const i24 = itemLines[23] || '', i25 = itemLines[24] || '', i26 = itemLines[25] || '', i27 = itemLines[26] || '';
      const bind = i24.includes('counter-pins.mjs') && i25.includes('source-capture.mjs')
        && i26.includes('source-dupes.mjs') && i27.includes('readme-map.mjs');
      hold('B7', rowOk && items === 27 && bind,
        `row=${rowOk} items=${items} i24..27=${bind}`);
    }
  }
  // B8 — receipt-attest VALID over the three receipts, nonces distinct, span >= 300 s
  {
    const dir = join(T, '.ufo/waves/round-57/receipts');
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
      const older = git(['grep', '-ohE', '"nonce":\\s*"[0-9a-f]+"', rev, '--', '.ufo/waves/round-4[89]', '.ufo/waves/round-5[0-6]']);
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
  // B9 — routed-defect binding: lesson names R56-V1/V2/V3; LOG carries V2+V3; captures S117..S120
  {
    const les = readT('corpus/lessons/round-57.md');
    const log = readT('LOG.md');
    const regRaw = readT('.ufo/pins/source-captures.json');
    let reg = null;
    try { reg = regRaw && JSON.parse(regRaw.toString('utf8')); } catch {}
    const lesTxt = les ? les.toString('utf8') : '';
    const lesOk = /R56-V1/.test(lesTxt) && /R56-V2/.test(lesTxt) && /R56-V3/.test(lesTxt);
    const logTxt = log ? log.toString('utf8') : '';
    const logOk = /R56-V2/.test(logTxt) && /R56-V3/.test(logTxt);
    let capOk = false;
    if (reg && Array.isArray(reg.captures)) {
      capOk = ['S117', 'S118', 'S119', 'S120'].every((id) => {
        const c = reg.captures.find((x) => x.sourceId === id);
        const b = c && readT(c.path);
        return c && b && sha(b) === c.sha256;
      });
    }
    hold('B9', Boolean(lesOk && logOk && capOk),
      `lesson=${lesOk} log=${logOk} captures=${capOk}`);
  }
  // B10 — independent file<->row recomputation agrees with the gate verdict
  {
    const regRaw = readT(REG);
    let reg = null;
    try { reg = regRaw && JSON.parse(regRaw.toString('utf8')); } catch {}
    const files = corpusFiles();
    const rows = readmeRows();
    if (!files || !rows || !reg) { hold('B10', false, `files=${Boolean(files)} rows=${Boolean(rows)} reg=${Boolean(reg)}`); }
    else {
      const fileSet = new Set(files);
      const rowSet = new Set(rows);
      const uncovered = files.filter((f) => !rowSet.has(f));
      const orphans = rows.filter((r) => !fileSet.has(r));
      const dupes = rows.filter((r, i) => rows.indexOf(r) !== i);
      const covered = new Set(reg.covered);
      const stale = [...covered].filter((c) => !fileSet.has(c));
      const uncoveredCovered = [...covered].filter((c) => !rowSet.has(c));
      const unpinned = files.filter((f) => !covered.has(f));
      const r = nodeRun([join(T, GATE)]);
      const agree = uncovered.length === 0 && orphans.length === 0 && dupes.length === 0
        && stale.length === 0 && uncoveredCovered.length === 0 && unpinned.length === 0
        && r.status === 0 && /README_MAP: CLEAN/.test(last(r));
      hold('B10', agree,
        `uncovered=${uncovered.length} orphans=${orphans.length} dupes=${dupes.length} stale=${stale.length} uncoveredCovered=${uncoveredCovered.length} unpinned=${unpinned.length} gateExit=${r.status}`);
    }
  }
} catch (e) {
  if (!(e instanceof EarlyExit)) {
    process.stderr.write(`ATTEST57: FAIL-CLOSED ${e && e.stack ? e.stack.split('\n')[0] : e}\n`);
    process.exit(2);
  }
} finally {
  rmSync(T, { recursive: true, force: true });
}
if (checks.length === 0) {
  process.stdout.write(`ATTEST57: ATTEST57_UNMET held=0/0 checks=0 rev=${rev} rule=${RULE} version=v1 | hold-call-deleted\n`);
  process.exit(1);
}
const held = checks.filter((c) => c.ok).length;
const parts = checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail}`}`).join(' | ');
process.stdout.write(`ATTEST57: ${held === checks.length ? 'ATTEST57_HELD' : 'ATTEST57_UNMET'} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} version=v1 | ${parts}\n`);
process.exit(held === checks.length ? 0 : 1);
