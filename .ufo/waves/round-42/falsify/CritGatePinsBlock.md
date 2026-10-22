RESULT CritGatePinsBlock rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=widening issues=5
Scratch clone /fast/scratch/hyaku/kumitate-r42/falsify/CritGatePinsBlock/lane at c9a084bf; P=/fast/scratch/hyaku/kumitate-pin/src. Probes edit only SCORECARD copies under ../sc/ (passed with --scorecard), each run as `setsid -w prlimit --nproc=<threads+64> timeout -s KILL 30 node scripts/proxy-check.mjs --src $P --scorecard sc/<x>.md [--strict]`. Host ps is uutils 0.2.0 with no -L, so the thread count came from `ps -u $UID -o nlwp=` summed. Leftover proxy-check processes afterwards: 0. No tools installed.
Confirmed: `node scripts/proxy-check.mjs --src $P` gives `PROXY: MATCH (A=10 C=19 operability=9; ... K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)` exit 0. `--strict` gives the same line, exit 0, 0 warnings. `--selftest` gives `PROXY_SELFTEST: 121/121 pass`. The four sha256sum values equal SCORECARD.md:313-316.
Confirmed fail-closed or failing, with exit codes shown as default/strict: one gate hash set to zeros gives 1/1 (`GATE_PIN_DRIFT term=pin.anchor-truth declared=000… computed=f31ce40f…`). An unknown key gives 2/2 (`GATE_PIN_KEY_UNKNOWN`). A duplicate key gives 2/2. Upper-case hex gives 2/2 (`GATE_PIN_MALFORMED`). A second quoted head gives 2/2. Adding `pin.sources-check` to the v1 stanza gives 2/2 (`STANZA_KEY_UNKNOWN`).
ISSUE 1 (widening; it attacks the claim "v1's 23 keys unchanged" in SCORECARD.md:1893 and the commit subject). The key set is unchanged. The substance of the round-34 ruling is not:
  SCORECARD.md:344-346 says "`sources-check` is not a v1 pin ... the existing `PIN_UNPINNED` advisory is therefore retained". lessons/round-34.md:137 says "the existing `PIN_UNPINNED` advisory is not suppressed". LOG.md:1536-1538 says the same.
  At c9a084bf the same key name `pin.sources-check=<hex>` is enforced again by the same tool, and its warning is suppressed (strict: 0 warnings). The tool still declares `contract: kumitate-proxy-v1` in its JSON output and in `--help`.
  The v1 verdict now depends on bytes outside the 23-key stanza: there is one new exit-1 kind (GATE_PIN_DRIFT) and two new exit-2 arms. Evidence: `git diff dfabe92 c9a084bf -- scripts/proxy-check.mjs` adds `parseGatePins` and `compareGatePins`, and adds these kinds to FINDING_KINDS and FAIL_CLOSED_KINDS.
  `git diff -U0 dfabe92 c9a084bf -- SCORECARD.md` leaves the round-34 paragraph (lines 342-347) untouched. No dated note supersedes it, so SCORECARD.md:270-275 and :344-346 now contradict each other.
  The lane itself says the ruling is open: lessons/round-42.md:124-125 ("whether a lane-owned second block is acceptable under the frozen contract is for the operator") and SCORECARD.md:1903. Yet SCORECARD.md:1891-1893 and LOG.md:1854 count R41-2 as landed, "warnings 3 → 0". This is the round-34 move that was reverted, put back under a new block name.
  `rg -l 'kumitate-proxy-v1|gate-pins-v1'` over the fleet repo (lanes excluded, depth 4) finds nothing. The frozen authority exists only in the lane's own round-34 text.
ISSUE 2 (defect: fail-open on absence; it attacks "fails closed"). In each case below, the verdict line is byte-identical to the live MATCH line:
  delete the block: 0/1
  rename the head by one character (`<!-- kumitate-gate-pins v1`): 0/1
  collapse it to the single line `<!-- kumitate-gate-pins-v1 -->`: 0/1
  drop the line `pin.gate-mutants=`: 0/1
  Strongest case: append `// tamper` to scripts/sources-check.mjs. With the live block, the default run exits 1. With the renamed head, the default run gives `PROXY: MATCH (...)` and exits 0. File restored afterwards; `git status --porcelain` shows 0 lines.
  The checklist item SKILL.md:684 runs the default mode (`node scripts/proxy-check.mjs` → exit 0 + `PROXY: MATCH`), so it cannot see any of these.
  In v1, a missing key fails closed (STANZA_MALFORMED, exit 2). The gate block accepts any subset of its keys, including none.
  The selftest has no case for an absent block: every fixture writes the gate head (proxy-check.mjs:1510).
ISSUE 3 (defect, minor). The head is matched by prefix (`trim().startsWith`, proxy-check.mjs:1023). Changing the head to `<!-- kumitate-gate-pins-v17` gives 0/0 with no warnings: a different contract id is accepted as this block. STANZA_HEAD (line 303) has the same latent prefix match.
ISSUE 4 (the format is unchanged, but the verdict carries no evidence of the gate pins). `git diff dfabe92 c9a084bf -- scripts/proxy-check.mjs | grep -c 'renderVerdict\|findingSummary\|function summarize'` prints 0. So the MATCH line format is unchanged, and the DRIFT line uses the old KIND/term/declared/computed shape.
  The PIN_UNPINNED finding text did change: it now reads "... in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza".
  The MATCH line reads `pins=6 match` whether four gate pins were verified or the block is absent (issue 2). The `--json` keys are terms, findings, errors and so on, with no gate-pin field.
  So SKILL.md:608 ("pinned in the `kumitate-gate-pins-v1` block") cannot be proved from a quoted verdict.
ISSUE 5 (documentation drift).
  The header list of fail-closed arms, "checked in this order" (proxy-check.mjs:227-232), omits GATE_PIN_MALFORMED and GATE_PIN_KEY_UNKNOWN.
  `--help | grep -i gate` finds only two unrelated lines (18 and 35).
  corpus/knowledge/executable-scorecard.md is not changed by the commit, yet SCORECARD.md:285 points to it for "Grammar and boundary".
  The hard-coded lane-specific GATE_PINS table contradicts that note's "lane-agnostic" reuse path (lines 316-321).
Impacted axes: operability. A gate that loses its pin protection with no visible signal is weaker than its claim. The C1 proxy terms are not moved.
Smallest safe correction:
  (a) Record R41-2 as "landed pending parent ruling", not as closed. Add a dated note next to SCORECARD.md:342-347 saying the clause "advisory retained" is superseded, pending that ruling.
  (b) Change SKILL.md:684 to `node scripts/proxy-check.mjs --strict`. It passes live today (exit 0) and catches all four cases in issue 2. C is unchanged.
  (c) Match the head exactly (`trim() === GATE_PIN_HEAD`).
  Design limit: making an absent block fail closed would make the block mandatory for every user of v1, which widens v1 further. So the clean fix is either a parent ruling or moving gate-pin verification out of the v1 tool. No patch file was written.
