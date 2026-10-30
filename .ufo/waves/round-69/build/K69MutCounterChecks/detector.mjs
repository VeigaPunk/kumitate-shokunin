// EXPERIMENT ONLY: bounded base and isolated-arm mutation detector; never a production counter.
import {readFileSync,writeFileSync,mkdirSync,rmSync,mkdtempSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const S='/fast/scratch/hyaku/kumitate-r69/K69MutCounterChecks';
const lane='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const B=lane+'/.ufo/waves/round-69/build/K69MutCounterChecks';
const state=process.argv[2];
const records=[];
const log=x=>{records.push(x);console.log(x)};
const hash=s=>createHash('sha256').update(s).digest('hex');
mkdirSync(S,{recursive:true});
const ledger=readFileSync(S+'/EXPERIMENT-ledger.mjs','utf8');
const deprec=readFileSync(S+'/EXPERIMENT-deprec.mjs','utf8');
log(`STATE ${state} ledger_sha256=${hash(ledger)} deprec_sha256=${hash(deprec)}`);
const T=mkdtempSync(S+'/arms.');
try {
  // Extract unchanged production fixture-builder, harness and L5 block. Only replace the
  // pathname stub's contents with the same conforming-tool witness for both counter versions.
  let arm=ledger.slice(ledger.indexOf('let seedCtr = 0;'),ledger.indexOf('// ---- L6'));
  const start=arm.indexOf('let realL4 = false;');
  const end=arm.indexOf('\n{\n  const stubs =',start);
  arm=arm.slice(0,start)+'let realL4 = harness(TOOL).length === 0;\n'+arm.slice(end);
  arm=arm.replace('  const caught = [];',`  stubs['pathname-dispatch'] = readFileSync(TOOL, 'utf8');\n  const witness = join(T, 'witness.mjs'); writeFileSync(witness, readFileSync(TOOL));\n  log('WITNESS harness_wrong=' + harness(witness).length);\n  const caught = [];`);
  const tool=lane+'/.ufo/waves/round-68/build/K68ExecToolV2/routed-ledger.mjs';
  new Function('createHash','join','mkdirSync','writeFileSync','readFileSync','rmSync','spawnSync','T','SEED','TOOL','CHILD_ENV','check','log',arm)(createHash,join,mkdirSync,writeFileSync,readFileSync,rmSync,spawnSync,T,'696969c1base',tool, t=>({PATH:process.env.PATH,TMPDIR:t,LANG:'C'}),(id,ok,why)=>log(`${id} ${ok?'HELD':'MISS'} ${why}`),log);
  const p=deprec.slice(deprec.indexOf('  const PINNED_URL ='),deprec.indexOf('  const urlOf ='));
  const pinned=new Function(p+'\nreturn PINNED_URL;')();
  for(const ref of ['main','82d60be17d75e69b350c9fe77df2e8cac202ac11','v18.13.1']) {
    const url=`https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/${ref}/docs/community/feature-lifecycle.mdx`;
    log(`PINNED_URL ref=${ref} accepted=${pinned(url)}`);
  }
} finally {rmSync(T,{recursive:true,force:true});}
for(const [name,file,args] of [['ledger','EXPERIMENT-ledger.mjs',['--seed','696969c1base']],['deprec','EXPERIMENT-deprec.mjs',[]]]) {
  const command=['node',S+'/'+file,lane,'14057f3e3899180c95713bace088fb9c0d0046e3',...args];
  log('COMMAND '+command.join(' '));
  const r=spawnSync(command[0],command.slice(1),{cwd:S,encoding:'utf8',timeout:900000,maxBuffer:16*1024*1024,env:{...process.env,TMPDIR:S,PATH:S+'/guard:'+process.env.PATH}});
  log(`${name} EXIT ${r.status} SIGNAL ${r.signal} ERROR ${r.error?.message||'none'}`);
  log((r.stdout||'').trim());if(r.stderr)log('STDERR '+r.stderr.trim());
}
writeFileSync(B+'/'+state+'.txt',records.join('\n')+'\n');
