CRITIC r5r7 members=92 distinct=92 score=10 weak-sections=4

# CriticR5R7Claim: round 36 build, C2 coverage:runtime-layer (read-only critic)

Pin `31c465f15669f744848bd9f5d56191c5085670f7` (`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`).
Drafts reviewed:
- R5: `/fast/scratch/kumitate-r36/w/ExecR5Sections.patch`, byte-equal to its lane diff (`diff` exit 0), +46 lines.
- R7: lane `/fast/scratch/kumitate-r36/w/KumitateR36.ExecR7Sections/lane`, +79 lines.

`n5:N` and `n7:N` are line numbers in the patched `native-admission-detail.md` and `local-ship.md` in those lanes. Both drafts only append, so lines up to 69 and 201 are the same as on master.

## Verdict
- **The arithmetic holds; this is not a tradeoff the judge has to reject.** R5 4 + R7 5 = 9, and those 9 are exactly the R members missing at the pin. Every new heading resolves in-family. The merged set equals the R universe itself, not just its size, so the score is 10. Dropping or duplicating any one section gives 91/92, which floors to 9.
- **Content: 4 of the 9 sections need a fix before admission.** Three claims are false at the pin and one section is pure restatement. Each fix is a text edit; no tool or contract change is needed.
- **FIDELITY reads nonok=0 for all 9 under both implementations.** That is by construction: every anchor cites its symbol's own definition line. So nonok=0 says nothing about whether the rest of the line is true; the false claims in W3 and W4 still score `ok`.

## Structure: enumeration, family, distinctness, score
- **R_members = 92.** At the pin, `find crates/ufo-core-runtime/src -maxdepth 1 -type f -name '*.rs' | wc -l` → 88, and the same for `crates/ufo-cli/src` → 4. No non-`.rs` entries; `git status --porcelain --ignored` is empty. This matches `LAYER_PATTERNS.R` (`scripts/proxy-check.mjs:321`).
- **Master at the pin**, via `probeSections` (`claims-check.mjs:463`):
  - `R raw 83 distinct 83`; counted-not-member `[]`; duplicates `[]`; `C1r 11/11`.
  - missing-members = exactly the 9 files in `.ufo/waves/round-36/frozen/R5-members.txt` and `R7-members.txt`.
  - R9's `local_ship_tests.rs` section in `test-inventories.md` is `inFamily=false` (R9's pattern is `native_tests.rs` only). So it does not pre-credit R7; R7 has to carry its own section.
- **inFamily** (`claims-check.mjs:256-273`):
  - R5 cell (`SCORECARD.md:137`): 4 exact basenames.
  - R7 cell (`SCORECARD.md:139`): the globs `local_ship*` and `bounded_fs*` (basename `globMatch`, `claims-check.mjs:187-190`) plus `fs_durability.rs`.
  - R5 lane, `--row R5 --strict` → `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=4 adv=0)`, exit 0. All 4 sections read `inFamily=true live=true symbolHit=true`.
  - R7 lane probe: all 5 sections read `inFamily=true live=true symbolHit=true`, findings `[]`.
