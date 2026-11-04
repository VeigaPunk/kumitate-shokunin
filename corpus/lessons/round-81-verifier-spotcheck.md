author: hyaku closure (non-author integrator, @m_zfl)
round: 81
lane: kumitate
reviewed: 77c7a8b3fe7f3cebe681065da283de0ae38ddb5b → 13060d9b8db4b1c18cc0c46594dbf943d5f9ac03; report `.ufo/reports/round-81/kumitate.md`

# Round 81 — non-author verifier spot-check

Two claims, two axes: C1 `operability` (capability acquisition `ready-handoff` — the inline spawn
handoff judged before the orchestrator takes it) and C2 `coverage:omp` (the OMP shape receipt becomes
self-describing: `captured_at`, age disclosure, opt-in `--max-age`). This review re-derived what could
be re-derived from committed bytes and evidence-verified the lane's frozen counters and gate receipts
per PROTOCOL §Gate standard (Closure consequence). No lane gate or counter was re-executed as the
verdict; every number below comes from `git show`/`git cat-file`/`grep`/`wc`/`awk` over committed
bytes, from the committed receipts, or from the SCORECARD's own counting commands.

## Conformance (step 1)

- **Report attribution and landing order.** `git -C /home/vgpnk/Projects/shokunin log --format='%an
  <%ae> %H %ai %ci' -1 -- .ufo/reports/round-81/kumitate.md` → `kumitate-shokunin
  <kumitate@shokunin.local> 6a6f5898583599eee194aaa1867b602027f7df31 author 07:30:24 -0300, committer
  07:32:08 -0300`. The lane tip `13060d9b` has committer `07:31:26 -0300`, so the report lands 42 s
  after the work by committer date; the earlier author date is the same jj author-date skew the r80
  review noted, not a lane edit. The report commit is an ancestor of fleet `origin/main`
  (`git merge-base --is-ancestor 6a6f5898 origin/main` → yes).
- **SHONEN heading.** `grep -c '^## SHONEN' .ufo/reports/round-81/kumitate.md` → `1`; `grep -c '^- \[~\]'`
  → `4`; no `[x]` and no `[ ]` in the assessment (the seed has four `[ ]` boxes,
  `grep -c '^- \[ \]' SHONEN.md` → 4). The four pointers resolve: `SKILL.md:618` is the
  `ready-handoff` registry row and `SKILL.md:755-756` are the two new checklist items.
- **Cited commits.** Every cited lane commit resolves and is an ancestor of `master`:
  `77c7a8b3` (base, the r80 spot-check commit), `f8783f4b` (freeze), `2ac1f34d` (wave spec +
  dispatch + `w1.ready`), `d140f288` (scaffolding), `13060d9b` (close) — five for five with
  `git merge-base --is-ancestor <h> master` → yes. (`6a6f5898` is the fleet-repo report commit, not a
  lane commit.)
- **Lane cleanliness / push.** `scripts/hyaku/jj-lane.sh state .../kumitate-shokunin` →
  `branch=master local=13060d9b8db4b1c18cc0c46594dbf943d5f9ac03 remote=13060d9b8db4b1c18cc0c46594dbf943d5f9ac03
  ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` → empty;
  `git ls-remote origin refs/heads/master` → `13060d9b8db4b1c18cc0c46594dbf943d5f9ac03`.
- **Prompt contract.** `.ufo/prompts/kumitate-round-81.md` is 704 lines; `templates/round-prompt.md`
  is 140. A line diff of the prompt's §1–§5 against the template rendered with `{{LANE}}`→`kumitate`,
  `{{ROUND}}`→`81`, `{{FLEET_ROOT}}`→`/home/vgpnk/Projects/shokunin`, `{{AXES}}`→`operability +
  coverage (orchestration and tooling)` yields exactly one difference: the first line's
  `<kumitate-repo>` is `kumitate-shokunin`. §6 (hyaku addendum) begins at line 141. The
  mission/axes binding, the 1–3-claim contract, the frontier step, the ≥8-seat one-batched L2 floor,
  commit-then-push ordering, push scope, the L0 side channel and all five child-lane items (report
  path, report-lands-last, `SHONEN` heading, landed-hash citation, lane write scope) are present.
  `MISSION.md` carries no per-lane route pin (lines 12–13, 58, 63–65 defer to the operator's global
  table), so the prompt's run-15 route text contradicts no MISSION bucket.
- **Dispatch evidence.** Live `.ufo/watchdog.log` lines 2307 and 2315 match the digest:
  `2026-11-04T06:40:45-03:00 launch kumitate round=81 pgid=725520 driver=hyaku-inline attempt=1`;
  `2026-11-04T07:34:13-03:00 complete kumitate round=81; hyaku-inline attempt=1`.
