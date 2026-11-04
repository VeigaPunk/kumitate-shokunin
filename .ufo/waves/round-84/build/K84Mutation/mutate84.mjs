#!/usr/bin/env node
// One explicit, byte-exact mutation per invocation; no production writes.
// Usage: node /absolute/mutate84.mjs /absolute/candidate.mjs /absolute/spec.json
// spec: {id, before, after, expectedArm}; before must occur exactly once.
import {readFileSync,writeFileSync,mkdirSync,existsSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {isAbsolute,join} from 'node:path';
const output='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Mutation';
const scratch='/fast/scratch/hyaku/kumitate-r84/K84Mutation';
const probe='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/probe/probe84-c1.mjs';
const revision='3794b903324e7eb4aec6d92539f2ca4e2c0b6727';
const hash=b=>createHash('sha256').update(b).digest('hex');
const [candidate,specPath,...extra]=process.argv.slice(2);
if(extra.length||!candidate||!specPath||![candidate,specPath].every(isAbsolute))throw Error('absolute candidate and spec paths required');
const spec=JSON.parse(readFileSync(specPath,'utf8'));
if(!/^[a-z0-9-]+$/.test(spec.id)||typeof spec.before!=='string'||!spec.before||typeof spec.after!=='string'||spec.before===spec.after||!spec.expectedArm)throw Error('invalid mutation specification');
const pristine=readFileSync(candidate);
const source=pristine.toString('utf8');
if(!Buffer.from(source).equals(pristine))throw Error('candidate must be UTF-8');
if(source.split(spec.before).length!==2)throw Error('exact-match precondition requires precisely one before occurrence');
if(existsSync(scratch))throw Error('scratch already exists; refusing overwrite');
const mutant=Buffer.from(source.replace(spec.before,spec.after));
const tool=join(scratch,'scripts/counter-receipt.mjs');
const work=join(scratch,'work');
const record={revision,candidate,candidate_sha256:hash(pristine),probe_sha256:hash(readFileSync(probe)),node:process.version,spec,mutant_sha256:hash(mutant),runs:[]};
mkdirSync(output,{recursive:true});
mkdirSync(join(scratch,'scripts'),{recursive:true});
mkdirSync(work,{recursive:true});
const run=phase=>{
 const args=[probe,'--lane',scratch,'--work',work];
 const r=spawnSync(process.execPath,args,{cwd:scratch,env:{...process.env,TMPDIR:work},encoding:'utf8',timeout:190000,maxBuffer:1024*1024});
 const receipt={phase,command:[process.execPath,...args],cwd:scratch,TMPDIR:work,exit:r.status,signal:r.signal,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??'',tool_sha256:hash(readFileSync(tool))};
 record.runs.push(receipt);
 writeFileSync(join(output,`${spec.id}-${phase}.txt`),`rev=${revision}\nworking-copy sha256 ${receipt.tool_sha256}\ncommand=${JSON.stringify(receipt.command)}\nexit=${receipt.exit} signal=${receipt.signal}\n${receipt.stdout}${receipt.stderr}${receipt.error??''}\n`);
 return receipt;
};
let baseline,changed,restored;
try{
 writeFileSync(tool,pristine);
 baseline=run('pristine');
 writeFileSync(tool,mutant);
 changed=run('mutated');
}finally{
 try{
  writeFileSync(tool,pristine);
  record.restored_sha256=hash(readFileSync(tool));
  record.exact_restoration=readFileSync(tool).equals(pristine);
  restored=run('restored');
 }finally{
  const held=r=>r?.exit===0&&r.stdout.includes('C84_C1: HELD held=16/16');
  record.verdict=held(baseline)&&held(restored)&&record.exact_restoration
   ?held(changed)?'survived':changed?.exit===1&&changed.stdout.includes(`C84_C1 arm ${spec.expectedArm} FAIL`)?'killed':'inconclusive'
   :'inconclusive';
  writeFileSync(join(output,`${spec.id}-candidate.mjs`),pristine);
  writeFileSync(join(output,`${spec.id}-mutant.mjs`),mutant);
  rmSync(scratch,{recursive:true,force:true});
  record.scratch_removed=!existsSync(scratch);
  writeFileSync(join(output,`${spec.id}-result.json`),JSON.stringify(record,null,2)+'\n');
  console.log(JSON.stringify({id:spec.id,verdict:record.verdict,exact_restoration:record.exact_restoration,scratch_removed:record.scratch_removed}));
 }
}
