# Round-61 verifier spot-check — non-author

author: hyaku closure (non-author integrator, @m_flash)

Lane `kumitate-shokunin`, round 61. The round started from
`330433777256a578e4bf32fea3460c87d3510588`, and the lane tip after the round is
`f351c520bfc4ce193a61145bdfecbcf1cb20db01`. `master` is at the same hash on
origin: `git ls-remote origin refs/heads/master` returned
`f351c520bfc4ce193a61145bdfecbcf1cb20db01`. The report
`.ufo/reports/round-61/kumitate.md` is fleet commit
`88b2c21ffbaadd274190b760972d315f8dd9743e`, authored by `kumitate-shokunin <kumitate@shokunin.local>`.

The round ran in two attempts. Attempt 1 ran the craft work and both waves,
then ended without landing anything past `be4a820c`. Attempt 2 landed attempt 1's
work and filed the report.

Driver digest, copied from `.ufo/watchdog.log`:

```
2026-10-25T06:30:24-03:00 launch kumitate round=61 pgid=2141986 driver=hyaku-inline attempt=1
2026-10-25T08:26:13-03:00 lane-dead-no-report kumitate round=61; retry same round (hyaku-inline attempt=1: run-6: L1 returned twice (1h54m + resume) without landing; last lane commit be4a820c, later work uncommitted, no report)
2026-10-25T08:26:15-03:00 launch kumitate round=61 pgid=4018117 driver=hyaku-inline attempt=2
2026-10-25T08:32:52-03:00 complete kumitate round=61; hyaku-inline attempt=2
```

