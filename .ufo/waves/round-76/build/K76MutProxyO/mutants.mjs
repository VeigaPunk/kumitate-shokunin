#!/usr/bin/env node
/**
 * mutants.mjs — kill-or-survive battery runner (kumitate round 76, seat K76MutProxyO).
 *
 *   node mutants.mjs --tree <dir> --list <json> [--only <id>] [--work <dir>] [--keep]
 *
 * For each selected mutant the runner:
 *   1. copies --tree into a fresh per-mutant work dir (the source tree is only
 *      ever read; `.git` and `node_modules` are skipped in the copy),
 *   2. runs the mutant's `cmd` once on the PRISTINE copy — the baseline. The
 *      baseline must reproduce `expectExit` and `expectToken` exactly, else the
 *      mutant is NOT-EVALUABLE(baseline): a baseline failure is inconclusive,
 *      never a kill,
 *   3. applies ONE literal replacement (`find` → `replace`) inside the copy and
 *      re-runs the same `cmd` there. Observed behavior differing from the
 *      expectation (exit != expectExit, or expectToken missing from stdout+stderr)
 *      means the mutation was detected: KILLED. Identical behavior: SURVIVED.
 *
 * One line per mutant on stdout:
 *   <id> KILLED|SURVIVED exit=<n> token=<hit|miss>
 *   <id> NOT-EVALUABLE(find=<n>|baseline|spawn=<code>|file=<code>) exit=<n|-> token=<hit|miss|->
 * followed by one `tally:` line. Exit code: 0 iff every evaluated mutant is
 * KILLED; 1 otherwise (any SURVIVED or inconclusive mutant); 2 fail-closed
 * (unreadable --tree/--list, a `find` matching 0 or >1 times in the copy, or a
 * mutant `file` that is unreadable/escapes the tree).
 *
 * List JSON shape (per mutant): {"id","file","find","replace","cmd","expectExit",
 * "expectToken"?,"note"?} — either a bare array or {"mutants":[...]}. `cmd` runs
 * under `sh -c` with cwd = the copy; env is inherited, so a list may be
 * parameterized by variables it documents (e.g. OMP_FIXTURE_ROOT).
 *
 * The default work root is a private mkdtemp under the OS temp dir, removed on
 * exit; pass --work to place it elsewhere. --keep preserves per-mutant copies
 * for inspection. Zero deps, node >= 20.
 */

import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

const CMD_TIMEOUT_MS = 120000;

function die(msg) {
  process.stderr.write(`mutants: ${msg}\n`);
  process.exit(2);
}

const argv = process.argv.slice(2);
const argOf = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
};
const treeArg = argOf('--tree');
const listArg = argOf('--list');
const only = argOf('--only');
const workArg = argOf('--work');
const keep = argv.includes('--keep');
if (!treeArg || !listArg) {
  die('usage: node mutants.mjs --tree <dir> --list <json> [--only <id>] [--work <dir>] [--keep]');
}

const tree = resolve(treeArg);
let treeStat = null;
try { treeStat = statSync(tree); } catch { /* reported below */ }
if (!treeStat || !treeStat.isDirectory()) die(`--tree ${treeArg} is not a readable directory`);

let muts;
try {
  const parsed = JSON.parse(readFileSync(listArg, 'utf8'));
  muts = Array.isArray(parsed) ? parsed : parsed.mutants;
} catch (e) {
  die(`--list ${listArg} is unreadable or not JSON (${e.message})`);
}
if (!Array.isArray(muts) || muts.length === 0) die('--list carries no non-empty "mutants" array');
for (const m of muts) {
  const id = m && m.id !== undefined ? String(m.id) : JSON.stringify(m);
  for (const k of ['id', 'file', 'find', 'replace', 'cmd', 'expectExit']) {
    if (!m || !(k in m)) die(`mutant ${id}: missing "${k}"`);
  }
  if (!Number.isInteger(m.expectExit)) die(`mutant ${m.id}: expectExit must be an integer`);
  if (typeof m.cmd !== 'string' || m.cmd.length === 0) die(`mutant ${m.id}: cmd must be a non-empty string`);
  if (typeof m.find !== 'string' || m.find.length === 0) die(`mutant ${m.id}: find must be a non-empty string`);
}

let selected = muts;
if (only !== null) {
  selected = muts.filter((m) => String(m.id) === only);
  if (selected.length === 0) die(`--only ${only}: no such mutant id in the list`);
}

const treeReal = `${resolve(tree)}${sep}`;
for (const m of selected) {
  const target = resolve(tree, m.file);
  if (target !== tree.slice(0, -1) && !target.startsWith(treeReal)) {
    die(`mutant ${m.id}: file ${JSON.stringify(m.file)} escapes --tree`);
  }
}

