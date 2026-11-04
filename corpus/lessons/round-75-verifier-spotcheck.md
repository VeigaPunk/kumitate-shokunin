author: hyaku closure (non-author integrator, @m_zfl)
round: 75

# Round 75 — non-author closure spot-check (kumitate)

Closed lane HEAD `a0896afc2098fd3c8ba20bb9137b211feed79136` (base `c38382d547a1ec21bb7f51b4c08ef08053e7abae`);
report `.ufo/reports/round-75/kumitate.md` (18754 bytes, sha256 `d2661d5ebd6f016cbadb651094bd739fb1d8d5557b2788bb8db6a834ea2e9369`).
I authored none of this round and changed no lane file; this file and the MANIFEST entry are my only writes.

## Conformance (step 1)

- **Report landed by the lane identity.** `git log --format='%an <%ae> %H' -- .ufo/reports/round-75/kumitate.md`
  → `kumitate-shokunin <kumitate@shokunin.local> 2137a6cd…` (erratum) and `… 7f3712ce…` (body); both contain
  `origin/master`. Report filed after the cited lane tip (report 01:45:55 -03:00 > `c775e9b1` 01:45:22).
- **`SHONEN` heading.** Report `:208` `## SHONEN`, four `[~]` lines (`:210, :214, :217, :220`) = the four
  `SHONEN.md` boxes (`:5–:8`); no `[x]`, every line carries an evidence pointer.
- **Cited commits.** All resolve and pass `git merge-base --is-ancestor <hash> master`: `72610fde`, `fd7862d4`,
  `58a90f29`, `9fe7f1ea`, `3876217`, `2c7b7203`, `402428f5`, `f297289f`, `c775e9b1` (9 cited) plus the
  post-filing receipt commits `d49aa958`, `3fa7f9a4`, `a0896afc` — 12/12 ancestors.
- **Lane repo clean and pushed.** `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh state
  /home/vgpnk/Projects/shokunin/kumitate-shokunin` → `branch=master local=a0896afc remote=a0896afc ahead=0
  behind=0 head=detached`; `git status --porcelain` → empty. No uncommitted round work.
- **Prompt fidelity.** `.ufo/prompts/kumitate-round-75.md` (704 lines) equals `templates/round-prompt.md`
  (141 lines) under `{{LANE}}`/`{{ROUND}}`/`{{FLEET_ROOT}}`/`{{AXES}}` substitution only (unified diff: no
  other delta), then the addendum `## 6` at `:141` and scratch discipline `## 7` at `:674`. The five
  child-lane items are all present (report path and filename `:100`, commit-then-push `:132-133`, SHONEN
  line rule `:126-128`, commit-hash citation `:122-124`, lane write scope `:134-137`), and the round-level
  items (mission/axes `:3-8`, axis-move rule `:9-40`, L2 floor `:80-97`, L0 side channel `:138-140`).
  The §6 route map quoted (only reviewer `@m_zfl`) is the run-15 addendum, consistent with `MISSION.md`
  §L2 concurrency's role-class buckets (advisory routing; no lane repo alias pin).
- **Wave shape.** `w1-results.json` 12 seats, 12 settled, 0 dead; `close/seat-census.txt` `seats=12
  settled_results=12 report_files=12`; `close/wave-census.txt` `WAVE_CENSUS: CLEAN (rounds=1 waves=1
  findings=0)`, attack=4 (`report` discloses the tool's fixed set 4/12=33 % against its 5/12=42 % role
  count); 12 is inside the addendum's 8–16 band and above the §3 floor of 8.
- **Not a marker.** Work performed, evidence pointers, four landed commits tied to the LOG round-75 entry,
  and checkable hashes — a real report.
- **Report bytes vs receipt.** `close/report-receipt.txt` `REPORT_RECEIPT: CLEAN (bytes=18754
  report_sha256=d2661d5e…)` equals the committed report sha256 and size.

## Per-claim re-check

Labels: **re-measured** = a plain count/grep/diff I ran over committed bytes; **evidence-verified** = the
lane-owned gate's committed receipt (self-test tally, frozen/fixture verdict, revision measured) — I did
not execute `scripts/omp-census.mjs` or `scripts/proxy-check.mjs` (Gate standard, Closure consequence).

### C1 — `coverage:omp` 3 → 10 (new live sub-axis)

- **re-measured, base:** `grep '^UNLISTED' .ufo/waves/round-75/base/omp-census-base.txt | wc -l` → **40**;
  prefix breakdown → `config 29 agent 7 models 3 lsp 1 other 0`; verdict line `OMP_CENSUS: DRIFT
  (root=/home/vgpnk/.omp/agent entries=64 findings=40)`, `exit=1`. `floor(10 × (64−40)/64)` = **3** as
  reported. The report's corrected 3-files-plus-4-sidecars split matches the receipt (7 `agent.db.pre-*`).
