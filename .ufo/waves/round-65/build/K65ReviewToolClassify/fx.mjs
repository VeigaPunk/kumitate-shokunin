// Fixture harness for kumitate round-65 C1 classification review.
// Builds throwaway git repos under /tmp, runs the lane's harm-matrix.mjs copy against them.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';

const TOOL = process.env.TOOL || '/tmp/kumitate-r65/K65ReviewToolClassify/harm-matrix.mjs';
const ROOT = '/tmp/kumitate-r65/K65ReviewToolClassify/fx';
mkdirSync(ROOT, { recursive: true });

const git = (D, args, extra = {}) => spawnSync('git', ['-C', D, ...args], { encoding: 'utf8', ...extra });
const GID = ['-c', 'user.name=fx', '-c', 'user.email=fx@invalid', '-c', 'commit.gpgsign=false'];

function mkfx(name, { base, tip, gatesBase, gatesTip, tipDelete = [] }) {
  const D = mkdtempSync(join(ROOT, `${name}.`));
  const put = (files) => { for (const [p, body] of Object.entries(files || {})) { mkdirSync(dirname(join(D, p)), { recursive: true }); writeFileSync(join(D, p), body); } };
  if (git(D, ['init', '-q']).status !== 0) throw new Error('init');
  const top = git(D, ['rev-parse', '--show-toplevel']).stdout.trim();
  if (top !== D) throw new Error(`toplevel ${top} != ${D}`);
  put(base); put({ 'gates.json': JSON.stringify({ gates: gatesBase }) });
  if (git(D, GID.concat(['add', '-A'])).status !== 0) throw new Error('add base');
  if (git(D, GID.concat(['commit', '-q', '-m', 'base'])).status !== 0) throw new Error('commit base');
  const baseRev = git(D, ['rev-parse', 'HEAD']).stdout.trim();
  put(tip); if (gatesTip) put({ 'gates.json': JSON.stringify({ gates: gatesTip }) });
  for (const p of tipDelete) rmSync(join(D, p), { force: true });
  if (git(D, GID.concat(['add', '-A'])).status !== 0) throw new Error('add tip');
  if (git(D, GID.concat(['commit', '-q', '--allow-empty', '-m', 'tip'])).status !== 0) throw new Error('commit tip');
  const tipRev = git(D, ['rev-parse', 'HEAD']).stdout.trim();
  return { D, baseRev, tipRev };
}

function run(label, f, env = {}) {
  const r = spawnSync('node', [TOOL, '--lane', f.D, '--base', f.baseRev, '--tip', f.tipRev, '--gates', join(f.D, 'gates.json')], { encoding: 'utf8', timeout: 300000, env: { ...process.env, ...env } });
  console.log(`\n===== ${label}  fixture=${f.D} exit=${r.status}`);
  for (const l of (r.stdout || '').split('\n').filter(Boolean)) console.log('  ' + l);
  for (const l of (r.stderr || '').split('\n').filter(Boolean)) console.log('  ERR ' + l.slice(0, 300));
  return r;
}
const G = (id, argv, verdict, clean = ['CLEAN'], extra = {}) => ({ id, argv, verdict, clean, ...extra });
const script = (body) => `#!/usr/bin/env node\n${body}\n`;

// ---------- FX1: needs derivation picks the --import loader, not the gate
{
  const f = mkfx('fx1-needs', {
    base: { 'gate.mjs': script(`console.log('GATE: CLEAN'); process.exit(0);`), 'ok.mjs': script(`console.log('OK: CLEAN');`) },
    tip: { 'gate.mjs': script(`console.log('GATE: DRIFT files=3'); process.exit(1);`) },
    gatesBase: [
      G('loader-gate', ['node', '--import', 'loader.mjs', 'gate.mjs'], '^GATE: (\\w+)'),
      G('direct-gate', ['node', 'gate.mjs'], '^GATE: (\\w+)'),
      G('ok', ['node', 'ok.mjs'], '^OK: (\\w+)'),
    ],
  });
  run('FX1 needs=loader.mjs (absent) hides the HARM that direct-gate sees', f);
  console.log('  direct run at tip: ' + spawnSync('node', [join(f.D, 'gate.mjs')], { encoding: 'utf8' }).stdout.trim() + '  (exit 1 = not clean)');
}

