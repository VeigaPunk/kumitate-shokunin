# ScoutRandomSource — S101 getrandom(2)

Item: open source S101. Read-only fetch. No tools installed. Lane files other than this report and `build/ScoutRandomSource/getrandom.html` were not edited.

## Fetch

| field | value |
|---|---|
| URL | https://man7.org/linux/man-pages/man2/getrandom.2.html |
| command | `curl -sS -D headers -o …/getrandom.html -w …` |
| fetch instant | `2026-10-24T01:59:28Z` (`date -u` immediately before curl; response `Date: Sat, 24 Oct 2026 01:59:29 GMT`) |
| HTTP | 200 (no redirect; `url_effective` is the requested URL) |
| Content-Type | text/html |
| Last-Modified | Thu, 08 Oct 2026 17:39:35 GMT |
| ETag | `"4052-65d57b70ec3c0"` |
| Content-Length | 16466 |
| saved bytes | 16466 (`wc -c` and `stat` agree with Content-Length) |
| sha256 | `366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d` |
| path | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutRandomSource/getrandom.html` |

Page identity (COLOPHON, saved lines 233-236 and footline 243): Linux man-pages 6.19, page date 2026-02-08, HTML obtained from `man-pages-6.19.tar.gz` on 2026-09-09.

The string `CSPRNG` / `csprng` does not occur (count 0). `GRND_NONBLOCK` occurs 7 times. The quote below is what the page actually says about the entropy source, not a CSPRNG label.

## Quote (17 words)

Section **DESCRIPTION**, paragraph 2, saved HTML lines 85-86 (tags stripped; man-page line wrap collapsed to single spaces):

> By default, getrandom() draws entropy from the urandom source (i.e., the same source as the /dev/urandom device).

Word count 17 (`python3` split). Adjacent sentence not quoted (DESCRIPTION paragraph 1, lines 82-83): "These bytes can be used to seed user-space random number generators or for cryptographic purposes." (15 words). That is the cryptographic-use sentence; the chosen quote is the source identity.

## Proposed SOURCES.md row

Contract shape from `scripts/sources-check.mjs` header (`| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`) and `fields.length === 13` with status at split index 8 and used-by at 11. No `|` inside any cell. `recheck` `180d` matches `/^(\d+)d$/`. `opened` is the UTC fetch date `2026-10-24` (the -03 local date was 2026-10-23; UTC is the cell). `used-by` will trip `USED_BY_MISSING` until `corpus/knowledge/invocation-attestation.md` exists; that is sequencing, not a row defect (D4 runs on the extracted tree after the entry lands).

```
| S101 | Linux man-pages getrandom(2) — https://man7.org/linux/man-pages/man2/getrandom.2.html | docs | A | nonce generation for receipt ledgers on Linux | DESCRIPTION paragraph 2; man-pages 6.19 (2026-02-08), HTML from man-pages-6.19.tar.gz rendered 2026-09-09, saved lines 85-86; body sha256 366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d; fetched 2026-10-24T01:59:28Z | getrandom() supplies bytes for cryptographic purposes from the urandom source, the same source as /dev/urandom. | mined | 2026-10-24 | 180d | corpus/knowledge/invocation-attestation.md |
```

Column check: id S101, kind docs, tier A, scope as assigned, anchor leads with section name DESCRIPTION, teaches is the grounded benefit (cryptographic bytes from the urandom source named in the quote; "cryptographic purposes" is the adjacent DESCRIPTION sentence), status mined, opened 2026-10-24, recheck 180d, used-by `corpus/knowledge/invocation-attestation.md`.

## Finding — frozen D3 indexes (do not edit)

Severity: high. A sources-check-clean S100/S101 row cannot pass D3, so `DOCTRINE_HELD` cannot reach 5/5.

Evidence:

- `scripts/sources-check.mjs:261` requires `fields.length === 13`. Lines 273-277 map split index 8 = status, 9 = opened, 10 = recheck, 11 = used-by. Index 12 is the empty field after the trailing `|`. Header at line 518.
- `.ufo/waves/round-51/probe/doctrine51-probe.mjs:97` (rule D51, plan.md lines 89-93) requires `c[1] === id && c[9] === 'mined' && c[12].includes(ENTRY)` with `ENTRY = 'corpus/knowledge/invocation-attestation.md'` (line 33).
- On the row above, `c[8]` is `mined`, `c[9]` is `2026-10-24`, `c[11]` is the entry path, `c[12]` is empty. Against the pre-repair probe, D3 is false. Putting `mined` at index 9 makes `opened` fail `OPENED_INVALID` (`sources-check.mjs:302-304`) and moves status off index 8 (`STATUS_ENUM`). The two checks were mutually exclusive. Comment at probe lines 15-16 stated the intended meaning (status mined, used-by names the entry); the indexes did not implement it.

Proposed minimal fix (L1 only; counter is frozen):

```js
return c[1] === id && c[8] === 'mined' && c[11].includes(ENTRY);
```

## Disposition — freeze repairs (L1)

The D3 index defect above was repaired. Counters on disk at lane HEAD `3ed875d34914560d3e30ee3e80bec7fa9b9e8666` are the repaired bytes. This seat did not re-run either probe; the before-state readings below are the L1's.

- D51: `3ed875d34914560d3e30ee3e80bec7fa9b9e8666` (2026-10-23 23:02:06 -0300), subject `round-51: freeze repair 2 — D51 SOURCES-row column indexes (status c[8], used-by c[11])`. Observed at that commit, `doctrine51-probe.mjs` D3 is `c[1] === id && c[8] === 'mined' && c[11].includes(ENTRY)`, the proposed one-line fix. L1 base re-run: `DOCTRINE_UNMET held=0/5` exit 1. Independently confirmed by ScoutClockSource; recorded as the round's first mined mistake (counter frozen unrun).
- A51: `1fd8acebbd9a9d75896456e1985e752358ec4798` (2026-10-23 23:00:31 -0300), subject `round-51: freeze repair — comment-only fix for A51 block-comment termination (no check semantics changed)`. L1 base re-run: `ATTEST_UNMET held=0/5` exit 1. This seat did not inspect the A51 comment text beyond the commit object.

## Confidence and gaps

- Quote, byte count, sha256, HTTP 200: observed. Confidence high.
- Page does not say "CSPRNG", "kernel CSPRNG", or that Node's `crypto.randomBytes` calls `getrandom`. Those are plan wording (plan.md line 79), not page text. Confidence high that the absence is real (string counts on the saved body).
- Not checked: whether this HTML byte-matches the man-pages-6.19 tarball member. COLOPHON claims that origin; the fetch is the man7.org rendering.
- Not opened: `random(7)` / `urandom(4)`, which the page points at for the pool itself.
