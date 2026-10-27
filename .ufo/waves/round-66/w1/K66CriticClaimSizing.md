VERDICT: Both claims are concrete and their controls all fail as designed (no do-nothing path), but C2's frozen predicate is not re-derivable over committed bytes (live-network leg M5) and C1's 6/6 target is mostly pre-satisfied by the freeze-committed tool; axis naming, separability and §2b.4 hold.

## Evidence

Controls re-run with `SCRATCH=/fast/scratch/hyaku/kumitate-r66/K66CriticClaimSizing` (all UNMET):
```
$ bash .ufo/waves/round-66/probe/c1-controls.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin donothing
control-tool-sha256 f92a364d...
LEDGER66_UNMET held=4/6 checks=6 ... | L2 MISS exit=1 verdict=ROUTED_LEDGER: DRIFT ... rows=0 ... | L3 MISS 67 problems: ledger-empty-or-absent,unledgered:55#1,...
EXIT=1
$ bash .../c1-controls.sh <lane> autoledger
LEDGER66_UNMET held=4/6 checks=6 ... | L2 MISS ... rows=57 open=57 ... | L3 MISS 12 problems: R61.6:quote-not-in-item,...,r65-item-1-not-answered-this-round
EXIT=1
$ bash .../c2-donothing.sh <lane>
DEPREC66_UNMET held=0/8 checks=8 ... | M1 MISS source=true verified-at=false ... | M2 MISS cites-2-rows,S233:not-in-registry,S234:not-in-registry | M5 MISS no-bullets | ...
EXIT=1
```
Match committed receipts `base/ledger66-donothing.txt`, `base/ledger66-autoledger.txt`, `base/deprec66-donothing.txt` (same checks MISS; only seed/rev differ).

Tool committed at the freeze: `git cat-file -e 621212b:scripts/routed-ledger.mjs` → present; `git show --stat 621212b` lists `scripts/routed-ledger.mjs | 382 +`; selftest `base/routed-ledger-selftest-freeze.txt` = `PASS (33/33)`. Registry-home absent at freeze: `git show 621212b:SKILL.md | grep -c routed-ledger.mjs` = 0; `...:SCORECARD.md | grep -c routed-ledger` = 0 (so L6 is genuinely new).

Axes: `awk` over `SCORECARD.md ## Axes` → rows = operability, coverage, coverage:script-layer, coverage:runtime-layer, coverage:kimi-layer. operability evidence cell: "9 is this proxy's terminal integer: `f_O<1` for every finite A+C". PROVINCE frontier band "MCP protocol revisions as they bear on orchestration" (entry `mcp-orchestration-contract.md`, round 59). D7 repaired at freeze: `git show 621212b:corpus/README.md:194-195` adds the `round-65-verifier-spotcheck.md` row.

Live leg: `deprec66-probe.mjs:16` "M5 every bullet's quote is found in a fresh live fetch ...; --no-live = MISS"; `:43` `const LIVE = !argv.includes('--no-live')`; `:166` `spawnSync('curl', ['-fsSL','--max-time','90',...], url)`.

Parser identity: counter `ledger66-probe.mjs:72` `/\brouted\s+(defect|defects|item|items)\b/i`; tool `scripts/routed-ledger.mjs:21-22` `/\brouted\s+(defects?|items?)\b/i` (same rule). All 11 routed headings 55..65 match (grep `^#{1,6} .*[Rr]outed (defect|defects|item|items)`).

## Findings

**K66CriticClaimSizing-1 — MEDIUM.** Rule: claim sizing "re-derivable with one command over committed bytes" + verdict stability. C2's `DEPREC66_HELD` is not a function of committed bytes: M5 curl-fetches each cited URL live and requires every located quote to re-appear in the live body; `--no-live` forces M5 MISS → UNMET, so there is no committed-bytes-only path to HELD. If a cited page is edited or goes dark after the round, a re-count flips HELD→UNMET with zero lane change. Partially declared (entry `verified-at: 2026-10-27`; plan calls M5 "a live re-fetch") but the sizing rule is still not met. Smallest correction (report-only; counter frozen): declare the verdict point-in-time, not stably re-derivable.