let ownWork = false;
let workRoot;
if (workArg) {
  workRoot = resolve(workArg);
} else {
  workRoot = mkdtempSync(join(tmpdir(), 'kumitate-mutants-'));
  ownWork = true;
}
mkdirSync(workRoot, { recursive: true });

const SKIP_ROOT_SEGMENTS = new Set(['.git', 'node_modules']);
function freshCopy(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  cpSync(tree, dir, {
    recursive: true,
    filter: (srcPath) => {
      const rel = srcPath.slice(tree.length);
      const top = rel.split(sep).filter(Boolean)[0];
      return !SKIP_ROOT_SEGMENTS.has(top);
    },
  });
}

function runCmd(cmd, cwd) {
  const r = spawnSync(cmd, { shell: true, cwd, encoding: 'utf8', timeout: CMD_TIMEOUT_MS, env: { ...process.env, MUTANTS_TOOLS: dirname(fileURLToPath(import.meta.url)) } });
  if (r.error) return { status: null, out: '', reason: r.error.code || 'SPAWN_ERROR' };
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}`, reason: null };
}

const slug = (id) => String(id).replace(/[^A-Za-z0-9._-]/g, '_');
const tokStr = (m, hit) => (m.expectToken ? (hit ? 'hit' : 'miss') : '-');

let killed = 0;
let survived = 0;
let notEvaluable = 0;
let baselineInconclusive = 0;
let spawnFail = 0;
let findFail = 0;

for (const m of selected) {
  const dir = join(workRoot, `mw-${slug(m.id)}`);
  freshCopy(dir);
  const target = join(dir, m.file);
  let src = null;
  try {
    src = readFileSync(target, 'utf8');
  } catch (e) {
    process.stdout.write(`${m.id} NOT-EVALUABLE(file=${e.code || 'READ'}) exit=- token=-\n`);
    notEvaluable += 1;
    findFail += 1;
    continue;
  }
  const count = src.split(m.find).length - 1;
  if (count !== 1) {
    process.stdout.write(`${m.id} NOT-EVALUABLE(find=${count}) exit=- token=-\n`);
    notEvaluable += 1;
    findFail += 1;
    continue;
  }
  const base = runCmd(m.cmd, dir);
  if (base.reason !== null) {
    process.stdout.write(`${m.id} NOT-EVALUABLE(spawn=${base.reason}) exit=- token=-\n`);
    notEvaluable += 1;
    spawnFail += 1;
    continue;
  }
  const baseTok = m.expectToken ? base.out.includes(m.expectToken) : true;
  if (base.status !== m.expectExit || !baseTok) {
    process.stdout.write(`${m.id} NOT-EVALUABLE(baseline) exit=${base.status} token=${tokStr(m, baseTok)}\n`);
    notEvaluable += 1;
    baselineInconclusive += 1;
    continue;
  }
  freshCopy(dir);
  writeFileSync(target, src.replace(m.find, () => m.replace));
  const mut = runCmd(m.cmd, dir);
  if (mut.reason !== null) {
    process.stdout.write(`${m.id} NOT-EVALUABLE(spawn=${mut.reason}) exit=- token=-\n`);
    notEvaluable += 1;
    spawnFail += 1;
    continue;
  }
  const mutantHash = hash(readFileSync(target));
  freshCopy(dir);
  const restoredHash = hash(readFileSync(target));
  const restored = runCmd(m.cmd, dir);
  const restoredOk = restored.status === m.expectExit && (!m.expectToken || restored.out.includes(m.expectToken));
  process.stderr.write(`${m.id} evidence=${JSON.stringify({ before: hash(src), mutated: mutantHash, restored: restoredHash, baseline: base, mutant: mut, restoredRun: restored })}\n`);
  if (restoredHash !== hash(src) || !restoredOk) {
    process.stdout.write(`${m.id} NOT-EVALUABLE(restoration) exit=${restored.status} token=miss\n`);
    notEvaluable += 1;
    continue;
  }
  const mutTok = m.expectToken ? mut.out.includes(m.expectToken) : true;
  const isKilled = mut.status !== m.expectExit || !mutTok;
  if (isKilled) killed += 1; else survived += 1;
  process.stdout.write(`${m.id} ${isKilled ? 'KILLED' : 'SURVIVED'} exit=${mut.status} token=${tokStr(m, mutTok)}\n`);
  if (!keep) rmSync(dir, { recursive: true, force: true });
}

const evaluated = killed + survived;
process.stdout.write(
  `tally: selected=${selected.length} evaluated=${evaluated} killed=${killed} survived=${survived}`
  + ` not-evaluable=${notEvaluable} (baseline-inconclusive=${baselineInconclusive} spawn=${spawnFail} find-fail=${findFail})\n`,
);

if (!keep) {
  rmSync(workRoot, { recursive: true, force: true });
}
process.exit(findFail > 0 ? 2 : (evaluated === selected.length && survived === 0 ? 0 : 1));
