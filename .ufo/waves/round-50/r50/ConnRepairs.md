# ConnRepairs — r49-closure routed defects mapped onto r43–r48 repair patterns

seat: KumitateR50.ConnRepairs (connector) · lane `kumitate-shokunin` · date 2026-10-23
method: read-only mapping over committed bytes (HEAD `6927903`, plus `ff40d7d`, `5b0de26`, `378b6e7`,
`64b9286`, `4e4f4713`, `269dadb6` as cited). No lane/sibling/fleet mutations; no installs (git, python3,
grep only — all pre-existing). What I attacked: the ancestry question — are R50-1..R50-10 new work or
repeats of r43–r48 repair classes, and which classes still have no standing rule.

## 1. The routed defects and where each one comes from

Source of the six: `corpus/lessons/round-49-verifier-spotcheck.md` §5 (items 1–6, lines 126–149).
Mapping to the r50 plan (`.ufo/waves/round-50/plan.md` context block) and to the earliest prior instance:

| r49 §5 item | r50 item | earliest prior instance | class name |
|---|---|---|---|
| 1. report filed before its last commits; C2 "15/15" stale vs tip 16/16 | R50-1 (fleet `## Erratum`) | r48 spotcheck §5.1 "uncommitted leftovers at close (5 paths)"; r45 lesson M2 (L1 died, 45 untracked + 5 modified); r47 R47-3 (future-dated headings) | close-time ordering / stale record |
| 2. no `## Gate` in `corpus/lessons/round-49.md` | R50-2 (append ledger) | fleet `CORPUS.md:19` (contract) + QUALITY Q21 (r41-routed, in force r44); r43/r44-style lessons carry one | missing gate ledger |
| 3. S095/S098 "re-opened" with no committed receipt | R50-3 (`ReopenS095/098.md`) | r45 `a2-control/Reopen*.md` per row; r47 `falsify/ReopenS088.md`; r48 `ReopenS084/091/092/098.md` + `ReviewReopens48.md` | re-open without receipt |
| 4. three "time-spaced" C1 receipts = one sha256 (`03a258d6…`) | R50-4 (≥3 distinct runs, `run-at=`, ≥300 s) | r47 R47-1 (re-run readings only in IRC quotes); r48 fix `ScribeReceipts-a2-rerun-{1,2,3}.txt` + Q36 | claimed repeats not evidenced |
| 5. `SKILL.md:595`/:598 "all eleven" vs `:589` "Twelve" | R50-5 (sweep both) | r46 R46-2 (SCORECARD appended correction, "13 not 15"); r47 R47-2 (report/SCORECARD misstatements); r48 routed 3 (LOG "two mistakes" vs four) | stale prose count after a registry change |
| 6. "validator exit 0" + "slot granted seats=64" with no committed artifact; `r49-taskcall.json` a bare 64-array | R50-8 (context+tasks together) | r41 R41-5 → Q23 (`## Round shape` vs dispatch files); r45 (attempt-1 receipts rejected as untrusted) | orchestration claim without artifact |

The plan's other four items are not from the §5 list: R50-6 (`ScoutCapRunVisibility` finding), R50-7
(r49 M2 pin deferral), R50-9 (live `proxy-check --strict` DRIFT at round open), R50-10 (H1 freeze item 697).

## 2. The three named r43–r48 patterns — verified as repeats

**(a) R41-2 gate-pins → R50-7.** R41-2 (`round-41-verifier-spotcheck.md` §7) reads: "proxy
`PIN_UNPINNED scripts/wave-census.mjs` … pin the new instrument in the proxy stanza once the frozen
key set allows it, or record why not." R50-7 is the same sentence for `pin.bind-oracle` ("deferred
from r49 (M2): add the pin + `GATE_PINS` entry and re-pin the family"). The pattern already repeated
once inside the window: r48 added `pin.cap-spawn` and its own spotcheck §5.2 asked "same question for
the round-48 `cap-spawn` helper change's pin". The deferral variant is what bit: r49 M2 recorded the
bind-oracle deferral in the lesson, but nothing forced the re-pin, so r50 opened with
`PIN_UNPINNED bind-oracle` (plan R50-9; H1-freeze receipt `controls/H1-freeze-5b0de268.txt`).