**K66CriticClaimSizing-2 — LOW-MEDIUM.** Rule: claim sizing / after-state meaning. C1's `held=6/6` conflates pre-existing tool quality with this round's work. The tool v1 was committed at the freeze (621212b, 382 lines, selftest 33/33); L1 (selftest), L4 (held-out fixtures), L5 (stub detection) are properties of that committed tool and already pass in the donothing control (4/6 with an empty ledger + 3 registry lines). Only L2 (CLEAN run over 55..65) and L3 (bindings + every round-65 item answered this round) measure the round's data curation; L6 is registry bookkeeping. The counter still discriminates (control cannot reach 6/6), so sizing is functional, but a reader over-credits the round from the predicate. Evidence: base/ledger66-donothing.txt held=4/6 passing L1/L4/L5/L6.

**K66CriticClaimSizing-3 — LOW (verified).** Rule: axis naming. "Lowest non-retired axis" = operability (9), correctly identified: coverage is retired at 10 and coverage:script-layer/runtime-layer/kimi-layer are live at 10, so operability is the unique minimum. C1→operability satisfies the lowest-axis obligation. Caveat: operability's `f_O=(A+C)/(A+C+3)` is terminal at 9, so routing `routed-ledger.mjs` (an A item) cannot move the integer; C2's "coverage frontier" is a PROVINCE frontier band, not an `## Axes` row, and coverage + all sub-layers are saturated at 10. Both claims are sized to axes that cannot respond (plan declares "No score integer can move"). Attribution is nominal, not measurable.

**K66CriticClaimSizing-4 — LOW.** Rule: counter integrity behind L2/L5. L2's "independent item count" is not independent: the counter's `items66` and the tool implement the identical section regex, so a shared mis-parse of a real section would pass L2 (and L3's `unledgered` sweep, which iterates the same parser's items). Mitigations exist — L4 held-out fixtures exercise the parser on random tokens, L3 re-locates every counted quote, and all 11 real routed headings match the regex — so the risk is not realized on this data. Note for the ratchet only.

**K66CriticClaimSizing-5 — verified-held.** Rule: causal separability + sourced-claim §2b.4. C1 and C2 touch disjoint files ({scripts/routed-ledger.mjs, corpus/routed-ledger.md, SKILL.md, corpus/QUALITY.md, SCORECARD.md} vs {corpus/knowledge/mcp-deprecation-registry.md, corpus/SOURCES.md, .ufo/pins/source-captures.json, PROVINCE.md}), have independent counters, and either can hold without the other — separable. C2's only extra coupling is its M8 lane-cleanliness bar, already met by the D7 README repair at the freeze. §2b.4 (≥1 sourced claim) is satisfied in design by C2: M1/M2 force ≥3 S-ids that are new SOURCES rows opened 2026-10-27, `mined`, `used-by` the entry; the do-nothing control's copied shokuknow ids S233/S234 fail M2 "not-in-registry", proving the counter enforces lane-local rows opened this round.

## Artifacts

- `.ufo/waves/round-66/build/K66CriticClaimSizing/attack.md` (this attack, build copy)
- Report: `.ufo/waves/round-66/w1/K66CriticClaimSizing.md`
- No frozen counter/control/plan/receipt edited; no lane file outside the two paths above.

## Limits

- Did not run the full `deprec66-probe.mjs`/`ledger66-probe.mjs` counting commands against a real integrated M (no integration exists yet); controls already exercise both counters end-to-end.
- Did not verify M5 against the live network beyond the do-nothing path (which fails before M5's fetch matters); finding 1 is from code reading of the M5 leg.
- Did not re-derive f_O's terminality by running proxy-check on a hypothetical A=11 tree; relied on the SCORECARD evidence cell's stated math.
- Did not inspect the staged shokuknow entry's full provenance (read-only bytes only); M2's not-in-registry verdict is the operative evidence.
