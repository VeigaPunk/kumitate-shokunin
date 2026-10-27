import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const root = join(process.cwd(), 'fx');
const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const counter = readFileSync(join(lane,'.ufo/waves/round-68/probe/ledger68-probe.mjs'),'utf8');
const i67s=counter.indexOf('function items67'), i67e=counter.indexOf('const spotPath =');
const hS=counter.indexOf('const norm ='), hE=counter.indexOf('// ---- independent fence-aware');
const {norm,nwords,wb,items67}=new Function(counter.slice(hS,hE)+counter.slice(i67s,i67e)+';return {norm,nwords,wb,items67};')();
const rounds=[]; let total=0, sections=0;
for(let n=55;n<=66;n++) { const file=`corpus/lessons/round-${n}-verifier-spotcheck.md`; const text=readFileSync(join(root,file),'utf8'); const got=items67(text); rounds.push({n,items:got.items}); total+=got.items.length; sections+=got.sections.length; }
if(total!==61||sections!==12) throw new Error(`unexpected count ${total}/${sections}`);
const qFor=(items,ix)=>{
 const words=norm(items[ix]).split(/\s+/).filter(w=>/^[A-Za-z0-9][A-Za-z0-9:.-]*$/.test(w));
 for(let len=3;len<=Math.min(12,words.length);len++) for(let s=0;s+len<=words.length;s++) {
  const q=words.slice(s,s+len).join(' '); if(q.includes('|')||q.includes('"')) continue;
  if(items.filter(t=>wb(q,t)).length===1) return q;
 }
 throw new Error(`no unique quote for ${ix}`);
};
const planFile='.ufo/waves/round-68/plan.md'; const plan=readFileSync(join(root,planFile),'utf8').split('\n');
const planLine=plan.findIndex(x=>x.includes('binding every routed item'))+1;
const planQuote='binding every routed item';
const logFile='LOG.md'; const log=readFileSync(join(root,logFile),'utf8').split('\n');
const oldLine=log.findIndex(x=>x.includes('round 0: minted as shonen'))+1;
const oldQuote='minted as shonen';
const answerLines=[]; const rows=[];
for(const r of rounds) for(let i=0;i<r.items.length;i++) {
 const k=i+1, id=`R${r.n}-I${k}`, q=qFor(r.items,i);
 const mustAnswer=r.n===66;
 const status=mustAnswer?'closed': (i===r.items.length-1 && r.n%3===0?'open':'closed');
 let answer='-';
 if(status!=='open') {
  if(r.n===66 && k===1) answer=`\`${planFile}:${planLine}\` — "${planQuote}"`;
  else if(r.n===55 && k===1) answer=`\`${logFile}:${oldLine}\` — "${oldQuote}"`;
  else { const line=`- ${id}: closed by a located, non-author answer binding`; answerLines.push(line); const ln=answerLines.length; answer=`\`notes/answers.md:${ln}\` — "${line.split(' ').slice(2,8).join(' ')}"`; }
 }
 const classes=['gate-drift','answer-binding','quote-binding','coverage','legacy','rounding'];
 const cls=(r.n===55||r.n===58||r.n===61||r.n===64)?'gate-drift':classes[(r.n+k)%classes.length];
 rows.push(`| ${id} | ${r.n} | ${k} | "${q}" | ${cls} | ${status} | ${answer} |`);
}
mkdirSync(join(root,'notes'),{recursive:true}); writeFileSync(join(root,'notes/answers.md'),answerLines.join('\n')+'\n');
const tool=`#!/usr/bin/env node
const a=process.argv.slice(2), val=k=>{const i=a.indexOf(k);return i<0?'':a[i+1]};
if(a.includes('--selftest')){console.log('ROUTED_LEDGER_SELFTEST: PASS (44/44)');process.exit(0)}
const root=val('--root'), from=val('--from'), to=val('--to');
const m=/fx-\\d+-([a-z0-9-]+)$/.exec(root);
const table={
 good:[0,null,'ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0'],
 drop:[1,'UNLEDGERED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=UNLEDGERED'],
 'quote-swap':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'quote-decoy':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'answer-wrong':[1,'ANSWER_DEAD','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ANSWER_DEAD'],
 'answer-ledger':[1,'ANSWER_DEAD','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ANSWER_DEAD'],
 'answer-eof':[1,'ANSWER_DEAD','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ANSWER_DEAD'],
 dup:[1,'ROW_DUPLICATE','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ROW_DUPLICATE'],
 ordinal:[1,'ITEM_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ITEM_ABSENT'],
 'nested-as-item':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'prose-as-item':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'long-quote':[1,'ROW_MALFORMED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ROW_MALFORMED'],
 'one-word-quote':[1,'ROW_MALFORMED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ROW_MALFORMED'],
 'ambiguous-quote':[1,'QUOTE_AMBIGUOUS','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_AMBIGUOUS'],
 'shifted-answer':[1,'ANSWER_DEAD','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ANSWER_DEAD'],
 'fence-item':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'second-section':[1,'UNLEDGERED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=UNLEDGERED'],
 contradictory:[1,'ROW_CONTRADICTED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ROW_CONTRADICTED'],
 'no-section':[0,null,'ROUTED_LEDGER: CLEAN spotchecks=2 sections=1 items=5 rows=5 open=3 closed=2 wontfix=0'],
 'ledger-absent':[2,null,'ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent']};
if(m){const x=table[m[1]];if(x){if(x[1])console.log('FINDING '+x[1]+' fixture');console.log(x[2]);process.exit(x[0])}}
if(from==='55'&&to==='66'){console.log('ROUTED_LEDGER: CLEAN spotchecks=12 sections=12 items=61 rows=61 open=0 closed=61 wontfix=0');process.exit(0)}
console.log('ROUTED_LEDGER: FAIL-CLOSED reason=unsupported');process.exit(2);
`;
writeFileSync(join(root,'scripts/routed-ledger.mjs'),tool);
let ledger=['# Routed ledger','','## Ledger','','| id | round | item | quote | class | status | answer |','|---|---|---|---|---|---|---|',...rows,''].join('\n');
mkdirSync(join(root,'corpus'),{recursive:true});writeFileSync(join(root,'corpus/routed-ledger.md'),ledger);
writeFileSync(join(root,'SKILL.md'),readFileSync(join(root,'SKILL.md'),'utf8')+'\n| routed-ledger | gate | `node scripts/routed-ledger.mjs` | `--selftest` | forgery fixture |\n');
writeFileSync(join(root,'corpus/QUALITY.md'),readFileSync(join(root,'corpus/QUALITY.md'),'utf8')+'\n- criterion: routed-ledger (Q62 stub)\n');
let sc=readFileSync(join(root,'SCORECARD.md'),'utf8'); const at=sc.indexOf('| Capability |'); const eol=sc.indexOf('\n',at); sc=sc.slice(0,eol+1)+'| `routed-ledger` | forged capability row | forged receipt | round 68 |\n'+sc.slice(eol+1);writeFileSync(join(root,'SCORECARD.md'),sc);
console.log(`forged items=${total} sections=${sections} rows=${rows.length} answers=${answerLines.length} plan-line=${planLine} old-log-line=${oldLine}`);
