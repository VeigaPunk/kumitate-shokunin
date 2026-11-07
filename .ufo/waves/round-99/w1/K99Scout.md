# K99Scout — fleet survey of registry cell pads and lane trim readers

Round 99 (hyaku run 15, attempt 1) · seat `K99Scout` · wave `w1` · scout (read-only)
Lane commit `f480124b5216d66b8bd74162bc2f61eabaffb8b2` (base `f9cd1bff147508f0d787f9e0cc4d2191aabaf02a`).

**Seat scope.** (1) Count Registry rows whose 11 cells carry, at either edge, a character JS
`trim()` strips but the POSIX blank class `[ \t]` does not — across the 21 current fleet lane
registries and every committed revision of the kumitate lane's `corpus/SOURCES.md`. (2) Inventory
every `.trim()`, `\s` and `[[:space:]]` that reads SOURCES rows or cells in the lane's
`scripts/*.mjs` and in the fleet's `scripts/sources-census.sh`.

**Deliverables (all under the seat dir `.ufo/waves/round-99/K99Scout/`)**

| path | what it is |
|---|---|
| `pads.txt` | the pad survey: method, class derivation, per-lane table, all commands, addenda A–C |
| `readers.txt` | the reader inventory: every reader with file:line, class, and the reader it feeds |
| `pad-survey.mjs` | the survey script (detector; TRIM_ONLY computed from the JS runtime) |
| `survey-revs.mjs` | driver that surveys all committed revisions |
| `fleet-history-scan.mjs` | extra: raw codepoint scan of all 21 lanes' histories |
| `class-compare.mjs` | extra: proves JS `\s` ≡ JS `trim()` (identical 25-point sets) |
| `receipts/` | raw machine output for every claim (summaries, empty TSVs, the fleet scan) |

---

## 1. Finding 1 — the pad exposure is ZERO, as expected

**Answer: 0 offending rows, 0 offending cells, in every population surveyed.**

| population | scope | result |
|---|---|---|
| A | 21 current fleet registries `*/corpus/SOURCES.md` | 5505 Registry rows / 5461 data rows → **0 offending rows, 0 offending cells** |
| B | every committed revision of the kumitate lane's `corpus/SOURCES.md` (359 commits → 80 distinct blobs) | **0 offending rows, 0 offending cells** |
| C | raw codepoint scan of all 21 current files + all 80 historical blobs | only U+000A (LF, line structure); **zero** VT/FF/CR/NBSP/Zs/U+FEFF/LS/PS anywhere |
| D | the census's own fixture registries (5 files) | no TRIM_ONLY codepoint other than LF |

There is **no lane/row/cell to report.** The claim C1 has no live incident behind it: R99 changes
no observed value in the fleet. The plan's disclosed limit (1) is confirmed by measurement — every
edge pad in all 21 registries and all 80 historical revisions is **ASCII SP only** (`lead:" "`,
`trail:" "`; kotodama and revenger also use a two-SP run on one side). No TAB, no VT, no FF, no
CR, no NBSP, no Zs, no U+FEFF anywhere.

**Per-lane table** (machine output, `receipts/pads-current.summary`):

| lane | registryRows | dataRows | offendingRows | offendingCells | asciiPadCells | noPadCells |
|---|---|---|---|---|---|---|
| audio-shokunin | 17 | 15 | 0 | 0 | 176 | 11 |
| chousa-shokunin | 215 | 213 | 0 | 0 | 2354 | 11 |
| game-dev-2d-shokunin | 33 | 31 | 0 | 0 | 352 | 11 |
| game-dev-3d-shokunin | 38 | 36 | 0 | 0 | 407 | 11 |
| kagi-shokunin | 114 | 112 | 0 | 0 | 1243 | 11 |
| kaidoku-shokunin | 235 | 233 | 0 | 0 | 2574 | 11 |
| kake-shokunin | 226 | 224 | 0 | 0 | 2475 | 11 |
| kama-shokunin | 345 | 343 | 0 | 0 | 3784 | 11 |
| kasegi-shokunin | 132 | 130 | 0 | 0 | 1439 | 13 |
| kengaku-shokunin | 343 | 341 | 0 | 0 | 3762 | 11 |
| kotoba-shokunin | 215 | 211 | 0 | 0 | 2343 | 22 |
| kotodama-shokunin | 953 | 951 | 0 | 0 | 10472 | 11 |
| kumitate-shokunin | 217 | 215 | 0 | 0 | 2376 | 11 |
| lore-shokunin | 34 | 32 | 0 | 0 | 363 | 11 |
| mado-shokunin | 451 | 449 | 0 | 0 | 4950 | 11 |
| mori-shokunin | 418 | 416 | 0 | 0 | 4576 | 22 |
| revenger-shokunin | 511 | 509 | 0 | 0 | 5610 | 11 |
| souji-shokunin | 251 | 249 | 0 | 0 | 2749 | 12 |
| tabi-shokunin | 203 | 201 | 0 | 0 | 2222 | 11 |
| tameshi-shokunin | 179 | 177 | 0 | 0 | 1958 | 11 |
| tsukuroi-shokunin | 375 | 373 | 0 | 0 | 4114 | 11 |
| **TOTAL** | **5505** | **5461** | **0** | **0** | **60299** | **256** |

