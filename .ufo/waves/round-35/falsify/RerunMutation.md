ATTACK C1-mutation-kills-0-2-to-2-2 verdict=holds defects=0

Target: C1 — `scripts/proxy-check.mjs` `layerTerms()` distinct in-family member
counting; declared before `MUTATION_KILLS 0/2` (master 1770305f), after `2/2`
(lane, S 88→87 / R 83→82).

## 1. Official pair, before (master)

Direct run on the read-only `/fast/scratch/kumitate-r35/master-tree` fails:
the harness tars `--self` into `/tmp/ExecMutationBefore.XXXXXX` preserving
modes, so the sandboxed mutations/cleanup hit `EACCES` (`rm: cannot remove
.../corpus/lessons/...: Permission denied`; trap cleanup leaves the tmp dir).
This is a harness-vs-read-only-tree friction, not a claim defect. Rerun on a
byte-identical chmod'd copy (`w/RerunMutation/master-rw`):

    bash .ufo/waves/round-35/mutate-distinct.sh.txt \
      --self /fast/scratch/kumitate-r35/w/RerunMutation/master-rw \
      --src /fast/scratch/kumitate-r35/src

    MUTATION_BASELINE S_sections=86 R_sections=83
    MUTATION S dup-one/drop-one before=86 after=86 killed=no
    MUTATION R dup-one/drop-one before=83 after=83 killed=no
    MUTATION_KILLS 0/2

Reproduces the declared before-count exactly (0/2; S 86→86, R 83→83).

## 2. Official pair, after (lane tree)

    bash .ufo/waves/round-35/mutate-distinct.sh.txt \
      --self /home/vgpnk/Projects/shokunin/kumitate-shokunin \
      --src /fast/scratch/kumitate-r35/src

    MUTATION_BASELINE S_sections=88 R_sections=83
    MUTATION S dup-one/drop-one before=88 after=87 killed=yes
    MUTATION R dup-one/drop-one before=83 after=82 killed=yes
    MUTATION_KILLS 2/2

Reproduces the declared after-count exactly (2/2; S 88→87, R 83→82).

## 3. My own dup-one/drop-one pair (different notes/members, S and R)

Targets (none shared with the official pair: fleet-dispatcher.mjs,
check-hand-authored-sets.mjs, queue-and-claim.md, successor-chain.md,
remaining-scripts-census.md, loop_driver.rs, axes.rs, loop-driver.md,
runtime-remainder-census.md):
- S: duplicate section `scripts/ufo-mission-result.mjs` from
  `corpus/knowledge/failure-telemetry.md` into `corpus/knowledge/ops-watchers.md`
  (S6 row names ops-watchers), drop section `scripts/the-tick-ping.mjs` from
  `corpus/knowledge/ops-watchers.md` (its only note; S6 member).
- R: duplicate section `crates/ufo-core-runtime/src/gate.rs` from
  `corpus/knowledge/gate-verdict.md` into `corpus/knowledge/runtime-support.md`,
  drop section `crates/ufo-core-runtime/src/gate_tests.rs` from
  `corpus/knowledge/gate-verdict.md` (its only note; R10 member).

Harness: `w/RerunMutation/my-mutate.sh` (same mutate_section/compare mechanics
as mutate-distinct.sh.txt, parameterized targets; JSON evidence under
`w/RerunMutation/artifacts/`). Lane tree copied to
`w/RerunMutation/after-rw` (.git/.jj dropped); copy baseline matches the real
lane tree byte-for-byte in gate terms:

    node scripts/proxy-check.mjs --self <lane> --src <src> --json
    → verdict=MATCH S_sections=88 R_sections=83 S_members=88 R_members=92
      findings=PIN_UNPINNED   (lane-direct-baseline.json == after-rw baseline)

