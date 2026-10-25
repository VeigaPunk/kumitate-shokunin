VERDICT: Across 12 mapped historical forgery classes, frozen R64/J64 and report-receipt-diff accept 7 classes outright and partially guard 3, leaving 10 cheap forgeries open against each counter.

## Evidence

Frozen counter invocations against current revision `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`:
```
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef
RECEIPT64_UNMET held=3/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6 | P5 MISS report-not-given
$ node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef --no-live
JJ64_UNMET held=0/8 checks=8 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=J64 | J1 MISS entry-absent | J2 MISS no-entry | J3 MISS no-rows | J4 MISS bullets=0 | J5 MISS live-fetch-skipped | J6 MISS stated-keys=0;workspaces_after_add:stated=undefined:live=2;seat_gets_base_file:stated=undefined:live=yes;seat_has_git_dir:stated=undefined:live=no;seat_file_in_default_tree:stated=undefined:live=no;default_status_clean_after_seat_write:stated=undefined:live=1 | J7 MISS census-exit=0 province-names-entry=false readme-map-clean=false | J8 MISS no-amendment-heading,amendment-lacks-entry-or-M7
$ node scripts/report-receipt-diff.mjs --selftest
REPORT_RECEIPT_SELFTEST: PASS (20/20)
```

Historical Forgery Class Cross-Mapping:
| Historical Class | R64 Probe Status | J64 Probe Status | report-receipt-diff Status | Guard / Reproducer Pointer |
|---|---|---|---|---|
| 1. Worktree read (R61-V2) | Guarded | Guarded | Partial | Probe: `receipt64:43`, `jj64:52` archive rev; Tool: line 171 reads live `--report` |
| 2. Substring match (R61/R63) | Partial | Accepted | Accepted | `jj64:157,178,210,230` uses `includes`; Tool line 85 matches receipt `l.includes` |
| 3. File count (R61-V2) | Guarded | Partial | Accepted | Probe: `receipt64:60`; `jj64:102,151,196` thresholds; Tool line 58 boxes count only |
| 4. Fixture/attacker URL (R63) | N/A | Accepted | N/A | `jj64:112,171` curls arbitrary HTTP/HTTPS URL with no host whitelist |
| 5. Stub tool (R61/R63) | Partial | Accepted | N/A | `receipt64:93-97` checks 2 static stubs; accepts round-branching stub |
| 6. Hand-written wave (R60/R61) | Accepted | N/A | Accepted | Tool lines 60-77 trusts any committed `.ufo/waves/round-N/{base,close}/*` receipt |
| 7. Recomputed pin (R61) | N/A | Accepted | N/A | `jj64:127-130` compares against committed `.ufo/pins/source-captures.json` |
| 8. Vacuous regex (R61) | Guarded | Guarded | Accepted | Tool lines 38-41 ignores `TODO`, `FIXME`, `__A__`, short hashes, bare tallies |
| 9. Misindexed cells (R61) | N/A | Guarded | N/A | `jj64:106-108` asserts `c.length === 13` and uses contract indices 2, 4, 8, 9, 11 |
| 10. Unlabelled tally (Q53) | Accepted | N/A | Accepted | Tool line 39 regex requires `([A-Z0-9]*_(?:HELD\|UNMET))`; bare `held=x/y` ignored |
| 11. Tautological demo (J64) | N/A | Accepted | N/A | `jj64:197-203` verifies stated == live string equality; echo script satisfies |
| 12. Quote truncation (R63) | N/A | Accepted | N/A | `jj64:154` checks `<= 25` words with no minimum length; 1-word words pass |

## Findings

- `K64ConnForgeryClasses-1` (Defect/Blocker, attacks frozen probe P2): `receipt64-probe.mjs:61` requires `seen.size >= 8`, but committed `controls/receipt/*/expect` files exercise only 6 unique IDs (`PLACEHOLDER`, `TALLY_UNRECEIPTED`, `SHONEN_COUNT`, `HASH_DEAD`, `RECEIPT_MISSING`, `SECTION_MISSING`). The tool defines only 7 IDs (`HASH_ORPHAN` is unexercised). P2 fails with `ids=6`. At least two new control cases and finding IDs (e.g. `HASH_ORPHAN`, `TALLY_UNLABELLED`) must be integrated to unblock P2. Reproducing command: `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` → `P2 MISS ids=6`.