// ---------- FX2: needs existence follows a symlink out of the sandbox
{
  const host = join(ROOT, 'host-gate.mjs'); writeFileSync(host, script(`console.log('GATE: CLEAN');`));
  const f = mkfx('fx2-symlink', {
    base: { 'gate.mjs': script(`console.log('GATE: CLEAN');`) },
    tip: {},
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)')],
  });
  rmSync(join(f.D, 'gate.mjs'), { force: true });
  symlinkSync(host, join(f.D, 'gate.mjs'));
  git(f.D, GID.concat(['add', '-A'])); git(f.D, GID.concat(['commit', '-q', '--allow-empty', '-m', 'tip-symlink']));
  f.tipRev = git(f.D, ['rev-parse', 'HEAD']).stdout.trim();
  console.log('\n  tip tree mode for gate.mjs: ' + git(f.D, ['ls-tree', 'HEAD', 'gate.mjs']).stdout.trim());
  run('FX2 tip gate.mjs is a symlink to a host file that always prints CLEAN', f);
}

// ---------- FX3: verdict regex without capture group -> capture falls back to m[0]
{
  const f = mkfx('fx3-capture', {
    base: { 'gate.mjs': script(`console.log('STEP: expected CLEAN, got DRIFT');`) },
    tip: { 'gate.mjs': script(`console.log('STEP: expected CLEAN, got DRIFT'); console.log('SKIP: 12 checks not run'); process.exit(0);`) },
    gatesBase: [G('wordonly', ['node', 'gate.mjs'], 'CLEAN')],
  });
  run('FX3 verdict "CLEAN" (no capture group) reads CLEAN from a negative sentence', f);
}

// ---------- FX4: \w+ truncates a hyphenated verdict word to a clean prefix
{
  const f = mkfx('fx4-hyphen', {
    base: { 'gate.mjs': script(`console.log('README_MAP: CLEAN files=2 rows=2 covered=2');`) },
    tip: { 'gate.mjs': script(`console.log('README_MAP: CLEAN-STALE files=2 rows=2 covered=2'); process.exit(0);`) },
    gatesBase: [G('readme', ['node', 'gate.mjs'], '^README_MAP: (\\w+)')],
  });
  run('FX4 tip prints CLEAN-STALE (not a clean word); regex captures CLEAN', f);
  const g = mkfx('fx4b-negative', {
    base: { 'gate.mjs': script(`console.log('README_MAP: CLEAN files=2');`) },
    tip: { 'gate.mjs': script(`console.log('README_MAP: DRIFT-STALE files=2 bad=1'); process.exit(1);`) },
    gatesBase: [G('readme', ['node', 'gate.mjs'], '^README_MAP: (\\w+)')],
  });
  run('FX4b same regex on a hyphenated NEGATIVE word (captures DRIFT, safe)', g);
}

// ---------- FX5: stdout+stderr concatenation is not chronological
{
  const f = mkfx('fx5-order', {
    base: { 'gate.mjs': script(`console.error('GATE: DRIFT file=a.md'); console.error('GATE: CLEAN after retry'); console.log('GATE: CLEAN (final)'); process.exit(0);`) },
    tip: { 'gate.mjs': script(`console.log('GATE: CLEAN (final)'); process.exit(0);`) },
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)')],
  });
  run('FX5 stdout first then stderr: a late CLEAN on stdout loses to an earlier DRIFT on stderr', f);
  const assets = spawnSync('bash', ['-c', `cd ${f.D} && node gate.mjs 2>&1 | tail -1`], { encoding: 'utf8' });
  console.log('  merged 2>&1 tail: ' + JSON.stringify(assets.stdout.trim()) + ' (true last line)');
}

