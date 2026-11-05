#!/usr/bin/env node
/**
 * run-controls90.mjs — score every pre-data control with the FROZEN probe90-c1.
 *
 *   node .ufo/waves/round-90/controls/run-controls90.mjs --lane <LANE> --rev <40-hex> --work <SCRATCH>
 *        [--probe <path>] [--out <dir>]
 *
 * Controls: the round-89 kill constructions (the three that reached 30/30 on probe89-c1), the
 * round-88 constructions that fired or bounded earlier kill rules, the base instrument at --rev
 * (the do-nothing control), refuse-all, the absent tool, the worktree twin of the instrument at
 * --rev, and this round's new content-blind size oracle (`ctl-size-oracle.mjs`). Each control is
 * scored in its own scratch dir; one line per control is printed and written to <out>/table.txt
 * with each control's own receipt beside it (`ctl-<name>.txt`). This driver is evidence tooling,
 * never the counter: the counter is probe90-c1.mjs, frozen before any control was scored.
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
const probe = resolve(opt('--probe', join(lane, '.ufo', 'waves', 'round-90', 'probe', 'probe90-c1.mjs')));
const outDir = resolve(opt('--out', join(lane, '.ufo', 'waves', 'round-90', 'controls')));
if (!rev || !workArg) {
  console.log('USAGE: run-controls90.mjs --lane <LANE> --rev <40-hex> --work <SCRATCH> [--probe <path>] [--out <dir>]');
  process.exit(64);
}
mkdirSync(workArg, { recursive: true });
mkdirSync(outDir, { recursive: true });
const sha = (b) => createHash('sha256').update(b).digest('hex');

const R88 = join(lane, '.ufo', 'waves', 'round-88');
const R89 = join(lane, '.ufo', 'waves', 'round-89');
const R90 = join(lane, '.ufo', 'waves', 'round-90');
const controls = [
  // the do-nothing control: the committed instrument at the round-open revision
  ['base-v3-at-rev', join(workArg, 'base-v3-at-rev.mjs')],
  // the three round-89 kill constructions (each reached 30/30 on probe89-c1)
  ['r89-probe-keyed', join(R89, 'build', 'K89Review', 'cand-probe-keyed.mjs')],
  ['r89-skip-mode', join(R89, 'build', 'K89Review', 'cand-skip-mode.mjs')],
  ['r89-label-only', join(R89, 'build', 'K89Labrat', 'labrat-label-only.mjs')],
  ['r89-probe-aware', join(R89, 'build', 'K89Labrat', 'labrat-probe-aware.mjs')],
  // the round-88 constructions (eight of the nine that reached or bounded 20/20 on probe88-c1)
  ['r88-worktree-twin', join(R88, 'build', 'K88Critic', 'cand', 'a-worktree-twin.mjs')],
  ['r88-head-default', join(R88, 'build', 'K88Critic', 'cand', 'c2-head-default.mjs')],
  ['r88-loose-limit', join(R88, 'build', 'K88Critic', 'cand', 'f5-loose-limit.mjs')],
  ['r88-dup-equal-ok', join(R88, 'build', 'K88Critic', 'cand', 'f6-dup-equal-ok.mjs')],
  ['r88-fixture-gated', join(R88, 'build', 'K88Critic', 'cand', 'd-fixture-gated-boundaries.mjs')],
  ['r88-size-after-read', join(R88, 'build', 'K88Critic', 'cand', 'f1-size-after-read.mjs')],
  ['r88-abs-disk', join(R88, 'build', 'K88Connector', 'ctl-abs-disk.mjs')],
  ['r88-nogit-overfit', join(R88, 'build', 'K88Review2', 'nogit-overfit.mjs')],
  // this round's new content-blind construction (written by the L1 before any wave data)
  ['r90-size-oracle', join(R90, 'controls', 'ctl-size-oracle.mjs')],
  // blanket refusal is not a pass; a missing tool scores nothing
  ['refuse-all', join(R90, 'controls', 'refuse-all.mjs')],
  ['absent', join(R90, 'controls', 'absent-tool-does-not-exist.mjs')],
  // the worktree twin of the instrument at --rev (the make-worktree-variant generator)
  ['worktree-twin-at-rev', join(workArg, 'twin-at-rev.mjs')],
];

// Extract the instrument blob at --rev (the do-nothing control runs the committed bytes, never
// the worktree, so a dirty edit cannot blur the before reading).
{
  const src = spawnSync('git', ['-C', lane, 'cat-file', 'blob', `${rev}:scripts/receipt-bind.mjs`], { maxBuffer: 64 << 20 });
  if (src.status !== 0) {
    console.log(`BASE-EXTRACT: FAILED status=${src.status}`);
    process.exit(2);
  }
  writeFileSync(join(workArg, 'base-v3-at-rev.mjs'), src.stdout);
  console.log(`BASE-EXTRACT: OK sha256=${sha(src.stdout)}`);
}

// Worktree twin of the instrument at --rev: the round-88 twin generator rewrites the blob read to a
// worktree read, so the twin skips revision binding by construction.
{
  const gen = join(R88, 'controls', 'make-worktree-variant.mjs');
  const tmp = join(workArg, 'twin-src.mjs');
  writeFileSync(tmp, readFileSync(join(workArg, 'base-v3-at-rev.mjs')));
  const r = spawnSync('node', [gen, tmp, join(workArg, 'twin-at-rev.mjs')], { encoding: 'utf8' });
  if (r.status !== 0) console.log(`TWIN: SKIPPED ${(r.stderr || r.stdout || '').trim().slice(0, 200)}`);
}

const rows = [];
for (const [name, toolPath] of controls) {
  if (!existsSync(toolPath)) { rows.push([name, 'ABSENT', '', toolPath]); continue; }
  const w = join(workArg, `c-${name}`);
  const r = spawnSync('node', [probe, '--lane', lane, '--work', w, '--rev', rev, '--tool', toolPath],
    { encoding: 'utf8', maxBuffer: 64 << 20, timeout: 900000 });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  writeFileSync(join(outDir, `ctl-${name}.txt`), out);
  const verdict = (out.match(/^C90_C1: .*$/m) || ['C90_C1: NO-VERDICT'])[0];
  const fails = [...out.matchAll(/^ARM (\S+): FAIL/gm)].map((m) => m[1]);
  const toolSha = existsSync(toolPath) ? sha(readFileSync(toolPath)) : '-';
  rows.push([name, verdict, fails.join(',') || '-', `${toolPath} sha256=${toolSha}`]);
}
const table = rows.map((r) => `${r[0]}\t${r[1]}\t${r[2]}\t${r[3]}`).join('\n');
writeFileSync(join(outDir, 'table.txt'), `${table}\n`);
console.log(table);
