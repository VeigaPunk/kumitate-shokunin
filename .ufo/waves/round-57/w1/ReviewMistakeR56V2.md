# ReviewMistakeR56V2 — R56-V2 amendment judgment (A57 B7 full id-binding vs stale exactly-N literals)

seat: ReviewMistakeR56V2 (reviewer, leaf) · date: 2026-10-24 · lane: kumitate, round 57
base: `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` · close revs re-run: `f0dc6d1160e66af65355bd353665adac22bbf4a9` (R1), `b3bd0633aec43ad2559f980b400e4d7077e10af3` (H5 witness rev), `798d4d23743487d0c642239ca54deba421021af3` (receipts; primary judged rev), HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89`
evidence dir: `.ufo/waves/round-57/build/ReviewMistakeR56V2/` (all commands, full stdout/stderr, exit codes)

## Verdict

**DEFENSIBLE — confirmed.** Binding every item id (24→counter-pins, 25→source-capture, 26→source-dupes, 27→readme-map) plus `items === 27` is a sound successor shape to the stale A54/A55 `exactly 24/25` literals, and it does **not** relax the frozen A54/A55 claim semantics: both counters are byte-untouched since their own rounds, still assert exactly-N, still read UNMET (exit 1) at the round-57 close revs, and that failure is committed as named counter-obsolescence, not suppressed. The amendment lives entirely in the new frozen counter A57 and is a strictness-increase over the superseded convention (count + newest-only binding). Two low-severity defects and two informational notes found; none undermine the amendment or the claim.

## Findings by severity

### LOW-1 — B7 binds presence, not exclusivity (`attest57-probe.mjs:327-328`)
The binding check is substring `includes` per item line. Mutant M5 (sandbox rev `f757b8847c9dbccf7205869cdddfd406fd5ba99b`): item 26 rewritten to name *two* gates ("`node scripts/source-dupes.mjs` or `node scripts/readme-map.mjs`") → **`ATTEST57_HELD held=10/10` exit 0** (`mut-M5.txt`). A future re-expression could satisfy B7 with ambiguous rows and still score. Evidence: `.ufo/waves/round-57/build/ReviewMistakeR56V2/mut-M5.txt`. A strictness-only successor counter could require exactly one gate mention per bound item; not fixable this round (C14 — nothing changes after the first candidate score).

### LOW-2 — SCORECARD H5 sentence cites the wrong item count at HEAD (`SCORECARD.md:2663`)
Committed at `c42afe1c`, present at HEAD: "the frozen A54 exactly-24 and A55 exactly-25 checklist literals read MISS `items=26`". At every round-57 rev the checklist has **27** items; the authoritative committed H5 transcripts (`.ufo/waves/round-57/close/prior-probes.txt`, `close/prior-counters-at-close.txt`, both at `798d4d23`) and my own re-runs read `B7 MISS row=true items=27`. `items=26` is the round-56-close value — the same file's routed-defect answer (line 2711) correctly says `items=27`. Bookkeeping accuracy slip only; the underlying transcripts are correct. Warrants an append-only erratum (lane file read-only for this seat; routed to the bookkeeping owner).

### INFO-1 — `prior-probes.txt` exit-code capture is inconsistent
The wrapper's `exit=` echoes do not align 1:1 with probe blocks (A54 shows `exit=1` plus a stray `exit=0`; A55/A56 UNMET blocks show a bare `exit=0`, though a frozen UNMET exits 1). The verdict lines themselves are authoritative and match my independent re-runs (A55 UNMET → exit 1 at both `e7091300` and `7178bfd`; `run-A55-at-r56close.txt`, `run-A55-at-base.txt`). Cosmetic transcript hygiene.

### INFO-2 — `items === 27` remains a growth literal by design
It will read UNMET at the round-58 close when the checklist grows again. This is the lane's accepted, named cost of a capability acquisition (plan §Harm battery H5: "recorded as named counter-obsolescence … not hidden"; SCORECARD line 2710-2711). The actual R56-V2 gap — *no convention bound which supersession shape a frozen count literal may take* — is closed, because the convention now freezes the re-expression shape (every id bound). Mutant M3 shows a growth is loudly double-detected: `B7 MISS items=28` **and** `B6 MISS` via proxy `C_DRIFT term=C declared=27 computed=28` (`mut-M3.txt`, rev `bf510b5`).

## Why the successor is defensible

1. **Strictness-only (C6) is genuinely inapplicable — the plan's argument holds.** A strictness-only amendment of A54's `items === 24` cannot admit item 25's existence; a growth literal can only be re-expressed. The honest re-expression is a *new* frozen counter whose B7 subsumes the old claim and adds the full binding. A57 B7 (`attest57-probe.mjs:317-331`) asserts `rowOk ∧ items === 27 ∧ i24∋counter-pins.mjs ∧ i25∋source-capture.mjs ∧ i26∋source-dupes.mjs ∧ i27∋readme-map.mjs` — a strict superset of the superseded shape (count + newest-only).
2. **Amendment discipline conformed.** Predicate identical in plan §Routed-defect answers, probe header (lines 53-58) and code (C2). A57/D57 committed once at the freeze commit `f0dc6d1` — first commit of the round, before the score receipts at `798d4d2` — and never touched after (C14): single-commit history (`freeze-discipline.txt`); blob sha256 at HEAD = `d177f6d5a7335b5e36d7d950b7cde8af4f99b979ce5d0321ab50100939045815` (attest57) and `8837a090ce76419ac996fafb9103357427935791a0399471e52dbf2ead670d53` (doctrine57), matching the round-57 entries in `.ufo/pins/counter-pins.json`.
3. **The amendment adds real discriminating power (mutation battery, full frozen-probe runs in a sandbox clone on `798d4d23`; probe ≈1 s/run, transcripts complete B1..B10):**

| mutant | rev | B7 detail | verdict |
|---|---|---|---|
| control (unmutated close) | `798d4d23` | B7 PASS | ATTEST57_HELD 10/10, exit 0 (twice) |
| M1 only-newest (items 24-26 unbound, 27 bound) | `0bc18ac` | `B7 MISS row=true items=27 i24..27=false` | UNMET 9/10, exit 1 |
| M2 drop one old binding (26) | `3b4e47e` | `B7 MISS … i24..27=false` | UNMET 9/10, exit 1 |
| M3 growth to 28 without re-expression | `bf510b5` | `B7 MISS row=true items=28 i24..27=true` + B6 proxy C_DRIFT | UNMET 8/10, exit 1 |
| M4 reorder items 24/25 | `8f4a4a8` | `B7 MISS … i24..27=false` | UNMET 9/10, exit 1 |
| M5 exclusivity hole (item 26 names two gates) | `f757b88` | B7 PASS | HELD 10/10 → LOW-1 |

M1 is the decisive one: the pre-amendment *shape* (count + newest-only) cannot distinguish the conformant close from M1 — items=27 and the item-27 binding are intact in M1 (`git show 0bc18ac:SKILL.md`, item 27 unchanged) — and M1 is precisely the silent rot that produced R56-V2 (an old id→gate mapping dropped while only the newest stayed asserted). The amended B7 rejects it, plus every drop/reorder/growth mutant.

## A54/A55 semantics are NOT relaxed (the "still assert what they assert" chain)

1. **Bytes untouched.** `git log --follow`: attest54/doctrine54 last commit `8eb113f` (round-54 freeze); attest55 `68940c6` + `465a96f` (both round-55, pre-data freeze-repair); attest56 `e4a4943` (round-56). Zero round-57 commits on any r54/r55/r56 probe path (`pins-history.txt`).
2. **Pin chain intact.** Blob sha256 at `798d4d23`: attest54 = `e2252e8e…` (matches both `counter-pins.json` round-54 entry and A55's own hardcoded B5 pin, `attest55-probe.mjs:246`), attest55 = `cfb6c8f3…`, attest56 = `6b230b47…` — all match their registry entries; registry carries rounds 53-57 without regression, re-verified by A57 B5 at every judged rev.
3. **They still fail honestly, exactly as written.** My re-runs (frozen counters, `git archive` extraction, read-only): A55 at the r56 close `e7091300` → `ATTEST55_UNMET held=9/10 … B6 PASS … B7 MISS row=true items=26 item25=true`, exit 1 — reproduces spotcheck §1's claim verbatim (`run-A55-at-r56close.txt`). A54 at the round-57 base `7178bfd` → UNMET **8/10**: B7 MISS `items=26 item24=true` *plus* B6 MISS (the R56-V3 proxy `C2_TOTAL_DRIFT` the spotcheck commit itself introduced) — which reconciles the spotcheck's 9/10 (r56 close) with the base reading (`run-A54-at-base.txt`, `run-A55-at-base.txt`). At the close revs (`b3bd063`, `f0dc6d1`) both read UNMET 9/10, `B7 MISS row=true items=27` with every item-binding sub-assertion still true (`close-transcripts.txt`) — the *only* failing clause of each frozen counter is the superseded count literal.
4. **The failure is recorded, not suppressed.** H5 transcripts committed at `798d4d23` name it; LOG.md round-57 entry (line ~2201, append-only) records the convention verbatim ("must bind EVERY item id→gate mapping …, never only the newest") and "Named counter-obsolescence carry … recorded, not hidden"; SCORECARD routed-defect answer (line 2708-2712) states "the frozen A54/A55/A56 exactly-N literals stay as written and read MISS at items=27".
5. **Unchanged counters still gate.** A53 re-run at close: HELD 17/17; D53-D56 all HELD 5/5 — only the checklist-count literals obsolesce, exactly as the plan's H5 predicts.

## Residual risk and verification gaps

- LOW-1 (exclusivity) and LOW-2 (SCORECARD `items=26` erratum) remain open for a future round; neither is reachable by this seat (C14 / read-only lane files).
- B7's `items === 27` guarantees one more named obsolescence next round; the convention is self-enforcing only if the r58 successor re-expresses with all bindings — the amendment freezes the *shape*, not future compliance.
- Not exercised by this seat: D57/E-checks, receipt re-minting (B8 accepted via probe PASS at `798d4d23`), the scratch-HELD witness internals, S117-S120 source re-opening (other seats' items). A53/A56 close readings taken from the committed transcripts, not independently re-run.
- One discarded false start: an earlier shell-based battery ( `mutants.sh`) mis-committed an empty SKILL.md in the sandbox; it was `git reset --hard` to `798d4d23`, discarded (rev orphaned, never cited), and the battery re-run from `mutants.py`. Sandbox left clean at `798d4d23`; the lane's git state and working tree untouched throughout (probes read via `git archive`).
- Tool installs/updates: none (preinstalled node, python3, git only).

trailer: .ufo/waves/round-57/w1/ReviewMistakeR56V2.md
