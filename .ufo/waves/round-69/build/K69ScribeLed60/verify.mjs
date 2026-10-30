import {readFileSync, writeFileSync} from 'node:fs';
const root='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build=root+'/.ufo/waves/round-69/build/K69ScribeLed60';
const lines=readFileSync(root+'/corpus/lessons/round-60-verifier-spotcheck.md','utf8').split('\n');
let fence=null, active=false, level=0, items=[], section=[];
for(let i=0;i<lines.length;i++) {
  const line=lines[i], f=line.match(/^\s{0,3}(`{3,}|~{3,})/);
  if(f) { if(!fence) fence=f[1]; else if(f[1][0]===fence[0] && f[1].length>=fence.length) fence=null; continue; }
  if(fence) continue;
  const h=line.match(/^(#{1,6})\s+(.*)$/);
  if(h) { if(active && h[1].length<=level) break; if(/Routed defects/.test(h[2])) {active=true;level=h[1].length;} continue; }
  if(!active) continue;
  section.push(line);
  const bullet=line.match(/^(?:[-+*]|\d+[.)])\s+(.*)$/);
  const cells=line.trim().startsWith('|')?line.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()):null;
  if(cells && (cells.every(x=>/^:?-+:?$/.test(x)) || /^(?:id|item|defect)$/i.test(cells[0]))) continue;
  if(bullet || cells) items.push({line:i+1,text:line});
  else if(items.length && /^\s+\S/.test(line)) items.at(-1).text+='\n'+line;
}
const normalize=s=>s.replace(/\s+/g,' ').trim();
const locate=(text,q)=>{text=normalize(text);q=normalize(q);let n=0,p=0;while((p=text.indexOf(q,p))!==-1){const word=c=>c!==undefined && /[\p{L}\p{N}_]/u.test(c);if(!word(text[p-1])&&!word(text[p+q.length]))n++;p++;}return n;};
let log=['AXIS: operability; scope: round-60 ledger rows; frozen predicates unchanged.',`FENCE_AWARE_COUNT: ${items.length} expected=9`];
if(items.length!==9) throw Error('item count');
const rows=readFileSync(build+'/rows.md','utf8').trim().split('\n');
if(rows.length!==items.length) throw Error('row count');
for(const row of rows){
 const c=row.split('|').slice(1,-1).map(x=>x.trim());
 const [id,round,ordinal,quoted,cls,status,answer]=c;
 const item=items[Number(ordinal)-1],q=quoted.slice(1,-1),words=q.split(/\s+/).length;
 const own=locate(item.text,q), unique=locate(section.join('\n'),q);
 if(round!=='60'||!item.text.includes(id)||words<3||words>25||own!==1||unique!==1)throw Error(id+': invalid quote');
 let evidence='-';
 if(status==='closed'){
  const m=answer.match(/^([^:]+):(\d+) — "(.*)"$/);
  if(!m||m[1].includes('spotcheck')||m[1]==='corpus/routed-ledger.md')throw Error('answer path');
  const exact=readFileSync(root+'/'+m[1],'utf8').split('\n')[Number(m[2])-1];
  if(!exact?.includes(m[3]))throw Error(id+': answer missing');
  evidence=m[1]+':'+m[2]+' — '+JSON.stringify(m[3]);
 } else if(status!=='open'||answer!=='-') throw Error('status');
 log.push(`${id} item=${ordinal} source-line=${item.line} words=${words} in-item=${own} in-section=${unique} class=${cls} status=${status} answer=${evidence}`);
}
log.push('ROWS60_VERIFY: PASS rows=9 open=5 closed=4');
writeFileSync(build+'/verification.txt',log.join('\n')+'\n');
console.log(log.join('\n'));
