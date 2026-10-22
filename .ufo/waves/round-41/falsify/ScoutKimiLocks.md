RESULT ScoutKimiLocks rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=upstream created=2026-10-22T13:53:33-03:00 kind=directory

# ScoutKimiLocks — shape of ~/.kimi-code/locks and its provenance

Scope: read-only, shape only. No file under `~/.kimi-code/locks` was opened (none existed
at any observation). Session `state.json` files were read as metadata (keys plus title and
timestamps) to date the two CLI runs; no credential, token or oauth file was read.

## Evidence

1. `stat -c '%n btime=%w mtime=%y ctime=%z mode=%a nlink=%h' ~/.kimi-code/locks ~/.kimi-code/locks/sessions`
   → `locks` btime=ctime=mtime=atime=2026-10-22 13:53:33.966993951 -0300, mode=700, nlink=1;
   `locks/sessions` btime=2026-10-22 13:53:33.966993951 -0300, ctime=mtime=2026-10-22 14:03:45.796085891 -0300, atime=13:53:33, mode=700, nlink=1, size=0.
2. `find ~/.kimi-code/locks -mindepth 1 -maxdepth 3 -printf '%y %M %s %f\n'`
   → exactly one line: `d drwx------ 0 sessions`. Child count: `locks` has 1 child, named `sessions`; `locks/sessions` has 0 children. No child name is a secret (there are none).
3. `stat -f -c 'fstype=%T bsize=%s' ~/.kimi-code/locks` → `fstype=btrfs bsize=4096`; `df -hT` → `/dev/mapper/root btrfs … /home`.
4. `~/.kimi-code/bin/kimi --version` → `2.3.0`; `command -v kimi` → `/home/vgpnk/.kimi-code/bin/kimi`; binary mtime `Oct 22 13:48`; `pacman -Qo` → `error: No package owns …` (self-updating binary, not a package).
5. `cat ~/.kimi-code/updates/install.json` → `lastSuccess: {version: 2.3.0, installedAt: 2026-10-22T16:48:04.288Z, notifiedAt: 16:53:20.727Z}`.
6. `cat ~/.kimi-code/updates/latest.json` → `latest: 2.3.0`, `publishedAt: 2026-10-21T06:23:46Z`, `checkedAt: 2026-10-22T17:03:35.648Z`.
7. `strings -a ~/.kimi-code/bin/kimi` around byte 134688568 → `SessionLockService = class SessionLockService extends SessionLockHolds { … this.lockDir = join$98(bootstrap.homeDir, "locks", "sessions"); …`.
8. Same extraction: `lockPath(sessionId) { return join(this.lockDir, \`${sessionId}.lock\`); }`; `tryPublish` writes `${lockPath}.tmp-${pid}-${uuid}` with `mode: 384` (0600) then `linkSync(tmp, lockPath)`; `ensureLockDir` is `mkdirSync(this.lockDir, { recursive: true, mode: 448 })` (0700); `unpublish` unlinks the file when its own token still matches; `reclaim` uses a `${lockPath}.reclaim` sibling; `alive()` compares hostname, pid, and process start against host boot time.
9. Binary markers: `KIMI_CODE_SESSION_LOCK` = 0 hits, `taking over session lock` = 0, `evict(sessionId` = 0, `startsWith("Z")` = 0; `function pidAlive` = 6 with the EPERM-only body (`process.kill(pid, 0)`). So the installed artifact carries the #4246-era code, not the Oct 21 #4320 zombie reclaim and not the Oct 22 #4328 takeover.
10. `https://api.github.com/repos/MoonshotAI/kimi-code/commits?path=packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts` → 3 commits: `3079e9515f 2026-10-20 feat(agent-core-v2): add cross-process session occupancy lock (#4246)`, `0a90e2e8a2 2026-10-21 fix(agent-core-v2): reclaim session locks from zombie processes (#4320)`, `e7f1a99fc5 2026-10-22 feat: let users take over a session lock left by an exited process (#4328)`.
11. `GET /repos/MoonshotAI/kimi-code/pulls/4246` → title `feat(agent-core-v2): add cross-process session occupancy lock`, `merged_at = 2026-10-20T09:21:19Z`, author `7Sageer`; body: "one process per session at a time; open and view are unaffected … a lock whose holder is dead is reclaimed; lock I/O failure warns and degrades to no lock".
12. `registry.npmjs.org/@moonshot-ai/kimi-code` time map → `2.2.0 2026-10-14T15:35:26.375Z`, `2.3.0 2026-10-21T05:55:55.979Z`, dist-tag latest=2.3.0. The feature commit (Oct 20) sits strictly between those two releases.
13. Primary docs, `https://www.kimi.com/code/docs/en/kimi-code-cli/changelog.html` 2.3.0 (2026-10-21): "When the same session is open in multiple clients, sending a message from another client now shows an occupancy prompt, with options to retry or cancel."
14. Technical changelog `raw.githubusercontent.com/MoonshotAI/kimi-code/main/apps/kimi-code/CHANGELOG.md`, release PR #4288: "When the same session is open in multiple clients, sending from a second one now shows an occupancy prompt with retry/cancel, or reloads updates made elsewhere first and resends your message."
15. `.changeset/session-lock-takeover.md` on main (unreleased, `patch`): "Offer to take over a session that is still in use after a retry … and add a `KIMI_CODE_SESSION_LOCK=0` switch that turns off the session lock." Not in the installed binary (marker hit 0 in item 9).
16. `~/.kimi-code/sessions/wd_vgpnk_403b91ce3657/*/state.json` (metadata only) → two sessions titled `update kimi code cli`, `updatedAt` 2026-10-22T16:53:14Z and 17:03:42Z; the second is 3 seconds before the `locks/sessions` mtime 17:03:45Z. `locks` btime 16:53:33Z is 13 seconds after `notifiedAt` 16:53:20Z and 5 minutes 29 seconds after `installedAt`.
17. `grep -aic lock ~/.kimi-code/logs/kimi-code.log` → `0`; no `session lock unavailable`, `occupied`, or `taking over` line, so a clean claim and clean release left no log trace.
18. In scratch clone at the measured revision: `node scripts/kimi-census.mjs` → `CENSUS error UNLISTED locks … locks sits at the root and is not declared by the frozen K1–K5 set`; `TOTALS: members=52 checked=52 errors=1 info=4 chain=8`; `KIMI_CENSUS: DRIFT (UNLISTED locks)`; `exit=1`. Root enumeration line: `root children=35 declared=26 chain=8 strays=1`.
19. Round-open receipt `.ufo/waves/round-41/open/receipts.txt` (16:00:11Z) → `KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4)` `exit=0`. The lesson's "read CLEAN at 16:00Z" holds; the chain is 8 generations now (a new `config.toml.*.bak` appeared after open).
20. Lesson wording, `corpus/lessons/round-41.md` open limits: "`~/.kimi-code/locks` (a directory, mode 700, created 2026-10-22 13:53:33 -0300, one child)" — matches observations exactly; the lesson gives no cause.

