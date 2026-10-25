# RevS133Quote — round 60, wave 1 (leaf seat, no dispatch)

Axes: **operability + coverage**. Item: re-open https://arxiv.org/abs/2607.14166 live on
2026-10-24, locate the S133 located-quote sentence, report the page's byte size and sha256,
and check whether the page carries the `215 of 1,200` figure and where it does or does not
appear. Scratch: `/tmp/kumitate-r60/RevS133Quote/` (page.html, page2.html). No lane tree
writes outside this report.

## Verdict

**CORROBORATED** — the live page matches every S133 claim re-executed today: byte size,
sha256, the located quote, and the `215 of 1,200` figure. No falsification found. One
formatting variance is recorded (SOURCES.md cell writes `1200`, page writes `1,200`).

## What was run (verbatim commands and output)

Fetch 1 and measurement:

```
$ curl -sL -o page.html -w 'http_code=%{http_code} size_download=%{size_download} url_effective=%{url_effective}\n' 'https://arxiv.org/abs/2607.14166'
http_code=200 size_download=44487 url_effective=https://arxiv.org/abs/2607.14166
$ wc -c page.html
44487 page.html
$ sha256sum page.html
7608aabc7542ba6b856f7ac1ff79206b5adbd3adbf8033036d7e3964f69d42ef  page.html
```

Stability control — independent second fetch, byte-compared:

```
$ curl -sL -o page2.html 'https://arxiv.org/abs/2607.14166'
$ wc -c page2.html
44487 page2.html
$ sha256sum page2.html
7608aabc7542ba6b856f7ac1ff79206b5adbd3adbf8033036d7e3964f69d42ef  page2.html
$ cmp -s page.html page2.html && echo 'IDENTICAL' || echo 'DIFFERS'
IDENTICAL
```

Quote and figure searches on the fetched bytes:

```
$ grep -c 'This contract holds on none of six widely used open-source frameworks' page.html
3
$ grep -c '215' page.html
3
$ grep -c '1,200' page.html
3
```

## Finding 1 — byte size and sha256 re-executed and matching

- Live 2026-10-24: HTTP 200, **44487 bytes**, sha256
  `7608aabc7542ba6b856f7ac1ff79206b5adbd3adbf8033036d7e3964f69d42ef`.
- Equals `corpus/SOURCES.md:142` S133 evidence cell ("arXiv abs page read 2026-10-24,
  HTTP 200, 44487 bytes, sha256 7608aabc…69d42ef") and the entry receipt
  `corpus/knowledge/durable-execution-failure-detection.md:11`
  (`.ufo/waves/round-60/build/ScoutArxivStopMeansStop/body.html@sha256:7608aabc…69d42ef`).
- The second fetch returning byte-identical content shows the size/hash is stable across
  fetches today, not a transient snapshot.

## Finding 2 — the located quote is a contiguous substring of the raw bytes

`This contract holds on none of six widely used open-source frameworks.` appears verbatim
(plain ASCII, no HTML entities inside the sentence) **3 times** in `page.html`:

| line | element |
|---|---|
| 30 | `<meta property="og:description" content="…">` |
| 41 | `<meta name="citation_abstract" content="…">` |
| 123 | visible `<blockquote class="abstract mathjax">` (the human-rendered Abstract) |

Word count check: This(1) contract(2) holds(3) on(4) none(5) of(6) six(7) widely(8) used(9)
open-source(10) frameworks.(11) — the entry's "11 words" label is exact. The entry wraps the
quote across two lines (`durable-execution-failure-detection.md:20-21`); the page carries it
contiguously.

## Finding 3 — the `215 of 1,200` figure: where it appears and where it does not

- **Appears** exactly 3 times, all inside the abstract text at the same three locations as
  the quote (lines 30, 41, 123): "…live models driving unmodified frameworks leak
  **215 of 1,200 runs** (P(leak | emitted)=1.00)…". Total `215` occurrences on the page = 3,
  so no other page region carries it.
- **Does not appear** anywhere else on the page: not in the metatable (Comments/Subjects),
  not in title/author metadata, not in any script or comment. A human reader sees the figure
  exactly once — the abstract blockquote (line 123); the other two hits are machine-readable
  meta duplicates of the same abstract string.
- Entry body `durable-execution-failure-detection.md:82` cites "**215 of 1,200 runs**" —
  comma form matches the page byte-for-byte.
- Formatting variance, not a defect: the SOURCES.md S133 takeaway cell
  (`corpus/SOURCES.md:142`) writes "215 of 1200" without the comma. Numerically identical;
  the row cell is a paraphrase, and the pinned entry body carries the page-exact form.

## Bounds

Leaf seat: no subagents dispatched, no jj/git mutation, no writes outside this report and
`/tmp/kumitate-r60/RevS133Quote/`. No installs performed (pacman paused; none needed).
