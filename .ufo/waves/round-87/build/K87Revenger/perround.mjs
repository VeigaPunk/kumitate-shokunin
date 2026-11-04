import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
const lane='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const rows=[];
for(let r=74;r<=86;r++){const dir=join(lane,'.ufo/waves','round-'+r,'close');if(!existsSync(dir))continue;
 let matched=0,mismatch=0,unchecked=0,unresolved=0;
 for(const f of readdirSync(dir).sort()){if(!f.endsWith('.txt'))continue;
  const t=readFileSync(join(dir,f),'utf8');
  const cmd=(t.match(/^cmd=(.+)$/m)||[])[1];const tool=(t.match(/^tool_sha256=([a-f0-9]{64})$/m)||[])[1];const rev=(t.match(/^rev=([a-f0-9]{40})$/m)||[])[1];
  if(!cmd||!tool){unchecked++;continue;}
  const tok=cmd.trim().split(/\s+/)[1];let rel=null,bytes=null;
  if(tok&&tok.startsWith('/')){if(tok.startsWith(lane+'/'))rel=tok.slice(lane.length+1);else if(existsSync(tok))bytes=readFileSync(tok);}
  else if(tok)rel=tok;
  if(rel&&rev){const g=spawnSync('git',['-C',lane,'show',`${rev}:${rel}`],{maxBuffer:64<<20});if(g.status===0)bytes=g.stdout;}
  if(!bytes){unresolved++;continue;}
  const h=(await import('node:crypto')).createHash('sha256').update(bytes).digest('hex');
  if(h===tool)matched++;else mismatch++;
 }
 rows.push({round:r,matched,mismatch,unchecked,unresolved,verdict:unresolved?'FAIL-CLOSED UNRESOLVED':(mismatch||unchecked?'DRIFT':'CLEAN')});
}
for(const x of rows)console.log(`round-${x.round}: matched=${x.matched} mismatched=${x.mismatch} unchecked=${x.unchecked} unresolved=${x.unresolved} -> ${x.verdict}`);
