# ReviewProxyPin — pin.readme-map + pin.proxy-check verification (round 57, wave 1)

**Verdict: CORROBORATED — no defect found.** Both named pins are honest, live, and
gated. Evidence under `.ufo/waves/round-57/build/ReviewProxyPin/`; all commands read-only
against lane files (mutations confined to scratch copies under the same dir).

- Lane HEAD at review: `8c6f5b017d149b18134917378cdbed3b492d8e89`
- Base (plan-frozen): `7178bfd3643c0fac74c8eb637cd6e985faadd0cf`
- Environment: node v24.21.0; origin pin resolves `src-rev=31c465f15669` via
  `.ufo/pins/origin.json` → clone `/fast/scratch/hyaku/kumitate-pin/src`; kimi root `~/.kimi-code`.
- No tools installed this round (none needed; pacman pause respected).

## 1. `pin.readme-map` — exact, verified, new this round

- Declared: `SCORECARD.md:326` (`kumitate-gate-pins-v1` block, lines 312–327):
  `pin.readme-map=058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727`
- Computed: `sha256sum scripts/readme-map.mjs` =
  `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` — **MATCH**
  (`sha256-worktree.txt`, `sha256-all-gate-files.txt`).
- `GATE_PINS` map: `scripts/proxy-check.mjs:475` —
  `'pin.readme-map': 'scripts/readme-map.mjs'` (round-57 comment); parser enforces the map
  (`GATE_PIN_KEY_UNKNOWN`, `proxy-check.mjs:1059-1061`) and compares declared vs computed
  (`GATE_PIN_DRIFT`, `:1118-1134`).
- New this round: `git ls-tree 7178bfd… scripts/readme-map.mjs` → absent at base; base
  `proxy-check.mjs` has zero `readme-map` mentions (`base-vs-head.txt`).

## 2. `pin.proxy-check` — re-pinned to the edited file

- Declared: `SCORECARD.md:308` (`kumitate-proxy-v1` stanza):
  `pin.proxy-check=816a8650ba6a53c2abf20446021c3c19563747c0b8ac659d1c0695c3d84b2200`
- Computed: `sha256sum scripts/proxy-check.mjs` =
  `816a8650ba6a53c2abf20446021c3c19563747c0b8ac659d1c0695c3d84b2200` — **MATCH**.
- Re-pin proven: base stanza declared `b9e877143abe…` = `sha256` of base
  `scripts/proxy-check.mjs`; the file changed base→HEAD by exactly **one insertion, one
  hunk**: `+'pin.readme-map': 'scripts/readme-map.mjs', // round 57`
  (`git diff --stat` 1 file, +1; `diff-and-counterpins.txt`). The current declared value is
  the hash of the *edited* file — the re-pin landed after the edit, and the edit itself is
  precisely the GATE_PINS extension the new pin requires. The tool/stanza/probe triple
  travels together; nothing in the diff weakens a pin arm.

## 3. GATE_PINS map — full correspondence (14/14)

`SCORECARD.md` gate-pins block declares exactly 14 keys; `GATE_PINS`
(`proxy-check.mjs:461-476`) lists exactly the same 14 — bijective, no orphan entries on
either side. All 14 computed hashes equal their declared values
(`sha256-all-gate-files.txt` vs `:313-326`).

| key | line | declared = computed |
|---|---|---|
| pin.anchor-truth | :313 | 43c37865… ✓ |
| pin.sources-check | :314 | 5402b210… ✓ |
| pin.wave-census | :315 | 76447250… ✓ |
| pin.gate-mutants | :316 | 177f6cbb… ✓ |
| pin.omp-census | :317 | fd4d1c4e… ✓ |
| pin.cap-run | :318 | e1d0a79b… ✓ |
| pin.bind-oracle | :319 | c3929a97… ✓ |
| pin.cap-spawn | :320 | 1fde43fb… ✓ |
| pin.counter-rerun | :321 | c002523f… ✓ |
| pin.receipt-attest | :322 | ba5139b1… ✓ |
| pin.counter-pins | :323 | 060d5d86… ✓ |
| pin.source-capture | :324 | 39bdeb39… ✓ |
| pin.source-dupes | :325 | ead88b22… ✓ |
| pin.readme-map | :326 | 058e5033… ✓ |

