# K83ScribeClock — knowledge entry (round-83 w1, C2 supplement)

Seat write scope honoured: this report plus `corpus/knowledge/self-asserted-instants.md`.
Nothing else in the lane was modified; `corpus/SOURCES.md`, the frozen probes and the
frozen controls are untouched.

## Deliverable

- `corpus/knowledge/self-asserted-instants.md` — 79 lines (`wc -l`), header trio on lines
  1-3 (`source:` S242 + S237, `verified-at:` 2026-11-04, `recheck:` 180d / on-release).
- `ENTRY: admitted` (below, with the gate line that supports it).

## What I ran (exact)

```
mkdir -p /fast/scratch/hyaku/kumitate-r83/K83ScribeClock
sha256sum .ufo/waves/round-83/build/L1/captures/rfc3339.html
sha256sum .ufo/waves/round-81/build/L1/captures/rfc9111.html
git show eb8e00956e7a282cb2b53a5bc53e1afa1d0e7fcf:scripts/omp-census.mjs \
  > /fast/scratch/hyaku/kumitate-r83/K83ScribeClock/base-omp-census.mjs      # read-only
TMPDIR=/fast/scratch/hyaku/kumitate-r83/K83ScribeClock \
  node .ufo/waves/round-83/probe/probe83-c2.mjs --set c2 \
  --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  --work /fast/scratch/hyaku/kumitate-r83/K83ScribeClock/work
node scripts/sources-check.mjs
wc -l corpus/knowledge/self-asserted-instants.md
# admission before-read (truncated copy: corpus only)
S=/fast/scratch/hyaku/kumitate-r83/K83ScribeClock/pre
mkdir -p "$S/corpus/knowledge"
cp corpus/SOURCES.md "$S/corpus/SOURCES.md"
cp corpus/knowledge/*.md "$S/corpus/knowledge/"
rm "$S/corpus/knowledge/self-asserted-instants.md"
node scripts/sources-check.mjs --self "$S" --json
```

Working directory for every command: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
No mutating git command was run (`git show` only). Scratch root
`/fast/scratch/hyaku/kumitate-r83/K83ScribeClock/` was created with `mkdir -p`, received
the base blob and the counter's `--work` fixtures, and was deleted before this report was
written.

## What I observed (exact lines)

### Frozen counter, live at the working tree

```
C83_C2 arm compare-future-unbounded ok exit=2 want="SHAPE_CLOCK" out=OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=2027-02-02T12:04:27Z age_days=-90
C83_C2 arm compare-future-bounded ok exit=2 want="SHAPE_CLOCK" out=OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=2027-02-02T12:04:27Z age_days=-90
C83_C2 arm compare-clock-names-instant ok exit=2 want="captured_at=2027-02-02T12:04:27Z" out=OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=2027-02-02T12:04:27Z age_days=-90
C83_C2 arm shape-clock-regression ok exit=2 want="SHAPE_CLOCK" out=SHAPE_CLOCK captured_at=2027-02-02T12:04:27Z age_days=-90
C83_C2 arm clock-one-predicate ok shape=2 compare=2
C83_C2: HELD held=16/16
exit=0
```

### Frozen base control (`eb8e0095`), read from `.ufo/waves/round-83/controls/c2-base.txt`

```
C83_C2 arm compare-future-unbounded FAIL exit=0 want="SHAPE_CLOCK" out=OMP_SHAPE_COMPARE: IN_SYNC entries=2 receipt=2 added=0 removed=0 changed=0 transient=0 receipt_captured=2027-02-02 age_days=-90
C83_C2 arm compare-clock-names-instant FAIL exit=2 want="captured_at=2027-02-02T11:59:40Z" out=OMP_SHAPE_COMPARE: SHAPE_CLOCK age_days=-90 max_age=30
C83_C2 arm clock-one-predicate FAIL shape=2 compare=0
C83_C2 arm shape-clock-regression ok exit=2 want="SHAPE_CLOCK" out=SHAPE_CLOCK captured_at=2027-02-02T11:59:40Z is in the future
C83_C2: UNMET held=13/16
```

### Base code, extracted with `git show`

`/fast/scratch/.../base-omp-census.mjs:258-266`:

