RESULT ScribeLessonDraft rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=drafted mistakes=2

# ScribeLessonDraft — draft of `corpus/lessons/round-42.md`

Item: draft the round-42 lesson in the shape of `corpus/lessons/round-41.md` (header, Claims,
`## Gate`, `## Mistakes`, `## Open limits`), mining R41-7 and R41-5, numbers left `<pending>` where
the round has not measured them. Text only: nothing was written into `corpus/lessons/`. Lane files
were read, never written. No tool installs or updates by this seat (nothing needed; node, jq and
git were present).

Revision note: the assignment fixes this wave's lane revision at `b237e3f09c9559e130c7367bd2efa981c4ea516f`
(the plan commit). The plan gained amendments A1–A4 in `a0a07bae9236311314f12e3cec8d3666049d0dbc`
(17:01:18 -0300, "before any counted run"), so the draft reads `plan.md` at `a0a07ba` and says so.
`git diff --stat b237e3f a0a07ba` touches only `.ufo/waves/round-42/plan.md`, `SCORECARD.md` and
`corpus/README.md`; no `scripts/` file.

## Measurements this draft rests on

All runs were in my own clone `/fast/scratch/hyaku/kumitate-r42/seats/ScribeLessonDraft/lane`
(`git clone --no-hardlinks` of the lane repo, detached at the named commits, `GIT_DIR`,
`GIT_WORK_TREE` and `GIT_INDEX_FILE` unset), never in the lane.

1. R41-7 mismatch, digest arithmetic:

```
$ git -C <clone> show <rev>:scripts/wave-census.mjs | sha256sum     # revs fae386aa 57269a55 fb7046ca b237e3f0
fae386aa 3a32dd345f9a9f52290f608b9d98fe5a1583026bba45c3997f7e489796e37ee4
57269a55 617c9cc4ef29c7dad28de033b961e9e67bb0210c881dc65629813d2ae4c40fca
fb7046ca d6068d1b213064a4ff69f3489b4261e9fe37911ec4aa0e49a300d06c0ac17204
b237e3f0 d6068d1b213064a4ff69f3489b4261e9fe37911ec4aa0e49a300d06c0ac17204
```

The receipt header under test (`.ufo/waves/round-41/final/a2-census-repair-mutants.txt:2`) reads
"lane working copy over master fae386aa (scripts/wave-census.mjs sha256 d6068d1b213064a4…c17204)":
the digest is right (it is `fb7046ca`'s, hence `b237e3f`'s, bytes) and the revision label is stale.

2. The six frozen ids the plan body's narrow kill rule cannot call `killed` (plan A1 list), measured
   on `b237e3f`'s own bytes, each mutant in a temp copy of `scripts/`, env scrubbed of `KUMITATE_*`,
   own process group, 20 s timeout, killed by group, 0 leftovers after:

```
suite-group-verdict  exit=0 VERDICT: PASS fail_lines=2 73/75 cases passed (hermetic)
suite-any-fail       exit=0 VERDICT: PASS fail_lines=2 73/75 cases passed (hermetic)
suite-exit-text      exit=0 VERDICT: FAIL fail_lines=1 74/75 cases passed (hermetic)
M19-selftest-exit-const exit=0 VERDICT: FAIL 25/26 pass (failing=WC24)
V382-pass-count      exit=0 VERDICT: PASS 26/26 pass (failing=WC24)
V387-exit-const      exit=0 VERDICT: FAIL 25/26 pass (failing=WC24)
```

   The round-41 probe at the same revision prints the set at 16/16 under its own broader rule
   (`node --input-type=module - --lane <clone> --rev b237e3f… < .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`):

