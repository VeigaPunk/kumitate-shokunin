# CritHarm — round 52 harm-battery review

**Round axes:** operability (C1) and coverage (C2). Integrity of the evidence, confidentiality, and honest revision attribution are review constraints, not new claim axes. This is an advisory critique, not a judgment or admission.

**Method:** read/search only; no gates, tests, mutants, runtime, Git mutations, or installations executed. No lane files changed except this assigned report. References below are lane-relative unless stated otherwise.

## Findings, in severity order

### F1 — HIGH: the proposed round-52 bookkeeping does not repair the round-51 audit which H1 actually runs

**Counterexample [INFERENCE from the actual predicates]:** land exactly close-sequence step 1, including a compliant `| 52 |` SCORECARD row and a compliant round-52 LOG line, but do not yet file the real fleet report for round 52. H1's item 6 still audits round **51**, so its two inherited errors persist. Repairing the proxy arm alone cannot yield 23/23.

Evidence:

- `SKILL.md:692-694`: item 6 is bare `node scripts/round-gate.mjs`, item 7 is `--tracked`, item 8 is proxy recomputation.
- `scripts/round-gate.mjs:633-635,662`: bare audit selects the highest round whose **fleet report exists**, not the round currently being integrated. The discovered fleet reports include `/home/vgpnk/Projects/shokunin/.ufo/reports/round-51/kumitate.md`; no round-52 report was discovered.
- `scripts/round-gate.mjs:415,439`: the audit requires `^\|\s*51\s*\|` and `^- YYYY-MM-DD — round 51\b` for that selected round.
- The source search for `^\|\s*51\s*\|` and `^- \d{4}-\d{2}-\d{2} — round 51\b` over current SCORECARD/LOG found neither. SCORECARD has a **prose** `## Round 51` section at line 2255, which is not the required row. LOG's existing entry starts **`round-51 2026-10-24 — claims:`** at line 2029, which is not the required dated bullet. These are shape defects, not absent historical work.
- Frozen plan `:181-189` adds round-52 metadata at step 1, measures R1 at step 2, and files the report later. The `ExecChecklistAudit` assignment data itself identifies missing **51** artifacts but asks for drafts for **52**. That is the wrong repair target for the current bare audit.

**Ordering adjudication:** there is **no inherent post-close impossibility**. Bare audit deliberately does not require a clean tree, push, or current-report tracking (`round-gate.mjs:458`; those checks are only `--close`). Filing a genuine round-52 report makes the default audit select 52, but that is later than the proposed R1 measurement and changes the external input. `--tracked` also changes population when 52 appears: it then includes 51 and excludes 52 (`:546-565`). A pre-report 23/23 and a post-report 23/23 do not audit the same report population.

**Smallest safe correction:** explicitly repair the inherited 51 row and dated-bullet omission, using append-only, clearly labelled historical corrections grounded in existing 51 receipts; do not rewrite the old LOG paragraph or invent a success. Then H1 at R1 can honestly audit the last filed round, **51**, and must say so. After the genuine report 52 is filed, separately run the explicit round-52 audit and tracking check, recording their later time/revision and population. Alternatively schedule H1 after genuine report filing and disclose the different boundary; do not manufacture a report early or pretend that later external state existed at R1.

**Impacted axis:** operability; evidence attribution for both claims. This is a fixable bookkeeping/order defect, not an admissible trade for a new capability.

### F2 — MEDIUM: `base/baseline-gates.txt` is only a partial battery, and its proxy exit annotation is internally inconsistent

Evidence: the entire 26-line baseline contains proxy output, G50, A51, D51 and census. It contains **no item-level H1 transcript, no H2 suite transcript, and no R50 run**. `CHECKLIST: 21/23 pass` is asserted in plan `:18`, not captured in that file. The A52/D52 base receipts do exist and show 5/13 and 0/5; they establish the claim baselines, not all harm baselines.

At baseline `:5-9`, three proxy **error** findings and `PROXY: DRIFT` are followed by `exit=0`. `scripts/proxy-check.mjs:1194-1198,1376` maps any error/DRIFT to exit 1. The frozen A51 and A52 base receipts independently record the extracted-base proxy child as `exit=1`. Thus the direct baseline's `exit=0` cannot be trusted as the proxy process status. Its `A=73` also differs from the committed-base declared `A=71`; a live working-tree measurement must not silently become an extracted-base measurement.

