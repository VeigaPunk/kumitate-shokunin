# Round 88 — a scorer that makes two byte sources differ along one path has tested one path

Lane kumitate, 2026-11-04, Linux run-15 host. Base `7ac24afa477a44304a3b125e320ef86929218189`;
freeze `114877a308ffc0bcd63e354bcef03e6b9fe538d4` (plan, frozen 20-arm probe, control generators,
round-87 spot-check adoption, K87-V1 receipt, start census); pre-data control receipts
`8735f70f545c9a0355816d5ce86b30791ae7e6be`; L1 v2 instrument `0ff3562f15c18d0ca01dc6a76c9f827d30c26950`;
wave spec `8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`. One claim: C1 operability, capability
acquisition `receipt-bind` v2. Paths beginning `open/`, `controls/`, `probe/`, `build/`, `w1/` or
`close/` resolve beneath `.ufo/waves/round-88/`.

## Method

Round 87 lost this capability to its own kill rule: a worktree-hashing candidate scored 12/12
because no arm made the worktree differ from the judged revision. Round 88 froze a 20-arm scorer
whose fixture repository holds three bodies of one instrument (commit A, commit B, dirty worktree),
added the round-87 sentinel's four fail-open boundaries as arms with positive twins, and replaced
the time-seeded fixture with a deterministic sweep. Seventeen controls were scored before any data
(`controls/*.txt`): the do-nothing control (the committed v1 instrument) 16/20, its worktree twin
11/20, blanket refusal 2/20, every round-87 seat construction 8–16/20.

The L1 then wrote v2 (`ESCAPES_LANE`, `SYMLINK_DIR`, `RECEIPT_TOO_LARGE`, `AMBIGUOUS_FIELD`),
which reads 20/20 while its mechanical worktree twin reads 11/20.

**The claim is UNMET.** The frozen kill rule says any seat-constructed control at 20/20 makes C1
UNMET. Nine constructions reached it, each a one-to-six-line diff of the integrated instrument
that skips a claimed behaviour, each shown to skip it on a fixture outside the probe path:

