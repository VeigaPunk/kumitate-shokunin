# kumitate round 100 — lesson (row-id readers of cite-sources and source-capture, attempt 1)

Frozen at `445196e4609b76f23d706403b7bebf1135066952`: `.ufo/waves/round-100/plan.md`, `.ufo/waves/round-100/probe/probe100-c1.mjs`,
generator, 16 pre-data controls (all match expected after the M100-2 repair: `.ufo/waves/round-100/controls/OBSERVED.txt`), read-order
log. R99 spot-check adopted before freeze (`5e2f9856`, DRIFT → CLEAN). Spec/dispatch `2abafa0e`; WAVE-DONE for 12 seats, none dead.
M = `7c3bca09124f32887045c1b843d587dc692f9bb1` (K100ExecTool READY, selftests cite 25 / capture 33);
M2 = `4897e20c37a684a8c366cc5aa1bfe84ffae130a4` (selftest arms only, 45 / 54).

C1 operability (lowest non-retired, 9 terminal): R100 — `cite-sources` and `source-capture` recognise a SOURCES row id as the
census `row_pass` does (LF records, 0–3 SP indent, SP/TAB id pad, `S`+3+ ASCII digits closed by `|`). Frozen counter HELD twice at
M (`.ufo/waves/round-100/close/probe-m-{1,2}.txt`) and twice at M2 (`.ufo/waves/round-100/close/probe-m2-{1,2}.txt`); do-nothing control
UNMET a=0 b=0 (`.ufo/waves/round-100/controls/ctl-nothing.txt`).

## Gate

- **admit — R100 readers at M/M2.** K100Reviewer: production change is one reader line per tool (+doc comments), 20/20 hand cases
  equal the live census (`.ufo/waves/round-100/w1/K100Reviewer.md`). K100CriticC independent differential: 1344/1344 cite probes and
  990/990 capture fixtures agree on two seeds, BASE 115 and 203 disagreements (`.ufo/waves/round-100/w1/K100CriticC.md`). K2: L1
  re-mutation 15/15 at M and M2 (`.ufo/waves/round-100/close-l1/integration-remut-M.txt`, `.ufo/waves/round-100/close-l1/integration-remut.txt`).
- **admit — M2 selftest arms.** For K100CriticA's 14 HELD constructions (undrawn pads, NUL, ZWNJ/ZWJ, digit caps, U+2000 indent,
  1000-record cap, README gate, fixture-keyed fallbacks) and K100Mutation's two non-equivalent survivors (M30 two-digit ids in
  capture, M32 split-any in cite): `M2_TEETH: killed=18/18` (`.ufo/waves/round-100/close-l1/m2-teeth.txt`), `M2_SURVIVORS: killed=2/2`
  (`.ufo/waves/round-100/close-l1/m2-survivors.txt`).
- **admit — S280**, MDN Input boundary assertion, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion,
  opened 2026-11-07 by the L1 (`.ufo/waves/round-100/open/l1-open-mdn-Input_boundary_assertion.html`) and K100ScribeSources, HTTP 200,
  byte-identical sha256 `bd32f83a27c733030a65034487515275705dfff99148aa08b14abd5288c5d6c0`. Located quote (§ Description, HTML line 1642,
  20 words): "If the m flag is set, ^ also matches if the character to the left is a line terminator character".
- **admit — S281**, MDN Lexical grammar, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar, opened
  2026-11-07 by the L1 (`.ufo/waves/round-100/open/l1-open-mdn-Lexical_grammar.html`) and K100ScribeSources, HTTP 200, sha256
  `fe8f281332fbe97d491b7869a0b781a4c07a8703c74a281d8a337e76fac1b188`. Located quote (§ Line terminators, HTML line 1727, 13 words):
  "Only the following Unicode code points are treated as line terminators in ECMAScript." Tier B for both: secondary to ECMA-262 (S276).
- **admit — knowledge `corpus/knowledge/row-id-reader-class.md`** (K100ScribeLesson draft, L1 corrections: the pad axis excludes TAB;
  receipt paths made lane-relative; § Shipped added).
- **reject — K99ExecSibling's draft source-capture fix** (`^ {0,3}\|[ \t]*…[ \t]*\|/gm`): keeps the `m` flag, so a row after CR/LS/PS
  on one LF record is a row; `ctl-k99` UNMET b=0 with exactly six record-axis misses (`.ufo/waves/round-100/controls/ctl-k99.txt`).
