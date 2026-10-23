# CritPlan — frozen-rule and universal-clause attack

## Scope and axes

Attacked: `.ufo/waves/round-50/plan.md`, specifically the r42 failure shape (a different rule after measurements) and the r49 failure shape (prose broader than the mechanism). Read both frozen probes before assessing either predicate.

Axes: **operability** (what GUARD_HELD actually establishes about cap-run) and **coverage** (which promised cases and closure repairs the audit enumerates). The current plan declares **one scored claim, C1** (plan:3–11, 63–82); LEDGER_HELD is auxiliary, not a second coverage-axis claim. This report supplies criticism, not a judge verdict or axis score.

Read-only review; no probe, selftest, mutant, alternative runtime or judge was invoked. Only this Report file was written. Tools installed/updated: none.

## Principal counterexamples and smallest safe corrections

### 1. Alias coverage is a universal conclusion without an enumerated alias case

**Evidence:** plan:43–44 says the guard runs after realpath, “so symlink aliases are covered.” G50:81–89 enumerates exactly eight inputs: `/tmp`, `/tmp/`, `/tmp/.`, `/`, `/run`, `/proc/self`, `rel`, and one generated nonexistent path. None is a symlink. Current cap-run's usage loop (scripts/cap-run.mjs:311–321) has no alias case; bind-oracle's suite (scripts/bind-oracle.mjs:158–173) tests ordinary generated directories, three argv mutants, a missing runner and usage, not aliases. The targeted cap-run selftest search returned no alias/symlink references.

**Counterexample [INFERENCE, not executed]:** a runner that checks only the lexically resolved destination, but omits refusal of the realpath-resolved source, can retain every tested literal refusal while accepting an alias to a forbidden source. The eight G2 cases cannot distinguish it. Current cap-run:129–133 correctly checks both `bad(r)` and `bad(resolve(v))`; this is a hole in measured coverage, not a claim that the inspected guard has that defect. G4/G5 do not close the missing alias case.

**Impacted axes:** operability assurance; coverage of the stated alias class.

**Smallest safe correction:** retain the frozen G50 result as evidence for the listed cases and separately cite the parser review for the general realpath argument. Do not call G2 an alias sweep. If alias refusal is to be mechanically scored, a new explicitly frozen counter needs a generated alias case; do not silently add it to this counter after scoring.

### 2. LEDGER_HELD does not enumerate the closure set the plan names

**Evidence:** plan:65 expressly includes R50-8 among the repairs whose landing the audit records. R50's complete checks (probe:60–123) never read `r50-taskcall.json`, `r50-spec.json`, or a validator receipt. R1–R8 instead concern ledger words, two reopen receipts, rerun receipts, SKILL wording, lesson headings, live census, and fleet report strings. A search of both frozen probes for these wave-artifact/validator names returned no matches.

**Counterexample [INFERENCE, direct dependency analysis]:** keep all R1–R8 inputs fixed and leave the committed taskCall a bare array. R50's reading cannot change. Therefore an eight-of-eight reading is compatible with R50-8 remaining unrepaired. This counterexample does not require forging any scored receipt.

R50-10 likewise has no direct counter check. H1's aggregate floor is only 20/22 (plan:86–88): fixing the proxy item while leaving the header item red can exceed that floor. The assignment still requires closing both; neither HELD nor the H1 floor discharges that obligation by itself.

**Impacted axes:** coverage/closure completeness, not an additional scored axis move.

**Smallest safe correction:** report LEDGER_HELD as the eight named checks, not “all repairs verified.” Supply independent committed evidence for the taskCall shape/validator and item-level sources-check closure. No frozen-counter edit is necessary to make those report statements honest.

### 3. R4 enumerates receipt bytes, not every promised distinct run time

**Evidence:** the repair requirement (plan:20–22) says each receipt has a **distinct** `run-at=` prelude and describes “genuinely spaced runs.” R50:80–91 enumerates all matching committed files and requires valid parsed dates, a matching verdict substring, distinct whole-file hashes, and a first-to-last span of at least 300 seconds. It does not require distinct timestamps or prove invocation independence.

**Counterexample [INFERENCE, not materialized]:** three matching receipts with times `2026-10-23T21:00:00Z`, `2026-10-23T21:00:00Z`, and `2026-10-23T21:05:00Z`, identical HELD verdicts, and otherwise different bytes satisfy the implemented distinct-hash/span conditions although two preludes repeat. Changing only the prelude also establishes byte distinctness without establishing a second invocation.

**Impacted axes:** closure evidence coverage, especially the exact defect repaired from r49.

