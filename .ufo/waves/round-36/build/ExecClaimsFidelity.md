EXEC claims-fidelity done baseline=581 cases=17 selftest=56/56

FINAL-RULE BASELINE (L1 clause-guard pairing): FIDELITY_TOTAL anchors=1520 ok=456
elsewhere=280 absent=77 dead=172 noid=535 nonok=357 · FIDELITY: DRIFT (nonok=357).

# ExecClaimsFidelity — FIDELITY v1 + `--fidelity-ratchet` in scripts/claims-check.mjs

## 1. Delivered (one file: scripts/claims-check.mjs, +580/−6)

- `probeSections` gains an optional `onSection` sink; `probeRow` hands every
  *resolved* member section (note, heading, own file, body text, own-file line
  array, resolver) to it at the point it already computes them (scripts/claims-check.mjs:421-433,
  507, 520). No second registry/note walk anywhere.
- `--fidelity` (scripts/claims-check.mjs:548-651): per-note `FIDELITY note=…` lines,
  `FIDELITY_TOTAL`, `FIDELITY: CLEAN|DRIFT`. `nonok = elsewhere + absent` is the only
  gated quantity; `dead`/`noid` are printed diagnostics.
- `--fidelity-ratchet FILE` (scripts/claims-check.mjs:700-717, 724-780):
  `kumitate-fidelity-ratchet-v1`; note absent from `notes` must read nonok=0, listed
  note ≤ ceiling, total ≤ `total`, revision == verified origin HEAD.
- Origin (scripts/claims-check.mjs:639-698): `--pin` (when the pin arm sets it) or
  `<self>/.ufo/pins/origin.json`; src = `--src`, else pin.clone; `git -C src rev-parse HEAD`
  asserted equal to `pin.revision`; `src-rev=` prints the **verified HEAD**. Fail-closed
  before any FIDELITY line: `PIN_MALFORMED`, `SRC_REV_MISMATCH`, `SRC_REV_UNVERIFIABLE`,
  `SRC_NOT_A_DIR`, `RATCHET_MALFORMED`, `RATCHET_REV_STALE` (exit 2).
- Exit map: 0 clean · 1 drift · 2 fail-closed · 64 usage (`--json`/`--row`/`--strict`
  combined with `--fidelity` are explicit usage refusals, not silent no-ops).

## 2. Baseline convention and the 588 → 581 derivation (pristine 0614092, src at 31c465f1)

Frozen before: nonok=588, anchors=1530. **Contract-faithful reproduction (right-first):
nonok=581, anchors=1520.** No note+heading dedupe (failure-telemetry.md counts twice,
S2+S5, 22 = 2×11), strict registry resolver. File-by-file delta (588−581 = +7):

| note | anchors | nonok | cause |
|---|---|---|---|
| native-judge-pipeline.md | −7 | −4 | prototype matched member headings by substring: `native.rs` landed on `## Judgment order — \`native.rs::judge_handoff\` (:470)` and `native_contract.rs` on `## Contract-hash mechanism` (lines 51/128); the real member sections (lines 186/256) carry 0 anchors |
| loop-driver.md | −4 | 0 | `loop_driver.rs:110/336/416/561` are basename-ambiguous (`crates/ufo-core-runtime/src/loop_driver.rs` AND `crates/ufo-core-runtime/tests/loop_driver.rs`), so makeResolver refuses them (2 ok + 2 noid in the prototype) |
| remaining-scripts-census.md | +1 | 0 | `scripts/charter-scribe/prompts/kimi-update.prompt.txt:N` resolves exactly but `.txt` is outside the prototype's extension list (noid) |
| ops-watchers.md | 0 | −2 | `config:53`/`config:49` are `<name>:N`-shaped spans, never symbols (prototype paired them → absent) |
| runtime-support.md | 0 | −1 | `"  "` is punctuation-only (prototype paired it → elsewhere) |

**Under the L1 FINAL clause-guard pairing: nonok=357, anchors=1520** (critic expected ~352;
Δ5, 1.4% — I cannot reproduce their exact rule; class table above is exact and reproducible
from `fidelity-final-rule.txt`). Three measured runs on the same tree:
right-first 581 (ok=338/elsewhere=487/absent=94/dead=172/noid=429), both-sides-only 371
(ok=324/elsewhere=298/absent=73/noid=653), FINAL clause-guard 357
(ok=456/elsewhere=280/absent=77/noid=535).

## 3. Pairing rule shipped (and the dissent, on the record)

Shipped exactly as the L1's FINAL message: anchor = backticked `:N[-M]` or `path:N[-M]`
resolving uniquely to the section's own file; candidate = backticked, not an anchor
(any `<name>:<N>`-shaped span is an anchor), not path-like, ≥3 trimmed chars (I additionally
keep the frozen "not only punctuation/digits" guard, which rejects `"  "`); RIGHT = nearest
span starting ≤14 chars after the anchor end with no `) , ; . | — – →` between; LEFT =
nearest span ending ≤14 chars before the anchor start with no `)`/`;` between;
both qualify or neither → `noid`.

Dissent, recorded verbatim in effect: KumitateR36.ReviewClaimsArm and
KumitateR36.ReviewChecklist both measure that the frozen FIDELITY v1 text is right-first
with no clause/both-sides veto, and that the final rule moves 224 anchors from gated
elsewhere/absent into ungated `noid` (581 → 357). They asked for the reference `pair()`
(right-first, right wins) instead. The L1's FINAL message explicitly supersedes both
earlier rules, so the final rule ships. **One-line restore if the L1 reverts:** in
`adjacentSymbol` (scripts/claims-check.mjs:604) replace the two `*Ok` expressions with
`pairableSpan(x.t)` only and order `if (rightOk) return right.t; if (leftOk) return left.t;`
— right-first then reads 581 again. The selftest case "FIDELITY classification" pins the
final rule (both-sides → noid, guards); its NOTE line would change under right-first.

