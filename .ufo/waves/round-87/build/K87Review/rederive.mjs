#!/usr/bin/env node
// K87Review — independent re-derivation of the round-86 close receipts.
// For each receipt: parse rev=, tool_sha256=, cmd=; instrument = 2nd whitespace token of cmd;
// resolve lane-relative / lane-absolute under LANE -> git show <rev>:<rel>; else disk bytes.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const dir = process.argv[2];
const fallbackRev = process.argv[3] || '';
const sha = (b) => createHash('sha256').update(b).digest('hex');

const rows = [];
for (const f of readdirSync(dir).filter((x) => x.endsWith('.txt')).sort()) {
  const text = readFileSync(join(dir, f), 'utf8');
  const one = (k) => (text.match(new RegExp(`^${k}=(.*)$`, 'm')) || [, ''])[1].trim();
  const rev = one('rev') || fallbackRev;
  const claimed = one('tool_sha256');
  const cmd = one('cmd');
  const toks = cmd.split(/\s+/).filter(Boolean);
  const inst = toks[1] || '';
  let kind = 'none', actual = null, rel = '';
  if (inst) {
    const abs = inst.startsWith('/') ? resolve(inst) : resolve(LANE, inst);
    if (abs === LANE || abs.startsWith(LANE + '/')) {
      rel = abs.slice(LANE.length + 1);
      const g = spawnSync('git', ['-C', LANE, 'show', `${rev}:${rel}`], { maxBuffer: 64 << 20 });
      if (g.status === 0) { kind = 'git'; actual = sha(g.stdout); }
      else kind = 'git-missing';
    } else if (existsSync(abs)) { kind = 'external'; rel = abs; actual = sha(readFileSync(abs)); }
    else kind = 'external-missing';
  }
  const verdict = !cmd ? 'UNCHECKED' : !actual ? 'UNRESOLVED' : actual === claimed ? 'MATCH' : 'MISMATCH';
  rows.push({ f, rev, cmd, inst, kind, rel, claimed, actual, verdict });
}
const n = (v) => rows.filter((r) => r.verdict === v).length;
for (const r of rows) {
  console.log(`${r.f}\t${r.verdict}\tkind=${r.kind}\tinst=${r.inst || '-'}\trev=${r.rev}\n  claimed=${r.claimed}\n  actual =${r.actual}`);
}
console.log(`SUMMARY dir=${dir} total=${rows.length} matched=${n('MATCH')} mismatched=${n('MISMATCH')} unchecked=${n('UNCHECKED')} unresolved=${n('UNRESOLVED')} external=${rows.filter((r) => r.kind === 'external').length}`);