- **reject — "HELD certifies R100".** K100CriticA built 14 wrong readers the frozen counter rates HELD (`.ufo/waves/round-100/K100CriticA/constructions.md`);
  M2 arms kill all of them, the counter stays a refutation budget.
- **reject — section-scope parity as part of R100.** K100ExecSection: BASE and the R100 reference diverge from the census identically on
  9 of 11 placements (`.ufo/waves/round-100/w1/K100ExecSection.md`); routed to round 101, not folded in.
- **unreachable (not a rejection)** — GNU gawk manual Records page: `www.gnu.org:443` failed to connect (L1 twice, K100ScribeSources three times).

### Rows touched (old → new)

- New: S280, S281 (status `mined`, recheck `on-release`, used-by `corpus/knowledge/row-id-reader-class.md`).
- Existing rows: no `status`, `recheck` or `used-by` change. Capture bindings (not row cells): S269, S271–S275, S277–S279 bound to their
  committed captures, S270 and S276 exempted with reasons, S280/S281 bound (`.ufo/pins/source-captures.json`); S253/S271 duplicate-URL
  group pinned (`.ufo/pins/source-dupes.json`).

## Mistakes

`## Mistakes` and the `#` registration. Freeze `445196e4609b76f23d706403b7bebf1135066952`; lane base
`5e2f9856271525760ade3b08892f6df7601fa689`.


| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M100-1 — round 100's own load order: three canonical/binding inputs were opened after the claim line, and the frozen plan cites a checker receipt that is not in the frozen tree.** | `.ufo/waves/round-100/open/read-order.log`: `claim` at `04:20:37-03:00`; `canonical … SKILL.md`, `canonical … PROTOCOL-APPENDIX.md` and `binding skill://shokunin` at `04:26:06-03:00`. Checker on the **frozen log**: `python3 .ufo/waves/round-99/probe/read-order-check.py --log .ufo/waves/round-100/open/read-order.log --freeze 445196e4609b76f23d706403b7bebf1135066952` → `READ_ORDER: DRIFT MISSING_CANONICAL MISSION.md`, exit 1 (`.ufo/waves/round-100/K100ScribeLesson/receipts/read-order-check.txt`) — the fleet line packs `AXES.md MISSION.md LEARNING.md CORPUS.md` into one path field, so four required canonical inputs are invisible to the checker. The split copy reads the ordering defect: `DRIFT CANONICAL_AFTER_CLAIM line=22 kimi-shokunin/skills/shokunin/SKILL.md`, exit 1 (`.ufo/waves/round-100/close-l1/read-order-split.txt`). The plan's cited receipt `open/read-order-check.txt` (absent: the receipt is `.ufo/waves/round-100/close-l1/read-order-at-freeze.txt`) is absent from the frozen tree: `git ls-tree -r 445196e4 -- .ufo/waves/round-100/open/` lists 8 files, not that one (`ls .ufo/waves/round-100/open/read-order-check.txt` → ENOENT); the plan text citing it is `git show 445196e4:.ufo/waves/round-100/plan.md \| sed -n '12p'`. | Q93 (the r99 checker), **run only at freeze and not treated as a freeze blocker**: the plan discloses the DRIFT instead of repairing the order; Q93 checks the log's ordering, not whether the plan's other cited receipts exist. | The claim was not revised (the late reads contain no rule the claim contradicts) — r100 records the DRIFT as M100-1 rather than hiding it. Durable remedy for the next freeze: write one log line per canonical input, run the checker after the last read and **before** the claim line is authored, and make exit 1 block the freeze; cite only receipts that exist in the frozen tree and reproduce the quoted line with the named command. |
| **M100-2 — the counter's first control run let the violating `ctl-indent4` read `HELD`: the control was frozen without its violation being drawn.** | Pre-repair receipt `.ufo/waves/round-100/controls/pre-repair/ctl-indent4.txt`: `C100_C1: HELD a=1 b=1 c=1 d=1 rows=132 … seed=4d8286d93b69c3e6`, `ctl-indent4 exit=0`; post-repair `.ufo/waves/round-100/controls/ctl-indent4.txt`: `C100_C1: UNMET a=0 b=0 c=1 d=1 rows=135 … seed=dadf710f58aaa2bc`, `ctl-indent4 exit=1`, with `miss a D-indent-SP4:S765593:want=false:got=true`. Cause (plan § Pre-freeze counter repair): the generator appended a random extra space to every non-row indent, so on that seed the 4-SP witness was drawn as 5 SP and a ` {0,4}` reader was never tested; the pre-repair battery also drew 132 rows, three fewer than the 135 of the repaired generator. Reachability command: `grep -c '^miss .*D-indent-SP4' controls/pre-repair/ctl-indent4.txt` → `0`, exit 1, vs the repaired receipt → `2`, exit 0 (`.ufo/waves/round-100/K100ScribeLesson/receipts/q94-control-reachability.txt`). | **none** — Q92 requires the *counter* to name and exercise fixture classes; no criterion required a *negative control* to prove its own violating witness was drawn. Pre-repair `rows=132` vs post-repair `rows=135` in the 16 receipts is the only artifact that shows the battery changed. | Generator rewritten to draw each indent class exactly (`4`, `5`, `6` SP; `3 SP + TAB`; `TAB + 3 SP` added) and all 16 controls re-run before the freeze; `.ufo/waves/round-100/controls/OBSERVED.txt` then reads 16/16 `match=yes` (15 `UNMET`, `ctl-positive` `HELD`). The post-repair ctl-indent4 receipt shows the witness class in its `miss` lines. |
| **M100-3 — a frozen plan's prose count of its own battery disagrees with the frozen artifacts** | `plan.md` § C1 says "Battery (~135 rows, all 13-field, inside `## Registry` …)"; the counter prints `rows=135` on every post-repair control (`.ufo/waves/round-100/controls/OBSERVED.txt` lines carry `seed=` but not rows; the per-control receipts do: `grep -o 'rows=[0-9]*' controls/*.txt` → `rows=135` ×16) and `rows=132` ×16 pre-repair. The prose count is right post-repair and was wrong pre-repair (132) — the same generator defect as M100-2, seen as a count rather than a verdict. | **none** — no criterion compares plan prose to the frozen battery size; the pre-repair receipts were superseded, not retained as the frozen set. | Counts in the knowledge entry are derived from the run by command, never from plan prose (same rule as M99-3); the frozen plan is not amended (K4). Reported here so the round's own count history is auditable. |

 — a pre-data control is admitted only when its run proves its witness was drawn (round 100)