**Smallest safe correction:** independently preserve real invocation evidence and report precisely “distinct receipt bytes with a 300-second declared span.” Plan:102–103 already discloses that clock forgery is outside the counter. That is an acceptable recorded limit of this auxiliary audit; it is not permission to assert independently time-spaced executions without evidence. A timestamp-uniqueness requirement would need a newly frozen stricter counter if it is to become a scored condition.

## Frozen-rule chronology: what is established, and what is not

The r42 precedent is specific: `corpus/lessons/round-42-verifier-spotcheck.md:47–60` identifies seat readings before the amendment and three conflicting kill rules. `corpus/QUALITY.md:329–347` records the rule that the plan/code must agree and that a post-data edit is an appended correction, not a replacement score. The r49 doctrine also requires the same predicate in header and plan, and names control-driven amendments separately (`corpus/knowledge/counter-amendment-discipline.md:17–39`).

Observed history for the three r50 artifacts:

```text
378b6e7 2026-10-23T17:44:27-03:00 2026-10-23T17:44:27-03:00 round-50: freeze guard and closure corrections
5b0de26 2026-10-23T17:02:49-03:00 2026-10-23T17:29:00-03:00 round-50: freeze guard and closure audit
```

`git show 378b6e7 -- <plan and both probes>` establishes an actual G3 implementation change: selecting the first exact `/tmp` mount and testing its type became accepting **any** exact `/tmp` row whose type is tmpfs. It also adds scratch-bind cleanup and the missing `l49`/`rep` reads. The committed control receipts show:

```text
controls/CtlG50-base-ff40d7d.txt:
  G3 MISS exit=0 bound_rw=true tmpfs=false
BINDGUARD50: GUARD_UNMET held=4/8 checks=8 rev=ff40d7d rule=G50 caprun_sha256=d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758
exit=1

controls/CtlG50-base-ff40d7d-r1.txt:
  G3 PASS exit=0 bound_rw=true tmpfs=true
BINDGUARD50: GUARD_UNMET held=5/8 checks=8 rev=ff40d7d rule=G50 caprun_sha256=d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758
exit=1

controls/CtlR50-base-ff40d7d.txt:
ReferenceError: l49 is not defined
exit=1

controls/CtlR50-base-ff40d7d-r2.txt:
REPAIRS50: LEDGER_UNMET held=1/8 checks=8 rev=ff40d7d rule=R50
exit=1
```

**Finding:** a change after an L1 control reading is established; a change after a seat/candidate score is **not established** by the reviewed evidence. The plan explicitly labels the change pre-dispatch (plan:118–137), preserves the error trail, and still rejects the base. This is materially better disclosure than r42. Nevertheless, “labels, counts and thresholds unchanged” is not proof that the evaluated rule was unchanged: G3's acceptance condition did change and its base reading moved.

The mount-table correction has its own boundary: G50:96 tests existence of a tmpfs row, not which stacked mount supplies effective `/tmp`. The nonce write additionally checks absence at one host path, not the provenance of every possible backing mount. Do not convert that mechanism into a universal effective-mount proof. This is the r49 mechanism-vs-predicate warning in miniature.

**Smallest safe correction:** identify `378b6e732a1a40ae8adfcaaa5de352cee5163cf0` and the probe hashes below as the corrected freeze, attribute the old 4/8/error receipts to the old implementation, and bind all candidate readings to the corrected hashes. Do not describe the counter as byte-unchanged since `5b0de26`. If evidence later establishes a candidate/seat score before that correction, it must be handled as a post-data correction under the original frozen rule, not retroactively called pre-data. The canonical judge, not this seat, owns the resulting judgment.

## Universal-clause inventory

This inventory covers both requested predicate surfaces, including implicit universals in their surrounding explanations. Ordinary singular test observations are distinguished from a claim about a whole class.

