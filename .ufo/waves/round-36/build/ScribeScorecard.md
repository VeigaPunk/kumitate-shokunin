SCRIBE scorecard drafted sites=8 planned=3

# ScribeScorecard — round-36 SCORECARD.md edit draft (no edits made)

Scope: SCORECARD.md only; I edited nothing (no scripts, notes, SKILL.md, pins, README, LOG.md, git/jj). Sites S2/S3/S4 were applied in the working tree by the integration owner while I drafted; their master-`0614092e` OLD text is quoted for the record and the applied wording is noted so nothing is double-applied. Still unobserved: FIDELITY (claims-check has no `--fidelity` yet: `grep -c fidelity scripts/claims-check.mjs` → 0) and surface `--known` (no match in `scripts/surface-probe.mjs`); those after-values are [TARGET] and the landed-run verdict lines replace them.

Grounding (all read-only): master `0614092e` proxy → `PROXY: DRIFT (C2_TOTAL_DRIFT declared=79 computed=80; AXES_DRIFT coverage row=10 derived=9; PIN_UNPINNED sources-check)`, identical error set to `baseline/proxy-pin.txt`; claims at pin → `rows:19 yes:19 notes:27 sections:175 errors:0 warnings:6 adv:6`, R5/R7 the only `form:topic` rows, R9 3 × `SECTION_FILE_NOT_MEMBER`, S2 1 (`ufo-mission-result.mjs`, an S5 member); C2 instrument 79 rows / 80 notes, `comm -23` → only `lessons/round-35-verifier-spotcheck.md` (79/80 ⇒ derived 9); `ls scripts/*.mjs | wc -l` → 7; `grep -c '^\s*- \[' SKILL.md` → 13 on master, **14 now** (ExecChecklistRewrite landed at SKILL.md:640, expectation exactly `FIDELITY: CLEAN`, no trailing period).

Live-tree status at last read (02:28–02:36): landed — stanza terms `C=14 C2=80 C2_total=80 R_sections=92 coverage_runtime=10`; both Axes rows (operability C=14 ⇒ 21/24, runtime 10 ⇒ `92/92`); `.ufo/pins/{origin,surface-known,fidelity-ratchet}.json`; surface-probe digest-order + mkdtemp dispatcher fix; proxy-check PIN v1 (`src-rev=` present). Patches reported but NOT in the lane at last read — `scripts/claims-check.mjs` is unchanged (`e9a21b44…`, `grep -c fidelity` → 0; ExecClaimsPin's PIN patch and ExecClaimsFidelity's arm are scratch-only), and surface-probe has no `--pin`/`--known` yet (grep: no match). Current gate line (two runs, seconds apart — the tree is live): `PROXY: DRIFT (PIN_DRIFT pin.surface-probe computed=c298d168…; PIN_DRIFT pin.proxy-check computed=3f1b7c7b…; PIN_UNPINNED scripts/sources-check.mjs; src-rev=31c465f15669)`; an earlier run read surface-probe `computed=5b3cf3be…`, so surface-probe was edited again between reads.

## S1 — `### operability`, C term: append a dated correction (PENDING; historical text kept)
OLD (closing lines of the round-35 correction; insertion anchor):
```
  `.ufo/waves/round-35/baseline/checklists.txt`). C counts listed items; the
  pass count is a separate measurement and is quoted with its date.
```
NEW:
```
  `.ufo/waves/round-35/baseline/checklists.txt`). C counts listed items; the
  pass count is a separate measurement and is quoted with its date.
  *Correction (round 36, 2026-10-21; both corrections above stay as written):*
  the list has 14 items since round 36 — item 14 is `Anchor fidelity` →
  `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → exit 0 + `FIDELITY: CLEAN` — and item 3
  names its pinned known-finding file (`--known .ufo/pins/surface-known.json`).
  `node scripts/surface-probe.mjs --checklists` reads `CHECKLIST: 14/14 pass`,
  `VERDICT: PASS`, exit 0 at the pin; the before reading was `CHECKLIST: 11/13 pass`
  (`.ufo/waves/round-36/baseline/checklists.txt`). C counts listed items:
  `grep -c '^\s*- \[' SKILL.md` → 14 ⇒ A=7, C=14 ⇒ `f_O` 21/24 = 0.875 ⇒ 8.
  The pass count is a separate measurement, quoted with its date and its `src-rev=`.
