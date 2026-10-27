#!/usr/bin/env node
/* Harness 10: the answer-window asymmetry.
 * The contract says the answer quote is located at path:line (+-2 lines).
 * The tool slices AL.slice(max(0,line-3), min(len,line+2)) => 1-based lines line-2..line+1:
 * the window reaches -2 but NOT +2.  Measure where a quote at line+2 lands. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const TOOL = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/fx10';
const out = [];

// answers.md: quote sits on line 1+L (L = offset from the cited line)
for (const off of [-2, -1, 0, 1, 2, 3]) {
  const D = join(ROOT, `off${off}`);
  rmSync(D, { recursive: true, force: true });
  mkdirSync(join(D, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(D, 'notes'), { recursive: true });
  writeFileSync(join(D, 'corpus', 'lessons', 'round-7-verifier-spotcheck.md'),
    '# Round 7\n\n## 5. Routed defects\n\n- **D1 — the readme row is missing.**\n');
  const lines = [];
  const cited = 5;
  const quoteLine = cited + off;
  for (let i = 1; i <= 10; i += 1) lines.push(i === quoteLine ? 'the readme row and its pin landed' : `filler line ${i}`);
  writeFileSync(join(D, 'notes', 'answers.md'), lines.join('\n'));
  writeFileSync(join(D, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '',
    '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|',
    '| A | 7 | 1 | "the readme row is missing" | c | closed | `notes/answers.md:5` — "the readme row and its pin landed" |', ''].join('\n'));
  const r = spawnSync('node', [TOOL, '--root', D, '--from', '7', '--to', '7'], { encoding: 'utf8' });
  out.push({ cited_line: cited, quote_at_line: quoteLine, offset: off, exit: r.status, verdict: (r.stdout || '').trim().split('\n').pop() });
}
console.log(JSON.stringify(out, null, 1));