## 4. Pin and ratchet behaviour (measured)

- `--fidelity --src /fast/scratch/kumitate-r36/src` (no pin file): `FIDELITY: DRIFT (nonok=357)`,
  no `src-rev=` — identical classes to the pin run below except the segment.
- Pin file in place (clone=/fast/scratch/kumitate-r36/src, revision=31c465f1…), **no `--src`**:
  `FIDELITY: DRIFT (nonok=357 src-rev=31c465f15669)` — the walk read the pin clone and printed
  its verified HEAD. Pin file removed after the proof; it is ExecPinFiles' artifact.
- Hermetic selftest proves match / mismatch (exit 2 SRC_REV_MISMATCH) / non-repo (exit 2
  SRC_REV_UNVERIFIABLE) / malformed (exit 2 PIN_MALFORMED, no FIDELITY line) on a temp git repo.
- Ratchet: pass → `FIDELITY: CLEAN (… nonok=2 ratchet=ok src-rev=…)`; per-note and total
  regressions → DRIFT naming the violated ceiling; unlisted note with nonok>0 → DRIFT
  `(unlisted)`; stale revision → exit 2 RATCHET_REV_STALE; no active pin → exit 2
  RATCHET_REV_STALE; malformed contract/ceilings → exit 2 RATCHET_MALFORMED.
- `--src` plus an active pin asserts HEAD == pin revision (never scores one tree while
  naming another revision). The domain tree is never passed as `--src`.

## 5. Selftest — 17 new hermetic cases, 56/56 total

Classification line (anchors=21 ok=7 elsewhere=1 absent=1 dead=4 noid=8 nonok=2) covers:
ok / elsewhere / absent / dead / noid; dead-before-noid; N>M; 14-char boundary on both
sides (15 → noid); path anchor resolving to a different file is not an anchor;
`<name>:<N>` never a symbol; both-sides → noid; comma-list and paren-list right-guard
refusals; **right-vs-left disagreement resolved by the guard to the sentence's own left
symbol** (`` `ALPHA_MARK` at `scripts/a.mjs:3`, `GONE_SYMBOL` `` → ok). Plus clean,
diagnostics-never-gate, ratchet pass/per-note/total/unlisted/stale/malformed, pin
malformed/mismatch/unverifiable, SRC_NOT_A_DIR, and two usage refusals.
`node scripts/claims-check.mjs --selftest` → `CLAIMS_SELFTEST: 56/56 pass`, `VERDICT: PASS`
(checks `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)` unchanged).
`node scripts/proxy-check.mjs --selftest` → `PROXY_SELFTEST: 109/109 pass` (import intact).

## 6. Read-only proof

Before/after `find <tree> -type f -printf '%p %s %T@\n' | sort | sha256sum` over the lane
(corpus + SCORECARD.md + .ufo/pins) and over /fast/scratch/kumitate-r36/src around a
pin-resolved `--fidelity` run: **both digests identical** (`LANE-TREE-UNCHANGED`,
`SRC-TREE-UNCHANGED`); `git -C /fast/scratch/kumitate-r36/src status --porcelain` empty.

## 7. Integration notes / risks

- **PROXY `pin.claims-check` drifts by construction**: SCORECARD.md:305 declares
  `e9a21b44…`, the patched file hashes `6c21180e…`. Any script-editing arm in this wave
  (surface-probe, proxy-check too) produces the same; the stanza must be refreshed once,
  after all script patches land. In my clone `node scripts/proxy-check.mjs` reads
  `PIN_DRIFT term=pin.claims-check` plus the pre-existing `C2_TOTAL_DRIFT 79/80` and
  `AXES_DRIFT coverage 10/9` from the frozen before — no other new finding.
- **Single origin resolution after merge**: `readFidelityPin`/`gitHead`/`resolveFidelityOrigin`
  (scripts/claims-check.mjs:639-698) implement PIN v1's rules for the fidelity path only.
  ExecClaimsPin's `--pin`/`resolveOrigin` should subsume them: point `runFidelity` at that
  resolver and delete this block. `readFidelityPin` already honours `opts.pin`, so an
  integrated `--pin FILE` is picked up without touching this arm.
- `--pin` itself is **not** parsed in this patch (exit 64 today) — that flag is
  ExecClaimsPin's item; the fidelity path works via the default pin file meanwhile.
- C2's 9 R5/R7 member sections are absent from this clone (ExecR5Sections/ExecR7Sections
  own them), so their `nonok=0` reading is not measured here [INFERENCE: they will enter
  the sweep only if their heading resolves uniquely and their symbols sit on the cited lines].

## 8. Files / evidence

- Patch: /fast/scratch/kumitate-r36/w/ExecClaimsFidelity.patch (695 lines, 1 file).
- Clone: /fast/scratch/kumitate-r36/w/ExecClaimsFidelity/lane (branch r36-execcf off 0614092).
- Runs: `fidelity-baseline.txt` (right-first 581), `fidelity-amended.txt` (both-sides 371),
  `fidelity-final-rule.txt` (final 357, per-note), `fidelity-pin-run.txt` (src-rev),
  `selftest-final.txt` (56/56), anchors-diff.mjs (delta probe, evidence only).
- No tool installs were needed.
