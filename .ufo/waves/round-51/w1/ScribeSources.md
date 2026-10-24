# ScribeSources — SOURCES.md delta for round 51 (rows S100, S101)

Seat: ScribeSources. Item: draft the SOURCES.md additions (S100, S101) and the round-51 lesson
`## Gate` block. Lane read-only for everything except this report and the aux artifact.

**Artifact delivered:** `.ufo/waves/round-51/build/ScribeSources/SOURCES-delta.md`
(aux dir `.ufo/waves/round-51/build/ScribeSources/`, named by this item).
**Not edited:** `corpus/SOURCES.md`, `corpus/lessons/round-51.md`, `corpus/knowledge/`, both
frozen probes, any other lane file. `git status` shows no modification to any tracked file I own
(only the harness-owned `.ufo/waves/round-51/w1/swarm-registry.json` is modified, not by me).

## Behavior delivered

1. **Two exact registry rows** for S100 and S101, written into the `## Registry` table of
   `corpus/SOURCES.md` immediately after the `S099` row (file line 112). Each row is one
   physical line with exactly 13 pipe-split fields, `kind=docs`, `tier=A`, `status=mined`,
   `opened=2026-10-23`, `recheck=180d`, `used-by=corpus/knowledge/invocation-attestation.md`.
   Full text in the artifact, §A.
2. **Lesson `## Gate` block draft** for `corpus/lessons/round-51.md` (artifact §B), in the house
   style of `corpus/lessons/round-50.md`, recording for **each** new row: the URL, the access
   date (2026-10-23 lane-local) with the exact UTC fetch instant, and a ≤25-word located quote
   with its section and saved-HTML line range. It also carries the `## Frontier — SOURCES`
   section with the old→new used-by lines.
3. **Old→new used-by lines for any additionally-cited row: none** (artifact §C). The entry's
   provenance trio cites S100 and S101 only (plan C2 + frozen D1), so no existing row's
   `used-by` cell changes. A contingency format is supplied in case the integrated entry cites
   further rows.

## Sources and provenance

Every fact was re-derived from the saved bytes in this lane, not taken on trust from the scout
proposals:

| row | URL | bytes | sha256 | HTTP | fetch instant (UTC) |
|---|---|---|---|---|---|
| S100 | https://man7.org/linux/man-pages/man2/clock_gettime.2.html | 30379 | `7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69` | 200 | `2026-10-24T01:59:31Z` |
| S101 | https://man7.org/linux/man-pages/man2/getrandom.2.html | 16466 | `366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d` | 200 | `2026-10-24T01:59:28Z` |

Both are man-pages 6.19 renderings (footline `Linux man-pages 6.19`; COLOPHON: tarball
`man-pages-6.19.tar.gz` obtained 2026-09-09). Page dates: `clock_getres(2)` 2026-03-07,
`getrandom(2)` 2026-02-08. Scout receipts: `.ufo/waves/round-51/w1/ScoutClockSource.md`,
`.ufo/waves/round-51/w1/ScoutRandomSource.md`.

Located quotes used in the lesson Gate block (both re-verified as verbatim substrings of the
tag-stripped saved bytes, occurrence count 1):

- S100 (22 words), DESCRIPTION, `CLOCK_MONOTONIC` paragraph, saved HTML lines 177-179:
  "The CLOCK_MONOTONIC clock is not affected by discontinuous jumps in the system time (e.g., if
  the system administrator manually changes the clock)". Sentence continues ", but is affected
  by frequency adjustments." (179-180); the same paragraph adds that consecutive calls never go
  backwards while successive calls may return identical values (181-184).
- S101 (17 words), DESCRIPTION paragraph 2, saved HTML lines 85-86: "By default, getrandom()
  draws entropy from the urandom source (i.e., the same source as the /dev/urandom device)."
  (the saved HTML renders the name as `<b>getrandom</b>()`); adjacent paragraph 1 (82-83) adds
  that the bytes "can be used to seed user-space random number generators or for cryptographic
  purposes."

## Gates exercised (on a scratch copy; the live checkout was never written)

Scratch tree = `mktemp -d` copy of the lane (via `tar`, `.git` excluded), with the two delivered
rows appended after `S099` and a stub `corpus/knowledge/invocation-attestation.md` present. The
rows were extracted programmatically from the delivered artifact, so the verified bytes are the
delivered bytes.

```
$ node scripts/sources-check.mjs --self <scratch>
SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 status=queued:12,mined:73,rejected:16 entries_with_source=8 legacy=38)
exit=0                                    # frozen D4 shape

$ node scripts/sources-check.mjs --self <scratch> --strict
SOURCES_CHECK: CLEAN (rows=101 …)
exit=0                                    # no warning promoted to drift

$ bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/corpus/SOURCES.md
file  W04  S034 … (pre-existing)
file  W04  S068 … (pre-existing)
file  W04  S084 … (pre-existing)
file  W04  S095 … (pre-existing)
file  ok   <scratch>/corpus/SOURCES.md
exit=0                                    # frozen D5 shape; the four W04s pre-date this round
```

D3 predicate replayed verbatim against the delivered rows (`l.split('|').map(x => x.trim())`,
rule `c[1]===id && c[8]==='mined' && c[11].includes(ENTRY)`):

