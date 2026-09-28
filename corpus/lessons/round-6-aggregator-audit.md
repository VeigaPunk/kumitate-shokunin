# Round 6 aggregator audit — kumitate-shokunin

- **Round:** aggregator round 6 (steered; `.ufo/state/aggregator.round` = 6), 2026-09-28.
- **Auditor:** aggregator L1 lane — non-author of every entry audited; corrections are this new entry, no lane file edited.
- **Audited state:** `kumitate-shokunin` HEAD `7a4c9a00ee8d353421c8aea0aca979d92c492007`; origin tree `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` HEAD `ee907f1cf75241e21ee311e35ba4c2cdf44bcbbe`.
- **Freeze timestamp:** `date -u` → `2026-09-28T21:30:03Z`. The kumitate round-8 lane was **live and writing during the audit** (PID 1133123, launched 17:57:53; `SCORECARD.md` created 18:29:11), so every finding below is pinned to that instant and re-runnable.
- **Method:** read-only. Every number carries the command that produced it; every absence carries its sweep. No build, test, service, or browser was executed.
- **Anchor revision:** main-repo `PROTOCOL.md`/`ROADMAP.md` were being edited by the live protocol lane during this audit (`wc -l PROTOCOL.md` 387 → 576; `sha256sum` → `9e700d691307…`); their line numbers below are soft, the quoted clause text is the durable pointer.

## Verdict

