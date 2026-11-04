author: kumitate L1 (draft by K78ScribeDocs)
round: 78

# Round 78 — one K decision and live-vs-receipt OMP comparison

Axes: coverage:kimi-layer + operability. Frozen authority: `.ufo/waves/round-78/plan.md`, scaffolding `ad2630d0566a561ee078f47fade5644a22c10621`; base `0b4df07b6f7478e7db6afb6852c418e096663c3c`. This is a skeleton, not an admission record. Measured revision and verdicts: <MEASURED>.

## Gate

- **Proposed admit — S228, HashiCorp Terraform `terraform plan` command reference**, primary docs, URL https://developer.hashicorp.com/terraform/cli/commands/plan#detailed-exitcode; accessed 2026-11-04. Located under `Other Options`, option `-detailed-exitcode`, after “provide more granular information about what the resulting plan contains”. Verbatim short quotes, whitespace counts excluding list bullets: “0 = Succeeded with empty diff (no changes)” (8); “1 = Error” (3); “2 = Succeeded with non-empty diff (changes present)” (8). The three lines total 19 words, below 25. Provenance: page read by this scribe; raw HTTP headers/bytes/hash and committed capture are owned by `.ufo/waves/round-78/build/K78ScoutOpen/source-s228.md` and `terraform-plan.html` (fill from that seat's actual receipt, not this draft). Registry row/capture pin/admission: <MEASURED>.
- Grounds the distinction between no differences, differences, and evaluation errors, not the lane's numeric exit mapping. Terraform uses 0/2/1; this lane deliberately uses 0 IN_SYNC / 1 DRIFT / 2 fail-closed. Do not quote the source as assigning this lane's numbers. Used-by target: `corpus/knowledge/shape-receipt-live-drift.md`.
- Source registry changes, rejection/reopen dispositions and fleet source sweep: <L1 SOURCE SWEEP>. No registry mutation was made by the scribe.

## Mistakes

One mined mistake is required; use the L1's completed sweep, not a manufactured example.

| class | evidence | captured-by / missing criterion | fix |
|---|---|---|---|
| <L1 CLASS> | <L1 EXACT RECEIPT AND LOCATED QUOTE> | <L1 RULE OR NONE> | <L1 LANDED FIX AND POINTER> |

## Counters

Frozen counters (do not edit):

| claim | command from lane root | sha256 | admission target | measured before → after / receipt |
|---|---|---|---|---|
| C1 | `node .ufo/waves/round-78/probe/probe78-c1.mjs --set c1` | `aa00be37a46afdf02b68f47ed774094eb9297dbc5707089313e2915da9e652cf` | `C78_C1: HELD held=12/12`, exit 0 | <MEASURED> |
| C2 | `node .ufo/waves/round-78/probe/probe78-c2.mjs --set c2` | `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460` | `C78_C2: HELD held=11/11`, exit 0 | <MEASURED> |

The scribe observed these digests using `sha256sum` on the frozen probe paths; it did not execute either counter. Carry over exact base/stub outcomes from `controls/c1-base.txt`, `c1-stub.txt`, `c2-base.txt`, `c2-stub.txt` and bind after-state receipts to the measured revision. Clean K expectation is `55/55`, `K_findings=0`, score 10; mode violation expectation is `K_findings=1`, score 9. Record actual terms, A/C/map counts, census start/end, and changed pins: <MEASURED>.

## Limits

- A missing K member changes both the live member count (the denominator) and the finding count: frozen missing-region expectation is `K_members=54 K_findings=1`, score 9. This is a double-penalty characteristic of the declared formula, not a new independent family-coverage measurement. Do not silently replace it with a fixed denominator or deduplicate findings by member.
- `--compare` is host-bound: a pinned receipt describes capture-time shape; another host or later root may legitimately drift. Reading IN_SYNC requires the matching live root, unlike `--shape` offline replay. Names/kinds/modes only; no content freshness or semantic identity is certified.
- Comparison is count-only and non-scoring. The frozen plan preserves snapshot/shape behavior and every O proxy term; C2 does not refresh the receipt, repair drift, or change a score.
- These are target-shape drafts. At scribe inspection the lane still had `K_MEMBER_RULES`, no exported K decision and no comparison option. Integration and final measurements remain L1-owned; no passing outcome is inferred from planned contracts or seat registrations.
