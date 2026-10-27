// build-fixture.mjs — assemble the union-draft fixture lane for K68MutLedgerRows.
// Landed rows: build/K68ScribeLedgerA/rows.md (r55-57), build/K68ScribeLedgerD/rows.md (r64-65).
// Synthesized: r58, r60..r63 (open), r66 D1-D3 closed + item4 wontfix (canonical class slugs).
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const S = '/fast/scratch/hyaku/kumitate-r68/K68MutLedgerRows';
const FX = join(S, 'fx');
const items = JSON.parse(readFileSync(join(S, 'items.json'), 'utf8')).rounds;

// --- counter arms, verbatim semantics
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

// --- 1. landed rows
const landed = [];
for (const f of ['K68ScribeLedgerA', 'K68ScribeLedgerD']) {
  const txt = readFileSync(join(LANE, '.ufo/waves/round-68/build', f, 'rows.md'), 'utf8');
  for (const l of txt.split('\n')) {
    if (!/^\| R\d/.test(l)) continue;
    const c = l.trim().slice(1, -1).split('|').map((x) => x.trim());
    if (c.length !== 7) { console.error(`LANDEROW-CELLS ${f}: ${c.length}: ${l.slice(0, 80)}`); process.exit(1); }
    landed.push({ id: c[0], n: Number(c[1]), k: Number(c[2]), quote: c[3].replace(/^"(.*)"$/, '$1'), cls: c[4], status: c[5], answer: c[6], src: f });
  }
}
console.log(`landed rows: ${landed.length} (A=${landed.filter(r=>r.src==='K68ScribeLedgerA').length}, D=${landed.filter(r=>r.src==='K68ScribeLedgerD').length})`);

// --- 2. synthesized rows [id, n, k, quote, class, status, answer]
const mine = [
  ['R58-1',58,1,'the C2 base counter is misreported','tally-drift','open','-'],
  ['R58-2',58,2,'35 reports, 29 never spawned','dispatch-accounting','open','-'],
  ['R58-3',58,3,'cites S121 for the new entry','citation-integrity','open','-'],
  ['R58-4',58,4,'the tier counts are wrong','tally-drift','open','-'],
  ['R58-5',58,5,'its own registry table carries 18 kind=gate rows','tally-drift','open','-'],
  ['R58-6',58,6,'gained no receipt-evidence row','registry-home','open','-'],
  ['R58-7',58,7,'without a README row or a readme-map pin','reference-drift','open','-'],
  ['R58-8',58,8,'REJECT 3 reason calls S126','report-fidelity','open','-'],
  ['R60-1',60,1,'Six modified files and seven untracked','uncommitted-work','open','-'],
  ['R60-2',60,2,'TIP, MEASURED, COMMITS are unfilled','dangling-pointer','open','-'],
  ['R60-3',60,3,'9/10 contradicts its own receipt','tally-drift','open','-'],
  ['R60-4',60,4,'nonexistent evidence files cited','dangling-pointer','open','-'],
  ['R60-5',60,5,'not in the gate\'s schema','dispatch-accounting','open','-'],
  ['R60-6',60,6,'dead seats unreported','report-fidelity','open','-'],
  ['R60-7',60,7,'LOG tie is unsupported at the tip','uncommitted-work','open','-'],
  ['R60-8',60,8,'sixth recurrence of the R56-V3','reference-drift','open','-'],
  ['R60-9',60,9,'cites the wrong snapshot id','citation-integrity','open','-'],
  ['R61-1',61,1,'falsifier fixtures live only in tmpfs','uncommitted-work','open','-'],
  ['R61-2',61,2,'frozen counters admit fabrication and reject honest work','frozen-predicate-defect','open','-'],
  ['R61-3',61,3,'in-place edits to filed bytes','append-only-violation','open','-'],
  ['R61-4',61,4,'still carries 6 MEASURED/TIP/COMMITS tokens','dangling-pointer','open','-'],
  ['R61-5',61,5,'proxy DRIFT and an unpinned tool','reference-drift','open','-'],
  ['R61-6',61,6,'dead seat Audit19','dispatch-accounting','open','-'],
  ['R62-1',62,1,'claims before any evidence seats','wave-shape','open','-'],
  ['R62-2',62,2,'Run waves through the validator','dispatch-accounting','open','-'],
  ['R62-3',62,3,'fourth consecutive round noted','carried-unaddressed','open','-'],
  ['R62-4',62,4,'the re-queue\'s own report lists the exhaustive','verification-gap','open','-'],
  ['R62-5',62,5,'Six pre-existing W04 duplicate-URL registry warnings','citation-integrity','open','-'],
  ['R63-1',63,1,'lands without a corpus/README.md map row','reference-drift','open','-'],
  ['R63-2',63,2,'69/69 is currently prose in SCORECARD/SKILL only','verification-gap','open','-'],
  ['R63-3',63,3,'three -2 stems, not one','tally-drift','open','-'],
  ['R63-4',63,4,'masks four missing kimi-root members','tally-drift','open','-'],
  ['R63-5',63,5,'the Q51 hash 9237a72 that resolves nowhere','carried-unaddressed','open','-'],
  ['R63-6',63,6,'seat band missed by one','wave-shape','open','-'],
  ['R66-D1',66,1,'settle the wave leftovers','uncommitted-work','closed','`.ufo/waves/round-68/plan.md:17` — "settled by the wrap-up commits (D1 debt closed)"'],
  ['R66-D2',66,2,'after cites held=3/6','report-fidelity','closed','`corpus/lessons/round-66.md:11` — "at tip `6c79d68caf956e6c74a0c17c388662f4d1b7dec1`, `LEDGER66_UNMET held=3/6`, exit 1"'],
  ['R66-D3',66,3,'no sourced claim and no SOURCES advance landed','citation-integrity','closed','`.ufo/waves/round-68/plan.md:105` — "Rows: S207 (deprecated.md 2026-07-28), S208"'],
  ['R66-4',66,4,'all four SHONEN boxes remain lane-asserted','wave-shape','wontfix','`corpus/lessons/round-66.md:7` — "claims not verified; the dispatched v2 wave had no `WAVE-DONE` or results receipt at report cutoff, so wave output was not integrated"'],
].map(([id, n, k, quote, cls, status, answer]) => ({ id, n, k, quote, cls, status, answer, src: 'K68MutLedgerRows' }));

