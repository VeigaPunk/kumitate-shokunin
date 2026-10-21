FIDELITY scripts/omp-role-work.mjs anchors=11 ok=7 moved=4 changed=1 gone=0

# C2 anchor-fidelity re-verification — `scripts/omp-role-work.mjs`

Scope: every anchor in `corpus/knowledge/remaining-scripts-census.md` citing this
member (section `## scripts/omp-role-work.mjs`, notes lines 584–605, plus table
row note:122). Notes were measured against upstream `964f443e` (round 32 header,
note lines 9–10); re-verified at pinned `31c465f1`.

## Diff shape (964f443e..31c465f1)

`git diff` = exactly +1/-1, hunk `@@ -83,7 +83,7 @@`, changing the
`"executor:repeated-run-reliability"` duty string at line 86 (both revisions
294 lines, zero line shifts elsewhere):
- `${ctx.root}/src/pareto.ts` → `${ctx.root}/packages/ufo-core/src/pareto.ts`
  with its `./policy.ts` and `./types.ts` imports;
- `strictParetoGate` over a decision matrix → `admitMove(axes, frontier, move)`
  over the same matrix.
No census note anchor cites pareto/`strictParetoGate`/`admitMove` (grep over the
census file: no matches), so the diff changes no note-described behavior. All
four non-ok findings below are pre-existing staleness — already false at
`964f443e` — not diff-caused.

## Anchor inventory (11 = 10 line anchors + 1 heading)

ok (7):
- note:584 heading — member present at 31c465f1.
- note:122 table row `| 294 |` — 294 lines at both revisions.
- note:589 `:38` `ROLE_METHODS` — ok; 10 role keys counted (ten postures ✓).
- note:590 `:69` `SCOPE_DUTIES` — ok; 16 `"role:scope"` keys counted (16 ✓).
- note:592 `:121` `SHARED_BOUNDS` — ok.
- note:593 `:129` `ROLE_EXTRA_BOUNDS` — ok.
- note:594 `:23` `RoleWorkError` — ok; class at 23; described import-time guard
  behaviors all present at 31c465f1: malformed duty key (`:151-153`), non-
  function duty (`:154-156`), non-string bounds array (`:158-168`).
- note:596 `:21` `seatId` from `ufo-native-names.mjs` — ok; import at line 21.

## Non-ok anchors

note:586 | `scripts/omp-role-work.mjs:233` | `roleWork` renders the duty block | moved | scripts/omp-role-work.mjs:213 | `roleWork` (`scripts/omp-role-work.mjs:213`, measured `964f443e`) renders the duty block a launcher embeds; re-anchored at 31c465f1.

note:598 | `scripts/omp-role-work.mjs:209` | `evidenceSection` renders evidence schema | moved | scripts/omp-role-work.mjs:189 | `evidenceSection` (`scripts/omp-role-work.mjs:189`, measured `964f443e`) renders the evidence schema; re-anchored at 31c465f1.

note:600 | `scripts/omp-role-work.mjs:176` | `META_CTRL_STRIP` strip regex | moved | scripts/omp-role-work.mjs:171 | `META_CTRL_STRIP` (`scripts/omp-role-work.mjs:171`, measured `964f443e`) sanitizes lineage/axes before the duty body; re-anchored at 31c465f1.

note:603 | `scripts/omp-role-work.mjs:259` | `invalid_key` rejection of forged key | moved | scripts/omp-role-work.mjs:239 | an inherited or forged key is rejected `invalid_key` (`scripts/omp-role-work.mjs:239`, measured `964f443e`); re-anchored at 31c465f1.

note:600-602 | (claim beside `:176`) | strips C0/C1 controls AND U+2028/U+2029 line separators plus bidi overrides | changed | scripts/omp-role-work.mjs:171 | `META_CTRL_STRIP` (`scripts/omp-role-work.mjs:171`, measured `964f443e`) strips C0/C1 controls and DEL only — no U+2028/U+2029 or bidi handling; re-anchored at 31c465f1.

## Evidence

Commands run:
1. `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/omp-role-work.mjs`
   → 1 file changed, +1/-1, hunk at lines 83–89 (duty string at 86).
2. `git show 964f443e:scripts/omp-role-work.mjs | wc -l` and same at `31c465f1`
   → 294 and 294.
3. `grep -n` for all cited symbols at both revisions → identical line numbers
   both sides: `RoleWorkError` 23, `ROLE_METHODS` 38, `SCOPE_DUTIES` 69,
   `SHARED_BOUNDS` 121, `ROLE_EXTRA_BOUNDS` 129, `META_CTRL_STRIP` 171,
   `evidenceSection` 189, `roleWork` 213, first `invalid_key` fail 239; no
   `2028|2029|202A|202E|200E|200F|bidi` anywhere in the file.
4. Key counts at 31c465f1: `ROLE_METHODS` region 38–59 → 10 keys;
   `SCOPE_DUTIES` region 69–117 → 16 keys.
5. Read 31c465f1 lines 1–45, 60–140, 141–170, 165–270 and the raw diff hunk.

## Residual risk / gaps

- The four moved anchors were wrong already at the census's own measurement
  revision `964f443e` (e.g. `roleWork` declared at 213 in both), so this is
  round-32-era staleness, not upstream drift from this diff — worth a sweep of
  sibling members' anchors, out of my scope.
- The `META_CTRL_STRIP` overclaim (U+2028/U+2029/bidi) cannot be re-anchored,
  only reworded; whether the launcher strips those elsewhere lives in
  `scripts/run-omp-native-trial.mjs` and is outside this member's scope.
- Did not edit the notes (read-only per assignment).
