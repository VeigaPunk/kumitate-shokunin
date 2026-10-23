# ReviewSources — S098 SOURCES conformance review

Reviewer: kumitate-r48-ReviewSources (leaf; no subagents).
Reviewed artifacts: `.ufo/waves/round-48/build/ScribeStraceManual.md` (attempt-1 draft),
`.ufo/waves/round-48/r48/ScribeSources98.md` + `ScribeSources98-row.frag.md` +
`ScribeSources98-map-row.frag.md` (wave-2 fragment), against the fleet contract
`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md` (fleet repo) and both checker
implementations (`scripts/sources-check.mjs`, fleet `scripts/sources-census.sh`).

## Findings by severity

### High

1. **`status=used` is not a valid enum — landing it breaks the close census (H4).**
   - The fragment row `r48/ScribeSources98-row.frag.md` has status cell `used`.
   - Contract `status` enum is `queued | mined | rejected` (SOURCES-CONTRACT-v1.md
     line 36). `sources-check.mjs:107` (`STATUSES`, + `:295-297` `STATUS_ENUM`)
     and fleet `sources-census.sh` `E07` both reject `used`.
   - The `used` value originates in the wave spec prompt (`r48-spec.json`
     ScribeSources98: "status=used"); the planner's word, not a scribe invention —
     but it is still wrong and must be corrected before the L1 lands S098.
   - Fix: land `queued` (matches the plan addendum "S098 drafted … status=queued",
     `plan.md:102`, and ReopenS098.md's self-framing). After
     `corpus/lessons/round-48.md` exists AND cites S098 in its `## Gate` (rule 1),
     flip in place to `mined` (the only allowed in-place transition).
   - Do NOT land `mined` today: `USED_BY_MISSING` would fire on the absent
     `corpus/lessons/round-48.md` (checked: file does not exist), and the lesson
     fragment `ScribeLesson48-lesson.frag.md` currently carries an `<L1 fills>` gate
     placeholder for S098's quote/location/date.

### Low (non-blocking)

2. **Tardy `used-by` path — acceptable only while `queued`, must be resolved before `mined`.**
   - `used-by` = `.ufo/waves/round-48/probe/caproute48-probe.mjs, corpus/lessons/round-48.md`.
     The lesson does not exist yet (checked). The frozen probe does not textually
     cite S098 (`grep S098` in `probe/caproute48-probe.mjs` → 0 hits).
   - Precedent reconciles the probe: S093's `used-by` names the round-47 probe
     `caproute-probe.mjs` (same pattern; that probe likewise contains no S093
     string). `used-by` is consumed as "the path whose claim this source grounds",
     not as a literal citation; the row's claim is implemented in the probe
     (regex at `probe/caproute48-probe.mjs:173`, alignment comment `:171-172`).
   - Hazard: `E11`/`USED_BY_MISSING` fires now only if status were `mined`
     (checked: `sources-check.mjs:311-321` gates the path-existence test on
     `mined`; `sources-census.sh` `E11` likewise). Landing `queued` is green.
     Flip to `mined` only after the lesson file exists and cites S098.

3. **Fragment `teaches` wording is imprecise about where the padding sits.**
   - Fragment: "…with whitespace before the return value." The manual's evidence
     (line 158: `<... select resumed> )      = 1 (in [3])`) is padding between
     `)` and `=`, i.e. before the `=`/return value — the draft's wording
     ("Return alignment defaults to column 40, so the parser accepts variable
     whitespace in `\)\s+= `") is precise. Either use the draft's wording or
     tighten to "whitespace between `)` and `=`". Cosmetic; no enum/field impact.

4. **Duplicate README map-row candidates.** Both `ScribeSources98-map-row.frag.md`
   and `ScribeReadme-frag.md` propose a `lessons/round-48.md` map row with
   different wording. The L1 must land exactly one (see `corpus/README.md:141`
   for the round-47 row shape — the ScribeSources98 map-row matches its format).

## Verified conformant

- **Required cells**: 11 cells, all non-empty in both the draft row
  (build/ScribeStraceManual.md:5) and the fragment row (NF=13 verified); no `|`
  inside any cell; `source` is a canonical URL; ID `S098` is the next unused
  (registry ends at S097; `S098|S099` absent from `corpus/SOURCES.md` — verified
  by grep).
- **Enum values**: `kind=docs` ✓; `tier=A` — justified: the strace(1) manual is
  the tool's official documentation, authoritative for its own output format
  (contract line 27 "official docs"); no `community`-at-A inflation. `status`
  MUST be `queued` before landing (finding 1). `opened=2026-10-23` valid past ISO
  date ✓ (checker: `OPENED_INVALID` fires only on invalid/future). `recheck=on-release`
  is a valid symbolic cadence ✓.
- **Quotes**: every quote in the draft is verbatim at its stated lines, ≤25 words,
  with location. Independently re-fetched
  `https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in`
  (HTTP via curl, 2242 lines): sha256 `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a`
  — byte-identical to the draft's claimed body hash. Lines 832-835 are the
  `-a`/`--columns` heading with "Aligns return values in a specific column
  (default column 40)." at 835; lines 148-158 contain the interleaving /
  unfinished/resumed sentences (148, 151-154) and the resumed sample at 158 with
  padding between `)` and `=` (verified: 6 spaces). Corroborated independently by
  `r48/ReopenS098.md` (HOLDS).
- **Sibling row vs immutable-cell rewrite**: S093 is NOT rewritten. Contract rule
  2 (append-only; only status/recheck/used-by change in place) means S093's
  `anchor` cell is immutable; a new claim about the same manual at different
  anchors can only be a new row. S098 is that row. It is not a "supersedes" row:
  it corrects no S093 claim (S093 = `-f`/`--decode-pids=pidns`/`-s`/`-v`
  semantics; S098 = return-column alignment + interleaved unfinished/resumed
  records) — disjoint scopes, and S093 remains valid. Precedent for same-URL
  siblings: S041/S045 (same file at different pins; one rejected, one mined) and
  S003/S080 (same doc; S080 supersedes). The checker enforces no same-URL ban:
  `sources-check.mjs` has no URL-duplication rule; fleet `sources-census.sh`
  `E04` fires only on duplicate URL+scope with no supersedes — S098 has a
  distinct scope, so no `E04`. Sibling row **allowed**, and is the only legal
  form.
- **Learner benefit**: `teaches` states a grounded benefit; the fail-closed
  sentence is the counter's own behavior (lane evidence), not misattributed to
  the manual. Style matches precedent (see S090/S093/S095 "so …" inference
  clauses).
- **Used-by paths**: both are plausible proposed consumers; probe path exists at
  the freeze (sha256 `f24a3af5…` verified read-only at `fe3d45bf` — also matches
  the ReopenS098 independent check). Path-existence is only enforced for
  `mined` (finding 2).

## Residual risk / verification gaps

- The lesson `corpus/lessons/round-48.md` does not exist yet; its draft cites
  S098 only as a pending candidate and leaves the rule-1 quote location/date
  unfilled. The S098 flip to `mined` therefore depends on the L1 completing that
  Gate section at close.
- This review did not run any census/gate against a landed registry (S098 is not
  in `corpus/SOURCES.md` at review time); findings 1/2 are derived from reading
  both checker implementations and directly checking the referenced paths.
- Network fetch was the only runtime tool used; no tools were installed or
  updated (recorded per operator rules).
