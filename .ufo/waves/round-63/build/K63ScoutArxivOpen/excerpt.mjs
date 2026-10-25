#!/usr/bin/env node
// excerpt.mjs — print exact normalised substrings matching a regex from a normalized dump
import { readFileSync } from 'node:fs';
const file = process.argv[2];
const re = new RegExp(process.argv[3]);
const t = readFileSync(file, 'utf8');
let m, n = 0;
while ((m = re.exec(t)) !== null) {
  n += 1;
  console.log(`--- match ${n} @${m.index}`);
  console.log(JSON.stringify(m[0]));
  if (n >= (Number(process.argv[4]) || 5)) break;
}
console.log(`(matches shown: ${n})`);