| **M100-4 — two SOURCES gates red for seven rounds, unseen because the close battery omitted them** | `.ufo/waves/round-100/open/battery-before.txt` (`SOURCE_CAPTURE: DRIFT captures=95 exemptions=111 bad=11 first=S269:uncaptured`); `node scripts/source-dupes.mjs` at base → `DRIFT … new-duplicate:git-scm.com/docs/gitrevisions ids=S253,S271`; `.ufo/waves/round-100/close-l1/checklists-at-freeze.txt` items 743/744 FAIL | none (r94–r99 batteries ran `sources-check` + census only; `surface-probe --checklists` was not run at close) | bound S269–S281 in `.ufo/pins/source-captures.json` (9 committed captures + 2 reasoned exemptions + 2 new), pinned S253/S271 in `.ufo/pins/source-dupes.json`; Q95; battery extended. Shown able to fail: before DRIFT exit 1, after CLEAN exit 0 (`.ufo/waves/round-100/close/battery-final.txt`) |

## Routed to round 101

1. Section scope for cite-sources/source-capture (rows outside `## Registry`, `## Registry\r`, 4-SP headings, file-start BOM) — census-parity
   diffs measured in `.ufo/waves/round-100/K100ExecSection/` (`fix-both.diff`), 0 live impact.
2. Counter gaps: fixture-identifiable battery (`example.invalid`, `Z<nonce>` tier), census delegation, oracle hash unpinned (K100CriticB),
   NUL breaks the census `--file` oracle (K100CriticC).
3. Row shape: duplicate ids make source-capture FAIL-CLOSED while the census reports E03; malformed rows no longer required to be bound.
4. Carried: used-by path-part class (L0 `kumitate | round-99`, unanswered), census gawk/bash CR L0 `kumitate | round-96`, remaining
   checklist reds (`.ufo/waves/round-100/close-l1/checklists-at-freeze.txt`: host-bound OMP shape/kimi score/omp census, gate-mutants, round-close audit).

## considerthese and assimilation

- `considerthese/2026-11-06.md` proposal 3 (adoption-before-freeze), opened 2026-11-07: applied — the r99 spot-check was adopted into the
  README map before the freeze (`.ufo/waves/round-100/close-l1/adopt-r99-spotcheck.txt`).
- Assimilation: none (no `merge/kumitate/` theme fits a row-id reader).

## Outside check

Outside non-author admit/reject spot-check is pending the orchestrator's closure; dispatched seats are the lane and are not credited as
that independent judgment.
