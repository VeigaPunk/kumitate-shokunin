# Round60-Readme — README map and cite-source spotcheck

## Finding

The round-60 verifier spotcheck is correctly mapped and pinned at current lane tip `0cbe0d75e5a08718e2256408329692908c837766`:

- `corpus/README.md:181` has the row for `lessons/round-60-verifier-spotcheck.md`. Its description identifies the non-author closure and records R60-V1..V9, including the explicit README-map repair obligation R60-V8.
- `.ufo/pins/readme-map.json` `covered` includes `lessons/round-60-verifier-spotcheck.md` (entry adjacent to `lessons/round-60.md`). The same committed repair in `a745a3b0` added both the README row and covered pin.
- Historical lane history confirms the verifier document was added after the R60 work commit, by the round-60 spotcheck/closure flow; round 61 then added the README row and pin as required.

## Gates exercised

At lane HEAD `0cbe0d75e5a08718e2256408329692908c837766`:

- `node scripts/cite-sources.mjs` → `CITE_SOURCES: CLEAN cited=179` (exit 0).
- `node scripts/readme-map.mjs` → `README_MAP: DRIFT files=149 rows=148 covered=148 bad=2 first=uncovered:lessons/round-61-verifier-spotcheck.md` (exit 1); diagnostic also reports `note unpinned:lessons/round-61-verifier-spotcheck.md`.

The readme-map result is a separate, current R61 drift, not an R60 row/pin omission: the r60 verifier row and covered pin are present, but the newly added `lessons/round-61-verifier-spotcheck.md` has neither a README row nor a covered pin. The gate's `files=149 rows=148 covered=148` totals and uncovered/unpinned diagnostics are consistent with that single missing file. No cite-source drift was observed.

## Verification limits

This was a read-only spotcheck; no edits or tests were run. Commands exercised were the requested `readme-map` and `cite-sources` gates at current lane tip.