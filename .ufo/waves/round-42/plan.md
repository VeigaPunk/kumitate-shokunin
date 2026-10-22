# Round 42 plan (kumitate L1; written before any wave; counters frozen at this commit)

Round open: lane `master` = `dfabe92bcec021f5beec457fb50cec484e047e35`, pushed, clean
(`jj-lane.sh state`: `ahead=0 behind=0 tracked=0 untracked=0`). Origin pin
`31c465f15669f744848bd9f5d56191c5085670f7`, clone `/fast/scratch/hyaku/kumitate-pin/src`.
Open receipts: `.ufo/waves/round-42/open/receipts.txt` (19:52:15Z).

Lowest non-retired axis: operability 8 (saturation line 9; the nudge is not active). Round 41's two
claims both landed on operability and counted as one; this round's two claims sit on two distinct
axes (operability, coverage:kimi-layer) and touch disjoint gate files. Drift watch: rounds 39-40
worked anchor-truth and round 41 worked cite-check and wave-census; neither claim below re-works
those gates' verdict logic (C1 reads their selftests from outside; R41-3 is a routed fix).

## C1 — operability (claim type: capability acquisition `gate-mutants`)

- New lane instrument `scripts/gate-mutants.mjs` (contract `kumitate-gate-mutants-v1`): a frozen,
  embedded manifest of single-literal mutants against lane gates; for each mutant it copies the
  measured revision's `scripts/` into a temp dir, applies the mutant (the `from` literal must occur
  exactly once, else `nomatch`), runs that copy's `--selftest` with a scrubbed environment (no
  `KUMITATE_*` variable inherited), its own process group, a per-mutant timeout and cleanup by
  group. Per mutant `MUTANT <target>:<id> killed|survived|nomatch|crash|timeout`; killed = exit
  non-zero with a `VERDICT: FAIL` line; a crash or timeout is not a kill. Header line names the
  measured revision (or `working-copy`) and each target's sha256 of the bytes actually mutated
  (R41-7). Verdict `GATE_MUTANTS: CLEAN (...)` exit 0; any survivor `GATE_MUTANTS: SURVIVED (...)`
  exit 1; nomatch, crash, timeout or a failing control exit 2; usage exit 64. `--rev <commit>`
  measures a committed revision's scripts; `--selftest` is hermetic.
- Frozen mutant set (41 ids; the manifest may hold more, each extra one named in the lesson):
  - `cite-check`: the 16 ids of `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`
    (warn-total, resolved-kind-gate, strict-conjunct, strict-warn-arm, resolved>0, citeCheck-map,
    render-env-empty, render-env-zero, exit2-empty, exit2-zerores, exit0/1-map, parse-64,
    suite-group-verdict, suite-any-fail, suite-exit-json, suite-exit-text), same literals.
  - `wave-census`: the 25 mutants of `.ufo/waves/round-41/final/a2-census-{repair,survivor,findings,exits}-mutants.txt`
    (repair 3, survivor 10, findings 10, exits 2), ids `<group>/<id>`, same literals.
- Counting command (terms): `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json | jq -c '.terms | {A, C, operability}'`.
  Before at dfabe92: `{"A":9,"C":17,"operability":8}` (open receipts). After at the measured
  commit: `{"A":10,"C":19,"operability":9}` — A +1 (`scripts/gate-mutants.mjs`), C +2 (checklist
  items: the gate's verdict and its hermetic suite), `f_O` 26/29 → 29/32 ≈ 0.906 ⇒ 9; the `## Axes`
  operability row moves 8 → 9 in the same commit so the proxy reads MATCH.
- Counting command (gate): `node scripts/gate-mutants.mjs; echo exit=$?` at the measured commit →
  `GATE_MUTANTS: CLEAN`, exit 0, each of the 41 frozen ids printing `killed`; `--selftest` →
  `VERDICT: PASS`. Shown able to fail on real code: with the R41-3 skip-bypass mutants in the
  manifest, `--rev dfabe92bcec021f5beec457fb50cec484e047e35` exits 1 (they survive at open bytes).
- Capability row `gate-mutants` enters `## Capabilities` in the same commit (rows 2 → 3, counted by
  ``awk '/^## Capabilities/{f=1;next} /^## /{f=0} f && /^\| `/' SCORECARD.md | wc -l``).
- Sourced on a `corpus/SOURCES.md` row opened this round (a primary source on mutation testing as
  a standing gate).

## C2 — coverage:kimi-layer: the host's `~/.kimi-code/locks` is governed

- Before (open receipts): `node scripts/kimi-census.mjs` → `CENSUS  error  UNLISTED  locks`,
  `ROOT_ENUM … strays=1`, `KIMI_CENSUS: DRIFT (UNLISTED locks)`, exit 1; proxy
  `{"K_members":52,"K_sections":52,"coverage_kimi":10}`.
- After at the measured commit: the census reads `KIMI_CENSUS: CLEAN`, exit 0, `strays=0`, the
  member set gains the `locks` root member (`K_members` 52 → 53) and a knowledge heading binds it
  (`K_sections` 52 → 53), `coverage_kimi` 10 held; census tripwire and selftest updated.
  Counting command: `node scripts/kimi-census.mjs; echo exit=$?` plus
  `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json | jq -c '.terms | {K_members, K_sections, coverage_kimi}'`.
- Sourced: the knowledge section cites a `corpus/SOURCES.md` row opened this round naming what
  creates `locks/` (Kimi Code source or official docs, located quote ≤ 25 words). If no source can
  be opened by ordinary means, C2 stops honestly (no unsourced declaration).
- Host drift is live state: a new unlisted root child appearing before the measurement is named,
  never silently declared.

Separability: C1 touches `scripts/gate-mutants.mjs`, two SKILL checklist items and its registry
row; C2 touches `scripts/kimi-census.mjs` and one knowledge section. Shared only: SCORECARD stanza
pins and declared terms, edited per key.

## Routed defects (round-41 closure, fix or explain; not claims)

R41-1 same-round rejects in `## Gate`; R41-2 pin `wave-census` (and the other two unpinned gates)
in the proxy stanza — `--strict` warnings 3 → 0 is the target, measured, not claimed; R41-3
cite-check guard red-before cases for F1 (3 recursing mutants) and F2 (2 skip-bypass), with the
cite-check selftest time measured before and after (open: 844/857/838 ms) so the round-41 cost
trade is not deepened; R41-4 per-axis verdict keying in the report; R41-5 every round-shape
deviation in the report's `## Round shape`; R41-6 carried R40-2 honest-edit re-measure, R40-4
anchor-truth resource caps, the 12 attempt-1 census findings, the 5 report-presence gaps and the
wave-census sentinel findings (fix or name each); R41-7 receipt headers name the measured digest.
Holds from round 40 (`AtkNovelIdentity`, `AtkNovelRecords`) are not recreated. The operator ruling
on round 41's unscored trades is pending: those trades are measured, not deepened.
