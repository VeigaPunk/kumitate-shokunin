#!/usr/bin/env node
// R70 frozen predicate: REPLAY70_HELD iff the ten bounded replay obligations hold.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const [lane, rev] = process.argv.slice(2);
if (!lane || !/^[a-f0-9]{40}$/.test(rev||'')) process.exit(64);
const git=(...a)=>spawnSync('git',['-C',lane,...a],{encoding:'utf8',maxBuffer:16*1024*1024});
const root=fs.mkdtempSync(path.join(process.env.TMPDIR||os.tmpdir(),'replay70-'));
const tree=path.join(root,'tree'); fs.mkdirSync(tree);
const checks=[]; const check=(id,ok,detail='')=>checks.push({id,ok:!!ok,detail});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
let live='no-live(vacuous-declared)';
try {
 const archive=spawnSync('bash',['-c','set -o pipefail; git -C "$1" archive "$2" scripts corpus SKILL.md SCORECARD.md .ufo/pins .ufo/waves/round-69/probe .ufo/waves/round-69/controls | tar -x --no-same-owner --no-same-permissions -C "$3"','archive',lane,rev,tree],{encoding:'utf8',maxBuffer:1024*1024});
 if(archive.status!==0) throw Error('archive:'+archive.stderr);
 const tool=path.join(tree,'scripts/control-replay.mjs');
 const run=(args)=>spawnSync(process.execPath,[tool,...args],{cwd:tree,env:{...process.env,TMPDIR:root},encoding:'utf8',timeout:300000,maxBuffer:8*1024*1024});
 const frozen=['c1-controls.sh','c2-controls.sh'];
check('R1',frozen.every(f=>{const p='.ufo/waves/round-69/probe/'+f;const b={status:0,stdout:fs.readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/'+f,'utf8')};return b.status===0&&fs.readFileSync(path.join(tree,p),'utf8')===b.stdout;}),'frozen scripts unchanged');
 const before=new Map();
 const old=path.join(tree,'.ufo/waves/round-69/controls');
 for(const f of fs.readdirSync(old)) {const p=path.join(old,f);if(fs.statSync(p).isFile()) before.set(p,sha(fs.readFileSync(p)));}
 const st=run(['--selftest']);check('R2',st.status===0&&/^CONTROL_REPLAY_SELFTEST: PASS/m.test(st.stdout),'isolated selftest');
 for(const [i,[family,mode]] of [['c1','donothing'],['c1','autoledger'],['c2','donothing'],['c2','autoorigin'],['c2','forgecapture']].entries()) {
  const out=path.join(root,`result-${i}.txt`),work=path.join(root,`work-${i}`);fs.mkdirSync(work);
  const r=run(['--lane',lane,'--family',family,'--mode',mode,'--out',out,'--work',work]);
  const text=fs.existsSync(out)?fs.readFileSync(out,'utf8'):'';
  if(mode==='forgecapture'&&text.includes('live=exercised')) live='exercised';
  const label=family==='c1'?'LEDGER69_UNMET':'DEPREC69_UNMET';
  const preserved=[...before].every(([p,h])=>sha(fs.readFileSync(p))===h);
  check('R'+(i+3),r.status===0&&text.includes(label)&&text.includes('CONTROL-PASS '+mode)&&preserved&&fs.readdirSync(work).length===0,`family=${family} mode=${mode} exit=${r.status} receipt=${text.length} preserved=${preserved}`);
 }
 const invalid=run(['--family','junk']);check('R8',invalid.status===64,'invalid args usage');
 const existing=path.join(root,'existing.txt');fs.writeFileSync(existing,'do-not-overwrite\n');
 const collision=run(['--lane',lane,'--family','c1','--mode','donothing','--out',existing,'--work',root]);
 check('R9',collision.status!==0&&fs.readFileSync(existing,'utf8')==='do-not-overwrite\n','existing output preserved');
 const skill=fs.readFileSync(path.join(tree,'SKILL.md'),'utf8'),score=fs.readFileSync(path.join(tree,'SCORECARD.md'),'utf8');
 const pins=JSON.parse(fs.readFileSync(path.join(tree,'.ufo/pins/counter-pins.json'),'utf8'));
 check('R10',fs.existsSync(tool)&&skill.includes('| control-replay |')&&score.includes('| control-replay |')&&pins.pins.some(p=>p.path==='scripts/control-replay.mjs'&&p.sha256===sha(fs.readFileSync(tool))),'registration triad');
 const held=checks.filter(c=>c.ok).length;
 console.log(`REPLAY70_${held===10?'HELD':'UNMET'} held=${held}/10 checks=10 rev=${rev} rule=R70 live=${live}`);
 for(const c of checks)console.log(`${c.id} ${c.ok?'PASS':'MISS'} ${c.detail}`);
 process.exitCode=held===10?0:1;
} catch(e){console.log(`REPLAY70_ERROR rev=${rev} rule=R70 reason=${e.message}`);process.exitCode=2;}
finally{fs.rmSync(root,{recursive:true,force:true});}
