import {readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
const root='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build=join(root,'.ufo/waves/round-69/build/K69ScribeLed57');
const scratch='/fast/scratch/hyaku/kumitate-r69/K69ScribeLed57';
const norm=s=>s.replace(/\*\*|__|`/g,'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim();
const matches=(q,t)=>[...norm(t).matchAll(new RegExp('(?<![A-Za-z0-9])'+norm(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z0-9])','g'))].length;
const log=[];
function requireOk(ok,msg){if(!ok)throw Error(msg);}
try {
 const lines=readFileSync(join(root,'corpus/lessons/round-57-verifier-spotcheck.md'),'utf8').split('\n');
 let fence=null,active=false,level=0,current=null;const items=[],section=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i],f=line.match(/^ {0,3}(`{3,}|~{3,})/);
  if(f){if(!fence)fence=f[1][0];else if(f[1][0]===fence)fence=null;continue;}
  if(fence)continue;
  const heading=line.match(/^(#{1,6})\s+(.*)$/);
  if(heading){if(active&&heading[1].length<=level)active=false;if(/\brouted\s+(?:defects?|items?)\b/i.test(heading[2])){active=true;level=heading[1].length;}continue;}
  if(!active)continue;
  section.push(line);
  const cells=line.trim().startsWith('|')?line.trim().split('|').slice(1,-1).map(x=>x.trim()):null;
  const separator=cells&&cells.every(c=>/^:?-+:?$/.test(c));
  const next=lines[i+1]?.trim();
  const header=cells&&next?.startsWith('|')&&next.split('|').slice(1,-1).every(c=>/^\s*:?-+:?\s*$/.test(c));
  if(separator||header)continue;
  if(/^([-*+]|\d+[.)])\s+\S/.test(line)||cells){current={line:i+1,text:line};items.push(current);}else if(current)current.text+='\n'+line;
 }
 requireOk(items.length===4,'expected four routed items');log.push('ROUTED_ITEMS: 4 (fence-aware; top-level only; table headers/separators excluded)');
 const rows=readFileSync(join(build,'rows.md'),'utf8').trim().split('\n');requireOk(rows.length===items.length,'coverage mismatch');
 for(let i=0;i<rows.length;i++){
  const c=rows[i].split('|').slice(1,-1).map(x=>x.trim());
  requireOk(c.length===7,'row width');requireOk(/^R57-[VCD]\d+$/.test(c[0]),'id format');requireOk(+c[1]===57&&+c[2]===i+1,'ordinal mismatch');
  const q=JSON.parse(c[3]);const words=q.split(/\s+/).length;
  requireOk(words>=3&&words<=25,'word count');const own=matches(q,items[i].text),sectionCount=matches(q,section.join('\n'));
  requireOk(own===1&&sectionCount===1,'quote binding');
  log.push(`${c[0]} item=${i+1} source-line=${items[i].line} words=${words} item_matches=${own} section_matches=${sectionCount} status=${c[5]}`);
  if(c[5]==='open'){requireOk(c[6]==='-','open answer');continue;}
  const a=c[6].match(/^([^:]+):(\d+) — "(.*)"$/);requireOk(a,'answer format');requireOk(!a[1].includes('spotcheck')&&!a[1].includes('routed-ledger'),'forbidden answer');
  const exact=readFileSync(join(root,a[1]),'utf8').split('\n')[+a[2]-1];requireOk(exact!==undefined&&matches(a[3],exact)>=1,'exact answer binding');
  log.push(`ANSWER ${a[1]}:${a[2]} exact_line_match=true\n${exact}`);
 }
 log.push('ROW_BINDINGS: PASS rows=4 closed=2 open=2');
 writeFileSync(join(build,'verification.txt'),log.join('\n')+'\n');console.log(log.join('\n'));
} finally {rmSync(scratch,{recursive:true,force:true});}
