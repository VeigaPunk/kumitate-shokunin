#!/usr/bin/env node
/* Harness 4: build synthetic lanes (rounds 55..65) and run the FROZEN counter
 * .ufo/waves/round-66/probe/ledger66-probe.mjs against them, to measure where the
 * tool and the frozen counter's own parser disagree on the SAME ledger bytes.
 * Nothing in the lane repo is touched; everything happens under scratch. */
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const PROBE = join(LANE, '.ufo/waves/round-66/probe/ledger66-probe.mjs');
const TOOL = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/lanes';

const tool = await import(`file://${TOOL}`);
const rowsFor = (variant) => {
  const rows = [];
  for (let n = 55; n <= 65; n += 1) {
    const txt = readFileSync(join(LANE, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), 'utf8');
    const items = tool.routedItems(txt).items;
    items.forEach((it, i) => {
      const q = tool.norm(it).split(' ').slice(0, 5).join(' ');
      const last = n === 65;
      const answer = last
        ? `\`notes/answers.md:${i + 1}\` — "the answer for round 65 item ${i + 1}"`
        : '-';
      const status = last ? 'closed' : 'open';
      let row = `| R${n}-I${i + 1} | ${n} | ${i + 1} | "${q}" | class-${(i % 3) + 1} | ${status} | ${answer} |`;
      if (variant === 'no-trailing-pipe' && i === 0 && n === 55) row = row.replace(/\|\s*$/, '');
      if (variant === 'escaped-pipe' && i === 0 && n === 55) row = row.replace(`"${q}"`, `"${q} \\| tail"`);
      if (variant === 'curly-quote' && i === 0 && n === 55) row = row.replace(`"${q}"`, `“${q}”`);
      if (variant === 'trailing-space' && i === 0 && n === 55) row = `${row}  `;
      rows.push(row);
    });
  }
  return rows;
};

function buildLane(dir, variant) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  mkdirSync(join(dir, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(dir, 'notes'), { recursive: true });
  copyFileSync(TOOL, join(dir, 'scripts', 'routed-ledger.mjs'));
  for (let n = 55; n <= 65; n += 1) copyFileSync(join(LANE, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), join(dir, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`));
  const answers = ['# answers', ...Array.from({ length: 12 }, (_, i) => `the answer for round 65 item ${i + 1}`)].join('\n');
  writeFileSync(join(dir, 'notes', 'answers.md'), answers);
  writeFileSync(join(dir, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rowsFor(variant), ''].join('\n'));
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

const out = [];
for (const variant of ['plain', 'no-trailing-pipe', 'escaped-pipe', 'curly-quote', 'trailing-space']) {
  const dir = join(ROOT, variant);
  const rev = buildLane(dir, variant);
  const r = spawnSync('node', [PROBE, dir, rev], { encoding: 'utf8', env: { ...process.env, TMPDIR: '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge' } });
  const line = (r.stdout || '').trim();
  // also the tool's own verdict on the same lane
  const t = spawnSync('node', [TOOL, '--root', dir, '--rev', rev, '--from', '55', '--to', '65'], { encoding: 'utf8' });
  out.push({
    variant,
    counter_exit: r.status,
    counter: line,
    tool_exit: t.status,
    tool: (t.stdout || '').trim().split('\n').filter((l) => l.startsWith('ROUTED_LEDGER') || l.startsWith('FINDING')).slice(0, 4).join(' || '),
  });
}
console.log(JSON.stringify(out, null, 1));
