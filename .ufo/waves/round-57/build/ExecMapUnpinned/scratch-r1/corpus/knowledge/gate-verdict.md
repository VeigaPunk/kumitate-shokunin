# Gate verdicts — `ParetoGate`'s decision ladder and its refusal vocabulary

`gate.rs` is the strict-Pareto admission decision for two validated score
vectors; `gate_tests.rs` is its in-module pin file. Both live in
`crates/ufo-core-runtime/src/` of `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`
(origin HEAD `daa371583`). This note is internals-level: type surface with line
anchors, the refusal vocabulary as quoted literals, the precedence rules that
pick one refusal over another, the consumers that bind the ladder, and a
case-level census of the pin file.

Sizes, measured (`wc -l crates/ufo-core-runtime/src/gate.rs
crates/ufo-core-runtime/src/gate_tests.rs`): `254` and `426`.

## `crates/ufo-core-runtime/src/gate.rs`

### Type surface (line-anchored)

| Item | Trap | Line | Shape |
|---|---|---|---|
| `GateDecision` | `#[serde(tag = "verdict", rename_all = "snake_case")]` (:14) | :15 | enum, derives `Debug, Clone, PartialEq, Serialize, Deserialize` (:13) |
| `Admit { improved }` | — | :16 | `improved: Vec<String>` (:17) |
| `RejectRegression { regressed }` | — | :19 | `regressed: Vec<String>` (:20) |
| `RejectNoImprovement` | unit variant | :22 | — |
| `RejectMalformed { reason }` | env note :23: “a missing or undeclared axis is not “unchanged”” | :24 | `reason: String` (:25) |
| `RejectInsufficientEvidence { unmeasured }` | A-05, :27-32: never produced by `ParetoGate::decide` | :33 | `unmeasured: Vec<String>` (:35) |
| `ParetoGate` | fields `axes: AxisSet` + `axis_validation: Result<(), String>` | :44 | derives only `Debug, Clone` (:43) — not `PartialEq` |
| `ParetoGate::new` | `#[must_use]`; validates once at construction | :54 | `pub fn new(axes: AxisSet) -> Self` |
| `ParetoGate::axes` | accessor | :71 | `pub fn axes(&self) -> &AxisSet` |
| `ParetoGate::decide` | `#[must_use]`, the bare entry point | :83 | `-> GateDecision` |
| `ParetoGate::decide_with_deltas` | `pub(crate)`; the delta-carrying entry point | :105 | `-> (GateDecision, BTreeMap<String, f64>)` |
| `ParetoGate::scan` | private, the one dominance walk behind both | :146 | `-> Result<(Vec<String>, Vec<String>), String>` |
| `verdict` | free fn, the ladder | :190 | `fn verdict(improved, regressed) -> GateDecision` |
| `validate_vector` | `pub(crate)`; the malformed-vector authority | :212 | `-> Result<(), String>` |

The cached-validation design is explicit at :50-53 (“The declaration is
validated once at construction. Keeping the result preserves malformed-axis
refusal for the public constructor without repeating its allocation and
identity-hash work on every scan.”): `new` stores
`axes.validate().map_err(...)` (:55) into `axis_validation` (:66), and `scan`
replays it with `self.axis_validation.clone()?` (:152) before touching any
score. A malformed declaration therefore refuses on every scan without
re-validating.

### The ladder (`verdict`, :190)

Exactly one verdict comes out of a completed scan, in this priority:

| # | Condition | Verdict | Line |
|---|---|---|---|
| 1 | `!regressed.is_empty()` | `RejectRegression { regressed }` | :191-192 |
| 2 | `improved.is_empty()` | `RejectNoImprovement` | :193-194 |
| 3 | otherwise | `Admit { improved }` | :195-196 |

Priority 1 dominates: a candidate that improves one axis and regresses another
is a regression, and the regressed set is returned whole. `gate_tests.rs:141`
(`regression_is_not_rescued_by_a_large_gain`) pins this directly — `testing`
0→100.0 with `implementation` 1.0→0.0 must still `RejectRegression`. Priority 2
is the flat case (`rejects_no_improvement`, :39, asserts
`assert_eq!(gate.decide(&flat, &flat), GateDecision::RejectNoImprovement)`).
The enum has five arms but `verdict` can emit only three; `RejectMalformed`
arrives from the `Err` arm of the callers (:89, :131) and
`RejectInsufficientEvidence` only from the caller (see *Consumers*).

Precedence above the ladder: `scan` (:146) is fail-fast, in this order —
cached axis-declaration reason (:152), `validate_vector` on the baseline
(:153), `validate_vector` on the candidate (:154), then the axis walk (:157).
So a malformed baseline outranks a malformed candidate (`native_scores`
binds the "baseline" label; `malformed_baseline_is_rejected_symmetrically`,
:154), and any malformed input outranks every axis comparison — the walk is
never reached.

