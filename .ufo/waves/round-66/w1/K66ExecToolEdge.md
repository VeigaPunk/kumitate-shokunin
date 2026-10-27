VERDICT: The C1 tool v1 (`scripts/routed-ledger.mjs`) silently loses whole routed sections on CRLF files and over-counts fenced/HTML-comment content as routed items; seven of the thirteen named edge inputs are real defects, and a counter-parity-safe v2 candidate (44/44 selftest, frozen counter still 6/6, real-corpus items unchanged at 57) is proposed in the build dir.

## Evidence

Baseline (committed tool, freeze `621212ba`):

```
$ cd /fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge && TMPDIR=$S node tool-v1.mjs --selftest
... 33 CASE ok lines ...
ROUTED_LEDGER_SELFTEST: PASS (33/33)
EXIT=0
```

Frozen counter, unmodified, on the real lane at the freeze:
`base/ledger66-base.txt` → `LEDGER66_UNMET held=0/6 ... L1 MISS tool-absent` (pre-landing).

**E1 — CRLF (CRLF in the spot-check).** `routedItems` splits on `'\n'` only, so a `\r`-terminated heading fails `/^(#{1,6})\s+(.*)$/` (the `$` anchor sits before the `\r`) and the routed section is never found. Verified at the regex level:

```
$ node -e 'const l1="## 5. Routed defects for round 8", l2=l1+"\r";
console.log("LF  heading match:", /^(#{1,6})\s+(.*)$/.test(l1));
console.log("CRLF heading match:", /^(#{1,6})\s+(.*)$/.test(l2));
console.log("CRLF ledger heading match:", /^##\s+Ledger\s*$/.test("## Ledger\r"));'
LF  heading match: true
CRLF heading match: false
CRLF ledger heading match: true
```

End-to-end (edge.mjs case E1; spot-check + ledger + answers all CRLF):
`ROUTED_LEDGER: DRIFT spotchecks=2 sections=0 items=0 rows=3 … first=ITEM_ABSENT:R7-D1@line7:round-7-item-1-of-0` — exit 1.

**E1 worst case — CRLF spot-check with an empty ledger (edge2.mjs P3):**
`ROUTED_LEDGER: CLEAN spotchecks=1 sections=0 items=0 rows=0 open=0 closed=0 wontfix=0` — **exit 0**.
Three real routed items in the file, zero of them seen, gate reports CLEAN. The frozen counter's own parser (`.ufo/waves/round-66/probe/ledger66-probe.mjs` `items66`) has the same `\r` blind spot, so the counter's L3 also misses them — but the counter's L3 clause `r65-item-N-not-answered-this-round` and its `classes>=5` / `no-class-spans-4-rounds` checks are what stop the claim from holding on a CRLF corpus; the tool alone does not.

**E3 — fenced code block inside the routed section.** A `- ` line inside a ``` fence is counted as a routed item (edge.mjs E3): `items=5` instead of `3`, with `FINDING QUOTE_ABSENT R7-D3@line9:round-7-item-3` and three spurious `UNLEDGERED` findings. The frozen counter's `items66` has the identical blind spot (`edge6.mjs` fence-in-section: counter `own-items=44`, tool `items=44` — both wrong, so the counter cannot arbitrate this one).

**E4 — HTML comment.** Same shape (edge.mjs E4a): `items=4` instead of `3`, spurious `UNLEDGERED`. Worse, a commented-out earlier `## Routed defects` heading **steals the section** (edge.mjs E4b): the tool binds the retracted block, `items=1`, and the live D2/D3 items become `ITEM_ABSENT … -of-1`. A `## Routed defects` inside a ``` fence does the same (edge2.mjs P5).

**E4b/E7 — a second routed heading wins by position.** The tool binds the **first** matching heading. On the real corpus this already bites: `round-37-verifier-spotcheck.md` has two matching headings — `L84 h2: Round-36 routed defects D1–D8` and `L201 h2: Routed defects (lane owes next round)` (edge7.mjs `routedHeadings`). The tool binds the L84 block (27 items) and never sees round-37's own 7-item block (edge2.mjs P4: `items=27`); the L201 block is the lane's real routed section. Rounds 55..65 each have exactly one matching heading, so C1's own range is unaffected.

