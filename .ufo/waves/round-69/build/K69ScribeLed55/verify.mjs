import { readFileSync, writeFileSync } from 'node:fs';
const root='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build=root+'/.ufo/waves/round-69/build/K69ScribeLed55';
const source='corpus/lessons/round-55-verifier-spotcheck.md';
const lines=readFileSync(root+'/'+source,'utf8').split('\n');
let active=false, level=0, fence=null, current=null;
const items=[];
const separator=l=>/^\s*\|/.test(l)&&l.trim().split('|').slice(1,-1).every(c=>/^\s*:?-+:?\s*$/.test(c));
for(let i=0;i<lines.length;i++) {
 const l=lines[i], f=l.match(/^ {0,3}(`{3,}|~{3,})/);
 if(f){ if(!fence) fence=f[1]; else if(f[1][0]===fence[0]&&f[1].length>=fence.length) fence=null; continue; }
 if(fence) continue;
 const h=l.match(/^(#{1,6})\s+(.*)/);
 if(h){if(active&&h[1].length<=level){active=false;current=null;} if(/\brouted\s+(?:defects?|items?)\b/i.test(h[2])){active=true;level=h[1].length;} continue;}
 if(!active)continue;
 const bullet=/^(?:[-*+]|\d+[.)])\s+\S/.test(l);
 const row=l.startsWith('|')&&!separator(l)&&!separator(lines[i+1]||'');
 if(bullet||row){current={line:i+1,text:l};items.push(current);}
 else if(current)current.text+='\n'+l;
}
const norm=s=>s.replace(/\*\*|__|`/g,'').replace(/[\u2018\u2019]/g,"'").replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim();
const count=(q,t)=>[...norm(t).matchAll(new RegExp('(?<![A-Za-z0-9])'+norm(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z0-9])','g'))].length;
const out=['Axes: operability (binding completeness); accuracy and provenance; frozen surfaces unchanged.', 'SOURCE '+source,'ITEM_COUNT '+items.length];
if(items.length!==3)throw Error('Expected 3 routed items');
const rows=readFileSync(build+'/rows.md','utf8').trim().split('\n');
if(rows.length!==items.length)throw Error('Missing rows');
for(const line of rows){
 const c=line.split('|').slice(1,-1).map(s=>s.trim());
 const [id,round,ordinal,quoted,cls,status,answer]=c;
 const q=quoted.slice(1,-1),k=Number(ordinal)-1,words=q.split(/\s+/).length;
 const hits=items.map(it=>count(q,it.text));
 if(round!=='55'||words<3||words>25||hits[k]!==1||hits.reduce((a,b)=>a+b,0)!==1)throw Error('Bad quote '+id);
 out.push(`${id} item=${ordinal} source-line=${items[k].line} words=${words} item-hits=${hits.join(',')} section-occurrences=1 class=${cls} status=${status} quote=${quoted}`);
 if(status==='closed'){
  const m=answer.match(/^(.+):(\d+) — "(.*)"$/);if(!m)throw Error('Bad answer');
  if(m[1]==='corpus/routed-ledger.md'||/spotcheck/.test(m[1]))throw Error('Forbidden answer');
  const exact=readFileSync(root+'/'+m[1],'utf8').split('\n')[Number(m[2])-1];
  if(!exact||!count(m[3],exact))throw Error('Absent answer '+id);
  out.push(`ANSWER ${m[1]}:${m[2]} — ${exact}`);
 }else if(status!=='open'||answer!=='-')throw Error('Unexpected status');
}
out.push('NOTE R55-C1 is an assigned draft identifier for the unnumbered Carried bullet; source has no R55-C label. It is not a claimed historical label.', 'VERIFY: PASS items=3 rows=3 closed=2 open=1');
const text=out.join('\n')+'\n';writeFileSync(build+'/verification.txt',text);console.log(text);