I authored nothing in this round. My only writes are this file and the closure
entry. I ran no jj command in the lane except through `jj-lane.sh`. I did not
execute either frozen probe (`dispatch61-probe.mjs`, `doctrine61-probe.mjs`) or
any other lane gate. Each claim and falsifier below is re-derived from committed
bytes (or from the critics' `/tmp` fixture repos) with git, rg, awk, and a
one-line `node -e` regex test. Where I say "evidence-verified", I read a receipt
the report cites and did not re-measure it.

## 1. Step-1 conformance

| check | command | observed | verdict |
|---|---|---|---|
| report committed by the lane identity | `git log --format='%an %H' -- .ufo/reports/round-61/kumitate.md` | `kumitate-shokunin 88b2c21f…` | pass |
| `SHONEN` heading, one line per box | report §SHONEN vs `rg -c '^- \[' SHONEN.md` | heading present; 4 lines (all `[~]`) for 4 boxes | pass |
| every cited lane commit exists and is an ancestor of `master` | `git rev-parse --verify <h>^{commit}`; `git merge-base --is-ancestor <h> master` | `c2721f81`, `48877b4d`, `be4a820c`, `15084153`, `019a844c`, `f351c520` exist and are ancestors; the range `3304337..f351c52` also holds `165b8304` (round-60 close landing). All carry author and committer `kumitate-shokunin` | pass |
| fixture revs cited as falsifier evidence | same | `ab902da2fa30…` (C1 fabrication) and `4247d2d` (C2 forgery) do **not** resolve in the lane repo. They exist only in `/tmp/kumitate-r61/CritControlC1/a4-full-fabrication`, `/tmp/kumitate-r61/CritControlC2/…`, and `/tmp/kumitate-r61-a2/fleet/…` | **defect** (R61-V1) |
| no uncommitted round work, pushed | `jj-lane.sh state …`; `git status --porcelain` | `ahead=0 behind=0 tracked=0 untracked=0`; porcelain empty | pass |
| report filed after its commits | `git log -1 --format=%ci` | lane tip `08:30:40-03:00`; report `08:32:38-03:00` | pass |
| prompt carries the template contract | marker counts in `.ufo/prompts/kumitate-round-61.md` vs `templates/round-prompt.md` | §2 claims (1–3, one axis each), §2b frontier step, §3 L2 floor, §4 report contract (SHONEN, Sources & frontier, Trend verdicts), and the L0 channel are all present, plus hyaku addendum §6. §3 quotes no route map; it defers to the host route table, which is consistent with `MISSION.md` (no per-lane route field) | pass |
| report sections in template order | report read | Work performed · Landed changes · Before → after measurements · Sources & frontier · Trend verdicts · SHONEN | pass |

The report is a real report, not a marker. It cites three landed commits with
content (`15084153`, `019a844c`, `f351c520`). Status: **ok**.

## 2. Claims re-check (re-measured at `f351c520` / `019a844c`; probes not executed)

Neither claim is exploratory, so neither needs an `unprovable-but-better`
ruling from me.

### C1 — operability, capability acquisition `dispatch-evidence` (`DISPATCH61_HELD`, P1..P4)

Reported values: before, the gate reads `FAIL-CLOSED wave-dir-absent`; after
(`019a844c`), `held=2/4`; the fabrication fixture reads `HELD 4/4`.

My re-derivation from the probe source and the committed bytes:

- **P3** (the capabilities row names round 61). I ran
  `git show f351c520:SCORECARD.md | awk` over `## Capabilities` for the
  `dispatch-evidence` row: it is line 1794, and it contains no "round 61"
  (`NO round 61`; last cell `| 60 |`). **MISS**, which matches the report.
- **P4** (`close/dispatch61-tip.txt` exists).
  `git ls-tree -r --name-only f351c520 -- .ufo/waves/round-61/close/ | rg -c dispatch61-tip`
  returned 0. **MISS**, which matches.
- **P2 inputs.** At `f351c520` there are 32 `w1/*.md` reports, and
  `launcher-progress.tsv` plus `dispatch-actual.json` are both present. The w1
  progress file has 32 lines, all `exit=0`. The CLEAN gate verdict itself is
  evidence-verified from `close/a2-tip-dispatch61.txt` (`P2 PASS gate=0 clean=true reports=32`).
- **P1** (selftest 8/8) is evidence-verified from the same receipt.

Total: 2/4, which agrees with the report.

**Falsifier, confirmed by me.** `git -C /tmp/kumitate-r61/CritControlC1/a4-full-fabrication log -1 ab902da2`
shows a single commit, `control fixture`. Its `w1/launcher-progress.tsv` rows
have the form `Seat01 pid=1001 … exit=0 start=1 end=2`, and every seat report is
a 28-byte `# SeatNN\n\nfabricated report`. Every P-check is fabricable from
that tree:

- P1 runs a selftest that never reads the wave.
- P2 counts `.md` files (≥32) and runs the gate over the same hand-written progress file.
- P3 is a substring match for `round 61` in one table row.
- P4 reads a worktree file (`readFileSync(join(lane,…))`), not the revision.

A no-seat record can therefore reach 4/4, as `close/a2-repro-c1-fabrication.txt`
records. **C1 fails as declared → operability `unchanged`** (integer 9 at
SCORECARD line 337; no capability row added for round 61).

### C2 — coverage frontier band 4 on S195 (`DOCTRINE61_HELD`, E1..E6)

Reported values: before, entry absent and 133 rows; after (`019a844c`),
`held=3/6` (E3 `row-absent`, E4 `pin=`, E5 `exit=2`); the forged commit reads
`HELD 6/6`.

My re-derivation:

- **The S195 row is in `## Registry`** at SOURCES.md line 147, with NF=13 (an
  11-cell contract row).
- **The probe's E3 regex cannot match it.** I ran the probe's literal regex over
  the committed row with `node -e`:
  `/^\|[[:space:]]*S195[[:space:]]*\|/.test(row)` → `false`, while
  `/^\|\s*S195\s*\|/` → `true`. JavaScript has no POSIX classes, so
  `[[:space:]]` is the set `{[,:,s,p,a,c,e}` followed by a literal `]`.
- **The probe's cell indices are wrong.** Splitting the row on `|`, cells 8, 9
  and 11 hold `mined`, `2026-10-25`, and the entry path. The probe reads
  c[9], c[10] and c[12], which hold `2026-10-25`, `90d` and `""`. The census
  enforces `NF!=13 → E01` (`sources-census.sh:635`), so no Registry row can
  satisfy E3.
- **E4/E5 read the worktree** (`readFileSync`, and the census over `--root`),
  not the revision.

E1, E2 and E6 hold, so 3/6 agrees with the report. The E5 `exit=2` at the tip
receipt is evidence-verified only. The census I ran over the fleet root exits 0
(below), so that miss is the probe's worktree read at receipt time, not
registry damage.

**Forgery, confirmed by me.**
`git -C /tmp/kumitate-r61-a2/fleet/kumitate-shokunin log -1 4247d2d` shows
`critic A5 forgery`, a child of `be4a820c`. In that commit, S195 appears only
at SOURCES.md line 273, under `## Leads (unopened)`, as
`|:S195:| … phantom | shim | mined | …`. The `:` falls in the misparsed class,
so E3 matches a row outside the registry. The capture `body.md` is one forged
line (sha `15841c50…`, not the real `8ef2ee5f…`). **C2 fails as declared →
coverage `unchanged`** (retired aggregate stays 10).

The landed S195 work stands on its own as frontier work. See §4 and §5.

### Owned-axis harm check

`git diff 3304337 f351c52 -- SCORECARD.md` changes these sections:

- one in-place line, 1794 (in `165b830`; see R61-V3);
- an appended round-60 section;
- the appended `## Round 61 correction`;
- the appended `## Round 61 — claims, verdicts, limits`.

The axis table (lines 337–338) is untouched: operability 9, coverage 10. No
entry was weakened. The census exits 0 (six W04 warnings, unchanged), and
`readme-map` inputs balance (148 files under `corpus/knowledge` +
`corpus/lessons`; 148 map rows). **No axis harmed.**

### R60 repairs — graded as landed work

| routed defect | repair at `f351c520` | grade |
|---|---|---|
| R60-V1 uncommitted round work | landed in `165b830`; lane porcelain now empty | repaired |
| R60-V2 placeholders | SCORECARD `__MEASURED__` at 2833/2847 superseded by an appended correction naming `a745a3b0` and both receipts. The R60 fleet report still has 6 `__MEASURED__/__TIP__/__COMMITS__` hits and no fleet-side erratum | partial (R61-V4) |
| R60-V3 9/10 vs 8/10 overclaim | the correction withdraws the 10/10 sentence; `dispatch60-tip.txt` reads `held=8/10 … rev=a745a3b0` exit 1 | repaired |
| R60-V4 nonexistent tip receipts | `.ufo/waves/round-60/close/dispatch60-tip.txt` and `doctrine60-tip.txt` now committed (absent at `a745a3b0`, present at tip); doctrine60 reads `HELD 6/6 rev=a745a3b0` | repaired |
| R60-V5 registry not in gate schema | R60 `w1/dispatch-actual.json` is still absent. It was fixed forward: R61 w1 ships `dispatch-actual.json` and `scripts/make-dispatch-actual.mjs` | forward-fixed (tool unpinned, R61-V5) |
| R60-V6 dead seats unreported | `.ufo/waves/round-60/close/dead-seats-r60.md`: `exit=0` 5, `exit=-9` 27, 420 s `SEAT_TIMEOUT` kill | repaired |
| R60-V7 LOG tie | LOG.md line 2259 round-60 entry committed | repaired |
| R60-V8 map drift | `round-60-verifier-spotcheck.md` has its README row and `covered` pin; the proxy stanza is still 105/145 vs computed 115/148 | partial (R61-V5) |
| R60-V9 wrong reject id | the R61 Gate reject cites package S204/S211 and lane S134 for arXiv 2609.29095 | repaired |

## 3. Discernment spot-check (non-author)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S195 / `temporal-worker-versioning-pinning.md` | admit | `curl -fsSL https://docs.temporal.io/worker-versioning.md` → HTTP 200, 9645 bytes, sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` | **agree** | Byte-identical to the pinned capture (`build/ScoutSourceWorkerVersioning/body.md`, same sha). The quote "A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version." is at line 39 of both (13 words ≤ 25). The entry's inheritance claims match the page ("Auto-upgrade Workflows never inherit versions", l.94; Cron, l.90/139). It scopes the unstated top-level retry case as UNKNOWN rather than over-generalizing. |
| `exactly-once-attribution.md` | reject | `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/exactly-once-attribution.md` (`source: S211 — https://arxiv.org/abs/2609.29095`); `merge/kumitate/SOURCES.append.md` l.16 (S204) and l.23 (S211); lane S134 at `f351c520` | **agree** | All three ids name the same arXiv 2609.29095 paper that lane S134 already holds. Adopting the entry would put one document under two ids and import a measured result not re-opened this round. The duplicate-document reason is correct and the flip condition is concrete. |

The new SOURCES row I re-opened is S195. Its anchor (`§ Versioning behaviors →
§ Pinned Workflows`) and its 13-word quote are located verbatim at line 39 of
the live page.

Census, run by me:
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
→ `kumitate ok …/corpus/SOURCES.md`, exit 0, with six W04 duplicate-URL
warnings (S034, S068, S084, S095, S123, S126). The tier tally at `f351c520`
(awk over `## Registry`) is 134 rows, A=111 B=15 C=8. At base `c2721f81` it is
133 rows, A=110 B=15 C=8, which matches the report.

The four new `## Mistakes` rows and QUALITY Q52–Q57 each cite a lesson
(`round-60-verifier-spotcheck.md` lines, or `round-61.md` §Mistakes). No
criterion is ungrounded.

## 4. Trend verdicts

- **expansion: improved.** One net-new admitted entry on band-4 frontier ground
  (`coverage-map:` names the PROVINCE §Frontier band). Its `source:` cites S195,
  a `mined` A-tier row, and the registry grew 133 → 134 with census exit 0. The
  admit spot-check agrees. This rests on the census and the re-opened source,
  not on D61.
- **quality: unchanged.** No admitted entry was re-verified, deepened or
  superseded. The proxy reads DRIFT before and after (A 105→115 computed, C2
  145→148). The R60 corrections fix ledger statements, not corpus entries.
  Nothing was found false and left unmarked.
- **discernment: improved.** The non-author spot-check agrees with the gate on
  both the admit and the reject. The round's mined mistakes became grounded
  criteria (Q56, Q57), each citing `round-61.md` §Mistakes.

## 5. Verdict

Status **ok**; **not admitted** (`rejected-honest-stop`). Both declared claims
fail as declared, and I reproduced both falsifiers from bytes. No axis was
harmed:

- operability: `unchanged`
- coverage: `unchanged`

SHONEN note for the operator (promotion is operator-owned): box 2
(end-to-end task logged) and box 3 (executable without oral context) now look
checkable by a non-author. Box 2 can be checked against LOG.md's round-61 entry
plus the committed w1/w2 records; box 3 against the committed `close/a2-*`
receipts and `probe/counters.sh`. I check none of them here.

## 6. Routed defects (lane fixes next round)

- **R61-V1 — falsifier fixtures live only in tmpfs.** `ab902da2…` and `4247d2d`
  are cited as evidence, but they resolve only under `/tmp/kumitate-r61*`, which
  is not closure-durable (§Evidence standard). Commit a `git bundle` of each
  fixture under `.ufo/waves/round-61/controls/`, or a reproducible build script,
  and cite the bundled hash.
- **R61-V2 — frozen counters admit fabrication and reject honest work.** This is
  carried as Q57. The next frozen v2 must:
  - read revision bytes only (`git show <rev>:…`, never `readFileSync` of the worktree);
  - use `\s` (not POSIX classes) and the 11-cell contract indices (8/9/11), scoped to `## Registry`;
  - bind P2 to evidence the lane cannot author (session ids resolvable in `history://`, or stream files);
  - ship positive and negative controls committed with expected verdicts.
- **R61-V3 — in-place edits to filed bytes in `165b830`.** Two filed artifacts
  were edited in place:
  - `corpus/lessons/round-60.md` "Before" A=102 → A=104. The new value is
    correct (`ffbfe3cc` tallies A=104), but the change is a rewrite, not an
    appended correction.
  - The SCORECARD capabilities row 1794 gained `first working round 60` after
    the R60 closure ruled C1 unprovable.

  Append a named correction for both. Note in the row's appendix that the
  capability is not admitted. Do not rewrite again (the lane's own Q52 limit).
- **R61-V4 — R60 fleet-report placeholders.**
  `.ufo/reports/round-60/kumitate.md` still carries 6
  `__MEASURED__/__TIP__/__COMMITS__` tokens. File an erratum in the next lane
  report that names `a745a3b0` / `be4a820c` / `165b830` for each token.
- **R61-V5 — proxy DRIFT and an unpinned tool.** Refresh the
  `kumitate-proxy-v1` stanza to A=115, C2=148, C2_total=148 in place (single
  stanza), and add `pin.make-dispatch-actual` for `scripts/make-dispatch-actual.mjs`.
  Run this in the same change as this file's README row and its `covered` pin,
  or `readme-map` opens in DRIFT again (seventh recurrence of the R56-V3 class).
- **R61-V6 — dead seat `Audit19`.** Its attack item stayed unattacked
  (`provider rejected task prompt as invalid_prompt`). Re-queue it in the next
  round's falsify wave.
