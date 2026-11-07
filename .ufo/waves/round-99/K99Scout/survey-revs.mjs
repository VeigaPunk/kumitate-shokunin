#!/usr/bin/env node
// K99Scout driver: survey every committed revision of the lane's corpus/SOURCES.md.
// Input: rev-blobs.txt lines "<rev> <blob>". Output: TSV of offending cells.
import { readFileSync, writeFileSync } from 'node:fs';
import { survey } from './pad-survey.mjs';

const [, , revBlobFile, revDir, outFile] = process.argv;
const lines = readFileSync(revBlobFile, 'utf8').split('\n').filter((l) => l.trim() !== '');
const byBlob = new Map();
for (const line of lines) {
  const [rev, blob] = line.trim().split(/\s+/);
  if (!byBlob.has(blob)) byBlob.set(blob, []);
  byBlob.get(blob).push(rev);
}

const rows = [];
let totalRevs = 0;
const classes = new Set();
let totalAsciiPadCells = 0;
let totalOffendingRows = 0;
for (const [blob, revs] of byBlob) {
  totalRevs += revs.length;
  const text = readFileSync(`${revDir}/blob-${blob}.md`, 'utf8');
  const r = survey(`blob:${blob.slice(0, 12)}`, text);
  totalAsciiPadCells += r.asciiPadCells;
  totalOffendingRows += r.offendingRows;
  for (const c of r.asciiPadClasses) classes.add(c);
  for (const hit of r.out) {
    rows.push({ blob, revs, ...hit });
  }
}

const out = [];
for (const r of rows) {
  out.push([
    r.blob, r.revs.length, r.revs.join(','), r.line, r.cell, `cell${r.cellIndex}`,
    JSON.stringify(r.id), r.lead || '-', r.trail || '-', `fields=${r.fields}`,
  ].join('\t'));
}
writeFileSync(outFile, out.join('\n') + (out.length ? '\n' : ''));
process.stderr.write([
  `revisions=${totalRevs}`,
  `distinctBlobs=${byBlob.size}`,
  `offendingRows=${totalOffendingRows}`,
  `offendingCells=${rows.length}`,
  `asciiPadCells=${totalAsciiPadCells}`,
  `asciiPadClasses=${JSON.stringify([...classes].sort())}`,
].join('\t') + '\n');