- **re-measured, close:** `close/census.txt` (rev `2c7b7203`) `OMP_CENSUS: CLEAN (root=… entries=64
  findings=0 bound=35/35)`, `exit=0` → 64/64 ⇒ **10**.
- **re-measured, declaration count:** static parse of `scripts/omp-census.mjs` → `BASE_MEMBERS` **26**,
  `CHAIN_FAMILIES` **9** (35 declared); `git show c38382d5:scripts/omp-census.mjs | grep -c
  'lsp.json|config-pre|agent-pre-named|models-corrupt'` → **0** (all four units new).
- **re-measured, binding:** identifier-token scan of `corpus/knowledge/omp-agent-root.md` against all 35
  declared names → **0 unbound**; note 74 → **108** lines (`git show base:… | wc -l` vs `wc -l`).
- **evidence-verified:** `close/census-selftest.txt` `VERDICT: PASS (49 cases)`, exit 0 (29 → 49, ≥34 as
  Amendment 2 requires); `close/specificity.txt` → bogus fixture `UNLISTED bogus-member-75.txt` exit 1,
  34/35 note `NOTE_UNBOUND models-corrupt` exit 1, comment-only note 35 `NOTE_UNBOUND` exit 1;
  `close/c1-mutants.txt` → five drop-unit mutants each `VERDICT: FAIL`, sorted `FAIL` names and
  `identical=YES` reruns; `open/prereqs.txt` appended `40 600` mode sweep.
- **Predicate note (no defect):** the report's `Predicate corrections` #1 quotes the original freeze's bare
  `VERDICT: PASS`; Amendment 2 (`9fe7f1ea`, pre-verdict) had already restated the clause as
  `VERDICT: PASS (n cases)`, n ≥ 34, so the operative predicate discriminates (base 29, close 49). The
  report is conservative here, not over-claiming.
- **Verdict: improved.**

### C2 — `operability` capability acquisition `origin-tip-drift` (integer held at 9)

- **re-measured, base:** `git show c38382d5:scripts/proxy-check.mjs | grep -c -- '--tip-drift|tipDriftResult'`
  → **0**; `base/tip-drift-base.txt` → `proxy-check: unknown argument: --tip-drift`, exit 64.
- **re-measured, close:** `close/tip-drift.txt` (rev `2c7b7203`) → `ORIGIN_TIP_DRIFT: MOVED
  pin=31c465f15669 origin=fb7157fcf146 commits=58 changed=241 scripts=57 runtime=23 other=161`, exit 1;
  `IN_SYNC … commits=0 changed=0 …`, exit 0; `FAIL-CLOSED SRC_REV_UNVERIFIABLE /tmp`, exit 2. The
  plan's 57/23/161 classification agrees with `open/prereqs.txt` (58 commits; total=241).
- **re-measured, default mode:** `close/proxy-check-strict.txt` → `PROXY: MATCH (A=833 C=33 operability=9;
  C1=19/19 C2=181/181 coverage=10; … pins=6 match; src-rev=31c465f15669)`, exit 0 — the default mode is
  unchanged and the operability integer is 9 (terminal).
- **evidence-verified:** `close/proxy-selftest.txt` `PROXY_SELFTEST: 132/132 pass`, exit 0 (≥127);
  `close/c2-mutants.txt` M1/M2/M3/M6 killed, **M4 SURVIVOR disclosed** (three sequential guards; M4b,
  all four refusal returns neutralized, is killed by `FAIL-CLOSED INTERNAL_ERROR` on P3), so the
  fail-closed arm is measured, not assumed.
- **Verdict: improved** (capability acquisition; the integer stays 9 by `f_O` and is not claimed as a move).

### Axis harm check

`git diff c38382d5 a0896afc -- SCORECARD.md`: the only axis change is the added `coverage:omp` row
(3→10) — `coverage` (retired aggregate), `coverage:script-layer`, `coverage:runtime-layer`,
`coverage:kimi-layer` and `operability` rows keep their values; the stanza re-pins A 821→833, C2 179→181,
and the two tool pins, which the plan pre-registered. `PROXY: MATCH --strict` at close reads
10 on every coverage row. **No axis harmed.**

