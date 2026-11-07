# K94ScribeSources — located quotes (round 94, C1 grounding)

Access date for every fetch below: **2026-11-06**. Scratch root
`/fast/scratch/hyaku/kumitate-r94/K94ScribeSources/probe` (removed at yield); every capture cited
here is copied into `captures/` beside this file. All fetches were plain `curl -sS` with no
credentials; bodies are the bytes the server served.

## (a) git `<sha1>` revision entry

- cited URL: `https://git-scm.com/docs/gitrevisions`
- fetch: `curl -sS -o src/gitrevisions.html -w '%{http_code}\n' https://git-scm.com/docs/gitrevisions`
  → **HTTP 200**, 74526 bytes
- body sha256: **60bfaca3907710bdedcfaab0c6d82721b9b317a86ecc11d60d07027bf41a1a54**
  (`captures/gitrevisions.html`)
- derived text rendering: `captures/gitrevisions.txt` (`re.sub('<[^>]+>','')` then
  `html.unescape`, newline-preserving), sha256 **358106e9252fe958e5b97ebd392ce9b4be466705647fc331708577191a5c5556**
- location: § SPECIFYING REVISIONS, `<sha1>` entry; HTML anchor
  `…/gitrevisions.txt-sha1egdae86e1950b1277e545cee180551750029cfe735dae86e`; entry line 2177 of the
  text rendering; the quoted sentence at **rendered text lines 2179-2180** (original HTML wraps it
  across a newline after `, or`)
- quote (byte-exact; the source line break after `or` is rendered as a space):

> The full SHA-1 object name (40-byte hexadecimal string), or a leading substring that is unique within the repository.

- raw HTML fragment as served (proof of byte-exactness):

  `The full SHA-1 object name (40-byte hexadecimal string), or\na leading substring that is unique within the repository.`

