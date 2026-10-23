RESULT CtlLabelKeyedA rev=292d9266 verdict=MET passed=87 cases=87 control_sha256=964fce5dbb96483748238f8cea74f9f572c1504a9efe0faee054fa5f5c3639d9
IMPORTANT: A control skipping the claimed work reached MET. This is the most important finding of the round; the pre-data kill rule blocks real-census scoring under the unchanged claim.
Axes: operability (claimed); coverage unchanged and not claimed by this item.
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8. One variant scored, exactly once; no real census candidate was run.
Control: /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/lane/label-keyed-a.mjs (578 bytes; Node built-ins only).
Counterexample: directory count 8, at most nine 0644 files, global file-mode set {0600,0644}, and a RULES.md. prefix rejection reach MET without any positive per-member name/kind/permission rule or chain-template table.
Evidence from frozen buildCases: every stray/near/neardigit addition is 0644, raising the nine-file 0644 count to ten; kind flips change directory count; permission mutants become 0604. Every generation is 0600. Every crossgen chooses the first differently extended sorted base file, RULES.md, so its name starts RULES.md.
[INFERENCE] An arbitrary additional 0600 file not starting RULES.md. would be accepted, as would many member renames and wrong-generation names. These examples were not separately run.
Smallest safe correction: before census data, replace rather than edit the frozen counter, adding a DRIFT case with an unowned 0600 name outside RULES.md.; it preserves every aggregate this control uses. Re-test this control before accepting the replacement. Otherwise retain the plan's exploratory route. No canonical admission or judgment is made here.
Frozen extraction command: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44b-count.mjs ; stdout written to /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/p44b-count.mjs.
Observed SHA256: 6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517.
Frozen extraction command: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44-shape.tsv ; stdout written to /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/p44-shape.tsv.
Observed SHA256: fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71.
Scoring cwd: /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/lane.
Exact scoring command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/lane/label-keyed-a.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/p44work
Observed exit=0; stderr empty. Complete stdout appears below.
Process check: pgrep -af /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA ; no matching processes; exit=1.
Cleanup: rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/p44work ; exit=0; the counter removed its per-run mirror and sandbox directory.
No tools installed or updated. No operator file contents were read. Only this report was written in the lane; scratch artifacts remain under the assigned seat directory.
Full control source:
```js
import { readdirSync, lstatSync } from 'node:fs';
const root = process.argv[3];
let directories = 0, publicFiles = 0, bad = false;
for (const name of readdirSync(root)) {
  const st = lstatSync(`${root}/${name}`), mode = st.mode & 0o777;
  if (st.isDirectory()) directories++;
  if (st.isFile() && mode === 0o644) publicFiles++;
  bad ||= name.startsWith('RULES.md.') ||
    (st.isFile() && mode !== 0o600 && mode !== 0o644);
}
const drift = bad || directories !== 8 || publicFiles > 9;
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`);
process.exitCode = drift ? 1 : 0;
```
Complete counter stdout:
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/lane/label-keyed-a.mjs sha256=964fce5dbb96483748238f8cea74f9f572c1504a9efe0faee054fa5f5c3639d9
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedA/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS
P44_COUNT: MET (passed=87 cases=87 floor=20 census_sha256=964fce5dbb96483748238f8cea74f9f572c1504a9efe0faee054fa5f5c3639d9)
```
