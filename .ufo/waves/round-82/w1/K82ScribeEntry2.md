# K82ScribeEntry2 — knowledge entry `receipt-age-on-the-compare-path.md`

Seat: scribe (leaf members; no subagents, no commits, no mutating git). Date 2026-11-04.
Lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Round-82 plan read at
`.ufo/waves/round-82/plan.md` (claims C1/C2, Amendment 1).

## Behavior

One new corpus file (the deliverable), and nothing else besides this report:

- `corpus/knowledge/receipt-age-on-the-compare-path.md` — 52 lines (`wc -l` → `52`), capped at 70.
  Provenance trio first (`source:`, `verified-at:`, `recheck:`), then five sections —
  disclosure, gate/refusals, non-scoring, custody, RFC asymmetry — and a four-row evidence table.
- No other lane file was created, edited, or deleted by this seat. Scratch fixtures lived under
  `/fast/scratch/hyaku/kumitate-r82/K82ScribeEntry2/` and are removed (verified absent).

The entry documents the compare path only; it asserts nothing about `--snapshot`, `--shape`
scoring, or the frozen counter's verdict.

## The S237 quote, located

Verbatim, 22 whitespace words (matching the row's `quote 22 words`; `printf … | wc -w` → `22`):

> The Age field value is the cache's estimate of the number of seconds since the origin server generated or validated the response.

Located in the capture `.ufo/waves/round-81/build/L1/captures/rfc9111.html` at lines **2295-2297**
(`grep -n "The Age field value\|is the cache's estimate\|or validated the response"`), inside
paragraph `id="section-4.2.3-1"` (`:2293`), under the heading `4.2.3. Calculating Age`
(`grep -n "name-calculating-age"` → `:2290`, `:2291`).

**Conflict, quoted verbatim.** `corpus/SOURCES.md:191` labels S237
`IETF RFC 9111 — HTTP Caching, Section 5.1 (Age)`. The capture's §5.1 paragraph
(`id="section-5.1-1"`, `:2735-2738`) reads:

> The "Age" response header field conveys the sender's estimate of the time since the response was generated or successfully validated at the origin server.

That is different wording; the 22-word sentence the row quotes stands in §4.2.3, not §5.1.
The pre-existing entry `corpus/knowledge/self-describing-shape-receipt.md:1` repeats the same
`§5.1 Age` attribution for the same sentence. I did not edit `SOURCES.md` (outside this seat's
write scope); the new entry cites §4.2.3 and records the row's own label in its `source:` line.

## Anchors used in the entry

| anchor | supports |
|---|---|
| `scripts/omp-census.mjs:257`, `:309` | stamp built (`receipt_captured`/`age_days`), printed on the compare line |
| `scripts/omp-census.mjs:215-219` | `receiptAgeDays` = `floor((now − Date.parse(captured_at))/86_400_000)` |
| `scripts/omp-census.mjs:255-257`, `:309` | v1 receipt → `absent/absent`, still grades |
| `scripts/omp-census.mjs:172` | `validateShape` admits v1 only as exactly `{contract,entries}` |
| `scripts/omp-census.mjs:309-310` | counts/transient unchanged; exit is drift-only |
| `scripts/omp-census.mjs:258` | gate opens only when `maxAge !== null` |
| `scripts/omp-census.mjs:456`, `:457` | non-negative integer; only with `--shape`/`--compare` |
| `scripts/omp-census.mjs:267-270` | `SHAPE_STALE_RECEIPT` exit 1 |
| `scripts/omp-census.mjs:273` | `readShape(root)` starts after the gate |
| `scripts/omp-census.mjs:259-261` | `SHAPE_AGE_UNKNOWN` exit 2 |
| `scripts/omp-census.mjs:263-265` | `SHAPE_CLOCK` exit 2 (also bound-gated) |
| `scripts/omp-census.mjs:503-506` | shape path keeps `SHAPE_STALE` exit 1 |
| `scripts/omp-census.mjs:225` | `snapshot` writes `captured_at` from the writer's clock |
| `scripts/proxy-check.mjs:56`, `:998-1002` | `coverage_omp = floor(10 × C1o/C1o_total × (O_members − O_findings)/O_members)`, entries/findings only |
| `.ufo/waves/round-82/probe/probe82-c2.mjs`, lines 135-144 | frozen arm `score-unchanged` expects `coverage_omp=10` on a 45-day receipt |
| `SCORECARD.md:331` | `pin.omp-shape=8b6aaa79…` |
| capture `:2295-2297`, `:2600-2606`, `:2364` | the RFC quote, §4.3.4 freshening, `apparent_age = max(0, response_time − date_value)` |

`.ufo`-rooted paths cannot own machine line refs in `cite-check` (tokens that resolve at the
`self` rung never set the sticky owner), so the capture's line numbers are prose ("lines N-M"),
not `:N-M` refs. This is disclosed rather than papered over.

## The asymmetry stated

The entry's §"The one asymmetry to RFC 9111" says, in full:

- the RFC sentence above, attributed to §4.2.3;
- "A cache measures from generation **or validation**: a 304 updates the stored response's
  headers (RFC 9111 §4.3.4 … lines 2600-2606), and §4.2.3 computes `apparent_age` from
  `date_value` (capture line 2364), so the age counts from the later event. This receipt has a
  capture event only and no validation event, so `age_days` cannot tell 'captured 45 days ago,
  re-checked yesterday' from 'captured 45 days ago, untouched'.";
- "The only validation analogue is a new snapshot: it replaces the evidence and resets the age
  to 0 instead of shortening it".

## Commands run and observed output

Fixtures (`$S/live` materialised from the pin's 65 entries — 57 files, 8 dirs, modes 644/600/755;
`aged-45.json` = pin with `captured_at` = now − 45 d; `v1.json` = `{contract:"kumitate-omp-shape-v1", entries}`):

```
node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json --root $S/live
  exit 0  OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0 receipt_captured=2026-11-04 age_days=0
node scripts/omp-census.mjs --compare $S/aged-45.json --root $S/live
  exit 0  OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0 receipt_captured=2026-09-20 age_days=45
node scripts/omp-census.mjs --compare $S/aged-45.json --root $S/live --max-age 30
  exit 1  OMP_SHAPE_COMPARE: SHAPE_STALE_RECEIPT entries=65 age_days=45 max_age=30
node scripts/omp-census.mjs --compare $S/aged-45.json --root $S/live --max-age 60
  exit 0  OMP_SHAPE_COMPARE: IN_SYNC … receipt_captured=2026-09-20 age_days=45
node scripts/omp-census.mjs --compare $S/v1.json --root $S/live
  exit 0  OMP_SHAPE_COMPARE: IN_SYNC … receipt_captured=absent age_days=absent
node scripts/omp-census.mjs --compare $S/v1.json --root $S/live --max-age 1
  exit 2  OMP_SHAPE_COMPARE: SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=1
```

```
sha256sum .ufo/pins/omp-shape.json
  8b6aaa79e24fc56f39afdff6488aadeffe909f4e58f6de03f32901333263dae7  .ufo/pins/omp-shape.json
grep -n "pin.omp-shape=" SCORECARD.md | head -1
  331:pin.omp-shape=8b6aaa79e24fc56f39afdff6488aadeffe909f4e58f6de03f32901333263dae7
sha256sum .ufo/waves/round-81/build/L1/captures/rfc9111.html
  ce91ee9848d2b9ac46386b0f0cbd4bfd9c0cd1948ebc363834cadc7e0997f3d7  .ufo/waves/round-81/build/L1/captures/rfc9111.html
git show 63b12695 -- scripts/omp-census.mjs   # +61/−9; only readShapeDoc swap, stamp, gate block, usage, dispatch, selftests
```

## Gates (observed; nothing here is claimed as passing)

- `node scripts/cite-check.mjs` → exit 1 (corpus pre-existing drift). Filtered to this file, the
  findings block is **empty** (the only line naming the file is its own header), i.e. this entry
  contributes zero errors and zero warnings. Earlier drafts did contribute: one `PIN_MISMATCH`
  (the pin attached to `scripts/proxy-check.mjs` because `.ufo` paths never own pins) and 20
  `ORPHAN_REF` chains; both were repaired in the file, not waived.
- `node scripts/sources-check.mjs` → exit 0, `SOURCES_CHECK: CLEAN (rows=177 tiers=A:150,B:17,C:10 status=queued:13,mined:142,rejected:22 entries_with_source=36 legacy=38)`;
  the file appears 0 times in the output. At the first run (before another seat touched the
  registry) it emitted
  `SOURCES warn USED_BY_ASYMMETRY corpus/knowledge/receipt-age-on-the-compare-path.md:1 S237 used-by omits …`.
  `corpus/SOURCES.md:191` now names both entries in S237's used-by — observed mid-work, not my edit.
- `node scripts/readme-map.mjs` → exit 1,
  `README_MAP: DRIFT files=206 rows=205 covered=205 bad=2 first=uncovered:knowledge/handoff-binding-and-liveness.md`.
  This file is not the first uncovered item: `corpus/README.md:210` already carries its row and
  `.ufo/pins/readme-map.json`'s covered set includes `knowledge/receipt-age-on-the-compare-path.md`
  (`n=205`) — both added by another seat while this seat worked, not by me.
- Not run by this seat: `probe82-c1.mjs` / `probe82-c2.mjs` (the L1's close evidence) and any
  build/test/lint outside the three read-only gates above. No counters were scored.

## Touched surfaces

- Added: `corpus/knowledge/receipt-age-on-the-compare-path.md` (untracked).
- Added: this report.
- Scratch: created and deleted under `/fast/scratch/hyaku/kumitate-r82/K82ScribeEntry2/`.
- Not touched: `.ufo/waves/round-82/{plan.md,probe,open,controls}`, `.ufo/state`, `.ufo/pins`,
  `corpus/SOURCES.md`, `corpus/README.md`, `scripts/`, `SKILL.md`, `SCORECARD.md`, `LOG.md`, the
  fleet repo, sibling lanes, `.scratch/`. `git status` shows modifications by other seats
  (`ready-handoff.mjs`, `SCORECARD.md`, `SKILL.md`, `corpus/{QUALITY,README,SOURCES,lessons/round-81}.md`,
  `.ufo/pins/readme-map.json`) — none of them are mine.

## Out of scope (deliberately not done)

- No edit to `corpus/SOURCES.md` (S237's §5.1 label stays as frozen), `corpus/README.md`,
  `.ufo/pins/*`, `SKILL.md`, `SCORECARD.md`, `LOG.md`, or `scripts/` — those are the L1's or other
  seats' surfaces.
- No run of the frozen counters, no claim about `C82_C1`/`C82_C2`, no wave admission verdict.
- No commit, push, or any mutating git/jj command; the new file is left untracked for the L1.

## Findings

- **F1 — S237's section label is wrong.** The quoted sentence is §4.2.3 (`capture:2290-2297`);
  `SOURCES.md:191` says `Section 5.1 (Age)`, whose paragraph (`:2735-2738`) is worded differently.
  Same mis-attribution recurs at `corpus/knowledge/self-describing-shape-receipt.md:1`. Needs a
  registry correction by the L1; the new entry records both facts rather than copying the label.
- **F2 — the row's `quote 22 words` matches the §4.2.3 sentence**, so only the section number is
  wrong, not the quoted text.
- **F3 — `.ufo` line refs cannot be machine-checked** by `cite-check` (no sticky owner from a
  `self`-rung token); the capture anchors are therefore prose. Any later knowledge entry citing
  `.ufo/...:N` will silently carry unverified refs.
- **F4 — the entry is integrated by another seat's edits**: README row, covered member, and the
  S237 used-by extension all appeared while this seat worked. This report claims none of them.

## Tooling

None installed or updated (no `pacman`, no `uv tool`, no `npx`). Node used as found:
`/run/user/1000/fnm_multishells/2386449_1793790049377/bin/node`.

## Artifacts

- `corpus/knowledge/receipt-age-on-the-compare-path.md` (the deliverable)
- `.ufo/waves/round-82/w1/K82ScribeEntry2.md` (this report)
