# Attack on the filed round-65 report (D6)

Target: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-65/kumitate.md` (15760 bytes, sha256 `7e719f1ca7ae…`, filed 2026-10-25 23:57) against the lane's committed receipts at rev `52f8497987eaae42c3be668cdd5e90a34c5bf48e`.

## Method

1. `node scripts/report-receipt-diff.mjs --lane … --round 65 --report … --rev 52f84979… --fleet …` (receipt/quote/hash/placeholder/tally/section check).
2. Hand-checks of the classes the tool does not cover: seat counts vs `w1-results.json`, role mix, tree-wide counts at named commits, live-state claims, provenance attributions, row-identity bindings.

## Tool verdict

```
REPORT_RECEIPT: CLEAN (round=65 rev=52f8497987eaae42c3be668cdd5e90a34c5bf48e bytes=15760 report_sha256=7e719f1ca7ae)
EXIT=0
```

Every receipt quoted in the report exists at the rev and carries the quoted bytes; every cited hash resolves; no placeholders. The attack below is therefore entirely in the unchecked classes.

## Hand-check results

### Verified TRUE (no finding)

- **Seat counts / role mix.** `w1-results.json` (committed at `090b4dd73b5c30da81f8fee387f1d152f077917a`, whose diff touches only that file): 45 results, 45 with output, none failed/dead. Names give Exec 16, Scribe 7, Scout 6, Critic 5, Review 4, Conn 3, Mutate 2, Sentinel 1, Revenger 1 — exactly the report's table. m_flash 23/45 = 51.1 %, attack 12/45 = 26.7 %, connectors 3 — all exact. Results entries carry fields `name/agent/output/note` only: "no per-seat status field" (erratum) is correct.
- **Erratum.** `git show --name-only 090b4dd7` → only `.ufo/waves/round-65/w1-results.json`. ✔
- **"45 of 45 by the receipt commit."** Tree at `62897df4` holds 45 `w1/K65*.md` reports. ✔ (but see Finding 2 on the "44" half.)
- **SOURCES rows 139 → 145.** `grep -cE '^\| S[0-9]{3} \|'` at `47fe2383…` = 139; at `62897df4…` = 145. ✔ Exact.
- **Six pinned captures for S201–S206.** `.ufo/pins/source-captures.json` at both `2b1f416e…` and `62897df4…`: captures=38 total, S201–S206 each bound (sha256 + path). ✔
- **Registry 36 gates** (`scripts/harm-matrix-gates.json` at close: 36). ✔
- **Dispatch counts.** `w1-dispatch.json`: `{spawn:45, resume:0, total:45}`. ✔
- **Selftest receipts.** `close/harm-matrix-selftest.txt` at landing and close: `HARM_MATRIX_SELFTEST: PASS (114/114)`. ✔
- **Band provenance.** "(band 64–100)" is the round-total band: r65 plan line "Round total 64–100" and `scripts/hyaku/lane-addendum.md` ("Round size: 64–100 seats in total… one v2 wave of 64–100, or two v1 waves (32–64 each)"). The self-verdict "incomplete… round total 45" is correctly reasoned against the 64 floor. (Candidate attack rejected.)
- **Freeze receipts named in the report exist** at the freeze commit `2ca91a0c…` (`report-receipt-diff-selftest-freeze.txt`, `plan-before-ready-selftest-freeze.txt`, `omp65-donothing.txt`, `harm65-base.txt`, `readme-map-before.txt`, `census-before.txt`). ✔ (but see Finding 4 for two receipts NOT at the freeze.)
- **K-layer claim was receipt-consistent at filing.** Both freeze pair receipts carry `KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/) [exit=1]` — exactly "MEMBER_MISSING ×4", and "49 of 53" = 49 live members of the 53-member rule set. State at filing, not fabricated.

### Findings

See `../w1/K66CriticR65Report.md` for the numbered findings with severities. Headlines:

1. **Both filed verdicts fail re-execution today.** Frozen counters at the measured rev `2b1f416e…` now read `HARM65_UNMET held=4/5` (H3 MISS) and `OMP65_UNMET held=7/8` (O6 MISS). Mechanism: live-host-dependent gate arms — proxy-check's K terms resolve against the live `~/.kimi-code` census (49→53 when the four missing dirs reappeared, mtimes Oct 27 03:40), and `~/.local/bin/omp` is now a raw 275,986,608-byte ELF (Oct 27 00:02) with `~/.local/bin/omp.real` gone, so `omp-binary-probe.sh` fails closed (`real-unidentified`). The report quoted receipts faithfully but H65's H3 direct re-measurement is exactly as host-dependent as O6 and is not disclosed as such; neither verdict line survives two days.
2. **"44 seat reports present at the first landing" — false provenance.** The 44 came from the orchestrator's in-flight snapshot `35abe21ba…` ("not a landing"); the landing commit `2b1f416e…` itself added the 45th report (`K65ConnOmpSources.md`, A) and modified `K65ConnOverlap.md` (M); the landing tree held 45.
3. **Lesson Gate row-id mismatch + missing rows + false live grep.** Gate table row "S205" cites the `client.ts` URL — that is SOURCES row S204's document; actual S205 (`zai.ts`) and S206 (`http.ts`) have no Gate record; the Gate's own text asserts `grep -cE '^\| S206 \|' corpus/SOURCES.md → 0`, which is false at the committed revision (the S206 row exists at `2b1f416e…`). The report's "the lesson's ## Gate carries URL, date and quote per row" thereby overstates coverage.
4. **Two receipts misattributed to the freeze.** `base/plan-before-ready-freeze.txt` and `base/harm65-at-freeze.txt` are absent from the freeze commit `2ca91a0c…`; they were committed at the landing `2b1f416e…`. Contents match the quotes; only the provenance sentence is off.
5. **K-layer sentence is a transient snapshot with no close receipt.** True at filing (freeze pair receipts), but the r65 close receipts contain no census run, and the state has inverted: `node scripts/kimi-census.mjs` today → `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=10 info=4)` exit 0; the proxy K drift (declared=49 computed=53) is real today at every pre-r66 archive. "stays DEGRADED" overgeneralizes.

## Reproduction commands (all read-only; TMPDIR under scratch)

```
# F1
TMPDIR=$S node .ufo/waves/round-65/probe/harm65-probe.mjs <lane> 2b1f416e07b743caae8bcbdd0e9a74ea128feb64   # → HARM65_UNMET 4/5, H3 MISS
TMPDIR=$S node .ufo/waves/round-65/probe/omp65-probe.mjs <lane> 2b1f416e07b743caae8bcbdd0e9a74ea128feb64   # → OMP65_UNMET 7/8, O6 MISS
TMPDIR=$S bash scripts/omp-binary-probe.sh    # → OMP_BIN_PROBE: FAIL-CLOSED real-unidentified, exit 2
ls -la ~/.local/bin/omp* ; file ~/.local/bin/omp    # omp = 275 MB ELF, Oct 27 00:02; omp.real absent
git archive a004902d77d1 | tar -x -C $A ; (cd $A && node scripts/proxy-check.mjs --strict)   # → K_MEMBERS_DRIFT declared=49 computed=53

