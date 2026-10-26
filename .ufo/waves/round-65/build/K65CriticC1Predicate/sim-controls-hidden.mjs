// Replicates the frozen probe's H2 build/runCase against tool trees with .ufo removed.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
const GIT = ['-c','user.name=sim','-c','user.email=sim@invalid','-c','commit.gpgsign=false','-c','core.hooksPath=/dev/null'];
const git = (d,a) => spawnSync('git',['-C',d,...a],{encoding:'utf8',maxBuffer:64<<20});
const cdir = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/controls/harm';
const tool = process.argv[2];
let ok=0, n=0;
for (const name of readdirSync(cdir).filter((d)=>/^case-\d+/.test(d)).sort()) {
  const spec = JSON.parse(readFileSync(join(cdir,name,'spec.json'),'utf8'));
  const D = realpathSync(mkdtempSync(join(tmpdir(),'simfx.')));
  git(D,['init','-q']); git(D,['add','-A']);
  const put=(f)=>{for(const [p,b] of Object.entries(f||{})){mkdirSync(dirname(join(D,p)),{recursive:true});writeFileSync(join(D,p),b);}};
  put(spec.base);
  writeFileSync(join(D,'gates.json'), spec.gates_raw!==undefined?spec.gates_raw:JSON.stringify({gates:spec.gates}));
  git(D,['add','-A']); git(D,['commit','-q','-m','b']);
  const b = git(D,['rev-parse','HEAD']).stdout.trim();
  put(spec.tip); for (const p of spec.tip_delete||[]) rmSync(join(D,p),{force:true});
  git(D,['add','-A']); if (!spec.same_rev) git(D,['commit','-q','--allow-empty','-m','t']);
  const t = git(D,['rev-parse','HEAD']).stdout.trim();
  const r = spawnSync('node',[tool,'--lane',D,'--base',b,'--tip',t,'--gates',join(D,'gates.json')],{encoding:'utf8',timeout:120000});
  const rows = r.stdout.split('\n').filter((l)=>l.startsWith('HARM_ROW ')).map((l)=>{const m=/gate=(\S+) .* id=(\S+) base_text/.exec(l);return m?`${m[1]} ${m[2]}`:l;}).sort();
  const want=[...spec.expect.rows].sort();
  n++; if (r.status===spec.expect.exit && JSON.stringify(rows)===JSON.stringify(want)) ok++;
  else console.log('miss',name,'exit='+r.status,'rows='+JSON.stringify(rows));
  rmSync(D,{recursive:true,force:true});
}
console.log(`SIM ${tool}: ${ok}/${n} fixtures matched`);
