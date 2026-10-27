VERDICT: The round-66 lesson skeleton is drafted with a full, pointer-verified `## Mistakes` (class `routed-unledgered`) whose fix I ran in both directions on a scratch clone — `CLEAN` exit 0 with the row, `UNLEDGERED:round-55-item-1` exit 1 without it — and I found one measured hole: a routed defect written as prose inside the routed section reads `CLEAN items=0 rows=0` exit 0.

## Evidence

1. Pointer verification for the mined mistake (D1).
```
$ grep -n "carries URL, date and quote" /home/vgpnk/Projects/shokunin/.ufo/reports/round-65/kumitate.md
48:- Sourced claim: C2 cites S201–S206 (… the lesson's `## Gate` carries URL, date and quote per row).
$ node -e "…corpus/lessons/round-65.md split…"   # Gate table rows
71: | S204 | …/v18.12.6/packages/coding-agent/package.json | "\"version\": \"18.12.6\"," …
72: | S205 | …/v18.12.6/packages/coding-agent/src/mcp/client.ts | "protocolVersion: MCP_PROTOCOL_VERSION," …
79: (`grep -cE '^\| S206 \|' corpus/SOURCES.md` → `0`).
$ node -e "…corpus/SOURCES.md split…"
156:  S204 | oh-my-pi v18.12.6, packages/coding-agent/src/mcp/client.ts …
157:  S205 | oh-my-pi v18.12.6, packages/coding-agent/src/web/search/providers/zai.ts …
$ grep -cE '^\| S206 \|' corpus/SOURCES.md
1
```
The lesson's Gate carries five rows (S201–S205) and states no S206 was added; the landed registry is S204=client.ts, S205=zai.ts, S206=http.ts. Report line 48's sentence is false for two of six rows — D1 exactly as routed (`corpus/lessons/round-65-verifier-spotcheck.md:71`).

2. Recurrence and the uncounted surplus.
```
$ grep -rl 'R56-V3' corpus/lessons | wc -l
9
$ grep -n "eleventh" .ufo/waves/round-65/plan.md
115:  eleventh R56-V3-family recurrence) …
$ TMPDIR=<scratch> node <cnt.mjs>        # routedItems() over git show HEAD:corpus/lessons/round-N-verifier-spotcheck.md, N=55..65
round 55: found=true items=3 … round 59: found=true items=0 … round 65: found=true items=7
TOTAL sections=11 items=57
$ node scripts/routed-ledger.mjs --root <clone> --rev 88041bc9 --from 55 --to 65
ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md
EXIT=2
```

3. The fix shown able to fail (scratch clone `git clone --shared`, `git -C <clone> rev-parse --show-toplevel` = the clone; no git write, no commit).
```
$ node scripts/routed-ledger.mjs --root <clone> --from 55 --to 55 --ledger corpus/routed-ledger.md
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=2 rows=2 open=0 closed=2 wontfix=0
EXIT=0
$ node scripts/routed-ledger.mjs --root <clone> --from 55 --to 55 --ledger corpus/routed-ledger.minus.md   # R55-D1 row deleted
FINDING UNLEDGERED round-55-item-1
ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=2 rows=1 open=0 closed=1 wontfix=0 findings=1 first=UNLEDGERED:round-55-item-1
EXIT=1
$ node scripts/routed-ledger.mjs --selftest
ROUTED_LEDGER_SELFTEST: PASS (33/33)
EXIT=0
```
Frozen receipt for the same selftest: `base/routed-ledger-selftest-freeze.txt` → `PASS (33/33)`, `EXIT=0` (byte-identical verdict line).

4. Prose hole.
```
$ node scripts/routed-ledger.mjs --root <clone> --from 56 --to 56 --ledger corpus/routed-ledger.prose.md
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=0 rows=0 open=0 closed=0 wontfix=0
EXIT=0
```
(spot-check section body: `One lane-owned defect: the Gate row table is stale against the registry (S205/S206), see the report.`)

5. Current state of the other routed items the lesson carries.
```
$ grep -c 'harm-matrix\|omp-binary-probe' SKILL.md
0
$ grep -n harm-matrix SCORECARD.md | cut -c1-60
2995:**C1 — operability, capability acquisition `harm-matrix`.** …
$ grep -n 'round-65-verifier-spotcheck' corpus/README.md
195:| `lessons/round-65-verifier-spotcheck.md` | Round-65 non-author verification …
$ grep -n 'S205\|S206\|D1' .ufo/waves/round-66/plan.md | cut -c1-120
99:  row" while S205/S206 had no Gate record, D1); captured-by: none until C1.
100:- **Routed R65 defects** D1–D7 answered in `corpus/routed-ledger.md` rows with located answers …
```

## Findings

**K66ScribeLesson-1 — medium — the ledger gate can be laundered by prose.**
Attacks C1's L2/L3: the section rule counts only column-0 list items and table data rows (`scripts/routed-ledger.mjs` header, "Section rule"), so a routed defect stated as a paragraph inside the routed section is not an item and needs no row. A round that writes its routed section as prose reads `CLEAN items=0 rows=0`, exit 0, and L2's `items=` would agree with the counter's own count because both parse the same way — mutual agreement on an undercount. The plan's stated limit names round 59's historical prose section, not this path.
Reproduce: `node scripts/routed-ledger.mjs --root <clone> --from 56 --to 56 --ledger corpus/routed-ledger.prose.md` with a prose body in `corpus/lessons/round-56-verifier-spotcheck.md` → `CLEAN … items=0 rows=0`, `EXIT=0`. Fix (ratchet, L1's to make): a prose-only routed section that contains a defect token (`D<n>`, `the … is stale/missing/absent`) becomes a finding, new selftest case.

**K66ScribeLesson-2 — low — the only fix D1 names has no named owner in the frozen plan.**
D1's routed fix is "appended correction in the round-66 lesson with the per-row Gate record" (`corpus/lessons/round-65-verifier-spotcheck.md:71`); the plan assigns the rows (`plan.md:100`) and names the case (`plan.md:99`), and says the lesson's `## Gate` records admits/rejects, but no line tells the Gate-drafting seat that S205/S206 per-row records are owed. My skeleton keeps `## Gate` as a placeholder heading only (seat spec) and points at the debt from `## Mistakes` and `## Routed defects answered`, so the Gate seat must read the spot-check to learn it.
Reproduce: `grep -n 'S205\|S206' .ufo/waves/round-66/plan.md` → hits at :80 (M7, a different check), :99, :101; no assignment line.

