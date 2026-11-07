# kumitate round 97 — lesson (`sources-check` reads the registry section as the census does; attempt 1)

Frozen at lane commit `38eb197c17de7ce0dc562539f2f31f41bea037ec`: `.ufo/waves/round-97/plan.md`, counter
`probe/probe97-c1.mjs`, control generator `probe/make-controls97.py`, 17 pre-data controls, `open/` receipts. The
round-96 verifier spot-check was adopted into the README map **before** that freeze (`017bdd74`,
`close-l1/adopt-r96-spotcheck.txt`: DRIFT → CLEAN). Wave spec + validated dispatch `8535793d`. Integration
M = `69fb6943dd0d87165cbb73954a952ce9cb6753ec` (`scripts/sources-check.mjs` sha256 `ccbf1619…`, the K97ExecTool READY
bytes); M2 = `f33786f0354bcda8fdd09f95cee487f14bf4e49c` (sha256 `acccb0d7…`, three selftest arms added, nothing else).
Every receipt below names M or M2 by these two hashes only (r96 closure routed item 1).

Claim C1 operability (lowest non-retired axis, integer 9 terminal): `runCheck` read sections with JavaScript string
tools — `split(/\r?\n/)`, `^## (.+?)\s*$`, `\s` trim, `^#(?:\s|$)` — and so read four heading classes differently from
the census `row_pass`: `## Registry\r` inside (census E12), `##<TAB>Registry` / `##  Registry` outside (census
inside), `## Registry<VT|FF|NBSP>` inside (census E12), a bare `#` clearing the section (census keeps it). Frozen rule
R97: the section state is computed from `sourceText.split('\n')` (CR kept) with the census grammar (`^ {0,3}##[ \t]`,
`[ \t]`-only trim, exact `Registry`, `^ {0,3}#[ \t]` clears, starts outside); rows and per-row checks unchanged.

## Gate

- **admit — `scripts/sources-check.mjs` R97 (M `ccbf1619…`, M2 `acccb0d7…`).** K97ExecTool built it (READY
  `ccbf1619…`, selftest 46 → 68, `C97_C1: HELD` ×2 in `K97ExecTool/score{1,2}.txt`, arm teeth 15/15 in
  `K97ExecTool/arm-teeth.txt`). K97Reviewer hand-checked 30 cases against the live census and the diff line by line
  (no blocker; the section block is textually the r96 `round-gate` rule). K97CriticC: H97 SURVIVES 1 274/1 274
  (76 historical blobs, 21 sibling registries, 600 seeded mutations, 480 stress cases; BASE 1 143/1 274), and the
  candidate's JSON equals the L1 reference on every case. K97Mutation: 28 mutants, 21 killed by selftest, 3
  counter-only (m18/m19/m25), 4 argued equivalent. L1 integration: M2 adds arms `r97sec-4space-h2-inside`,
  `r97sec-4space-h1-inside`, `r97sec-trail-space-tab` (selftest 71/71), and the three counter-only mutants now fail
  the selftest (`close-l1/m2-teeth.txt`, 3/3). Re-mutation of the shipped M2 bytes with all 15 violating section
  shapes: **15/15 killed**, reference block 71/71 PASS (`close-l1/integration-remut.txt`).
