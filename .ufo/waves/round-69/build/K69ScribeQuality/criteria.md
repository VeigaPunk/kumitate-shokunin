# K69ScribeQuality — three append-row drafts for corpus/QUALITY.md (round 69)

Append after the current last row (Q65). Each row names the lesson that produced it.
Note: the r69 integration worktree already stages compact Q66–Q68 stub paragraphs in
corpus/QUALITY.md (`git diff 14057f3e -- corpus/QUALITY.md` carries exactly 3 added
`Q6[678]` lines; `git status --porcelain` → ` M corpus/QUALITY.md`). These drafts are the
full-evidence versions of the same three rows and may replace those stubs.

- **Q66 — a receipt of a counter whose rule has live arms records its live state on the verdict
  line — `live=exercised` or `live=no-live(vacuous-declared)`; a live-armed counter's receipt
  carrying neither is a routing defect (round 69).** Grounding: round-68 routed item 4
  (live-check irreproducibility, R68-4; `corpus/lessons/round-69.md` `## Mistakes`) — the M68
  counter has a live arm (`.ufo/waves/round-68/probe/deprec68-probe.mjs:18-19`: "M5 every M4
  bullet's quote is found in a fresh live fetch of its row's URL (unreachable = MISS;
  `--no-live` = MISS)"; `:66` parses `NO_LIVE`; `:252` pushes `no-live`), yet its verdict
  template (`:38`, `DEPREC68_HELD held=10/10 checks=10 rev=<full> rule=M68 …`) has no
  live-state field, so its base receipt cannot be re-judged: nobody can tell whether the live
  arm bit or was skipped offline.
  - **Who checks.** The lane at every receipt commit (`base/`, `controls/`, `close/`); the
    non-author closure rejects any live-armed counter's receipt that lacks the field.
  - **Command.** For each receipt of a counter whose rule has a live arm:
    `grep -o 'live=[a-z()a-z-]*' <receipt>` → exactly one of `live=exercised` |
    `live=no-live(vacuous-declared)`.
  - **Fails when.** The field is absent; it says `no-live(vacuous-declared)` on a run the plan
    declared measured live; or it says `exercised` where the plan/argv shows `--no-live`.
  - **Shown able to fail.** Red: `.ufo/waves/round-68/base/deprec68-base.txt:1` reads
    `DEPREC68_UNMET held=1/10 checks=10 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=M68 |
    M1 MISS entry-absent | … | M5 MISS no-live | … | M9 MISS readme-map-exit=1,province-entry-not-named`
    — `M5 MISS no-live` proves the live arm exists, yet no `live=` token appears anywhere in
    the file. Green: `.ufo/waves/round-69/base/deprec69-base.txt:1` reads `… rule=M69
    live=exercised | M9 MISS readme-map-exit=1 | M11 MISS origin-section-absent`, and
    `.ufo/waves/round-69/controls/c2-donothing.txt:1` reads `… rule=M69
    live=no-live(vacuous-declared) | M5 MISS no-live | …` — both vocabulary values observed.
    Emitter: `.ufo/waves/round-69/probe/deprec69-probe.mjs:550-551`
    (`LIVE_STATE = NO_LIVE ? 'no-live(vacuous-declared)' : 'exercised'`, then the verdict line
    carries `live=${LIVE_STATE}`), documented at `:53-54` "per QUALITY Q66".
  - **Limit.** The field is the counter's self-declared run mode: it proves which arms ran, not
    network truth — the live digest/quote arms still decide the verdict. It applies only to
    counters whose rules have live arms: L69 has none ("The live-check class does not exist in
    L69 (no live arms), so Q66 does not apply to its receipts", plan.md C1 stated limits).
    Operationalizes Q64's limit sentence "a counter whose base arm is vacuous by design (C2's
    M5 at base) must say so in its own receipt".
  - **Supersedes.** None.

- **Q67 — every settled wave seat lands a nonempty report file at
  `.ufo/waves/round-<N>/<wave>/<Seat>.md` before the wave is accepted, and the wave receipt
  counts result entries against report files, naming any exception at receipt time (round 69).**
  Grounding: round-68 routed item 3 (R68-3, a settled seat with no report file; plan.md
  "Mistakes mined": "seat-report-file gap (R68-3 → Q67 + this wave's receipt)"). A result entry
  in `w1-results.json` is settlement evidence; it is not a report, and settlement never
  substitutes for one.
  - **Who checks.** The wave receipt at WAVE-DONE: for every result name, require a nonempty
    regular file `<wave>/<name>.md`; list every exception by name in the receipt itself. The
    closure rejects a wave whose receipt carries an unresolved exception or whose counts do not
    match the tree.
  - **Command.** `node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('<results.json>','utf8'));const w='<wave-dir>/';const names=(Array.isArray(j.results)?j.results:j.seats).map(x=>x.name);console.log(JSON.stringify(names.filter(n=>{let s;try{s=fs.statSync(w+n+'.md')}catch(e){}return !(s&&s.isFile()&&s.size>0)})))"`
  - **Fails when.** A name has a result and no nonempty report file at receipt time and the
    receipt does not name it; or the receipt's tallies disagree with the tree.
  - **Shown able to fail.** Red: `node -e …` over `.ufo/waves/round-68/w1-results.json` →
    `results=66 names=66 without_nonempty_report=["K68ReviewC1Predicate"]`;
    `grep -c '"name":' .ufo/waves/round-68/w1-results.json` → `66` vs
    `printf '%s\n' .ufo/waves/round-68/w1/*.md | wc -l` → `65`;
    `test -f .ufo/waves/round-68/w1/K68ReviewC1Predicate.md; echo $?` → `1`; the output itself
    sits in the results (`w1-results.json:248-250`: `"name": "K68ReviewC1Predicate",
    "agent": "reviewer", "output": "<think>\nExcellent. Level variant passes all 20; …"`).
  - **Limit.** Judges presence (nonempty regular file), not content quality — content is the
    closure's judgment. Receipt-time semantics: a seat still running when the receipt is cut
    must appear as a named exception, never a silent omission. This round's wave receipt
    (round 69) is contract at draft time: no `w1-results.json` exists yet at
    `.ufo/waves/round-69/` while 42 seat reports are in flight, so the counting arm is first
    observable at wave close.
  - **Supersedes.** None.

- **Q68 — a newly acquired gate lands its registration triad in the round that lands it:
  a SKILL.md gate-registry row, its pin (a named entry in a `.ufo/pins/*.json` file), and a
  SCORECARD `## Capabilities` table row; a triad-incomplete gate is not graded conformant, and
  pre-existing missing-triad debt stays named, not silently reclassified (round 69).**
  Grounding: `considerthese/2026-10-26.md` idea 3, mined 2026-10-30 (plan.md §Assimilation):
  "**Check that new tools get registered.** For every new `scripts/*.mjs` or `*.sh` a round
  adds, check for a SKILL.md row, a pin, and a SCORECARD capability row in the same round, and
  report what's missing." Same file, context: "Gap still open: neither tool has a SKILL.md
  registry row or pin yet (r65 D2/D3), so by the lane's own standard they are not graded
  conformant."
  - **Who checks.** The lane when it lands a gate; the closure refuses "conformant" wording
    for a triad-incomplete gate; any later pass re-runs the three greps.
  - **Command.** For the gate name G at the landing tip T:
    `git show T:SKILL.md | grep -c G`; `git show T:SCORECARD.md | grep -cE '^\|.*G'`;
    `git ls-tree -r --name-only T -- .ufo/pins/` plus `grep -rc G .ufo/pins/` — all three > 0.
  - **Fails when.** Any leg is absent at the landing tip; or an older gap is later described as
    conformant without a named debt row.
  - **Shown able to fail.** Red at the r65 tip that landed harm-matrix as C1
    (`52f8497987eaae42c3be668cdd5e90a34c5bf48e`):
    `git show 52f8497…:SKILL.md | grep -c harm-matrix` → `0`;
    `git show 52f8497…:SCORECARD.md | grep -cE '^\|.*harm-matrix'` → `0`;
    `git ls-tree -r --name-only 52f8497… -- .ufo/pins/ | grep -c harm-matrix` → `0`
    (all three legs absent in the landing round). Green anchor, a landed triad (r69
    integration worktree, closure pending): SKILL.md:638 `| routed-ledger | gate | …`;
    `.ufo/pins/counter-pins.json:221-225` (`"round": 69, "name": "routed-ledger",
    "path": "scripts/routed-ledger.mjs", "sha256": "05aacb5e…"`); SCORECARD.md:1804
    capabilities row `routed-ledger … 69 (demonstrated; closure pending)`.
  - **Limit.** Judges registration, not gate quality. The pin leg is a named entry in a pins
    file (pins are per-tool JSON entries such as `counter-pins.json`), not a per-tool file.
    Historical debt is not retroactively cured: at the r69 worktree harm-matrix still has no
    SKILL.md registry row and no pin entry (grep over SKILL.md and `.ufo/pins/` → no matches),
    which stays named debt under this row.
  - **Supersedes.** None.