```
CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=b237e3f09c9559e130c7367bd2efa981c4ea516f
```

   `V385-verdict-const` (the plan's hedge "`V385`/`V387`") exits 1 in its receipt
   (`a2-census-survivor-mutants.txt`: `killed exit=1 … VERDICT: PASS failing=WC24`), so it is a kill
   under either rule; the exit-0 census three are `M19`, `V382`, `V387`.

3. Frozen-set width, from the four receipts: 25 rows, 24 distinct mutation texts
   (`M19-selftest-exit-const` and `V387-exit-const` are both `` `return pass === results.length ? 0 : 1` -> `return 0` ``).
   Eight of the 25 rows are recorded as prose, not a from→to pair: `F-M07`, `F-M08`, `F-M11`,
   `M12-known-roles-arm`, `M13-attack-arm` (each names a fragment to drop), `F-M20`, `F-M22`,
   `read-error-rethrown` (behaviour only).

4. Proxy baseline after the amendment's base repair (A3), run in my clone:

```
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src
PROXY: MATCH (A=9 C=17 operability=8; C1=19/19 C2=93/93 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict
PROXY  warn  PIN_UNPINNED  scripts/anchor-truth.mjs …
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs …
PROXY  warn  PIN_UNPINNED  scripts/wave-census.mjs …
PROXY: DRIFT (PIN_UNPINNED term=scripts/anchor-truth.mjs; … scripts/sources-check.mjs; … scripts/wave-census.mjs; src-rev=31c465f15669)
exit=1
{"A":9,"C":17,"operability":8,"C2":93,"C2_total":93,"coverage":10,"K_members":52,"K_sections":52,"coverage_kimi":10}
```

   `C2_TOTAL_DRIFT` and `AXES_DRIFT coverage` seen at open are gone (A3); only warnings remain.

5. Wave 1 shape, read from the lane's uncommitted dispatch files:
   `.ufo/waves/round-42/build-spec.json` → 37 items (`connector=1 critic=5 executor=7 mutation-tester=3
   revenger=1 reviewer=6 scout=7 scribe=5 sentinel=1 simplifier=1`);
   `.ufo/waves/round-42/evidence-seat-gate.txt:1` → "dispatched 2026-10-22T19:55Z wave
   kumitate-r42-build 37 seats; slot granted live=42 pending=35 cap=128".

Note, observed once at the end of this seat (not my work, not acted on, no conclusion drawn): three
live `cite-check --selftest` processes under another seat's scratch directory
(`/fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane/.exec-cite-tmp/kumitate-cite-mutants-x60BXo/scripts/cite-check.mjs`,
one of them re-entering with `--self`). This seat's own mutant runs left none (`pgrep -f kumitate-cite-mutants`
returned `(none)` immediately after each run and `pgrep -f r42probe` after the wave-census runs).

Not run, deliberately: `scripts/kimi-census.mjs` (its "before" values were measured by the L1 at
19:52:15Z and are in `.ufo/waves/round-42/open/receipts.txt`; re-running would also hash host
credential files, which the seat contract forbids); no lane gate was run in the lane repo.

---

# Draft — `corpus/lessons/round-42.md`

# Round 42 — a mutation gate over the lane's own gates; a Kimi lock directory becomes a declared member

Source: the round-41 non-author closure (`corpus/lessons/round-41-verifier-spotcheck.md`, routed
defects R41-1 to R41-7), the corpus rows this round opens (`<pending>`; the plan requires one on
mutation testing as a standing gate and one naming what creates `~/.kimi-code/locks`), the mutant
vocabulary the corpus already records (`corpus/SOURCES.md` S034: killed = a test failed while the
mutant was active; survived = all passed; a runtime error is not a kill), and the pinned upstream
revision 31c465f15669f744848bd9f5d56191c5085670f7. Round open: lane `master` =
dfabe92bcec021f5beec457fb50cec484e047e35 (receipts `.ufo/waves/round-42/open/receipts.txt`,
19:52:15Z). Plan and frozen counters: `.ufo/waves/round-42/plan.md` (commit b237e3f0), amended
before any counted run in a0a07ba (A1 kill rule, A2 C2 counter, A3 base repair, A4 pins).

## Claims

