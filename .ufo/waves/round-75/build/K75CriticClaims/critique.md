# Round 75 critic — K75CriticClaims

Axes attacked: coverage:omp, operability; collateral calibration/freshness. Review of frozen plan and available candidate patch, not admission or a close-state certification.

## Decisive flaws

### C1: numeric binding accepts a note with no member bindings

Counterexample exercised against `build/K75ExecCensusRules/K75ExecCensusRules.patch`: apply the patch to an owned scratch copy of the base census; supply a note consisting solely of one HTML comment, containing `NOT_A_BINDING_<declared-name>_SUFFIX` for each of the 35 names. Run:

`node /fast/scratch/hyaku/kumitate-r75/K75CriticClaims/scripts/omp-census.mjs --root /home/vgpnk/.omp/agent --note /fast/scratch/hyaku/kumitate-r75/K75CriticClaims/stuffed.md`

Observed exit **0** and `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=64 findings=0 bound=35/35)`. Exact input, command and output: `build/K75CriticClaims/note-stuffing.json`. Scratch was removed in `finally`.

Evidence: candidate patch lines 74–78 use `noteText.includes(name)`; its selftest writes names alone and tests only removal of the `models-corrupt` substring (lines 149–150, 210–215). No heading, identity-token boundary, visible statement, ownership relationship or source is required. This measures occurrence, not substantive knowledge binding.

Why operational predicate cannot reject it: plan lines 25–40 require the CLEAN/count line and found names; specificity and drop-rule tests exercise name classification, not note semantics. Replacing only note prose does not disable declaration branches. **Limit:** I exercised the live binding arm, not the entire conjunction and all mutants. The semantic kill sentence at plan line 43 can reject this if “binds” means more than contains; its implementation cannot currently make that distinction. Executor correctly reports its seat explicitly defines binding as verbatim containment: this is a contract-quality counterexample, not evidence the executor ignored that literal instruction.

Smallest safe correction: preserve ordinary prose, but require exact identifier tokens in visible note text (exclude comments/code-only decoys) and add the demonstrated superstring/comment negative case. If substantive sourced member explanation is intended, name and check that relationship rather than claiming the current count proves it. Do not alter the frozen predicate after data: this criticism and any implementation correction must remain disclosed, with the canonical judge deciding whether the original semantic kill rule covers it. No critic admission judgment is made here.

Impact: coverage:omp and calibration. A 35/35 count cannot establish “every member” knowledge coverage when an invisible token list gets the identical verdict.

## Attacks that failed

1. **Do nothing reaches C1:** rejected by committed `base/omp-census-base.txt`: `entries=64 findings=40`, exit 1. Plan lines 18–22 fix denominator and the 40 misses. Adding sourced anchored rules for new edge families can legitimately govern new surfaces (AXES.md:12; prompt §9 lines 562–566); rule addition alone is not automatically fraud. However 3→10 is shape-rule recognition, not semantic understanding, content validation or recursive agent-plane coverage. Multiple backup generations weight the numerator heavily, and the terminal score concerns depth-1 names only.

2. **Blanket widening passes:** plan C1(b), lines 27–29, explicitly requires `UNLISTED` and exit 1 for the bogus fixture. `controls/c1-junkwiden.txt:25–27` shows catch-all CLEAN/exit 0, which **fails (b)**. Its prose saying “(b) alone cannot reject the cheat” is backwards; its own numeric receipt demonstrates rejection. Drop-rule control separately fails five cases (`controls/c1-droprule.txt:3–10`). No blanket bypass proved. A selective overly broad regex can still evade a single chosen bogus name; test malformed near-neighbors, not just unrelated junk. Candidate patch includes a short-date negative per new family, but does not prove all near-neighbors are excluded.

3. **MOVED exit 1 poisons the default checklist:** frozen C2(e), plan lines 81–87, forbids default-mode semantic changes and requires strict MATCH. The executable checklist currently runs default `--strict`, not `--tip-drift` (`open/checklists-open.txt:9–13`). A legitimate ahead origin is expected diagnostic drift, not an automatic failing default check. No poisoning proved; no new default checklist item should demand exit 0 from this diagnostic in the measured MOVED world.

