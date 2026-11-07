#!/usr/bin/env node
/**
 * selftest_scan.mjs (K100Scout, round 100) -- positive control for
 * scan_exposure.mjs: a synthetic SOURCES.md carrying one instance of every
 * exposure class must be flagged, and a clean file must not be.
 *
 * Run: node selftest_scan.mjs <path-to-scan_exposure.mjs>
 * Exits 0 when every expectation holds, 1 otherwise.
 */
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const scanner = process.argv[2];
if (!scanner) { console.error('usage: node selftest_scan.mjs <scanner.mjs>'); process.exit(2); }

const D = mkdtempSync(join(tmpdir(), 'k100scan.'));
const rows = [];
const clean = [];
let n = 100;
const id = () => 'S' + (n++).toString().padStart(3, '0');
const CELL = (i) => `| ${id()} | https://e.com/${i} | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`;

// --- clean rows ----------------------------------------------------------
for (let i = 0; i < 3; i++) clean.push(CELL('clean' + i));
clean.push(`|   ${id()}   | https://e.com/blank-sp | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);
clean.push(`|\t${id()}\t| https://e.com/blank-tab | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);

// --- class (iii): non-blank pad in the id cell --------------------------
const PAD_CLASSES = [
  ['nbsp', ' '], ['vt', ''], ['ff', ''], ['nel', ''],
  ['u2028', ' '], ['u2029', ' '], ['feff', '﻿'],
  ['u2003', ' '], ['u3000', '　'],
];
for (const [label, ch] of PAD_CLASSES) {
  rows.push(`|${ch}${id()}${ch}| https://e.com/pad-${label} | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);
}

// --- class (ii): id row indented with anything but 0-3 ASCII SP ---------
rows.push(`    | ${id()} | https://e.com/indent-4sp | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);
rows.push(`\t| ${id()} | https://e.com/indent-tab | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);
rows.push(` | ${id()} | https://e.com/indent-nbsp | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);
rows.push(`　| ${id()} | https://e.com/indent-u3000 | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);

// --- class (i): same-record breaks (CR / LS / PS / NEL) ------------------
rows.push(`text\r| ${id()} | https://e.com/brk-cr | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);
rows.push(`text | ${id()} | https://e.com/brk-ls | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);
rows.push(`text | ${id()} | https://e.com/brk-ps | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);
rows.push(`text| ${id()} | https://e.com/brk-nel | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |`);

// --- CRLF row ------------------------------------------------------------
rows.push(`| ${id()} | https://e.com/crlf | docs | A | s | a | teaches | mined | 2026-01-01 | 90d | — |\r`);

const body = (rowsArr) =>
  ['# SOURCES', '', '## Registry', '',
   '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
   '|---|---|---|---|---|---|---|---|---|---|---|', ...rowsArr, ''].join('\n');

const dirtyPath = join(D, 'dirty.md');
const cleanPath = join(D, 'clean.md');
writeFileSync(dirtyPath, body(rows), 'utf8');
writeFileSync(cleanPath, body(clean), 'utf8');

const out = JSON.parse(execFileSync(process.execPath, [scanner, dirtyPath, cleanPath],
                                    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
const dirty = out.files.find((f) => f.file === dirtyPath);
const cln = out.files.find((f) => f.file === cleanPath);

const checks = [];
const ck = (name, cond, detail) => checks.push({ name, ok: !!cond, detail: detail ?? '' });

ck('dirty: class (i) breaker chars detected', dirty.breakers.length >= 5, `${dirty.breakers.length}`);
ck('dirty: class (ii) bad indent detected', dirty.badIndent.length >= 4, `${dirty.badIndent.length}`);
ck('dirty: class (iii) non-blank pad detected', dirty.nonBlankPad.length >= 9, `${dirty.nonBlankPad.length}`);
ck('dirty: capture sees rows the census does not (captureOnly > 0)',
   dirty.divergence.captureOnly.length > 0, dirty.divergence.captureOnly.join(','));
ck('dirty: cite sees rows the census does not (citeOnly > 0)',
   dirty.divergence.citeOnly.length > 0, dirty.divergence.citeOnly.join(','));
ck('dirty: capture row found inside an LF record (intra-record)',
   dirty.intraRecordRows.length >= 3, `${dirty.intraRecordRows.length}`);
ck('clean: no breakers', cln.breakers.length === 0, `${cln.breakers.length}`);
ck('clean: no bad indent', cln.badIndent.length === 0, `${cln.badIndent.length}`);
ck('clean: no non-blank pad', cln.nonBlankPad.length === 0, `${cln.nonBlankPad.length}`);
ck('clean: no reader/census divergence',
   cln.divergence.citeOnly.length === 0 && cln.divergence.captureOnly.length === 0,
   JSON.stringify(cln.divergence));
ck('clean: census sees every clean row', cln.censusRows === 5, `${cln.censusRows}`);

let bad = 0;
for (const c of checks) {
  if (!c.ok) bad++;
  console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}  ${c.detail}`);
}
console.log(`dirty breakdown: breakers=${dirty.breakers.length} badIndent=${dirty.badIndent.length} nonBlankPad=${dirty.nonBlankPad.length} captureOnly=${dirty.divergence.captureOnly.length} citeOnly=${dirty.divergence.citeOnly.length} intraRecord=${dirty.intraRecordRows.length}`);
rmSync(D, { recursive: true, force: true });
process.exit(bad === 0 ? 0 : 1);