- **C1 operability (claim type: capability acquisition `gate-mutants`).** New lane instrument
  `scripts/gate-mutants.mjs` (contract `kumitate-gate-mutants-v1`) runs a frozen, embedded manifest
  of single-literal mutants against lane gates. For each mutant it copies the measured revision's
  `scripts/` into a temp dir (the selftests import siblings), applies the mutant (the `from` literal
  must occur exactly once, else `nomatch`), and runs that copy's `--selftest` with every `KUMITATE_*`
  variable scrubbed, in its own process group, with a per-mutant timeout of 60 s and cleanup by
  group. One line per mutant, `MUTANT <target>:<id> killed|survived|nomatch|crash|timeout`; a crash
  or a timeout is not a kill. Header line
  `GATE_MUTANTS_HEADER rev=<commit|working-copy> <target>=<sha256 of the bytes mutated>` (R41-7).
  Verdict `GATE_MUTANTS: CLEAN (...)` exit 0; any survivor `GATE_MUTANTS: SURVIVED (...)` exit 1;
  nomatch, crash, timeout or a failing control exit 2; usage exit 64. `--rev <commit>` measures a
  committed revision's `scripts/`; `--selftest` is hermetic.
  Frozen set, 41 ids: the 16 cite-check ids of `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`
  (`warn-total`, `resolved-kind-gate`, `strict-conjunct`, `strict-warn-arm`, `resolved>0`,
  `citeCheck-map`, `render-env-empty`, `render-env-zero`, `exit2-empty`, `exit2-zerores`,
  `exit0/1-map`, `parse-64`, `suite-group-verdict`, `suite-any-fail`, `suite-exit-json`,
  `suite-exit-text`) plus the 25 wave-census ids of `.ufo/waves/round-41/final/a2-census-*-mutants.txt`
  (repair 3: `dotdot-guard-dropped`, `string-agent-check-dropped`, `read-error-rethrown`; survivor 10:
  `M10-unknown-wave-zero`, `M02-wave-grammar-hyphen`, `M03-empty-count`, `M04-empty-round`,
  `M12-known-roles-arm`, `M13-attack-arm`, `V194-check-ok-true`, `V382-pass-count`,
  `V385-verdict-const`, `V387-exit-const`; findings 10: `F-M02`, `F-M03`, `F-M07`, `F-M08`, `F-M11`,
  `F-M19`, `F-M20`, `F-M21`, `F-M22`, `F-M23`; exits 2: `M22-name-half-dropped`,
  `M19-selftest-exit-const`). Kill rule (plan A1, superseding the plan body's "killed = exit non-zero
  with a `VERDICT: FAIL` line"): KILLED = a parseable suite summary and (exit != 0 or any `FAIL `
  case line or `VERDICT: FAIL` or passed < total); CRASH = no parseable summary; TIMEOUT apart; DRIFT
  = PASS with a total different from the control's.
  Before, at dfabe92: `{"A":9,"C":17,"operability":8}` (open receipts). At the amendment base a0a07ba:
  `PROXY: MATCH (A=9 C=17 operability=8; C1=19/19 C2=93/93 coverage=10; S=88/88; R=92/92; K=52/52;
  pins=6 match)`. After at the measured commit: `<pending>` (target `{"A":10,"C":19,"operability":9}`,
  `GATE_MUTANTS: CLEAN` exit 0 with `frozen=41/41` killed, `--selftest` `VERDICT: PASS`,
  `--rev dfabe92b…` exit 1 on the R41-3 mutants that survive at open bytes), capability rows 2 → 3.
  Manifest ids beyond the 41: `<pending>`, each named here. Sourced: `<pending>`.
