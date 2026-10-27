#!/usr/bin/env node
/* Harness 6: corrected synthetic ledger (pipe-free quotes) so the baseline lane PASSES
 * the frozen counter (LEDGER66_HELD 6/6). Then mutate ONE edge at a time and re-run
 * the frozen counter + the tool on the same bytes to isolate divergence. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, copyFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const PROBE = join(LANE, '.ufo/waves/round-66/probe/ledger66-probe.mjs');
const TOOL = process.env.TOOL || '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/lanes6';

const tool = await import(`file://${TOOL}`);
const clsOf = (n, i) => (i === 0 ? 'class-recurrent' : `class-${((n + i) % 5) + 2}`);
// a quote that is a substring of norm(item) and contains no pipe/quote chars:
// take the first run of >=5 consecutive whitespace-separated tokens that carry no | or "
const safeQuote = (it) => {
  const toks = tool.norm(it).split(' ').filter(Boolean);
  const run = [];
  for (const t of toks) {
    if (t.includes('|') || t.includes('"')) { if (run.length >= 5) break; run.length = 0; continue; }
    run.push(t);
    if (run.length === 5) break;
  }
  return run.join(' ');
};

function spotText(n, o = {}) {
  const L = [];
  L.push(`# Round ${n} — non-author verification and spot-check`, '');
  L.push('## 4. Verdicts', '', `- verdict bullet for round ${n}`, '');
  L.push('## 5. Routed defects the lane must fix next round', '');
  if (o.comment) { L.push('<!--', `- commented-out line in round ${n}`, '-->'); L.push(''); }
  if (o.fence) { L.push('```text', `- fenced example line in round ${n}`, '```', ''); }
  if (o.thematic) { L.push('- - -', ''); }
  L.push(`- **D1 — the readme row is missing in round ${n}.**`);
  L.push(`  - nested note for round ${n}`);
  L.push(`1. **D2 — tier counts are wrong in round ${n}.**`);
  L.push('');
  L.push('| id | what |', '|---|---|', `| D3 | the capability row is absent in round ${n} |`);
  L.push('');
  L.push('## 7. Non-author statement', '', `- not routed in round ${n}`, '');
  let t = L.join('\n');
  if (o.crlf) t = t.replace(/\n/g, '\r\n');
  return t;
}

function rowsFor(variant, itemsByRound) {
  const rows = [];
  for (const [n, items] of itemsByRound) {
    items.forEach((it, i) => {
      const q = safeQuote(it);
      const last = n === 65;
      const answer = last ? `\`notes/answers.md:${i + 1}\` — "the answer for round 65 item ${i + 1}"` : '-';
      const status = last ? 'closed' : 'open';
      let row = `| R${n}-I${i + 1} | ${n} | ${i + 1} | "${q}" | ${clsOf(n, i)} | ${status} | ${answer} |`;
      if (variant === 'no-trailing-pipe' && n === 55 && i === 0) row = row.replace(/\|\s*$/, '');
      if (variant === 'escaped-pipe' && n === 55 && i === 0) row = row.replace(`"${q}"`, `"${q} \\| tail"`);
      if (variant === 'curly-quote' && n === 55 && i === 0) row = row.replace(`"${q}"`, `“${q}”`);
      if (variant === 'trailing-space' && n === 55 && i === 0) row = `${row}  `;
      rows.push(row);
    });
  }
  return rows;
}

function buildLane(dir, variant, o = {}) {
  rmSync(dir, { recursive: true, force: true });
  for (const d of ['scripts', 'corpus/lessons', 'notes']) mkdirSync(join(dir, d), { recursive: true });
  copyFileSync(TOOL, join(dir, 'scripts', 'routed-ledger.mjs'));
  const itemsByRound = [];
  for (let n = 55; n <= 65; n += 1) {
    const txt = spotText(n, o);
    writeFileSync(join(dir, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), txt);
    itemsByRound.push([n, tool.routedItems(txt).items]);
  }
  writeFileSync(join(dir, 'notes', 'answers.md'), ['# answers', ...Array.from({ length: 12 }, (_, i) => `the answer for round 65 item ${i + 1}`)].join('\n'));
  const extra = [];
  if (variant === 'second-ledger') {
    extra.push('## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|',
      `| R55-I1 | 55 | 1 | "${safeQuote(itemsByRound[0][1][0])}" | class-dup | open | - |`);
  }
  writeFileSync(join(dir, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rowsFor(variant, itemsByRound), '', ...extra, ''].join('\n'));
  if (variant === 'symlink-to-ledger') {
    symlinkSync('../corpus/routed-ledger.md', join(dir, 'notes', 'link.md'));
  }
  writeFileSync(join(dir, 'SKILL.md'), '| capability | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
  writeFileSync(join(dir, 'corpus', 'QUALITY.md'), 'routed-ledger is checked by scripts/routed-ledger.mjs\n');
  writeFileSync(join(dir, 'SCORECARD.md'), '## Capabilities\n| capability | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
  const g = (...a) => spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  g('init', '-q');
  const top = g('rev-parse', '--show-toplevel').stdout.trim();
  if (top !== dir) throw new Error(`toplevel mismatch ${top} != ${dir}`);
  g('add', '-A');
  const c = g('-c', 'user.name=h', '-c', 'user.email=h@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'fixture');
  if (c.status !== 0) throw new Error(`commit failed: ${c.stderr}`);
  return g('rev-parse', 'HEAD').stdout.trim();
}

const VARIANTS = [
  ['plain', {}],
  ['no-trailing-pipe', {}],
  ['escaped-pipe', {}],
  ['curly-quote', {}],
  ['trailing-space', {}],
  ['second-ledger', {}],
  ['crlf-spotcheck', { crlf: true }],
  ['fence-in-section', { fence: true }],
  ['comment-in-section', { comment: true }],
  ['thematic-break', { thematic: true }],
];

const out = [];
for (const [variant, o] of VARIANTS) {
  const dir = join(ROOT, variant);
  const rev = buildLane(dir, variant, o);
  const r = spawnSync('node', [PROBE, dir, rev], { encoding: 'utf8', env: { ...process.env, TMPDIR: '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge' } });
  const t = spawnSync('node', [TOOL, '--root', dir, '--rev', rev, '--from', '55', '--to', '65'], { encoding: 'utf8' });
  out.push({
    variant,
    counter_exit: r.status,
    counter: (r.stdout || '').trim(),
    tool_exit: t.status,
    tool: (t.stdout || '').trim().split('\n').filter((l) => l.startsWith('ROUTED_LEDGER') || l.startsWith('FINDING')).slice(0, 3).join(' || '),
  });
}
console.log(JSON.stringify(out, null, 1));
