VERDICT: The eleven frozen C2 topology controls are mutually independent in the direction that matters — each variant's claimed arm still fires with every other arm amputated, and no variant reads HELD — but the set has three holes the frozen counter cannot see (no minimum quote length; T7 and T2 both accept paths that merely contain the entry path as a prefix), and f6's second MISS arm is pure cascade, not an independent detector.

## Evidence

All work in fixture clones of `b38a2065ab8ac5b198f6569b9013d04411c3d40d` built by the frozen generator's own construction (`git init` in mktemp, toplevel verified, `git archive <rev> | tar -x`, commits only inside the fixture with throwaway identity). Lane bytes never modified: `sha256sum` of `probe/make-topology-controls.mjs`, `probe/topology63-probe.mjs` and all 13 `controls/topology/*.txt` identical before/after the session (`/tmp/kumitate-r63/K63MutateTopologyControls/hashes-before.txt` = `hashes-after.txt`); `git -C <lane> status --porcelain | grep -cv '^??'` → `0`.

1. Rerun of the frozen generator, unmodified, from the freeze commit:
   `node .ufo/waves/round-63/probe/make-topology-controls.mjs <lane> b38a2065ab8ac5b198f6569b9013d04411c3d40d <scratch>/pristine-out` → exit 0, all 12 cases `AS-EXPECTED`, `honest-bullets=6`. Diff vs committed `controls/topology/summary.txt` after normalizing `rev=<fixture>`: identical except the `fixture-base=` trailer (committed controls used base `dfa6fca8…`; this rerun used the freeze commit per tasking). Every held-count and MISS-arm list matches the committed lines, e.g. committed f2: `TOPOLOGY63_UNMET held=4/7 … | T2 MISS S110:not-in-registry | T5 MISS S110:no-url | T6 MISS census-exit=1` exit=1.

2. Independence probes — frozen generator copy with `CASES`/`PROBE_OVERRIDE` env + frozen counter copy with an `AMPUTE` env that force-passes selected arms (scratch only; frozen counter untouched). Each probe includes `c0-honest` as baseline (stays `TOPOLOGY63_HELD held=7/7` exit=0 in all four):
   - f2 with T5+T6 amputated: `TOPOLOGY63_UNMET held=6/7 … | T2 MISS S110:not-in-registry` exit=1 → **T2 still MISS with the others fixed**.
   - f3 with T5 amputated: `TOPOLOGY63_UNMET held=6/7 … | T4 MISS S109:quote-not-in-capture(A sentence that appears in no )` exit=1 → **T4 still MISS**.
   - f6 with T4 amputated: `TOPOLOGY63_UNMET held=6/7 … | T3 MISS S109:hash-or-size` exit=1 → **T3 still MISS**.
   - f6 with `CAPTXT` (capText populated even when the pin hash mismatches): `TOPOLOGY63_UNMET held=6/7 … | T3 MISS S109:hash-or-size` exit=1, T4 now silent → **f6's `T4 MISS` in the committed line is pure cascade** (T4 reads the capture only through T3's hash gate, `topology63-probe.mjs:131-133`; the trailing-space edit is invisible after `norm`), so T4 contributes no independent detection of capture-byte edits.

3. New variants (`build/K63MutateTopologyControls/more-controls.mjs`, honest construction reused verbatim, frozen counter run unmodified; full lines in `out-more/*.txt`):
   - `n1-dup-source-id` (source line `S109 S109 …`): `TOPOLOGY63_HELD held=7/7` exit=0 — counter dedupes; correct, see K63MutateTopologyControls-6.
   - `n1b-dup-only-one-row` (`source: S109 S109` only): `TOPOLOGY63_UNMET held=5/7 … | T2 MISS cites-1-rows | T4 MISS S110:not-a-source;S110:not-a-source;S111:not-a-source;S111:not-a-source` exit=1.
   - `n2-short-quote` (2-word quote from an honest sentence): `TOPOLOGY63_HELD held=7/7` exit=0 — **hole**.
   - `n3-url-host-swap` (S110 URL → `https://127.0.0.1:1/…`, capture untouched): `TOPOLOGY63_UNMET held=6/7 … | T5 MISS S110:live-unreachable` exit=1.
   - `n4-capture-path-escape` (pin path → `../topology63-escape-absent.html`): `TOPOLOGY63_UNMET held=5/7 … | T3 MISS S111:capture-absent | T4 MISS S111:quote-not-in-capture(To build resilient systems, we);…` exit=1 (T4 arm is the same cascade as f6).
   - `n5-pin-entry-missing` (S110 pin entry deleted): `TOPOLOGY63_UNMET held=5/7 … | T3 MISS S110:unbound | T4 MISS S110:quote-not-in-capture(If an entire queue expires , t);…` exit=1 (same cascade).
   - `n6-province-prefix-path` (PROVINCE path → `…budgets.md-void`): `TOPOLOGY63_HELD held=7/7` exit=0 — **hole**.
   - `n7-usedby-prefix-path-existing` (S109 used-by → `…budgets.md.hole`, file created): `TOPOLOGY63_HELD held=7/7` exit=0 — **hole**.
   Summary trailer: `HELD-despite-fault=n2-short-quote,n6-province-prefix-path,n7-usedby-prefix-path-existing`.

## Findings