const rows = [...landed, ...mine];

// --- 3. fixture assembly (before verification: answers are checked against fixture copies)
mkdirSync(FX, { recursive: true });
const cp = (rel) => { const dst = join(FX, rel); mkdirSync(dirname(dst), { recursive: true }); cpSync(join(LANE, rel), dst); };
cp('scripts/routed-ledger.mjs');
for (let n = 55; n <= 66; n += 1) cp(`corpus/lessons/round-${n}-verifier-spotcheck.md`);
for (const rel of ['corpus/lessons/round-56.md', 'corpus/lessons/round-57.md', 'corpus/lessons/round-58.md', 'corpus/lessons/round-65.md', 'corpus/lessons/round-66.md', 'corpus/README.md', 'LOG.md', '.ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt', '.ufo/waves/round-66/d1-gate-correction.md', '.ufo/waves/round-66/w1/K66ExecCiteCheckD5.md', '.ufo/waves/round-68/plan.md']) cp(rel);
writeFileSync(join(FX, 'SKILL.md'), '# s\n\n| gate | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
writeFileSync(join(FX, 'corpus/QUALITY.md'), '# q\n\n- criterion naming routed-ledger (Q62 stub)\n');
writeFileSync(join(FX, 'SCORECARD.md'), '# sc\n\n## Capabilities\n\n| routed-ledger | stub row |\n|---|---|\n');

// --- 4. verify every row with the counter's L3 arms + the v1 tool's arms
const problems = [];
const seenId = new Set(); const coverage = new Map(); const nonOpen = new Map();
for (const r of rows) {
  const where = `${r.id}(src=${r.src})`;
  if (seenId.has(r.id)) problems.push(`${where}:dup-id`); seenId.add(r.id);
  const sec = items[String(r.n)];
  if (!sec) { problems.push(`${where}:round-${r.n}-no-items`); continue; }
  if (r.k < 1 || r.k > sec.length) { problems.push(`${where}:item-absent-k=${r.k}-of-${sec.length}`); continue; }
  const item = sec[r.k - 1].norm;
  const nq = nwords(r.quote);
  if (nq < 3 || nq > 25) problems.push(`${where}:quote-words=${nq}`);
  if (!wb(r.quote, item)) problems.push(`${where}:quote-not-wb-in-item`);
  if (!norm(item).includes(norm(r.quote))) problems.push(`${where}:v1-substring-fail`);
  const hits = sec.filter((x) => wb(r.quote, x.norm)).length;
  if (hits > 1) problems.push(`${where}:quote-not-unique(${hits})`);
  if (!/^R(\d+)-/.exec(r.id) || Number(/^R(\d+)-/.exec(r.id)[1]) !== r.n) problems.push(`${where}:id-round-mismatch`);
  if (!/^[a-z][a-z0-9-]*$/.test(r.cls)) problems.push(`${where}:class`);
  const key = `${r.n}#${r.k}`;
  coverage.set(key, (coverage.get(key) || 0) + 1);
  if (r.status === 'open') { if (r.answer !== '-') problems.push(`${where}:open-with-answer`); continue; }
  if (!['closed', 'wontfix'].includes(r.status)) { problems.push(`${where}:status=${r.status}`); continue; }
  if (nonOpen.has(key)) problems.push(`${where}:CONTRADICTS-${nonOpen.get(key)}`); nonOpen.set(key, r.id);
  const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(r.answer);
  if (!m) { problems.push(`${where}:answer-format`); continue; }
  if (nwords(m[3]) > 25) problems.push(`${where}:answer-words`);
  const p = m[1];
  if (p === 'corpus/routed-ledger.md' || /^corpus\/lessons\/round-\d+-verifier-spotcheck\.md$/.test(p) || p.startsWith('..') || p.startsWith('/')) problems.push(`${where}:answer-path-forbidden`);
  const abs = join(FX, p);
  if (!existsSync(abs)) { problems.push(`${where}:answer-file-missing-in-fixture:${p}`); continue; }
  const AL = readFileSync(abs, 'utf8').split('\n');
  const ln = Number(m[2]);
  if (ln < 1 || ln > AL.length) { problems.push(`${where}:answer-line-range=${ln}/${AL.length}`); continue; }
  if (!wb(m[3], AL[ln - 1])) problems.push(`${where}:answer-NOT-AT-EXACT-LINE:${p}:${ln}`);
  const win = norm(AL.slice(Math.max(0, ln - 3), Math.min(AL.length, ln + 2)).join(' '));
  if (!win.includes(norm(m[3]))) problems.push(`${where}:v1-window-fail`);
}
for (const [n, sec] of Object.entries(items)) sec.forEach((_, i) => { if (!coverage.has(`${n}#${i + 1}`)) problems.push(`UNLEDGERED:${n}#${i + 1}`); });
for (const [k, v] of coverage) if (v > 1) problems.push(`double-covered:${k}x${v}`);
const classes = new Map();
for (const r of rows) { const s = classes.get(r.cls) || new Set(); s.add(r.n); classes.set(r.cls, s); }
console.log(`rows=${rows.length} coverage=${coverage.size}/61 classes=${classes.size} refdrift-rounds=${[...(classes.get('reference-drift') || [])].sort((a, b) => a - b).join(',')}`);
if (problems.length) { console.error('PROBLEMS:\n' + problems.join('\n')); process.exit(1); }

// --- 5. emit ledger
const order = (a, b) => a.n - b.n || a.k - b.k;
const table = rows.slice().sort(order).map((r) => `| ${r.id} | ${r.n} | ${r.k} | "${r.quote}" | ${r.cls} | ${r.status} | ${r.answer} |`);
const ledger = ['# Routed ledger (UNION DRAFT — fixture for the K68MutLedgerRows mutation suite)', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...table, ''].join('\n');
writeFileSync(join(FX, 'corpus/routed-ledger.md'), ledger);
writeFileSync(join(S, 'ledger-union-draft.md'), ledger);
console.log(`fixture assembled at ${FX}; ledger rows=${table.length}; copies of ledger at ${S}/ledger-union-draft.md`);
