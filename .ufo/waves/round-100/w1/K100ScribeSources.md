# K100ScribeSources — SOURCES rows for round 100 (C1: the two JS `\s` row readers)

Seat dir (receipts): `.ufo/waves/round-100/K100ScribeSources/`. Lane rev read: HEAD
`2abafa0eb95ac67e98cc898d2c1ebe503d650618`; frozen plan commit `445196e4609b76f23d706403b7bebf1135066952`
is an ancestor (`git merge-base --is-ancestor` → true) and both readers are byte-identical at the two
revs (`scripts/cite-sources.mjs` sha256 `7211be84…`, `scripts/source-capture.mjs` sha256 `39bdeb39…`).
Scratch `/fast/scratch/hyaku/kumitate-r100/K100ScribeSources` (lane HEAD tree via `git archive`, two
MDN bodies, header receipts) removed before yield. No tool installs.

## Behavior

Two registry rows drafted, ids **S280** and **S281**, both `docs` / tier **B** / `mined` /
`2026-11-07` / `on-release` / used-by `corpus/knowledge/row-id-reader-class.md`, in the 11-column
shape of S276–S279 (`row.md`):

- **S280** MDN *Input boundary assertion (`^`, `$`)* — the `m`-flag `^` sentence, the axis that makes
  `source-capture.mjs:157`'s `/gm` a wider *record* rule than the census's: `^` also matches after any
  line-terminator character, so CR / U+2028 / U+2029 inside one LF record start a "row" the census
  (`gawk` default `RS`, S274) never sees.
- **S281** MDN *Lexical grammar* § Line terminators — the closed four-code-point set (U+000A LF,
  U+000D CR, U+2028 LS, U+2029 PS), plus the section's statement that other line-breaking characters
  are white space, which is why the `\s` id-cell pad at `cite-sources.mjs:36` (S276) is wider still.

Both quotes are verbatim, ≤ 25 words, with HTML line + body byte + `wc -w` in `quotes.md`.

**S282 (GNU gawk manual, Records) not drafted.** `www.gnu.org` did not connect on three
`curl --max-time 60` attempts (07:34:32 / 07:35:34 / 07:36:36 UTC; each `curl: (28) Connection timed
out after 60001 milliseconds`, `http=000 bytes=0`). No bytes ⇒ no quote ⇒ no row; logged as
unreachable, not rejected, in `quotes.md` § 3. This matches the plan's open-state record and the r97
search log for the same host. The default-`RS` claim stays carried by S274 and by the census code.

## Gates

| gate | command | result |
|---|---|---|
| census validate on a scratch copy of the lane (draft rows + draft knowledge entry spliced in) | `bash scripts/sources-census.sh validate --file <scratch>/lane/corpus/SOURCES.md --today 2026-11-07` | **exit 0**, `file ok …`, 8 W04 lines — the same 8 as `open/census-before.txt`, no new warning from S280/S281 (`census.txt`) |
| row shape | `gawk -F'\|'` on the two lines | both **NF=13**, id `S280`/`S281`, kind `docs`, tier `B`, status `mined`, used-by as drafted |
| census count delta | `sources-census.sh census --file` pristine vs draft | rows 217→**219**, tier.B 22→**24**, status.mined 175→**177**, `tier.invalid 0`, `status.invalid 0` (`census.txt`) |
| used-by negative control | remove `corpus/knowledge/row-id-reader-class.md` from the copy, re-run validate | `E11 S280 missing used-by …`, `E11 S281 missing used-by …`, exit 1 — the used-by check is live, not vacuous (`census.txt`) |
| draft rows readable by the lane's own readers | `cd <copy> && node scripts/cite-sources.mjs` / `node scripts/source-capture.mjs` | `CITE_SOURCES: CLEAN cited=282` exit 0; `SOURCE_CAPTURE: DRIFT captures=95 exemptions=111 bad=13 first=S269:uncaptured` exit 1, with `note S280:uncaptured` and `note S281:uncaptured` (`readers.txt`) |

Sources opened this round (both HTTP 200, byte-identical to the L1 captures, `cmp` no output):

