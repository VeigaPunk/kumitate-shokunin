#!/usr/bin/env node
/**
 * verify-proposed.mjs — does the proposed 47-case suite kill every SURVIVOR of the frozen
 * 25-case suite? Applies each survivor mutation to proposed/…proposed.mjs (never to the
 * frozen script), runs --selftest, and reports killed / still-surviving.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROPOSED = join(HERE, 'proposed', 'inline-dispatch-evidence.proposed.mjs');
const base = readFileSync(PROPOSED, 'utf8');
const survivors = JSON.parse(readFileSync(join(HERE, 'survivors.json'), 'utf8'));

const rows = [];
let killed = 0;
for (const s of survivors) {
  if (base.split(s.old).length - 1 !== 1) { rows.push([s.id, 'TARGET-BAD', '']); continue; }
  const p = join(HERE, 'mut', `proposed-${s.id}.mjs`);
  writeFileSync(p, base.replace(s.old, s.neu));
  const r = spawnSync('node', [p, '--selftest'], { encoding: 'utf8', timeout: 60_000, killSignal: 'SIGKILL' });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const fails = out.split('\n').filter((l) => l.startsWith('FAIL ')).map((l) => l.split(' — ')[0].replace('FAIL ', ''));
  const summary = (out.match(/INLINE_DISPATCH_SELFTEST: \S+ \(\d+\/\d+\)/) || ['<no summary>'])[0];
  if (r.status !== 0) killed += 1;
  rows.push([s.id, r.status === 0 ? 'SURVIVED' : 'KILLED', `${summary} fails=${fails.join(',') || (r.status === 0 ? '-' : 'crash')}`]);
}
writeFileSync(join(HERE, 'proposed-kills.tsv'), `${['mutant\toutcome\tdetail'].concat(rows.map((r) => r.join('\t'))).join('\n')}\n`);
for (const r of rows) process.stdout.write(`${r[0]}\t${r[1]}\t${r[2]}\n`);
process.stdout.write(`PROPOSED-SUITE survivors=${rows.length} killed=${killed} surviving=${rows.length - killed}\n`);
