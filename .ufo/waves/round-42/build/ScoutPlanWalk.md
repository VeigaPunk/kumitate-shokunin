RESULT ScoutPlanWalk rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=bounded risks=8

# Round 42 plan walk (data seat)

Walked `.ufo/waves/round-42/plan.md` against lane `SCORECARD.md` (`## Planned` latest,
`## Saturation`, `## Capabilities`, the `kumitate-proxy-v1` stanza, `## Axes`), `AXES.md`,
`MISSION.md` and `corpus/lessons/round-41-verifier-spotcheck.md` at the lane revision
`b237e3f09c9559e130c7367bd2efa981c4ea516f`. All runs below were executed in my own scratch
clone (`/fast/scratch/hyaku/kumitate-r42/seats/ScoutPlanWalk/lane`, detached at that revision,
`dirty=0`) with the pinned source `/fast/scratch/hyaku/kumitate-pin/src` (`31c465f1`). The
lane's scripts and scorecard were read, never written. No `lsp` device is exposed in this
seat's tool set, so definitions were read from source with `read`/`grep` (grep is the literal
fallback here, never treated as semantic proof); the proxy, census, checklist and round-gate
semantics quoted below were confirmed by reading the code paths that decide them.

## 1. Observed facts

1. Revision and cleanliness: `git -C lane rev-parse HEAD` → `b237e3f09c9559e130c7367bd2efa981c4ea516f`;
   `git -C lane status --porcelain | wc -l` → `0`.
2. The plan's C1 before-value re-derives exactly at this revision:
   `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json | jq -c '.terms | {A, C, operability, C2, C2_total, coverage, K_members, K_sections, coverage_kimi}'`
   → `{"A":9,"C":17,"operability":8,"C2":92,"C2_total":93,"coverage":9,"K_members":52,"K_sections":52,"coverage_kimi":10}`.
3. The round therefore opens in proxy **DRIFT**, beyond the plan's claim terms:
   `node scripts/proxy-check.mjs --src … --strict` → `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=92 computed=93 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/anchor-truth.mjs; PIN_UNPINNED term=scripts/sources-check.mjs; PIN_UNPINNED term=scripts/wave-census.mjs; src-rev=31c465f15669)`, exit `1`.
   The open receipts record the same two errors, so this is not a later drift.
