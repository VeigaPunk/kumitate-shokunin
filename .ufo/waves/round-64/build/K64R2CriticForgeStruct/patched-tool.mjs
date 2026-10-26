// patched-tool.mjs — the v2 tool plus the proposed v3 structure arms, same CLI contract and render format.
// Used to prove what P5 of probe/receipt64-probe.mjs would read once the arms land: P5 runs the archived tool,
// so the arms are the only place a hollow "round-64 report" can be made to fail without touching the frozen probe.
//   node patched-tool.mjs --lane DIR --round N --report FILE [--rev REV] [--fleet DIR]
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { diffReport } from '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs';
import { structureArms } from './structure-arms.mjs';

const argv = process.argv.slice(2).flatMap((a) => (/^--[a-z]+=/.test(a) ? [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)] : [a]));
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const lane = opt('--lane'); const round = opt('--round'); const report = opt('--report');
if (!lane || !round || !report || !/^\d+$/.test(round)) { process.stderr.write('usage: patched-tool.mjs --lane DIR --round N --report FILE [--rev REV] [--fleet DIR]\n'); process.exit(64); }
const laneAbs = resolve(lane);
let rev = opt('--rev');
if (rev) {
  const rv = spawnSync('git', ['-C', laneAbs, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
  if (rv.status !== 0) { process.stdout.write(`REPORT_RECEIPT: FAIL-CLOSED rev-unreadable ${rev}\n`); process.exit(2); }
  rev = rv.stdout.trim();
}
let text;
try { text = readFileSync(resolve(report), 'utf8'); } catch { process.stdout.write(`REPORT_RECEIPT: FAIL-CLOSED report-unreadable ${report}\n`); process.exit(2); }
const fleet = opt('--fleet') ? resolve(opt('--fleet')) : (existsSync(resolve(dirname(laneAbs), '.git')) ? dirname(laneAbs) : null);
const unfence = (s) => {
  let fenced = false;
  return s.split('\n').map((l) => { if (/^\s*(?:```|~~~)/.test(l)) { fenced = !fenced; return ''; } return fenced ? '' : l; }).join('\n');
};
const findings = [
  ...diffReport({ lane: laneAbs, round, reportText: text, rev, fleet }),
  ...structureArms(text, { prose: unfence(text), round: Number(round) }),
];
const meta = `round=${round} rev=${rev || 'worktree'} bytes=${Buffer.byteLength(text)}`;
if (!findings.length) { process.stdout.write(`REPORT_RECEIPT: CLEAN (${meta})\n`); process.exit(0); }
const ids = [...new Set(findings.map((f) => f.id))].join(',');
process.stdout.write(`REPORT_RECEIPT: DRIFT ${ids} (${meta})\n${findings.map((f) => `${f.id} ${f.detail}`).join('\n')}\n`);
process.exit(1);
