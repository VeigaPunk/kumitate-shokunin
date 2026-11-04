#!/usr/bin/env node
// scratch census: does each close receipt's tool_sha256 name the script its own cmd= invoked?
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, isAbsolute, relative } from 'node:path';

const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const rounds = process.argv.slice(2);
const sha = (b) => createHash('sha256').update(b).digest('hex');
let total = 0, bound = 0, mismatch = 0, unresolved = 0, noCmd = 0;
const rows = [];
for (const r of rounds) {
  const dir = join(lane, '.ufo/waves', r, 'close');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.txt')) continue;
    const p = join(dir, f);
    const text = readFileSync(p, 'utf8');
    const rev = (text.match(/^rev=([a-f0-9]{40})$/m) || [])[1];
    const tool = (text.match(/^tool_sha256=([a-f0-9]{64})$/m) || [])[1];
    const cmd = (text.match(/^cmd=(.+)$/m) || [])[1];
    total++;
    if (!cmd || !tool) { noCmd++; rows.push([r, f, 'NO_CMD_OR_HASH', '', '']); continue; }
    const toks = cmd.trim().split(/\s+/);
    let script = toks[1];
    if (!script) { noCmd++; rows.push([r, f, 'NO_SCRIPT', cmd, '']); continue; }
    let rel = null, bytes = null;
    if (isAbsolute(script)) {
      if (script.startsWith(lane + '/')) rel = relative(lane, script);
      else if (existsSync(script)) bytes = readFileSync(script);
    } else rel = script;
    if (rel && rev) {
      const g = spawnSync('git', ['-C', lane, 'show', `${rev}:${rel}`], { maxBuffer: 64 << 20 });
      if (g.status === 0) bytes = g.stdout;
    }
    if (!bytes) { unresolved++; rows.push([r, f, 'UNRESOLVED', cmd, '']); continue; }
    const h = sha(bytes);
    if (h === tool) bound++; else { mismatch++; rows.push([r, f, 'MISMATCH', cmd, h.slice(0, 12) + ' vs ' + tool.slice(0, 12)]); }
  }
}
console.log(`receipts=${total} bound=${bound} mismatch=${mismatch} unresolved=${unresolved} no_cmd=${noCmd}`);
for (const row of rows) console.log(row.join(' | '));
