#!/usr/bin/env node
// Reproduces the frozen omp65-probe.mjs O7 `named` predicate against a PROVINCE.md copy with the entry path
// appended to the *isolation* band line (a wrong band). Prints NAMED if O7 would pass.
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
const ENTRY = 'corpus/knowledge/omp-installed-release-mcp-runtime.md';
const src = process.argv[2] || '/home/vgpnk/Projects/shokunin/kumitate-shokunin/PROVINCE.md';
const tmp = '/tmp/kumitate-r65/K65CriticC2Scope/province-wrong-band.md';
copyFileSync(src, tmp);
writeFileSync(tmp, readFileSync(tmp, 'utf8') + `\n- Isolation substrates for parallel agents — band note advanced by \`${ENTRY}\`\n`);
const lines = readFileSync(tmp, 'utf8').split('\n');
const hit = lines.find((l) => l.includes(ENTRY) && /frontier|band|ground|first entry|advanced/i.test(l));
if (hit) { console.log('O7-named-by:', hit.trim().slice(0, 140)); console.log('NAMED (O7 would pass on a wrong band)'); }
else { console.log('NOT-NAMED'); process.exit(1); }
