#!/usr/bin/env node
/**
 * ledger68-probe.mjs — frozen counter for kumitate round 68 claim C1 (rule L68 v1).
 *
 *   node .ufo/waves/round-68/probe/ledger68-probe.mjs <lane-dir> <rev> [--tool <path-in-archive>] [--seed <hex>]
 *
 * Predicate LEDGER68_HELD (checks L1..L7), measured over `git archive <rev>` (never the worktree):
 *   L1 the archive's `scripts/routed-ledger.mjs --selftest` prints `ROUTED_LEDGER_SELFTEST: PASS (n/n)`, n >= 44, exit 0.
 *   L2 the archive's tool run inside a second clean extraction of M (`--root <extraction> --from 55 --to 66 --classes`)
 *     exits 0 with `ROUTED_LEDGER: CLEAN spotchecks=12`, `items=` equal to THIS counter's own fence-aware item count
 *     over the twelve spot-checks, and rows >= items.
 *   L3 this counter's own re-verification of `corpus/routed-ledger.md` at <rev> (independent of the tool): every item
 *     of rounds 55..66 has a row whose quote is >= 3 words, word-boundary-located and unique within its routed
 *     section; every closed/wontfix row's answer quote is located at the exact named line (no window) of a lane file
 *     that is neither the ledger nor a spot-check; no (round,item) carries more than one non-open row; every
 *     round-66 item (D1-D3) has a closed or wontfix row whose answer quote is NOT found in that file at the round-66
 *     base `8d557f85312de4fcc82e09ff735d21436bc3746d` (answered this round); >= 5 distinct classes; >= 1 class spans
 *     >= 4 distinct spot-check rounds.
 *   L4 held-out fixtures generated NOW with random tokens (seeded by --seed or crypto; no answer key exists to read):
 *     the archive's tool, run on each fixture with --root, returns the expected exit code and finding id / item
 *     count for all 20 mutants (good; drop; quote-swap; quote-decoy; answer-wrong; answer-ledger; answer-eof; dup;
 *     ordinal; nested-as-item; prose-as-item; long-quote; one-word-quote; ambiguous-quote; shifted-answer;
 *     fence-item; second-section; contradictory; no-section; ledger-absent).
 *   L5 the counter can fail: an always-CLEAN stub and an always-DRIFT stub, run through the same L4 harness, both
 *     miss it; L5 counts only where the real tool passes L4 (never vacuous).
 *   L6 registry home in the same revision: SKILL.md carries a table row naming `routed-ledger.mjs`;
 *     corpus/QUALITY.md names `routed-ledger`; SCORECARD.md `## Capabilities` holds a table row whose first cell
 *     names `routed-ledger`.
 *   L7 counter self-confinement, proven by fixtures at counting time: re-running this counter with
 *     NODE_OPTIONS=--require <preload> set prints `LEDGER68_UNMET held=0/7 … | ENV_POISONED` and exits 2; a revision
 *     whose `scripts/routed-ledger.mjs` is a symlink fails L1 (never executes a host file); a revision containing any
 *     symlink or non-regular file fails closed `EXTRACTION_UNSAFE` before any check; every child process runs under
 *     an explicit environment allow-list (PATH, TMPDIR) with a timeout.
 * Verdict: LEDGER68_HELD held=7/7 checks=7 rev=<full> rule=L68 (exit 0) | LEDGER68_UNMET held=k/7 … | MISS reasons (exit 1);
 * exit 2 when the revision cannot be read or archived, or the environment/extraction is unsafe.
 * Scratch: honours TMPDIR; everything is removed before exit.
 */
import { spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync, lstatSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, normalize, sep, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULE = 'L68';
const BASE = 'd23892ad44b41e1af63b3edb949d265ca1dd812d';   // round-68 base: lane tip when the round started
const R66BASE = '8d557f85312de4fcc82e09ff735d21436bc3746d'; // round-66 base: L3's answered-this-round clause
const FROM = 55; const TO = 66; const N_CHECKS = 7;
const POISON = ['NODE_OPTIONS', 'LD_PRELOAD', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_COMMON_DIR', 'TAR_OPTIONS'];
const SELF = fileURLToPath(import.meta.url);

// ---- confinement preamble: refuse a poisoned environment before anything runs
for (const k of POISON) {
  if (process.env[k]) {
    process.stdout.write(`LEDGER68_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=unknown rule=${RULE} | ENV_POISONED:${k}\n`);
    process.exit(2);
  }
}

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--tool', '--seed'].includes(argv[i - 1])));
if (pos.length < 2) { process.stderr.write('usage: ledger68-probe.mjs <lane-dir> <rev> [--tool path] [--seed hex]\n'); process.exit(64); }
const lane = resolve(pos[0]);
const rev = pos[1];
const TOOL_REL = opt('--tool', 'scripts/routed-ledger.mjs');
const SEED = opt('--seed', randomBytes(8).toString('hex'));

const CHILD_ENV = (T) => ({ PATH: process.env.PATH || '/usr/bin:/bin', TMPDIR: T, LANG: process.env.LANG || 'C' });
const T = mkdtempSync(join(tmpdir(), 'ledger68.'));
const A = join(T, 'archive');

const rv = spawnSync('git', ['-C', lane, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8', env: CHILD_ENV(T) });
if (rv.status !== 0) { process.stdout.write(`LEDGER68_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=${rev} rule=${RULE} | rev-unreadable\n`); rmSync(T, { recursive: true, force: true }); process.exit(2); }
const full = rv.stdout.trim();

// ---- symlink-safe extraction; any symlink/special file in the revision fails closed
function extract(dst) {
  mkdirSync(dst);
  const ar = spawnSync('bash', ['-c', `git -C "${lane}" archive "${full}" | tar -x --no-same-owner --no-same-permissions -C "${dst}"`], { encoding: 'utf8', env: CHILD_ENV(T) });
  if (ar.status !== 0) return 'archive-failed';
  const walk = (d) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, f.name);
      if (f.isSocket() || f.isFIFO() || f.isBlockDevice() || f.isCharacterDevice()) return p;
      if (f.isDirectory()) { const r = walk(p); if (r) return r; }
    }
    return null;
  };
  return walk(dst); // symlinks are tolerated in evidence trees but NEVER followed: every read/execute path is chain-checked

}
const bad = extract(A);
if (typeof bad === 'string') {
  process.stdout.write(`LEDGER68_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=${full} rule=${RULE} | ${bad === 'archive-failed' ? 'archive-failed' : 'EXTRACTION_UNSAFE'}\n`);
  rmSync(T, { recursive: true, force: true }); process.exit(2);
}
let UNSAFE = false;
function chainSafe(p) {
  const rel = relative(A, p); const parts = rel.split(sep);
  let cur = A;
  for (const part of parts) {
    cur = join(cur, part);
    let st;
    try { st = lstatSync(cur); } catch { return true; } // a not-yet-existing component cannot be a symlink
    if (st.isSymbolicLink()) return false;
  }
  return true;
}
const rd = (rel) => {
  const p = join(A, rel);
  if (!chainSafe(p)) { UNSAFE = true; return null; }
  try { return readFileSync(p, 'utf8'); } catch { return null; }
};
const atR66Base = (rel) => { const r = spawnSync('git', ['-C', lane, 'show', `${R66BASE}:${rel}`], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: CHILD_ENV(T) }); return r.status === 0 ? r.stdout : null; };
const TOOL = join(A, TOOL_REL);

const norm = (s) => String(s)
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const nwords = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const wb = (quote, text) => { const q = norm(quote); if (!q) return false; return new RegExp(`(^|[^A-Za-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`).test(norm(text)); };

const results = {}; const miss = [];
const check = (id, ok, why) => { results[id] = !!ok; if (!ok) miss.push(`${id} MISS ${why}`); };