1. **K63MutateTopologyControls-1 (high, counter hole — T7)**: the PROVINCE naming arm is `line.includes(ENTRY) && /frontier|band|ground|first entry/i` (`topology63-probe.mjs:191-193`); any path containing the entry path as a prefix (`.md-void`, `.md.bak`, a longer name) satisfies it, and no other arm validates PROVINCE paths. A lane can name a decoy path and read HELD. Reproduce: `node .ufo/waves/round-63/build/K63MutateTopologyControls/more-controls.mjs <lane> b38a2065… <out>` (case n6).
2. **K63MutateTopologyControls-2 (high, counter hole — T2+census)**: T2's used-by check is `usedBy.includes(ENTRY)` (`topology63-probe.mjs:87`); census E11 only requires the path to exist on disk (`sources-census.sh:566`). used-by naming a different existing file whose path contains the entry path as a prefix passes both (n7). f8's removal variant is caught, but the prefix-suffix variant is not. Reproduce: same command, case n7.
3. **K63MutateTopologyControls-3 (medium, control-set gap — T4/T5)**: no minimum quote length exists (`topology63-probe.mjs:158` checks only `> 25` words); a 2-word quote taken from an honest sentence passes T4 and T5, so "located quotes" can be satisfied with trivial strings (n2). The frozen claim text T4 states no minimum either, so this is a control-intent gap, not a claim violation — the L1 may want a floor (e.g. ≥ 6 words) in a future rule version. Reproduce: same command, case n2.
4. **K63MutateTopologyControls-4 (medium, independence defect — f6/T4 cascade)**: T4 has no independent signal on capture-byte edits: `capText` is populated only inside T3's hash-success branch (`topology63-probe.mjs:131-133`), so any T3 failure cascades a `T4 MISS quote-not-in-capture`. Proven by the CAPTXT probe: with the gate removed, T4 passes on the mutated capture and only T3 MISS remains. Consequence: the committed f6 line's two MISS arms are one detector, not two; conversely a pin-consistent forged capture (f1) leaves T3 AND T4 green — T5 is the single point of detection (f1 reads held=6/7 with only `T5 MISS`, committed and rerun). T5 fails closed (unreachable → `live-unreachable` MISS; `--no-live` → `live-fetch-skipped` MISS), so the single point is fail-closed. Reproduce: probe commands in `/tmp/kumitate-r63/K63MutateTopologyControls/probes/*/*.txt`.
5. **K63MutateTopologyControls-5 (medium, residual hole — no capture↔URL binding)**: pin entries carry `sourceId/path/sha256/bytes` and no url field (`grep -c '"url"' .ufo/pins/source-captures.json` → 0), and nothing compares the pin to the registry row's URL; T5 fetches the row URL only. n3 is caught only because the swapped host lacks the quote; a lane that swaps the row URL to a same-content mirror would read HELD. [INFERENCE — mirror case not run; structural evidence cited.]
6. **K63MutateTopologyControls-6 (info, correct behavior)**: duplicate cited S-id is correctly HELD — T1 dedupes ids via `Set` (`topology63-probe.mjs:57`), so duplication cannot game the ≥2-row floor; padding with one distinct row reads `T2 MISS cites-1-rows` + `T4 MISS …not-a-source` (n1b). No hole.
7. **K63MutateTopologyControls-7 (info, positive)**: control independence holds for all eleven: f2's T2, f3's T4 and f6's T3 each still MISS with every other arm amputated (probes above); the remaining eight are single-arm kills by construction (committed lines: f1→T5, f4→T2, f5→T1, f7→T6, f8→T2, f9→f10→T7, f11→T4), and no variant reads HELD, so no arm masks another. f2's extra T5 (`no-url`) and T6 (census E12, row outside `## Registry`, `sources-census.sh:30`) and f3's extra T5 are independent consequences of the same single mutation, not masking.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63MutateTopologyControls/more-controls.mjs` (new-variant generator; runs the frozen counter unmodified)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63MutateTopologyControls/out-more/{n1-dup-source-id,n1b-dup-only-one-row,n2-short-quote,n3-url-host-swap,n4-capture-path-escape,n5-pin-entry-missing,n6-province-prefix-path,n7-usedby-prefix-path-existing}.txt`, `out-more/more-summary.txt`
- Scratch (disposable): `/tmp/kumitate-r63/K63MutateTopologyControls/` — `pristine/{gen-copy,counter-amp}.mjs`, `pristine-out/*.txt`, `probes/{f2-amp-T5T6,f3-amp-T5,f6-amp-T4,f6-cascadecaptxt}/*.txt`, `hashes-before.txt`, `hashes-after.txt`, extracted frozen files.

## Limits

- Did not run a same-content mirror-host fixture (finding 5 is structural inference from the pin schema and counter code, not a measured HELD).
- Live-fetch dependence: honest quotes are re-picked from live pages at run time; all runs here succeeded (`honest-bullets=6`), but a future rerun after an upstream page change could shift which sentences are picked (the committed controls' quote texts were reproduced verbatim in this rerun).
- Did not probe T1/T2 head-position faults (e.g. `source:` beyond the first 14 lines) or census E-codes beyond E03/E11/E12 — outside the assigned variant list.
- The amputated counter/generator copies are scratch falsifier instruments only; no proposal to change the frozen counter is patched anywhere — findings 1-3 are reported for the L1.
- Tooling: none installed or upgraded (existing node/git/curl sufficed).
