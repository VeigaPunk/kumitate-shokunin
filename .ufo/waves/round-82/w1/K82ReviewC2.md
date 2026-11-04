# K82ReviewC2 — adversarial review of C2 (coverage:omp compare-age)

Seat: K82ReviewC2 (reviewer, leaf). Basis: measured revision M = lane HEAD `c4396021`
(scaffolding B); `scripts/omp-census.mjs` is byte-identical to the scaffolding commit
(`git diff 63b12695 HEAD -- scripts/omp-census.mjs` → 0 lines); the frozen counter is
byte-identical to the freeze commit (`git diff 97a63012 HEAD -- .ufo/waves/round-82/probe/probe82-c2.mjs`
→ 0 lines, worktree clean). Runtime: node v24.21.0. No tool installed or upgraded (none
needed — nothing fetched, nothing written to PATH dirs). All fixtures lived under
`/fast/scratch/hyaku/kumitate-r82/K82ReviewC2/` and were deleted after the run (`rm -rf`,
then `ls` ENOENT). No git/jj mutation; git used read-only only. Lane files were never
written except this report.

## 1. Predicate at M

```
$ node .ufo/waves/round-82/probe/probe82-c2.mjs --set c2 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin
C82_C2: HELD held=13/13        (exit 0; run twice, byte-identical verdicts)
```

All 13 arms ok, including the two new disclosure arms, both compare gates, both legacy-age
refusals, the score arm (`coverage_omp=10 source=snapshot`) and the suite floor
(`VERDICT: PASS (105 cases)`).

## 2. Fixture table

Abbreviations: `$L` = lane root; `$S` = seat scratch fixture dir (3-entry live root
`a-file`/`b-dir`/`c-link`, plus a `delta` root with +`zz-added`, −`c-link`, `a-file` mode
0o600). Every row's exit/line was captured by the driver
`node /fast/scratch/hyaku/kumitate-r82/K82ReviewC2/fix82.mjs` (kept in the deleted scratch;
outputs quoted verbatim below). ★ = one of the eight mandated fixtures.

