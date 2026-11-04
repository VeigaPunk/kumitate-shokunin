# K78ReviewC1 — adversarial C1 review

Axes: operability + coverage:kimi-layer. Recommendation only: original frozen C1 is UNMET; no approval/admission.

## Findings, severity order

### High — 12/12 receipt is not against the assigned frozen counter
Original `ad2630d0566a561ee078f47fade5644a22c10621` counter SHA-256 is `aa00be37a46afdf02b68f47ed774094eb9297dbc5707089313e2915da9e652cf`. Its arm `axes-crosscheck` (`probe78-c1.mjs:187`) wrongly tests `f.term === 'coverage_kimi'`, whereas canonical `compareAxes()` emits `term=coverage:kimi-layer`, `key=coverage_kimi` (`scripts/proxy-check.mjs:1299–1306` before patch; unchanged in reviewed patch). My independent archive+patch run of that exact counter returns **11/12, exit 1**, with only axes-crosscheck failing. See `original-frozen-probe-on-patch.txt`.

During the review the lane counter changed to SHA `5e9d9d4f237cbcb470f27d442b4c014e3ec359b1bdef7b2fa120421c3d19c4ed`, using `f.key`; that version returns **12/12, exit 0**, preserved in `probe-on-patch.txt`. These are different experiments. I did not edit either counter. Route the frozen-counter defect and preserve the identity distinction; do not cite 12/12 as satisfaction of the original byte-frozen assignment.