### The detector is able to fail (positive controls)

`TRIM_ONLY` is computed from the JS runtime, not hand-listed: every code point `c` with
`c.trim() === ''` that `/[ \t]$/` does not match. Measured on node v24.21.0 → **23 code points**:
`U+000A U+000B U+000C U+000D U+00A0 U+1680 U+2000..U+200A U+2028 U+2029 U+202F U+205F U+3000 U+FEFF`.

Edge semantics: strip the leading `[ \t]` run, then look for TRIM_ONLY characters immediately
after it (and symmetrically at the trailing edge) — because that is exactly the set of characters
JS `trim()` removes and `[ \t]` does not.

Controls (all in `pads.txt` §5): a 13-row fixture with one TRIM_ONLY class per row, padded on
the source-cell lead and the tier-cell trail → the detector reports **26 offending cells**, each
named with its code point (`U+000B, U+000C, U+000D, U+00A0, U+1680, U+2000, U+2003, U+2028,
U+2029, U+202F, U+205F, U+3000, U+FEFF`). Two further controls exercise the trailing edge and
the NBSP-both-sides case. The detector resolves and names edge pads; it is not inert.

### Addendum A — the whole-fleet history (extra, beyond scope)

I extended the revision sweep to all 21 lanes' own histories, because one stray CR anywhere in
the fleet would be a live R99 exposure. **1735 distinct `SOURCES.md` blob revisions, 13 blob
hits, all of them U+000D (CR)**, in kagi/kama/kengaku/kotoba/souji/tsukuroi.

Every hit is a **whole-file CRLF revision, not a stray cell-edge CR** — measured on three:
`tsukuroi 298592bbc2c4` = 381 LF / 381 CR / 381 CRLF / 0 lone CR; `kotoba 243256d1a3e8` =
436/436/436/0; `kama b34aa9af146e` = 639/639/639/0. The CR is a **line terminator**: it sits
after the row's final `|`, i.e. outside every cell. The cell-aware survey correctly finds 0
offending cells in those revisions.

It matters anyway because whole-CRLF is the counter's **FIX-B** shape (arm (f)). Measured on a
CRLF fixture: census → `E12 S001 row outside Registry section`; sources-check →
`SECTION_MISSING` + `ROW_OUTSIDE_REGISTRY`. **The two readers already agree there**, and R99 is
CRLF-neutral (BASE neither removes the CR — sources-check's `split(/\r?\n/)` already did — nor
adds it, since the census was already `[BLANK]`).

### Addendum B — measured BASE-vs-R99 differential

BASE (`f9cd1bff:scripts/sources-check.mjs`) vs the same file with only the `trim` line replaced
by `value.replace(/^[ \t]+|[ \t]+$/g, '')`; fixture = 11 valid rows, one NBSP-padded cell per row
(id lead, id trail, kind, tier, status, opened, recheck, used-by):

| | BASE (JS `trim`) | R99 (`[BLANK]`) |
|---|---|---|
| cell findings | **none** — the NBSP is silently swallowed on every cell | ID_FORM ×2, KIND_ENUM, TIER_ENUM, STATUS_ENUM, OPENED_INVALID, RECHECK_INVALID |
| `counts.rows` | 11 | 9 |
| `status` histogram | `{queued: 11}` | `{queued: 8}` |

This is the claim's value, measured: under BASE a padded cell is accepted as if clean, so
sources-check's `counts.rows` and tier/status histograms are **inflated relative to the census**,
which reads the same row as E02/E05/E06/E07/E08/E09. R99 makes the two readers agree. R99 also
does not create a new rejection on any real registry, because populations A–D are 0.

The `counts.rows` 11→9 drop is the same arithmetic the counter's arm (e) encodes
(`counts.rows == census rows − E02 count`): the two NBSP-padded ids stop being valid ids and
stop being counted.

### Addendum C — live-file churn (disclosed)

The 21 fleet registries are **live working trees**, not frozen snapshots. During this run
`tabi-shokunin/corpus/SOURCES.md` was modified (mtime 2026-11-07 03:38:08 -0300): its
`registryRows` went 202 → 203 between two runs of the same survey. Both runs measured
`offendingRows=0`. All other lanes were stable. The table above is the final run.

