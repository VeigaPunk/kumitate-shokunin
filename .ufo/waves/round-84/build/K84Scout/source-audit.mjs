import {execFileSync} from 'node:child_process';
const lane='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const revision='3794b903324e7eb4aec6d92539f2ca4e2c0b6727';
const get=(path,rev=revision)=>execFileSync('git',['-C',lane,'show',`${rev}:${path}`],{encoding:'utf8'});
const plan=get('.ufo/waves/round-84/plan.md');
const probe=get('.ufo/waves/round-84/probe/probe84-c1.mjs');
const names=[...probe.matchAll(/^ \['([^']+)',/gm)].map(m=>m[1]);
const roster=plan.match(/Counter arms: ([\s\S]*?)\n\n/)[1].replace(/\n/g,' ').replace(/\.$/,'').split(/;\s*/);
const count=(text,quote)=>text.split(quote).length-1;
const old=get('.ufo/waves/round-83/probe/probe83-c1.mjs','d5fc2c94');
console.log(`rev=${revision}`);
console.log('command=node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Scout/source-audit.mjs');
console.log(JSON.stringify({node:process.version,names,planNames:roster,exactOrder:JSON.stringify(names)===JSON.stringify(roster),count:names.length,sourceQuote:{text:'const ARMS = 27;',occurrences:count(old,'const ARMS = 27;'),line:old.split('\n').findIndex(l=>l==='const ARMS = 27;')+1,words:4,armRegistrations:[...old.matchAll(/^  arm\(/gm)].length},planQuoteOccurrences:{S243:count(plan,'`const ARMS = 27;`'),S244:count(plan,'`C83_C1: HELD held=27/27`')}},null,2));
for(const path of ['round-81/close/c1-probe.txt','round-82/close/c1-probe.txt','round-82/close/c2-probe.txt','round-83/close/c1-probe.txt','round-83/close/c1-repair.txt','round-83/close/c2-probe.txt']){
 const text=get('.ufo/waves/'+path),lines=text.split(/\r?\n/),rows=lines.filter(l=>/^[A-Z][A-Z0-9_]* arm /.test(l));
 console.log(JSON.stringify({path,rows:rows.length,ok:rows.filter(l=>/ arm \S+ ok(?: |$)/.test(l)).length,PASS:rows.filter(l=>/ arm \S+ PASS(?: |$)/.test(l)).length,FAIL:rows.filter(l=>/ arm \S+ FAIL(?: |$)/.test(l)).length,summary:lines.filter(l=>/^[A-Z][A-Z0-9_]*: (HELD|UNMET) held=/.test(l)),headlineQuoteOccurrences:count(text,'C83_C1: HELD held=27/27'),headlineQuoteLine:lines.findIndex(l=>l==='C83_C1: HELD held=27/27')+1}));
}
console.log('exit=0');
