# ScribeSources — SOURCES.md delta for round 51 (rows S100, S101)

Seat: ScribeSources. Lane read-only for everything except this artifact and the seat report.
Delivered as an artifact for the L1 to integrate; `corpus/SOURCES.md` was **not** edited.

Sources of every fact below: the two wave-1 scout seats' own fetches, re-verified against the
saved bytes in this lane (not taken on trust):

- `build/ScoutClockSource/clock-gettime.html` — 30379 bytes, sha256
  `7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69`, HTTP 200,
  `Last-Modified: Thu, 08 Oct 2026 17:39:35 GMT`, `ETag "76ab-65d57b70ec3c0"`, fetch instant
  `2026-10-24T01:59:31Z` (local `-03` date 2026-10-23). Scout receipt:
  `.ufo/waves/round-51/w1/ScoutClockSource.md`.
- `build/ScoutRandomSource/getrandom.html` — 16466 bytes, sha256
  `366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d`, HTTP 200,
  `Last-Modified: Thu, 08 Oct 2026 17:39:35 GMT`, `ETag "4052-65d57b70ec3c0"`, fetch instant
  `2026-10-24T01:59:28Z` (local `-03` date 2026-10-23). Scout receipt:
  `.ufo/waves/round-51/w1/ScoutRandomSource.md`.