| construction | skipped behaviour | evidence |
|---|---|---|
| `c2-head-default`, `e2-index-default` | revision binding: `HEAD:`/index read when a receipt has no `rev=` (the fixture's `--rev B` is also HEAD and the index) | `build/K88Critic/SCORES.md`, `disc-*.txt` |
| `ctl-abs-disk` | revision binding for ABSOLUTE in-lane tokens (no arm puts one before a dirty worktree) | `build/K88Connector/probe-ctl-abs-disk.txt`, `adjacency-ctl-abs-disk.txt` X2b |
| `d-fixture-gated-boundaries` | all four boundaries outside a `/probe88/` path | `build/K88Critic/SCORES.md` |
| `nogit-overfit` | revision binding entirely; A/B told apart from `.git/logs/HEAD` and the probe's public body constants | `build/K88Review2/ctl-nogit-overfit.txt` |
| `f1-size-after-read`, `f5-loose-limit` | "refused before it is read" and the 1048576 edge | `build/K88Critic/SCORES.md`; mutants M16/M18/M23/M24 `build/K88Mutation/summary.json` |
| `f4-textual-escape` | `ESCAPES_LANE` by resolution (`scripts/../../x` passes as external) | `build/K88Critic/SCORES.md` |
| `f6-dup-equal-ok` | `AMBIGUOUS_FIELD` for equal-valued duplicate `rev=`/`tool_sha256=` | `build/K88Critic/SCORES.md` |

The instrument is stronger than its scorer again: v2 refuses every one of those inputs
(`disc-*.txt` integrated column; the integrated selftest now holds 59 cases including the exact
1048576/1048577 edge). The capability row does not enter the table. This is a rejected-honest-stop,
the second in a row for this capability, and the reason is the same class as round 87's: the
scorer's fixtures make the byte sources disagree along fewer paths than the instrument has.

## Gate

Sources opened this round by seat K88ScribeSources (captures fetched 2026-11-04, committed under
`open/`, quotes grep-located in `build/K88ScribeSources/quote-check.receipt.txt`, `QUOTE_CHECK: CLEAN`);
the L1 re-checked each sha256 against the copied capture before appending.

- **Admit — S252, mined, A.** *CWE-22: Improper Limitation of a Pathname to a Restricted Directory
  ('Path Traversal')*, https://cwe.mitre.org/data/definitions/22.html, § Description, accessed
  2026-11-04. Located quote (`open/cwe22.html` line 482): “special elements within the pathname that
  can cause the pathname to resolve to a location that is outside of the restricted directory”.
  Grounds `ESCAPES_LANE`. sha256 `654cd4b71d847764fccd8a2e3790931cc4332e80db9708e8a5094921ba017382`.
- **Admit — S253, mined, A.** *gitrevisions(7)*, https://git-scm.com/docs/gitrevisions,
  § SPECIFYING REVISIONS, entry `<rev>:<path>`, accessed 2026-11-04. Located quote
  (`open/gitrev.html` line 2441): “at the given path in the tree-ish object named by the part”.
  Grounds revision binding through `blobAt`. sha256 `1ab7124a99e6919e6882be82f77c629ac8fe623bb36af56a749fd4db1919070b`.
- **Re-opened — S218 (existing), A.** *CWE-59*, https://cwe.mitre.org/data/definitions/59.html,
  accessed 2026-11-04, capture byte-identical to the round-70 pin (sha256 `4fae5c5e…a7a038`).
  Located quote (seat capture line 477): “does not properly prevent that filename from identifying
  a link or shortcut that resolves to an unintended resource”. Grounds `SYMLINK_DIR`. No new row
  (same URL would be a `W04` duplicate).
- **Reject — S254, rejected, B.** *OWASP Community: Path Traversal*,
  https://owasp.org/www-community/attacks/Path_Traversal, § Overview, accessed 2026-11-04. Located
  quote (`open/owasp-pt.html` line 473): “access files and directories that are stored outside the
  web root”. A web-root attack description with no normative containment rule; adds nothing over
  S252. Flip: an OWASP cheat sheet giving a normative canonicalize-then-containment check for
  non-web path arguments. sha256 `ba073650dc78f79a9aa1a453f1b0d3e54e7069e38628ad77c064cc028a5216a4`.
- **Registry changes, old→new.** S252, S253 added (`mined`, used-by
  `corpus/knowledge/receipt-subject-binding.md`); S254 added (`rejected`, used-by `—`); S218 used-by
  `corpus/knowledge/replay-output-isolation-link-following.md` →
  `corpus/knowledge/replay-output-isolation-link-following.md, corpus/knowledge/receipt-subject-binding.md`.
  No `status` or `recheck` changed. Capture pins S252–S254 added to `.ufo/pins/source-captures.json`.
- Sourced claim: C1's knowledge section (`corpus/knowledge/receipt-subject-binding.md`, *v2*) cites
  S252, S253 and S218. Non-author agree/disagree on these decisions is the closure's.

Assimilation: **none**. `/home/vgpnk/Projects/shokuknow/merge/kumitate` was not adopted; the one
claim, the routed defects and the frontier step filled the round. `considerthese/2026-10-26.md`
(latest) re-checked: ideas 1/2/3/4/6 already implemented as Q75/Q76/Q68/Q69/Q72, idea 5 outside
this lane's authority; no still-unimplemented proposal mined.

## Mistakes

| class | evidence | captured-by | fix and shown-able-to-fail boundary |
|---|---|---|---|
| survivor (predicate power, recurrence of round 87) | nine seat constructions at `C88_C1: HELD held=20/20` (table above); the plan's own "why a do-nothing control cannot reach it" named only the worktree twin, receipt-`rev=` ignoring and blanket refusal | the frozen kill rule (it fired, as designed); Q81 as drafted named only the worktree twin | Q81 round-88 amendment (judged revision ≠ HEAD ≠ index ≠ worktree, absolute and relative tokens, every limit at its edge from both sides, run-time fixture bytes and names). **Not yet shown able to fail**: it binds round 89's scorer, whose pre-data control battery must include the nine constructions above as committed controls |
| attribution (K87-V1, mined from round 87) | round 87 cited `RECEIPT_BIND: CLEAN matched=12` for its close receipts; the committed `.ufo/waves/round-87/close/bind.txt` prints `matched=10` because `bind` ran before `c1-probe` and itself | Q80 (subject binding) does not cover "the bind receipt counted every other receipt" | close runner v3 (`run-close.mjs`) runs `bind` last and prints `BIND_CASE … counted=N others=N ALL\|SHORT`, exiting 1 on SHORT; shown able to fail: the round-87 bytes are a SHORT case (`bind.txt` counts 10 against 11 other receipts in that dir); the round-87 erratum receipt `open/k87v1-bind-r87.txt` reads `CLEAN matched=12 … external=1` |
| ordering (K87-V2) | round 87's plan commit read `PLAN_BEFORE_READY: FAIL … MAP_DRIFT` because the spot-check adoption landed after the freeze | `plan-before-ready` map arm (it caught it) | the round-87 spot-check was adopted inside the round-88 freeze commit (`open/spotcheck-adopt.txt`: `README_MAP: CLEAN files=223`); the close battery's `plan` case is the check at M |
| provider/process | the L1 wrote the integration target before the wave so attack seats had one fixed target (round 87's sentinel reviewed a reference because the candidate did not exist yet); disclosed, not a defect | — | — |

## Frontier

The sentinel also reproduced lstat→read races that bypass `RECEIPT_TOO_LARGE` (73/400),
`SYMLINK_RECEIPT` (39/400) and `SYMLINK_DIR` (1/400), and a symlinked parent of `--dir` that is followed
(`w1/K88Sentinel.md`); these are the TOCTOU limit the knowledge entry already names, now measured.


Round 89 pre-registration (SCORECARD): a v3 scorer for `receipt-bind` whose pre-data controls
include the nine round-88 constructions; carried items from round 87 (spotcheck-adopt conflation,
`K_findings`, `POINTER_DEAD`, cite-check debt, receipt-evidence overlap) with the scout's anchors
(`w1/K88Scout.md`); the five `USED_BY_ASYMMETRY` warnings K88ExecCarry found (S243, S028, S124,
S041, S237); the reviewer's MED finding (`/proc/self/root` alias makes an in-lane instrument read as
external) and LOW-MED BOM finding (`w1/K88Review.md`).

## Limits

- A digest match is identity, never correctness (Q80).
- The 20-arm scorer is under-powered in the nine ways above; the instrument's v2 behaviour is
  evidenced by its selftest and the seats' discrimination receipts, not by the claim's predicate.
- `SYMLINK_DIR` checks only the final path component; `--dir` is not contained under the lane.
