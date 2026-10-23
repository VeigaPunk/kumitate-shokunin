RESULT ReplayQ32History rev=6b2a4517 verdict=agrees commits=22 fn=0 fp=0

Q32 was replayed from the committed bytes, not from a transcription: `git show 6b2a4517:corpus/QUALITY.md` lines 606-609, dedented, block sha256 `2f6e7386a0af9d93ec2e7acf0d977129bba7ad163f00f1aba8297aa94fdd34fe`. Clone and checkout (all repository-locating variables unset):
```
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r45/seats/a3f-ReplayQ32History/lane
git -C lane checkout -q --detach 6b2a45178c72a4565bb9d98e09f4c36b95ca1521
6b2a45178c72a4565bb9d98e09f4c36b95ca1521
```
Per run I replaced only the placeholder and exported `L`; the block's own text is:
```sh
REV=<lane commit>; export LC_ALL=C
out=$(comm -23 <(git -C "$L" ls-tree -r --name-only "$REV" corpus/knowledge corpus/lessons | grep '\.md$' | sed 's#^corpus/##' | sort) \
  <(git -C "$L" show "$REV":corpus/README.md | grep -oE '^\| `(knowledge|lessons)/[^`]+`' | sed 's/^| `//; s/`$//' | sort -u))
[ -z "$out" ] || { printf '%s\n' "$out"; echo 'Q32: FAIL note without README row'; exit 1; }
```
A hand-typed copy and this extracted block produced identical output and exit codes on all 22 commits (result-file diff empty). "Fails when. Any line prints." (QUALITY.md:611; body sha256 `1731dffc490d64cd95d914068e68828a9426578c4fc8b2beaf2cb5da90b24ee9`).

Bases (parent of each round's first `round-N:` commit). declared = SCORECARD stanza C2_total; computed = `*.md` under corpus/knowledge + corpus/lessons; rows = unique README row paths.
| round | base | declared | computed | rows | Q32 | unrowed note |
| 35 | a1258f9b | 77 | 78 | 77 | FAIL | lessons/round-34-verifier-spotcheck.md |
| 36 | 0614092e | 79 | 80 | 79 | FAIL | lessons/round-35-verifier-spotcheck.md |
| 37 | 58333519 | 82 | 83 | 82 | FAIL | lessons/round-36-verifier-spotcheck.md |
| 38 | 753446a8 | 84 | 85 | 84 | FAIL | lessons/round-37-verifier-spotcheck.md |
| 39 | fac39171 | 86 | 87 | 86 | FAIL | lessons/round-38-verifier-spotcheck.md |
| 40 | f69817ed | 88 | 89 | 88 | FAIL | lessons/round-39-verifier-spotcheck.md |
| 41 | a58b7f72 | 90 | 91 | 90 | FAIL | lessons/round-40-verifier-spotcheck.md |
| 42 | dfabe92b | 92 | 93 | 92 | FAIL | lessons/round-41-verifier-spotcheck.md |
| 43 | 2a7f37d2 | 94 | 95 | 94 | FAIL | lessons/round-42-verifier-spotcheck.md |
| 44 | 6cda8c35 | 96 | 97 | 96 | FAIL | lessons/round-43-verifier-spotcheck.md |
| 45 | 3632602c | 99 | 100 | 99 | FAIL | lessons/round-44-verifier-spotcheck.md |

Tips (last commit whose subject starts `round-N:`). Every one: declared = computed = rows, Q32 exit 0, empty output.
| 35 | 4c9e4075 | 79/79, rows 79 | PASS | 36 | 91da27c6 | 82/82, rows 82 | PASS | 37 | 198091c9 | 84/84, rows 84 | PASS | 38 | 89ff4a74 | 86/86, rows 86 | PASS | 39 | 77458267 | 88/88, rows 88 | PASS | 40 | 69ceb529 | 90/90, rows 90 | PASS | 41 | fb7046ca | 92/92, rows 92 | PASS | 42 | 43f54c16 | 94/94, rows 94 | PASS | 43 | b01ded32 | 96/96, rows 96 | PASS | 44 | 37e8f669 | 99/99, rows 99 | PASS | 45 | 6b2a4517 | 102/102, rows 102 | PASS |

Against recorded round-open receipts (DRIFT pairs read from the receipt; Q32 exit at that round's base):
r35 `.ufo/waves/round-35/baseline/proxy.txt:3` declared=77 computed=78 -> Q32 FAIL; the run's lane was 1770305f, and a1258f9b adds only `considerthese/2026-10-20.md` (`git show --stat a1258f9b`), so corpus and SCORECARD bytes are the same. r36 `.ufo/waves/round-36/baseline/proxy-default.txt:1` 79/80 -> FAIL. r40 `.ufo/waves/round-40/open/receipts.txt:9` 88/89 -> FAIL. r41 `open/receipts.txt:7` 90/91 -> FAIL. r42 `open/receipts.txt:5` 92/93 -> FAIL. r43 `open/receipts.txt:9` 94/95 -> FAIL. r44 has no `open/*proxy*` file; ScoutDriftCause.md's row gives 96/97 at 6cda8c35 -> FAIL. r45 `.ufo/waves/round-45/open/proxy-strict-3632602c.txt:2` 99/100 -> FAIL. All 8 recorded drifts are caught: fn=0. No open receipt in rounds 35-45 records MATCH, and all 11 tips derive MATCH and pass: fp=0. Rounds 37, 38, 39 bases have no recorded read; their re-derived pairs are 82/83, 84/85, 86/87 (DRIFT) and Q32 fails at each, so they are agreeing re-derivations, not recorded receipts.
The two named "Shown able to fail" cases reproduce exactly: at 6cda8c35 Q32 prints `lessons/round-43-verifier-spotcheck.md` exit 1; at 3632602c it prints `lessons/round-44-verifier-spotcheck.md` exit 1.

Full-history scan (beyond bases and tips): all 96 commits `a1258f9b^..6b2a4517`.
Q32: 31 FAIL, 65 PASS. declared != computed: the same 31 commits (30 with the declaration one below the note count, one with it two above). Cross-tab is 31 DRIFT|FAIL and 65 MATCH|PASS, zero mismatches. 0 phantom rows (README row naming no note) at any commit; raw row count equals unique row count at all 96 (no duplicates); both corpus dirs exist at all 96.
The lone +2: `1a8312ee` declares C2_total=102 and C2=102 against 100 notes and 99 rows, Q32 fails on `lessons/round-44-verifier-spotcheck.md`. Its stanza pre-registers two notes the tree does not yet have; `6b2a4517` closes all three counts at 102/102/102.

Structural channel (practice audit on the judged tree, fresh scratch repo from `git archive 6b2a4517`, real `scripts/proxy-check.mjs --json --src /fast/scratch/hyaku/kumitate-pin/src`). Baseline e9fcd49: Q32 exit 0; proxy verdict MATCH exit 0.
FN-shaped, 8afaedb (only C2_total 102->103, all 102 notes rowed): Q32 exit=0 with empty output; proxy verdict=DRIFT exit=1, `C2_TOTAL_DRIFT C2_total: declared=103 computed=102 delta=-1`.
FP-shaped, 9f51737 (only the C1 entry file renamed, its row left on the old path, counts untouched): Q32 exit=1 printing `knowledge/agent-isolation-renamed.md`; proxy verdict=MATCH exit=0, terms C2=102 C2_total=102.
So Q32 and the C2_total term coincide on all 96 historical commits by practice, not by construction: a declared-only drift passes Q32, and a missing row whose declaration was aligned is invisible to both count terms. The second case is a real defect Q32 catches (mechanically an fp, not a Q32 error).

Defects and limits, stated plainly.
1. Q32 tests row presence, not row accuracy: a stale or wrong row text still passes.
2. Declared-only drift is invisible (8afaedb); Q32 is not a substitute for C2_total.
3. Fail-open edge: if both corpus dirs were absent, `ls-tree` prints nothing and Q32 passes vacuously.
4. The row regex requires a closing backtick; the proxy's RE_README_ROW (line 495) does not. No historical row differs (0 of 96 commits with a count difference under the two regexes).
5. No phantom-row or duplicate-row detection; extra rows are ignored.
6. Wording: QUALITY Q32 says "every round commit"; `corpus/lessons/round-45.md:119` says "every lane commit". The replay measures the former; the two quantifiers differ.

Judged object: the C1 entry has its README row at `corpus/README.md:93` at 6b2a4517; that commit reads 102 declared / 102 computed / 102 rows and Q32 exit 0, so the committed entry does not violate Q32. The verifier-spotcheck file named at the 3632602c base is a non-author closure file, not the C1 entry.

Tooling: none installed. Scratch `/fast/scratch/hyaku/kumitate-r45/seats/a3f-ReplayQ32History` (90M, lane clone + audit repo); `pgrep -fa a3f-ReplayQ32History` empty. Only lane write is this report.
