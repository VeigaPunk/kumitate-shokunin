#!/usr/bin/env node
/**
 * check-holes.mjs — behavioural substantiation of the mutants that survive BOTH detectors.
 *
 *   node check-holes.mjs --tool <candidate> --mutants <mutants-dir> --work <scratch>
 *
 * For each surviving mutant that changes an observable verdict, this runs the candidate and the
 * mutant on the SAME fixture and prints both verdict lines, so the report can state what the hole
 * costs instead of asserting it from the diff. Fixtures live under --work and are removed.
 */
import { readFileSync, writeFileSync, mkdirSync, symlinkSync, rmSync, realpathSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const cand = resolve(opt('--tool', ''));
const mutDir = resolve(opt('--mutants', ''));
const work = resolve(opt('--work', ''));
if (!cand || !mutDir || !work) { console.log('USAGE: check-holes.mjs --tool <candidate> --mutants <dir> --work <scratch>'); process.exit(64); }
const sha = (b) => createHash('sha256').update(b).digest('hex');
const root = join(work, `holes-${process.pid}`);
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
const env = { ...process.env, GIT_TERMINAL_PROMPT: '0', TMPDIR: root };
for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[k];

const git = (dir, args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', env });
function repo(name) {
  const d = join(root, name);
  mkdirSync(join(d, 'scripts'), { recursive: true });
  if (git(d, ['init', '-q']).status !== 0) throw new Error(`init ${d}`);
  const top = git(d, ['rev-parse', '--show-toplevel']).stdout.trim();
  if (realpathSync(top) !== realpathSync(d)) throw new Error(`toplevel ${top} != ${d}`);
  return d;
}
const commit = (d, msg) => {
  const r = git(d, ['-c', 'user.name=h', '-c', 'user.email=h@invalid', 'commit', '-q', '-m', msg]);
  if (r.status !== 0) throw new Error(`commit ${msg}: ${r.stderr}`);
  return git(d, ['rev-parse', 'HEAD']).stdout.trim();
};
const rcDir = (name, body) => {
  const d = join(root, name);
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'a.txt'), body);
  return d;
};
const run = (tool, args, cwd) => {
  const r = spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8', cwd: cwd || root, env, timeout: 120000 });
  const all = `${r.stdout || ''}${r.stderr || ''}`;
  const line = (all.match(/^(RECEIPT_BIND|RECEIPT_BIND_SELFTEST): .*$/m) || [''])[0];
  return `exit=${r.status} ${line || `<none> ${all.trim().slice(0, 160)}`}`;
};
const receipt = (rev, digest, cmd) => `rev=${rev}\ntool_sha256=${digest}\ncmd=${cmd}\nexit=0\nsignal=none\n`;
const rows = [];
function check(name, mutant, args, cwd) {
  const m = join(mutDir, `${mutant}.mjs`);
  const a = run(cand, args, cwd);
  const b = run(m, args, cwd);
  rows.push({ name, mutant, candidate: a, mutantVerdict: b, differs: a !== b });
  console.log(`HOLE ${name} [${mutant}]\n  candidate: ${a}\n  mutant:    ${b}`);
}

