# K90CriticB — C1 v4 harm check (receipt-bind prefix-strip normalisation)

Seat: K90CriticB · Round 90 (hyaku 15, attempt 1) · 2026-11-05
Claim under review: C1 `receipt-bind` v4 (`kumitate-receipt-bind-v4`) — field lines recognised
after stripping leading U+FEFF/U+200B..U+200E/U+00A0.
Harm question: does the v4 normalisation change any verdict the lane already relies on?

## RESULT: 0 flipped verdicts across all committed receipts. NO HARM.

## Instruments
- v3 base, extracted read-only:
  `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 7218699cfbdec702ba42f35ceac0a8e52d1bd564:scripts/receipt-bind.mjs > <seat>/v3.mjs`
  sha256 `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3` (matches round-89 close receipt `bind-final.txt`).
- v4 stand-in (critic's copy, not the executor's candidate): v3 with exactly ONE line changed —
  the `field()` regex is `^[\uFEFF\u200B-\u200E\u00A0]*${key}=(.*)$` (spec-exact prefix run in
  front of each key). Diff: `<seat>/v3-to-v4.diff`; sha256 `e83a85fe82bdbeaa3b55ee449e373acf051aad51aba9857b9f62bdf7f26a6008`
  (`<seat>/tool-digests.txt`). Both digests in `<seat>/tool-digests.txt`.
- Selftest sanity: `node <seat>/v3.mjs --selftest --work <scratch>` → `RECEIPT_BIND_SELFTEST: PASS held=68/68` exit 0;
  `node <seat>/v4-standin.mjs --selftest --work <scratch>` → `PASS held=68/68` exit 0 (no arm shrinkage).
  Raw: `<seat>/sweep/selftest-v3.txt`, `<seat>/sweep/selftest-v4.txt`.

## Harm sweep A — every committed receipt directory (131 dirs, 643 receipts)
- Collection: `git -C <lane> ls-tree -r --name-only 7218699… | grep '/close/.*\.txt$'` → 643 files
  (`<seat>/close-files.txt`); each blob extracted with `git -C <lane> show 7218…:<path>` to scratch
  preserving its directory → 131 receipt dirs (`<seat>/close-dirs-rel.txt`).
- Bind: `node <seat>/v3.mjs --dir <dir> --rev 7218… --lane <lane>` and the same with v4-standin,
  one run per instrument per directory (runner `<seat>/sweep-run.sh`).
- Comparison: verdict line AND exit byte-compared per directory.
  Table: `<seat>/harm-table-dirs.txt` (131 rows) — **AGREE=131, DIFF=0**.
  Sample row (the dir the lane relies on): `.ufo/waves/round-89/close` → both instruments
  `RECEIPT_BIND: CLEAN matched=19 mismatched=0 unchecked=0 external=1` exit 0.
- Raw outputs committed: `<seat>/sweep/dirs-v3/`, `<seat>/sweep/dirs-v4/` (one .out/.err/.exit per dir).

## Harm sweep B — every committed receipt individually (643 singleton dirs)
Because a directory run fail-closes at its first offending receipt, each of the 643 committed
receipts was also hardlinked into its own singleton directory and bound with both instruments.
- Table: `<seat>/harm-table-singles.txt` (643 rows) — **AGREE=643, DIFF=0**.
- v3 verdict mix: 45 CLEAN, 557 DRIFT, 41 FAIL-CLOSED (all REV_UNRESOLVED) — the field parser,
  value extraction and hashing were genuinely exercised (non-empty tallies compared byte-for-byte).
- Raw outputs committed: `<seat>/sweep/singles-v3/`, `<seat>/sweep/singles-v4/`.

## Structural corroboration
`grep -rlP '\xef\xbb\xbf|\xe2\x80\x8b|\xe2\x80\x8c|\xe2\x80\x8d|\xe2\x80\x8e|\xc2\xa0' <scratch receipts>` → 0 of 643
committed receipts contain any of the six prefix characters anywhere; 0 lines have a prefix run
immediately before `rev=`/`cmd=`/`tool_sha256=`. On prefix-free receipts the v4 regex is
extensionally equal to the v3 regex — consistent with the observed 0 flips.

## Constructed receipts (invisible chars INSIDE a value, no line prefix)
Bytes committed: `<seat>/constructed-receipts/{zwsp-mid-cmd,nbsp-tail-sha,all-prefixed-zwsp}.r.txt`;
outputs: `<seat>/sweep/fix/`. Bind command: `node <instrument> --dir <fixture> --rev 7218… --lane <lane>`.

1. `zwsp-mid-cmd` — `cmd=` value contains U+200B mid-path (`scripts/receipt<U+200B>-bind.mjs`):
   v3: exit 2 `RECEIPT_BIND: FAIL-CLOSED UNRESOLVED r.txt instrument absent at 7a8afb5f…: scripts/receipt​-bind.mjs`
   v4: exit 2 identical line. **AGREE** — mid-value chars are not stripped.
2. `nbsp-tail-sha` — `tool_sha256=` value carries a trailing U+00A0:
   v3: exit 0 `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0`
   v4: exit 0 identical line. **AGREE** (JS `.trim()` already dropped a trailing NBSP in v3; v4 does not change this).
3. `all-prefixed-zwsp` (positive twin; every field line prefixed with U+200B — NOT prefix-free, so its flip is the CLAIM, not harm):
   v3: exit 1 `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=1 external=0 first=r.txt`
   v4: exit 0 `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0`.

Per the acceptance rule ("a changed verdict on a receipt that never had a prefix is a harm"):
receipts 1 and 2 never had a prefix and did NOT change verdict. The only verdict change observed
anywhere in this review is receipt 3, whose field lines all carry leading invisible prefixes —
exactly the claimed K89-V1 behaviour.

## Flipped-verdict count: 0 (of 131 dirs and 643 receipts). No harm named; none exists in the data.

## Method notes (recorded, not hidden)
- Two earlier sweep attempts were vacuous and were discarded before any result was reported:
  (1) first run passed `--dir "$R/<abs-path>"` (DIR_UNREADABLE on both sides), (2) uutils `xargs 0.8.0`
  silently does not execute scripts (runs replaced by a sequential runner `<seat>/sweep-run.sh`).
  Verdict tables are computed with a non-empty guard; empty-string "agreement" is impossible in
  the committed tables.
- Scratch `/fast/scratch/hyaku/kumitate-r90/K90CriticB` removed before yield; every cited file
  lives under the seat dir. No lane file outside the seat dir was written. No tool installed.
