RESULT ScribeMistake rev=516977af verdict=mined class=literal-evidence-overclaim

Behavior: Across r42–r45, limited representations (counts/verdict literals, finite case shapes, or quoted source text) were treated as support for broader semantic claims. The mechanisms differ, but each spot-check identifies evidence that did not establish the claim's full meaning.

Gates: Operability / claim admission. Q18 is the shared semantic principle; Q26, Q29, and Q30 address particular counter failures. No one current Q criterion covers all four manifestations.

Findings:
- r42: `corpus/lessons/round-42-verifier-spotcheck.md:82-95` says the proxy counted checklist lines and runnable files, not passing work; a zero-byte `.mjs` still yielded operability=9. The closure separately rejects C1 under its frozen kill rule. Matching lesson `corpus/lessons/round-42.md:125` records the kill-rule mismatch, not the proxy blindness. Q25 addresses predicate mismatch; Q26 (`corpus/QUALITY.md:372-400`) later names the exact listed-line/file-count failure, but was not in force at r42.
- r43: `corpus/lessons/round-43-verifier-spotcheck.md:83-105` records J4 checking frozen source literals yet returning CLEAN while skipping the claimed work; other skip-work routes also reach the target. Matching lesson `corpus/lessons/round-43.md:154-156` records a substance-blind counter and a self-reading witness. Q29 (`corpus/QUALITY.md:483-510`) codifies pre-data skip-work controls; it was added after this rejection.
- r44: `corpus/lessons/round-44-verifier-spotcheck.md:73-98` records skip-work programs reaching MET via catalog/aggregate projections; the last pre-data counter p44b was already met by controls (`:78-83`). Matching lesson `corpus/lessons/round-44.md:125-127` records the skip-work control and one-member case weakness. Q29 applies to the controls; Q30 (`corpus/QUALITY.md:529-561`) later addresses recurring CLEAN catalogs, with a documented junk-variation limit.
- r45: `corpus/lessons/round-45-verifier-spotcheck.md:61-75` says S073's `teaches` claim that Buffers are outside old space overstates both cited locators; the author had not listed the failing item. The lesson corrects S073 at `corpus/lessons/round-45.md:179-182`; its `## Mistakes` instead records an adjacent tested-guard/prescribed-guard mismatch at `:186-193`. Q18 (`corpus/QUALITY.md:149-155`) is the closest semantic rule; Q2 only requires an opened source row and is insufficient. The closure explicitly routes a new per-locator `teaches` check at `round-45-verifier-spotcheck.md:123-125`.

Captured-by: Q25/Q26 for the r42 predicate/proxy defects; Q29 for the r43–r44 skip-work controls; Q30 for the r44 catalog; Q18 as the closest existing semantic rule for r45. The explicit requirement to test each `teaches` clause against every locator is absent from the current QUALITY criteria (the r45 D2 routing asks for it).

Fix: Before claim admission, split prose into atomic assertions and map each to its complete evidence: reopen every cited locator against every `teaches` clause; for operational claims, use a pass-sensitive counter plus named, pre-data controls that skip the claimed work. Do not treat literals, listed items, case totals, or a source quote as semantic proof. The following targeted regression guard is intentionally narrow (S073); it is not a general semantic oracle.

Command (read-only; frozen r45 blob):
`L=/home/vgpnk/Projects/shokunin/kumitate-shokunin; set -o pipefail; git -C "$L" show 2b2bf7bb:corpus/SOURCES.md | awk -F'|' '$2 ~ /^[[:space:]]*S073[[:space:]]*$/ && /outside it/ { print "TEACHES_SCOPE: FAIL S073 adds unsupported outside-old-space guarantee"; failed=1 } END { if (!failed) print "TEACHES_SCOPE: PASS"; exit failed }'; rc=$?; printf 'exit=%s\n' "$rc"; exit "$rc"`
Observed output: `TEACHES_SCOPE: FAIL S073 adds unsupported outside-old-space guarantee` ; `exit=1`.

Touched surfaces: only `.ufo/waves/round-46/build/ScribeMistake.md`. No product, lesson, or QUALITY file changed. Tool installs/updates: none.
Out of scope / gates: no lane gate, selftest, or frozen C1/C2 counter was run; no Git writes. The command above reads one committed blob and returns the observed failing regression result only.
Artifact: `.ufo/waves/round-46/build/ScribeMistake.md`