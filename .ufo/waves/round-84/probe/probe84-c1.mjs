#!/usr/bin/env node
// FROZEN C84_C1: HELD held=16/16, exit 0. Table length is the only denominator.
// node .ufo/waves/round-84/probe/probe84-c1.mjs --lane DIR --work DIR
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const args=process.argv.slice(2); let lane='.',work;
for(let i=0;i<args.length;i++){if(args[i]==='--lane')lane=args[++i];else if(args[i]==='--work')work=args[++i];else{console.log('C84_C1: USAGE');process.exit(64);}}
if(!work){console.log('C84_C1: USAGE --work required');process.exit(64);}
lane=resolve(lane);mkdirSync(work,{recursive:true});const root=mkdtempSync(join(resolve(work),'probe84-'));
const good='X arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\n';
const cases=[
 ['clean',good,0,'COUNTER_RECEIPT: CLEAN'],
 ['crlf',good.replaceAll('\n','\r\n'),0,'COUNTER_RECEIPT: CLEAN'],
 ['hidden-red','X arm a ok\nX arm b FAIL\nX: HELD held=1/1\n',1,'ARMS_TOTAL'],
 ['total-drift',good.replace('2/2','2/3'),1,'ARMS_TOTAL'],
 ['held-drift',good.replace('2/2','1/2'),1,'HELD_COUNT'],
 ['duplicate',good.replace('arm b','arm a'),1,'ARM_DUPLICATE'],
 ['foreign-arm',good.replace('X arm b','Y arm b'),1,'ARM_PREFIX'],
 ['two-summaries',good+'X: HELD held=2/2\n',2,'SUMMARY_COUNT'],
 ['no-summary','X arm a ok\n',2,'SUMMARY_COUNT'],
 ['malformed-arm','X arm a MAYBE\nX: HELD held=1/1\n',2,'ARM_MALFORMED'],
 ['zero-arms','X: HELD held=0/0\n',2,'ARMS_EMPTY'],
 ['missing',null,2,'RECEIPT_UNREADABLE'],
 ['usage',null,64,'COUNTER_RECEIPT: USAGE'],
 ['honest-red','X arm a FAIL\nX: UNMET held=0/1\n',1,'ARM_FAILED'],
 ['wrong-verdict',good.replace('HELD','UNMET'),1,'VERDICT'],
 ['summary-before-arms','X: HELD held=2/2\nX arm a ok\nX arm b ok\n',2,'SUMMARY_ORDER'],
];
let held=0,ran=0;
try {
 for(const [name,text,code,token] of cases){
  const file=join(root,name+'.txt');if(text!==null)writeFileSync(file,text);
  const tool=join(lane,'scripts/counter-receipt.mjs');
  const r=existsSync(tool)?spawnSync(process.execPath,[tool,...(name==='usage'?[]:['--receipt',file])],{encoding:'utf8',timeout:10000}):{status:127,stdout:'tool-absent',stderr:''};
  const out=(r.stdout??'')+(r.stderr??'');const ok=r.status===code&&out.includes(token);ran++;if(ok)held++;
  console.log(`C84_C1 arm ${name} ${ok?'ok':'FAIL'} exit=${r.status} want=${code}:${token} out=${out.trim().split('\n')[0]}`);
 }
 const valid=ran===cases.length&&cases.length===16;
 console.log(`C84_C1: ${valid&&held===ran?'HELD':'UNMET'} held=${held}/${ran}`);
 process.exitCode=valid&&held===ran?0:1;
}finally{rmSync(root,{recursive:true,force:true});}