## Findings

- Kind: directory, mode 0700, one child `sessions` (also directory, 0700, empty). Persistent structural shell, transient contents.
- It is a new upstream feature, not a stray or transient artifact. `SessionLockService` creates `join(KIMI_CODE_HOME, "locks", "sessions")`; the base path is `~/.kimi-code` (no `KIMI_CODE_HOME` in the environment; the binary documents the fallback). The service landed in PR #4246 (merged 2026-10-20), shipped in 2.3.0 (npm publish 2026-10-21T05:55:55Z), and is documented in the 2.3.0 changelog as the multi-client occupancy prompt.
- Lock file shape while held (from source, not observed): `<sessionId>.lock`, JSON `{version: 1, token, pid, hostname, startedAt, clientIdentity}`, mode 0600, published atomically via write-temp plus link; a `.reclaim` sibling appears during takeover of a dead holder, and `.tmp-<pid>-<uuid>` files exist for microseconds. Claims are advisory per session; open and view do not lock.
- Empty now is the normal released state: the CLI unlinks its own lock on exit, and the 17:03:45Z directory mtime matches a claim-and-release cycle in the 17:03:42Z session. No Kimi process was running when checked (`pgrep -a kimi` empty).
- Round-42 K1 note: declare `locks/` and `locks/sessions` as kind and mode only (directories, 0700 floor), never counted and never name-gated. A counted pin of `locks/sessions` will flap between 0 and the number of live clients, and name-gating will fail on every session id. Declaring `locks` with one declared child `sessions` is stable; declaring the grandchildren is not.
- The installed artifact is internally consistent with 2.3.0: it lacks both #4320 and #4328 code. The unreleased changeset shows a future patch adds takeover plus a `KIMI_CODE_SESSION_LOCK=0` kill switch, so a later upgrade will change behavior at this path (stale locks may be offered for takeover instead of blocking).

## Unresolved

- Which process created and removed a lock file at 17:03:45Z is inference from directory mtime plus the session `updatedAt`; no log line records lock activity.
- A live lock file was not observed: doing so needs a running Kimi client holding a session, which would touch host state and was out of scope.
- The exact commit the 2.3.0 binary was built from is not published; the code fingerprint (item 9) bounds it to the #4246 implementation before #4320.
- Tag `2.3.0` and `v2.3.0` raw paths return HTTP 404 (repository tags use another naming scheme), so tag-to-source binding was done through commit dates and npm publish times instead.

## Not done / limits

- No packages installed or upgraded; tools used were already present (`strings`, `dd`, `stat`, `curl`, `python3`, `node`).
- All writes stayed in `/fast/scratch/hyaku/kumitate-r41/seats/ScoutKimiLocks/` plus this report.