- **admit — S276** (ECMAScript 2025 Language Specification, ECMA-262, https://tc39.es/ecma262/2025/), opened
  2026-11-07 (UTC) by K97ScribeSources (`K97ScribeSources/quotes.md`, HTTP 200, body sha256 `c1f9a159…`) and
  re-opened by the L1 (`close-l1/l1-open-ecma262.txt`, same sha256, both quotes FOUND after tag strip and whitespace
  collapse; the row's byte offsets 4977578, 5262464, 2402224 re-read with `dd`). Quote (§22.2.2.9 CompileToCharSet,
  `CharacterClassEscape :: s`, 21 words): "Return the CharSet containing all characters corresponding to a code point on the right-hand side of the WhiteSpace or LineTerminator productions."
  Second located quote (§22.1.3.32.1 TrimString, 12 words): "The definition of white space is the union of WhiteSpace and LineTerminator."
  It grounds why BASE's `\s`, `.trim()` and `/\r?\n/` accept CR, VT, FF and NBSP where the census `[ \t]` keeps them
  in the heading text.
- **admit — QUALITY Q91** (a frozen counter draws its fixture identities per run and prints the seed): shown able
  to fail by K97CriticA's `x-replay` (no section reader; answers from a table copied out of one counter run):
  own seed `0f8f19a3…` **HELD**, fresh seed **UNMET** with the same bytes (`K97CriticA/run-x-replay-seed0f8f19a3532ed236.txt`,
  `K97CriticA/run-x-replay.txt`); on the fixed-identity r96 counter the same class (`hardcode-fixtures`) read HELD
  (`.ufo/waves/round-96/K96CriticA/receipts/hardcode-fixtures.txt`).
- **reject — a JavaScript-native or CommonMark-aware section reader** (S276 / S275): it accepts rows the census calls
  E12 (`## Registry\r`, `## Registry<VT>`, `## Registry ##`, a `## ` inside a fence) and refuses rows the census
  accepts (`##<TAB>Registry`). Flip: the census adopts those heading classes.
- **reject — "C97_C1: HELD certifies R97"** (K97CriticA): six wrong readers reach HELD — `x-bom-strip`,
  `x-zwnbsp-trim`, `x-u2003-trim`, `x-zwsp-strip`, `x-u2028-split`, `x-fence-aware` — each on a minimal input the
  census reads differently (`K97CriticA/diverge.txt`), because the battery's class grid draws none of U+FEFF,
  U+2003, U+200B, U+2028 or a fence. The frozen verdict stands (counter, predicate and controls unchanged, K4); the
  shipped bytes rest on R97 by construction (section block byte-identical to `ctl-positive`, K97CriticC), the
  selftest arms and the differential, not on the counter alone. Flip: a counter whose grid draws every Unicode
  `White_Space`/`Zs`/`Cf` class and fences (routed to round 98).

### Rows touched (old → new)

- New: S276 (status `mined`, recheck `on-release`, used-by `corpus/knowledge/sources-check-registry-section.md`),
  URL https://tc39.es/ecma262/2025/.
- No existing row's `status`, `recheck` or `used-by` changed.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M97-1 — the frozen counter was keyed on fixed fixture identities, so a tool that replays the counter's own fixture text reached HELD** (rounds 94–96 counters: no seed, no entropy source; r96 `hardcode-fixtures` HELD with selftest 89/89; fourth round of the class M94/M95/M96-2). | `.ufo/waves/round-96/K96CriticA/constructions.md` (`hardcode-fixtures`); `.ufo/waves/round-96/K96CriticA/receipts/hardcode-fixtures.txt`; `.ufo/waves/round-96/close-l1/integration-remut.txt` (30/31, the survivor) | Q85/Q86 (class sampling) — they sampled the clause axis and never input identity | Nonce counter: `probe97-c1.mjs` draws ids, URLs, titles and case order per run (`randomBytes(8)`), prints `seed=`, `--seed` replays; battery derived from the census grammar's classes. Shown able to fail: `x-replay` HELD on its own seed, UNMET on a fresh seed (K97CriticA). Criterion QUALITY Q91. |
| **M97-2 — the L1's own re-mutation helper read the "base" bytes from the lane working tree after integration**, so every block it built carried a duplicate `const rawLines` and every mutant — and the reference block — "failed" for a syntax error: a 15/15 kill that killed nothing. | `.ufo/waves/round-97/close-l1/integration-remut-run1-invalid.txt` (`positive: FAIL exit=1 ? failing=[]`, every row `?` with no failing arm) | the helper's own positive control (`positive` must PASS) — it fired, and the run was discarded, not cited | `remut97.py` reads BASE from `git show 477afff7:scripts/sources-check.mjs`; re-run on M2: reference block 71/71 PASS, 15/15 killed with named failing arms (`close-l1/integration-remut.txt`). A kill count is cited only beside a passing reference row. |

Sweep for r96 routed item 1 (one name for M): `K97ScribeLesson/receipts-r96-m-name-sweep.txt` re-derives the r96
label mismatch (`q88-r96.txt` `M=4a57390d` vs lesson M `09de6791`, identical gate bytes); this round names M and M2
once each, above.

Misroot sweep (`git -C /home/vgpnk/Projects/shokunin status --porcelain` before the report): receipt
`close-l1/misroot-sweep.txt`.

## Verdicts

- C1 frozen predicate at M: `C97_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1 tool_sha256=ccbf1619…` twice
  (`.ufo/waves/round-97/close/probe1.txt` seed `a6f338762be2947d`, `probe2.txt` seed `271b1d2d0ded31b9`); at M2
  (the final bytes): the same line with `tool_sha256=acccb0d7…` twice (`close/probe-m2-1.txt` seed
  `e149590328839e0d`, `probe-m2-2.txt` seed `ef231a18f609b4a1`). Do-nothing control `UNMET a=0/1 b=0/1 c=0/1 d=1/1
  e=1/1 f=1/1` (738 / 5 220 / 2 999 disagreeing cases); 15 one-clause controls UNMET; positive control HELD
  (`controls/`). K4: plan/probe/controls/open unchanged since the freeze.
- Framing (K97CriticB, *sound — real move, two named limits*): 13 of 15 588 historical `SOURCES.md` blobs across 21
  lanes read differently under BASE and the census, all whole-file CRLF from Windows text-mode writes in six sibling
  lanes (2026-11-01..04); on kagi blob `4bbc021b9fa2` the census prints 52 E12 / 0 rows where BASE read CLEAN with 52
  rows. Kumitate: 0 of 819 blobs — for this lane the move is prospective.

## Routed to round 98

1. Counter grid (K97CriticA): draw Unicode `White_Space`, `Zs`, `Cf` (U+FEFF, U+200B), U+2028/U+2029 and fenced
   headings into the battery so the six HELD constructions read UNMET.
2. Census row-count definition (K97CriticC): census `rows` counts every table row inside the Registry, the lane tool
   counts only `S[0-9]{3,}` ids — 5 row-definition probes disagree for BASE and R97 alike; no real registry exposes it.
3. Row-id class: `round-gate` `SOURCES_ROW_RE` accepts `\s` padding (13/13 pad classes) where `sources-check` and the
   census accept `[ \t]` (5/13) (K97Connector) — r96 routed item 4, now measured.
4. Sibling transfer (K97Connector): 9 tools in kumitate, kake and tabi read SOURCES sections with a reader that
   departs from the census grammar — reported, never edited.
5. Carried: M93-3 counter repair, M93-5 `--close` probe-receipt requirement, R93-D1 redaction, F93 fixtures; the
   census gawk/bash `\r` disagreement (L0, `kumitate | round-96`).

## Assimilation

None this round (no `merge/kumitate/` theme fits a section reader). considerthese: not mined this round (latest
`considerthese/2026-11-06.md` left for a later round; no proposal fits C1).
