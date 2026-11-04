import {mkdirSync,writeFileSync,readFileSync,rmSync,copyFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const S=join(process.env.HYAKU_SCRATCH||'/fast/scratch/hyaku','kumitate-r75','K75MutTipDrift');
const B='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-75/build/K75MutTipDrift';
const env={...process.env,TMPDIR:S,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_OPTIONAL_LOCKS:'0',GIT_TERMINAL_PROMPT:'0',GIT_CEILING_DIRECTORIES:S};
for(const k of ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']) delete env[k];
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{cwd:S,env,encoding:'utf8',timeout:20000});return {exit:r.status,stdout:r.stdout?.trim()||'',stderr:r.stderr?.trim()||''};};
const log=[];
const git=(d,args)=>{const r=run('git',['-C',d,...args]);if(r.exit!==0)throw Error(JSON.stringify(r));return r.stdout;};
const hash=x=>createHash('sha256').update(x).digest('hex');
let cases;
try{
 const d=run('mktemp',['-d',join(S,'fixture.XXXXXX')]).stdout;
 git(d,['init','-q']);
 const top=git(d,['rev-parse','--show-toplevel']);if(top!==d)throw Error('fixture top mismatch');
 const commit=m=>git(d,['-c','user.name=fixture','-c','user.email=fixture@example.invalid','-c','commit.gpgsign=false','commit','-qm',m,'--allow-empty']);
 commit('pin');const pin=git(d,['rev-parse','HEAD']);
 const pinFile=join(S,'pin.json');writeFileSync(pinFile,JSON.stringify({contract:'kumitate-origin-pin-v1',revision:pin,clone:d}));
 const badPin=join(S,'bad-pin.json');writeFileSync(badPin,JSON.stringify({contract:'wrong',revision:pin,clone:d}));
 const syncPin=join(S,'sync.json');
 for(const p of ['scripts/a.mjs','scripts/lib/x.sh','scripts/top.sh','crates/ufo-core-runtime/src/a.rs','crates/ufo-cli/src/a.rs','crates/ufo-cli/src/nested/a.rs','docs/a.md']){mkdirSync(join(d,p,'..'),{recursive:true});writeFileSync(join(d,p),'fixture\n');}
 git(d,['add','.']);commit('moved');const head=git(d,['rev-parse','HEAD']);
 writeFileSync(syncPin,JSON.stringify({contract:'kumitate-origin-pin-v1',revision:head,clone:d}));
 const nonGit=join(S,'not-git');mkdirSync(nonGit);
 const line=(state,pin,commits,changed,scripts,runtime,other)=>`ORIGIN_TIP_DRIFT: ${state} pin=${pin.slice(0,12)} origin=${head.slice(0,12)} commits=${commits} changed=${changed} scripts=${scripts} runtime=${runtime} other=${other}`;
 cases=[{name:'MOVED_counts_scripts_runtime_other',args:['--origin',d,'--pin',pinFile],exit:1,line:line('MOVED',pin,1,7,2,2,3)},{name:'IN_SYNC_state_exit',args:['--origin',d,'--pin',syncPin],exit:0,line:line('IN_SYNC',head,0,0,0,0,0)},{name:'FAIL-CLOSED_non_git',args:['--origin',nonGit,'--pin',pinFile],exit:2,pattern:/^ORIGIN_TIP_DRIFT: FAIL-CLOSED \S+/},{name:'FAIL-CLOSED_pin_validation',args:['--origin',d,'--pin',badPin],exit:2,pattern:/^ORIGIN_TIP_DRIFT: FAIL-CLOSED \S+/}];
 function detect(file){const outputs=cases.map(c=>{const r=run('node',[file,'--tip-drift',...c.args]);return {name:c.name,...r,ok:r.exit===c.exit&&(c.line?r.stdout===c.line:c.pattern.test(r.stdout))};});const failures=outputs.filter(r=>!r.ok).map(r=>r.name);return {exit:failures.length?1:0,verdict:`VERDICT: ${failures.length?'FAIL '+failures.join(','):'PASS'}`,outputs};}
 const base=readFileSync(join(S,'tip-base.mjs'),'utf8');
 const mutations=[['M1','MOVED state',' if(head!==pin.revision){\n state=\'MOVED\';\n commits=Number(git(origin,[\'rev-list\',\'--count\',`${pin.revision}..${head}`]));\n const changed=git(origin,[\'diff\',\'--name-only\',pin.revision,head]);\n paths=changed?changed.split(\'\\n\'):[];\n }',''],['M2','commits','commits=Number(git(origin,[\'rev-list\',\'--count\',`${pin.revision}..${head}`]));','commits=0;'],['M3','scripts runtime other',base.split('\n').find(l=>l.startsWith('const layer=')),"const layer=p=>'other';"],['M4','FAIL-CLOSED_non_git'," if(r.status!==0) throw new Error('ORIGIN_UNVERIFIABLE');",''],['M5','FAIL-CLOSED_pin_validation',base.split('\n').find(l=>l.startsWith(' if(!pin')), ''],['M6','state exit mapping',"return state==='MOVED'?1:0;","return state==='MOVED'?0:1;"]];
 const matrices=[];
 for(const [id,expected,from,to] of mutations){if(!base.includes(from))throw Error('missing mutation '+id);const path=join(S,id+'.mjs');writeFileSync(path,base);const before=hash(readFileSync(path));const pristine=detect(path);let mutant,mutatedHash;try{writeFileSync(path,base.replace(from,to));mutatedHash=hash(readFileSync(path));mutant=detect(path);}finally{writeFileSync(path,base);}const restored=detect(path);const after=hash(readFileSync(path));const verdict=pristine.exit!==0||restored.exit!==0?'INCONCLUSIVE':mutant.exit!==0&&mutant.verdict.startsWith('VERDICT: FAIL ')?'KILLED':'SURVIVOR';matrices.push({id,expected,verdict,before,mutatedHash,after,exactRestored:before===after,pristine,mutant,restored});}
 const live=run('node',[join(S,'tip-base.mjs'),'--tip-drift']);
 const result={axes:['operability','coverage'],fixture:{dir:d,top,pin,head,changed:7,scripts:2,runtime:2,other:3},matrices,live,commands:['TMPDIR=$S mktemp -d "$S/fixture.XXXXXX"','git -C "$D" init -q','git -C "$D" rev-parse --show-toplevel == "$D"','git -C "$D" -c user.name=fixture -c user.email=fixture@example.invalid -c commit.gpgsign=false commit -qm pin --allow-empty','git -C "$D" add .','git -C "$D" -c user.name=fixture -c user.email=fixture@example.invalid -c commit.gpgsign=false commit -qm moved --allow-empty','node "$FILE" --tip-drift --origin "$ORIGIN" --pin "$PIN" (all four cases; pristine/mutant/restored)']};
 writeFileSync(join(B,'minimal-matrix.json'),JSON.stringify(result,null,2)+'\n');copyFileSync(join(S,'tip-base.mjs'),join(B,'tip-base.mjs'));copyFileSync(join(S,'battery.mjs'),join(B,'battery.mjs'));
 log.push('Axes: operability + coverage','Minimal real implementation; not evidence that executor tool kills these mutants.',...result.commands,'Live: '+live.stdout+' exit='+live.exit);
 for(const m of matrices){log.push(`${m.id} expected=${m.expected} ${m.verdict}; before=${m.before} mutated=${m.mutatedHash} restored=${m.after} exact=${m.exactRestored}`);for(const phase of ['pristine','mutant','restored']){log.push(`${phase}: ${m[phase].verdict} exit=${m[phase].exit}`);for(const o of m[phase].outputs)log.push(`  ${o.name}: exit=${o.exit} ${o.stdout}`);}}
 writeFileSync(join(B,'mutation-receipt.txt'),log.join('\n')+'\n');console.log(log.join('\n'));
}catch(e){writeFileSync(join(B,'battery-error.txt'),e.stack);throw e;}
