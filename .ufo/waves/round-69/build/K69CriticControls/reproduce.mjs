import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const lane='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build=lane+'/.ufo/waves/round-69/build/K69CriticControls';
const scratch='/fast/scratch/hyaku/kumitate-r69/K69CriticControls';
const freeze='9401d8655970d542b81d318bdad558d6dea39397';
const env={...process.env,TMPDIR:scratch};
function run(cmd,args,opts={}) {const r=spawnSync(cmd,args,{cwd:scratch,env,encoding:'utf8',maxBuffer:64*1024*1024,timeout:900000,...opts}); if(r.error)throw r.error; return r;}
function ok(cmd,args){const r=run(cmd,args);if(r.status!==0)throw Error(cmd+' '+args.join(' ')+'\n'+r.stderr);return r.stdout;}
fs.mkdirSync(scratch,{recursive:true});
try {
 let receipts='';
 for(const n of ['c1-donothing','c1-autoledger','c2-donothing','c2-autoorigin','c2-forgecapture']) {
  const txt=ok('git',['-C',lane,'show',freeze+':.ufo/waves/round-69/controls/'+n+'.txt']);
  fs.writeFileSync(build+'/'+n+'-committed.txt',txt); receipts+='## '+n+'\n'+txt+'\n';
 }
 fs.writeFileSync(build+'/committed-receipts.txt',receipts);
 const fx=scratch+'/lane';
 ok('git',['clone','--shared','--no-checkout',lane,fx]);
 if(ok('git',['-C',fx,'rev-parse','--show-toplevel']).trim()!==fx)throw Error('fixture root mismatch');
 const put=(p,t)=>{fs.mkdirSync(path.dirname(fx+'/'+p),{recursive:true});fs.writeFileSync(fx+'/'+p,t);};
 const tool=fs.readFileSync(lane+'/.ufo/waves/round-68/build/K68ExecToolV2/routed-ledger.mjs','utf8');
 put('scripts/routed-ledger.mjs',tool);
 const {routedSections,norm,wb}=await import('file://'+fx+'/scripts/routed-ledger.mjs');
 let rows=[], total=0;
 for(let n=55;n<=66;n++) {
  const p='corpus/lessons/round-'+n+'-verifier-spotcheck.md';
  const text=ok('git',['-C',lane,'show',freeze+':'+p]);put(p,text);
  const {items}=routedSections(text);
  for(let k=0;k<items.length;k++) {
   const words=norm(items[k]).split(' ');let quote;
   outer:for(let len=3;len<=25;len++)for(let at=0;at+len<=words.length;at++){
    const q=words.slice(at,at+len).join(' ');
    if(q.includes('|')||q.includes('"'))continue;
    if(wb(q,items[k])&&items.filter(x=>wb(q,x)).length===1){quote=q;break outer;}
   }
   if(!quote)throw Error('no unique quote '+n+'#'+(k+1));
   const cls=k===0?'shared':'auto-'+String.fromCharCode(97+(total%5));
   rows.push(`| A${n}x${k+1} | ${n} | ${k+1} | "${quote}" | ${cls} | open | - |`);
   if(n===66)rows.push(`| F${n}x${k+1} | ${n} | ${k+1} | "${quote}" | ${cls} | closed | \`notes/fabricated.md:1\` — "fabricated closure without actual repair" |`);
   total++;
  }
 }
 put('notes/fabricated.md','fabricated closure without actual repair\n');
 put('corpus/routed-ledger.md','# Routed ledger\n\n## Ledger\n\n| id | round | item | quote | class | status | answer |\n|---|---|---|---|---|---|---|\n'+rows.join('\n')+'\n');
 put('SKILL.md','# s\n\n| gate | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
 put('corpus/QUALITY.md','# q\n\nrouted-ledger\n');
 put('SCORECARD.md','# s\n\n## Capabilities\n\n| routed-ledger | stub |\n|---|---|\n');
 ok('git',['-C',fx,'add','-A']);
 ok('git',['-C',fx,'-c','user.name=control','-c','user.email=control@invalid','-c','commit.gpgsign=false','commit','-q','--no-verify','-m','automated fake closures control']);
 const rev=ok('git',['-C',fx,'rev-parse','HEAD']).trim();
 const r=run('node',[lane+'/.ufo/waves/round-69/probe/ledger69-probe.mjs',fx,rev,'--seed','696969c1critic']);
 const receipt=r.stdout+r.stderr+'\nexit='+r.status+'\nitems='+total+' rows='+rows.length+'\n';
 fs.writeFileSync(build+'/cheapest-closure.txt',receipt);
 fs.copyFileSync(fx+'/corpus/routed-ledger.md',build+'/fabricated-ledger.md');
 fs.copyFileSync(fx+'/notes/fabricated.md',build+'/fabricated-answer.md');
 console.log(receipt);
} finally { fs.rmSync(scratch,{recursive:true,force:true}); }