Inside the walk (:157-186): axis order is `self.axes.axes()`, i.e.
declaration order; the values are read with `.expect("validated")` (:158-159),
legal only because `validate_vector` already proved presence; a non-finite
`delta` aborts the whole scan (:166-174) rather than being classified; `d > 0.0`
appends to `improved` and (when a map is supplied) inserts the delta (:175-179);
`d < 0.0` appends to `regressed` (:180-181); `d == 0.0` is neither (unchanged
axes appear in no list). The ordering assertion is pinned by
`regressed_axes_are_enumerated_in_declared_order` (:180, expects
`vec!["implementation", "portability"]` from a `default_ufo()` declaration with
`testing` also moved).

### Refusal vocabulary (quoted literals)

Every refusal is a `String` built at these lines; the producers' echoes in
them ride the shared echo ceiling (§ below).

| Literal template | Line | Emitted when |
|---|---|---|
| `"axis declaration: {}"` | :60 | constructor-time `AxisSet::validate` failure, wrapped once |
| `"axis '{}' delta is not finite"` | :171 | finite scores whose direction-aware delta overflows |
| `"{label} axis '{}' is not finite"` | :230 | a score value is `NaN`/`±inf` |
| `"{label} has undeclared axis '{}' outside the Umwelt"` | :236 | a score key is not in the declared set |
| `"{label} omitted declared axis '{}'"` | :244 | a declared axis has no score |
| `"…[truncated]"` (marker) | `round_digest.rs:57` | any echoed producer string longer than the ceiling |
| `"axes must be declared (R2)"` | `axes.rs:495` | empty declaration, delegated verbatim |
| `"duplicate axis id '{}'"` | `axes.rs:540` | duplicate declaration, wrapped by :60 |

The three `{label}` forms (`grep -c '"{label}' gate.rs` → 3) are the only
parameterization: `label` is a trusted
caller literal (`baseline`, `candidate`, `proposal`, `class member`, documented
at gate.rs:202-203), never producer text.

Two precedence rules matter inside `validate_vector` (:212):

1. **Empty declaration delegates.** `if axes.axes().is_empty()` (:217) calls
   `axes.validate()?` (:221) so the empty fault uses `AxisSet`'s wording
   (`"axes must be declared (R2)"`), not a second gate-local phrasing — the
   r20 comment at :218-220 says exactly that, and
   `direct_validate_vector_empty_declaration_uses_the_shared_vocabulary`
   (:211) asserts the delegated literal with `assert_eq!(err, "axes must be
   declared (R2)")` (:214). Bypassing the delegation would change that literal.
2. **Per-entry scan before missing-axis scan.** The per-entry loop (:227)
   checks `!value.is_finite()` (:228) and then `axes.get(key).is_none()`
   (:233), before the missing-declared-axis loop (:241). So a proposal that is
   both undeclared and incomplete reports the undeclared key. gate.rs:223-226
   names the pin: “conformance vector jw-34-malformed-precedence and is the
   single authority judge_wave delegates to”; `judge-wave.json:1368` is that
   case, and `judge-wave.json:1390` its `reason_contains` needle
   `"undeclared axis 'bogus'"`. The direct-caller path is pinned too
   (`loop_driver_judge.rs:261-264`).

`decide` vs `decide_with_deltas`: `decide` (:83) calls `scan(..., None)` and
maps `Err` to `RejectMalformed { reason }` (:89) — it never materializes a
delta map (:85-86). `decide_with_deltas` (:105) allocates the map (:112),
fills it during the walk (:176-178), and then clears it on both
non-admit paths: a rejected-but-parsed decision (:119-120) and the mid-walk
`Err` (:130-131). The pins are
`rejected_tradeoff_keeps_decision_without_delta_materialization` (:249, asserts
`deltas.is_empty()` at :273 after an admit-side positive check) and
`mid_walk_non_finite_delta_hands_back_no_deltas` (:397, asserts emptiness at
:423). The admit-side map is direction-aware and order-stable:
`BTreeMap::from([("gain", 2.0), ("cost", 1.0)])` (:290).

### Echo ceiling binding

