# Round-66 README map rows — draft (seat K66ExecReadmeRows)

Scope answer first. `scripts/readme-map.mjs` walks only `corpus/knowledge` +
`corpus/lessons` (`DEFAULT_DIRS`, l.19) and its registry regex is
`/^(knowledge|lessons)\/[A-Za-z0-9._-]+\.md$/` (l.20); `loadFiles` FAIL-CLOSES
on any dir whose basename is not `knowledge|lessons` (l.152-155). So:

| round-66 new file | in map scope? | README row required | pin required |
|---|---|---|---|
| `corpus/routed-ledger.md` (C1 data) | **no** — corpus root | no | no (and impossible, see below) |
| `corpus/knowledge/mcp-deprecation-registry.md` (C2 entry) | **yes** | 1 row | 1 pin |
| `corpus/lessons/round-66.md` (round lesson) | **yes** | 1 row | 1 pin |

Precedent: the other corpus-root files (`corpus/QUALITY.md`, `corpus/SOURCES.md`,
`corpus/README.md`) carry no map rows and the gate is CLEAN at the freeze
(`README_MAP: CLEAN files=160 rows=160 covered=160`).

The C1 ledger is therefore **outside the ratchet**: it can be deleted with no
map finding (`build/K66ExecReadmeRows/14-root-file-deleted-still-clean.txt`). Only
the frozen L66 counter notices, and only in round 66. If the L1 wants it
ratcheted, the file has to move into `corpus/knowledge/` — a plan-path change,
L1's call, not applied here.

## 1. `corpus/README.md` — two rows appended after the `lessons/round-65-verifier-spotcheck.md` row (the map table's last line, l.195), 3-cell shape `| Entry | Covers | Primary sources |`

```
| `knowledge/mcp-deprecation-registry.md` | The MCP deprecation registry and its clocks (round 66, `S207` and up; re-grounded, never copied): the 2026-07-28 Deprecated Features page captured and mirrored row-for-row in `## Registry snapshot` (every captured row's `Deprecated in` and `Earliest removal` cell), so the two clocks read as stated — HTTP+SSE "Three months after SEP-2596 reaches Final", Roots "First revision released on or after 2027-07-28"; the feature-lifecycle policy that makes a deprecation a state, not a date; read against the host in `## Bearing on the installed OMP release`: the installed release ships `transports/sse.ts` at `/v18.12.6/` and declares the `roots` client capability, so both deprecated surfaces are live bytes, not history; judged by frozen M66 M1–M8 (`DEPREC66_HELD`) | `S207` and up in `corpus/SOURCES.md` (rows opened 2026-10-27, each bound to a committed capture); the staged assimilation theme in `merge/kumitate/` |
| `lessons/round-66.md` | Round-66 (one v2 wave, build and attack together): `routed-ledger` capability acquisition (contract `kumitate-routed-ledger-v1` — every routed item of the rounds 55..65 non-author spot-checks bound to a ledger row by a located quote, every answered row bound to a located answer line at its `path:line`, class recurrences counted; 33-case selftest, judged by frozen L66 L1–L6) and the MCP deprecation registry frontier entry (judged by frozen M66 M1–M8); the round-65 routed items D1–D7 answered as ledger rows; the R65 verifier spot-check row D7 repaired at the freeze and the carried `proxy-check` drift D4 refreshed at the close; mistake mined: routed items lost between rounds (a lesson Gate claiming per-row URL/date/quote while two sources carried no Gate record), captured by C1 | `.ufo/waves/round-66/plan.md`; `.ufo/waves/round-66/base/`; `.ufo/waves/round-66/probe/` |
```

Neither row contains an unescaped `|` inside a cell, so both parse as 3-cell
rows (readme-map keys only the first cell; `grep -cE '^\| `(knowledge|lessons)/'`
— proxy-check's C2 term — counts them, which is the intended +2).

## 2. `.ufo/pins/readme-map.json` — append two entries (never reorder, never rewrite)

The file's formatting is 1-space indent, one path per line, last entry without a
trailing comma. Diff:

```
-  "lessons/round-65-verifier-spotcheck.md"
+  "lessons/round-65-verifier-spotcheck.md",
+  "knowledge/mcp-deprecation-registry.md",
+  "lessons/round-66.md"
```

Order inside `covered` is irrelevant to the gate (it is a set); appending keeps
the append-only ratchet property. Uncompiled patch ready to `git apply`
(lane-root relative): `build/K66ExecReadmeRows/09-draft-rows-and-pins.patch`
(touches only these two files; 5 insertions, 1 deletion).

## 3. Integration order and consequences

1. **`cite-sources` coupling.** Row 1 cites `S207`. `scripts/cite-sources.mjs`
   scans every `| ` line of the README for `\bS[0-9]{3,}\b` and requires each id
   to be a `| S### |` row of `corpus/SOURCES.md`. Landing the README row before
   the SOURCES rows is `CITE_SOURCES: DRIFT ghosts=1 first=S207` exit 1
   (`11-cite-sources-before-sources-row.txt`); with S207 present it is
   `CITE_SOURCES: CLEAN cited=199` (`12-…`). Land the C2 SOURCES rows, the
   captures and these README/pin lines in the same commit.
2. **Stanza.** At the freeze the corpus census is 160 files / 160 rows; adding
   these two files makes it 162/162, so the `## Claim block` stanza's `C2=` and
   `C2_total=` must both read 162 at the close (the carried D4 refresh) or
   `proxy-check` reports `C2_DRIFT` / `C2_TOTAL_DRIFT`. `coverage` does not move
   (both numerator and denominator rise by 2).
3. **`plan-before-ready.sh`** judges `readme-map` at the PLAN commit only
   (`PLAN_BEFORE_READY: PASS … map=CLEAN files=160 rows=160 covered=160` for
   round 66, rev `88041bc9`), so it will not catch a row missing from the merge
   commit; the close must run `node scripts/readme-map.mjs` itself.
4. `corpus/routed-ledger.md` needs **neither** row nor pin. Attempting to pin it
   is refused: `README_MAP: FAIL-CLOSED reason=covered entry malformed:
   "corpus/routed-ledger.md"` exit 2 (`07-root-pin-rejected.txt`); a README row
   naming it (`| `corpus/routed-ledger.md` |` or bare `| corpus/routed-ledger.md |`)
   is ignored silently — row count unchanged (`04-root-row-probes.txt`).

Evidence files: `02-drift-three-stubs.txt` (DRIFT bad=4, files=162 rows=160
covered=160), `03-corpus-root-failclosed.txt`, `05-clean-after-rows-and-pins.txt`
(CLEAN 162/162/162), `06-rows-without-pins.txt` (rows alone → `unpinned` ×2),
`09-draft-rows-and-pins.patch`, `10-clean-real-rows.txt`, `13/14`.
