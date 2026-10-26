// matrix.mjs — run the shipped tool and the proposed v3 structure arms over (a) the 24 real fleet reports
// rounds 40..63 and (b) the forge fixtures, and print one line per report.
//   node matrix.mjs <reports-dir> <fixtures-dir>
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { structureArms } from './structure-arms.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const FLEET = '/home/vgpnk/Projects/shokunin';
const REV = '2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8';
const TOOL = join(LANE, 'scripts/report-receipt-diff.mjs');
const [reportsDir, fixturesDir] = process.argv.slice(2);

const unfence = (text) => {
  let fenced = false;
  return text.split('\n').map((l) => {
    if (/^\s*(?:```|~~~)/.test(l)) { fenced = !fenced; return ''; }
    return fenced ? '' : l;
  }).join('\n');
};
const ids = (out) => [...new Set(out.split('\n').filter((l) => /^[A-Z_]+ /.test(l) && !l.startsWith('REPORT_RECEIPT')).map((l) => l.split(' ')[0]))].sort().join(',');

function runTool(file, round) {
  const r = spawnSync('node', [TOOL, '--lane', LANE, '--round', String(round), '--report', file, '--rev', REV, '--fleet', FLEET], { encoding: 'utf8' });
  return { status: r.status, verdict: r.stdout.startsWith('REPORT_RECEIPT: CLEAN') ? 'CLEAN' : ids(r.stdout) };
}

let bad = 0;
console.log('kind report            round tool(status)      arms(ids)');
for (const f of readdirSync(reportsDir).filter((n) => /^r\d+\.md$/.test(n)).sort((a, b) => Number(a.slice(1, -3)) - Number(b.slice(1, -3)))) {
  const round = Number(f.slice(1, -3));
  const text = readFileSync(join(reportsDir, f), 'utf8');
  const t = runTool(join(reportsDir, f), round);
  const arms = structureArms(text, { prose: unfence(text), round });
  const armIds = [...new Set(arms.map((a) => a.id))].join(',');
  console.log(`real ${f.padEnd(20)} ${String(round).padStart(3)}  ${`${t.status}/${t.verdict}`.padEnd(19)} ${armIds || 'CLEAN'}`);
  if (round === 63 && armIds) { console.log('  !! round 63 must read CLEAN under the arms'); bad += 1; }
  for (const a of arms) console.log(`       ${a.id} ${a.detail}`);
}
for (const f of readdirSync(fixturesDir).filter((n) => n.endsWith('.md')).sort()) {
  const text = readFileSync(join(fixturesDir, f), 'utf8');
  const round = 64;
  const t = runTool(join(fixturesDir, f), round);
  const arms = structureArms(text, { prose: unfence(text), round });
  const armIds = [...new Set(arms.map((a) => a.id))].join(',');
  console.log(`fix  ${f.padEnd(20)} ${String(round).padStart(3)}  ${`${t.status}/${t.verdict}`.padEnd(19)} ${armIds || 'CLEAN'}`);
  if (f.startsWith('fx-honest') && (armIds || t.status !== 0)) { console.log('  !! honest fixture must read CLEAN under both'); bad += 1; }
}
console.log(bad ? `MATRIX: FAIL (${bad} invariant breaks)` : 'MATRIX: OK (r63 and the honest fixture read CLEAN under the arms)');
process.exit(bad ? 1 : 0);
