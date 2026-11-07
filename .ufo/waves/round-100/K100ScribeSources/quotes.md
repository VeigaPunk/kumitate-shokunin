# K100ScribeSources — source captures and quotes (round 100)

Seat: `K100ScribeSources`. Date of every fetch below: **2026-11-07** (host clock, UTC).
Scratch: `/fast/scratch/hyaku/kumitate-r100/K100ScribeSources/` (removed before yield; the
citable copies are the lane L1 captures named per item and the receipts under this seat dir).

## 1. MDN — Input boundary assertion (`^`, `$`)

- URL: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion`
- HTTP **200**, `content-type: text/html`, `content-length: 201815`, 201815 bytes, 2269 lines
- sha256 `bd32f83a27c733030a65034487515275705dfff99148aa08b14abd5288c5d6c0`
- `etag: "37f4e90ed9f57503a7cb3c97108e500b"`, `last-modified: Sat, 07 Nov 2026 01:02:03 GMT`
- L1 capture: `.ufo/waves/round-100/open/l1-open-mdn-Input_boundary_assertion.html`
  (201815 bytes, same sha256). `cmp` against this seat's fetch: **no output** → byte-identical.
- Second fetch (headers, 07:40:21 UTC, `age: 392`, `x-cache: MISS, MISS, HIT`): 200, 201815 bytes,
  same sha256, `cmp` against the first fetch: no output. No per-request nonce in the body; the
  page carries no request-scoped token, so two fetches 7 min apart are identical.

**Quote (20 words, `wc -w` = 20):**

> If the m flag is set, ^ also matches if the character to the left is a line terminator character

- Location: § **Description**, HTML line **1642**, body byte **92262**. Rendered sentence, with
  markup removed (`<a href="…/RegExp/multiline"><code>m</code></a>`, `<code>^</code>`,
  `<a href="…/Lexical_grammar#line_terminators">line terminator</a>`); the sentence continues
  "…, and `$` also matches if the character to the right is a line terminator."
- Command: `printf '%s\n' "If the m flag is set, ^ also matches if the character to the left is a line terminator character" | wc -w` → `20`
- Why it matters here: `scripts/source-capture.mjs:157` keeps `/gm`, so `^` matches after any
  line-terminator character — CR, U+2028, U+2029 — inside a single LF record, which is a record
  start the census (`gawk` default `RS`, S274) does not have.

## 2. MDN — Lexical grammar, § Line terminators

- URL: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar`
- HTTP **200**, `content-type: text/html`, `content-length: 254916`, 254916 bytes, 3009 lines
- sha256 `fe8f281332fbe97d491b7869a0b781a4c07a8703c74a281d8a337e76fac1b188`
- `etag: "b9a25307b0d8df806e72ea528a300d70"`, `last-modified: Sat, 07 Nov 2026 01:02:02 GMT`
- L1 capture: `.ufo/waves/round-100/open/l1-open-mdn-Lexical_grammar.html` (254916 bytes, same
  sha256). `cmp`: **no output** → byte-identical.
- Second fetch (07:40:21 UTC, `age: 878`): 200, 254916 bytes, same sha256, `cmp` against the
  first fetch: no output.
- Note on the first attempt: the URL under `Regular_expressions/` returned **404** (88379 bytes).
  The page lives at `Web/JavaScript/Reference/Lexical_grammar`; the 404 body was discarded, not
  cited. The L1 capture was taken at the correct URL, which is why the two agree.

**Quote (13 words, `wc -w` = 13):**

> Only the following Unicode code points are treated as line terminators in ECMAScript.

- Location: § **Line terminators**, HTML line **1727**, body byte **99194**. The next sentence in
  the same paragraph: "Other line breaking characters are treated as white space (for example,
  Line Tabulation, VT, U+000B)."
- Command: `printf '%s\n' "Only the following Unicode code points are treated as line terminators in ECMAScript." | wc -w` → `13`
- The four code points, from the table that follows (HTML lines 1740, 1747, 1754, 1761):

| code point | name | abbreviation |
|---|---|---|
| U+000A | Line Feed | `<LF>` |
| U+000D | Carriage Return | `<CR>` |
| U+2028 | Line Separator | `<LS>` |
| U+2029 | Paragraph Separator | `<PS>` |

- Why it matters here: exactly four code points end a line for `/gm`; the `\s` id-cell pad in
  `scripts/cite-sources.mjs:36` is the wider class (S276: TAB, VT, FF, SP, NBSP, U+FEFF, every
  other Zs, plus those four). The census trims only ASCII SP and TAB (S277).

## 3. GNU gawk manual, Records — UNREACHABLE (retried 3×, not rejected)

Target: `https://www.gnu.org/software/gawk/manual/html_node/Records.html` (default `RS` = newline).

| attempt | started (UTC) | command | result |
|---|---|---|---|
| 1 | 2026-11-07T07:34:32Z | `curl -sS --max-time 60 -o gawk-Records.html <url>` | `curl: (28) Connection timed out after 60001 milliseconds`; `http=000 bytes=0`, curl rc 28 |
| 2 | 2026-11-07T07:35:34Z | same | `curl: (28) Connection timed out after 60001 milliseconds`; `http=000 bytes=0`, rc 28 |
| 3 | 2026-11-07T07:36:36Z | same | `curl: (28) Connection timed out after 60001 milliseconds`; `http=000 bytes=0`, rc 28 |

No bytes were received (`gawk-Records.html` never created), so **no quote and no row**: a row is
written only after opening the source. This matches the plan's open-state record (plan § C1: the
same page failed twice at 04:20–04:23) and the r97 search log (§ GNU awk manual, two pages, same
`curl (28)`). Unreachable is not a rejection; the default-`RS` claim stays carried by S274 (POSIX
awk, tier A) and by the census code itself (`gawk` with no `RS` assignment).

## 4. Provenance of the two readers the rows are about

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, HEAD `2abafa0eb95ac67e98cc898d2c1ebe503d650618`
(`round-100: w1 spec (12 seats) + validated dispatch + read-order check at freeze`); frozen plan
commit `445196e4609b76f23d706403b7bebf1135066952` is an ancestor (`git merge-base --is-ancestor`
→ true). Both readers are byte-identical at the freeze and at HEAD:

| file:line | sha256 (freeze = HEAD = worktree) | reader |
|---|---|---|
| `scripts/cite-sources.mjs` | `7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6` | line 36 `line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/)` |
| `scripts/source-capture.mjs` | `39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5` | line 157 `raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)` |

Command: `git show <rev>:scripts/<file> | sha256sum` for `445196e4` and `HEAD`, plus `sha256sum`
on the worktree files. The lane worktree also carries an unrelated modification
(` M .ufo/pins/source-captures.json`) and untracked round-100 seat dirs; this seat wrote none of
them and touched no lane file.
