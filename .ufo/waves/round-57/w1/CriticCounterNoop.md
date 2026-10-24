# CriticCounterNoop — ATTEST57 counterexample hunt (kumitate round 57)

Scope: could a do-nothing tree (base + trivial edits) reach `held=10/10`?
Per-arm base readings; weakest arm. Lane untouched; all mutation in
`.ufo/waves/round-57/build/CriticCounterNoop/scratch/` (sandbox git clone).

## Verdict on the do-nothing question

**No.** A literal do-nothing tree cannot reach 10/10 — confirmed by rerun:
base rev `7178bfd…` prints `ATTEST57_UNMET held=0/10` (all ten MISS, exit 1;
`build/CriticCounterNoop/base-rerun.txt`, byte-matches the committed
`base/attest57-base.txt`). Every arm requires committed bytes absent at base
(gate, registry, pins, SKILL rows, receipts, lesson/LOG/captures, mutant
transcript) or state conformance (README row missing at base — the R56-V3
drift the gate exists to catch).

**But**: 10/10 *is* reachable without the claimed capability. See
counterexample.

## Counterexample — manifest-oracle forgery (executable, landed)

Kill rule K2 asserts: "the B3 arms mutate real committed bytes in a scratch
extraction and the gate **recomputes the live bimap itself**." Falsified.
The probe never inspects gate semantics; B3 arms accept `exit==1 &&
stdout.includes(<token>)`, B4 accepts `exit==2`, B10 requires only that the
gate's verdict *agree* on the one unmutated tree. A **manifest-checksum
oracle** — 135 baked path strings + baked README sha256 + verdicts derived
from row *counts* and set membership, with zero files↔rows intersection —
satisfies all five DRIFT arms, all five FAIL-CLOSED arms, B1's selftest
shape, B2's `CLEAN files=135` line, and B10's agreement test.

Proof: in `scratch/` (clone at R1 `f0dc6d1`) I replaced
`scripts/readme-map.mjs` with the oracle, re-pinned its sha256 in
`.ufo/pins/counter-pins.json` and SCORECARD `pin.readme-map` (honest,
self-consistent hashes — nothing about the forgery hides), committed rev
`02ba8335c2a486321ffa603cdfedeb3c85f9c260`, and ran the frozen probe:

    ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=02ba8335… rule=A57 version=v1 | B1 PASS | B2 PASS | B3 PASS | B4 PASS | B5 PASS | B6 PASS | B7 PASS | B8 PASS | B9 PASS | B10 PASS   (exit 0)

(`build/CriticCounterNoop/oracle-forge-run.txt`.) The oracle flags *any*
post-R1 change as DRIFT — it is a freeze oracle, not a drift gate — yet the
predicate cannot tell it from the real bimap. The "capability acquisition"
claim is certified for an artifact that proves only state conformance.

**Qualifier (the no-op boundary):** the forgery still required a *conformant
tree* — 135 live README rows, registry `covered` = full file set (B2/B10
reject the one-row drift at base), proxy-check `MATCH`, and valid receipts.
Tree conformance is genuinely gated; gate *semantics* are not.

## Per-arm base readings and minimal satisfying diffs

| arm | base MISS cause | minimal diff to PASS | forge class |
|-----|-----------------|----------------------|-------------|
| B1 | `scripts/readme-map.mjs` absent | file printing 12+ `case …: PASS` + selftest/VERDICT lines | pure output-shape stub |
| B2 | registry absent | valid registry + gate CLEAN on a *conformant* tree (README repair forced if gate is real; baked hash if oracle) | tree-bound |
| B3 | gate absent (all 5 arms print nothing; note arms a/b/c already got `exit=1` at base — only the token was missing) | any mechanism producing the 5 tokens under the 5 fixed mutations | enumerable-mutation oracle |
| B4 | registry absent | JSON-parse guard + version/type/scope/readme-exists checks → exit 2 | shallow shape checks |
| B5 | 3 round-57 pins missing | true sha256s (recomputed per commit — binds bytes, not semantics) + committed transcript file containing `ATTEST57_UNMET held=0/0` + `exit 1` | transcript = self-asserted text, forgeable; pins honest-but-self-provided |
| B6 | no `pin.readme-map`; proxy DRIFT (declared 132 vs computed 133; AXES declared 10 vs computed 9) | sha256 line + declared-count edits + the README row repair | tree/consistency-bound |
| B7 | `items=26`, no readme-map row | SKILL.md registry row + checklist item 27 (base items 24–26 *already* bound counter-pins/source-capture/source-dupes at lines 715–717) | **pure text shape — weakest** |
| B8 | receipts absent | three receipts verifying VALID; nonces/span/digest all self-attested — `verify` recomputes only sidecar sha256 + record `digest`, no run authentication; hand-forged bodies + recomputed sidecars pass | self-attested (weak) but labor ≥ minting honestly |
| B9 | lesson/LOG/captures absent | lesson naming R56-V1/V2/V3 + LOG naming V2/V3 + capture files whose *sha256* match the registry | text + hash-consistency; capture *contents* never inspected by this probe |
| B10 | registry absent | live recompute agreement + `covered` ⊆ live files + `unpinned`=0 ⇒ `covered` must equal the full 135-file set | tree-bound (strongest arm) |

**Weakest arm: B7** — satisfiable by adding a markdown table row and one
checklist line; it attests the gate's *registration*, not its existence or
behavior. B5c's transcript check (self-asserted text greps) and B8
(self-attested receipt fields) are runners-up.

## Impacted axes

- **operability**: ATTEST57_HELD certifies *state conformance + a
  protocol-shaped artifact*, not the readme-map capability. K2's
  "recomputes the live bimap" is unattested; a manifest oracle — which will
  false-positive DRIFT on the very next legitimate corpus file — passes
  10/10. Fixable defect, not a fundamental tradeoff.
- **coverage**: unaffected (D57 separate; B9 capture checks are
  hash-consistency only, noted).

## Smallest safe correction

One randomized-fixture arm inside B3: in the scratch extraction, write a
fresh `corpus/probe-<rand>/` + sibling README/registry with probe-chosen
filenames, run `node scripts/readme-map.mjs --registry … --readme …
--corpus …` (the contract already accepts these flags), and assert the
specific finding names the *probe-generated* path (e.g.
`uncovered:probe-<rand>/dropped.md`). A manifest oracle cannot pre-bake a
filename drawn at probe time; the real gate passes unchanged. Restores K2's
claim with ~15 lines. Secondary (optional) hardening: B3 arm expectations
should match `first=<class>:<specific-path>` rather than bare-token
`includes`.

## Evidence

- `build/CriticCounterNoop/base-rerun.txt` — 0/10 at `7178bfd…` (exit 1).
- `build/CriticCounterNoop/r1-rerun.txt` — 10/10 at `f0dc6d1…` (exit 0);
  ATTEST57_HELD corroborated at the claimed integration tip.
- `build/CriticCounterNoop/oracle-forge-run.txt` — 10/10 at forged
  `02ba8335…` (exit 0).
- `build/CriticCounterNoop/scratch/scripts/readme-map.mjs` — the oracle
  (grep-verified: no files↔rows intersection).

No installs. No production/commit mutation in the lane.
