CRITIC axes operability=8 harms=1 coverage=9

`coverage=` here is the retired aggregate, derived. The family scores in the same snapshot are script 10, runtime 10 and kimi 10. The one harm is fixable: `harms=1` drops to 0 once the missing `corpus/README.md` row lands (§2, H1).

# CriticAxes — round 36 build wave (read-only critic)

Trees measured. Source was read only through `/fast/scratch/kumitate-r36/src` @ `31c465f15669`.
- **P** — pristine master `0614092` (lane tree before integration, about 02:20) and the
  untouched clone `w/KumitateR36.ReviewClaimsArm/pristine` (HEAD 0614092).
- **S** — executor clones `w/*/lane`, 02:27–02:33, scored with the lane gates via `--self <clone>`.
- **I** — the lane working tree while the L1 integrates. Snapshots at 02:31, 02:34:12, 02:38:50 and
  02:39:58; the last one already had the 15 re-anchored notes, pin-aware claims-check, both
  re-pins and the 9 R5/R7 sections.
  The final tree does not exist yet: `anchor-fidelity-gate.md`, `lessons/round-36.md` and
  their rows have not landed. The verdict line describes I at 02:39:58.

## 1. Operability: it moves upward only, and the integer stays at 8
The terms are frozen. A counts files named `*.mjs|*.js|*.sh|*.py` with only `.git` pruned, so `.ufo/` and `.jj/` are
walked (`scripts/proxy-check.mjs@0614092:325,499-503,752`; `SCORECARD.md:25-27`). C counts `SKILL.md` lines
that match `/^\s*- \[/` (`proxy-check.mjs@0614092:326,753`; `SCORECARD.md:39-40`).

| tree | A | C | f_O = (A+C)/(A+C+3) | floor(10·f_O) |
|---|---|---|---|---|
| P | 7 | 13 | 20/23 = 0.8696 | 8 |
| I (all four snapshots) | 7 | 14 | 21/24 = 0.8750 | **8** |

- f_O rises by 0.0054 and the integer stays 8. Reaching 9 needs A+C ≥ 27 (27/30 = 0.90), which is 6 more
  honest terms. C1 is an f_O walk plus a pass-rate claim; it is not an operability integer move.
- C is honest. All 14 `- [` lines (`SKILL.md:627-640` in I) match the runner grammar `CHECKLIST_RE`
  (`scripts/surface-probe.mjs@0614092:182`, loop `:799-803`), so the count is 14 of 14. The loose proxy
  regex and the strict runner therefore agree. No other `- [` line exists in SKILL.md; the scribes'
  `- [~]` boxes go to SHONEN.md and the report.
- A is unchanged. None of the 11 patches in `w/` adds a runnable file or a mode line; ExecPinFiles adds 3 × 100644
  JSON. `ExecProxyPin.patch` touches none of the derivation names RE_RUNNABLE, RE_CHECKLIST, walkFiles,
  operabilityOf, coverageOf, TERM_KEYS, RE_README_ROW or CORPUS_DIRS (0 hits on its +/- lines). The
  patched claims-check (pin and fidelity) leaves the imported `probeSections` output unchanged: S 88/88 in
  every clone and in I.
- The exec-bit count is also 7, but it is a different set: `kimi-census.mjs` is 0644, while
  `.ufo/waves/round-35/mutate-distinct.sh.txt` is 0755. Only the extension rule is frozen.

## 2. Coverage family

| score | previous (`SCORECARD.md:314-317`) | P | I 02:31 | I 02:39:58 |
|---|---|---|---|---|
| coverage (retired) floor(10·C1·C2) | 10 declared | **9** (19/19·79/80) | 10 (19/19·80/80) | **9** (19/19·80/81) |
| coverage:script-layer | 10 | 10 (8/8·88/88) | 10 | 10 (88/88) |
| coverage:runtime-layer | 9 | 9 (11/11·83/92) | 10 (92/92) | 10 (92/92), the C2 claim |
| coverage:kimi-layer | 10 | 10 (5/5·51/51) | 10 | 10 (51/51) |

