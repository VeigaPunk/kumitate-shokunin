R5R7-PRIOR members=9 prior-clauses=50 contradictions=29

# ConnectorR5R7Sources — prior corpus claims about the nine R5/R7 members, against pin 31c465f1

Read-only. Pin: `/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7` (chmod a-w, untouched).
Note files were read from the lane working tree, which **already carries in-flight member sections** appended by a sibling
(`git diff --stat`: `corpus/knowledge/local-ship.md +79`, `native-admission-detail.md +46`). Older topic-form lines 1–201 / 1–69
are unchanged, so every `path:line` below still points at the pre-existing prose. `prior-clauses=50` = distinct prior assertion
clauses inventoried (7+5+4+6 for R5; 15+3+3+5+2 for R7). `contradictions=29` = of those 50, the clauses whose assertion (including
its cited anchor) does not hold at the pin; `[drift]` marks pure anchor movement, `[false]` a claim contradicted by source.

## Inventory (one row per member)

| Member | Prior clauses (note:line — symbol it rests on) | Duplicate claims the new `## ` section must not restate |
|---|---|---|
| `native_seats.rs` (R5) | native-admission-detail.md:13 (`seat_key_from_parts`; "230 L, idx 49"); :14-16 (`seat_label`/`seat_id` swap); :17-21 (16-symbol roster + sole callers `proposal_seat_index`/`proposal_agents`); :34-37 (`parse_logical_lane_id` vs `logical_lane_id_recomputes` pair); :40-43 (`correlation_group_for` order trap); corpus/README.md:30 (scope row); SKILL.md:326 (map pointer) | New §`native_seats.rs` (:95-104) restates label/id twins (old :14-16), parse/recompute pair (old :34-37) and the correlation material (old :40-43). Only :98 (`singleton_key`/`role_by_name`), :102-103 (`proposal_row`/`missing_proposal_seat` cost classes) are net-new. |
| `native_admission_text.rs` (R5) | native-admission-detail.md:26-27 (symbol roster incl. `is_format_char`); :44-45 (`js_string_simple` None); :46-49 (`js_string_f64` exponent comment); :50-51 (`clean_field_token` BYTE length); :60-69 (`is_format_char` Cf vs JS Mn/Zs drift) | New § (:82-93) restates the roster and the whole coercion chain (old :26-27, :44-49). BYTE-length (`value.len()`) survives **only** in old :50-51 — old clause is still true at pin (`native_admission_text.rs:192-198`), so either keep it or move it, don't fork it. |
| `native_admission_rules.rs` (R5) | native-admission-detail.md:28-30 (`validate_profile` :45-131 "invoked FIRST in `validate_header`", native_header.rs:243); cost-and-profile.md:64-69 (`validate_profile`; "does NOT define the trio or `extends`"); native-judge-pipeline.md:339 (`frozen_profile_field` at :69 for `effective_launch`); native-transcript-ledger-seats.md:106-110 (`attempt_ledger` gates :62-72/:107-111, shape :132-236) | New § (:71-80) restates three-arm dispatch, per-field v1 presence policing, v2 literals and the shape pre-pass — all four prior clauses above. Net-new only :76 (empty-slice default) and :80 (shape order). |
| `native_text.rs` (R5) | native-admission-detail.md:22-25 (`classify_failure_fields` home + JS twin); native-judge-pipeline.md:151-157 (`FAILURE_RULES` :96, `contains_status_code` :81, `contains_word` :87); failure-telemetry.md:87-95 ("mirrors Rust `native_text.rs classify_failure`"); SKILL.md:435-440 (classifier + `FAILURE_RULES` :96); lessons/round-4-aggregator-audit.md:18 (:161); lessons/round-6-aggregator-audit.md:37+60 ("real symbol is `classify_failure_fields`") | New § (:106-115) restates the whole table order and boundary predicates (old judge-pipeline :151-157, SKILL :435-440). Net-new: `cached_json_lower`/`json_lower_operand_empty` (:109), `significant_digits`/`is_exact_midpoint` (:115), and the two-symbol resolution (:114). |
| `local_ship.rs` (R7) | local-ship.md:3-7 (`apply_local_ship` purpose); :9-35 (8-step refusal order); :37-47 (verdict asymmetry `RolledBack`); :49-52 (CLI exit map); :54-73 (`claim_apply_lock`, `MAX_LOCK_CLAIM_ROUNDS`); :75-95 (`recover_apply_journal`/`recover_pending`/`order_pending_for_path`); :97-100 (pruning + bounds); :102-117 (verifier grammar); :119-126 (`external_effect_component_reason`); :154-165 (`run_verifier`); :167-173 (bounds table); :175-201 (defects D-A/B/C, digest asymmetry, unexported types); corpus/README.md:34; lessons/round-6-aggregator-audit.md:19; runtime-remainder-census.md:426 | New § (:203-219) restates purpose, veto order, lock, journal order, `run_verifier` and `atomic_write` — i.e. old :3-7, :11-35, :54-73, :31-33, :148-165. Its line corrections are right (see conflicts) but the *claims* are duplicates; net-new is almost nothing except the corrected ranges. |
| `bounded_fs.rs` (R7) | local-ship.md:130-136 (`read_bounded_ident` order, no `O_NOFOLLOW`, "post-read length is the ONLY size authority — `st_size` never trusted"); :137-141 (`BoundReadError` variant list + `identity=None` :2317 / D-A); corpus/README.md:156 (D-A at `local_ship.rs:2317`) | New § (:221-233) restates the read order and identity arm **and contradicts old :134-135** (see X14). Its variant list (:230) is the corrected one. |
| `fs_durability.rs` (R7) | local-ship.md:142-147 (primitives: `now_millis`/`now_nanos`/`create_0600_tmp`/`hard_link_tmp`/`TmpGuard`/`verify_staged`/`fsync_dir`); :148-152 (`atomic_write` sequence + JS twins); corpus/README.md:34 ("277 L") | New § (:249-264) restates every primitive and the `atomic_write` shape; it silently drops `verify_staged` (correct) while old :144-146 still asserts it (see X15/X16). |
| `local_ship_tests.rs` (R7) | test-inventories.md:115-125 (85 tests / 8 groups; :3068 startswith; :1686 fixpoint; `ship` helper `journal: None` :87); :22-27 (unix arms, `dac_override_active` :31, `mode_bits_enforced` :50, `MutLocalShipGroup` :927); :16-20 (`SAMPLE_TO_LOCK_HOOK` :1130-1144, :1282-1284); layer-axes.md:172-179 (cross-cutting section counted out-of-family for R9); member-claims-gate.md:56-61 (`SECTION_FILE_NOT_MEMBER` advisory) | New § (:266-280) names 11 tests with ranges — a different axis (test identity) from test-inventories' group census, so low overlap. No prior clause names `apply_lock_three_way_lowest_named_wins` or the receipt-durability test, so those are net-new. |
| `bounded_fs_tests.rs` (R7) | corpus/README.md:134 (listed in the *uncited* member set); SCORECARD.md:1595 (R7 "add 5" list) | No prior internals clause — the new § (:235-247) is genuinely new content; README:134's uncited-set census becomes stale the moment this section lands (that is a census update, not a contradiction). |

