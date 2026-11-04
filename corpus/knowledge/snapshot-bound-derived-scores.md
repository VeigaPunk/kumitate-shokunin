source: S234 — HashiCorp Terraform, *Dependency Lock File (.terraform.lock.hcl)* (https://developer.hashicorp.com/terraform/language/files/dependency-lock, opened 2026-11-04); own-work — `scripts/proxy-check.mjs` default O source, `.ufo/pins/omp-shape.json`, `.ufo/waves/round-80/probe/probe80-c2.mjs`
verified-at: 2026-11-04, lane tip `6d03402f` — `node scripts/proxy-check.mjs` → `PROXY: MATCH (… O_members=65 … source=snapshot)` with `OMP_AGENT_ROOT=/nonexistent`; `node .ufo/waves/round-80/probe/probe80-c2.mjs --set c2` → `C80_C2: HELD held=12/12`
recheck: re-run the counter and `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` at the next lane tip; re-open S234 if the lock-file page's "remember the decisions" wording changes (cadence 180d)

# Snapshot-bound derived scores

## The rule

A score derived from a **live, operator-owned surface** MUST read a committed, content-free snapshot of
that surface by default, MUST disclose the source (`source=snapshot` in the verdict, `source:
"snapshot"|"live"` in the JSON body), MUST pin the snapshot's bytes in the same block that pins every
other gate (`pin.omp-shape` in `kumitate-gate-pins-v1`), and MUST offer an explicit live mode
(`--omp-live`) rather than fall back to the live root when the snapshot is absent. Absence is
fail-closed. The live-vs-snapshot comparison stays a **separate, non-scoring diagnostic**.

## Why (the source)

Terraform's dependency lock file exists for exactly this shape of problem: "Terraform remembers the
decisions it made in a dependency lock file so that it can (by default) make the same decisions again in
future" (S234, *Introduction*), and the file is meant to be committed: "You should include this file in
your version control repository" (S234, *Lock file location*). Terraform also verifies that each package
matches a recorded checksum (S234, *Checksum verification*) — the snapshot is trusted only through its
bytes.

## The lane's instance

`coverage:omp` is derived from `O_members`, `O_findings` and `O_bound`, and r76–r79 read `O_members`
from the live `~/.omp/agent` root. That root is operator-owned and moves between rounds: 64 entries at
r75/r78, 65 at r80 after `config.yml.pre-rebalance2-20261104` appeared. At round-80 open the proxy read
`O_MEMBERS_DRIFT declared=64 computed=65` and `AXES_DRIFT coverage row=10 derived=9`
(`.ufo/waves/round-80/open/base-receipts.txt`) — the axis integer flaked on a routing edit, and a
closure on another host could not re-derive it at all (the live read fails closed there).

Round 80 makes `.ufo/pins/omp-shape.json` the default O source, re-captures it at 65 members
(`OMP_SNAPSHOT: WROTE entries=65 sha256=84e41b9f…`), re-pins it, and moves the live read behind
`--omp-live`. The score now re-derives offline: `HOME=<empty> OMP_AGENT_ROOT=/nonexistent` still reads
`PROXY: MATCH` (`source=snapshot`), while `--omp-live` against a 68-member fixture reads
`O_members=68` and DRIFTs.

## What the split costs, and the watch that pays for it

The live root no longer fails the proxy. That is the trade, and it is bounded by a named watch:

| surface | catches | scoring |
|---|---|---|
| proxy default (`source=snapshot`) | a receipt whose members violate the rules, a stanza that disagrees with the receipt, a tampered receipt (`GATE_PIN_DRIFT`) | yes |
| `node scripts/proxy-check.mjs --omp-live` | the live root's own count/rules, on demand | yes (explicit) |
| `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` | live drift against the receipt (`added/removed/changed`, SQLite transients classified) | no — a diagnostic, per the r78 design |
| SKILL checklist item (OMP shape receipt live comparison) | runs the compare every checklist pass | gate on the diagnostic, not on the score |

An honest limit: a live member that appears between rounds is now invisible to the **score** until the
receipt is re-captured; it is visible to the checklist's compare item. The receipt is re-captured in the
round that re-measures the axis, never silently.

## Failure modes this rules out

- **Host-bound integer:** a score that cannot be re-derived from committed bytes is not a measurement a
  closure can verify; it is a reading of the host.
- **Silent live fallback:** an absent receipt that silently reads the live root re-introduces the flake
  and hides the absence — the fail-closed arm (`OMP_SHAPE_NOT_FOUND`, exit 2) is the guard.
- **Unpinned snapshot:** a receipt whose bytes are not hash-pinned can be edited to fit the stanza;
  `pin.omp-shape` closes that (arm 4).
