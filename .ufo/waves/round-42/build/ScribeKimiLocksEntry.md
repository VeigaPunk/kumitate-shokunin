RESULT ScribeKimiLocksEntry rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=drafted source=https://github.com/MoonshotAI/kimi-code/blob/e7f1a99fc52e68d8e8a2d99d59deba38e4272754/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts

# ScribeKimiLocksEntry — C2 prose for `~/.kimi-code/locks`

Behavior: read the plan, the K3 note, the census and proxy count rules, the installed CLI's
shipped source for the lock service, and the upstream file. Drafted (a) the knowledge
section for `corpus/knowledge/kimi-session-state.md`, (b) the small scope edits that note
needs so it stays self-consistent at ten members, and (c) the `corpus/SOURCES.md` row in the
registry's column shape. No lane file other than this report was written; no code, patch or
commit was produced. Every gate run reported below was made in a scratch clone of the lane at
the pinned revision, never in the lane working tree. Host shape was only stat'ed and read as
names, never a lock file's contents (none existed).

## Draft A — section to append to `corpus/knowledge/kimi-session-state.md`

Insert immediately before `## Unknowns and blockers` (line 398 of the note at this revision).
The heading names `locks/` only; naming `locks/sessions/` in the heading would bind the
`sessions` member instead, because `locks/sessions` is not an identity and the basename
`sessions` has exactly one owner (verified against the binder in `scripts/proxy-check.mjs`).