| # | case | command | exit | observed (first line) | verdict vs promised |
|---|---|---|---|---|---|
| F01 ★ | boundary: age exactly 30, `--max-age 30` | `node $L/scripts/omp-census.mjs --compare $S/exact30.json --root $S/live --max-age 30` | 0 | `OMP_SHAPE_COMPARE: IN_SYNC entries=3 receipt=3 added=0 removed=0 changed=0 transient=0 receipt_captured=2026-10-05 age_days=30` | **Boundary is strict `>`** (`omp-census.mjs:267`): `--max-age` is an *inclusive* upper bound; age == max-age passes. Plan promises a "staleness gate" without boundary text → consistent. Identical semantics on the `--shape` path (`:503`, F29). |
| F02 | age 30 vs `--max-age 29` | `… --compare $S/exact30.json --root $S/live --max-age 29` | 1 | `OMP_SHAPE_COMPARE: SHAPE_STALE_RECEIPT entries=3 age_days=30 max_age=29` | gate fires one day past the bound; stale exit 1 as promised. |
| F03 | age 29.5 days vs `--max-age 29` (floor first?) | `… --compare $S/mid29.json --root $S/live --max-age 29` | 0 | `… IN_SYNC … receipt_captured=2026-11-04 age_days=29` | `receiptAgeDays` floors *before* the comparison (`:216-219`); 29.5 → 29 → passes. Disclosed. |
| F04 ★(ii, note) | `captured_at` +1 s, ungated | `… --compare $S/future1s.json --root $S/live` | 0 | `… IN_SYNC … receipt_captured=2026-11-04 age_days=0` | **Measurement artifact, not tool behavior**: on this loaded host the tool subprocess started >1 s after fixture materialisation, so the receipt was no longer in the future when graded. Authoritative sub-day-future semantics are proven deterministically in §3 (and F26/F27 race-free). |
| F05 ★(ii, note) | `captured_at` +1 s, `--max-age 0` | `… --compare $S/future1s.json --root $S/live --max-age 0` | 0 | `… IN_SYNC … age_days=0` | same race as F04; see F27 for the gated refusal. |
| F06 ★ | v1 receipt with `--max-age 0` | `… --compare $S/v1.json --root $S/live --max-age 0` | 2 | `OMP_SHAPE_COMPARE: SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=0` | **Promised fail-closed** (legacy v1 carries no instant) → exact. |
| F07 ★ | v2 receipt, malformed `captured_at` (`"not-a-date"`) | `… --compare $S/malformed.json --root $S/live` | 2 | `SHAPE_INVALID` | **Promised "already SHAPE_INVALID"** → exact: `validateShape` (`:168-178`) rejects any `captured_at` failing `ISO_SECOND` or `Date.parse` before any age math runs. |
| F08 ★ | v2 malformed `captured_at` + gate | `… --compare $S/malformed.json --root $S/live --max-age 5` | 2 | `SHAPE_INVALID` | same refusal with the gate armed; the NaN path in `receiptAgeDays` is unreachable through the CLI. |
| F09 | v2 receipt, numeric `captured_at` | `… --compare $S/numeric.json --root $S/live` | 2 | `SHAPE_INVALID` | `typeof doc.captured_at === 'string'` fails (`:171`) → refused. |
| F10 ★ | `--compare --max-age -1` | `… --compare $S/fresh.json --root $S/live --max-age -1` | 64 | `omp-census: --max-age must be a non-negative integer` | **Promised usage** → exact (`:456`). |
| F11 | `--max-age 2.5` | `… --max-age 2.5` | 64 | `omp-census: --max-age must be a non-negative integer` | non-integer refused. |
| F12 ★ | receipt with 0 entries | `… --compare $S/zero.json --root $S/live` | 2 | `SHAPE_INVALID` | refused at `validateShape:179` (`!doc.entries.length`); the compare path never sees an empty receipt. Pre-existing contract (round 77), unchanged by this diff. |
| F13 | receipt is not JSON | `… --compare $S/notjson.json --root $S/live` | 2 | `SHAPE_INVALID` | fail-closed as promised. |
| F14 ★ | `--compare` with root = a file | `… --compare $S/fresh.json --root $S/root-is-a-file.txt` | 2 | `ROOT_NOT_A_DIR` | **Promised** (`:280` catch) → exact. |
| F15 | root = symlink to a directory | `… --compare $S/fresh.json --root $S/live-symlink` | 2 | `ROOT_NOT_A_DIR` | `readShape` uses `lstatSync(root).isDirectory()` (`:142-149`): a symlinked root is refused. **Pre-existing** behavior (untouched by this diff), disclosed as an operability note, not a round-82 regression. |
| F16 ★ | `--max-age` with `--shape` and `--root` | `node $L/scripts/omp-census.mjs --shape $S/fresh.json --root $S/live --max-age 30` | 64 | `omp-census: incompatible modes` | **Promised incompatibility** → exact (`:444-445`: `--shape` + `--root`). |
| F17 | `--compare` + `--shape` together | `… --compare $S/fresh.json --shape $S/fresh.json` | 64 | `omp-census: incompatible modes` | mode-count check (`:443`). |
| F18 | `--max-age` without `--shape`/`--compare` | `node $L/scripts/omp-census.mjs --root $S/live --max-age 5` | 64 | `omp-census: --max-age is only meaningful with --shape or --compare` | promised usage relaxation guard (`:457`). |
| F19 | `--max-age ''` (empty string) | `… --compare $S/fresh.json --root $S/live --max-age ''` | 0 | `… IN_SYNC … age_days=0` | **Laxity** (see gap 4): `Number('') === 0` passes the integer check → empty string silently means "0 days", the strictest gate. |
| F20 | fresh receipt, `--max-age 0` | `… --compare $S/fresh.json --root $S/live --max-age 0` | 0 | `… IN_SYNC … age_days=0` | age 0 passes bound 0 → consistent with the inclusive bound. |
| F21 | stale gate vs drift precedence (stale receipt, delta root) | `… --compare $S/exact30.json --root $S/delta --max-age 29` | 1 | `OMP_SHAPE_COMPARE: SHAPE_STALE_RECEIPT entries=3 age_days=30 max_age=29` | age gate fires **before** the live root is read/diffed (fail-fast on the receipt); the drift is not disclosed on the refusal line. Ordering worth knowing for consumers. |
| F22 | DRIFT line shape | `… --compare $S/fresh.json --root $S/delta` | 1 | `OMP_SHAPE_COMPARE: DRIFT entries=3 receipt=3 added=1 removed=1 changed=1 first=a-file transient=0 receipt_captured=2026-11-04 age_days=0` | the stamp follows `transient=`; **`first=` no longer terminates the line** (round-78 grammar said it did). |
| F23 | age gate vs root check (v1 receipt, root = file) | `… --compare $S/v1.json --root $S/root-is-a-file.txt --max-age 5` | 2 | `OMP_SHAPE_COMPARE: SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=5` | age gate precedes the root existence check. |
| F24 | receipt path is a directory | `… --compare $S/dirrc.json --root $S/live` | 2 | `SHAPE_NOT_FOUND` | `readFileSync` on a dir throws → mapped to not-found, fail-closed. |
| F25 | 45-day receipt, ungated | `… --compare $S/exact30.json --root $S/live` (aged sibling) | 0 | `… IN_SYNC … receipt_captured=2026-10-05 age_days=30` | disclosure only, no scoring. |
| F26 ★(ii) | `captured_at` +2 days, ungated | `… --compare $S/future2d.json --root $S/live` | 0 | `… IN_SYNC … receipt_captured=2026-11-06 age_days=-2` | race-free: a future-dated receipt **passes** ungated compare with the negative age disclosed. See gap 2. |
| F27 ★(ii) | `captured_at` +2 days, `--max-age 0` | `… --compare $S/future2d.json --root $S/live --max-age 0` | 2 | `OMP_SHAPE_COMPARE: SHAPE_CLOCK age_days=-2 max_age=0` | gated refusal fires (`:263-265`); token and exit as designed. |
| F28 | `--shape` on the same future receipt | `node $L/scripts/omp-census.mjs --shape $S/future2d.json --self $L` | 2 | `SHAPE_CLOCK captured_at=2026-11-06T11:19:56Z is in the future` | `--shape` refuses a future receipt **unconditionally** (`:498-501`) — the asymmetry with ungated `--compare` (F26). |
| F29 | `--shape` boundary parity | `node $L/scripts/omp-census.mjs --shape $S/exact30.json --self $L --max-age 30` | 1 | `OMP_CENSUS: DRIFT (source=snapshot entries=3 findings=3 captured=2026-10-05 age_days=30)` (no `SHAPE_STALE` line) | the shape path's bound is also inclusive (`age > maxAge`, `:503`); the exit 1 here is the fixture's census drift (3 entries vs the real agent-root note), not staleness. |

