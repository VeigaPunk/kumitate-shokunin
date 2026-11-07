# K99ScribeSources — SOURCES rows for the cell-trim class (S278, S279)

Seat: `K99ScribeSources` (scribe, wave w1). Round 99, hyaku run 15, attempt 1. Read-only on the lane: every receipt
below lives in this directory (`capture/`, `census*.txt`, `locale*`, `js-trim*`). Scratch
`/fast/scratch/hyaku/kumitate-r99/K99ScribeSources/` built the validation copy and was removed at yield. Lane stays
detached; no git/jj command was run anywhere.

## 0. What this seat was asked for and what it produced

| asked | receipt |
|---|---|
| open PropList 17.0.0, record HTTP/bytes/sha256, compare with the L1 capture, quote the `White_Space` lines | `quotes.md` §Capture 1 + §Quote 1, `capture/proplist.txt` |
| open POSIX pattern-matching §2.13.1, quote ≤25 words on bracket classes taking meaning from LC_CTYPE; try the GNU bash page and record unreachability | `quotes.md` §Quote 2, §Quote 3, §Unreachable, `capture/posix-v3-chap02.html`, `capture/xbd-ch09.html` |
| draft rows S278, S279 (11-column shape, `mined`, used-by `corpus/knowledge/sources-check-cell-trim-class.md`, tier A) and validate a scratch copy of the lane corpus | `row.md`, `census.txt` (exit 0), `census-noentry.txt` (E11 before the knowledge entry exists), `census-base.txt` |

## 1. PropList 17.0.0 — byte-identical to the L1 capture

```
curl -sS -o proplist.txt -w 'HTTP %{http_code} bytes %{size_download}\n' \
  https://www.unicode.org/Public/17.0.0/ucd/PropList.txt
```
`HTTP 200 bytes 145465` (0.47 s). `sha256 = 130dcddcaadaf071008bdfce1e7743e04fdfbc910886f017d9f9ac931d8c64dd`.
Headers: `last-modified: Sat, 16 Aug 2025 00:45:11 GMT`, `content-type: text/plain; charset=utf-8`.
`cmp proplist.txt .ufo/waves/round-99/open/l1-open-unicode-proplist-17.0.0.txt` → **no output, exit 0** (same 145465
bytes, same sha256) — matches the plan's `130dcddc…`.

`White_Space` block, lines 12–22, `# Total code points: 25` at line 24. The entry lines the claim needs, in file order,
plus the total (lines 13, 14, 24; 17 words together):

```
0020          ; White_Space # Zs       SPACE
0085          ; White_Space # Cc       <control-0085>
# Total code points: 25
```

`grep -c -i -E 'feff' proplist.txt` → **0**; `grep -c -i -E '200b' proplist.txt` → **0**. Neither code point occurs
anywhere in the file, so **U+FEFF and U+200B are not `White_Space`** — the file asserts the absence by omission and
the grep is the receipt. Line 12 (`0009..000D`, 7 words) shows the block also keeps VT/FF/CR/LF; U+0085 is `Cc` and
still `White_Space`. Sum check: 5 + 1 + 1 + 1 + 1 + 11 + 1 + 1 + 1 + 1 + 1 = 25 = line 24.

Consequence recorded in the row: `White_Space` (contains NEL, excludes U+FEFF) is a **third** class beside POSIX
`blank` (S277: SP, TAB) and ECMAScript `trim()` (S276: keeps NEL, strips U+FEFF), so "Unicode whitespace" names
neither reader.

## 2. POSIX — the section number in the brief does not exist in this edition (finding)

`https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html` → HTTP 200, 357953 bytes, 5918 lines,
`sha256 0889867a53fe12508a71e8739ec23ecdddc95e6f67697c98e26acc8ff0ec1acd`, `Content-Length: 357953`, no
`Last-Modified`.

**Finding P1.** This is Issue 8, where **§2.13 is Shell Execution Environment** (HTML line 2887) and pattern matching
is **§2.14** (line 2943), with **§2.14.1 Patterns Matching a Single Character** at line 2956. The brief's "§2.13.1"
is the older numbering. The row states the edition it read, so a later reader cannot mistake which section was opened.