| Location / wording | Set the counting command actually enumerates | Coverage finding |
|---|---|---|
| C1 plan:43–44, “symlink aliases are covered” | G2's eight literal/generated cases; no alias fixture | **Not enumerated.** General parser argument needs independent review; see finding 1. |
| C1 plan:44 and limit (a):97–98, “keeps subdirectory binds legal” / “binds under /tmp keep working” | One generated G3 directory; G4/G5 add their ordinary generated fixture directories | **Sampled, not all eligible subdirectories.** Do not read G3 as a universal path-compatibility sweep. |
| C1 plan:48–49, “every D in {…}” | G50:83–89 loops all eight members of the declared finite set | **Enumerated as stated.** “nonexistent” denotes the one generated missing path, not every nonexistent path. |
| C1 plan:47–48, eight checks “over the committed bytes of <rev>” | The lane scripts/SCORECARD are extracted; G7 also uses a live `UFO_SRC` origin (G50:38, 127) and host execution | **Revision-bound lane bytes, not a hermetic function of <rev> alone.** Record live dependencies; the header itself discloses the origin. |
| C1 plan:50, child `/tmp` “is still tmpfs” | One `.some(...)` mount-table test plus one nonce write (G50:94–101) | **One mechanism/observation.** Does not enumerate effective stacked-mount origins; see chronology section. |
| C1 plan:51–54, both suites PASS, five named pins, strict proxy MATCH, no-bind write leaves no host file | G4/G5 check two executions; G6 loops five keys; G7 one proxy execution; G8 one nonce write | **Finite observations enumerated.** G6 searches the whole SCORECARD text (G50:115–120), not a delimited gate-pins block; G7 is the separate consistency check. “No host file” means that nonce, not every possible child write. |
| C1 limit (a):98–99, `/etc`, `/usr` “etc. remain bindable” | Bind-oracle's EXTRA mutant mentions `/etc`; no general non-refusal census | **Not enumerated as a class.** This is a declared scope limit/unmodified parser property, not an extra G50 guarantee. |
| C1/all-eight success and else rule, plan:54–55 | G50:136–145 counts all eight booleans and compares to the array length | **Enumerated.** Label, denominator and successful exit agree with the plan. |
| Auxiliary plan:65–67, the named “routed ledger repairs … land verifiably” | R1–R8 only | **Incomplete against the listed repair set:** R50-8 is absent; see finding 2. |
| Auxiliary R1, plan:70, Gate with candidates/admitted/rejected/spot-check | R50:65–66 checks all four literal words inside the first Gate section | **Four words enumerated, not every candidate/decision or its reasons.** A bare word list can satisfy this condition; do not infer ledger completeness. |
| Auxiliary R2/R3, plan:70–72, “two re-open artifacts … first lines and … body sha256s” | R50:69–77 reads two fixed paths, checks the trimmed first nonblank line's verdict prefix, and searches the whole artifact for the expected hash token | **Two files enumerated; source fetching/body identity not measured.** Hash-on-first-line is not enforced by code although the header describes it that way. |
| Auxiliary R4, plan:72–73, ≥3 files, “each” has run-at/verdict, sha256-distinct, ≥300-second span; repair requirement:20–22 “distinct” preludes | `ls-tree` enumerates all recursively matching `ReRunB49-*.txt`; `.every` checks each, `Set` checks all hashes, extrema compute span | **Whole finite receipt set enumerated for those conditions.** Date.parse validity is not strict ISO syntax; timestamp uniqueness and real invocation times are not checked. |
| Auxiliary R5, plan:73–74, “no all eleven” and Twelve remains | R50:95–96 searches the entire committed SKILL blob for the exact case-sensitive phrase and `Twelve` | **Enumerated as an exact text condition.** Not a semantic count of gates or every alternative spelling. |
| Auxiliary R6, plan:74, Mistakes + Gate | R50:99–100 checks both headings | **Both headings enumerated; no completeness test of their contents.** |
| Auxiliary R7, plan:74–75, census validate exit 0 | R50:103–105 invokes the fleet helper against the live fleet root | **Delegated live census, not enumeration of the scored revision's SOURCES.** The same <rev> can get a different R7 as live state changes. |
| Auxiliary R8, plan:75–76, committed fleet report contains Erratum | R50:108–112 searches live fleet master for the heading plus all six additional strings | **Finite string set enumerated, but the plan does not state that full set.** Placement within an appended erratum and preservation of prior report bytes are not verified. |
| Auxiliary/all-eight success, plan:76 | R50:114–124 counts all eight booleans | **Enumerated as stated.** No automatic inference that every routed defect is closed. |

Outside the two predicate descriptions, H2's “all PASS” (plan:89) names a finite set of three selftests; the standalone harm commands can enumerate those three. Neither HELD line alone is that entire harm battery. The plan's “before any data seat runs” and “seats are read-only” are process-wide claims (plan:3, 106), not facts either counter measures.

## Existing wording drift, distinct from a post-data edit

- The `GUARD_HELD` and `LEDGER_HELD` labels, `held=8/8`, and successful exit 0 agree across plan, counter headers and emitted success logic. The plan does not literally quote the complete emitted lines (prefix, checks, rev, rule, and G50 caprun hash), so an assertion of byte-identical sentences would overstate the evidence.
- **R8 is stricter in code than its plan clause:** plan:75–76 says report contains `## Erratum`; code:110–112 additionally requires `01b70bb0`, `923a172`, `c432cc9`, `16/16`, `15/15`, and `64b92866`. A heading-only report meets the plan's literal R8 but not the code's R8. The six-string requirement is already present on the old side of the inspected amendment diff; this review does not identify it as a newly added post-seat rule.
- G50's header G4 also names `CAP_RUN_SELFTEST` (header:16); implementation:105–107 only requires exit 0 plus `VERDICT: PASS`, matching the less specific plan clause. R2/R3's header/hash location is stronger than the file-wide token search noted above.

