#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const lane = resolve('/home/vgpnk/Projects/shokunin/kumitate-shokunin');
const wavesDir = join(lane, '.ufo', 'waves');

function sha(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function gitShow(rev, rel) {
  const g = spawnSync('git', ['-C', lane, 'show', `${rev}:${rel}`], { maxBuffer: 64 << 20 });
  return g.status === 0 ? g.stdout : null;
}

const rounds = [];
for (let r = 74; r <= 86; r++) {
  rounds.push(r);
}

let totalReceipts = 0;
let bound = 0;
let mismatch = 0;
let unresolved = 0;
let noCmd = 0;
let noSha = 0;

const details = [];

for (const r of rounds) {
  const closeDir = join(wavesDir, `round-${r}`, 'close');
  if (!existsSync(closeDir)) continue;
  const files = readdirSync(closeDir).filter(f => f.endsWith('.txt')).sort();
  for (const f of files) {
    totalReceipts++;
    const fullPath = join(closeDir, f);
    const content = readFileSync(fullPath, 'utf8');

    const revMatch = content.match(/^rev=([a-f0-9]{40})$/m);
    const toolShaMatch = content.match(/^tool_sha256=([a-f0-9]{64})$/m);
    const cmdMatch = content.match(/^cmd=(.+)$/m);

    const rev = revMatch ? revMatch[1] : null;
    const toolSha = toolShaMatch ? toolShaMatch[1] : null;
    const cmd = cmdMatch ? cmdMatch[1].trim() : null;

    if (!cmd) {
      noCmd++;
      details.push({ round: r, file: f, status: 'NO_CMD', reason: 'no cmd=' });
      continue;
    }

    if (!toolSha) {
      noSha++;
      details.push({ round: r, file: f, status: 'NO_SHA', reason: 'cmd present but no tool_sha256=' });
      continue;
    }

    // Both cmd and toolSha are present
    const toks = cmd.split(/\s+/);
    if (toks.length < 2) {
      unresolved++;
      details.push({ round: r, file: f, status: 'UNRESOLVED', reason: 'cannot extract instrument from cmd' });
      continue;
    }

    const rawInstrument = toks[1];
    let instrumentBytes = null;

    if (rawInstrument.startsWith('/')) {
      if (rawInstrument.startsWith(lane + '/')) {
        const rel = relative(lane, rawInstrument);
        instrumentBytes = rev ? gitShow(rev, rel) : null;
      } else {
        // External file
        if (existsSync(rawInstrument)) {
          instrumentBytes = readFileSync(rawInstrument);
        }
      }
    } else {
      instrumentBytes = rev ? gitShow(rev, rawInstrument) : null;
    }

    if (!instrumentBytes) {
      unresolved++;
      details.push({ round: r, file: f, status: 'UNRESOLVED', reason: `instrument ${rawInstrument} not found at rev ${rev}` });
      continue;
    }

    const actualSha = sha(instrumentBytes);
    if (actualSha === toolSha) {
      bound++;
      details.push({ round: r, file: f, status: 'BOUND', instrument: rawInstrument, sha: actualSha });
    } else {
      mismatch++;
      details.push({ round: r, file: f, status: 'MISMATCH', instrument: rawInstrument, actualSha, expectedSha: toolSha });
    }
  }
}

// Canonical one-line summary
console.log(`receipts=${totalReceipts} bound=${bound} mismatch=${mismatch} unresolved=${unresolved} no_cmd=${noCmd + noSha}`);

if (process.argv.includes('--breakdown')) {
  console.log(`breakdown: total=${totalReceipts} bound=${bound} mismatch=${mismatch} unresolved=${unresolved} strictly_no_cmd=${noCmd} cmd_without_sha=${noSha}`);
}

if (process.argv.includes('--dump')) {
  for (const d of details) {
    console.log(`round-${d.round} | ${d.file} | ${d.status} | ${d.reason || d.instrument || ''} | ${d.actualSha ? d.actualSha.slice(0, 12) + ' vs ' + d.expectedSha.slice(0, 12) : ''}`);
  }
}