No `pin.*` key inside `kumitate-proxy-v1` is duplicated into the gate-pins block;
`pin.readme-map` appears exactly once in SCORECARD.md (grep).

## 4. Operability probes (mutation-tested, not just byte-matched)

Control: `git archive HEAD` → scratch (3,626 files), then
`node scratch/scripts/proxy-check.mjs --self scratch --kimi-root ~/.kimi-code` (pin
resolves `--src` from `.ufo/pins/origin.json`):
**`PROXY: MATCH (A=90 C=27 operability=9; C1=19/19 C2=135/135 coverage=10; S=88/88 … K=53/53 … pins=6 match; src-rev=31c465f15669)`, exit 0, findings=[]**
(`control-and-mutants2.txt`). On the committed tree the entire pin machinery is green —
zero `PIN_DRIFT`/`GATE_PIN_DRIFT`/`PIN_UNPINNED`.

Mutants via `--scorecard <mutant>` (scorecard-only, scratch tree untouched):

| mutant | observed |
|---|---|
| M1 `pin.readme-map` first hex digit flipped | `GATE_PIN_DRIFT pin.readme-map declared=158e… computed=058e…`, exit 1 |
| M2 `pin.proxy-check` reverted to the BASE hash | `PIN_DRIFT pin.proxy-check declared=b9e877… computed=816a86…`, exit 1 — the base value provably fails the live check |
| M3 `pin.readme-map=` stanza line deleted | warn `PIN_UNPINNED scripts/readme-map.mjs`, exit 0; `--strict` → `DRIFT (PIN_UNPINNED …)`, exit 1 — a dropped declaration is never silent |
| M4 unknown `pin.not-a-gate=` inside the block | `FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN)`, exit 2 |

The stanza-declared set is verified, not trusted: every declared gate pin is hashed and
compared (`compareGatePins`), every registered script is warned when unpinned
(`comparePinCoverage`).

## 5. Cross-binding consistency

`.ufo/pins/counter-pins.json:83-87` (round-57 `readme-map` entry) pins
`scripts/readme-map.mjs` to the same `058e5033…` — counter-pins registry and
gate-pins stanza agree byte-for-byte.

## 6. Observations / residual risk (not defects in this item)

- **Live-tree `A_DRIFT` (transient):** `node scripts/proxy-check.mjs --strict` on the
  dirty mid-wave worktree → `A_DRIFT declared=90 computed=4251`, exit 1, no pin findings.
  Committed HEAD contains exactly 90 counted files (`git ls-tree … | grep -cE` = 90,
  including frozen probes + committed prior-round `build/` scripts; base stanza had
  `A=87`). The +4,161 is untracked seat scratch under `.ufo/waves/*/build/` (5,107
  candidate files mid-wave). Bare/`--strict` runs are only meaningful at a clean rev or
  on an R1 extraction; the close-sequence discipline (counters run at R1/R2, not mid-wave
  HEAD) already handles this. No action.
- **Coverage-by-advisory:** with the `pin.readme-map` *line removed* the only signal is
  `PIN_UNPINNED` — a warn that passes at exit 0 outside `--strict` (M3). That is the
  block's registered optional design (`kumitate-gate-pins-v1` "verifies only its named
  gate files"); the H3 harm-battery uses `--strict`, which gates it. Worth knowing if any
  caller ever runs un-stricted.
- **Round-49 note stale vs current mechanics:** `SCORECARD.md` move-log line ~1850
  describes `pin.bind-oracle` verification as "only as good as proxy-check's `GATE_PINS`
  map" — still accurate; no action.

## Evidence files (`.ufo/waves/round-57/build/ReviewProxyPin/`)

`sha256-worktree.txt` · `sha256-all-gate-files.txt` · `base-vs-head.txt` ·
`diff-and-counterpins.txt` · `control-and-mutants.txt` (first attempt — all runs
fail-closed `SRC_REV_MISMATCH` because explicit `--src` overrode the pin clone and live
origin HEAD moved; superseded) · `control-and-mutants2.txt` · `proxy-strict.txt` ·
`scratch-build.txt` · `sc-m1.md`..`sc-m4.md` (mutant scorecards) · `origin-pin.json` ·
`gate-pins-files.txt` · `a-term-composition.txt` · `stanza-terms-env.txt` ·
`evidence-inventory.txt`. Scratch extraction deleted after capture.
