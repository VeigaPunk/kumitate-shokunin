D7 present=yes honest=no verdict=partial
# Verify7 — D7 (ExecFidSmall.patch discard), round-37 falsify wave

Scope: round-36 spot-check disposition D7 only. Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin` at HEAD `86c0676` (tree clean except a peer's untracked `.ufo/waves/round-37/falsify/Verify2.md`). Pin `/fast/scratch/kumitate-r36/src` @ `31c465f15669` (read-only). Scratch clones and outputs: `/fast/scratch/kumitate-r37/Verify7/`. Lane git read-only (`git --no-optional-locks`); jj not run; no lane writes. Installs: none (node v24.21.0 pre-existing).

## Record under test
- `.ufo/waves/round-37/repairs.md:10-11`: "D7 ExecFidSmall.patch: DISCARDED (its four ReviewFidSmallB semantic failures were never fixed and its green depended on the right-first rule this round removes)."
- `corpus/lessons/round-37.md:33-35`: same two grounds.
- `LOG.md:1723-1724`: "D7 `ExecFidSmall.patch` discarded (four named semantic failures unfixed)" — ground 2 absent.
- Obligation, `corpus/lessons/round-36-verifier-spotcheck.md:209-210`: "D7 Apply or discard `ExecFidSmall.patch` explicitly. Its four ReviewFidSmallB semantic failures must be fixed first."

## 1. Present in the tree: yes
```
$ git --no-optional-locks status --porcelain
?? .ufo/waves/round-37/falsify/Verify2.md
$ git --no-optional-locks diff --stat 91da27c HEAD -- <the 14 patch notes>
(empty)
$ (clone of HEAD) git apply --check /fast/scratch/kumitate-r36/w/ExecFidSmall.patch; echo $?
0
$ (clone of HEAD) git apply --check -R /fast/scratch/kumitate-r36/w/ExecFidSmall.patch; echo $?
error: patch failed: corpus/knowledge/test-inventories.md:14   (… same for all 14 notes)
1
$ git --no-optional-locks log --all --name-status -- '*ExecFidSmall*'
A .ufo/waves/round-36/build/ExecFidSmall.md   (91da27c, d288bff) — the .patch was never committed
$ cat .ufo/pins/fidelity-ratchet.json   → "cost-and-profile.md": 1, "distill-and-l3.md": 1, "loop-driver.md": 1, "runtime-support.md": 3, "total": 186
```
Forward apply passes and reverse apply fails: the lane carries none of the patch's post-image. The ratchet ceilings equal the base-measured values (§3), not the patched zeros; consistent with a discard.

## 2. Ground 1 ("four semantic failures never fixed"): true
Patch copies `w/ExecFidSmall.patch` and `w/KumitateR36.ExecFidSmall.patch` are byte-identical (sha256 `aae552a2fc4e4e017a7e20e31b02d0dcf8a1e2202fed0af9a0d452691b61869c`). The rebase tree `w/ExecFidSmall/rebase` (cb80bc1 + patch) diffs byte-identical to the patch. The integ tree `w/ExecFidSmall/integ` (20 files) also keeps all four.

| # | flagged sentence | in patch (`+`) | HEAD (base) | at pin |
|---|---|---|---|---|
| a | swarm "Schema constants" cites `ufo-swarm-wave.mjs:134`–`:137` for SWARM_REGISTRY_SCHEMA | yes, patch l.1076 | base cites `:143`–`:146` (HEAD l.55) | 134–136 = SWARM_WAVE / SWARM_WAVE_ERROR / SWARM_DISPATCH; SWARM_REGISTRY_SCHEMA is imported at :110 and defined in `ufo-swarm-registry.mjs:27`; 143–146 = MAX_SPEC_BYTES, MAX_ITEM_BYTES, comments |
| b | collector byte cap "`MAX_INPUT_BYTES` 4 MiB" | not touched | HEAD l.110 | not defined in `ufo-swarm-collect.mjs`; a 4 MiB constant exists only at `ufo-mission-result.mjs:2693` (ReviewFidSmallB's "does not exist at the pin" is overbroad) |
| c | `validate_profile` = `native_admission_rules.rs:45-134` | yes, patch l.737 (widened from 45-131) | HEAD native l.28: 45-131 | fn closes at :129; :131–135 is validate_attempt_ledger_shape's doc comment |
| d | local-ship pending entry `(:239 then :255)` | yes, patch l.380 | HEAD local-ship l.32: `(:270, :282)` | :239 preimage ✔; :251 write_journal_entry; :255 = `})` closing `Ok(Self{…})`; :270/:282 sit in validate_journal_root_path's doc/guards |

Omitted by the record: discarding restores base text for a–d. Two of them (a, b) were base defects that the patch never removed. After the discard, HEAD still carries (a) and (b) as written, (c) over-inclusive by two lines, and (d) pointing at non-journal lines. "Never fixed" is accurate; "discarded" does not repair them.

## 3. Ground 2 ("its green depended on the right-first rule"): contradicted by the current gate
Per tree: `node scripts/claims-check.mjs --fidelity --src /fast/scratch/kumitate-r36/src [--fidelity-ratchet .ufo/pins/fidelity-ratchet.json]`

| tree | pairing (`claims-check.mjs`) | ratchet | verdict line (src-rev=31c465f15669) | nonok total |
|---|---|---|---|---|
| base-right = cb80bc1 | right, `next ?? prev` (l.300) | n/a | `FIDELITY: CLEAN (notes=20 anchors=1574 …)` | 0 |
| patched-right = cb80bc1 + patch | right | n/a | `FIDELITY: CLEAN (notes=20 anchors=1568 …)` | 0 |
| base-left = HEAD | left, `prev ?? next` (l.303) | no | `FIDELITY: DRIFT (nonok=186 …)` | 186 |
| patched-left = HEAD + patch | left | no | `FIDELITY: DRIFT (nonok=180 …)` | 180 |
| base-left | left | yes | `FIDELITY: CLEAN (notes=20 anchors=1551 …)` | 186, within ceilings |
| patched-left | left | yes | `FIDELITY: CLEAN (notes=20 anchors=1545 …)` | 180, within ceilings |

Per note, base-left → patched-left: cost-and-profile 1→0, distill-and-l3 1→0, loop-driver 1→0, runtime-support 3→0. No note rises. native-admission-detail stays at 3 in both trees.

Reading:
1. Under the retired zero-total reading, the patch's green depended on right-first. So does the base's (base-left DRIFT 186). The dependence does not distinguish the patch, so it cannot be the reason the patch was discarded.
2. Under the rule the round ships (CLEAN = no note above its ceiling), the patched tree is CLEAN and lower (180 vs 186). The patch is not a regression under the adopted rule. Ground 2 is contradicted by the tree's own gate.
3. Omitted consequence: the ratchet keeps 6 measured nonok (cost 1, distill 1, loop-driver 1, runtime-support 3) that the patch clears under the current rule. The discard keeps that debt.
4. The three records disagree: LOG.md gives only ground 1.
5. The rule ground 2 relies on is real: `node scripts/claims-check.mjs --selftest` on the HEAD clone → `CLAIMS_SELFTEST: 47/47 pass`, `VERDICT: PASS`.

## 4. Operability
- The discard is a note, not a state. The patch still applies cleanly to HEAD (§1) and sits at `/fast/scratch/kumitate-r36/w/ExecFidSmall.patch` (two copies). `.ufo/waves/round-36/build/ExecFidSmall.md` (committed in 91da27c) still names that path as the deliverable and says "`git apply --check` clean on a fresh HEAD clone".
- D6 moved its artifact byte-exact into `.ufo/waves/round-36/evidence/` and checked it with `cmp`. D7 has no lane copy, no sha256, and no tombstone.

## 5. Recommended corrections (for the L1; not applied by me)
1. `repairs.md` and `corpus/lessons/round-37.md` D7: delete ground 2, or restate it as "the zero-total green is rule-dependent for base and patch alike; under the ratchet the patch is CLEAN and lowers nonok 186→180". Record sha256 `aae552a2…` and "not applied: `git apply -R --check` fails on HEAD".
2. `LOG.md` round-37 entry: make D7 match `repairs.md`.
3. Decide explicitly whether the 6 nonok cleared by the patch (cost, distill, loop-driver, runtime-support) should be re-proposed as a hunk subset, and say so in the record.
4. Copy the patch into `.ufo/waves/round-36/evidence/` as D6 was, or annotate `ExecFidSmall.md` as discarded.

## Limits
- Ran FIDELITY (with and without ratchet) and the hermetic selftest only. No build, lint, or test runs.
- Did not reproduce ReviewFidSmallA's 0614092-based counts, and did not inspect other executors' patches.
- Pin checks cover only the lines cited in §2.
