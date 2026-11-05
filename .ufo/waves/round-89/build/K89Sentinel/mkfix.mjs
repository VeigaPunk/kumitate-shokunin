#!/usr/bin/env node
// mkfix.mjs — the smallest remediation for the R6/X3 finding, as a patch of the CANDIDATE:
// realpath may PROMOTE a lexically-outside token into the lane, never DEMOTE a lexically-in-lane
// token to "external" (which is what turns a committed mode-120000 lane instrument into a
// disk-hashed external read). Everything else is the candidate, byte for byte.
//   node mkfix.mjs <candidate.mjs> <outdir>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const CAND = process.argv[2];
const OUT = process.argv[3];
if (!CAND || !OUT) { console.error('usage: mkfix.mjs <candidate.mjs> <outdir>'); process.exit(64); }
const src = readFileSync(CAND, 'utf8');
const sha = (b) => createHash('sha256').update(b).digest('hex');

const FROM = `    if (isAbsolute(instrument)) {
      abs = resolve(instrument);
      // Membership on REAL paths (v3): an alias such as /proc/self/root<lane> is IN the lane even
      // though it is lexically outside it. A token that cannot be resolved keeps its lexical form.
      let absReal = abs;
      try { absReal = realpathSync(abs); } catch { /* absent on disk: the blob read decides */ }
      const lr = laneRel(laneReal, absReal);
      if (lr.root) throw new FailClosed('UNRESOLVED', \`\${file} instrument names the lane root: \${instrument}\`);
      if (lr.inside) rel = lr.rel; else fromDisk = true;
    } else {`;

const TO = `    if (isAbsolute(instrument)) {
      abs = resolve(instrument);
      // Membership on REAL paths (v3): an alias such as /proc/self/root<lane> is IN the lane even
      // though it is lexically outside it. A token that cannot be resolved keeps its lexical form.
      // REALPATH MAY ONLY PROMOTE: a lexically in-lane token keeps its committed path, so a
      // committed mode-120000 instrument is judged at the rev instead of being demoted to an
      // external disk read through its target.
      const lex = laneRel(lane, abs);
      if (lex.root) throw new FailClosed('UNRESOLVED', \`\${file} instrument names the lane root: \${instrument}\`);
      if (lex.inside) {
        rel = lex.rel;
      } else {
        let absReal = abs;
        try { absReal = realpathSync(abs); } catch { /* absent on disk: the blob read decides */ }
        const lr = laneRel(laneReal, absReal);
        if (lr.root) throw new FailClosed('UNRESOLVED', \`\${file} instrument resolves to the lane root: \${instrument}\`);
        if (lr.inside) rel = lr.rel; else fromDisk = true;
      }
    } else {`;

const n = src.split(FROM).length - 1;
if (n !== 1) { console.error(`anchor matched ${n} times`); process.exit(2); }
const fixed = src.replace(FROM, TO);
writeFileSync(join(OUT, 'fix-a-lexical-inlane.mjs'), fixed);
console.log(`cand sha256=${sha(src)}`);
console.log(`fix  sha256=${sha(fixed)} bytes=${fixed.length}`);
