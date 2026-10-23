# CritPredicateWording — three-location frozen-predicate review

## Scope and axes

Attacked: whether the round-50 plan, each frozen probe's header, and its emitted summary express one predicate rather than three subtly different authorities.

Axes: **operability** (C1/G50) and **coverage** (review coverage only). The current plan explicitly makes R50 an auxiliary closure/frontier audit, **not C2 or a second scored claim** (plan.md:63–82). Nothing in this review changes that identity.

Static review only: I read both complete frozen probes and the plan. I did not execute either probe, run a build/test, change a predicate, invoke a judging runtime, or modify implementation files. Counterexamples below are source-derived **[INFERENCE]**, not claimed measured receipts. No tools were installed or updated.

## Answer

**The success labels, eight-check denominators, held=8/8 thresholds, and success exit codes agree. The complete sentences are not identical, and there is substantive header/implementation drift beyond harmless output metadata.** Do not describe these bytes as a fully identical three-location predicate.

The r42 precedent is concrete, not a demand that punctuation match: `corpus/QUALITY.md:329–347` says one frozen predicate, no artifact stating a narrower or wider rule; `corpus/lessons/round-42.md:172–181` records the widened plan and third implemented rule. Q25's mutation-specific case-naming machinery is not imported as a new G50/R50 requirement here.

## Success-summary comparison

| Surface | G50 | R50 |
|---|---|---|
| Plan | :54 / :61: `GUARD_HELD` = `held=8/8` exit 0 | :76 / :81: `LEDGER_HELD` = `held=8/8` exit 0 |
| Header | bindguard50-probe.mjs:25: `Predicate GUARD_HELD = held=8/8, exit 0.` | repairs50-probe.mjs:24: `Predicate LEDGER_HELD = held=8/8, exit 0.` |
| Printed success template | :141, followed by `process.exit(0)` at :142 | :120, followed by `process.exit(0)` at :121 |

The emitted templates, expanded only for the success condition and constant rule ids, are:

```text
BINDGUARD50: GUARD_HELD held=8/8 checks=8 rev=<rev> rule=G50 caprun_sha256=<sha256>
REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=<rev> rule=R50
```

These are **source templates, not observed probe output**. Neither full template is copied into the plan or header. Prefix, revision, rule, and digest fields are explanatory metadata, not evidence by themselves of a different success threshold. Both programs count eight booleans and enter their success branch only when all eight are true (G50:136–142; R50:114–121).

Failure-label spelling is also consistent where specified: the plan's `GUARD_UNMET` and `LEDGER_UNMET` match G50:144 and R50:123. The header summaries omit those labels and give only `held=<k>/8` exit 1; omission alone is not a contradictory label.

## Substantive wording drift, ranked

### 1. Error versus scored miss: headers promise exit 2 that these branches do not implement

**R50 evidence:** header :25 says, `A crash or an unreadable blob is exit 2 (never a score).` But `blob()` at :51–54 returns `null` on a failed `git show`; `lsRev()` at :55–58 returns an empty list. Required-artifact checks turn those values into misses. The program has no explicit exit-2 branch or outer exception handler; its only explicit score exits are 0 and 1 (:119–124).

**Strongest static counterexample [INFERENCE]:** supply an existing lane/fleet pair but a revision name that does not exist. The repo-existence checks (:44–47) do not validate the revision. Lane blob reads return null, the receipt list is empty, R1–R6 miss, and the two live checks can still run. It reaches `REPAIRS50: LEDGER_UNMET ... rev=<unreadable-rev>` and exit 1, not the header's promised non-score exit 2. This follows the branches without needing any forged receipt or changed runner.

**G50 evidence:** header :25–26 additionally promises exit 2 for `a malformed verdict line`. Yet the G4/G5/G7 decisions (:105–111, :126–130) use status/regex booleans. A child returning exit 0 with malformed/nonmatching output makes a normal MISS; there is no malformed-verdict exception path there. With the other seven checks true, that is a scored 7/8 exit 1, not exit 2 **[INFERENCE]**. The plan :55 does not add this malformed-line promise.