- **Wave shape.** `w1-dispatch.json` seats 14: executor 3, scout 2, reviewer 2, scribe 2, connector 1,
  mutation-tester 1, critic 1, sentinel 1, revenger 1 (`planner` is held by the L1 per addendum §6 —
  the validator rejects it — never a swarm seat). Attack 4/14 = 29 % ≥ 25 %; connectors 1 ≤ 2;
  `w1-results.json` has `seats: 14` and 14 result rows; 12 seat report files exist
  (`K81MutC1.md`/`K81Sentinel.md` absent — the two dead seats, named and never replaced, per the
  addendum's "never replace a dead seat"). One v1 wave inside the 8–16 band.

## Claim re-check (step 2)

### C1 — `operability`: capability acquisition `ready-handoff`

- **Before state, re-derived.** `git cat-file -e 77c7a8b3:scripts/ready-handoff.mjs` → `fatal: path
  'scripts/ready-handoff.mjs' exists on disk, but not in '77c7a8b3'`: the capability did not exist at
  the base tree, so every arm that spawns it must fail. `controls/c1-base.txt` → `C81_C1: UNMET
  held=0/16 … sha=absent`, `exit=1`; the constant-printer control `controls/c1-stub.txt` → `held=3/16`,
  `exit=1`.
- **Counter shape.** `grep -c "  arm('" .ufo/waves/round-81/probe/probe81-c1.mjs` → `16`; the probe
  names the frozen plan (`plan.md` §C1) as its predicate and its arm 16 accepts the tool's own suite
  (`/READY_HANDOFF_SELFTEST: (\d+)\/\1 pass/`).
- **After state, evidence-verified.** `close/c1-probe.txt` → `C81_C1: HELD held=16/16
  tool=…/scripts/ready-handoff.mjs sha=df736d63`, `exit=0`; `close/handoff-selftest.txt` →
  `READY_HANDOFF_SELFTEST: 34/34 pass`, `VERDICT: PASS`, `exit=0`; `close/handoff-admission.txt` →
  `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1`, `exit=0`, gate sha256
  `f8fc11f1f745…`.
- **Which bytes the receipt scored.** The probe's `sha` is a 32-bit FNV-1a over the tool text (not
  sha256): over `git show d140f288:scripts/ready-handoff.mjs` it is `1bed8387`, over
  `git show 13060d9b:scripts/ready-handoff.mjs` it is `df736d63`. The receipt therefore scored the
  **close-tip bytes**, while its `rev=` line names `d140f288` and the report repeats that revision.
  The value is measured on the shipped instrument; the revision label is stale (routed R81-1).
- **Registration.** `SKILL.md:618` is the registry row (`gate`; entry command; the finding
  vocabulary and the 0/1/2/64 exit map; `--selftest`; the pin), and `SKILL.md:755-756` are the two
  executable checklist items; `scripts/proxy-check.mjs:575` carries
  `'pin.ready-handoff': 'scripts/ready-handoff.mjs'`. No checklist item regressed:
  `close/checklists.txt` → `CHECKLIST: 41/41 pass`, `exit=0`.
