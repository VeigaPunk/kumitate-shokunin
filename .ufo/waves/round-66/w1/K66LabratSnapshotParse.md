VERDICT: CONFIRMED — the frozen M66 capture-table parse (deprec66-probe.mjs M6 block) yields exactly the 6 data rows of the live 2026-07-28 Deprecated table, and every Earliest-removal cell survives delink+norm intact.

## Evidence

Hypothesis under test: the frozen M66 capture-table parse yields exactly the 6 rows of the live Deprecated table and each Earliest-removal cell survives delink+norm intact.

Fetch (twice, ~90 s apart, byte-identical — see Finding 5):

```
$ curl -fsSL --max-time 90 --retry 2 -A 'Mozilla/5.0 (kumitate-deprec66)' \
    https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md \
    -o /fast/scratch/hyaku/kumitate-r66/K66LabratSnapshotParse/deprecated-live.md
exit=0   (3839 bytes; sha256 c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa)
```

Manual reading of the fetched capture — the whole pipe-block, lines 24-31 of the capture (`grep -n '^|'`):

```
24:| Feature | Deprecation SEP | Deprecated in | Migration path | Earliest removal |
25:| - | - | - | - | - |
26:| [Roots](...roots.md) | [SEP-2577](...) | `2026-07-28` | Pass directories or files ... | First revision released on or after 2027-07-28 |
27:| [Sampling](...sampling.md) | [SEP-2577](...) | `2026-07-28` | Integrate directly with LLM provider APIs | First revision released on or after 2027-07-28 |
28:| [Logging](...logging.md) | [SEP-2577](...) | `2026-07-28` | Log to `stderr` ... [OpenTelemetry](...) | First revision released on or after 2027-07-28 |
29:| [Dynamic Client Registration](...#dynamic-client-registration) | [PR #2858](...) | `2026-07-28` | [Client ID Metadata Documents](...) | First revision released on or after 2027-07-28 |
30:| `includeContext: "thisServer"` / `"allServers"` ([Sampling](...#capabilities)) | [SEP-2596](...) | `2025-11-25` | Omit the field or use `"none"` | Follows Sampling ([SEP-2577](...)) |
31:| [HTTP+SSE transport](...#http-with-sse) | [SEP-2596](...) | `2025-03-26` | [Streamable HTTP](...) | Three months after SEP-2596 reaches Final |
```

8 pipe lines = 1 header + 1 separator + **6 data rows**, 5 columns each: `Feature | Deprecation SEP | Deprecated in | Migration path | Earliest removal`.

Counter's M6 parse, copied verbatim (norm/delink helpers + the parse block from `.ufo/waves/round-66/probe/deprec66-probe.mjs` lines 45-58 and 169-190) into `m6-snapshot-parse.mjs`, run on the capture — verbatim output:

```
$ node m6-snapshot-parse.mjs deprecated-live.md
heading-match-index: 4
capRows.length: 6
row 1: cells=5
  feature : Roots
  depIn   : 2026-07-28
  removal : First revision released on or after 2027-07-28
row 2: cells=5
  feature : Sampling
  depIn   : 2026-07-28
  removal : First revision released on or after 2027-07-28
row 3: cells=5
  feature : Logging
  depIn   : 2026-07-28
  removal : First revision released on or after 2027-07-28
row 4: cells=5
  feature : Dynamic Client Registration
  depIn   : 2026-07-28
  removal : First revision released on or after 2027-07-28
row 5: cells=5
  feature : includeContext: "thisServer" / "allServers" (Sampling)
  depIn   : 2025-11-25
  removal : Follows Sampling (SEP-2577)
row 6: cells=5
  feature : HTTP+SSE transport
  depIn   : 2025-03-26
  removal : Three months after SEP-2596 reaches Final
exit=0
```

Raw-vs-normalized cells (delink+norm applied per cell, per the M6 mapping `[feature, , depIn, , removal]` — verbatim from `cell-survival.txt`):