```

## S2 — `kumitate-proxy-v1` stanza (terms APPLIED; only the three script pins remain, PENDING)
APPLIED in the working tree (no edit needed): `C=14`, `C2=80`, `C2_total=80`, `R_sections=92`, `coverage_runtime=10`. Master-`0614092e` OLD for the record: `C=13`, `C2=79`, `C2_total=79`, `R_sections=83`, `coverage_runtime=9`.
OLD (still live, stale script pins):
```
pin.surface-probe=148cbf85ce4c7682a4ca4a663b730d28f4c41698100f7a0313f424c7b0ecb52e
pin.proxy-check=5852fefd6dc061c6123e9e5e791271fafddf157d520bd6a43aa32a7c3a81fdfb
pin.claims-check=e9a21b441f1216bf41d1cca037b36021c581ec7892df3bf973295f9321b0f61b
```
NEW (fill from the gate's own `PIN_DRIFT … computed=<hash>` after the FINAL edit — it printed the required value; do not hand-hash a moving file):
```
pin.surface-probe=<PIN_DRIFT computed=, last run c298d168469d4a84c943197abe8178e80a0b05ea594943d7bc54e2fa62767c4b>
pin.proxy-check=<PIN_DRIFT computed=, last run 3f1b7c7bfa74d9d22e5429a18660f67e68bc894aeb3b5b744a6443a8becdece8>
pin.claims-check=<PIN_DRIFT computed= after the fidelity arm lands; the file is still e9a21b44…>
```
`A=7`, `C1=19`, `C1_total=19`, `S_members=88`, `S_sections=88`, `R_members=92`, `coverage_script=10`, K block, `pin.cite-check`/`pin.round-gate`/`pin.kimi-census` unchanged.

## S3 — `## Axes`, operability row (APPLIED by integrator; no edit needed)
Working-tree text already carries `C=14`, `21/24 = 0.875`, "6 more honest items", item 14 = the anchor-fidelity sweep, and a round-36 f_O sentence. My independently derived value matches; keep the landed wording. Master-`0614092e` OLD (for the record) read `C=13 (… items 12–13 …) ⇒ 20/23 ≈ 0.870 ⇒ 8 … (7 more honest items) … | round 35 (gate discrimination; integer held) |`.

## S4 — `## Axes`, coverage:runtime-layer row (APPLIED by integrator; no edit needed)
Working-tree text now reads `floor(10 × 11/11 × 92/92)` = **10** at `31c465f1`, names R5's 4 and R7's 5 members and notes, and replaces the stale "Require selected rows 5/6/4" round-18 sentence. My drafted value matches (92/92, 10, 175 → 184 sections, adv 6 → 4); keep the landed wording.

## S5 — `## Move log`, C1 row (PENDING; insert after the separator, above `| 35 |`; that row untouched)
OLD (anchor):
```
| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
```
NEW (same two lines, then the row):
```
| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 36 | operability (pinned verdicts + an anchor-fidelity gate term; integer held at 8) | `CHECKLIST: 11/13 pass` (items 620, 625 red); `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1)` at the pin — `SCRIPT_DIGEST_MISMATCH` (sorted-order concat), `VERB_UNDECLARED surface` (upstream), `SURFACE_UNREACHABLE` (dispatcher `status` wrote `<src>/.ufo`); `PROXY: DRIFT (C2_TOTAL_DRIFT declared=79 computed=80; AXES_DRIFT coverage row=10 derived=9; PIN_UNPINNED sources-check)`, the missing C2 row being `lessons/round-35-verifier-spotcheck.md`; FIDELITY prototype `anchors=1530 ok=340 elsewhere=492 absent=96 dead=173 noid=429 nonok=588` | `CHECKLIST: 14/14 pass` (item 14 = the fidelity sweep; 620 green through `--known`); `FIDELITY: CLEAN (… src-rev=31c465f15669 …)` nonok=0 under the per-note ratchet; `SURFACE_PROBE: CLEAN (known=1 …)` and `PROXY: MATCH (… src-rev=31c465f15669 …)`; every verdict line names the revision it scored; concat follows the manifest's declared `digestInputs` order (`base.mjs` before `argv.mjs`), `DIGEST_ORDER` retained as a note; dispatcher status runs in a `mkdtemp` state dir and a before/after `find . -printf '%p %s %T@\n' \| sort` shows 0 changed paths under the pinned tree; rider: README row for `lessons/round-35-verifier-spotcheck.md` (C2 79 → 80/80, clearing both legacy drifts) | `node scripts/surface-probe.mjs --checklists`; `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`; `node scripts/proxy-check.mjs`; `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json`; `grep -c '^\s*- \[' SKILL.md` → 14; before artifacts `.ufo/waves/round-36/baseline/`; measured commit in `LOG.md` round 36 |
```

