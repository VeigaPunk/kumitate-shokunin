import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const S=join(process.env.HYAKU_SCRATCH||'/fast/scratch/hyaku','kumitate-r75','K75MutTipDrift');
const B='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-75/build/K75MutTipDrift';
const source=join(S,'real-tool/scripts/proxy-check.mjs');
const base=readFileSync(source);
const fixture=JSON.parse(readFileSync(join(B,'minimal-matrix.json'))).fixture;
const {pin,head,dir}=fixture;
const env={...process.env,TMPDIR:S,GIT_CEILING_DIRECTORIES:S,GIT_OPTIONAL_LOCKS:'0'};
const line=(state,pin,commits,changed,scripts,runtime,other)=>`ORIGIN_TIP_DRIFT: ${state} pin=${pin.slice(0,12)} origin=${head.slice(0,12)} commits=${commits} changed=${changed} scripts=${scripts} runtime=${runtime} other=${other}`;
const cases=[{name:'MOVED_state_commits_changed_scripts_runtime_other_exit',args:['--origin',dir,'--pin',join(S,'pin.json')],exit:1,line:line('MOVED',pin,1,7,2,2,3)},{name:'IN_SYNC_state_exit',args:['--origin',dir,'--pin',join(S,'sync.json')],exit:0,line:line('IN_SYNC',head,0,0,0,0,0)},{name:'FAIL-CLOSED_non_git_state_exit',args:['--origin',join(S,'not-git'),'--pin',join(S,'pin.json')],exit:2},{name:'FAIL-CLOSED_pin_validation_state_exit',args:['--origin',dir,'--pin',join(S,'bad-pin.json')],exit:2}];
const hash=b=>createHash('sha256').update(b).digest('hex');
const execute=args=>{const r=spawnSync('node',[source,...args],{cwd:S,env,encoding:'utf8',timeout:20000});return{exit:r.status,stdout:r.stdout?.trim()||'',stderr:r.stderr?.trim()||''};};
const detect=()=>{const outputs=cases.map(c=>{const r=execute(['--tip-drift',...c.args]);return{name:c.name,...r,ok:r.exit===c.exit&&(c.line?r.stdout===c.line:/^ORIGIN_TIP_DRIFT: FAIL-CLOSED \S+/.test(r.stdout))};});const failures=outputs.filter(o=>!o.ok).map(o=>o.name);return{exit:failures.length?1:0,verdict:'VERDICT: '+(failures.length?'FAIL '+failures.join(','):'PASS'),outputs};};
const mutations=JSON.parse(readFileSync(join(S,'real-seams.json')));
const matrices=[];
for(const {id,expected,from,to} of mutations){
 const text=base.toString();if(!text.includes(from)||text.indexOf(from)!==text.lastIndexOf(from))throw Error('nonunique seam '+id);
 const pristine=detect();let mutant,mutatedHash;
 try{writeFileSync(source,text.replace(from,to));mutatedHash=hash(readFileSync(source));mutant=detect();}finally{writeFileSync(source,base);}
 const restored=detect();const after=hash(readFileSync(source));
 const verdict=pristine.exit||restored.exit?'INCONCLUSIVE':mutant.exit!==0&&mutant.verdict.startsWith('VERDICT: FAIL ')?'KILLED':'SURVIVOR';
 matrices.push({id,expected,verdict,before:hash(base),mutatedHash,after,exactRestored:base.equals(readFileSync(source)),pristine,mutant,restored});
}
const live=execute(['--tip-drift','--self','/home/vgpnk/Projects/shokunin/kumitate-shokunin']);
const result={matrices,live};writeFileSync(join(B,'real-matrix.json'),JSON.stringify(result,null,2)+'\n');
let receipt=readFileSync(join(B,'mutation-receipt.txt'),'utf8')+'\nREAL PATCHED TOOL MATRIX\n';
for(const m of matrices){receipt+=`${m.id} expected=${m.expected} ${m.verdict} before=${m.before} mutated=${m.mutatedHash} restored=${m.after} exact=${m.exactRestored}\n`;for(const p of ['pristine','mutant','restored']){receipt+=`${p}: ${m[p].verdict} exit=${m[p].exit}\n`;for(const o of m[p].outputs)receipt+=`  ${o.name}: exit=${o.exit} ${o.stdout}\n`;}}
receipt+=`Real live: ${live.stdout} exit=${live.exit}\n`;
writeFileSync(join(B,'mutation-receipt.txt'),receipt);copyFileSync(join(S,'real-battery.mjs'),join(B,'real-battery.mjs'));copyFileSync(join(S,'real-seams.json'),join(B,'real-seams.json'));console.log(JSON.stringify(result));
