source: S234 — HashiCorp Terraform, *Dependency Lock File (.terraform.lock.hcl)* (https://developer.hashicorp.com/terraform/language/files/dependency-lock, re-opened 2026-11-04); S238 — npm, *package-lock.json* (https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json, opened 2026-11-04); own-work — `scripts/proxy-check.mjs` O-source diff `1968689f..6d03402f`, `.ufo/pins/omp-shape.json`, `.ufo/waves/round-80/probe/probe80-c2.mjs`
verified-at: 2026-11-04, lane tip `509afb1d` — `OMP_AGENT_ROOT=/nonexistent node scripts/proxy-check.mjs` reads `PROXY: MATCH (… O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; source=snapshot)`, exit 0 (`.ufo/waves/round-80/w1/K80ScribeKnowledge/receipts/proxy-default.txt`); `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` reads `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0`, exit 0 (`.ufo/waves/round-80/w1/K80ScribeKnowledge/receipts/omp-compare.txt`); receipt sha256 equals `pin.omp-shape` (`.ufo/waves/round-80/w1/K80ScribeKnowledge/receipts/receipt-pin.txt`)
recheck: re-run both commands at the next lane tip; re-open S234/S238 if the lock-file wording changes (cadence 180d)

# Snapshot-bound derived scores

## The rule

A score derived from a **live, operator-owned surface** MUST read a committed, content-free snapshot of
that surface by default; MUST disclose the source (`source=snapshot` in the verdict tail,
`source: "snapshot"|"live"` in the JSON body); MUST pin the snapshot's bytes in the same block that pins
every other gate (`pin.omp-shape` in `kumitate-gate-pins-v1`); and MUST offer the live read as an explicit
opt-in (`--omp-live`) instead of falling back to it when the snapshot is absent. **Absence is
fail-closed.** The live-versus-snapshot comparison stays a separate, **non-scoring** diagnostic.

## Why (the source)

Both sources pin a resolved input in a committed file and re-derive from those bytes instead of following
the live upstream.

Terraform's dependency lock file exists for this shape: "Terraform remembers the decisions it made in a
dependency lock file so that it can (by default) make the same decisions again in future" (S234,
*Introduction*), and the file is meant to be committed — "You should include this file in your version
control repository" (S234, *Lock file location*). Trust in the pinned bytes is explicit: Terraform checks
packages against "the checksums it previously recorded in the lock file" (S234, *Checksum verification*).

npm states the re-derivation property directly: `package-lock.json` "describes the exact tree that was
generated, such that subsequent installs are able to generate identical trees, regardless of intermediate
dependency updates" (S238, *Description*), and each resolved entry carries an `integrity` field — "A sha512
or sha1 Standard Subresource Integrity string for the artifact that was unpacked in this location"
(S238, *integrity*) — so the snapshot is trusted through a hash of its content, not through the registry's
present state.

Neither source treats the pinned file as present-tense truth about the upstream: the lock records the
resolution that was made, and a later run re-derives **that** resolution. The lane's axis integer needs the
same property: a closure on another host must re-derive the same integer from committed bytes.

## The lane's instance

`coverage:omp` is derived from `O_members`, `O_findings` and `O_bound`; r76–r79 read `O_members` from the
live `~/.omp/agent` root. That root is operator-owned and moves between rounds (64 entries at r75/r78, 65
at r80 after `config.yml.pre-rebalance2-20261104` appeared). At the round-80 open the proxy read:

```
PROXY: DRIFT (C2_TOTAL_DRIFT declared=194 computed=195; O_MEMBERS_DRIFT declared=64 computed=65;
AXES_DRIFT coverage row=10 derived=9)
```

exit 1 (`.ufo/waves/round-80/open/base-receipts.txt`, the plan's measured open receipt; not re-run by this
seat). The axis integer flaked on an operator routing edit, and a closure on another host could not
re-derive it at all — the live read fails closed there.

Round 80 (`6d03402f`, `git diff 1968689f..6d03402f -- scripts/proxy-check.mjs`) makes the receipt the
default and the live root opt-in:

- `OMP_SHAPE_REL = '.ufo/pins/omp-shape.json'`; when neither `--omp-shape` nor `--omp-live`/`--omp-root`
  is given, `opts.ompShape = join(opts.self, OMP_SHAPE_REL)`.
- `--omp-live` is a new flag and is mutually exclusive with `--omp-shape`/`--omp-root` (exit 64).
- The JSON body always carries `source: opts.ompShape ? 'snapshot' : 'live'`, and the verdict tail appends
  `; source=snapshot` when a receipt is read.
- An absent default receipt fails closed with `OMP_SHAPE_NOT_FOUND` (exit 2), never a silent live read.
- `pin.omp-shape` is bound to the receipt path in the gate-pin table, so tampering fires `GATE_PIN_DRIFT`.

