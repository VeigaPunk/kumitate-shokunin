# K96Reviewer — C1 review (round 96, hyaku run 15, attempt 1)

Reviewed artifact: `.ufo/waves/round-96/K96ExecTool/round-gate.mjs`
  final bytes on disk, sha256 `9975be54617a9cb943abc680a35ee04977e2c253d6d852d86324fffc497bdb1c`, 120748 B,
  unchanged 22:39→22:56. Base = freeze `617e80cd…:scripts/round-gate.mjs`
  (`aba737dc41ffbed44b486fc27f9375f6c100608c45431a41d95041ad4e5c4da3`, identical to the counter's base_sha256).
  `READY` was still absent when this review closed; the reviewed bytes are what is on disk now.
  Frozen counter run on exactly those bytes — see `score.txt`.

## Counter verdict line (freeze 617e80cd, `--tool cand-9975be54.mjs`)

    C96 census A E12=[S901 S007 S020 S011 S020 S021 S022 S023 S024 S025 S028] E01=[S002] B E12=[S101 S102 S103] E01=[] (= frozen)
    C96 FIX-A exit=1 declared=[okA h3D ind4E nospF reopenH tabP ind3Q] unresolved=17/17 outsideRows=["S901","S007","S020","S011","S020","S021","S022","S023","S024","S025","S028"] malformedRows=["S002"] ok=true
    C96 FIX-B exit=1 declared=[] outsideRows=["S101","S102","S103"] malformedRows=[] ok=true
    C96 TEXT exit=1 outside_lines=1 exact=true malformed_line=true ok=true
    C96 CLOSED nosrc exit=1 outsideRows=[] failclosed exit=2 verdict=FAIL-CLOSED outsideRows=[] ok=true
    C96 reports=79 manifest_sha256=bb78f4f19346430d0f54676b0d70457d913058ac50d1d7217f92bd448991ef86
    C96 SELFTEST exit=0 ROUND_GATE_SELFTEST: 92/92 pass ok=true
    C96 fails=none
    C96_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1 tool_sha256=9975be54…

Receipts: `score.txt` (candidate), `score.ctl-positive-regen.txt` (my own regeneration: generator → `ctlgen/`,
`C96_C1: HELD … f=1/1 tool_sha256=8793e0d9…`, 89/89 — the arm-less reference rule also HELDs).

## Edit points R96 needs (base `617e80cd` lines → final lines) — all present

| # | base | final | change |
|---|---|---|---|
| 1 | :116-140 header | :121-133 | R96 paragraph: section state, outside rows, `citations.outsideRows`, `SOURCES_ROWS_OUTSIDE` line, "printed only when n > 0" |
| 2 | :414 signature | :426 | `declaredPins(sourcesText, malformed = [], outside = [])` |
| 3 | :418 loop head | :429-433 | `let inReg = false`; `^ {0,3}##[ \t]` → `[ \t]`-only trim vs `Registry`, `continue`; then `^ {0,3}#[ \t]` → false, `continue`. Section test is first, before `SOURCES_ROW_RE` and before any field count |
| 4 | :419-420 | :435 | `if (!inReg) { outside.push(fields[1].trim()); continue; }` — outside: declares nothing, no 13-field check, id = field 1 trimmed, push order = file order, repeats kept |
| 5 | :439 | :456 | `outsideRows: []` in `runChecks` citations |
| 6 | :476 | :492 | third argument `citations.outsideRows` at the single lazy read |
| 7 | :731 | :748 | `outsideRows: []` in the fail-closed citations |
| 8 | :808-810 | :827-829 | text line after the malformed line, before the verdict line, gated on `length` |
| 9 | — | :1642-1745 | arms (xxiii) battery / (xxiv) fail-closed key / (xxv) text line |

Only one caller of `declaredPins` exists (:492); no `{...citations}` clone anywhere; tracked mode has no `citations`
object at all, so "every `citations` object" = runChecks + failClosed, both patched. Registry read stays lazy
(`declaredPinsNow` inside the declared step) — `outsideRows` is `[]` when the registry is not read, as R96 requires.

## Fixture hand-check (probe96-c1 FA/FB, computed by hand) — `handcheck-fixtureA.txt`

Line-by-line state walk reproduces the frozen lists exactly:
- `###`/`####`-shaped headings change nothing: `### Sub-band` matches neither `^ {0,3}##[ \t]` (3rd char `#`) nor `^ {0,3}#[ \t]` (2nd char `#`); `.replace(/^ {0,3}##/,'')` only runs after the `##[ \t]` test passes, so the census's `substr(line,3)` is mirrored.
- `    ## Leads` (4 sp) and `##Leads` are not headings → state unchanged; fence content is literal to both.
- `## Registry ##` → text `Registry ##` ≠ `Registry`; `## registry` case-sensitive; `## Registry\r` keeps `\r` under `[ \t]`-trim; `##\tRegistry` and `   ## Registry  ` normalise to `Registry`. Same as `sources-census.sh:609-624` + `trim()` at :581.
- Inside: 13-field (S002 12f) → `malformedRows ["S002"]`; S003 `rejected` → nothing; 7 tokens declared.
- Outside: 11 ids in file order, repeats kept (`S020` ×2), `S022` 12-field is *not* malformed, `S021` rejected still listed (no status test outside).
- FIX-B (whole-file CRLF): the `## Registry\r` heading leaves the state outside for the whole file → `declared []`, `outsideRows [S101 S102 S103]`, `malformed []`.
- BASE declares 15 tokens on FA and `malformedRows ["S002","S022"]`, matching `controls/ctl-nothing.txt` pre-data.

## Independent clause probes beyond the battery (receipts `probe-xclauses.out`, `census-xclauses.out`, `probe-yclauses.out`, `census-yclauses.out`)

- fx-x: tab-indented `\t## Registry` does **not** reset the state (census counts spaces only); `## Registry\t` and
  `## Registry  \t ` are inside; `## Registry\r` outside; a **14-field outside** row lands in `outsideRows`, not
  `malformedRows`; a repeated outside id is kept twice. Gate `outsideRows` = `["S501","S502","S503","S508","S511","S512","S512"]`
  = census E12 in the identical order.
- fx-y (exotic whitespace): `|\fS516 |` outside → gate `outsideRows ["S516"]`, census E12 **empty**; census instead
  E02s the *inside* `|\fS514 |` row (untrimmed id) that the gate happily declares from. This is the plan's disclosed
  `\s` vs `[ \t]` limit, measured.

## Defects

**Blocking: none.** Every R96 clause is implemented; the frozen counter returns HELD on the on-disk bytes; the three
new arms kill the six violating shapes I applied (`mutant-selftest.txt`).

Non-blockers:

1. **N1 (doc precision, `:435` vs `sources-census.sh:581`).** The header says the *heading* text is "`[ \t]`-trimmed"
   but says only "its id is appended" for outside rows, while the code uses JS `.trim()` (strips `\f \v \u00a0` too).
   Measured divergence in fx-y. Consistent with r95's `malformedRows` and with the plan's disclosed limit, but the
   header should name the limit so `outsideRows` is not read as a strict E12 mirror.
2. **N2 (arm name over-claims, `:1713`).** "(xxiv) … citations carries outsideRows=[] on every path" asserts one path
   (missing `--reports-dir`). The round-mode empty case is only covered indirectly by (xxiii). Rename to "…on the
   fail-closed path" or add the round-mode assert.
3. **N3 (pre-existing, informational).** Gate row predicate (`SOURCES_ROW_RE`) and census registry-row predicate
   differ where the id cell is empty or begins with non-`[ \t]` whitespace (`| | … |`: census E02 id "", gate ignores
   the line). Predicate unchanged by R96; recorded only so the "= census E12" reading is scoped to line shapes the
   gate recognises.

## Residual risk / verification gaps

- `READY` absent at close; if integration ships different bytes, K1 requires a fresh counter run.
- No `lsp` device is mounted in this runtime (`xd://lsp` → "No such tool"), so caller/definition checks come from
  structural reading (single caller at :492, no clones) rather than semantic references — stated, not hidden.
- The intermediate 113954-byte snapshot had the header and the code but **no arms** and was byte-identical to
  `controls/ctl-positive` in its arm-less form; there, the `.trim()` mutation passed `--selftest`. The final bytes fix
  that; worth a lesson line for the "counter HELD without arms" gap.
- Census parity was checked on my two fixtures and the frozen battery only; sibling-lane registries are the labrat's
  differential.
- Independent confirmation, not contradiction: `K96CriticB.md` reaches the same "no code defect" reading and its
  blocker is the absent `READY` (draft hash `9975be…`, same bytes reviewed here). Its `sources-check` CR-normalising
  divergence is a *cross-checker* difference, not a gate defect — R96 freezes "mirror the CENSUS, not CommonMark",
  so the gate's `## Registry\r` reading is the specified one.
