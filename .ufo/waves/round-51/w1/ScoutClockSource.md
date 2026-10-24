# ScoutClockSource — S100 clock_gettime(2)

Seat: ScoutClockSource. Lane read-only. Attacked nothing; opened source S100.

## Fetch

| field | value |
|---|---|
| URL | https://man7.org/linux/man-pages/man2/clock_gettime.2.html |
| saved | `.ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html` |
| command | `curl -sS -D headers.txt -o clock-gettime.html` (no `-L`; no redirect) |
| HTTP | **200** `HTTP/1.1 200 OK`; `Content-Type: text/html`; `Content-Length: 30379` |
| `url_effective` | same URL (not redirected) |
| `Last-Modified` | Thu, 08 Oct 2026 17:39:35 GMT |
| `ETag` | `"76ab-65d57b70ec3c0"` |
| `Date` | Sat, 24 Oct 2026 01:59:32 GMT |
| `date -u` at fetch | **2026-10-24T01:59:31Z** (second sample 2026-10-24T02:00:05Z) |
| local `date` | 2026-10-23 23:00:05 -03 (still the 23rd in `-03`) |
| bytes | **30379** (`wc -c` and `size_download`) |
| sha256 | `7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69` |

The item text pre-declared fetch date 2026-10-23. UTC `date -u` and the response `Date` header both read **2026-10-24**. The row below uses the UTC calendar date. `2026-10-23` is also a legal `opened` value against sources-check "on/before today" (UTC today is 2026-10-24); it is the local `-03` date, not the fetch instant.

Headers copy: `.ufo/waves/round-51/build/ScoutClockSource/headers.txt`.

Page identity (observed): `<title>clock_getres(2) - Linux manual page</title>`. Footline: `Linux man-pages 6.19            2026-03-07                clock_getres(2)`. COLOPHON: obtained from tarball `man-pages-6.19.tar.gz` on 2026-09-09. DESCRIPTION (`id="DESCRIPTION"`, HTML line 91) documents `clock_getres`, `clock_gettime`, and `clock_settime`.

## Quote (22 words, verbatim)

Location: **DESCRIPTION**, `CLOCK_MONOTONIC` paragraph, fetched HTML lines 177–179. The `<b>` tags wrap only the clock name; plaintext was confirmed by stripping tags (`quote_in_plain True`, `words 22`).

> The CLOCK_MONOTONIC clock is not affected by discontinuous jumps in the system time (e.g., if the system administrator manually changes the clock)

The sentence does not end there. Lines 179–180 continue: ", but is affected by frequency adjustments."

The page does **not** say `CLOCK_MONOTONIC` is unaffected by NTP. NTP is named under `CLOCK_REALTIME` (HTML lines 125–128 and 133: discontinuous jumps and "frequency adjustments performed by NTP") and under `CLOCK_TAI` (line 154). `CLOCK_MONOTONIC_RAW` (lines 192–195) is the clock "not subject to frequency adjustments." Do not teach NTP immunity from S100.

## Proposed SOURCES.md row

Schema matched to `corpus/SOURCES.md` line 12 and `scripts/sources-check.mjs` (split length 13; `fields[3]=kind`, `[4]=tier`, `[8]=status`, `[9]=opened`, `[10]=recheck`, `[11]=used-by`). No `|` inside cells. Plan C2 / doctrine probe D3 (lines 15–16, 94–98): status `mined`, used-by names the entry.

```
| S100 | Linux man-pages clock_getres(2) (clock_gettime) — https://man7.org/linux/man-pages/man2/clock_gettime.2.html | docs | A | CLOCK_MONOTONIC semantics for invocation-receipt monotonic spans | DESCRIPTION CLOCK_MONOTONIC paragraph, HTML lines 177-179; man-pages 6.19 (page 2026-03-07; tarball man-pages-6.19.tar.gz obtained 2026-09-09); HTTP 200; body sha256 7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69; fetched 2026-10-24T01:59:31Z | CLOCK_MONOTONIC ignores discontinuous system-time steps, so a monotonic span stays ordered when the wall clock is stepped; frequency adjustments still apply. | mined | 2026-10-24 | 180d | corpus/knowledge/invocation-attestation.md |
```

Cells: id S100 · kind docs · tier A · scope as frozen in the item · status mined · opened 2026-10-24 · recheck 180d · used-by `corpus/knowledge/invocation-attestation.md`.

Integration constraint (not a probe defect): that used-by path is not on disk yet. `sources-check.mjs` `USED_BY_MISSING` fires until the entry and this row land in the same rev (D4). D1 also requires the entry's first five lines to cite this URL.

## Finding — frozen D3 indexes (do not edit)

Severity: **blocker** for `DOCTRINE_HELD`. D3 and D4 cannot both pass on a schema-valid row.

`doctrine51-probe.mjs` lines 96–97:

```js
const c = l.split('|').map((x) => x.trim());
return c[1] === id && c[9] === 'mined' && c[12].includes(ENTRY);
```

`sources-check.mjs` lines 261–277 require `fields.length === 13` and read status at `[8]`, opened at `[9]`, used-by at `[11]`. A legal row therefore has `c[8]==='mined'`, `c[9]` an ISO date, `c[11]` the used-by path, and `c[12]===''` (trailing pipe). Observed on a schema-shaped S100 row (`node`, this seat): `fields=13`, probe predicate `false`, while `c[8]==='mined' && c[11].includes(ENTRY)` is true.

A row that put `mined` at `c[9]` fails `OPENED_INVALID`. A row that put the entry at `c[12]` is either length ≠ 13 (`ROW_MALFORMED`) or shifts `opened` off an ISO date. So D3 as frozen rejects every row D4 accepts.

Proposed minimal fix (probe line 97 only), for the L1:

```js
return c[1] === id && c[8] === 'mined' && c[11].includes(ENTRY);
```

No other lane file was edited. No packages installed.
