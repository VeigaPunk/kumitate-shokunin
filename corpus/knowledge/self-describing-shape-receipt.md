source: S237 — IETF RFC 9111, *HTTP Caching* §5.1 Age / §4.2 Freshness (https://www.rfc-editor.org/rfc/rfc9111.html, opened 2026-11-04); own-work — `scripts/omp-census.mjs` (`kumitate-omp-shape-v2`), `.ufo/pins/omp-shape.json`, `.ufo/waves/round-81/probe/probe81-c2.mjs`
verified-at: 2026-11-04 — `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` → `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-11-04 age_days=0)` exit 0; `--shape <45-day receipt> --max-age 30` → `SHAPE_STALE age_days=45 max_age=30` exit 1; `--selftest` → `VERDICT: PASS (97 cases)`; frozen counter `C81_C2: HELD held=15/15`
recheck: re-run the counter and re-capture the receipt at the next lane tip; re-open S237 only if RFC 9111 is superseded (cadence 180d)

# Self-describing shape receipt

## The rule

A receipt that stands in for a live surface **carries its own capture instant**,
and the consumer **declares** the freshness it accepts. Round 80 bound the OMP
plane's score to a committed shape receipt and disclosed `source=snapshot`; the
receipt still had no `captured_at`, so a closure reading it months later could
not tell whether the live root had moved. Round 81 versions the receipt:

- `kumitate-omp-shape-v2` = `{contract, captured_at, entries}` —
  `captured_at` an ISO second (`validateShape`, `omp-census.mjs:170`;
  `readShapeDoc`/`shapeFromFile` at `:197`/`:211`).
- `--snapshot` stamps the instant at write time (`snapshot`, `:221`) inside the
  same tmp+rename pair that makes the bytes atomic; a second snapshot of the
  same root differs only in `captured_at`.
- `--shape` discloses `captured=<date> age_days=<n>` on its verdict line
  (`runShape`, `:492`) and computes the age from the receipt's own field
  (`receiptAgeDays`, `:216`).
- `--max-age DAYS` is the opt-in staleness gate: over the window it prints
  `SHAPE_STALE age_days=<n> max_age=<d>` (`:481`) and exits 1. Without the
  flag a stale receipt still grades the census and exits 0.
- Two refusal classes: a v1 receipt is `SHAPE_VERSION want=kumitate-omp-shape-v2
  got=kumitate-omp-shape-v1` exit 2 (`:470`), and an instant in the future is
  `SHAPE_CLOCK` exit 2 (`:475`). `--compare` stays report-only and still reads a
  legacy v1 receipt.

## Why age, and why it never scores

RFC 9111 gives the reusable shape: "The Age field value is the cache's estimate
of the number of seconds since the origin server generated or validated the
response", and freshness is a **consumer decision** against the
`freshness_lifetime` it declares — a response is fresh while "its age has not
yet exceeded its freshness lifetime." The receipt is the stored response; the
closure is the consumer; `--max-age` is the declared lifetime. Making the age
part of the score would be the wrong move: a score that decays on a timer is
not a measurement of the plane, it is a measurement of when someone last ran a
snapshot. `coverage:omp` therefore stays `floor(10 × C1o/C1o_total ×
(O_members − O_findings)/O_members)` and a 45-day-old receipt still reads 10
(`close/c2-probe.txt` arm `stale-does-not-score`).

## What age cannot prove

`captured_at` is self-asserted by the writer: a forger can re-label an old
snapshot with today's instant, and the gate cannot tell. The custody chain is
the pin, not the field — `pin.omp-shape` in `kumitate-gate-pins-v1` binds the
receipt's bytes, so a re-labelled receipt is a *new receipt* that re-pins in the
same commit and shows in the diff. Age answers "when was this taken", not "was
this honest".

## Evidence

| claim | command | result |
|---|---|---|
| receipt is v2 | `python3 -c "import json;d=json.load(open('.ufo/pins/omp-shape.json'));print(d['contract'])"` | `kumitate-omp-shape-v2` |
| age disclosed | `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` | `… captured=2026-11-04 age_days=0` exit 0 |
| stale gate | `--shape <45-day> --max-age 30` | `SHAPE_STALE age_days=45 max_age=30` exit 1 |
| legacy refused | `--shape <v1>` | `SHAPE_VERSION …` exit 2 |
| clock refused | future `captured_at` | `SHAPE_CLOCK` exit 2 |
| suite | `--selftest` | `VERDICT: PASS (97 cases)` |

## Boundary

`scripts/omp-census.mjs` is the only writer and reader of the receipt; the proxy
consumes it through `readShapeDoc`/`shapeFromFile` in process and derives the
same six O terms as round 76. The registry row is `omp-census` in `SKILL.md`;
the pin is `pin.omp-shape`; the frozen counter is `C81_C2` in
`.ufo/waves/round-81/probe/probe81-c2.mjs`.
