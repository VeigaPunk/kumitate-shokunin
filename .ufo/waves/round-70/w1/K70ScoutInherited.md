# K70ScoutInherited — round-69 routed notes vs round-70 C1 claim

Scope: lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, read-only. Source: `corpus/lessons/round-69-verifier-spotcheck.md` "Routed defects / notes for the operator" items 1–6. Evidence: `.ufo/waves/round-70/build/K70ScoutInherited/evidence.txt`.

## Classification

| # | Routed note (round-69 verifier) | Status under round-70 C1 claim | Observed basis |
|---|---|---|---|
| 1 | Freeze-time `PLAN_BEFORE_READY: FAIL reason=MAP_DRIFT` (plan 9401d865, `uncovered:lessons/round-68-verifier-spotcheck.md`) | **Historical, not fixed.** Round-70 only freezes a new clean map (`base/freeze-map.txt` = `README_MAP: CLEAN files=169`). The round-69 gate result is not rewritten. | `round-69/close/gates.txt` still records `PLAN_BEFORE_READY: FAIL` for round 69; round-70 `base/freeze-map.txt` is CLEAN (exit 0). |
| 2 | Frozen `probe/c2-controls.sh` writes unused `/tmp/forge-sed.txt` contrary to scratch rule 7.4 | **Addressed by claim, but not yet landed.** Successor `scripts/control-replay.mjs` is specified to remove that unused fixed write in a private generated copy. The frozen source is left unchanged. The successor file is absent at HEAD. | `grep` finds the write only at `c2-controls.sh:80`; c1 has none. Frozen sha256 equals base 78b98d76 (c1 `01efd6dd…`, c2 `679b7d96…`). `scripts/control-replay.mjs` absent; no reference to `control-replay` in `scripts`, `.ufo/pins`, `SCORECARD.md`, `SKILL.md`. |
| 3 | Unsafe fixed-output replay overwrote two frozen receipts | **Addressed by claim, but not yet landed.** Contract: unique mkdtemp work dir, exclusive new `--out` file, R3–R7 digest preservation, R9 refusal on existing output. | Frozen receipts present in `.ufo/waves/round-69/controls/` (5 files). Base receipt `base/replay70-base.txt`: `REPLAY70_UNMET held=2/10 … exit=1`. Base shows R1 PASS and R9 PASS only; R2, R3–R8 and R10 are MISS because the successor tool does not exist yet. |
| 4 | Eight seats lack report files; result schema has no status/error fields | **Historical, not fixed.** Missing reports cannot be retroactively created; the claim does not touch the result schema. | `.ufo/reports/round-69/` absent; `round-69/w1/` holds 15 entries. Round-70 does not reconcile this. |
| 5 | `KIMI_CENSUS: DRIFT` for two unlisted host plugin paths | **Operator-owned, not fixed.** The round-70 plan does not touch host plugin paths. | Plan states no host/routing writes; no census change in round-70 freeze. |
| 6 | SHONEN box 3 `[ ]`; promotion is non-author/operator-owned | **Not fixed by this claim.** Non-author closure is explicitly outside the lane; no `[x]` is claimed here. | Plan: "Required non-author closure remains outside this lane." |

## Net

- Notes 2 and 3 are the only ones this claim targets. Both are fixed only by the private successor `scripts/control-replay.mjs`, which is **not yet present at HEAD `1e00955a`**. Until it lands and passes R1–R10 under the frozen counter, neither is fixed in the committed tree.
- Notes 1, 4, 5 and 6 are historical or operator/non-author-owned. Round-70 neither repairs nor claims them.
- No scope expansion proposed. The frozen counter, freeze commit `3dbe7e6e`, and frozen round-69 scripts/receipts are unchanged: `git diff --stat 78b98d76 HEAD -- .ufo/waves/round-69 scripts` is empty.

## Commands run (read-only)

- `git rev-parse --show-toplevel` → lane path.
- `git log --oneline -3` → `1e00955a`, `3dbe7e6e`, `78b98d76`.
- `git diff --stat 78b98d76 HEAD -- .ufo/waves/round-69 scripts` → empty.
- `sha256sum` on frozen c1/c2 and `git show 78b98d76:… | sha256sum` → identical.
- `grep -n '/tmp\|mktemp'` on frozen controls → single hit `c2-controls.sh:80`.
- `ls scripts/control-replay.mjs` → absent; `grep -rln control-replay …` → no matches.
- `cat base/replay70-base.txt`, `base/freeze-map.txt`, `round-69/close/gates.txt` (head), `ls .ufo/reports/round-69/` → as tabulated.

Not run: probes, counters, original `c1-controls.sh`/`c2-controls.sh`, fixture or scratch writes. Tools installed: none. Scratch used: none. Build artifact: `.ufo/waves/round-70/build/K70ScoutInherited/evidence.txt`.

Unknowns: whether the successor lands before close is unobserved; the seat-report accounting for round-70 is not reconciled here (other seats' outputs were not read).