**(b) R47 re-open receipts → R50-3.** The committed re-open artifact (`ReopenS0NN.md`, verdict first
line + fetched-bytes sha256, independently reviewed) is a r45/r47/r48 convention: r45 committed
per-row `a2-control/Reopen*.md`; r47 committed `falsify/ReopenS088.md` (and its spotcheck R47-2
reconciled "cancelled vs committed" for exactly this file); r48 committed four re-opens verified by
`ReviewReopens48.md`. r49 claimed "Re-opened, no cell changed: S095, S098 … re-open receipts in the
round report" with no such artifact committed → §5 item 3. r50 restores the convention:
`.ufo/waves/round-50/r50/ReopenS095.md` / `ReopenS098.md` (untracked, seat-produced, first lines
`REOPEN50: HOLD …`), attacked by `RevReopen`. Note: the "no-pointer-no-claim rule" the spotcheck
invokes (line 140) exists **only inside that spotcheck file** — a fleet-grep over CORPUS.md, LEARNING.md
and `corpus/` finds no other occurrence. It has no standing home.

**(c) r48 leftover commits → R50-1.** r48's closure routed "uncommitted leftovers at close (5 paths)"
and r49 repaired it (record commit `64b9286` message: "r48 late leftovers"). r49's item 1 is the same
class one step later in the pipeline: the commits landed, but *after* the report that cites their
parent. The r50 fix (append-only `## Erratum` on the fleet report naming the superseded 15/15 → 16/16)
repeats the older erratum pattern, not just r48's: r45→r46 landed errata E1–E6 appended to the r45
plan; r47 R47-2's fix was literally "Append errata; do not rewrite."

A fourth repeat the seat brief did not name but the record shows: **the r46→r47→r48 refusal-list
pattern → R50-6.** The r50 guard is a one-term extension of the arm r47 built. Pre-patch
(`git show 378b6e7^:scripts/cap-run.mjs` line 129):

```
const bad = (p) => p === '/' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
```

committed at `378b6e7` (in the freeze-corrections commit, before wave data) as:

```
const bad = (p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
```

with an inline comment citing its own ancestry: "Round 47 (ReviewCapRunV2 F1): bind the resolved
directory, never `/` or a sandbox-managed mount point (`/tmp`, `/proc`, `/sys`, `/dev`, `/run`)" —
plus the r47 sourcing (S095 "applied in the order they are given as arguments") and a selftest usage
arm. (Working tree additionally carries an uncommitted `M scripts/cap-run.mjs` hardening — a
`cwd /tmp` refusal + selftest arm — L1 mid-integration; not leaned on here.)

## 3. Committed state at HEAD `6927903` (what is already repaired vs still open)

| r50 item | state at HEAD |
|---|---|
| R50-1 erratum | open (ScribeErratum draft exists, fleet-side append) |
| R50-2 `## Gate` for r49 | open (ScribeGateLedger49 / ExecGateLedger drafts; `corpus/lessons/round-49.md` still has only `## Mistakes`, `## Frontier — SOURCES`) |
| R50-3 re-open receipts | artifacts written (untracked); frozen counter R2/R3 still to score them |
| R50-4 spaced B49 runs | `ReRunB49-1.txt`, `ReRunB49-2.txt` untracked (2 of ≥3; ≥300 s span pending — ExecSpacingHarness) |
| R50-5 `all eleven` sweep | committed at `378b6e7` (`SKILL.md` 8 lines) |
| R50-6 guard | committed at `378b6e7` (cap-run.mjs +24/−0); selftest arm in the same hunk |
| R50-7 pin.bind-oracle | open until close (GATE_PINS + family re-pin ride the C1 commit) |
| R50-8 taskCall shape | **already satisfied at freeze**: `378b6e7` rewrote `r50-taskcall.json` to `{context, tasks}` — verified `python3 -c json.load`: keys `['context','tasks']`; r49's file is confirmed a bare array (`bare array len 64` at `64b9286`) |
| R50-9 drift repair | README half committed at `378b6e7` (corpus/README.md +2); canonical Q32 command at HEAD prints nothing; stanza re-derivation + pins pending close |
| R50-10 entry header trio | open (ScribeSourcesCells drafts the exact old→new lines) |

Q32 evidence for R50-9's recurrence claim (r45 M1 class: a closure note lands without a README row):

