#!/usr/bin/env node
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const args=process.argv.slice(2);
const arg=k=>args[args.indexOf(k)+1];
const sha=b=>createHash('sha256').update(b).digest('hex');
let root;
let exit=0;
try {
  if (!args.includes('--tree') || !args.includes('--list')) throw Error('usage: --tree DIR --list JSON [--only ID]');
  const tree=resolve(arg('--tree'));
  if(!statSync(tree).isDirectory()) throw Error('tree not directory');
  const list=JSON.parse(readFileSync(arg('--list'),'utf8'));
  if(!Array.isArray(list)||!list.length) throw Error('empty/non-array list');
  root=mkdtempSync(join(process.env.KUMITATE_MUTANTS_TMP || process.cwd(),'.mutants-'));
  const selected=args.includes('--only')?list.filter(m=>m.id===arg('--only')):list;
  if (!selected.length) throw Error('unknown id');
  for(const m of selected){
    const copy=join(root,m.id);
    cpSync(tree,copy,{recursive:true,filter:p=>!['.git','.jj'].includes(p.split('/').at(-1))});
    const file=resolve(copy,m.file);
    const rel=relative(copy,file);
    if(isAbsolute(rel)||rel==='..'||rel.startsWith('../')) throw Error('file outside tree');
    const before=readFileSync(file);
    const text=before.toString();
    const matches=m.find ? text.split(m.find).length-1 : 0;
    if(matches!==1) { console.log(`${m.id} <NOT-EVALUABLE> exit=2 token=miss matches=${matches}`); exit=2; continue; }
    const run=()=>spawnSync(m.cmd,{cwd:copy,shell:true,encoding:'utf8',timeout:15000,maxBuffer:1024*1024});
    const valid=r=>r.status===m.expectExit && (r.stdout+r.stderr).includes(m.expectToken);
    const pristine=run();
    let mutated,restored;
    try {
      writeFileSync(file,text.replace(m.find,m.replace));
      mutated=run();
    } finally {writeFileSync(file,before);restored=run();}
    const after=readFileSync(file);
    const integrity=before.equals(after);
    const killed=valid(pristine)&&valid(restored)&&integrity&&mutated.status!==null&&!valid(mutated);
    const verdict=killed?'KILLED':valid(pristine)&&valid(restored)&&integrity?'SURVIVED':'<NOT-EVALUABLE>';
    console.log(`${m.id} ${verdict} exit=${mutated.status} token=${(mutated.stdout+mutated.stderr).includes(m.expectToken)?'hit':'miss'}`);
    console.log(JSON.stringify({id:m.id,before:sha(before),mutated:sha(Buffer.from(text.replace(m.find,m.replace))),after:sha(after),restored:integrity,pristine:{exit:pristine.status,output:pristine.stdout+pristine.stderr},mutation:{exit:mutated.status,output:mutated.stdout+mutated.stderr},restoration:{exit:restored.status,output:restored.stdout+restored.stderr}}));
    if(!killed&&exit!==2)exit=1;
  }
}catch(e){console.error(`MUTANTS: FAIL-CLOSED ${e.message}`);exit=2;}
finally{if(root)rmSync(root,{recursive:true,force:true});}
process.exitCode=exit;
