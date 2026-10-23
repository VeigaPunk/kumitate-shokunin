# Round 47 — five child sites routed through the runner, judged by an outside observer

Lane base `0bd8be60` (round-46 non-author spot-check; round 46 admitted). L1 `KumitateR47`, dispatched 2026-10-23
09:28Z, attempt 1. Plan: `.ufo/waves/round-47/plan.md` (freeze `cac43009`, amendment A1 `796b49b4`). Wave receipts:
`.ufo/waves/round-47/build/`.

## Claim

**C1 — operability (lowest non-retired axis, 9).** Surface: five child-process sites in four lane gates —
K488 `scripts/kimi-census.mjs` `runGate`, SC549 `scripts/sources-check.mjs` `runTool`, SC859 the sources-check
awk-census parity spawn, CC879 `scripts/claims-check.mjs` `runClaims`, AT802 `scripts/anchor-truth.mjs` selftest
`tool()` — now launch their child through `scripts/cap-run.mjs` via the helper `scripts/cap-spawn.mjs`. Counter
`probe/caproute-probe.mjs` (A1): strace's execve/clone records of each gate's `--selftest`, observed outside the gate
and the runner. Before: `held=0/5` at base and at freeze. Target `held=5/5`. The prerequisite interface change
(runner contract `kumitate-cap-run-v2`: `--bind`, `--verdict-file`, synchronous verdict write, budget rule) landed in
the freeze commit; round 46's scout had found 0 of 24 sites routable without it. Sourced on S093 (strace
`--decode-pids=pidns`, which the counter needs to follow a clone inside bwrap's PID namespace), S094 (Node.js: pipe
writes are asynchronous on POSIX and `process.exit()` can drop pending writes — why the verdict is now written with
`fs.writeSync`) and S095 (bwrap applies mounts in argument order — why `--bind` follows `--tmpfs /tmp`), all opened
this round, with S069, S072 and S079.

## Gate

New rows, each opened this round by a seat (`build/<seat>.md` holds the fetched-bytes hash and the command):

