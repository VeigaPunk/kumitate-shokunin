import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build = lane + '/.ufo/waves/round-69/build/K69ReviewM11Origin';
const source = fs.readFileSync(lane + '/.ufo/waves/round-69/probe/deprec69-probe.mjs','utf8');
const sha = b => createHash('sha256').update(b).digest('hex');
const pinnedCode = source.slice(source.indexOf('  const PINNED_URL ='),source.indexOf('  const urlOf ='));
const pinned = Function(pinnedCode + '; return PINNED_URL;')();
const rows = new Map(fs.readFileSync(lane+'/corpus/SOURCES.md','utf8').split('\n').filter(l=>/^\| S\d+\s*\|/.test(l)).map(l=>{const c=l.split('|').slice(1,-1).map(x=>x.trim());return [c[0],{source:c[1],status:c[7],usedby:c[10]}]}));
const urlOf = id => rows.get(id).source.match(/https?:\/\/[^\s|]+/)[0];
const lines=[]; const log=s=>{lines.push(s);console.log(s)};
log('AXES: freshness; origin authenticity; deterministic byte comparison; fail-closed offline behavior');
log('COUNTER_SHA256 '+sha(source));
for(let i=207;i<=216;i++) log(`PINNED S${i}=${pinned(urlOf('S'+i))} ${urlOf('S'+i)}`);
const spoof='https://example.invalid/?next=https://raw.githubusercontent.com/a/b/v1.2.3/file.md';
log('PINNED embedded_foreign_url='+pinned(spoof)+' '+spoof);
const suffix='https://github.com/a/b/commit/'+'a'.repeat(40)+'.patch-not-a-patch';
log('PINNED patch_suffix='+pinned(suffix)+' '+suffix);
const extract=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const block=extract('// ---- M11:','\nrmSync(T,');
const helpers=extract('const tableOf =','// ---- M6:')+extract('const section =','// ---- M1')+extract('const delink =','\n\nconst results');
const ENTRY_REL='corpus/knowledge/mcp-deprecation-registry.md';
const entryText=fs.readFileSync(lane+'/'+ENTRY_REL,'utf8');
const citedIds=[...new Set(entryText.split('\n').slice(0,14).filter(l=>/^source:/.test(l)).join(' ').match(/S\d{3,}/g))];
const pins=JSON.parse(fs.readFileSync(lane+'/.ufo/pins/source-captures.json','utf8'));
const captureOf=Object.fromEntries(citedIds.map(id=>[id,fs.readFileSync(lane+'/'+pins.captures.find(c=>c.sourceId===id).path,'utf8')]));
const keys=['rd','entryText','registryRow','ENTRY_REL','citedIds','normalize','sep','join','A','existsSync','lstatSync','chainSafe','readFileSync','createHash','captureOf','NO_LIVE','check','fetch'];
const run=Function(...keys,`return (async()=>{${helpers}\n${block}})()`);
async function arm(name,noLive,sameBytes=false){
 let fetches=0;const virtual=new Map();const localPins=structuredClone(pins);
 if(sameBytes){const p=localPins.captures.find(c=>c.sourceId==='S214');const b=Buffer.from(captureOf.S207);virtual.set(path.join(lane,p.path),b);p.sha256=sha(b);p.bytes=b.length;}
 const read=p=>virtual.get(p)||fs.readFileSync(p);
 const fakeFetch=async url=>{fetches++;const id=[...citedIds,'S214','S215','S216'].find(id=>urlOf(id)===url);const p=localPins.captures.find(c=>c.sourceId===id);const b=read(path.join(lane,p.path));return {ok:true,arrayBuffer:async()=>b};};
 await run(rel=>rel==='.ufo/pins/source-captures.json'?JSON.stringify(localPins):fs.readFileSync(lane+'/'+rel,'utf8'),entryText,id=>rows.get(id),ENTRY_REL,citedIds,path.normalize,path.sep,path.join,lane,fs.existsSync,fs.lstatSync,()=>true,read,createHash,captureOf,noLive,(id,ok,why)=>log(`ISOLATED ${name}: ${id} ${ok?'PASS':'MISS'} ${why}`),fakeFetch);
 log(`ISOLATED ${name}: synthetic_fetches=${fetches}`);
}
if(process.argv.includes('--mirror-only')) { await arm('same-bytes-mirror',false,true); fs.writeFileSync(build+'/mirror-attack.txt',lines.join('\n')+'\n'); process.exit(0); }
await arm('offline',true);
await arm('same-bytes-mirror',false,true);
const results=await Promise.all(['default-1','default-2','gzip','identity'].map(async name=>{
 try {const headers=name==='gzip'?{'Accept-Encoding':'gzip'}:name==='identity'?{'Accept-Encoding':'identity'}:{};
 const r=await fetch(urlOf('S207'),{headers,redirect:'follow',signal:AbortSignal.timeout(45000)});const b=Buffer.from(await r.arrayBuffer());fs.writeFileSync(build+'/s207-'+name+'.bin',b);
 return {name,status:r.status,url:r.url,encoding:r.headers.get('content-encoding'),bytes:b.length,sha256:sha(b)};
 }catch(e){return {name,error:String(e),cause:String(e.cause)}}
}));
for(const r of results)log('LIVE '+JSON.stringify(r));
log('LIVE_COMPARE all_success='+results.every(r=>r.status===200)+' same_digests='+ (results.every(r=>r.sha256)&&new Set(results.map(r=>r.sha256)).size===1));
fs.writeFileSync(build+'/origin-attack.txt',lines.join('\n')+'\n');