```
  if (maxAge !== null) {
    if (ageDays === null) {
      io.out(`OMP_SHAPE_COMPARE: SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=${maxAge}`);
      return 2;
    }
    if (ageDays < 0) {
      io.out(`OMP_SHAPE_COMPARE: SHAPE_CLOCK age_days=${ageDays} max_age=${maxAge}`);
      return 2;
    }
```

`/fast/scratch/.../base-omp-census.mjs:168-176` (`ISO_SECOND`, `validateShape`) already
required `ISO_SECOND.test(doc.captured_at)` **and** `!Number.isNaN(Date.parse(...))` at the
base tree.

`/fast/scratch/.../base-omp-census.mjs:497-501` (`runShape`): inline `if (age < 0)` printing
`SHAPE_CLOCK captured_at=${doc.captured_at} is in the future`.

### Source gate

```
SOURCES  warn  USED_BY_ASYMMETRY  corpus/knowledge/self-asserted-instants.md:1  S242 used-by omits corpus/knowledge/self-asserted-instants.md
SOURCES  warn  USED_BY_ASYMMETRY  corpus/knowledge/self-asserted-instants.md:1  S237 used-by omits corpus/knowledge/self-asserted-instants.md
SOURCES_CHECK: CLEAN (rows=180 tiers=A:153,B:17,C:10 status=queued:16,mined:142,rejected:22 entries_with_source=38 legacy=38)
exit=0
```

`ENTRY: admitted` — the gate counts the new file as a new sourced identity and emits no
error row for it. Before/after, measured:

```
# before: corpus/SOURCES.md + corpus/knowledge/*.md copied to scratch, this entry removed
node scripts/sources-check.mjs --self /fast/scratch/hyaku/kumitate-r83/K83ScribeClock/pre --json
→ {"entriesWithSource":37,"legacy":38,...}
# after, live lane: entries_with_source=38 legacy=38, CLEAN, exit 0
```

`legacy=38` is unchanged by the new file (the legacy list is frozen in
`scripts/sources-check.mjs`), which is the point: the entry is counted as a new sourced
identity, not absorbed into the exemption. The before-read's own verdict is
`DRIFT (USED_BY_MISSING)` because the scratch copy holds only `corpus/` and its `used-by`
paths (lessons, probes) do not exist there — a copy artifact, not a lane reading; only its
two counts are used. The entry's only gate lines are the two advisory `USED_BY_ASYMMETRY`
warnings — `warn` class, exit 0, not promoted without `--strict`.

### Capture hashes

```
c53b2d121b9f284e2cb28e2989c907470ae26a9db441bcd8a3236c6004a60bee  .ufo/waves/round-83/build/L1/captures/rfc3339.html
ce91ee9848d2b9ac46386b0f0cbd4bfd9c0cd1948ebc363834cadc7e0997f3d7  .ufo/waves/round-81/build/L1/captures/rfc9111.html
```

`c53b2d12…` matches the plan's pin and the S242 row; the S237 row records no hash, so
`ce91ee98…` is this seat's measurement of the file the row points at (4433 lines).

## Claim map — every entry claim and its anchor

| Entry claim | Anchor |
|---|---|
| An expression denotes an instant, not a duration/TTL | S242 §1 p.2, capture line 99 (`Date and time expressions indicate an instant in time.`); §1 lines 155-156 (`unambiguous representation of some instant in time`) |
| The zone is part of the textual instant; offset-less is a separate class | S242 §5.6, capture lines 409/414 (`time-offset = "Z" / time-numoffset`; `full-time = partial-time time-offset`); delegated to `fail-closed-clock-validation.md` step 6 |
| Age is the reader's subtraction against its own clock | S237 §5.1, capture lines 2736-2738 |
| An age is typed non-negative; invalid values are not readings | S237 §5.1, capture lines 2745 (`non-negative integer`) and 2753 (`SHOULD` ignore a value that is not a non-negative integer) |
| HTTP clamps apparent age at zero — the divergence the entry discloses | S237 §4.2.3, capture line 2364 (`apparent_age = max(0, response_time - date_value)`) |
| One clock entry point, floored to whole days | `scripts/omp-census.mjs:226` `receiptAgeDays` |
| One predicate, negative-only refusal naming instant + age | `scripts/omp-census.mjs:220` `clockRefusal` |
| Two unconditional callers | `compareShape` `:258`, call at `:270`, before `if (maxAge !== null)` `:275`; `runShape` `:500`, call at `:511` |
| Grammar is a separate older layer (`SHAPE_INVALID` before any age) | `validateShape` `:170`, `ISO_SECOND` `:168`, finite parse `:175` |
| The age never scores | `runCensus` `:478` never calls `receiptAgeDays`; only call sites are `:266` and `:510` |
| Counterexample class = bound-only check; base measured 13/16 | base `omp-census.mjs:258-266`; `controls/c2-base.txt` (`compare-future-unbounded` FAIL, `held=13/16`) |
| Frozen arms pin the class | `probe83-c2.mjs:115` (`compare-future-unbounded`), `:117` (`compare-clock-names-instant`), `:127` (`clock-one-predicate`) |

