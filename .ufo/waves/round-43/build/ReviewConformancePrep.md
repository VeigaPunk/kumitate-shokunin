# ReviewConformancePrep — round-43 report conformance checklist

Prepared for kumitate round 43 (lane rev e5ffcbe7f155b89cb1870f9da7b0d671d092948b; plan commit
0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82). Every item below is a requirement on the round report
at `/home/vgpnk/Projects/shokunin/.ufo/reports/round-43/kumitate.md` (fleet repo), in filing order.

Sources read for this checklist:
- `.ufo/prompts/kumitate-round-43.md` sections 2, 2b, 4, 5, 6 (items 4–9).
- `/home/vgpnk/Projects/shokunin/PROTOCOL.md` — Round-robin rounds (minimum content, stale-lane
  actuator, lands-last, marker-vs-report), Evidence standard, Gate standard, Fleet-2 conventions.
- `.ufo/reports/round-42/kumitate.md` — the concrete shape precedent that passed step-1 review.
- `corpus/lessons/round-42-verifier-spotcheck.md` — routed defects D1–D8 the round-43 report must
  dispose of (prompt §6.5).

Godspeed axes for this item: completeness (each contract requirement present exactly once),
order (contract order preserved), sourceability (every item cites its rule), applicability
(round-43 binding text only; round-42-only duties excluded).

Legend: **✱** marker predicate — a report missing it is `failed` and the driver relaunches the
round. Everything else is conformance-grade: missing = `ok` + a logged conformance defect.

## A. Header block (before the first `##` section; round-42 precedent lines 1–17)

1. Round identity and attempt: `kumitate — round 43 (date)`; attempt number; whether a
   `lane-dead-no-report kumitate round=43` line exists in `.ufo/watchdog.log`, and if so exactly
   what inherited output was reused vs discarded, each named (prompt §6 preamble, §6.5).
2. Commit chain, full hashes: lane open, plan, amendments (if any), measured commit, close
   commit, and the pushed lane tip read from `scripts/hyaku/jj-lane.sh state` (`local=`,
   `ahead=0`, `behind=0`). Only the helper's `landed <hash>` lines are citable; `rewritten old ->
   new` is diagnostic; never cite bare `HEAD` or `@{u}` (prompt §6.4).
3. Source pin line: `31c465f15669f744848bd9f5d56191c5085670f7` clone
   `/fast/scratch/hyaku/kumitate-pin/src`; explicit "domain source not edited or pushed"; push
   scope = fleet repo remote + own kumitate lane remote only (prompt §5, §6.2).
4. Tool installs line: every install/update with tool, version, channel, reason — or `none`
   (pacman is paused host-wide; installs go through uv tool / npx / official binary in
   `~/.local/bin`) (operator tooling directive 2026-10-19; prompt §6.6, §6.7).
5. L0 questions: any question filed this round cited by lane + round + opening words + its fleet
   commit hash — never by line number; open questions named and routed around, not blocking
   (prompt §5, §6; PROTOCOL Fleet-2 conventions).
6. Stale-lane line: every mission of this lane open longer than two driver ticks, with age
   measured from the launch timestamp (not tick counter) and a grade — `progressing` (lane-authored
   commit, or files under the repo newer than launch via `find -newermt`), `progressing-weak`
   (sibling-authored activity only; never called progressing), or `silent`. Absence of a commit is
   not silence. Plus the standard statement: respawn-per-round driver, this run is exactly
   kumitate round 43, no other kumitate mission open, round 44 never started (PROTOCOL stale-lane
   actuator; prompt §6.6).

## B. `## Work performed` ✱

7. Opens by naming the round's declared claims (1–3) and each claim's target axis or capability —
   this round C1 = capability acquisition `gate-mutants` re-claimed on operability, with its
   frozen kill predicate K43 (prompt §4, §2; plan `.ufo/waves/round-43/plan.md`).
8. Then one bullet per work item, each carrying a resolvable evidence pointer (path:line, command
   output, or commit hash) (prompt §4; PROTOCOL evidence standard).
9. Cross-domain evidence encountered, with the domain it belongs to — an explicit line, not folded
   into Sources & frontier (round-42 spot-check flagged its absence as a defect; PROTOCOL
   round-robin minimum content).
10. Frontier-step pointers (prompt §2b): SOURCES.md curation — every new row opened this round
    with URL, access date and ≤25-word located quote in the lesson `## Gate`; rejections kept as
    rows with reason and flip; every status/recheck/used-by change logged old→new; the mined
    mistake in `corpus/lessons/round-43.md` `## Mistakes` (class · evidence · captured-by · fix)
    or the pasted sweep that found none; and which claim is sourced, citing its `S###`.
