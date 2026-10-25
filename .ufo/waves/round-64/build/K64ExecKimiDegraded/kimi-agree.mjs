#!/usr/bin/env node
// kimi-agree.mjs — do `kimi-census.mjs` and `proxy-check.mjs` agree about the
// K layer? Census NAMES which governed member is absent; the proxy's K terms
// must report the SAME shortfall as a delta. A stanza fitted to the live count
// (K_members == live members) reads MATCH while the census names members —
// that is the round-64 D4 mask, and this script must exit 1 on it.
//
// usage: node kimi-agree.mjs <tree> [--kimi-root DIR]
// exit 0 AGREE · 1 DISAGREE · 2 usage/run failure
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const [tree, ...rest] = process.argv.slice(2);
if (!tree) {
  process.stderr.write('usage: node kimi-agree.mjs <tree> [--kimi-root DIR]\n');
  process.exit(2);
}
const kimiRoot = rest[0] === '--kimi-root' && rest[1] ? rest[1] : null;
const run = (rel, argv) => {
  const file = join(tree, rel);
  if (!existsSync(file)) {
    process.stderr.write(`missing ${file}\n`);
    process.exit(2);
  }
  return spawnSync(process.execPath, [file, ...argv], { cwd: tree, encoding: 'utf8', timeout: 600_000 });
};

const census = run('scripts/kimi-census.mjs', kimiRoot ? ['--kimi-root', kimiRoot] : []);
const proxy = run('scripts/proxy-check.mjs', []);
if (census.error || proxy.error) {
  process.stderr.write(`run failed: ${census.error ?? proxy.error}\n`);
  process.exit(2);
}

const missing = [...census.stdout.matchAll(/^CENSUS\s+error\s+MEMBER_MISSING\s+(\S+)/gmu)].map((m) => m[1]);
const term = (kind) => {
  const m = new RegExp(`^PROXY\\s+error\\s+${kind}\\s+\\w+: declared=(\\d+) computed=(\\d+) delta=([+-]?\\d+)`, 'mu')
    .exec(proxy.stdout);
  return m === null ? null : { declared: Number(m[1]), computed: Number(m[2]), delta: Number(m[3]) };
};
const km = term('K_MEMBERS_DRIFT');
const ks = term('K_SECTIONS_DRIFT');

const fails = [];
if (missing.length > 0 && census.status !== 1) fails.push(`census exit=${census.status} with ${missing.length} MEMBER_MISSING (want 1)`);
if (missing.length === 0 && census.status !== 0) fails.push(`census exit=${census.status} with no MEMBER_MISSING (want 0)`);
if (missing.length === 0) {
  if (km !== null || ks !== null) fails.push('proxy reports K drift while the census names no missing member');
  if (proxy.status !== 0 && km === null && ks === null) fails.push(`proxy exit=${proxy.status} without a K finding`);
} else {
  if (km === null) fails.push(`proxy is silent about K_members while the census names ${missing.length}: ${missing.join(', ')}`);
  if (ks === null) fails.push(`proxy is silent about K_sections while the census names ${missing.length}`);
  if (km !== null) {
    if (km.declared - km.computed !== missing.length) fails.push(`K_members shortfall ${km.declared - km.computed} != ${missing.length} named members`);
    if (km.delta !== -missing.length) fails.push(`K_members delta=${km.delta} != -${missing.length}`);
  }
  if (ks !== null && km !== null && ks.delta !== km.delta) fails.push(`K_sections delta=${ks.delta} != K_members delta=${km.delta}`);
  if (ks !== null && ks.declared - ks.computed !== missing.length) fails.push(`K_sections shortfall ${ks.declared - ks.computed} != ${missing.length} named members`);
}

if (fails.length > 0) {
  process.stdout.write(`KIMI_AGREE: DISAGREE members_missing=${missing.length} [${missing.join(', ')}] `
    + `K_members=${km === null ? 'silent' : `${km.declared}/${km.computed} delta=${km.delta}`} `
    + `K_sections=${ks === null ? 'silent' : `${ks.declared}/${ks.computed} delta=${ks.delta}`}\n`);
  for (const f of fails) process.stdout.write(`  - ${f}\n`);
  process.exit(1);
}
process.stdout.write(`KIMI_AGREE: AGREE members_missing=${missing.length} [${missing.join(', ')}] `
  + `K_members=${km === null ? 'clean' : `${km.declared}/${km.computed} delta=${km.delta}`} `
  + `K_sections=${ks === null ? 'clean' : `${ks.declared}/${ks.computed} delta=${ks.delta}`}\n`);
process.exit(0);