**Smallest safe correction:** disclose these differences and use the actual enumerated terms when describing evidence. Do not rewrite a frozen predicate in place to manufacture agreement. A substantive stronger or weaker requirement belongs in a separately named pre-data freeze or a later appended correction, not an unmarked reinterpretation of an existing HELD reading.

## Command and artifact evidence

All shell commands below were read-only and ran from the lane. File evidence above was obtained with `read` ranges and the named `grep` searches; no scoring command was run by this seat.

```text
$ git log -n 16 --format='%h %aI %cI %s' -- .ufo/waves/round-50/plan.md .ufo/waves/round-50/probe/bindguard50-probe.mjs .ufo/waves/round-50/probe/repairs50-probe.mjs
378b6e7 2026-10-23T17:44:27-03:00 2026-10-23T17:44:27-03:00 round-50: freeze guard and closure corrections
5b0de26 2026-10-23T17:02:49-03:00 2026-10-23T17:29:00-03:00 round-50: freeze guard and closure audit

$ git diff HEAD -- .ufo/waves/round-50/plan.md .ufo/waves/round-50/probe/bindguard50-probe.mjs .ufo/waves/round-50/probe/repairs50-probe.mjs
(no output)

$ git rev-parse HEAD 378b6e7 5b0de26
6927903f99bbc26e397aa47387aa76950f42b3a5
378b6e732a1a40ae8adfcaaa5de352cee5163cf0
5b0de268e5a6bdd744fe47c6ee2ee58404693ac3

$ sha256sum .ufo/waves/round-50/plan.md .ufo/waves/round-50/probe/bindguard50-probe.mjs .ufo/waves/round-50/probe/repairs50-probe.mjs
4a024d84476aa13c18dcaee575cfbb317597b5b02802571c9ccc647e64fc833e  .ufo/waves/round-50/plan.md
a9e79600d8849d947f0074b6f2964c17611b40a324afb9c5793ea7f212b61dc3  .ufo/waves/round-50/probe/bindguard50-probe.mjs
f69dbc3ecb6212646ed07503cfe395c8a32d5044e2ea8184b86ca74b7dca240d  .ufo/waves/round-50/probe/repairs50-probe.mjs

$ sha256sum .ufo/waves/round-50/controls/CtlG50-base-ff40d7d.txt .ufo/waves/round-50/controls/CtlG50-base-ff40d7d-r1.txt .ufo/waves/round-50/controls/CtlR50-base-ff40d7d-r2.txt scripts/cap-run.mjs scripts/bind-oracle.mjs
fa5124bffed5c283a8afba6c8d712998a017a61e64559edea31c905d2aadde1a  .ufo/waves/round-50/controls/CtlG50-base-ff40d7d.txt
bd9c094d2e3384fe317dcfbafbebaa519285f0f3054eb8e5e8e4631c928ca585  .ufo/waves/round-50/controls/CtlG50-base-ff40d7d-r1.txt
d2a8876c157086534db6f67e4fb8d897618f30c1a020d87aec16ee731b4c5f07  .ufo/waves/round-50/controls/CtlR50-base-ff40d7d-r2.txt
64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672  scripts/cap-run.mjs
c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5  scripts/bind-oracle.mjs
```

Additional exact read-only commands: `git show --format=fuller 378b6e7 -- .ufo/waves/round-50/plan.md .ufo/waves/round-50/probe/bindguard50-probe.mjs .ufo/waves/round-50/probe/repairs50-probe.mjs` (amendment hunks analyzed above); `git show -s --format=fuller 5b0de26` (author 17:02:49 -03, committer 17:29:00 -03).

Tool searches with observed results:

- `grep` pattern `r50-taskcall|r50-spec|validator|sources-check|ENTRY_HEADER_REQUIRED|counter-amendment-discipline`, both frozen probes, case-insensitive, ignored files included: **No matches found**.
- `grep` pattern `symlink|alias|linkSync|readlink`, `scripts/cap-run.mjs:270–479`, case-insensitive, ignored files included: **No matches found**.
- Read G50:1–153, R50:1–124, plan:1–138; clause-level references throughout identify the inspected code, not claimed runtime results.