```markdown
## `~/.kimi-code/locks/` — the session-occupancy lock directory (declared round 42)

**What it is.** `~/.kimi-code/locks/` is a root child of the Kimi Code home that holds the
CLI's cross-process session locks. It has one child, `~/.kimi-code/locks/sessions/`, and that
child is where a running client publishes one `<sessionId>.lock` file per session it is
writing. The directory shell is persistent; the contents are transient.

**OBSERVATION (live, 2026-10-22).** `stat -c '%n mode=%a size=%s btime=%w mtime=%y'`
on the two paths reports `~/.kimi-code/locks` mode 700, size 16, btime = mtime
`2026-10-22 13:53:33.966993951 -0300`, and `~/.kimi-code/locks/sessions` mode 700, size 0,
btime `2026-10-22 13:53:33.966993951 -0300`, mtime `2026-10-22 14:03:45.796085891 -0300`.
`find ~/.kimi-code/locks -mindepth 1 -maxdepth 3 -printf '%y %M %s %f\n'` returns exactly one
line, `d drwx------ 0 sessions`; the child holds 0 entries and no Kimi process was running
(`pgrep -a kimi` empty). An empty `sessions/` is therefore the normal released state, not a
broken one.

**Who creates it (OBSERVATION, source side).** The installed CLI — `kimi-code` 2.3.0 per
`~/.kimi-code/updates/install.json`, binary `~/.kimi-code/bin/kimi` — carries the bundled
module `src/persistence/backends/node-fs/sessionLockService.ts` at byte 134687741. Its
constructor freezes the path:

```
/* src/persistence/backends/node-fs/sessionLockService.ts at byte 134688526 */
this.lockDir = join$98(bootstrap.homeDir, "locks", "sessions");
```

`ensureLockDir()` creates that directory recursively at mode 448 (0700), which the two live
directories match, and `lockPath(sessionId)` returns `` join$98(this.lockDir, `${sessionId}.lock`) ``
at byte 134692805.

**Lifecycle (OBSERVATION from the same region; no live lock file was observed).**
`publish(sessionId)` mints the token `` `${process.pid}:${randomUUID()}` `` and calls `claim`.
`tryPublish` writes `<lockPath>.tmp-<pid>-<uuid>` at mode 384 (0600) and then
`linkSync(tmp, lockPath)`; `EEXIST` means another holder. `readHolder` parses the JSON payload
`{version: 1, token, pid, hostname, startedAt, clientIdentity}` (`LOCK_FILE_VERSION = 1`,
byte 134688151). A holder is alive when its hostname differs from this host's, or when its pid
answers `process.kill(pid, 0)` (EPERM counts as alive) and its `startedAt` is not before the
host's boot time; a dead holder is reclaimed through a `${lockPath}.reclaim` sibling.
`unpublish` unlinks the file only when the on-disk token is the caller's own, and a
`process.on("exit")` listener releases every hold on exit. A claim that cannot write logs
`session lock unavailable; continuing without lock` (byte 134688956) and proceeds unlocked, so
a missing or empty directory is never an error.

**INFERENCE, bounded by the artifact.** The installed 2.3.0 bytes contain no
`KIMI_CODE_SESSION_LOCK`, no `evict(` and no `taking over session lock` literal (0 hits each),
so this host runs the first landed implementation (upstream PR #4246, merged 2026-10-20) and
not the later takeover work. Upstream `main` (the same file read at the 2026-10-22 revision)
adds a takeover path and a disable switch, so a future upgrade can make a stale `.lock`
offerable for takeover at this path. **UNKNOWN:** the on-disk contents of a live `.lock` on
this host; producing one needs a running Kimi client and was not attempted.

**How the census treats it.** Declared as ONE K3 member (`locks/`), presence-only, kind `dir`:
the directory must exist; its child set is never enumerated and its grandchildren are never
named, because `<sessionId>.lock` names are per-session and would flap. The observed mode 0700
is recorded here, not gated. Root enumeration now has the name declared, so the round-41 shape
`CENSUS  error  UNLISTED  locks` / `KIMI_CENSUS: DRIFT (UNLISTED locks)` exit 1 becomes a
`KIMI_CENSUS: CLEAN` verdict at `members=53 checked=53` exit 0 (the chain and info counts stay
live), with the K3 family at 10.

**Source.** S0xx — https://github.com/MoonshotAI/kimi-code/blob/e7f1a99fc52e68d8e8a2d99d59deba38e4272754/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts
— located quote, file line 69: `this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');`.
Corroborating docs, same path and purpose: https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/data-locations.html
§ Directory layout, `locks/` line — "Cross-process occupancy locks while a client writes a
session." (9 words).
```

`S0xx` is the placeholder the assignment asks for; the row below carries the concrete next-free
id. Replace `S0xx` with it (or with the docs row's id if the executor prefers the docs
citation as the registered one).

## Draft B — scope edits the note needs at ten members

Exact replacements, all inside `corpus/knowledge/kimi-session-state.md`:

1. `## Scope — nine members, one plane` → `## Scope — ten members, one plane`.
2. `one section per member — the nine of the K3 registry row:` → `one section per member — the ten of the K3 registry row:` and, at the end of the enumerated list, after the item for `~/.kimi-code/search-index/`, append a tenth item naming `~/.kimi-code/locks/` as the session-occupancy lock directory.
3. In `## Registry row and cross-domain routing`: `**Member count for this note: 9**` → `**Member count for this note: 10**`, add `~/.kimi-code/locks/` to the member list, and change the trailing phrase to read on the strength of 10 sections instead of 9.
4. Optional, in the `## Unknowns and blockers` table: add a row 8 whose item is the live `.lock` file contents, status UNKNOWN — no Kimi client was running, lock payload read from source only.

## Draft C — `corpus/SOURCES.md` row (registry column shape, 13 split fields)

Primary row, the source that creates the directory:

```markdown
| S039 | MoonshotAI kimi-code upstream session-lock service (agent-core-v2 node-fs backend), file read at e7f1a99fc52e68d8e8a2d99d59deba38e4272754 — https://github.com/MoonshotAI/kimi-code/blob/e7f1a99fc52e68d8e8a2d99d59deba38e4272754/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts | code | A | what creates and governs `~/.kimi-code/locks/sessions` on this host: lock directory, per-session lock file, claim, reclaim and liveness rules | file:69 `this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');`, :21 `LOCK_FILE_VERSION = 1`, :224 `mkdirSync(..., mode: 0o700)`, :228-229 `lockPath` -> `${sessionId}.lock` at e7f1a99fc52e68d8e8a2d99d59deba38e4272754 (2026-10-22), file sha256 fb3fae8242862a49b4bf26e994dd6c692de17eb2a079f173474cf21186301f77 | SessionLockService joins homeDir with `locks`, `sessions` and claims one `${sessionId}.lock` per writing client; a dead holder's lock is reclaimed and lock I/O failure degrades to unlocked | mined | 2026-10-22 | on-release | corpus/knowledge/kimi-session-state.md |
```

Optional second row, the official docs page (register it only if a prose quote is preferred;
one row is enough for C2):

```markdown
| S040 | Kimi Code Docs: Data locations — https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/data-locations.html | docs | A | the data-root layout entry for `locks/` and its stated purpose | § Directory layout, `locks/` line; fetched 2026-10-22 (VitePress page, no Last-Modified read) | "Cross-process occupancy locks while a client writes a session." | mined | 2026-10-22 | on-release | corpus/knowledge/kimi-session-state.md |
```

Both rows parse under `scripts/sources-check.mjs`: 11 cells, so 13 `|`-split fields; kind
`code` and `docs` are in the frozen enum; tier A; status `mined` with a used-by path that
exists; `opened` is an ISO day not in the future; `recheck` is `on-release`; no cell holds a
literal `|`. Measured, not asserted: with both rows inserted into a scratch clone's registry,
`node scripts/sources-check.mjs --self .` prints
`SOURCES_CHECK: CLEAN (rows=40 tiers=A:39,B:1,C:0 status=queued:14,mined:24,rejected:2 entries_with_source=3 legacy=38)`
exit 0, and `cite-check` reports the same error and warning totals as the pristine baseline
with no finding naming the new rows or the new section.

## Integration dependency found (outside my seat)

`scripts/proxy-check.mjs` re-derives its own member table (`K_MEMBER_RULES`, lines 502-530 at
this revision) and does **not** carry `locks`; only `scripts/kimi-census.mjs` was changed by
ExecKimiLocks. Until a proxy rule `{ id: 'locks/', family: 'K3', path: 'locks', kind: 'dir' }`
lands with the stanza and scorecard updates, `K_members` computes 52 even with the census
clean, and `K_sections` cannot reach 53. The proxy rule, the `kimi-proxy-v1` stanza
`K_members=53` / `K_sections=53` (and the re-pinned `pin.*` hashes), the `## Axes` row
`coverage:kimi-layer | 10 |` (unchanged, since floor(10 x 5/5 x 53/53) = 10), and the
scorecard K3 cell `(9)` → `(10)` are all part of the same cutover.

## Findings for the L1

1. **The base proxy is already red before this draft**: at b237e3f, `C2_total` computes 93
   against a declared 92, which floors the legacy `coverage` axis from 10 to 9 and fires
   `AXES_DRIFT`. The 93rd note is `corpus/lessons/round-41-verifier-spotcheck.md`, admitted in
   dfabe92 after the stanza's `C2=92` was frozen in 4e58bb0. Whoever edits the stanza for the
   round must move `C2_total=92` to 93 (the `## Axes` coverage row then returns to 10), or the
   round's MATCH target is unreachable for reasons unrelated to either claim.
2. **The proxy's own member table must move with the census** (section above): the C2 cutover
   needs the `locks/` rule in `K_MEMBER_RULES`, `K_members=53`, `K_sections=53`, the re-pinned
   `pin.*` hashes, and the scorecard K3 cell `(9)` → `(10)`.
3. **Cite-check trap for any future SOURCES row on a foreign repository**: a bare
   repo-relative path in a cell is graded `UNRESOLVED` under `--src`, and an eight-hex
   `commit <hex>` in prose is graded `REV_UNKNOWN`; the drafts avoid both by carrying the URL
   only and naming the upstream change as PR number plus date.

## Evidence

1. Lane rev: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks … lane` then `git checkout -q --detach b237e3f09c9559e130c7367bd2efa981c4ea516f`; `git -C lane rev-parse HEAD` → `b237e3f09c9559e130c7367bd2efa981c4ea516f`; clone node `v24.21.0`.
2. `node scripts/kimi-census.mjs; echo exit=$?` in the clone → `CENSUS  error  UNLISTED  locks  locks sits at the root and is not declared by the frozen K1–K5 set`; `TOTALS: members=52 checked=52 errors=1 info=4 chain=8`; `KIMI_CENSUS: DRIFT (UNLISTED locks)`; `exit=1`.
3. Baseline `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json` terms → `{"K_members":52,"K_sections":52,"C2":92,"C2_total":93,"coverage":9,"coverage_kimi":10,"operability":8}`; findings are `C2_TOTAL_DRIFT` (`declared=92 computed=93 delta=+1`), `AXES_DRIFT` (`coverage: ## Axes row=10 derived=9`) and three `PIN_UNPINNED` rows; the K terms are clean at this revision.
4. `stat -c '%n mode=%a size=%s btime=%w mtime=%y' ~/.kimi-code/locks ~/.kimi-code/locks/sessions` → `locks mode=700 size=16 btime=2026-10-22 13:53:33.966993951 -0300 mtime=2026-10-22 13:53:33.966993951 -0300`; `locks/sessions mode=700 size=0 btime=2026-10-22 13:53:33.966993951 -0300 mtime=2026-10-22 14:03:45.796085891 -0300`.
5. `find ~/.kimi-code/locks -mindepth 1 -maxdepth 3 -printf '%y %M %s %f\n'` → `d drwx------ 0 sessions` (one line); `ls -A ~/.kimi-code/locks/sessions | wc -l` → `0`; `pgrep -a kimi | wc -l` → `0`.
6. `grep -aob 'agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts' ~/.kimi-code/bin/kimi` → `134687694`; `grep -aobF 'this.lockDir = join$98(bootstrap.homeDir'` → `134688526`; `grep -aob 'LOCK_FILE_VERSION = 1'` → `134688151`.
7. `grep -aobF 'return join$98(this.lockDir'` → `134692805`; `grep -aobF 'linkSync(tmp, lockPath)'` → `134690951`; `grep -aobF 'mode: 384'` → `134690917`; `grep -aob 'session lock unavailable; continuing without lock'` → `134688956`.
8. `dd if=~/.kimi-code/bin/kimi bs=1 skip=134687500 count=16000 | strings -n 3` (scratch `lockregion.txt`, 508 lines) shows the region header `../../packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts`, the constructor, `publish`, `unpublish`, `claim`, `reclaim`, `tryPublish`, `readHolder`, `alive`, `payload`, `ensureLockDir`, `lockPath`.
9. Installed-artifact fingerprint: `grep -aob 'KIMI_CODE_SESSION_LOCK'` → no output; `grep -aob 'taking over session lock'` → no output; the lock region carries no `evict`. Compare upstream file at e7f1a99f, which has `SESSION_LOCK_ENV`, `evict(sessionId)` and `taking over session lock`.
10. `cat ~/.kimi-code/updates/install.json` → `lastSuccess.version = "2.3.0"`, `installedAt 2026-10-22T16:48:04.288Z`, `notifiedAt 2026-10-22T16:53:20.727Z`; `~/.kimi-code/updates/latest.json` → `latest: "2.3.0"`, `publishedAt 2026-10-21T06:23:46Z`.
11. Upstream pin: `curl -sS -o upstream-sessionLockService.ts https://raw.githubusercontent.com/MoonshotAI/kimi-code/e7f1a99fc52e68d8e8a2d99d59deba38e4272754/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts`; `sha256sum` → `fb3fae8242862a49b4bf26e994dd6c692de17eb2a079f173474cf21186301f77`; `wc -l` → `239`.
12. `grep -n` on that file → `21:const LOCK_FILE_VERSION = 1;`, `69: this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');`, `224: fs.mkdirSync(this.lockDir, { recursive: true, mode: 0o700 });`, `228: private lockPath(sessionId: string)`, `229: return join(this.lockDir, \`${sessionId}.lock\`);`.
13. `https://api.github.com/repos/MoonshotAI/kimi-code/commits?path=packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts&per_page=5` → three commits for that path: `3079e9515f` (2026-10-20, PR #4246 add cross-process session occupancy lock), `0a90e2e8a2` (2026-10-21, #4320 zombie reclaim), `e7f1a99fc5` (2026-10-22, #4328 user takeover + `KIMI_CODE_SESSION_LOCK=0`); latest path commit is `e7f1a99fc52e68d8e8a2d99d59deba38e4272754`.
14. Docs page opened: `https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/data-locations.html` → § Directory layout code block contains `locks/` with `sessions/  # Cross-process occupancy locks while a client writes a session`; the page also confirms `KIMI_CODE_HOME` relocates the whole tree.
15. Heading-binding replication (proxy-check's own four-regex chain applied to the planned heading) → `` `~/.kimi-code/locks/` `` → `locks` (binds the member); `` `~/.kimi-code/locks/sessions/` `` → `locks/sessions` (not an identity) and its basename would resolve to the `sessions` member, so the heading must name `locks/` only.
16. `grep -n 'locks' corpus/knowledge/kimi-*.md` → no heading names it today (only prose hits in kimi-config-plane.md, kimi-lane-definitions.md, kimi-modes-machinery.md, kimi-skills-plugins.md), so the new heading adds exactly one K member to `K_sections`.
17. `grep -c '^| S039 \|^| S040 ' corpus/SOURCES.md` → `0`; highest registered id is `S038`, so S039/S040 are free.
18. `scripts/sources-check.mjs` row rules read at this revision: `KINDS` includes `code` and `docs`; `opened` must be an ISO day; `recheck` accepts `on-release`; `mined` needs a used-by path that exists; `fields.length === 13` for a valid row.
19. ExecKimiLocks report (`.ufo/waves/round-42/build/ExecKimiLocks.md`) places `locks/` in K3, K3 frozen 10, selftest 49/49, census CLEAN at 53/53, and names `corpus/knowledge/kimi-session-state.md` with heading `## `~/.kimi-code/locks/``; this draft matches that placement and heading.
20. Word count of the docs quote: `Cross-process occupancy locks while a client writes a session.` → 9 words (limit 25).
21. Clone probes only (not delivery): with Draft C's two rows inserted at the registry's end, `node scripts/sources-check.mjs --self .` → `SOURCES_CHECK: CLEAN (rows=40 tiers=A:39,B:1,C:0 status=queued:14,mined:24,rejected:2 entries_with_source=3 legacy=38)`, `exit=0` (baseline rows=38 at this revision).
22. Cite-check neutrality: pristine `baseline` clone at b237e3f, `node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src` → `errors=719 warnings=554 ... revUnknown=36`; with Draft A's section plus Draft C's rows in `lane` → `errors=719 warnings=554 ... revUnknown=36` (tokens 9424 → 9432) and no finding names the new lines. The gate is red at baseline for pre-existing reasons; the draft adds no finding.
23. Two citation-form traps cost one error each before the fix, both visible in `cite-check` output: a bare foreign repo path in a SOURCES cell (`UNRESOLVED packages/agent-core-v2/...sessionLockService.ts not found under src`) and an eight-hex `commit <hex>` in prose (`REV_UNKNOWN 3079e951`). The final drafts carry the URL only and name the upstream change as `PR #4246` plus its date.
24. Binding probe in `lane` (clone-only): with `{ id: 'locks/', family: 'K3', path: 'locks', kind: 'dir' }` added to `K_MEMBER_RULES` and Draft A's heading in place, `node scripts/proxy-check.mjs --src … --json` terms → `{"K_members":53,"K_sections":53,"coverage_kimi":10}`; findings add exactly `K_MEMBERS_DRIFT declared=52 computed=53`, `K_SECTIONS_DRIFT declared=52 computed=53` and `PIN_DRIFT pin.proxy-check` (expected, the probe edited the script), with `coverage_kimi` still 10 and no `K_SECTION_AMBIGUOUS` warning.
25. Pre-existing base drift, not mine: the pristine baseline at b237e3f already drifts on `C2_total` (declared 92, computed 93) because `corpus/lessons/round-41-verifier-spotcheck.md` was added in dfabe92 after the stanza's `C2=92` was frozen in 4e58bb0; `git log --diff-filter=A` names that file as the newest corpus note, and `ls corpus/knowledge/*.md | wc -l` (41) plus `ls corpus/lessons/*.md | wc -l` (52) gives 93.

## Limits

- No live `.lock` file was observed and none was created; the lock-file schema and lifecycle
  are read from the shipped JS region, not from host artifacts. Lock payload claims are source
  facts, not observations.
- The installed binary is an anonymous build: the exact commit behind 2.3.0 is unpublished, so
  the fingerprint (literal hits) bounds it to the #4246-era code, before #4320 and #4328.
- The upstream `main` file and the installed bytes differ; the section says so rather than
  presenting one as the other. The executor's own source read used commit
  `759958afdfeb0f8c7d09cb03cbc2cf85b6255e9e`, which carries the same `lockDir` literal; the row
  pins the commit this seat actually opened.
- Mode 0700 is recorded as an observation, not gated: `scripts/kimi-census.mjs` applies
  `modeFloor` only to `secret` members, so pinning 0700 would need code support this draft does
  not presume.
- No tool installed or upgraded; no pacman command was run. Scratch only:
  `/fast/scratch/hyaku/kumitate-r42/seats/ScribeKimiLocksEntry/` (clone `lane` at the pinned
  revision, `lockregion.txt`, `upstream-sessionLockService.ts`). No patch file: the delivery is
  text in this report.
