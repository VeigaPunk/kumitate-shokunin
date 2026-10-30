VERDICT: The v2 draft `routed-ledger.mjs` (sha256 `05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1`, unmodified since the r68 receipt) is operable on this host — selftest `PASS (56/56)` exit 0, and its parser counts the live corpus byte-identically to the frozen probe's own parser (`items=61 sections=12 spotchecks=12`) — so L1 is satisfied and L2 has no structural blocker; two benign divergence notes and data-grammar requirements below.

## Evidence

All commands run once in `/fast/scratch/hyaku/kumitate-r69/K69ScoutV2Tool/` (deleted at yield; verbatim outputs persisted under `build/K69ScoutV2Tool/receipts/`).

**(1) Selftest on this host** (node `v24.21.0`; draft copied to scratch; `TMPDIR` pointed at scratch):
```
$ node --version
v24.21.0
$ TMPDIR=$S node routed-ledger-v2.mjs --selftest > selftest.out 2> selftest.err; echo "exit=$?"
exit=0
$ tail -n 8 selftest.out
CASE ok usage: unknown argument → exit 64
CASE ok usage: --root without a value → exit 64
CASE ok usage: --from abc → exit 64
ROUTED_LEDGER_SELFTEST: PASS (56/56)
```
`selftest.err` is empty (0 bytes). Full stdout at `build/K69ScoutV2Tool/receipts/host-selftest.txt`. Matches the r68 receipt `receipts/selftest.txt:57` (`ROUTED_LEDGER_SELFTEST: PASS (56/56)`) and `peer-acceptance.txt:55` (`ROUTED_LEDGER_ACCEPTANCE: PASS (54/54)`). Draft sha256 equals the one recorded in `receipts/l2-style-clean.txt:1`.

**(1b) Draft over the real corpus (skeleton `## Ledger`, zero rows)** — copy of live `corpus/lessons` + header-only ledger:
```
ROUTED_LEDGER: DRIFT spotchecks=12 sections=12 items=61 rows=0 open=0 closed=0 wontfix=0 findings=61 first=UNLEDGERED:round-55-item-1   (exit=1)
```
61 findings, all `UNLEDGERED` — the expected skeleton shape; counts match the frozen base receipt's `own-items=61 own-sections=12 own-spotchecks=12` (`.ufo/waves/round-69/base/ledger69-base.txt`). Receipt: `build/K69ScoutV2Tool/receipts/host-realtree-skeleton-run.txt`. `corpus/lessons/` holds 35 spot-checks, rounds 34–68; exactly 12 in [55,66].

**(3) Byte-exact parser parity, probe `items67` vs draft `routedSections`** — probe function extracted into a scratch harness (`build/K69ScoutV2Tool/receipts/parity-probe-vs-draft.mjs`), both run over the same 12 live files:
```
{"probeItems":61,"draftItems":61,"probeSections":12,"draftSections":12,"itemTextDiffs":[]}
```
exit=0 — identical item TEXT, not just counts. Receipt: `host-parity.json`.

