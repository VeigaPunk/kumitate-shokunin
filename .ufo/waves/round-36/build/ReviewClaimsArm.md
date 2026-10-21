REVIEW claims-arm cases=46 before=543 gaps=8

# ReviewClaimsArm — claims-check FIDELITY + PIN (round 36 build wave)

Scope: the landed runtime at lane `0b5dcfb` (integration commit `3d5760a`),
`scripts/claims-check.mjs` sha256 `5a03ad08f8937ba0…`, plus the two patch artifacts
`/fast/scratch/kumitate-r36/w/ExecClaimsFidelity.patch` and
`/fast/scratch/kumitate-r36/w/KumitateR36.ExecClaimsPin.patch`. The landed fidelity
implementation is a third implementation ("FIDELITY v1 (reviewer arm)", `scripts/claims-check.mjs:204-361`);
neither patch is in the tree as written. All runs used self=lane or my pristine
0614092 clone, src=`/fast/scratch/kumitate-r36/src` (detached 31c465f1, chmod a-w);
the clone's listing+mtime sha256 was identical before/after the pin run.

## Verified good (landed code)

- PIN v1: `--pin`/default `.ufo/pins/origin.json` discovery, `--src` else pin.clone,
  full-40-hex `git rev-parse HEAD` compare, `SRC_REV_MISMATCH`/`SRC_REV_UNVERIFIABLE`/
  `PIN_MALFORMED`/`SRC_NOT_A_DIR` all exit 2 with no scored output; `src-rev=` in both
  MATCH/DRIFT verdicts and fidelity CLEAN/DRIFT. Verified on real fixtures and the lane.
- Ratchet (`kumitate-fidelity-ratchet-v1`): listed ceiling, total ceiling, unlisted
  note => ceiling 0, revision bound to the pin, malformed/stale => exit 2. Fixtures
  pass/fail exactly as specified.
- Claims-arm after target at the pin: item 10 `CLAIMS: MATCH (rows=19 yes=19 notes=27
  sections=184 adv=4 src-rev=31c465f15669)` exit 0; item 14 `FIDELITY: CLEAN (notes=20
  anchors=1574 src-rev=31c465f15669)` exit 0 with `FIDELITY_TOTAL … nonok=0`.
