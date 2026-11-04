#!/usr/bin/env node
// C2 mutation stand-in, not the implementation delivered for admission.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const args = process.argv.slice(2);
const ix = args.indexOf('--lane');
const lane = ix < 0 ? resolve(dirname(fileURLToPath(import.meta.url)), '..') : args.splice(ix, 2)[1];
const readme = join(lane, 'corpus/README.md');
const pin = join(lane, '.ufo/pins/readme-map.json');
const rowBytes = readFileSync(readme);
const pinBytes = readFileSync(pin);
const rows = rowBytes.toString();
const registry = JSON.parse(pinBytes);
const mapped = p => rows.includes('| `' + p + '` |') && registry.covered.includes(p);
const oracle = () => spawnSync(process.execPath, [join(lane, 'scripts/readme-map.mjs')], {encoding:'utf8'});
const emit = (text, code = 0) => { console.log(text); process.exitCode = code; };
const p = args[1];
if (args[0] === '--predict') {
  const target = `corpus/lessons/round-${p}-verifier-spotcheck.md`;
  const exists = existsSync(join(lane, target));
  const covered = mapped(target.slice(7));
  emit(`SPOTCHECK_PREDICT: ${!exists ? 'PENDING' : covered ? 'COVERED' : 'UNCOVERED'} ${target}`, exists && !covered ? 1 : 0);
} else if (args[0] === '--adopt') {
  if (!p.startsWith('corpus/lessons/')) emit('REFUSED_OUT_OF_SCOPE', 2);
  else if (!/^round-\d+-verifier-spotcheck\.md$/.test(p.split('/').at(-1))) emit('REFUSED_NOT_SPOTCHECK', 2);
  else if (!existsSync(join(lane, p))) emit('REFUSED_ABSENT', 2);
  else {
    const key = p.slice(7);
    const hasRow = rows.includes('| `' + key + '` |');
    const hasPin = registry.covered.includes(key);
    if (hasRow && hasPin) {
      emit(`SPOTCHECK_ADOPT: ALREADY_ADOPTED ${p}`);
    } else {
      if (!hasRow) writeFileSync(readme, rows + `| \`${key}\` | Spotcheck | closure |\n`);
      if (!hasPin) { registry.covered.push(key); writeFileSync(pin, JSON.stringify(registry, null, 2) + '\n'); }
      const result = oracle();
      if (result.status !== 0 || !result.stdout.startsWith('README_MAP: CLEAN')) {
        writeFileSync(readme, rowBytes); writeFileSync(pin, pinBytes);
        emit('REFUSED_ORACLE', 2);
      } else emit(`SPOTCHECK_ADOPT: ADOPTED ${p} wrote=${!hasRow && !hasPin ? 'both' : !hasRow ? 'row' : 'pin'}\n${result.stdout.trim()}`);
    }
  }
} else if (args[0] === '--check') {
  const result = oracle();
  emit(result.stdout.trim(), result.status);
} else emit('USAGE', 64);