Both pages are man-pages 6.19 renderings (`Linux man-pages 6.19` footline; COLOPHON: "obtained
from the tarball man-pages-6.19.tar.gz … 2026-09-09"). Page dates: `clock_getres(2)` 2026-03-07,
`getrandom(2)` 2026-02-08.

---

## A. The two new registry rows (exact text to append)

Append **immediately after the `S099` row**, inside the `## Registry` table of
`corpus/SOURCES.md` (currently the last registry row is `S099`, file line 112; `## Paths`
begins at line 115). Do not insert between the table header and `S001`; do not add a second
table. Each line below is one physical line with exactly 13 pipe-split fields, matching the
existing rows.

```
| S100 | Linux man-pages clock_getres(2)/clock_gettime(2) — https://man7.org/linux/man-pages/man2/clock_gettime.2.html | docs | A | CLOCK_MONOTONIC semantics for invocation-receipt monotonic spans | DESCRIPTION, CLOCK_MONOTONIC paragraph, saved HTML lines 177-184; man-pages 6.19 (page 2026-03-07; tarball man-pages-6.19.tar.gz obtained 2026-09-09); HTTP 200; body sha256 7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69; fetched 2026-10-24T01:59:31Z | CLOCK_MONOTONIC ignores discontinuous system-time steps but is affected by frequency adjustments, and consecutive calls never go backwards, so a measured monotonic span is non-negative. | mined | 2026-10-23 | 180d | corpus/knowledge/invocation-attestation.md |
| S101 | Linux man-pages getrandom(2) — https://man7.org/linux/man-pages/man2/getrandom.2.html | docs | A | nonce generation for receipt ledgers on Linux | DESCRIPTION paragraphs 1-2, saved HTML lines 81-86; man-pages 6.19 (page 2026-02-08; tarball man-pages-6.19.tar.gz obtained 2026-09-09); HTTP 200; body sha256 366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d; fetched 2026-10-24T01:59:28Z | getrandom() draws entropy from the urandom source, the same source as /dev/urandom, and its bytes are usable for cryptographic purposes. | mined | 2026-10-23 | 180d | corpus/knowledge/invocation-attestation.md |
```

### Cell-by-cell justification

| cell | S100 | S101 | why |
|---|---|---|---|
| id | S100 | S101 | next free ids; `S100`/`S101` occur nowhere in `corpus/SOURCES.md` today (`grep -c` = 0) and the frozen D3 probe filters exactly `/^\|\s*S10[01]\s*\|/` |
| kind | `docs` | `docs` | man-pages rendered documentation; `docs` is in the frozen `KINDS` enum of `scripts/sources-check.mjs` |
| tier | `A` | `A` | primary upstream documentation, no community tier inflation (`community`+`A` is the `TIER_INFLATION` error, not applicable) |
| scope | verbatim from the item text | verbatim from the item text | scope is a free cell; the item froze these two scopes |
| anchor | section + saved line numbers + man-pages version + page date + HTTP status + body sha256 + fetch instant | same shape | the anchor must let a later reader re-locate the passage in the same bytes; the sha256 pins *which* bytes |
| teaches | what the page says about `CLOCK_MONOTONIC` | what the page says about `getrandom()` | each is one grounded benefit, no more |
| status | `mined` | `mined` | both pages were fetched and quoted first-hand this round; `mined` is required by frozen D3 |
| opened | `2026-10-23` | `2026-10-23` | the lane's local calendar date of the fetch (see §E note 1); legal under `OPENED_INVALID` (on/before UTC today) and under census `E08` for any `--today` ≥ 2026-10-23 |
| recheck | `180d` | `180d` | `^([0-9]+)d$` cadence, accepted by `RECHECK_INVALID`; not overdue (`opened + 180d` = 2027-04-21) |
| used-by | `corpus/knowledge/invocation-attestation.md` | `corpus/knowledge/invocation-attestation.md` | required by frozen D3 (`c[11].includes(ENTRY)`) and symmetric with the entry's `source:` header (no `USED_BY_ASYMMETRY`) |

### Two claims deliberately *not* made

- **S100 does not say `CLOCK_MONOTONIC` is immune to NTP.** The page names NTP under
  `CLOCK_REALTIME` (saved lines 125-128, 133) and under `CLOCK_TAI` (line 154);
  `CLOCK_MONOTONIC_RAW` (lines 192-195) is the clock "not subject to frequency adjustments".
  The `teaches` cell therefore says "discontinuous system-time steps" and separately records
  that frequency adjustments *do* apply. Do not extend this row to "NTP-proof".
- **S101 does not say "CSPRNG", and does not say Node's `crypto.randomBytes` calls
  `getrandom()`.** The strings `CSPRNG`/`csprng` occur 0 times in the saved body. The page
  grounds the *kernel entropy source* and the *cryptographic use*; it does not ground the
  Node-to-syscall linkage. The `teaches` cell is written to stay inside what the page says.

---

## B. Lesson `## Gate` block draft — `corpus/lessons/round-51.md`

`corpus/lessons/round-51.md` does not exist yet at the time of writing. The block below is the
draft for it, in the house style of `corpus/lessons/round-50.md` (bulleted `## Gate`, then a
`## Frontier — SOURCES` section carrying the old→new used-by lines).

```markdown
## Gate

- **Candidates.** Two man-pages rows were opened this round by wave-1 scout seats, one source
  per seat, fetched first-hand and quoted from the saved bytes:
  `https://man7.org/linux/man-pages/man2/clock_gettime.2.html` (seat `ScoutClockSource`) and
  `https://man7.org/linux/man-pages/man2/getrandom.2.html` (seat `ScoutRandomSource`). Both are
  man-pages 6.19 renderings obtained from the `man-pages-6.19.tar.gz` tarball on 2026-09-09.
  Rows before this round: 99; rows after: 101 — two rows added, none removed or rewritten.
- **Admitted.**
  - **S100** — tier A, `docs`, status `mined`, opened 2026-10-23, recheck `180d`, used-by
    `corpus/knowledge/invocation-attestation.md`. URL:
    `https://man7.org/linux/man-pages/man2/clock_gettime.2.html`. Accessed 2026-10-23
    (lane-local date, America/Sao_Paulo −03); the fetch instant was `2026-10-24T01:59:31Z` UTC.
    HTTP 200, 30379 bytes, body sha256
    `7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69`. Located quote (22
    words), DESCRIPTION, `CLOCK_MONOTONIC` paragraph, saved HTML lines 177-179: "The
    CLOCK_MONOTONIC clock is not affected by discontinuous jumps in the system time (e.g., if the
    system administrator manually changes the clock)". The sentence continues ", but is affected
    by frequency adjustments." (lines 179-180); the same paragraph adds that consecutive calls
    never go backwards, while successive calls may return identical values (lines 181-184). The
    page does **not** claim NTP immunity for `CLOCK_MONOTONIC` — NTP is named only under
    `CLOCK_REALTIME` and `CLOCK_TAI`.
  - **S101** — tier A, `docs`, status `mined`, opened 2026-10-23, recheck `180d`, used-by
    `corpus/knowledge/invocation-attestation.md`. URL:
    `https://man7.org/linux/man-pages/man2/getrandom.2.html`. Accessed 2026-10-23 (lane-local
    date, America/Sao_Paulo −03); the fetch instant was `2026-10-24T01:59:28Z` UTC. HTTP 200,
    16466 bytes, body sha256
    `366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d`. Located quote (17
    words), DESCRIPTION paragraph 2, saved HTML lines 85-86: "By default, getrandom() draws
    entropy from the urandom source (i.e., the same source as the /dev/urandom device)." (In the
    saved HTML the name is bold markup, `<b>getrandom</b>()`; the rendered text is
    `getrandom()`.) The adjacent paragraph 1 (lines 82-83) adds that the bytes "can be used to
    seed user-space random number generators or for cryptographic purposes." The page never uses
    the word "CSPRNG", and never says Node's `crypto.randomBytes` calls `getrandom()`; this row
    is not used to make either claim.
