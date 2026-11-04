import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
const lane='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
let ok=0,bad=[];
for(let r=74;r<=86;r++){const dir=join(lane,'.ufo/waves','round-'+r,'close');if(!existsSync(dir))continue;
 for(const f of readdirSync(dir).sort()){if(!f.endsWith('.txt'))continue;
  const t=readFileSync(join(dir,f),'utf8');
  if(/^cmd=/m.test(t)||/^tool_sha256=/m.test(t))continue;
  const rev=(t.match(/^rev=([a-f0-9]{40})$/m)||[])[1];
  const m=t.match(/^(?:\$ |command=|cmd: )\s*(?:node|bash)\s+(\S+)/m);
  if(!m)continue;
  const tok=m[1];
  if(!rev){bad.push(`${r}/${f}(norev)`);continue;}
  const g=spawnSync('git',['-C',lane,'show',`${rev}:${tok.replace(/^\.\//,'')}`],{maxBuffer:64<<20});
  if(g.status===0)ok++;else bad.push(`${r}/${f}->${tok}`);
 }}
console.log(`command-shaped receipts whose named script resolves at their own rev: ${ok}`);
console.log(`unresolved: ${bad.length}`, bad.slice(0,12).join(' '));
