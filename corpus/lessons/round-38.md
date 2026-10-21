# Round 38 — per-anchor repair and a failure-capable truth floor

Source: S033 (GitHub's commit-specific file links), the round-36 and round-37 non-author
spot-checks, and the pinned upstream revision 31c465f15669f744848bd9f5d56191c5085670f7.
Round open: lane 753446a829edda519c75777ce95888443f51fa94.

## Claims

1. coverage:script-layer — repair anchors individually, never by a text reset. The frozen
   population is the four notes (811 anchors), using the pairing fixed before final
   measurements. No anchor true at round open may become non-true.
2. operability (the lowest non-retired axis) — replace the checklist's adjacency ratchet with
   a per-anchor expectation gate that detects shifts, rejects true-to-debt re-pins, and
   checks debt growth against a literal frozen Git commit. This is lexical evidence, not a
   semantic prose oracle. S033 grounds why the expected population names a commit, not HEAD.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| Full text reset re-broke 62 anchors that were true at round open | round-37 verifier §Anchor truth; `5bc40d0` | outside closure, after landing | Review every non-true anchor individually; preserve all open-true anchors. Freeze the parser before final measurement, then compare the whole 811-anchor population, not a selected subset |
| Regenerated ceiling equalled the current debt, so CLEAN at landing was tautological | round-37 verifier §Claims; old ratchet 0 → 186 → 200 | outside closure; no prior criterion | New `anchor-truth` pin records per-anchor expectations; checklist `--base e18ff1af3392e3823227644c977c237737fe65c9` names the committed open-state floor. Selftest AT07 rejects debt growth; AT08 rejects checked-count shrink; Q17 records the rule |
| Pairing heuristic silently exempted anchor runs | `claims-check.mjs` adjacency walk; round-37 verifier R3 | outside closure | Positional runs, shared-symbol broadcast, and no lookahead stealing a later citation's symbol (AT02–05, AT18–19). A reviewed token is explicit in the pin and must occur in its own paragraph/table row and on the cited lines |
| LOG append-only was violated | `5031720`, `fb5b90e` rewrote the filed r37 entry | outside closure | Named correction appended in round 38; original entry not rewritten. It records the symbol-keyed/186/1551 claims as superseded |
| Final captures preceded the last code change | captures at `8c41439`, code changed `6f88d12` | outside closure | Record the exact measured production revision; later commits contain evidence only. An unrun check is not passed |
| Missing report misdiagnosed as a dead seat | r37 verifier, `ScoutDeadSeat.md` transcript investigation | wave-1 scout, this round | AuditRemainder6 completed but used a bare trailer path and wrote into the fleet root. Copy recovered byte-exact into the lane (cmp equal, sha256 c39ed761…), remove fleet copy, record recovery. Release stale r37 reservation (observed `released lane=kumitate wave=r37-falsify`) |
| Corrections sweep missed false wording | README r36 row, SCORECARD r37 correction's last sentence | outside closure R4 | README row corrected; named r38 SCORECARD correction supersedes anchor-truth wording; r37 lesson gets an appended correction |
| A dirty source worktree could make a gate falsely green | `build/SentGate.md` UNVERIFIED_SOURCE_TREE | wave-1 sentinel | New gate reads committed blobs from the pinned Git revision, not mutable files; AT21 dirties a fixture's worktree and confirms the committed result is unchanged |

## Gate — admits and rejects

- **Admit:** explicit per-anchor MOVE/TOKEN/MOVE_TOKEN decisions after opening both the note's
  sentence and the corresponding pin lines. All 342 originally non-true/unpaired anchors have
  one wave-1 decision, retained under `.ufo/waves/round-38/build/`. The L1 corrected path-only
  verdicts into explicit file qualifiers instead of inheriting a prior cross-file citation.
- **Reject:** moving a definition citation onto a comment mention just to match a token (e.g.
  `die` to a launcher comment or `extendLedgerMemoWithSuffix` to its doc mention). Review seats
  chose the definition/emission/use the sentence actually describes.
- **Reject/mark:** 21 lexical false/dead expectations and 13 unchecked locators remain, each
  listed in the note itself under its debt heading. A stale prose sentence is not repaired by
  finding a nearby token. Examples: removed ROUTE_TOKEN, RouteHealthError and typed code tables;
  the false claim that an explicit empty library path is refused. They stay visible debt, not
  claimed truth.
- **Admit with limit:** the original closure's 62-item list contains four pairing discrepancies.
  With the old governing tokens held fixed, 58 now read true; MAX_BYTES at the fixtureDir anchor,
  validateTaskReceipt at a dynamic import, spawnSync at a throw/retry test, and agentId at an
  underscored test name were not the sentence's governing token. The first three have reviewed
  tokens; the last remains explicit debt (the test declaration itself is correct). None is
  silently relabelled a repaired definition of the wrong symbol.
- **Reject:** treating a raised ratchet ceiling as an improvement. The before probe
  `build/ExecRatchetBefore.md` observed CLEAN for the MANIFEST_SCHEMA→MAX_MANIFEST_BYTES shift,
  including after raising its ceiling. The new gate's AT03/AT05 re-pins refuse those shifts.
- **Held:** broader semantic prose corrections and the other 16 notes covered by the legacy
  FIDELITY diagnostic. This round does not claim them pin-true. Token-on-line checks do not
  prove the prose's behaviour, range completeness, or definition-vs-mention intent.

### S033 — opened this round

URL: https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files
Accessed 2026-10-21 (the scribe fetched at 07:15:36Z; the L1 re-opened the same page).
Location: “File views show the latest version on a branch”. Verbatim quote (23 words):

> so if you were to copy the normal URL, the file contents might not be the same when someone looks at it later.

The next heading, “Press Y to permalink to a file in a specific commit”, states that using a
commit id links to the exact file version. The page states this for file URLs; applying that
stability argument to line anchors is an inference, not a quote from the page. Row S033 is
A/docs for that scoped claim, mined immediately by this lesson; no existing row was edited.

## Verification method and limits

The production gate's oracle was fixed before final measurements and committed with the
round-open baseline as e18ff1af3392e3823227644c977c237737fe65c9. Repaired expectation counts:
777 true, 21 debt, 13 unchecked; baseline 467 true, 208 debt, 136 unchecked. Zero true→nontrue;
187 debt→true and 123 unchecked→true. The original independent closure parser is also retained
as `.ufo/waves/round-38/evidence/independent-measure.py.txt` (executable by Python despite the
.txt suffix; not counted as a runnable artifact by the proxy). It holds the old governing
symbols fixed while checking coordinate/path changes, and imports no lane gate.

The frozen pin is four notes only. The old 20-note FIDELITY arm remains available as a
legacy adjacency diagnostic, not the checklist's truth claim. The new gate has bounded reads,
regular committed blobs only, a validated note-path/pin schema, and literal-token regex
escaping. It cannot mechanically tell whether a weak reviewed word proves an entire claim;
fresh wave-2 review of every edited group is the semantic falsifier.

## Waves and inherited state

Build: 90 seats, one validated unchanged payload after two job-cap refusals. Roles:
41 scout, 39 reviewer, 3 critic, 3 executor, 2 scribe, 1 sentinel, 1 connector. L1 holds the
planner seat. 89 reports arrived; ConnSibling failed (Codex whitespace-only argument stream
interruption, exact error in `evidence/build-seat-accounting.txt`) and was not replaced.
90 fits the user prompt's 64–100 band but exceeded Main's narrower 64–88 dispatch context;
Main ruled to record this mismatch, not undo or duplicate the wave. The slot was released.

The r37 AuditRemainder6 report is recovered evidence, not an r38 replacement seat.
Its report's assigned early restoration was refuted; the full reset superseded that tree.
The round-38 lane opened clean; no prior r38 work was inherited.
