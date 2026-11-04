# K80ExecC1 — independent C1 implementation

Axes: operability and coverage (orchestration/tooling).

## Result and evidence

**Frozen counter HELD 13/13, exit 0.** Implemented independently in a shared clone checked out at `c6a7ebd3bd01ec34b2f9349a6756886c5dd85982`, before opening the `6d03402f` implementation. Inputs were the frozen plan and counter plus the unchanged `readme-map.mjs` oracle contract. The lane's current `spotcheck-adopt.mjs` was never opened. No lane implementation was edited.

Retained under `.ufo/waves/round-80/w1/K80ExecC1/`:

- `counter.txt`: exact observed counter output, command, exit. Arms 1–13 PASS; internal selftest PASS (31/31).
- `implementation.patch`: applicable diff from the freeze version of `scripts/spotcheck-adopt.mjs` to the independently written implementation.
- `independent.mjs.txt`: implementation bytes (non-runnable report attachment).
- `reference-6d03402f.mjs.txt`: reference bytes obtained only after independent scoring, using `git show 6d03402fddf44cc9797ec590f0f888e933db4677:scripts/spotcheck-adopt.mjs`.
- `reference.diff`: actual `diff -u <retained-reference> <clone>/scripts/spotcheck-adopt.mjs` stdout; exit 1 means files differ, not execution failure.
- `clone-adoption.txt`: own freeze clone adopts `corpus/lessons/round-79-verifier-spotcheck.md`, prints ADOPTED wrote=both + README_MAP: CLEAN, exit 0; subsequent check prints CLEAN spotchecks=46 uncovered=0 + MAP: CLEAN, exit 0.

Counter command used the explicit live lane for arm 13, not the independently adopted clone. Arm 13 observed **46**, not the plan's after-state prose **47**, spotchecks. The live lane was already adopted: its oracle read CLEAN files=198 rows=198 covered=198; the freeze clone initially had neither the r79 row nor pin entry. The frozen arm accepts any integer spotcheck count. Consequently 13/13 does not prove the prose's count of 47.

## Implemented behavior

Coverage requires each matching lesson file to have both a README row and registry entry. Check emits separate SPOTCHECK_COVERAGE and MAP readings; only uncovered spotchecks determine exit 1. Adoption removes the target's findings and compares every other finding string and position before/after; unrelated red-map findings survive. It writes whichever halves are missing, journals pre-images, supports idempotence, refuses malformed-oracle/duplicate-adopt inputs, and restores pre-images on failed adoption.

## Behavioral comparison with 6d03402f

The following are source-derived differences, not additional executed tests. "Unspecified" means the frozen C1 sentence/arms do not select either behavior. Neither these differences nor the 13/13 result establish production equivalence.

