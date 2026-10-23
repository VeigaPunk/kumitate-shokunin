RESULT CtlTimeChannels rev=292d9266 verdict=UNMET passed=55 cases=87 control_sha256=def3f9226c7b77ceaa139544bb3c19e5323c84e889efd1dfa07a32207a46a775 variant=phase
RESULT CtlTimeChannels rev=292d9266 verdict=UNMET passed=13 cases=87 control_sha256=81bcc92daa7b207a2690cd355ba1353059b2a3e1830b3ff396fa8ecca93f804b variant=tail
Axes: operability tested; coverage unchanged. No census candidate was built or scored.
Counterexample: a mode change and an unchanged member take the same creation/chmod path; every mirror is rebuilt and shuffled (p44b-count.mjs:191-202). An extra member need not be last.
Evidence: tail returned CLEAN for every case, including mode:agent.db; phase recognized control-end but also returned CLEAN for kind:models.db and many later DRIFT cases. Neither time control reached MET.
Smallest safe correction: do not replace per-member shape rules with timing. These results require no counter redesign; they do not prove that every time channel is closed.
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8; plan Pre-data redesign and round-43-verifier-spotcheck.md read before controls.
Frozen extraction: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44b-count.mjs` and `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44-shape.tsv`; stdout saved unchanged under `/fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels`.
Observed SHA-256: counter 6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517; shape fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71.
Recon command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/lane/temporal-recon.mjs`; exit=0.
Recon observed: control=38, added=39, no-sidecars=26 entries. For all three, each of birthtimeNs/mtimeNs/ctimeNs/atimeNs had unique=1, spread_ns=0, root_delta_ns=0; ctime!=mtime=0, atime!=birthtime=0, mtime!=birthtime=0. This was one host-side mirror probe, not a census score.
Phase command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/lane/time-phase.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/lane/p44work-phase`; exit=1; stderr empty.
Tail command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/lane/time-tail.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/lane/p44work-tail`; exit=1; stderr empty.
The two counter invocations ran concurrently, exactly once per variant. Phase estimates the closing case from elapsed source-copy age divided by current startup latency; tail searches for a unique latest timestamp separated by at least 1 ms, or a future timestamp.
Cleanup: `pgrep -af -- /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels` after recon and again after both scores: no output, exit=1. `rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/lane/p44work-tail /fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/lane/p44work-phase`: no output, exit=0. Recon removed its own mirrors; its temporary source was deleted.
No tools installed or updated. No live agent-root contents accessed. No lane changes except this report.
## Phase control — full source
```js
import { lstatSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = process.argv[process.argv.indexOf('--root') + 1];
const dir = lstatSync(root, { bigint: true });
const self = lstatSync(fileURLToPath(import.meta.url), { bigint: true });
const now = BigInt(Date.now()) * 1000000n;
const end = dir.mtimeNs > dir.ctimeNs ? dir.mtimeNs : dir.ctimeNs;
const latency = now > end ? now - end : 1000000n;
const elapsed = end - self.ctimeNs;
const clean = elapsed >= 86n * latency;
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exit(clean ? 0 : 1);
```
## Tail control — full source
```js
import { lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const root = process.argv[process.argv.indexOf('--root') + 1];
const stats = readdirSync(root).map(n => lstatSync(join(root, n), { bigint: true }));
const dir = lstatSync(root, { bigint: true });
const keys = ['mtimeNs', 'ctimeNs', 'atimeNs', 'birthtimeNs'];
const later = keys.some(k => {
  const ts = stats.map(s => s[k]).sort((a,b) => a < b ? -1 : a > b ? 1 : 0);
  return ts.length > 1 && ts.at(-1) - ts.at(-2) >= 1000000n && ts.at(-1) >= dir.birthtimeNs;
});
const future = stats.some(s => keys.some(k => s[k] > BigInt(Date.now() + 1) * 1000000n));
const drift = later || future;
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`);
process.exit(drift ? 1 : 0);
```
## Complete counter stdout
Each column is one complete stdout stream, top to bottom, without omissions; both ended in a newline. Columns preserve their independent shuffled order.
| Phase stdout | Tail stdout |
| --- | --- |
| `P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517` | `P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517` |
| `P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/lane/time-phase.mjs sha256=def3f9226c7b77ceaa139544bb3c19e5323c84e889efd1dfa07a32207a46a775` | `P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/lane/time-tail.mjs sha256=81bcc92daa7b207a2690cd355ba1353059b2a3e1830b3ff396fa8ecca93f804b` |
| `P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87` | `P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlTimeChannels/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87` |
| `CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE kind:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE mode:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE kind:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE kind:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL` | `CASE neardigit:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL` | `CASE kind:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE mode:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE kind:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL` | `CASE kind:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE kind:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE no-chains expect=CLEAN exit=1 verdict=DRIFT P44=FAIL` | `CASE mode:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE mode:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE control expect=CLEAN exit=1 verdict=DRIFT P44=FAIL` | `CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE no-sidecars expect=CLEAN exit=1 verdict=DRIFT P44=FAIL` | `CASE kind:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE stray-digit expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE kind:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE mode:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE kind:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE neardigit:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL` | `CASE kind:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE kind:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE kind:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL` | `CASE near:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL` | `CASE kind:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE kind:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE near:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS` | `CASE stray expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE neardigit:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE neardigit:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE neardigit:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE near:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE neardigit:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE kind:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE near:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE neardigit:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE kind:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE near:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE mode:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE near:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE near:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE kind:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN P44=PASS` | `CASE kind:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS` | `CASE near:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE neardigit:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE neardigit:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE neardigit:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE neardigit:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE neardigit:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN P44=PASS` | `CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE neardigit:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE near:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` |
| `CASE kind:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL` | `CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS` | `CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS` |
| `P44_COUNT: UNMET (passed=55 cases=87 floor=20 census_sha256=def3f9226c7b77ceaa139544bb3c19e5323c84e889efd1dfa07a32207a46a775)` | `P44_COUNT: UNMET (passed=13 cases=87 floor=20 census_sha256=81bcc92daa7b207a2690cd355ba1353059b2a3e1830b3ff396fa8ecca93f804b)` |
