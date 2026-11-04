# K78CriticClaims — operability + coverage attack

## Provenance and limits

Reviewed scaffold `ad2630d0566a561ee078f47fade5644a22c10621`, including plan, both counters, four controls, fixture and SCORECARD. Original counter hashes: C1 `aa00be37a46afdf02b68f47ed774094eb9297dbc5707089313e2915da9e652cf`; C2 `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460`. Later observed plan Amendments 1–3 and current C1 `5e9d9d4f237cbcb470f27d442b4c014e3ec359b1bdef7b2fa120421c3d19c4ed`. These are distinct instruments, not interchangeable receipts. Original and amended plan observations are preserved beside this report. This seat edited neither counters nor lane implementation; no admission or canonical judgment is made here.

## Attack table

| Attack | Counterexample / evidence | Impacted axes | Smallest safe correction / disposition |
|---|---|---|---|
| (a), (f): findings coupling loses documentation coverage | Existing `proxy-check.mjs` `kTerms()` (1028–1045 at scaffold) scores `layerCoverage(C1k,C1k_total,K_sections,K_members)`. Proposed formula removes `K_sections`. Clean shape, 55 members, 54 bound sections, zero findings: old score **9**, proposed score **10**. `section-loss-witness.json` records arithmetic, not a patched execution. Existing selftest around 2299–2312 explicitly preserves the behavior “two sections lost ⇒ 1→0”. | **Coverage regression / changed metric identity**: documentation binding stops affecting the score. A surviving K_SECTIONS_DRIFT gate does not restore that lost score dimension. | Preserve section coverage and multiply by finding-free-member ratio: `floor(10*C1k/C1k_total*K_sections/K_members*(K_members-K_findings)/K_members)` with existing denominator guards. This is a contract tradeoff for canonical disposition, not a silent executor edit. Frozen fixture arms all have full binding and do not detect this loss. |
| (a): mere refactor? | Not merely a refactor: mode drift already reaches census but not proxy score. On green scaffold, same mode-0200 root gives census SHAPE_DRIFT exit 1 while proxy is MATCH, exit 0, K_members=55, K_sections=55, coverage_kimi=10, no K_findings. See `green-scaffold-mode-seam.txt`. `K_MEMBER_RULES` has 32 rows and five identifier occurrences. | Coverage: newly coupled shape findings, but no live integer improvement. | Describe movement as shape-finding sensitivity/single authority, not additional documented members. At open the live root is clean; score-lowering movement is exercised only on synthetic mutated roots. Live evidence is clean parity, not an observed 10→9→10 repair. |
| (b): unrelated base failure | Original/base control at `0b4df07b` mode arm reads exactly `exit=1 terms={"K_members":55,"coverage_kimi":10} kinds=C2_TOTAL_DRIFT,AXES_DRIFT`. This is unrelated red-stanza noise. Independent green-scaffold command removes it: MATCH, exit 0, no findings, score 10 despite census drift. | Honesty / coverage discrimination | Keep both readings. The base exit alone is not evidence; the term/kind assertions distinguish implementations. Attack that the entire distinction is unrelated stanza failure **failed** after isolating the green scaffold. |
| (c): capability or cosmetic flag? | Base `omp-census.mjs` `runShape()` (376–391) reads receipt and runs `censusEntries(entries,noteText)`; it does **not** compare receipt to current live root. Thus compare adds a genuinely missing relation even while reusing readShape/receipt machinery. Search of scaffold scripts and SKILL found no `--compare`/`omp-shape-compare` consumer. Plan adds capability row and knowledge note, not a consuming close gate. Arm 10 deliberately excludes proxy integration. | Operability: real manual diagnostic, no automatic closure protection | State manual/non-scoring capability honestly. Do not claim live drift is now enforced by the close set. Wiring a consumer would be separately scoped work, not an implicit requirement of this claim. |
| (d): constant/no-op control | Independent unchanged scaffold: original C1 3/12, amended C1 **4/12**, C2 **2/11**, all exit 1. Constructed constant proxy/census plus constant compare branch (delegating unchanged snapshot/shape/selftest) scores **5/12**, **5/11**, exit 1 each. Stub sources and full receipts are preserved here. | Both axes / false-green resistance | No target-reaching do-nothing found. Constant-output attack **failed**; do not count its five passing arms as capability evidence. |
| (e): wrong AXES_DRIFT field | Original arm 9 selects `f.term==='coverage_kimi'`. Existing compareAxes emits `term:'coverage:kimi-layer', key:'coverage_kimi'`; selftest 2336–2344 pins those identities. Green scaffold emits valid AXES_DRIFT yet original arm fails. | Honest implementation falsely rejected; potential diagnostic identity harm if “fixed” in implementation | **Fixed pre-data in plan A1**, which selects `f.key`. Independently rescored amended counter on unchanged scaffold: 4/12; axes arm now passes. Never invert diagnostic fields or weaken selftests to satisfy old bytes. Preserve original 3/12 versus amended 4/12 provenance. |
| (e): first= grammar | Original plan generic line includes first=<name>; exact in-sync arm excludes it. Literal always-first implementation would fail. | Operability contract clarity | Plan **A3** clarifies first only on DRIFT; wording defect, not an open byte-level counter defect. |
| (e): hardcoded 64 / first ordering | Receipt has 64 depth-one entries, only file/dir kinds; root materialised directly from that receipt. One added/removed/mode-changed identity makes first unambiguous. Thus no actual ordering false-negative found. But different receipt cardinalities, symlinks and simultaneous mixed discrepancies are not exercised. | Coverage of diagnostic tests | Keep host/pin-specific claim scope. Mixed-drift ordering and symlink behavior remain unproven, not demonstrated defects. |
| (f): broken advertised default | Both DEFAULT_LANE expressions climb three parents to `<lane>/.ufo`, not lane root. Bare advertised command targets wrong tree. | Operability | Already disclosed in plan **A2**: current round uses explicit `--lane`; default repair routed, no post-data byte edit. Report is conditional on explicit invocation, not a working default. |
| Claim strength: single authority | C1 arm 7 checks deletion of spelling K_MEMBER_RULES and independently calls exported decide. It never asserts proxy imports/calls decide. A duplicate under a new name with matching fixture behavior is not excluded. This is a structural counterexample, not an executed full mutant. | Maintainability / duplicate authorities | Review actual patch import and call site. Additional instrument assertion would require routed change, not seat editing. Behavioral parity on four shapes is not proof of single derivation. |
| Claim strength: non-scoring / one line | C2 arm 10 checks only absence of literal --compare from proxy plus old snapshot roundtrip; it does not diff all proxy terms. Most compare arms inspect lastLine, so an implementation emitting extra lines can still pass. | Honesty / operability evidence limits | Inspect actual proxy diff and output cardinality; do not equate arm10 with universal proof of unchanged terms. These are instrument gaps, not observed implementation regressions. |