- **C2 coverage:kimi-layer.** The host root child `~/.kimi-code/locks` (a directory, mode 700, born
  2026-10-22 13:53:33 -0300, one child) stops being live drift and becomes a declared, source-backed
  member. Plan A2: a presence-only directory in K3, the session-state plane (the round-41
  pre-registration said K1 — a recorded deviation), added to both hand-kept lists
  (`scripts/kimi-census.mjs` and `scripts/proxy-check.mjs` `K_MEMBER_RULES`). Before, at dfabe92:
  `KIMI_CENSUS: DRIFT (UNLISTED locks)` exit 1, `ROOT_ENUM … root children=35 declared=26 chain=8
  strays=1`, `TOTALS: members=52 checked=52 errors=1`; proxy `{"K_members":52,"K_sections":52,
  "coverage_kimi":10}`. After at the measured commit: `<pending>` (target `KIMI_CENSUS: CLEAN` exit 0,
  `strays=0`, `declared=27`, `K_members` 53, `K_sections` 53, `coverage_kimi` 10 held —
  `coverage_kimi = floor(10 × C1k/C1k_total × K_sections/K_members)`, `scripts/proxy-check.mjs:158`),
  `node scripts/sources-check.mjs` CLEAN over the new knowledge section, and an identity receipt
  (inode, birth time, layout names and kinds) committed with the measurement. Sourced: `<pending>`;
  if no source can be opened by ordinary means, C2 stops honestly and no member is declared.
- **Axis accounting.** The two claims sit on distinct axes (operability, coverage:kimi-layer) and
  touch disjoint gate files (C1: `scripts/gate-mutants.mjs`, two SKILL checklist items, one registry
  row; C2: `scripts/kimi-census.mjs`, `scripts/proxy-check.mjs` `K_MEMBER_RULES`, one knowledge
  section), so they count as two claims, unlike round 41's one (AXES.md). Shared only: SCORECARD
  stanza terms, edited per key. Per-axis verdicts are keyed by axis, not by claim (R41-4):
  `<pending>`.

## Round shape (filled from the report's own section at close)

- Waves: wave 1 build 37 seats (executor 7, scout 7, reviewer 6, scribe 5, critic 5, mutation-tester
  3, connector 1, sentinel 1, revenger 1, simplifier 1), dispatched 2026-10-22T19:55Z, `live=42
  cap=128` (`.ufo/waves/round-42/build-spec.json`, `evidence-seat-gate.txt:1`); wave 2 `<pending>`.
- §3 floor inside wave 1: `<pending>`.
- Deviations: `<pending>`, each named for the judge. The round-41 undisclosed class — a wave
  dispatched although its predecessor never dispatched — is named here with its cause if it recurs.

## Gate — admits and rejects

No gate decision had been recorded when this draft was written (wave 1 build). Each row states the
decision the round owes; a row is filled only from a source actually opened.

