#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const root = `${lane}/.ufo/waves/round-86`;
const rev = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(rev || '')) throw new Error('full measured revision required');
const scratch = '/fast/scratch/hyaku/kumitate-r86/L1/close';
mkdirSync(`${root}/close`, {recursive:true}); mkdirSync(scratch,{recursive:true});
const cases = [
 ['c1-probe','node',[`${root}/probe/probe86-c1.mjs`,'--lane',lane,'--work',scratch]],
 ['selftest','node',['scripts/counter-receipt.mjs','--selftest','--work',scratch]],
 ['proxy','node',['scripts/proxy-check.mjs','--strict']],
 ['proxy-selftest','node',['scripts/proxy-check.mjs','--selftest']],
 ['map','node',['scripts/readme-map.mjs']],
 ['map-selftest','node',['scripts/readme-map.mjs','--selftest']],
 ['spotcheck','node',['scripts/spotcheck-adopt.mjs','--check']],
 ['ready','node',['scripts/ready-handoff.mjs','--round','86','--wave','w1','--policy','/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json']],
 ['plan','bash',['scripts/plan-before-ready.sh','--round','86','--rev',rev]],
 ['census','bash',['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh','validate','--root','/home/vgpnk/Projects/shokunin','kumitate']],
];
for (const [name,cmd,args] of cases) {
 const hash=createHash('sha256').update(readFileSync(`${lane}/scripts/counter-receipt.mjs`)).digest('hex');
 const r=spawnSync(cmd,args,{cwd:lane,encoding:'utf8',timeout:300000,maxBuffer:16<<20,env:{...process.env,TMPDIR:scratch,HYAKU_SCRATCH:'/fast/scratch/hyaku'}});
 writeFileSync(`${root}/close/${name}.txt`,`rev=${rev}\ntool_sha256=${hash}\ncmd=${cmd} ${args.join(' ')}\n${r.stdout||''}${r.stderr||''}exit=${r.status}\nsignal=${r.signal||'none'}\n`);
 console.log(`${name}: exit=${r.status} ${(r.stdout||'').trim().split('\n').at(-1)}`);
}
