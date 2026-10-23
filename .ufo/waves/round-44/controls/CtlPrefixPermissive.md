RESULT CtlPrefixPermissive rev=292d9266 verdict=UNMET passed=40 cases=87 control_sha256=e422f4b27fcbd7cf9501798d2ddfdb39e0d65f6fb15a25409f1e568666f6385d variant=any-prefix
RESULT CtlPrefixPermissive rev=292d9266 verdict=UNMET passed=40 cases=87 control_sha256=5a09145cf41b8ed2dc284edac88f3fd80cfb8cd114491bcaea7529ad214472eb variant=dot-or-hyphen
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8. Axes: operability; coverage was not measured or claimed.
Counterexample attempted: hard-code the 19 base names, kinds and exact modes, but accept all extra known-prefix names without checking their kinds or modes. The second variant requires a dot or hyphen after the prefix.
Observed: both controls read UNMET, passed=40 cases=87, exit=1. Neither control read MET. No real census was built or scored.
Both controls incorrectly report CLEAN for all 19 near cases, all 19 neardigit cases and all nine crossgen cases; the frozen counter rejects those 47 false negatives.
Evidence from both runs: CASE near:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL; CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL.
Smallest safe correction: no counter repair is indicated by these two controls. Retain the near, neardigit and crossgen negatives; neither prefix shortcut is a substitute for member-specific chain rules.
Limits: these are two control receipts, not a verdict on C1 or proof that a real census is correct. Other lane gates were not run.
Tool installs or updates: none.
Extraction commands (each exit=0):
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44b-count.mjs
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44-shape.tsv
The exact extracted bytes were written only to this seat's scratch directory.
sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44-shape.tsv (exit=0):
6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44b-count.mjs
fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44-shape.tsv
Only one control .mjs file was used. Its delimited constant was changed from false to true between the two runs. Each variant was scored exactly once.
any-prefix command at revision 292d92668ff80973547a8b10d12ffb5a48f2d7d8:
systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/CtlPrefixPermissive.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44work
Observed exit=1; stderr="".
After this run: pgrep -af '[/]fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/' -> exit=1, stdout="", stderr=""; no matching process remained.
Cleanup: rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44work -> exit=0, stderr="".
Full any-prefix source, SHA256 e422f4b27fcbd7cf9501798d2ddfdb39e0d65f6fb15a25409f1e568666f6385d:
```js
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
const delimited = false;
const base = new Map([
  ['RULES.md', ['file', 0o644]],
  ['agent.db', ['file', 0o600]],
  ['agents', ['dir', 0o755]],
  ['blobs', ['dir', 0o755]],
  ['cache', ['dir', 0o755]],
  ['config.yml', ['file', 0o600]],
  ['custom-session-files', ['dir', 0o755]],
  ['history.db', ['file', 0o644]],
  ['hooks', ['dir', 0o755]],
  ['kimi-device-id', ['file', 0o600]],
  ['last-changelog-version', ['file', 0o644]],
  ['mcp.json', ['file', 0o600]],
  ['mcp.json.rea.backup', ['file', 0o600]],
  ['models.db', ['file', 0o644]],
  ['models.yml', ['file', 0o644]],
  ['predict', ['dir', 0o755]],
  ['sessions', ['dir', 0o755]],
  ['skill-descriptions.db', ['file', 0o600]],
  ['terminal-sessions', ['dir', 0o755]],
]);
if (process.argv.length !== 4 || process.argv[2] !== '--root') process.exit(64);
const root = process.argv[3];
const names = [...base.keys()];
let drift = false;
for (const name of readdirSync(root)) {
  const rule = base.get(name);
  if (rule) {
    const st = lstatSync(join(root, name));
    const kind = st.isFile() ? 'file' : st.isDirectory() ? 'dir' : 'other';
    if (kind !== rule[0] || (st.mode & 0o777) !== rule[1]) drift = true;
  } else if (!names.some((b) => delimited
    ? name.startsWith(b + '.') || name.startsWith(b + '-')
    : name.startsWith(b))) drift = true;
}
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`);
process.exit(drift ? 1 : 0);
```
Full any-prefix counter stdout follows as a lossless JSON string to keep this report within 150 lines; every newline, including the final newline, is preserved. The unescaped original is /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/any-prefix.stdout.txt.
```json
"P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517\nP44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/CtlPrefixPermissive.mjs sha256=e422f4b27fcbd7cf9501798d2ddfdb39e0d65f6fb15a25409f1e568666f6385d\nP44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87\nCASE near:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE neardigit:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nP44_COUNT: UNMET (passed=40 cases=87 floor=20 census_sha256=e422f4b27fcbd7cf9501798d2ddfdb39e0d65f6fb15a25409f1e568666f6385d)\n"
```
dot-or-hyphen command at revision 292d92668ff80973547a8b10d12ffb5a48f2d7d8:
systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/CtlPrefixPermissive.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44work
Observed exit=1; stderr="".
After this run: pgrep -af '[/]fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/' -> exit=1, stdout="", stderr=""; no matching process remained.
Cleanup: rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44work -> exit=0, stderr="".
Full dot-or-hyphen source, SHA256 5a09145cf41b8ed2dc284edac88f3fd80cfb8cd114491bcaea7529ad214472eb:
```js
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
const delimited = true;
const base = new Map([
  ['RULES.md', ['file', 0o644]],
  ['agent.db', ['file', 0o600]],
  ['agents', ['dir', 0o755]],
  ['blobs', ['dir', 0o755]],
  ['cache', ['dir', 0o755]],
  ['config.yml', ['file', 0o600]],
  ['custom-session-files', ['dir', 0o755]],
  ['history.db', ['file', 0o644]],
  ['hooks', ['dir', 0o755]],
  ['kimi-device-id', ['file', 0o600]],
  ['last-changelog-version', ['file', 0o644]],
  ['mcp.json', ['file', 0o600]],
  ['mcp.json.rea.backup', ['file', 0o600]],
  ['models.db', ['file', 0o644]],
  ['models.yml', ['file', 0o644]],
  ['predict', ['dir', 0o755]],
  ['sessions', ['dir', 0o755]],
  ['skill-descriptions.db', ['file', 0o600]],
  ['terminal-sessions', ['dir', 0o755]],
]);
if (process.argv.length !== 4 || process.argv[2] !== '--root') process.exit(64);
const root = process.argv[3];
const names = [...base.keys()];
let drift = false;
for (const name of readdirSync(root)) {
  const rule = base.get(name);
  if (rule) {
    const st = lstatSync(join(root, name));
    const kind = st.isFile() ? 'file' : st.isDirectory() ? 'dir' : 'other';
    if (kind !== rule[0] || (st.mode & 0o777) !== rule[1]) drift = true;
  } else if (!names.some((b) => delimited
    ? name.startsWith(b + '.') || name.startsWith(b + '-')
    : name.startsWith(b))) drift = true;
}
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`);
process.exit(drift ? 1 : 0);
```
Full dot-or-hyphen counter stdout follows as a lossless JSON string to keep this report within 150 lines; every newline, including the final newline, is preserved. The unescaped original is /fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/dot-or-hyphen.stdout.txt.
```json
"P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517\nP44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/CtlPrefixPermissive.mjs sha256=5a09145cf41b8ed2dc284edac88f3fd80cfb8cd114491bcaea7529ad214472eb\nP44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlPrefixPermissive/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87\nCASE near:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE near:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS\nCASE neardigit:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nCASE near:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE neardigit:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE near:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL\nCASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS\nP44_COUNT: UNMET (passed=40 cases=87 floor=20 census_sha256=5a09145cf41b8ed2dc284edac88f3fd80cfb8cd114491bcaea7529ad214472eb)\n"
```