## Findings (disclosed, not edited — frozen text is the L1's to amend)

1. **Plan §C2 prose over-states the base defect.** plan.md says v2 leaves "a malformed
   `captured_at` … never refused on the compare path". Measured at `eb8e0095`,
   `validateShape` (base `:168-176`) already refused a malformed or NaN `captured_at` as
   `SHAPE_INVALID` (exit 2) on **both** paths, before any age is computed. The base hole is
   narrower and real: a *parseable* future instant with no `--max-age` reads
   `IN_SYNC … age_days=-90` (`compare-future-unbounded` FAIL above). The entry is written to
   the measured mechanism (grammar layer vs clock layer), not to the plan's sentence.
   Reported verbatim; plan and counter unedited.
2. **`probe83-c2.mjs` header comment disagrees with its own constant.** Header: "prints
   `C83_C2: HELD held=15/15`"; `ARMS = 16` and the live run prints
   `C83_C2: HELD held=16/16`. Plan and task both say 16. Textual only; the counter's verdict
   is 16/16. Frozen counter, not edited.
3. **The `--shape` refusal text changed shape** (not just placement): base
   `SHAPE_CLOCK captured_at=… is in the future` (`runShape`, base `:499`) → v3
   `SHAPE_CLOCK captured_at=… age_days=…` (`clockRefusal`). Consumer check:
   `.ufo/waves/round-81/probe/probe81-c2.mjs:152` asserts only
   `r.code === 2 && r.out.includes('SHAPE_CLOCK')`, so it still passes; no live `.mjs`/`.sh`
   in the lane parses the `is in the future` tail (grep over `scripts/`, `corpus/`, probes;
   only historical round-81 receipts and prose contain it). The old text survives only as
   recorded evidence in `.ufo/waves/round-81/**`.
4. **Two `USED_BY_ASYMMETRY` warnings name my entry.** The S242 and S237 used-by cells do not
   name `corpus/knowledge/self-asserted-instants.md`. Fixing them means editing
   `corpus/SOURCES.md`, which this seat is forbidden to touch; the serviced rows belong to
   the connector / L1. Advisory only (exit 0).
5. **S242 is still `queued` in the registry** (`status=queued:16` in the gate line). Status
   promotion is a registry edit, out of this seat's scope; the entry cites the row that the
   round opened for exactly this quote.

## What I could not verify

- **The sources themselves over the network.** No fetch this seat; the entry is bound to the
  capture bytes by the two hashes above, and to the capture line numbers. An RFC line number
  is a line in the saved HTML, not a page number in the printed RFC.
- **Line stability at M.** The entry cites `scripts/omp-census.mjs` line numbers measured in
  the working tree at the time of writing. If the work commit inserts lines above
  `clockRefusal`/`compareShape`/`runShape`, the function names still hold but the numbers
  drift; a re-pin at M is the reviewer's step, and the entry names every function alongside
  its line for that reason.
- **`coverage:omp` = 10.** Not re-derived here. The local fact the entry relies on is
  negative: `runCensus` never reads `captured_at` and no branch feeds an age into a score.
- **The C1 side of the round** (ready-handoff v3) — not this seat's surface; no arm of
  `probe83-c1.mjs` was run.

## Tooling record

No install or upgrade. `pacman` unused (paused host-wide); no `uv tool`, `npx`, or binary
drop touched any PATH directory. Node came from the host as-is.
