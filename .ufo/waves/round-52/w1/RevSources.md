# RevSources — round 52 review of the SOURCES gate surfaces (read-only)

Seat: RevSources (reviewer, leaf). Scope: `scripts/sources-check.mjs` semantics (D52 check E4),
the `corpus/SOURCES.md` header schema, and per-row compliance of the proposed S102/S103 rows
against that schema. No lane file was modified; all experiments ran in
`build/RevSources/sbx*` copies of `corpus/`.

## Verdict

**The rows as drafted (`build/ScribeSources/SOURCES-delta.md`, verbatim) keep
`SOURCES_CHECK: CLEAN` — measured, not inferred — but only if the C2 entry is committed in the
same commit.** Measured with the two delta rows byte-for-byte plus an entry whose first line is
`source:` citing S102/S103 and the rfc-editor URL:

```
SOURCES_CHECK: CLEAN (rows=103 tiers=A:88,B:7,C:8 status=queued:12,mined:75,rejected:16
entries_with_source=9 legacy=38)
```

exit 0, zero findings attributable to S102/S103; E3 simulation `S102=true S103=true`;
`sources-census.sh validate` exit 0 with only the four pre-existing W04s (S034/S068/S084/S095).
Same rows **without** the entry: `SOURCES_CHECK: DRIFT (USED_BY_MISSING)` exit 1 on both rows.

## What `SOURCES_CHECK: CLEAN` actually verifies (contract `kumitate-sources-v1`)

Verified (each measured or read from `scripts/sources-check.mjs:172-400`):

- **Column shape — positional only.** A Registry row must split on `|` into exactly 13 fields
  (11 cells): `ROW_MALFORMED` otherwise (`sources-check.mjs:246-249`). Column *names/order* in the
  header are never compared; the header row is skipped only when its first cell is exactly `id`
  or a `---` separator. A 4-space-indented row is invisible (not parsed, not counted); 1–3 spaces
  are normalized (measured).
- `id` shape `^S\d{3,}$` and duplicate ids.
- All ten non-id cells non-empty (`—` counts as non-empty); duplicate field reporting.
- `kind` enum (10 values), `tier` ∈ {A,B,C}, `status` ∈ {queued,mined,rejected}.
- **Tier**: enum only, plus `community`+`A` → `TIER_INFLATION`. Tier honesty beyond that is not
  machine-checkable; tier C + mined + non-`—` used-by passes here (census warns W01).
- `opened` real proleptic-Gregorian ISO date ≤ today (UTC at module load); `recheck` ISO date,
  `Nd`, or `on-release`.
- `mined` → used-by non-empty and ≠ `—`, and **every** comma-split path exists on disk,
  repo-relative, no `..`/absolute escape (`repoPathExists`).
- `rejected` → teaches contains `REJECTED:` and `flip:`.
- The four `##` sections; knowledge-file headers (physical line 1 starts `source:`; non-empty
  `source:`/`verified-at:`/`recheck:` within the first five lines; cited S-ids declared).
- **Warn-only (do not fail E4 in default mode):** `USED_BY_ASYMMETRY`, `RECHECK_OVERDUE`.
  E4 runs `node scripts/sources-check.mjs` with no `--strict` (`doctrine52-probe.mjs:112`), so
  warnings cannot break it.

**Not verified anywhere in sources-check:** duplicate URLs (no such finding kind), URL syntax,
header column names/count, cell length, tier honesty beyond community-A, `teaches` quality.
Duplicate URLs are caught only by the **census** used for E5: `E04` same normalized URL **within
the same `scope`** is an error (census exit 1), `W04` same URL across scopes is a warning (exit 0).

## Per-row compliance (delta bytes, measured)

