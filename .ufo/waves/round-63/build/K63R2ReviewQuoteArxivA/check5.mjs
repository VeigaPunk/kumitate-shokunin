import { readFileSync } from 'node:fs';
const raw = readFileSync('/tmp/kumitate-r63/K63R2ReviewQuoteArxivA/live.html', 'utf8');
const probe = readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/probe/topology63-probe.mjs', 'utf8');
const nm = /const norm = \(s\) =>[\s\S]*?\.trim\(\);/.exec(probe);
const norm = eval('(' + nm[0].replace(/^const norm = /, '').replace(/;\s*$/, '') + ')');
const hay = norm(raw);
const f2 = hay.lastIndexOf('Figure 2', 42762);
console.log(`Figure2 label @${f2}: ...${hay.slice(Math.max(0, f2 - 80), f2 + 340)}...`);
const cd = hay.indexOf('critical domain');
console.log(`'critical domain' -> ${cd >= 0 ? '@' + cd + ': ...' + hay.slice(Math.max(0, cd - 120), cd + 180) + '...' : 'ABSENT'}`);
const f1 = hay.indexOf('Figure 1');
console.log(`Figure1 label @${f1}: ...${hay.slice(Math.max(0, f1 - 40), f1 + 200)}...`);
// where does 'Figure 2' sit relative to Q2's caption items? and does '(a) BrowseComp-Plus' follow it?
const panels = hay.indexOf('(a) BrowseComp-Plus');
console.log(`'(a) BrowseComp-Plus' @${panels} (Q2 caption @42762): order Figure2=${f2} < panels=${panels} < Q2=${42762}: ${f2 < panels && panels < 42762}`);
