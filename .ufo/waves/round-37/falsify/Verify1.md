D1 present=yes honest=no verdict=partial
# Verify1 — round-37 falsify: D1 (restore + mark) of the round-36 spot-check

Checked at lane HEAD 9ae8468. HEAD moved 86c0676 → 5bc40d0 → 469500f → 9ae8468 during this run; the four notes are identical at 5bc40d0, 469500f, 9ae8468, and at the final re-check 08ee2cf (one notice hunk `@@ -1,0 +2 @@` per note). Pin `/fast/scratch/kumitate-r36/src` = 31c465f15669f744848bd9f5d56191c5085670f7 (`git rev-parse HEAD`). Read-only: `git --no-optional-locks`, no lane writes, no lane gate scripts run, no installs. Scratch: `/fast/scratch/kumitate-r37/Verify1/` (`d1-current.json`; `parsed.json` is the superseded 86c0676 state).

Assigned D1 (`corpus/lessons/round-36-verifier-spotcheck.md:193-196`): "Restore anchor truth … For each moved anchor, keep the base line wherever its symbol is still on that line. Until the notes are repaired, mark each of them in the note itself."

## 1. Restore — present in reset form; per-anchor form absent (owed)

Command: `git --no-optional-locks diff --stat 0614092 -- corpus/knowledge/{native-trial-launch,remaining-scripts-census,route-probe-cluster,sighting-wall}.md`

```
 corpus/knowledge/native-trial-launch.md      | 1 +
 corpus/knowledge/remaining-scripts-census.md | 1 +
 corpus/knowledge/route-probe-cluster.md      | 1 +
 corpus/knowledge/sighting-wall.md            | 1 +
 4 files changed, 4 insertions(+)
```

`--numstat` gives `1 0` per file (zero deletions); `git diff -U0` hunk is `@@ -1,0 +2 @@` in each. The four notes are byte-identical to 0614092 except one inserted notice line at line 2. Every anchor reads its 0614092 value.

The assigned per-anchor rule (keep base only where its symbol is still on it, otherwise use the line where it is) is not what landed. Fleet report erratum 5–7 (`.ufo/reports/round-37/kumitate.md:125-156`) says the symbol-keyed restoration "was unsafe", the notes are "reset", and "A correct per-anchor D1 … was NOT implemented … Owed."

## 2. Mark — present and accurate

Command: `grep -c '^> \*\*Round-37 restoration (2026-10-21; final' <four notes>` → `1` in each (line 2).

Text (identical in all four): "This note is reset to its 0614092 bytes: the round-36 shift-repair is removed, so no anchor here is a round-36 artifact. Pre-existing anchors that were already false at the pin remain as ratcheted fidelity debt; re-verification against the pin is owed. Do not claim this note as pin-true."

Each statement matches the tree: the identity in §1, and `.ufo/pins/fidelity-ratchet.json` carries per-note entries for all four notes (total 200).

## 3. Independent measurement (not committed by the lane; Verify1 parser at pin 31c465f1)

Rule: backticked `:N` / `path:N` span after a symbol span; file = most recent path in the section (basename fallback); true = symbol or its longest identifier on the cited range at the pin. Round-36 (91da27c6) vs current (= base + notice), aligned by line:

```
                                             native    S8    S7    S4   total
base true,  r36 false (harm removed)            6       81     7    15     109
base false, r36 true  (r36 gain discarded)     22       22     1     9      54
false in both        (base debt carried)       13       72    83    15     183
true in both                                   13      177    32    31     253
unpaired (anchor count differs base/r36)        0       62     6     0      68
```

Discarded gains, checked at the pin: `native-trial-launch.md` anchor for `PROFILE` cites `run-omp-native-trial.mjs:50` (a comment line, false) at base and in HEAD; round-36 `:56` is `export const PROFILE = "omp-native-v2";` (true). `PROPOSAL_WAVE_CEILING`: base `:109` is `for (const blueprint of proposalBlueprints) {` (false); round-36 `:115` is `export const PROPOSAL_WAVE_CEILING = 16;` (true).