**H1 (measured harm, fixable): retired aggregate 10 → 9, down 1.** `corpus/knowledge/pinned-evidence.md` landed
untracked without a README row. `diff` of notes against rows prints `< knowledge/pinned-evidence.md`, notes are
81 against 80 rows, and floor(10·80/81) = floor(9.877) = 9. The proxy then reports
`C2_TOTAL_DRIFT declared=80 computed=81` and `AXES_DRIFT coverage: ## Axes row=10 derived=9`, so item 8
(`PROXY: MATCH`) fails and the round reads `CHECKLIST` 13/14. This persisted across the 02:34:12, 02:38:50 and
02:39:58 snapshots.
- **The item's premise is off in two ways.**
  1. "Stays 10" was already false at P. The integrator commit `0614092` landed
     `lessons/round-35-verifier-spotcheck.md` without a row, giving a derived 9 (`baseline/proxy-pin.txt`). The
     round restores 10 through ExecReadmeRow, which is the C1 "README (C2 row)" touch. Log it as a repair, not
     a coverage gain.
  2. "C2 80/80" is not the right end state. ScribeReadmeMap plans 3 more notes and rows (lines 16-17 of its
     report), so the honest end state is **83/83**, and the stanza must read `C2=83 C2_total=83`. The
     integrated stanza currently says 80/80. Each note that lands without its row costs 1 point
     (82/83 → 9).