Every producer-supplied echo in a refusal is wrapped in
`crate::round_digest::echo_bounded` — at gate.rs:61, :172, :231, :237, :245.
That function is `pub fn echo_bounded(value: &str) -> String`
(`round_digest.rs:56`) with `const MARKER: &str = "…[truncated]"`
(:57) and `pub(crate) const MAX_ECHO_CHARS: usize = 512` (:51), so the bound
is **chars, not bytes**: a multi-byte key can be up to ~2 KiB in bytes while
staying 512 chars. Three tests pin the behaviour end-to-end and the 1 KiB
refusal-size outcome: `oversized_undeclared_key_echo_is_bounded` (:312,
`reason.contains("…[truncated]")` :321 and `reason.len() < 1_000` :325),
`oversized_declared_axis_echoes_are_bounded` (:336, both the omitted-axis and
the non-finite-delta echoes) and `duplicate_declaration_reason_is_bounded`
(:372, the wrapped constructor reason). The trust split is stated at :202-206:
`label` is trusted, keys and declared axis ids are producer-supplied. The
truncation itself is char-bounded (`let head: String = value.chars()
.take(MAX_ECHO_CHARS).collect()`, `round_digest.rs:58`) and the unchanged case
returns the input iff its byte length is untouched (`:59`), so a ≤512-char
producer string stays byte-identical regardless of its encoding.

### Consumers (file + symbol + line)

| Consumer | Site | Binding |
|---|---|---|
| `native_handoff` judge | `native.rs:540` `ParetoGate::new(handoff.axes.clone())` | wire axes become the gate's declaration |
| `validate_score_vector` (def `native_scores.rs:334`) | `native_scores.rs:629` `gate.decide(baseline, candidate)` | a `RejectMalformed` is rewritten to `invalid(...)`; other verdicts pass through (:629-634) |
| `LoopDriver` gate cache | `loop_driver.rs:948-949` `get_or_init(|| ParetoGate::new(self.config.axes.clone()))` | one gate per driver, lazily |
| judge-wave admit path | `loop_driver_judge.rs:356` `gate.decide_with_deltas(frontier, &effective)` | deltas → digest |
| A-05 upgrade | `loop_driver_judge.rs:360-362` | an `Admit` with non-empty `unmeasured_material` is overwritten to `RejectInsufficientEvidence` |
| rejection codes | `loop_driver_judge.rs:559-565` `rejection_reason_code` | maps the 4 rejection variants; `Admit` hits `debug_assert!(false, …)` and returns `None` |
| distill class mediation | `distill.rs:539` `validate_vector(axes, …, "class member")` | gate validity decides which members synthesize |
| dry ingress | `loop_driver_dry.rs:126` `validate_vector(…, "baseline")` | refuse before dispatch (:120-125 rationale) |
| resume ingress | `loop_driver_resume.rs:1382` `validate_vector(…, "baseline")` | frontier re-check on resume |
| mutant smoke | `mutation.rs:69` `ParetoGate::new(AxisSet::default_ufo())` | `run_smoke` drives 5 mutants (:70-76) |
| header contract | `native_header.rs:111` | comment: the gate assumes `AxisSet::validate` has run at construction |
| external pins | `tests/loop_driver.rs:3002`, `tests/conformance.rs:520`, `tests/native_handoff.rs:36` | public `ParetoGate`/`GateDecision` used outside the crate |

`RejectInsufficientEvidence` is *not* gate-produced: `axis_checks.rs:16` states
it blocks admission as that variant, `axis_checks.rs:462` is the
`pub unmeasured_material: Vec<String>` field, and
`loop_driver_judge.rs:37` records that computed deltas outrank advisory scores.
Its consumer pin is `loop_driver_tests.rs:5559`
(`unmeasured_material_axis_blocks_admission`), not the gate's own file.

## `crates/ufo-core-runtime/src/gate_tests.rs`

### Case-level census of the pin file

Count command and output:

```
$ grep -c '^#\[test\]' crates/ufo-core-runtime/src/gate_tests.rs
19
$ grep -c 'cfg(unix)' crates/ufo-core-runtime/src/gate_tests.rs
0
```

19 tests in 426 lines, one flat `mod tests` attached by `#[path =
"gate_tests.rs"]` (`gate.rs:253`), plus one helper `filled` (:3) that seeds
every declared axis with one value. Observed arm split: 3 admit-side pins
(`admits_strict_improvement` :12,
`admits_representable_improvements_without_a_hidden_threshold` :94, and the
improving half of `:249`) against 16 refusal/error pins; the delta-map
assertions live in `:249` and `:397`.

Pinning style is **literal-needle**: refusal arms assert message substrings
(`assert!(reason.contains("not finite"), "{reason}")` :58,
`assert!(reason.contains("portability"))` :122,
`assert!(reason.contains("vibes"))` :173, `reason.contains("duplicate axis id
'quality'")` :235), and only the delegated arm uses exact equality (:214).
Enumeration order is asserted with `assert_eq!` on whole vectors (:105-110
`["quality", "latency"]`; :264-267 `["cost"]` via `regressed.as_slice()`). The
typed-shape arms use `matches!(..., GateDecision::RejectMalformed { .. })`
without touching prose (:134-137). No unix arms exist — the surface is pure
arithmetic with no filesystem, so there is nothing OS-shaped to pin
(`grep -c 'cfg(unix)'` → 0).

