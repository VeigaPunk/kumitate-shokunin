import {readFileSync,writeFileSync,mkdirSync,copyFileSync,symlinkSync,lstatSync,existsSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
const root='/fast/scratch/hyaku/kumitate-r84/K84Sentinel';
const build='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Sentinel';
const original=resolve(process.argv[2]);
const tool=join(root,'candidate.mjs'); copyFileSync(original,tool);
const bytes=readFileSync(tool),sha=createHash('sha256').update(bytes).digest('hex');
mkdirSync(join(root,'work'),{recursive:true});
const good='X arm a ok\nX: HELD held=1/1\n';
const cases=[
 ['baseline',good,0,'CLEAN','contract'],
 ['metadata-literal','command=$(printf SENTINEL_NOT_EXECUTED); process.exit(99)\nexit=99\nrev=hostile\n'+good,0,'CLEAN','contract'],
 ['detail-literal','X arm a ok $(printf SENTINEL_NOT_EXECUTED); process.exit(99)\nX: HELD held=1/1\n',0,'CLEAN','contract'],
 ['unsafe-held','X arm a ok\nX: HELD held=9007199254740992/1\n',2,'SUMMARY_COUNT','contract'],
 ['unsafe-total','X arm a ok\nX: HELD held=1/9007199254740992\n',2,'SUMMARY_COUNT','contract'],
 ['negative-held','X arm a ok\nX: HELD held=-1/1\n',2,'SUMMARY_COUNT','contract'],
 ['fraction-held','X arm a ok\nX: HELD held=1.0/1\n',2,'SUMMARY_COUNT','contract'],
 ['exponent-total','X arm a ok\nX: HELD held=1/1e0\n',2,'SUMMARY_COUNT','contract'],
 ['max-safe-held','X arm a ok\nX: HELD held=9007199254740991/1\n',1,'HELD_COUNT','contract'],
 ['leading-zero','X arm a ok\nX: HELD held=01/01\n',0,'CLEAN','contract'],
 ['invalid-name','X arm UPPER ok\n'+good,2,'ARM_MALFORMED','contract'],
 ['invalid-status','X arm red fail\n'+good,2,'ARM_MALFORMED','contract'],
 ['invalid-name-punctuation','X arm a_b ok\n'+good,2,'ARM_MALFORMED','contract'],
 ['red-detail-ansi','X arm a FAIL \u001b[2K\rX arm a ok\nX: HELD held=1/1\n',null,null,'display-boundary'],
 ['ansi-red-prefix','\u001b[31mX arm red FAIL\u001b[0m\n'+good,null,null,'extra-limit'],
 ['forged-command-prefix','command=X arm red FAIL\n'+good,0,'CLEAN','contract'],
 ['second-summary-with-unsafe',good+'X: HELD held=9007199254740992/1\n',2,'SUMMARY_COUNT','contract'],
 ['nul-red-name','X arm a\0b FAIL\n'+good,2,'ARM_MALFORMED','contract'],
 ['large-metadata','metadata='+ 'z'.repeat(4*1024*1024)+'\n'+good,0,'CLEAN','bounded-size-observation'],
];
const results=[];
function run(name,path,expectedExit,token,scope){
 const before=lstatSync(path,{throwIfNoEntry:false});
 const r=spawnSync(process.execPath,[tool,'--receipt',path],{cwd:root,env:{PATH:process.env.PATH,HOME:root,TMPDIR:join(root,'tmp'),HYAKU_SCRATCH:join(root,'work')},encoding:'utf8',timeout:1500,maxBuffer:65536,killSignal:'SIGKILL'});
 const out=(r.stdout??'')+(r.stderr??'');
 results.push({name,scope,command:[process.execPath,tool,'--receipt',path],exit:r.status,signal:r.signal,error:r.error?.code??null,output:out,expectedExit,expectedToken:token,match:expectedExit===null?null:r.status===expectedExit&&out.includes(token),type:before?before.isSymbolicLink()?'symlink':before.isFIFO()?'fifo':before.isCharacterDevice()?'character-device':before.isDirectory()?'directory':'file':'missing'});
}
for(const [name,text,code,token,scope] of cases){const f=join(root,'work',name+'.txt');writeFileSync(f,text);run(name,f,code,token,scope);}
const target=join(root,'work','baseline.txt');const link=join(root,'work','receipt-link');symlinkSync(target,link);run('symlink-regular',link,null,null,'extra-limit');
const broken=join(root,'work','broken-link');symlinkSync(join(root,'work','missing'),broken);run('symlink-broken',broken,2,'RECEIPT_UNREADABLE','contract');
run('directory',join(root,'work'),2,'RECEIPT_UNREADABLE','contract');
// FIFO is inspected by lstat only; never opened or passed to the candidate.
const fifo=join(root,'work','receipt-fifo');const mk=spawnSync('mkfifo',[fifo],{cwd:root,encoding:'utf8',timeout:1000});
const fifoObservation={command:['mkfifo',fifo],exit:mk.status,isFIFO:mk.status===0&&lstatSync(fifo).isFIFO(),candidateRun:false,reason:'Do not risk blocking a FIFO read; static review only.'};
// Safe finite device only, never /dev/zero, random devices, or arbitrary host paths.
run('dev-null','/dev/null',2,'SUMMARY_COUNT','extra-limit');
const report={revision:'3794b903324e7eb4aec6d92539f2ca4e2c0b6727',candidateOriginal:original,candidateSha256:sha,node:process.version,driverCommand:[process.execPath,join(root,'boundary.mjs'),original],results,fifoObservation};
writeFileSync(join(build,'boundary-results.json'),JSON.stringify(report,null,2)+'\n');
copyFileSync(tool,join(build,'candidate-reviewed.mjs'));copyFileSync(join(root,'boundary.mjs'),join(build,'boundary-driver.mjs'));
console.log(JSON.stringify({candidateSha256:sha,cases:results.length,mismatches:results.filter(r=>r.match===false).map(r=>r.name),timeouts:results.filter(r=>r.error).map(r=>r.name),receipt:join(build,'boundary-results.json')}));