```
$ LC_ALL=C comm -23 <(git ls-tree -r --name-only ff40d7d corpus/knowledge corpus/lessons | grep '\.md$' | sed 's#^corpus/##' | sort) \
    <(git show ff40d7d:corpus/README.md | grep -oE '^\| `(knowledge|lessons)/[^`]+`' | sed 's/^| `//; s/`$//' | sort -u)
lessons/round-48-verifier-spotcheck.md
lessons/round-49-verifier-spotcheck.md
```

— the exact class Q32 was built for in r45 recurred at the r50 freeze (both notes unrowed; the plan
names "two verifier-spotcheck notes"). Q32's own Limit in QUALITY.md concedes it "checks that a row
exists, not that the declared total matches" — which is why the stanza half (`C2=108/108` vs computed
110/112, `AXES_DRIFT coverage row=10 derived=9`) still had to be dispositioned by hand.

## 4. Recurring classes and their standing-rule status (the QUALITY.md candidates)

Rules already landed this window (do not re-propose): **Q36/Q37** (r48, from R47-1),
**Q38** (r49), **Q39/Q40/Q41** (pre-landed at `378b6e7`, from r49 items 4/6-binding/5 — Q39
distinct-captured-runs, Q40 tmpfs-root refusal, Q41 gate-count sweep).

| # | recurring class | recurrence trail | standing rule today | candidate |
|---|---|---|---|---|
| A | close-time ordering: record/report vs moving lane (r49 item 1) | r45 M2 → r48 §5.1 → r49 §5.1 | **none** (Q24 covers receipt-label honesty, Q27 untracked wave reports — neither covers "report cites a rev the lane then moves past") | **Q42**: a filed report names the measured lane rev; any later lane commit before filing is named in the report or in an append-only erratum on it. Checkable by the closure: `git rev-list <cited>..<tip>` at filing time. |
| B | re-open claim without committed receipt (r49 item 3) | r45 per-row receipts → r47 R47-2 (ReopenS088 reconciliation) → r48 ReviewReopens48 → r49 break | **none** — "no-pointer-no-claim" lives only in the spotcheck file; Q24 is adjacent (label=digest) but does not require the artifact to exist | **Q43**: every "re-opened" claim in a lesson/report carries a committed re-open artifact (verdict first line + body sha256) or a sweep line naming the seat that did not return. |
| C | new instrument left unpinned / deferral not enforced (R41-2 class) | r41 R41-2 → r48 §5.2 → r49 M2 (deferral recorded, landed as r50-open `PIN_UNPINNED` + `AXES_DRIFT`) | **none** — Q13 dispositions open DRIFT but nothing requires pin coverage at birth | **Q44**: a script row in the gate registry or a new frozen counter carries a proxy pin in the same commit, or a recorded deferral naming the round that adds it; `PIN_UNPINNED` at round open is a routed defect. |
| D | stale prose count after a registry change (r49 item 5) | r46 R46-2 → r47 R47-2 → r48 routed 3 → r49 §5.5 | **Q41 — but scoped to SKILL.md** (its own Limit says so) | **Q45**: widen the sweep — when a counted quantity changes, every prose mention of the old number in SKILL.md, LOG.md and SCORECARD.md is re-derived in the same commit (Q41 becomes the SKILL.md arm). |
| E | orchestration claim without artifact (r49 item 6) | r41 R41-5/Q23 (report shape vs dispatch files) → r45 untrusted-receipt rejection → r49 §5.6 | **partial** — Q23 covers dispatch files; nothing covers validator/slot-grant claims or the emitted taskCall shape | **Q46**: a report claim about the wave validator (exit, emitted shape, slot grant) carries a committed artifact (validator receipt, taskCall file with context+tasks) or is labelled `orchestrator-reported`. |
| F | **enforcement gap**: rule exists in prose, no mechanical runner executes it at close | Q21 in force since r44, yet r49 filed no `## Gate` (r49 item 2); Q1 trio rule, yet r49 admitted the doctrine entry without its `source:` header (R50-10, H1 item 697); Q32 command existed, yet both spotcheck notes sat unrowed at the r50 freeze | the rules exist; the runner does not | not a new criterion — a gate strengthening: `scripts/round-gate.mjs` never opens `corpus/lessons` (grep: 0 hits for `lessons/`), so Q10's "round record passes round-gate" cannot see the lesson. Add a lesson lint to round-gate: `## Gate` present with ≥1 decision bullet or a `no reject this round` line (Q21/CORPUS.md:19), header trio on every non-base knowledge path (Q1), Q32 row check, Q41 sweep — the four commands already written in QUALITY.md, run by the gate instead of by memory. |

Contradictions to state, not smooth over (per connector duty):

1. **Q36 vs Q39 pull in opposite directions on purpose.** Q36 (r48) makes a success verdict scoreable
   only with receipts whose *success summaries are byte-identical*; the r49 receipts satisfied that by
   being copies (`03a258d6…` ×3). Q39 (r50) now demands sha256-**distinct** receipts for a time-spaced
   claim. The two are consistent only because they judge different claims (reproducibility vs
   independence) — but a round carrying both must say which claim each receipt set evidences, or the
   byte-identical rule re- legitimizes the copy class Q39 was written to kill.
2. **Item 2 is half "wrong heading," not only "missing section."** r49's lesson *did* record
   admits/rejects — under `## Frontier — SOURCES` ("Rejected this round: none", S099 admit, S095/S098
   re-opens). Q21's command greps only `^## Gate`, and CORPUS.md:19 names the heading; so the ledger
   content existed but carried no candidates table and no spot-check slot, and no standing command
   would have found it under the wrong heading. A heading alias check belongs in the F lint.
3. **The AXES_DRIFT term in R50-9 is a verbatim replay of the r41-open drift.** The round-41 open
   receipt read `AXES_DRIFT term=coverage declared=10 computed=9`; the r50 freeze reads
   `AXES_DRIFT coverage row=10 derived=9`. Q13 (r34-era) required open-DRIFT disposition; the term
   itself keeps being re-derived by hand each time the coverage axis row disagrees with the registry.

## 5. Second-order notes for the L1

- R50-2's repair is itself the r43/r44 pattern (append the ledger), now also machine-checked going
  forward: frozen R1 greps `round-49.md` for `## Gate` + candidates/admitted/rejected/spot-check
  words — the first mechanical runner this class has had. That is the F fix arriving one class at a
  time; A–E above remain prose-only.
- R50-8 is closed at freeze by `378b6e7`; MutSpecDup's validator-mutation seat is the standing guard
  for the shape. If Q46 is adopted, its natural home is beside Q23 in QUALITY.md.
- No seats were re-run, no files outside my report were touched. Coordination: none required
  (ConnLedgerDelta is independently diffing the r48/r49 Gate sections; my committed-state findings
  in §3 are citable if its draft needs anchors).

## Evidence index (commands run, read-only)

- `git log --oneline -8` → HEAD `6927903`; r50 freeze chain `5b0de26` → `378b6e7` → `6927903`.
- `git show 378b6e7 --stat` → touched: cap-run.mjs (+24), QUALITY.md (+46: Q39–Q41), corpus/README.md (+2),
  SCORECARD.md, SKILL.md (+8: R50-5 sweep), r50-taskcall.json (rewritten `{context,tasks}`), probes, controls.
- `git show 378b6e7^:scripts/cap-run.mjs | grep -n "const bad"` → line 129 without `/tmp`;
  `git show 378b6e7 -- scripts/cap-run.mjs` → the added `p === '/tmp'` term, the "Round 47
  (ReviewCapRunV2 F1)" comment, the usage-arm selftest line.
- `git status --porcelain` → only `.ufo/waves/round-50/**` untracked + ` M scripts/cap-run.mjs`
  (uncommitted cwd-/tmp hardening; noted, not relied on).
- `python3 -c json.load` → `.ufo/waves/round-50/r50-taskcall.json` = `['context','tasks']`;
  `.ufo/waves/round-49/r49-taskcall.json` at `64b9286` = `bare array len 64`.
- Canonical Q32 command (LC_ALL=C, per QUALITY.md) at `ff40d7d` / `5b0de26` → prints
  `lessons/round-48-verifier-spotcheck.md` + `lessons/round-49-verifier-spotcheck.md`; at HEAD → empty.
- `grep -n 'lessons/' scripts/round-gate.mjs` → 0 hits (round-gate does not read the lesson corpus).
- `grep -rn 'no-pointer'` over fleet CORPUS.md, LEARNING.md and the lane corpus → single hit,
  `corpus/lessons/round-49-verifier-spotcheck.md:140`.
- Fleet `CORPUS.md:19` → "each `lessons/round-<N>.md` carries a `## Gate` section (candidates,
  admitted, rejected with reasons, spot-check result)."
- Spotcheck lineage files read in full: `round-4{1,3,4,5,6,7,8,9}-verifier-spotcheck.md` (41: §7 R41-1..7;
  47: §7 R47-1..5; 48: §5 R48-1..5; 49: §5 items 1–6), lessons `round-4{3,4,5,6,7,8,9}.md`,
  `corpus/QUALITY.md` (Q1–Q41 in force), `.ufo/waves/round-50/plan.md`.
- Tooling installs: none.
