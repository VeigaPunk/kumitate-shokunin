# Round 45 — repairs first, and one exploratory frontier entry on isolation substrates

Lane base `3632602c` (round-44 closure). Attempt 1 (`KumitateR45`, dispatched 04:45Z) died with its orchestrator at
05:25:25Z after landing `cfa99304` (plan), `ca5b0aac` (errata E1–E6) and `a2e5b54c` (F1 quote control, frozen
checklist E7). Attempt 2 (`KumitateR45A2`, dispatched 05:26Z) treated attempt 1's 45 untracked and 5 modified files
as untrusted scratch (snapshot outside the lane, `/fast/scratch/hyaku/kumitate-r45/a2/`), re-derived every input it
cites with fresh seats, and cites only `.ufo/waves/round-45/a2-control/` receipts and its own L1 runs.

## Claim

**C1 — exploratory, axis coverage (surface: PROVINCE frontier band "Isolation substrates for parallel agents").**
No counter. The judged object is `corpus/knowledge/agent-isolation-substrates.md` at its entry commit (named in the
report), its SOURCES rows and the attempt-2 demo receipts it cites. Verdict rule (plan, frozen at `cfa99304`):
`unprovable-but-better` only with a named non-author reviewer on record, otherwise `unprovable`; checklist K1–K5
(`a2e5b54c`) as amended by E9 (before the entry commit) must hold first. No axis integer moves.

## Gate

Sources opened this round (all re-opened by attempt-2 seats on 2026-10-23 with curl, git clone or the installed
binary; receipts `.ufo/waves/round-45/a2-control/Reopen<id>.md`). Quotes are verbatim, word counts by
`printf '%s' "<quote>" | wc -w`.

| row | URL | accessed | quote (locator, words) | decision |
|---|---|---|---|---|
| S013 | https://moonshotai.github.io/kimi-code/en/guides/tower.html | 2026-10-23 | "Worktrees isolate writes, but they are not a security sandbox." (§ Safety and resource cost, 10) | admit A, queued → mined; locator widened to the four sections the gloss uses (ReopenS013) |
| S027 | https://github.com/git/git/blob/v2.55.0/Documentation/RelNotes/2.55.0.adoc | 2026-10-23 | "Document the fact that .git/info/exclude is shared across worktrees linked to the same repository." (§ UI, Workflows & Features, lines 38-39, 14) | admit A, queued → mined |
| S062 | https://git-scm.com/docs/git-worktree | 2026-10-23 | "The new worktree is linked to the current repository, sharing everything except per-worktree files such as HEAD, index, etc." (§ COMMANDS add, 19) | admit A, mined |
| S063 | https://git-scm.com/docs/gitrepository-layout | 2026-10-23 | "All files under common however will be shared between all working trees." (entry `common`, 12) | admit A, mined |
| S064 | https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/githooks.adoc | 2026-10-23 | "Environment variables, such as `GIT_DIR`, `GIT_WORK_TREE`, etc., are exported so that Git commands run by the hook can correctly locate the repository." (:30-31, 22) | admit A, mined |
| S065 | https://git-scm.com/docs/git/2.56.0 | 2026-10-23 | "If the GIT_DIR environment variable is set then it specifies a path to use instead of the default .git for the base of the repository." (§ Environment Variables, The Git Repository, 25) | admit A, mined |
| S066 | https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/git-compatibility.md | 2026-10-23 | "Jujutsu will import and export from and to the Git repo on every `jj` command automatically." (:104-106, 16) | admit A, mined |
| S067 | https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md | 2026-10-23 | "You can have multiple working copies backed by a single repo." (§ Workspaces :76, 11) | admit A, mined |
| S068 | https://github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 | 2026-10-23 | "a private, frozen repo" (`task/worktree.ts:677-678`, 4) | admit A, mined |
| S069 | https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml | 2026-10-23 | "bwrap is running a minimal pid 1 process" (:63, 8) | admit A, mined |
| S070 | https://github.com/containers/bubblewrap/blob/362936aea0d5c6e70f7af75d2d44b5a914cb4ba2/bubblewrap.c | 2026-10-23 | "We have to have a pid 1 in the pid namespace, because otherwise we'll get a bunch of zombies as nothing reaps them." (:3481-3484, 23) | admit A, mined |
| S071 | https://man7.org/linux/man-pages/man5/proc_pid_environ.5.html | 2026-10-23 | "This file contains the initial environment that was set when the currently executing program was started via execve(2)." (§ DESCRIPTION, 18) | admit A, mined |
| S072 | https://www.freedesktop.org/software/systemd/man/262/systemd.resource-control.html | 2026-10-23 | "out-of-memory killer is invoked inside the unit" (MemoryMax=, HTML 192, 7) | admit A, mined |
| S073 | https://nodejs.org/docs/v24.21.0/api/cli.html | 2026-10-23 | "Sets the max memory size of V8's old memory section." (`--max-old-space-size`, line 4148, 10) | admit A, mined |
| S074 | `jj status --help` (jj 0.45.1-7c41cdeb) | 2026-10-23 | "By default, Jujutsu snapshots the working copy at the beginning of every command." (stdout line 36, 13) | admit A, mined |
| S075 | https://git-scm.com/docs/githooks/2.56.0 | 2026-10-23 | "Redirecting…" (page title of a 596-byte wrapper canonicalising to the 2.54.0 page, 1) | **reject**: serves no 2.56.0 manual text; S064 used instead. flip: a 2.56.0 githooks page is served |
| S076 | https://git-scm.com/docs/gitrepository-layout/2.56.0 | 2026-10-23 | "gitrepository-layout last updated in 2.49.0" (unversioned page footer, 5) | **reject**: the versioned URL is a 632-byte redirect to 2.49.0; S063 used instead. flip: a versioned 2.56.0 page serves the text |