**E8 — escaped pipe in a ledger cell.** A GFM `\|` inside a quote cell splits into 8 cells: `FINDING ROW_MALFORMED line7:cells=8` plus `UNLEDGERED round-7-item-1` (edge.mjs E8). The frozen counter's `ledgerParse` agrees (`BAD(cells!=7)@7`), so both reject — but the *tool* then silently drops the row from `rows`, under-reporting `rows=` and hiding the row. Both tool and counter reject the row: no divergence, but the ledger writer is stuck (edge6.mjs escaped-pipe: counter `L3 MISS malformed@7,unledgered:55#1`, tool `ROW_MALFORMED line7:cells=8`).

**E13 — a second `## Ledger` section is silently dropped.** `ledgerRows` takes the first `## Ledger` and stops at the next `^##?\s`, so rows in a second table are invisible: edge.mjs E13 → `ROUTED_LEDGER: CLEAN spotchecks=2 sections=1 items=3 rows=3` (the extra `R7-X` row never counted, no finding). The frozen counter's `ledgerParse` does the same (edge6.mjs second-ledger: counter `held=6/6`, tool `rows=33`) — both blind, so this is a joint weakness.

**E9 — trailing space / missing trailing pipe on a ledger row.** Both parse in the tool (edge.mjs E9a/E9b/E9c → CLEAN, `rows=3`). But the **frozen counter disagrees**: its `ledgerParse` does `L[i].trim().slice(1,-1).split('|')`, so a row without the trailing pipe loses its last character (edge6.mjs no-trailing-pipe → counter `L3 MISS 1 problems: R55-I1:open-with-answer`, while the tool said `CLEAN`). The counter's `slice(1,-1)` also strips the first and last character of a **6-cell** row, so it silently shifts cells. This is a counter-side defect, not a tool one — reported, not patched (the counter is frozen).