**Finding P2 — where the locale actually enters.** §2.14.1 contains **no** LC_CTYPE sentence — scanning HTML lines
2956–3006 (the whole section) yields zero `locale`/`LC_CTYPE` hits; the word occurs in §2.14 only in the intro
(line 2954) and in §2.14.3's collation sentence (line 3059). It defers the bracket grammar (lines 3000–3001, 25 words):

```
A <left-square-bracket> shall introduce a bracket expression if the characters following it meet the
requirements for bracket expressions stated in XBD 9.3.5 RE Bracket Expression
```

The `locale` clause nearest the pattern-matching text is the intro's invalid-bytes sentence (line 2954), not a class
rule (25 words): *"Since pathnames can contain such bytes, portable applications need to ensure that the current
locale is the C or POSIX locale when performing pattern matching"*. The class rule is in the deferred page —
`.../basedefs/V1_chap09.html` §9.3.5, HTML lines 273–278, 60438 bytes,
`sha256 2f5f60e9fe2954fe09dc0991f5c03b7c1de771b0ae2104e4a8a5745187c64e24` (21 words):

```
The set of single characters that belong to the character class, as defined in the LC_CTYPE category in the
current locale.
```

That is the sentence that makes the census's `trim_cell` (`scripts/sources-census.sh` 531–535, defined; used by
`usedby_findings` 538–568) locale-dependent, while `row_pass`'s `gsub(/^[ \t]+|[ \t]+$/,"",s)` (line 581) cannot move
with any locale. Row S279 carries both locators (primary URL + the deferred page's URL and sha256 in `anchor`).

**Unreachable, recorded twice:** `https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html` —
`curl: (28) Connection timed out after 45000 milliseconds` (HTTP 000, 0 bytes) then, with `-m 180`,
`curl: (28) Failed to connect to www.gnu.org:443 after 135453 ms: Could not connect to server` (HTTP 000, 0 bytes,
135.46 s). Same host/failure class as the r98 S276 locator note (134658 ms). No bash-manual claim is made in either
row.

## 2a. Compared with the L1 pre-scribe draft (`close-l1/sources-draft-l1.md`) — no conflict

L1's draft (read after my rows were drafted; it says "final text integrated after K99ScribeSources compares
captures") holds one row, `S278`, `NF=13`, and self-describes as a pre-scribe draft. Comparison:

| field | L1 draft S278 | my S278 | verdict |
|---|---|---|---|
| source / kind / tier / status / opened / recheck / used-by | identical | identical | agree |
| version pin | `# PropList-17.0.0.txt`, `# Date: 2025-06-30` | same two header lines, date completed to `2025-06-30, 06:19:01 GMT` (verified: `sed -n '1,2p' proplist.txt`) | agree, mine adds the time |
| sha256 | `130dcddc…` = L1 capture | `130dcddc…`, plus `cmp` → no output | agree |
| HTTP/bytes | 200 / 145465 | 200 / 145465, plus `Last-Modified: Sat, 16 Aug 2025 00:45:11 GMT` | agree |
| White_Space extent | lists the 11 range lines | lists them and adds `# Total code points: 25` + the 25-code-point sum | mine adds the count check |
| absence of U+FEFF / U+200B | asserted in prose ("U+FEFF (not listed)") | asserted **with a receipt**: `grep -c -i -E 'feff'` and `'200b'` both `0`, nothing (not merely no `White_Space` entry) in the file | mine strengthens |
| teaches quote | `"0085 ; White_Space # Cc <control-0085>"` (7 words) | three lines (lines 13, 14, 24; 17 words) leading with the same 0085 line | same evidence, wider block |
| scope wording | "which code points carry the Unicode White_Space property" | "as a third cell-pad class beside … S276 … S277" | editorial only |
| S279 | **absent** | present (POSIX pattern matching, LC_CTYPE clause) | mine adds |

No factual disagreement between the two drafts. Integration may take my S278 (a superset of L1's) and add S279; if
the close report already quotes L1's teaches wording, both quotes are true and both sentences are in the same file.

## 3. The drafted rows and their validation

`row.md` holds the two rows exactly as they are to be appended to the Registry table (which ends at line 232 of
`corpus/SOURCES.md`, before `## Paths` at 234). Both are `NF=13` / 11 cells, `mined`, tier A, opened 2026-11-07,
recheck `on-release`, used-by `corpus/knowledge/sources-check-cell-trim-class.md`; S278 `kind=dataset`, S279
`kind=spec`.

Validation on a scratch copy of the **whole lane** (`rsync -a --exclude='.git' . <scratch>/lane/`, rows spliced after
line 232 — needed because `E11` resolves `used-by` paths against the lane root and 100+ existing rows cite
`SKILL.md`, `scripts/`, `.ufo/…`):

```
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
     --file <scratch>/lane/corpus/SOURCES.md --today 2026-11-07
```

| run | knowledge entry present in copy? | exit | stdout |
|---|---|---|---|
| `census.txt` | yes (a scratch placeholder file, labelled as such) | **0** | 8 pre-existing `W04` + `file ok <path>` |
| `census-noentry.txt` | no | 1 | the same 8 `W04` + **exactly two** `E11` (`S278`, `S279`) |
| `census-base.txt` (unmodified lane file, read-only) | n/a | 0 | the same 8 `W04` + `file ok …/corpus/SOURCES.md` |

So the delta this seat introduces is **exactly the two new rows**, and the only finding it can raise is the `E11`
for a used-by document that does not yet exist in the lane (see F1). `census` mode on the spliced copy
(`census-mode.txt`): `rows 215 → 217`, `tier.A 183 → 185`, `status.mined 173 → 175`, `invalid 0`, `missing 0`.

## 4. Measured, so the rows are not the only source of class facts

`trim_cell` body copied verbatim from `sources-census.sh` 531–535, run on `<pad>S123` / `S123<pad>` under four
locales (`locale-probe.txt`, `locale-table.sh`; host `LANG=LC_CTYPE=en_US.UTF-8`):

| pad | C, POSIX | C.UTF-8, en_US.UTF-8 |
|---|---|---|
| SP TAB VT FF CR | stripped | stripped |
| U+1680 U+2000 U+2003 U+200A U+2028 U+2029 U+205F U+3000 | **kept** | **stripped** |
| U+0085 U+00A0 U+202F U+200B U+FEFF | kept | kept |

`node js-trim.mjs` (v24.21.0, `js-trim.txt`) for ECMAScript `trim()`: strips TAB LF VT FF CR SP NBSP 1680 2000 2003
200A LS PS 202F 205F 3000 **FEFF**; keeps **U+0085** and U+200B. Five pairwise-different classes now have receipts:
`blank` (SP TAB), `row_pass` (SP TAB), `trim_cell` (locale table above), `White_Space` (25 cps), JS `trim()`.

## 5. Findings for integration (no lane edit made)

- **F1 — the rows cannot land before the knowledge entry.** `corpus/knowledge/sources-check-cell-trim-class.md` is
  absent from the lane (`ls` → no such file), and the census `E11` (`usedby_findings` 538–568, which trims with
  `trim_cell` 531–535) checks `used-by` on disk. Landing
  S278/S279 alone turns the lane's `validate` from exit 0 to exit 1 with two E11 lines. Sequence: knowledge seat's
  entry first (or same commit). My exit-0 receipt uses a scratch placeholder and says so in its own text; it is not
  evidence that the lane is green today.
- **F2 — the plan's "S-id is assigned at integration" is now S278/S279**, and the plan's `sha256 130dcddc…` for the
  L1 PropList capture is confirmed byte-for-byte by an independent fetch.
- **F3 — "§2.13.1" is not this edition's numbering.** In Issue 8 (the URL the plan gives), §2.13 is Shell Execution
  Environment and §2.14.1 is the bracket-expression section; I did not open an older edition, so I make no claim about
  where "2.13.1" came from — only that this URL does not have it. Row S279 records the section it read, the edition,
  and cites XBD 9.3.5 as the page that carries the LC_CTYPE sentence. A close report that says "§2.13.1" without the
  edition sends a reader to Shell Execution Environment.
- **F4 — `trim_cell`'s locale axis is narrower than "Unicode space".** Moving C → UTF-8 widens `[[:space:]]` by the
  U+1680/U+2000-band/LS/PS/U+205F/U+3000 band **only**; NBSP, NEL, U+202F, U+200B and U+FEFF stay unstripped on this
  host's glibc. The plan's NBSP/VT/U+2003/U+FEFF sentence is about `row_pass` (`[ \t]`) and is unaffected — the two
  census readers differ from each other by locale *and* by class. Fleet script, report-only.
- **F5 — no bash-manual source exists for this round**: two attempts, 45 s and 135 s, both `curl (28)`; the XBD
  §9.3.5 page carries the class rule the bash page would have illustrated.

## 6. Reproduce

```
S=/fast/scratch/hyaku/kumitate-r99/K99ScribeSources; mkdir -p $S && cd $S
curl -sS -o proplist.txt https://www.unicode.org/Public/17.0.0/ucd/PropList.txt
curl -sS -m 90 -o posix-v3-chap02.html https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html
curl -sS -m 60 -o xbd-ch09.html  https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap09.html
cmp proplist.txt /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/open/l1-open-unicode-proplist-17.0.0.txt
rsync -a --exclude='.git' /home/vgpnk/Projects/shokunin/kumitate-shokunin/ "$S/lane/"
{ head -n 232 /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md; \
  cat <seat-dir>/row.md; \
  tail -n +233 /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md; } > "$S/lane/corpus/SOURCES.md"
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$S/lane/corpus/SOURCES.md" --today 2026-11-07
#   → exit 1, exactly two E11 (S278, S279): the used-by entry does not exist yet
printf 'scratch placeholder for E11\n' > "$S/lane/corpus/knowledge/sources-check-cell-trim-class.md"
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$S/lane/corpus/SOURCES.md" --today 2026-11-07
#   → exit 0, 8 pre-existing W04 + "file ok"
LC_ALL=C ./locale-table.sh ; LC_ALL=en_US.UTF-8 ./locale-table.sh ; node js-trim.mjs
```

## 7. Receipt index (all in `.ufo/waves/round-99/K99ScribeSources/`)

| file | what it is |
|---|---|
| `row.md` | the two drafted rows, ready to append after `corpus/SOURCES.md:232` |
| `quotes.md` | captures table (URL/date/HTTP/bytes/sha256), every quote with location and `wc -w`, the measured class tables, the unreachable-source record |
| `census.txt` | `validate` on the spliced copy **with** a knowledge placeholder → exit 0 |
| `census-noentry.txt` | same, **without** the placeholder → exit 1, exactly two E11 (`S278`, `S279`) |
| `census-base.txt` | `validate` on the unmodified lane registry (read-only) → exit 0, 8 pre-existing W04 |
| `census-mode.txt` | `census` mode on the spliced copy: rows 217, tier.A 185, mined 175 |
| `capture/proplist.txt` | PropList 17.0.0 body (145465 B, `130dcddc…`) |
| `capture/posix-v3-chap02.html` | XCU Issue 8 ch. 2 (357953 B, `0889867a…`) |
| `capture/xbd-ch09.html` | XBD Issue 8 ch. 9 (60438 B, `2f5f60e9…`) |
| `locale-probe.txt`, `locale-table.sh`, `locale-probe.sh` | `trim_cell` per-locale strip table |
| `js-trim.txt`, `js-trim.mjs` | ECMAScript `trim()` strip set on node v24.21.0 |

## 8. Limits

- The `E11`-free exit 0 depends on a placeholder file in the scratch copy; the lane itself will be red until the
  knowledge entry exists (F1). That is a sequencing fact, not a defect of the rows.
- The per-locale table is this host's glibc (and bash 5.x); another libc may classify U+00A0/U+0085 differently. The
  class theory (XBD 9.3.5) does not depend on the measurements; the measurements only bound how far the axis reaches
  here.
- Only the `White_Space` property and the two POSIX pages were opened. `Pattern_White_Space` (PropList lines
  1643–1648) was seen in the file but not used: it is a different property (`Cf` marks, no NBSP) and no reader in the
  claim trims by it.
- No counter (`probe99-c1.mjs`) was run and no candidate was inspected for this seat: the seat's deliverable is
  source rows, and both are candidate-independent by design.