---

## 2. Finding 2 — the reader inventory

Full inventory with every file:line, class and target reader is in **`readers.txt`**. Summary:

| class | strips | readers |
|---|---|---|
| **[BLANK]** `[ \t]` | SP TAB | census gawk `trim` (`sources-census.sh:581`, feeds all 11 cells at :626–628 + heading :611 + E12 id :620 + separator :592/:595); `round-gate.mjs:411` `SOURCES_ROW_RE`; `sources-check.mjs:203` heading, `:234` outside-row; `round-gate.mjs:432` heading |
| **[JS-TRIM]** `.trim()` | SP TAB VT FF CR NBSP Zs U+FEFF LF LS PS | **`sources-check.mjs:134` — the claim's helper, 15 uses** (id :232, the ten other cells :269–278, tier/status counts :256–257, empty-id guard :240, used-by parts :158); `source-dupes.mjs:165` cells, `:158` heading; `round-gate.mjs:436/:437` outside/malformed ids, **`:438` status cell**; `routed-ledger.mjs:166` (not SOURCES); `readme-map.mjs:161` (not SOURCES) |
| **[JS-RE-\s]** | = JS-TRIM exactly (measured: "IDENTICAL SETS: true", both 25 points) | `source-capture.mjs:157` id scan; `cite-sources.mjs:36` id scan; `source-dupes.mjs:167` separator, `:89` urlOf; `round-gate.mjs:413` URL |
| **[SPACE]** `[[:space:]]` | **locale-dependent** | census bash `trim_cell` `:531–536` (id/status/used-by/path, :546/:557/:558/:560/:564); census heading `:540`; census url_of `:601`; census conf `:470` |

**The same cell is read by different classes — three classes on the id cell alone:**

- **id cell**: census `[BLANK]` · sources-check `[JS-TRIM]` · source-capture + cite-sources `[JS-RE-\s]` · round-gate `[BLANK]`
- **status cell**: census `[BLANK]` · sources-check `[JS-TRIM]` · round-gate `[JS-TRIM]`
- **used-by cell**: census `row_pass` `[BLANK]` · census `usedby_findings` `[SPACE]` · sources-check `[JS-TRIM]`
- **heading text**: census gawk `[BLANK]` · census bash `[SPACE]` · sources-check `[RE-BLANK]` · source-dupes `[JS-TRIM]`

**Precedent.** `round-gate.mjs:411` already reads the id cell with `[BLANK]` on purpose (round 94,
`d21decd2`), and its r98 selftest arms at `:1806`–`:1815` pin VT/FF/CR/NBSP/U+2003/U+FEFF/U+200B
as "not a row". **R99 makes `sources-check` follow a precedent the fleet already set.**

**Measured `[[:space:]]` divergence** (`receipts/spaceclass.sh`, host `LANG=en_US.UTF-8`):
SP TAB VT FF CR **and U+3000** are space; NBSP and U+FEFF are **not**. Under `LC_ALL=C` U+3000 is
not space either. So a used-by path padded with U+3000 yields an E11 "missing used-by" under the
host locale but not under `LC_ALL=C` — the census is internally inconsistent about which class a
cell uses. Report-only, per the plan's disclosed limit 2; the fleet script is not edited.

