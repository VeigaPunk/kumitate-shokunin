RESULT CtlExactSnapshot rev=292d9266 verdict=UNMET passed=76 cases=87 control_sha256=535bdbe9282f1380ff62b2e63a7152ccf011004a010a3830043a24a89c303364
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8. Axes: operability (C1); coverage (control discrimination only, not claimed).
Control: exact equality to all 38 frozen name/kind/mode tuples; no chain template, optional-member rule, or permission ceiling.
Expected detector: reject this control on fresh generations and optional removals. Observed: rejected (killed), not MET; all nine gen cases plus no-sidecars and no-chains failed; both exact controls passed.
Exact run (cwd /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/lane), once: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/lane/exact-snapshot.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/lane/p44work`; exit=1; stderr empty.
Extraction: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44b-count.mjs` stdout saved unchanged to /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44b-count.mjs.
Extraction: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44-shape.tsv` stdout saved unchanged to /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44-shape.tsv.
Before: `sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44-shape.tsv /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/lane/exact-snapshot.mjs`; after: `sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44-shape.tsv /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/lane/exact-snapshot.mjs && rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/lane/p44work`; both exit 0, with identical sha256sum output:
6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44b-count.mjs
fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44-shape.tsv
535bdbe9282f1380ff62b2e63a7152ccf011004a010a3830043a24a89c303364  /fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/lane/exact-snapshot.mjs
Restoration evidence: counter, shape and control bytes unchanged before/after; no baseline bytes mutated, so restoration was unnecessary. Only this assigned control was scored; no real census candidate was run.
Cleanup: `pgrep -af '/fast/scratch/hyaku/kumitate-r44/seats/[C]tlExactSnapshot'` produced no output, exit 1; the rmdir above succeeded and removed the empty work directory.
No tools installed or updated. No operator-owned member contents read; no lane changes except this report.
Full control source:
```js
import { lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const snapshot = [
  ['RULES.md', 'file', 0o644], ['agent.db', 'file', 0o600],
  ['agent.db-shm', 'file', 0o600], ['agent.db-wal', 'file', 0o600],
  ['agent.db.pre-restore-20261023T004529Z', 'file', 0o600], ['agent.db.pre-restore-20261023T004529Z-shm', 'file', 0o600],
  ['agent.db.pre-restore-20261023T004529Z-wal', 'file', 0o600], ['agent.db.recovered-20261023T004505Z', 'file', 0o600],
  ['agents', 'dir', 0o755], ['blobs', 'dir', 0o755],
  ['cache', 'dir', 0o755], ['config.yml', 'file', 0o600],
  ['custom-session-files', 'dir', 0o755], ['history.db', 'file', 0o644],
  ['history.db-shm', 'file', 0o644], ['history.db-wal', 'file', 0o644],
  ['history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b', 'file', 0o600], ['history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b-shm', 'file', 0o600],
  ['history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b-wal', 'file', 0o600], ['hooks', 'dir', 0o755],
  ['kimi-device-id', 'file', 0o600], ['last-changelog-version', 'file', 0o644],
  ['mcp.json', 'file', 0o600], ['mcp.json.pre-disable-20261020T1015', 'file', 0o600],
  ['mcp.json.rea.backup', 'file', 0o600], ['mcp.json.rea.backup.0a0013883f33dfc5f190448dc1db19796967dec159202c53710210a8f1782edb.recovery', 'file', 0o600],
  ['mcp.json.rea.backup.619e9309acade66187a3d66f15c00885ddb92f62d5a276c0ea432169f18db958.recovery', 'file', 0o600], ['mcp.json.rea.backup.e571d192efabb9629cfd4e7113da97ec7c0c306fb877061d8b9a82a89ed61ad9.recovery', 'file', 0o600],
  ['models.db', 'file', 0o644], ['models.db-shm', 'file', 0o644],
  ['models.db-wal', 'file', 0o644], ['models.yml', 'file', 0o644],
  ['predict', 'dir', 0o755], ['sessions', 'dir', 0o755],
  ['skill-descriptions.db', 'file', 0o600], ['skill-descriptions.db-shm', 'file', 0o600],
  ['skill-descriptions.db-wal', 'file', 0o600], ['terminal-sessions', 'dir', 0o755],
];
const expected = snapshot.map(([name, kind, mode]) => `${name}\t${kind}\t${mode}`).sort().join('\n');
const root = process.argv[3];
let clean = false;
try {
  const actual = readdirSync(root).map((name) => {
    const st = lstatSync(join(root, name));
    const kind = st.isFile() ? 'file' : st.isDirectory() ? 'dir' : st.isSymbolicLink() ? 'symlink' : 'other';
    return `${name}\t${kind}\t${st.mode & 0o7777}`;
  }).sort().join('\n');
  clean = actual === expected;
} catch {}
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exitCode = clean ? 0 : 1;
```
Complete counter stdout:
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/lane/exact-snapshot.mjs sha256=535bdbe9282f1380ff62b2e63a7152ccf011004a010a3830043a24a89c303364
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlExactSnapshot/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-sidecars expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-chains expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS
P44_COUNT: UNMET (passed=76 cases=87 floor=20 census_sha256=535bdbe9282f1380ff62b2e63a7152ccf011004a010a3830043a24a89c303364)
```