| check | S102 | S103 |
|---|---|---|
| id `S102`/`S103` unused (max existing S101, 101 rows) | PASS | PASS |
| 13 split fields / 11 cells, no `|` in any cell | PASS (13) | PASS (13) |
| inside `## Registry` (append after line 114, before `## Paths` at 117) | PASS as drafted | PASS as drafted |
| `kind` enum | `spec` PASS | `docs` PASS |
| `tier` | `A` PASS; honest (RFC = Standards Track spec; contract A = spec) | `B` PASS; honest (MDN restates JS behaviour, not normative ECMA-262; contract B = strong secondary) — not `community`, so no inflation path |
| `status` + used-by | `mined` + exact entry path PASS | `mined` + exact entry path PASS |
| `opened` 2026-10-24 (≤ today UTC) | PASS | PASS |
| `recheck` 180d (cadence; opened+180d not overdue) | PASS | PASS |
| cells non-empty, anchors not bare homepages | PASS | PASS |
| duplicate URL vs existing 101 rows | none (no rfc-editor/rfc3339 row exists) | none (no MDN/Date.parse row exists) |
| E3 (`status=mined` + used-by contains entry) | PASS | PASS |

The delta's own byte-level claim ("12 pipes, 13 split fields, no pipe inside a cell") is correct
for both lines (independently measured). S102 `recheck=180d` and S103 `recheck=180d` differ from
the plan's loose "on-release" example but are contract-valid and produce no warning today.

## Findings, by severity

1. **HIGH — rows must land with the entry (or after it) or E4 goes red.** Measured: rows-only
   commit → `USED_BY_MISSING` on both rows (exit 1, DRIFT) and E3 both false. The delta records
   this as its own F2; my measurement confirms it exactly. Integration ordering is a
   correctness requirement, not a nicety.
2. **HIGH — the un-corrected scout file would fail E4.** `build/ScoutRfc3339/sources-row.txt`
   encodes `kind=standard` → `KIND_ENUM` (E05) → DRIFT. The delta correctly promotes
   `sources-row-spec.txt` (`kind=spec`) and documents the swap; integration must take the delta
   block (or `sources-row-spec.txt`), never `sources-row.txt`. Measured: the invalid row yields
   `SOURCES_CHECK: DRIFT (KIND_ENUM)`.
3. **HIGH — the entry header is a second, independently failing surface.** Measured on the real
   checker: an entry titled `# …` before `source:` yields `ENTRY_HEADER_REQUIRED` (DRIFT), and a
   leading space before `source:` likewise. So `source:` must be physical line 1, column 0.
   Conversely, an entry that cites S102 + rfc-editor URL but omits **S103** is CLEAN for E4 yet
   E1 MISSes (`doctrine52-probe.mjs:75-77` requires `S103` and the trio within five lines). The
   two gates are not redundant: E4 requires line-1 header + declared ids, E1 requires S102+S103
   + the rfc-editor URL in the head. Both must hold.
4. **MEDIUM — "keeps sources-check CLEAN" is weaker than "keeps D52 green".** Measured: two rows
   with the same URL in the same `scope` give `SOURCES_CHECK: CLEAN` (exit 0) while census E04
   exits 1, so E5 fails. Same URL in different scopes: sources-check CLEAN, census W04 warn,
   exit 0. The current S102/S103 URLs are unique in-lane, so this is a drafting constraint, not a
   live defect — but a future row that reuses the RFC 3339 URL under the same scope text will
   pass E4 and fail E5.
5. **MEDIUM — indentation silently voids a row.** A row indented four spaces is not seen as a
   Registry row (measured: `rows=102`, and once the entry cites S103 the checker emits
   `ENTRY_SOURCE_UNKNOWN`). One-to-three-space indentation is tolerated (measured CLEAN). The
   rows must be appended flush-left.
6. **LOW — E3 is not a shape witness.** Measured: a row missing its trailing pipe is
   `ROW_MALFORMED` (12 split fields) yet E3 still passes, because `c[11]` is then the used-by
   cell and the substring test succeeds. Do not treat `S102=true S103=true` as proof of shape;
   E4 is the shape gate.