**L1/L2 expectation vs draft (probe `ledger69-probe.mjs`):**
- L1 (probe:203-211): regex `^ROUTED_LEDGER_SELFTEST: PASS \((\d+)/(\d+)\)$`, `n>=44`, exit 0 → draft prints `PASS (56/56)`, exit 0. Satisfied (56 ≥ 44); v1's 33 would MISS.
- L2 (probe:224-236): second clean extraction B, `node TOOL_B --root B --from 55 --to 66` (probe:231 — **without** `--classes`, though plan.md's L2 sentence names it; CLASS/RECURRENT lines precede the verdict and the probe reads only the last line, so verdict-invariant), regex `CLEAN spotchecks=(\d+) sections=(\d+) items=(\d+) rows=(\d+) ` (probe:233) — draft's CLEAN head format matches — requiring spotchecks==12, sections==own, items==own, rows>=own (probe:234). Draft yields 12/12/61 on the live bytes; CLEAN implies rows ≥ items (any uncovered item or invalid row is a finding → DRIFT). The extraction has no `.git`; the probe invokes the tool without `--rev`, so the tool's direct-read path is exercised, not `readRev`.

## Findings

**K69ScoutV2Tool-1** (info, no action): frozen probe L2 (ledger69-probe.mjs:231) omits `--classes` where plan.md's L2 sentence includes it; no outcome change (see above). The counter is the claim's rule; record only, never patch mid-round.

**K69ScoutV2Tool-2** (low, future-corpus guidance): section-end semantics differ. Draft breaks a routed section at any same-or-shallower heading (routed-ledger.mjs:130-132, `if (m && m[1].length <= h.lvl) break;`); probe `items67` (ledger69-probe.mjs:153-162) has **no level check** — its section runs to the next *routed* heading or EOF, so list/table content under a later non-routed heading would be items for the probe but not the draft → L2 items mismatch. Measured byte-exact parity on today's 55..66 files (see Evidence 1b/3), and the probe recomputes its own count at M, so no risk this round unless integration edits an in-range spot-check — advise: never add list content between an in-range routed heading and the next routed heading in `corpus/lessons/round-55..66-*.md`. Repro: `node build/K69ScoutV2Tool/receipts/parity-probe-vs-draft.mjs` (scratch harness, copied).

**K69ScoutV2Tool-3** (low, data-author guidance): probe L3 counts words raw (`nwords`, ledger69-probe.mjs:133, plain whitespace split) while the draft normalizes first (`words`, routed-ledger.mjs:93, strips markdown/HTML/entities). A quote padded with markdown/HTML could pass the tool's 3..25 window yet MISS L3 `quote-words`. Keep ledger quotes plain prose. Repro: compare `nwords('"**a** <b>b</b> c"')` = 3 vs draft `words` after norm = 3, but heavier padding diverges.

**K69ScoutV2Tool-4** (info, L3 arms beyond tool-CLEAN — binds the DATA, not the tool): probe L3 (ledger69-probe.mjs:238-281) additionally requires: no malformed rows; every round-66 item carries a closed/wontfix row whose answer quote is NOT found (`norm(before).includes(norm(quote))`, substring on normalized whole file) in the answer file at R66BASE `8d557f85312de4fcc82e09ff735d21436bc3746d` — the answer wording must be genuinely new, a reworded repeat of old text fails; ≥5 distinct classes; ≥1 class spanning ≥4 distinct spot-check rounds. Tool-CLEAN is necessary, not sufficient, for L3.

**K69ScoutV2Tool-5** (info, integration mechanicals): L1/L2 read `scripts/routed-ledger.mjs` from `git archive M` (probe:78-97; symlinked tool → L1 MISS at probe:206,446-464), so the draft bytes must be committed at that path in M; L2 runs in extraction B (no `.git`, no `--rev`), probe children get allow-list PATH/TMPDIR/LANG (probe:76) and the draft's selftest honours TMPDIR via `tmpdir()`.

## Artifacts
- Report: `.ufo/waves/round-69/w1/K69ScoutV2Tool.md`
- `build/K69ScoutV2Tool/receipts/host-selftest.txt`, `host-selftest.err.txt`, `host-realtree-skeleton-run.txt`, `host-parity.json`, `host-sha256.txt`, `parity-probe-vs-draft.mjs`

## Answer to (2): what `corpus/routed-ledger.md` must satisfy for the tool to print CLEAN (exit 0, zero findings) — draft grammar by line

- Read path: `corpus/routed-ledger.md` (routed-ledger.mjs:53), regular file inside `--root`, no symlink in chain (:246-267); a line exactly `## Ledger` must exist (`/^##\s+Ledger\s*$/`, :158) else FAIL-CLOSED `ledger-has-no-Ledger-section` (:258).
- **Row grammar** (`ledgerRows`, :156-171): table lines from `## Ledger` until the next `#` heading (:161-163); `|---|` separators skipped (:166); header row with first cell `id` skipped (:167); each data row EXACTLY 7 cells (:168): `id | round | item | "quote" | class | status | answer` (:169). Validation in `evaluate` (:296-313): id `^[A-Za-z0-9][A-Za-z0-9.-]*$`, unique (`ROW_DUPLICATE`), `R<n>-` prefix must equal the round cell (:304-305); round/item digits, item ≥ 1; quote 3..25 normalized words (:300-301); class `^[a-z][a-z0-9-]*$` (:302, lowercase-first, hyphen/digit tail — this is the **class grammar**, same regex gates `--classes` output at :356); status ∈ open|closed|wontfix (:303); open ⇒ answer cell exactly `-`.
- **Quote binding**: optional surrounding double quotes stripped (:170); quote must be word-boundary-located in item k's text (:325) and hit EXACTLY ONE item across all routed items of that round's file (:323-324, `hits>1` → QUOTE_AMBIGUOUS) — uniqueness scope is the whole spot-check file's pooled routed items.
- **Answer grammar** (closed/wontfix, :310): `` /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/ `` — `` `path:line` `` (backticks optional, no spaces/backticks in path) + whitespace + em-dash/hyphen run + whitespace + double-quoted quote ≤ 25 words (:312); spaces around the dash are mandatory. Path (:329-334): relative, no `..`, ≠ the ledger, not ANY spot-check (`SPOT_RE`, :56, any round); must exist as a regular file inside root, never through a symlink (:231-244). Line 1-based within the file (:337) and the answer quote word-boundary-located on that EXACT line, no window (:338).
- **Coverage**: every routed item of every spot-check in [55,66] covered by ≥1 valid row (:350) else UNLEDGERED; at most one non-open row per (round,item) (:341-345). **Item grammar** (`routedSections`, :104-146): routed headings (`HEAD_RE` :57, `\brouted\s+(defects?|items?)\b`) outside fences (`FENCE_RE` :58); items are non-separator table rows (:131-132) and list bullets (`LIST_RE` :59) with continuation lines (nested bullets append to the same item; column-0 prose after a blank line starts no item, :139-140); ordinals are global per FILE across all its routed sections; a prose-only routed section yields 0 items and stays CLEAN. Exit codes: 0 CLEAN / 1 DRIFT / 2 FAIL-CLOSED / 64 USAGE (:690-732).

## Limits
- Did not run the frozen probe end-to-end (its L4/L5/L7 arms and double `git archive` extraction are the L1's counting run; I exercised its parser and the draft directly instead). Did not diff rounds 55..66 lesson bytes between the r68-era base and `14057f3e` — parity was measured on LIVE worktree bytes and corroborated by the frozen base receipt's own 61/12/12. Did not exercise the draft's `--rev`/git paths against a real repo here (selftest covers them; probe L2 doesn't use them). C2/deprec side out of scope. Scratch dir deleted; no tool installs were needed (system node v24.21.0 sufficed).