- `pin.claims-check` (SCORECARD.md:305) equals the landed file hash — no `PIN_DRIFT`.
- Patch artifacts in isolation: ExecClaimsFidelity.patch 56/56 (17 fidelity cases);
  ExecClaimsPin.patch 48/48. Co-applying both to 0614092 fails to parse:
  `SyntaxError: Identifier 'gitHead' has already been declared` (each adds a top-level
  `gitHead`; the fidelity patch's own comment says to delete its resolver). Verified
  integration: delete `readFidelityPin`/`gitHead`/`resolveFidelityOrigin`, call the pin
  arm's `resolveOrigin`, use `origin.pin.srcRev` => 65/65.

## Findings

G1 HIGH — span tokenizer drops Markdown double-backtick spans. `scripts/claims-check.mjs:222`
and `:280` use `` /`([^`\n]+)`/g ``; the frozen reference and the fidelity patch use `*`.
On `corpus/knowledge/ops-watchers.md:51` (`` `` `no session writes for ${ageMin}min` `` ``)
the `+` form yields garbage spans (`" "`, `" ("`, `"–"`, `" ("`) and **drops the four anchors
`:889 :890 :892 :893`**. Measured on pristine at the pin: anchors 1494 (landed) vs 1498
(same code with `*`); dead 168 vs 172; nonok unchanged (543). The gate silently ignores
4 real citations. Fix both regexes to `*`.

G2 HIGH — fidelity universe is a second parse, not the registry's. `fidelityWalk`
(`:247-314`) re-reads SCORECARD, re-splits the notes, re-walks `--src` and re-resolves
tokens (`:248-256`), then dedupes chunks by a content key (`:272`
`rel\0own\0length\0first80`). The frozen requirement is "walks only the member sections
the registry gate already parses"; the executor patch met it with an `onSection` sink on
`probeSections`, which was not integrated. Consequences already visible: the
failure-telemetry section (cited by S2 and S5) is counted once (anchors 22, not 44), and
`native-judge-pipeline.md` gets a bucket with `anchors=0`; the gate's `sections=184` and
the fidelity universe have no single authority. Before convention also shifts (see table).

G3 HIGH — no left fallback when the nearest right span is ineligible. `:298-301` selects
`pair = next ?? prev` and only then tests eligibility, so a right-side anchor/path/short
span yields `noid` even when an eligible symbol sits on the left. The frozen reference's
`pair()` falls back to the left span. Measured: same universe, right-first with fallback =
nonok 570; landed = 543 — 27 anchors (ops-watchers −18, sighting-wall −4, route-probe −2,
census −2, cost −1) moved from gated elsewhere/absent into ungated noid, and 12 truthful
anchors in remaining-scripts-census moved ok->noid. Align with the reference or record the
divergence as a contract change.

G4 HIGH — zero hermetic coverage for fidelity. Landed selftest is 46/46 (39 base + 7 PIN;
no `FIDELITY` case labels). The executor's 17 fidelity cases and the pin patch's 2 later
cases (same-prefix mismatch, absent-clone no fallback) are absent. `--fidelity`, the
ratchet, and fidelity pin/exit arms are untested in the shipped file. The executor's
fidelity fixture pins its FINAL clause rule: with the identical integrated file but the
frozen right-first pairing, the 65-case union reads 59/65 (6 failures).

G5 MED — before-number / record drift. Landed pristine 0614092 at the pin: anchors=1494,
nonok=543. Frozen claim evidence: 588 (anchors 1530). Contract right-first, no dedupe: 581
(anchors 1520). With the landed dedupe: 570 (anchors 1498). The landed header has **no
FIDELITY section at all** (no mode docs, exit map, before convention or pairing rule), and
commit `3d5760a`'s subject says "clause-guarded pairing" while the code is right-first
with no clause guards and no fallback. The round record must name the gate it measured.

G6 MED — ratchet/verdict ergonomics. `:1287` `--fidelity-ratchet FILE` alone does not set
`fidelity`, so the plain claims gate runs, the ratchet is silently ignored and exit is 0
(verified: `CLAIMS: MATCH …` while the ratchet demanded nonok=0). `:356` CLEAN omits
`nonok=` (the after target's `FIDELITY: CLEAN nonok=0` is only in the TOTAL line). `:344`
prints a `FIDELITY note=… anchors=0 …` line (native-judge-pipeline), contrary to "one line
per note with anchors > 0". Ratchet DRIFT joins every violation into one line: 1132 chars
on pristine. `--fidelity` silently ignores `--json/--row/--strict` (the patch refused them
with 64). Ratchet binds `origin.pin.revision` (the pin claim) rather than the verified
`origin.pin.srcRev`; equal after assertion, but the code should print the verified value.

G7 MED — gate semantics the ratchet does not close (must be stated as limits).
  (a) Section deletion: fx2 (2 sections, 2 elsewhere) -> delete the section with the debt ->
      `FIDELITY: CLEAN (notes=1 anchors=1)` and `CLAIMS: MATCH` (only `ROW_NO_SECTIONS`/
      files-count warn). The arm measures existing sections only.
  (b) Unpaired anchors: fx3 with 10 false citations and no adjacent backticked span ->
      `FIDELITY note=… anchors=10 … noid=10 nonok=0`, `CLEAN`, claims `MATCH`. Deleting an
      anchor or its adjacent symbol span removes it from the gated set; no anchors/ok floor
      exists in the frozen ratchet shape.
  (c) Zero-anchor hollow CLEAN: fx4 with no resolvable member section -> `CLEAN (notes=0
      anchors=0)` while the claims gate reads `SECTION_FILE_UNRESOLVED` exit 1.
  "A note absent from `notes` must read nonok=0" closes only (i) drift introduced in an
  unlisted note and (ii) removing a note from the ratchet to relax its ceiling; it does not
  close (a)-(c), because all three leave the measured per-note nonok at 0. Total ceiling 0
  (after fix) is the strongest available guard: it forbids any *detected* nonok anywhere.

G8 LOW — `isPathLikeSpan` (`:210-212`) has no `.txt`, so a backticked `.txt` path could pair
as a symbol (the anchor regex does accept `.txt` paths); `failFidelity` prints a duplicate
two-space line plus the verdict; `--fidelity` has no `--help`/usage documentation.

## Before-number reproduction (pristine 0614092, src 31c465f1)

| run | anchors | ok | elsewhere | absent | dead | noid | nonok |
|---|---|---|---|---|---|---|---|
| frozen prototype (baseline/fidelity-prototype-v1.txt) | 1530 | 340 | 492 | 96 | 173 | 429 | 588 |
| frozen contract, right-first, no dedupe (reference class) | 1520 | 338 | 487 | 94 | 172 | 429 | 581 |
| + landed dedupe (content key) | 1498 | 330 | 476 | 94 | 172 | 426 | 570 |
| landed (also no left fallback) | 1494 | 317 | 461 | 82 | 172 | 466 | 543 |
| landed with span `*` fixed | 1498 | 317 | 461 | 82 | 172 | 466 | 543 |

588 = 581 + 7 prototype artifacts: +4 native-judge-pipeline (substring heading match put
`native.rs` under `## Judgment order — …(:470)`, line 51; the real member section, line 186,
has no anchor), +2 ops-watchers (`config:53`/`config:49` paired as symbols though they are
anchors), +1 runtime-support (`"  "` punctuation-only paired as a symbol). Loop-driver −4
anchors and census +1 anchor are resolver/extension differences whose nonok is unchanged
(11 and 177 in both). No-dedupe is required to reproduce 588; dedupe alone is 577 on the
reference class.

