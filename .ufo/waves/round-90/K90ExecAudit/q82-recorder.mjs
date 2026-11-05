#!/usr/bin/env node
// Q82 recording tool. Copied by q82-audit.mjs to <scratch>/<mode>/recorder.mjs.
// Logs to config.log (tab-separated, names only, never contents):
//   ARGV <json argv>          every invocation
//   PATH <flag> <value>       the --lane and --rev values, and the --dir value the instrument gets
//   FILE <name>               each *.txt name inside --dir (the names the instrument reads)
// config.keyed (negative control only): the --dir receipts are copied into <mode>/copies/<n>
// under names from config.labels, and the real instrument is given that copy as --dir.
// Delegates to the real instrument with the same argv; stdout, stderr and exit status pass through.
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cfg = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'config.json'), 'utf8'));
const argv = process.argv.slice(2);
const forwarded = argv.slice();
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const logLine = (...cols) => appendFileSync(cfg.log, cols.join('\t') + '\n');
const txtNames = (dir) => {
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.txt')).sort();
  } catch {
    return [];
  }
};
const nextIndex = () => {
  const f = join(cfg.scratch, 'copies.count');
  const n = existsSync(f) ? Number(readFileSync(f, 'utf8')) : 0;
  mkdirSync(cfg.scratch, { recursive: true });
  writeFileSync(f, String(n + 1));
  return n;
};

logLine('ARGV', JSON.stringify(argv));
for (const f of ['--lane', '--rev']) {
  if (flag(f) !== undefined) logLine('PATH', f, flag(f));
}

let dir = flag('--dir');
if (cfg.keyed && dir !== undefined && existsSync(dir) && statSync(dir).isDirectory()) {
  const n = nextIndex();
  const copy = join(cfg.scratch, 'copies', String(n));
  rmSync(copy, { recursive: true, force: true });
  mkdirSync(copy, { recursive: true });
  txtNames(dir).forEach((f, j) => {
    const label = cfg.labels[(n + j) % cfg.labels.length];
    const target = (j === 0 ? label : `${label}-${j + 1}`) + '.txt';
    try {
      copyFileSync(join(dir, f), join(copy, target));
    } catch {
      // unreadable receipt (e.g. mode 0000): left out of the keyed copy
    }
  });
  forwarded[forwarded.indexOf('--dir') + 1] = copy;
  dir = copy;
}

if (dir !== undefined) {
  logLine('PATH', '--dir', dir);
  for (const f of txtNames(dir)) logLine('FILE', f);
}

const r = spawnSync(process.execPath, [cfg.real, ...forwarded], {
  cwd: process.cwd(), env: process.env, encoding: 'utf8', maxBuffer: 64 << 20, timeout: 300000,
});
process.stdout.write(r.stdout || '');
process.stderr.write(r.stderr || '');
process.exit(r.status === null ? 2 : r.status);