- **Operability integers, re-derived with the SCORECARD's own commands.** `find . -path ./.git -prune
  -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` →
  `889`; `grep -c '^\s*- \[' SKILL.md` → `41`; the stanza holds `A=889 C=41` and
  `close/proxy-check.txt` → `PROXY: MATCH (… operability=9 …)`.

### C2 — `coverage:omp`: the shape receipt becomes self-describing

- **Before → after over committed bytes.** Occurrence counts in `scripts/omp-census.mjs` at
  `77c7a8b3` → `13060d9b`: `captured_at` 0 → 25, `age_days` 0 → 6, `--max-age` 0 → 13,
  `SHAPE_VERSION` 0 → 2, `SHAPE_CLOCK` 0 → 2. The capability is new on the committed surface.
- **Counter shape.** `grep -c "  arm('" .ufo/waves/round-81/probe/probe81-c2.mjs` → `15`; arm
  `max-age-stale` asserts `SHAPE_STALE age_days=45 max_age=30` exit 1, and `stale-does-not-score`
  asserts the score never moves on age.
- **Controls.** `controls/c2-base.txt` → `C81_C2: UNMET held=4/15`, `exit=1` (the base suite reads
  `VERDICT: PASS (89 cases)`); `controls/c2-stub.txt` → `held=6/15`, `exit=1` (stub suite 97).
  Amendment 2 re-measured the base from the freeze-time 1/15 to 4/15 and the stub from 5/15 to 6/15,
  with the per-arm reason in `plan.md` §Amendment 2 (arms 04, 09, 13, 14 hold at a base tree; the
  claim's "below 15" predicate is unchanged).
- **After state, evidence-verified.** `close/c2-probe.txt` → `C81_C2: HELD held=15/15`, `exit=0`;
  `max-age-stale PASS exit=1 out=SHAPE_STALE age_days=45 max_age=30`; `shape-v1-refused PASS exit=2
  out=SHAPE_VERSION want=kumitate-omp-shape-v2 got=kumitate-omp-shape-v1`; `compare-v1-accepted PASS
  exit=0`; `stale-does-not-score PASS exit=0 verdict=MATCH coverage_omp=10 O_members=65`;
  `selftest PASS exit=0 out=VERDICT: PASS (98 cases)`. `close/census-shape.txt` → age disclosure
  `… captured=2026-11-04 age_days=0` exit 0 and `OMP_SHAPE_COMPARE: IN_SYNC`, exit 0. The receipt's
  `rev=` line again names `d140f288` while the 98-case suite exists only at the close tip (R81-1).
- **Pins.** `SCORECARD.md:352` `pin.ready-handoff=f8fc11f12f74505e95bdf1674c3626e4b810f6be99453177d5bd729349712995`
  equals the sha256 of `scripts/ready-handoff.mjs` at `13060d9b`; `pin.omp-census` is
  `ba7cbc8f7f507fcf…` = the close-tip sha256; `pin.omp-shape=8b6aaa79e24f…` matches the
  `receipt-pinned` arm's `pin=8b6aaa79e24f`; `close/proxy-check.txt` → `PROXY: MATCH (… C2=202/202;
  … O=1/1 O_members=65 … coverage:omp=10; pins=6 match)`.

## Axis verdicts

| axis | verdict | re-derivation |
|---|---|---|
| operability | improved | new `ready-handoff` capability registered and running (counter base 0/16, stub 3/16 → 16/16; suite 34/34); A 886 → 889, C 39 → 41; `f_O` integer 9 held (terminal); proxy MATCH `operability=9` |
| coverage:omp | improved | receipt v2 on the committed tool (five new tokens absent at base); counter base 4/15, stub 6/15 → 15/15; `C2=198 → 202`; `coverage:omp=10` held; `age_days` disclosed and non-scoring |
| coverage (retired aggregate) | unchanged | no row change; stanza `coverage=10` holds |
| coverage:script-layer | unchanged | `S=88/88`, `coverage:script-layer=10` in the MATCH receipt |
| coverage:runtime-layer | unchanged | `R=92/92`, `coverage:runtime-layer=10` |
| coverage:kimi-layer | unchanged | `K=55/55`, `coverage:kimi-layer=10`; `close/kimi-census.txt` CLEAN |
| depth / freshness / calibration / adjacency | unchanged | not scored by this lane (SCORECARD: other lanes own them); no surface moved and no cross-domain material admitted; the record defects below are precision debt, not axis regressions |

`git diff 77c7a8b3 13060d9b -- SCORECARD.md` changes the stanza (`A 886 → 889`, `C 39 → 41`,
`C2 198 → 202`), the re-pins, the capability row `ready-handoff`, two round-81 rows and
`## Round 82 — pre-registration`; no axis integer row moves down. No owned axis is harmed:
`close/proxy-check.txt` MATCH, `close/checklists.txt` `41/41 pass`, `close/readme-map.txt`
`202/202/202`, `close/sources-check.txt` CLEAN rows 175, `close/sources-census.txt` exit 0,
`close/claims-check.txt` `19/19`, `close/anchor-truth.txt` CLEAN.