- capture drift vs the lane's older capture of the same URL (`.ufo/waves/round-88/open/gitrev.html`,
  S253, sha256 `1ab7124a99e6919e6882be82f77c629ac8fe623bb36af56a749fd4db1919070b`, 74654 bytes): the
  bytes differ, the **text does not** — tag-stripped rendering gives 585 non-empty lines on both, and
  `difflib.unified_diff` between them is empty. The quoted sentence is unchanged since 2026-11-04; the
  differing bytes are page shell only (so a byte-hash recheck of this row must expect `60bfaca3…` on
  this access date, not S253's `1ab7124a…`).
- what it grounds for C1: an abbreviated hex token is repository-relative. It names an object only if
  no *other object in that repository* starts with the same prefix; a token that matches nothing in a
  probed repository is not "a shorter form of something there", so the gate's lane → main → origin
  probe is the right shape and its failure is not by itself a lane error when the pin belongs to an
  upstream the lane merely *cites*.

## (b) GitHub Docs — permanent links (commit id as a URL path segment)

- cited URL: `https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files`
- fetch: `curl -sS -L -o src/gh-permalinks.html -w '%{http_code} %{url_effective}\n' <url>`
  → **HTTP 200**, no redirect (url_effective equals the requested URL), 190680 bytes
- body sha256: **0824dda4c0c8e675ae18dd51c7da96590a381d3a0e92eb6bc8bbf56d3be0efe7**
  (`captures/gh-permalinks.html`)
- prose extraction: the page's own article text, taken from the `"text","value"` nodes of the
  embedded payload in document order → `captures/gh-permalinks.text`, 1729 bytes, sha256
  **35607be8613cd3e4c522a8e864dec31357b4595a50db0cb02f5e81561731c0f3**
- location: § **Press Y to permalink to a file in a specific commit**, **prose line 13** of
  `captures/gh-permalinks.text` (the section's second sentence-run), with the section's worked
  example at **line 15**
- quote (byte-exact; the lead-in clause is omitted and the elision marked outside the quote):

> … put a commit ID. This will permanently link to the exact version of the file in that commit.

- the worked example on the next-but-one line, verbatim:
  `https://github.com/github/codeql/blob/b212af08a6cffbb434f3c8a2795a579e092792fd/README.md`
  (`replaces main with a specific commit ID`, line 17) — the commit id sits **between `blob` and the
  file name**, i.e. in the path segment the branch name occupied.
- what it grounds for C1: the pin is a *complete path segment* of an `http(s)` URL, in the position a
  branch name takes. Splitting a registry URL on `/`, `?`, `#` and matching a segment (prefix of 40
  hex) is therefore the docs' own shape, not a lane invention.
- overlap with the existing registry row **S033** (same page, `2026-10-21`): S033 quotes the
  *preceding* sentence (`the file contents might not be the same when someone looks at it later`) and
  teaches "a per-anchor pin is only meaningful against a commit id, never a branch head". S033 does
  **not** say where in the URL the pin sits. The row below is therefore NOT a duplicate: its scope is
  the URL shape (segment position), S033's is the need for a pin at all. Both rows are kept, and my
  row's `teaches` cell names S033 as the companion fact.

## (c) oh-my-pi `retry-fallback-chains.ts` at the r93 pin (routed defect M93-2)

- pin: `79fa222e8390aed3494f4bc6746814e6c74c21cf`
- path as briefed: `packages/coding-agent/src/config/retry-fallback-chains.ts`
  → `curl -sS -o src/retry-fallback-chains.ts -w '%{http_code}\n' https://raw.githubusercontent.com/can1357/oh-my-pi/79fa222e....../packages/coding-agent/src/config/retry-fallback-chains.ts`
  → **HTTP 404**, body 14 bytes `404: Not Found` (sha256
  d5558cd419c8d46bdc958064cb97f963d1ea793866414c025906ec15033512ed). The briefed path does not exist
  at the pin.
- path discovery: `curl -sS 'https://api.github.com/repos/can1357/oh-my-pi/git/trees/79fa222e...?recursive=1'`
  → **HTTP 200**, `truncated=false`, **11222** tree entries, tree sha = the pin itself. Grep for
  `retry-fallback-chains` yields exactly one blob (mode 100644, git blob `3c8ff9db…`):
  `packages/coding-agent/src/session/retry-fallback-chains.ts`. Receipt:
  `captures/tree-retry-paths.txt` (sha256 1199825007a2de179f2f10356e18fea4d7b7f5e5a5657b9dd5fc225d14724419);
  the full 3.5 MB `tree.json` was scratch-only and is gone with the scratch — its sha256
  `aba98885bfd41dcca965b45fe61bc1d51383724b5600994ffeaf018e1cd6db58` (3516982 bytes), the tree sha,
  the entry count and `truncated=false` are recorded in that receipt.
- real path: `packages/coding-agent/src/session/retry-fallback-chains.ts`
  → `curl -sS -o src/retry-fallback-chains.ts -w '%{http_code}\n' https://raw.githubusercontent.com/can1357/oh-my-pi/79fa222e....../packages/coding-agent/src/session/retry-fallback-chains.ts`
  → **HTTP 200**, 27438 bytes, 673 lines
- body sha256: **b5db529983630ee7e60621478868675dbbe93f149e3cf42eb1aee093a21774fc**
  (`captures/retry-fallback-chains.ts`) — identical to the r93 auxiliary capture recorded in
  `corpus/knowledge/seat-route-retry-fields.md` (`b5db5299…`), so this is the same bytes the r93 seat
  read, now with a registry row.
- location: doc comment **180-184** (`A dynamic role pinned to one model selector with its own
  fallback chain` / `` `session_init` persists it so cold revival restores the same routing the spawn
  installed`); `export interface RetryFallbackRole` **185**; `primary: string` **187** (comment 186);
  `chain: string[]` **189** (comment **188**); `getRetryFallbackRole` **193-198**
- quote (byte-exact, line 188, inside `/** … */`):

> Fallback selectors walked after the primary; empty explicitly disables fallbacks.

- what it grounds: the type S267:14 imports (`RetryFallbackRole`) is one primary selector plus a
  `chain: string[]` where an empty array is a deliberate "no fallbacks", and the role is persisted in
  `session_init` — the field `seat-route` v2 reads as `chain`. Routed defect M93-2 closes: the
  knowledge entry's `chain` paragraph can now cite a registry row instead of an auxiliary capture.

## Refusals

None. All three sources were opened and are usable. One correction to the brief: the (c) path
`packages/coding-agent/src/config/retry-fallback-chains.ts` 404s at the pin; the file lives at
`packages/coding-agent/src/session/retry-fallback-chains.ts` (recorded above).
