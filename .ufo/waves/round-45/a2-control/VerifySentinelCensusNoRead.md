RESULT VerifySentinelCensusNoRead rev=a2e5b54c verdict=confirmed confirmed=6 refuted=0 unverified=0 new=0
Severity: Informational; no defect observed. Exploit path: none observed; tests used synthetic scratch roots, never `~/.omp/agent`.
Impact: The census read directory names and member metadata, not member contents. Smallest remediation: none indicated.
Confirmed inherited items: (1) one open was the root directory; no member open/read; (2) 34 synthetic members returned CLEAN; (3) source uses only root/child `lstat` and root `readdir`; (4) child symlink is not followed; (5) filesystem mutations are selftest-only; (6) old trace size and no-process cleanup match.
Revision: clone HEAD `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`.
`git -C /fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusNoRead/lane show d81978cd:scripts/omp-census.mjs | sha256sum; git -C /fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusNoRead/lane show a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f:scripts/omp-census.mjs | sha256sum` -> both `fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7`; `git -C /fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusNoRead/lane diff --quiet d81978cd a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f -- scripts/omp-census.mjs; printf 'diff_exit=%s\\n' "$?"` -> `diff_exit=0`.
Source read `scripts/omp-census.mjs:115-129,287-299,329-334,420,454-477`: read shape calls `lstatSync(root)`, `readdirSync(root)`, and `lstatSync(join(root,name))`; `materialise` is called by `fixtureCase` inside `selftest`; `--root` dispatches to `runCensus`; filesystem imports contain no content-read/open API.
`strace --version; node --version` -> `strace -- version 7.2`; `v24.21.0`. No install/update.
Exact bounded fixture command:
```sh
systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash -c '
set -eu
BASE=/fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusNoRead
ROOT="$BASE/synthetic-root"
TRACE="$BASE/census.strace"
LANE="$BASE/lane"
mkdir -p "$ROOT"
for spec in \
  f:644:RULES.md f:600:agent.db d:agents d:blobs d:cache f:600:config.yml \
  d:custom-session-files f:644:history.db d:hooks f:600:kimi-device-id \
  f:644:last-changelog-version f:600:mcp.json f:600:mcp.json.rea.backup \
  f:644:models.db f:644:models.yml d:predict d:sessions f:600:skill-descriptions.db \
  d:terminal-sessions d:themes d:tools d:commands d:prompts d:memories d:extensions \
  f:600:agent.db.pre-restore-20260101T010101Z \
  f:600:agent.db.recovered-20260101T010101Z \
  f:600:history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b \
  f:600:agent.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b \
  f:600:mcp.json.pre-disable-20260101T0101 \
  f:600:mcp.json.rea.backup.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.recovery \
  f:600:agent.db-wal f:600:history.db-shm \
  f:600:agent.db.pre-restore-20260101T010101Z-shm; do
  kind=${spec%%:*}; rest=${spec#*:}; mode=${rest%%:*}; name=${rest#*:}
  if [ "$kind" = d ]; then mkdir -m 755 "$ROOT/$name"; else : > "$ROOT/$name"; chmod "$mode" "$ROOT/$name"; fi
done
printf "root=%s\\ntrace=%s\\n" "$ROOT" "$TRACE"
strace -f -yy -e trace=open,openat,openat2,read,readlink,statx,newfstatat,getdents64 -o "$TRACE" node "$LANE/scripts/omp-census.mjs" --root "$ROOT"
'
```
Output (exit 0): `OMP_CENSUS: CLEAN (root=/fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusNoRead/synthetic-root entries=34 findings=0)`.
Trace search `synthetic-root`: one root `statx`, one root-directory `openat`, two root `getdents64`, 34 successful child `statx`; no member `open`/`openat`/`openat2`, `read`, or `readlink`. The one source-file `read` was outside the fixture.
Symlink check, same required wrapper (shell body whitespace-normalized): `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash -c 'set -eu; BASE=/fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusNoRead; ROOT="$BASE/symlink-root"; TARGET="$BASE/marker-data"; TRACE="$BASE/symlink.strace"; mkdir -p "$ROOT"; printf marker-not-secret > "$TARGET"; ln -s ../marker-data "$ROOT/link-outside"; set +e; strace -f -yy -e trace=open,openat,openat2,read,readlink,statx,newfstatat,getdents64 -o "$TRACE" node "$BASE/lane/scripts/omp-census.mjs" --root "$ROOT"; rc=$?; set -e; printf "exit=%s target=%s trace=%s\\n" "$rc" "$TARGET" "$TRACE"'` -> DRIFT for `UNLISTED link-outside`, exit 1 expected; trace shows `AT_SYMLINK_NOFOLLOW`, `S_IFLNK`, no `marker-data` access.
`stat -c 'bytes=%s' /fast/scratch/hyaku/kumitate-r45/seats/w1-R45SentinelCensusNoRead/census.strace; pgrep -af '/fast/scratch/hyaku/kumitate-r45/seats/w1-R45SentinelCensusNoRead' || true; pgrep -af '/fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusNoRead' || true` -> `bytes=21308`; no process matches. Coverage not assessed; no new finding.