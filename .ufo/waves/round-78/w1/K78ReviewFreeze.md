# K78ReviewFreeze — outside freeze review

Axes: operability + coverage (orchestration/tooling). Review only; no approval or admission.

Full findings, exact-byte corrections, all 23 plan/probe assertion quotes, command receipts and gaps: `../build/K78ReviewFreeze/freeze-review.md`.

Severity-ordered findings at original freeze `ad2630d0566a561ee078f47fade5644a22c10621`:

1. **High — both default counter invocations target `<lane>/.ufo`.** Reproduced C1 0/12 exit 1 and C2 invalid receipt exit 2. Amendment 2 corrects claim invocations with explicit `--lane`; source bug remains disclosed/routed to round 79, not a blocker under the amended invocation. No post-data probe repair requested.
2. **High — C1 axes arm tests wrong diagnostic field.** Canonical diagnostic uses `term=coverage:kimi-layer`, `key=coverage_kimi`; original counter selected `term=coverage_kimi`. **Fixed pre-data in A1**, probe sha `aa00be37…` → `5e9d9d4f…`; amended controls carry matching sha, base 4/12, stub 5/12.
3. **Medium — C2 grammar makes `first=` unconditional while exact IN_SYNC assertion omits it.** **Clarified in A3:** `first=` on DRIFT only. No changed counter bytes.

A2's original wording “No arm was ever run through the default” is too broad: this review captured failed default runs. Requested precise replacement: “No implementation-scoring run used the default”. This is an audit wording correction, not a route or judgment change.

Verified: original probe hashes match original receipts; archived base independently reproduces C1 3/12 and C2 2/11, exit 1; untouched isolated scaffold also cannot meet targets. Original control stubs quote 5/12 and 5/11, exit 1. Fixture remains content-free and stable under separate scratch mutations of census MEMBERS and proxy K_MEMBER_RULES. Both live census commands reproduce CLEAN; base proxy reproduces recorded open DRIFT; isolated committed scaffold proxy MATCHes after map repair. Concurrent live build output causes A_DRIFT, so the working workspace is not claimed green.

Gaps: git proves no committed round-78 score at freeze, not absence of private execution; A1 pre-data execution chronology is amendment-attested. Original stub programs were not frozen, so their exact source was not independently reproduced. Arm 7 does not prove proxy actually imports/calls decide: actual integration callsite review remains required. LSP device is unavailable; static searches are not semantic proof. No final implementation/non-regression verdict issued.

No tool installs, commits, staging, or lane-source edits. Evidence retained in own build directory; scratch deleted before handoff.