| page | bytes | sha256 | L1 capture |
|---|---|---|---|
| `…/Regular_expressions/Input_boundary_assertion` | 201815 | `bd32f83a27c733030a65034487515275705dfff99148aa08b14abd5288c5d6c0` | `open/l1-open-mdn-Input_boundary_assertion.html` |
| `…/Reference/Lexical_grammar` | 254916 | `fe8f281332fbe97d491b7869a0b781a4c07a8703c74a281d8a337e76fac1b188` | `open/l1-open-mdn-Lexical_grammar.html` |

Each page was fetched twice (07:33/07:34 and 07:40:21 UTC, `age: 392`/`878`); the second body is
byte-identical to the first, so the captures carry no per-request nonce.

## Touched surfaces

- Written: `.ufo/waves/round-100/K100ScribeSources/{row.md,quotes.md,census.txt,readers.txt,
  knowledge-row-id-reader-class.md,hdr-Input_boundary_assertion.txt,hdr-Lexical_grammar.txt}` and this
  report. Nothing else.
- Lane: **read-only**. `git status` in the lane shows ` M .ufo/pins/source-captures.json` and untracked
  round-100 seat dirs (`K100ExecHarm/`, `K100ExecSection/`, `K100ExecTool/`, `K100Mutation/`) — none of
  them mine; I did not write, stage or commit anything in the lane.
- The census validate ran only against a scratch copy; the lane registry was never the target.

## Findings / hand-off (not judged here)

1. **`corpus/knowledge/row-id-reader-class.md` does not exist at HEAD** (`ls` → no such file), so the
   drafted used-by path is a new file. I wrote a draft at
   `.ufo/waves/round-100/K100ScribeSources/knowledge-row-id-reader-class.md` (source/verified-at/recheck
   header, the three-axis table, the four terminators, limits) and installed it in the scratch copy so
   E11 resolves. If the other scribe seat (plan: "knowledge entry + Mistakes + Q94 draft") lands a
   canonical entry at that path, the two must be reconciled before integration — the rows only need the
   path to exist.
2. **Capture binding is an integration step.** `source-capture` now reports S280/S281 `uncaptured`
   (bad 11→13). The bytes are already committed under `open/`, so the binding is mechanical:
   S280 → `.ufo/waves/round-100/open/l1-open-mdn-Input_boundary_assertion.html`, sha256
   `bd32f83a…`, bytes 201815; S281 → `.ufo/waves/round-100/open/l1-open-mdn-Lexical_grammar.html`,
   sha256 `fe8f2813…`, bytes 254916 (`captured: 2026-11-07`), in the `.ufo/pins/source-captures.json`
   entry shape used by S279.
3. **MDN URL trap.** `…/Reference/Regular_expressions/Lexical_grammar` returns **404** (88379 bytes);
   the page is `…/Reference/Lexical_grammar`. The 404 body was discarded, not cited. The L1 capture was
   taken at the correct URL, which is why the two agree byte for byte.
4. Tier B for both is deliberate: MDN renders ECMA-262, and S276 is the primary clause. Neither URL was
   in the registry before this round (`grep -n 'developer.mozilla.org' corpus/SOURCES.md` → S103 only,
   a different page), so no W04 is added.

## Out of scope

Section scope (`## Registry` only), malformed rows (NF≠13), duplicate ids, file-start BOM, and any
statement about whether a candidate implementation passes the frozen counter — all measured by other
seats this round. The rows record the class, not a verdict.

## Artifacts (sha256)

```
9d69dacbcbeb68ac2e6d0dc4543431c77f11ba03a4b7631b96e75f42cd96e890  row.md
ab53b4d5f84b3736ab3250684b5e5d047871e33a4e7893e552be93028a8e77df  quotes.md
ca7843ca31beab07434e8001bca5583852f41a806da5223ad6182ca4ad2b3116  census.txt
1d9858f1250f0801734fbdbd468a74457880bc0e9db40ed6adb278705a0b5b43  readers.txt
6f5ded72a8c188f2cee70eba8e6a3e5473c0c60c34d280f0b55428b515c2362b  knowledge-row-id-reader-class.md
```