// ---------- FX6: `timeout` binary absent from PATH
{
  const bin = join(ROOT, 'bin6'); mkdirSync(bin, { recursive: true });
  for (const b of ['node', 'git']) { try { symlinkSync(spawnSync('sh', ['-c', `command -v ${b}`], { encoding: 'utf8' }).stdout.trim(), join(bin, b)); } catch {} }
  const f = mkfx('fx6-timeout', {
    base: { 'gate.mjs': script(`console.log('GATE: CLEAN');`) },
    tip: { 'gate.mjs': script(`console.log('GATE: CLEAN');`) },
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)')],
  });
  run('FX6 PATH has node+git but no timeout', f, { PATH: bin });
  console.log('  timeout on that PATH: ' + JSON.stringify(spawnSync('sh', ['-c', 'command -v timeout'], { encoding: 'utf8', env: { PATH: bin } }).stdout.trim()));
}

// ---------- FX7: a gate that legitimately exits 124
{
  const f = mkfx('fx7-124', {
    base: { 'gate.mjs': script(`console.log('GATE: CLEAN');`) },
    tip: { 'gate.mjs': script(`console.log('GATE: DRIFT too-many-findings count=124'); process.exit(124);`) },
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)')],
  });
  run('FX7 gate exits 124 by its own convention', f);
}

// ---------- FX8: signal death is flattened to rc=128
{
  const f = mkfx('fx8-signal', {
    base: { 'gate.mjs': script(`console.log('GATE: CLEAN');`) },
    tip: { 'gate.mjs': script(`console.log('GATE: CLEAN'); process.kill(process.pid, 'SIGSEGV');`) },
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)')],
  });
  run('FX8 gate prints CLEAN then dies on SIGSEGV', f);
}

// ---------- FX9: a red gate that is deleted reads GONE and does not count
{
  const f = mkfx('fx9-gone', {
    base: { 'gate.mjs': script(`console.log('GATE: DRIFT files=9'); process.exit(1);`), 'ok.mjs': script(`console.log('OK: CLEAN');`) },
    tip: {},
    tipDelete: ['gate.mjs'],
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)'), G('ok', ['node', 'ok.mjs'], '^OK: (\\w+)')],
  });
  run('FX9 tip deletes a red gate (GONE is uncounted)', f);
}

// ---------- FX10: registry is read once, from the tip, so a dropped row is invisible
{
  const f = mkfx('fx10-registry', {
    base: { 'gate.mjs': script(`console.log('GATE: CLEAN');`), 'ok.mjs': script(`console.log('OK: CLEAN');`) },
    tip: { 'gate.mjs': script(`console.log('GATE: DRIFT files=9'); process.exit(1);`) },
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)'), G('ok', ['node', 'ok.mjs'], '^OK: (\\w+)')],
    gatesTip: [G('ok', ['node', 'ok.mjs'], '^OK: (\\w+)')],
  });
  run('FX10 tip drops the gate row from gates.json (the registry the tool was run with)', f);
  console.log('  base:gates.json ids = ' + spawnSync('sh', ['-c', `git -C ${f.D} show ${f.baseRev}:gates.json`], { encoding: 'utf8' }).stdout.match(/"id":\s*"[^"]+"/g)?.join(','));
}

// ---------- FX11: needs is a directory / zero-byte file
{
  const f = mkfx('fx11-dir', {
    base: { 'gatedir/keep': 'x\n', 'gate.mjs': script(`console.log('GATE: CLEAN');`) },
    tip: {},
    gatesBase: [G('gate', ['node', 'gatedir'], '^GATE: (\\w+)', ['CLEAN'], { needs: 'gatedir' })],
  });
  run('FX11 needs=gatedir (a directory at both revs)', f);
}
