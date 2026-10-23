RESULT CtlMissingVariants rev=8e822511 verdict=UNMET scored=3/3
Axes: operability (reject skip-work controls), coverage (close three missing p44d receipts), safety (isolated, shape-only, bounded runs).
Revision: 8e8225114dccb31d33fbcb76df78052807a33068; frozen counter and shape extracted from 32b7fd561dae38b951828dde8fe11052737fb824. Observed interval: 2026-10-23T01:54:46Z to 01:56:46Z.
Setup command: `mkdir -p /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane checkout -q --detach 8e8225114dccb31d33fbcb76df78052807a33068`; exit 0, no output.
Counter extraction command: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane show 32b7fd561dae38b951828dde8fe11052737fb824:.ufo/waves/round-44/probe/p44d-count.mjs | tee /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/p44d-count.mjs | sha256sum`; exit 0, output `9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e  -`.
Shape extraction command: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane show 32b7fd561dae38b951828dde8fe11052737fb824:.ufo/waves/round-44/probe/p44-shape.tsv | tee /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/p44-shape.tsv | sha256sum`; exit 0, output `fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  -`.
Expected detector: each skip-work control must read P44_COUNT: UNMET. A control reading MET fails C1 under kill rule 2; no control below read MET, so this probe does not trigger that rule or give a broader C1 verdict.
Before and after command (cwd /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants): `sha256sum p44d-count.mjs p44-shape.tsv lane/ctl-label-keyed-b-ownerless.mjs lane/ctl-name-set-exact.mjs lane/ctl-prefix-permissive-any.mjs`; both exit 0; outputs match exactly, as follows.
Counter before=after: 9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e; shape before=after: fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71.
CtlLabelKeyedB owner-anchor-dropped before=after: bddddbe8e5c3934afb55b328f806b6273f67e428d4093abc0507489f39386a71; matches the original report.
CtlNameSet exact before=after: 07fec1c7c55112b2f59f4b67abf99c5eb375ce5ee1e1c7ffbc3ee4aa65477dfa; matches the original report.
CtlPrefixPermissive any-prefix before=after: e422f4b27fcbd7cf9501798d2ddfdb39e0d65f6fb15a25409f1e568666f6385d; matches the original report.
Run accounting: three independent runs executed concurrently, exactly once per variant, all using seed 2676cbe767adc1820fd316e02a7b9020 and the same frozen 207-case detector. Every command below ran at revision 8e8225114dccb31d33fbcb76df78052807a33068; each exited 1 with empty stderr.
CtlLabelKeyedB source: .ufo/waves/round-44/controls/CtlLabelKeyedB.md:25-44, rebuilt verbatim as /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/ctl-label-keyed-b-ownerless.mjs. This drops the owner stem and uses global directory and permission aggregates instead of per-member kind and permission rules.
Command: `set -o pipefail && systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/ctl-label-keyed-b-ownerless.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/p44work-label --seed 2676cbe767adc1820fd316e02a7b9020 | tee /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/CtlLabelKeyedB-ownerless.stdout`
P44_COUNT: UNMET (passed=139 cases=207 floor=20 census_sha256=bddddbe8e5c3934afb55b328f806b6273f67e428d4093abc0507489f39386a71)
CASE swap:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL ~predict<->models.yml
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
CtlNameSet source: .ufo/waves/round-44/controls/CtlNameSet.md:34-42, rebuilt verbatim as /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/ctl-name-set-exact.mjs. It requires exactly the 38 snapshot names and does not inspect kinds or permissions.
Command: `set -o pipefail && systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/ctl-name-set-exact.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/p44work-names --seed 2676cbe767adc1820fd316e02a7b9020 | tee /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/CtlNameSet-exact.stdout`
P44_COUNT: UNMET (passed=109 cases=207 floor=20 census_sha256=07fec1c7c55112b2f59f4b67abf99c5eb375ce5ee1e1c7ffbc3ee4aa65477dfa)
CASE kind:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL ~predict:file
```js
import { readdirSync } from 'node:fs';

const allowed = new Set(['RULES.md', 'agent.db', 'agent.db-shm', 'agent.db-wal', 'agent.db.pre-restore-20261023T004529Z', 'agent.db.pre-restore-20261023T004529Z-shm', 'agent.db.pre-restore-20261023T004529Z-wal', 'agent.db.recovered-20261023T004505Z', 'agents', 'blobs', 'cache', 'config.yml', 'custom-session-files', 'history.db', 'history.db-shm', 'history.db-wal', 'history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b', 'history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b-shm', 'history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b-wal', 'hooks', 'kimi-device-id', 'last-changelog-version', 'mcp.json', 'mcp.json.pre-disable-20261020T1015', 'mcp.json.rea.backup', 'mcp.json.rea.backup.0a0013883f33dfc5f190448dc1db19796967dec159202c53710210a8f1782edb.recovery', 'mcp.json.rea.backup.619e9309acade66187a3d66f15c00885ddb92f62d5a276c0ea432169f18db958.recovery', 'mcp.json.rea.backup.e571d192efabb9629cfd4e7113da97ec7c0c306fb877061d8b9a82a89ed61ad9.recovery', 'models.db', 'models.db-shm', 'models.db-wal', 'models.yml', 'predict', 'sessions', 'skill-descriptions.db', 'skill-descriptions.db-shm', 'skill-descriptions.db-wal', 'terminal-sessions']);
const requireAll = true;
if (process.argv.length !== 4 || process.argv[2] !== '--root') process.exit(64);
const names = readdirSync(process.argv[3]);
const drift = names.some((name) => !allowed.has(name)) || (requireAll && names.length !== allowed.size);
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`);
process.exit(drift ? 1 : 0);
```
CtlPrefixPermissive source: .ufo/waves/round-44/controls/CtlPrefixPermissive.md:26-65, rebuilt verbatim as /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/ctl-prefix-permissive-any.mjs. Only exact base names have kind/mode checks; any extra known-prefix name is accepted without those checks or a chain-template rule.
Command: `set -o pipefail && systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/ctl-prefix-permissive-any.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/p44work-prefix --seed 2676cbe767adc1820fd316e02a7b9020 | tee /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/lane/CtlPrefixPermissive-any.stdout`
P44_COUNT: UNMET (passed=102 cases=207 floor=20 census_sha256=e422f4b27fcbd7cf9501798d2ddfdb39e0d65f6fb15a25409f1e568666f6385d)
CASE near:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL +cache.dcykyx:file:600
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
All three outputs include `CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS` and `CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS`. The controls run successfully on the exact mirror; the UNMET results above are behavioral rejections, not sandbox failures.
After the concurrent runs, command `pgrep -af -- '[/]fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants/'` exited 1 with no output: no matching process remained from any of the three runs.
Cleanup command (cwd /fast/scratch/hyaku/kumitate-r44/seats/w2-CtlMissingVariants): `rmdir lane/p44work-label lane/p44work-names lane/p44work-prefix`; exit 0, no output. The counter removed its case directories in its own finally block; the empty work parents are also gone.
Restoration evidence: the five before/after hashes above are identical. This item replayed existing variants without mutating a pristine baseline; no new killed-mutant claim is made, and no tracked source needed restoration. Full stdout remains at the three tee paths above.
No real census was built or scored. No other gates were run. No tools were installed or updated, and no operator-owned file contents were opened. The only lane write is this report.