Other gate decisions this round (reasons recorded):

- **Rejected: attempt-1 receipts as evidence.** All 38 attempt-1 seat reports under `.ufo/waves/round-45/build/`,
  the draft entry and the draft QUALITY/SCORECARD/lesson edits: untrusted (their seats and L1 are dead); used only as
  statements for attempt-2 seats to confirm or refute. The committed F1 control `build/CtlQuoteFabricated.md`
  (`a2e5b54c`) was re-derived by CtlQuoteRerun (fabricated and one-word-changed quotes `MISSING`; a `grep -i` mutant
  of the procedure survives).
- **Rejected: five statements of the draft entry**, each refuted by an attempt-2 demo seat and not carried into the
  entry: "30 git objects" for a fresh repo (RedoDemoJjSnapshot: +3, first snapshot +4); "index untouched" in the M2
  control (RedoDemoJjGitStray: intent-to-add entry written); "moved that work" (it is duplicated); "a hook sees 12
  `GIT_*` names" as a fixed count (RedoDemoGitEnvLeak: 8 to 13 by caller); `prlimit --as=768M` (RedoDemoNativeMemCap:
  prlimit rejects the spelling) and "round 44: 6 GiB" (no locator).
- **Rejected: `mori-shokunin/corpus/knowledge/oom-event-plane.md` as the OOM owner** — the file does not exist at mori's
  HEAD (ConnOverlapRecheck); the entry cites mori's three existing OOM entries instead.
- **Rejected: draft Q30 as a sufficient gate** — a junk-variation catalog reads `CATALOG_GATE: PASS`
  (CtlQ30Shortcuts); Q30 lands as necessary-not-sufficient with a junk-variation control added to its Field.

### Row log (old → new)

- S013: status `queued` → `mined`; recheck date `2026-10-19` → `2026-10-23`; locator `§ Safety and resource cost;
  fetched 2026-10-19` → the four sections plus fetch metadata (ReopenS013); used-by `—` →
  `corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md`.
- S027: status `queued` → `mined`; used-by `—` → the entry and this lesson.
- S062–S074: new rows, status `mined`, used-by the entry and this lesson.
- S075, S076: new rows, status `rejected`, used-by this lesson.
- Frontier: S013 and S027 were the PROVINCE frontier band's queued rows ("Isolation substrates for parallel agents");
  S014 (git-worktree 2.54.0) stays `queued`, superseded in scope by S062 (2.56.0) but not re-opened this round.

## Controls (pre-freeze control wave, attempt 2)

Wave `a2-control` (50 seats, dispatched 05:34Z, 49 settled by the entry commit). The C1 checklist was attacked by
do-nothing, glossary, label-keyed, off-topic and same-effect controls before the entry existed in any commit:

