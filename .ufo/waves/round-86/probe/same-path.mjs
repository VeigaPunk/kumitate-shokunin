#!/usr/bin/env node
// Supplemental Q78 control; not an amendment of frozen C86_C1.
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {createHash,randomBytes} from 'node:crypto';
import {join,resolve} from 'node:path';
const [lane,work]=process.argv.slice(2);
if(!lane||!work) process.exit(64);
mkdirSync(work,{recursive:true});
const root=mkdtempSync(join(resolve(work),'same-path-'));
const file=join(root,'receipt.txt'),src=join(root,'source.mjs');
const sha=x=>createHash('sha256').update(x).digest('hex');
let held=0;const answers=[];
try{
 for(let i=1;i<=3;i++){
  const name=`a${randomBytes(5).toString('hex')}`;
  const text=`X arm ${name} ok\nX: HELD held=1/1\n`;
  const source=`const ARMS = 1;\narm('${name}', () => {});\n// revision ${i}\n`;
  writeFileSync(file,text);writeFileSync(src,source);
  const r=spawnSync(process.execPath,[join(resolve(lane),'scripts/counter-receipt.mjs'),'--receipt',file,'--src',src],{encoding:'utf8',timeout:15000});
  const expected=`COUNTER_RECEIPT: CLEAN\nRECEIPT: bytes=${Buffer.byteLength(text)} rows=1 held=1/1 findings=none sha256=${sha(text)}\nSOURCE: sites=1 declared=1 receipt=1 sha256=${sha(source)}\n`;
  const ok=r.status===0&&r.stdout===expected&&!r.stderr;
  answers.push(r.stdout);held+=Number(ok);console.log(`SAME_PATH arm write-${i} ${ok?'ok':'FAIL'} exit=${r.status}`);
 }
 const distinct=new Set(answers).size===3;const ok=held===3&&distinct;
 console.log(`SAME_PATH: ${ok?'HELD':'UNMET'} held=${held}/3 distinct=${distinct}`);process.exitCode=ok?0:1;
}finally{rmSync(root,{recursive:true,force:true});}
