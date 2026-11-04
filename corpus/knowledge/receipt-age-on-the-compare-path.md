source: S237 — IETF RFC 9111, §4.2.3 *Calculating Age* (https://www.rfc-editor.org/rfc/rfc9111.html, opened 2026-11-04; row S237 labels it "Section 5.1 (Age)" — the quoted sentence stands in §4.2.3, capture `.ufo/waves/round-81/build/L1/captures/rfc9111.html:2295-2297`, `sha256 ce91ee98…f3d7`); own-work — `scripts/omp-census.mjs` (`compareShape`, `receiptAgeDays`, `validateShape`), `.ufo/pins/omp-shape.json`, `pin.omp-shape`
verified-at: 2026-11-04 — `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json --root <scratch copy of the 65 members>` → `OMP_SHAPE_COMPARE: IN_SYNC … receipt_captured=2026-11-04 age_days=0` exit 0; the same members with `captured_at` 45 days back → `… age_days=45` exit 0; `--max-age 30` → `SHAPE_STALE_RECEIPT entries=65 age_days=45 max_age=30` exit 1; `--max-age 60` → `IN_SYNC … age_days=45` exit 0; a v1 receipt → `… receipt_captured=absent age_days=absent` exit 0; v1 + `--max-age 1` → `SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=1` exit 2
recheck: `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` at the next lane tip; re-read RFC 9111 §4.2.3 only if the RFC is superseded (cadence 180d)

# Receipt age on the compare path

`--compare` diffs a receipt's `{name,kind,mode}` set against a live root. Round 82 puts the receipt's own age on that verdict line and adds an opt-in staleness gate; the comparison itself is unchanged.

## What `--compare` discloses

- The line gains ` receipt_captured=<YYYY-MM-DD> age_days=<n>` after `transient=` (`scripts/omp-census.mjs:257` builds the stamp, `scripts/omp-census.mjs:309` prints it).
- `receipt_captured` is the receipt's own `captured_at` cut to its date; `age_days` is `floor((now − Date.parse(captured_at)) / 86_400_000)` (`receiptAgeDays`, `scripts/omp-census.mjs:215-219`).
- A legacy `kumitate-omp-shape-v1` receipt has no instant: `receipt_captured=absent age_days=absent` (`scripts/omp-census.mjs:255-257`) and the compare still grades (`scripts/omp-census.mjs:309`); `validateShape` admits v1 only as exactly `{contract,entries}` (`scripts/omp-census.mjs:172`).
- Counts, the transient filter and the 0/1/2 exit map are unchanged (`scripts/omp-census.mjs:309-310`); inside `compareShape` the round-82 diff adds only the disclosure and the gate.

## What `--max-age` gates and refuses

- Off by default: the gate opens only when `maxAge !== null` (`scripts/omp-census.mjs:258`); a 45-day receipt still grades without the flag.
- The value must be a non-negative integer (`scripts/omp-census.mjs:456`) and only rides `--shape` or `--compare` (`scripts/omp-census.mjs:457`).
- Past the bound: `SHAPE_STALE_RECEIPT entries=<n> age_days=<d> max_age=<m>`, exit 1 (`scripts/omp-census.mjs:267-270`) — the gate sits before `readShape(root)` at `scripts/omp-census.mjs:273`, so a stale receipt is refused without touching the live root.
- Legacy v1 plus a bound: `SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=<m>`, exit 2 (`scripts/omp-census.mjs:259-261`) — it refuses to guess an age it does not have.
- Future instant plus a bound: `SHAPE_CLOCK age_days=<negative> max_age=<m>`, exit 2 (`scripts/omp-census.mjs:263-265`); without a bound the negative age prints and the compare grades.
- The `--shape` path keeps a different token: `SHAPE_STALE age_days=<d> max_age=<m>`, exit 1 (`scripts/omp-census.mjs:503-506`).

## Why the age never scores

- Compare's exit stays drift-only (`return drift ? 1 : 0`, `scripts/omp-census.mjs:310`); the age is a print, not an input.
- `coverage:omp = floor(10 × C1o/C1o_total × (O_members − O_findings)/O_members)` (`scripts/proxy-check.mjs:56` formula, `scripts/proxy-check.mjs:998-1002` derivation), over census entries and findings — never `captured_at`.
- Frozen arm `score-unchanged` ages the lane's own pinned receipt by 45 days and still expects `coverage_omp=10` (`.ufo/waves/round-82/probe/probe82-c2.mjs`, lines 135-144).

## Custody: the pin carries the bytes, not the clock

- `captured_at` is written from the writer's own clock (`snapshot`, `scripts/omp-census.mjs:225`); nothing signs it, so a re-label is invisible to the age.
- The pin is what binds: `.ufo/pins/omp-shape.json` is the value `pin.omp-shape` declares — `8b6aaa79…dae7` (`SCORECARD.md:331`); a re-labelled receipt is different bytes, so it must re-pin in the same commit and shows in the diff.
- Age answers "when was this written", not "was this true".

## The one asymmetry to RFC 9111

- "The Age field value is the cache's estimate of the number of seconds since the origin server generated or validated the response." (§4.2.3; capture `.ufo/waves/round-81/build/L1/captures/rfc9111.html`, lines 2295-2297).
- A cache measures from generation **or validation**: a 304 updates the stored response's headers (RFC 9111 §4.3.4, capture `.ufo/waves/round-81/build/L1/captures/rfc9111.html`, lines 2600-2606), and §4.2.3 computes `apparent_age` from `date_value` (capture line 2364), so the age counts from the later event. This receipt has a capture event only and no validation event, so `age_days` cannot tell "captured 45 days ago, re-checked yesterday" from "captured 45 days ago, untouched".
- The only validation analogue is a new snapshot: it replaces the evidence and resets the age to 0 instead of shortening it; the RFC's freshness arithmetic transfers as a consumer-declared gate, not as a claim that the surface is current.

## Evidence (run 2026-11-04)

| reading | command → observed |
|---|---|
| age 0, ungated | `--compare .ufo/pins/omp-shape.json --root <copy>` → `IN_SYNC … receipt_captured=2026-11-04 age_days=0` exit 0 |
| 45 d, ungated | same members, `captured_at` backdated 45 d → `IN_SYNC … receipt_captured=2026-09-20 age_days=45` exit 0 |
| stale refused | `--max-age 30` → `SHAPE_STALE_RECEIPT entries=65 age_days=45 max_age=30` exit 1 |
| v1 refused under a bound | v1 receipt, `--max-age 1` → `SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=1` exit 2 |

Fixture receipts were written under `$HYAKU_SCRATCH` and deleted; neither was scored.

## Amendment 2026-11-04 (round 83) — the clock is judged on every compare

Superseded text, named: the bullet *"Future instant plus a bound: `SHAPE_CLOCK age_days=<negative>
max_age=<m>`, exit 2 …; without a bound the negative age prints and the compare grades"* and the bullet
*"Compare's exit stays drift-only (`return drift ? 1 : 0`, `scripts/omp-census.mjs:310`); the age is a
print, not an input."*

Round 83 replaces both with one clock predicate (`clockRefusal`, `scripts/omp-census.mjs`, round-83
revision): a future (or unparseable) instant refuses **with or without** `--max-age`, printing
`OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=<instant> age_days=<negative>` and exiting 2 before any
comparison; `--shape` prints the same predicate as `SHAPE_CLOCK captured_at=<instant> age_days=<n>`
(exit 2). Exit 1 remains drift-only; exit 2 now has two classes on the compare path (`SHAPE_NOT_FOUND`
and `SHAPE_CLOCK`). The age still never scores — the round-82 arm `score-unchanged` keeps reading
`coverage_omp=10` on a 45-day receipt. Frozen counter: `.ufo/waves/round-83/probe/probe83-c2.mjs`
(16 arms). Evidence: `corpus/lessons/round-83.md`, `scripts/omp-census.mjs --selftest` (108 cases).
