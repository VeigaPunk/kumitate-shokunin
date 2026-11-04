source: S228 — Terraform plan, Other Options, -detailed-exitcode — https://developer.hashicorp.com/terraform/cli/commands/plan#detailed-exitcode; local contract: .ufo/waves/round-78/plan.md § C2 and scripts/omp-census.mjs --compare
verified-at: 2026-11-04 (lane freeze ad2630d0566a561ee078f47fade5644a22c10621; current, unversioned Terraform documentation opened on this date, not an installed Terraform version)
recheck: `bash -o pipefail -c 'curl -fsSL --max-time 60 https://developer.hashicorp.com/terraform/cli/commands/plan | sha256sum'`; compare with capture `.ufo/waves/round-78/build/K78ScoutOpen/terraform-plan.html`, sha256 a501ef22dec9e3c0bd05ffc7082b0f6a84abf5a96d1c6199a02223b74b207cca

# Shape receipt: capture-time proof versus live drift

A shape receipt preserves the names, kinds and modes the capture recorded. An offline census can re-derive a decision about that recorded shape without opening the live root. This is capture-time evidence, not a present-tense assertion that the root has stayed unchanged. Nor does a receipt alone establish the capture's authenticity, content integrity, or application behavior. These are limits of the local receipt contract, not claims sourced to Terraform.

The consumer is a closure running later than the capture. It needs a fresh observation rather than a stronger interpretation of old evidence. The round-78 local diagnostic is:

```text
node scripts/omp-census.mjs --compare FILE [--root DIR]
OMP_SHAPE_COMPARE: IN_SYNC|DRIFT entries=<live> receipt=<n> added=<a> removed=<r> changed=<c> first=<name>
```

The line is a contract template, not a captured execution result. Added and removed refer to names present on only one side; changed refers to a shared name with a different kind or mode. The diagnostic is count-only apart from the first differing name: no member content is read or printed. A content-only change is outside its universe, even when it reads IN_SYNC.

| Exit | Local reading | Closure meaning |
|---|---|---|
| 0 | IN_SYNC | Compared shape agrees at observation time. |
| 1 | DRIFT | Comparison completed and found a shape difference. Drift is a first-class result, not a comparison failure. |
| 2 | Fail-closed | No usable comparison: for example, malformed or absent receipt, or a live root that is not a directory. |

This is non-scoring: no proxy term depends on the comparison. The snapshot and offline shape modes retain their separate purpose; observing live drift does not rewrite a receipt or alter coverage arithmetic.

## Gate

S228 was opened on 2026-11-04 at https://developer.hashicorp.com/terraform/cli/commands/plan#detailed-exitcode, Other Options → -detailed-exitcode, third exit-code bullet. Exact quote (8 whitespace words): “2 = Succeeded with non-empty diff (changes present)”. The capture digest above was reproduced on this date by `curl -fsSL --max-time 60 https://developer.hashicorp.com/terraform/cli/commands/plan | sha256sum`; the stored capture was hashed with `sha256sum .ufo/waves/round-78/build/K78ScoutOpen/terraform-plan.html` from the lane root.

**Do not transfer the numeric mapping.** Terraform documents 0 for success with an empty diff, 1 for error, and 2 for success with a non-empty diff. The local diagnostic deliberately uses 0 for in sync, 1 for drift and 2 for fail-closed. S228 supports distinguishing a successful comparison with differences from an execution error; it does not document this tool or endorse its numeric contract. No Terraform command was executed here.

Admission status: text draft. The source was opened and hashed; the local behavior above is the frozen round-78 contract, not this seat's execution evidence. Q6 cite-check and integrated gates remain the L1's responsibility.

## Limits

The receipt is host-bound and the comparison needs the intended live root. A valid receipt already stale at capture reads DRIFT against that same root if the discrepancy remains at comparison time; mere age is not a drift signal. IN_SYNC establishes equality of the compared shape, not historical freshness. Changes during observation are not a demonstrated atomic-snapshot guarantee. UNKNOWN: the integrated claim's measured verdict; this entry supplies no probe result. Scope is orchestration/tooling evidence consumption, not Terraform infrastructure operation.