## Contradictions at the pin (29)

| # | Corpus clause | Pin evidence | Kind |
|---|---|---|---|
| X1 | native-admission-detail.md:13 `native_seats.rs` "230 L" | `wc -l` → 229 | false |
| X2 | native-admission-detail.md:13 "NATIVE_CONTRACT_FILES idx 49"; SKILL.md:330-331 "`native_contract.rs:69` … ordered 66-entry registry" | `pub const NATIVE_CONTRACT_FILES: [&str; 62]` at `native_contract.rs:46`, 62 entries; `native_seats.rs` = idx 50; `native_contract.rs` self-registered 44th; line 69 is a string entry | false |
| X3 | native-admission-detail.md:23 `native_text.rs:96-198`; lessons/round-4-aggregator-audit.md:18 ":161" | file 184 L (range dead); `classify_failure_fields` :105, `FAILURE_RULES` :88, `contains_status_code` :73, `contains_word` :79 | false/dead |
| X4 | native-admission-detail.md:40-43 "hash material order is (role, lineage, resolved_model)" | `native_seats.rs:217-229` material = `resolved_model, role.name(), assignment_lineage`; JS `correlationGroup` (`ufo-native-names.mjs:59-68`) material is the same order; only the JS *signature* is (role, lineage, resolvedModel) | false |
| X5 | native-admission-detail.md:60-69 `is_format_char` "exactly `\p{Cf}`" + JS "widens to `\p{Cf} ∪ \p{Mn} ∪ 6 Zs`"; lessons/round-6.md:42 | no `is_format_char`/`format_char` symbol anywhere in `crates/`; `native_admission_text.rs:52-61` is `contains_sensitive_shape` credential/JWT text; `ufo-credential-screen.mjs:61` `FORMAT_CHARS_RE = /\p{Cf}/gu` only — both sides Cf-only, drift has no referent | false |
| X6 | native-judge-pipeline.md:153 and SKILL.md:439-440 `FAILURE_RULES` (`native_text.rs:96`); judge-pipeline :153 `contains_status_code` :81, `contains_word` :87 | :88 / :73 / :79 | drift |
| X7 | failure-telemetry.md:89 "Rust `native_text.rs classify_failure`" vs native-judge-pipeline.md:153 "NOT `classify_failure`"; lessons/round-6-aggregator-audit.md:37 "real symbol is `classify_failure_fields`" | both exist: `classify_failure_fields` :105 (production, 3 operands) and `classify_failure` :145 (message-only test-facing wrapper). Both old statements are now half-right | false |
| X8 | native-admission-detail.md:19-20 sole callers `native.rs:530`, `native_dispatch_topology.rs:418` | `native.rs:466`, `native_dispatch_topology.rs:387` (sole-caller property holds) | drift |
| X9 | native-admission-detail.md:37 pair "`native_launch.rs:96` then `:102`" | `parse_logical_lane_id` call :90, `logical_lane_id_recomputes` :96 | drift |
| X10 | native-admission-detail.md:29 `validate_header` (`native_header.rs:243`) | `validate_profile(handoff)?` at `native_header.rs:215` | drift |
| X11 | local-ship.md:128 "`bounded_fs` (155 lines) + `fs_durability` (277 lines)"; README.md:34 "2489 L"/"155 L"/"277 L"; lessons/round-6-aggregator-audit.md:19 | 2389 / 149 / 198 | false |
| X12 | local-ship.md:154 `run_verifier` (:2455-2485) | file ends 2389 (range dead); fn at :2355-2385 | false/dead |
| X13 | local-ship.md:148 `atomic_write` (:2356-2434) | range dead; fn at :2269-2325 | false/dead |
| X14 | local-ship.md:134-135 "post-read length is the ONLY size authority — `st_size` never trusted"; :137-138 variant list `Io|NotRegular|GrewPast|IdentityMismatch` | `check_shape` rejects on `meta.len()` at classify (`bounded_fs.rs:81-92`) and `TooLarge{max,got}` is a 5th variant (`:33`); both readers call it (:118, :121) | false |
| X15 | local-ship.md:144-146 `TmpGuard` "stages `(dev,ino)` … `verify_staged` mismatch CLEARS the path" | no `verify_staged` anywhere in `crates/`; `TmpGuard` = `new`/`path`/`disarm`/`drop` (`fs_durability.rs:30-62`) | false |
| X16 | local-ship.md:42-46 "`Err(JournalFinalize)` … a pending COMMIT … finalize fault stays `Err`"; :198-201 `LocalShipError::JournalFinalize` / `receipt.journal_finalization_error` | no `JournalFinalize` variant crate-wide; commit-path finalize error is recorded as `receipt.journal_error` and returns `Ok(Committed)` (`local_ship.rs:1786-1801`); field is `journal_error` (:71) | false (core contract) |
| X17 | local-ship.md:148-151 "ONE `fsync_dir` after the rename (doc :2345 implies two — stale)"; D-C :184-185 | code fsyncs parent **before** rename (:2319) and after (:2322); doc at :2261-2263 says "fsync, rename, fsync" — doc and code agree, D-C is resolved | false |
| X18 | local-ship.md:97-100 "Journal entries are never pruned (:143-146)" | `JOURNAL_TERMINAL_RETENTION` (:373) + terminal-retention pass (:396, :489-507); pending entries never pruned (:370) | false |
| X19 | local-ship.md:49-52 CLI exit map `main.rs:1841-1860`, kinds incl. `journal_finalize` | `main.rs` is 1512 L (range dead); map at :1487-1503; `rollback`→3 holds; no `journal_finalize` arm | false/dead |
| X20 | local-ship.md:31-33 `JournalOp::begin` (:1729), preimage-before-pending (:270, :282) | begin call :1736, `begin` body :223-261; order holds (preimage :239 before entry :255), but :270/:282 are doc comments | drift |
| X21 | local-ship.md:75, :86 `order_pending_for_path` :1079, `recover_apply_journal` :1167-1336, `recover_pending` :1429-1552 | :1100, :1185-, :1447- | drift |
| X22 | local-ship.md:54, :71-73 lock `:760-987`, `MAX_LOCK_CLAIM_ROUNDS` :703, `LOCK_WITHDRAW_WAIT` :708 | :777-, :720, :725 | drift |
| X23 | local-ship.md:138-139 / :177 / README.md:156 `identity=None` at `local_ship.rs:2317` | `local_ship::read_bounded` :2225-2226 → `bounded_fs::read_bounded(path, max)` → `read_bounded_ident(..., None)` (`bounded_fs.rs:142-144`). Claim holds, anchor moved −92 | drift |
| X24 | test-inventories.md:115-125 "85 tests / 8 groups", `:3068`, fixpoint `:1686`, `ship` helper `journal: None` (:87) | `grep -c '#\[test\]'` → 81; file 2969 L (3068 dead); fixpoint comment :1388-1389; `journal: None` :42 | false/dead |
| X25 | test-inventories.md:18 `SAMPLE_TO_LOCK_HOOK` (`local_ship.rs:1130-1144`, `:1282-1284`) | symbol absent crate-wide; no mutation-hook seam in `local_ship.rs` at pin | false |
| X26 | test-inventories.md:24-27 `dac_override_active` :31, `mode_bits_enforced` :50, `MutLocalShipGroup` :927 | `dac`/`CAP_DAC`/`mode_bits` absent; `MutLocalShipGroup` only a comment at :795 | false |
| X27 | local-ship.md:98 `MAX_JOURNAL_ENTRY_BYTES` :153, :100 `SWEEP_MIN_AGE` :405, :169-170 `HARD_MAX_*` :27/:28/:29 | :135, :367, :26/:27/:28 | drift |
| X28 | local-ship.md:102-117 verifier grammar inner anchors :2080-2181 / :2183-2191 / :2218-2222 / :2250-2258 / :2261-2287 | `DENIED` :2066-2080 (95 names), `PREFIXES` :2082-2096 (13), absolute check :2127, canonicalize/re-resolve :2146, `#!` :2191 (counts 95/13 confirmed; range header :2061-2291 still straddles) | drift |
| X29 | local-ship.md:27, :181 D-B `st_size>8MiB` at :1710-1715 | bound at :1717-1721; claim itself holds (metadata-size arm still present) | drift |

