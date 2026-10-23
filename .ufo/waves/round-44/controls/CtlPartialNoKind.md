RESULT CtlPartialNoKind rev=292d9266 verdict=UNMET passed=79 cases=87 control_sha256=aaf1ab9b7c23f2ae69ed59829eb0ff673a6df69dc3191f80e60d93e8653c6f4e
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8. Axes: operability and detector coverage; this is a control probe, not a census claim.
Control: exact required base names, owner-anchored optional chain generations, optional sidecars, and per-member permission ceilings; no member kind is inspected.
Expected detector: frozen P44b rejects the omitted kind rule through kind cases. Observed: UNMET, confirming that expectation; the control was rejected.
Only failing cases: kind:agents, kind:blobs, kind:cache, kind:custom-session-files, kind:hooks, kind:predict, kind:sessions, kind:terminal-sessions; each expected DRIFT but returned CLEAN exit 0.
The other 11 kind cases passed: file-to-directory flips add owner-execute permission, so ceilings reject them without checking kinds. All other cases passed.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/lane/CtlPartialNoKind.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44work; observed exit=1, stderr=(empty). Executed exactly once; no real census candidate was scored.
Hash commands: before `sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44-shape.tsv` and `sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/lane/CtlPartialNoKind.mjs`; after `sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44-shape.tsv /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/lane/CtlPartialNoKind.mjs`; all exited 0, with identical before/after outputs below.
6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44b-count.mjs
fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44-shape.tsv
aaf1ab9b7c23f2ae69ed59829eb0ff673a6df69dc3191f80e60d93e8653c6f4e  /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/lane/CtlPartialNoKind.mjs
Restoration evidence: no preexisting source bytes changed; the control is a new scratch-only file. Frozen counter, frozen shape and control hashes stayed identical. No pristine/restored candidate detector runs were made, as this item requires one constructed-control score only.
Cleanup: `pgrep -af [/]fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind` returned exit 1 with empty stdout/stderr; `rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44work` returned exit 0 with empty stdout/stderr. Tools installed/updated: none. Full source and complete counter stdout follow.
```js
#!/usr/bin/env node
import { lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
// Deliberate control: member names and permission ceilings, never member kinds.
const members = new Map([
  ['RULES.md', 0o644], ['agent.db', 0o600], ['agents', 0o755],
  ['blobs', 0o755], ['cache', 0o755], ['config.yml', 0o600],
  ['custom-session-files', 0o755], ['history.db', 0o644], ['hooks', 0o755],
  ['kimi-device-id', 0o600], ['last-changelog-version', 0o644],
  ['mcp.json', 0o600], ['mcp.json.rea.backup', 0o600],
  ['models.db', 0o644], ['models.yml', 0o644], ['predict', 0o755],
  ['sessions', 0o755], ['skill-descriptions.db', 0o600], ['terminal-sessions', 0o755],
]);
const chains = [
  [/^agent\.db\.pre-restore-[0-9]{8}T[0-9]{6}Z(?:-shm|-wal)?$/, 0o600],
  [/^agent\.db\.recovered-[0-9]{8}T[0-9]{6}Z(?:-shm|-wal)?$/, 0o600],
  [/^history\.db\.corrupt-[0-9]{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-shm|-wal)?$/, 0o600],
  [/^mcp\.json\.pre-disable-[0-9]{8}T[0-9]{4}$/, 0o600],
  [/^mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery$/, 0o600],
];
function ceiling(name) {
  if (members.has(name)) return members.get(name);
  if (/^(?:agent\.db|history\.db|models\.db|skill-descriptions\.db)-(?:shm|wal)$/.test(name)) {
    return members.get(name.slice(0, -4));
  }
  return chains.find(([pattern]) => pattern.test(name))?.[1];
}
let clean = false;
try {
  const [option, root, ...extra] = process.argv.slice(2);
  if (option !== '--root' || !root || extra.length) throw new Error('usage');
  const names = readdirSync(root);
  clean = [...members.keys()].every((name) => names.includes(name)) && names.every((name) => {
    const max = ceiling(name);
    return max !== undefined && (lstatSync(join(root, name)).mode & 0o777 & ~max) === 0;
  });
} catch {}
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exit(clean ? 0 : 1);
```
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/lane/CtlPartialNoKind.mjs sha256=aaf1ab9b7c23f2ae69ed59829eb0ff673a6df69dc3191f80e60d93e8653c6f4e
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlPartialNoKind/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS
P44_COUNT: UNMET (passed=79 cases=87 floor=20 census_sha256=aaf1ab9b7c23f2ae69ed59829eb0ff673a6df69dc3191f80e60d93e8653c6f4e)
```