Observed at `509afb1d`: `OMP_AGENT_ROOT=/nonexistent node scripts/proxy-check.mjs` →
`PROXY: MATCH (… O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; src-rev=31c465f15669;
source=snapshot)`, exit 0. The committed receipt parses as `contract=kumitate-omp-shape-v1`,
`entries=65`, 6,716 bytes, sha256 `84e41b9f5167479f2d806686ee702db49d0ebd0a83e6bcb28bd444d50eb0c435`,
byte-equal to `SCORECARD.md:331 pin.omp-shape=84e41b9f…`. The non-scoring watch reads
`OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0`, exit 0.

## What the split costs, and the watch that pays for it

| surface | catches | scoring |
|---|---|---|
| proxy default (`source=snapshot`) | a receipt whose members violate the rules, a stanza that disagrees with the receipt, a tampered receipt (`GATE_PIN_DRIFT`) | yes |
| `node scripts/proxy-check.mjs --omp-live` | the live root's own count and rules, on demand | yes (explicit opt-in) |
| `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` | live drift against the receipt (`added/removed/changed`, SQLite transients classified) | no — a diagnostic, per the r78 design |
| SKILL checklist item (OMP shape receipt live comparison) | runs the compare every checklist pass | gates on the diagnostic, not on the score |

## Failure modes this rules out

- **Host-bound integer:** a score that cannot be re-derived from committed bytes is not a measurement a
  closure can verify; it is a reading of the host.
- **Silent live fallback:** an absent receipt that silently reads the live root re-introduces the flake
  and hides the absence; `OMP_SHAPE_NOT_FOUND` (exit 2) is the guard.
- **Unpinned snapshot:** a receipt whose bytes are not hash-pinned can be edited to fit the stanza;
  `pin.omp-shape` closes that (the counter's `receipt-pinned` arm).
- **Snapshot-as-truth:** treating the receipt as a statement about the host today. It is a capture-time
  claim; the present-tense question belongs to the non-scoring compare.

## Limits

The receipt is depth-1 shape only — member names, kind and mode — never file contents or configuration
values. A live member that appears between rounds is invisible to the **score** until the receipt is
re-captured; it is visible to the checklist's compare item. The receipt is re-captured in the round that
re-measures the axis, never silently.

## Gate

| source | URL | opened | located quote (≤25 words) | capture |
|---|---|---|---|---|
| S234 | https://developer.hashicorp.com/terraform/language/files/dependency-lock | re-opened 2026-11-04, HTTP 200, 312,690 bytes | "Terraform remembers the decisions it made in a dependency lock file so that it can (by default) make the same decisions again in future" (24 words; *Introduction*) | `.ufo/waves/round-80/w1/K80ScribeKnowledge/captures/terraform-dependency-lock.html` lines 13–15; sha256 b155ff6de62519b4233f53f1228338c742f7d8b09ca1b09c178fd91cfa0cb4dd |
| S238 | https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json | 2026-11-04, HTTP 200, 537,925 bytes | "It describes the exact tree that was generated, such that subsequent installs are able to generate identical trees, regardless of intermediate dependency updates." (23 words; *Description*) | `.ufo/waves/round-80/w1/K80ScribeKnowledge/captures/npm-package-lock.html` line 46; sha256 0fa22b199471adbb3c95dd85de12a582d9d8f5b3610ca95b22b117f37e694d50 |

S234's other two quotes are located at `.ufo/waves/round-80/w1/K80ScribeKnowledge/captures/terraform-dependency-lock.html` line 27 (*Lock file
location*) and line 49 (*Checksum verification*). S238's `integrity` quote is at line 110 of its capture.

Executed by this seat: the two commands above, the receipt parse/sha256, and the `pin.omp-shape` line read
(receipts `.ufo/waves/round-80/w1/K80ScribeKnowledge/receipts/proxy-default.txt`, `.ufo/waves/round-80/w1/K80ScribeKnowledge/receipts/omp-compare.txt`, `.ufo/waves/round-80/w1/K80ScribeKnowledge/receipts/receipt-pin.txt`). Not
executed by this seat: the frozen 12-arm counter, its base-tree control, the 68-member live fixture, and
`--selftest`; the after-state `held=12/12` is the measurement seats' receipt, not this entry's.

Draft status: alternate ground for `corpus/knowledge/snapshot-bound-derived-scores.md`; the live lane
carries a same-named entry grounded on S234 at `509afb1d`, which this draft re-verifies and extends with
S238. Ids proposed: S236, S237, S238 (this entry uses S238). See
`.ufo/waves/round-80/w1/K80ScribeKnowledge/COLLISION-CHECK.md`.
