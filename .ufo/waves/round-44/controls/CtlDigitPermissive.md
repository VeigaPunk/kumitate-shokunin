RESULT CtlDigitPermissive rev=292d9266 verdict=UNMET passed=59 cases=87 control_sha256=cee2d8f2e3427202650ff1e288a28d34522619ccf151bc43ba0f639420f905d4 variant=2
RESULT CtlDigitPermissive rev=292d9266 verdict=UNMET passed=58 cases=87 control_sha256=9620d01a1b9549d1acece4737f61f16f94d2666f8f08ac05e237043089c31efc variant=1
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8. Axis: operability. Coverage is not claimed by this item.
Finding: neither control reached MET. Variant 1 failed 29 cases; variant 2 failed 28 cases.
Counterexample: both controls accepted all 19 neardigit cases and all nine crossgen cases as CLEAN when DRIFT was expected.
Evidence: CASE neardigit:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL occurred in both runs.
Evidence: CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=0 verdict=CLEAN P44=FAIL occurred in both runs.
Variant 1 also accepted stray-digit; variant 2 rejected it. The prefix requirement fixes only that one case.
Smallest safe correction: no counter change is indicated by these two controls; retain family-specific templates, kinds and permission ceilings in the real census rather than generic digit or prefix authority.
These are controls: the 19 bases and their optional sidecars have kind/mode checks, but numeric extras have no family template, kind rule or permission rule.
One standalone control file was used and changed once, from requirePrefix=false to requirePrefix=true. Each variant was scored exactly once; no real census was scored.
No tools were installed or updated. No operator configuration was changed. Counter work directories were removed after each run.
Checkout command: env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane checkout -q --detach 292d92668ff80973547a8b10d12ffb5a48f2d7d8; observed exit=0, empty output.
Extraction command 1: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44b-count.mjs; stdout saved with write to /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44b-count.mjs.
Extraction command 2: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44-shape.tsv; stdout saved with write to /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44-shape.tsv.
Hash command: sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44-shape.tsv
Observed: 6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44b-count.mjs
Observed: fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44-shape.tsv
Variant 1 command (cwd=/fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane): systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane/control.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane/p44work
Variant 1 observed: exit=1; stderr=""; complete stdout below.
After variant 1 command: pgrep -af /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive; observed empty stdout, exit=1 (no remaining matching process).
After variant 1 cleanup command: rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane/p44work; observed empty stdout/stderr, exit=0.
Variant 2 command (cwd=/fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane): systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane/control.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane/p44work
Variant 2 observed: exit=1; stderr=""; complete stdout below.
After variant 2 command: pgrep -af /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive; observed empty stdout, exit=1 (no remaining matching process).
After variant 2 cleanup command: rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane/p44work; observed empty stdout/stderr, exit=0.
Complete stdout is represented as lossless JSON strings to stay within the 150-line report cap; escaped newlines preserve every original line, with no omissions.
The same complete, unescaped stdout is retained at /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/variant-1.stdout.txt and /fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/variant-2.stdout.txt.

