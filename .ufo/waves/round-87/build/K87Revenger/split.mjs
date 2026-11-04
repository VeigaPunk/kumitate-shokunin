import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const lane='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const rounds=[];for(let r=74;r<=86;r++)rounds.push('round-'+r);
let A=0,B=0,C=0,D=0;const ex=[];
for(const r of rounds){const dir=join(lane,'.ufo/waves',r,'close');if(!existsSync(dir))continue;
 for(const f of readdirSync(dir).sort()){if(!f.endsWith('.txt'))continue;
  const t=readFileSync(join(dir,f),'utf8');
  const cmd=(t.match(/^cmd=(.+)$/m)||[])[1]; const tool=/^tool_sha256=/m.test(t);
  const rev=(t.match(/^rev=([a-f0-9]{40})$/m)||[])[1];
  if(cmd&&tool)continue;
  const shaped=!!(t.match(/^(?:command|argv|invoked|ran)[:=].*$/im)||t.match(/^\$ .*$/m));
  if(shaped&&rev){A++;ex.push(`${r}/${f}`);} else if(shaped&&!rev)B++; else if(!shaped&&rev)C++; else D++;
 }}
console.log(`cmd-shaped+rev=${A} cmd-shaped+norev=${B} nocommand+rev=${C} nocommand+norev=${D} total=${A+B+C+D}`);
console.log('cmd-shaped+rev:',ex.join(' '));
