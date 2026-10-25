# RevS126Quote — live re-fetch of S126/S117 (Temporal “Detecting Activity Failures”)

Round 60 · wave v1 · seat `RevS126Quote` (reviewer, leaf — no dispatch) · 2026-10-24
Work commit `a745a3b0e02253e722834ef95042d97ed92e5e53` · base `ffbfe3cc38ff8eaa6375550b16472c90a006a179`
Axes: **operability** (re-ran the captures' provenance myself, byte-exact outputs quoted below) ·
**coverage** (S117/S126 duplicate-URL group is a D60 F5 surface; this attack probes F4/F5 evidence).

**Named item.** Attack the claim that the two Temporal captures — S117
(`.ufo/waves/round-57/build/ScoutTemporalHb/temporal-activity-failures.html`) and S126
(`.ufo/waves/round-60/build/ScoutTemporalDetect/body.html`) — are byte-identical, by re-opening
https://docs.temporal.io/encyclopedia/detecting-activity-failures live and comparing bytes.
A report is not a verdict; every output below is what the command printed on this run.

## 1. Live fetch (ran this seat, 2026-10-24)

```
$ curl -sS --max-time 60 -H 'Accept-Encoding: identity' \
    -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) kumitate-r60-reverify' \
    -D live-headers.txt -o live.html \
    'https://docs.temporal.io/encyclopedia/detecting-activity-failures'
$ echo "curl exit=$?"          → curl exit=0
$ ls -l live.html              → -rw-r--r-- 1 vgpnk vgpnk 80679 Oct 24 23:23 live.html
```

Response headers (verbatim, scratch `/tmp/kumitate-r60/RevS126Quote/live-headers.txt`):

```
HTTP/2 200
content-type: text/html; charset=utf-8
content-length: 80679
date: Sun, 25 Oct 2026 02:23:43 GMT
last-modified: Sat, 24 Oct 2026 12:11:25 GMT
etag: "0c974d32eef9a1090e383e03488ad6d9"
age: 51138
x-vercel-cache: HIT
server: Vercel
vary: Accept, Accept-Encoding
```

`Accept-Encoding: identity` was forced, so the 80679 on-disk bytes are the decompressed body,
comparable to the lane captures. Live body:

```
$ sha256sum live.html   → c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50  live.html
$ wc -c < live.html     → 80679
```

## 2. Target sentence located in the live page

Sentence `The Temporal Server doesn't detect failures when a Worker loses communication with the
Server or crashes.` — apostrophe is a straight U+0027 (curly `’` and HTML-entity forms: 0 hits).
Locator (python3 stdlib, scratch script) printed for `live.html`:

```
   straight: count=2 first_offset=46257
   raw bytes: b"The Temporal Server doesn't detect failures when a Worker loses communication with the Server or crashes."
   curly: count=0 first_offset=-1
   entity: count=0 first_offset=-1
   regex hit at byte 46261: b"Temporal Server doesn't detect ... crashes.\nTherefore,"
   regex hit at byte 53449: (same sentence, second occurrence)
```

Live page: **80679 bytes, sha256 `c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50`**,
sentence present twice, at byte offsets **46257** and **53449**, each followed by `\nTherefore,`.

## 3. The two lane captures, hashed and byte-compared (ran this seat)

```
$ sha256sum .ufo/waves/round-60/build/ScoutTemporalDetect/body.html
c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50  .../round-60/build/ScoutTemporalDetect/body.html
$ wc -c < .ufo/waves/round-60/build/ScoutTemporalDetect/body.html
80679

$ sha256sum .ufo/waves/round-57/build/ScoutTemporalHb/temporal-activity-failures.html
c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50  .../round-57/build/ScoutTemporalHb/temporal-activity-failures.html
$ wc -c < .ufo/waves/round-57/build/ScoutTemporalHb/temporal-activity-failures.html
80679

$ cmp .ufo/waves/round-57/build/ScoutTemporalHb/temporal-activity-failures.html \
      .ufo/waves/round-60/build/ScoutTemporalDetect/body.html && echo "CMP: identical"
CMP: identical

$ cmp live.html .ufo/waves/round-60/build/ScoutTemporalDetect/body.html && echo "CMP: identical"
CMP: identical
```

The sentence sits at the **same offsets (46257, 53449) with the same raw bytes** in both captures
and in the live page (locator run on all three files; outputs identical line-for-line).

## 4. Recorded values vs. measured

| surface | recorded | measured this seat | match |
|---|---|---|---|
| S126 pin, `.ufo/pins/source-captures.json` | `c7f7c401…db50`, 80679 B, captured 2026-10-24 | 80679 B, `c7f7c401…db50` | yes |
| S117 pin, `.ufo/pins/source-captures.json` | `c7f7c401…db50`, 80679 B, captured 2026-10-24 | 80679 B, `c7f7c401…db50` (hashed the round-57 file directly, not via the r60 copy) | yes |
| `corpus/SOURCES.md:130` (S117 row) | “fetched 2026-10-24, HTTP 200, 80,679 bytes, body sha256 c7f7c401…db50” | same digest/size, HTTP 200 today | yes |
| `corpus/SOURCES.md:140` (S126 row) | “HTTP 200, 80679 bytes, body sha256 c7f7c401…db50 … (duplicate group pinned in `.ufo/pins/source-dupes.json`, byte-identical capture)” | same digest/size; `cmp` proves byte-identical | yes |
| `corpus/knowledge/durable-execution-failure-detection.md:15` | located quote: “The Temporal Server doesn't detect failures when a Worker …” | byte-present in live page and both captures, straight apostrophe, 2× each | yes |

## 5. Attack outcome — claim survives; CORROBORATED, not falsified

Three independent vectors, all failed to break identity:

1. Digest: live page, r60 capture, r57 capture all hash to `c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50`.
2. Full-file `cmp`: r57-vs-r60 identical; live-vs-r60 identical (so live-vs-r57 identical by transitivity of equality, and directly consistent — same size, same digest).
3. Sentence-level: same straight-apostrophe sentence at identical byte offsets in all three artifacts — no reordering, no whitespace or entity drift.

No defect found. The recorded S117-row sha256 equals the bytes on disk and the live edge object.

**Scope of the corroboration (stated, not hedged):** the edge object served today is cached
(`x-vercel-cache: HIT`, `age: 51138`, `last-modified: Sat, 24 Oct 2026 12:11:25 GMT`) — the same
CDN object the lane captured earlier on 2026-10-24, so byte-identity across these fetches is the
expected result of a same-day unchanged object; it does not attest the page's history before
`last-modified`. Identity was proven between the three named artifacts and the live bytes as
served at fetch time (response `date: Sun, 25 Oct 2026 02:23:43 GMT` = 2026-10-24 ~23:23 host time).

## 6. Boundaries observed

Read-only inside the lane except this report; scratch confined to `/tmp/kumitate-r60/RevS126Quote/`
(`live.html`, `live-headers.txt`, locator output). No git/jj mutation, no commit, no push, no
subagent dispatch, no pacman, no install. Fleet repo, sibling lanes, and `/home/vgpnk/Projects/shokuknow`
untouched. All commands quoted above were executed by this seat during this round.

Report: .ufo/waves/round-60/w1/RevS126Quote.md
