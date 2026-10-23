RESULT CtlPostDataA rev=8e822511 verdict=MET best=207/207
Three NEW skip-work controls read MET under frozen p44d. Under plan.md kill rule 2, this fails C1 after data; it does not authorize a redesign or replacement measurement. No canonical judge was invoked.
Axes: operability (the counter accepts programs that omit per-member rules); coverage is not claimed this round. This is a falsification of C1, not an assessment of the shipped census implementation.
Counterexample: each control accepts an unknown replacement for agents while retaining its directory kind and 0755 mode. The replacements are qqdwgo (modular collision), ddfnts (position-moment collision), and agenta (edit distance one). All three actually printed CLEAN in the same cleared-environment bubblewrap arrangement as P44.
Work skipped: no control contains a per-member name/template + kind + permission-ceiling table. Two contain no literal member names at all. They compare lossy whole-shape numeric aggregates with a finite catalog of 18 accepted projections; the third first allows one edit in a normalized name. Generic digit/UUID normalization is not an owner-anchored chain rule.
Provenance: catalog constants were constructed before scoring from the frozen 38-row shape and p44d's CLEAN shapes: baseline, nine generation additions, no-sidecars, no-chains, the corrupt database addition, and the five RESERVED directories. They are generator-label knowledge, not independently sourced writer rules.
Scope: lane tip 8e8225114dccb31d33fbcb76df78052807a33068; counter and shape from 32b7fd561dae38b951828dde8fe11052737fb824; real census extracted only from d81978cdfefdc7409eb26a6363111d6682154093 and never executed by this seat.
Extract command for each following pair: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show REV:PATH (captured verbatim into the named scratch file; GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE unset).
REV=32b7fd561dae38b951828dde8fe11052737fb824 PATH=.ufo/waves/round-44/probe/p44d-count.mjs; observed sha256=9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e.
REV=32b7fd561dae38b951828dde8fe11052737fb824 PATH=.ufo/waves/round-44/probe/p44-shape.tsv; observed sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71.
REV=d81978cdfefdc7409eb26a6363111d6682154093 PATH=scripts/omp-census.mjs; observed sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7.
Each variant was scored ONCE, concurrently, seed 2676cbe767adc1820fd316e02a7b9020. Standalone witness runs below were not counter re-scores. Full receipts and individual .mjs files remain under /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA.
## modular-tolerance
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/modular-tolerance.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44work-modular-tolerance --seed 2676cbe767adc1820fd316e02a7b9020
P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=73f89139fa6865d402388cf93c2cfa02d93ef97efc80fba207f9433f5008474f)
Observed: exit=0; stderr=""; 207 PASS lines, zero FAIL lines.
Full source (modular-tolerance.mjs):
```js
// Skip-work control: tolerant whole-shape aggregate; no member rules.
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
const norm=n=>n.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,'<U>').replace(/[0-9a-f]{16,}/g,'<H>').replace(/[0-9]{4,}/g,'<D>');
const rows=readdirSync(process.argv[3]).map(n=>{const s=lstatSync(join(process.argv[3],n));return [norm(n),s.isFile()?1:s.isDirectory()?2:3,s.mode&0o777];});
const feature=n=>{let h=2166136261;for(const c of n)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h%65521;};
const TOL=2,allowed=[[38,1233404,1423638,504294754],[39,1276428,1466662,520815970],[39,1250765,1440999,510961378],[39,1241826,1432060,507528802],[39,1243662,1433896,508233826],[39,1260925,1451159,514862818],[39,1285851,1476085,524434402],[39,1288142,1478376,525314146],[39,1282348,1472582,523089250],[39,1276493,1466727,520840930],[26,843492,1033726,351068842],[27,841422,1031656,353773666],[41,1350587,1540821,549293026],[39,1238758,1434346,506934276],[39,1244484,1445798,509757194],[39,1258212,1473254,516525098],[39,1271748,1500326,523198346],[39,1244957,1446744,509990383]];
const got=[rows.length,0,0,0];
for(const [n,k,m] of rows){const h=feature(n);got[1]+=h;got[2]+=h*k;got[3]+=h*m;}
const ok=allowed.some(a=>a.every((x,i)=>Math.abs(x-got[i])<=(i===0?0:TOL)));
console.log('OMP_CENSUS: '+(ok?'CLEAN':'DRIFT'));process.exitCode=ok?0:1;
```
Standalone fixture: the frozen shape, only agents:dir:755 renamed to qqdwgo:dir:755; expected DRIFT by the member-name contract.
Standalone command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bwrap --unshare-all --die-with-parent --new-session --clearenv --ro-bind /usr /usr --symlink usr/lib /lib --symlink usr/lib64 /lib64 --symlink usr/bin /bin --ro-bind /home/vgpnk/.local/share/mise/installs/node/26.12.0 /n --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/witness-modular-tolerance/c /c --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/witness-modular-tolerance/r /r --tmpfs /tmp --proc /proc --dev /dev --dir /h --setenv HOME /h --setenv PATH /n/bin:/usr/bin --chdir /h /n/bin/node --max-old-space-size=256 /c/omp-census.mjs --root /r
Observed: stdout="OMP_CENSUS: CLEAN\n"; exit=0; stderr="".
After counter: pgrep -af -- /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44work-modular-tolerance -> exit=1 stdout="" stderr=""; rmdir exit=0.
After standalone: pgrep -af -- /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/witness-modular-tolerance -> exit=1 stdout="" stderr=""; removed witness directory.
## position-moments
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/position-moments.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44work-position-moments --seed 2676cbe767adc1820fd316e02a7b9020
P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=c1b47177862c4da7eabf3f0fe72d59556ddcf2d123a3d6a0895a375ea67bde2b)
Observed: exit=0; stderr=""; 207 PASS lines, zero FAIL lines.
Full source (position-moments.mjs):
```js
// Skip-work control: lossy position-moment whole-shape aggregate; no member rules.
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
const norm=n=>n.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,'<U>').replace(/[0-9a-f]{16,}/g,'<H>').replace(/[0-9]{4,}/g,'<D>');
const rows=readdirSync(process.argv[3]).map(n=>{const s=lstatSync(join(process.argv[3],n));return [norm(n),s.isFile()?1:s.isDirectory()?2:3,s.mode&0o777];});
const feature=n=>{let a=0,b=0;for(let i=0;i<n.length;i++){a+=(i+1)*n.charCodeAt(i);b+=(i+1)**2*n.charCodeAt(i);}return n.length*10000000+a*1000+b;};
const TOL=0,allowed=[[38,7463988311,8246241560,2995103078469],[39,7790908136,8573161385,3120640291269],[39,7843124348,8625377597,3140691316677],[39,7842986935,8625240184,3140638550085],[39,7765684464,8547937713,3110954401221],[39,7753288500,8535541749,3106194351045],[39,7804318029,8586571278,3125789690181],[39,7804193378,8586446627,3125741824197],[39,7777722345,8559975594,3115576947525],[39,7835099877,8617353126,3137609919813],[26,4627337677,5409590926,1885022705469],[27,3680333966,4462587215,1542179809989],[41,8357828886,9140082135,3338337859269],[39,7526256161,8370777260,3025801128519],[39,7515672473,8349609884,3020583370335],[39,7547859224,8413983386,3036451438578],[39,7537174233,8392613404,3031183738015],[39,7547919520,8414103978,3036481164506]];
const got=[rows.length,0,0,0];
for(const [n,k,m] of rows){const h=feature(n);got[1]+=h;got[2]+=h*k;got[3]+=h*m;}
const ok=allowed.some(a=>a.every((x,i)=>Math.abs(x-got[i])<=(i===0?0:TOL)));
console.log('OMP_CENSUS: '+(ok?'CLEAN':'DRIFT'));process.exitCode=ok?0:1;
```
Standalone fixture: the frozen shape, only agents:dir:755 renamed to ddfnts:dir:755; expected DRIFT by the member-name contract.
Standalone command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bwrap --unshare-all --die-with-parent --new-session --clearenv --ro-bind /usr /usr --symlink usr/lib /lib --symlink usr/lib64 /lib64 --symlink usr/bin /bin --ro-bind /home/vgpnk/.local/share/mise/installs/node/26.12.0 /n --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/witness-position-moments/c /c --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/witness-position-moments/r /r --tmpfs /tmp --proc /proc --dev /dev --dir /h --setenv HOME /h --setenv PATH /n/bin:/usr/bin --chdir /h /n/bin/node --max-old-space-size=256 /c/omp-census.mjs --root /r
Observed: stdout="OMP_CENSUS: CLEAN\n"; exit=0; stderr="".
After counter: pgrep -af -- /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44work-position-moments -> exit=1 stdout="" stderr=""; rmdir exit=0.
After standalone: pgrep -af -- /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/witness-position-moments -> exit=1 stdout="" stderr=""; removed witness directory.
## edit-radius-one
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/edit-radius-one.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44work-edit-radius-one --seed 2676cbe767adc1820fd316e02a7b9020
P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=5360e5ab233475cfeaf4ebe40cea47459e80d798386d025354ac658d2652ad06)
Observed: exit=0; stderr=""; 207 PASS lines, zero FAIL lines.
Full source (edit-radius-one.mjs):
```js
// Skip-work control: radius-one identity matching and whole-shape aggregates.
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
const norm=n=>n.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,'<U>').replace(/[0-9a-f]{16,}/g,'<H>').replace(/[0-9]{4,}/g,'<D>');
const rows=readdirSync(process.argv[3]).map(n=>{const s=lstatSync(join(process.argv[3],n));return [norm(n),s.isFile()?1:s.isDirectory()?2:3,s.mode&0o777];});
const pool=["RULES.md","agent.db","agent.db-shm","agent.db-wal","agent.db.corrupt-<D>-<U>","agent.db.corrupt-<D>-<U>-shm","agent.db.corrupt-<D>-<U>-wal","agent.db.pre-restore-<D>T<D>Z","agent.db.pre-restore-<D>T<D>Z-shm","agent.db.pre-restore-<D>T<D>Z-wal","agent.db.recovered-<D>T<D>Z","agents","blobs","cache","commands","config.yml","custom-session-files","history.db","history.db-shm","history.db-wal","history.db.corrupt-<D>-<U>","history.db.corrupt-<D>-<U>-shm","history.db.corrupt-<D>-<U>-wal","hooks","kimi-device-id","last-changelog-version","mcp.json","mcp.json.pre-disable-<D>T<D>","mcp.json.rea.backup","mcp.json.rea.backup.<H>.recovery","memories","models.db","models.db-shm","models.db-wal","models.yml","predict","prompts","sessions","skill-descriptions.db","skill-descriptions.db-shm","skill-descriptions.db-wal","terminal-sessions","themes","tools"];
const distance=(a,b)=>{let p=Array.from({length:b.length+1},(_,j)=>j);for(let i=1;i<=a.length;i++){const q=[i];for(let j=1;j<=b.length;j++)q[j]=Math.min(q[j-1]+1,p[j]+1,p[j-1]+(a[i-1]!==b[j-1]));p=q;}return p[b.length];};
for(const r of rows){if(!pool.includes(r[0])){const near=pool.filter(n=>distance(r[0],n)<=1);if(near.length===1)r[0]=near[0];}}
const feature=n=>{let h=2166136261;for(const c of n)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h%65521;};
const TOL=2,allowed=[[38,1233404,1423638,504294754],[39,1276428,1466662,520815970],[39,1250765,1440999,510961378],[39,1241826,1432060,507528802],[39,1243662,1433896,508233826],[39,1260925,1451159,514862818],[39,1285851,1476085,524434402],[39,1288142,1478376,525314146],[39,1282348,1472582,523089250],[39,1276493,1466727,520840930],[26,843492,1033726,351068842],[27,841422,1031656,353773666],[41,1350587,1540821,549293026],[39,1238758,1434346,506934276],[39,1244484,1445798,509757194],[39,1258212,1473254,516525098],[39,1271748,1500326,523198346],[39,1244957,1446744,509990383]];
const got=[rows.length,0,0,0];
for(const [n,k,m] of rows){const h=feature(n);got[1]+=h;got[2]+=h*k;got[3]+=h*m;}
const ok=allowed.some(a=>a.every((x,i)=>Math.abs(x-got[i])<=(i===0?0:TOL)));
console.log('OMP_CENSUS: '+(ok?'CLEAN':'DRIFT'));process.exitCode=ok?0:1;
```
Standalone fixture: the frozen shape, only agents:dir:755 renamed to agenta:dir:755; expected DRIFT by the member-name contract.
Standalone command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bwrap --unshare-all --die-with-parent --new-session --clearenv --ro-bind /usr /usr --symlink usr/lib /lib --symlink usr/lib64 /lib64 --symlink usr/bin /bin --ro-bind /home/vgpnk/.local/share/mise/installs/node/26.12.0 /n --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/witness-edit-radius-one/c /c --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/witness-edit-radius-one/r /r --tmpfs /tmp --proc /proc --dev /dev --dir /h --setenv HOME /h --setenv PATH /n/bin:/usr/bin --chdir /h /n/bin/node --max-old-space-size=256 /c/omp-census.mjs --root /r
Observed: stdout="OMP_CENSUS: CLEAN\n"; exit=0; stderr="".
After counter: pgrep -af -- /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/p44work-edit-radius-one -> exit=1 stdout="" stderr=""; rmdir exit=0.
After standalone: pgrep -af -- /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA/witness-edit-radius-one -> exit=1 stdout="" stderr=""; removed witness directory.
## Relevant frozen-counter evidence (identical for all three variants)
P44 counter=p44d-count.mjs sha256=9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e seed=2676cbe767adc1820fd316e02a7b9020
CASE srcwide:themes expect=DRIFT exit=1 verdict=DRIFT P44=PASS +themes:dir:775
CASE srckind:themes expect=DRIFT exit=1 verdict=DRIFT P44=PASS +themes:file:644
CASE src:themes expect=CLEAN exit=0 verdict=CLEAN P44=PASS +themes:dir:755
CASE junkgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS +agent.db.pre-restore-20260909T131040Zrw:file:600
CASE swap:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS ~agents<->skill-descriptions.db
CASE anagram:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS ~agents->tegasn
Modular witness: feature(agents)=feature(qqdwgo)=1492. Position witness: feature(agents)=feature(ddfnts)=62326218. These are concrete discarded-identity collisions, not speculative hash risks.
Smallest safe correction: record C1 as failed under the existing post-data kill rule and retain these controls/receipts. Do not amend p44d or relabel these controls as implementations. A different future claim would need a new pre-data design; no such repair is tested here.
Safety: no operator-owned member contents or secrets were read, no host configuration changed, no tool was installed or updated, and no gate-mutants or census suite was run. All six Node invocations were resource-bounded; temporary counter and witness directories were removed after the per-run process checks.
Final command: pgrep -af -- /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlPostDataA; observed exit=1 stdout="" stderr="". Runs completed 2026-10-23T01:58:36Z.
