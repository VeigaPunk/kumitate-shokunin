#!/usr/bin/env node
/* Harness 14: final validation.
 *  (a) v1 and v2 bind every REAL routed item of rounds 55..65 identically (57 items);
 *  (b) the frozen counter's L4 mutant harness passes with the v2 candidate (via held=6/6);
 *  (c) the two spot-check constructs the seat named that are NOT defects (tabs, trailing #s,
 *      --rev with tag/branch/HEAD~1) behave identically under v1 and v2. */
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const V1 = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const V2 = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecToolEdge/routed-ledger-v2.candidate.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/fx14';
const v1 = await import(`file://${V1}`);
const v2 = await import(`file://${V2}`);
const out = [];

/* (a) bind every real item with both tools */
{
  rmSync(ROOT, { recursive: true, force: true });
  mkdirSync(join(ROOT, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(ROOT, 'notes'), { recursive: true });
  const rows = [];
  for (let n = 55; n <= 65; n += 1) {
    const p = join(LANE, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`);
    const txt = readFileSync(p, 'utf8');
    writeFileSync(join(ROOT, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), txt);
    v1.routedItems(txt).items.forEach((it, i) => {
      const toks = v1.norm(it).split(' ').filter(Boolean);
      const run = [];
      for (const t of toks) { if (t.includes('|') || t.includes('"')) { if (run.length >= 5) break; run.length = 0; continue; } run.push(t); if (run.length === 5) break; }
      rows.push(`| R${n}-I${i + 1} | ${n} | ${i + 1} | "${run.join(' ')}" | class-${(i % 3) + 1} | open | - |`);
    });
  }
  writeFileSync(join(ROOT, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rows, ''].join('\n'));
  writeFileSync(join(ROOT, 'notes', 'a.md'), 'x\n');
  for (const [label, tool] of [['v1', V1], ['v2', V2]]) {
    const r = spawnSync('node', [tool, '--root', ROOT, '--from', '55', '--to', '65'], { encoding: 'utf8' });
    out.push({ check: `tool binds every real item of rounds 55..65 (${label})`, exit: r.status, verdict: (r.stdout || '').trim().split('\n').pop() });
  }
}

/* (c) non-defect edges behave identically under v1 and v2 */
{
  const SPOT = ['# Round 7', '', '## 4. Verdicts', '', '- verdict bullet', '', '## 5. Routed defects for round 8 ##', '',
    '- **D1 — the readme row is missing.**', '\t- tab-indented nested bullet', '1. **D2 — tier counts are wrong**', '',
    '| id | what |', '|---|---|', '| D3 | the capability row is absent |', '', '## 6. Non-author statement ##', '', '- not routed'].join('\n');
  const D = join(ROOT, 'nondefect');
  rmSync(D, { recursive: true, force: true });
  mkdirSync(join(D, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(D, 'notes'), { recursive: true });
  writeFileSync(join(D, 'corpus', 'lessons', 'round-7-verifier-spotcheck.md'), SPOT);
  writeFileSync(join(D, 'notes', 'answers.md'), 'a\nb\nc\nthe readme row and its pin landed\n');
  writeFileSync(join(D, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|',
    '| A | 7 | 1 | "the readme row is missing" | c | closed | `notes/answers.md:4` — "the readme row and its pin landed" |',
    '| B | 7 | 2 | "tier counts are wrong" | c | open | - |',
    '| C | 7 | 3 | "the capability row is absent" | c | open | - |', ''].join('\n'));
  for (const [label, tool] of [['v1', V1], ['v2', V2]]) {
    const r = spawnSync('node', [tool, '--root', D, '--from', '7', '--to', '7'], { encoding: 'utf8' });
    out.push({ check: `tabs + trailing-# headings (${label})`, exit: r.status, verdict: (r.stdout || '').trim().split('\n').pop() });
  }
}

/* --rev with a tag / branch / HEAD~1 under both tools */
{
  const D = join(ROOT, 'revrepo');
  rmSync(D, { recursive: true, force: true });
  mkdirSync(join(D, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(D, 'notes'), { recursive: true });
  writeFileSync(join(D, 'corpus', 'lessons', 'round-7-verifier-spotcheck.md'), '# Round 7\n\n## 5. Routed defects\n\n- **D1 — the readme row is missing.**\n');
  writeFileSync(join(D, 'notes', 'answers.md'), 'the readme row and its pin landed\n');
  writeFileSync(join(D, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|',
    '| A | 7 | 1 | "the readme row is missing" | c | closed | `notes/answers.md:1` — "the readme row and its pin landed" |', ''].join('\n'));
  const g = (...a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8' });
  g('init', '-q');
  const top = g('rev-parse', '--show-toplevel').stdout.trim();
  if (top !== D) throw new Error('toplevel mismatch');
  g('add', '-A');
  g('-c', 'user.name=h', '-c', 'user.email=h@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'fixture');
  g('tag', 'r7');
  g('branch', 'feature/x');
  writeFileSync(join(D, 'notes', 'b.md'), 'b\n'); g('add', '-A');
  g('-c', 'user.name=h', '-c', 'user.email=h@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'second');
  for (const [label, tool] of [['v1', V1], ['v2', V2]]) {
    for (const rev of ['r7', 'feature/x', 'HEAD~1']) {
      const r = spawnSync('node', [tool, '--root', D, '--rev', rev, '--from', '7', '--to', '7'], { encoding: 'utf8' });
      out.push({ check: `--rev ${rev} (${label})`, exit: r.status, verdict: (r.stdout || '').trim().split('\n').pop() });
    }
  }
}
console.log(JSON.stringify(out, null, 1));