## S6 — `## Move log`, C2 row (PENDING; directly after S5)
NEW:
```
| 36 | coverage:runtime-layer (9 → 10 at the pinned origin) | `floor(10 × 11/11 × 83/92)` = **9**; R5 topic-form (4 declared members, 0 sections, `ROW_NO_SECTIONS`), R7 topic-form (5 members, 0 sections, `ROW_NO_SECTIONS`); repo-wide `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)` | `floor(10 × 11/11 × 92/92)` = **10**: R5 4 of 4 in `knowledge/native-admission-detail.md`, R7 5 of 5 in `knowledge/local-ship.md`, each with ≥1 own-file anchor whose paired symbol occurs on the cited line — the round-36 fidelity arm reads nonok=0 over the 9 new sections; strict rows `CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=9 adv=0)`; repo-wide sections 175 → 184, adv 6 → 4 | `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5 --row R7 --strict`; `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src` → `R=92/92 coverage:runtime-layer=10`; `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`; measured commit in `LOG.md` round 36 |
```

## S7 — `## Limits`: insert a round-36 bullet after the round-35 bullet (PENDING; that text untouched)
OLD (anchor):
```
  kind check accepts a symlink (seat CriticKimiLayer); the member is presence
  and shape only.
```
NEW (same two lines, then the bullet):
```
  kind check accepts a symlink (seat CriticKimiLayer); the member is presence
  and shape only.
- **Round 36 (2026-10-21) — the limit set moved; the round-35 entry stays as written.** (a) The anchor-fidelity debt is closed at the pin for the quantity the round-35 entry named: `FIDELITY: CLEAN (… src-rev=31c465f15669 …)` under `.ufo/pins/fidelity-ratchet.json`, nonok=0. Still outside the gate is what FIDELITY v1 excludes by construction: `dead` (range outside the file or N>M) and `noid` (no adjacent symbol span) are printed diagnostics, never gated and never ratcheted; the before prototype measured `dead=173 noid=429` over `anchors=1530`, and liveness remains the registry gate's job.
  (b) The pin is a named dependency, not a silent fallback: `.ufo/pins/origin.json` holds revision `31c465f15669f744848bd9f5d56191c5085670f7`, the read-only clone `/fast/scratch/kumitate-r36/src` and a one-line `recreate`; `--pin` resolves src from it, asserts `git rev-parse HEAD`, fails closed on `SRC_REV_MISMATCH` / `SRC_REV_UNVERIFIABLE` / `SRC_NOT_A_DIR`, and prints `src-rev=` in the verdict (`src-rev=31c465f15669` live at last read). A host without the clone cannot evaluate at the pin — the intended fail-closed, not a fallback to the operator checkout; with no pin file the gates behave exactly as before (portability).
  (c) The `KNOWN` line is a pinned upstream defect, not a lane fix: the manifest still omits `surface` at `31c465f1`, and a listed finding that stops firing is `KNOWN_STALE` (error).
  (d) `nonok=0` is a statement about PAIRED anchors only: an anchor whose adjacent symbol span is removed (or pushed past the 14-character window) is reclassified `noid`, so de-pairing can read CLEAN without any claim checked (ConnectorFidelityOverlap, `nonok`→`noid` vector). The v1 contract leaves `noid` ungated; the round-37 pre-registration adds a `noid` ceiling for that reason.
  (e) Repo-wide claims advisories after sectionization read `sections=184 adv=4` (S2 1 + R9 3); none is gating, and the residue is pre-registered in `## Planned` round 37.