## Methods / commands (excerpt)

- `node scripts/claims-check.mjs --selftest` -> `CLAIMS_SELFTEST: 46/46 pass`.
- `node scripts/claims-check.mjs` -> MATCH exit 0 (item 10).
- `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`
  -> CLEAN exit 0 (item 14).
- pristine: `node scripts/claims-check.mjs --self <pristine> --fidelity` (pin discovered,
  HEAD asserted) -> `FIDELITY_TOTAL anchors=1494 … nonok=543`, `DRIFT … src-rev=31c465f15669`.
- pin arms: `--src` at a different HEAD -> `FAIL-CLOSED (SRC_REV_MISMATCH)` exit 2;
  `--pin` malformed -> `PIN_MALFORMED` exit 2; non-repo src -> `SRC_REV_UNVERIFIABLE` exit 2.
- gate holes: fx2c/fx3/fx4 fixtures as in G7; claims gate outputs recorded above.
- patch co-apply: `git apply --3way` both patches -> SyntaxError (duplicate `gitHead`);
  manual dedupe -> 65/65, `--fidelity` at the pin CLEAN/DRIFT with verified src-rev.

## Residual risk / verification gaps

- I did not run the full 14-item checklist or the C2/proxy terms (other seats); the claims
  arm's two items pass at the pin.
- The landed note re-anchoring is out of my scope; I verified the gate's verdict, not that
  each rewritten anchor teaches truth beyond the paired-symbol test (G7b).
- [INFERENCE] The landed CLEAN at 1574 anchors is stable for the pinned clone; any change
  to the clone revision would trip SRC_REV_MISMATCH by design.
- No tool installs or upgrades were needed; nothing outside my scratch dir, this report,
  and the report path was written.