Parser-dependent: the closure counted 123 harms under its own rule; mine gives 109 plus 68 unpaired. Direction matches.

## 4. Record claims about D1 at 9ae8468

- CONTRADICTED — fleet report erratum 7 (`.ufo/reports/round-37/kumitate.md:146-153`): "8 true improvements per affected note were lost." Measured per note: native 22, S8 22, S4 9, S7 1 (54 total; the closure's own count is 56). The "8 per note" figure understates two of the four notes by about 3×.
- ABSENT — `.ufo/waves/round-37/repairs.md:3-5`: "`git diff --stat` recorded in the report." `grep -n 'insertion\|files\? changed' .ufo/reports/round-37/kumitate.md` returns nothing; the report names the command but holds no output.
- STALE — `repairs.md:3-5` ("every symbol-keyed anchor … reverted") and `corpus/lessons/round-37.md:13` ("(every symbol-keyed anchor)"). The bytes match the outcome wording, but the method described is the one erratum 5 retired. Neither lane file carries a correction; only the fleet report does.
- HONEST — `corpus/lessons/round-37.md:21-23`: "Independent truth re-measurement is OWED … D1's throwaway parser output was not committed."
- The replacement counts `274 + 29 + 36 + 30` (fleet report line 17) reproduce only as round-36 → 86c0676 position changes (273 / 29 / 32 + 4 lost on the corrupted row / 30). They describe a superseded state, not base-relative changes.

## 5. Superseded state (86c0676, corrected by 5bc40d0) — for the record

At 86c0676 the notes were not a base revert. `git diff --stat 0614092` showed 99 insertions / 91 deletions; a revert with the then two-line notice would show 8 insertions and 0 deletions. 178 anchor numbers differed from base across the 91 changed lines; 65 equal the next anchor's base value on the same line (a one-symbol forward shift, the defect D1 names). Examples: `countActiveSparks` `observe.mjs:415` → `:493` (the `loadObservations` line); `parseArgs` `collect-omp-native-handoff.mjs:120` → `:118` (the `COLLECTOR_USAGE` line). The route-probe row at line 89 changed from `probe-ufo-route-health.mjs:1080`/`1117` to `` `66`/`66` ``. 15 lines carried non-anchor edits: 14 lost backticks (one also reworded), 1 corrupted row. 40 base-true anchors that round-36 kept true became false. All of this is removed by 5bc40d0.

## 6. Verdict

- present=yes — restore (reset form) and mark are in the tree (§1–2). The per-anchor restore the spot-check assigned is absent and explicitly owed (§1).
- honest=no — the notice and the lesson gate are accurate. Two record claims fail the failing condition: the erratum 7 magnitude is contradicted (§4), and the repairs.md stat record is absent (§4).
- verdict=partial.

## 7. Smallest safe correction (lane owner)

1. Fleet erratum 7: replace "8 true improvements per affected note" with the per-note counts 22 / 22 / 9 / 1 (54).
2. `repairs.md` D1 line: "four notes reset to 0614092 bytes; one notice line each; per-anchor D1 not implemented (owed); re-measurement owed". Drop "recorded in the report" unless the stat output is committed (§1 output).
3. `corpus/lessons/round-37.md:13`: drop "(every symbol-keyed anchor)" or add a superseding note.
4. Commit the independent measurement command and its recorded output (QUALITY Q16 requires a committed command with recorded output).
5. Per-anchor D1 stays owed: it needs a fixture-first sentence parser (erratum 7).

## 8. Commands run (all read-only)

- `git --no-optional-locks log --format='%h %s' -n 6`; `show --stat` on 5bc40d0, fb5b90e, fdac52c, 9ae8468.
- `git --no-optional-locks diff --stat|--numstat|-U0 0614092 -- <four notes>`; `show 0614092:<note>`; `show 91da27c6:<note>`.
- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`.
- Verify1 parser (scratch, §3); `sed -n` / `grep -n` at the pin (for example `scripts/ufo-sighting-lib/observe.mjs:415` = `export function countActiveSparks`, `:493` = `export function loadObservations`).
- Tool installs: none.