- **Rejected.** None this round. Neither row was a rejection candidate: both pages are primary
  upstream documentation, both were opened first-hand, and both carry a located quote.
- **Spot-check.** This file records the round's own source decisions. It claims no spot-check
  verdict for round 51; the non-author closure audit is the driver's duty, not this file's.

## Frontier — SOURCES

Cells changed this round (append-only rule permits exactly `status`, `recheck`, `used-by`):

- **S100** — new row. `status` `mined`, `opened` `2026-10-23`, `recheck` `180d`,
  `used-by` `corpus/knowledge/invocation-attestation.md`. No pre-existing row changed.
- **S101** — new row. `status` `mined`, `opened` `2026-10-23`, `recheck` `180d`,
  `used-by` `corpus/knowledge/invocation-attestation.md`. No pre-existing row changed.
```

---

## C. Old→new used-by lines for any additional row the entry cites

**None.** The entry `corpus/knowledge/invocation-attestation.md` is required by the frozen D1
check to carry a provenance trio citing **S100 and S101 only** (both man7.org URLs, plus
`verified-at:` and `recheck:` in its first five lines), and the plan's C2 text says the same:
"the entry's provenance trio cites S100/S101". No other registry row is cited by the entry, so
**no existing row's `used-by` cell changes** — the two new rows are the only `used-by` edits in
this round.

Contingency for the L1, if the integrated entry turns out to cite further rows (for example
`S099` for the bind-scope clause or `S095`/`S098`): each such row's `used-by` cell must gain
`corpus/knowledge/invocation-attestation.md`, in the house format `old → old + new`, e.g.

```
- **S099** `used-by`: `scripts/bind-oracle.mjs, corpus/knowledge/counter-amendment-discipline.md,
  corpus/lessons/round-49.md` →
  `scripts/bind-oracle.mjs, corpus/knowledge/counter-amendment-discipline.md,
  corpus/lessons/round-49.md, corpus/knowledge/invocation-attestation.md`.
  `status` `mined` and `recheck` `on-release` unchanged; `opened` `2026-10-23` unchanged.
```

Without that edit `sources-check.mjs` reports `USED_BY_ASYMMETRY` — a **warning**, so the
non-strict run D4 performs still prints `SOURCES_CHECK: CLEAN` and exits 0; only a `--strict`
run would turn it into drift. The census does not test asymmetry. (The `ScribeEntry` artifact had
not landed at the time of writing, so the citation set was read from the frozen plan and probe,
not from the entry's bytes.)

---

## D. What was verified, and how

Verified on a scratch copy of the lane (`mktemp -d`, the live checkout untouched), with the two
rows appended after `S099` and a stub `corpus/knowledge/invocation-attestation.md` present:

```
$ node scripts/sources-check.mjs --self <scratch>
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 status=queued:12,mined:73,rejected:16 entries_with_source=8 legacy=38)
exit=0

$ node scripts/sources-check.mjs --self <scratch> --strict
SOURCES_CHECK: CLEAN (rows=101 …)
exit=0

$ bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/corpus/SOURCES.md
file  W04  S034 duplicate url … (pre-existing)
file  W04  S068 duplicate url … (pre-existing)
file  W04  S084 duplicate url … (pre-existing)
file  W04  S095 duplicate url … (pre-existing)
file  ok   <scratch>/corpus/SOURCES.md
exit=0
```

The frozen D3 predicate was replayed against the two rows as they would be parsed
(`line.split('|').map(x => x.trim())`):

```
S100 fields=13  c[8]='mined'  c[9]='2026-10-23'  c[11]='corpus/knowledge/invocation-attestation.md'  D3=True
S101 fields=13  c[8]='mined'  c[9]='2026-10-23'  c[11]='corpus/knowledge/invocation-attestation.md'  D3=True
```

Both quotes were re-verified as verbatim substrings of the tag-stripped saved bytes:

```
S100 quote  words=22  verbatim=True  occurrences=1
S101 quote  words=17  verbatim=True  occurrences=1   (strict strip, <b>/<i> removed without a space)
S100 continuation ", but is affected by frequency adjustments"  words=6  verbatim=True
S100 "All CLOCK_MONOTONIC variants guarantee that the time returned by consecutive calls will not go backwards"  words=15  verbatim=True
S101 adjacent "These bytes can be used to seed user-space random number generators or for cryptographic purposes."  words=15  verbatim=True
```

---

## E. Notes and findings for the L1 (no lane file was edited)

1. **`opened` is the local date; the fetch instant is UTC 2026-10-24.** The item text and the
   round's own dating use `2026-10-23`; the two fetches happened at `2026-10-24T01:59:3xZ`,
   which is still 2026-10-23 in the host's local zone (America/Sao_Paulo, −03). The `opened`
   cell therefore reads `2026-10-23` and the `anchor` cell carries the exact UTC instant, so
   nothing is lost. This choice is also the safe one: census `E08` compares `opened` against
   `--today`, so `opened: 2026-10-24` would have been rejected by any census run pinned to
   `--today 2026-10-23`. Both scout seats flagged the same UTC/local split independently.
2. **Ordering constraint (not a defect): the entry file and the two rows must land in the same
   commit.** `used-by` paths are existence-checked — `sources-check.mjs` `USED_BY_MISSING`
   (error) and census `E11` (error). Measured on the scratch copy: with the rows present and
   `corpus/knowledge/invocation-attestation.md` absent, the census prints
   `E11 S100 missing used-by corpus/knowledge/invocation-attestation.md` and
   `E11 S101 …` and exits 1; with the entry present it exits 0. Land the entry file first or in
   the same commit as the rows.
3. **D5 reads the live checkout, not the extracted rev.** The frozen D5 arm runs
   `sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`, which resolves to
   `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` — the working tree. So the
   rows must also be present in the live tree at close time, not only in the committed rev D1-D4
   extract. Both scout seats also noted the D5 live-tree coupling.
4. **D3's column indexes were repaired by the L1 before this seat ran.** The frozen probe at
   `.ufo/waves/round-51/probe/doctrine51-probe.mjs:97` now reads
   `c[8] === 'mined' && c[11].includes(ENTRY)`, which is the only shape a row can have and also
   satisfy `sources-check.mjs`'s 13-field rule (`status` at index 8, `opened` at 9, `recheck`
   at 10, `used-by` at 11, trailing empty field at 12). The rows in §A are written to that
   shape; the two seats that found the original mismatch (`ScoutClockSource`,
   `ScoutRandomSource`) each recorded the repair at commit `3ed875d3` ("round-51: freeze repair
   2 — D51 SOURCES-row column indexes"). No counter was edited by this seat.
5. **Anchor wording for S100 names the page by its real title.** The URL
   `…/man2/clock_gettime.2.html` serves the combined `clock_getres, clock_gettime,
   clock_settime` page whose `<title>` is `clock_getres(2) - Linux manual page`. The `source`
   cell says "clock_getres(2)/clock_gettime(2)" so the row does not misname the document it
   quotes; the URL is unchanged from the plan's, and D1 requires the *entry* to cite that URL.
6. Not verified, and out of scope for this seat: whether the saved HTML byte-matches the
   `man-pages-6.19` tarball member (the COLOPHON claims that origin; the fetch is the man7.org
   rendering), and the `random(7)` / `urandom(4)` pages, which `getrandom(2)` points at for the
   pool itself and which this round did not open.
