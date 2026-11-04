#!/usr/bin/env node
/**
 * run-controls.mjs — score every pre-data control with the FROZEN probe89-c1.
 *
 *   node .ufo/waves/round-89/controls/run-controls.mjs --lane <LANE> --rev <40-hex> --work <SCRATCH> [--probe <path>] [--out <dir>]
 *
 * Controls: the committed round-88 seat constructions (the nine that reached 20/20 on probe88-c1
 * plus the three that did not), the round-88 base instrument, refuse-all, the absent tool, the
 * worktree twin of the round-88 integrated instrument, and — when it exists — the worktree twin of
 * the instrument at --rev. Each control is scored in its own scratch dir; one line per control is
 * printed and written to <out>/table.txt. This driver is evidence tooling, never the counter: the
 * counter is probe89-c1.mjs, frozen before any control was scored.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const lane = resolve(opt('--lane', '.'));
const rev = opt('--rev', '');
const workArg = opt('--work', '');
const probe = resolve(opt('--probe', join(lane, '.ufo', 'waves', 'round-89', 'probe', 'probe89-c1.mjs')));
const outDir = resolve(opt('--out', join(lane, '.ufo', 'waves', 'round-89', 'controls')));
if (!rev || !workArg) {
  console.log('USAGE: run-controls.mjs --lane <LANE> --rev <40-hex> --work <SCRATCH> [--probe <path>] [--out <dir>]');
  process.exit(64);
}
mkdirSync(workArg, { recursive: true });
mkdirSync(outDir, { recursive: true });
const sha = (b) => createHash('sha256').update(b).digest('hex');

const C88 = join(lane, '.ufo', 'waves', 'round-88');
const controls = [
  ['base-v2-at-rev', join(lane, 'scripts', 'receipt-bind.mjs')],
  ['base-v1-round87', join(C88, 'build', 'K88Review', 'base-v1.mjs')],
  ['c88-a-worktree-twin', join(C88, 'build', 'K88Critic', 'cand', 'a-worktree-twin.mjs')],
  ['c88-b-ignore-receipt-rev', join(C88, 'build', 'K88Critic', 'cand', 'b-ignore-receipt-rev.mjs')],
  ['c88-c-head-all', join(C88, 'build', 'K88Critic', 'cand', 'c-head-all.mjs')],
  ['c88-c2-head-default', join(C88, 'build', 'K88Critic', 'cand', 'c2-head-default.mjs')],
  ['c88-d-fixture-gated-boundaries', join(C88, 'build', 'K88Critic', 'cand', 'd-fixture-gated-boundaries.mjs')],
  ['c88-d2-fixture-gated-revision', join(C88, 'build', 'K88Critic', 'cand', 'd2-fixture-gated-revision.mjs')],
  ['c88-e-index-all', join(C88, 'build', 'K88Critic', 'cand', 'e-index-all.mjs')],
  ['c88-e2-index-default', join(C88, 'build', 'K88Critic', 'cand', 'e2-index-default.mjs')],
  ['c88-f1-size-after-read', join(C88, 'build', 'K88Critic', 'cand', 'f1-size-after-read.mjs')],
  ['c88-f4-textual-escape', join(C88, 'build', 'K88Critic', 'cand', 'f4-textual-escape.mjs')],
  ['c88-f5-loose-limit', join(C88, 'build', 'K88Critic', 'cand', 'f5-loose-limit.mjs')],
  ['c88-f6-dup-equal-ok', join(C88, 'build', 'K88Critic', 'cand', 'f6-dup-equal-ok.mjs')],
  ['c88-ctl-abs-disk', join(C88, 'build', 'K88Connector', 'ctl-abs-disk.mjs')],
  ['c88-nogit-overfit', join(C88, 'build', 'K88Review2', 'nogit-overfit.mjs')],
  ['c88-sentinel-ctl-escape-prefix', join(C88, 'build', 'K88Sentinel', 'controls', 'ctl-escape-prefix.mjs')],
  ['c88-sentinel-ctl-read-then-cap', join(C88, 'build', 'K88Sentinel', 'controls', 'ctl-read-then-cap.mjs')],
  ['refuse-all', join(lane, '.ufo', 'waves', 'round-89', 'controls', 'refuse-all.mjs')],
  ['absent', join(lane, '.ufo', 'waves', 'round-89', 'controls', 'absent-tool-does-not-exist.mjs')],
  ['worktree-twin-at-rev', join(workArg, 'twin-at-rev.mjs')],
];

// Worktree twin of the instrument at --rev: the round-88 twin generator rewrites the blob read to a
// worktree read, so the twin skips revision binding by construction.
{
  const gen = join(C88, 'controls', 'make-worktree-variant.mjs');
  const src = spawnSync('git', ['-C', lane, 'cat-file', 'blob', `${rev}:scripts/receipt-bind.mjs`], { maxBuffer: 64 << 20 });
  if (existsSync(gen) && src.status === 0) {
    const tmp = join(workArg, 'twin-src.mjs');
    writeFileSync(tmp, src.stdout);
    const r = spawnSync('node', [gen, tmp, join(workArg, 'twin-at-rev.mjs')], { encoding: 'utf8' });
    if (r.status !== 0) console.log(`TWIN: SKIPPED ${(r.stderr || r.stdout || '').trim().slice(0, 200)}`);
  }
}

const rows = [];
for (const [name, toolPath] of controls) {
  if (!existsSync(toolPath)) { rows.push([name, 'ABSENT', '', toolPath]); continue; }
  const w = join(workArg, `c-${name}`);
  const r = spawnSync('node', [probe, '--lane', lane, '--work', w, '--rev', rev, '--tool', toolPath],
    { encoding: 'utf8', maxBuffer: 64 << 20, timeout: 900000 });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  writeFileSync(join(outDir, `ctl-${name}.txt`), out);
  const verdict = (out.match(/^C89_C1: .*$/m) || ['C89_C1: NO-VERDICT'])[0];
  const fails = [...out.matchAll(/^ARM (\S+): FAIL/gm)].map((m) => m[1]);
  const toolSha = existsSync(toolPath) ? sha(readFileSync(toolPath)) : '-';
  rows.push([name, verdict, fails.join(',') || '-', `${toolPath} sha256=${toolSha}`]);
}
const table = rows.map((r) => `${r[0]}\t${r[1]}\t${r[2]}\t${r[3]}`).join('\n');
writeFileSync(join(outDir, 'table.txt'), `${table}\n`);
console.log(table);