| control | result | consequence |
|---|---|---|
| CtlDoNothingEntry | K1–K3 and F1–F3 vacuous on an empty lane; rejected only by K4/K5 | E9 K0 existence floors |
| CtlGlossaryEntry | object D (glossary plus two pasted rows with source locators) passes K1–K5 literally | E9 K1′ (demo per row), K5′ (operative column) |
| CtlLabelKeyedEntry | label reading passes swapped rows; opening the receipts fails them | E9 K1′ row-to-effect binding |
| CtlOffTopicRow | script catches 1/3, reading 2/3; a 2.54.0 page cited as 2.56.0 passes everything | E9 K3′ version-marker duty |
| CtlDemoSameEffect | a dirty-sandbox control shows the same op delta; attempt-1 M1 receipt printed no control counts | E9 K2′ paired before/after values |
| CtlQuoteRerun | F1 procedure reproduces; `grep -i` mutant survives | recorded; reading resolves |
| CtlCheckK5Baseline | K5 premise holds against round-44 wave practice; prior passages exist | entry names them (K4) |
| CtlQ30Shortcuts | ids and order killed; junk variation survives | Q30 limit and Field control |
| CtlQ30Reproduce | p44d REUSED 19/9, toy FRESH, pinned REUSED — reproduces | Q30 measured lines |
| CtlQ31GuardShortcut | p44d fails 4/4 guards; comment-only strings pass the greps; Fails-when (selftest) rejects both | Q31 states the guards are a tripwire |

## Routed repairs (round-44 closure)

- **R44-1** → QUALITY Q30 (necessary, not sufficient; junk-variation control required). Command bytes
  `probe/catalog-check.mjs.txt` committed with its toy fixtures.
- **R44-2** → `lessons/round-44.md` § Round-45 record errata (items re-derived by ScoutErrataCheck, corrected on items
  2, 3, 7) and QUALITY Q29 ordering note (its draft command measured HEAD and never exited 1; fixed).
- **R44-3** → QUALITY Q31 (mechanisms M5/M6 of the entry; guards plus a required runner selftest; residual channels
  from SentinelBwrapEnvI). No runner lands: attempt-1 seat ExecCounterSandbox died without a report and is not resent.
  No counter runs this round, so no counted run is left unbounded.
- **R44-4** → eight attempt-2 seats verified the attempt-1 findings (`a2-control/Verify*.md`): census code review 6
  confirmed, 1 refuted (25 base members, not 24), 2 new (`--work`/`--root` combinations silently ignored; sidecar rule
  accepts `-wal`/`-shm` on non-SQLite members); no-read claim 6/6 confirmed; edge cases confirmed plus setgid bits
  evading the permission ceiling; selftest mutation 83 outcomes reproduced (32 killed, 51 survived); checklist pass
  17/19 confirmed; checklist blindness confirmed; round-43 repairs 10/10 confirmed; census-vs-domain in
  `VerifyCritCensusVsDomain.md` if it settled (see report).
- **R44-5** → SCORECARD `### operability` round-45 note: `A` counts every runnable-extension file in the tree,
  round probes included (ScoutProxyADef: `A` 16 at `3632602c` and `a2e5b54c`; `.txt` probes are not counted).
- **R44-6** → errata as above; Move-log row order fixed in place; `C2 96 → 99` fixed in place.
- **R43-1, R43-5** → not re-claimed (anti-loop). VerifyR43Diag: shipped-tip `GATE_MUTANTS: ERROR` exit 2 reproduced
  (a single-target run cannot exit 0 by design; the full run is load-sensitive); MutCiteWitness 4/4 survive (3/4 under
  K43). Disposition: record and defer; the capability row stays unverified.
- **Open DRIFT** (`C2_TOTAL_DRIFT declared=99 computed=100` at open) → README row for
  `lessons/round-44-verifier-spotcheck.md`; mined below.

## Mistakes

- **Class: a non-author closure file lands without a README row, so the next round opens in DRIFT — eight times.**
  Evidence: `.ufo/waves/round-45/open/proxy-strict-3632602c.txt:2` (`C2_TOTAL_DRIFT declared=99 computed=100`) and the
  same cause at the opens of rounds 35, 36, 40, 41, 42, 43, 44 (`a2-control/ScoutDriftCause.md` table).
  Captured-by: `proxy-check --strict` detects it every round but nothing prevents it; no QUALITY criterion required
  the row. Fix: QUALITY Q32 — every corpus note has a README row at every lane commit, the lane adding the closure
  file's row in its first corpus commit; command prints the missing notes. Shown able to fail: at `3632602c` it prints
  `lessons/round-44-verifier-spotcheck.md`, at `6cda8c35` `lessons/round-43-verifier-spotcheck.md`.
