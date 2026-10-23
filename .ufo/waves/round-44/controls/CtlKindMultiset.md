RESULT CtlKindMultiset rev=292d9266 verdict=UNMET passed=78 cases=87 control_sha256=b17278fb402357c341cf8ce3aa86029323cd2c569c14da6f30311299d707acb1 variant=Ceiling
RESULT CtlKindMultiset rev=292d9266 verdict=UNMET passed=76 cases=87 control_sha256=594b69d81d5b0b207db4092a9859e5097278586f8768d1057113f5917a4dc9aa variant=Exact
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8. Axes: operability tested; coverage not claimed or measured.
Both controls ignore names in their decisions, use only readdir/lstat and built-ins, and encode no per-member rules. Each was scored once; neither read MET. No real census was scored.
Frozen extraction commands (stdout saved unchanged): `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44b-count.mjs` and `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44-shape.tsv`.
Hash command: `sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44-shape.tsv`; output: `6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44b-count.mjs` and `fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44-shape.tsv`.
Comparison rules: Exact requires the frozen histogram exactly. Ceiling allows componentwise counts no greater than frozen, including missing pairs. Frozen counts: file/0600=21, file/0644=9, directory/0755=8.
Exact command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/CtlKindMultisetExact.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/p44work-Exact`; observed exit=1, stderr empty; complete stdout below.
Ceiling command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/CtlKindMultisetCeiling.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/p44work-Ceiling`; observed exit=1, stderr empty; complete stdout below.
Counterexample: gen:agent.db.recovered-<D>T<D>Z expects CLEAN, while crossgen:agent.db.recovered-<D>T<D>Z expects DRIFT. Both add one file/0600 to the same baseline and therefore have identical histograms; both controls print DRIFT for both.
Evidence: frozen p44b-count.mjs:167-176 assigns tmpl.kind and tmpl.mode to both additions, changing only their names. Exact fails all nine generation cases plus no-sidecars and no-chains; Ceiling fixes the two removal cases but still fails all nine generations.
[INFERENCE] No deterministic name-blind histogram rule can separate those nine generation/crossgen pairs. Its maximum on these 87 cases is at most 78; the Ceiling control attains 78.
Impacted axis: operability. The defect is in the control shortcut, not evidence of a counter escape. Smallest safe correction: preserve generation/crossgen discrimination and use actual per-member name or chain-template rules in a real census; do not replace them with histograms.
After Exact: `pgrep -af '/fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/(CtlKindMultisetExact[.]mjs|p44work-Exact)'` returned exit=1, stdout/stderr empty. Empty work directory /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/p44work-Exact was removed.
After Ceiling: `pgrep -af '/fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/(CtlKindMultisetCeiling[.]mjs|p44work-Ceiling)'` returned exit=1, stdout/stderr empty. Empty work directory /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/p44work-Ceiling was removed.
Final process check: `pgrep -af /fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset` returned exit=1, stdout='', stderr=''. No tools installed or updated; no operator-file contents opened.
Exact full source (/fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/CtlKindMultisetExact.mjs):
```js
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
const frozen = new Map([['file:600', 21], ['file:644', 9], ['dir:755', 8]]);
let clean = false;
try {
  const root = process.argv[3];
  const counts = new Map();
  for (const name of readdirSync(root)) {
    const st = lstatSync(join(root, name));
    const kind = st.isFile() ? 'file' : st.isDirectory() ? 'dir' : st.isSymbolicLink() ? 'symlink' : 'other';
    const key = `${kind}:${(st.mode & 0o7777).toString(8)}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  clean = counts.size === frozen.size && [...frozen].every(([key, total]) => counts.get(key) === total);
} catch {}
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exitCode = clean ? 0 : 1;
```
Ceiling full source (/fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/CtlKindMultisetCeiling.mjs):
```js
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
const frozen = new Map([['file:600', 21], ['file:644', 9], ['dir:755', 8]]);
let clean = false;
try {
  const root = process.argv[3];
  const counts = new Map();
  for (const name of readdirSync(root)) {
    const st = lstatSync(join(root, name));
    const kind = st.isFile() ? 'file' : st.isDirectory() ? 'dir' : st.isSymbolicLink() ? 'symlink' : 'other';
    const key = `${kind}:${(st.mode & 0o7777).toString(8)}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  clean = [...counts].every(([key, total]) => frozen.has(key) && total <= frozen.get(key));
} catch {}
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exitCode = clean ? 0 : 1;
```
Complete stdout, TAB-separated columns: Exact then Ceiling. Each column preserves every stdout line in its original order, including the final newline.
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517	P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/CtlKindMultisetExact.mjs sha256=594b69d81d5b0b207db4092a9859e5097278586f8768d1057113f5917a4dc9aa	P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/lane/CtlKindMultisetCeiling.mjs sha256=b17278fb402357c341cf8ce3aa86029323cd2c569c14da6f30311299d707acb1
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87	P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlKindMultiset/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-chains expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-sidecars expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL	CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS	CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS	CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS	CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS
P44_COUNT: UNMET (passed=76 cases=87 floor=20 census_sha256=594b69d81d5b0b207db4092a9859e5097278586f8768d1057113f5917a4dc9aa)	P44_COUNT: UNMET (passed=78 cases=87 floor=20 census_sha256=b17278fb402357c341cf8ce3aa86029323cd2c569c14da6f30311299d707acb1)
```