**Impact:** operability's measurement/error distinction; coverage of what the receipts actually certify. This is not merely a different display prefix.

**Smallest safe correction:** describe the current missing-blob/nonmatching-output behavior accurately in an explicit correction; do not claim the unimplemented exit-2 guarantees. If exit 2 is intended as a normative predicate obligation, it needs a newly frozen counter and corresponding controls, not an in-place post-data assertion that the old counter did it.

### 2. G4's header silently adds `CAP_RUN_SELFTEST`

- Plan :50–51: cap-run selftest has `VERDICT: PASS` and exit 0.
- G50 header :16: exit 0 with **`CAP_RUN_SELFTEST` + `VERDICT: PASS`**.
- G50 implementation :105–107: requires status 0 and `/VERDICT: PASS/` only.

**Counterexample [INFERENCE]:** selftest stdout is only `VERDICT: PASS`, exit 0. G4 passes under the plan/implementation but not under the header's two-token description. If the other seven booleans pass, the emitted summary is `GUARD_HELD` despite the header clause being false.

**Impact:** operability claim wording. **Smallest safe correction:** remove the extra marker obligation from the header's description to match the frozen plan and actual G4; do not silently strengthen G4 after candidate data.

### 3. R2/R3 disagree on where the pinned hash must occur

- Plan :71–72 describes first-line verdicts and the recorded hashes but does not spell out hash placement.
- R50 header :11–14 says the first nonblank line matches the verdict **and carries** the hash.
- R50 implementation :72–74 trims the first nonblank line for the verdict, but searches **the entire artifact** with `t.includes(sha256=...)` for the hash.

**Counterexample [INFERENCE]:** first line `REOPEN50: HOLD source=<url>`; second line contains the correct full `sha256=` token. The code accepts it, while the header's line-bound hash description does not. This is a provenance-location claim, not proof of an actual re-fetch.

**Impact:** coverage/provenance audit. **Smallest safe correction:** explicitly state the existing two-part test (verdict on first nonblank trimmed line, pinned hash somewhere in the artifact) in the predicate description. A line-bound hash check would instead be a stricter new counter, not the existing rule.

### 4. R8's actual token obligations are absent from the plan's predicate sentence

- Plan :75–76 says the committed fleet report **contains `## Erratum`**.
- R50 header :21–22 calls it a heading/correction naming superseded C2 numbers, but does not enumerate all required strings.
- R50 code :108–112 also requires exit 0 from `git show` and all six substrings **anywhere in the report**: `01b70bb0`, `923a172`, `c432cc9`, `16/16`, `15/15`, `64b92866`.

**Counterexample [INFERENCE]:** the other seven checks hold and the readable fleet report contains `## Erratum` but lacks one of those tokens everywhere. The plan's listed R8 condition holds, while the code prints `LEDGER_UNMET held=7/8`. Conversely, the code does not require that the six tokens be inside the erratum section; neither a real Markdown heading nor append-only history is verified by these substring tests.

**Impact:** auxiliary coverage/conformance wording, not a second axis claim. **Smallest safe correction:** explicitly enumerate the six whole-report substring checks and successful committed-report read in the single predicate description. Do not claim section-local naming or append-only verification from this counter alone. This preserves the current implementation rather than weakening it to a heading-only test.

## Lesser abbreviation differences (not standalone evidence of a new success threshold)