**Same-shape divergences R99 leaves in place** (report-only, outside R99's frozen scope):
`source-capture.mjs:157` and `cite-sources.mjs:36` accept a JS-whitespace-padded id that the
census calls a bad id; `round-gate.mjs:438` reads a JS-TRIM status cell (a NBSP-padded status
reads as `mined` there and as `mined<NBSP>` to the census); the census reads the used-by cell
twice with two classes.

---

## 3. Commands and receipts

```
# 1. every committed revision of the lane's corpus/SOURCES.md
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
git log --all --format='%H' -- corpus/SOURCES.md                    -> 359
git rev-list --all -- corpus/SOURCES.md | wc -l                      -> 359
git log --all --format='%H' -- corpus/SOURCES.md > $S/revs.txt
while read -r r; do b=$(git rev-parse "$r:corpus/SOURCES.md"); echo "$r $b"; done < $S/revs.txt > $S/rev-blobs.txt
cut -d' ' -f2 $S/rev-blobs.txt | sort -u > $S/blobs.txt              -> 80 distinct blobs
while read -r b; do git cat-file blob "$b" > "$S/revs/blob-$b.md"; done < $S/blobs.txt

# 2. survey the 21 current registries
node .ufo/waves/round-99/K99Scout/pad-survey.mjs <lane> <file> ... > $S/pads-current.tsv 2> $S/pads-current.summary
  -> "rows-with-trim-only-pads: 0" + the 21-line table

# 3. survey all 80 historical blobs
node .ufo/waves/round-99/K99Scout/survey-revs.mjs $S/rev-blobs.txt $S/revs $S/pads-revisions.tsv
  -> "revisions=359  distinctBlobs=80  offendingRows=0  offendingCells=0
      asciiPadCells=116017  asciiPadClasses=[\"lead:\" \"\",\"trail:\" \"\"]"   (TSV is 0 lines)

# 4. fleet-wide history (extra)
node .ufo/waves/round-99/K99Scout/fleet-history-scan.mjs /home/vgpnk/Projects/shokunin $S/fleet-history-scan.txt
  -> 21 lanes, 1735 blobs, 13 hits, all U+000D (whole-file CRLF; 0 lone CR)

# 5. class identity
node .ufo/waves/round-99/K99Scout/class-compare.mjs
  -> "\s size = 25", "trim set size = 25", "IDENTICAL SETS: true"

# 6. census gawk trim is [BLANK] (gawk 5.4.1)
printf 'A\xc2\xa0B\n' | gawk 'function trim(s) { gsub(/^[ \t]+|[ \t]+$/,"",s); return s } {print "["trim($0)"]"}'
  -> "[A B]"      (NBSP survives)

# 7. bash [[:space:]] is locale-dependent
bash $S/spaceclass.sh ; LC_ALL=C bash $S/spaceclass.sh

# 8. BASE-vs-R99 differential (read-only on the lane; the run needed cap-spawn.mjs, so the two
#    variants were placed as scripts/zz-sc-<v>-tmp.mjs and DELETED in the same command)
git show f9cd1bff...:scripts/sources-check.mjs > $S/sc-base.mjs   # then one line patched -> sc-r99.mjs
node scripts/zz-sc-base-tmp.mjs --self $S/diff --json   -> no cell findings, counts.rows 11
node scripts/zz-sc-r99-tmp.mjs  --self $S/diff --json   -> ID_FORM x2, KIND/TIER/STATUS_ENUM,
                                                             OPENED/RECHECK_INVALID, counts.rows 9
```

**Receipts** (`K99Scout/receipts/`): `pads-current.summary`, `pads-current.tsv` (0 bytes),
`pads-revisions.summary`, `pads-revisions.tsv` (0 bytes), `class-compare.txt`,
`fleet-history-scan.txt`, `spaceclass.sh`, `usedby.mjs`.

---

## 4. Bottom line for the claim

1. **Expected 0, measured 0** — in all four populations, including every committed revision of the
   lane's registry and (extra) 1735 blob revisions across all 21 lanes' histories. There is no
   live incident; R99 changes no observed fleet value. The claim's value is entirely prospective.
2. **R99 is the right direction and has a precedent.** `round-gate.mjs:411` already reads the id
   cell with `[BLANK]` and its r98 selftest pins the wider classes as "not a row". R99 brings
   `sources-check`'s cell reads to the same class as the census it is compared against.
3. **The BASE-vs-R99 differential shows the harm direction is right**: BASE silently accepts a
   NBSP-padded cell and inflates `counts.rows` and the tier/status histograms relative to the
   census; R99 makes both readers agree (measured, addendum B).
4. **R99 is CRLF-neutral**, and the only CR bytes in the entire fleet history are whole-file CRLF
   revisions where the two readers already agree (FIX-B, arm (f)).
5. **Out of scope but same-shaped, for the connector/close to route**: `source-capture.mjs:157`
   and `cite-sources.mjs:36` (JS `\s` id scan) accept a JS-whitespace-padded id that the census
   calls a bad id; `round-gate.mjs:438` reads a JS-TRIM status cell; the census reads the used-by
   cell twice with two classes (`[BLANK]` in `row_pass`, `[[:space:]]` in `usedby_findings`).

## 5. Blockers / deviations

- **No blockers.** Every check was run; no check is claimed unrun.
- **Deviation, disclosed.** The BASE-vs-R99 differential needed `cap-spawn.mjs` from the lane's
  `scripts/`, so the two variants were briefly written there as `scripts/zz-sc-{base,r99}-tmp.mjs`
  and removed by the same command. This touched the read-only path. The lane was verified clean
  afterwards (`git status --short scripts/` → empty; no `zz-*` file remains) and no tracked lane
  file was modified. I should have copied the whole `scripts/` directory into scratch instead;
  that is the mistake to avoid in a later seat.
- **Live-file churn** in `tabi-shokunin` during the run (addendum C) — the affected count moved by
  one row; the offending count was 0 in both runs.