```

## S8 — `## Planned`: insert the round-37 block above the round-36 block (PENDING)
OLD (lines 445–447):
```
## Planned

**Round 36 — pre-registration (2026-10-20, written by round 35).** Candidates,
```
NEW (same three lines, with the block between):
```
## Planned

**Round 37 — pre-registration (2026-10-21, written by round 36).** Candidates, not commitments; each is measured the round after it is declared here, against a source clone pinned by `.ufo/pins/origin.json`:

1. **operability — gate the `dead` diagnostic and floor `noid`** (fidelity v2, pre-registered before implementation). The v1 arm gates `nonok` only; `dead` (anchor range outside the file, or N>M) is printed and never gated, and the before sweep measured `dead=173` over `anchors=1530`; `noid` (no adjacent symbol) is likewise ungated, so de-pairing an anchor turns `nonok` into `noid` and reads CLEAN without checking any claim (ConnectorFidelityOverlap). Candidate: `nonok` and `dead` gated under the per-note ratchet, plus a `noid` ceiling (absolute, not zero — legitimate no-symbol anchors exist). Falsifier: a dead anchor passes under the new ceiling, any note's `nonok` ceiling rises, or `noid` rises above its ceiling.
2. **operability — pin doctor.** `--pin` asserts the clone's HEAD but not that the clone exists at the pinned path or is still `chmod a-w`, though the round-36 "gates do not write into the tree they read" claim rests on that bit. Candidate: fail-closed `PIN_CLONE_MISSING` and `PIN_CLONE_WRITABLE`, with the pin path and revision in the verdict. Falsifier: a pin whose clone is missing or writable still evaluates.
3. **quality — repo-wide claims advisories to 0** (uncounted rider). After R5/R7 sectionization the gate reads `sections=184 adv=4`, and all four are cross-family sections: S2's section for `scripts/ufo-mission-result.mjs` (an S5 member) and R9's three (`loop_driver_tests.rs`, `local_ship_tests.rs`, `distill_tests.rs` — R2/R7/R6 members). Candidate: rebind or drop each in the note that does not own it, leaving the distinct in-family counts unchanged. Falsifier: `adv` stays > 0, or a rebind duplicates an identity (the distinct count drops).

**Round 36 — pre-registration (2026-10-20, written by round 35).** Candidates,
```

## Conflicts (verbatim, for the canonical judge)
1. `LOG.md` round 35: "the S1–S7 topic notes carry 624 non-ok anchors at the pin (per note: ops-watchers 416, route-probe-cluster 65, … successor-chain 1; seat ExecS8Fidelity)" vs the frozen C1 before `nonok=588` (`ops-watchers 189`). Different instruments (liveness sweep vs FIDELITY v1 pairing); the draft uses 588 per contract and records 624 rather than reconciling silently.
2. `### coverage:runtime-layer` prose (SCORECARD.md ~236–251) still carries the round-17 reading (`R_sections` **69**, `floor(10 × 11/11 × 69/98)` = 7) while the stanza now reads 92 and the Axes row 10. Not one of this item's named sites; stale prose a later rider must reconcile.
3. `src-rev=` prints 12 hex (`31c465f15669`); the quest's shorthand `31c465f1` is an 8-hex prefix. Drafts use the gate's own 12-hex string.
4. Overlap with `build/ConnectorScorecardTerms.md`: its P2 is the same site as my S1 (the two correction texts must not both land — they say the same thing in different words; prefer one). Its P1 (`## Measurement proxies` A bullet at SCORECARD.md:35-38) and P3 (claim-block intro at :277-279) are sites I did not draft; its stanza table and both Axes rows match the values already applied. Its note that no `fidelity`/`src-rev` stanza key can be added without `STANZA_KEY_UNKNOWN` is consistent with S2 (terms only, no new keys).

## Out of scope / provenance
Not touched: SKILL.md (ExecChecklistRewrite), `.ufo/pins/*` (ExecPinFiles/ExecSurfaceKnown), `corpus/knowledge/{native-admission-detail,local-ship}.md`, `corpus/README.md`, `LOG.md`, all scripts. No build/lint/formatter/mutation ran; working tree changes are the integrator's/siblings' (I observed them mid-flight and adapted). Read: SCORECARD.md, LOG.md tail, SKILL.md checklist/gate registry, corpus counts, `.ufo/waves/round-36/{claims,accounting,baseline,build}`, `.ufo/pins/*`. No tools installed or upgraded. Artifact: `.ufo/waves/round-36/build/ScribeScorecard.md`.