```
RAW  depIn=[`2026-07-28`] removal=[First revision released on or after 2027-07-28]
NORM depIn=[2026-07-28] removal=[First revision released on or after 2027-07-28]
   (x4 identical rows for Roots/Sampling/Logging/Dynamic Client Registration)
RAW  depIn=[`2025-11-25`] removal=[Follows Sampling ([SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577))]
NORM depIn=[2025-11-25] removal=[Follows Sampling (SEP-2577)]
RAW  depIn=[`2025-03-26`] removal=[Three months after SEP-2596 reaches Final]
NORM depIn=[2025-03-26] removal=[Three months after SEP-2596 reaches Final]
```

Both M4-critical quote strings are present in the normalized capture: `2027-07-28` (rows 1-4 removal) and `Three months after SEP-2596 reaches Final` (row 6 removal).

## Findings

1. **K66LabratSnapshotParse-1 (CONFIRMED, attacks M6 row-count clause).** The copied frozen parse yields `capRows.length: 6`, exactly the 6 data rows of the live table. No row missed, no non-row counted; the header (`| Feature |`) and separator (`| - | ... |`) lines are correctly skipped. Repro: `node .ufo/waves/round-66/build/K66LabratSnapshotParse/m6-snapshot-parse.mjs .ufo/waves/round-66/build/K66LabratSnapshotParse/deprecated-live.md` (exit 0).
2. **K66LabratSnapshotParse-2 (CONFIRMED, attacks the delink+norm survival clause).** Every Earliest-removal cell survives intact: backticks stripped (`2026-07-28`), markdown links delinked (`Follows Sampling ([SEP-2577](...))` → `Follows Sampling (SEP-2577)`), plain prose unchanged. All 6 `removal` and all 6 `depIn` values match the manual reading character-for-character after normalization. Repro: see `cell-survival.txt` in the build dir.
3. **K66LabratSnapshotParse-3 (informational, robustness not correctness).** The parse anchors on the FIRST `/^#{1,3}\s+Deprecated\b/` match — `heading-match-index: 4`, the H1 `# Deprecated Features` — not the `## Deprecated` H2 that actually heads the table. Benign only because no `|`-line intervenes between the two headings today; a future prose edit adding a >=5-cell pipe line between them would be swallowed as a table row. The predicate is correct for the frozen page; the anchor is fragile. Reported, not patched (counter is frozen).
4. **K66LabratSnapshotParse-4 (informational, fail-closed direction).** M6's column mapping `[feature, , depIn, , removal]` hard-assumes the current 5-column layout; a future 3-column registry (`Feature | Deprecated in | Earliest removal`) would drop every row at the `c.length >= 5` gate and fail M6 closed (`capture-table-rows=0<5`). This direction protects the claim (no silent pass); noted so the lane knows the snapshot format is coupled to the page's column count.
5. **K66LabratSnapshotParse-5 (informational, stability).** Two fetches ~90 s apart returned byte-identical bodies (sha256 `c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa` both times), so the live page was stable across the probe window and M5-style re-fetch is not racy today.

## Artifacts

- `.ufo/waves/round-66/build/K66LabratSnapshotParse/m6-snapshot-parse.mjs` — standalone runner, norm/delink + M6 parse copied verbatim from the frozen probe.
- `.ufo/waves/round-66/build/K66LabratSnapshotParse/m6-parse-output.txt` — verbatim parse output (exit 0).
- `.ufo/waves/round-66/build/K66LabratSnapshotParse/cell-survival.txt` — raw-vs-normalized cell dump for all 6 rows.
- `.ufo/waves/round-66/build/K66LabratSnapshotParse/deprecated-live.md` — the fetched capture; `.ufo/waves/round-66/build/K66LabratSnapshotParse/deprecated-live.sha256` — its sha256.

## Limits

- Only the M6 parse block was exercised, per the seat; the full frozen counter was not run (the C2 entry does not exist at any rev yet, so `DEPREC66_*` cannot be scored until the L1 lands it).
- Attack was empirical against the live page as fetched; I did not fuzz the parser with mutated tables (column drops, injected pipe lines, heading renames) — Findings 3-4 are reasoned from the code, not reproduced with a mutated fixture.
- M5's live re-fetch was verified only for this one page (byte-stable re-fetch); other rows' URLs were not re-fetched.
- No frozen counter, control, or receipt was modified; the probe script and capture were copied to scratch and attacked there.