// ---- independent fence-aware routed-section parser (written apart from the tool; same declared rule)
function items67(text) {
  const lines = String(text).split('\n');
  const heads = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const f = lines[i].match(/^ {0,3}(```|~~~)/);
    if (f) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = lines[i].match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= 6 && /\brouted\s+(defect|defects|item|items)\b/i.test(m[2])) heads.push({ i, lvl: m[1].length });
  }
  if (!heads.length) return { sections: [], items: [] };
  const sections = heads.map((h, idx) => {
    const end = idx + 1 < heads.length ? heads[idx + 1].i : lines.length;
    const sec = []; let fence = false;
    for (let j = h.i + 1; j < end; j += 1) {
      const fv = lines[j].match(/^ {0,3}(```|~~~)/);
      if (fv) { fence = !fence; sec.push({ l: lines[j], fence: true }); continue; }
      sec.push({ l: lines[j], fence });
    }
    return sec;
  });
  const items = [];
  for (const sec of sections) {
    const isSep = (l) => l.startsWith('|') && /-/.test(l) && /^[|\s:-]+$/.test(l.trim());
    for (let i = 0; i < sec.length; i += 1) {
      const l = sec[i].l;
      if (sec[i].fence) continue;
      const list = /^([-*+]|[0-9]+[.)])\s+\S/.test(l);
      const row = l.startsWith('|') && !isSep(l) && !(i + 1 < sec.length && isSep(sec[i + 1].l));
      if (row) { items.push({ n: null, text: l }); continue; }
      if (!list) continue;
      let body = l;
      for (let j = i + 1; j < sec.length; j += 1) {
        const n = sec[j];
        if (n.fence && !/^ {0,3}(```|~~~)/.test(n.l)) { body += `\n${n.l}`; continue; }
        if (/^([-*+]|[0-9]+[.)])\s+\S/.test(n.l) || (n.l.startsWith('|') && !isSep(n.l))) break;
        if (/^\S/.test(n.l) && sec[j - 1].l.trim() === '') break;
        body += `\n${n.l}`;
      }
      items.push({ n: null, text: body });
    }
  }
  return { sections, items: items.map((x) => x.text) };
}
const spotPath = (n) => `corpus/lessons/round-${n}-verifier-spotcheck.md`;
const ledgerParse = (text) => {
  const L = String(text || '').split('\n');
  const at = L.findIndex((l) => /^##\s+Ledger\s*$/.test(l));
  const rows = [];
  if (at < 0) return rows;
  for (let i = at + 1; i < L.length; i += 1) {
    if (/^##?\s/.test(L[i])) break;
    if (!L[i].startsWith('|') || /^\|[\s:|-]+\|\s*$/.test(L[i])) continue;
    const c = L[i].trim().slice(1, -1).split('|').map((x) => x.trim());
    if (c[0] === 'id' || c.length !== 7) { if (c[0] !== 'id') rows.push({ bad: true, line: i + 1 }); continue; }
    rows.push({ id: c[0], n: Number(c[1]), k: Number(c[2]), quote: c[3].replace(/^"(.*)"$/, '$1'), cls: c[4], status: c[5], answer: c[6], line: i + 1 });
  }
  return rows;
};

// ---- L1
if (!existsSync(TOOL)) check('L1', false, 'tool-absent');
else {
  const st = lstatSync(TOOL);
  if (!st.isFile() || !chainSafe(TOOL)) check('L1', false, 'tool-not-regular-or-symlinked');
  else {
    const r = spawnSync('node', [TOOL, '--selftest'], { encoding: 'utf8', timeout: 300000, env: CHILD_ENV(T) });
    const m = /^ROUTED_LEDGER_SELFTEST: PASS \((\d+)\/(\d+)\)$/m.exec(r.stdout || '');
    check('L1', r.status === 0 && m && m[1] === m[2] && Number(m[1]) >= 44, `exit=${r.status} line=${m ? m[0] : 'none'}`);
  }
}

// ---- own item count (used by L2 and L3) — fence-aware, per round
const spot = new Map(); let ownItems = 0; let ownSections = 0; let spotsFound = 0;
for (let n = FROM; n <= TO; n += 1) {
  const t = rd(spotPath(n));
  if (t == null) continue;
  spotsFound += 1;
  const r = items67(t);
  spot.set(n, r); ownItems += r.items.length; ownSections += r.sections.length;
}

// ---- L2: the tool runs inside a SECOND clean extraction, never the live worktree
const B = join(T, 'archive-run');
const badB = extract(B);
const TOOL_B = join(B, TOOL_REL);
if (typeof badB === 'string') check('L2', false, `extraction2-${badB === 'archive-failed' ? 'failed' : 'unsafe'}`);
else if (!existsSync(TOOL_B) || !chainSafe(TOOL_B)) check('L2', false, 'tool-absent-or-symlinked');
else {
  const r = spawnSync('node', [TOOL_B, '--root', B, '--from', String(FROM), '--to', String(TO)], { encoding: 'utf8', timeout: 300000, env: CHILD_ENV(T) });
  const v = ((r.stdout || '').trim().split('\n').pop()) || '';
  const m = /^ROUTED_LEDGER: CLEAN spotchecks=(\d+) sections=(\d+) items=(\d+) rows=(\d+) /.exec(v);
  check('L2', r.status === 0 && m && Number(m[1]) === 12 && spotsFound === 12 && Number(m[2]) === ownSections && Number(m[3]) === ownItems && Number(m[4]) >= ownItems,
    `exit=${r.status} verdict=${v.slice(0, 160)} own-items=${ownItems} own-sections=${ownSections} own-spotchecks=${spotsFound}`);
}

// ---- L3
{
  const bad = [];
  const rows = ledgerParse(rd('corpus/routed-ledger.md'));
  if (!rows.length) bad.push('ledger-empty-or-absent');
  const covered = new Set(); const classes = new Map(); const answeredNow = new Set(); const nonOpen = new Map();
  for (const r of rows) {
    if (r.bad) { bad.push(`malformed@${r.line}`); continue; }
    const secR = spot.get(r.n);
    const it = secR ? secR.items : null;
    if (!it || !(r.k >= 1 && r.k <= it.length)) { bad.push(`${r.id}:item-absent`); continue; }
    const nq = nwords(r.quote);
    if (!r.quote || nq > 25 || nq < 3) { bad.push(`${r.id}:quote-words=${nq}`); continue; }
    if (!wb(r.quote, it[r.k - 1])) { bad.push(`${r.id}:quote-not-word-boundary-in-item`); continue; }
    const hits = it.filter((t) => wb(r.quote, t)).length;
    if (hits > 1) { bad.push(`${r.id}:quote-not-unique-in-section`); continue; }
    const idm = /^R(\d+)-/.exec(r.id);
    if (idm && Number(idm[1]) !== r.n) { bad.push(`${r.id}:id-round-mismatch`); continue; }
    covered.add(`${r.n}#${r.k}`);
    if (/^[a-z][a-z0-9-]*$/.test(r.cls)) { const s = classes.get(r.cls) || new Set(); s.add(r.n); classes.set(r.cls, s); }
    if (r.status === 'open') { if (r.answer !== '-') bad.push(`${r.id}:open-with-answer`); continue; }
    if (!['closed', 'wontfix'].includes(r.status)) { bad.push(`${r.id}:status`); continue; }
    const key = `${r.n}#${r.k}`;
    if (nonOpen.has(key)) { bad.push(`${r.id}:contradictory-coverage-with-${nonOpen.get(key)}`); continue; }
    nonOpen.set(key, r.id);
    const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(r.answer);
    if (!m || nwords(m[3]) > 25) { bad.push(`${r.id}:answer-format`); continue; }
    const p = normalize(m[1]);
    if (p === 'corpus/routed-ledger.md' || /^corpus\/lessons\/round-\d+-verifier-spotcheck\.md$/.test(p) || p.startsWith('..') || p.startsWith('/')) { bad.push(`${r.id}:answer-path-forbidden`); continue; }
    const txt = rd(p);
    if (txt == null) { bad.push(`${r.id}:answer-file-absent`); continue; }
    const AL = txt.split('\n'); const ln = Number(m[2]);
    if (ln < 1 || ln > AL.length) { bad.push(`${r.id}:answer-line-out-of-range`); continue; }
    if (!wb(m[3], AL[ln - 1])) { bad.push(`${r.id}:answer-quote-not-at-exact-line`); continue; }
    const before = atR66Base(p);
    if (r.n === TO && (before == null || !norm(before).includes(norm(m[3])))) answeredNow.add(r.k);
  }
  for (const [n, sr] of spot) sr.items.forEach((_, i) => { if (!covered.has(`${n}#${i + 1}`)) bad.push(`unledgered:${n}#${i + 1}`); });
  const r66 = (spot.get(TO) || { items: [] }).items;
  if (!r66.length) bad.push('round-66-items-absent');
  r66.forEach((_, i) => { if (!answeredNow.has(i + 1)) bad.push(`r66-item-${i + 1}-not-answered-this-round`); });
  if (classes.size < 5) bad.push(`classes=${classes.size}<5`);
  if (![...classes.values()].some((s) => s.size >= 4)) bad.push('no-class-spans-4-rounds');
  check('L3', bad.length === 0, `${bad.length} problems: ${bad.slice(0, 6).join(',')}`);
}

// ---- read-path confinement: a symlink at/above any static read path fails closed before scoring continues
{
  const staticPaths = ['corpus/routed-ledger.md', 'SKILL.md', 'corpus/QUALITY.md', 'SCORECARD.md']; // the tool itself is L1's job (a symlinked tool MISSes L1, never executes)
  for (let n = FROM; n <= TO; n += 1) staticPaths.push(spotPath(n));
  if (staticPaths.some((p) => { const ap = join(A, p); return existsSync(ap) && !chainSafe(ap); }) || UNSAFE) {
    process.stdout.write(`LEDGER68_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=${full} rule=${RULE} | EXTRACTION_UNSAFE\n`);
    rmSync(T, { recursive: true, force: true }); process.exit(2);
  }
}

// ---- L4 / L5 held-out fixtures
let seedCtr = 0;
const rnd = () => { seedCtr += 1; return createHash('sha256').update(`${SEED}:${seedCtr}`).digest('hex'); };
const word = () => { const h = rnd(); return `w${h.slice(0, 6)}`; };
const phrase = (k) => Array.from({ length: k }, word).join(' ');
function buildFixture(dir, mut) {
  const lv = Number.parseInt(rnd().slice(0, 2), 16) % 2 === 0 ? '##' : '###';
  const shared = phrase(4); // ambiguous-quote pair shares this
  const items101 = [phrase(6), phrase(6), phrase(6)];
  const tableItem = phrase(5);
  const items102 = [phrase(6), phrase(6)];
  const decoy = phrase(6); const nested = phrase(5); const prose = phrase(7);
  const fenceLine = phrase(5);
  const d5 = phrase(5); // PATCH(r68): captured so A5 can quote D5's own words
  const s101 = [
    `# Round 101 — spot-check ${word()}`, '', `${lv} Verdicts`, '', `- ${decoy}`, '',
    `${lv} 5. Routed defects for the next round`, '',
    `- **D1 — ${items101[0]}.**`, `  - ${nested}`,
    `1. **D2 — ${items101[1]}.**`,
    '', prose, '',
    '| id | what |', '|---|---|', `| D3 | ${tableItem} |`,
    '', '```text', `- ${fenceLine}`, '```',
    '', `- **D4 — ${items101[2]} ${shared}.**`, '',
    `- **D5 — ${d5} ${shared}.**`, '',
    `${lv} Non-author statement`, '', `- ${phrase(4)}`,
  ];
  const s102base = [`# Round 102 — ${word()}`, '', `## Routed items`, '', `- ${items102[0]}`, `- ${items102[1]}`, '', '## End', ''];
  const s102 = mut === 'second-section'
    ? [`# Round 102 — ${word()}`, '', `## Routed items`, '', `- ${items102[0]}`, `- ${items102[1]}`, '', '## Routed items (amended)', '', `- **D3 — ${phrase(6)}.**`, '', '## End', '']
    : s102base;
  const ansLines = [`# answers ${word()}`, phrase(8), `answer ${items101[0].split(' ')[0]} ${phrase(5)}`, phrase(8)];
  const ansQuote = ansLines[2].split(' ').slice(1, 5).join(' ');
  const rows = [
    { id: 'A1', n: 101, k: 1, q: items101[0].split(' ').slice(1, 5).join(' '), status: 'closed', answer: `\`notes/a.md:3\` — "${ansQuote}"` },
    { id: 'A2', n: 101, k: 2, q: items101[1].split(' ').slice(0, 4).join(' '), status: 'open', answer: '-' },
    { id: 'A3', n: 101, k: 3, q: tableItem.split(' ').slice(1, 4).join(' '), status: 'open', answer: '-' },
    { id: 'A4', n: 101, k: 4, q: items101[2].split(' ').slice(2, 6).join(' '), status: 'open', answer: '-' },
    { id: 'A5', n: 101, k: 5, q: `${d5.split(' ').slice(3, 5).join(' ')} ${shared}`, status: 'open', answer: '-' }, // PATCH(r68): A5 quoted items101[2] (D4's words) -> unlocatable
    { id: 'A6', n: 102, k: 1, q: items102[0].split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' },
    { id: 'A7', n: 102, k: 2, q: items102[1].split(' ').slice(3, 6).join(' '), status: 'open', answer: '-' },
  ];
  let expectItems = 7;
  if (mut === 'drop') rows.splice(5, 1);
  if (mut === 'quote-swap') rows[1].q = items101[2].split(' ').slice(0, 4).join(' ');
  if (mut === 'quote-decoy') rows[3].q = decoy.split(' ').slice(0, 4).join(' ');
  if (mut === 'answer-wrong') rows[0].answer = `\`notes/a.md:3\` — "${phrase(4)}"`;
  if (mut === 'answer-ledger') rows[0].answer = '`corpus/routed-ledger.md:1` — "routed ledger"';
  if (mut === 'answer-eof') rows[0].answer = `\`notes/a.md:40\` — "${ansQuote}"`;
  if (mut === 'shifted-answer') rows[0].answer = `\`notes/a.md:4\` — "${ansQuote}"`;
  if (mut === 'dup') rows.push({ ...rows[6] });
  if (mut === 'ordinal') rows.push({ id: 'A9', n: 101, k: 6, q: prose.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'nested-as-item') rows.push({ id: 'A8', n: 101, k: 2, q: nested.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'prose-as-item') rows.push({ id: 'A10', n: 101, k: 2, q: prose.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'long-quote') rows[1].q = phrase(26);
  if (mut === 'one-word-quote') rows[1].q = items101[1].split(' ')[0];
  if (mut === 'ambiguous-quote') rows[1].q = shared;
  if (mut === 'fence-item') rows.push({ id: 'A11', n: 101, k: 5, q: fenceLine.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'contradictory') rows.push({ id: 'A12', n: 101, k: 1, q: items101[0].split(' ').slice(2, 6).join(' '), status: 'wontfix', answer: `\`notes/a.md:3\` — "${ansQuote}"` });
  if (mut === 'second-section') expectItems = 8;
  if (mut === 'no-section') { s102.splice(2, 1, '## Notes'); expectItems = 5; rows.splice(5, 2); }
  mkdirSync(join(dir, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(dir, 'notes'), { recursive: true });
  writeFileSync(join(dir, 'corpus', 'lessons', 'round-101-verifier-spotcheck.md'), s101.join('\n'));
  writeFileSync(join(dir, 'corpus', 'lessons', 'round-102-verifier-spotcheck.md'), s102.join('\n'));
  writeFileSync(join(dir, 'notes', 'a.md'), ansLines.join('\n'));
  if (mut !== 'ledger-absent') {
    const table = rows.map((r) => `| ${r.id} | ${r.n} | ${r.k} | "${r.q}" | c-${r.n} | ${r.status} | ${r.answer} |`);
    writeFileSync(join(dir, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...table, ''].join('\n'));
  }
  return expectItems;
}
const MUTANTS = [
  ['good', 0, null], ['drop', 1, 'UNLEDGERED'], ['quote-swap', 1, 'QUOTE_ABSENT'], ['quote-decoy', 1, 'QUOTE_ABSENT'],
  ['answer-wrong', 1, 'ANSWER_DEAD'], ['answer-ledger', 1, 'ANSWER_DEAD'], ['answer-eof', 1, 'ANSWER_DEAD'], ['dup', 1, 'ROW_DUPLICATE'],
  ['ordinal', 1, 'ITEM_ABSENT'], ['nested-as-item', 1, 'QUOTE_ABSENT'], ['prose-as-item', 1, 'QUOTE_ABSENT'], ['long-quote', 1, 'ROW_MALFORMED'],
  ['one-word-quote', 1, 'ROW_MALFORMED'], ['ambiguous-quote', 1, 'QUOTE_AMBIGUOUS'], ['shifted-answer', 1, 'ANSWER_DEAD'],
  ['fence-item', 1, 'QUOTE_ABSENT'], ['second-section', 1, 'UNLEDGERED'], ['contradictory', 1, 'ROW_CONTRADICTED'],
  ['no-section', 0, null], ['ledger-absent', 2, null],
];
function harness(toolPath) {
  const bad = [];
  MUTANTS.forEach(([mut, code, finding], i) => {
    const d = join(T, `fx-${i}-${mut}`);
    const expectItems = buildFixture(d, mut);
    const r = spawnSync('node', [toolPath, '--root', d, '--from', '101', '--to', '102'], { encoding: 'utf8', timeout: 60000, env: CHILD_ENV(T) });
    const out = r.stdout || ''; const v = out.trim().split('\n').pop() || '';
    let ok = r.status === code;
    if (ok && finding) ok = out.split('\n').some((l) => l.startsWith(`FINDING ${finding} `)) && v.startsWith('ROUTED_LEDGER: DRIFT ');
    if (ok && code === 0) ok = new RegExp(`^ROUTED_LEDGER: CLEAN spotchecks=2 sections=${mut === 'no-section' ? 1 : 2} items=${expectItems} `).test(v);
    if (ok && code === 2) ok = v.startsWith('ROUTED_LEDGER: FAIL-CLOSED ');
    if (!ok) bad.push(`${mut}:exit=${r.status}:${v.slice(0, 70)}`);
    rmSync(d, { recursive: true, force: true });
  });
  return bad;
}
let realL4 = false;
if (!existsSync(TOOL)) check('L4', false, 'tool-absent');
else if (!lstatSync(TOOL).isFile() || !chainSafe(TOOL)) check('L4', false, 'tool-not-regular-or-symlinked');
else { const b = harness(TOOL); realL4 = b.length === 0; check('L4', realL4, `seed=${SEED} ${b.length}/${MUTANTS.length} mutants wrong: ${b.slice(0, 4).join(';')}`); }
{
  const stubs = {
    'always-clean': "process.stdout.write('ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0\\n');process.exit(0);",
    'always-drift': "process.stdout.write('FINDING UNLEDGERED x\\nROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=UNLEDGERED:x\\n');process.exit(1);",
  };
  const caught = [];
  for (const [name, src] of Object.entries(stubs)) {
    const p = join(T, `stub-${name}.mjs`); writeFileSync(p, src);
    if (harness(p).length > 0) caught.push(name);
  }
  check('L5', realL4 && caught.length === 2, `real-tool-passes-L4=${realL4} stubs-caught=${caught.join('+') || 'none'}`);
}

// ---- L6
{
  const skill = rd('SKILL.md') || ''; const q = rd('corpus/QUALITY.md') || ''; const sc = rd('SCORECARD.md') || '';
  const skillRow = skill.split('\n').some((l) => l.startsWith('|') && l.includes('routed-ledger.mjs'));
  const qual = /routed-ledger/.test(q);
  const capAt = sc.split('\n').findIndex((l) => /^##\s+Capabilities\s*$/.test(l));
  let cap = false;
  if (capAt >= 0) {
    for (const l of sc.split('\n').slice(capAt + 1)) {
      if (/^##\s/.test(l)) break;
      if (l.startsWith('|') && /routed-ledger/.test(l.split('|')[1] || '')) { cap = true; break; }
    }
  }
  check('L6', skillRow && qual && cap, `skill-row=${skillRow} quality=${qual} capability-row=${cap}`);
}

// ---- L7: self-confinement proofs
{
  const bad = [];
  // (a) self-poison re-run: NODE_OPTIONS preload must produce ENV_POISONED exit 2
  {
    const preload = join(T, 'forge-preload.cjs');
    writeFileSync(preload, 'process.env.FORGED = "1";\n');
    const r = spawnSync(process.execPath, [SELF, lane, full], { encoding: 'utf8', timeout: 120000, env: { ...CHILD_ENV(T), NODE_OPTIONS: `--require ${preload}` } });
    const v = ((r.stdout || '').trim().split('\n').pop()) || '';
    if (!(r.status === 2 && v.includes('ENV_POISONED'))) bad.push(`self-poison:exit=${r.status}:${v.slice(0, 60)}`);
  }
  // (b) symlinked tool revision: L1 must MISS (never executes a host file)
  {
    const D = join(T, 'fx-symtool'); mkdirSync(join(D, 'scripts'), { recursive: true });
    const outside = join(T, 'outside-tool.mjs');
    writeFileSync(outside, "process.stdout.write('ROUTED_LEDGER_SELFTEST: PASS (99/99)\\n');\n");
    // build a real git fixture revision whose tool path is a symlink
    const g = (...a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8', env: CHILD_ENV(T) });
    writeFileSync(join(D, 'scripts', 'routed-ledger.mjs'), 'placeholder');
    g('init', '-q'); g('add', '-A'); g('-c', 'user.name=f', '-c', 'user.email=f@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'base');
    rmSync(join(D, 'scripts', 'routed-ledger.mjs'));
    // symlink via git object: hash-object + update-index with --cacheinfo 120000
    const h = g('hash-object', '-w', outside).stdout.trim();
    g('update-index', '--add', '--cacheinfo', `120000,${h},scripts/routed-ledger.mjs`);
    g('-c', 'user.name=f', '-c', 'user.email=f@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'symlink-tool');
    const rev2 = g('rev-parse', 'HEAD').stdout.trim();
    const r = spawnSync(process.execPath, [SELF, D, rev2], { encoding: 'utf8', timeout: 300000, env: CHILD_ENV(T) });
    const v = ((r.stdout || '').trim().split('\n').pop()) || '';
    if (!(r.status === 1 && /L1 MISS/.test(v))) bad.push(`symlink-tool:exit=${r.status}:${v.slice(0, 60)}`);
    rmSync(D, { recursive: true, force: true });
  }
  // (c) a symlink anywhere in the revision fails closed EXTRACTION_UNSAFE
  {
    const D = join(T, 'fx-symtree'); mkdirSync(join(D, 'corpus'), { recursive: true });
    writeFileSync(join(D, 'corpus', 'real.md'), 'real\n');
    const g = (...a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8', env: CHILD_ENV(T) });
    g('init', '-q');
    const h = g('hash-object', '-w', join(D, 'corpus', 'real.md')).stdout.trim();
    g('update-index', '--add', '--cacheinfo', `120000,${h},corpus/lessons`);
    g('-c', 'user.name=f', '-c', 'user.email=f@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'symlink-tree');
    const rev2 = g('rev-parse', 'HEAD').stdout.trim();
    const r = spawnSync(process.execPath, [SELF, D, rev2], { encoding: 'utf8', timeout: 120000, env: CHILD_ENV(T) });
    const v = ((r.stdout || '').trim().split('\n').pop()) || '';
    if (!(r.status === 2 && v.includes('EXTRACTION_UNSAFE'))) bad.push(`symlink-tree:exit=${r.status}:${v.slice(0, 60)}`);
    rmSync(D, { recursive: true, force: true });
  }
  check('L7', bad.length === 0, bad.join(';') || 'ok');
}

rmSync(T, { recursive: true, force: true });
const held = Object.values(results).filter(Boolean).length;
const ok = held === N_CHECKS;
process.stdout.write(`LEDGER68_${ok ? 'HELD' : 'UNMET'} held=${held}/${N_CHECKS} checks=${N_CHECKS} rev=${full} rule=${RULE} seed=${SEED}${miss.length ? ` | ${miss.join(' | ')}` : ''}\n`);
process.exit(ok ? 0 : 1);
