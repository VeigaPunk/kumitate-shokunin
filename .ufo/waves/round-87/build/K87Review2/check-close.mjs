#!/usr/bin/env node
/**
 * check-close.mjs — K87Review2 independent audit of the round-87 close receipts.
 *
 * For every `<lane>/.ufo/waves/round-87/close/*.txt`:
 *   1. rev= exists as a commit in the lane;
 *   2. tool_sha256= equals sha256(git show rev:<instrument named by cmd's 2nd token>)
 *      (an absolute instrument outside the lane is hashed from disk, counted external);
 *   3. the recorded exit= matches a re-run of the recorded cmd= (run from the lane with
 *      HYAKU_SCRATCH/TMPDIR pointed at --work, and any `--work <path>` argument rewritten
 *      to a directory under --work so the audit never shares the round's scratch).
 *
 * usage: node check-close.mjs --lane <LANE> --work <SCRATCH> [--json]
 * Prints one line per receipt plus a summary. Exit 0 iff every receipt resolves, binds
 * and re-runs to the recorded exit.
 */
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve, isAbsolute, relative } from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const lane = resolve(opt('--lane', '.'));
const work = resolve(opt('--work', ''));
const json = argv.includes('--json');
if (!work) { console.log('CHECK_CLOSE: FAIL-CLOSED WORK_REQUIRED'); process.exit(2); }
mkdirSync(work, { recursive: true });
const dir = join(lane, '.ufo', 'waves', 'round-87', 'close');
if (!existsSync(dir)) { console.log('CHECK_CLOSE: FAIL-CLOSED DIR_UNREADABLE ' + dir); process.exit(2); }

const sha = (b) => createHash('sha256').update(b).digest('hex');
const rows = [];
let bound = 0, mismatched = 0, unresolved = 0, revBad = 0, exitMatch = 0, exitDiff = 0, noCmd = 0;

for (const f of readdirSync(dir).filter((x) => x.endsWith('.txt')).sort()) {
  const text = readFileSync(join(dir, f), 'utf8');
  const rev = (text.match(/^rev=([a-f0-9]{40})$/m) || [])[1] || null;
  const tool = (text.match(/^tool_sha256=([a-f0-9]{64})$/m) || [])[1] || null;
  const cmd = (text.match(/^cmd=(.+)$/m) || [])[1] || null;
  const exit = (text.match(/^exit=(-?\d+)$/m) || [])[1];
  const signal = (text.match(/^signal=(.+)$/m) || [])[1] || null;
  const row = { file: f, rev, tool, cmd, exit: exit === undefined ? null : Number(exit), signal };

  // 1. revision exists
  const rv = rev ? spawnSync('git', ['-C', lane, 'cat-file', '-e', `${rev}^{commit}`]) : null;
  row.revResolves = !!(rv && rv.status === 0);
  if (!row.revResolves) revBad++;

  // 2. digest names the instrument its cmd names
  if (!cmd || !tool) { noCmd++; row.bind = 'NO_CMD_OR_DIGEST'; }
  else {
    const tok = cmd.trim().split(/\s+/)[1];
    let bytes = null, external = false;
    if (tok && isAbsolute(tok)) {
      if (tok === lane || tok.startsWith(lane + '/')) {
        const g = spawnSync('git', ['-C', lane, 'show', `${rev}:${relative(lane, tok)}`], { maxBuffer: 64 << 20 });
        if (g.status === 0) bytes = g.stdout;
      } else if (existsSync(tok)) { bytes = readFileSync(tok); external = true; }
    } else if (tok) {
      const g = spawnSync('git', ['-C', lane, 'show', `${rev}:${tok.replace(/^\.\//, '')}`], { maxBuffer: 64 << 20 });
      if (g.status === 0) bytes = g.stdout;
    }
    row.external = external;
    if (!bytes) { row.bind = 'UNRESOLVED'; unresolved++; }
    else if (sha(bytes) === tool) { row.bind = 'BOUND'; bound++; }
    else { row.bind = 'MISMATCH'; mismatched++; }
  }

  // 3. recorded exit vs a re-run
  if (cmd && row.exit !== null) {
    const toks = cmd.trim().split(/\s+/);
    const rerun = [];
    for (let i = 0; i < toks.length; i++) {
      if (toks[i] === '--work' && i + 1 < toks.length) {
        rerun.push('--work', join(work, `rerun-${f.replace(/\.txt$/, '')}`));
        i++;
      } else rerun.push(toks[i]);
    }
    const [prog, ...rest] = rerun;
    const r = spawnSync(prog, rest, {
      cwd: lane, encoding: 'utf8', timeout: 600000, maxBuffer: 64 << 20,
      env: { ...process.env, HYAKU_SCRATCH: work, TMPDIR: work },
    });
    row.rerunExit = r.status;
    row.exitMatch = r.status === row.exit;
    row.verdict = ((`${r.stdout || ''}${r.stderr || ''}`).match(/^(?:C87_C1|RECEIPT_BIND|PROXY|README_MAP|SPOTCHECK_COVERAGE|READY_HANDOFF|PLAN_BEFORE_READY|RECEIPT_BIND_SELFTEST)[^\n]*/m) || [''])[0];
    if (row.exitMatch) exitMatch++; else exitDiff++;
  }
  rows.push(row);
}

const summary = {
  receipts: rows.length, bound, mismatched, unresolved, noCmd, revBad, exitMatch, exitDiff,
};
if (json) {
  console.log(JSON.stringify({ summary, rows }, null, 1));
} else {
  for (const r of rows) {
    console.log(`${r.file} | rev=${r.revResolves ? 'OK' : 'BAD'} | bind=${r.bind}${r.external ? '(external)' : ''} | exit=${r.exit} rerun=${r.rerunExit === undefined ? '-' : r.rerunExit} ${r.exitMatch === undefined ? '' : r.exitMatch ? 'MATCH' : 'DIFF'} | ${r.verdict || ''}`);
  }
  console.log(`CHECK_CLOSE: receipts=${summary.receipts} bound=${bound} mismatched=${mismatched} unresolved=${unresolved} noCmd=${noCmd} revBad=${revBad} exitMatch=${exitMatch} exitDiff=${exitDiff}`);
}
process.exit(mismatched === 0 && unresolved === 0 && revBad === 0 && noCmd === 0 && exitDiff === 0 ? 0 : 1);