**`not conformant`.** Failed rules: **7** (index row is a claim), **6** (a quote names its location), **4** (counts carry their command / are accurate), **1** (knowledge cites a source that exists), **2** (lessons cite round + evidence) — with rule 9 (never rewrite another owner's corpus file) breached *in flight* and still reparable.

## Re-executed citations

| Claim (file:line) | Command | Observed | Pass |
|---|---|---|---|
| `distill.rs` 1553 L; `l3_swarm.rs` 591 L, `L3_CONCURRENCY_CEILING = 64` | `wc -l`; `grep -n L3_CONCURRENCY_CEILING l3_swarm.rs` | 1553; 591; `:24 = 64` | ✓ |
| `local_ship.rs` 2489 L / `bounded_fs.rs` 155 L / `fs_durability.rs` 277 L | `wc -l` ×3 | 2489 / 155 / 277 | ✓ |
| transcript / ledger / seat-coverage 939/350/317 L at contract ordinals 55/56/60 | `wc -l` ×3; registry base line 69 = entry 0 | 939/350/317; `native_contract.rs:124/125/129` = idx 55/56/60, `distill.rs :132` = idx 63 | ✓ |
| `NATIVE_CONTRACT_FILES` = 66 entries | `native_contract.rs:69` | `[&str; 66]` | ✓ |
| `#[test]` counts 340/168/85/57 | `grep -c '#\[test\]'` on the four test files | 340/168/85/57 | ✓ |
| `queueSummary` `:10896` | `grep -n 'function queueSummary' fleet-dispatcher.mjs` | 10896 | ✓ |
| `MAX_TRANSCRIPT_LINE_BYTES` 128 KiB | `grep -n` const + use | const `native_schema.rs:113 = 128*1024`; use `:410/:415` | ✓ |
| `permits_advance` `execution_profile.rs:448` | `grep -n 'fn permits_advance'` | 448 | ✓ |
| `CAPACITY_FAILURES` `base.mjs:109` | `sed -n '105,112p'` | `:109 Set([usage_limit, rate_limit, model_unavailable])` | ✓ |
| `scripts/*.mjs` 72, `scripts` 82, runtime src 93, cli src 5 | `ls \| wc -l` ×4 | 72 / 82 / 93 / 5 | ✓ |
| C2 proxy "20/30 at round-8 open" | `git show HEAD:corpus/README.md \| grep -c` = 20; `git ls-tree -r --name-only HEAD corpus/knowledge corpus/lessons \| wc -l` = 30 | 20/30 | ✓ |
| **installed `ufo` skill says the swarm cap is 128 lanes** (`corpus/lessons/round-1.md:29-32`) | `grep -rn '128' ~/.config/opencode/skills/ufo/` | **0 matches, exit 1** — and the skill carries no swarm-lane cap text at all | **FAIL** |
| `GateDecision` (`gate.rs:11`) — `SKILL.md:354`, `loop-driver.md:118`, `native-judge-pipeline.md:112` | `grep -n 'enum GateDecision' gate.rs` | **`:15`** | **FAIL** |
| `charter-scribe/` (5 files) | `find scripts/charter-scribe -type f` | **6** (`sync.mjs`, `sync.test.mjs`, `config.json`, `systemd/*.timer`, `systemd/*.service`, `prompts/*.txt`) | **FAIL** |
| `scripts/*/` members 41; script layer 113 = 72 + 41 | `find scripts -mindepth 2 -type f \| wc -l` | **42** (charter-scribe 6 + lean-cargo 4 + sighting-lib 26 + handoff-lib 6) | **FAIL** |

## Defects

1. **MAJOR — the `128` false attribution is four aggregator refreshes old.** Standing claim: `corpus/lessons/round-1.md:29-32` — "the installed `ufo` skill text says the swarm cap is 128 lanes". Falsifying command: `grep -rn '128' ~/.config/opencode/skills/ufo/` → **0 matches** (`~/.agents/skills`, `~/.claude/skills` likewise 0); the installed skill's only numeric concurrency text is host-governed/no-package-cap. `128` exists only in `scripts/ufo-swarm-wave.mjs:13,:203` as the **kimi-parity** constant `MAX_AGENT_SWARM_SUBAGENTS=128` against the operator contract `config/ufo.json` `maxLanes 100`. Falsified at r1, re-filed r4 (part-fixed: `dispatch-shapes.md` cleaned), r5 (third refresh), stopped being counted at r9/r10 protocol; still open now. Required correction form: an **appended** entry in `corpus/lessons/round-9.md` (or the next lane round) naming `round-1.md:29-32`, the verified replacement (cite `config/ufo.json:94` + `ufo-swarm-wave.mjs:13` and label the 128 as kimi parity), plus a one-line sweep of the other mentions (`LOG.md:13`, `round-1.md:29`). Owning lane: kumitate. Never rewrite `round-1.md` in place.
2. **MAJOR — the corpus contradicts itself on the classifier symbol.** `corpus/knowledge/failure-telemetry.md:18` cites the Rust function `classify_failure`; the real symbol is `classify_failure_fields` (`native_text.rs:161`), and `SKILL.md:408` already says `classify_failure_fields`. Same repo, two answers. Command: `grep -n 'classify_failure' corpus/knowledge/failure-telemetry.md SKILL.md`. Correction form: appended lesson entry (the P-b "sweep every mention" rule); owning lane: kumitate.
3. **MAJOR — three falsified line pointers for `GateDecision`.** `gate.rs:11` in `SKILL.md:354`, `corpus/knowledge/loop-driver.md:118`, `corpus/knowledge/native-judge-pipeline.md:112`; observed `:15`. Command: `grep -n 'enum GateDecision' crates/ufo-core-runtime/src/gate.rs` → `15:pub enum GateDecision`. Status at freeze: **open at HEAD**; the live round-8 lane has the fix in its working tree, **uncommitted**.
4. **MAJOR — the index is not a claim about the tree it ships with.** At HEAD `corpus/README.md` carries 16 `knowledge/` rows and 4 `lessons/` rows against 21 knowledge files and 9 tracked lesson files → five round-7 notes and five lessons are invisible to a reader who trusts the map. Commands: `git show HEAD:corpus/README.md | grep -c '^| \`knowledge/'` → 16; `git ls-tree -r --name-only HEAD corpus/knowledge | wc -l` → 21. (Direction 2 clean: no dangling rows.) Partly repaired in the uncommitted round-8 tree (31/31). Owning lane: kumitate.
5. **MAJOR — committed corpus notes cite session-scoped pointers.** Six committed notes (`enqueue-admission.md:6`, `reconcile-and-cycle.md:4`, `sighting-wall.md:5`, `runtime-support.md:4`, `native-admission-detail.md:4`, `cost-and-profile.md:4`) plus `lessons/round-6.md:11,61` cite `local://kumitate-r6-*.md`. The twelve maps exist only under `/home/vgpnk/.omp/agent/sessions/-projects-shokunin-kumitate-shokunin/2026-09-28T19-47-36-005Z_…/local/`; `read local://kumitate-r6-dispatch-ingress.md` → "Local file not found" (same for `…-dispatch-tail`, `…-plan`). PROTOCOL's closure rule (named in round 9) makes these non-evidence; already routed, still open. Correction form: append a lesson entry restating the provenance as the *content* it produced (the committed note itself) rather than the unreadable map path. Owning lane: kumitate.
6. **MAJOR — commit identity is off-invariant for 11 of 11 commits.** `git log --format='%an <%ae>' | sort | uniq -c` → 9 × operator-personal identity, 2 × `shokunin <shokunin@local>`; `git config --local user.name` unset. No commit carries `<lane>-shokunin` / `<lane>@shokunin.local`, so PROTOCOL's statement that kumitate "already does" is falsified, and no LOG note records the unconfigured repo. HEAD `7a4c9a0` ("round-7 corpus entries (uncommitted on fleet pause)") is one of the two `shokunin@local` commits. **Round-label check: the `round-7` label is correct** — `watchdog.log:112` launched kumitate round 7 at 17:32:46 and `:131` completed it at 17:57:53; the commit at 17:49:42 sits inside that steered window. Owning lane: kumitate (self-fix permitted by the invariant clause); operator records the ruling.
7. **MINOR — in-flight rule-9 breach (still reparable).** The uncommitted diff to `corpus/lessons/round-5-aggregator-audit.md` rewrites an **aggregator-owned** file in place, deleting the commit hash `c5abaac` from the text. Command: `git diff corpus/lessons/round-5-aggregator-audit.md`. Since it is uncommitted at freeze, committing the file as-is keeps the record honest; a lane commit of that path is forbidden.
8. **MINOR — counts without commands / one falsified count in the new `SCORECARD.md`.** "script-layer members sum to 113 = 72 + 41" vs observed 42; "`charter-scribe/` (5)" vs 6; the 68-member and 105/211 figures carry no command. Commands in the table above. Applies rule 4 to `SCORECARD.md` itself.
9. **MINOR — cross-lane calibration numbers in `SCORECARD.md` are not re-derived and one is false.** It calibrates against "kake (operability 6)" and "kagi … `DRIFT_SELFTEST: PASS (11 cases)`". Observed: `grep -n operability kake-shokunin/SCORECARD.md` → **8** (round 10); `grep -n selftest kagi-shokunin/SCORECARD.md` → **"(13 cases)"**. A scorecard that borrows a sibling's number must run that number's command against that sibling's committed artifact.
10. **MINOR — `~80% of SKILL.md content`** (`round-1.md` §1) still states a proportion with no measure (round-1 audit defect 13). Owning lane: kumitate.
11. **MINOR (report conformance, not corpus) — the `SHONEN` heading is absent from `round-5`, `round-6` and `round-7` kumitate reports** (`grep -c SHONEN` → 0/0/0; the round-7 file is a 122-byte marker). Consequence: none of them count as promotion-review evidence; `SHONEN.md` remains the untouched canonical seed (0 asserted, 0 verified).

## Fleet-2 axis-framework state

- **`SCORECARD.md` does not exist at HEAD** (`git ls-files SCORECARD.md` → 0; no file on disk at 18:16). **At freeze it exists as an untracked 8595-byte file** written by the live round-8 lane at 18:29:11.
- It carries all three AXES.md contract fields — **axes / planned / retired** — declares exactly the MISSION-assigned pair **operability + coverage**, and records a round-8 before→after (operability 0→2 via `A=0→1`, `C=0`; coverage 5→7 via `C1 14/18`, `C2 20/30→31/31`).
- Proxies re-derived independently: `A` → 0 at HEAD / 1 on disk; `C` → `grep -c '^\s*- \[' SKILL.md` = 0 and `grep -c '^```' SKILL.md` = 0; `C2` → 31 rows / 31 files; arithmetic `(1+0)/(1+0+3) → 2` and `floor(10 × 0.778 × 1.0) = 7` both correct.
- **Gap:** every pointer it relies on is uncommitted (`scripts/cite-check.mjs`, `SCORECARD.md` itself, and a "recorded in `LOG.md` r8" that has no r8 entry at freeze). Nothing in the round-8 axis-move is durable until the lane commits and files its report.
- **First conforming version must:** (1) be committed in `kumitate-shokunin/` and listed by `git ls-files`; (2) carry exactly the two owned axes as rows of **axis → score 0–10 → evidence pointer → last-change round**, with each pointer resolving from a fresh session (committed repo path or pinned origin path — never a `local://` map, never an untracked file, never a not-yet-written LOG section); (3) print each score's counting command with its observed output and the commit it was measured against; (4) name in `planned` the single next axis-move as one axis + one falsifiable improvement; (5) give `retired` as an explicit "None" with the non-saturation reason (the current draft does this correctly); (6) state no cross-lane number it has not re-derived from that lane's committed artifact.

## Routed-defect rows for the ledger

```
kumitate | `128` swarm-cap falsely attributed to the installed ufo skill (lessons/round-1.md:29-32) | r1, re-filed r4/r5 | open — 4th refresh, no correction entry | grep -rn '128' ~/.config/opencode/skills/ufo/  # 0 matches, exit 1
kumitate | failure-telemetry.md:18 cites Rust `classify_failure`; real symbol `classify_failure_fields` (native_text.rs:161) | r4 | open | grep -n 'classify_failure' corpus/knowledge/failure-telemetry.md SKILL.md
kumitate | `GateDecision` cited `gate.rs:11` in SKILL.md:354 + 2 knowledge notes; actual :15 | r6 | open at HEAD; uncommitted r8 fix | grep -n 'enum GateDecision' crates/ufo-core-runtime/src/gate.rs
kumitate | corpus/README.md missing 5 knowledge + 5 lesson index rows at HEAD | r4, r9 | open at HEAD; uncommitted r8 repair | git show HEAD:corpus/README.md | grep -c '^| `knowledge/'
kumitate | 6 committed corpus notes cite `local://kumitate-r6-*` maps unreadable in a fresh session | r9 | open | read local://kumitate-r6-dispatch-ingress.md  # Local file not found
kumitate | `registry-check.mjs` permanently-red checker routed from kasegi r7 — zero mirrors | r7, r8, r9 | open | grep -rn 'registry-check' kumitate-shokunin  # 0 hits
kumitate | commit identity off-invariant on 11/11 commits; repo git config unset | r6 | open | git log --format='%an <%ae>' | sort | uniq -c
kumitate | in-flight in-place rewrite of aggregator-owned corpus/lessons/round-5-aggregator-audit.md | r6 | open, uncommitted — must not be committed by the lane | git diff corpus/lessons/round-5-aggregator-audit.md
kumitate | r5/r6/r7 reports lack the SHONEN heading (r7 = 122-byte marker) | r5, r9 | open | grep -c SHONEN .ufo/reports/round-{5,6,7}/kumitate.md  # 0
kumitate | SCORECARD.md uncommitted; cross-lane figures falsified (kake 6 vs 8; kagi 11 vs 13 cases); registry counts commandless | r6 | open | git ls-files SCORECARD.md  # 0
```

## Falsification

Any re-run above that does not reproduce flips this verdict. The round-8 lane is live: if it commits (SCORECARD + cite-check + README/LOG/lesson backfill + the line-cite repair) before the aggregator transcribes this entry, defects 3, 4 and 8's index half become `partly` (uncommitted at audit, landed after), while defects 1, 2, 5, 6 and the rule-9 breach are untouched by that commit and stay open.

## Post-audit re-measurement (aggregator, 2026-09-28T21:55Z)

The kumitate round-8 lane committed twice after the freeze — `2075363` "round-8"
and `a6f9456` "round-8 fixups", both authored `kumitate <kumitate@shokunin.local>`,
so the lane-identity invariant (defect 6) is satisfied for new commits and stays
open only for the 11 historical ones. Row-by-row re-stamp:

- **Defect 3 (`GateDecision` line refs) — LANDED.** `git grep -n 'gate.rs:1[0-9]' HEAD
  -- SKILL.md corpus/` → `SKILL.md:355`, `corpus/knowledge/loop-driver.md:118`,
  `corpus/knowledge/native-judge-pipeline.md:112` all read `gate.rs:15`; the only
  surviving `gate.rs:11` strings are inside this lesson's quotation of the defect.
- **Defect 4 (index rows) — LANDED.** `git show HEAD:corpus/README.md | grep -coE
  '^\| `(knowledge|lessons)/'` → 31; `git ls-tree -r --name-only HEAD
  corpus/knowledge corpus/lessons | wc -l` → 32. The one unindexed file is this
  lesson (aggregator-owned, added after the lane's commit).
- **Defect 1 (`128` false attribution) — STILL OPEN, fourth refresh.** `git grep -n
  '128' HEAD -- corpus/lessons/round-1.md` → `:30`, `:32` unchanged; no correction
  entry names it anywhere in `corpus/lessons/`.
- **Defect 2 (`classify_failure`) — STILL OPEN.** `git grep -n 'classify_failure'
  HEAD -- corpus/knowledge/failure-telemetry.md` → `:18` still names
  `classify_failure` while `SKILL.md:408` says `classify_failure_fields`.
- **Defect 7 (rule-9 breach) — LANDED AS A VIOLATION, not repaired.** The in-place
  edits to two aggregator-owned files were committed by the lane in `2075363`
  (`git show --stat 2075363 -- corpus/lessons/round-4-aggregator-audit.md
  corpus/lessons/round-5-aggregator-audit.md` → 1 line changed in each:
  `execution_profile.rs:447` → `:448`, and the bare `c5abaac` cite re-based to a
  repo-qualified form). The same sweep carried *this* lesson into `a6f9456`
  (`git show --stat a6f9456` → `corpus/lessons/round-6-aggregator-audit.md | 72 ++++`)
  before its owner committed it. **Owner adjudication:** both edits are factually
  correct and are ratified by the file's owner (`grep -n 'fn permits_advance'
  ~/Projects/origin-work/ufo-fsd-alpha/crates/ufo-core-runtime/src/execution_profile.rs`
  → `:448`); the *form* violates "no lane edits another lane's or the aggregator's
  corpus files" and "a lane never commits an aggregator-owned file". Required lane
  form: report the finding in its own lesson/report and let the owner correct its
  own file. **Aggregator self-defect (root cause):** these files were left
  uncommitted in live lanes' working trees instead of being committed at creation
  time, which is what made the sweep possible.
- **NEW defect 12 — the lane's citation gate goes red on aggregator-owned lessons.**
  `node scripts/cite-check.mjs` at HEAD → `VERDICT: FAIL`, `CITE_CHECK: DRIFT
  (files=34 tokens=2148 errors=2 warnings=50)`, and **both** ERROR rows name this
  lesson as the containing file: `corpus/lessons/round-6-aggregator-audit.md:23
  ERROR LINE_OOR native_contract.rs:10896` (the parser joined two cells of one
  markdown table row — `native_contract.rs` ordinals and a `fleet-dispatcher.mjs`
  line number) and `:36 ERROR UNRESOLVED corpus/lessons/round-9.md` (a quoted
  defect path resolved against the origin `src` root). The origin tree did not move
  (`git -C ~/Projects/origin-work/ufo-fsd-alpha rev-parse --short HEAD` → `ee907f1cf`,
  the pin this audit used), so the red state is not source drift: the gate has no
  lane-authored-only scope. Consequence: any aggregator audit that quotes a defect
  flips the lane's own operability metric. Owning lane: kumitate — scope the glob to
  lane-authored files or exclude `corpus/lessons/round-*-aggregator-*.md`; routed to
  the ledger.