# K85Sentinel — C85_C1 v2 adversarial boundary review (round 85)

Seat: **K85Sentinel** (leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Role: lane-author advice only. No production edits, no edits to the frozen plan/probe/controls,
no commits, no installs. This is not the non-author closure.

## What was measured

| Item | Value |
|---|---|
| Frozen lane revision | `9db0c6b5eb9111cfc5581006ba976ca2cd112792` |
| v1 tool measured (read-only) | `scripts/counter-receipt.mjs` sha256 `190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0` |
| v2 semantics measured | L1 reference draft `/fast/scratch/hyaku/kumitate-r85/L1/draft/scripts/counter-receipt.mjs`, sha256 `61e9ba682c552f2dc6b9d19a4d2c9215a810373dccf89053b664c844baef89e0`, copied byte-identical into my scratch and probed there |
| Scratch root | `/fast/scratch/hyaku/kumitate-r85/K85Sentinel/` (deleted before yield; receipts copied to `build/K85Sentinel/receipts/`) |

The integrated tree does not yet contain v2 (it is written in this wave), so v2-only
surfaces (`RECEIPT:`, `SOURCE:`, `--src`) were probed against the L1 reference draft.
Every **v2** finding below was reproduced against those exact bytes; every **v1-inherited**
finding was also reproduced against the frozen revision `9db0c6b5`.

Baseline (draft byte-identical to L1's validated reference):

```
C85_C1: HELD held=20/20                       exit 0   (frozen probe)
CONTENT_VARIATION: HELD held=3/3 distinct_sha=true      exit 0
COUNTER_RECEIPT_SELFTEST: PASS held=56/56               exit 0
```

Frozen controls re-scored with the frozen probe/control (no drift from `controls/*.txt`):

```
base     probe UNMET held=1/20  exit 1     cv UNMET held=0/3 exit 1
stub     probe UNMET held=0/20  exit 1     cv UNMET held=0/3 exit 1
noreader probe UNMET held=1/20  exit 1     cv UNMET held=0/3 exit 1
```

No control reaches 20/20. **Kill rule not fired by anything in this report.**

---

## Severity-ranked findings

### S1 — HIGH — DEFECT: `--src` site extraction is an unanchored substring match; a non-arm binds a phantom arm and passes

`sitePattern = /arm\(\s*'([a-z0-9][a-z0-9-]*)'/g` matches `arm(` anywhere, including the tail
of an identifier. `disarm('ghost')` is counted as an arm call site.

```
CMD: node /fast/scratch/hyaku/kumitate-r85/K85Sentinel/lane/scripts/counter-receipt.mjs \
       --receipt .../fx/substring-disarm-site.receipt --src .../fx/substring-disarm-site.mjs
SRC: "const ARMS = 1;\ndisarm('ghost');\n"
EXIT: 0
OUT: COUNTER_RECEIPT: CLEAN
     RECEIPT: bytes=32 rows=1 held=1/1 findings=none sha256=d0bc9edd1c1d904e8802ab7bbac11e20f142396e53aa557cc7d62d3cf14e080b
     SOURCE: sites=1 declared=1 receipt=1
```

The receipt claims an arm named `ghost`; no `arm('ghost')` call exists in the source, yet the
`SOURCE:` line is self-consistent and the answer is CLEAN. This is the v2 binding's central
property (a receipt row must correspond to a call site) being satisfied by text that is not a
call site. Contract text says "literal `arm('<name>'` call sites"; `disarm(...)` is not one.

Smallest remediation (textual, no grammar/CLI/output change): anchor the start of the call,
`/(?<![\w$.])arm\(\s*'([a-z0-9][a-z0-9-]*)'/g`. Verified on a hardened copy: frozen probe
`20/20` exit 0, CV `3/3 distinct_sha=true`, selftest `56/56`, and `disarm` now fail-closes
(`FAIL-CLOSED SOURCE_ARMS_EMPTY`, `sites=0`). Minified sources still bind (`sites=3`).

### S2 — HIGH — CONTRACT LIMIT (must be documented): any leading token hides a red row and a contradicting summary; the verdict is grammar-scoped while `RECEIPT:` stays truthful

Arm/summary detection is line-anchored (`/^\S+[ \t]+arm/`, `/^\S+:/`). A row whose first byte is
whitespace, a bullet, a Unicode space, or a metadata prefix is not a row. Compound forgery:

```
RECEIPT BYTES: "X arm a ok\n\tX arm b FAIL\n\tX: UNMET held=0/1\nX: HELD held=1/1\n"
CMD: node .../lane/scripts/counter-receipt.mjs --receipt .../fx/compound-hidden-red-and-summary.receipt
EXIT: 0
OUT: COUNTER_RECEIPT: CLEAN
     RECEIPT: bytes=61 rows=1 held=1/1 findings=none sha256=4e6b595e0f2b4f8fc21e3b003976dc01d94fbbf3cf218fbb2e514e1a0bd9d165
```

The bytes visibly contain `X arm b FAIL` and a contradicting `X: UNMET held=0/1`, and the tool
prints CLEAN. The same result for each prefix (all exit 0, `rows=1 held=1/1 findings=none`):
tab, NBSP (`U+00A0`), ideographic space (`U+3000`), `U+2028`, `U+2029`, `- ` bullet,
`command:`, `rev:`, `exit:`, `note=` (`k=v`). NUL-prefixed (`\x00`) and invalid-UTF-8-prefixed
(`\xFF`) rows fail closed (`ARM_MALFORMED`).

A hidden **second summary** also bypasses the `SUMMARY_COUNT` uniqueness guard:

```
CMD: node ... --receipt .../fx/hidden-second-summary.receipt
EXIT: 0
OUT: COUNTER_RECEIPT: CLEAN
     RECEIPT: bytes=47 rows=1 held=1/1 findings=none sha256=9f15efaa0bdee1c20eba137b8b1574e3473b0393183ea025e6c8baae0f6638c0
```

Inherited from v1, reproduced at the frozen revision:

```
CMD: node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/counter-receipt.mjs --receipt .../fx/{tab-prefixed-FAIL,command-prefixed-FAIL}.receipt
EXIT: 0
OUT: COUNTER_RECEIPT: CLEAN   (both)
```

Call: **contract limit, not a defect of this round.** The frozen grammar defines significance by
line shape; v1's own selftest (`metadata-arm-shape`) asserts `command: X arm red FAIL` costs
CLEAN, so the metadata skip is intended and cannot be narrowed this round without changing the
frozen contract. It must be documented in the instrument and in Q78: the tool is a *consistency
checker over the declared grammar*, not evidence that the file contains no red row. The
`RECEIPT:` line is not forged here — `rows=1`, `held=1/1`, bytes and sha256 are all truthful
about the file and the parse. Only the *criterion* is scoped.

### S3 — HIGH — CONTRACT-TEXT DEFECT: the plan's r84 "real task" sentence is not what the tool can consume

Plan: "r84 `close/history-red.txt` and `close/history-repair.txt` → DRIFT/CLEAN." Those files
are **tool-output transcripts** (`rev=`, `command=`, `COUNTER_RECEIPT: ...`, `exit=`), not arm
transcripts. Running the tool on them literally:

```
CMD: node .../lane/scripts/counter-receipt.mjs --receipt .ufo/waves/round-84/close/history-red.txt
EXIT: 2
OUT: COUNTER_RECEIPT: FAIL-CLOSED SUMMARY_COUNT
     RECEIPT: bytes=224 rows=0 held=-/- findings=SUMMARY_COUNT sha256=78729d6f4001c6021853ef2fe5654f972f77ce46c49b5f431f1f916e4c05c7b9

CMD: node ... --receipt .ufo/waves/round-84/close/history-repair.txt
EXIT: 2
OUT: COUNTER_RECEIPT: FAIL-CLOSED SUMMARY_COUNT
     RECEIPT: bytes=214 rows=0 held=-/- findings=SUMMARY_COUNT sha256=1878cabc56e8fe2153ad79b193beb1eb393da9e85f67efd7cb02bf75d8b1e5e0
```

The intended reading — the r84 files *record* the answer for the r83 receipts named in their
`command=` lines — is satisfied, and I verified it:

```
r83 close/c1-probe.txt   → DRIFT ARMS_TOTAL  exit 1  rows=28 held=27/27  bytes=5573
r83 close/c1-repair.txt  → CLEAN             exit 0  rows=28 held=28/28  bytes=5729
r83 close/c2-probe.txt   → CLEAN             exit 0  rows=16 held=16/16  bytes=2678
```

Call: **contract-text defect (plan wording), not a tool defect.** As written, a reviewer who
executes the sentence literally scores the real task red. L1 should fix the report sentence
("the recorded answers in r84 history-*.txt point at …") and must not re-scope the predicate.
No predicate change required.

### S4 — MEDIUM — DEFECT: no liveness and no size bound; a FIFO blocks forever, a device exhausts memory

```
CMD: timeout 5 node .../lane/scripts/counter-receipt.mjs --receipt /fast/scratch/hyaku/kumitate-r85/K85Sentinel/fifo-receipt
EXIT: 124 ms=5002 OUT: (empty)

CMD: timeout 5 node .../lane/scripts/counter-receipt.mjs --receipt .../fx/clean.receipt --src .../fifo-src
EXIT: 124 ms=5003 OUT: (empty)

CMD: ( ulimit -v 1048576; timeout 10 node .../lane/scripts/counter-receipt.mjs --receipt /dev/zero )
EXIT: 133 ms=108   (SIGTRAP, node aborted / core dumped)
```

`readFileSync` on a FIFO with no writer blocks in `open(2)`; `/dev/zero` never reaches EOF and
the Buffer grows until the address-space cap. A lane that points the checker at a path taken
from a transcript can hang or OOM the host. v1 at the frozen revision blocks identically
(`timeout 5 … --receipt <fifo>` → exit 124, 5002 ms, 0 stdout bytes), so this is inherited, but
v2 adds a second such read (`--src`).

Smallest remediation: gate both reads with `statSync(path).isFile()` and fail closed
(`RECEIPT_UNREADABLE` / `SOURCE_UNREADABLE`) for directories, FIFOs and devices. Verified as a
design: all 20 arms and all 56 selftest cases use regular files, so the probe stays green.

### S5 — MEDIUM — DEFECT: `declaredPattern` has no numeric boundary; non-decimal literals are misparsed

`declaredPattern = /^[ \t]*(?:const|let|var)[ \t]+ARMS[ \t]*=[ \t]*([0-9]+)[ \t]*;?/gm`
matches a decimal *prefix* of any literal.

```
CMD: node ... --receipt .../fx/hex-declared.receipt --src .../fx/hex-declared.mjs
SRC: "const ARMS = 0x1;\narm('a', () => {});\n"
EXIT: 1
OUT: COUNTER_RECEIPT: DRIFT SOURCE_DECLARED
     SOURCE: sites=1 declared=0 receipt=1        ← false red

CMD: node ... --receipt .../fx/exp-declared.receipt --src .../fx/exp-declared.mjs
SRC: "const ARMS = 1e3;\narm('a', () => {});\n"
EXIT: 0
OUT: COUNTER_RECEIPT: CLEAN
     SOURCE: sites=1 declared=1 receipt=1        ← declared 1000 read as 1

CMD: node ... --receipt .../fx/fraction-declared.receipt --src .../fx/fraction-declared.mjs
SRC: "const ARMS = 3.5;\narm('a')…; arm('b')…; arm('c')…;"
EXIT: 0
OUT: COUNTER_RECEIPT: CLEAN
     SOURCE: sites=3 declared=3 receipt=3        ← 3.5 read as 3
```

Partial remediation: add a boundary lookahead, `([0-9]+)(?![0-9A-Za-z_.])`. Verified: `0x1`
becomes `declared=absent` (CLEAN), `1e3`/`3.5` become absent, probe 20/20 / CV 3/3 / selftest
56/56 stay green. **Residual contract limit:** with the boundary fix a non-decimal literal is
ignored rather than flagged, so `SOURCE_DECLARED` remains satisfiable by writing `1e3`; closing
that needs a token the frozen output grammar does not have (`declared=invalid`) or an explicit
rule that a non-decimal `ARMS` literal is `SOURCE_DECLARED` drift. Report as documented limit;
do not re-scope mid-round.

### S6 — MEDIUM — CONTRACT LIMIT: the `--src` binding is textual, not AST; comments and strings bind phantom arms, and force false reds

```
CMD: node ... --receipt .../fx/comment-site-phantom.receipt --src .../fx/comment-site-phantom.mjs
SRC: "const ARMS = 3;\n// arm('ghost', () => {});\narm('a', () => {});\narm('b', () => {});\n"
EXIT: 0
OUT: COUNTER_RECEIPT: CLEAN
     SOURCE: sites=3 declared=3 receipt=3          ← ghost bound from a comment

CMD: node ... --receipt .../fx/string-site-phantom.receipt --src .../fx/string-site-phantom.mjs
SRC: "const ARMS = 1;\nconst help = \"arm('ghost', () => {})\";\n"
EXIT: 0
OUT: COUNTER_RECEIPT: CLEAN
     SOURCE: sites=1 declared=1 receipt=1          ← ghost bound from a string
```

Opposite direction, a commented/string declaration after the real one flips a clean source red:

```
CMD: node ... --receipt .../fx/block-comment-declared-after-real.receipt --src .../fx/block-comment-declared-after-real.mjs
EXIT: 1
OUT: COUNTER_RECEIPT: DRIFT SOURCE_DECLARED
     SOURCE: sites=1 declared=9 receipt=1
```

(`string-declared-after-real` behaves identically: `declared=9`.) This is fail-closed, so it is
safe but can be used to force a red on an unchanged source.

Call: **contract limit — document.** The contract specifies textual extraction ("literal
`arm('<name>'` call sites", "the last `const|let|var ARMS = <int>`"); a comment/string stripper
(or a lexer) changes extraction semantics more than a one-line anchor and is out of scope this
round. The positive direction (phantom green) is the one that matters for claim integrity: the
binding proves *textual co-occurrence in the submitted source*, not that the arm runs.

### S7 — LOW/MEDIUM — PREDICATE-STRENGTH LIMIT: 20/20 is satisfiable without parsing; CV is the real read-dependence discriminator

A 20-line table keyed on the fixture **basename**, plus a real `readFileSync` only to fill
`bytes=`/`sha256=`, and `--src` answers keyed by name, scores the frozen predicate:

```
CMD: node .../probe/probe85-c1.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Sentinel/lane-cheat --work ...
EXIT: 0
OUT: C85_C1: HELD held=20/20

CMD: node .../controls/content-variation.mjs --lane .../lane-cheat --work ...
EXIT: 1
OUT: CONTENT_VARIATION: UNMET held=0/3 distinct_sha=true
```

The tool read the bytes (the three CV sha256 values are real and distinct) but never parsed
them; the verdict came from the filename. So the 20-case table alone does not establish
"the answer depends on bytes it read". The same-path content-variation control does, and the
kill rule already requires it (3/3 with distinct sha256), which is why the round's evidence
stands. No change: the probe is frozen; this belongs in the report as the reason CV, not the
20/20 headline, is the anti-vacuity control (and why randomizing fixture basenames would be a
future hardening, not a re-scope).

### S8 — LOW — CONTRACT LIMIT: the `SOURCE:` line carries no digest, so the source half of the answer is unauditable

Two different source bodies with the same site names produce byte-identical output:

```
CMD: node ... --receipt .../fx/same-out-A.receipt --src .../fx/same-out-A.mjs
EXIT: 0
OUT: COUNTER_RECEIPT: CLEAN | RECEIPT: bytes=28 rows=1 held=1/1 findings=none sha256=2fce18a4… | SOURCE: sites=1 declared=1 receipt=1

CMD: node ... --receipt .../fx/same-out-B.receipt --src .../fx/same-out-B.mjs
EXIT: 0
OUT: (identical three lines)
```

`--src A.mjs` and `--src B.mjs` (different function bodies) are indistinguishable in the output.
Call: **contract limit** — the frozen `SOURCE:` shape has no source sha256; recommend a v3
`SOURCE: … sha256=<hex>` so the binding is reproducible. Do not change v2.

### S9 — LOW — SPEC GAPS / documented behaviour (no change this round)

Observed and coherent, but outside the documented `SOURCE:` shape or usage line:

- Unreadable `--src` prints `SOURCE: sites=- declared=- receipt=2`, while the contract says
  `declared=<n|absent>`; `-` is unspecified.
- `--src` before `--receipt` is accepted: `node tool --src s.mjs --receipt r.txt` → CLEAN exit 0.
  The usage line implies an order; the parser is order-insensitive (benign extension).
- Flag-like paths: a receipt literally named `--receipt` is unreachable bare
  (`--receipt --receipt` → USAGE 64) and reachable as `./--receipt` (CLEAN exit 0). Same for
  `--src`.
- `-` is not stdin: `--receipt -` → `RECEIPT_UNREADABLE` exit 2.
- `held=` mirrors the receipt's claimed summary, not a recount: `held-drift` prints
  `held=1/2` with two ok arms (matches the frozen probe, but readers should not treat it as the
  tool's count). `rows=` is the parsed-arm count, not physical rows (`malformed-arm` → `rows=0`).
- Fail-closed false reds from textual extraction: `arm("a")` (double quotes), `arm ('a')` (space
  before paren), `arm('A')` (uppercase), `const ARMS = 0x1` → `SOURCE_ARMS_EMPTY` /
  `SOURCE_DECLARED` as shown; all exit 2/1, none green.
- CLI hardening is otherwise tight: `--receipt --src`, duplicated `--receipt`/`--src`, `--src`
  without `--receipt`, trailing `--src` with no value, unknown flags, directory receipt and
  directory source all return USAGE 64 or the documented fail-closed token.

---

## Can a finding be forged while the derived line stays truthful?

- **The `findings=` token cannot be forged.** It is the tool's own parse result and is the same
  variable as the verdict; there is no receipt-controlled path to `findings=none` while the
  parse yields a token.
- **The CLEAN verdict can be obtained over bytes that visibly contain a red row and a
  contradicting `UNMET` summary** (S2), with `bytes`, `rows`, `held`, `sha256` all truthful
  about the file and the parse. The derived line is not lying; the criterion is narrower than
  a reader assumes. This is the answer to the "hidden red row" real task: the tool catches rows
  *inside the declared grammar* (r83's c1-probe is caught: `ARMS_TOTAL`, 28 rows, `held=27/27`),
  not rows outside it.
- **`held=` and `rows=` are parse-scoped, not independent recounts** (S9): `held` is the
  receipt's claim; `rows` is the admitted-arm count. Truthful about the parse, not about the
  file as a whole.
- **With `--src`, a phantom site (S1 hard-coded text, S6 comments/strings) lets a receipt claim
  an arm that never ran while `SOURCE:` stays truthful to the extracted text.** This is the
  closest thing to a forged green in the new capability; S1 is textually fixable and should be
  fixed before integration.

## Positive evidence (no finding, recorded so the reviewer does not re-derive it)

- Byte truth: `RECEIPT: bytes=`/`sha256=` match `wc -c`/`sha256sum` exactly on invalid UTF-8
  (`bytes=42`, sha `73670eac…`) and Latin-1 (`bytes=33`, sha `a62170fd…`); invalid UTF-8 in a
  row prefix fail-closes to `ARM_MALFORMED`. The instrument answers on **bytes**, not decoded
  characters.
- Size: 998 915-byte receipt, 10 000 rows → CLEAN in 22.7 ms; 1 048 605-byte single detail →
  19.0 ms; 8 388 657-byte adversarial summary-shaped line → `SUMMARY_COUNT` in 34.6 ms. No
  super-linear regex behaviour; the only size problem is the missing cap on non-regular files
  (S4).
- v1 receipt grammar is preserved: all 16 receipt-only arms plus the four source arms of the
  frozen probe are green; the draft selftest is 56/56; the frozen control scores are unchanged.
- No attributable regression in consumers: the only reference to the tool outside the wave is
  `scripts/proxy-check.mjs:576` (`pin.counter-receipt` file-path pin); nothing parses its stdout,
  so the new second `RECEIPT:` line cannot break a caller. `--selftest` is first-line-only, as
  the contract states.

## Contract limit vs defect — summary

| # | Surface | Call | Action |
|---|---|---|---|
| S1 | `--src` substring `arm(` match (`disarm`) | **DEFECT** | anchor site regex (verified green) |
| S2 | leading token / metadata hides rows; hidden second summary | **LIMIT** | document in instrument + Q78; no re-scope |
| S3 | plan's r84 real-task sentence | **CONTRACT-TEXT DEFECT** | fix report wording; verify via r83 paths |
| S4 | FIFO block / device exhaustion / no size cap | **DEFECT** | `isFile()` gate + fail-closed token |
| S5 | `ARMS` numeric-prefix misparse | **DEFECT** (partial fix) + residual **LIMIT** | boundary lookahead; document `1e3` residual |
| S6 | comments/strings bind sites; commented decl forces red | **LIMIT** | document (lexer = out of scope) |
| S7 | 20/20 label-satisfiable | **LIMIT of predicate** | rely on CV; state in report |
| S8 | no source digest | **LIMIT** | v3 `SOURCE: … sha256=` |
| S9 | spec gaps / documented behaviour | **LIMIT** | document; no change |

## Recommendation to L1 (advisory)

1. Fix S1 (one-line anchoring) before integration; it is a text fix, not a contract change, and
   the frozen probe/CV/selftest stay green on the hardened copy.
2. Fix S4 with an `isFile()` gate on both reads; it is the only way a lane can hang or OOM from
   this tool.
3. Fix S5's boundary lookahead, and document the residual (non-decimal `ARMS` literal is not
   checked).
4. Document S2/S6/S8 as the instrument's declared limits; the claim is a consistency check over
   a grammar, not an oracle — which is exactly the S245 (coverage vs oracle) distinction.
5. Fix the r84 real-task sentence in the round report (S3); do not let a reviewer execute it
   literally and score the claim red.
6. No control reaches 20/20; no attributable regression found; the frozen kill rule is intact.

## Reproducibility

All commands above ran with absolute paths; exit codes and revisions are recorded in
`build/K85Sentinel/receipts/` (`probe-draft`, `cv-draft`, `selftest`, `attack-receipt`,
`attack-src`, `attack-cli`, `forgery`, `real-task`, `v1-probes`, `controls-rescore`,
`probe-cheat`, `cv-cheat`, `probe-fix`, `cv-fix`, `selftest-fix`). Scratch root was deleted
after the receipts were copied; no install was needed or performed; no production file was
touched.
