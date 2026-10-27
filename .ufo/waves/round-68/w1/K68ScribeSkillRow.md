VERDICT: The SKILL.md gate-registry row for `routed-ledger` v2 and its +1 checklist item are drafted and grammar-validated in `build/K68ScribeSkillRow/skill-rows.md`; the L1 must declare checklist count C = 34, and the row's registry home drags two live defects the draft names — no pin key covers `scripts/routed-ledger.mjs` (so `proxy-check --strict`, checklist item 8, reads DRIFT at base) and `corpus/QUALITY.md` has no Q62 although the plan and `corpus/README.md:194` both name it.

## Evidence

Registry shape (all read at the lane worktree, 2026-10-27; worktree is mid-round, so sibling edits may be present):

```
$ grep -n '^## Gate registry' SKILL.md                     -> 587
$ grep -c '^- \[ \] ' SKILL.md                             -> 33
$ sed -n '690p' SKILL.md                                   -> "Thirty-three items (round 64; item 33 is the plan-before-ready map-arm suite, …"
$ grep -c 'routed-ledger' SKILL.md                         -> 0
$ grep -n '^| jj-seat-demo' SKILL.md                       -> 637   (last table row)
$ rows after the '| name | kind |' header                  -> 28 = 24 gate + runner + probe + helper + demo
$ grep -c 'Twenty-four gate rows over twenty-three gate files' SKILL.md -> 1
$ grep -c 'all twenty-four' SKILL.md                       -> 1
$ 4th-cell 64-hex count over all rows                      -> 0      (the column names pins, never values)
$ grep -n 'GATE_PINS = {' scripts/proxy-check.mjs          -> 461
$ ls -l scripts/routed-ledger.mjs                          -> 26141 bytes, contract kumitate-routed-ledger-v1
$ grep -n 'ROUTED_LEDGER_SELFTEST' scripts/routed-ledger.mjs -> 349
```

Measured pin-coverage drift (one run, read-only, `TMPDIR` under my scratch; full output `build/K68ScribeSkillRow/proxy-strict.txt`):

```
$ cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && node scripts/proxy-check.mjs --strict   # exit 1
PROXY  warn  PIN_UNPINNED  scripts/harm-matrix.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY  warn  PIN_UNPINNED  scripts/routed-ledger.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY: DRIFT (A_DRIFT term=A declared=351 computed=550 delta=+199; C2_DRIFT … declared=156 computed=163 delta=+7;
C2_TOTAL_DRIFT …; K_MEMBERS_DRIFT … declared=49 computed=53; K_SECTIONS_DRIFT …; PIN_UNPINNED term=scripts/harm-matrix.mjs;
PIN_UNPINNED term=scripts/routed-ledger.mjs; src-rev=31c465f15669)
```

Draft validation (my own patch text, against the frozen grammars):

```
row cells: 5 | row bytes: 3117 | row is single line: true
item parses (CHECKLIST_RE, scripts/surface-probe.mjs:278): true
  cmd= node scripts/routed-ledger.mjs --selftest  exits= 0  expect= ROUTED_LEDGER_SELFTEST: PASS
em-dash separators in item: 1 ; backticks: 6
```

Draft contents: one 5-cell gate row (`routed-ledger | gate | … contract kumitate-routed-ledger-v2 … | --selftest … | …`), the two registry-preamble literal amendments, the checklist-preamble cardinal bump, one checklist item, the C declaration, and six post-integration checks — all in `build/K68ScribeSkillRow/skill-rows.md` §1–§6.

## Findings

**K68ScribeSkillRow-1 — HIGH — the row's registry home is incomplete without a pin key, and checklist item 8 is red at base.**
Attacks: C1's L6 registry home and the round's close gate. `comparePinCoverage` (`scripts/proxy-check.mjs:1141-1160`) warns for every `scripts/*.mjs` that no `PINS`/`GATE_PINS` key covers; `scripts/routed-ledger.mjs` (round 66) and `scripts/harm-matrix.mjs` (round 65) are in neither map, so `--strict` (checklist item 8, `SKILL.md:711`) exits 1 DRIFT. The SKILL row alone does not fix it; the L1 must add `'pin.routed-ledger': 'scripts/routed-ledger.mjs'` to `GATE_PINS` (`scripts/proxy-check.mjs:461`) plus a value in SCORECARD's `kumitate-gate-pins-v1` block, then re-pin `pin.proxy-check` (editing proxy-check changes its own bytes) — or record the warn as an accepted open limit, in which case item 8 stays DRIFT. Reproduce: `node scripts/proxy-check.mjs --strict`.

**K68ScribeSkillRow-2 — HIGH — the QUALITY half of the registry home does not exist.**
Attacks: L6's "corpus/QUALITY.md names `routed-ledger`" and the plan's "QUALITY Q62". `grep -c 'Q62' corpus/QUALITY.md` → 0; the highest rule id in that file is Q61; `corpus/README.md:194` (the round-65 map row) already promises "QUALITY Q62". So the plan's Q62 is a number the L1 must actually write as the next free rule, not an existing home. Reproduce: `grep -oE '\bQ[0-9]{1,3}\b' corpus/QUALITY.md | sed 's/Q//' | sort -n | tail -1` → 61.

