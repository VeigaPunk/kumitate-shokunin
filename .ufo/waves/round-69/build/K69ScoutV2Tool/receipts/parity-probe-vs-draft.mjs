import { readFileSync } from 'node:fs';
import { routedSections } from './routed-ledger-v2.mjs';
const probe = readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/ledger69-probe.mjs','utf8');
const a = probe.indexOf('function items67');
const b = probe.indexOf('const spotPath');
if (a < 0 || b < 0 || b <= a) { console.log('EXTRACT-FAIL'); process.exit(1); }
const items67 = new Function(probe.slice(a,b) + '\nreturn items67;')();
let tp=0, td=0, sp=0, sd=0; const diffs=[];
for (let n=55;n<=66;n++){
  const t = readFileSync(`/fast/scratch/hyaku/kumitate-r69/K69ScoutV2Tool/realtree/corpus/lessons/round-${n}-verifier-spotcheck.md`,'utf8');
  const P = items67(t), D = routedSections(t);
  tp += P.items.length; td += D.items.length; sp += P.sections.length; sd += D.sections;
  if (JSON.stringify(P.items) !== JSON.stringify(D.items)) diffs.push({round:n, pi:P.items.length, di:D.items.length});
}
console.log(JSON.stringify({probeItems:tp, draftItems:td, probeSections:sp, draftSections:sd, itemTextDiffs:diffs}));
