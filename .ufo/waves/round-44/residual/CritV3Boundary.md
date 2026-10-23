RESULT CritV3Boundary rev=28e29bbe verdict=MET passed=150 cases=150 control_sha256=52f53d0e2171edfd5347f8080a40a6afb2e4d1d5d99abe6b4771f8295290b539
Axes: operability; coverage: orchestration and tooling. C1 claims operability only; no coverage move is evaluated here.
Frozen revision: 28e29bbea5f7f138214dd8e7e6d8d448ba925d40. Read both redesign sections and the round-43 verifier lesson. The counter and shape were extracted with git show at this revision in the pinned scratch clone.
Counterexample: source-names-only reaches MET while all six sourced members have no enforced or stored kind/permission rule. It only recognizes their names/templates. This skips claimed per-member work, not merely optional generations or sidecars.
Other MET removals: sourced kind, sourced ceiling, RULES.md ceiling, and chain end anchoring. Base presence also survives, but the minimum contract does not clearly require presence; that finding alone is not a skip-work control.
Evidence in the frozen counter: SOURCED lines 179-186 adds only CLEAN examples; buildCases lines 204-224 mutates snapshot members, not sourced additions; mode mutations require no existing group/other bits. No generated case appends junk to a valid chain generation.
Smallest safe correction: before census data, replace and freeze the counter with kind flips and an unset permission-bit addition for every sourced member, permission widening for 0644/0755 members, and junk-suffixed valid generations. Re-score these controls; do not amend p44c in place. No correction or admission was performed by this seat.
Method: seven independent one-piece removals from full-unscored.mjs, plus one cumulative source-only reduction. Each control is one Node built-ins-only file, shape reads are readdir/lstat only. Eight counter runs total, once per variant, all at seed 44c0. The complete reference and any real census candidate were not scored.
Frozen digest command: sha256sum /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv
d7b806eb06af78d4fbdd92c3cb3732e67fc06a69a3175f7b175bbfb57975f025  /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs
fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv
Cleanup: after every run, pgrep -af -- '[/]fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/<variant>.mjs' returned exit 1, no output; all work parents were removed. Final command: pgrep -af -- '[/]fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/'; observed exit=1, no output. Full commands, stdout and cleanup receipts: /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/<variant>.txt. No tools installed or updated.
Control source-names-only: Cumulative step from no-source-kind: remove sourced permission ceilings too; all six sourced members retain names/templates only, with no kind or mode facts. Exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/source-names-only.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/work-source-names-only --seed 44c0; observed exit=0, empty stderr.
```js
import { readdirSync, lstatSync } from 'node:fs'; import { join } from 'node:path';
const B = new Map('RULES.md,f,644 agent.db,f,600 agents,d,755 blobs,d,755 cache,d,755 config.yml,f,600 custom-session-files,d,755 history.db,f,644 hooks,d,755 kimi-device-id,f,600 last-changelog-version,f,644 mcp.json,f,600 mcp.json.rea.backup,f,600 models.db,f,644 models.yml,f,644 predict,d,755 sessions,d,755 skill-descriptions.db,f,600 terminal-sessions,d,755'.split(' ').map(x => { const [n,k,m] = x.split(','); return [n,[k,parseInt(m,8)]]; }));
const D = new Set('themes tools commands prompts memories'.split(' '));
const C = /^(?:agent\.db\.pre-restore-\d{8}T\d{6}Z(?:-(?:wal|shm))?|agent\.db\.recovered-\d{8}T\d{6}Z|history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?|mcp\.json\.pre-disable-\d{8}T\d{4}|mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery)$/;
const A = /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?$/;
const root = process.argv[process.argv.indexOf('--root') + 1]; let drift = false;
try { const names = readdirSync(root); drift = [...B.keys()].some(n => !names.includes(n));
for (const name of names) { const st = lstatSync(join(root,name)), source = D.has(name) || A.test(name), side = name.match(/^((?:agent|history|models|skill-descriptions)\.db)-(?:wal|shm)$/), rule = B.get(name) || (source ? [] : C.test(name) ? ['f',0o600] : side ? B.get(side[1]) : null);
if (!rule || (!source && ((st.isDirectory() ? 'd' : st.isFile() ? 'f' : '?') !== rule[0] || ((st.mode & 0o7777) & ~rule[1]) !== 0))) drift = true;
} } catch { drift = true; }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`); process.exit(drift ? 1 : 0);
```
P44_COUNT: MET (passed=150 cases=150 floor=20 census_sha256=52f53d0e2171edfd5347f8080a40a6afb2e4d1d5d99abe6b4771f8295290b539)
CASE src:commands expect=CLEAN exit=0 verdict=CLEAN P44=PASS +commands:dir:755
CASE src:prompts expect=CLEAN exit=0 verdict=CLEAN P44=PASS +prompts:dir:755
CASE src:agent.db.corrupt expect=CLEAN exit=0 verdict=CLEAN P44=PASS +agent.db.corrupt-1784042804620-904de077-5a75-45d4-9e43-0e5e449a9348:file:600 +agent.db.corrupt-1784042804620-904de077-5a75-45d4-9e43-0e5e449a9348-wal:file:600 +agent.db.corrupt-1784042804620-904de077-5a75-45d4-9e43-0e5e449a9348-shm:file:600
CASE src:memories expect=CLEAN exit=0 verdict=CLEAN P44=PASS +memories:dir:755
CASE src:themes expect=CLEAN exit=0 verdict=CLEAN P44=PASS +themes:dir:755
CASE src:tools expect=CLEAN exit=0 verdict=CLEAN P44=PASS +tools:dir:755
Control no-source-kind: Remove kind enforcement for the six sourced members only. Exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/no-source-kind.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/work-no-source-kind --seed 44c0; observed exit=0, empty stderr.
```js
import { readdirSync, lstatSync } from 'node:fs'; import { join } from 'node:path';
const B = new Map('RULES.md,f,644 agent.db,f,600 agents,d,755 blobs,d,755 cache,d,755 config.yml,f,600 custom-session-files,d,755 history.db,f,644 hooks,d,755 kimi-device-id,f,600 last-changelog-version,f,644 mcp.json,f,600 mcp.json.rea.backup,f,600 models.db,f,644 models.yml,f,644 predict,d,755 sessions,d,755 skill-descriptions.db,f,600 terminal-sessions,d,755'.split(' ').map(x => { const [n,k,m] = x.split(','); return [n,[k,parseInt(m,8)]]; }));
const D = new Set('themes tools commands prompts memories'.split(' '));
const C = /^(?:agent\.db\.pre-restore-\d{8}T\d{6}Z(?:-(?:wal|shm))?|agent\.db\.recovered-\d{8}T\d{6}Z|history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?|mcp\.json\.pre-disable-\d{8}T\d{4}|mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery)$/;
const A = /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?$/;
const root = process.argv[process.argv.indexOf('--root') + 1]; let drift = false;
try { const names = readdirSync(root); drift = [...B.keys()].some(n => !names.includes(n));
for (const name of names) { const st = lstatSync(join(root,name)), source = D.has(name) || A.test(name), side = name.match(/^((?:agent|history|models|skill-descriptions)\.db)-(?:wal|shm)$/), rule = B.get(name) || (D.has(name) ? ['d',0o755] : source || C.test(name) ? ['f',0o600] : side ? B.get(side[1]) : null);
if (!rule || (!source && (st.isDirectory() ? 'd' : st.isFile() ? 'f' : '?') !== rule[0]) || ((st.mode & 0o7777) & ~rule[1]) !== 0) drift = true;
} } catch { drift = true; }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`); process.exit(drift ? 1 : 0);
```
P44_COUNT: MET (passed=150 cases=150 floor=20 census_sha256=9f729345e53f1a568a083cdcd096f08d8c3b826eb9674ff4a0f88df5966db9d4)
Control no-source-mode: Remove permission ceiling enforcement for the six sourced members only. Exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/no-source-mode.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/work-no-source-mode --seed 44c0; observed exit=0, empty stderr.
```js
import { readdirSync, lstatSync } from 'node:fs'; import { join } from 'node:path';
const B = new Map('RULES.md,f,644 agent.db,f,600 agents,d,755 blobs,d,755 cache,d,755 config.yml,f,600 custom-session-files,d,755 history.db,f,644 hooks,d,755 kimi-device-id,f,600 last-changelog-version,f,644 mcp.json,f,600 mcp.json.rea.backup,f,600 models.db,f,644 models.yml,f,644 predict,d,755 sessions,d,755 skill-descriptions.db,f,600 terminal-sessions,d,755'.split(' ').map(x => { const [n,k,m] = x.split(','); return [n,[k,parseInt(m,8)]]; }));
const D = new Set('themes tools commands prompts memories'.split(' '));
const C = /^(?:agent\.db\.pre-restore-\d{8}T\d{6}Z(?:-(?:wal|shm))?|agent\.db\.recovered-\d{8}T\d{6}Z|history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?|mcp\.json\.pre-disable-\d{8}T\d{4}|mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery)$/;
const A = /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?$/;
const root = process.argv[process.argv.indexOf('--root') + 1]; let drift = false;
try { const names = readdirSync(root); drift = [...B.keys()].some(n => !names.includes(n));
for (const name of names) { const st = lstatSync(join(root,name)), source = D.has(name) || A.test(name), side = name.match(/^((?:agent|history|models|skill-descriptions)\.db)-(?:wal|shm)$/), rule = B.get(name) || (D.has(name) ? ['d',0o755] : source || C.test(name) ? ['f',0o600] : side ? B.get(side[1]) : null);
if (!rule || (st.isDirectory() ? 'd' : st.isFile() ? 'f' : '?') !== rule[0] || (!source && ((st.mode & 0o7777) & ~rule[1]) !== 0)) drift = true;
} } catch { drift = true; }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`); process.exit(drift ? 1 : 0);
```
P44_COUNT: MET (passed=150 cases=150 floor=20 census_sha256=f1536d3aae3b58f3975923bf9df9d39e200a3053216c9335d76d852d80c66c8a)
Control no-rules-mode: Remove the RULES.md permission ceiling only. Exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/no-rules-mode.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/work-no-rules-mode --seed 44c0; observed exit=0, empty stderr.
```js
import { readdirSync, lstatSync } from 'node:fs'; import { join } from 'node:path';
const B = new Map('RULES.md,f,644 agent.db,f,600 agents,d,755 blobs,d,755 cache,d,755 config.yml,f,600 custom-session-files,d,755 history.db,f,644 hooks,d,755 kimi-device-id,f,600 last-changelog-version,f,644 mcp.json,f,600 mcp.json.rea.backup,f,600 models.db,f,644 models.yml,f,644 predict,d,755 sessions,d,755 skill-descriptions.db,f,600 terminal-sessions,d,755'.split(' ').map(x => { const [n,k,m] = x.split(','); return [n,[k,parseInt(m,8)]]; }));
const D = new Set('themes tools commands prompts memories'.split(' '));
const C = /^(?:agent\.db\.pre-restore-\d{8}T\d{6}Z(?:-(?:wal|shm))?|agent\.db\.recovered-\d{8}T\d{6}Z|history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?|mcp\.json\.pre-disable-\d{8}T\d{4}|mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery)$/;
const A = /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?$/;
const root = process.argv[process.argv.indexOf('--root') + 1]; let drift = false;
try { const names = readdirSync(root); drift = [...B.keys()].some(n => !names.includes(n));
for (const name of names) { const st = lstatSync(join(root,name)), source = D.has(name) || A.test(name), side = name.match(/^((?:agent|history|models|skill-descriptions)\.db)-(?:wal|shm)$/), rule = B.get(name) || (D.has(name) ? ['d',0o755] : source || C.test(name) ? ['f',0o600] : side ? B.get(side[1]) : null);
if (!rule || (st.isDirectory() ? 'd' : st.isFile() ? 'f' : '?') !== rule[0] || (name !== 'RULES.md' && ((st.mode & 0o7777) & ~rule[1]) !== 0)) drift = true;
} } catch { drift = true; }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`); process.exit(drift ? 1 : 0);
```
P44_COUNT: MET (passed=150 cases=150 floor=20 census_sha256=62d1f840f9f5bc01002882ba1c8e4df38f674e762dc91fde2d76dba174440b52)
CASE swap:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS ~RULES.md<->custom-session-files
Control no-chain-end-anchor: Remove the end anchor from the five snapshot chain-family templates only; owner and internal grammar remain. Exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/no-chain-end-anchor.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/work-no-chain-end-anchor --seed 44c0; observed exit=0, empty stderr.
```js
import { readdirSync, lstatSync } from 'node:fs'; import { join } from 'node:path';
const B = new Map('RULES.md,f,644 agent.db,f,600 agents,d,755 blobs,d,755 cache,d,755 config.yml,f,600 custom-session-files,d,755 history.db,f,644 hooks,d,755 kimi-device-id,f,600 last-changelog-version,f,644 mcp.json,f,600 mcp.json.rea.backup,f,600 models.db,f,644 models.yml,f,644 predict,d,755 sessions,d,755 skill-descriptions.db,f,600 terminal-sessions,d,755'.split(' ').map(x => { const [n,k,m] = x.split(','); return [n,[k,parseInt(m,8)]]; }));
const D = new Set('themes tools commands prompts memories'.split(' '));
const C = /^(?:agent\.db\.pre-restore-\d{8}T\d{6}Z(?:-(?:wal|shm))?|agent\.db\.recovered-\d{8}T\d{6}Z|history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?|mcp\.json\.pre-disable-\d{8}T\d{4}|mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery)/;
const A = /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?$/;
const root = process.argv[process.argv.indexOf('--root') + 1]; let drift = false;
try { const names = readdirSync(root); drift = [...B.keys()].some(n => !names.includes(n));
for (const name of names) { const st = lstatSync(join(root,name)), source = D.has(name) || A.test(name), side = name.match(/^((?:agent|history|models|skill-descriptions)\.db)-(?:wal|shm)$/), rule = B.get(name) || (D.has(name) ? ['d',0o755] : source || C.test(name) ? ['f',0o600] : side ? B.get(side[1]) : null);
if (!rule || (st.isDirectory() ? 'd' : st.isFile() ? 'f' : '?') !== rule[0] || ((st.mode & 0o7777) & ~rule[1]) !== 0) drift = true;
} } catch { drift = true; }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`); process.exit(drift ? 1 : 0);
```
P44_COUNT: MET (passed=150 cases=150 floor=20 census_sha256=774d5ab5da7b1a90932e6a45ec578a05a03ee451eaacbb294bc0ca5c007245aa)
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS +mcp.json.rea.backup.1b1d258bb75318b4ce472b0cfb78bc751a8e21f20b2baed7efe4bc48c737dbc3.recovery:file:600
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS +predict.pre-restore-20270614T103316Z-shm:file:600
Control no-base-presence: Remove required presence of the 19 base members only; retain their name, kind and ceiling rules. This is a non-decisive boundary outside the explicit minimum. Exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/no-base-presence.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/work-no-base-presence --seed 44c0; observed exit=0, empty stderr.
```js
import { readdirSync, lstatSync } from 'node:fs'; import { join } from 'node:path';
const B = new Map('RULES.md,f,644 agent.db,f,600 agents,d,755 blobs,d,755 cache,d,755 config.yml,f,600 custom-session-files,d,755 history.db,f,644 hooks,d,755 kimi-device-id,f,600 last-changelog-version,f,644 mcp.json,f,600 mcp.json.rea.backup,f,600 models.db,f,644 models.yml,f,644 predict,d,755 sessions,d,755 skill-descriptions.db,f,600 terminal-sessions,d,755'.split(' ').map(x => { const [n,k,m] = x.split(','); return [n,[k,parseInt(m,8)]]; }));
const D = new Set('themes tools commands prompts memories'.split(' '));
const C = /^(?:agent\.db\.pre-restore-\d{8}T\d{6}Z(?:-(?:wal|shm))?|agent\.db\.recovered-\d{8}T\d{6}Z|history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?|mcp\.json\.pre-disable-\d{8}T\d{4}|mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery)$/;
const A = /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?$/;
const root = process.argv[process.argv.indexOf('--root') + 1]; let drift = false;
try { const names = readdirSync(root); drift = false;
for (const name of names) { const st = lstatSync(join(root,name)), source = D.has(name) || A.test(name), side = name.match(/^((?:agent|history|models|skill-descriptions)\.db)-(?:wal|shm)$/), rule = B.get(name) || (D.has(name) ? ['d',0o755] : source || C.test(name) ? ['f',0o600] : side ? B.get(side[1]) : null);
if (!rule || (st.isDirectory() ? 'd' : st.isFile() ? 'f' : '?') !== rule[0] || ((st.mode & 0o7777) & ~rule[1]) !== 0) drift = true;
} } catch { drift = true; }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`); process.exit(drift ? 1 : 0);
```
P44_COUNT: MET (passed=150 cases=150 floor=20 census_sha256=eec94a3b99012e8fc90b71bf94a7ca733fb545bcfd624a2090937ce1c1a7ad96)
Control no-themes-name: Remove the sourced themes member name only; negative boundary control. Exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/no-themes-name.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/work-no-themes-name --seed 44c0; observed exit=1, empty stderr.
```js
import { readdirSync, lstatSync } from 'node:fs'; import { join } from 'node:path';
const B = new Map('RULES.md,f,644 agent.db,f,600 agents,d,755 blobs,d,755 cache,d,755 config.yml,f,600 custom-session-files,d,755 history.db,f,644 hooks,d,755 kimi-device-id,f,600 last-changelog-version,f,644 mcp.json,f,600 mcp.json.rea.backup,f,600 models.db,f,644 models.yml,f,644 predict,d,755 sessions,d,755 skill-descriptions.db,f,600 terminal-sessions,d,755'.split(' ').map(x => { const [n,k,m] = x.split(','); return [n,[k,parseInt(m,8)]]; }));
const D = new Set('tools commands prompts memories'.split(' '));
const C = /^(?:agent\.db\.pre-restore-\d{8}T\d{6}Z(?:-(?:wal|shm))?|agent\.db\.recovered-\d{8}T\d{6}Z|history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?|mcp\.json\.pre-disable-\d{8}T\d{4}|mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery)$/;
const A = /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?$/;
const root = process.argv[process.argv.indexOf('--root') + 1]; let drift = false;
try { const names = readdirSync(root); drift = [...B.keys()].some(n => !names.includes(n));
for (const name of names) { const st = lstatSync(join(root,name)), source = D.has(name) || A.test(name), side = name.match(/^((?:agent|history|models|skill-descriptions)\.db)-(?:wal|shm)$/), rule = B.get(name) || (D.has(name) ? ['d',0o755] : source || C.test(name) ? ['f',0o600] : side ? B.get(side[1]) : null);
if (!rule || (st.isDirectory() ? 'd' : st.isFile() ? 'f' : '?') !== rule[0] || ((st.mode & 0o7777) & ~rule[1]) !== 0) drift = true;
} } catch { drift = true; }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`); process.exit(drift ? 1 : 0);
```
P44_COUNT: UNMET (passed=149 cases=150 floor=20 census_sha256=9e29d81081e076d7ffe6cc8fe642d0fd38cd55835fa74d7f6def9e78eb3f1953)
CASE src:themes expect=CLEAN exit=1 verdict=DRIFT P44=FAIL +themes:dir:755
Control no-sessions-kind: Remove sessions kind enforcement only; negative boundary control. Exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44c-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/no-sessions-kind.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/res-CritV3Boundary/work-no-sessions-kind --seed 44c0; observed exit=1, empty stderr.
```js
import { readdirSync, lstatSync } from 'node:fs'; import { join } from 'node:path';
const B = new Map('RULES.md,f,644 agent.db,f,600 agents,d,755 blobs,d,755 cache,d,755 config.yml,f,600 custom-session-files,d,755 history.db,f,644 hooks,d,755 kimi-device-id,f,600 last-changelog-version,f,644 mcp.json,f,600 mcp.json.rea.backup,f,600 models.db,f,644 models.yml,f,644 predict,d,755 sessions,d,755 skill-descriptions.db,f,600 terminal-sessions,d,755'.split(' ').map(x => { const [n,k,m] = x.split(','); return [n,[k,parseInt(m,8)]]; }));
const D = new Set('themes tools commands prompts memories'.split(' '));
const C = /^(?:agent\.db\.pre-restore-\d{8}T\d{6}Z(?:-(?:wal|shm))?|agent\.db\.recovered-\d{8}T\d{6}Z|history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?|mcp\.json\.pre-disable-\d{8}T\d{4}|mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery)$/;
const A = /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:-(?:wal|shm|journal))?$/;
const root = process.argv[process.argv.indexOf('--root') + 1]; let drift = false;
try { const names = readdirSync(root); drift = [...B.keys()].some(n => !names.includes(n));
for (const name of names) { const st = lstatSync(join(root,name)), source = D.has(name) || A.test(name), side = name.match(/^((?:agent|history|models|skill-descriptions)\.db)-(?:wal|shm)$/), rule = B.get(name) || (D.has(name) ? ['d',0o755] : source || C.test(name) ? ['f',0o600] : side ? B.get(side[1]) : null);
if (!rule || (name !== 'sessions' && (st.isDirectory() ? 'd' : st.isFile() ? 'f' : '?') !== rule[0]) || ((st.mode & 0o7777) & ~rule[1]) !== 0) drift = true;
} } catch { drift = true; }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`); process.exit(drift ? 1 : 0);
```
P44_COUNT: UNMET (passed=149 cases=150 floor=20 census_sha256=2241de5f607e016a8271adcd47d27baa30996135a1795bd4b6150ae6e4311999)
CASE kind:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL ~sessions:file