**E10 — unicode quotes and NBSP.** Item-side curly quotes are handled (edge.mjs E10b → CLEAN; E10c literal NBSP → CLEAN; E10d `&nbsp;` → CLEAN — all three by `norm()`'s entity and whitespace folding). But a ledger quote cell delimited by **curly** quotes `“…”` is rejected (edge.mjs E10a → `QUOTE_ABSENT`): the tool strips only ASCII `"` from the cell (`quoteRaw.replace(/^"(.*)"$/,'$1')`), and the frozen counter does the same, so again both agree — but `norm()` folds curly quotes to `"` *after* stripping, so the folded quote never matches the item's folded text. A ledger writer using typographic quotes is stuck.

**E11 — answer path `./` prefix** is accepted and reads the right file (edge.mjs E11a → CLEAN; the `normalize()` of the path resolves it). **Symlinked answer paths are the hole**: the tool checks the answer path *lexically* (`p === ledgerNorm`, `spotPaths.has(p)`, `SPOT_RE.test(p)`), never after resolution. A symlink at `notes/link.md` pointing at the ledger itself is accepted (edge.mjs E11b → `CLEAN`, the answer quote located *in the ledger*), and one pointing at a spot-check likewise (edge.mjs E11c → `CLEAN`). A symlink pointing **outside the lane root** is also accepted (edge2.mjs P6 → `CLEAN spotchecks=1 sections=1 items=3 rows=3`). The contract says the answer must be "a lane file that is neither the ledger nor a spot-check"; the lexical check does not deliver that.

**`--rev` with a tag / branch / `HEAD~1`** — **no defect.** All three read committed bytes correctly: edge2.mjs P1 → `--rev r7tag`, `--rev feature/ledger`, `--rev HEAD~1`, `--rev HEAD`, `--rev HEAD^{commit}` all `CLEAN … items=3 rows=3`; edge14.mjs confirms v1 and v2 agree on `r7`, `feature/x`, `HEAD~1`. A `--rev` whose tree lacks the ledger fails closed with exit 2 (`ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md`), as does a tag pointing at such a tree (edge8.mjs).

**ATX headings with trailing `#`** — **no defect**: `## 5. Routed defects for round 8 ##` and `## 6. Non-author statement ##` parse as one section, `items=3`, CLEAN (edge.mjs E5; edge14.mjs).

**Setext headings** — per the tool's declared rule (ATX `#`..`######` only) a setext heading is not a routed heading, so the section is simply not found and the ledger rows become `ITEM_ABSENT … -of-0` (edge.mjs E6) — the tool fails *loudly* here, unlike CRLF. Not a defect; noted for completeness.

**Tabs as indentation** — **no defect**: tab-indented nested bullets stay with their parent item (edge.mjs E2 → `items=3`, CLEAN; edge14.mjs).

**Real-corpus exposure.** Every construct above is absent from rounds 55..65: edge11.mjs totals `{"toolItems":57,"fencePhantomItems":0,"commentPhantomItems":0,"crlfFiles":0,"separatorsWithoutTrailingPipe":0}`. The tool and the counter agree item-for-item on all 32 rounds 34..65 (edge3.mjs: `same: true` for every round; tool `items=57` == counter `own-items=57`).

**v2 candidate vs the frozen counter** (edge13.mjs; synthetic lanes, one edge at a time, `--tool` swapped in the lane):

| variant | v1 counter | v2 counter | v2 tool |
|---|---|---|---|
| plain | `LEDGER66_HELD held=6/6` | `LEDGER66_HELD held=6/6` | `CLEAN … items=33 rows=33` |
| crlf-spotcheck | `held=5/6 … L3 MISS ledger-empty-or-absent` | `held=4/6 … L2 MISS … own-items=0` | `DRIFT … UNLEDGERED:round-55-item-1` |
| fence-in-section | `held=6/6` (own-items=44) | `held=5/6 … L2 MISS … own-items=44` | `DRIFT … items=33` |
| comment-in-section | `held=6/6` (own-items=44) | `held=5/6 … L2 MISS … own-items=44` | `DRIFT … items=33` |

v2 selftest: `ROUTED_LEDGER_SELFTEST: PASS (44/44)` (33 committed + 11 new). v2 binds every real item identically: `ROUTED_LEDGER: CLEAN spotchecks=11 sections=11 items=57 rows=57` (v1 and v2 identical). Parity check over all 32 real rounds 34..65: `violations: []`, `changed: []` — **v2 never reports more items than the counter's own parser**, so L2's `items=` equality survives.

## Findings

**K66ExecToolEdge-1 — severity HIGH — CRLF spot-checks: the whole routed section is invisible and the gate passes silently.**
Attacks: `\r\n` line endings in a spot-check (also a lone `\r`). Expected per the header contract (the section rule is over ATX headings, not over byte encodings): the same items as the LF twin. Observed: `sections=0 items=0`; with an empty ledger, `ROUTED_LEDGER: CLEAN … rows=0` **exit 0** (edge2.mjs P3) — every routed defect of that round escapes the gate. Reproduce: `node $S/edge2.mjs` (case P3) or `node -e` regex probe quoted above.

**K66ExecToolEdge-2 — severity HIGH — a fenced code block or HTML comment inside the routed section is parsed as routed items.**
Attacks: ``` fences and `<!-- -->` blocks inside the routed section. Expected: code and comments are not prose; only column-0 list items and table data rows are items. Observed: `items=5` (E3) / `items=4` (E4a) instead of `3`, producing spurious `UNLEDGERED` findings and `QUOTE_ABSENT` on the real item whose ordinal shifted. The **frozen counter's `items66` shares the blind spot** (`own-items=44` = tool `items=44`), so the counter cannot arbitrate it — a reason to fix the tool, not the counter. Reproduce: `node $S/edge.mjs` cases E3/E4a.

**K66ExecToolEdge-3 — severity HIGH — a routed heading inside a fence or comment steals the section; the real one is never bound.**
Attacks: `## Routed defects` inside a ``` block or an HTML comment, placed before the live section. Expected: the live section binds. Observed: the tool binds the retracted block (`items=1`), and the live items become `ITEM_ABSENT … -of-1` (E4b) — a false DRIFT on a correct ledger, and a false pass in the mirror case. Reproduce: `node $S/edge.mjs` case E4b; `node $S/edge2.mjs` case P5.

**K66ExecToolEdge-4 — severity HIGH — the first matching routed heading wins by position; the corpus already exercises this.**
Attacks: any spot-check with two routed headings. Expected: round-37's own `## Routed defects (lane owes next round)` block (7 items) is round-37's routed section; `## Round-36 routed defects D1–D8` (L84) is a *cross-reference* to the previous round, not round-37's section. Observed: the tool binds L84, `items=27`, and round-37's real 7 items are never bound (edge2.mjs P4, edge7.mjs). Rounds 55..65 are unaffected (one heading each), so C1's own count is unaffected. Reproduce: `node $S/edge7.mjs`.

**K66ExecToolEdge-5 — severity MEDIUM — an answer path is checked lexically, so a symlink bypasses the ledger/spot-check/root guard.**
Attacks: `notes/link.md` → `../corpus/routed-ledger.md`, → a spot-check, or → a file outside the lane root. Expected: the contract says the answer must be a lane file that is neither the ledger nor a spot-check. Observed: all three are accepted with `CLEAN` (E11b, E11c, P6) — an answer located *in the ledger itself* passes. Reproduce: `node $S/edge.mjs` cases E11b/E11c; `node $S/edge2.mjs` case P6.

**K66ExecToolEdge-6 — severity MEDIUM — a second `## Ledger` section in the ledger file is silently dropped.**
Attacks: two `## Ledger` sections. Expected: reported, not ignored. Observed: `rows=3` with the second table's row never parsed and **no finding** (E13); the frozen counter's `ledgerParse` behaves the same (both blind). Reproduce: `node $S/edge.mjs` case E13.

**K66ExecToolEdge-7 — severity MEDIUM — a ledger row without its trailing pipe is mis-parsed by the frozen counter (counter-side defect, reported not patched).**
Attacks: `| … |` with the closing `|` omitted. The tool reads it correctly (7 cells, `rows=3`, CLEAN). The counter's `ledgerParse` does `L[i].trim().slice(1,-1)`, chopping the last character of the answer cell: counter `L3 MISS 1 problems: R55-I1:open-with-answer` while the tool said `CLEAN` (edge6.mjs no-trailing-pipe). The same `slice(1,-1)` also shifts a 6-cell row. Reproduce: `node $S/edge6.mjs`.

**K66ExecToolEdge-8 — severity LOW — typographic quotes in a ledger quote cell are rejected by tool and counter alike.**
Attacks: `“the readme row is missing”` as the quote cell. Both the tool (`quoteRaw.replace(/^"(.*)"$/,'$1')`) and the counter strip only ASCII `"`, while `norm()` folds `“”`→`"` *after* stripping — so the folded quote (now carrying quotes) never matches the item's folded text. `QUOTE_ABSENT` (E10a). The counter agrees, so this is a shared writer-convention limit, not a tool-vs-counter divergence; item-side curly quotes and NBSP are handled correctly (E10b/E10c/E10d → CLEAN).

**Not defects (verified):** `--rev` with a tag, a branch name, `HEAD~1`, `HEAD`, `HEAD^{commit}` (all read committed bytes correctly, CLEAN); `--rev` at a tree without the ledger (FAIL-CLOSED exit 2); ATX headings with trailing `#`; tabs as indentation; setext headings (not a routed heading by the declared rule — fails loudly, not silently); a trailing space or a missing trailing pipe in the **tool**'s own ledger parse; escaped-pipe rows (tool and counter agree to reject).

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecToolEdge/routed-ledger-v2.candidate.mjs` — full v2 draft (44/44 selftest): CRLF/LF normalisation, prose masking for fences and HTML comments, delimiter rows without a trailing pipe, malformed rows missing their trailing pipe, symlink-resolved answer paths, `SECTION_AMBIGUOUS` for two routed headings.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecToolEdge/routed-ledger-v1-to-v2.patch` — unified diff v1→v2 (292 lines).
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecToolEdge/tool-v1.mjs` — byte copy of the committed tool for diffing.
- Harness scripts and raw outputs (scratch, deleted on exit): `edge.mjs`, `edge2.mjs`…`edge14.mjs`, `survey.mjs`, and their `*-out.json`.

## Limits

- I did not edit `scripts/`, `corpus/`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md` or any pinned artifact; the frozen counter, its controls and the plan were read and run, never modified. The counter-side defect (K66ExecToolEdge-7) is reported for the L1 to route, not patched.
- The v2 candidate is a **proposal**: the L1 integrates. It is counter-parity-safe on the measured corpus (v2 items == counter items on all 32 rounds 34..65, `violations: []`), but on a corpus that *does* contain fences/comments/CRLF, v2 and the frozen counter's `items66` will disagree on `items=` — that is the intended tightening (the tool stops counting code as items) but it means L2's `items=` equality check needs the corpus to stay free of those constructs, or the counter's parser needs the same masking in a later round.
- I did not check the `--classes` RECURRENT thresholds, `SCORECARD`/`SKILL.md` registry rows (L6), or the C2 deprecation-registry side at all.
- No claim was made or scored by this seat; no score integer moved.
- Tooling: no installs were needed; nothing was added to PATH. Node v24.21.0 was used as shipped.

Stop recorded on the operator's wrap-up directive (2026-10-27): the round work above is complete and the lane worktree is left as found (build artifacts and this report only).
