#!/usr/bin/env node
// Independent direct-run driver: executes each registry gate's argv inside a pre-extracted archive dir.
// Deliberately does not import harm-matrix.mjs; it re-implements only the "run the command" step.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const [gatesFile, outFile, ...dirs] = process.argv.slice(2);
const list = JSON.parse(readFileSync(gatesFile, 'utf8')).gates;
const env = { PATH: process.env.PATH, HOME: process.env.HOME || '/tmp', LANG: 'C', LC_ALL: 'C', NO_COLOR: '1' };
writeFileSync(outFile, '');
for (const dir of dirs) {
  for (const g of list) {
    const needs = g.needs || g.argv.find((a) => /\.(mjs|js|sh|py)$/.test(a)) || null;
    const tag = `${g.id} ${dir}`;
    if (needs && !existsSync(join(dir, needs))) { appendFileSync(outFile, `GATE ${g.id} dir=${dir} cls=ABSENT needs=${needs}\n`); continue; }
    const t = Number.isInteger(g.timeout) && g.timeout > 0 ? g.timeout : 60;
    const r = spawnSync('timeout', ['-k', '2', String(t), ...g.argv], { cwd: dir, encoding: 'utf8', env, maxBuffer: 64 << 20 });
    const lines = `${r.stdout || ''}\n${r.stderr || ''}`.split('\n').map((l) => l.trimEnd());
    const re = new RegExp(g.verdict);
    let hit = null;
    for (const l of lines) { const m = re.exec(l); if (m) hit = l.trim(); }
    appendFileSync(outFile, `GATE ${g.id} dir=${dir} exit=${r.status} verdict=${JSON.stringify(hit)}\n`);
  }
  appendFileSync(outFile, `DONE dir=${dir}\n`);
}
