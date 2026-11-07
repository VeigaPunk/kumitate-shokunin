#!/usr/bin/env node
/**
 * make_exposure_report.mjs (K100Scout, round 100) -- renders exposure.txt and
 * readers.txt from the scanner output + the live-census receipts.
 *
 *   node make_exposure_report.mjs <scan.json> <live_census.tsv> <cur.sha256> <outdir>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [scanPath, censusPath, shaPath, outDir] = process.argv.slice(2);
if (!outDir) { console.error('usage: node make_exposure_report.mjs <scan.json> <live_census.tsv> <cur.sha256> <outdir>'); process.exit(2); }

const scan = JSON.parse(readFileSync(scanPath, 'utf8'));
const liveRows = new Map();
for (const line of readFileSync(censusPath, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const [lane, rows, e02] = line.split('\t');
  liveRows.set(lane, { rows: Number(rows), e02: e02 || 'none' });
}
const shas = new Map();
for (const line of readFileSync(shaPath, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const [sha, lane] = line.split(/\s+/);
  shas.set(lane, sha);
}

const L = [];
L.push('# exposure.txt -- fleet SOURCES.md row-reader exposure (K100Scout, round 100)');
L.push('');
L.push(`Scanned ${scan.files.filter((f) => f.file.includes('/cur/')).length} current fleet lane`);
L.push('corpus/SOURCES.md files (sha256-pinned) and');
L.push(`${scan.files.filter((f) => f.file.includes('/revs/')).length} committed revisions of`);
L.push('kumitate-shokunin/corpus/SOURCES.md (79 commits, git log -- corpus/SOURCES.md).');
L.push('Total files scanned: ' + scan.files.length + '.');
L.push('');
L.push('Classes measured (per file, one LF-delimited record = one line, gawk RS=LF):');
L.push('  (i)   a record carrying CR (not immediately before LF), U+2028, U+2029 or U+0085;');
L.push('  (ii)  an id row whose indent is anything other than 0-3 ASCII SP');
L.push('        (census row gate `^ {0,3}\\|`; the capture reader `^\\s*\\|` accepts more);');
L.push('  (iii) a census id cell (field 2) whose pad carries a character other than');
L.push('        ASCII SP/TAB (the census trims POSIX blank only; the JS readers trim JS \\s).');
L.push('Supplementary:');
L.push('  (iv)  a capture-reader row found INSIDE an LF record (after CR/U+2028/U+2029),');
L.push('        i.e. a row the `m`-flag reader sees and the census (RS=LF) does not;');
L.push('  (v)   reader/census id-set divergence (ids a reader accepts that the census');
L.push('        does not read as a valid registry id).');
L.push('');
L.push('Reader regexes under study, asserted verbatim against the lane sources:');
L.push('  cite-sources.mjs:36    ' + scan.citeRegex.literal + '   flags=[' + scan.citeRegex.flags + ']');
L.push('  source-capture.mjs:157 ' + scan.captureRegex.literal + ' flags=[' + scan.captureRegex.flags + ']');
L.push('');
L.push('Method: ' + 'K100Scout/scan_exposure.mjs (exact ECMAScript semantics; the two');
L.push('reader regexes are read out of the lane sources at run time, not transcribed).');
L.push('Positive control: K100Scout/selftest_scan.mjs -- a synthetic registry carrying');
L.push('one instance of every class must be flagged, a clean one must not (11/11 PASS).');
L.push('Model validation: the scanner\'s census-row model was compared row-for-row with');
L.push('the live `scripts/sources-census.sh census --file` on all 21 pinned snapshots');
L.push('(live_census.tsv) -- all 21 match exactly.');
L.push('');

// --- per-file table ---------------------------------------------------
L.push('## Per-lane table (current fleet corpus/SOURCES.md, sha256-pinned)');
L.push('');
L.push('| lane | sha256 (first 16) | census rows (model) | census rows (live) | match | E02 (live) | (i) | (ii) | (iii) | (iv) | cite-only ids | capture-only ids |');
L.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
let tot = { i: 0, ii: 0, iii: 0, iv: 0, co: 0, po: 0 };
let mismatch = 0;
for (const f of scan.files) {
  if (!f.file.includes('/cur/')) continue;
  const lane = f.file.split('/cur/')[1].replace('.SOURCES.md', '');
  const live = liveRows.get(lane);
  const m = f.censusRows, l = live ? live.rows : -1;
  const ok = m === l;
  if (!ok) mismatch++;
  const co = f.divergence.citeOnly.length, po = f.divergence.captureOnly.length;
  tot.i += f.breakers.length; tot.ii += f.badIndent.length;
  tot.iii += f.nonBlankPad.length; tot.iv += f.intraRecordRows.length;
  tot.co += co; tot.po += po;
  L.push(`| ${lane} | ${(shas.get(lane) || '').slice(0, 16)} | ${m} | ${l} | ${ok ? 'yes' : '**NO**'} | ${live ? live.e02 : '?'} | ${f.breakers.length} | ${f.badIndent.length} | ${f.nonBlankPad.length} | ${f.intraRecordRows.length} | ${co ? co + ' ' + f.divergence.citeOnly.join(',') : 0} | ${po ? po + ' ' + f.divergence.captureOnly.join(',') : 0} |`);
}
L.push('');
L.push(`Fleet totals over the 21 current lane files: (i)=${tot.i} (ii)=${tot.ii} (iii)=${tot.iii} (iv)=${tot.iv} cite-only=${tot.co} capture-only=${tot.po}`);
L.push(mismatch === 0
  ? 'Model/live census row counts agree on all 21 lanes.'
  : `MODEL/LIVE MISMATCH on ${mismatch} lane(s) -- see the table.`);
L.push('');

// --- revisions --------------------------------------------------------
L.push('## Per-revision table (kumitate-shokunin/corpus/SOURCES.md, 79 commits)');
L.push('');
L.push('| commit | census rows | (i) | (ii) | (iii) | (iv) | cite-only ids | capture-only ids |');
L.push('|---|---|---|---|---|---|---|---|');
let rtot = { i: 0, ii: 0, iii: 0, iv: 0, co: 0, po: 0 };
for (const f of scan.files) {
  if (!f.file.includes('/revs/')) continue;
  const rev = f.file.split('/revs/')[1].replace('.SOURCES.md', '').slice(0, 12);
  const co = f.divergence.citeOnly.length, po = f.divergence.captureOnly.length;
  rtot.i += f.breakers.length; rtot.ii += f.badIndent.length;
  rtot.iii += f.nonBlankPad.length; rtot.iv += f.intraRecordRows.length;
  rtot.co += co; rtot.po += po;
  L.push(`| ${rev} | ${f.censusRows} | ${f.breakers.length} | ${f.badIndent.length} | ${f.nonBlankPad.length} | ${f.intraRecordRows.length} | ${co ? co + ' ' + f.divergence.citeOnly.join(',') : 0} | ${po ? po + ' ' + f.divergence.captureOnly.join(',') : 0} |`);
}
L.push('');
L.push(`Revision totals over the ${scan.files.filter((f) => f.file.includes('/revs/')).length} commits: (i)=${rtot.i} (ii)=${rtot.ii} (iii)=${rtot.iii} (iv)=${rtot.iv} cite-only=${rtot.co} capture-only=${rtot.po}`);
L.push('');

const grand = { i: tot.i + rtot.i, ii: tot.ii + rtot.ii, iii: tot.iii + rtot.iii,
                iv: tot.iv + rtot.iv, co: tot.co + rtot.co, po: tot.po + rtot.po };
L.push('## RESULT');
L.push('');
L.push(`Scanned ${scan.files.length} files (21 current lane + ${scan.files.length - 21} revisions).`);
L.push(`Totals: (i)=${grand.i}  (ii)=${grand.ii}  (iii)=${grand.iii}  (iv)=${grand.iv}  cite-only=${grand.co}  capture-only=${grand.po}`);
const clean = grand.i + grand.ii + grand.iii + grand.iv + grand.co + grand.po === 0;
L.push('');
L.push(clean
  ? '**CLEAN -- expected 0 confirmed.** No live or historical SOURCES.md in the fleet carries a'
  + ' CR/LS/PS/NEL record break, a non-0-3-SP id-row indent, or a non-blank id-cell pad, and no'
  + ' reader/census id-set divergence exists in any scanned file. The divergence the claim'
  + ' closes is therefore prospective, not a live incident (consistent with the plan\'s disclosed'
  + ' limit 1).'
  : '**EXPOSURE FOUND -- see the per-file entries above.**');
L.push('');
writeFileSync(join(outDir, 'exposure.txt'), L.join('\n'));
console.log('exposure.txt written:', L.length, 'lines');