## Variant 1 full source
```js
import { lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const requirePrefix = false;
const members = new Map([
  ['RULES.md', ['file', 0o644]], ['agent.db', ['file', 0o600]],
  ['agents', ['dir', 0o755]], ['blobs', ['dir', 0o755]],
  ['cache', ['dir', 0o755]], ['config.yml', ['file', 0o600]],
  ['custom-session-files', ['dir', 0o755]], ['history.db', ['file', 0o644]],
  ['hooks', ['dir', 0o755]], ['kimi-device-id', ['file', 0o600]],
  ['last-changelog-version', ['file', 0o644]], ['mcp.json', ['file', 0o600]],
  ['mcp.json.rea.backup', ['file', 0o600]], ['models.db', ['file', 0o644]],
  ['models.yml', ['file', 0o644]], ['predict', ['dir', 0o755]],
  ['sessions', ['dir', 0o755]], ['skill-descriptions.db', ['file', 0o600]],
  ['terminal-sessions', ['dir', 0o755]],
]);
const bases = [...members.keys()];
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--root') process.exit(64);
let clean = true;
try {
  const names = readdirSync(args[1]);
  for (const [name, [kind, mode]] of members) {
    const st = lstatSync(join(args[1], name));
    if (!(kind === 'file' ? st.isFile() : st.isDirectory()) || (st.mode & 0o7777) !== mode) clean = false;
  }
  for (const name of names) {
    if (members.has(name)) continue;
    const stem = name.replace(/-(shm|wal)$/, '');
    if (stem !== name && members.has(stem)) {
      const st = lstatSync(join(args[1], name));
      const [kind, mode] = members.get(stem);
      if (kind !== 'file' || !st.isFile() || (st.mode & 0o7777) !== mode) clean = false;
      continue;
    }
    const numeric = /[0-9]{4,}|[0-9a-f]{16,}/i.test(name);
    if (!numeric || (requirePrefix && !bases.some((base) => name.startsWith(base)))) clean = false;
  }
} catch {
  clean = false;
}
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exit(clean ? 0 : 1);
```
## Variant 1 complete stdout (JSON string)
```json
"P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517\nP44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane/control.mjs sha256=9620d01a1b9549d1acece4737f61f16f94d2666f8f08ac05e237043089c31efc\nP44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87\nCASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE stray-digit expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nP44_COUNT: UNMET (passed=58 cases=87 floor=20 census_sha256=9620d01a1b9549d1acece4737f61f16f94d2666f8f08ac05e237043089c31efc)\n"
```

## Variant 2 full source
```js
import { lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const requirePrefix = true;
const members = new Map([
  ['RULES.md', ['file', 0o644]], ['agent.db', ['file', 0o600]],
  ['agents', ['dir', 0o755]], ['blobs', ['dir', 0o755]],
  ['cache', ['dir', 0o755]], ['config.yml', ['file', 0o600]],
  ['custom-session-files', ['dir', 0o755]], ['history.db', ['file', 0o644]],
  ['hooks', ['dir', 0o755]], ['kimi-device-id', ['file', 0o600]],
  ['last-changelog-version', ['file', 0o644]], ['mcp.json', ['file', 0o600]],
  ['mcp.json.rea.backup', ['file', 0o600]], ['models.db', ['file', 0o644]],
  ['models.yml', ['file', 0o644]], ['predict', ['dir', 0o755]],
  ['sessions', ['dir', 0o755]], ['skill-descriptions.db', ['file', 0o600]],
  ['terminal-sessions', ['dir', 0o755]],
]);
const bases = [...members.keys()];
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--root') process.exit(64);
let clean = true;
try {
  const names = readdirSync(args[1]);
  for (const [name, [kind, mode]] of members) {
    const st = lstatSync(join(args[1], name));
    if (!(kind === 'file' ? st.isFile() : st.isDirectory()) || (st.mode & 0o7777) !== mode) clean = false;
  }
  for (const name of names) {
    if (members.has(name)) continue;
    const stem = name.replace(/-(shm|wal)$/, '');
    if (stem !== name && members.has(stem)) {
      const st = lstatSync(join(args[1], name));
      const [kind, mode] = members.get(stem);
      if (kind !== 'file' || !st.isFile() || (st.mode & 0o7777) !== mode) clean = false;
      continue;
    }
    const numeric = /[0-9]{4,}|[0-9a-f]{16,}/i.test(name);
    if (!numeric || (requirePrefix && !bases.some((base) => name.startsWith(base)))) clean = false;
  }
} catch {
  clean = false;
}
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exit(clean ? 0 : 1);
```
## Variant 2 complete stdout (JSON string)
```json
"P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517\nP44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/lane/control.mjs sha256=cee2d8f2e3427202650ff1e288a28d34522619ccf151bc43ba0f639420f905d4\nP44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlDigitPermissive/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nP44_COUNT: UNMET (passed=59 cases=87 floor=20 census_sha256=cee2d8f2e3427202650ff1e288a28d34522619ccf151bc43ba0f639420f905d4)\n"
```
