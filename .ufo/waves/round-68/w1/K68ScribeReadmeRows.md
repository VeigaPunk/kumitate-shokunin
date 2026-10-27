VERDICT: The readme-map rows+pins for round 68 are drafted and executed in a clone — the entry row, the round-68 lesson row and the two pin entries take the gate from `CLEAN files=163 rows=163 covered=163` to `CLEAN files=165 rows=165 covered=165` (exit 0), while the round-66/67 spot-check rows the assignment asks me to draft were already repaired at the freeze commit `39f61816` and must NOT be re-added (a duplicate row is DRIFT).

## Evidence

Clone (fixture, deleted after the run): `git clone --shared <lane> /fast/scratch/hyaku/kumitate-r68/K68ScribeReadmeRows/lane`, `git -C <clone> rev-parse --show-toplevel` → `/fast/scratch/hyaku/kumitate-r68/K68ScribeReadmeRows/lane`; `git -C <clone> log -1 --format=%H` → `39f61816d4ee7a8d401df42c1818c91a9c537bce`; `git -C <clone> status --porcelain` → empty.

```
$ (clone at 39f61816) node scripts/readme-map.mjs
README_MAP: CLEAN files=163 rows=163 covered=163
exit=0

$ git -C <clone> checkout -q d23892ad44b41e1af63b3edb949d265ca1dd812d ; node scripts/readme-map.mjs
README_MAP: note uncovered:lessons/round-67-verifier-spotcheck.md
README_MAP: note unpinned:lessons/round-66-verifier-spotcheck.md
README_MAP: note unpinned:lessons/round-67-verifier-spotcheck.md
README_MAP: DRIFT files=163 rows=161 covered=161 bad=4 first=uncovered:lessons/round-66-verifier-spotcheck.md
exit=1

$ <both new rows + both tail pins + the two new corpus files> node scripts/readme-map.mjs
README_MAP: CLEAN files=165 rows=165 covered=165
exit=0
```

The inherited repair is committed, not pending:
```
$ git show 39f61816 --stat | grep -E 'README|readme-map'
 .ufo/pins/readme-map.json                          |    4 +-
 corpus/README.md                                   |    2 +
$ grep -n 'round-6[67]-verifier-spotcheck' corpus/README.md .ufo/pins/readme-map.json
corpus/README.md:197:…round-66-verifier-spotcheck.md…
corpus/README.md:198:…round-67-verifier-spotcheck.md…
.ufo/pins/readme-map.json:165:  "lessons/round-66-verifier-spotcheck.md",
.ufo/pins/readme-map.json:166:  "lessons/round-67-verifier-spotcheck.md"
$ git show d23892ad:corpus/README.md | grep -c 'round-6[67]-verifier-spotcheck'
0
```

Gate sensitivity, five mutations (each executed in the clone):
```
C0 stubs only     DRIFT files=165 rows=163 covered=163 bad=4 first=uncovered:knowledge/mcp-deprecation-registry.md
C1 rows only      DRIFT files=165 rows=165 covered=163 bad=2 first=unpinned:knowledge/mcp-deprecation-registry.md
C2 pins only      DRIFT files=165 rows=163 covered=165 bad=2 first=uncovered:knowledge/mcp-deprecation-registry.md
C3 duplicate row  DRIFT files=165 rows=166 covered=165 bad=1 first=duplicate-row:knowledge/mcp-deprecation-registry.md
C4 unmapped row   DRIFT files=165 rows=164 covered=165 bad=2 first=format-unmapped:knowledge/mcp-deprecation-registry.md
```

Pin ordering: `json` load of the 163-entry `covered` array → `covered == sorted(covered)` is **false**, 11 order violations (first: index 53, `knowledge/temporal-worker-versioning-pinning.md` before `knowledge/swarm-wave-lifecycle.md`); bisect insertion also reads `CLEAN files=165 rows=165 covered=165`, so the gate is order-insensitive (`loadRegistry` rejects only malformed/duplicate entries; `evaluate` uses a `Set`).

Byte facts used in the entry row: `sha256sum` of the entry seat's `S209-omp-v18.12.6-sse.ts` and `S212-omp-v18.13.1-sse.ts` → both `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`, 15,183 B each.

## Findings

1. **K68ScribeReadmeRows-1 — high, integration safety (the assignment premise is stale).** The brief says `lessons/round-66-verifier-spotcheck.md` and `round-67-verifier-spotcheck.md` "landed without README map rows/pins" and must be drafted. They were repaired inside the freeze commit itself: `corpus/README.md:197-198` and `.ufo/pins/readme-map.json:165-166` carry both, and the base reading `DRIFT files=163 rows=161 covered=161 bad=4` is reproduced only at `d23892ad`. A seat that follows the brief literally creates DRIFT — measured `bad=1 first=duplicate-row:knowledge/mcp-deprecation-registry.md` (C3) is the same arm a duplicated spot-check row hits. Reproduce: `git show 39f61816 --stat -- corpus/README.md .ufo/pins/readme-map.json` and `grep -n 'round-6[67]-verifier-spotcheck' corpus/README.md .ufo/pins/readme-map.json`.