| item | decision owed | what fills it |
|---|---|---|
| C1 source | admit one new `corpus/SOURCES.md` row, tier `<pending>`, on mutation testing as a standing gate (next free id; S038 is the highest at b237e3f) | located quote ≤ 25 words, file digest, `used-by` → `scripts/gate-mutants.mjs`, `corpus/lessons/round-42.md` — `<pending>` |
| C2 source | admit one row naming what creates `~/.kimi-code/locks` (Kimi Code docs, or own-work on the installed binary) | located quote ≤ 25 words; if none opens, C2 stops and no row is written — `<pending>` |
| re-open | `<pending>`; the mutation rows already in the corpus (S034, S036, S037) are the natural re-read | status old → new and `used-by` delta — `<pending>` |
| **reject** | at least one same-round reject with its reason, so an outside check can sample it (R41-1) | the candidate opened and refused, with the URL or quote that failed — `<pending>`. If the round records no reject, that is itself the R41-1 defect and belongs in `## Mistakes` |

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| stale receipt label — a receipt header named a revision whose bytes were not the bytes measured (R41-7) | `.ufo/waves/round-41/final/a2-census-repair-mutants.txt:2`: "lane working copy over master fae386aa (scripts/wave-census.mjs sha256 d6068d1b213064a4…c17204)". The same file hashes `3a32dd345f9a9f52…796e37ee4` at fae386aa and `d6068d1b213064a4…6c0ac17204` at fb7046ca and at b237e3f, so the digest names the mutated bytes and only the revision label is stale; the closure notes the receipts "ran on the working copy before 57269a55/fb7046ca landed" | the round-41 non-author closure, by comparing `git show fb7046ca:scripts/wave-census.mjs \| sha256sum` with the header (R41-7); no instrument | the header names the digest of the bytes actually mutated (`GATE_MUTANTS_HEADER rev=<commit\|working-copy> <target>=<sha256 of the bytes mutated>`, plan C1) and the gate's `--selftest` carries a fixture where the header digest must equal the sha256 of the mutated bytes; shown able to fail: `<pending>` until `node scripts/gate-mutants.mjs --selftest` reports it (`.ufo/waves/round-42/build/ExecGateMutants.md`) |
| undisclosed round shape — a falsify wave was dispatched although its build wave never dispatched, and the report did not name it (R41-5) | `.ufo/reports/round-41/kumitate.md:189-200` records the 34-seat build payload as "validated, never dispatched" and then the falsify wave "granted 17:13:34Z" without stating the out-of-order dispatch; the closure's routed defects table names it "falsify wave dispatched although the build wave never dispatched (undisclosed in the report)" against prompt §6 ("dispatched after wave 1 returns") | attempt-1 falsify seat CritReportShape (noted it), routed as R41-5 by the round-41 closure | the report's `## Round shape` names every deviation, including a wave dispatched without its predecessor. For round 42: `<pending>` — one sentence per deviation, each wave's spawned count, and `wave-census --round 42` payload counts. No instrument forces the prose: `wave-census` can prove `reports=0/N` for a payload but cannot tell never-dispatched from dead-at-spawn |

## Open limits (measured, not fixed)

- **A1 verifies the kill-rule correction, and its list has one loose name.** The plan body's sentence
  ("killed = exit non-zero with a `VERDICT: FAIL` line") cannot kill six of the 41 frozen ids at
  b237e3f, all with exit 0: cite-check `suite-group-verdict` (`VERDICT: PASS`, 73/75),
  `suite-any-fail` (`VERDICT: PASS`, 73/75), `suite-exit-text` (`VERDICT: FAIL`, 74/75); wave-census
  `M19-selftest-exit-const` (`VERDICT: FAIL`, 25/26), `V382-pass-count` (`VERDICT: PASS`, 26/26),
  `V387-exit-const` (`VERDICT: FAIL`, 25/26). A1 adopts the round-41 rule
  (`.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt:54`) and names the same six, writing them
  as "`V385`/`V387`"; `V385-verdict-const` exits 1 in its receipt, so the exit-0 census three are
  `M19`, `V382`, `V387`. The round-41 receipt's `survived=0/16` stands only under the broad rule;
  three of those 16 kills are exit-0.
- **Frozen-set width.** The 25 wave-census ids hold 24 distinct mutations: `M19-selftest-exit-const`
  and `V387-exit-const` both are `` `return pass === results.length ? 0 : 1` -> `return 0` ``. Eight of
  the 25 are recorded as prose rather than a from→to pair (`F-M07`, `F-M08`, `F-M11`,
  `M12-known-roles-arm`, `M13-attack-arm` name a fragment to drop; `F-M20`, `F-M22`,
  `read-error-rethrown` describe behaviour), so "same literals" is not fully determined by the
  receipts for those eight; the manifest's chosen literal is `<pending>`.
- **Proxy baseline after the base repair.** At a0a07ba `--strict` exits 1 on three `PIN_UNPINNED`
  warnings (anchor-truth, sources-check, wave-census); the non-strict run reads `PROXY: MATCH (A=9
  C=17 operability=8; C2=93/93 coverage=10; …)`. A4 targets zero warnings including
  `scripts/gate-mutants.mjs` through a lane-owned `kumitate-gate-pins-v1` block: `<pending>`. The
  open drift (`C2_total declared=92 computed=93`, `coverage` 10 vs 9) is repaired by A3, not a claim.
