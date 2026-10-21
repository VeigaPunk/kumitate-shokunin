MUT known kills=3/5 survivors=kind-only,drop-subject

# MutKnown — KNOWN v1 mutation test (round 36, build wave)

## Target and detector
- Target snapshot: ExecSurfaceKnown's working-tree `scripts/surface-probe.mjs` taken 2026-10-21 02:26:39
  (1803 lines), copied to `/fast/scratch/kumitate-r36/w/KumitateR36.MutKnown/actual/surface-probe.mjs`,
  sha256 `6ab02e0b9a2e980f3607220868b395df5d14727103a4115bf5f67bb669d359f8`.
- Scratch clone: `/fast/scratch/kumitate-r36/w/KumitateR36.MutKnown/lane`, clone of the lane repo at
  `0614092e0804aaca06642cb3a263a05c1cacc98e`, branch `r36-mutknown`; all mutants applied only there.
- Detector for every run: `node scripts/surface-probe.mjs --selftest` (cwd = scratch clone), same command
  on pristine, mutated and restored bytes. Baseline: exit 0, `50/50 cases passed`, `VERDICT: PASS`
  (`logs/actual-baseline.txt`). A baseline failure would have been inconclusive; there was none.
- Every run rebuilt the lane file from the immutable snapshot with `cp`, mutated, hashed, ran, and restored
  from the snapshot (`cp`), then re-hashed.

## Per-mutant results

### M1 — match on kind only: SURVIVED
- Mutation (snapshot `:389`, `:395`): `byQuad.set(knownKey({ ...finding, subject }), …)` → `byQuad.set(String(finding.kind), …)`;
  `byQuad.get(knownKey(entry))` → `byQuad.get(String(entry.kind))`.
- Mutant hash `70a642e9fd81cffe89aebabee7d3d85a447928f4ab737e4e67c0f88c725b9507`.
- Output: exit **0**, `50/50 cases passed`, `VERDICT: PASS` — the suite has no fixture whose known entry agrees
  on `kind` but differs in `surface` or `check` (`logs/actual-m1r.txt`).
- Contract violation demonstrated by `probe-harness.mjs` (`logs/survivor-semantics.json`), finding
  `{surface:"sighting", kind:"VERB_UNDECLARED", check:"VERB_DISPATCH", subjects:["surface"]}`:
  - known `{check:"WRONG_CHECK"}`: correct → matched=0 stale=1, finding not excused; mutant → **matched=1 stale=0,
    finding excused**.
  - known `{surface:"dispatcher"}`: correct → matched=0 stale=1; mutant → **matched=1 stale=0, finding excused**.
  A wrong-check/wrong-surface acceptance entry silently excuses a real error instead of going KNOWN_STALE.
- Initial variant mutating the shared `knownKey` (rather than the two match sites) was detected only by crashing
  fixture construction (kind-key collision in `loadKnown`'s dedupe, exit 1); the refined match-site mutant above
  is the clean semantic probe, and it survived.

### M2 — drop the subject from the tuple: SURVIVED
- Mutation (snapshot `:389`, `:395`): keys become `[surface, kind, check].join("\u0000")` on both sides.
- Mutant hash `b7e19236524b8161c1580bc7a127b6d74cdc42a1f3e67204609a02e63bd8d01b`.
- Output: exit **0**, `50/50 cases passed`, `VERDICT: PASS` (`logs/actual-m2.txt`).
- Contract violation demonstrated (`logs/survivor-semantics.json`): known entry with subject `"other"` against a
  finding whose only subject is `"surface"`: correct → matched=0 stale=1; mutant → **matched=1 stale=0**
  (a `KNOWN` line is printed for an expectation that did not fire). The finding itself remains gated because the
  implementation also requires every finding subject to be listed, so the defect is the false KNOWN/match
  bookkeeping and the lost staleness term, not a wrongful full excusal.

### M3 — never mark stale: KILLED
- Mutation (snapshot `:396`): `if (hit === undefined) { stale.push(entry); continue; }` → `{ continue; }`.
- Mutant hash `4afbd53e789adacbfb9fd566e232bf310c1fa86f5dbfb117bcd4a892a18384af`.
- Output: exit **1**, 47/50; structured FAIL
  `--known: a listed finding that stops firing → KNOWN_STALE error, DRIFT exit 1 — verdict=CLEAN exit=0`,
  plus meta-FAIL `every declared finding code fires … never fired: KNOWN_STALE` (`logs/actual-m3.txt`).

### M4 — count known findings as errors: KILLED
- Mutation (snapshot `:646`): `const gating = findings.filter((f) => f.known !== true);` → `const gating = findings;`.
- Mutant hash `2e955a9422194f11f6e9d7b126044c824b0153547a11a0db043618f2f1977f35`.
- Output: exit **1**, 47/50; FAILs `--known: a listed finding fires → excused … — verdict=DRIFT exit=1 known=1 errors=1`
  and `--known: every subject … listed — verdict=DRIFT known=2 errors=1` (`logs/actual-m4.txt`).

### M5 — ignore revision mismatch: KILLED
- Mutation (snapshot `:1752`): `if (pin !== null && loaded.revision !== pin.revision)` → `if (false && pin !== null && …)`.
- Mutant hash `90f7306a77b8daee0442e2d7658dae021c94903c851cbf0498811b5805c731b1`.
- Output: exit **1**, 48/50; FAIL `--known: revision != the active pin revision → FAIL-CLOSED KNOWN_REV_MISMATCH`
  (`FAIL-CLOSED (--src /nonexistent/…)` instead of `KNOWN_REV_MISMATCH`) (`logs/actual-m5.txt`).

## Restoration evidence
- Snapshot restored: `lane/scripts/surface-probe.mjs` sha256 `6ab02e0b9a2e980f3607220868b395df5d14727103a4115bf5f67bb669d359f8`,
  selftest exit 0, `50/50 cases passed`, `VERDICT: PASS` (`logs/actual-restored.txt`).
- Lane then reset to pristine master: `git checkout -- scripts/surface-probe.mjs`, sha256
  `148cbf85ce4c7682a4ca4a663b730d28f4c41698100f7a0313f424c7b0ecb52e`, `git status --porcelain` empty.

## Secondary cross-check (independent reference implementation)
Before ExecSurfaceKnown's file appeared, a reference KNOWN v1 was implemented from the frozen contract in the
same scratch clone (sha256 `fb1fedd23770001a5e4065652cd080a95c341c3fb2624c25d22aaab787e74ab9`, baseline 48/48 PASS,
`logs/baseline.txt`). With two extra fixtures the actual suite lacks (wrong check/surface, and wrong subject),
all five mutants were killed there (`logs/m1.txt`…`logs/m5.txt`, exit 1 each). This shows the probes are
detectable with fixtures of this shape, and the 2/5 survival above is a coverage gap in the shipped selftest,
not an untestable property.

## Operational notes
- No tool installs or upgrades; no pacman transactions. No writes outside the scratch dir and this report.
- REA not used. No production lane file, git index or jj state touched.
- [INFERENCE] The target is a live working-tree snapshot; if ExecSurfaceKnown edits `surface-probe.mjs` further
  before integration, M1 and M2 should be re-run against the final bytes (same three commands), because both
  currently pass its suite.