// 1 — lane-not-git-off: the LANE_NOT_GIT token is masked by REV_UNRESOLVED.
{
  const plain = join(root, 'not-a-repo');
  mkdirSync(plain, { recursive: true });
  const d = rcDir('rc-empty', '');
  check('lane-not-git-token', 'lane-not-git-off', ['--lane', plain, '--dir', d, '--rev', 'a'.repeat(40)]);
}
// 2 — rev-commit-check-off: a receipt rev= that is 40-hex but not a commit.
{
  const r = repo('revcheck');
  writeFileSync(join(r, 'scripts', 'tool.mjs'), 'export const t = 1;\n');
  git(r, ['add', '-A']);
  const rev = commit(r, 'c1');
  const d = rcDir('rc-rev-not-commit', receipt('b'.repeat(40), sha(readFileSync(join(r, 'scripts', 'tool.mjs'))), 'node scripts/tool.mjs'));
  check('receipt-rev-not-a-commit', 'rev-commit-check-off', ['--lane', r, '--dir', d, '--rev', rev]);
}
// 3 — root-check-absolute-off: an absolute token naming the lane root itself.
{
  const r = repo('rootcheck');
  writeFileSync(join(r, 'scripts', 'tool.mjs'), 'export const t = 1;\n');
  git(r, ['add', '-A']);
  const rev = commit(r, 'c1');
  const d = rcDir('rc-root', receipt(rev, 'c'.repeat(64), `node ${r}`));
  check('absolute-token-names-lane-root', 'root-check-absolute-off', ['--lane', r, '--dir', d, '--rev', rev]);
}
// 4 — realpath-lane-off: --lane named through an ancestor alias (/proc/self/root<lane>); the
//     in-lane forge is then counted external and hashed from the dirty worktree — the exact forge
//     probe arm alias-proc-root refuses, moved to the lane side.
{
  const r = repo('symlane-real');
  writeFileSync(join(r, 'scripts', 'tool.mjs'), 'export const committed = 1;\n');
  git(r, ['add', '-A']);
  const rev = commit(r, 'c1');
  const dirty = 'export const dirty = 1;\n';
  writeFileSync(join(r, 'scripts', 'tool.mjs'), dirty);
  const laneAlias = `/proc/self/root${r}`;
  const d = rcDir('rc-symlane', receipt(rev, sha(Buffer.from(dirty)), `node ${join(r, 'scripts', 'tool.mjs')}`));
  if (!readFileSync('/proc/self/mounts', 'utf8').includes(' /proc ')) {
    console.log('HOLE lane-through-symlink-forge: SKIPPED (no /proc)');
  } else {
    check('lane-through-symlink-forge', 'realpath-lane-off', ['--lane', laneAlias, '--dir', d, '--rev', rev]);
  }
}
// 5 — mode-read-at-head: the judged revision carries a symlink instrument, HEAD carries a regular
//     file, so a mode read at HEAD misses the 120000 and binds the link text.
{
  const r = repo('modehead');
  writeFileSync(join(r, 'scripts', 'alpha.mjs'), 'export const alpha = 1;\n');
  symlinkSync('alpha.mjs', join(r, 'scripts', 'link.mjs'));
  git(r, ['add', '-A']);
  const c1 = commit(r, 'c1-symlink');
  unlinkSync(join(r, 'scripts', 'link.mjs'));
  writeFileSync(join(r, 'scripts', 'link.mjs'), 'export const regular = 1;\n');
  git(r, ['add', '-A']);
  const c2 = commit(r, 'c2-regular');
  const d = rcDir('rc-modehead', receipt(c1, sha(Buffer.from('alpha.mjs')), 'node scripts/link.mjs'));
  check('symlink-at-judged-rev-only', 'mode-read-at-head', ['--lane', r, '--dir', d, '--rev', c2]);
}
// 6 — contract-string-v2: --json reports the contract id; no probe arm reads it.
{
  const r = repo('contract');
  writeFileSync(join(r, 'scripts', 'tool.mjs'), 'export const t = 1;\n');
  git(r, ['add', '-A']);
  const rev = commit(r, 'c1');
  const d = rcDir('rc-contract', receipt(rev, sha(readFileSync(join(r, 'scripts', 'tool.mjs'))), 'node scripts/tool.mjs'));
  const m = join(mutDir, 'contract-string-v2.mjs');
  const pick = (tool) => {
    const res = spawnSync(process.execPath, [tool, '--lane', r, '--dir', d, '--rev', rev, '--json'], { encoding: 'utf8', cwd: root, env });
    let obj = null;
    try { obj = JSON.parse((res.stdout || '').trim()); } catch { obj = null; }
    return `exit=${res.status} contract=${obj ? obj.contract : 'unparsed'}`;
  };
  const a = pick(cand); const b = pick(m);
  rows.push({ name: 'json-contract-id', mutant: 'contract-string-v2', candidate: a, mutantVerdict: b, differs: a !== b });
  console.log(`HOLE json-contract-id [contract-string-v2]\n  candidate: ${a}\n  mutant:    ${b}`);
}
// 7 — digest-lowercase-off: an upper-case tool_sha256= binds in the candidate, is unchecked here.
{
  const r = repo('upper');
  writeFileSync(join(r, 'scripts', 'tool.mjs'), 'export const t = 1;\n');
  git(r, ['add', '-A']);
  const rev = commit(r, 'c1');
  const d = rcDir('rc-upper', receipt(rev, sha(readFileSync(join(r, 'scripts', 'tool.mjs'))).toUpperCase(), 'node scripts/tool.mjs'));
  check('uppercase-digest', 'digest-lowercase-off', ['--lane', r, '--dir', d, '--rev', rev]);
}
writeFileSync(join(root, 'holes.json'), `${JSON.stringify(rows, null, 2)}\n`);
console.log(`HOLES: checks=${rows.length} differ=${rows.filter((x) => x.differs).length}`);
rmSync(root, { recursive: true, force: true });
