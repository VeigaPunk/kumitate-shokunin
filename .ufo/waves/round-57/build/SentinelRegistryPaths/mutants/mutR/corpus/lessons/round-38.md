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

## Falsify findings integrated (oracle unchanged)

Wave 2 attacks candidate `c938c068f4dbf356c0884c2121bbfe087fbe3caf`; original reports
remain at that revision. Accepted source corrections do not change parsing, pairing,
normalisation or the registered 811 positions:

- Check21: the frozen-preflight cache is stat-based; a hit skips revalidation, so remove the
  network-never-needed guarantee and cite its body (128–175). Reaping needs age/lock/removal
  as well as the cutoff (208–219).
- Check52: assertNoSecrets throws an uncoded Error, not credential_shaped_output by default.
- Check71: extend the head/tail preservation range from 197–205 to 197–206; line206 is the
  actual tail-file readback. The scoped supplement confirms this range.
- Check34: a blank selected route uses the phase fallback, not the next candidate.
- Check02: replace the stale historical main-line intro with live pin line3234 /4321lines.
- Check49: mark invalid_validity_window as inner-only/unreachable through the validated
  persisted caller; cite persisted expiry at1047, not its unreachable inner duplicate1013.
- Check68/build Prose03: FORMAT_CHARS_RE strips Cf only, not Mn/Zs. The same prose correction
  applies to probe-redact; help exit0 is qualified as sole argv.
- Check16 refutes the literal #92 sentence, which is already explicitly debt:false. It was
  never included in the 777 true expectations; the debt remains, not a passed prose claim.

These reveal a separate mistake: a lexical token can be on the right line while a guarantee,
reachability claim or assertion range is wrong. Q18 records the semantic-read requirement;
none of these findings is fixed by changing the oracle to reward the existing prose.

### Population crosswalk and an explicit extraction limitation

ConnPopulation reproduces registered811 (four notes) versus legacy710 in those notes /1574
in20notes. ExecTruthIndep counted817 at round open, because eight route-note spans after an
escaped inline-template delimiter are absent from the registered regex, while it omitted
two basename-only spans the registered regex includes (8−2=6). This is not six interchangeable
ids. The pre-wave gate-design proposal said escaped delimiters were honoured; that statement
is superseded: the frozen implementation is not escape-aware. The fixed811 contract is the
recognized-span population, not a complete Markdown parser. No population change is made
after seeing results. Escaped-template and multiline extraction need fixture-first review
before a future version, with an explicit old→new population crosswalk.

## Settled falsify receipt

88 seats (55 reviewer, 27 scout, 3 mutation-tester, 1 critic, 1 sentinel, 1 connector),
one validated unchanged call on first grant. 45 completed reports, 43 failed seats (9 Codex
capacity, 34 Zai429); none replaced. Named failures and exact errors are in
`.ufo/waves/round-38/evidence/falsify-seat-accounting.txt`. Check27 completed but again wrote
to the fleet root; recovered byte-exact (cmp equal, sha256294e0cee…), stray removed. The
falsify reservation was released after every seat settled. Total178 seats across two waves.

The40 completed anchor/prose groups cover171 assigned ids:158 agreed,13 refuted,0 unverified
by their report headers. This is not full fresh semantic coverage of all342 review ids:39
anchor/prose seats failed. Of the13 refutations, one (#92) is already-marked debt, not a true
claim; the12 actionable findings were corrected. Five raw anchor spans changed, one review
token became stronger (targets.every rather than serves), and semantic wording was corrected;
no extractor/pairing/normalisation change and no previously-true expectation was downgraded.
The before-correction reports remain tied to c938; supplements confirm the exact source fixes.

All three targeted mutants were killed and restored byte-exact: pairing22/22→17/22→22/22;
DEBT_GREW22/22→21/22 (AT07)→22/22; override-block check22/22→21/22 (AT09)→22/22. The gate is
failure-capable, but its lexical checks remain necessary rather than sufficient for semantics.
The L1 separately re-opened all811 source spans with independent Python matching; that witness
is not passed off as the43 failed fresh reviewers. Independent old-token measurement and
full baseline true-position comparison show zero true→nontrue.
