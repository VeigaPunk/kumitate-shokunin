# kumitate round 100 — lesson draft (row-id reader class, attempt 1) — scribe draft, not filed

Draft only: `## Gate` and `### Rows touched` belong to the L1 at close (S280/S281 are the round's two MDN rows,
drafted by K100ScribeSources; the registry stands at S279). This file carries the two sections the round mined:
`## Mistakes` and the `### Q94` registration. Freeze `445196e4609b76f23d706403b7bebf1135066952`; lane base
`5e2f9856271525760ade3b08892f6df7601fa689`.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M100-1 — round 100's own load order: three canonical/binding inputs were opened after the claim line, and the frozen plan cites a checker receipt that is not in the frozen tree.** | `.ufo/waves/round-100/open/read-order.log`: `claim` at `04:20:37-03:00`; `canonical … SKILL.md`, `canonical … PROTOCOL-APPENDIX.md` and `binding skill://shokunin` at `04:26:06-03:00`. Checker on the **frozen log**: `python3 .ufo/waves/round-99/probe/read-order-check.py --log .ufo/waves/round-100/open/read-order.log --freeze 445196e4609b76f23d706403b7bebf1135066952` → `READ_ORDER: DRIFT MISSING_CANONICAL MISSION.md`, exit 1 (`.ufo/waves/round-100/K100ScribeLesson/receipts/read-order-check.txt`) — the fleet line packs `AXES.md MISSION.md LEARNING.md CORPUS.md` into one path field, so four required canonical inputs are invisible to the checker. The split copy reads the ordering defect: `DRIFT CANONICAL_AFTER_CLAIM line=22 kimi-shokunin/skills/shokunin/SKILL.md`, exit 1 (`.ufo/waves/round-100/close-l1/read-order-split.txt`). The plan's cited receipt `open/read-order-check.txt` is absent from the frozen tree: `git ls-tree -r 445196e4 -- .ufo/waves/round-100/open/` lists 8 files, not that one (`ls .ufo/waves/round-100/open/read-order-check.txt` → ENOENT); the plan text citing it is `git show 445196e4:.ufo/waves/round-100/plan.md \| sed -n '12p'`. | Q93 (the r99 checker), **run only at freeze and not treated as a freeze blocker**: the plan discloses the DRIFT instead of repairing the order; Q93 checks the log's ordering, not whether the plan's other cited receipts exist. | The claim was not revised (the late reads contain no rule the claim contradicts) — r100 records the DRIFT as M100-1 rather than hiding it. Durable remedy for the next freeze: write one log line per canonical input, run the checker after the last read and **before** the claim line is authored, and make exit 1 block the freeze; cite only receipts that exist in the frozen tree and reproduce the quoted line with the named command. |
| **M100-2 — the counter's first control run let the violating `ctl-indent4` read `HELD`: the control was frozen without its violation being drawn.** | Pre-repair receipt `.ufo/waves/round-100/controls/pre-repair/ctl-indent4.txt`: `C100_C1: HELD a=1 b=1 c=1 d=1 rows=132 … seed=4d8286d93b69c3e6`, `ctl-indent4 exit=0`; post-repair `.ufo/waves/round-100/controls/ctl-indent4.txt`: `C100_C1: UNMET a=0 b=0 c=1 d=1 rows=135 … seed=dadf710f58aaa2bc`, `ctl-indent4 exit=1`, with `miss a D-indent-SP4:S765593:want=false:got=true`. Cause (plan § Pre-freeze counter repair): the generator appended a random extra space to every non-row indent, so on that seed the 4-SP witness was drawn as 5 SP and a ` {0,4}` reader was never tested; the pre-repair battery also drew 132 rows, three fewer than the 135 of the repaired generator. Reachability command: `grep -c '^miss .*D-indent-SP4' controls/pre-repair/ctl-indent4.txt` → `0`, exit 1, vs the repaired receipt → `2`, exit 0 (`.ufo/waves/round-100/K100ScribeLesson/receipts/q94-control-reachability.txt`). | **none** — Q92 requires the *counter* to name and exercise fixture classes; no criterion required a *negative control* to prove its own violating witness was drawn. Pre-repair `rows=132` vs post-repair `rows=135` in the 16 receipts is the only artifact that shows the battery changed. | Generator rewritten to draw each indent class exactly (`4`, `5`, `6` SP; `3 SP + TAB`; `TAB + 3 SP` added) and all 16 controls re-run before the freeze; `controls/OBSERVED.txt` then reads 16/16 `match=yes` (15 `UNMET`, `ctl-positive` `HELD`). The post-repair ctl-indent4 receipt shows the witness class in its `miss` lines. |
| **M100-3 — a frozen plan's prose count of its own battery disagrees with the frozen artifacts** | `plan.md` § C1 says "Battery (~135 rows, all 13-field, inside `## Registry` …)"; the counter prints `rows=135` on every post-repair control (`controls/OBSERVED.txt` lines carry `seed=` but not rows; the per-control receipts do: `grep -o 'rows=[0-9]*' controls/*.txt` → `rows=135` ×16) and `rows=132` ×16 pre-repair. The prose count is right post-repair and was wrong pre-repair (132) — the same generator defect as M100-2, seen as a count rather than a verdict. | **none** — no criterion compares plan prose to the frozen battery size; the pre-repair receipts were superseded, not retained as the frozen set. | Counts in the knowledge entry are derived from the run by command, never from plan prose (same rule as M99-3); the frozen plan is not amended (K4). Reported here so the round's own count history is auditable. |

