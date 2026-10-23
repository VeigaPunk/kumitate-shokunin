RESULT CtlLabelKeyedB rev=292d9266 verdict=MET passed=87 cases=87 control_sha256=bddddbe8e5c3934afb55b328f806b6273f67e428d4093abc0507489f39386a71 variant=ownerless
RESULT CtlLabelKeyedB rev=292d9266 verdict=MET passed=87 cases=87 control_sha256=a437a672e1a87ed14d8fa3212bb65f964f85aedaa8bd84136d12bef66b834bf8 variant=aggregate-only
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8; one mutation probe, two control variants; restored bytes re-scored only to establish restoration.
Axes: operability (false acceptance), coverage (member associations), safety (shape-only and bounded execution).
Important finding: a control that skips per-member work reads MET. This is the most important kind of finding in this round, not evidence that the claimed census was built.
Expected detector: P44_COUNT: UNMET for each skip-work control; an owner-anchor omission should not retain MET.
Boundary observed: per-member kinds and permission ceilings are absent even in the pristine control; a global directory count (8) and base-mode sum (8348) replace them and still pass all 87 cases.
Single mutation: append .replace(/^[^.]+\./, "*.") inside key(), for both reference and observed chain names. This drops the owning member stem but keeps the extension and remaining suffix structure.
Mutation verdict: SURVIVED. Pristine, mutated and restored runs all read MET 87/87, exit 0; therefore the result is not an inconclusive baseline failure.
Mechanism from frozen source: kind and mode cases change one base member at a time; aggregate counts detect those changes. Cross-generation cases choose the first differently extended base file, so dropping the owner stem while retaining the extension escapes them.
Retained knowledge: 19 base names, five normalized chain suffix families, optional -shm/-wal stripping, and three global totals. Their necessity was not probed; no globally smallest-program claim is made.
Restoration: before=a437a672e1a87ed14d8fa3212bb65f964f85aedaa8bd84136d12bef66b834bf8; mutated=bddddbe8e5c3934afb55b328f806b6273f67e428d4093abc0507489f39386a71; after=a437a672e1a87ed14d8fa3212bb65f964f85aedaa8bd84136d12bef66b834bf8; before equals after exactly.
Frozen counter SHA-256: 6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517; frozen shape SHA-256: fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71.
pristine command (rev 292d92668ff80973547a8b10d12ffb5a48f2d7d8): `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/lane/ctl-label-keyed-b.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44work; echo exit=$?`; observed exit=0, stderr="".
mutated command (rev 292d92668ff80973547a8b10d12ffb5a48f2d7d8): `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/lane/ctl-label-keyed-b.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44work; echo exit=$?`; observed exit=0, stderr="".
restored command (rev 292d92668ff80973547a8b10d12ffb5a48f2d7d8): `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/lane/ctl-label-keyed-b.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44work; echo exit=$?`; observed exit=0, stderr="".
After each run: `pgrep -af -- /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB` returned exit 1 with no output; `rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44work` returned exit 0. No case work directory or child process remained.
Control file restored: /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/lane/ctl-label-keyed-b.mjs. Raw stdout/stderr retained at /fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/{pristine,mutated,restored}.{stdout,stderr}.
No tools installed or updated; no operator-owned file contents opened; only node built-ins, readdir and lstat are used by the control. L1 notified of the pre-data redesign blocker.
To fit the report line bound without dropping output, pristine source and pristine/restored stdout are complete lossless JSON strings; decode JSON escapes. Mutated source and stdout are verbatim.
Pristine full source (JSON string):
"import { readdirSync, lstatSync } from 'node:fs';\nimport { join } from 'node:path';\nfunction key(n) {\n  return n.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '<U>').replace(/[0-9a-f]{16,}/g, '<H>').replace(/[0-9]{4,}/g, '<D>');\n}\nconst base = new Set('RULES.md agent.db agents blobs cache config.yml custom-session-files history.db hooks kimi-device-id last-changelog-version mcp.json mcp.json.rea.backup models.db models.yml predict sessions skill-descriptions.db terminal-sessions'.split(' '));\nconst chains = new Set(['agent.db.pre-restore-<D>T<D>Z', 'agent.db.recovered-<D>T<D>Z', 'history.db.corrupt-<D>-<U>', 'mcp.json.pre-disable-<D>T<D>', 'mcp.json.rea.backup.<H>.recovery'].map(key));\nconst root = process.argv[3];\nlet bases = 0, dirs = 0, modes = 0, drift = false;\nfor (const name of readdirSync(root)) {\n  const stem = name.replace(/-(shm|wal)$/, '');\n  const st = lstatSync(join(root, name));\n  if (!base.has(stem) && !chains.has(key(stem))) drift = true;\n  if (name === stem && base.has(name)) {\n    bases++; dirs += Number(st.isDirectory()); modes += st.mode & 0o777;\n  }\n}\nconst clean = !drift && bases === 19 && dirs === 8 && modes === 8348;\nconsole.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);\nprocess.exitCode = clean ? 0 : 1;\n"
Mutated full source:
```js
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
function key(n) {
  return n.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '<U>').replace(/[0-9a-f]{16,}/g, '<H>').replace(/[0-9]{4,}/g, '<D>').replace(/^[^.]+\./, '*.');
}
const base = new Set('RULES.md agent.db agents blobs cache config.yml custom-session-files history.db hooks kimi-device-id last-changelog-version mcp.json mcp.json.rea.backup models.db models.yml predict sessions skill-descriptions.db terminal-sessions'.split(' '));
const chains = new Set(['agent.db.pre-restore-<D>T<D>Z', 'agent.db.recovered-<D>T<D>Z', 'history.db.corrupt-<D>-<U>', 'mcp.json.pre-disable-<D>T<D>', 'mcp.json.rea.backup.<H>.recovery'].map(key));
const root = process.argv[3];
let bases = 0, dirs = 0, modes = 0, drift = false;
for (const name of readdirSync(root)) {
  const stem = name.replace(/-(shm|wal)$/, '');
  const st = lstatSync(join(root, name));
  if (!base.has(stem) && !chains.has(key(stem))) drift = true;
  if (name === stem && base.has(name)) {
    bases++; dirs += Number(st.isDirectory()); modes += st.mode & 0o777;
  }
}
const clean = !drift && bases === 19 && dirs === 8 && modes === 8348;
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exitCode = clean ? 0 : 1;
```
Pristine complete stdout (JSON string):
"P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517\nP44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/lane/ctl-label-keyed-b.mjs sha256=a437a672e1a87ed14d8fa3212bb65f964f85aedaa8bd84136d12bef66b834bf8\nP44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87\nCASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nP44_COUNT: MET (passed=87 cases=87 floor=20 census_sha256=a437a672e1a87ed14d8fa3212bb65f964f85aedaa8bd84136d12bef66b834bf8)\n"
Restored complete stdout (JSON string):
"P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517\nP44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/lane/ctl-label-keyed-b.mjs sha256=a437a672e1a87ed14d8fa3212bb65f964f85aedaa8bd84136d12bef66b834bf8\nP44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87\nCASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nP44_COUNT: MET (passed=87 cases=87 floor=20 census_sha256=a437a672e1a87ed14d8fa3212bb65f964f85aedaa8bd84136d12bef66b834bf8)\n"
Mutated complete stdout:
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/lane/ctl-label-keyed-b.mjs sha256=bddddbe8e5c3934afb55b328f806b6273f67e428d4093abc0507489f39386a71
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlLabelKeyedB/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS
P44_COUNT: MET (passed=87 cases=87 floor=20 census_sha256=bddddbe8e5c3934afb55b328f806b6273f67e428d4093abc0507489f39386a71)
```