11. Routed defects D1–D8 from `corpus/lessons/round-42-verifier-spotcheck.md`: one disposition
    line each — the fix landed (pointer) or why not (prompt §6.5). D1 must include the corrected
    round-42 deviation line: the three "cancelled" seats CritC1Claim, CritSeparabilityTip,
    CritTradesTip did deliver reports that sat untracked. Operator-lesson debts
    (`corpus/lessons/operator-*.md`) named as honored or open.
12. Inherited-leftover resolution (commit under this round's entry or revert, each named); any
    host incident and the systemd-run bounds used; honesty markers — unrun checks named
    unverified, harmed or unprovable outcomes reported not prettified (prompt §6.5, §6.8).

## C. `## Landed changes` ✱

13. Every change tied to a LOG.md entry AND to the commit hash that carries it. Landed = committed
    and pushed; working-tree-only work does not count for the round (prompt §4; PROTOCOL
    lands-last).
14. Wave specs, seat registries and receipts under `.ufo/waves/round-43/` committed as wave
    evidence (`reportDir: ".ufo/waves/round-43/<wave>"`, lane-relative) (prompt §6.2).
15. Commits cited by full hash, never by subject or tag; corrections are new commits / appended
    entries, never amendments or in-place rewrites of cited bytes (PROTOCOL evidence standard).

## D. `## Before → after measurements` ✱

16. One per claim: the counting command pasted verbatim, its observed output, and the commit each
    side was measured against — before and after — plus the verdict (prompt §4; PROTOCOL
    evidence standard: claimed = re-executed with output, not quoted from memory).
17. Counter integrity: K43 (and any other frozen counter/kill rule) unchanged from the plan bytes;
    the do-nothing control receipt cited (`.ufo/waves/round-43/open/c1-control-base.txt`:
    `GATE_MUTANTS: SURVIVED …` exit 1) proving the target is unreachable without the claimed work;
    any amendment after data disclosed with its independent-attack pointer, the claim judged on
    the version declared before data (prompt §6.9; round-42 A1 lesson).
18. Gate-standard evidence: every gate verdict names the revision it was measured against (a run
    over a moving worktree is not comparable); selftest tally and frozen-run receipts committed
    with snapshot digests; a red gate recorded as a conformance defect in the round notes —
    status-neutral, never the marker predicate (PROTOCOL Gate standard).
19. No-harm statement: no scored axis or proxy term decreased, with the diff/count as evidence;
    every unscored trade (time, new runtime cost) named, not hidden (prompt §2 admission: "no axis
    is harmed"; round-42 precedent).

## E. `## Sources & frontier` (conformance-only; not a marker predicate)

20. Census before → after: the exact command
    `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
    pasted with both outputs and exit codes. Exit 0 required at round end; exit 2 at round start
    only while `corpus/SOURCES.md` does not exist; still missing at end = conformance defect
    recorded here and the registry created/repaired (prompt §2b.2).
21. Rows before→after with the counting command (e.g. `node scripts/sources-check.mjs`), rows
    added by tier (A/B/C), rows touched old→new, frontier rows advanced, and the sourced claim's
    `S###`. (A corpus-less lane would instead write one line beginning `SOURCES: unchanged —`
    naming why — not applicable to kumitate.) The watchdog logs its Sources & frontier marker and
    applies the source-census gate; it does not check trend verdicts or claim admission (prompt
    §2b, §4).

## F. `## Per-axis verdicts` (lane convention carrying the §2 admission duty)

22. One row per owned axis with the claim that moved it and the verdict — `improved`, `harmed`,
    `unchanged`, `unprovable-but-better`, or `unprovable` — each with its basis; a counted-claims
    line. At least one claim on the lowest non-retired axis (operability) unless the stagnation
    nudge is invoked (prompt §2; round-42 precedent table).
23. Admission shown, not implied: every claim verifies — measured, or exploratory with a named
    non-author `unprovable-but-better` judgment on record — and no axis is harmed; disputes (e.g.
    an integer that did not move) left open for the operator. An exploratory claim (≤1 per round)
    names what it improves and why the prior state lacked it; no counting command; the SCORECARD
    row carries verdict + reviewer pointer instead of a number (prompt §2 items 4–8).

## G. `## Trend verdicts` (canonical extra; not a marker predicate)

24. Exactly one verdict each for `expansion`, `quality`, and `discernment`, from {improved,
    harmed, unchanged, unprovable-but-better}, each with evidence; no scalar number (prompt §4,
    §6.6).

## H. `## SHONEN` ✱ (heading itself is contract-required)

25. Exact `## SHONEN` heading, one line per box of the lane's SHONEN.md (canonical 4 boxes).
    `[x]` only with a named non-author verifier id; `[~]` asserted-by-author with a resolvable
    evidence pointer; `[ ]` if untouched; marks confined to the box character plus one evidence
    line — no added or removed boxes. A missing heading is a conformance defect AND disqualifies
    the report as promotion evidence (must be re-filed next round). The driver's completion check
    also requires the heading plus minimum substance (PROTOCOL round-robin, Marker vs report;
    prompt §4).

## I. `## Round shape` (prompt §6.2)

26. Shape named: default = two v1 waves (each 32–64 seats, combined ≤128, policy
    `scripts/hyaku/ufo-wave-policy.json`) or alternative = one v2 wave (64–128, policy v2, ≥25%
    attack seats). Each wave dispatched as exactly ONE `task` call carrying the validator's
    `taskCall` unchanged; a refused wave fixed, never split or shrunk; refusals reported with
    error text.
27. Per wave: payload/spawned/returned/dead counts, `wave-slot.sh` gate=granted lines, role mix
    and attack-seat counts, and the FLOOR line proving the §3 minimums inside wave 1 (planner held
    by the L1 with its data-walk mapping recorded; ≥1 connector; ≥3 executor; ≥1 each scribe,
    scout, reviewer, critic); spawned total ≤128.
28. Dead seats listed with their last error text (dead stays dead in evidence); cancelled seats
    named as cancelled with their attacks "unperformed, not passed" (never "dead"); any residual
    ≤8-seat reviewer/critic `task` call counted in the total and named; the answering model
    recorded for any seat a claim's verdict depends on.
29. Misroot sweep before the report: `git -C /home/vgpnk/Projects/shokunin status --porcelain` at
    the fleet root; every own-seat file found there copied byte-exact (`cmp`) into the same
    relative lane path, the fleet copy deleted (the one permitted deletion), recorded under
    `## Mistakes`; never touching other lanes' files or `.ufo/state/` (prompt §6.3).

## J. Filing mechanics (acts and lines around the report)

30. The report lands LAST: written only after the lane work is committed and pushed, citing the
    pushed lane hash; the cited hash is the lane tip at report-write time and an ancestor of lane
    HEAD at closure (`git merge-base --is-ancestor <hash> HEAD`) (PROTOCOL lands-last; prompt §5).
31. Commit helpers only: lane commits through `jj-lane.sh commit` (cite only its `landed <hash>`
    output after remote verification), fleet commits through `fleet-commit.sh --as kumitate`
    pathspec-limited to `.ufo/reports/round-43/kumitate.md` (l0-questions appends through the same
    helper). No plain `git add`/`commit -a`/`git push`, no mutating jj commands (prompt §6.4).
32. Write scope: the lane repo + this report + l0 appends only; never MANIFEST.json,
    `templates/`, `scripts/`, `.ufo/state/`, `.ufo/watchdog.log`, or sibling repos (prompt §5, §6.3).
33. Marker rules restated for the writer: a contentless report (placeholder text; missing Work
    performed, Landed changes, Before → after, or SHONEN; or no evidence pointers) = round
    **failed**, driver relaunches; real committed work that skips only Sources & frontier or Trend
    verdicts = **ok** plus one minimum-content conformance defect; a report naming nothing
    checkable is a marker = **failed** whatever work actually happened (prompt §4; PROTOCOL
    Marker vs report).
34. Evidence-standard cross-check before commit: every pointer resolves at closure time (no /tmp,
    tmpfs, or session-scoped artifacts — commit them or cite a reproducible command); numeric
    claim → counting command; absence claim → search sweep; quote → location; evidence timestamp
    at or before the commit that ships it; a corrected fact swept through every mentioning file
    (PROTOCOL evidence standard).

## Notes

- The L1 additionally returns the orchestrator a ≤12-line summary (claims with verdicts, lane
  HEAD, report commit, round shape, wave sizes and role mix, round total, dead seats, open L0
  questions) — an out-of-report duty, not a report section (prompt §6 preamble).
- Section order: the six prompt-§4 sections keep their relative order (B → C → D → E → G → H);
  header block precedes; Per-axis verdicts (F) and Round shape (I) are extras, conventionally
  between E/G and after H respectively (round-42 precedent).
- Residual risk: round-42's prompt-level section list is the binding text; if the round-43 plan
  adds claim-specific receipts (it does: `open/c1-control-base.txt`, frozen counter sha256
  `e24749e4…`), item 17 must cite those exact artifacts. No verification gap: every item above is
  sourced from a file read this session.