- **Class: an L1 dies mid-round leaving uncommitted work no commit carries.** Evidence: attempt 1's 45 untracked and
  5 modified files (`jj-lane.sh state` at 05:27Z: `tracked=5 untracked=45`), including 17 source rows and a full entry
  draft, none citable. Captured-by: none — the round contract commits wave evidence "as wave evidence" without saying
  when. Fix (practice, from round 46): the L1 commits each wave's receipts through the helper as soon as the wave
  settles, before integrating them. Shown able to fail: this round's own sequence — `d9ad2870` (spec and dispatch
  before seats ran), `31656bdf` (receipts before the entry) — would have left a citable record had attempt 2 died
  after 06:00Z; attempt 1's state at 05:25Z did not.

## Verdict at close

Filled at close below this line; nothing above changes after the falsify wave starts except by appended errata.

### Attempt 3 (`KumitateR45A3`, dispatched 06:40Z) — appended; nothing above is reworded

Attempt 2 died with the orchestrator (omp SIGSEGV) at 06:19:06Z, 14 minutes after spawning its 44-seat falsify wave
`a2-falsify`; no seat of that wave reported, its record is committed at `9c4785ea` and none of its tasks was resent.
Attempt 3 snapshotted the 45 untracked leftovers outside the lane and removed them (plan § E10), then ran wave
`a3-falsify` (33 seats, all new designs, spawned 06:50:44Z, all 33 settled by 07:14Z, receipts `3837d315`).

#### Gate additions (attempt 3)

| row | URL | accessed | quote (locator, words) | decision |
|---|---|---|---|---|
| S077 | https://nodejs.org/docs/v24.21.0/api/process.html | 2026-10-23 | "arrayBuffers refers to memory allocated for ArrayBuffers and SharedArrayBuffers, including all Node.js Buffers." (§ process.memoryUsage(), HTML 2869-2870, 13) | admit A, mined — the source for erratum X7, replacing a sentence S073 does not support; opened by the L1 (curl, HTTP 200, page header `Node.js v24.21.0`, body sha256 `1224adf1…`) |

Independent-channel re-opens of the cited rows (method new this attempt: the row's URL plus an upstream tag or the
installed man page or package): S013, S027, S062, S063, S064, S065, S066, S069, S070, S071, S074 **hold** (quote
verbatim in every channel, pins reproduce). Defects, each answered by an entry erratum or a row fix:

- **S073 — rejected: the entry sentence "a Buffer's backing store is an ArrayBuffer outside that section"**, found in no
  channel (XChanS073); withdrawn by erratum X7, sourced instead on S077; S073's teaches cell corrected in place.
- **S072 — rejected: the § Scope pointer "its S072 is the same systemd-run page"** (tsukuroi's file cites S121;
  XChanS072) → X8; row locator TasksMax= 245 → 250 and the "most stringent" gloss moved to EffectiveMemoryMax=.
- **S067** — "a fresh clone carries no auto-track key" is not in the cited lines → X9 (the demo is its evidence).
- **S066** — locator :119-121 → :120-121 → X10.
- **S068** — the 4-word quote spans a `//` comment line break; not contiguous under whitespace-only normalisation
  (XChanS068) → X11. The author does not rule whether K3′'s reading clause accepts it; the closure does.
- **S063** — the page footer says "last updated in 2.49.0" while the row says Git 2.56.0; the source text is
  byte-identical at v2.49.0 and v2.56.0 (XChanS063), and KSheetFull flags the literal marker mismatch. Recorded, not
  re-scored.
- **S013** — Last-Modified served as 06:23:18, the row pinned 06:23:19 (same bytes and etag) → row note.
- **S075, S076 — rejects re-judged and upheld** (XRejudgeS075: the 2.56.0 URL is a wrapper canonicalising to 2.54.0;
  XRejudgeS076: a redirect to 2.49.0); substitutes S064 and S063 confirmed by tag and installed man page.
- **Method control (CtlChannelMethod):** the re-open procedure caught 6/9 planted defects (word, locator and version
  defects on S062 and S071); the three S066 probes were inconclusive because a raw Markdown page carries no version
  marker of its own, so K3′'s literal version-marker duty cannot be met by S066 or S067 — their version identity rests
  on the tag-to-commit resolution (`v0.45.1` = `7c41cdeb`), stated here, not counted as a marker pass.

