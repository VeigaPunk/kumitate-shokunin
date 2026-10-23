RESULT CtlPartialUnanchored rev=292d9266 verdict=UNMET passed=78 cases=87 control_sha256=ec31b500fbcc3a92a5602df7f2e850ece91ccaa556064bf3a4572e9547a7a741
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8. Axes: operability; coverage limited to this cross-generation probe, no score change claimed.
Control defect: chain suffixes accept any owning prefix; exact base names, kinds, permission ceilings and optional sidecars remain enforced.
Expected detector: crossgen cases must reject generations re-based onto another member. Observed: all nine crossgen cases failed; all other 78 cases passed. Expected UNMET confirmed.
One variant, one scored run; no real census candidate or separate positive baseline was run. This is control rejection, not a pristine-baseline mutant-kill claim.
cwd=/fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/lane
Frozen extraction commands (each exit 0): git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44b-count.mjs ; git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44-shape.tsv; stdout was written unchanged to the corresponding scratch files.
Counter command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/partial-unanchored.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/p44work
Observed exit=1; stderr empty. Complete counter stdout follows after the complete control source.
Before and after command: sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/partial-unanchored.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/p44-shape.tsv
Before and after hashes were identical:
ec31b500fbcc3a92a5602df7f2e850ece91ccaa556064bf3a4572e9547a7a741  /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/partial-unanchored.mjs
6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/p44b-count.mjs
fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/p44-shape.tsv
Restoration: no pre-existing source was mutated; newly created control and frozen files retained exact bytes. Only this report was written in the lane.
Process check: pgrep -af /fast/scratch/hyaku/kumitate-r44/seats/[C]tlPartialUnanchored -> no output, exit=1 (no matching processes).
Cleanup: rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/p44work -> no output, exit=0; counter had already removed its case mirror.
Tool installs or updates: none. Operator-owned file contents were never read.
Control source:
```js
import { lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const files = new Map([
  ['RULES.md', 0o644], ['agent.db', 0o600], ['config.yml', 0o600],
  ['history.db', 0o644], ['kimi-device-id', 0o600], ['last-changelog-version', 0o644],
  ['mcp.json', 0o600], ['mcp.json.rea.backup', 0o600], ['models.db', 0o644],
  ['models.yml', 0o644], ['skill-descriptions.db', 0o600],
]);
const directories = new Set(['agents', 'blobs', 'cache', 'custom-session-files', 'hooks', 'predict', 'sessions', 'terminal-sessions']);
const sidecars = new Map([...['agent.db', 'history.db', 'models.db', 'skill-descriptions.db']].flatMap(name => ['-shm', '-wal'].map(suffix => [name + suffix, files.get(name)])));
// Deliberate defect: suffix-only chain rules do not identify their owning member.
const chains = [
  /\.pre-restore-[0-9]{8}T[0-9]{6}Z(?:-(?:shm|wal))?$/,
  /\.recovered-[0-9]{8}T[0-9]{6}Z$/,
  /\.corrupt-[0-9]{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-(?:shm|wal))?$/,
  /\.pre-disable-[0-9]{8}T[0-9]{4}$/,
  /\.[0-9a-f]{64}\.recovery$/,
];
if (process.argv.length !== 4 || process.argv[2] !== '--root') process.exit(64);
let drift = false;
try {
  const names = readdirSync(process.argv[3]);
  const present = new Set(names);
  for (const name of [...files.keys(), ...directories]) if (!present.has(name)) drift = true;
  for (const name of names) {
    const st = lstatSync(join(process.argv[3], name));
    const directory = directories.has(name);
    let ceiling = directory ? 0o755 : files.get(name) ?? sidecars.get(name);
    if (ceiling === undefined && chains.some(rule => rule.test(name))) ceiling = 0o600;
    if (ceiling === undefined || !(directory ? st.isDirectory() : st.isFile()) || ((st.mode & 0o7777) & ~ceiling) !== 0) drift = true;
  }
} catch { console.log('OMP_CENSUS: DRIFT'); process.exit(2); }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`);
process.exit(drift ? 1 : 0);
```
Complete counter stdout:
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/partial-unanchored.mjs sha256=ec31b500fbcc3a92a5602df7f2e850ece91ccaa556064bf3a4572e9547a7a741
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlPartialUnanchored/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS
P44_COUNT: UNMET (passed=78 cases=87 floor=20 census_sha256=ec31b500fbcc3a92a5602df7f2e850ece91ccaa556064bf3a4572e9547a7a741)
```