- G7: plan :53 includes `--self <rev-extract>`; header :20 omits it. Actual invocation :127 includes `--self T --strict`. Copy the complete command in the canonical sentence for reproducibility.
- R4: plan :72 names `ReRunB49-*.txt`; header :15–16 says files whose names start `ReRunB49-` without the suffix, and spells out `BINDORACLE49:` where the plan :73 only gives `ORACLE_HELD`. Actual filter :80 requires the `.txt` suffix and actual match :86 requires `BINDORACLE49: ORACLE_HELD held=6/6`. The threshold (at least three, every matched receipt distinct, >=300 seconds) agrees. Standardize the exact filename set and summary substring; do not imply the counter proves real wall-clock spacing (plan :102–103 explicitly disclaims that).
- R50's plan sentence omits the failure/error exit policy altogether; its header promises one. State the policy explicitly rather than treating an omitted policy as already frozen identically.
- G1–G3, G5–G6, G8, R1, R5–R7 have no additional plan/header wording contradiction identified in this scoped comparison. This is not a finding that their implementation or anti-forgery strength is sufficient; those are separate assigned attacks.

## Smallest safe round-level correction

Have the owner record one exact success-line template per probe, plus one precise check/error-policy description used verbatim in plan and header. Preserve G50 as the sole scored claim and R50 as auxiliary. The substantive differences above cannot be erased by reporting that the labels match. If a predicate obligation changes, use a named new frozen counter and re-score controls only under verified pre-data conditions; after data, retain the old predicate/receipts and append the discrepancy instead of retroactively relabelling them. These are fixable description/measurement defects, not a critic-issued claim or admission verdict.

## Evidence and receipts

Read tools exercised (paths are lane-relative below):

```text
read .ufo/waves/round-50/plan.md:1-220
read .ufo/waves/round-50/probe/bindguard50-probe.mjs:1-240
read .ufo/waves/round-50/probe/repairs50-probe.mjs:1-260
read corpus/lessons/round-42.md:160-188
read corpus/lessons/round-42-verifier-spotcheck.md:40-75
grep pattern='header|sentence|predicate|rule changed' corpus/QUALITY.md corpus/knowledge/counter-amendment-discipline.md
```

Selected exact returned evidence:

```text
QUALITY.md:329-332: a mutation battery has one kill predicate, frozen before any counted run and stated
identically in the plan, the code and the selftest case names. A predicate stated three ways is
three predicates: the round is scored under the sentence the plan froze, and no artifact may state
a narrower or wider rule beside it.
bindguard50-probe.mjs:16: G4 ... exits 0 (`CAP_RUN_SELFTEST` + `VERDICT: PASS`).
bindguard50-probe.mjs:26: unreadable extraction or a malformed verdict line is exit 2 (never a score).
repairs50-probe.mjs:25: Any other reading is `held=<k>/8` exit 1. A crash or an unreadable blob is exit 2 (never a score).
repairs50-probe.mjs:53: return r.status === 0 ? r.stdout : null;
repairs50-probe.mjs:73: const ok = /^REOPEN50: (HOLD|DRIFT) /.test(line) && t.includes(`sha256=${hash}`);
```

The first excerpt joins wrapped lines and omits Markdown emphasis; the probe-line excerpts preserve the relevant returned text but omit comment indentation.

Command actually run, cwd `/home/vgpnk/Projects/shokunin`:

```sh
sha256sum kumitate-shokunin/.ufo/waves/round-50/plan.md kumitate-shokunin/.ufo/waves/round-50/probe/bindguard50-probe.mjs kumitate-shokunin/.ufo/waves/round-50/probe/repairs50-probe.mjs
```

Verbatim output:

```text
4a024d84476aa13c18dcaee575cfbb317597b5b02802571c9ccc647e64fc833e  kumitate-shokunin/.ufo/waves/round-50/plan.md
a9e79600d8849d947f0074b6f2964c17611b40a324afb9c5793ea7f212b61dc3  kumitate-shokunin/.ufo/waves/round-50/probe/bindguard50-probe.mjs
f69dbc3ecb6212646ed07503cfe395c8a32d5044e2ea8184b86ca74b7dca240d  kumitate-shokunin/.ufo/waves/round-50/probe/repairs50-probe.mjs
```

Only this assigned report was written. No build/test/probe execution is claimed.