- **Merged** (union of both lanes' probes; R5 and R7 read different notes):
  - `R_members 92 union distinct 92 notMember 0 missing [] multi-row occurrences []`
  - `floor(10*11/11*92/92) = 10`; `91/92 -> 9`.
  - The `c2-simulation.txt` line "R raw 95" is 92 in-family sections plus the 3 R9 sections that are not in-family. In-family occurrences equal distinct (92), so the 92 has no duplicate in it.
- **Integration dependency:** `SCORECARD.md:293,295,316` still declare `R_sections=83`, `coverage_runtime=9` and an axis score of 9. Unless those move to 92/10 in the same change, PROXY will report `R_SECTIONS_DRIFT` / `COVERAGE_RUNTIME_DRIFT` / `AXES_DRIFT`.

## Weak sections (counted)
Counter-examples below come from JavaScript ports of the pinned Rust predicates, run in an in-memory eval that wrote no files.

**W1. R5 `native_admission_text.rs`: two claims are false at the pin.**
- n5:84 says "so `task-` and `disk-` never trip it". `detail_contains_credential` uses `lower[start..].find(needle)` with no left boundary (`native_admission_text.rs:25-37`), and `task-` contains `sk-`.
  - Port: `task-runner-identifier-x` → true, `disk-0123456789ab` → true. Only short tails pass (`task-runner` → false).
  - The draft repeats the upstream doc comment's overclaim (`:13-14`).
- n5:85 gives the JWT shape as `eyj<b64>.<b64>.<b64>`, dropping the required second `eyj`. The code checks `lower[dot1 + 1..].starts_with("eyj")` (`:79`, comment `:65`).
  - Port: `eyjaaaa.bbbb.cccc` → false; `eyjaaaa.eyjbbbb.cccc` → true. The draft overstates what the gate catches.
- Fix:
  - n5:84: "substring scan with no left boundary; `task-`/`disk-` pass only with fewer than 12 trailing token chars".
  - n5:85: the shape is `eyj<b64url{4,}>.eyj<b64url{4,}>.<b64url{4,}>`.

**W2. R5 `native_text.rs`: rule precedence is misstated (n5:108).**
- The draft says it "checks each table row's exact match against status or id BEFORE any substring work". The loop at `native_text.rs:120-139` works row by row: the exact test (`:121`), then that same row's needles, status code and `process` arm (`:134-136`). So an earlier row's substring match beats a later row's exact match.
- Port: status=`rate_limit` with message `quota exceeded` → `usage_limit`; status=`timeout` with message `rate limit hit` → `rate_limit`. `FailureClass::as_str` is at `execution_profile.rs:416-417`.
- ExecR5Sections' report (line 26) repeats it as "exact-match-before-substring order".
- Fix: "Per row, in table order: exact status/id match, then that row's needles and code — so an earlier row's needle outranks a later row's exact status."

**W3. R7 `local_ship.rs` (n7:203-219): restatement with no new internals.**
Every bullet repeats prose already in the same note, with refreshed line ranges:
- the intro repeats n7:3-5;
- the bounds / sha256 / denylist / root / external-effect / resolve / lock / `JournalOp` bullets repeat "Refusal order" (n7:11-35);
  - the external-effect bullet is near-verbatim n7:15-16;
  - the sha256 bullet carries less than n7:12-13, and the denylist bullet less than n7:102-117;
- `run_verifier` repeats n7:39-47;
- `atomic_write` copies the doc comment at `local_ship.rs:2259`.

It misses the pin changes that make the note's own core contract false:
- A commit whose journal finalize fails returns `Ok(Committed)` with `journal_error` (`local_ship.rs:56-60`, `:1786-1802`). This contradicts n7:41-46 ("`Err(JournalFinalize)` … stays `Err`").
- A verifier that exits 0 but removes the target leads to a restore, then `Err(Io)` or `Err(Rollback)` (`:1750-1776`). This contradicts n7:39 ("Verifier failure is never `Err`").
- Terminal journal entries are pruned after `JOURNAL_TERMINAL_RETENTION` = 7 days (`:124-127`, `:373-374`, `:387-402`, `:518`). This contradicts n7:97 ("never pruned").
- Journal-root validation, the workspace match and the sweep (`:1650-1672`) run between the external-effect check and `resolve_regular_file`. The "veto order" leaves them out.
- `atomic_write` syncs three times: the file's `sync_all`, `fsync_dir(parent)` before the rename (`:2324`) and again after it (`:2332`). This makes n7:150 and D-C (n7:184-185) false.

Also, `run_verifier` (`:2355-2385`) returns a `VerifierOutcome`, not a receipt; the mapping to a receipt happens in `apply_local_ship` (`:1746-1831`).

Fix: replace the restated list with these 5 pin changes, each anchored as `SYM` (`:N`).

**W4. R7 `local_ship_tests.rs`: one false claim and one misidentification.**
- n7:274 says `refuses_path_escape_symlink_hash_and_external_effect` "pins the veto order". The test (`local_ship_tests.rs:211-281`) sends five requests with one fault each:
  - `../ok.txt` → PathEscape
  - symlink → Symlink
  - wrong digest → HashMismatch
  - `.git/HEAD` → ExternalEffect
  - relative verifier → Invalid

  No request trips two vetoes, so reordering the veto calls would leave the test green. [INFERENCE: the mutation was not run — no builds.] A search for `\.\./\.env` in the file finds nothing.
- n7:268 calls this file "The conformance suite". It is the `#[cfg(test)]` module of `local_ship.rs` (`:2387-2389`), with 81 `#[test]` (`grep -c`) and no reference to `conformance` or `vectors` (grep → 0). The vectors live in `conformance/vectors/native/local-ship.json`. The section also names 11 of the 81 tests without saying it is a sample.
- Fix: "pins each refusal's typed kind, one fault per request (not the order)"; "unit-test module; 11 of 81 tests named".

## Minor issues (not counted)
- n7:229 "liveness binding": this is an inode identity binding (`(dev,ino)`, `bounded_fs.rs:95-101`, `:108-111`).
- n7:258 "arming after create_new keeps a contender's temp safe": that is the caller's rule at `local_ship.rs:2299-2300`, not a property of `Drop` (`fs_durability.rs:49-55`). `TmpGuard::new` arms any path it is given (`:34-36`).
- n5:80 "Shape order" reads as a complete list but omits four non-empty checks: `native_admission_rules.rs:150`, `:187`, `:197`, `:201`.
- n5:92 and n5:101: `seat_id_matches` and `logical_lane_id_recomputes` both accept `+1` (port → true for both). [INFERENCE: relies on Rust `u8::from_str` accepting a leading `+`; not executed.] The sections say nothing about it, and n5:34-37 still calls `recomputes` "canonical all-digit".
- Restatements inside non-weak sections:
  - n5:97 repeats n5:13-15;
  - n5:101's first clause repeats n5:34-37;
  - n5:86's last clause repeats n5:44-45;
  - n7:225-233 repeats n7:130-136;
  - n7:254-260 repeats n7:142-147.

## Two authorities in each note (provenance)
After the merge, each note carries member sections written at the pin next to prose written at another revision, with nothing saying which wins.

- **`native-admission-detail.md`:**
  - The header at n5:3 says "rev `ee907f1cf`" for the whole note.
  - n5:40-43 gives the correlation material order as (role, lineage, resolved_model). n5:104 gives the pin's order: resolved_model, role, lineage (`native_seats.rs:222-227`). (role, lineage, resolvedModel) is the JS *signature* order (`scripts/ufo-native-names.mjs:59,67`), not the hash material order.
  - `is_format_char` (n5:27, n5:60) and `js_string_f64_total` (n5:46) do not exist at the pin (grep → 0).
  - n5:13 says "idx 49"; `native_seats.rs:3` says "50th".
  - n5:22-23 cites `native_text.rs:96-198`, but the file is 184 lines.
- **`local-ship.md`** — stale at the pin:
  - n7:39-46, n7:97, n7:134-135;
  - n7:137 lists 4 variants (the pin has 5, including TooLarge, `bounded_fs.rs:27-38`);
  - n7:142-146 (`verify_staged` does not exist at the pin, grep → 0);
  - n7:148-151;
  - D-B (n7:181-183) and D-C (n7:184-185).
- **Smallest correction:**
  - Amend n5:3 and the `local-ship.md` intro to say the `## \`crates/...\`` sections are at pin `31c465f1` and supersede any contradicting prose above them.
  - At minimum, fix or strike n5:40-43, which the new section contradicts directly.
  - ExecR5Sections flagged n5:40-42, and ExecR7Sections flagged D-C and the stale ranges; neither changed them because both items were add-only.

## Observations on other claims
- **The pairing rule in the fidelity arm differs from the frozen contract.** ExecClaimsFidelity's arm returns `noid` when a symbol is eligible on both sides (its `claims-check.mjs:593-606`); the frozen contract is right-first.
  - On the R5 draft it reads `anchors=38 ok=35 noid=3 nonok=0`; the L1 reference reads `ok=38`.
  - [INFERENCE] The three are n5:92 (`:277`, left `MissingId`), n5:100 (`:106`, left `u{tag}-{role}-{NN}`) and n5:113 (`:17`, left `process`).
  - C2's nonok=0 holds either way; adjudicating the deviation is C1's job.
- **The R7 patch is not where its report says.** It is at `/fast/scratch/kumitate-r36/w/KumitateR36.ExecR7Sections/KumitateR36.ExecR7Sections.patch`. The path in the report (`…/w/KumitateR36.ExecR7Sections.patch`) does not exist (`ls` exit 2).

## Commands run (all read-only)
- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`
- `find …/src -maxdepth 1 -type f -name '*.rs' | wc -l` → 88 and 4; the `-not -name '*.rs'` query and `git status --porcelain --ignored` both returned nothing.
- `node --input-type=module -e "import { probeSections } from './scripts/claims-check.mjs' …"` (master, `--src` = pin) → the counts above.
- `node <R5 lane>/scripts/claims-check.mjs --self <R5 lane> --src <pin> --row R5 --strict [--json]` → `MATCH sections=4 adv=0`, exit 0.
- Union probe over both lanes → `R_members 92 union distinct 92 notMember 0 missing []`.
- `node --input-type=module - <lane> <pin> < .ufo/waves/round-36/baseline/fidelity-reference.mjs.txt`:
  - R5 → `anchors=38 ok=38 elsewhere=0 absent=0 dead=0 noid=0 nonok=0`
  - R7 → `anchors=42 ok=42 … nonok=0`
- `node /fast/scratch/kumitate-r36/w/ExecClaimsFidelity/lane/scripts/claims-check.mjs --self <lane> --src <pin> --fidelity`:
  - R5 → `anchors=38 ok=35 … noid=3 nonok=0`
  - R7 → `anchors=42 ok=42 … nonok=0`
- `grep -c '#\[test\]'` → 81 (`local_ship_tests.rs`), 5 (`bounded_fs_tests.rs`), 5 (`fs_durability.rs`). Other symbol lookups used the grep tool.

Nothing was written except this report. No tools were installed or updated.
