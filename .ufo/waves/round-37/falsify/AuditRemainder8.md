AUDIT Remainder8 anchors=22 false=19 overreverted=0 notice=bad verdict=refuted

Scope: corpus/knowledge/remaining-scripts-census.md, group 8/8 of the 173 restored anchor occurrences that differ from base 0614092. Restored text = working tree = HEAD 86c0676 (file clean). Round-36 comparator = 91da27c (byte-identical to 3d5760a). Pin = /fast/scratch/kumitate-r36/src, HEAD 31c465f1, status clean.

## Method (reproducible)
1. `git -C <lane> diff 0614092 -- corpus/knowledge/remaining-scripts-census.md` -> 46 changed lines (+48/-46; the two notice lines are the only insertion).
2. Each of the 46 line pairs is word-diffed. Anchors (`scripts/<rel>:N[-M]`, and short `:N` inheriting the nearest earlier full path, per the note's own rule) are keyed by resolved file and range. 173 restored occurrences differ from base.
3. Eighths: group k = items floor((k-1)*173/8)+1 .. floor(k*173/8), note order. Group 8 = #152-#173 (22). Ceil partitioning gives #153-#173 (21); the false count stays 19.
4. Symbol test: the sentence's own symbol must appear verbatim on the cited line (or anywhere in a cited range). Phrase-only claims are judged on mechanism and say so.

## Group 8 (restored text vs pin 31c465f1)
| # | note L | restored anchor (pin) | sentence symbol | symbol on restored line? | base 0614092 -> on base line? | round-36 | verdict |
|---|---|---|---|---|---|---|---|
| 152 | 713 | state-retention.test.mjs:767-771 | watch_active | yes (771) | :595 yes | = base | true (range) |
| 153 | 713 | state-retention.test.mjs:795-800 | queue_unsafe | NO (only 791) | 781-792 yes | = base | FALSE, harm |
| 154 | 717 | statusline-hook.test.mjs:22 | shouldStampDisplayRefresh | NO (line 22 = `function test`) | :16 yes | = base | FALSE, harm |
| 155 | 717 | statusline-hook.test.mjs:97-98 | CLOSED (null/non-object) | NO (pin summary + exit 1) | :44 yes | = base | FALSE, harm |
| 156 | 717 | statusline-hook.test.mjs:97-98 | CLOSED (missing levels) | NO | :50 yes | = base | FALSE, harm |
| 157 | 717 | statusline-hook.test.mjs:97-98 | CLOSED (missing phaseCounts) | NO | :54 yes | = base | FALSE, harm |
| 158 | 717 | statusline-hook.test.mjs:97-98 | CLOSED (missing hatch) | NO | :58 yes | = base | FALSE, harm |
| 159 | 717 | statusline-hook.test.mjs:97-98 | `?` sentinel | NO | :62-63 yes | = base | FALSE, harm |
| 160 | 717 | statusline-hook.test.mjs:97-98 | closed envelope formats closed | NO | :66-70 yes | = base | FALSE, harm |
| 161 | 717 | statusline-hook.test.mjs:97-98 | TTL freshness | NO | :73-85 yes | = base | FALSE, harm |
| 162 | 717 | statusline-hook.test.mjs:97-98 | display-stamp refresh | NO | :87-94 yes | = base | FALSE, harm |
| 163 | 729 | swarm-collect.test.mjs:31 | `test` helper | NO (line 31 = R22_HOLDER_TOKEN) | :83 yes | = base | FALSE, harm |
| 164 | 748 | swarm-wave.test.mjs:151 | mkdtempSync(tmpdir()) | symbol yes, but tmpRoot helper, not the :313 fixture | :313 yes | = base | true-symbol, mis-sited (not counted) |
| 165 | 752 | watchdog-repend.mjs:366-371 | unsupported argument | NO (only :360) | :360 yes | = base | FALSE, harm |
| 166 | 752 | watchdog-repend.test.mjs:16 | MAX_ATTEMPTS = 3 | symbol yes (import `MAX_ATTEMPTS,`); "= 3" is mjs:58 | mjs:58 yes (definition) | = base | true-symbol, mis-sited (not counted) |
| 167 | 752 | watchdog-repend.test.mjs:57 (inherits test file from #166) | STATE_SCHEMA = 2 | NO (`return {status:0,...}`; symbol absent from file) | mjs:57 yes | = base | FALSE, harm |
| 168 | 752 | watchdog-repend.test.mjs:341-345 | pruned attempts/refusals/notes | NO (fixture setup) | mjs:341-345 yes | mjs:64 NO | FALSE, harm |
| 169 | 752 | watchdog-repend.test.mjs:64 | STABLE_REFUSAL_REASONS | NO (test title; symbol at :65) | mjs:64 yes | = base | FALSE, harm |
| 170 | 752 | watchdog-repend.test.mjs:244-249 | rowSignature(row) | NO | mjs:244-249 NO (rowSignature at mjs 66/226/282) | = base (NO) | FALSE, already false at base |
| 171 | 752 | watchdog-repend.test.mjs:244-249 (was :282) | the manifest class | NO | mjs:282 yes (manifestClass) | = base | FALSE, harm |
| 172 | 752 | watchdog-repend.test.mjs:244-249 | transient refusal classes unsuppressed | NO (no suppression gate in file) | mjs:244-249 yes by mechanism (STABLE_REFUSAL_REASONS gate, :245) | = base | FALSE, harm |
| 173 | 752 | watchdog-repend.test.mjs:159 | SPAWN_FAILURE_TAIL_MAX = 120 | NO (symbol absent from file) | mjs:159 yes | = base | FALSE, harm |

Counts: restored-but-false 19; 18 of them were true at base (harm); #170 was already false at base. Overreverted within the 22: 0 (round-36 equals base for all 22 except #168, where round-36 is false).
Flagged, not counted: #164 and #166 (symbol present, but at a different site than the sentence describes). Under a strict site rule, false = 21.

## Restorations in the same sentences (outside the 22)
- L715 `phaseCounts (:36)`: base true; round-36 `:4` is a comment only. Restored to base, no harm.
- L746 `tmpRoot (:150)`, `spawn_only... (:106)`, `hard_cap_admits... (:766)`: base true; round-36 :37 / :766 / :775 false. Correct reverts.
- L752 `--fleet` `(scripts/ufo-watchdog-repend.mjs:278-280)`: verbatim `--fleet` absent at 278-280 (the membership gate is `row.fleet !== fleet` at :280); round-36 `:355` carries the flag in the argv list. Borderline overreverse, flagged, not counted.

## Whole-note restorations (133 occurrences back at base)
Automatic symbol check over all 133, then hand check of every flagged case.
- 94 correct reverts (base true, round-36 false).
- 10 no harm (both true; includes nativeProfiles :100 `devin-native-v1` and the agentId test at :560).
- 14 both false.
- 1 unclassified (fleet-selfheal :114 vs :25; no verbatim symbol).
- 14 OVERREVERTED (base false, round-36 true, restored = base):
  - code-level (7): cargo-shim.sh `BUILD_FAMILY` 128->117; cargo-shim.sh `have` 136->125; local-helper.mjs `readInput` 139->135; local-helper.mjs `input_too_large` 132->128; local-helper.mjs `model_output_invalid` 309->264; ufo-l0-monitor-hook.test.mjs `loadHook` 32->30; install-shim.sh `mv -f` 61->62.
  - comment/JSDoc/string-only (7): fleet-ledger-read.mjs `extendLedgerMemoWithSuffix` 348->253 (comment; definition at 278); local-helper.mjs `UFO_LOCAL_HELPER_URL` 332->157 (error string; env read at 325); ufo-l0-monitor-hook.test.mjs `REPO_ROOT` 37->7 (comment; code at 35-36); ufo-mission-lifecycle.mjs `ufo-mission-lifecycle-v1` 187->17 (JSDoc; code at 174); ufo-mission-lifecycle.mjs `resumeHint` 181->28 (JSDoc; code at 168/185); ufo-mission-observation.mjs `label` 66->27 (comment word; code at 81); cargo-shim.sh `rc != 0` 322->312 (comment).

## Notice (note line 2)
Present: yes. Accurate: no.
- "reverted to the lines their 0614092 sentences named": of 306 occurrences where round-36 or the restored text departs from base, 133 are back at base, 167 sit at values equal to neither base nor round-36, and 6 keep the round-36 value. Examples of the 167: eight restored `statusline-hook.test.mjs:97-98` in place of base :44/:50/:54/:58/:62-63/:66-70/:73-85/:87-94; `rotateLedgerIfNeeded` cited at `fleet-ledger-rotate.test.mjs:54` where base cites `fleet-ledger-rotate.mjs:757`. In the 22 in-scope anchors, zero equal base.
- "the round-36 shift-repair moved them one symbol off": true for 94; wrong for the 14 round-36 values that were real improvements, which the restoration reverted.
- "treat line anchors here as at their base revision": contradicts the note's own pin (31c465f1). Base coordinates are not a usable fallback either: base `:244-249` for rowSignature is false at the pin.
Operability: a reader following the restored anchors lands on the wrong line for 19 of 22 in-scope anchors, and on the wrong file for 8 of them (#166-#173 inherit the test file).

## Evidence (commands; output abridged)
- `cmp <scratch>/r36-91da27c.md <scratch>/r36-3d5760a.md` -> identical. `git -C <lane> status --porcelain -- corpus/knowledge/remaining-scripts-census.md` -> empty.
- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` -> 31c465f15669...; `git status --porcelain | wc -l` -> 0.
- `sed -n '771p;791p;795,800p' .../ufo-state-retention.test.mjs` -> 771 `["watch_active"]`; 795-800 has no queue_unsafe (791 has it).
- `sed -n '16p;22p' .../ufo-statusline-hook.test.mjs` -> 16 imports shouldStampDisplayRefresh; 22 `function test(name, fn) {`.
- `sed -n '97,98p' .../ufo-statusline-hook.test.mjs` -> pin summary line and `process.exit(1)`; no CLOSED, `?`, closed, TTL or stamp.
- `sed -n '31p;83p' .../ufo-swarm-collect.test.mjs` -> 31 `const R22_HOLDER_TOKEN`; 83 `function test(name, fn) {`.
- `grep -n 'unsupported argument' .../ufo-watchdog-repend.mjs` -> 360 only; `sed -n '366,371p'` has no such symbol.
- `grep -c 'STATE_SCHEMA\|SPAWN_FAILURE_TAIL_MAX' .../ufo-watchdog-repend.test.mjs` -> 0.
- `grep -n STABLE_REFUSAL_REASONS .../ufo-watchdog-repend.test.mjs` -> 17, 65 (not 64).
- `sed -n '278,280p;355p' .../ufo-watchdog-repend.mjs` -> 280 `row.fleet !== fleet`; 355 argv list containing `--fleet`.
Scratch (not lane): /fast/scratch/kumitate-r37/AuditRemainder8/ (census.diff.txt, base-0614092.md, r36-91da27c.md, cur-worktree.md).

## Gaps and conduct
- The 94 correct reverts and 10 no-harm rows rest on the automatic symbol check; the 14 overreverts were hand-checked line by line.
- The "spot-check D1" cited by the notice was not opened.
- Phrase-only claims (#162 display stamp, #171 manifest class, #172 transient refusal) were judged on mechanism.
- No builds, tests or probe runs (not requested). No package installs.
