RESULT CtlPartialNoMode rev=292d9266 verdict=UNMET passed=81 cases=87 control_sha256=9eb5d0713c81a7525cfc14dfa74c8c4f17e5bd26cde1a0ff7527b2b09773a135
Axes: operability (assigned); coverage unchanged and not claimed.
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8.
Control defect: omit permission checks only; retain exact base names/kinds, owner-anchored chain templates, optional generations and sidecars. Member contents are never read.
Expected detector: the frozen P44 counter must read UNMET because widened permissions are accepted by this partial-work control.
Observed: UNMET, 81/87. Only these six cases failed: mode:mcp.json, mode:config.yml, mode:kimi-device-id, mode:skill-descriptions.db, mode:mcp.json.rea.backup, mode:agent.db. All other cases, including control/control-end, passed.
Exact single detector command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/lane/partial-no-mode.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/p44work`
Detector output: exit=1; stderr=(empty). Counter invoked once; no real census candidate was scored.
Before/after hash command: `sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/lane/partial-no-mode.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/p44-shape.tsv`; identical output on both executions:
```text
9eb5d0713c81a7525cfc14dfa74c8c4f17e5bd26cde1a0ff7527b2b09773a135  /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/lane/partial-no-mode.mjs
6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/p44b-count.mjs
fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/p44-shape.tsv
```
Restoration evidence: newly created scratch control, no pristine source overwritten; control and frozen input bytes remain unchanged. This is a rejected control, not a pristine/mutant/restored kill claim.
Process check: `pgrep -af '/fast/scratch/hyaku/kumitate-r44/seats/[C]tlPartialNoMode/'` → exit=1, stdout=(empty).
Temporary mirror cleanup: `rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/p44work` → exit=0, stdout=(empty), stderr=(empty).
Tools installed or updated: none.
## Full control source
```js
#!/usr/bin/env node
// Partial-work control: per-member names and kinds, optional sidecars/chains; no permission rule.
import { lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const base = new Map([
  ...'RULES.md agent.db config.yml history.db kimi-device-id last-changelog-version mcp.json mcp.json.rea.backup models.db models.yml skill-descriptions.db'.split(' ').map(n => [n, 'file']),
  ...'agents blobs cache custom-session-files hooks predict sessions terminal-sessions'.split(' ').map(n => [n, 'dir']),
]);
const chains = [
  /^agent\.db\.pre-restore-[0-9]{8}T[0-9]{6}Z(?:-(?:shm|wal))?$/,
  /^agent\.db\.recovered-[0-9]{8}T[0-9]{6}Z$/,
  /^history\.db\.corrupt-[0-9]{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-(?:shm|wal))?$/,
  /^mcp\.json\.pre-disable-[0-9]{8}T[0-9]{4}$/,
  /^mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery$/,
];
const sidecars = /^(?:agent\.db|history\.db|models\.db|skill-descriptions\.db)-(?:shm|wal)$/;
if (process.argv.length !== 4 || process.argv[2] !== '--root') process.exit(64);
let clean = true;
try {
  const root = process.argv[3];
  const names = new Set(readdirSync(root));
  for (const name of base.keys()) if (!names.has(name)) clean = false;
  for (const name of names) {
    const kind = base.get(name) ?? (sidecars.test(name) || chains.some(r => r.test(name)) ? 'file' : undefined);
    const st = lstatSync(join(root, name));
    if (!kind || (kind === 'dir' ? !st.isDirectory() : !st.isFile())) clean = false;
  }
} catch {
  clean = false;
}
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exit(clean ? 0 : 1);
```
## Complete counter stdout
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/lane/partial-no-mode.mjs sha256=9eb5d0713c81a7525cfc14dfa74c8c4f17e5bd26cde1a0ff7527b2b09773a135
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoMode/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE mode:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE mode:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS
P44_COUNT: UNMET (passed=81 cases=87 floor=20 census_sha256=9eb5d0713c81a7525cfc14dfa74c8c4f17e5bd26cde1a0ff7527b2b09773a135)
```