4. **C2 frozen counts false:** independent read-only commands `git -C /home/vgpnk/Projects/ufo-fsd-alpha rev-parse HEAD`, `git -C /home/vgpnk/Projects/ufo-fsd-alpha rev-list --count 31c465f15669f744848bd9f5d56191c5085670f7..HEAD`, and `git -C /home/vgpnk/Projects/ufo-fsd-alpha diff --name-only 31c465f15669f744848bd9f5d56191c5085670f7 HEAD` returned fb7157fcf14625be9d0b91bdd425a4b3212e4194, 58, and 241 paths. Applying existing proxy patterns (proxy-check:504–506) yields 57 scripts, 23 runtime, 161 other. All three exits 0; `build/K75CriticClaims/origin-counts.json`. Counts are stable for these two commit identities, not forever for live HEAD. Plan lines 70–71 already require changed-tip numbers to change: disclose any changed world; never hardcode the open result.

5. **C2 merely duplicates rev-list:** rev-list alone supplies only commit count. Declared capability adds pin selection, layer path totals, fixed parseable output and 0/1/2 failure semantics. A wrapper is a real operability capability under AXES.md:57–64 if those behaviors run; it is not evidence of adopting changed upstream behavior. Current base explicitly lacks the mode (base/tip-drift-base.txt exit 64). Constant printers miss opposite arms (`controls/c2-stub.txt:3–9`). New C2 implementation was not certified by this review.

6. **A growth or README repair changes frozen derivations:** proxy-check:951–967 counts runnable suffixes throughout the lane, checklist lines in SKILL, README rows and note files. Current stanza A=821, C=33, C2=179/179 (SCORECARD:287–303). Runnable wave evidence can increase A without adding production capability; disclose that, never call it new runnable product work. Frozen formula still yields operability 9. C2/C2_total repair must be measured after the new lesson and mapping rows; no term definition needs changing. New coverage:omp is not in existing AXIS_ROWS (proxy-check:489–495), so default MATCH does not independently validate that new row.

7. **Round conceals inherited red states:** open/checklists-open.txt reports **30/33**, with proxy, census and README-map failures; open/gates-open.txt explicitly reports C2_TOTAL_DRIFT and AXES_DRIFT. Plan lines 105–119 routes these repairs rather than counting them as a third claim. Same-commit A/C2 totals and `pin.omp-census`/`pin.proxy-check` updates remain mandatory. Round-74 row still cites its historical close result, not current green state; append the planned pin erratum, do not rewrite history.

## Evidence hygiene and limits

- `open/prereqs.txt` has host/version/head identities only: the plan's claimed mode sweep and detailed layer counts are not actually in that file. Counts independently recovered above; mode-0600 assertion was not independently remeasured by this critic.
- `controls/mk-shape-fixture.sh:9–14` creates empty files, whereas frozen C1(b) requires hardlinked files. Shape equivalence does not erase literal fixture-method mismatch; final specificity receipt must use the frozen hardlink method.
- Required prompt §2 and numbered §9 read, including §9's ban on universal scope without enumeration and post-data predicate changes. No source content, secrets, origin files, fleet tracked files or lane production files modified. No tools installed. No git mutations. Only the note counterexample and read-only origin measurement were executed here; other failures above cite exact committed controls or plan lines, not claimed reruns.
- Self-evaluation: accuracy 4 (candidate, not final close); completeness 4 (full mutation conjunction not run); clarity 4 (semantic/literal split requires care); actionability 4 (small parser/test correction identified); concision 4 (cross-cutting attack coverage needs several entries). Overall 4.0. Highest-impact follow-up belongs to L1: evaluate the binding semantic kill rule using the retained counterexample, without silently changing admission rules.

decisive_flaw: yes
The candidate binding counter treats invisible superstring mentions as 35 substantive bindings; this is a demonstrated semantic measurement hole, not a verdict on the round's admission.