## 3. Deterministic age semantics (injected `now`)

The CLI cases F04/F05 raced the host clock, so the sub-day-future semantics were proven
deterministically against the exported function with a fixed instant:

```
$ node -e 'import("…/scripts/omp-census.mjs").then(m => { … receiptAgeDays({captured_at: iso(capMs)}, T) … })'
cap=T        -> 0        cap=T-30d    -> 30
cap=T+1s     -> -1       cap=T+2d     -> -2
cap=T-29d12h -> 29
```

`receiptAgeDays` (`:216-219`) is `Math.floor((now − captured)/86400000)`: floor division,
sub-day-future ⇒ −1, floor-before-compare. This is the behavior F26/F27 exhibit race-free.

## 4. The central sentence: the age never moves `coverage:omp`

Same pinned receipt, two ages, the scoring proxy:

```
$ cp $L/.ufo/pins/omp-shape.json $S/pin-age0.json
$ node -e '… rewrite captured_at to now−45d …'   # -> $S/pin-age45.json (captured_at 2026-09-20T11:10:22Z)
$ node $L/scripts/proxy-check.mjs --omp-shape $S/pin-age0.json   --json > $S/pin-age0.out
$ node $L/scripts/proxy-check.mjs --omp-shape $S/pin-age45.json  --json > $S/pin-age45.out
```

