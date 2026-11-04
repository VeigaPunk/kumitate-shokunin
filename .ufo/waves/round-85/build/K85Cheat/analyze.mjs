#!/usr/bin/env node
// Field-level analysis of the frozen C85_C1 output for the cheat lanes.
// Reads the packed receipts beside this script (inst-a-1, inst-b-1, inst-b-2).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'receipts');

function parseArms(file) {
  const arms = new Map();
  for (const line of readFileSync(`${ROOT}/${file}`, 'utf8').split('\n')) {
    const m = /^C85_C1 arm (\S+) (ok|FAIL) exit=(\S+) want=(\S+)(.*)$/.exec(line);
    if (!m) continue;
    const lm = / line2=("(?:[^"\\]|\\.)*")/.exec(m[5]);
    arms.set(m[1], { ok: m[2] === 'ok', got: lm ? JSON.parse(lm[1]) : null });
  }
  return arms;
}

function parseWants(file) {
  const wants = new Map();
  for (const line of readFileSync(`${ROOT}/${file}`, 'utf8').split('\n')) {
    const m = /^WANT2 (\S+) (RECEIPT: .*)$/.exec(line);
    if (m) wants.set(m[1], m[2]);
  }
  return wants;
}

const parseNonce = (file) => /PROBE_NONCE (\S+)/.exec(readFileSync(`${ROOT}/${file}`, 'utf8'))?.[1] ?? null;
const field = (line) => {
  const map = new Map();
  for (const part of line.split(' ')) {
    const eq = part.indexOf('=');
    if (eq > 0) map.set(part.slice(0, eq), part.slice(eq + 1));
  }
  return map;
};
const diffKeys = (a, b) => {
  const fa = field(a);
  const fb = field(b);
  const keys = new Set([...fa.keys(), ...fb.keys()]);
  return [...keys].filter((k) => fa.get(k) !== fb.get(k)).sort();
};
const sig = (keys) => (keys.length ? keys.join('+') : 'identical');

const RUNS = { a: 'inst-a-1.txt', b: 'inst-b-1.txt' };
for (const mode of ['a', 'b']) {
  const arms = parseArms(RUNS[mode]);
  const wants = parseWants(RUNS[mode]);
  const sigs = new Map();
  const passing = [];
  for (const [name, arm] of arms) {
    if (arm.ok) { passing.push(name); continue; }
    const want = wants.get(name);
    const keys = want === undefined ? ['<no-want>'] : diffKeys(arm.got ?? '', want);
    sigs.set(sig(keys), (sigs.get(sig(keys)) ?? 0) + 1);
  }
  console.log(`MODE ${mode} score=${[...arms.values()].filter((a) => a.ok).length}/${arms.size} pass=${passing.join(',')}`);
  for (const [key, n] of [...sigs].sort()) console.log(`  failing_diff signature=${key} arms=${n}`);
}

const wants1 = parseWants('inst-b-1.txt');
const wants2 = parseWants('inst-b-2.txt');
const got1 = parseArms('inst-b-1.txt');
const got2 = parseArms('inst-b-2.txt');
console.log(`NONCES ${parseNonce('inst-b-1.txt')} ${parseNonce('inst-b-2.txt')} distinct=${parseNonce('inst-b-1.txt') !== parseNonce('inst-b-2.txt')}`);
let wantShaDiff = 0;
let wantByteDiff = 0;
for (const [name, w1] of wants1) {
  const w2 = wants2.get(name);
  const keys = diffKeys(w1, w2);
  if (keys.includes('sha256')) wantShaDiff += 1;
  if (keys.includes('bytes')) wantByteDiff += 1;
}
console.log(`WANT_ACROSS_RUNS arms=${wants1.size} sha256_changed=${wantShaDiff} bytes_changed=${wantByteDiff}`);
let gotShaDiff = 0;
for (const [name, a] of got1) {
  const b = got2.get(name);
  if (a.got && b?.got && field(a.got).get('sha256') !== field(b.got).get('sha256')) gotShaDiff += 1;
}
console.log(`GOT_ACROSS_RUNS printed_receipt_lines=${[...got1.values()].filter((a) => a.got).length} sha256_changed=${gotShaDiff}`);