| Surface | Independent implementation versus reference | Frozen-plan preference |
|---|---|---|
| Coverage and successful fresh adoption | Same discriminating outputs/exits on all counter fixtures, including unrelated red maps | Both satisfy the sentence and counter |
| Spotcheck membership | Any lesson filename containing `spotcheck` and ending `.md`, versus exactly `round-N-verifier-spotcheck.md` | Unspecified outside frozen fixtures; reference preserves narrower existing membership |
| Adoption scope | Accepts knowledge or lessons Markdown keys, with optional `corpus/` prefix, versus only full `corpus/lessons/round-N-verifier-spotcheck.md` | Unspecified by claim sentence outside spotcheck targets; reference retains established scope |
| Default lane | Process cwd, versus script-relative repository root | Unspecified; all frozen non-selftest calls supply --lane |
| Prediction CLI | No --predict; reference supports numeric --predict with PENDING/COVERED/UNCOVERED results | Not named in C1; independent alternative is not a drop-in replacement for this existing CLI |
| Parsing CLI | Allows mode and --lane in different orders; rejects extra/conflicting mode args; repeated --lane accepted | No counter distinction beyond unknown-argument USAGE; unspecified |
| Oracle source and cwd | Oracle beside the independent tool, inherited cwd, versus oracle under the supplied lane and cwd=lane | Unspecified; frozen fixtures copy the identical oracle so cannot discriminate |
| Oracle output parsing | Reconstructs first finding then notes; looser CLEAN recognition (prefix) versus whole-output CLEAN regex | Unspecified; no malformed-child-output fixture |
| Check with duplicate row | Independent check discloses duplicate-row MAP drift if coverage is otherwise green; reference refuses duplicates on check too | Frozen plan explicitly requires duplicate refusal only for adoption; no selection for check |
| Refusal precedence and tokens | Runs recovery/oracle before validating adopt target; all errors collapse to REFUSED_ORACLE. Reference validates scope/name/absence and returns REFUSED_OUT_OF_SCOPE, REFUSED_NOT_SPOTCHECK, REFUSED_ABSENT, REFUSED_PATH_ESCAPE, or REFUSED_JOURNAL_FOREIGN as appropriate | Counter only fixes REFUSED_ORACLE on named cases; other cases unspecified |
| Delta comparison | Exact key suffix matching, preserving finding order and multiplicity, versus substring exclusion followed by set-deduplication/sorting | Literal "every other finding byte-identical" favors exact matching and multiplicity preservation; finding order policy is not explicit |
| README row payload | Generic description + target pointer, versus explicit round-number/non-author description and closure-artifact pointer | Unspecified by counter; reference provides richer domain description |
| README insertion | Requires exact Coverage map heading; inserts after last table row there, versus optional heading, prefers last lessons row (otherwise last table row), and preserves existing raw text | Counter only exercises standard heading; other layouts unspecified |
| Pin bytes | Parse/re-serialize with 2-space indentation and final newline, versus surgical insertion preserving original bytes/final-newline state and refusing ambiguous covered-property spelling | C1 requires other findings unchanged, not all original bytes on successful adoption. Reference better preserves existing formatting/ambiguous-input refusal; unspecified by new sentence |
| Partial adoption output | wrote=readme or registry, versus row or pin | Frozen counter only requires wrote=both; partial vocabulary unspecified |
| Post-adopt disclosure | Summarized README_MAP CLEAN or DRIFT first=..., versus complete original oracle stdout including statistics and note lines | Both meet arm 8; exact disclosed detail unspecified |
| Target/path defenses | Checks final target with lstat but lacks reference canonical-parent escape defenses for targets, README, pin and journal root | Unspecified by frozen C1 arms; reference is safer and preserves external-substrate boundaries |
| Write mechanics | Direct writeFileSync truncation, versus temp-file atomic rename preserving mode | Crash safety not specified in new sentence; reference is stronger, independent version must not replace it on this evidence |
| Journal publication | Creates visible journal directory then writes files, versus .tmp staging followed by atomic publication | Not counter-tested; reference handles interrupted staging more safely |
| Journal manifest validation | Requires matching lane, contract, two distinct allowed destination paths, allowed pre filenames and matching pre hashes. Reference additionally validates target/key correspondence, fixed order/file correspondence and SHA syntax | Corrupt-preimage counter satisfied by both; broader shape details unspecified, reference stricter |
| Recovery completion | Always validates images and restores changed destinations to pre-state; reference retains a globally clean completed post-state, otherwise rolls back | C1 does not define completed-journal replay; reference preserves successful completion, independent can undo a completed interrupted adoption |
| Recovery disclosure | Silent replay, versus RECOVERED target complete/rolled-back or RECOVERED - stale lines | Not exercised by frozen counter; unspecified |
| Journal retirement | Keeps .retired directories and ignores them; reference renames to .done then deletes, clearing .tmp/.done remnants on replay | Unspecified except corrupt-journal prose discussed below; reference avoids retained journal accumulation |
| Corrupt pre-image on otherwise clean map | Independent always checks/refuses; reference's globally clean completion path skips checking images | Literal corrupt-preimage refusal favors independent validation, but frozen arm's map is red, so this difference is untested |
| Test seam and selftest | No crash-signal seam; 31 actual assertions including the split/delta/idempotence/corrupt-journal/recovery cases. Reference has SIGKILL journal/row/pin injection, prediction/path/newline fixtures and an additional VERDICT line | Counter requires only successful count >=26; both meet tested surface, reference has additional existing-contract coverage |

## Specification gaps and risks

1. **Arm 11 prose says journal retired, but neither the frozen assertion nor either implementation retires a corrupt pre-image journal on its refusal path.** Both preserve current destination bytes and refuse. The frozen counter only checks those bytes/output/exit. The contradictory retirement wording therefore is not established by 13/13.
2. **Selftest count does not measure independent case breadth.** My 31 assertions include multiple output checks from the same fixture. No false PASS was printed: each assertion executes and evaluates its condition. The reference's test suite covers behaviors absent from the frozen predicate.
3. The patch demonstrates independent implementability of the scored C1 move; it is **not recommended as a wholesale replacement** for the reference because existing prediction, path protections, atomic writes and richer recovery behavior differ. No build, lint, formatter, unrelated checks, or external remediation was run.
4. No exposed LSP definition/reference/refactor tool was available in this seat's mounted inventory; symbol work used direct source reads. No tools installed or updated (existing Node v24.21.0).
5. Initial exploration used shell listings/search/paging and an unnecessarily verbose transcript before settling on the specialized-tool workflow; those reads did not alter lane code. No git commit, add, reset, stash, rebase or push occurred. The requested clone checkout was the only git working-tree mutation, inside scratch.

## Scope and cleanup

Implementation changes were confined to own clone `scripts/spotcheck-adopt.mjs`; the optional real-corpus adoption changed only that clone's README, pin and journal. Retained report attachments are the deliverable; scratch clone and fixtures are removed before handoff. No lane implementation changes were made and no other seat's files were edited.

Self-assessment: accuracy 4 (source-derived comparison edges are not separately exercised); completeness 4 (counter behavior complete, broader existing CLI intentionally not a replacement); clarity 4 (comparison is lengthy because requested behavioral differences are numerous); actionability 4 (patch and exact receipts retained, reference should not be replaced wholesale); conciseness 3 (early transcript was unnecessarily verbose). Overall 3.8/5. Highest-impact improvements are to preserve reference crash/path protections before considering a production replacement, and distinguish assertion count from scenario breadth. The user should judge this as an independent counter experiment, not a production-equivalence proof.