- **This miss recurs every round.** `corpus/README.md:93` records the same miss for round 34 ("landed without
  one, `C2_TOTAL_DRIFT` 77→78"). [INFERENCE] The round-36 verifier spot-check will probably land after close
  in the same way and reopen `AXES_DRIFT` when round 37 opens.

**Script layer: held.** S is 88/88 in every slice and in I. Across all 20 modified notes, `git diff` shows 9
heading `+` lines (the R5/R7 headings) and **0** `-#` lines, so no existing member heading was edited.
`--row S8 --strict` on the S8 slice returns MATCH with sections=60 and adv=0.

**Runtime layer: rises by 1, which is the C2 claim, not a harm.** The distinct accounting holds:
- The R5 slice reads R 87 (+4), the R7 slice reads 88 (+5), and their union reads 92 (both in
  `ReviewSeparabilityTree/laneC2` and in I).
- R9's `local_ship_tests.rs` section has status `SECTION_FILE_NOT_MEMBER`, and the counter keeps only
  `inFamily===true` sections (`proxy-check.mjs@0614092:600`). R7's new section is therefore a new
  identity, so the round does not land on 91/92.
- In I, the claims gate reads `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)`.
- The 9 new sections pass the fidelity sweep: `local-ship` reads ok=42/42 and `native-admission-detail` reads
  ok=38/38, both with nonok=0.

**Kimi layer: held.** The K sections come only from `corpus/knowledge/kimi-*.md`
(`proxy-check.mjs@0614092:337,700`). No round edit touches those files, and the new notes do not match that
pattern. K_members is read live from `~/.kimi-code` (51 at 02:39); a change there would be host drift, not
round drift.

**C1 19/19: held.** No registry row changed. Guard: if the R5/R7 4th cell is rewritten, it must still start
with `yes` (`proxy-check.mjs@0614092:545`). Writing `**yes**` would cost C1 (18/19 → retired 9) and C1r
(10/11 → runtime 9).

## 3. Gate-script edits: other drift
- **Pins.** I at 02:39:58 shows no PIN_DRIFT, so the three edited scripts are re-pinned. They must be re-pinned
  again after any later byte change. `PIN_UNPINNED sources-check` stays a warning by design
  (`SCORECARD.md:331-335`) and does not block MATCH.
- **Verdict format.** The new verdicts end with `; src-rev=31c465f15669)` for PROXY and ` src-rev=…)` for CLAIMS
  and FIDELITY, so the checklist substrings still match as prefixes. `round-gate.mjs` parses no verdict text
  (0 hits). The hermetic fixtures have no pin file, so the asserted literals
  (`proxy-check.mjs@0614092:1560,1569`) still hold.
- **Line identity shift.** Inserting 9 prose lines moved the checklist from 618-630 to 627-640. The baseline
  evidence and `claims.md:13` name items by line ("620, 625"). Pair before/after items by label, not by
  `SKILL.md:<n>`.
- **A-inflation guard.** Helper scripts sit in the scratch roots: ExecFidRemainder `repair.mjs`, `propose.mjs`
  and `sides.mjs`; ExecFidOps `fidelity-measure.mjs` (0755); ExecFidSighting `ref.mjs`. Copying any of them
  into `.ufo/` as `*.mjs` gives A=8 and fires `A_DRIFT`; re-declaring A=8 instead would be false provenance.
  Keep the `*.mjs.txt` naming precedent. Separately, the stray
  `w/ExecFidRemainder/lane/corpus/knowledge/remaining-scripts-census.md.bak` is not counted (the `.md`
  filter is at `:516`), but it must not be committed.

## 4. Adjacent counterexamples (C1 claim scope, not axis harms)
- **Item 1 still reads the operator checkout.** `SKILL.md:627` (I) runs `node scripts/cite-check.mjs` with no
  `--src`, so it resolves `~/Projects/ufo-fsd-alpha` (`scripts/cite-check.mjs:106-119`). Two consequences:
  - The new prose at `SKILL.md:624` claims "Item 1 (`cite-check`) still takes an explicit `--src`", but the
    command does not take one, so the prose is false.
  - Frozen falsifier `claims.md:24` ("a checklist item still running against the operator checkout")
    fires, and `claims.md:19-20` ("every gate verdict line carries `src-rev=`") is unmet for `CITE_CHECK:`.

  Smallest correction: give item 1 `--src /fast/scratch/kumitate-r36/src` and correct the prose, or disclose
  the falsifier as fired. Adding PIN to cite-check is outside the frozen moves (d).
- **Part of the fidelity burn-down is unpairing.** The authoritative before (the final arm run on P, the
  pristine clone) is `anchors=1494 ok=317 elsewhere=461 absent=82 dead=168 noid=466 nonok=543`, not the
  prototype's 588. After, it is `anchors=1574 ok=867 … dead=168 noid=539 nonok=0`.
  - Of the pre-existing 1494 anchors, 470 nonok became ok and **73 became `noid`**, which is ungated and
    unratcheted. ops-watchers alone moved 86 → 137 (+51); remaining-scripts-census +11; route-probe-cluster
    +4; six other notes account for the remaining 7.
  - That is 13% of the debt made uncheckable rather than repaired. Disclose `noid 466→539` beside `nonok=0`,
    or re-pair those 73 anchors. The judge should not read CLEAN as 543 repairs.
- **Nit.** `claims.md:19-20` quotes `src-rev=31c465f1566` (11 hex), while PIN v1 prints 12 hex
  (`31c465f15669`, measured). The 11-hex form is a substring, so it is compatible.

## 5. Smallest safe corrections (all fixable; none needs the judge to reject a tradeoff)
1. **H1.** Add the README row for `knowledge/pinned-evidence.md`, using ScribeReadmeMap's A2 literal. Land
   `anchor-fidelity-gate.md` and `lessons/round-36.md` each with its row, and set the stanza to `C2=83`,
   `C2_total=83`. Re-run `node scripts/proxy-check.mjs` and expect `MATCH … coverage` with no `AXES_DRIFT`.
2. Fix item 1 (§4), or record the falsifier as fired.
3. Put `noid 466→539` in the C1 after-numbers.

**Tradeoff to name, not a defect.** The pin-aware items now depend on `/fast/scratch/kumitate-r36/src`, which
sits on persistent xfs (`findmnt`). If it is removed, items 3, 8, 10 and 14 exit 2 until the recreate line
in `.ufo/pins/origin.json` is run.

## Commands (read-only; cwd = lane unless noted)
- `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src --json` on P, run before the L1 began
  editing: `A=7 C=13 C1=19/19 C2=79/80 coverage=9 S=88/88 R=83/92 K=51/51`, with findings
  C2_TOTAL_DRIFT, AXES_DRIFT coverage and PIN_UNPINNED.
- `node scripts/proxy-check.mjs --self <clone> --src <pin> --json` over 13 clones: C=14 only in
  ExecChecklistRewrite, C2 80/80 only in ExecReadmeRow, R 87 (R5) / 88 (R7) / 92 (laneC2), S 88 and A 7 everywhere.
- `node scripts/proxy-check.mjs --json` (pin default) on I at 02:39:58:
  `A=7 C=14 op=8 | C1=19/19 C2=80/81 coverage=9 | S=88/88 script=10 | R=92/92 runtime=10 | K=51/51 kimi=10`,
  findings `[C2_TOTAL_DRIFT, AXES_DRIFT coverage, PIN_UNPINNED]`. At 02:31 the same run read C2=80/80
  coverage=10 with only PIN_DRIFT ×2.
- `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` → 7;
  `grep -c '^\s*- \[' SKILL.md` → 14; notes 81 against rows 80; `diff` → `< knowledge/pinned-evidence.md`.
- Grammar check: a `node -e` loop applying CHECKLIST_RE to the integrated SKILL.md → `C(proxy RE)=14 parsed=14`.
- `node scripts/claims-check.mjs` → `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)`.
- `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` →
  `FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)`. The same arm with
  `--self w/KumitateR36.ReviewClaimsArm/pristine` gives `FIDELITY: DRIFT (nonok=543 …)`.
- `git --no-optional-locks diff -- corpus/knowledge | grep -E '^[-+]#{1,6} '` → 9 `+` lines, 0 `-` lines.
- No tools were installed or updated. Nothing was written except this report; no pacman, git or jj mutation.