| id | URL | accessed | quote (≤25 words) and locator | decision |
|---|---|---|---|---|
| S080 | raw oh-my-pi `0b5c27ab…/docs/task-agent-discovery.md` | 2026-10-23 | "Discovery uses first-wins dedup by exact `agent.name`:" (§ Merge and collision rules, first sentence; 7 words) | admit A, mined — supersedes S003 (SupersedeS003) |
| S081 | local `omp --version` | 2026-10-23 | "omp/18.12.6" (stdout line 1; 1 word) | admit A, mined — supersedes S004 (SupersedeS004) |
| S082 | https://moonshotai.github.io/kimi-code/en/guides/tower.html | 2026-10-23 | "Worktrees isolate writes, but they are not a security sandbox." (§ Safety and resource cost, ¶1; 10 words) | admit A, mined — supersedes S013; Last-Modified differs by one second from the round-46 record (SupersedeS013) |
| S083 | raw MoonshotAI/kimi-code `b5e28fd6…/sessionLockService.ts` | 2026-10-23 | "this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');" (:61; 5 words) | admit A, mined — supersedes S041 with corrected locators (SupersedeS041) |
| S084 | https://infection.github.io/guide/ (pinned `4d7570f5…/guide/index.md`) | 2026-10-23 | "If mutated program produces failing tests, this is called a *killed mutant*." / "TotalDefeatedMutants = KilledCount + TimedOutCount + ErrorCount;" (:13, :99; 20 words) | admit A, mined — supersedes S047; the guide does give the MSI sum, which round 46's text denied (SupersedeS047) |
| S085 | https://circleci.com/blog/what-is-mutation-testing/ | 2026-10-23 | "A floor of 60–80% on high-risk modules is the realistic target." (12 words) | reject C (kept) — supersedes S051 (SupersedeS051) |
| S086 | https://stackoverflow.com/questions/73439324/ (Stack Exchange API v2.3) | 2026-10-23 | "Such a syntactical change to the source code that does not change the semantics is called an equivalent mutant." / "Mutation Test also aim for Conciseness." (answers 74067880 ¶1, 73447929 heading; 25 words) | reject C (kept) — supersedes S052 (SupersedeS052) |
| S087 | raw oh-my-pi `45c35e40…/packages/utils/src/dirs.ts` | 2026-10-23 | "/** Get the custom themes directory (~/.omp/agent/themes). */" (:1007; 8 words) | admit A, mined — supersedes S053 (SupersedeS053) |
| S088 | oh-my-pi `45c35e40…/packages/utils/src/sqlite.ts` | 2026-10-23 | "fs.copyFileSync(`${dbPath}${suffix}`, `${backupPath}${suffix}`, fs.constants.COPYFILE_EXCL);" (:200; 3 words) | admit A, mined — supersedes S054 (SupersedeS054) |
| S089 | raw oh-my-pi `45c35e40…/packages/ai/src/auth/sqlite-credential-store.ts` | 2026-10-23 | "await fs.chmod(dbPath, 0o600);" (:594; 3 words) | admit A, mined — supersedes S055 (SupersedeS055) |
| S090 | fleet `scripts/hyaku/lane-addendum.md` at `4248e924…` | 2026-10-23 | "the operator authorized disabling the OMP `rea` MCP entry for this phase; the orchestrator set `"enabled": false` in `~/.omp/agent/mcp.json` at 10:12 -03" (:82-83; 22 words) | admit B, mined — supersedes S061; drops round 46's "not an OMP or REA chain" clause, which the source does not state (SupersedeS061) |
| S091 | https://nodejs.org/docs/v24.21.0/api/cli.html | 2026-10-23 | "Sets the max memory size of V8's old memory section." (:4148; 10 words) | admit A, mined — supersedes S073 (SupersedeS073) |
| S092 | https://git-scm.com/docs/gitrepository-layout/2.56.0 | 2026-10-23 | "0; url=https://git-scm.com/docs/gitrepository-layout/2.49.0" (body line 7, meta refresh; 2 words) | reject A (kept) — supersedes S076 (SupersedeS076) |
| S093 | https://github.com/strace/strace/blob/v7.2/doc/strace.1.in | 2026-10-23 | "Prints thread, process, process group, and session IDs in strace's PID namespace if the tracee is in a different PID namespace." (:1022-1024; 21 words) | admit A, mined (ScribeStrace) |
| S094 | https://nodejs.org/docs/v24.21.0/api/process.html | 2026-10-23 | "Calling `process.exit()` will force the process to exit as quickly as possible even if there are still asynchronous operations pending" (HTML 2062-2063; 20 words) | admit A, mined (ScribeNodeProcessIO; the L1 re-opened HTML :4021: "Pipes (and sockets): synchronous on Windows, asynchronous on POSIX") |
| S095 | https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml | 2026-10-23 | "These are applied in the order they are given as arguments." (:253-254; 11 words) | admit A, mined (ScribeBwrapBind) |

**Row log (old → new).** R46-1 repair: the 13 rows round 46 rewrote in place (S003, S004, S013, S041, S047,
S051–S055, S061, S073, S076) have their immutable cells (`id`…`teaches`, `opened`) restored to the `2b2bf7bb` bytes;
their `status`, `recheck` and `used-by` cells are kept as they are (only S076's `used-by` differs from `2b2bf7bb`, a
round-46 in-place change Rule 2 allows). Each correction now lives in its own appended row S080–S092 whose `teaches`
opens `supersedes S0NN —`. No `status`, `recheck` or `used-by` cell of an existing row changed this round.

## Controls (adversarial wave before data)

