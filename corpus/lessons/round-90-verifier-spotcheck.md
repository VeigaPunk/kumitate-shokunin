# kumitate round 90 — verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Round: kumitate 90 (attempt 1, hyaku run 15). Lane HEAD before: `7218699cfbdec702ba42f35ceac0a8e52d1bd564`;
after: `bf24587c3e5a17f426b3b6c6dbea777eac054544`. Report: `.ufo/reports/round-90/kumitate.md` (fleet commit
`7f0839a45a9a6b18a1ebcc2dbf8ea6ec2a031c9a`, lane identity, pathspec-limited to the report, committed
07:27:24-03:00 — after the lane close commit 07:26:14-03:00 and before the watchdog complete line
07:29:02-03:00). I did not author this round; I re-derived every number below from committed bytes and did
not execute the lane's gates (probe, selftest, round-gate) — their committed receipts are quoted with
verdict and revision.

## 1. Step-1 conformance

| check | result | evidence |
|---|---|---|
| report committed by lane identity in fleet repo | PASS | `git log --format='%an <%ae> %H' -- .ufo/reports/round-90/kumitate.md` → `kumitate-shokunin <kumitate@shokunin.local> 7f0839a45a9a6b18a1ebcc2dbf8ea6ec2a031c9a`; `git show --stat` → only the report path |
| `## SHONEN` heading, one line per box | PASS | `grep -c '^## SHONEN'` → 1; four `- [~]` lines (reports/round-90/kumitate.md:100-103); all pointers resolve (SKILL.md:646 gate row, :763 checklist item v4; LOG.md:3104/3110 round-90 entries; `close/checklist-items.txt` 46 items; PROVINCE diff empty) |
| cited lane commits exist and are ancestors of the branch ref | PASS | `git merge-base --is-ancestor <h> master` → OK for `b67fa963` (freeze), `82c9c7ef` (M), `bf24587c` (close); branch `master` local=remote=`bf24587c` |
| no uncommitted round work; lane pushed | PASS | `git status --porcelain` → clean; `scripts/hyaku/jj-lane.sh state` → `ahead=0 behind=0`, `local=remote=bf24587c…`, tracked=0 untracked=0 |
| prompt carries the template contract | PASS | `.ufo/prompts/kumitate-round-90.md` §1 mission/axes binding, §2 claims + lowest-axis rule, §2b frontier step, §3 L2 floor (≥8), §4 report path/SHONEN/commit-hash citation/marker rule, §5 commit-then-push + push scope + L0 channel |
| dispatch/completion evidence | PASS | watchdog digest (copied verbatim in MANIFEST notes): launch 06:05:06-03:00, complete 07:29:02-03:00, attempt 1 |
| wave shape | PASS | `.ufo/waves/round-90/w1-results.json`: 12 results, 0 DEAD/FAILED/TIMEOUT markers, all with substantive output; attack share 4/12 ≥ 25 %; band 8–16 respected; plan-before-ready `PLAN_BEFORE_READY: PASS … plan=b67fa963 marker=82c9c7ef` |

Defects: none barring admission. One wording defect recorded in §5 (row 6).

## 2. Claim re-check — C1 operability, capability acquisition `receipt-bind` v4 (UNMET confirmed)

Lane-owned gates are evidence-verified, never executed (PROTOCOL §Gate standard, Closure consequence).
Plain measurements below are mine, over committed bytes at `bf24587c`.

