#!/usr/bin/env node
// K99Scout extra: raw codepoint scan of EVERY committed revision of EVERY fleet lane's
// corpus/SOURCES.md (the assigned scope is the kumitate lane only; this is extra evidence).
//
// For each lane: enumerate the distinct blob revisions of corpus/SOURCES.md, stream each blob
// out of git cat-file --batch, and count any codepoint that JS trim() strips but /[ \t]/ does
// not (excluding LF, which is line structure, not a cell pad).
//
// Usage: node fleet-history-scan.mjs <fleetRoot> <outFile>
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TRIM_ONLY = new Set();
for (let cp = 0; cp <= 0x10FFFF; cp += 1) {
  if (cp >= 0xD800 && cp <= 0xDFFF) continue;
  const ch = String.fromCodePoint(cp);
  if (ch.trim() !== '') continue;
  if (ch === ' ' || ch === '\t') continue;
  if (ch === '\n') continue; // line structure, not a cell pad
  TRIM_ONLY.add(ch);
}
const hex = (c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');

const [, , fleetRoot, outFile] = process.argv;
const lanes = readdirSync(fleetRoot).filter((n) => n.endsWith('-shokunin')).sort();
const report = [];
let grandBlobs = 0;
let grandHits = 0;

for (const lane of lanes) {
  const dir = join(fleetRoot, lane);
  try {
    if (!statSync(dir).isDirectory()) continue;
  } catch { continue; }
  const log = spawnSync('git', ['-C', dir, 'log', '--all', '--format=%H', '--', 'corpus/SOURCES.md'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (log.status !== 0) { report.push(`${lane}\tGIT_FAILED`); continue; }
  const revs = log.stdout.split('\n').filter((l) => l.trim() !== '');
  if (revs.length === 0) { report.push(`${lane}\tNO_REVISIONS`); continue; }
  // distinct blobs
  const blobSet = new Set();
  const revOut = spawnSync('git', ['-C', dir, 'log', '--all', '--format=%H', '--', 'corpus/SOURCES.md'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const revs2 = revOut.stdout.split('\n').filter((l) => l.trim() !== '');
  for (const r of revs2) {
    const b = spawnSync('git', ['-C', dir, 'rev-parse', `${r}:corpus/SOURCES.md`], { encoding: 'utf8' });
    if (b.status === 0 && b.stdout.trim()) blobSet.add(b.stdout.trim());
  }
  // raw scan each blob via cat-file
  const blobs = [...blobSet];
  let hits = 0;
  let nonEmpty = 0;
  for (const b of blobs) {
    const blob = spawnSync('git', ['-C', dir, 'cat-file', 'blob', b], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
    if (blob.status !== 0) continue;
    const text = blob.stdout.toString('utf8');
    if (text.trim() === '') { nonEmpty += 1; continue; }
    const counts = new Map();
    for (const ch of text) if (TRIM_ONLY.has(ch)) counts.set(ch, (counts.get(ch) ?? 0) + 1);
    if (counts.size > 0) {
      hits += 1;
      report.push(`${lane}\tHIT\t${b.slice(0, 12)}\t${[...counts].map(([c, n]) => `${hex(c)}x${n}`).join(' ')}`);
    }
  }
  grandBlobs += blobs.length;
  grandHits += hits;
  report.push(`${lane}\tSUMMARY\tcommits=${revs.length}\tdistinctBlobs=${blobs.length}\temptyBlobs=${nonEmpty}\tblobHits=${hits}`);
}

report.push(`TOTAL\tdistinctBlobs=${grandBlobs}\tblobHits=${grandHits}`);
writeFileSync(outFile, report.join('\n') + '\n');
process.stderr.write(report.join('\n') + '\n');
