# SCORECARD.md text draft

Draft only. Apply affirmative round-77 wording only if the frozen predicates verify at the measured commit; otherwise record the miss. Headings proposed: existing `## Axes`, `## Capabilities`, `## Limits (recorded, not hidden)`, `## Planned` (no new score convention).

## Existing paragraph shapes (quoted)

The coverage:omp row says: “**derived by `scripts/proxy-check.mjs` since round 76** (the census decision is imported, never re-implemented; registry row `O1`), and cross-checked by `AXES_DRIFT`; zero denominator → 0.” Its counting-command sentence is: “Counting command: `node scripts/proxy-check.mjs --json` → `terms.coverage_omp`; the census itself remains the member counter”.

The capabilities table uses `| Capability | What it can now do | Evidence pointer | First-working round |`. The existing spotcheck row says “(append-only, both halves, idempotent, pre-image rollback)” and ends `| round 76 |`. Preserve that first-working round; v2 is deepening, not a new acquisition.

## Axes — replacement evidence sentence

Round 77 adds offline re-derivation from committed `.ufo/pins/omp-shape.json` (`kumitate-omp-shape-v1`), bound by `pin.omp-shape` in the lane-owned `kumitate-gate-pins-v1` block: `node scripts/proxy-check.mjs --omp-shape .ufo/pins/omp-shape.json --json` derives the same six O terms from the imported census decision and identifies `source=snapshot`; `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` judges those committed depth-1 names, kinds and modes without reading member contents. The integer remains 10; the advance is a pinned, offline-recomputable evidence path, not a score increase. The flag-free live-root path remains unchanged. Measured revision and close receipts: <TBD>.

## Capabilities — note immediately under the existing spotcheck-adopt row

*Round-77 deepening (`spotcheck-adopt`, first working round 76).* Contract `kumitate-spotcheck-adopt-v2` publishes a complete pre-image journal under `.ufo/pins/adopt-journal/` before either destination write. Every non-selftest invocation recovers first: `RECOVERED <target> rolled-back` restores both pre-images byte-exact; `RECOVERED <target> complete` retains an oracle-clean result; `RECOVERED - stale` removes incomplete staging; `REFUSED_JOURNAL_FOREIGN` retains foreign journal and destination bytes at exit 2. The new README row is inserted inside the coverage-map table after the last lessons row, not appended at EOF. The unchanged child oracle remains authoritative. Frozen C2 result, crash receipts, selftest line and revision: <TBD>. Operability stays 9 (terminal under `f_O`); this is demonstrated deepening only after those receipts land.

## Limits (recorded, not hidden) — additions

- **Round 77 — capture-time shape, not host freshness.** The pinned receipt records depth-1 `(name,kind,mode)` at capture time; it proves neither current host identity nor member contents, symlink targets, recursive state or future stability. Offline reproducibility does not imply that the live OMP root still matches it. No timestamp or content digest is added to the frozen shape contract.
- **Round 77 — single-writer adoption.** The journal assumes one adopter/writer at a time. Recovery closes the specified SIGKILL windows on the next invocation; it does not provide inter-process locking, concurrent-writer isolation or a power-loss durability guarantee. Check/predict can now perform recovery writes when a journal exists. The crash seam is selftest-only and has no effect when unset.

## Planned — insert before historical pre-registrations

**Round 78 — pre-registration (written by round 77).** Candidates, not commitments:
(1) **Split spotcheck coverage from unrelated map drift** (round-76 candidate 3): `--check` currently conflates the readings (`uncovered=0 first=oracle`); make a green spotcheck set readable when another map member is red, without weakening the oracle.
(2) **One derivation for the K plane** (round-76 candidate 4): import the Kimi census decision rather than re-derive its member rules in `proxy-check`, guarded by the census's selftests.
(3) **Capture-time snapshot versus host drift:** define a separately observable live-versus-pinned shape comparison and an explicit recapture policy; a pinned offline-clean receipt must not be presented as a claim that the current host has not changed. Do not silently alter the round-77 receipt contract or flag-free verdict semantics.