| reported value | my command | observed | match |
|---|---|---|---|
| v4 instrument sha `35f4f25e…cc1fce` | `git show bf24587c:scripts/receipt-bind.mjs \| sha256sum` | `35f4f25e6130dd827747ceff8ced80682d96c6c04d9516f2a463ce58cc7c1fce` | ✓ (= SCORECARD `pin.receipt-bind`) |
| base v3 sha `37201ad0…` | `git show 7218699c:scripts/receipt-bind.mjs \| sha256sum` | `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3` | ✓ (= pre-round pin) |
| blind probe sha `70622333…f2b694` | `git show bf24587c:.ufo/waves/round-90/probe/probe90-c1.mjs \| sha256sum` | `70622333ca6946c73564e1236f7c19a8efa110200e09043bf2fd3b24d2f2b694` | ✓ |
| red-before `held=39/47`, failing exactly the 8 invisible-prefix arms | read committed receipt `controls/ctl-base-v3-at-rev.txt` | `C90_C1: UNMET held=39/47`; FAIL arms = `dup-feff dup-zwsp dup-zwnj dup-zwj dup-lrm dup-nbsp single-zwsp single-nbsp` | ✓ (47 ARM lines counted, 39 PASS + 8 FAIL) |
| green-after `held=47/47` ×2 at M | read `close/probe1.txt`, `close/probe2.txt` | both: `rev=82c9c7ef…`, `tool_sha256=70622333…` (probe), `C90_C1: HELD held=47/47`, `exit=0`; 47 ARM lines each PASS | ✓ |
| selftest `PASS held=76/76` (68 → 76) | read `close/selftest.txt` | `tool_sha256=35f4f25e…` (v4); 8 new arms `ambiguous-dup-prefixed-{feff,zwsp,zwnj,zwj,lrm,nbsp}` + `single-prefixed-{zwsp,nbsp}-parses`; `RECEIPT_BIND_SELFTEST: PASS held=76/76` | ✓ |
| bind over close receipts `CLEAN matched=12 … external=1` | read `close/bind.txt` | `RECEIPT_BIND: CLEAN matched=12 mismatched=0 unchecked=0 external=1` at rev `82c9c7ef` | ✓ |
| proxy `operability=9; C2=230/230 coverage=10 …` | read `close/proxy.txt` | `PROXY: MATCH (A=36 C=46 operability=9; C1=19/19 C2=230/230 coverage=10; S=88/88 …; K=55/55 …; O=1/1 … coverage:omp=10; pins=6 match)` exit 0 | ✓ |
| kill rule fired: reviewer global-strip 47/47; criticA d/e 47/47 two runs each | read `w1/K90Reviewer.md`, `w1/K90CriticA.md` | reviewer table: `cand-1-global-strip … C90_C1: HELD held=47/47, 0` claimed-behaviour + step-4 mid-token rewrite; criticA table rows d and e: `47/47 | 47/47` (two runs) | ✓ |
| harm 131/131 + 643/643 AGREE, 0 flips | read `w1/K90CriticB.md` | `AGREE=131, DIFF=0` (dirs); `AGREE=643, DIFF=0` (singles); `0 flipped verdicts … NO HARM` | ✓ |
| mutation: 10 mutants UNMET, held 34–39; O_NOFOLLOW probe-blind | read `K90Mutation/mutants.txt` | M1–M10 all `C90_C1: UNMET`, held 35/36/37/34/35/34/35/39/37/39; M8 marked PROBE-BLIND | ✓ |
| Q82 audit CLEAN + shown-able-to-fail LEAK | read `K90ExecAudit/audit-clean.txt`, `audit-keyed-negative.txt` | `Q82_AUDIT: CLEAN labels=47 scanned=130 hits=0`; keyed-negative: probe UNMET 35/47, `Q82_AUDIT: LEAK hits=161` | ✓ |
| SOURCES 197 → 200; mined 158, queued 14, rejected 28; A=168 | `grep -cE '^\|…S[0-9]{3,}…\|' corpus/SOURCES.md` now and at base; awk histograms | 197 (base) → 200; `mined=158 queued=14 rejected=28`; `A=168 B=22 C=10`; census `kumitate ok`, exit 0 | ✓ |
| other gates at M | read `close/{checklists,source-capture,sources,counter-pins,readme-map,plan-before-ready}.txt` | `CHECKLIST: 43/46 pass` + `VERDICT: FAIL` (three reds named in the report, recorded as reds); `SOURCE_CAPTURE: CLEAN captures=89 exemptions=111`; `SOURCES_CHECK: CLEAN rows=200 tiers=A:168,B:22,C:10 …`; `COUNTER_PINS: CLEAN pins=45`; `README_MAP: CLEAN files=230 rows=230 covered=230`; `PLAN_BEFORE_READY_SUMMARY: pass=1 fail=0` | ✓ |
| no owned axis harmed | `git diff 7218699c bf24587c -- SCORECARD.md` | no axis score row changed: operability integer 9 (terminal `f_O`), coverage rows 10; only proxy counters (A_wave 1210→1253, C2 227→230), pins, move-log rows 89/90, `## Planned` pointer, round-90 declaration | ✓ |

**Claim verdict: C1 UNMET — rejected-honest-stop, confirmed.** The frozen kill rule fired on three
constructions that score 47/47 without performing the claimed behaviour (whole-text strip; two
context-gated prefix tolerances — the latter exploiting M3, the candidate-visible `kumitate-r90`
scratch root). No capability row entered SCORECARD; the probe was not narrowed. Re-measured vs
evidence-verified: shas, arm counts, row counts and verdict lines re-measured by me; the probe/selftest
runs themselves evidence-verified from their committed receipts (each names its revision and tool sha).

## 3. Per-axis verdicts (non-author grading)

| axis | verdict | reason |
|---|---|---|
| operability | unchanged | integer 9 terminal under `f_O`; capability acquisition rejected by the frozen kill rule; instrument quality improved (red-before/green-after receipts) but no capability row |
| coverage (+script/runtime/kimi/omp layers) | unchanged | proxy MATCH at M: all coverage rows 10; SCORECARD diff shows no coverage regression |
| harmed axes | none | SCORECARD diff between base and tip shows no score decrease anywhere |

