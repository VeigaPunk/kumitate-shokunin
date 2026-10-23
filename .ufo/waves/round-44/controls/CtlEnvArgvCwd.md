RESULT CtlEnvArgvCwd rev=292d9266 verdict=UNMET passed=13 cases=87 control_sha256=ce89634c20a08674aa5f151a6ad0370d9844e191e88012875bba443631350178
Axes: operability, capability omp-census. Coverage is not claimed by this control review.
All commands and source references below concern frozen revision 292d92668ff80973547a8b10d12ffb5a48f2d7d8. One variant was scored exactly once; no real census was scored.
Control: SHA-256 of environment, argv, executable arguments/path, cwd, root string, hostname, user/group identities, PID/PPID, parent command/name, platform and module URL. It never opens or stats the mirror and encodes no member rule.
Counterexample to this shortcut: kind:models.yml expects DRIFT, but this control emitted CLEAN and exited 0. The unchanged control case emitted CLEAN with the same identity fingerprint.
Observed: every one of the 87 cases reported fingerprint prefix 033830c295cea686, PID 2, PPID 1, uid/gid 1000, cwd /h, root /r and hostname plazir27. No case-specific signal appeared in these observations.
Sandbox evidence: .ufo/waves/round-44/probe/p44b-count.mjs:224-231 clears the environment, sets HOME=/h and PATH=/n/bin:/usr/bin, fixes cwd and argv, and unshares namespaces. Read-only /usr and /n plus private /proc, /dev, /tmp and /h remain visible alongside /c and /r.
Limit: this is evidence against this fingerprint shortcut, not proof that every non-shape side channel is absent. The canonical judge retains all acceptance authority.
Smallest safe correction: no counter defect was demonstrated here; retain the isolation and mixed CLEAN/DRIFT cases. This item provides no MET control and no redesign trigger.
Source note: its pre-run comment predicts 11 CLEAN/76 DRIFT; the observed frozen generator actually produced 13 CLEAN/74 DRIFT. The 11/87 hash threshold is merely a fixed bias; the scored source is preserved byte for byte.
Tools installed or updated: none. No operator-owned file contents, credentials or live agent contents were read.
Workspace command: mkdir -p /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/lane && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/lane checkout -q --detach 292d92668ff80973547a8b10d12ffb5a48f2d7d8 -> no output; exit 0.
Extraction: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44b-count.mjs -> exact frozen bytes saved as /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44b-count.mjs.
Extraction: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 292d92668ff80973547a8b10d12ffb5a48f2d7d8:.ufo/waves/round-44/probe/p44-shape.tsv -> exact frozen bytes saved as /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44-shape.tsv.
Digest command: sha256sum /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44b-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44-shape.tsv /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/CtlEnvArgvCwd.mjs -> exit 0; output:
6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44b-count.mjs
fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44-shape.tsv
ce89634c20a08674aa5f151a6ad0370d9844e191e88012875bba443631350178  /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/CtlEnvArgvCwd.mjs
Score command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/CtlEnvArgvCwd.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44work
Score cwd: /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/lane; observed exit 1; stderr empty. Complete stdout follows the source.
Process check: pgrep -a -f '/[f]ast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/' -> no output; exit 1 (no matching process).
Cleanup: rmdir /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44work -> no output; exit 0.
Cleanup: rm -rf -- /fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/lane -> no output; exit 0. Frozen artifacts, control and receipts remain in the scoped scratch directory.
Full control source:
```js
// Control only: no mirror reads and no member rules. Operability is the tested axis.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { hostname } from 'node:os';
const attempt = (fn) => { try { return fn(); } catch (e) { return `!${e.code || e.name}`; } };
const root = process.argv[process.argv.indexOf('--root') + 1];
const facts = {
  env: Object.entries(process.env).sort(([a], [b]) => a.localeCompare(b)),
  argv: process.argv, execArgv: process.execArgv, execPath: process.execPath,
  cwd: attempt(() => process.cwd()), root, hostname: attempt(hostname),
  uid: attempt(() => process.getuid()), gid: attempt(() => process.getgid()),
  euid: attempt(() => process.geteuid()), egid: attempt(() => process.getegid()),
  groups: attempt(() => process.getgroups()), pid: process.pid, ppid: process.ppid,
  parentCommand: attempt(() => readFileSync(`/proc/${process.ppid}/cmdline`, 'utf8')),
  parentName: attempt(() => readFileSync(`/proc/${process.ppid}/comm`, 'utf8')),
  platform: process.platform, arch: process.arch, module: import.meta.url,
};
const digest = createHash('sha256').update(JSON.stringify(facts)).digest('hex');
// The frozen case mix contains 11 CLEAN and 76 DRIFT cases; no case labels are read.
const clean = parseInt(digest.slice(0, 8), 16) / 2 ** 32 < 11 / 87;
const verdict = clean ? 'CLEAN' : 'DRIFT';
const tag = [`fp=${digest.slice(0, 16)}`, `pid=${facts.pid}`, `ppid=${facts.ppid}`,
  `uid=${facts.uid}`, `gid=${facts.gid}`, `cwd=${encodeURIComponent(facts.cwd)}`,
  `root=${encodeURIComponent(root)}`, `host=${encodeURIComponent(facts.hostname)}`].join(',');
// P44 accepts a suffix after its verdict prefix; expose the actual sandbox identity in its receipt.
console.log(`OMP_CENSUS: ${verdict}[${tag}]`);
process.exit(clean ? 0 : 1);
```
Complete counter stdout:
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/CtlEnvArgvCwd.mjs sha256=ce89634c20a08674aa5f151a6ad0370d9844e191e88012875bba443631350178
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlEnvArgvCwd/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE kind:models.yml expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:predict expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE near:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE kind:RULES.md expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:predict expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:cache expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE mode:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:models.yml expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:agent.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE neardigit:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:sessions expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:custom-session-files expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:mcp.json expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:blobs expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:custom-session-files expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE near:blobs expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:history.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:RULES.md expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:mcp.json expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:hooks expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:config.yml expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:agents expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:models.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE near:sessions expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:blobs expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:config.yml expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:hooks expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:agent.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE near:custom-session-files expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE mode:config.yml expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:models.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE mode:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:config.yml expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:agents expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:sessions expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:agents expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE mode:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:predict expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:models.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE no-chains expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE kind:cache expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:history.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:models.yml expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:hooks expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE kind:agent.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:mcp.json expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE control expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE neardigit:RULES.md expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
CASE stray-digit expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:history.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE near:cache expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE stray expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE mode:mcp.json expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE mode:agent.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE kind:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=FAIL
CASE control-end expect=CLEAN exit=0 verdict=CLEAN[fp=033830c295cea686,pid=2,ppid=1,uid=1000,gid=1000,cwd=%2Fh,root=%2Fr,host=plazir27] P44=PASS
P44_COUNT: UNMET (passed=13 cases=87 floor=20 census_sha256=ce89634c20a08674aa5f151a6ad0370d9844e191e88012875bba443631350178)
```
