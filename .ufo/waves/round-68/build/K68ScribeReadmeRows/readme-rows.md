# K68ScribeReadmeRows — readme-map rows + pins for round 68

lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only for this seat; drafts only)
freeze commit: `39f61816d4ee7a8d401df42c1818c91a9c537bce` ("round-68: freeze plan + counters …, readme-map inherited repair")
measured lane tip at drafting: `39f61816d4ee7a8d401df42c1818c91a9c537bce`, worktree clean
fixture: `git clone --shared <lane> /fast/scratch/hyaku/kumitate-r68/K68ScribeReadmeRows/lane` (deleted; receipts copied below)

Every row/fragment below was executed against the real gate (`node scripts/readme-map.mjs`,
contract `kumitate-readme-map-v2`) inside that clone; the resulting receipts are
`gate-lane-freeze-tip.txt`, `gate-base-d23892ad.txt`, `gate-after-rows-plus-pins.txt`,
`integration-sim.patch` in this directory.

## 1 — coverage-map row for `corpus/knowledge/mcp-deprecation-registry.md`

Insert **one line**, directly after the `lessons/round-67-verifier-spotcheck.md` row
(currently line 198 of `corpus/README.md`, followed by two blank lines and `## Known gaps`):

```
| `knowledge/mcp-deprecation-registry.md` | The MCP deprecation ledger re-grounded on the installed release (round 68, S207–S213): the Deprecated table as published (feature, deprecated-in, earliest removal) and the feature lifecycle that turns a deprecation into a removal; the legacy HTTP+SSE transport in the release source at `v18.12.6` and `v18.13.1` (byte-identical, 15,183 B, sha256 `0b69229a…`); the live clock — SEP-2596 marked Final 2026-06-03 plus the three-month grace, elapsed 2026-09-03 — separated from the two clocks the entry refuses; the bearing on `omp/18.13.1` (`roots`, `HTTP+SSE`), with the stated limit that a source file at a tag is not proof the host exercises it | S207–S213 in `corpus/SOURCES.md` (rows opened 2026-10-27); `.ufo/waves/round-68/build/K68ScribeEntry/captures/`; `.ufo/waves/round-68/probe/deprec68-probe.mjs` |
```

Notes that keep it operable:

- Format: 4 pipes, single physical line, first cell is a bare backticked path — the gate's
  `COVERED_RE`-shaped row regex (`^\|\s*`(?:knowledge|lessons)/[^`]+`\s*\|`); a first cell without
  backticks reads `format-unmapped` (measured, control C4).
- Cite the capture path the pins end up with. At drafting time
  `.ufo/waves/round-68/build/K68ScribeEntry/captures/` holds the seven captures
  `S207-deprecated-2026-07-28.md`, `S208-feature-lifecycle.md`, `S209-omp-v18.12.6-sse.ts`,
  `S210-sep2596.md`, `S211-transports-2025-11-25.md`, `S212-omp-v18.13.1-sse.ts`,
  `S213-commit-183238ddac.patch`; `.ufo/waves/round-68/build/captures/` is **empty** and is not
  that directory. If the L1 relocates captures, the row must name the relocated path.
- The `(byte-identical, 15,183 B, sha256 0b69229a…)` clause is measured, not read from the plan:
  `sha256sum S209-omp-v18.12.6-sse.ts S212-omp-v18.13.1-sse.ts` → both
  `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0` (15,183 B each).
- Do not put S201–S206 on this row's source position: they predate the round base, and M2 binds
  only rows absent at `d23892ad`. The row names S207–S213 only.
- Entry section names confirmed by the entry seat: `## Scope`, `## Located quotes`,
  `## Registry snapshot`, `## Two clocks`, `## The live clock`,
  `## Bearing on the installed OMP release`, `## Limits`.

## 2 — rows for `lessons/round-68.md` and the two verifier spot-checks

### 2a — `lessons/round-68.md` (new file; row must land in the same change)

Insert **one line** immediately after the mcp row from §1:

```
| `lessons/round-68.md` | Round-68: `routed-ledger` v2 (contract `kumitate-routed-ledger-v2` — every routed item of the rounds 55–66 spot-checks bound to a ledger row, plus six round-66 hardenings: a GIT_DIR-inherited selftest/repo escape, symlink and `..` answer and ledger escapes, a second routed section silently missed, one-word or ambiguous quote binding, the ±2-line answer window, fence-blind item counting) with its data `corpus/routed-ledger.md` (61 items in 12 sections) judged by frozen `L68 v1`, and the MCP deprecation-registry frontier entry (S207–S213) judged by frozen `M68 v1`; the round-67 `unexercised-counter` mistake mined as QUALITY Q64 (plan-declared); the inherited `readme-map` DRIFT (`files=163 rows=161 covered=161 bad=4` at `d23892ad`, R56-V3 fifth recurrence) repaired at the freeze commit `39f61816` and measured CLEAN (`files=163 rows=163 covered=163`); PROVINCE.md:20's stale `omp.real` picture corrected to the installed `omp/18.13.1` | `.ufo/waves/round-68/plan.md`; `.ufo/waves/round-68/base/`; `.ufo/waves/round-68/probe/` |
```

Reconciliation duty: the Covers cell was aligned with `K68ScribeLesson` (rule names `L68 v1`/`M68 v1`,
`corpus/routed-ledger.md` named with 61 items / 12 sections, the six hardenings enumerated, the repair
stated by measured counts, Q64 marked plan-declared). If the lesson's own verdict prose or its `## Gate`
differs, the row follows the lesson bytes; Q64 stays marked plan-declared until the QUALITY.md row exists.

### 2b — `lessons/round-67-verifier-spotcheck.md` and `lessons/round-66-verifier-spotcheck.md`

**Already repaired — do not add these rows again.** The base-time DRIFT named in the plan was repaired
inside the freeze commit `39f61816` itself (`git show 39f61816 --stat` → `corpus/README.md | 2 +`,
`.ufo/pins/readme-map.json | 4 +-`). The rows exist verbatim today:

```
197:| `lessons/round-66-verifier-spotcheck.md` | Round-66 non-author verification (hyaku closure, non-author integrator): both claims re-measured as unproven at the cutoff tip (`LEDGER66_UNMET held=3/6`, `DEPREC66_UNMET held=0/8`); step-1 conformance all pass; routes D1 wave-leftover settlement, D2 receipt-revision precision, D3 land-or-redeclare C2 | `.ufo/reports/round-66/kumitate.md`; lane tip `8d557f85312de4fcc82e09ff735d21436bc3746d` at the spot-check |
198:| `lessons/round-67-verifier-spotcheck.md` | Round-67 non-author verification (hyaku closure): honest stop at run-9 wrap-up — no wave dispatched, no claim frozen; conformance pass; routes five defects for the next attempt (frontier step unexecuted, inherited uncommitted freeze state, D1 settlement debt, PROVINCE stale `omp.real` picture, worktree hygiene) | `.ufo/reports/round-67/kumitate.md`; lane tip `f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed` at the spot-check |
```

Each cites its report path and its lane tip in the same shape as the round-65 row, and both already carry
the "row added in <round N>" provenance sentence the earlier repaired rows use. Re-adding either one
produces `duplicate-row:<path>` (DRIFT) — measured shape: control C3 below.

## 3 — `.ufo/pins/readme-map.json` entries

### 3a — recommended placement (the file's own conv; rounds 62–68 appended at the tail)

`39f61816` added the two spot-check pins the same way (tail append after `lessons/round-66.md`), so the
round-68 pair goes at the tail. Exact fragment (2-space item indent, 1-space top-level indent — matches
the file byte-format, which is why `integration-sim.patch` is 2 hunks / 4 added lines):

```
@@ -163,6 +163,8 @@
   "lessons/round-65-verifier-spotcheck.md",
   "lessons/round-66.md",
   "lessons/round-66-verifier-spotcheck.md",
-  "lessons/round-67-verifier-spotcheck.md"
+  "lessons/round-67-verifier-spotcheck.md",
+  "knowledge/mcp-deprecation-registry.md",
+  "lessons/round-68.md"
  ]
 }
```

### 3b — strict lexicographic ("sorted") positions, if the L1 wants the array sorted instead

The array is **not** sorted today: `covered == sorted(covered)` is false with 11 order violations
(first: index 53 `knowledge/temporal-worker-versioning-pinning.md` before
`knowledge/swarm-wave-lifecycle.md`; the tail after index 150 is append-order). The gate never sorts —
`loadRegistry` only rejects malformed/duplicate entries and `evaluate` works from a `Set`. Measured:
bisect insertion also reads CLEAN (`README_MAP: CLEAN files=165 rows=165 covered=165`).

| entry | strict-lex insertion point | neighbours |
|---|---|---|
| `knowledge/mcp-deprecation-registry.md` | index 28 of the current 163-entry array | after `knowledge/loop-driver.md`, before `knowledge/mcp-orchestration-contract.md` |
| `lessons/round-68.md` | between `lessons/round-6.md` and `lessons/round-7.md` (`round-68` > `round-6.` and < `round-7`) | — |

`lessons/round-66-verifier-spotcheck.md` and `lessons/round-67-verifier-spotcheck.md` are already pinned
(lines 165–166). Do not duplicate either: `covered entry duplicated` is a FAIL-CLOSED (exit 2) arm.

## 4 — readme-map selftest expectation after the L1 applies rows + pins

Measured before (`gate-lane-freeze-tip.txt`, lane at `39f61816`, exit 0):

```
README_MAP: CLEAN files=163 rows=163 covered=163
```

Arithmetic after the integration change (both new files are in the covered namespace, one row + one pin each):

| term | before | delta | after | why |
|---|---|---|---|---|
| `files` | 163 | +2 | **165** | `corpus/knowledge/mcp-deprecation-registry.md` (+1), `corpus/lessons/round-68.md` (+1); `corpus/routed-ledger.md` is at the corpus root and the covered namespace is only `knowledge|lessons` (`COVERED_RE`, `loadFiles` base check) |
| `rows` | 163 | +2 | **165** | one coverage-map row per new file; the round-66/67 spot-check rows already exist (161 + 2 at the freeze) |
| `covered` | 163 | +2 | **165** | one pin per new file |

So the expectation is exactly:

```
README_MAP: CLEAN files=165 rows=165 covered=165
```

exit 0. **Executed, not inferred** — `gate-after-rows-plus-pins.txt` (clone, both rows + both tail pins +
the two stub files present): `README_MAP: CLEAN files=165 rows=165 covered=165`, `exit=0`.

Sensitivity of that number: any *additional* `corpus/knowledge|lessons/*.md` landed by another seat this
round moves all three counts by the same amount, and an entry landed without its row/pin re-opens DRIFT —
which is why this row must ride the same change as the file (round-66/67 precedent).

## 5 — controls (all measured in the clone; each confirms the gate can fail for the right reason)

| control | mutation | observed |
|---|---|---|
| C0 stubs only | two new `.md` files, no rows, no pins | `DRIFT files=165 rows=163 covered=163 bad=4 first=uncovered:knowledge/mcp-deprecation-registry.md` exit 1 |
| C1 rows only | rows added, pins not | `DRIFT files=165 rows=165 covered=163 bad=2 first=unpinned:knowledge/mcp-deprecation-registry.md` exit 1 |
| C2 pins only | pins added, rows not | `DRIFT files=165 rows=163 covered=165 bad=2 first=uncovered:knowledge/mcp-deprecation-registry.md` exit 1 |
| C3 duplicate row | mcp row twice | `DRIFT files=165 rows=166 covered=165 bad=1 first=duplicate-row:knowledge/mcp-deprecation-registry.md` exit 1 |
| C4 unmapped row | first cell without backticks | `DRIFT files=165 rows=164 covered=165 bad=2 first=format-unmapped:knowledge/mcp-deprecation-registry.md` exit 1 |
| base | lane at `d23892ad` | `DRIFT files=163 rows=161 covered=161 bad=4 first=uncovered:lessons/round-66-verifier-spotcheck.md` exit 1 — the plan's inherited reading, reproduced from committed bytes |

## 6 — receipts and artifacts

- `gate-lane-freeze-tip.txt` — `CLEAN files=163 rows=163 covered=163`, exit 0 (clone at `39f61816`).
- `gate-base-d23892ad.txt` — `DRIFT files=163 rows=161 covered=161 bad=4 first=uncovered:lessons/round-66-verifier-spotcheck.md`, exit 1 (clone at `d23892ad`, worktree clean, no fixture files).
- `gate-after-rows-plus-pins.txt` — `CLEAN files=165 rows=165 covered=165`, exit 0 (both rows + both tail pins applied).
- `integration-sim.patch` — the exact 4 added lines (2 README rows, 2 pin entries) as a clone `git diff`.

## 7 — limits

- No row was added to the lane's `corpus/README.md` or pin to `.ufo/pins/readme-map.json`; this seat is
  not an integration owner, so everything above is a draft proven in a clone.
- The 165 counts are conditional on the round landing exactly two covered-namespace files.
- Not checked: `scripts/sources-check.mjs`, `source-capture.mjs`, census, or any C1/C2 counter — this
  seat measured only `readme-map`.
- The mcp row's Covers cell describes the entry as its own seat reported it; if the landed entry's
  sections or dates differ, the row must be re-derived from the landed bytes (M6/M7 read the entry, not
  this row).