Twelve control seats (ten mutation-tester, two executor) built controls in scratch clones of the freeze commit, scored
them with the freeze counter and exported each as a committed patch (`build/Ctl*.patch`; R46-4): do-nothing,
string mention, fake runner, scope only, bwrap only, first call only, label/path dodge, full-environment passthrough,
loose caps, stub child with cases removed, junk, runner bypass. All twelve read `held=0/5` with the reason each targets.
**Rejected:** the freeze counter itself. CritC1Shape named a thirteenth shortcut — keep the real runner chain but move
the three limits out of systemd-run's `-p` options into `env -i` assignments after its `--` — and the L1 built it
(`probe/receipts/ctl-envcaps.patch`): **`held=5/5`** under the freeze counter. A1 (plan § A1) re-designed the counter
before any candidate was scored, adding the six conditions CritC1Shape objections 1–6 named; under A1 the same control
reads 0/5 (`no_capped_scope_ancestor` on every site) and every wave-1 control was re-scored
(`probe/receipts/a1-controls.txt`).

## Routed repairs (round-46 spot-check § 6)

- **R46-1** — restored rows and appended supersedes rows (above); Q35 (below) is the check.
- **R46-2** — appended correction in SCORECARD `## Round 46 correction`: 13 rows were rewritten, not 15; item 697
  failed in 4 of 4 close receipts, not 3 of 4; the open census carried W04 S034 as well as S068.
- **R46-3** — `surface-probe --checklists` result lines now carry `wall=` and `load1=` and, on FAIL, the last 8 lines
  of the item's own output (ExecChecklistTail; selftest case shown red on the freeze bytes, 44/46, and green after).
  Item-697 root cause: RevGateMutants697 and ExecLoad697 (§ Item 697).
- **R46-4** — the four scratch-only commits are exported as patch series under `.ufo/waves/round-47/repairs/r46-controls/`;
  ReviewR46Patches re-applied each and reproduced 4/4 trees.
- **R46-5** — `cap-run.mjs` writes its verdict with `fs.writeSync` (S094) and documents the budget rule (accepts
  `0.5`, rejects `00.5`, `.5`, `1e3`; ReviewCapRunV2). ReviewCapRunV2 F1 and SentinelCapSpawn 1 (`--bind /` re-opened
  the read-only root; `/run` leaked host sockets) are fixed: `--bind` binds the resolved directory and refuses `/`,
  `/proc`, `/sys`, `/dev` and `/run`; ReviewCapRunV2 L1 (two-line fallback) and L2 (`null` env values) are fixed.
  SentinelCapSpawn 2 (`--verdict-file` followed a planted symlink and truncated its target) is fixed: the file is
  opened `O_CREAT|O_EXCL|O_NOFOLLOW`; a planted symlink now leaves its target intact and the verdict goes to stderr
  with `verdict_file_error=EEXIST` (L1 probe).

## Mistakes

1. **class:** a correction rewrote existing `SOURCES.md` rows in place instead of appending superseding rows; the
   gates read only the tip, so the registry's history was not checked.
   **evidence:** R46-1 (`lessons/round-46-verifier-spotcheck.md:170-177`); `git diff 2b2bf7bb 9b33e03e --
   corpus/SOURCES.md` → 15 insertions, 13 deletions (S078/S079 are the two additions).
   **captured-by:** none operationally — CORPUS.md Rule 2 states it, but `scripts/sources-check.mjs` and the fleet
   census read one revision.
   **fix:** QUALITY Q35 and `.ufo/waves/round-47/quality/q35-append-only.sh <lane> <base> <tip>`. Shown able to fail
   (ExecQ35AppendOnly): `2b2bf7bb 9b33e03e` → `Q35 rewritten=13 removed=0`, exactly the thirteen ids, exit 1; a
   `teaches` edit → 1, exit 1; an `opened` edit → `cells=9`, exit 1; a row removal → `removed=1`, exit 1; a `used-by`
   edit, an appended `supersedes` row and padding only → 0, exit 0.
2. **class:** a counter that accepts the claimed bound by the presence of its tokens rather than by where the tool reads
   them. **evidence:** CtlEnvCaps met the freeze counter 5/5 (`probe/receipts/ctl-envcaps-frozen.txt`).
   **captured-by:** the §9 pre-data control wave, through a critic seat; none of the twelve planned controls covered it.
   **fix:** A1 reads systemd-run's own options before its `--`; shown able to fail: the same control reads 0/5 under A1
   (`probe/receipts/a1-ctl-envcaps.txt`).
