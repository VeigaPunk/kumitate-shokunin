#!/usr/bin/env node
/* Harness 5: build a synthetic lane whose ledger PASSES the frozen counter (LEDGER66_HELD 6/6),
 * then mutate ONE edge construct at a time and re-run the frozen counter on the same bytes.
 * Every lane is a throwaway git repo under scratch. The lane repo is never touched. */
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, rmSync, copyFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const PROBE = join(LANE, '.ufo/waves/round-66/probe/ledger66-probe.mjs');
const TOOL = process.env.TOOL || '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/lanes5';

const tool = await import(`file://${TOOL}`);
// classes: cls-1 spans rounds 55..58 (>=4 rounds), plus cls-2..cls-6 -> >=5 distinct classes
const clsOf = (n, i) => (i === 0 ? 'class-recurrent' : `class-${((n + i) % 5) + 2}`);

function spotText(n, { fence = false, comment = false, crlf = false, setext = false, dup = false } = {}) {
  const L = [];
  L.push(`# Round ${n} — non-author verification and spot-check`, '');
  L.push('## 4. Verdicts', '', `- verdict bullet for round ${n}`, '');
  L.push(`## 5. Routed defects the lane must fix next round`, '');
  if (comment) { L.push('<!--', `- commented-out line in round ${n}`, '-->'); L.push(''); }
  if (fence) { L.push('```text', `- fenced example line in round ${n}`, '```', ''); }
  L.push(`- **D1 — the readme row is missing in round ${n}.**`);
  L.push(`  - nested note for round ${n}`);
  L.push(`1. **D2 — tier counts are wrong in round ${n}.**`);
  L.push('');
  L.push(`| id | what |`, `|---|---|`, `| D3 | the capability row is absent in round ${n} |`);
  L.push('');
  if (setext) { L.push('Routed items appendix', '-------------------------', '', `- appendix item in round ${n}`, ''); }
  if (dup) { L.push('## 6. Routed defects (second block)', '', `- second block item in round ${n}`, ''); }
  L.push('## 7. Non-author statement', '', `- not routed in round ${n}`, '');
  let t = L.join('\n');
  if (crlf) t = t.replace(/\n/g, '\r\n');
  return t;
}

function rowsFor(variant, itemsByRound) {
  const rows = [];
  for (const [n, items] of itemsByRound) {
    items.forEach((it, i) => {
      const q = tool.norm(it).split(' ').slice(0, 5).join(' ');
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

function buildLane(dir, variant, opts = {}) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  mkdirSync(join(dir, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(dir, 'notes'), { recursive: true });
  copyFileSync(TOOL, join(dir, 'scripts', 'routed-ledger.mjs'));
  const itemsByRound = [];
  for (let n = 55; n <= 65; n += 1) {
    const txt = spotText(n, opts);
    writeFileSync(join(dir, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), txt);
    itemsByRound.push([n, tool.routedItems(txt).items]);
  }
  const answers = ['# answers', ...Array.from({ length: 12 }, (_, i) => `the answer for round 65 item ${i + 1}`)].join('\n');
  writeFileSync(join(dir, 'notes', 'answers.md'), answers);
  const extra = [];
  if (variant === 'second-ledger') extra.push('## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', '| R55-DUP | 55 | 1 | "the readme row is missing in round 55" | class-dup | open | - |');
  writeFileSync(join(dir, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rowsFor(variant, itemsByRound), '', ...extra, ''].join('\n'));
  if (variant === 'symlink-answer') {
    writeFileSync(join(dir, 'notes', 'real.md'), 'the answer for round 65 item 1\n');
    symlinkSync('real.md', join(dir, 'notes', 'link.md'));
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
  ['setext-appendix', { setext: true }],
  ['duplicate-routed-heading', { dup: true }],
];

const out = [];
for (const [variant, opts] of VARIANTS) {
  const dir = join(ROOT, variant);
  const rev = buildLane(dir, variant, opts);
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
