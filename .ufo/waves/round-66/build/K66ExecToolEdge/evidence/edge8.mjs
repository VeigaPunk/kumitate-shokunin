#!/usr/bin/env node
/* Harness 8: the remaining edges.
 *  - separator row WITHOUT a trailing pipe: tool sep() vs counter isSep()
 *  - --rev whose tree lacks the ledger
 *  - answer path via symlink to the ledger / outside the root (already seen; re-measure)
 *  - ledger section heading shapes
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, symlinkSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const TOOL = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/fx8';
const tool = await import(`file://${TOOL}`);
const out = [];

/* --- separator row without a trailing pipe --- */
{
  const spot = ['# Round 7', '', '## 5. Routed defects', '',
    '- **D1 — the readme row is missing.**', '',
    '| id | what |', '|---|---|', '| D2 | the capability row is absent |', '',
    '## End', ''].join('\n');
  const items = tool.routedItems(spot).items;
  out.push({
    name: 'separator row "|--|--|" without a trailing pipe',
    tool_items: items.length,
    tool_item_lines: items.map((x) => x.split('\n')[0]),
    note: 'the tool counts the separator as an ITEM; the frozen counter isSep() does not',
  });
  const spot2 = spot.replace('|---|---|', '|---|---|');
  const spot3 = spot.replace('|---|---|', '|---|---|---|');
  out.push({ name: 'same, with a trailing pipe', tool_items: tool.routedItems(spot3).items.length, tool_item_lines: tool.routedItems(spot3).items.map((x) => x.split('\n')[0]) });
}

/* --- --rev whose tree lacks the ledger --- */
{
  const D = join(ROOT, 'revrepo');
  rmSync(D, { recursive: true, force: true });
  mkdirSync(join(D, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(D, 'scripts'), { recursive: true });
  copyFileSync(TOOL, join(D, 'scripts', 'routed-ledger.mjs'));
  writeFileSync(join(D, 'corpus', 'lessons', 'round-7-verifier-spotcheck.md'), '# Round 7\n\n## Routed defects\n\n- **D1 — the readme row is missing.**\n');
  const g = (...a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8' });
  g('init', '-q');
  const top = g('rev-parse', '--show-toplevel').stdout.trim();
  if (top !== D) throw new Error('toplevel mismatch');
  g('add', '-A');
  g('-c', 'user.name=h', '-c', 'user.email=h@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'no-ledger');
  const rev = g('rev-parse', 'HEAD').stdout.trim();
  const r = spawnSync('node', [TOOL, '--root', D, '--rev', rev, '--from', '7', '--to', '7'], { encoding: 'utf8' });
  out.push({ name: '--rev at a tree without the ledger', exit: r.status, stdout: (r.stdout || '').trim() });
  // and a tag pointing at that commit
  g('tag', 'noledger');
  const r2 = spawnSync('node', [TOOL, '--root', D, '--rev', 'noledger', '--from', '7', '--to', '7'], { encoding: 'utf8' });
  out.push({ name: '--rev at a TAG whose tree lacks the ledger', exit: r2.status, stdout: (r2.stdout || '').trim() });
}

/* --- symlink answer resolution, worktree mode --- */
{
  const D = join(ROOT, 'sym');
  rmSync(D, { recursive: true, force: true });
  mkdirSync(join(D, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(D, 'notes'), { recursive: true });
  writeFileSync(join(D, 'corpus', 'lessons', 'round-7-verifier-spotcheck.md'), '# Round 7\n\n## Routed defects\n\n- **D1 — the readme row is missing.**\n');
  writeFileSync(join(D, 'notes', 'a.md'), 'the readme row and its pin landed\n');
  symlinkSync('../corpus/routed-ledger.md', join(D, 'notes', 'toledger.md'));
  writeFileSync(join(D, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|',
    '| A | 7 | 1 | "the readme row is missing" | c | closed | `notes/toledger.md:6` — "the readme row is missing" |', ''].join('\n'));
  const r = spawnSync('node', [TOOL, '--root', D, '--from', '7', '--to', '7'], { encoding: 'utf8' });
  out.push({ name: 'answer path is a symlink to the ledger itself (worktree mode)', exit: r.status, stdout: (r.stdout || '').trim() });
}

console.log(JSON.stringify(out, null, 1));
