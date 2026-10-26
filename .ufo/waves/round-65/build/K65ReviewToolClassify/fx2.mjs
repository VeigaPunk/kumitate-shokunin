// Second fixture batch: stream ordering, signals, GONE, registry shrink, needs-as-directory.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const TOOL = process.env.TOOL || '/tmp/kumitate-r65/K65ReviewToolClassify/harm-matrix.mjs';
const ROOT = '/tmp/kumitate-r65/K65ReviewToolClassify/fx';
const git = (D, args, extra = {}) => spawnSync('git', ['-C', D, ...args], { encoding: 'utf8', ...extra });
const GID = ['-c', 'user.name=fx', '-c', 'user.email=fx@invalid', '-c', 'commit.gpgsign=false'];
const G = (id, argv, verdict, clean = ['CLEAN'], extra = {}) => ({ id, argv, verdict, clean, ...extra });
const script = (body) => `#!/usr/bin/env node\n${body}\n`;

function mkfx(name, { base, tip, gatesBase, gatesTip, tipDelete = [] }) {
  const D = mkdtempSync(join(ROOT, `${name}.`));
  const put = (files) => { for (const [p, body] of Object.entries(files || {})) { mkdirSync(dirname(join(D, p)), { recursive: true }); writeFileSync(join(D, p), body); } };
  git(D, ['init', '-q']);
  const top = git(D, ['rev-parse', '--show-toplevel']).stdout.trim();
  if (top !== D) throw new Error(`toplevel ${top} != ${D}`);
  put(base); put({ 'gates.json': JSON.stringify({ gates: gatesBase }) });
  git(D, GID.concat(['add', '-A'])); git(D, GID.concat(['commit', '-q', '-m', 'base']));
  const baseRev = git(D, ['rev-parse', 'HEAD']).stdout.trim();
  put(tip); if (gatesTip) put({ 'gates.json': JSON.stringify({ gates: gatesTip }) });
  for (const p of tipDelete) rmSync(join(D, p), { force: true });
  git(D, GID.concat(['add', '-A'])); git(D, GID.concat(['commit', '-q', '--allow-empty', '-m', 'tip']));
  return { D, baseRev, tipRev: git(D, ['rev-parse', 'HEAD']).stdout.trim() };
}
function run(label, f, env = {}) {
  const r = spawnSync('node', [TOOL, '--lane', f.D, '--base', f.baseRev, '--tip', f.tipRev, '--gates', join(f.D, 'gates.json')], { encoding: 'utf8', timeout: 300000, env: { ...process.env, ...env } });
  console.log(`\n===== ${label}  fixture=${f.D} exit=${r.status}`);
  for (const l of (r.stdout || '').split('\n').filter(Boolean)) console.log('  ' + l);
  for (const l of (r.stderr || '').split('\n').filter(Boolean)) console.log('  ERR ' + l.slice(0, 300));
  return r;
}

// FX5b: DRIFT on stderr, CLEAN on stdout (the true last line is the stdout one)
{
  const f = mkfx('fx5b-order', {
    base: { 'gate.mjs': script(`console.error('GATE: DRIFT file=a.md'); console.log('GATE: CLEAN (final)'); process.exit(0);`) },
    tip: { 'gate.mjs': script(`console.log('GATE: CLEAN (final)'); process.exit(0);`) },
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)')],
  });
  run('FX5b same gate: DRIFT on stderr, final CLEAN on stdout', f);
  console.log('  true merged tail: ' + JSON.stringify(spawnSync('bash', ['-c', `cd ${f.D} && node gate.mjs 2>&1 | tail -1`], { encoding: 'utf8' }).stdout.trim()));
}

// FX8: signal death
{
  const f = mkfx('fx8-signal', {
    base: { 'gate.mjs': script(`console.log('GATE: CLEAN');`) },
    tip: { 'gate.mjs': script(`console.log('GATE: CLEAN'); process.kill(process.pid, 'SIGSEGV');`) },
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)')],
  });
  run('FX8 gate prints CLEAN then dies on SIGSEGV', f);
}

// FX7: gate exits 124 by its own convention
{
  const f = mkfx('fx7-124', {
    base: { 'gate.mjs': script(`console.log('GATE: CLEAN');`) },
    tip: { 'gate.mjs': script(`console.log('GATE: DRIFT findings=124'); process.exit(124);`) },
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)')],
  });
  run('FX7 gate exits 124 as its own not-clean code', f);
}

// FX9: red gate deleted
{
  const f = mkfx('fx9-gone', {
    base: { 'gate.mjs': script(`console.log('GATE: DRIFT files=9'); process.exit(1);`), 'ok.mjs': script(`console.log('OK: CLEAN');`) },
    tip: {}, tipDelete: ['gate.mjs'],
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)'), G('ok', ['node', 'ok.mjs'], '^OK: (\\w+)')],
  });
  run('FX9 tip deletes a red gate (GONE is not a bad count)', f);
}

// FX10: registry read once from the tip worktree; a dropped row is invisible
{
  const f = mkfx('fx10-registry', {
    base: { 'gate.mjs': script(`console.log('GATE: CLEAN');`), 'ok.mjs': script(`console.log('OK: CLEAN');`) },
    tip: { 'gate.mjs': script(`console.log('GATE: DRIFT files=9'); process.exit(1);`) },
    gatesBase: [G('gate', ['node', 'gate.mjs'], '^GATE: (\\w+)'), G('ok', ['node', 'ok.mjs'], '^OK: (\\w+)')],
    gatesTip: [G('ok', ['node', 'ok.mjs'], '^OK: (\\w+)')],
  });
  run('FX10 tip drops the red gate row from gates.json', f);
  console.log('  base:gates.json ids: ' + (spawnSync('bash', ['-c', `git -C ${f.D} show ${f.baseRev}:gates.json`], { encoding: 'utf8' }).stdout.match(/"id":\s*"[^"]+"/g) || []).join(' '));
}

// FX11: needs is a directory; FX11b: needs is a zero-byte file
{
  const f = mkfx('fx11-dir', {
    base: { 'gatedir/keep': 'x\n', 'empty.mjs': '', 'gate.mjs': script(`console.log('GATE: CLEAN');`) },
    tip: { 'gate.mjs': script(`console.log('GATE: DRIFT files=1'); process.exit(1);`) },
    gatesBase: [G('dir-needs', ['node', 'gate.mjs'], '^GATE: (\\w+)', ['CLEAN'], { needs: 'gatedir' }), G('empty-needs', ['node', 'gate.mjs'], '^GATE: (\\w+)', ['CLEAN'], { needs: 'empty.mjs' })],
  });
  run('FX11 needs is a directory / a zero-byte file', f);
}

// FX12: every gate is FAIL_CLOSED at both revisions -> CREAN by CARRIED
{
  const f = mkfx('fx12-noverdict', {
    base: { 'gate.mjs': script(`process.exit(0);`) },
    tip: { 'gate.mjs': script(`process.exit(0);`) },
    gatesBase: [G('quiet', ['node', 'gate.mjs'], '^GATE: (\\w+)')],
  });
  run('FX12 a gate that never prints a verdict at either revision', f);
}
