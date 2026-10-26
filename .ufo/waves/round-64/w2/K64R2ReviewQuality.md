VERDICT: Q60, Q61 and Q51-C1 at 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 continue Q59 without gap and carry Who-checks/Command/Fails-when/Shown-able-to-fail/Limit/Supersedes sub-bullets, but fail on 6 concrete defects: an uncreated close receipt cited in Q60, epoch/sweep claims in Q60 that describe `PBR_MAP_FROM=0` instead of default `PBR_MAP_FROM=65`, stale v1 counts (`20/20`, `16`) in Q61's cited receipt `q61-r63-report-clean.txt` (and `50` in `CHANGES-AFTER-FREEZE.md`), two v2 finding ids (`TALLY_CHECKS_MISMATCH`, `RECEIPT_EMPTY`) and the 39-hex `HASH_DEAD` arm omitted from Q61's `Fails when`/`Limit`, missing `corpus/lessons/round-64.md` grounding pointers in Q61/Q51-C1 (while `round-64.md:114` still calls Q51's hash open), and Q51-C1's hex-token count shifting from 55 at `dd1a3e6f` to 64 on the committed `corpus/QUALITY.md`.

## Evidence

1. **Q60 commands at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (`cwd=/home/vgpnk/Projects/shokunin/kumitate-shokunin`):**
   - `bash scripts/plan-before-ready.sh --round 64` → exit `0`:
     `PLAN_BEFORE_READY: PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=64 dir=.ufo/waves/round-64 plan=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef plan_ct=1792967888 marker=d92cf1fff3026087a0e21a3183b97de169c6f22c marker_kind=ready marker_ct=1792970647 marker_path=.ufo/waves/round-64/w1.ready map=SKIP reason=MAP_PRE_EPOCH_ROUND`
   - `PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --round 64` → exit `1`:
     `PLAN_BEFORE_READY: FAIL rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=64 dir=.ufo/waves/round-64 reason=MAP_DRIFT plan=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef plan_ct=1792967888 marker=d92cf1fff3026087a0e21a3183b97de169c6f22c marker_kind=ready marker_ct=1792970647 marker_path=.ufo/waves/round-64/w1.ready map=DRIFT map_exit=1 map_first=uncovered:lessons/round-63-verifier-spotcheck.md`
   - `bash scripts/plan-before-ready.sh --round 63` → exit `0`:
     `PLAN_BEFORE_READY: PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=63 dir=.ufo/waves/round-63 plan=b38a2065ab8ac5b198f6569b9013d04411c3d40d plan_ct=1792961253 marker=05b3176915de4175bb211b4b1422d8e56cf16888 marker_kind=ready marker_ct=1792964033 marker_path=.ufo/waves/round-63/w1.ready map=SKIP reason=MAP_PRE_EPOCH_ROUND`
   - `PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --round 63` → exit `1`:
     `PLAN_BEFORE_READY: FAIL rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=63 dir=.ufo/waves/round-63 reason=MAP_DRIFT plan=b38a2065ab8ac5b198f6569b9013d04411c3d40d plan_ct=1792961253 marker=05b3176915de4175bb211b4b1422d8e56cf16888 marker_kind=ready marker_ct=1792964033 marker_path=.ufo/waves/round-63/w1.ready map=DRIFT map_exit=1 map_first=uncovered:lessons/round-62-verifier-spotcheck.md`
   - `bash scripts/plan-before-ready.sh --all` (default `PBR_MAP_FROM=65`) → exit `1`:
     `PLAN_BEFORE_READY_SUMMARY: pass=13 fail=7 na=10 rounds=all(30) rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 exit=1 failed=35,36,37,38,39,40,62 na_rounds=49,52,53,54,55,56,57,58,59,60 map_red=` (every round 41–61, 63, 64 prints `map=SKIP reason=MAP_PRE_EPOCH_ROUND`).
   - `PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --all` → exit `1`:
     `PLAN_BEFORE_READY_SUMMARY: pass=10 fail=12 na=8 rounds=all(30) rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 exit=1 failed=35,36,37,38,39,40,58,60,61,62,63,64 na_rounds=49,52,53,54,55,56,57,59 map_red=58,60,61,63,64`
   - `bash scripts/plan-before-ready.sh --selftest` → `PLAN_BEFORE_READY_SELFTEST: PASS (18/18)` exit `0`.

2. **Q61 commands & real-data verification:**
   - `node scripts/report-receipt-diff.mjs --selftest` → `REPORT_RECEIPT_SELFTEST: PASS (52/52)` exit `0`.
   - `ls -1 .ufo/waves/round-64/controls/receipt | wc -l` → `37`; all 37 match `expect` across 8 distinct finding ids (`HASH_DEAD,PLACEHOLDER,RECEIPT_EMPTY,RECEIPT_MISSING,SECTION_MISSING,SHONEN_COUNT,TALLY_CHECKS_MISMATCH,TALLY_UNRECEIPTED`); `scripts/report-receipt-diff.mjs` defines 9 finding ids (+ `HASH_ORPHAN` in selftest).
   - Round-60 report (`git -C /home/vgpnk/Projects/shokunin show 7b0581ed63a46ac1961b1ecf98ec0caf561ccd9b:.ufo/reports/round-60/kumitate.md`, 13611 bytes; 6 tokens at lines 4, 5, 73, 88, 96, 190): `node scripts/report-receipt-diff.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 60 --report <r60> --rev dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` → `REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (round=60 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=13611)`, 6 `PLACEHOLDER` lines + `TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10`, exit `1`.
   - Round-63 report (`8fd46e614d6db3ca251b9ce75cdc7b94ecb574ad:.ufo/reports/round-63/kumitate.md`, 17479 bytes): `REPORT_RECEIPT: CLEAN (round=63 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=17479)` exit `0`.

3. **Q51-C1 hex-token sweep & commit checks:**
   - `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file -t 9237a72` and `git -C /home/vgpnk/Projects/shokunin cat-file -t 9237a72` → both `fatal: Not a valid object name 9237a72` exit `128`.
   - `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log -1 --oneline 923a172` → `923a172 round-49: record addendum — C2 re-scored 16/16 at 01b70bb0, LOG line for prior-art citations and the mount-binds disambiguation` (`923a172c7201de9ad5f68eb7fd2c7c3939672599`, cited at `corpus/lessons/round-49-verifier-spotcheck.md:10`); `01b70bb`, `c432cc9`, `e7a0711`, `26c886d` all resolve to `commit` in the lane.
   - `grep -oE '\b[0-9a-f]{7,40}\b' corpus/QUALITY.md | sort -u | wc -l` → `64` at `2ed8a5f8` (`55` at `dd1a3e6f`). Exactly 55 of 64 resolve as commits (52 lane, 3 fleet: `7b0581ed`, `7b0581ed63a46ac1961b1ecf98ec0caf561ccd9b`, `8fd46e614d6db3ca251b9ce75cdc7b94ecb574ad`); the same 9 non-resolving tokens remain (`0011223344556677`, `aabbccddeeff0011`, `03a258d6`, `0c1f9b22`, `3a32dd34`, `6faa34ab`, `d6068d1b`, `c7f7c401`, `9237a72`).

## Findings

- **K64R2ReviewQuality-1 (HIGH — broken receipt citation in Q60, `corpus/QUALITY.md:1034`).**
  - **Attacks:** `corpus/QUALITY.md:1034` cites `(.ufo/waves/round-64/close/plan-before-ready-r64.txt)` for the landed `PBR_MAP_FROM=0` / default `--round 64` and `selftest 18/18` outputs. That file does not exist in `2ed8a5f8` or on disk (`.ufo/waves/round-64/close/` is empty), violating Q52/Q55, and `build/K64ScribeQuality/q60-draft-arm-selftest.txt:14` still reads `PASS (10/10)` (the `18/18` receipt is `.ufo/waves/round-64/build/K64ExecReadmeGuard/receipts/10-selftest.txt:19`).
  - **Reproduce:** `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file -e 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8:.ufo/waves/round-64/close/plan-before-ready-r64.txt; echo exit=$?` → `exit=128`.
  - **Corrected text (`:1034`):** cite `.ufo/waves/round-64/build/K64ExecReadmeGuard/receipts/10-selftest.txt` and commit `.ufo/waves/round-64/build/K64R2ReviewQuality/receipts/plan-before-ready-r64.txt` to `.ufo/waves/round-64/close/plan-before-ready-r64.txt`.

- **K64R2ReviewQuality-2 (HIGH — Q60 `Epoch` and `Shown able to fail` misstate default `--all` and `--round 63` behavior under `PBR_MAP_FROM=65`, `corpus/QUALITY.md:1014,1029-1034,1039-1046`).**
  - **Attacks:** `scripts/plan-before-ready.sh:147,254-256` sets `MAP_FROM="${PBR_MAP_FROM:-65}"` and short-circuits every round `< 65` with `map=SKIP reason=MAP_PRE_EPOCH_ROUND` *before* calling `map_at_plan`. Yet `corpus/QUALITY.md:1042-1046` asserts without qualification that "rounds 41–56 [read] `map=SKIP reason=MAP_PRE_EPOCH` ... so the map arm is judged on seven rounds only — 57 and 59 CLEAN, 58, 60, 61, 63, 64 DRIFT." Under default `--all`, all rounds 41–61, 63, 64 read `map=SKIP reason=MAP_PRE_EPOCH_ROUND` (`pass=13 fail=7 na=10 ... map_red=`); the 7-round judgment (`pass=10 fail=12 na=8 ... map_red=58,60,61,63,64`) and `--round 63` `FAIL reason=MAP_DRIFT` occur only under `PBR_MAP_FROM=0`.
  - **Reproduce:** `bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --all | tail -n 10` vs `PBR_MAP_FROM=0 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --all | tail -n 10`.
  - **Corrected text (`:1039-1046`):** state explicitly that default `PBR_MAP_FROM=65` short-circuits rounds 41–64 to `map=SKIP reason=MAP_PRE_EPOCH_ROUND` (`pass=13 fail=7 na=10`), whereas `PBR_MAP_FROM=0` produces `MAP_PRE_EPOCH` on 41–56, `CLEAN` on 57/59, and `MAP_DRIFT` on 58, 60, 61, 63, 64 (`pass=10 fail=12 na=8`).

- **K64R2ReviewQuality-3 (MEDIUM — Q61 cited receipt `q61-r63-report-clean.txt` and `CHANGES-AFTER-FREEZE.md` carry stale v1/intermediate counts, `corpus/QUALITY.md:1054`, `.ufo/waves/round-64/build/K64ScribeQuality/q61-r63-report-clean.txt:7-10`, `.ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md:21`).**
  - **Attacks:** `corpus/QUALITY.md:1054` quotes `REPORT_RECEIPT_SELFTEST: PASS (52/52)` and `37 committed cases` and cites `build/K64ScribeQuality/q61-r63-report-clean.txt` and `controls/CHANGES-AFTER-FREEZE.md`. In `q61-r63-report-clean.txt:7-10`, the recorded lines are `REPORT_RECEIPT_SELFTEST: PASS (20/20)` and `16` controls (v1 freeze); in `controls/CHANGES-AFTER-FREEZE.md:21`, the text says `Selftest 20 → 50` instead of `52`.
  - **Reproduce:** `tail -n 5 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ScribeQuality/q61-r63-report-clean.txt && grep -n 'Selftest 20' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md`.
  - **Corrected text (`:1054`):** note that `q61-r63-report-clean.txt` captured v1 (`20/20`, `16`) and cite `build/K64R2ReviewQuality/receipts/q61-v2-selftest-and-controls.txt` for v2 (`52/52`, `37`).

- **K64R2ReviewQuality-4 (MEDIUM — Q61 `Fails when` and `Limit` omit v2 finding ids `TALLY_CHECKS_MISMATCH` and `RECEIPT_EMPTY` and state 40-hex instead of 39/40-hex for `HASH_DEAD`, `corpus/QUALITY.md:1053,1055`).**
  - **Attacks:** `:1052` lists all 9 v2 finding ids, but `:1053` (`Fails when`) was not updated from v1: it omits `TALLY_CHECKS_MISMATCH` (`checks=k` mismatch), `RECEIPT_EMPTY` (0-byte/whitespace receipt), cited-receipt scoping on `TALLY_UNRECEIPTED`, symlink/`..`/glob arms on `RECEIPT_MISSING`, and v2 placeholder tokens (`{{NAME}}`, `XXXX`, `to be filled`, `<measured>`). Both `:1053` and `:1055` say `HASH_DEAD` fires on a `40-hex hash`, whereas `scripts/report-receipt-diff.mjs:48` matches `/\b[0-9a-fA-F]{39,40}\b/g` (39- or 40-hex, control `k6-hash-39-digits`).
  - **Reproduce:** `grep -E 'TALLY_CHECKS_MISMATCH|RECEIPT_EMPTY|39' /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/QUALITY.md` (matches `:1052` only, absent from `:1053` and `:1055`).
  - **Corrected text (`:1053,1055`):** include all 9 finding ids and `39- or 40-hex` in `Fails when` and `Limit` (full text in `build/K64R2ReviewQuality/QUALITY-Q60-Q61-Q51C1-corrected.md`).

- **K64R2ReviewQuality-5 (MEDIUM — Q61 and Q51-C1 omit `corpus/lessons/round-64.md` grounding pointers, and `round-64.md:114` contradicts Q51-C1, `corpus/QUALITY.md:1050,1058`, `corpus/lessons/round-64.md:13,114`).**
  - **Attacks:** Q60 grounds in `corpus/lessons/round-64.md` §Mistakes row 1 (`:1004`), but Q61 (`:1050`) never cites `corpus/lessons/round-64.md` (§Mistakes row 2 `unreceipted-tally` at `:13` / `:20`), and Q51-C1 (`:1058`) cites neither `round-63-verifier-spotcheck.md:91` (D5) nor `corpus/lessons/round-64.md:114`. Worse, `corpus/lessons/round-64.md:114` lists `Q51's grounding hash 9237a72 resolves nowhere` under `## Open items carried` ("its grounding citation is dead") without naming `Q51-C1`.
  - **Reproduce:** `grep -n 'round-64\.md' /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/QUALITY.md` → only line `1004` (Q60).
  - **Corrected text (`:1050,1058`):** add `corpus/lessons/round-64.md` §Mistakes row 2 (`:13`) to Q61 and `round-63-verifier-spotcheck.md:91` / `round-64.md:114` to Q51-C1.

- **K64R2ReviewQuality-6 (LOW — Q51-C1 hex-token sweep count is 64 on the committed `corpus/QUALITY.md` vs 55 at `dd1a3e6f`, and `plan-before-ready.sh --selftest` leaks `/tmp/pbr-selftest.*`, `corpus/QUALITY.md:1062`, `scripts/plan-before-ready.sh:477`).**
  - **Attacks:** Running `grep -oE '\b[0-9a-f]{7,40}\b' corpus/QUALITY.md | sort -u | wc -l` on `2ed8a5f8:corpus/QUALITY.md` yields `64` (the 55 tokens at `dd1a3e6f` plus 9 resolving commit tokens added by Q60/Q61/Q51-C1; the 9 non-resolving tokens are unchanged). Also, `scripts/plan-before-ready.sh:477` never removes `$root` after `run_selftest`.
  - **Reproduce:** `grep -oE '\b[0-9a-f]{7,40}\b' /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/QUALITY.md | sort -u | wc -l` → `64`.
  - **Corrected text (`:1062`):** state `(55 unique tokens at dd1a3e6f before Q60–Q51-C1 were appended; 64 at 2ed8a5f8 after appending Q60–Q51-C1, all 9 newly added tokens resolving as commits in the lane or fleet)`.

## Artifacts

- `.ufo/waves/round-64/w2/K64R2ReviewQuality.md`
- `.ufo/waves/round-64/build/K64R2ReviewQuality/QUALITY-Q60-Q61-Q51C1-corrected.md`
- `.ufo/waves/round-64/build/K64R2ReviewQuality/QUALITY-Q60-Q61-Q51C1.patch`
- `.ufo/waves/round-64/build/K64R2ReviewQuality/receipts/plan-before-ready-r64.txt`
- `.ufo/waves/round-64/build/K64R2ReviewQuality/receipts/q61-v2-selftest-and-controls.txt`

## Limits

- Evaluated `corpus/QUALITY.md:999-1064` (Q60, Q61, Q51-C1) and their cited receipts/scripts at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`; did not re-audit Q1–Q59 bodies except for numbering continuity and the 64-token hex sweep.