Separate wave evidence is now present under `build/ExecHarmBattery/`: the saved cap-run, bind-oracle, counter-rerun, sources-check, and census transcripts report 12/12, 7/7, PASS, CLEAN, and exit 0 respectively. I read these artifacts, did not reproduce their runs, and they do not by themselves establish the original `02c01258` H1/H2 baseline. They are not inside `base/baseline-gates.txt` and the individual outputs lack a measured-revision header.

**Smallest safe correction:** retain the original receipt, append an explicit provenance/status erratum, and label missing baseline arms UNKNOWN unless supported by correctly revision-bound evidence. Use actual child status for future captures. Do not retrofit green outcomes into the baseline or treat freeze-tip captures as round-open captures without identifying the revision difference.

**Impacted axes:** operability and coverage evidence integrity. This is a fixable measurement/provenance defect.

### F3 — MEDIUM evidence gap; HIGH if retained in delivered bytes: half-pair rollback needs a final-byte, real-kernel failure witness

**Candidate (a), adjudicated:** this behavior is **not omitted from the contract**. Plan `:77-79,97` requires rollback and a half-pair selftest, and the independent black-box assignment includes half-pair removal. But the harm battery has no independently specified close-time filesystem-failure arm. A52 B1 checks aggregate PASS and at least 30 case lines (`probe/attest52-probe.mjs:130-141`); it does not independently force a sidecar write failure or even require a half-pair case name. Scratch/fallback implementation evidence cannot establish the final integrated pinned bytes.

Strong local counterexample [INFERENCE, not executed]: current shipped v1 writes the receipt, then the sidecar, and its catch immediately exits 2 without unlinking the first file (`scripts/receipt-attest.mjs:229-236`). Pre-create the intended sidecar pathname as a directory: the first write succeeds, the second receives real kernel `EISDIR`, and the receipt remains. The proposed v2 must close this exact defect.

At inspection, `build/ExecInstrumentV2/*` and `w1/ExecInstrumentV2.md` were absent; the available `build/ExecSelftestExec/receipt-attest.mjs` still identified itself as v1 and retained the same write path. This is a dependency finding, not a claim that the future v2 fails.

**Smallest safe correction:** at integration, independently run the **final committed/pinned** instrument with a fresh private fixture whose `<base>.txt.sha256` pathname is a pre-existing directory. Require exit 2, no receipt file afterward, no WROTE/success result, and preservation of that pre-existing directory. Save command, actual exit, before/after metadata, revision and instrument SHA. A selftest genuinely using this kernel failure, rerun on those same final bytes, also supplies evidence for that class; “scratch” is not inherently fake, but testing a different implementation is insufficient. Never simulate ENOSPC by filling the host disk or alter host mounts/services.

Do not inflate this bounded synchronous-write/rollback check into proof of “never a half-pair” across process death, power loss, or a second failure of unlink itself. The frozen contract is narrower; an unhandled rollback failure is a named residual defect, not a silent success.

**Impacted axis:** operability. No safety/correctness regression should be exchanged for a higher case count.

### F4 — MEDIUM: the missing independent harm arm is a secrecy sweep of the *actual new committed receipts*

**Candidate (b), adjudicated:** H1-H5 contain no confidentiality check. Digest validity, sources CLEAN and public-looking command names do not themselves detect a credential accidentally copied into `argv` or a captured transcript. Current v1 explicitly stores `argv` (`receipt-attest.mjs:215-223`); its “no secret material” header at `:47-49` is therefore conditional on callers not passing secrets as arguments. Q5 (`corpus/QUALITY.md:30-34`) forbids credential material and private references in durable or transient output.

The `SentSecrets` assignment is a useful design review, but a designed command or a scratch receipt is not an executed close sweep. No final round-52 receipts existed among the artifacts inspected.

**Designed command, NOT EXECUTED.** Run from a shell with `R1` set to the exact measured revision; it scans committed blobs, requires all four pairs first, prints only matching filenames, and treats Git failure differently from no matches:

```sh
lane=/home/vgpnk/Projects/shokunin/kumitate-shokunin
rev="$R1"
rdir=.ufo/waves/round-52/receipts
for stem in attest52-run-1 attest52-run-2 attest52-run-3 attest52-run-2-replayed; do
  for suffix in .txt .txt.sha256; do
    git -C "$lane" cat-file -e "$rev:$rdir/$stem$suffix" || exit 2
  done
done
pattern='-----BEGIN ([A-Z0-9 ]+ )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{16,}|(api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password|authorization|cookie)[^[:alnum:]]{0,8}[:=]|bearer[[:space:]]+[A-Za-z0-9._~+/-]{12,}|op://|https?://[^[:space:]/:@]+:[^[:space:]/@]+@'
if LC_ALL=C git --no-pager -C "$lane" grep -I -l -i -E -e "$pattern" "$rev" -- "$rdir"; then
  printf 'SECRETS: REVIEW_REQUIRED rev=%s (filenames only)\n' "$rev"
  exit 1
else
  code=$?
  [ "$code" -eq 1 ] || exit 2
  printf 'SECRETS: NO_PATTERN_HITS rev=%s scope=%s\n' "$rev" "$rdir"
fi
```

Pair the sweep with exact public-argv review against plan `:160-162` and the field whitelist; do not print candidate values. Expected intentional nonces/digests are not secrets and should not be flagged merely for being high-entropy hex. This is a **bounded pattern sweep**, never proof that arbitrary secrets/private URLs are absent. Apply the same sweep to new `close/` transcripts at the revision that actually contains them (R2/R3 or later), rather than claiming R1 already included those files. Handle findings before publication; no false CLEAN from an empty directory or swallowed Git error.

**Impacted axis:** operability safety; confidentiality is a no-harm constraint, not a proposed new kagi-domain claim.

### F5 — LOW: checklist item 23 prose is stale, but its expected substring still matches v2

**Candidate (c), adjudicated:** `SKILL.md:709` labels v1/round 51 and says the final line is exactly `ATTEST_SELFTEST: PASS`; v2's frozen final line is `ATTEST_SELFTEST: PASS (n/n)` (plan `:92-94`). However, `surface-probe.mjs:1070-1072` uses **`output.includes(item.expect)`**, not final-line equality. The v2 line includes the unchanged expected substring, so this difference does **not** make H1 fail. Keeping that substring also does not independently enforce the v2 count.

**Smallest safe correction:** update the item label/contract/final-line explanation to v2 and retain a stable expected substring (or the v2 `ATTEST_SELFTEST: PASS (` prefix); do not hardcode an evolving case count. Keep the real v2 case/count contract with A52 and the reviewed suite rather than claiming item 23 alone proves it.

**Impacted axis:** operability documentation; no demonstrated functional regression from the substring change.

## H1-H5 measurability and baseline matrix

| Arm | Close measurement | Captured in `base/baseline-gates.txt`? |
|---|---|---|
| H1 checklist 23/23 | Runnable, but external report population/time must be named; F1 prevents an automatic pre-report green | **No**; only plan assertion 21/23, no item transcript |
| H2 suites + sources | Runnable with explicit commands, exit statuses, case counts and pinned bytes; final receipt-attest cases must be genuine | **No**; separate wave partial outputs now exist, as distinguished in F2 |
| H3 strict proxy + six pins | Runnable; score committed snapshot, not siblings' changing scratch. Source output contains `PROXY: MATCH (` and later `pins=6 match`, not necessarily the plan's adjacent shorthand | **Partial**: drift captured; `exit=0` annotation untrusted |
| H4 live census exit 0 | Runnable but deliberately live/external, not solely a function of R1; disclose four existing W04s | **Yes**, exit 0 with four W04s |
| H5 G50/R50/A51 retirement/D51 | G50/R50/D51 numerically measurable; A51 retirement is a labelled supersession note, not a green A51 score. B6 separately preserves three v1 receipts | G50 7/8, A51 8/9, D51 5/5 recorded; **R50 absent**. Conditional 7/8 R50 disclosure must not be advertised as an unconditional 8/8 pass |

## Minimal integration decisions

1. Fix the actual inherited 51 audit shapes and state which round H1 audits; separately audit 52 after its real report exists.
2. Preserve and qualify the partial/inconsistent baseline rather than inventing a complete one.
3. Require final-byte real-filesystem rollback evidence and the final committed-receipt secrecy sweep; scratch substitutes are not closure evidence.
4. Refresh item 23 prose without misdiagnosing the prefix-compatible v2 line as a checklist failure.

All identified issues are reachable evidence, ordering or implementation corrections. I make no admission/rejection or runtime verdict, and do not recommend accepting a safety/provenance trade.

Tool installs/updates: none.

Report: .ufo/waves/round-52/w1/CritHarm.md