## Spot-check (LEARNING.md — non-author)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S224 oh-my-pi `docs/lsp-config.md` | admit | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.15.0/docs/lsp-config.md` → HTTP 200, 17254 bytes, sha256 `04b56a7d…`; quote lines 36, 40, 214; `main` fetch byte-identical | **agree** | All three located quotes appear verbatim at the cited lines; size and sha256 match the lesson and the row; official docs at the installed tag are tier A and ground the `lsp.json` member exactly. |
| S225 fleet run-state records | admit | `.scratch/goal-20261025-hyaku-run7.md:13`; `goal-20261027-hyaku-run10.md:62,66`; `goal-20261026-hyaku-run9.md:340`; `goal-20261103-hyaku-run15.md:25`; pin sweep `git -C /fast/scratch/hyaku/kumitate-pin/src grep -nE 'config\.yml\.pre-\|agent\.db\.pre-'` → 0 hits (exit 1) | **agree** | Every anchor resolves to the quoted pre-edit backup name (run10:62 is the agent.db copy, run10:66 the config.yml copy); the negative sweep confirms these names are not in the pinned upstream tree, so they are operator copies. Own-work tier B and `mined` + `used-by` are consistent. |
| `merge/kumitate/` assimilation package | reject | `/home/vgpnk/Projects/shokuknow/merge/kumitate` — `SOURCES.append.md` 155 rows; `MERGE-REPORT.json` `entries=70` (67 knowledge + 3 amendments) | **agree** | The size claim is exact. §10 admits one theme and 1–3 knowledge entries per round and forbids a bulk row append; re-grounding 155 rows/70 entries inside two OMP-plane claims is out of proportion. The flip (a dedicated assimilation round) is the right condition. |
| `models.db` per-store `recoverCorruption` opt-in | reject | `git -C /fast/scratch/hyaku/kumitate-pin/src grep -n 'recoverCorruption'` → **0 hits** (exit 1), HEAD `31c465f1…` | **agree** | The opt-in is genuinely not in the pinned tree; the census comment and the note both record "not located" instead of asserting it. The generic quarantine template (S054) is a separate, grounded claim. |

Quote bound: the S224 quotes are 5, 8 and 7 whitespace words (the lesson states 8, 8, 11 — the
path/hyphen splitting differs); all are far under the ≤25-word bound. Census
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → `kumitate ok
…/corpus/SOURCES.md`, `exit=0` (six carried W04, unchanged from round start).

## Trend verdicts

- **expansion: improved.** The OMP agent plane (40 of 64 depth-1 members undeclared at base → 0) moved
  from `PROVINCE.md` Frontier into Core, the note now binds 26 base members + 9 chain families
  (74 → 108 lines), and SOURCES 162 → 164 with S224 (A) and S225 (B) both `mined` and `used-by
  corpus/knowledge/omp-agent-root.md`; `corpus/README.md` `## Frontier` records the advance. The new
  `coverage:omp` axis row cites both rows.
- **quality: improved.** Census suite 29 → 49 cases including the comment-only and superstring binding
  counterexamples; proxy suite 124 → 132; five C1 drop-unit mutants and five of six C2 mutants killed
  (M4 disclosed); `CHECKLIST: 30/33` → `33/33`; `PROXY: MATCH` under `--strict` at close; Q71 adds the
  registry↔Gate pointer criterion. No admitted claim failed its re-check.
- **discernment: improved.** The outside sample agrees on two admits (S224, S225) and two rejects
  (assimilation package, models.db opt-in). The lane's own critic counterexample (comment-only note
  reading `bound=35/35`) became a tightened arm plus two selftest cases, the reviewer's six FREEZE-FIX
  items became two pre-verdict amendments, and the C1(c) literal/corrected split and the M4 survivor are
  reported rather than smoothed.

## Routed defects (lane to fix next round)

1. **Stale A count (status-neutral, conformance).** `SCORECARD.md` round-75 prose still says `A 821→832`
   (`:3423`) and `A=832` (`:3430`), and `LOG.md`'s round-75 entry (`:2410`) says `A 821→832`, while the
   stanza and the report say **833** after `2c7b7203` (the late sentinel probe script). Append a named
   correction entry (LOG append; SCORECARD erratum naming the superseded lines) per the corrections-sweep
   rule; do not rewrite the filed bytes.
2. **Stale remote pointers in the report.** The header's "final lane tip `c775e9b1`" and the Landed-changes
   footer's "`ls-remote … reads f297289f`" disagree with each other and are superseded by the post-filing
   receipt commits `d49aa958`, `3fa7f9a4`, `a0896afc` (current tip `a0896afc`). The erratum's remote-check
   line names no hash. Next erratum should name the superseded lines and the actual tip.
3. **Spotcheck-coverage recurrence (5th).** This file lands without a `corpus/README.md` row and
   `readme-map.json` covered entry (the closure writes only the two closure artifacts). Repair in round 76
   as the lane did for `round-74-verifier-spotcheck.md`; `README_MAP` will flag it at open.
4. **Carried host defect (already routed by the lane).** `round-gate.mjs --close` fail-closes
   `UPSTREAM_MISSING` on the jj lane's detached `HEAD` (`close/round-gate-close.txt`, exit 2) while the
   audit arm is `ROUND_GATE: CLEAN (round=75 lane=kumitate checks=10 errors=0 warnings=0)`. Operator-side
   fix (read `master` or accept `--branch`); not lane round work.

Promotion note (operator-owned): the four `SHONEN.md` boxes have resolvable evidence — the SKILL gate
registry (24 rows, both touched rows updated), this round's two end-to-end receipts, the frozen
plan/wave/receipt chain, and the connector's 20-lane overlap scan — but I am not the promoter and did not
mark any box.