## 4. Discernment spot-check (LEARNING.md — checked from outside)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| QUALITY Q83 — prefix class with positive and negative twin per member | admit | `corpus/QUALITY.md:1445-1451`; grounding re-opened: `.ufo/waves/round-89/build/K89Sentinel/attacks.txt` rows B2/B3/B7 (mid-file BOM / ZWSP hiding a 2nd `cmd=`/`rev=`, both read CLEAN on base); `.ufo/waves/round-90/K90ScribeLesson/evidence/q83-source-counts.txt` (dup=6, single=2) | **agree** | falsifiable with a counting command; grounding verified exactly as stated: the probe arms six duplicate classes and only two single-prefix twins, so four members genuinely lack the twin the rule demands |
| S260 — UAX #44 (U+200B Zs→Cf) | admit (source row, mined) | capture `.ufo/waves/round-90/K90ScribeSources/unicode-tr44.html` — `sha256sum` = `d951c7cf…1ab4` (matches row); lines 403-406 re-read | **agree** | capture bytes hash-match and name U+200B ZERO WIDTH SPACE verbatim as "originally classified as a space character (General_Category=Zs), but … reclassified as a Format character (General_Category=Cf)"; the row's ≤25-word quote is a condensation of that sentence, not verbatim (hygiene note, §5 row 3) |
| S261 — PropList White_Space (U+00A0) | admit (source row, mined) | capture `unicode-proplist.txt` line 15: `00A0 ; White_Space # Zs  NO-BREAK SPACE`; sha256 matches row | **agree** | verbatim support for the teach |
| `cand-1-global-strip` as a v4 design | reject | `.ufo/waves/round-90/w1/K90Reviewer.md` step 4 | **agree** | the construction scores 47/47 while rewriting a mid-token instrument name (`cmd=node scripts/legit\u200B.mjs` binds CLEAN to `scripts/legit.mjs`, which does not exist at the judged rev; base v3 correctly FAIL-CLOSES `UNRESOLVED`) — a scorer-blind hole; rejecting it without touching the frozen probe is the correct call |

Sample: 2+ admits and 1 reject, all agreed. The kill-rule refusal itself (two 47/47 constructions
recorded, claim not narrowed, no capability row) is calibrated behaviour on the round's own terms.

## 5. Trend verdicts (this closure's, with evidence)

- **expansion — unchanged.** +3 admitted SOURCES rows (S260/S261 mined, S262 queued; A 165→168) and one
  new knowledge entry, all on the receipt-binding band the coverage map already holds (`README_MAP:
  covered=230`, no frontier band entered); no capability row. Same verdict as the lane.
- **quality — improved.** Red-before (`held=39/47`, failing exactly the eight arms, committed receipt)
  → green-after (`held=47/47` twice, selftest `76/76`); Q83 admitted with grounding and a red/green
  command; K89-V6 append-only correction (`64/64` → measured `68/68` v3, `76/76` v4); no admitted entry
  found false. Tempered: instrument quality, not a capability. Same verdict as the lane.
- **discernment — improved.** The non-author spot-check (this file) agrees with the gate on the sampled
  admits (Q83, S260, S261) and the sampled reject (global-strip): LEARNING.md's `improved` condition
  ("the spot-check agrees with the gate on admits and rejects") is met. The lane graded `unchanged`
  because the check was pending; this closure supplies it, consistent with the r87–r89 closures. The M3
  calibration gap (probe header's no-round-token claim false for the mandated scratch root) stays
  routed, not corrected by fiat — which is itself the honest handling.

## 6. Routed defects (lane must fix in round 91; status-neutral here)

1. **ROUND_GATE red at close snapshot** (committed `close/round-gate.txt`: `REPORT_MISSING`,
   `SCORECARD_ROW_MISSING`, `LOG_ENTRY_MISSING`, warning `SCORECARD_PLAN_MISSING`) — explained by
   pre-record timing (the round-90 records landed at `bf24587c`, the battery ran at `82c9c7ef`). Route:
   re-run `round-gate --round 90` at the landed revision and commit the receipt next round.
2. **M3 + M4** (lane-routed): counter versions with no round token in any candidate-visible path and a
   mid-token / non-field invisible-code-point arm with a positive twin.
3. **S260 quote hygiene**: the row's quote is a condensed paraphrase of capture lines 403-406; a
   follow-up correction row should quote verbatim or mark the condensation.
4. **K89-V7** (S255 quote-location drift): carried; must land.
5. **Sentinel RD-1..RD-6** (A1 worktree-symlink laundering, A4/A5 unbounded reads, A6-A8 TOCTOU,
   A9/A10 replace-ref redirects): re-run against any future candidate.
6. **Wording defect (report)**: "12/12 COMPLETE" — only 2 of 12 seat records in `w1-results.json` carry
   a literal status field (`COMPLETE`/`complete`); the other 10 carry substantive result JSON with no
   DEAD/FAILED marker. The substance (no dead seats) holds; the phrase overstates the marker.

## 7. SHONEN note for the operator

All four boxes are asserted `[~]` with resolvable pointers, and every pointer I opened resolved
(SKILL.md:646 gate row + :763 checklist item v4; LOG.md:3104/3110; `close/checklist-items.txt` 46
items; PROVINCE.md byte-identical between base and tip; connector ruling on record). The boxes look
fully checkable by a non-author; promotion is operator-owned and not performed here.

## Dispatch/complete digest (copied from the closure brief; watchdog.log is mutable)

```
2026-11-05T06:05:06-03:00 launch kumitate round=90 pgid=3243041 driver=hyaku-inline attempt=1
2026-11-05T07:29:02-03:00 complete kumitate round=90; hyaku-inline attempt=1
```
