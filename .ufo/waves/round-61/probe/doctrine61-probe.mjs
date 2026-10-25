#!/usr/bin/env node
// kumitate round 61 C2 probe — frozen predicate DOCTRINE61_HELD (D61 v1)
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const [lane,rev]=process.argv.slice(2);const ix=process.argv.indexOf('--census-root');const censusRoot=ix>=0?process.argv[ix+1]:undefined;
if(!lane||!rev){console.error('usage: doctrine61-probe.mjs <lane> <rev> [--census-root <fleet-root>]');process.exit(64)}
const checks=[];const add=(name,ok,detail='')=>checks.push({name,ok,detail});const ep='corpus/knowledge/temporal-worker-versioning-pinning.md';
{
 const r=spawnSync('git',['-C',lane,'ls-tree','-r','--name-only',rev,'--',ep],{encoding:'utf8'});add('E1',r.status===0&&r.stdout.trim()===ep,r.stdout?.trim()||'absent');
}
{
 const r=spawnSync('git',['-C',lane,'show',`${rev}:${ep}`],{encoding:'utf8'});const h=r.stdout||'';const a=/^source:.*S195/m.test(h),b=/^verified-at: 2026-10-25/m.test(h),c=/^recheck:/m.test(h);add('E2',a&&b&&c,`src=${a} verified=${b} recheck=${c}`);
}
{
 const r=spawnSync('git',['-C',lane,'show',`${rev}:corpus/SOURCES.md`],{encoding:'utf8'});const row=(r.stdout||'').split('\n').find(l=>/^\|[[:space:]]*S195[[:space:]]*\|/.test(l));if(!row)add('E3',false,'row-absent');else{const c=row.split('|').map(x=>x.trim());const ok=c[9]==='mined'&&c[10]==='2026-10-25'&&c[12]==='corpus/knowledge/temporal-worker-versioning-pinning.md';add('E3',ok,`status=${c[9]} opened=${c[10]} used-by=${c[12]}`)}
}
{
 const cap=join(lane,'.ufo','waves','round-61','build','ScoutSourceWorkerVersioning','body.md');let sha='';try{sha=createHash('sha256').update(readFileSync(cap)).digest('hex')}catch{}
 const r=spawnSync('git',['-C',lane,'show',`${rev}:corpus/SOURCES.md`],{encoding:'utf8'});const row=(r.stdout||'').split('\n').find(l=>/^\|[[:space:]]*S195[[:space:]]*\|/.test(l))||'';const pin=(row.match(/sha256 [0-9a-f]{64}/)||[])[0]||'';add('E4',!!sha&&pin.includes(sha.slice(0,16)),`pin=${pin.slice(0,24)} sha=${sha.slice(0,16)}`);
}
{
 const r=spawnSync('/home/vgpnk/Projects/shokunin/scripts/sources-census.sh',['validate','--root',censusRoot||lane,'kumitate'],{encoding:'utf8'});add('E5',r.status===0,`exit=${r.status}`);
}
{
 const r=spawnSync('git',['-C',lane,'show',`${rev}:corpus/README.md`],{encoding:'utf8'});const mapped=(r.stdout||'').includes('temporal-worker-versioning-pinning.md');const m=spawnSync('node',[join(lane,'scripts','readme-map.mjs')],{encoding:'utf8',cwd:lane});const out=m.stdout||'';const clean=m.status===0&&/README_MAP: CLEAN/.test(out);add('E6',mapped&&clean,`mapped=${mapped} readme-map=${m.status} ${(out.match(/README_MAP: [^\n]+/)||[''])[0]}`);
}
const misses=checks.filter(c=>!c.ok),held=misses.length===0;console.log(`DOCTRINE61: ${held?'DOCTRINE61_HELD':'DOCTRINE61_UNMET'} held=${checks.length-misses.length}/${checks.length} checks=${checks.length} rev=${rev} rule=D61`);for(const c of checks)console.log(` | ${c.name} ${c.ok?'PASS':'MISS'} ${c.detail}`);process.exit(held?0:1);