7. **LOW — header names/count are unvalidated.** Measured: a header advertising **12** columns
   (extra `| extra |`) still gives `SOURCES_CHECK: CLEAN` exit 0, because the header row is
   skipped by first-cell identity (`id`) before the 13-field check, while data rows must still
   have exactly 11 cells. Renaming a header cell (e.g. `id` → `identifier`) instead makes the
   header row parse as a data row (`ID_FORM`, `KIND_ENUM`, … DRIFT). The frozen header at
   `corpus/SOURCES.md:12` is the only shape contract; do not touch it.
8. **LOW — a second, divergent S103 exists in the wave tree.**
   `build/MutProbeD/tree/corpus/SOURCES.md:115-116` carries S102 with the `.html` RFC URL and
   S103 = `tc39.es/ecma262…` `spec` `A`. Promoting that pair instead of the delta would change
   the census delta to A:89/B:6 and contradict the plan's "S103 = companion opened by a scout,
   tier assigned honestly" (MDN, tier B). Only one pair may be promoted; it must be the delta's.
9. **INFO — S103 anchor amendment is improvement-only.** Adding the page's self-reported
   `2025-07-10T09:07:55Z` modification date distinguishes the served revision from the
   `Last-Modified` transport date; it changes no checker verdict either way.

## Residual risk and verification gaps

- I did not re-fetch either URL; digests and access stamps are the scouts' receipts. S102's
  `sha256 9ab2b886…` and S103's `9c120292…` are asserted, not re-derived here. A fresh fetch +
  digest compare is the verifier spot-check the delta itself names.
- My CLEAN measurement used the lane's working-tree `corpus/` plus the delta rows and a
  representative entry header, not `git archive` of a committed close rev. E4 at close runs on
  the extracted rev (`doctrine52-probe.mjs:112`); the final proof is the committed tree plus the
  probe run. Byte equivalence for the two rows is exact (extracted from the delta's fenced block).
- `build/ScribeSources/SOURCES-delta.md` appeared while this seat was running (11,064 bytes,
  150 lines at review time). If the seat rewrites it, the S103 line must be re-extracted and
  re-run; the reviewed bytes are the ones quoted here.
- `corpus/lessons/round-52.md` does not exist yet (delta F3), so the drafted `## Gate` block is
  unreviewed for placement; it does not affect E4.
- Not run: `sources-check --selftest`, census selftest, both frozen probes (out of this seat's
  read-only scope; L1/close duty).
- No tools were installed or upgraded for this review.

## Evidence (all reproducible from the lane root)

- Read `scripts/sources-check.mjs:14-123,134-171,172-400,402-500` (contract, enums, `runCheck`,
  verdict/exit map), `.ufo/waves/round-52/probe/doctrine52-probe.mjs:70-125` (E1–E5).
- Read `corpus/SOURCES.md:1-40` (header schema, tier rules), census `validate`/`resolve_targets`
  and its E04/W01/W04 rules in `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`.
- Sandbox matrix (each case re-runs the real checker with `--self <sandbox>`):
  baseline CLEAN; `community`+A → TIER_INFLATION; no trailing pipe → ROW_MALFORMED;
  pipe in a cell → ROW_MALFORMED (14 fields); `status=queued` → CLEAN but E3 false;
  used-by absent → USED_BY_MISSING + USED_BY_ASYMMETRY; `opened=2026-10-25` → OPENED_INVALID;
  4-space indent → row invisible + ENTRY_SOURCE_UNKNOWN; entry without line-1 `source:` →
  ENTRY_HEADER_REQUIRED; entry omitting S103 → CLEAN (E1 would MISS); duplicate URL same scope →
  CLEAN here, census E04 exit 1; duplicate URL different scopes → census W04 exit 0; tier C mined
  → CLEAN here, census W01 exit 0; used-by with two paths → CLEAN, E3 true.