- **Kimi `locks` live state and provenance.** At open: a directory, mode 700, born 2026-10-22
  13:53:33 -0300, one child; root enumeration `children=35 declared=26 chain=8 strays=1`. Round-41
  scout, shape only: Kimi 2.3.0 self-updated at 16:48:04Z and its session lock service creates
  `locks/sessions`; upstream feature, not a stray. A new unlisted root child appearing before the C2
  measurement is named, never silently declared: `<pending>`.
- **Carried from round 41, disposition `<pending>` (R41-6).** R40-2 honest-edit re-measure at the AT46
  gate; R40-4 anchor-truth resource caps; the 12 attempt-1 census findings and the 5 report-presence
  gaps; the `wave-census` sentinel findings (no `realpath` confinement, FIFO, no size caps, trailer
  anchoring). R41-3 guard red-before cases (F1 outer-literal recursion, F2 two skip-bypass mutants)
  and its cost: the open measurement is 844 / 857 / 838 ms for `cite-check --selftest` (three runs);
  after `<pending>`.
- **Instrument limits that survive its own measurement.** `--rev` reads a committed revision's
  `scripts/` through git, so a literal absent at that revision is `nomatch` (neither kill nor
  survivor); a timeout is not a kill; the manifest is frozen inside the script, so adding an id is a
  code edit; default `--jobs 8`. `wave-census` counts payload seats, not spawned ones, so a
  round-shape claim in prose is not checkable through it alone.
- **This file moves a counted term.** The lesson adds one `C2_total` row; the `corpus/README.md` row
  and the declared count must move in the same commit as this file (the R40-7 recurrence class).

---

## Out of scope / not done by this seat

- No lane file written; the lesson text above is a draft inside this report. No commit, push, or
  git write anywhere; the fleet repo was read only.
- No gate verdict was recorded (the round is at wave 1 build), so `## Gate` is a set of owed rows
  with `<pending>`, not fabricated admits.
- `scripts/kimi-census.mjs`, `scripts/gate-mutants.mjs` and `scripts/cite-check.mjs --selftest`
  (the full suite) were not run by this seat: the first because its before values are already
  receipted and it would hash host credential files, the second because it does not exist at
  b237e3f, the third because the round-41 probe already exercised it here.
- R41-1/2/3/4/6 dispositions belong to their own seats; this draft only records the pointers.

## Findings for the L1

1. **R41-7 is a label defect, not a digest defect.** Every `a2-census-*` header carries the correct
   sha256 of the mutated bytes; only the "over master fae386aa" label is wrong. A gate that names the
   digest (plan C1's header) would have made the receipt self-checking.
2. **A1's six-id list is right in count and one id off in name.** Measured exit-0 set: cite
   `suite-group-verdict`, `suite-any-fail`, `suite-exit-text`; census `M19`, `V382`, `V387`.
   `V385` exits 1. Worth correcting in the lesson text so the next reader does not re-derive it.
3. **The 25-id census set is 24 mutations**, and eight rows are prose rather than literals; the
   manifest author must pin the literal for those (they are the ids most likely to `nomatch` on a
   future revision).
4. **Base repair confirmed.** At a0a07ba the proxy is MATCH and the open `C2_TOTAL_DRIFT` /
   `AXES_DRIFT` are gone; only the three pin warnings remain (A4's target).

## Artifact paths

- This report: `.ufo/waves/round-42/build/ScribeLessonDraft.md`
- Draft target (not written): `corpus/lessons/round-42.md`
- Scratch clone: `/fast/scratch/hyaku/kumitate-r42/seats/ScribeLessonDraft/lane` (detached a0a07ba)
- Probe output saved: `/fast/scratch/hyaku/kumitate-r42/seats/ScribeLessonDraft/probe-b237e3f.txt`
