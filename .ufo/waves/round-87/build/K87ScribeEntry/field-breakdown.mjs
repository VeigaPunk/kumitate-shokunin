#!/usr/bin/env node
// scratch receipt (seat K87ScribeEntry): breakdown of committed close receipts in rounds 74-86
// by which provenance fields they carry. Read-only over the lane tree.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
let total = 0, both = 0, cmdOnly = 0, hashOnly = 0, neither = 0;
const perRound = [];
for (let n = 74; n <= 86; n++) {
  const dir = join(lane, '.ufo/waves', `round-${n}`, 'close');
  if (!existsSync(dir)) continue;
  let t = 0, b = 0, c = 0, h = 0, x = 0;
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.txt')) continue;
    t++;
    const text = readFileSync(join(dir, f), 'utf8');
    const hasCmd = /^cmd=.+$/m.test(text);
    const hasHash = /^tool_sha256=[a-f0-9]{64}$/m.test(text);
    if (hasCmd && hasHash) b++;
    else if (hasCmd) c++;
    else if (hasHash) h++;
    else x++;
  }
  total += t; both += b; cmdOnly += c; hashOnly += h; neither += x;
  perRound.push(`round-${n} total=${t} cmd+hash=${b} cmd_only=${c} hash_only=${h} neither=${x}`);
}
for (const l of perRound) console.log(l);
console.log(`TOTAL receipts=${total} cmd_and_hash=${both} cmd_only=${cmdOnly} hash_only=${hashOnly} neither=${neither}`);
console.log(`neither_or_hash_only (the census NO_CMD_OR_HASH bucket) = ${neither + hashOnly}`);
