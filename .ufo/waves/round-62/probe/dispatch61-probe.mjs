#!/usr/bin/env node
// kumitate round 61 C1 probe — frozen predicate DISPATCH61_HELD (P61 v1)
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const [lane, rev] = process.argv.slice(2);
if (!lane || !rev) { console.error('usage: dispatch61-probe.mjs <lane> <rev>'); process.exit(64); }
const checks = [];
const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
{
 const r=spawnSync('node',[join(lane,'scripts','dispatch-evidence.mjs'),'--selftest'],{encoding:'utf8'});
 add('P1',r.status===0&&/DISPATCH_EVIDENCE_SELFTEST: PASS \(8\/8\)/.test(r.stdout),(r.stdout.split('\n').filter(l=>l.includes('SELFTEST')).pop()||r.stderr.trim()).slice(0,200));
}
{
 const r=spawnSync('node',[join(lane,'scripts','dispatch-evidence.mjs'),'--root',lane,'--round','61','--wave','w1'],{encoding:'utf8'});
 const clean=r.status===0&&r.stdout.includes('DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)');
 const ls=spawnSync('git',['-C',lane,'ls-tree','-r','--name-only',rev,'--','.ufo/waves/round-61/w1'],{encoding:'utf8'});
 const files=ls.stdout.split('\n').filter(Boolean);
 const hp=files.includes('.ufo/waves/round-61/w1/launcher-progress.tsv'),hr=files.includes('.ufo/waves/round-61/w1/dispatch-actual.json');
 const reports=files.filter(f=>/^\.ufo\/waves\/round-61\/w1\/[^/]+\.md$/.test(f));
 add('P2',clean&&hp&&hr&&reports.length>=32,`gate=${r.status} clean=${clean} reports=${reports.length}`);
}
{
 const sc=spawnSync('git',['-C',lane,'show',`${rev}:SCORECARD.md`],{encoding:'utf8'});const seg=sc.stdout.split('## Capabilities')[1]||'';const row=seg.split('\n').find(l=>l.includes('dispatch-evidence')&&l.includes('|'));
 add('P3',!!row&&/round 61/.test(row),(row||'row-absent').slice(0,200));
}
{
 const p=join(lane,'.ufo','waves','round-61','close','dispatch61-tip.txt');let txt='';try{txt=readFileSync(p,'utf8')}catch{}
 add('P4',txt.includes('DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)'),existsSync(p)?'exists':'absent');
}
const misses=checks.filter(c=>!c.ok),held=misses.length===0;
console.log(`DISPATCH61: ${held?'DISPATCH61_HELD':'DISPATCH61_UNMET'} held=${checks.length-misses.length}/${checks.length} checks=${checks.length} rev=${rev} rule=P61`);
for(const c of checks)console.log(` | ${c.name} ${c.ok?'PASS':'MISS'} ${c.detail}`);
process.exit(held?0:1);