```
S100 fields=13  c[8]='mined'  c[9]='2026-10-23'  c[11]='corpus/knowledge/invocation-attestation.md'  D3=True
S101 fields=13  c[8]='mined'  c[9]='2026-10-23'  c[11]='corpus/knowledge/invocation-attestation.md'  D3=True
```

Also checked: `S100`/`S101` appear nowhere in `corpus/SOURCES.md` today (`grep -c` = 0), so the
ids are free; the census raises no `E04` duplicate-URL error for the two new rows.

## Touched surfaces

- Created: `.ufo/waves/round-51/build/ScribeSources/SOURCES-delta.md` (this seat's aux dir).
- Created: `.ufo/waves/round-51/w1/ScribeSources.md` (this report).
- Nothing else. No `corpus/` write, no probe write, no git/jj mutation, no sibling-lane file, no
  `.ufo/state`, no `MANIFEST.json`, no `~/.omp/agent/*`.

## Findings and constraints for the L1

1. **`opened` is the local date; the fetch instant is UTC 2026-10-24.** The item and the round's
   dating use `2026-10-23`; the fetches happened at `2026-10-24T01:59:3xZ`, still 2026-10-23 in
   the host's local zone (America/Sao_Paulo, −03). The `opened` cell reads `2026-10-23` and the
   `anchor` cell carries the exact UTC instant, so nothing is lost. This is also the safe choice:
   census `E08` compares `opened` against `--today`, so `opened: 2026-10-24` would have been
   rejected by any census run pinned to `--today 2026-10-23`. Both scout seats flagged the same
   UTC/local split independently.
2. **Ordering constraint: the entry file and the two rows must land together.** `used-by` paths
   are existence-checked (`sources-check.mjs` `USED_BY_MISSING` error; census `E11` error).
   Measured on the scratch copy: rows present and entry absent → census prints
   `E11 S100 missing used-by corpus/knowledge/invocation-attestation.md` and the same for S101,
   exit 1; entry present → exit 0.
3. **D5 reads the live checkout, not the extracted rev.** The frozen D5 arm runs
   `sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`, which resolves to
   `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` — the working tree. The
   rows must therefore also be present in the live tree at close time, not only in the committed
   rev D1-D4 extract.
4. **D3's column indexes were repaired by the L1 before this seat ran; no counter was touched
   here.** The frozen probe at `.ufo/waves/round-51/probe/doctrine51-probe.mjs:97` now reads
   `c[8] === 'mined' && c[11].includes(ENTRY)`, the only shape that also satisfies
   `sources-check.mjs`'s 13-field rule (`status` at 8, `opened` at 9, `recheck` at 10, `used-by`
   at 11, trailing empty field at 12). Both scout seats that found the original mismatch record
   the repair at commit `3ed875d3` ("round-51: freeze repair 2 — D51 SOURCES-row column
   indexes"). The delivered rows are written to the repaired shape.
5. **Two claims deliberately not made.** S100 does **not** say `CLOCK_MONOTONIC` is immune to NTP
   — NTP is named on the page only under `CLOCK_REALTIME` and `CLOCK_TAI`, and
   `CLOCK_MONOTONIC_RAW` is the clock "not subject to frequency adjustments"; the `teaches` cell
   is written to say "discontinuous system-time steps" and separately records that frequency
   adjustments apply. S101 does **not** say "CSPRNG" (0 occurrences in the body) and does **not**
   say Node's `crypto.randomBytes` calls `getrandom()`; the row is grounded only in the kernel
   entropy source and the cryptographic use.
6. **S100's anchor names the page by its real title.** The URL
   `…/man2/clock_gettime.2.html` serves the combined `clock_getres, clock_gettime, clock_settime`
   page whose `<title>` is `clock_getres(2) - Linux manual page`; the `source` cell therefore
   says "clock_getres(2)/clock_gettime(2)". The URL is unchanged from the plan's, and D1
   requires the *entry* (not the row) to cite that URL.
7. **The `ScribeEntry` artifact had not landed at the time of writing** (checked repeatedly
   through the seat's run). The §C "no additional rows cited" conclusion is therefore read from
   the frozen plan C2 text and the frozen D1 check, not from the entry's bytes; the contingency
   format is supplied so the L1 can complete it in one edit if the integrated entry cites more.

## Out of scope (not done, and why)

- `corpus/SOURCES.md` was not edited — the item forbids it; the rows are delivered as an
  artifact for the L1 to integrate.
- `corpus/lessons/round-51.md` was not created — the item asks for a `## Gate` **block draft**
  for that file, which does not yet exist; the block is delivered in the artifact (§B).
- No `## Search log` paragraph was drafted: the section's existing entries are web-search
  passes (round-35 lineage), and both new rows were opened by direct URL fetch with no search
  query, so there is no search record to log.
- Not verified: whether the saved HTML byte-matches the `man-pages-6.19` tarball member (the
  COLOPHON claims that origin; the fetch is the man7.org rendering), and `random(7)` /
  `urandom(4)`, which `getrandom(2)` points at for the pool itself and which this round did not
  open.

## Tooling

No packages installed, no upgrades performed, no pacman transaction attempted (host-wide pacman
pause in force). All work used tools already present (`node`, `python3`, `bash`, `curl` output
from the scout seats, `mktemp`, `tar`, `sha256sum`).

Report: `.ufo/waves/round-51/w1/ScribeSources.md`