## Q94 — a pre-data control is admitted only when its run proves its witness was drawn (round 100)

- **Rule.** Every negative control names the witness class it must diverge on, and the frozen run that scores it
  must emit at least one disagreement line for that class — `miss a <class>:…` or `miss b extra:…:<class>` for the
  counter, or the equivalent one-line failure for any other instrument. A control whose expected verdict is `UNMET`
  while its run prints `HELD` is a generator defect: the battery did not reach the intended witness, and no verdict
  from that run may be frozen. The control receipt carries the witness class, not only the verdict word.
- **Grounding.** M100-2: r100's first control run read `ctl-indent4` as `C100_C1: HELD a=1 b=1 c=1 d=1 rows=132`
  (exit 0) because the generator appended a random extra space to every non-row indent, so the 4-SP witness was
  drawn as 5 SP and a ` {0,4}` reader was never tested. Post-repair the same control reads
  `UNMET a=0 b=0` with `miss a D-indent-SP4:S765593:want=false:got=true` and `rows=135`.
  Receipts: `controls/pre-repair/ctl-indent4.txt`, `controls/ctl-indent4.txt`.
- **Who checks.** The L1 before the freeze: run the frozen counter per control on a pinned seed; require the expected
  verdict **and** the witness line; commit both receipts (`OBSERVED.txt` plus one file per control).
- **Command.**
  `node .ufo/waves/round-100/probe/probe100-c1.mjs --cite <ctl>/cite-sources.mjs --capture <ctl>/source-capture.mjs --work <scratch> --seed <seed>`
  per control, then `grep -c '^miss .*D-indent-SP4' <receipt>` for `ctl-indent4` → non-zero.
  This seat: `0`/exit 1 on the pre-repair receipt, `2`/exit 0 on the repaired one
  (`.ufo/waves/round-100/K100ScribeLesson/receipts/q94-control-reachability.txt`).
- **Fails when.** A control prints its expected verdict with no `miss`/`extra` line for its witness class; or a
  control declared `UNMET` prints `HELD` (the pre-repair ctl-indent4 shape).
- **Shown able to fail.** The pre-repair receipt is the failing shape; the repaired receipt is the pass shape. Both
  are frozen files, so the failing shape cannot be re-executed from the current generator — its bytes are not
  retained. That limit is why the grep runs against the receipts, not against a regenerated pre-repair control.
- **Limit (observed).** A `miss` line proves the run drew a row of that class, not that it drew it once or that the
  class is the reader's only divergent axis; the witness name is a substring match on the counter's class label.
  The criterion constrains controls, not the counter's class grid (Q92's subject).

## Notes for the integrator

- M100-1's checker reading is quoted in two shapes because the frozen log fails on its line shape before its
  ordering: `MISSING_CANONICAL MISSION.md` on the frozen bytes, `CANONICAL_AFTER_CLAIM line=22` only after the
  fleet line is split (`close-l1/read-order-split.txt`). The plan's sentence implies the second is the frozen
  reading; it is not.
- M100-2 and M100-3 are one generator defect with two observable faces (a control verdict and a row count); they are
  kept as two rows because the fix and the capture differ: Q94 covers the control, a count rule already covers the
  prose.
