RESULT CtlStateful rev=292d9266 verdict=UNMET passed=74 cases=87 control_sha256=d1d63a616b59a9ac38e6da1c66471bf42b2e001ad3773d655623afa5e10643ca
Revision for all results: 292d92668ff80973547a8b10d12ffb5a48f2d7d8; scratch clone detached at this revision. Frozen counter and shape were extracted with git show; their hashes are in stdout below.
Axes: operability (this control probes case isolation); coverage is not claimed. No real census was built or scored; no operator-root contents were opened.
Control: read only the mirror name set; cache the first set in every tested writable location, or retrieve it from an abstract socket; CLEAN only when a recovered set matches, otherwise DRIFT. It has no per-member kind or permission rules.
Counter command (run exactly once): `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/p44b-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/lane/CtlStateful.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/p44work`; observed exit=1, all 87 census invocations returned DRIFT, 74 passed and 13 CLEAN cases failed.
Auxiliary detector: two sequential sandboxes over an empty-file alpha/empty-directory beta mirror; PASS requires both exit=1 with DRIFT, no file HIT, no socket HIT, and no other namespace PID. This detector, not the frozen counter, was mutation-tested.
Pristine/restored detector command (twice per stage): `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bwrap --unshare-all --die-with-parent --new-session --clearenv --ro-bind /usr /usr --symlink usr/lib /lib --symlink usr/lib64 /lib64 --symlink usr/bin /bin --ro-bind /home/vgpnk/.local/share/mise/installs/node/26.12.0 /n --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/isolation-fixture/c /c --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/isolation-fixture/r /r --tmpfs /tmp --proc /proc --dev /dev --dir /h --setenv HOME /h --setenv PATH /n/bin:/usr/bin --chdir /h /n/bin/node --max-old-space-size=256 /c/omp-census.mjs --root /r`.
Mutant detector command (twice): `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bwrap --unshare-all --die-with-parent --new-session --clearenv --ro-bind /usr /usr --symlink usr/lib /lib --symlink usr/lib64 /lib64 --symlink usr/bin /bin --ro-bind /home/vgpnk/.local/share/mise/installs/node/26.12.0 /n --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/isolation-fixture/c /c --ro-bind /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/isolation-fixture/r /r --bind /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/isolation-fixture/shared-tmp /tmp --proc /proc --dev /dev --dir /h --setenv HOME /h --setenv PATH /n/bin:/usr/bin --chdir /h /n/bin/node --max-old-space-size=256 /c/omp-census.mjs --root /r`.
Pristine observed output: [{"exit":1,"stdout":"STATE {\"files\":{\"/tmp/.p44-state\":\"ENOENT/OK\",\"/h/.p44-state\":\"ENOENT/OK\",\"/dev/shm/.p44-state\":\"ENOENT/OK\",\"/dev/.p44-state\":\"ENOENT/OK\",\"/.p44-state\":\"ENOENT/OK\",\"/c/.p44-state\":\"ENOENT/EROFS\",\"/r/.p44-state\":\"ENOENT/EROFS\"},\"socket\":\"ECONNREFUSED\",\"bind\":\"OK\",\"otherPids\":[]}\nOMP_CENSUS: DRIFT\n","stderr":""},{"exit":1,"stdout":"STATE {\"files\":{\"/tmp/.p44-state\":\"ENOENT/OK\",\"/h/.p44-state\":\"ENOENT/OK\",\"/dev/shm/.p44-state\":\"ENOENT/OK\",\"/dev/.p44-state\":\"ENOENT/OK\",\"/.p44-state\":\"ENOENT/OK\",\"/c/.p44-state\":\"ENOENT/EROFS\",\"/r/.p44-state\":\"ENOENT/EROFS\"},\"socket\":\"ECONNREFUSED\",\"bind\":\"OK\",\"otherPids\":[]}\nOMP_CENSUS: DRIFT\n","stderr":""}]; ISOLATION_DETECTOR: PASS.
Mutated observed output: [{"exit":1,"stdout":"STATE {\"files\":{\"/tmp/.p44-state\":\"ENOENT/OK\",\"/h/.p44-state\":\"ENOENT/OK\",\"/dev/shm/.p44-state\":\"ENOENT/OK\",\"/dev/.p44-state\":\"ENOENT/OK\",\"/.p44-state\":\"ENOENT/OK\",\"/c/.p44-state\":\"ENOENT/EROFS\",\"/r/.p44-state\":\"ENOENT/EROFS\"},\"socket\":\"ECONNREFUSED\",\"bind\":\"OK\",\"otherPids\":[]}\nOMP_CENSUS: DRIFT\n","stderr":""},{"exit":0,"stdout":"STATE {\"files\":{\"/tmp/.p44-state\":\"HIT/EEXIST\",\"/h/.p44-state\":\"ENOENT/OK\",\"/dev/shm/.p44-state\":\"ENOENT/OK\",\"/dev/.p44-state\":\"ENOENT/OK\",\"/.p44-state\":\"ENOENT/OK\",\"/c/.p44-state\":\"ENOENT/EROFS\",\"/r/.p44-state\":\"ENOENT/EROFS\"},\"socket\":\"ECONNREFUSED\",\"bind\":\"OK\",\"otherPids\":[]}\nOMP_CENSUS: CLEAN\n","stderr":""}]; ISOLATION_DETECTOR: FAIL.
Restored observed output: [{"exit":1,"stdout":"STATE {\"files\":{\"/tmp/.p44-state\":\"ENOENT/OK\",\"/h/.p44-state\":\"ENOENT/OK\",\"/dev/shm/.p44-state\":\"ENOENT/OK\",\"/dev/.p44-state\":\"ENOENT/OK\",\"/.p44-state\":\"ENOENT/OK\",\"/c/.p44-state\":\"ENOENT/EROFS\",\"/r/.p44-state\":\"ENOENT/EROFS\"},\"socket\":\"ECONNREFUSED\",\"bind\":\"OK\",\"otherPids\":[]}\nOMP_CENSUS: DRIFT\n","stderr":""},{"exit":1,"stdout":"STATE {\"files\":{\"/tmp/.p44-state\":\"ENOENT/OK\",\"/h/.p44-state\":\"ENOENT/OK\",\"/dev/shm/.p44-state\":\"ENOENT/OK\",\"/dev/.p44-state\":\"ENOENT/OK\",\"/.p44-state\":\"ENOENT/OK\",\"/c/.p44-state\":\"ENOENT/EROFS\",\"/r/.p44-state\":\"ENOENT/EROFS\"},\"socket\":\"ECONNREFUSED\",\"bind\":\"OK\",\"otherPids\":[]}\nOMP_CENSUS: DRIFT\n","stderr":""}]; ISOLATION_DETECTOR: PASS.
Mutant: one own auxiliary policy field, {"tmp":"private"} -> {"tmp":"shared"}, replaces a private tmpfs with an own-scratch shared bind. Expected detection: the second sandbox recovers /tmp/.p44-state. Observed HIT/EEXIST and CLEAN exit=0: KILLED. No frozen counter bytes were changed.
Policy before SHA256=a40c685a62651b5119418568e87499d0a8e1b7c302dd930b60bdd72d0aec53ea; mutant SHA256=4d96cdf8edad16c041e5c2efce4869c1df5c93238691ac8962bee25f739b9b6d; restored SHA256=a40c685a62651b5119418568e87499d0a8e1b7c302dd930b60bdd72d0aec53ea. Exact policy restoration=True; control bytes unchanged=True, before/after SHA256=d1d63a616b59a9ac38e6da1c66471bf42b2e001ad3773d655623afa5e10643ca.
Persistence observed: none in pristine/restored /tmp, /h, /dev/shm, /dev or private /. Writes to /c and /r returned EROFS. Only the deliberately shared-/tmp mutant persisted a marker. Abstract connects returned ECONNREFUSED, binds succeeded, and otherPids=[] in every direct launch.
Limits: the socket listener was closed voluntarily; no detached keeper or System V shared-memory API was used. The PID table observation and /dev/shm marker do not prove arbitrary IPC non-persistence.
Runtime boundary: counter shell node --version returned v24.21.0, bwrap --version returned 0.13.1; the separate detector mounted /home/vgpnk/.local/share/mise/installs/node/26.12.0 at /n in all three stages. These detector results are not additional P44 scores.
Process check after runs: `pgrep -af /fast/scratch/hyaku/kumitate-r44/seats/CtlStateful` returned exit=1, empty stdout each time; final check also exit=1. Counter work had no children; own isolation-fixture and p44work directories were removed. No tools installed or updated; no lane code changes or patch to integrate.
Full control source:
```js
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { connect, createServer } from 'node:net';
const root = process.argv[3] || '/r';
const snapshot = JSON.stringify(readdirSync(root).sort());
const paths = ['/tmp/.p44-state', '/h/.p44-state', '/dev/shm/.p44-state', '/dev/.p44-state', '/.p44-state', '/c/.p44-state', '/r/.p44-state'];
const trace = { files: {}, socket: null, bind: null, otherPids: [] };
let previous;
try { mkdirSync('/dev/shm', { recursive: true }); } catch {}
for (const path of paths) {
  let read, written;
  try { const value = readFileSync(path, 'utf8'); previous ??= value; read = 'HIT'; } catch (e) { read = e.code; }
  try { writeFileSync(path, previous ?? snapshot, { flag: 'wx', mode: 0o600 }); written = 'OK'; } catch (e) { written = e.code; }
  trace.files[path] = `${read}/${written}`;
}
const address = '\0p44-CtlStateful-292d9266';
const socketCache = await new Promise((resolve) => {
  const client = connect(address); let body = '';
  const finish = (value) => { clearTimeout(timer); client.destroy(); resolve(value); };
  const timer = setTimeout(() => finish(null), 100);
  client.on('data', (chunk) => { body += chunk; });
  client.on('end', () => finish(body)); client.on('error', (e) => { trace.socket = e.code; finish(null); });
});
if (socketCache !== null) { previous ??= socketCache; trace.socket = 'HIT'; }
const server = createServer((client) => client.end(previous ?? snapshot));
await new Promise((resolve) => {
  server.once('error', (e) => { trace.bind = e.code; resolve(); });
  server.listen(address, () => { trace.bind = 'OK'; server.close(resolve); });
});
trace.otherPids = readdirSync('/proc').filter((p) => /^\d+$/.test(p)).map(Number).filter((p) => p !== process.pid && p !== process.ppid);
const clean = previous !== undefined && previous === snapshot;
console.log(`STATE ${JSON.stringify(trace)}`);
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exitCode = clean ? 0 : 1;
```
Counter complete stdout:
```text
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/lane/CtlStateful.mjs sha256=d1d63a616b59a9ac38e6da1c66471bf42b2e001ad3773d655623afa5e10643ca
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/CtlStateful/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE near:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE mode:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE neardigit:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE kind:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE neardigit:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:kimi-device-id expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE neardigit:sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:hooks expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:terminal-sessions expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE mode:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-sidecars expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE kind:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE stray-digit expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:last-changelog-version expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:history.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE no-chains expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE kind:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
CASE kind:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:agent.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:RULES.md expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:mcp.json.rea.backup expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:predict expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:custom-session-files expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:cache expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:blobs expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:agents expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:mcp.json expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE kind:config.yml expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE neardigit:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE near:models.db expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=1 verdict=DRIFT P44=PASS
CASE control-end expect=CLEAN exit=1 verdict=DRIFT P44=FAIL
P44_COUNT: UNMET (passed=74 cases=87 floor=20 census_sha256=d1d63a616b59a9ac38e6da1c66471bf42b2e001ad3773d655623afa5e10643ca)
```
