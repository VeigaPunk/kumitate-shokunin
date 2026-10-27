#!/usr/bin/env node
/* Harness 12: verify the v2 candidate against the FROZEN counter (L1..L6) and against the
 * real lane corpus. The frozen counter is the arbiter; the candidate must not weaken it. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const PROBE = join(LANE, '.ufo/waves/round-66/probe/ledger66-probe.mjs');
const V1 = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const V2 = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecToolEdge/routed-ledger-v2.candidate.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/lanes12';

const tool = await import(`file://${V1}`);
const clsOf = (n, i) => (i === 0 ? 'class-recurrent' : `class-${((n + i) % 5) + 2}`);
const safeQuote = (it) => {
  const toks = tool.norm(it).split(' ').filter(Boolean);
  const run = [];
  for (const t of toks) {
    if (t.includes('|') || t.includes('"')) { if (run.length >= 5) break; run.length = 0; continue; }
    run.push(t); if (run.length === 5) break;
  }
  return run.join(' ');
};
function spotText(n, o = {}) {
  const L = [`# Round ${n} — non-author verification and spot-check`, '', '## 4. Verdicts', '', `- verdict bullet for round ${n}`, '',
    '## 5. Routed defects the lane must fix next round', ''];
  if (o.comment) { L.push('<!--', `- commented-out line in round ${n}`, '-->', ''); }
  if (o.fence) { L.push('```text', `- fenced example line in round ${n}`, '```', ''); }
  L.push(`- **D1 — the readme row is missing in round ${n}.**`, `  - nested note for round ${n}`,
    `1. **D2 — tier counts are wrong in round ${n}.**`, '', '| id | what |', '|---|---|', `| D3 | the capability row is absent in round ${n} |`, '',
    '## 7. Non-author statement', '', `- not routed in round ${n}`, '');
  let t = L.join('\n');
  if (o.crlf) t = t.replace(/\n/g, '\r\n');
  return t;
}
function buildLane(dir, toolPath, o = {}) {
  rmSync(dir, { recursive: true, force: true });
  for (const d of ['scripts', 'corpus/lessons', 'notes']) mkdirSync(join(dir, d), { recursive: true });
  copyFileSync(toolPath, join(dir, 'scripts', 'routed-ledger.mjs'));
  const rows = [];
  for (let n = 55; n <= 65; n += 1) {
    const txt = spotText(n, o);
    writeFileSync(join(dir, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), txt);
    tool.routedItems(txt).items.forEach((it, i) => {
      const q = safeQuote(it);
      const last = n === 65;
      rows.push(`| R${n}-I${i + 1} | ${n} | ${i + 1} | "${q}" | ${clsOf(n, i)} | ${last ? 'closed' : 'open'} | ${last ? `\`notes/answers.md:${i + 1}\` — "the answer for round 65 item ${i + 1}"` : '-'} |`);
    });
  }
  writeFileSync(join(dir, 'notes', 'answers.md'), ['# answers', ...Array.from({ length: 12 }, (_, i) => `the answer for round 65 item ${i + 1}`)].join('\n'));
  writeFileSync(join(dir, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rows, ''].join('\n'));
  writeFileSync(join(dir, 'SKILL.md'), '| capability | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
  writeFileSync(join(dir, 'corpus', 'QUALITY.md'), 'routed-ledger is checked by scripts/routed-ledger.mjs\n');
  writeFileSync(join(dir, 'SCORECARD.md'), '## Capabilities\n| capability | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
  const g = (...a) => spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  g('init', '-q');
  const top = g('rev-parse', '--show-toplevel').stdout.trim();
  if (top !== dir) throw new Error(`toplevel mismatch ${top} != ${dir}`);
  g('add', '-A');
  if (g('-c', 'user.name=h', '-c', 'user.email=h@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'fixture').status !== 0) throw new Error('commit failed');
  return g('rev-parse', 'HEAD').stdout.trim();
}

const out = [];
for (const [label, toolPath] of [['v1 (committed)', V1], ['v2 (candidate)', V2]]) {
  for (const [variant, o] of [['plain', {}], ['crlf-spotcheck', { crlf: true }], ['fence-in-section', { fence: true }], ['comment-in-section', { comment: true }]]) {
    const dir = join(ROOT, `${label.split(' ')[0]}-${variant}`);
    const rev = buildLane(dir, toolPath, o);
    const r = spawnSync('node', [PROBE, dir, rev], { encoding: 'utf8', env: { ...process.env, TMPDIR: '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge' } });
    out.push({ tool: label, variant, counter_exit: r.status, counter: (r.stdout || '').trim() });
  }
}

/* v2 against the REAL lane corpus: item counts must be unchanged (57) and the real rounds
 * must produce the same items as v1, so the frozen counter's own count still matches. */
{
  const items = [];
  const v2 = await import(`file://${V2}`);
  for (let n = 55; n <= 65; n += 1) {
    const p = join(LANE, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`);
    const txt = readFileSync(p, 'utf8');
    const a = tool.routedItems(txt).items;
    const b = v2.routedItems(txt).items;
    items.push({ n, v1: a.length, v2: b.length, identical: JSON.stringify(a) === JSON.stringify(b) });
  }
  out.push({ tool: 'v2 vs v1 on the REAL lane corpus (rounds 55..65)', variant: 'items', rows: items });
}
console.log(JSON.stringify(out, null, 1));