- age-0 terms:  `coverage_omp=10 source=snapshot O_members=65 O_findings=0 C1o_total=1`
- age-45 terms: `coverage_omp=10 source=snapshot O_members=65 O_findings=0 C1o_total=1`
- `diff pin-age0.out pin-age45.out` → a single differing line: `"durationMs": 75` vs `74`.
  The scoring JSON does not even carry `captured_at` (`grep -n captured_at scripts/*.mjs`
  → only `omp-census.mjs` touches the field; `proxy-check.mjs:331` imports
  `shapeFromFile` for entries only).
- Shape verdict on the aged pin: `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0
  bound=35/35 captured=2026-09-20 age_days=45)` — CLEAN at 45 days, age disclosed, ungated.
- Both proxy runs exit 1 with 7 pre-existing declared-vs-computed stanza findings
  (`A_DRIFT/C_DRIFT/C2_DRIFT/C2_TOTAL_DRIFT…` — the mid-wave scaffolding drift, identical
  in both outputs) — not age-attributable.
- The frozen counter's own `score-unchanged` arm independently reads
  `coverage_omp=10 source=snapshot` on its 45-day pin copy (§1).

**Verdict: the claim's central sentence HOLDS.** On every ungated surface (compare, shape,
proxy scoring) a 45-day receipt behaves byte-identically to a fresh one; only the opt-in
`--max-age` gate can change a verdict, and it exits 1/2 with its own tokens.

## 5. Suffix impact on exact-match consumers

Own grep of the lane + cross-check against `w1/K82ScoutReconC2.md` (present at report time;
its table §1 was re-verified line-by-line against my search):

- **Live consumers are all suffix-tolerant.** The tool's selftest (`has:` substring needles,
  e.g. `:808` ending at `changed=0`), the SKILL task grammar executed by
  `surface-probe.mjs:1070-1072` (`output.includes(expect)` + exit), the frozen
  `probe82-c2.mjs:109` `want()` (`includes` + exact exit), `probe81-c2.mjs:124,168`,
  `probe80-c2.mjs:240` — none anchor the line end. `proxy-check.mjs` never reads the compare
  line. Verified empirically: the counter passes 13/13 with the suffix live (§1).
- **Exactly two anchored consumers exist, both revision-bound historical instruments** in
  `.ufo/waves/round-78/probe/probe78-c2.mjs`: `:95` full-line equality
  (`line === 'OMP_SHAPE_COMPARE: IN_SYNC entries=64 receipt=64 added=0 removed=0 changed=0'`)
  and `:104` an EOL-anchored `/first=probe-extra$/` (F22 shows `first=` no longer ends the
  line). Both are frozen at round 78 and expected to fail closed at M; no live runner
  executes them against this tree.
- `scripts/receipt-evidence.mjs:188-191` re-runs a receipt's recorded argv inside
  `git archive <rev>` and compares `sha256(stdout)` — any round-82 close receipt quoting
  `--compare` must be minted at M, never back-filled from a pre-change run (scout §1 #9;
  unchanged by this review).
- Doc drift only: `corpus/knowledge/shape-receipt-live-drift.md:13`'s grammar template omits
  `transient=` and the new stamp; `SKILL.md:754` still labels the receipt contract v1.
  No parser reads either.
- Naming asymmetry worth recording: `--shape` prints `captured=<date>` (`:516`) while
  `--compare` prints `receipt_captured=<date>` (`:257`); the frozen arm
  `compare-v1-captured-absent` (`probe82-c2.mjs:119`) matches its `captured=absent` needle
  only as a substring of `receipt_captured=absent`. Two spellings for one field invite a
  future exact-match bug (gap 6).

## 6. Ranked gaps

1. **(High) Receipt-age custody: the gated/disclosed instant is unwitnessed prose.**
   Verified independently of the scout: commit `d140f288` (round-81 scaffolding) touches the
   pin in exactly 2 lines — `contract` v1→v2 plus one `captured_at` — over an `entries` array
   deep-equal (65/65, `JSON.stringify` comparison) to the pin at the commit's own parent
   (`git show d140f288^:.ufo/pins/omp-shape.json`, contract `kumitate-omp-shape-v1`; the
   round-80 rev `6d03402f` pin is the same bytes).
   No `OMP_SNAPSHOT: WROTE` receipt naming `.ufo/pins/omp-shape.json` exists in any round-8x
   artifact. A hand relabel over an unchanged root and a genuine re-snapshot produce the
   identical committed diff, and a coordinated relabel (receipt + `pin.omp-shape` in one L1
   commit) is invisible to every gate. So `--max-age` gates the *label*, not the *observation*.
   The C2 claim as written (disclose + opt-in gate the declared instant) still holds — but
   the evidentiary word "capture" overstates what the bytes witness. Recommend the close
   records this limit beside the knowledge caveat (scout §3 frames it the same way).