### Medium — exported `decide(root)` silently skips owner enforcement
Reviewed patch `scripts/kimi-census.mjs` hunk at original line 264 removes `runningUid = process.getuid()`, and its owner check now requires `runningUid !== undefined` (reviewed.patch.diff:17–18,58–59). On an otherwise clean root with `locks/` owned by uid+1, **`decide(root).findings=[]`**, but **`decide(root,process.getuid())` returns SHAPE_DRIFT locks/**. See `default-owner.json`; CLI also rejects this root (`owner-cli.json`). Proxy explicitly supplies uid and is not bypassed on this Linux host. Nonetheless the promised one-argument public decision is not the census decision under the same root. Restore a platform-safe default uid in the canonical function; do not require callers to remember a hidden policy parameter.

### Medium — score becomes arbitrarily negative (frozen formula design defect)
`kTerms()` passes `members - kimi.findings.length` into `layerCoverage()` with no lower clamp (reviewed.patch.diff:330–336). On an isolated root with only `region` and 40 undeclared root leaves: **K_members=1, K_findings=71, coverage_kimi=-700**, exit 1. See `saturation.json`. Findings include missing members and strays, so their count is not bounded by members. This follows the literal frozen formula rather than violating its arithmetic, but violates the score's intended bounded 0–10 interpretation and makes saturation claims misleading outside clean fixtures. Route the contract issue; a floor-at-zero amendment needs explicit disclosure, not a quiet implementation deviation.

## Attack table

All commands are captured in receipts or executable `review-runner.py`. Prefix: `S=/fast/scratch/hyaku/kumitate-r78/K78ReviewC1`, lane `L=/home/vgpnk/Projects/shokunin/kumitate-shokunin`. The runner creates independent `git archive ad2630d...` trees, applies `patch -p1 --batch --forward -i <build>/reviewed.patch.diff` only to scratch bytes, and cleans S in `finally`. No git-state mutation occurs.

| Attack | Command / evidence | Observed result | Verdict |
|---|---|---|---|
| (a) frozen probe on patch | `node "$S/base/.ufo/waves/round-78/probe/probe78-c1.mjs" --lane "$S/patched" --work "$S/probe" --set c1`; original-frozen-probe-on-patch.txt | 11/12 exit 1; corrected live counter separately 12/12 exit 0 | broke original acceptance; corrected counter held |
| (b) single derivation / private rules | Text-search reviewed patch for `K_MEMBER_RULES`, `decide`, paths, kind tables, `CHAIN_MEMBER`, `RE_CHAIN`; inspect kMembers/kTerms hunks | Whole private member table and counting walk removed; kMembers delegates to decide(root,uid). Proxy retains chain regex/identity for heading interpretation, not member counting. Public decide(root) skips owners | counting held; one-argument API broke |
| (c) missing member double penalty | `node "$S/patched/scripts/proxy-check.mjs" --src /fast/scratch/hyaku/kumitate-pin/src --kimi-root "$S/clean" --json` after unlink region; missing-members.json | 54 members/1 finding/54 sections -> score 9. After also deleting skills:47/2/47 ->9 | held: not a product of section and finding penalties; denominator and finding density both change, disclosed here |
| (d) census bug moves score silently | Trace imported decide -> kTerms -> compareTerms -> comparePins -> compareAxes; mode mutation in original probe | K_FINDINGS_DRIFT, COVERAGE_KIMI_DRIFT, AXES_DRIFT occur for mode fault. Census source is pinned. No independent correctness oracle after intentional re-pin/re-declaration | held for unacknowledged changes; residual correlated oracle risk |
| (e) fitted stanza term | Original probe stanza-tamper and clean/mode/stray/missing arms | independent recomputation: K_findings 0 ->1 as root changes, stanza tamper rejected | held, derived not fitted; negative-range contract broke |
| (f) non-K terms | Same root/source, base and patched proxy --json; non-k-delta.json | Only metadata stanzaLine moved 288 ->293; no non-K numeric term changed. Changed pins/declared stanza intentionally excluded, preserved raw in base-proxy.json and patched-proxy.json | held on tested root |
| (g) census compatibility | Base/patched census --root same fixture --json, normalize durationMs; census-equivalence.json; original frozen probe selftests arm | Census JSON exactly equal after duration normalization; CLI verdict CLEAN 55/55 unchanged. Both selftests exit0. Proxy fixtures and expected K verdicts intentionally changed (30->55 and finding-based score); section loss now keeps score unchanged, explicitly tested | held for tested CLI behavior; public API owner divergence above |

## Reproduction and provenance

Run `python /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-78/build/K78ReviewC1/review-runner.py`. It reproduces the original frozen-counter run against the preserved patch, terms comparison, missing-member and saturation attacks, and the owner API contrast. The initial extraction refused a historical absolute symlink; subsequent extraction excludes all symlink/hardlink entries in both trees. Those historical fixture links are not part of the changed scripts. `sudo -n chown` was used only on this seat's scratch locks fixture to create the ownership counterexample, then restored.

Reviewed patch SHA-256: `7ed3b4b6d059cbba097b2728b25eb9dfeb50a743c7a19dc3c32fbe43532ec7ff`; copy: `reviewed.patch.diff`. Runtime: Node v24.21.0 (`execution.json`). All receipts named here live beside this report in build/K78ReviewC1; scratch removed before delivery. No tools installed/updated; no lane tracked file, counter, fleet file, sibling output, git/jj state changed by this seat.

## Residual risk / verification gaps

LSP unavailable: `read xd://lsp` returned `No such tool`; no references/definition/diagnostics requests could be issued. Text inspection is not semantic-reference proof. Clean-fixture census parity and existing selftests were exercised, not an exhaustive differential over every census error case. The direct default-owner API counterexample is concrete; CLI/proxy remain protected because they pass uid. Sections remain drift-checked but no longer determine score: 10 now means full yes-row ratio and zero census findings, not complete note coverage by arithmetic. Findings density is not bad-member fraction. Runtime routing/resume_continuity_v1 is outside this C1 patch; no alternate agent runtime or admission judgment was invoked. Further executor patch revisions are not reviewed by this report.

Self-evaluation: accuracy 4 (explicit tested/static distinction), completeness 4 (all seven attacks, non-exhaustive drift parity disclosed), clarity 4 (two counter identities distinguished), actionability 4 (reproducer + exact hunks), conciseness 4 (raw outputs linked rather than repeated); average 4.0. Highest-priority action is resolve the routed freeze identity defect before any C1 acceptance claim.
