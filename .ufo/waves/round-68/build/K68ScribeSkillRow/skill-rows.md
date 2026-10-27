# SKILL.md gate-registry + checklist patch draft (seat K68ScribeSkillRow)

Status: PATCH TEXT for the L1 (`KumitateR68`). Nothing here is applied; `SKILL.md` is not mine to edit.
Measured at lane worktree `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, 2026-10-27.

Base facts this draft is written against (measured, not assumed):

```
$ grep -n '^## Gate registry' SKILL.md              -> 587
$ grep -c '^- \[ \] ' SKILL.md                      -> 33        # base checklist count C = 33
$ sed -n '690p' SKILL.md                            -> "Thirty-three items (round 64; item 33 is the plan-before-ready map-arm suite, ...)"
$ grep -c 'routed-ledger' SKILL.md                  -> 0         # no registry row exists
$ table rows after '| name | kind |'  (line 606)    -> 28 rows = 24 gate + 1 runner + 1 probe + 1 helper + 1 demo
$ grep -n '^| jj-seat-demo' SKILL.md                -> 637       # last table row; insert after it
```

## 1. Gate-registry row — insert as SKILL.md line 638 (immediately after the `jj-seat-demo` row, before the blank line that precedes "Named legacy gaps")

One physical line, five cells, same column order as every other row
(`name | kind | entry command → verdict line shape | self-test | pinned values live in`).

```markdown
| routed-ledger | gate | `node scripts/routed-ledger.mjs [--root DIR] [--rev REV] [--from N] [--to N] [--ledger PATH] [--classes]` → `ROUTED_LEDGER: CLEAN spotchecks=a sections=b items=c rows=d open=e closed=f wontfix=g` exit 0 / `ROUTED_LEDGER: DRIFT spotchecks=… findings=k first=<ID>:<detail>` exit 1 / `ROUTED_LEDGER: FAIL-CLOSED reason=<why>` exit 2 / `ROUTED_LEDGER: USAGE <msg>` exit 64, contract `kumitate-routed-ledger-v2` (round 68; v1 was round 66): binds the routed-defect section of every non-author verifier spot-check in [from, to] to one ledger row per item in `corpus/routed-ledger.md` (61 items in 12 sections over rounds 55..66 — the counter's own fence-aware count, and the L2 check binds `items=` to that count, not to this sentence); an item quote is >= 3 words, word-boundary-located and unique within its routed section; a closed/wontfix answer quote is located at the exact named `path:line` of a lane file that is neither the ledger nor a spot-check, and no (round,item) carries two non-open rows. v2 lands the round-66 wave's six confirmed hardenings, each reproduced by a committed attack before the round-68 freeze: (i) a selftest or repo read never inherits `GIT_DIR` (an inherited one is refused, never followed); (ii) an answer or ledger path escaping the root by symlink or `..` fails closed; (iii) every matching routed section is read, so a second routed section is no longer silently missed; (iv) quotes bind at word boundaries and an ambiguous match is refused, so a one-word or ambiguous quote cannot bind; (v) the answer quote has no ±2-line window — it must sit on the named line; (vi) the item count is fence-aware, so an indented bullet inside a fence is not an item and a fenced table row is not counted. Findings `ROW_MALFORMED`, `ROW_DUPLICATE`, `ITEM_ABSENT`, `QUOTE_ABSENT`, `ANSWER_DEAD`, `UNLEDGERED` keep their v1 ids and v2 tightens what each means; any id v2 adds is named in the tool header and must be appended to this cell | `--selftest` (`ROUTED_LEDGER_SELFTEST: PASS (n/n)`; v1 was 33 cases at round 66, v2 requires n >= 44: one red-before case per hardening, and the 20 held-out mutants — good, drop, quote-swap, quote-decoy, answer-wrong, answer-ledger, answer-eof, dup, ordinal, nested-as-item, prose-as-item, long-quote, one-word-quote, ambiguous-quote, shifted-answer, fence-item, second-section, contradictory, no-section, ledger-absent — generated at counting time from random tokens under `--seed` or crypto, so no answer key exists to read) | in-script constants (`LEDGER_DEFAULT`, `FROM_DEFAULT`) and the section/item grammar in the tool header; the ledger `corpus/routed-ledger.md`; the twelve verifier spot-checks of rounds 55..66 under corpus/lessons/. This cell carries no sha256 by design: the fourth column names *where* values live, never the value. If the L1 wants `pin.routed-ledger`, its value belongs in SCORECARD's `kumitate-gate-pins-v1` block **and** the key must be added to `GATE_PINS` in `scripts/proxy-check.mjs` first — an unlisted key is `GATE_PIN_KEY_UNKNOWN` — which re-pins `pin.proxy-check` in the v1 stanza |
```

Notes for the L1 on this row:

- **No line-number citations in the row.** `cite-check` reads `:N`/`L<N>` refs outside fences and binds them to the nearest cited path or to the file's sticky owner, so a `scripts/routed-ledger.mjs:412` in this row becomes a citation that DRIFTs the moment the tool moves. Every other recent row (rounds 60–64) cites paths, not lines; keep it that way.
- **Paths cited here resolve at cite-check ladder step 2 (`self`, the lane tree)**: `scripts/routed-ledger.mjs` (present at base, 26141 bytes) and `corpus/routed-ledger.md` (absent at base, created by the C1 integration) both resolve repo-relative. The `corpus/lessons/` reference is deliberately unbackticked prose: a glob-ish token such as `round-55..66-verifier-spotcheck.md` is not a file and would read as `PATH_ABSENT`.
- **The `n >= 44` floor is the plan's L1 predicate, not a measurement.** Write the row's `(n/n)` as the shape; the L1 substitutes the tool's own printed count at integration. Do not copy 33 anywhere as the v2 count.

## 2. Registry preamble amendment (SKILL.md:591 and the sentence that follows it)

The registry counts itself in prose ("Twenty-four gate rows over twenty-three gate files"), so the row above makes that sentence false unless it is amended in the same edit. Replace, in the preamble paragraph:

- `Twenty-four gate rows over twenty-three gate files` → `Twenty-five gate rows over twenty-four gate files`
- in the parenthetical list of additions, append before the closing parenthesis:
  `, `routed-ledger` round 68 (its v1 landed round 66 without a registry home)`

The trailing sentence `"all twenty-four" above still counts the gates only` must become `"all twenty-five"` in the same edit. Grep for both literals before closing:
`grep -n 'Twenty-four gate rows\|all twenty-four' SKILL.md` must print nothing afterwards.

## 3. Checklist preamble amendment (SKILL.md:690)

Replace:

```
Thirty-three items (round 64; item 33 is the plan-before-ready map-arm suite, ...
```

with:

```
Thirty-four items (round 68; item 34 is the routed-defect ledger gate suite, item 33 the plan-before-ready map-arm suite, item 32 the jj seat-containment demo re-run, ...)
```

i.e. bump the cardinal and prepend the new item to the descending "item N is …" enumeration; the rest of that paragraph's sentences stay byte-identical.

## 4. Checklist item — append as the last item (after the plan-before-ready map-arm item, SKILL.md:737)

```markdown
- [ ] Routed-defect ledger gate (round 68; contract `kumitate-routed-ledger-v2`; v1 was 33 cases and v2 carries one red-before case per round-66 hardening plus 20 held-out mutants generated at counting time, so read n >= 44 and not merely PASS; the real run over the twelve spot-checks is the registry row's command, --root . --from 55 --to 66) — `node scripts/routed-ledger.mjs --selftest` → exit 0 + `ROUTED_LEDGER_SELFTEST: PASS`
```

`surface-probe --checklists` grammar constraints this line satisfies (frozen v1, `CHECKLIST_RE` at scripts/surface-probe.mjs:278):

- exactly one ` — ` separator; the label must not contain an em dash, or the lazy label group binds the wrong span;
- the command is the backticked span immediately after the separator, `[^`]+`, so the command may not itself contain a backtick;
- then the literal ` → exit <n>[|<m>…] + ` and a backticked expected substring with no backtick inside, at end of line;
- `ROUTED_LEDGER_SELFTEST: PASS` is the substring the v1 tool already prints (scripts/routed-ledger.mjs:349), so the item stays a real pass/fail arm rather than a substring that never appears;
- the label's own backticked contract id is legal (items 22–33 do the same).

## 5. The count the L1 must declare

**Base C = 33** (measured: `grep -c '^- \[ \] ' SKILL.md` → 33, and the prose at :690 says "Thirty-three items (round 64; …)"). **The L1 declares C = 34.**

Two consequences the L1 must carry into the same close, neither of which is a SKILL.md edit:

1. `SCORECARD.md` `## Axes` operability row's evidence pointer is round-42-era text ("A=10 … C=19"); it is not the checklist count and must not be edited to 34 as if it were. The proxy's `C` term is the stanza integer the gate recomputes — leave the axes row alone unless the proxy's own verdict changes.
2. `surface-probe --checklists` runs the new item as item 34. Its receipt (`CHECKLIST: n/m pass`) becomes 34-wide once the item lands; the L1's close receipt must quote the 34-wide line, not a 33-wide one.

## 6. Post-integration checks (run once, after the L1 lands the row + item)

```bash
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
grep -c 'routed-ledger' SKILL.md                                    # >= 1, in a table row
grep -c '^- \[ \] ' SKILL.md                                        # 34
grep -n 'Twenty-four gate rows\|all twenty-four' SKILL.md            # no output
awk -F'|' '/^\| routed-ledger \|/{print NF-2}' SKILL.md              # 5 cells
node scripts/surface-probe.mjs --checklists --self .                 # item 34 parses; CHECKLIST: n/34 pass
node scripts/cite-check.mjs                                          # no new PATH_ABSENT/ORPHAN_REF at the row
```