4. Cause of the C2 drift is one file, not the plan: `comm -23` of corpus notes against
   `corpus/README.md` rows prints exactly `lessons/round-41-verifier-spotcheck.md`
   (93 notes / 92 rows). Every earlier closure spot-check got its row the following round
   (`corpus/README.md:93,95,101,105,109,113,117` each end "row added in round N … it landed
   without one, `C2_TOTAL_DRIFT` 77→78" etc.).
5. C2 before-state re-derives: `node scripts/kimi-census.mjs` → `FAMILY K3 members=9 checked=9 frozen=9`
   … `ROOT_ENUM … strays=1`, `CENSUS error UNLISTED locks`, `TOTALS: members=52 checked=52 errors=1`,
   `KIMI_CENSUS: DRIFT (UNLISTED locks)`, exit `1`. The host path is a directory with one live
   child (`stat -c '%F' ~/.kimi-code/locks` → `directory`; `find … -mindepth 1 -maxdepth 1 | wc -l` → `1`).
6. The checklist item baseline is checkout-dependent. In a **bare clone** at this revision:
   `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 13/17 pass`, `VERDICT: FAIL`, with
   line 680 (round-close audit) and 681 (filed-report tracking) failing `exit=2` — the two
   round-gate items the round-41 spot-check names as needing the fleet reports dir and the fleet
   git work tree, absent in this clone [INFERENCE from that note plus the exit class]; line 682
   (proxy recompute) fails on the drift in fact 3, and line 685 (kimi census) on fact 5. The
   published 16/17 was measured in the lane checkout, where those two items can pass.
7. Measured cost of the two selftests the new gate will drive: `cite-check --selftest` `1017 ms`,
   `wave-census --selftest` `1930 ms` (idle host, `scripts/` is 9 files / 724K). A 41-mutant run
   is therefore ≈ `16×1.0 s + 25×1.9 s ≈ 64 s` of selftest time before 41 temp copies and node
   startups, against `CHECKLIST_TIMEOUT_MS = 120_000` in `scripts/surface-probe.mjs:241,1008`.
8. The plan's kill rule and the round-41 cite receipts disagree for two ids. Receipt
   `.ufo/waves/round-41/final/cite-mutants-final-fae386aa.txt:15-16`:
   `MUTANT suite-group-verdict killed exit=0 cases=73/75 fail_lines=2` and the same for
   `suite-any-fail`. `scripts/cite-check.mjs:2611` computes the suite verdict as
   `suites.some((s) => s.verdict === 'FAIL') ? 'FAIL' : 'PASS'`, so those two mutants print
   `VERDICT: PASS` with exit 0 — they are kills only under the round-41 rule ("a `FAIL ` case
   line or a short case count"), not under the plan's "exit non-zero with a `VERDICT: FAIL` line".
9. The 25 wave-census ids are not all liftable as literals. Classifying the four
   `a2-census-*-mutants.txt` receipts: `25` MUTANT lines, `5` are `drop \`literal\`` forms,
   `3` render the literal elided with `...` (`F-M23 d.counts && (...)`, `string-agent-check-dropped
   if (tc.tasks.some((t) => !t || typeof t.name ...)) {`, `M10-unknown-wave-zero if (!hits.length) {...}`),
   `19` are exact-once in `scripts/wave-census.mjs` (sha `d6068d1b…c17204`). Three lines
   (`F-M20`, `F-M22`, `read-error-rethrown`) do not render a two-span literal at all.
   There is no committed census mutant runner: `.ufo/waves/round-41/probe/` holds only
   `cite-verdict-mutants.mjs.txt` and `wave-recount.sh.txt`.
10. The K member set is implemented twice. `scripts/kimi-census.mjs:108-155` holds `MEMBERS` and
    `FROZEN = { K1: 4, K2: 27, K3: 9, K4: 9, K5: 3 }`; `scripts/proxy-check.mjs:509-517` holds a
    second, identical K3 rule list ("exports no member table, so the rules are re-derived here").
    The census selftest pins the total and K3 in six places: `scripts/kimi-census.mjs:522`
    (`members=52 checked=52 chain=3 info=4`), `:532`, `:533`, `:536`, `:546`, `:701`, `:717`
    (`j.totals.members === 52`, `f.K3.members === 9`), and its fixture builder at `:440`
    ("holding all 52 members"). `--selftest` currently reads `KIMI_CENSUS_SELFTEST: 48/48 pass`.
11. Term definitions that decide the plan's arithmetic: `scripts/proxy-check.mjs:915`
    `const A = walkFiles(self).filter((r) => RE_RUNNABLE.test(r)).length` with
    `RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/` (`:477`) over the whole work tree minus `.git`;
    `:482` `RE_README_ROW = /^\| `(knowledge|lessons)\//` and `listCorpusNotes` over
    `corpus/{knowledge,lessons}` for `C2`/`C2_total`; `:478` `RE_CHECKLIST = /^\s*- \[/` over
    `SKILL.md` for `C`; `:455-461` `AXIS_ROWS` compares `operability`, `coverage`,
    `coverage:script-layer`, `coverage:runtime-layer`, `coverage:kimi-layer` against the stanza.
12. `C` at open is `17` (`grep -c '^\s*- \[' SKILL.md` → `17`); the gate registry has 9 rows
    (`SKILL.md:599-607`), one per gate, including `wave-census` and `anchor-truth`.
13. Pinning more gates is not a stanza-only edit: `PINS` holds six keys whose values are exactly
    `FIXTURE_SCRIPTS` (`scripts/proxy-check.mjs:1291`); the selftest hard-codes
    `pins=6 match` in ~12 expected verdict lines and one case is literally
    `check('parent-frozen v1 parser accepts its unchanged 23-key base stanza', …)` (`:1637`).
    After C1 the unpinned-script warnings become 4, not the plan's 3.
14. `## Planned` (SCORECARD.md:455-1064) names no round 42 and no round 43, so
    `round-gate --round 42` will emit `SCORECARD_PLAN_MISSING` (severity warning) at close
    (`scripts/round-gate.mjs:81,404-416`).
15. The checklist grammar is fixed: `CHECKLIST_RE` at `scripts/surface-probe.mjs:262` requires
    `- [ ] <label> — \`<command>\` → exit <set> + \`<substring>\``; a malformed line is a
    `CHECKLIST_GRAMMAR` error.
16. `sources-check` treats a mined row's `used-by` naming a path absent on disk as an **error**
    (`USED_BY_MISSING`, `scripts/sources-check.mjs:312-317`), so a new source row must not name
    `corpus/lessons/round-42.md` before that file exists.
17. Committed-bytes re-derivation exercised: `git -C lane archive b237e3f09c9559e130c7367bd2efa981c4ea516f | tar -x -C $T`
    then `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json | jq -c '.terms | {A, C, operability, C2, C2_total, coverage}'`
    → `{"A":9,"C":17,"operability":8,"C2":92,"C2_total":93,"coverage":9}` — the archive form
    reproduces the worktree form byte for byte.

## 2. Per declared after-value: the one command over committed bytes, and how it can read differently

Let `M` be the round-42 measured commit and `PIN=/fast/scratch/hyaku/kumitate-pin/src`.
"Committed form" = `T=$(mktemp -d); git -C <lane> archive $M | tar -x -C "$T"; cd "$T"` first; the
lane's own habit (`checkout --detach $M`) is equivalent but weaker, because a dirty checkout also
passes.

| Declared after-value | One command | Could read differently at landing because |
|---|---|---|
| C1 `{"A":10,"C":19,"operability":9}` | `node scripts/proxy-check.mjs --src $PIN --json \| jq -c '.terms \| {A,C,operability}'` | `A` counts every `.mjs/.js/.sh/.py` in the tree, not just `scripts/`; one seat helper committed under another suffix (a `.sh` in `.ufo/waves/round-42/`) reads `A=11`. Two extra SKILL `- [ ]` lines (or one `- [x]`) read `C=20`. `operability` is `floor(10×(A+C)/(A+C+3))`, so it only reads 9 while A+C is exactly 29. |
| C1 `GATE_MUTANTS: CLEAN`, exit 0, 41 ids `killed` | `node scripts/gate-mutants.mjs; echo exit=$?` | Under the plan's own kill rule two cite ids (`suite-group-verdict`, `suite-any-fail`) are `survived` (fact 8) → `SURVIVED`, exit 1. Any literal edited after the manifest was frozen reads `nomatch` → exit 2 (not a kill). Three census literals are elided in the receipts (fact 9) and must be re-derived from the sha-pinned source, or they read `nomatch`. |
| C1 `--selftest` `VERDICT: PASS` | `node scripts/gate-mutants.mjs --selftest` | Hermetic only if it reads no `~/.kimi-code`, no `$PIN` and no `KUMITATE_*`; the two target selftests themselves are hermetic, so a PASS here says nothing about the 41-mutant run. |
| C1 able to fail: `--rev dfabe92…` exit 1 | `node scripts/gate-mutants.mjs --rev dfabe92bcec021f5beec457fb50cec484e047e35; echo exit=$?` | This only reads 1 with the two R41-3 skip-bypass mutants in the manifest, and those same mutants must be `killed` at `M` for CLEAN — so the demonstration and the clean verdict together make an R41-3 repair a prerequisite of C1. Without the extras, `--rev dfabe92` reads 0 (all 41 killed there). An older revision with surviving literals reads 2, not 1, because the census literals no longer occur. |
| C1 capabilities 2 → 3 | `git show $M:SCORECARD.md \| awk '/^## Capabilities/{f=1;next} /^## /{f=0} f && /^\| `/' \| wc -l` | Reads 3 only if the new row's first cell is backticked (`| \`gate-mutants\` |`); a row written as `| gate-mutants |` reads 2. The fleet closure used exactly this command in round 41. |
| C1 `## Axes` operability 8 → 9 | `git show $M:SCORECARD.md \| grep -E '^\| operability \| [0-9]+ \|'` | An unedited row reads 8 → `AXES_DRIFT`, exit 1. A row edited to 9 while `A`/`C` moved further (fact 2's `A` rule) drifts the other way. |
| C2 census CLEAN, exit 0, `strays=0`, members 53 | `node scripts/kimi-census.mjs; echo exit=$?` | Live host state: the member is a shape-only `dir`. If Kimi removes `~/.kimi-code/locks` before the run the member reads missing (`MEMBER_MISSING`) and the tree re-drifts; a new root child reads `UNLISTED`; declaring `locks` as `counted` instead of `dir` counts its live children (currently 1, so 53 would be coincidence, not correctness). The parenthetical moves with the host (`chain=8` today, not the receipts' `chain=7`). |
| C2 `{"K_members":53,"K_sections":53,"coverage_kimi":10}` | `node scripts/proxy-check.mjs --src $PIN --json \| jq -c '.terms \| {K_members,K_sections,coverage_kimi}'` | `K_members` comes from the proxy's **own** K rule table (fact 10), not from the census: edit the census only and this reads 52 (`K_MEMBERS_DRIFT`). The heading must sit in a `corpus/knowledge/kimi-*.md` note (`RE_KIMI_NOTE = /^kimi-.*\.md$/`, `:489`) and name the full path; a bare `locks` binds only if that basename is owned by one member. Without the heading, `K_sections` stays 52 and `coverage_kimi` derives `floor(10×52/53)=9` → `AXES_DRIFT` on a row that still declares 10. Committed half only: `git show $M:scripts/kimi-census.mjs \| grep -c "id: 'locks'"` and the same on `scripts/proxy-check.mjs` must both read 1. |
| C2 all proxy terms still MATCH | `node scripts/proxy-check.mjs --src $PIN; echo exit=$?` | Requires the open drift of fact 3 to be repaired first (see §3) and `C2`/`C2_total` to land together (see §4); otherwise the run reads `DRIFT` even with C1 and C2 correct. |

## 3. The open drift the plan does not name (R1)

`C2_TOTAL_DRIFT` (92 declared / 93 computed) plus `AXES_DRIFT` on the retired `coverage` row
(declared 10, derived 9) are present at both `dfabe92` and `b237e3f` and are recorded in
`.ufo/waves/round-42/open/receipts.txt`. C1's text promises "the proxy reads MATCH" at landing;
that is unreachable until `corpus/lessons/round-41-verifier-spotcheck.md` gets its
`corpus/README.md` row (the seven-round precedent in fact 4). The row restores `C2=93`,
`C2_total=93`, `coverage=10` and changes no live score, so it is a repair, not a claim — but it
must be sequenced before the MATCH is quoted, and the stanza must then read `C2=93`,
`C2_total=93`.

## 4. What the L1 must update in the stanza and around it, at landing

Stanza keys (`<!-- kumitate-proxy-v1 … -->`, one `key=value` per line; an unknown key is
`STANZA_KEY_UNKNOWN`, exit 2):

- `A=10` — only while the tree holds exactly ten runnable-suffixed files (nine today + `scripts/gate-mutants.mjs`).
- `C=19` — exactly two new `- [ ]` lines, both matching `CHECKLIST_RE` and both passing in the
  lane checkout. Shape them as the lane's pairs: `Gate-mutants verdict — \`node scripts/gate-mutants.mjs\` → exit 0 + \`GATE_MUTANTS: CLEAN\``
  and `Gate-mutants hermetic suite — \`node scripts/gate-mutants.mjs --selftest\` → exit 0 + \`VERDICT: PASS\``.
  The verdict item runs ≈64 s of selftest under a 120 s per-item cap (fact 7); on this loaded
  host that is the item most likely to read FAIL for a reason unrelated to the gate.
- `C2` and `C2_total` — must be equal at the measured commit. Sequence: `92/93` today →
  `93/93` after the round-41 spot-check row → `94/94` once `corpus/lessons/round-42.md` and its
  row land in the **same** commit (a lesson without a row re-creates the drift; a row without
  the lesson is `USED_BY_MISSING` territory, fact 16). Any additional knowledge note is +1 on
  both.
- `K_members=53`, `K_sections=53`, `coverage_kimi=10` (held) — only if C2 lands; if the Kimi
  source cannot be opened and C2 stops honestly, these keys must stay `52/52/10` and the round
  must not quote the C2 after-values.
- Pins: `pin.kimi-census` changes with the census edit; `pin.proxy-check` changes with the
  unavoidable `K_MEMBER_RULES` edit (fact 10) and with any R41-2 work, and must be re-derived
  **after** the last edit to the file, from the same bytes that land. If R41-3 repairs
  `scripts/cite-check.mjs`, `pin.cite-check` must be re-pinned and the mutant manifest rebuilt
  against the new bytes in the same commit (otherwise `PIN_DRIFT`, or `nomatch`).
- New `pin.*` keys only if R41-2 takes the extension path. Cost measured (fact 13): `PINS` +
  `FIXTURE_SCRIPTS` + ~12 hard-coded `pins=6 match` verdict lines + the "unchanged 23-key base
  stanza" case, and the round-34 correction records that such an extension was removed once
  before. After C1 the honest count to explain is **4** warnings, not the plan's 3.

`## Axes`: `| operability | 9 |` with an evidence cell that reads A=10, C=19,
`f_O` `29/32 ≈ 0.906` (the current cell's A=7/C=13/20/23 and "7 more" text is stale and already
named by the round-41 correction list). `| coverage:kimi-layer | 10 |` stays, its evidence text
moves `52/52` → `53/53`. `| coverage | 10 |` stays only with `C2 == C2_total`.

`## Capabilities`: new row `| \`gate-mutants\` | … | … | 42 |` (rows 2 → 3).

`## Move log`: one `| 42 |` row per claim (round-gate needs at least one
`^\|\s*42\s*\|` row; the lane's convention is one per claim), and per-axis verdicts keyed by
axis, not by claim (R41-4).

`## Planned`: add a round-43 candidate sentence, otherwise `SCORECARD_PLAN_MISSING` warns at
close (fact 14).

`LOG.md`: `- 2026-10-22 — round 42` line, and one commit message naming round 42
(`COMMIT_MISSING` is an error).

`## Saturation`: no integer edit is forced, but after C1 every live axis sits at or above the
declared line 9, and the section's "Live after round 34" inventory becomes stale; the nudge stays
inactive because a capability row enters (window restarts at 42).

## 5. Risk list (8)

1. **Open proxy drift not in the plan** — `C2_TOTAL_DRIFT 92/93` + `AXES_DRIFT coverage 10/9`
   already at `dfabe92`; the plan's "reads MATCH" needs the round-41 spot-check row first.
2. **Kill-rule contradiction** — two of the 16 frozen cite ids read exit 0 / `VERDICT: PASS`
   under the plan's own kill definition, so the gate would report `SURVIVED` (exit 1) at the
   measured commit.
3. **Census literals are not verbatim in the receipts** — 5 drop forms, 3 elided with `...`,
   3 unrendered; copying them yields `nomatch` (exit 2), which is not a kill.
4. **`C2`/`C2_total` coupling** — 93 today, 94 with the round-42 lesson, +1 per new note; the
   stanza must move in the same commit as each note, and `coverage` (retired row) derives from
   this ratio.
5. **K member set is implemented twice** — census (`MEMBERS`, `FROZEN.K3`, six selftest pins,
   fixture builder) and proxy (`K_MEMBER_RULES`); missing the proxy side reads `K_MEMBERS_DRIFT`,
   missing the census side reads `UNLISTED`; declaring `counted` instead of `dir` counts live
   children.
6. **Checklist item cost** — the full 41-mutant run is ≈64 s of selftest before copies and node
   startups, against the probe's 120 s per-item timeout, on a host running dozens of peer seats;
   a timeout reads FAIL. The bare-clone baseline is 13/17, so any checklist number must be
   quoted with its checkout.
7. **R41-2 pin extension cost and a stale target** — pinning gates requires `PINS`, the six
   fixture scripts, ~12 expected verdict lines and the 23-key parser case; the warning count to
   explain after C1 is 4, not 3.
8. **R41-3 is a prerequisite, not a follow-up** — the plan's "able to fail at `dfabe92`" run and
   its CLEAN run are the same two mutants at two revisions; C1 verifies only if the guard repair
   lands (or the demonstration is re-scoped, which the frozen id set cannot do).

## 6. Confidence and remaining unknowns

Observed (high confidence): the before-values, the open drift and its cause, the census state,
the checklist baselines, the timing figures, both K rule tables and their selftest pins, the
cite receipts' exit codes, the receipt elisions, the proxy's term definitions, the checklist
grammar and timeout, the sources `used-by` rule, and the archive-form re-derivation.

Inference (marked): a 41-mutant run of ≈64 s on an idle host becoming ≥120 s under the current
seat load; that the lane checkout read 16/17 while a bare clone reads 13/17 (from the two
fleet-path items and the round-41 spot-check's own note).

Unresolved: (a) whether a Kimi source openable by ordinary means names what creates `locks/` —
C2's sourcing precondition, not checked here; (b) whether R41-3 is being repaired in wave 2;
(c) whether `~/.kimi-code/locks` persists to the closure instant; (d) whether R41-2 will extend
the pin set or record the standing reason.