**K68ScribeSkillRow-3 — MEDIUM — the seat premise "if the table pins sha256s" is false: the fourth column never carries a hash.**
Attacks: the pin-cell instruction. Every row's 4th cell is a *location* pointer (`pin.<name>` in a block, `SCORECARD.md` stanza, in-script constants); the 64-hex scan over all 28 rows returns 0. sha256s live in SCORECARD's two pinned blocks (`kumitate-proxy-v1` and `kumitate-gate-pins-v1`). The draft's cell therefore names the pin key and the two companion edits, and carries no value — the L1 has nothing to "fill in at close" here. Reproduce: `awk -F'|' '/^\| name \| kind \|/{f=1;next} f&&/^\|/{if ($5 ~ /[0-9a-f]{32,}/) print $2}' SKILL.md | wc -l` → 0.

**K68ScribeSkillRow-4 — MEDIUM — the registry counts itself in prose; the row falsifies two literals.**
Attacks: any close that lands only the table row. `SKILL.md:591` reads "Twenty-four gate rows over twenty-three gate files" and the paragraph ends ""all twenty-four" above still counts the gates only"; both are false at 25 gate rows over 24 files. Draft §2 gives the two replacements and the grep that must come back empty.

**K68ScribeSkillRow-5 — MEDIUM — the +1 item must satisfy the frozen checklist grammar or it counts as a failed item.**
Attacks: operability of the new checklist item. `CHECKLIST_RE` (`scripts/surface-probe.mjs:278`) allows exactly one ` — ` separator, a backtick-free command, a backtick-free expected substring, and a terminating `+ \`…\``; a `- [ ]` line that misses is `CHECKLIST_GRAMMAR` and counts *failed* (`scripts/surface-probe.mjs:26-28`). The drafted line parses (evidence above) and expects `ROUTED_LEDGER_SELFTEST: PASS`, the literal the v1 tool already prints at `scripts/routed-ledger.mjs:349` — an expectation that cannot go vacuous. Reproduce: the node parse check in `build/K68ScribeSkillRow/skill-rows.md` §4.

**K68ScribeSkillRow-6 — LOW — two citation traps for whoever pastes the row.**
Attacks: `cite-check` at close. (a) A `:NNN` line ref in the row binds to the nearest path or to the file's sticky owner and DRIFTs when the tool moves — the draft cites paths only. (b) A glob-ish token such as a backticked `round-55..66-verifier-spotcheck.md` is not a file (`PATH_ABSENT`); the draft leaves that reference as unbackticked prose. Reproduce after integration: `node scripts/cite-check.mjs` and read the row's tokens.

## Artifacts

- `.ufo/waves/round-68/build/K68ScribeSkillRow/skill-rows.md` — the patch text: gate row (§1), preamble amendments (§2, §3), checklist item (§4), C declaration (§5), post-integration checks (§6), plus the grammar-validation results.
- `.ufo/waves/round-68/build/K68ScribeSkillRow/proxy-strict.txt` — the measured `proxy-check --strict` output (exit 1) behind finding 1.
- `.ufo/waves/round-68/w1/K68ScribeSkillRow.md` — this report.

Scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeSkillRow` held only the `TMPDIR` and the copied receipt; no lane, fleet or `~/.local/bin` path was written. No tool was installed or upgraded (nothing needed; `node` shipped with the host).

## Limits

- I did not edit `SKILL.md`, `SCORECARD.md`, `corpus/` or `scripts/`: the row and item are drafts, and no verdict here asserts that any of them is landed.
- The v2 tool does not exist at this freeze; the row's `n >= 44` is the plan's L1 floor (plan L1), not a counted suite, and the six hardenings are quoted from plan § C1's prose plus the round-66 v1 header, not from v2 bytes I read.
- The v2 finding-id set is unmeasured: I assert only that v1's six ids (`ROW_MALFORMED`, `ROW_DUPLICATE`, `ITEM_ABSENT`, `QUOTE_ABSENT`, `ANSWER_DEAD`, `UNLEDGERED`) keep their meaning and that any new id must be appended — the L1 must read the integrated tool's header for the final list.
- `proxy-check --strict` ran against the live worktree, not `git archive` of a frozen revision, and other seats were writing at the time: the `A_DRIFT`/`C2_DRIFT`/`K_*` terms may be mid-round transients. Only the two `PIN_UNPINNED` lines are structural (maps at `scripts/proxy-check.mjs:461-484`) and those are what findings 1 rests on.
- I did not run `surface-probe --checklists`, `cite-check`, or the planned post-integration greps: they belong to the L1 at the integrated revision, and an unrun check has not passed.
- I did not verify the round's frozen counter's own reading of the plan (ledger68-probe): that is a strengthening-ratchet question for the L1, out of this seat's scope.