2. **K68ScribeReadmeRows-2 — medium, C2 predicate exposure (M9).** M9 requires `README_MAP: CLEAN` on the archive. The entry alone is DRIFT: the entry file plus nothing else reads `bad=4 first=uncovered:knowledge/mcp-deprecation-registry.md` (C0 shape, with `round-68.md` also absent). The row, the pin and `corpus/knowledge/mcp-deprecation-registry.md` must land in the same change; likewise `corpus/lessons/round-68.md` + its row + its pin. Reproduce: `node scripts/readme-map.mjs` after adding only the entry file.

3. **K68ScribeReadmeRows-3 — low, pin convention vs the brief.** The brief says "sorted position", but the array has 11 order violations and every round since 62 appended at the tail (the freeze commit's own pin diff appended `lessons/round-66-verifier-spotcheck.md` + `round-67-verifier-spotcheck.md` after `lessons/round-66.md`). Tail append is what I recommend (4-line, 2-hunk diff); strict-lex insertion for the entry is index 28 (between `knowledge/loop-driver.md` and `knowledge/mcp-orchestration-contract.md`) and for `lessons/round-68.md` between `lessons/round-6.md` and `lessons/round-7.md`. Both placements read CLEAN — the choice is style, not correctness. Reproduce: load the pin and compare to `sorted()`.

4. **K68ScribeReadmeRows-4 — low, unbacked pointer avoided.** `.ufo/waves/round-68/build/captures/` exists but is **empty**; the C2 captures live in `.ufo/waves/round-68/build/K68ScribeEntry/captures/` (seven files, `ls -la` in Evidence-adjacent run). The drafted row names the entry seat's directory and states that if the L1 relocates captures the row must name the pinned path — an empty directory cited as a primary source would be a false pointer. Reproduce: `ls -la .ufo/waves/round-68/build/captures/ .ufo/waves/round-68/build/K68ScribeEntry/captures/`.

5. **K68ScribeReadmeRows-5 — info, arithmetic is conditional.** `files = 163 + 2`, `rows = 163 + 2`, `covered = 163 + 2` gives `CLEAN files=165 rows=165 covered=165`; `corpus/routed-ledger.md` sits at the corpus root and is outside the covered namespace (`COVERED_RE = ^(knowledge|lessons)/…$`, `loadFiles` base check). Any further `corpus/knowledge|lessons/*.md` landed by another seat shifts all three counts equally; the expectation `165/165/165` holds only if the round lands exactly these two covered-namespace files.

## Artifacts

- `.ufo/waves/round-68/build/K68ScribeReadmeRows/readme-rows.md` — the draft: entry row, round-68 lesson row (the two spot-check rows quoted verbatim as *already present*), pin fragments (tail + strict-lex positions), the count arithmetic, five control measurements.
- `.ufo/waves/round-68/build/K68ScribeReadmeRows/gate-lane-freeze-tip.txt` — `CLEAN files=163 rows=163 covered=163`, `exit=0`.
- `.ufo/waves/round-68/build/K68ScribeReadmeRows/gate-base-d23892ad.txt` — `DRIFT files=163 rows=161 covered=161 bad=4 first=uncovered:lessons/round-66-verifier-spotcheck.md`, `exit=1`.
- `.ufo/waves/round-68/build/K68ScribeReadmeRows/gate-after-rows-plus-pins.txt` — `CLEAN files=165 rows=165 covered=165`, `exit=0`.
- `.ufo/waves/round-68/build/K68ScribeReadmeRows/integration-sim.patch` — the exact 4 added lines (2 README rows + 2 pin entries) as a clone `git diff`.
- `.ufo/waves/round-68/w1/K68ScribeReadmeRows.md` — this report.
- Scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeReadmeRows/` deleted after the receipts were copied into the build dir.

## Limits

- No lane file was edited: `corpus/README.md` and `.ufo/pins/readme-map.json` are the L1's to integrate; every claim here was executed in the `--shared` clone (now removed).
- Only `readme-map` was exercised. Not run: `scripts/sources-check.mjs`, `source-capture.mjs`, the census, `ledger68-probe.mjs`, `deprec68-probe.mjs`, and `readme-map.mjs --selftest` (the embedded fixture suite) — the counting command in the plan is the gate without `--selftest`.
- The entry row's Covers cell reports the entry as `K68ScribeEntry` described it (sections `## Scope`, `## Located quotes`, `## Registry snapshot`, `## Two clocks`, `## The live clock`, `## Bearing on the installed OMP release`, `## Limits`); if the landed entry's bytes differ, the row must be re-derived from those bytes.
- The round-68 lesson row was aligned with `K68ScribeLesson` (rule names, `corpus/routed-ledger.md` 61/12, six hardenings, Q64 plan-declared) but the lesson itself was not yet on disk when this row was drafted; the row follows the lesson bytes once landed.
- No tool was installed or upgraded.