Named gaps (observed, not inferred):

- `axes()` (:71) is never called in `gate_tests.rs`; its only in-crate caller
  is `mutation.rs:191` (`let axes = gate.axes();`), so the accessor has no pin
  in the gate's own file.
- `RejectInsufficientEvidence` has zero mentions in `gate_tests.rs`
  (`grep -c` → 0); the variant is only reachable through
  `loop_driver_judge.rs:361`, pinned elsewhere (`loop_driver_tests.rs:5559`).
- `decide`'s claim of never materializing deltas (:84-86) has no negative
  assertion — it can only be seen indirectly through the `decide_with_deltas`
  emptiness pins.
- The 10 000-char oversized probes (:316, :339, :375) all truncate far above
  the 512-char ceiling, so the exact boundary char is unpinned; the only size
  assertion is the loose `reason.len() < 1_000` (:325).
- No test mixes a zero delta with a non-zero one, so `d == 0.0` falling through
  at :175-181 is observed only in the all-flat case (:39).
- The conformance sweep supplies the case-level net across rounds:
  `judge-wave.json` holds 49 cases, 17 of them decision-bearing
  (`admit` 8, `reject_regression` 1, `reject_no_improvement` 3,
  `reject_malformed` 5), and TS-only arms are skipped with an explicit
  `x-runtime` tag (`tests/conformance.rs:511-517`, no silent skip per
  :521-526).

## Member-completeness probe

The registry counts R10 as covered; the claim is checkable per member — exactly
one `## ` heading for the member and line-anchored citations inside that
member's own section:

```
$ for m in gate.rs gate_tests.rs; do
    s=$(awk -v m="$m" 'index($0, "## `crates/ufo-core-runtime/src/" m "`")==1 {f=1; next} /^## /{f=0} f' \
      corpus/knowledge/gate-verdict.md)
    printf '%-16s heading=%s cites=%s names=%s\n' "$m" \
      "$(grep -c "^## \`crates/ufo-core-runtime/src/$m\`" corpus/knowledge/gate-verdict.md)" \
      "$(printf '%s\n' "$s" | grep -cE ':[0-9]+')" \
      "$(printf '%s\n' "$s" | grep -cF "$m")"; done
gate.rs          heading=1 cites=92 names=4
gate_tests.rs    heading=1 cites=21 names=5
```

Counts, each with its producing command:

- `wc -l` on the two files → 254 / 426 lines.
- `grep -c '^#\[test\]' gate_tests.rs` → 19.
- `grep -c 'cfg(unix)' gate_tests.rs` → 0.
- `node` over `conformance/vectors/native/judge-wave.json` → 49 cases; decision
  histogram `admit 8, reject_regression 1, reject_no_improvement 3,
  reject_malformed 5`.
- `grep -rn 'ParetoGate::new\|decide_with_deltas\|validate_vector'` over
  `crates/` → the consumer table above (gate.rs and gate_tests.rs excluded).

Checked against `corpus/knowledge/native-judge-pipeline.md` and
`corpus/knowledge/test-inventories.md` (the two neighbours that already cover
`GateDecision` and `gate_tests.rs`): neither states the enum's per-variant line
anchors, the `verdict` priority table, the `validate_vector` two-scan
precedence as a literal-format list, the echo-ceiling line anchors, the
consumer call-site lines above, or any part of this census. Mechanically: an
8-gram overlap sweep of this note against all 39 existing `corpus/knowledge` +
`corpus/lessons` notes reports **zero** shared 8-grams, so no sentence here is
duplicated from any existing note.

Sources: `crates/ufo-core-runtime/src/gate.rs`,
`crates/ufo-core-runtime/src/gate_tests.rs`,
`crates/ufo-core-runtime/src/axes.rs`,
`crates/ufo-core-runtime/src/round_digest.rs`,
`crates/ufo-core-runtime/src/native.rs`,
`crates/ufo-core-runtime/src/native_scores.rs`,
`crates/ufo-core-runtime/src/native_header.rs`,
`crates/ufo-core-runtime/src/loop_driver.rs`,
`crates/ufo-core-runtime/src/loop_driver_judge.rs`,
`crates/ufo-core-runtime/src/loop_driver_dry.rs`,
`crates/ufo-core-runtime/src/loop_driver_resume.rs`,
`crates/ufo-core-runtime/src/loop_driver_tests.rs`,
`crates/ufo-core-runtime/src/distill.rs`,
`crates/ufo-core-runtime/src/mutation.rs`,
`crates/ufo-core-runtime/src/axis_checks.rs`,
`crates/ufo-core-runtime/tests/conformance.rs`,
`crates/ufo-core-runtime/tests/loop_driver.rs`,
`crates/ufo-core-runtime/tests/native_handoff.rs`,