- `K64ConnForgeryClasses-2` (High, attacks R64 & tool): TEN cheapest forgeries open against R64 (ranked by cost to forger):
  1. Bare unlabelled tally: report quotes `Operability: held=10/10` without `LABEL_HELD`; tool skips it (`repro-r64.sh` case 1: 0 findings).
  2. Colon-syntax tally bypass: report writes `LABEL_HELD: held=10/10`; regex `\s+` fails, tally skipped (`repro-r64.sh` case 2: 0 findings).
  3. Alternative verb tally: report writes `LABEL_PASSED held=10/10`; non-HELD/UNMET skipped (`repro-r64.sh` case 3: 0 findings).
  4. Synthetic unbacked receipt: forger commits `close/fake-tip.txt` with `CLAIM_HELD held=1/1`; tool trusts any receipt file in `close/`.
  5. False match on failing receipt: line 85 `l.includes` matches `ERROR: CLAIM_HELD held=10/10 failed` as CLEAN (`repro-r64.sh` case 4: 0 findings).
  6. Short commit hash bypass: 7-39 hex commit hashes bypass `HASH40` and are never checked (`repro-r64.sh` case 5: 0 findings).
  7. Out-of-scope receipt path: report cites `.ufo/waves/round-63/close/bad.txt`; `RECEIPT_PATH` only checks round-64 (`repro-r64.sh` case 6: 0 findings).
  8. Unflagged template tokens: `TODO`, `FIXME`, `__A__` (1 char) bypass `PLACEHOLDER` regex (`repro-r64.sh` case 7: 0 findings).
  9. Round-specializing stub tool: tool checks `--round` (returns DRIFT on 60, CLEAN on 63/64) passing P1-P5 without diffing.
  10. Unauthorized `[x]` SHONEN boxes: tool accepts `- [x]` as meeting `boxes >= 4` identically to `[~]`.

- `K64ConnForgeryClasses-3` (High, attacks J64): TEN cheapest forgeries open against J64 (ranked by cost to forger):
  1. Tautological echo demo: `scripts/jj-seat-demo.sh` greps `- <k>=<v>` from entry and echoes `JJ_SEAT: <k>=<v>` (`repro-j64.sh` case 1: 0 errors).
  2. Minimal 3-line substrate amendment: 3 lines (`### Amendment 2026-10-25\nSee <entry> for M7`) pass J8 (`repro-j64.sh` case 2: 0 errors).
  3. Common single-word quotes: bullets with words like "Git", "workspace" pass J4/J5 without domain content (`repro-j64.sh` case 3: 0 errors).
  4. Attacker/gist-hosted URL: registering a raw GitHub gist passes J5 live curl without domain validation.
  5. Semantic inversion: stated failure (e.g. `seat_file_in_default_tree=yes`) passes J6 as HELD because string equality matches.
  6. Duplicate URL fragment splitting: registering URL with `#overview` passes `ids.length >= 2` without 2 distinct sources.
  7. Hollow knowledge entry: 14-line header + 4 quote bullets + 12 demo bullets passes J1, J4, J6 without explanatory prose.
  8. Synthetic capture with self-consistent pin: committing 20-byte capture and sha256 to `source-captures.json` passes J3.
  9. Unchecked recheck command: `recheck: none` passes J1 regex `/^recheck:\s*\S+/m` (`repro-j64.sh` case 4: true).
  10. Blind README map insertion: adding unverified row to `corpus/README.md` and pin passes J7 `README_MAP: CLEAN`.

## Artifacts

- `.ufo/waves/round-64/w1/K64ConnForgeryClasses.md` (this report)
- `.ufo/waves/round-64/build/K64ConnForgeryClasses/forgery-class-map.tsv` (12-class comparative mapping table)
- `.ufo/waves/round-64/build/K64ConnForgeryClasses/repro-r64.sh` (standalone reproducible test harness for 7 R64 forgeries)
- `.ufo/waves/round-64/build/K64ConnForgeryClasses/repro-j64.sh` (standalone reproducible test harness for 4 J64 forgeries)
- `.ufo/waves/round-64/build/K64ConnForgeryClasses/report-receipt-diff.patch` (draft patch resolving R64 bypasses & P2 deadlock)

## Limits

- Live curl check J5 was verified offline (`--no-live`) to avoid external network dependencies during local test execution.
- Did not patch repository scripts or freeze controls; proposed fixes are staged as patch text in build dir for L1 integration.