2. **(Medium) Ungated future asymmetry.** `--compare` without `--max-age` accepts a
   future-dated receipt (F26: exit 0, `age_days=-2` disclosed); `--shape` refuses one
   unconditionally (F28: `SHAPE_CLOCK`, exit 2). Only the gated compare path fails closed.
   Disclosed in the sibling knowledge entry per the scout — a design choice to ratify, not
   an undocumented bug; the disclosed negative age is honest. Risk profile: a caller that
   reads only the verdict token, not the age, on a clock-skewed host.
3. **(Medium, time-bombed) `SKILL.md:757` goes red on 2026-12-05.** The only in-lane opt-in
   age gate — `--shape .ufo/pins/omp-shape.json --max-age 30 && echo age-disclosed` — passes
   today (age 0) and fails on any checklist run after 2026-12-04 (age_days 31) because the
   pin's label is 2026-11-04 and the plan has no re-capture step. The wave's own checklist
   surface starts failing in a month; either schedule a re-capture or relax the bound.
4. **(Low) `--max-age` lexical laxity.** `Number()`-based parsing (`:448-451`) accepts
   `0x10`→16 days, `1e2`→100 days, `''`→0, `' '`→0, and duplicate flags (last wins) — none
   refused by the "non-negative integer" check (F19 + probes). A `/^\d+$/` grammar would
   make the gate's strictness match its purpose. All frozen arms pass; flagged for the L1
   as hardening, not claimed as a predicate violation.
5. **(Low) Exit-code ambiguity.** `SHAPE_STALE_RECEIPT` exits 1, the same code as DRIFT, on
   both paths; only the token disambiguates. Pre-existing shape-path convention; safe for
   token-parsing consumers (all live ones), hazardous for hypothetical exit-only consumers.
6. **(Low) Naming.** `captured=` vs `receipt_captured=` (§5) — cosmetic, but it already
   forces a substring-luck needle in the frozen counter.
7. **(Suite gap) Unpinned boundary and floor.** No committed selftest arm pins the equality
   boundary (F01) or the floor-before-compare behavior (F03); my adversarial coverage stands
   in, and the frozen counter's 45-vs-30/60 arms would still pass if either regressed.

## 7. Residual risk / verification gaps

- **Host-clock trust.** `receiptAgeDays` reads the process clock only; no NTP/external
  binding. A backwards skew yields negative ages caught solely by gated paths (F27/F28).
- The +1 s-future fixture (mandated case ii) is racy on this loaded host (F04/F05 measured
  `age_days=0` because subprocess startup exceeded 1 s); §3's injected-now proof and F26/F27
  are the authoritative evidence for sub-day-future semantics.
- I did not re-run `probe78-c2.mjs` at M (frozen historical instrument, expected fail-closed
  per the scout's read); inherited, low value.
- proxy-check's 7 stanza-drift findings predate this review and are byte-identical across the
  age-0/age-45 runs — mid-wave scaffolding state, not a C2 signal.
- No independent check of `receipt-evidence.mjs` re-minting behavior was run (it needs a
  receipt minted at M; none exists yet) — the constraint is documented for the close instead.

## 8. Verdict

C2 **holds as written** at M: 13/13 frozen arms, all eight mandated fixtures plus 21
adversarial extras behave as promised or better, the central sentence ("the age never
scores") is verified to byte-identical output at 0 vs 45 days, and every live consumer of
the compare line tolerates the new suffix. The ranked gaps are custody/evidentiary (1),
design-ratification (2), a dated checklist bomb (3) and hardening notes (4–7); none kills
the claim, all are routed here for the close.
