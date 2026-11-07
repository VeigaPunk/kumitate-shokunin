#!/usr/bin/env node
/**
 * repro-battery.mjs — K97CriticA: reproduce the frozen counter's nonce battery for one seed.
 *
 * The battery construction below is copied verbatim (PRNG, id/URL draw order, shuffle, F_A/F_B/F_C)
 * from probe/probe97-c1.mjs (frozen 38eb197c) so a given --seed yields byte-identical fixtures — the
 * probe prints `F_A_sha256`, which this script must reproduce. It then runs the fleet census live on
 * each fixture and emits the (E12 ids in output order, rows) triple the counter compares against.
 *
 *   node repro-battery.mjs <seed> <out json>
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const SEED = process.argv[2];
const OUT = process.argv[3];
const CENSUS = process.env.CENSUS ?? '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const WORK = process.env.WORK ?? '/fast/scratch/hyaku/kumitate-r97/K97CriticA/repro';

let s0 = BigInt(`0x${createHash('sha256').update(`a${SEED}`).digest('hex').slice(0, 16)}`);
let s1 = BigInt(`0x${createHash('sha256').update(`b${SEED}`).digest('hex').slice(0, 16)}`);
const M64 = (1n << 64n) - 1n;
function rnd() {
  let x = s0; const y = s1; s0 = y; x ^= (x << 23n) & M64; s1 = x ^ y ^ (x >> 17n) ^ (y >> 26n);
  return Number(((s1 + y) & M64) >> 11n) / 2 ** 53;
}
const hex = (n) => Array.from({ length: n }, () => Math.floor(rnd() * 16).toString(16)).join('');
const usedIds = new Set();
function nonceId() {
  for (;;) {
    const id = `S${1000 + Math.floor(rnd() * 8_999_000)}`;
    if (!usedIds.has(id)) { usedIds.add(id); return id; }
  }
}
function row(id) {
  const tag = hex(10);
  return `| ${id} | Probe ${tag} — https://n${tag}.example/${hex(6)} | docs | B | scope-${tag} | §1 | probe teaches ${hex(4)} | queued | 2026-10-01 | 90d | — |`;
}

const INDENT = ['', ' ', '   ', '    ', '\t', ' \t'];
const MARKER = ['#', '##', '###'];
const SEP = [' ', '\t', '  ', ' \t', '', '\v', '\f', '\r', '\u00a0'];
const TEXT = ['Registry', 'registry', 'Registry ##', 'Leads', ''];
const TRAIL = ['', ' ', '\t', '\r', '\v', '\f', '\u00a0', ' \r'];
const CTX = ['## Registry', '## Leads (unopened)', '# Title'];
const cases = [];
for (const c of CTX) for (const i of INDENT) for (const m of MARKER) for (const s of SEP) for (const t of TEXT) for (const r of TRAIL) {
  cases.push({ label: JSON.stringify([c, i + m + s + t + r]), lines: [c, i + m + s + t + r] });
}
for (const c of CTX.slice(0, 2)) {
  for (const ri of ['', ' ', '   ', '    ', '\t', '  \t']) cases.push({ label: JSON.stringify([c, `row-indent:${ri}`]), lines: [c], rowIndent: ri });
  for (const pad of ['|S', '|\tS', '|  S']) cases.push({ label: JSON.stringify([c, `row-pad:${pad}`]), lines: [c], rowPad: pad });
}
for (let k = cases.length - 1; k > 0; k -= 1) { const j = Math.floor(rnd() * (k + 1)); [cases[k], cases[j]] = [cases[j], cases[k]]; }
const lines = [];
{ const id = nonceId(); lines.push(row(id)); }
for (const cs of cases) {
  const id = nonceId();
  let r = row(id);
  if (cs.rowPad) r = r.replace(/^\| /, cs.rowPad.slice(0, -1));
  lines.push(...cs.lines, `${cs.rowIndent ?? ''}${r}`);
}
const FA = `${lines.join('\n')}\n`;
const FB = FA.replace(/\n/g, '\r\n');
const FC = `${lines.map((l) => (rnd() < 0.5 ? `${l}\r` : l)).join('\n')}\n`;

rmSync(WORK, { recursive: true, force: true });
mkdirSync(join(WORK, 'corpus', 'knowledge'), { recursive: true });
function census(text) {
  writeFileSync(join(WORK, 'corpus', 'SOURCES.md'), text);
  const file = join(WORK, 'corpus', 'SOURCES.md');
  const v = spawnSync('bash', [CENSUS, 'validate', '--file', file], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const ids = v.stdout.split('\n').map((l) => l.split('\t')).filter((p) => p[1] === 'E12').map((p) => p[2].split(' ')[0]);
  const c = spawnSync('bash', [CENSUS, 'census', '--file', file], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const m = /^file\trows\t(\d+)$/m.exec(c.stdout ?? '');
  if (!m) { console.error('census rows missing'); process.exit(2); }
  return { ids, rows: Number(m[1]) };
}
const sha = (t) => createHash('sha256').update(t).digest('hex');
const res = {
  seed: SEED,
  lines: lines.length,
  fa_sha256: sha(FA),
  lf: census(FA),
  crlf: census(FB),
  mixed: census(FC),
};
writeFileSync(OUT, `${JSON.stringify(res)}\n`);
console.log(`seed=${SEED} lines=${lines.length} fa_sha256=${res.fa_sha256} lf=${res.lf.ids.length}/${res.lf.rows} crlf=${res.crlf.ids.length}/${res.crlf.rows} mixed=${res.mixed.ids.length}/${res.mixed.rows}`);
