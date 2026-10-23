RESULT CtlSnapshotMissingOK rev=292d9266 verdict=UNMET passed=78 cases=87 control_sha256=2fc3748b33f6eacce409652a771ed32e7e153e7dafb65c20d6f7f181acba1160
Axes: operability (C1 detector discrimination); coverage is not claimed by this probe.
Revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8. One control variant, scored exactly once; no real census was scored.
Control: the exact frozen name/kind/permission snapshot, allowing every missing entry; no chain template or sidecar rule.
Expected detector: UNMET. Observed: UNMET, passed=78/87, exit=1; 9 fresh-generation CLEAN cases were rejected as DRIFT.
Frozen export commands: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44b-count.mjs ; git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44-shape.tsv (stdout saved without edits).
Hash command: sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/control.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/p44-shape.tsv
Before/after hashes unchanged: control=2fc3748b33f6eacce409652a771ed32e7e153e7dafb65c20d6f7f181acba1160; counter=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517; shape=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71.
Exact scoring command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/control.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/p44work
Counter stderr: empty. This is a rejected control, not a pristine/mutated/restored mutant-kill claim.
Process check: pgrep -af /fast/scratch/hyaku/kumitate-r44/seats/[C]tlSnapshotMissingOK/ -> exit=1, stdout empty; no matching processes remained.
Cleanup: rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/p44work -> exit=0; the counter removed its per-run mirrors.
Restoration evidence: no pre-existing source was mutated; frozen probe hashes stayed exact before/after. The one control and stdout receipt remain in this seat scratch directory.
Tools installed or updated: none. No live ~/.omp/agent member was opened or read.
Control full source:
```js
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
// Exact frozen snapshot; absent members are allowed. No chain or sidecar rules.
const snapshot = new Map([
  ["RULES.md", ["file", 0o644]], ["agent.db", ["file", 0o600]], ["agent.db-shm", ["file", 0o600]],
  ["agent.db-wal", ["file", 0o600]], ["agent.db.pre-restore-20261023T004529Z", ["file", 0o600]], ["agent.db.pre-restore-20261023T004529Z-shm", ["file", 0o600]],
  ["agent.db.pre-restore-20261023T004529Z-wal", ["file", 0o600]], ["agent.db.recovered-20261023T004505Z", ["file", 0o600]], ["agents", ["dir", 0o755]],
  ["blobs", ["dir", 0o755]], ["cache", ["dir", 0o755]], ["config.yml", ["file", 0o600]],
  ["custom-session-files", ["dir", 0o755]], ["history.db", ["file", 0o644]], ["history.db-shm", ["file", 0o644]],
  ["history.db-wal", ["file", 0o644]], ["history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b", ["file", 0o600]], ["history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b-shm", ["file", 0o600]],
  ["history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b-wal", ["file", 0o600]], ["hooks", ["dir", 0o755]], ["kimi-device-id", ["file", 0o600]],
  ["last-changelog-version", ["file", 0o644]], ["mcp.json", ["file", 0o600]], ["mcp.json.pre-disable-20261020T1015", ["file", 0o600]],
  ["mcp.json.rea.backup", ["file", 0o600]], ["mcp.json.rea.backup.0a0013883f33dfc5f190448dc1db19796967dec159202c53710210a8f1782edb.recovery", ["file", 0o600]], ["mcp.json.rea.backup.619e9309acade66187a3d66f15c00885ddb92f62d5a276c0ea432169f18db958.recovery", ["file", 0o600]],
  ["mcp.json.rea.backup.e571d192efabb9629cfd4e7113da97ec7c0c306fb877061d8b9a82a89ed61ad9.recovery", ["file", 0o600]], ["models.db", ["file", 0o644]], ["models.db-shm", ["file", 0o644]],
  ["models.db-wal", ["file", 0o644]], ["models.yml", ["file", 0o644]], ["predict", ["dir", 0o755]],
  ["sessions", ["dir", 0o755]], ["skill-descriptions.db", ["file", 0o600]], ["skill-descriptions.db-shm", ["file", 0o600]],
  ["skill-descriptions.db-wal", ["file", 0o600]], ["terminal-sessions", ["dir", 0o755]],
]);
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--root') process.exit(64);
let drift = false;
try {
  for (const name of readdirSync(args[1])) {
    const expected = snapshot.get(name);
    if (!expected) { drift = true; break; }
    const st = lstatSync(join(args[1], name));
    const kind = st.isFile() ? 'file' : st.isDirectory() ? 'dir' : 'other';
    if (kind !== expected[0] || ((st.mode & 0o7777) & ~expected[1]) !== 0) {
      drift = true;
      break;
    }
  }
} catch { process.exit(2); }
console.log(`OMP_CENSUS: ${drift ? 'DRIFT' : 'CLEAN'}`);
process.exit(drift ? 1 : 0);
```
Counter complete stdout:
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/control.mjs sha256=2fc3748b33f6eacce409652a771ed32e7e153e7dafb65c20d6f7f181acba1160
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlSnapshotMissingOK/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-chains expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS
P44_COUNT: UNMET (passed=78 cases=87 floor=20 census_sha256=2fc3748b33f6eacce409652a771ed32e7e153e7dafb65c20d6f7f181acba1160)
```
exit=1
