import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
const root='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build=root+'/.ufo/waves/round-69/build/K69ReviewL3Answers';
const src=fs.readFileSync(root+'/.ufo/waves/round-69/probe/ledger69-probe.mjs','utf8');
const defs=src.slice(src.indexOf('const norm ='),src.indexOf('const results ='))+src.slice(src.indexOf('function items67'),src.indexOf('// ---- L1'));
const sandbox={}; vm.createContext(sandbox);
// Evaluate declarations only, never execute the frozen counter or its runtime.
const stop=defs.indexOf('// ---- own item count');
vm.runInContext((stop<0?defs:defs.slice(0,stop))+'\nthis.api={norm,nwords,wb,items67,ledgerParse};',sandbox);
const {norm,nwords,wb,items67,ledgerParse}=sandbox.api;
const log=[]; const out=s=>log.push(s);
const draft=fs.readFileSync(root+'/.ufo/waves/round-69/build/L1LedgerDraft/routed-ledger.generated.md','utf8');
const rows=ledgerParse(draft); let total=0, impossible=0, invalidQuotes=0;
for(let n=55;n<=66;n++){
 const items=items67(fs.readFileSync(root+`/corpus/lessons/round-${n}-verifier-spotcheck.md`,'utf8')).items;
 for(let i=0;i<items.length;i++){
  total++; const tokens=norm(items[i]).split(/\s+/); let witness=null;
  for(let j=0;j+3<=tokens.length;j++){
   const q=tokens.slice(j,j+3).join(' ');
   if(wb(q,items[i])&&items.filter(t=>wb(q,t)).length===1){witness=q;break;}
  }
  if(!witness)impossible++;
  out(`TRIPLE ${n}#${i+1} ${witness?JSON.stringify(witness):'IMPOSSIBLE'}`);
  for(const r of rows.filter(r=>r.n===n&&r.k===i+1)){
   const valid=nwords(r.quote)>=3&&nwords(r.quote)<=25&&wb(r.quote,items[i])&&items.filter(t=>wb(r.quote,t)).length===1;
   if(!valid){invalidQuotes++;out(`INVALID_QUOTE ${r.id} line=${r.line}`);}
  }
 }
}
out(`QUOTE_SUMMARY items=${total} impossible_unique_triples=${impossible} invalid_draft_quotes=${invalidQuotes}`);
let failed=0, closed=0;
for(const r of rows.filter(r=>['closed','wontfix'].includes(r.status))){
 closed++; const m=/^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(r.answer);
 if(!m){failed++;out(`BINDING_FAIL ${r.id} draft-line=${r.line} answer-format=${JSON.stringify(r.answer)}`);continue;}
 const line=fs.readFileSync(root+'/'+m[1],'utf8').split('\n')[Number(m[2])-1];
 const good=line!==undefined&&wb(m[3],line)&&nwords(m[3])<=25;
 if(!good)failed++;
 out(`BINDING_${good?'PASS':'FAIL'} ${r.id} draft-line=${r.line} ${m[1]}:${m[2]} words=${nwords(m[3])} exact=${line!==undefined&&wb(m[3],line)}`);
 if(r.n===66){
  out(`EXACT_LINE ${r.id} ${JSON.stringify(line)}`);
  out(`ANSWER_QUOTE ${r.id} ${JSON.stringify(m[3])}`);
  const rev='8d557f85312de4fcc82e09ff735d21436bc3746d';
  const old=spawnSync('git',['-C',root,'show',`${rev}:${m[1]}`],{encoding:'utf8',maxBuffer:10*1024*1024});
  const q=norm(m[3]); const regex=new RegExp(`(^|[^A-Za-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^A-Za-z0-9]|$)`,'g');
  const count=old.status===0?[...norm(old.stdout).matchAll(regex)].length:null;
  out(`R66_NEWNESS ${r.id} git-show-exit=${old.status} base-word-boundary-matches=${count} base-normalized-substring=${old.status===0&&norm(old.stdout).includes(q)} stderr=${JSON.stringify(old.stderr)}`);
 }
}
out(`BINDING_SUMMARY nonopen=${closed} failures=${failed}`);
out('AUDIT_EXIT=0 (observation completed; not a claim-admission verdict)');
fs.writeFileSync(build+'/audit.txt',log.join('\n')+'\n');console.log(log.join('\n'));