**Intra-note conflicts created by the in-flight sections** (not counted above; each is an old clause already listed as false, now
sitting next to a correct new section in the same file): local-ship.md:134-135 vs :227/:232-233; :144-146 vs :257; :150 vs :219;
:97 vs pin; :40-43 (native-admission-detail) vs :104; :23 vs :108; :60-69 vs :82-93. A reader cannot tell which is authoritative
until the old clauses are retracted or rewritten — and the C1 fidelity sweep only walks the new sections, so it will **not** catch
these.

## Checked against the pin and still TRUE (so do not "fix" them)

- `seat_label` `{:02}` vs `seat_id` unpadded (`native_seats.rs:25-27`, :57-59); `seat_label_matches` byte twin (:33).
- `parse_logical_lane_id` not a gate / must pair with `logical_lane_id_recomputes` (`native_seats.rs:117`, :125).
- `validate_profile` is the first native_header rule (:215) and spans :45-134; v1/v2/resilient arm split and `frozen_profile_field` text (:19).
- `is_critical`/`is_proposal` claim, `clean_field_token` BYTE length (`value.len()` :192-198), `js_string_simple` None fallback,
  `js_string_f64` decimal band (doc :143 says non-exponent, matching the correction).
- Verifier denylist exactly 95 basenames + 13 prefixes; `#!`-only sniff; canonicalize-miss deferred to spawn.
- `JournalOp` writes preimage before pending; ownership proven by digest; `ApplyJournalState` still unexported (no `lib.rs` hit).
- D-A (`identity=None`) and D-B (`st_size>8MiB`) still stand; journal uppercase-digest asymmetry still stands (digest fields accept
  `is_ascii_hexdigit` at :1397 while `op_id` requires lowercase at :1394) — only its anchors moved.