After-tree (lane checker) results:
    MY_BASELINE S_sections=88 R_sections=83 verdict=MATCH findings=PIN_UNPINNED
    MY_AFTER    S_sections=87 R_sections=83 verdict=DRIFT
                findings=S_SECTIONS_DRIFT,COVERAGE_SCRIPT_DRIFT,AXES_DRIFT,PIN_UNPINNED
    MY_MUTATION S killed=yes          (S-after-*.json)
    MY_BASELINE S_sections=88 R_sections=83 verdict=MATCH findings=PIN_UNPINNED
    MY_AFTER    S_sections=88 R_sections=82 verdict=DRIFT
                findings=R_SECTIONS_DRIFT,COVERAGE_RUNTIME_DRIFT,AXES_DRIFT,PIN_UNPINNED
    MY_MUTATION R killed=yes          (R-after-*.json)

MATCH→DRIFT transitions caused solely by the mutation; dup leg adds no distinct
identity, drop leg removes exactly one.

## 4. Same pairs against the master checker (does master kill?)

Official pair on master: killed=no/killed=no (0/2, §1) — confirmed.

My pair on master (`w/RerunMutation/master-rw2`, master's own proxy-check):
    MY_BASELINE S_sections=86 R_sections=83 verdict=DRIFT
      findings=C2_TOTAL_DRIFT,S_MEMBERS_DRIFT,S_SECTIONS_DRIFT,COVERAGE_SCRIPT_DRIFT,
               AXES_DRIFT,AXES_DRIFT,PIN_UNPINNED          (S-master-before.json)
    MY_AFTER    S_sections=85 (S_SECTIONS_DRIFT already firing)  → term moved
    MY_AFTER    R_sections=82 (R_SECTIONS_DRIFT newly listed)    → term moved
Nuance, not a refutation: the master term does move for my targets (86→85,
83→82) because the drop leg removes one counted occurrence. But master's
baseline is ALREADY `DRIFT` on the unmutated tree (declared 88 vs computed 86,
S_MEMBERS_DRIFT, C2_TOTAL_DRIFT pre-firing), so the master gate has no
MATCH→DRIFT transition to offer: it reports drift on the healthy tree and
cannot attribute any mutation. The script-metric `is_killed` (term changed OR
finding newly fired) therefore prints `killed=yes` for my pair on master while
conveying zero detection power — the meaningful signal is the verdict
transition, which only the after-tree produces. Master also counts
occurrences, not identities: master-tree/scripts/proxy-check.mjs:595
`for (const s of row.sections ?? []) if (s.inFamily === true)
sections[layer] += 1;` (plain counter, :589/:599/:601) vs lane
scripts/proxy-check.mjs:593 `const sections = { S: new Set(), R: new Set() };`,
:600 `sections[layer].add(s.file);`, :605/:607 `.size` — the distinct-identity
change is real and is what makes the official pair's dup leg a no-op (+0)
instead of (+1)/(-1) cancelling.

## 5. Residual risk / observations

- `PIN_UNPINNED` appears in lane baseline findings even at verdict=MATCH
  (6 pins matched; one declared pin unpinned). Pre-existing, informational,
  unaffected by mutations; consistent with round-end `PROXY: MATCH … pins=6
  match`. Not a C1 defect.
- `mutate-distinct.sh.txt` cannot run `--self` directly against read-only
  trees (tar preserves modes; sandbox mutation + trap cleanup EACCES and
  leaves `/tmp/ExecMutationBefore.*` behind). Minimal fix if wanted: add
  `chmod -R u+w "$sandbox"` after the tar extract. Harness-only; no claim
  impact.
- [INFERENCE] The official pair nets 0 on master because both legs count
  there (dup fleet-dispatcher into successor-chain lands in a row that names
  the member → +1 occurrence; drop check-hand-authored-sets → −1), whereas my
  pair's dup leg adds 0 on both trees (destination row does not name the
  duplicated member). Consistent with all six observations above; not
  separately traced through claims-check's row resolution.

## Verdict

HOLDS. Before 0/2 and after 2/2 reproduced exactly for the official pair;
independently designed S and R pairs (different notes and members) are both
killed by the after-tree via clean MATCH→DRIFT transitions; the master tree
kills neither in any usable sense (its gate is already DRIFT at baseline, and
its occurrence counter cancels the official pair). No defects found in C1.