## Discernment spot-check (LEARNING.md — from outside)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S236 Kubernetes, *Admission Controllers Reference*, docs/A | admit | committed capture `.ufo/waves/round-81/build/L1/captures/kubernetes-admission.html` (574,395 bytes; sha256 `1a86e90c458ef577…` matches `corpus/SOURCES.md`'s capture and `.ufo/pins/source-captures.json`) | agree | the located quote is present verbatim once the inline `API server` anchor is stripped ("Admission controllers are code within the Kubernetes API server that check the data arriving in a request to modify a resource."); `printf … \| wc -w` → **21**, the Gate's stated count; primary documentation, and the write-admission/read-bypass scope is exactly what the entry uses |
| S237 IETF RFC 9111, *HTTP Caching* §5.1 Age, spec/A | admit | `.ufo/waves/round-81/build/L1/captures/rfc9111.html` (232,630 bytes; sha256 `ce91ee9848d2b9ac…` matches the pin) | agree | quote present verbatim: "The Age field value is the cache's estimate of the number of seconds since the origin server generated or validated the response."; `wc -w` → **22**, the stated count; the RFC is tier A for the Age semantics, and the entry borrows "the artifact carries its age; freshness is consumer-declared", with the custody limit (the field is self-asserted) stated |
| S235 Command Line Interface Guidelines (clig.dev), community/C | reject (round-80's Gate — round-81's Gate records **no** rejected row, so the nearest reject is sampled) | `.ufo/waves/round-80/build/L1/captures/clig-dev.html` (86,536 bytes; present at `13060d9b`) | agree | the quote "Return zero exit code on success, non-zero on failure." is present; the capture is an open-source community guide (`community` signals present), tier C is the right tier, and the row records a concrete flip (POSIX/AWG primary or a maintained CLI framework's normative docs) |
| new SOURCES rows S236/S237 | admit rows | `corpus/SOURCES.md` lines 190–191; 11 columns; `status=mined`; `used-by` names the two admitted entries, both of which exist and cite the ids | agree | the rows parse (`awk -F'\|' … NF!=13` → 0 malformed), the quotes and scopes are located, and `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → six carried `W04` warnings + `kumitate ok …/corpus/SOURCES.md`, `exit=0` |
| round-81 claim-level reject: S117/S118 `used-by` extension reverted (R80-7) | change (rejection of an unsupported extension) | `corpus/knowledge/two-reading-verdicts.md`; `git show 77c7a8b3:corpus/SOURCES.md` vs `13060d9b` | agree | the entry cites only S119 (`grep -o "S1[0-9][0-9]" … \| sort -u` → `S119`); at base S117/S118 both name the entry, at close they name only `worker-heartbeat-liveness.md`, while S119 keeps the extension. The revert is real and logged old→new in the lesson's `## Gate`. |

Round-81's `## Gate` admits two rows and rejects none ("No row was rejected this round"), so the
round-local reject sample cannot be drawn; the nearest reject (r80 S235) and the round's own
claim-level rejection are checked above. That is a sample limit, not a disagreement — but a round
with only admits gives the outside check no reject calibration, which is worth a noted target next
round (R81-6).

## Trend verdicts

- **expansion — improved.** Two admitted `knowledge/` entries on ground the README map did not hold
  (pre-dispatch admission; a receipt carrying its capture instant), each `source:` citing a `mined`
  row opened this round (S236, S237); SOURCES 173 → 175 and tier A 147 → 149
  (`git show <rev>:corpus/SOURCES.md` with the frozen census/pipeline); README map 198 rows / 199
  files → 202/202 (`git ls-tree` at both revisions; `close/readme-map.txt` `202/202/202`); the
  capability table gains `ready-handoff`.
- **quality — improved.** Both instruments gained behavior the base tree and a constant printer cannot
  reach (C1 0/16, stub 3/16 → 16/16; C2 4/15, stub 6/15 → 15/15); the three suites grew
  (`ready-handoff` 31 → 34, `omp-census` 97 → 98, `proxy-check` 163); a real CLI defect (the
  `--max-age` argument dropped by `main()`) was found by the frozen arm, fixed, and given a
  `cli-max-age` regression case; the mutation matrix killed 10/11 C1 mutants and 6/6 C2 mutants, with
  the one survivor disclosed as a real coverage gap. The record defects routed below are precision
  debt, not false admitted entries.
- **discernment — improved.** This outside check agrees with every sampled decision (two admits, the
  nearest reject, both new rows, the claim-level revert); the lane's own `spotcheck-adopt` caught the
  10th recurrence (`open/spotcheck-open.txt` DRIFT `uncovered=1`) and the committed repair transcript
  shows the fix; the wave's critic and scout disclosed the gate's structural limits (`A1–A9`, the take
  path, the realpath arm) instead of claiming enforcement. The round's Gate carries no reject, which
  is noted as a sample limit rather than a disagreement.

## Routed defects (status-neutral; lane to fix in round 82)

1. **R81-1 — close receipts carry a stale `rev=` label.** `close/c1-probe.txt` says
   `rev=d140f288…` but its `sha=df736d63` is the FNV-1a of the **13060d9b** tool (d140f288's tool
   hashes `1bed8387`); `close/census-selftest.txt` says `rev=d140f288…` with `VERDICT: PASS (98
   cases)`, and 98 cases exist only after the close commit (d140f288's suite is 97;
   `close/census-shape.txt`'s `rev=` is the same constant). The report's Before → after tables then
   say "measured at `d140f288`" — contradicted by its own receipt's hashed bytes and by
   `pin.ready-handoff=f8fc11f1` (close bytes). Fix: stamp the measured revision on every receipt and
   cite that in the report; a receipt that names a revision must hash that revision's bytes.
2. **R81-2 — wrong receipt pointer for the stale reading.** The report's C2 row cites
   `close/census-shape.txt` for `--max-age 30` on a 45-day receipt → `SHAPE_STALE age_days=45
   max_age=30` exit 1. That file contains only the age-disclosure and compare readings; the
   `SHAPE_STALE` line is in `close/c2-probe.txt` (arm `max-age-stale`). Fix: cite the arm/receipt that
   contains the reading.
3. **R81-3 — registry row's pin is stale.** `SKILL.md:618` states
   `pin.ready-handoff` = `f8b4a92b58d3…` (the d140f288 bytes), while the stanza (`SCORECARD.md:352`),
   the proxy pin block and the shipped file are `f8fc11f1…`. The row is the current registry, not a
   history note. Fix: update the value, or reference `pin.ready-handoff` by path/key as the other rows
   do.
4. **R81-4 — knowledge `verified-at` tallies are stale at the shipping revision.**
   `corpus/knowledge/ready-handoff-admission.md` quotes `READY_HANDOFF_SELFTEST: 31/31 pass` while the
   shipped suite is 34/34 (and the file was edited at the close commit without refreshing the tally);
   `corpus/knowledge/self-describing-shape-receipt.md` quotes `VERDICT: PASS (97 cases)` while the
   shipped suite is 98. Fix: refresh the tallies (or name the measured revision in the field) — a
   reader re-running the quoted command at the shipped tip does not reproduce them.
5. **R81-5 — the quoted settlement line does not resolve.** The report quotes
   `WAVE-DONE kumitate r81 w1: all 14 seats settled` and points at
   `.ufo/waves/round-81/w1-results.json`; `grep -rn "all 14 seats settled" .ufo/waves/round-81/` finds
   nothing, and the JSON carries `seats: 14` plus 14 result rows but no such text. Fix: quote a
   committed record (the JSON's seat count and rows) or drop the runtime message.
6. **R81-6 — Gate rejects: none this round.** `corpus/lessons/round-81.md` §Gate records two admits
   and states "No row was rejected this round", so the outside check had no round-local reject to
   sample and the round-81 registry shows no rejected row for its two candidates. This is not a rule
   violation, but a Gate with only admits offers no reject calibration; target at least one
   considered-and-rejected candidate in round 82 (or state the sweep that found none).
7. **R81-7 — the "six fail-closed refusals" count is short.** The report and the README map row say
   "the six fail-closed refusals"; `grep -oE "throw new Refusal\('[A-Z_]+'" scripts/ready-handoff.mjs
   | sort -u` yields eight tokens: `READY_ABSENT`, `READY_MALFORMED`, `READY_UNSAFE`,
   `DISPATCH_PATH`, `DISPATCH_ABSENT`, `DISPATCH_OUTSIDE`, `PATH_UNSAFE`, `DISPATCH_MALFORMED`. Fix:
   state the count with its command and definition (or enumerate the set), and correct the README row
   and the report.
8. **R81-8 — lesson counters table mis-states the open README-map reading.**
   `corpus/lessons/round-81.md:57` records the open reading as `CLEAN files=198 rows=198 covered=198`
   "(after the adoption)", but its cited `open/readme-map.txt` reads `CLEAN files=199 rows=199
   covered=199`, and `git ls-tree -r --name-only 77c7a8b3 corpus/knowledge corpus/lessons | grep -c
   '\.md$'` → 199 (rows 198 before the adoption, DRIFT). Fix: append a named erratum naming the
   after-adoption reading (199/199/199) and keep the 198-row reading as the pre-adoption state.

The round's SHONEN boxes are all `[~]`; box 1's pointers (`SKILL.md:618`, `755-756`) resolve and the
checklist is `41/41`, box 2's dispatch admission is evidenced, box 3's re-derivation path
(`plan.md` + both counters + the knowledge entry) resolves, and `PROVINCE.md` is unchanged. The boxes
look checkable by a non-author from committed evidence (barring R81-3/R81-4 precision debt); promotion
remains operator-owned, and this non-author writes no `[x]`.

## Verdict

Both claims verify against committed evidence, no owned axis is harmed, and the three trends are
`improved`. The defects above are conformance/record defects and are status-neutral; the round is
**admitted**. This file itself adds the 11th spotcheck-coverage file
(`corpus/lessons/round-81-verifier-spotcheck.md`) for the lane to adopt in round 82 through its own
`spotcheck-adopt` rule.
