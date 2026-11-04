#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const here = dirname(fileURLToPath(import.meta.url));
function detect(file, cwd, timeoutMs) {
  return new Promise(resolveResult => {
    const child = spawn(process.execPath, [file, '--selftest'], {
      cwd, detached: true, env: { ...process.env, TMPDIR: cwd, TMP: cwd, TEMP: cwd },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '', stderr = '', timeout = false;
    child.stdout.on('data', b => { stdout = (stdout + b).slice(-262144); });
    child.stderr.on('data', b => { stderr = (stderr + b).slice(-262144); });
    const timer = setTimeout(() => {
      timeout = true;
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already exited */ }
    }, timeoutMs);
    child.on('error', error => { clearTimeout(timer); resolveResult({ status: null, error: error.message, stdout, stderr }); });
    child.on('close', (status, signal) => {
      clearTimeout(timer);
      // Descendants must not survive a detector, including a normally exiting parent.
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* no descendants */ }
      resolveResult({ status, signal, timeout, stdout, stderr });
    });
  });
}
const passed = r => r.status === 0 && !r.signal && !r.timeout && !r.error;
async function main() {
  const argv = process.argv.slice(2);
  if (argv.length !== 4 || argv[0] !== '--tool' || argv[2] !== '--work') {
    console.error('usage: node mutants.mjs --tool paths.json --work DIR'); return 2;
  }
  const paths = JSON.parse(readFileSync(resolve(argv[1]), 'utf8'));
  const work = resolve(argv[3]);
  if (!work.startsWith('/fast/scratch/hyaku/kumitate-r77/')) throw new Error('--work must be below round-77 scratch');
  mkdirSync(work, { recursive: true });
  const list = JSON.parse(readFileSync(join(here, 'mutants.json'), 'utf8'));
  const rows = [];
  const receipt = join(work, 'results.jsonl');
  writeFileSync(receipt, '');
  for (const m of list.mutants) {
    const source = resolve(paths[m.tool] ?? '');
    let dir, target, before, row = { id: m.id, tool: m.tool, expectedDetector: m.expectedDetector };
    try {
      if (!paths[m.tool]) throw new Error(`missing tool path ${m.tool}`);
      before = readFileSync(source);
      row.source = source; row.before = hash(before);
      dir = mkdtempSync(join(work, `${m.id}-`));
      const scripts = join(dir, 'scripts'); mkdirSync(scripts);
      // Embedded selftests import neighboring instruments; copy only script files, never a lane.
      for (const parent of new Set(Object.values(paths).map(p => dirname(resolve(p))))) {
        for (const e of readdirSync(parent, { withFileTypes: true })) {
          if (e.isFile() && /\.(mjs|json|sh)$/.test(e.name)) copyFileSync(join(parent, e.name), join(scripts, e.name));
        }
      }
      for (const [rel, p] of Object.entries(paths)) copyFileSync(resolve(p), join(scripts, basename(rel)));
      target = join(scripts, basename(m.tool)); writeFileSync(target, before);
      row.pristine = await detect(target, dir, list.timeoutMs);
      const text = before.toString('utf8');
      row.matches = text.split(m.find).length - 1;
      if (!passed(row.pristine)) row.verdict = 'drift';
      else if (!row.matches) row.verdict = 'nomatch';
      else if (row.matches !== 1) row.verdict = 'drift';
      else {
        const mutated = text.replace(m.find, m.replace);
        row.mutatedHash = hash(mutated); writeFileSync(target, mutated);
        row.mutated = await detect(target, dir, list.timeoutMs);
        row.verdict = row.mutated.error || row.mutated.signal || row.mutated.timeout
          || /SyntaxError:/.test(row.mutated.stderr) ? 'crash'
          : passed(row.mutated) ? 'survived' : 'killed';
      }
    } catch (e) { row.verdict = 'crash'; row.error = e.message; }
    finally {
      if (target && before) {
        writeFileSync(target, before);
        row.restoredHash = hash(readFileSync(target));
        row.restored = await detect(target, dir, list.timeoutMs);
        row.sourceAfter = hash(readFileSync(source));
        if (row.restoredHash !== row.before || row.sourceAfter !== row.before || !passed(row.restored)) row.verdict = 'drift';
      }
      if (dir) rmSync(dir, { recursive: true, force: true });
    }
    rows.push(row); writeFileSync(receipt, `${JSON.stringify(row)}\n`, { flag: 'a' });
    console.log(`${m.id} ${row.verdict}`);
  }
  const killed = rows.filter(r => r.verdict === 'killed').length;
  const survivors = rows.filter(r => r.verdict === 'survived').map(r => r.id);
  const inconclusive = rows.filter(r => !['killed', 'survived'].includes(r.verdict)).map(r => `${r.id}:${r.verdict}`);
  console.log(killed === rows.length ? `MUTANTS77_C1: ALL-KILLED killed=${killed}/${rows.length}`
    : `MUTANTS77_C1: NOT-ALL-KILLED killed=${killed}/${rows.length} survivors=${survivors.join(',') || '-'} inconclusive=${inconclusive.join(',') || '-'}`);
  return inconclusive.length ? 2 : survivors.length ? 1 : 0;
}
try { process.exitCode = await main(); } catch (e) { console.error(e.stack); process.exitCode = 2; }
