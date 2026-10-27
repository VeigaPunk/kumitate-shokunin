VERDICT: All seven round-65 routed items (D1–D7) carry a ledger row whose item quote and answer quote the committed tool locates (`ROUTED_LEDGER: CLEAN … items=7 rows=7` exit 0 on a scratch tree over round 65), with five classes from the canonical 13-slug set of seat `K66ScribeClasses` and every answer target new since base `8d557f85`; D2/D3 stand on drafted row text because their home is L1 scope, and D5 is the wave-ordered placeholder.

## Evidence

Lane read at `88041bc9f45b06560bbd807bd1ea7b44126aa49f` (clean except the wave's own untracked dirs). No lane file was
written outside this seat's report/build paths; scratch was `/fast/scratch/hyaku/kumitate-r66/K66ScribeLedger65` (deleted).

Item ordinals, from the tool's own parser (not a hand count):

```
$ node --input-type=module -e "import {routedItems} from '…/scripts/routed-ledger.mjs'; …"
found true n 7
1 "- **D1 — Gate row table contradicts the registry.** …"
2 "- **D2 — capability row missing.** …"
3 "- **D3 — registry home.** …"
4 "- **D4 — proxy stanza stale** …"
5 "- **D5 — `cite-check-fleet-dot` errors 1545 → 1637 (+92) across two new files** …"
6 "- **D6 — round size / wave 2.** …"
7 "- **D7 — README row for this file.** …"
```

Rounds 55..65 item census (same parser, independent of the counter): `spotchecks 11 items 57`, round 59 `items 0`
(its routed section is prose — the plan's stated limit), round 65 `items 7`.

The whole draft ledger run through the committed tool on a scratch tree (lane's spot-check + README + base receipt +
dispatch record copied in; draft `## Ledger` as `corpus/routed-ledger.md`):

```
$ node scripts/routed-ledger.mjs --root $S/v --from 65 --to 65 --classes
CLASS citation-integrity rows=1 rounds=65
CLASS reference-drift rows=2 rounds=65
CLASS registry-home rows=2 rounds=65
CLASS report-fidelity rows=1 rounds=65
CLASS wave-shape rows=1 rounds=65
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=7 rows=7 open=0 closed=5 wontfix=2
EXIT=0
```

Classes are the canonical set of the classes seat (`K66ScribeClasses` re-slugged this seat's first draft: D1 `tally-drift`
→ `citation-integrity`, D4 `tally-drift` → `reference-drift`, D5 `census-warning` → `report-fidelity`, D6 `round-size` →
`wave-shape`, on the ground that each pair shares one fix; its 57-row table is
`.ufo/waves/round-66/build/K66ScribeClasses/classes.md`). The rows were re-run under the adopted slugs — same verdict.

Every item has a row (`UNLEDGERED` absent), every item quote is located (`QUOTE_ABSENT` absent) and every answer quote
is located at its stated line (`ANSWER_DEAD` absent) — including the D6 anchor whose quote carries double quotes
(`.ufo/waves/round-66/w1-dispatch.json:17` — ""spawn": 66").

L3's newness clause, read at base `8d557f85312de4fcc82e09ff735d21436bc3746d`:

```
.ufo/waves/round-66/build/K66ScribeLedger65/answers.md: absent-at-base
.ufo/waves/round-66/w1-dispatch.json: absent-at-base
.ufo/waves/round-66/base/proxy-before.txt: absent-at-base
README round-66 sentence at base: 0
```

D1's Gate record re-derived from the pinned captures (not copied from the lesson or from the correction file):

```
$ sha256sum .ufo/waves/round-65/build/Capture/omp-v18.12.6-{mcp-client.ts,zai.ts,mcp-transports-http.ts}
479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9  …mcp-client.ts       (14975 B)
0598c9f221c006af760893d4b68ecea095ee4c090ff56efb8ebf664afc2fd8bb  …zai.ts              (12774 B)
41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033  …mcp-transports-http.ts (33157 B)
```

— each equal to its `.ufo/pins/source-captures.json` row (`sourceId`, `sha256`, `bytes`, `captured: 2026-10-25`). Located
quotes, all re-found today: S204 `protocolVersion: MCP_PROTOCOL_VERSION,` at capture `:100`; S205
`const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";` at capture `:80`; S206 `no protocol-version header is sent from either
source.` at capture `:122`.

Independent confirmation (peer reports, not this seat's run): `.ufo/waves/round-66/w1/K66ReviewR65RowsB.md` — "S204–S206
live sources match their pinned captures byte-for-byte; all cited quotes were located"; `K66ReviewR65RowsA.md` — S201–S203
"pinned captures matched fresh live fetches, all ten attributed quotes were located". Neither reviewed the D-rows.

Other measurements used by the rows: `ROUTED_LEDGER_SELFTEST: PASS (33/33)` exit 0 (the D3 row's self-test cell);
`README_MAP: CLEAN files=160 rows=160 covered=160` exit 0 vs base `base/readme-map-before.txt:2` `DRIFT files=160 rows=159
covered=159`; `.ufo/pins/readme-map.json:163` pins the file; `git log --oneline -1 621212ba -- corpus/README.md` → the
freeze commit carries the row; `harm-matrix-gates.json` has 36 gates and `scripts/harm-matrix.mjs:3` names
`kumitate-harm-matrix-v2`; `grep -cE '^- \*\*Q6[2-4]' corpus/QUALITY.md` → `0` (last row Q61); `ls
scripts/class-recurrences.sh` → no such file; `grep -c 'pin.harm-matrix'` → 0 in SCORECARD and every `.ufo/pins/*.json`.

## Findings

**K66ScribeLedger65-1 — medium — the routed item's own numbers are stale by one.**
`corpus/lessons/round-65-verifier-spotcheck.md` §6 D4 says "`PROXY: DRIFT` A +103", while the round-66 base receipt it
is being carried against reads `delta=+104`. Attacks the routed text, not the frozen counter.
`nl -ba .ufo/waves/round-66/base/proxy-before.txt | sed -n 1p` → `PROXY  error  A_DRIFT  A: declared=351 computed=455 delta=+104`
(455 − 351 = 104). The row R65-D4 quotes the receipt, never +103.

**K66ScribeLedger65-2 — medium — D4's second half is unlanded at the tip.** `corpus/QUALITY.md` ends at Q61 and
`scripts/class-recurrences.sh` does not exist, so the Q62–Q64 / recurrence-script work the item names is still open and
R65-D4 is `wontfix` (carried, disclosed), not closed. Reproduce: `ls scripts/class-recurrences.sh; grep -oE 'Q[0-9]+'
corpus/QUALITY.md | sort -t Q -k2 -n | tail -1` → `Q61`.

**K66ScribeLedger65-3 — medium — D1's fix has no committed home yet and is not in the lesson.**
`.ufo/waves/round-66/d1-gate-correction.md` (the per-row Gate record another seat prepared) is untracked at the tip
(`git status --porcelain | grep d1-gate` → `?? .ufo/waves/round-66/d1-gate-correction.md`) and sits outside
`corpus/lessons/`, while the spot-check asked for "an appended correction in the round-66 lesson". If the L1 neither
commits nor pastes it, D1 has an answer only in this seat's `answers.md`. Attacks L3's answer durability.

**K66ScribeLedger65-4 — low — a Gate-table row can never be a ledger answer.** The answer cell is split on `|`
(7 cells) and the answer regex rejects `|` in the quote, so an answer pointing at a Gate table row must be re-derived
pipe-free; I did that for D1. Attacks any future scribe who copies a Gate row as an answer.

**K66ScribeLedger65-5 — low — the three D3 rows falsify SKILL.md's own registry count.** `SKILL.md:589` says "Twenty-four
gate rows over twenty-three gate files"; the three rows make it twenty-seven over twenty-six (and `omp-binary-probe` is a
`probe`, exit 0/2, no exit-1 arm — "each can exit 1 on a real defect" must not be read as covering it). Reproduce:
`grep -n 'Twenty-four gate rows' SKILL.md`.

**K66ScribeLedger65-6 — note — L3's round-65 clause leaves no honest `open`.** Every round-65 item must be closed or
wontfix with a new answer line, so D5 — whose attribution is another seat's in-flight measurement — can only be recorded
as `wontfix` with a placeholder disposition (owner named, receipt pending) rather than `open`. The frozen rule and the
wave's seat split interact; reported, not patched.

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeLedger65/rows.md` — the 7 rows (copy-ready `## Ledger` section) + integrator notes
  (class slugs, re-anchor map, flip instructions for D2/D3/D5/D4).
- `.ufo/waves/round-66/build/K66ScribeLedger65/answers.md` — the 7 `- R65-Dk —` paragraphs for `corpus/lessons/round-66.md`
  § `## Routed defects answered`; lines 10/19/24/40 are the D1/D2/D3/D5 ledger anchors.
- `.ufo/waves/round-66/build/K66ScribeLedger65/reanchor.mjs` — read-only helper: after the SCORECARD/SKILL rows land it
  prints `path:line — "<<=25-word quote>"` per row (today it exits 1 with five `MISSING`, which is the correct
  pre-integration answer).
- `.ufo/waves/round-66/w1/K66ScribeLedger65.md` — this report.

## Limits

- D2/D3 rows are `closed` on drafted row text: this seat may not write `SCORECARD.md` or `SKILL.md`, so whether the rows
  land is the L1's call. If they do not land, flip both to `open` (`-`) — a closed row pointing at a draft is worse than
  an open one. `reanchor.mjs` exists for the landing case.
- D5's per-file split of the +92 was not measured here (another seat owns it); the row records the base 1545 reading
  from `K65ExecHarmRegistry/registry-v2-table.md:23` and the disclosed delta only.
- The rows were verified with the tool in worktree mode over a four-file scratch tree, not over `git archive M`; the
  counter's own L2/L3 runs at M and its `--rev` path (a `git show` per answer file) are unexercised by me.
- The class slugs are adopted from the classes seat, not chosen here; under them `wave-shape` reaches the RECURRENT line
  (4 rounds) only because D6 is in it, which that seat flagged for the L1 to accept or re-baseline.
- I did not re-run any registry gate except `readme-map` (needed for D7) and the tool's own `--selftest` (needed for the
  D3 row's self-test cell); census, `sources-check` and `proxy-check` were not re-run by this seat.
