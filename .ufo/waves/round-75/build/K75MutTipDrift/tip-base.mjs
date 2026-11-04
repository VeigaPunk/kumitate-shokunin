import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const argv=process.argv.slice(2);
const value=(flag,fallback)=>argv.includes(flag)?argv[argv.indexOf(flag)+1]:fallback;
const git=(dir,args)=>{
 const r=spawnSync('git',['-C',dir,...args],{encoding:'utf8',timeout:10000,env:{...process.env,GIT_OPTIONAL_LOCKS:'0',GIT_TERMINAL_PROMPT:'0'}});
 if(r.status!==0) throw new Error('ORIGIN_UNVERIFIABLE');
 return r.stdout.trim();
};
const layer=p=> /^scripts\/[^/]+\.mjs$/.test(p)||/^scripts\/[^/]+\/.+/.test(p)?'scripts':/^crates\/(ufo-core-runtime|ufo-cli)\/src\/[^/]+\.rs$/.test(p)?'runtime':'other';
function main(){
 try{
 const pin=JSON.parse(readFileSync(value('--pin','/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json'),'utf8'));
 if(!pin||pin.contract!=='kumitate-origin-pin-v1'||!/^[0-9a-f]{40}$/.test(pin.revision)||typeof pin.clone!=='string'||!pin.clone) throw new Error('PIN_MALFORMED');
 const origin=value('--origin','/home/vgpnk/Projects/ufo-fsd-alpha');
 const head=git(origin,['rev-parse','HEAD']);
 let state='IN_SYNC',commits=0,paths=[];
 if(head!==pin.revision){
 state='MOVED';
 commits=Number(git(origin,['rev-list','--count',`${pin.revision}..${head}`]));
 const changed=git(origin,['diff','--name-only',pin.revision,head]);
 paths=changed?changed.split('\n'):[];
 }
 const counts={scripts:0,runtime:0,other:0};
 for(const p of paths) counts[layer(p)]++;
 console.log(`ORIGIN_TIP_DRIFT: ${state} pin=${pin.revision.slice(0,12)} origin=${head.slice(0,12)} commits=${commits} changed=${paths.length} scripts=${counts.scripts} runtime=${counts.runtime} other=${counts.other}`);
 return state==='MOVED'?1:0;
 }catch(e){console.log(`ORIGIN_TIP_DRIFT: FAIL-CLOSED ${e.message==='ORIGIN_UNVERIFIABLE'?'ORIGIN_UNVERIFIABLE':'PIN_MALFORMED'}`);return 2;}
}
process.exitCode=main();