**K66ScribeLesson-3 — low — a frozen lesson carries a command whose output has since changed.**
`corpus/lessons/round-65.md:79` states `grep -cE '^\| S206 \|' corpus/SOURCES.md` → `0`; it reads `1` at HEAD, so the frozen record of "no S206 is added" now contradicts the registry it describes and nothing re-reads it. It is the same class the mistake row mines (record without a binding), at one-line scale; the D1 ledger row is the only thing that would tie the correction to the command.
Reproduce: `grep -cE '^\| S206 \|' corpus/SOURCES.md` → `1` vs `corpus/lessons/round-65.md:79`.

No blocker: no installs (no tool installed or upgraded this seat), no pacman, no fleet/lane mutation, scratch deleted.

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeLesson/round-66.md` — lesson draft (`## Claims`, `## Gate` placeholder, `## Mistakes`, `## Routed defects answered`, `## Close status`).
- `.ufo/waves/round-66/build/K66ScribeLesson/run-pass.txt`, `run-fail-unledgered.txt`, `run-base-head.txt`, `run-selftest.txt`, `run-prose-hole.txt`.
- `.ufo/waves/round-66/build/K66ScribeLesson/minimal-spotcheck-55.md`, `minimal-ledger.md`, `minimal-answers.md`, `prose-spotcheck-56.md`, `prose-ledger-empty.md`, `items-55-65.txt`.
- `.ufo/waves/round-66/w1/K66ScribeLesson.md` — this report.

## Limits

- No `M` exists: every "after" value in the lesson is the counter's declared predicate, unobserved; no `LEDGER66_HELD` / `DEPREC66_HELD` reading was taken by this seat.
- I ran the tool only in `--from 55 --to 55` and `--from 56 --to 56` on fixtures, and `--rev 88041bc9 --from 55 --to 65` on the absent ledger (fail-closed before counting); no full-lane clean reading exists because `corpus/routed-ledger.md` is unwritten and I may not write it.
- The D1–D7 answer anchors are proposals; none was accepted by the tool (the anchors they name — the Gate record, the capability row, `SKILL.md` rows — do not exist yet except D7's `corpus/README.md:195`).
- I did not re-derive C2 or the MCP registry; the `## Gate` content is another seat's.
- Spot-check text is read through the tool's own `norm()`; a quote whose source line has since been edited could read `QUOTE_ABSENT` for reasons outside the ledger.
