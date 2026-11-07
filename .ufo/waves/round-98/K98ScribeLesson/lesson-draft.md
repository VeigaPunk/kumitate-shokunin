# round-98 lesson draft — the M98-1 row and QUALITY Q92

Drafted by K98ScribeLesson for the L1 to merge into `corpus/lessons/round-98.md` (`## Mistakes`) and
`corpus/QUALITY.md` (Q92). Deliberately **not** a lesson: no `## Gate`, no verdicts, no `verified-at`;
those are the L1's at integration M. All paths lane-relative
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/…`).

## `## Mistakes` — table row

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M98-1 — a frozen counter's character grid was partial, so six readers that violate the claim's own predicate reached HELD** (r97's `probe97-c1.mjs` draws only `\v`, `\f` and U+00A0 among non-ASCII/odd separators — 4 occurrences each, nothing else; the same "the counter certifies a tuple, not the rule" family as M95-2/M96-2/M97-1, now on the *character-class* axis rather than the clause or identity axis). | `.ufo/waves/round-97/K97CriticA/constructions.md` rows 1–6 (`x-bom-strip`, `x-zwnbsp-trim`, `x-u2003-trim`, `x-zwsp-strip`, `x-u2028-split`, `x-fence-aware`, each `HELD a=1 b=1 c=1 d=1 e=1 f=1`); `.ufo/waves/round-97/K97CriticA/diverge.txt` (each: census `E12=1 rows=0` vs tool `outside=0 rows=1`); grid re-derived in `K98ScribeLesson/receipt-r97-grid.txt` (`grep -oE '\\(u…\|x..\|v\|f)'` → `\f 4`, `\u00a0 4`, `\v 4`); routed item in `corpus/lessons/round-97-verifier-spotcheck.md` §5 item 1. | Q91 (a counter draws its fixture **identities** per run) — it bounded what could be replayed, not which **classes** the counter samples; the r97 grid is a frozen plan constant, so a wrong reader keyed on an undrawn code point is invisible. | The r98 counter draws 32 id-cell pad classes, as lead/trail/both (`probe/probe98-c1.mjs` `PADS`, `:116-123`): 14 named non-ASCII `White_Space` samples (NEL U+0085, NBSP, U+1680, U+2000, U+2002, U+2003, U+2007, U+2009, U+200A, U+202F, U+205F, U+3000, LS U+2028, PS U+2029), the ten ASCII/POSIX shapes (none, SP, 2SP, TAB, SP TAB, TAB SP, VT, FF, CR, TAB FF), the six `Cf` format characters (U+180E, U+200B, U+200C, U+200D, U+2060, U+FEFF) and two mixed pads (SP NBSP, NBSP SP). Shown able to fail: `ctl-zs` (declared 61/22), `ctl-nbsp` (31/22) and `ctl-asciiws` (34/22) read `UNMET` with the surplus drawn from exactly their class (`controls/ctl-{zs,nbsp,asciiws}.txt`); a grid that omits a class cannot separate a reader that accepts only that class (the observed instance is the r97 counter itself: a grid of `\v`/`\f`/U+00A0 let six class-specific readers read HELD), and Q92 makes the drawing a filed criterion. |

## `corpus/QUALITY.md` — Q92 (draft, corpus style)

### Q92 — a frozen counter over a character-class rule draws every class the opposing reader differs on, and the plan lists the drawn classes (round 98)

- **Rule.** When a claim turns on a character class (a regex `\s`/`\d`/`[ \t]`, a locale `blank`/`space`, a
  Unicode `White_Space`/`Zs`/`Cf` class), the frozen counter must draw at least one fixture member of
  **every class on which the two readers differ**, plus the boundary classes that both readers refuse
  (so a fix cannot over-accept), and the plan text must name each drawn class. For round 98 that is
  POSIX `blank` (space, TAB), POSIX `space` minus `blank` (VT, FF, CR), Unicode `White_Space` outside
  blank (NEL, NBSP, U+1680, U+2000–U+200A, LS, PS, U+202F, U+205F, U+3000), and the `Cf` separators
  (U+180E, U+200B, U+200C, U+200D, U+2060, U+FEFF), each as lead, trail and both padding.
- **Grounding.** M98-1: the round-97 counter drew only `\v`, `\f`, U+00A0 and six wrong readers reached
  `C97_C1: HELD` (`K97CriticA/constructions.md` rows 1–6; `K97CriticA/diverge.txt`; r97 closure §5 item 1;
  grid re-derived in `K98ScribeLesson/receipt-r97-grid.txt`). Q85/Q86 sample the clause axis and Q91 the
  identity axis; no quality rule sampled the *character class* axis.
- **Who checks.** The L1 before the freeze; the closure re-runs it over the filed round.
- **Command.**
  `node .ufo/waves/round-98/K98ScribeLesson/idclass-coverage.mjs .ufo/waves/round-<N>/probe/probe<N>-c1.mjs .ufo/waves/round-<N>/plan.md`
  → `IDCLASS_COVERAGE: CLEAN pads=<n> witnesses=32` exit 0 / `IDCLASS_COVERAGE: MISSING [names…]` or
  `PLAN_MISSING [names…]` exit 1 / `IDCLASS_COVERAGE: NOPADS` exit 2. The checker parses the counter's
  `const PADS = [ … ]` grid, decodes the string literals to code points, and requires one drawn member per
  witness class; the `grep` form is `grep -n 'const PADS' -A 8 .ufo/waves/round-<N>/probe/probe<N>-c1.mjs`.
- **Fails when.** A witness class is absent from the grid; the plan does not name a drawn class; or the
  counter has no `PADS` grid to score (exit 2 — a structural refusal, not a pass).
- **Shown able to fail.** `.ufo/waves/round-98/K98ScribeLesson/receipt-q92-fail.txt` — the same checker on
  a copy of `probe98-c1.mjs` with the NBSP, LS, ZWSP, BOM and EMSP entries removed reads
  `IDCLASS_COVERAGE: MISSING [EMSP ZWSP LS BOM] pads=27`, exit 1 — against
  `receipt-q92-pass.txt` (`CLEAN pads=32 witnesses=32`, exit 0). On the round-97 counter it exits 2
  (`NOPADS`, `receipt-q92-fail-r97.txt`). Round 98's own run is the pass receipt above.
- **Limit.** One drawn member per class, not an enumeration: `probe98-c1.mjs` samples 12 of the 17 `Zs`
  code points (U+2001, U+2004, U+2005, U+2006, U+2008 are absent), so a reader whose class is exactly
  those five would pass; the witness list is a plan constant like the grid it checks (the nonce varies
  identities, not classes — Q91's limit). It checks what the counter *draws*, never that a candidate
  honours the class; the predicate and the differential carry that. A lint, not a registered lane gate.