- R_members premise: `ls crates/ufo-core-runtime/src/*.rs | wc -l` → **88**, `crates/ufo-cli/src/*.rs` → **4** (88+4=92, matches C2).

## Evidence (commands and their measured output)

```
wc -l crates/ufo-core-runtime/src/{native_admission_rules,native_admission_text,native_seats,native_text,bounded_fs,bounded_fs_tests,fs_durability,local_ship,local_ship_tests}.rs
  → 243 330 229 184 149 107 198 2389 2969        crates/ufo-cli/src/main.rs → 1512
grep -n 'classify_failure_fields|is_format_char|verify_staged|SAMPLE_TO_LOCK_HOOK|dac_override_active|mode_bits_enforced' -r crates
  → classify_failure_fields native_text.rs:105 (others: none)
grep -c '#\[test\]' local_ship_tests.rs → 81   bounded_fs_tests.rs → 5
python: NATIVE_CONTRACT_FILES → 62 entries, [&str; 62] at native_contract.rs:46; native_seats idx 50, native_text idx 31,
        native_admission_text idx 51, native_admission_rules idx 53, native_contract idx 44
python: DENIED → 95, PREFIXES → 13
sed -n '2261,2325p' local_ship.rs → create_new 0600 · sync_all · fsync_dir(parent) :2319 · rename · disarm · fsync_dir(parent) :2322
sed -n '1786,1801p' local_ship.rs → commit finalize error → receipt.journal_error, Ok(Committed)
git diff --stat → local-ship.md +79, native-admission-detail.md +46 (sibling sections already appended)
```

[INFERENCE] The C2 sections as currently written appear fidelity-clean line by line (every anchor I sampled pairs with a symbol
that occurs in its range), but I did not run `claims-check --fidelity` (not my assignment) and the sweep's exact 14-char pairing
still needs its own run. [INFERENCE] Upstream line shrink (~100 L on `local_ship.rs`) looks like a single refactor generation
between the notes' rev (`ee907f1cf` / r7) and the pin; I did not diff revisions to confirm which commit.

## Move (one, bounded)

Retract the 29 stale clauses in place — rewrite each old topic-form sentence to its pin range and delete the five claims that are
now false (X4/X5/X14/X15/X16/X17/X18/X19/X25/X26), keeping the old topic headings non-path-like so the fidelity sweep does not
attribute their bare `:N` anchors to the new member sections. That closes the intra-note fork without adding a single new claim.