Rejected guard readings (entry errata X1–X7, from the six guard ablations): `git diff` as a read-only command (X1);
"abandoned" in M2 (X2); the row-3 guard line as written, which fails open inline under `systemd-run` (X4);
`--shared`/`--reference` as "separate clones" (X5); the `env -i` 0-name count as the prescribed invocation's (X6); exit
137 as the scope client's OOM signal (X7).

#### Row log additions (old → new)

- S072: anchor `TasksMax= (245-258)` → `(250-258 …)`, `Delegate= (618-632)` → `(610-632)`; teaches "the effective cap is
  the most stringent of unit and parent slices" → attributed to EffectiveMemoryMax=. Status, recheck, used-by unchanged.
- S073: teaches "Buffers share ArrayBuffer backing memory outside it" → withdrawn with a pointer to S077. Status,
  recheck, used-by unchanged.
- S013: anchor gains the served Last-Modified 06:23:18 note. Status, recheck, used-by unchanged.
- S077: new row, status `mined`, used-by the entry (erratum X7) and this lesson.

#### Mistakes (attempt 3)

- **Class: a guard tested in one form is prescribed in another.** Evidence: the entry's row-3 guard line
  (`6b2a4517:corpus/knowledge/agent-isolation-substrates.md:162`) is not the line SentinelSeatEnvScrub tested
  (`a2-control/SentinelSeatEnvScrub.md:40`: it chains `&& unset … || exit`), and the shortened line fails open when
  passed inline through `systemd-run` (AblScrubRow D1: `A=2 B=1`, exit 0). Captured-by: none — K1′ binds a row to its
  receipt's effect, not to the exact guard bytes. Fix (practice from round 46): a guard an entry or wave context
  prescribes is copied byte-exact from the receipt that tested it, runs from a script file, and is checked by
  comparing the two strings. Shown able to fail, L1 run at `6b2a4517`: extracting the row's guard (markdown `\|`
  unescaped) and line 40 of the receipt and comparing them prints `GUARD_BYTES: DIFFER`.

#### Practice audits (findings routed to round 46; no code changed this round)

- AuditLaneGitWriters: of 16 git call sites in `scripts/`, 9 write (selftest fixtures); 5 write with the caller's
  repository variables not cleared — `cite-check.mjs:1674`, `proxy-check.mjs:2695`, `round-gate.mjs:717,719` (spread
  `process.env`), and `surface-probe.mjs:1007` (`bash -c` of checklist text).
- AuditLaneSandboxes: 24 child-process sites, none under a cgroup `MemoryMax`; `surface-probe --checklists` runs
  checklist text in `bash -c` with the inherited environment.

#### C1 at close

**C1 (exploratory, coverage — PROVINCE frontier band "Isolation substrates for parallel agents"): author's reading
`unprovable` pending the non-author ruling.** The verdict rule frozen at `cfa99304` allows `unprovable-but-better` only
with a named non-author reviewer on record, and the round's own seats do not count; that judgment is requested of the
hyaku closure. The checklist as frozen at the entry commit (E7 with the E9 amendments), applied by wave `a3-falsify`:

- K0 holds (6 rows, 13 new rows cited, 8 committed demo receipts; KSheetFull).
- K1′ holds (KSheetFull: every row binds a defined mechanism and a receipt showing its effect).
- K2′: all six ablation seats re-ran their row's effect and do-nothing control from a printed clean pre-state with
  their own scripts, `baseline=reproduces control_clean=yes` 6/6. Differing numbers are corrected by named appended
  errata (X6 `env -i` count, X7 exit code and VmPeak), which K2 as frozen admits.
- K3′: 11 of 15 cited rows hold through a second channel; S067, S072 and S073 had entry sentences their sources do not
  support (corrected by X7–X9); S068's quote is not contiguous under whitespace-only normalisation (X11); the
  literal version-marker duty is unmeetable for S066/S067 (no in-text marker) and S063's footer names 2.49.0. These
  are the items on which the closure rules K3′.
- K4 holds with the pointer corrections X3, X8, X12.
- K5′ holds (KSheetFull), with X4: the row-3 guard prescribed is not the tested bytes.

The judged object is unchanged since `6b2a4517`; all corrections are appended below its text. No axis integer moves.
