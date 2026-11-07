L1 draft (pre-scribe) — S278 row and search-log note; final text integrated after K99ScribeSources compares captures.

| S278 | Unicode Character Database PropList.txt 17.0.0 — https://www.unicode.org/Public/17.0.0/ucd/PropList.txt | dataset | A | which code points carry the Unicode White_Space property — a third whitespace class beside the census blank class (S277) and ECMAScript trim (S276) | `White_Space` entries, file lines 12-22 (`0009..000D`, `0020`, `0085`, `00A0`, `1680`, `2000..200A`, `2028`, `2029`, `202F`, `205F`, `3000`); header `# PropList-17.0.0.txt` / `# Date: 2025-06-30`; fetched 2026-11-07, HTTP 200, 145465 bytes, sha256 130dcddcaadaf071008bdfce1e7743e04fdfbc910886f017d9f9ac931d8c64dd = L1 capture .ufo/waves/round-99/open/l1-open-unicode-proplist-17.0.0.txt | "0085 ; White_Space # Cc <control-0085>" — NEL is White_Space yet JS trim keeps it, while U+FEFF (not listed) is stripped by JS trim; so neither JS trim nor Unicode White_Space is the census `[ \t]` class | mined | 2026-11-07 | on-release | corpus/knowledge/sources-check-cell-trim-class.md |

Search log note: **Registry cell trim class — question:** which characters may pad any Registry cell and still leave the
census value unchanged, and which named class do the lane's readers use? **Date:** 2026-11-07. Unicode PropList 17.0.0
opened (1 identified, 1 screened, 1 included); GNU Bash manual Pattern Matching attempted (curl (28) after 40 s; identified
1, opened 0 — unreachable, not rejected). Stop: the three classes (S276 JS trim, S277 POSIX blank, S278 White_Space) are
each grounded at a primary source.