# F2
git ls-tree -r --name-only 35abe21ba64064c028060a8e4f31984b65b26df0 | grep -c 'w1/K65.*\.md'   # 44
git diff --name-status 2b1f416e07b743caae8bcbdd0e9a74ea128feb64^ 2b1f416e07b743caae8bcbdd0e9a74ea128feb64 | grep 'w1/K65.*\.md'
# → A .ufo/waves/round-65/w1/K65ConnOmpSources.md ; M .ufo/waves/round-65/w1/K65ConnOverlap.md

# F3
git show 2b1f416e…:corpus/lessons/round-65.md   # Gate row "| S205 | …src/mcp/client.ts…"
git show 2b1f416e…:corpus/SOURCES.md | grep -E '^\| S20[456] \|'   # S204=client.ts S205=zai.ts S206=http.ts
git show 2b1f416e…:corpus/SOURCES.md | grep -cE '^\| S206 \|'      # 1 (Gate claims 0)

# F4
git cat-file -e 2ca91a0c…:.ufo/waves/round-65/base/plan-before-ready-freeze.txt   # MISSING at freeze; present at 2b1f416e
git cat-file -e 2ca91a0c…:.ufo/waves/round-65/base/harm65-at-freeze.txt           # MISSING at freeze; present at 2b1f416e

# F5
node scripts/kimi-census.mjs    # → KIMI_CENSUS: CLEAN (members=53 checked=53 chain=10 info=4), exit 0
```

## Counterexample test (strongest local evidence against my own F1)

Could the report have prevented F1? It disclosed "O6 depends on the host binary" for C2 and the receipt quotes are honest. But H65's H3 is a *direct re-run* of readme-map/proxy-check on archived revisions ("independent of the tool", probe lines 118–152), and proxy-check resolves K members against live `~/.kimi-code` — so the "frozen" H65 predicate contains a live arm whose value changed without any lane action. The report presents "Verdict by the frozen counter: verifies" as durable; today it is not. This is a fixable defect in reporting practice (date-stamp live-dependent verdicts; record host-state pins), not a reason to reject the round-65 landing, whose committed bytes still verify against their dated receipts.

## What I did NOT check (limits)

- `git ls-remote origin refs/heads/master` = 62897df4… (network; master has since advanced to 88041bc9).
- Orchestrator-side claims: dispatcher log ending 23:15, WAVE-DONE timing, "Answering models were not tallied".
- Seat-level numeric claims resting on other seats' reports: "12 + 11 mutation survivors", "27 failure arms" (probe header comment confirms 27), "67-line stub", "five fabricated rows", collision-guard counts 139/155 (receipt exists; counts not re-derived).
- Re-running the full harm-matrix selftest or the 16 freeze controls.