## Reproduction and receipts

All probe runs explicitly supplied `--lane` and `--work`, with TMPDIR under this seat's `/fast/scratch/hyaku/kumitate-r78/K78CriticClaims/` scratch. The lane fixture was `git archive ad2630d... | tar -x` (no disposable git repository or commit). Full recorded command arrays and hashes are in:

- `amended-scaffold-c1.txt`: unchanged scaffold, current C1 bytes, 4/12 exit 1.
- `own-stub-c1.txt`, `own-stub-c2.txt`: independently constructed constants, 5/12 and 5/11 exit 1.
- `stub-kimi.mjs.txt`, `stub-proxy.mjs.txt`, `stub-omp.mjs.txt`: exact stand-ins; compare delegates non-compare modes to unchanged omp script.
- `green-scaffold-mode-seam.txt`: exact two commands and readings on same mode-violating root; proxy output intentionally projected to verdict/K terms/findings for readability.
- `original-c1-base.txt`, `original-c1-stub.txt`, `original-c2-base.txt`, `original-c2-stub.txt`: copies of scaffold-committed controls, not newly executed base-0b4 controls.
- `section-loss-witness.json`: executable arithmetic witness for formula regression, not a measured patched implementation.

The original C1 and unchanged-scaffold C2 runs were exercised and their readings appear above; their terminal output is in the seat transcript. Current corrected controls were also read: C1 base 4/12 with corrected sha. No latest integrated implementation was scored by this seat.

## Round honesty and bounded conclusions

A1 is a real counter-byte correction, even though target and arm count remain constant. The plan's phrase “no ... predicate changes” must not be read as byte-identical evaluation: selecting key rather than term changes the arm's result (3→4 on unchanged scaffold). A1 discloses that change and timing; this seat has not independently established the global pre-data chronology. A2/A3 are invocation/wording corrections. No concealed score gain is established by the failed constant attacks.

The decisive remaining contract concern is loss of K_sections sensitivity. The canonical decision must distinguish a permissible redefinition of the axis from the required non-regression rule; the counter alone cannot make that decision. Keeping live score 10 is insufficient evidence that no axis is harmed.

### Confirmed implementation counterexample (L1 receipt, independently read)

`.ufo/waves/round-78/close/harm-counterexample.txt` records the L1's executed comparison, not this seat's patched execution. Both trees de-name the identical heading in `corpus/knowledge/kimi-session-state.md`: `## `~/.kimi-code/sessions/` — the worktree-keyed session store` becomes `## The session store — worktree-keyed (heading de-named for the harm probe)`. Base is archive `ad2630d0`; patched is the same archive plus the committed replacement scripts/stanza named in that receipt.

Exact receipt commands:

```sh
(cd harm-base && node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json)
(cd l1-int && node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json)
```

Base: `verdict=DRIFT K_sections=54 K_members=55 coverage_kimi=9 findings=['K_SECTIONS_DRIFT', 'COVERAGE_KIMI_DRIFT', 'AXES_DRIFT']`.

Patched: `verdict=DRIFT K_sections=54 K_members=55 coverage_kimi=10 findings=['K_SECTIONS_DRIFT']`.

Thus the regression is measured in the implemented patch, not merely inferred from the formula. Both gates remain red; the harm is the score's lost documentation sensitivity. The smallest safe correction remains preservation of both factors, requiring a newly authorized contract/instrument rather than a post-data change under the existing claim. This critic does not render the admission judgment.

## Hygiene / self-evaluation

No tools installed or updated; no git/jj mutation, staging, commit, dispatch or runtime invocation beyond the assigned Node counters/scripts. Scratch receipts copied before cleanup; scratch removed at handoff. Two initial scratch-copy attempts encountered tracked dangling/existing symlinks; rebuilt own stub with symlinks preserved, without following or mutating targets.

Self-evaluation: accuracy 4 (patched behavior intentionally not claimed); completeness 4 (structural import counterexample not executed as a full mutant); clarity 4 (separate original/current instruments); actionability 4 (formula correction requires canonical contract disposition); conciseness 3 (report retains detailed provenance to prevent stale-counter claims). Average 3.8. Highest-value improvements already applied: disambiguated corrected predicates and corrected the initial suspicion that --shape compares live state—it does not.
