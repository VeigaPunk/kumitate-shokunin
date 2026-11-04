source: S242 https://www.rfc-editor.org/rfc/rfc3339.html; S237 https://www.rfc-editor.org/rfc/rfc9111.html
verified-at: 2026-11-04 (S242 capture .ufo/waves/round-83/build/L1/captures/rfc3339.html sha256 c53b2d12…, S237 capture .ufo/waves/round-81/build/L1/captures/rfc9111.html sha256 ce91ee98…; both opened this round)
recheck: 180d for S242; on-release for S237

# A self-asserted instant is judged on every path that uses it

Round 83, C2 (`coverage:omp`): `scripts/omp-census.mjs` judges a receipt's
self-asserted `captured_at` against its own clock on both paths that read an
instant — `--shape` and `--compare` — before either compares anything else. One
predicate, one question: is this instant in the reader's past? A bound the
caller names answers a different question and cannot be the guard.

## Principle

S242 §1 p.2 (capture line 99): "Date and time expressions indicate an instant in
time"; §1 (lines 155-156) defines a Timestamp as "an unambiguous representation
of some instant in time." The field is not a duration, a TTL, or a promise that
the work happened. S242 §5.6 (lines 409, 414) puts the zone in the text —
`time-offset = "Z" / time-numoffset`, `full-time = partial-time time-offset` —
so a reader never supplies one; the offset-less case is a separate class, owned
by `fail-closed-clock-validation.md` step 6.

S237 §5.1 (lines 2736-2738) makes age the reader's subtraction: "The 'Age'
response header field conveys the sender's estimate of the time since the
response was generated or successfully validated at the origin server." And the
value is typed non-negative (line 2745: "The Age field value is a non-negative
integer, representing time in seconds"; an invalid value SHOULD be ignored, line 2753).
A negative age is therefore not a small age — it is outside the type. Printing
it as a fresh reading fabricates a measurement; refusing it keeps the type.

Disclosed divergence: HTTP clamps apparent age at zero (S237 §4.2.3, line 2364:
`apparent_age = max(0, response_time - date_value)`) because origin and cache
are two clocks and skew is expected. A lane receipt is written and read by the
same host, so there is no second clock to excuse; the lane refuses. The clamp is
right where two clocks exist, the refusal where one does.

## Mechanism

`receiptAgeDays(doc, now = Date.now())` (`omp-census.mjs:226`) is the only place
a clock enters: `Math.floor((now - Date.parse(captured_at)) / 86400000)`, so
same-day is `0`. `clockRefusal(doc, ageDays)` (`:220`) returns `null` for an
absent or NaN age, else `captured_at=… age_days=…` when `ageDays < 0`.

`compareShape` (`:258`) calls it at `:270`, ahead of the `if (maxAge !== null)`
branch at `:275`; `runShape` (`:500`) calls it at `:511`. Both print
`SHAPE_CLOCK`, exit 2. Grammar is a separate, older layer: `validateShape`
(`:170`) requires `ISO_SECOND` (`:168`) and a finite parse (`:175`), so an
unparseable instant is `SHAPE_INVALID` before an age exists; the clock predicate
judges only instants that parsed.

The age never scores: `runCensus` (`:478`) never calls `receiptAgeDays`, and the
compare verdict is computed from metadata differences. On `--compare`, a named
bound can add `SHAPE_STALE_RECEIPT` (exit 1) or `SHAPE_AGE_UNKNOWN` (exit 2); it
cannot move a score.

## Counterexample class — the bound-only clock check

Round 82 put the clock inside the caller's bound: base `omp-census.mjs:258-266`
read `if (maxAge !== null) { … if (ageDays < 0) … }`. Unbounded, a future-dated
receipt compared clean and printed `age_days=-90`, a negative reading presented
as fresh. Measured at base `eb8e0095`: `compare-future-unbounded` FAIL,
`C83_C2: UNMET held=13/16` (`.ufo/waves/round-83/controls/c2-base.txt`).

The class generalises: a guard conditioned on an optional caller bound leaves the
default path unjudged, and "is it too old?" presupposes "is it an instant at
all?" — only the second is unconditional. Frozen arms pin it:
`compare-future-unbounded` (`probe83-c2.mjs:115`), `compare-clock-names-instant`
(`:117`), `clock-one-predicate` (`:127`, both paths on one receipt, both must
refuse).

## What this does not prove

- Direction, not truth: a backdated instant passes; the zero-run ceiling of
  `fail-closed-clock-validation.md` stands.
- The reference is the reader's clock. A reader behind the writer refuses a
  genuine receipt — the fail-closed direction, and it is stated in the refusal
  text rather than silent.
- S237 is quoted for the arithmetic of an age, not for HTTP caching semantics;
  this lane runs no cache.
