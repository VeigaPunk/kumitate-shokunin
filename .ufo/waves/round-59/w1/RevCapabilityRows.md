# RevCapabilityRows — round 59 / w1

Item: In `SCORECARD.md` capabilities table, confirm rows whose first cell is `receipt-evidence` and `cite-sources`, and that the `readme-map` row contains `v2` and `16/16` and does not contain `files=135`. Quote the three first cells. Axes: operability, coverage. Date: 2026-10-24.

**Item result: CORROBORATED.** This is not a claim verdict and it is not `REPAIR59_HELD`. On the score revision the capabilities section has exactly one row for each named first cell. The single `readme-map` row contains `v2` and `16/16` and does not contain `files=135`.

## Three first cells

Quoted from the extractor, cell text including the backticks the table stores:

- `receipt-evidence`
- `cite-sources`
- `readme-map`

Table order under `## Capabilities`: line 1790 `` `readme-map` ``, line 1791 `` `receipt-evidence` ``, line 1792 `` `cite-sources` ``. Each count is 1. No other backtick-prefixed row has one of those three first cells.

## Revision binding

`git rev-parse HEAD` and `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213` both printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`. `git status --porcelain --untracked-files=all -- SCORECARD.md` and `git diff --stat 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- SCORECARD.md` were empty. The worktree `SCORECARD.md` compared equal to `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:SCORECARD.md`. `git archive` of that path at that rev hashed to the same sha256 `1450fcd260c75173b70dbaa8a8830f91e57480b6857a15da5237d9f8cf09e050`. HEAD was not moved. The item does not name the base, so the subject is this revision.

## Assigned check — observed

cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Extractor: `node` `v26.12.0`, script `.ufo/waves/round-59/build/RevCapabilityRows/extract.mjs`. Captured `2026-10-24T21:34:33-03:00`. The predicate is the same string check as `repair59-probe.mjs` B4 (`startsWith('| `cite-sources` |')`, `startsWith('| `receipt-evidence` |')`, `includes('v2')`, `includes('16/16')`, and not `includes('files=135')`), applied to `git show <score-rev>:SCORECARD.md`. This seat did not execute the probe.

```console
worktree-equals-score-rev=true
ROW line=1790 inCapabilitiesSection=true firstCell="`readme-map`"
ROW line=1791 inCapabilitiesSection=true firstCell="`receipt-evidence`"
ROW line=1792 inCapabilitiesSection=true firstCell="`cite-sources`"
B4 cite=true receipt=true mapv2=true 16/16=true stale135=false ok=true
cite-sources-row-count=1
receipt-evidence-row-count=1
readme-map-row-count=1
FIRST receipt-evidence="`receipt-evidence`"
FIRST cite-sources="`cite-sources`"
FIRST readme-map="`readme-map`"
readme-map v2 index=306 context="ed` set of `.ufo/pins/readme-map.json` (v2; registry version 2); `uncovered` / `or"
readme-map 16/16 index=803 context="selftest` → `README_MAP_SELFTEST: PASS (16/16)` + `VERDICT: PASS`; `pin.readme-map` i"
readme-map files=135 ABSENT
readme-map files-tokens=["files=141"]
files=135-at-line=451 isReadmeMapCapRow=false inCapabilitiesSection=false
files=135-at-line=2707 isReadmeMapCapRow=false inCapabilitiesSection=false
files=135-line-count=2
ITEM_OK=true
```

Exit: `0`. Stderr: empty. `## Capabilities` is line 1771; the next `## ` heading is line 1799. The three rows sit in that section. The extractor's backtick rows inside the section are lines 1775–1779, 1783–1784, and 1786–1792 (no backtick row at 1785). The three named rows are 1790–1792. The file's header row for that section, read from the same bytes, is `| Capability | What it can now do | Evidence pointer | First-working round |` at line 1773. The probe filter is file-wide, not section-scoped: two other backtick rows (`coverage:script-layer` line 1597, `coverage:runtime-layer` line 1598) are outside the section. Neither is one of the three named cells.

`files=135` still occurs twice in this revision, at lines 451 and 2707. Neither line is the `readme-map` capability row.

## Bound that is not the item

The same extractor against base `0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f` printed `ITEM_OK=false`: `cite-sources-row-count=0`, `receipt-evidence-row-count=0`, `readme-map` first cell still `` `readme-map` ``, `v2` absent, `16/16` absent, `files=135` present on that row (`files-tokens=["files=135"]`), and `14/14` present. That shows the score-rev check is not a tautology. It is not the assigned subject.

The score-rev `readme-map` row still contains the substring `v1` inside `` `kumitate-gate-pins-v1` `` (index 870). The named item does not require `v1` to be absent. `14/14` is absent on that row. The version phrase on the score-rev row is `(v2; registry version 2)`; at the base it was `(version 1)`.

## Evidence and scope

Command index: `.ufo/waves/round-59/build/RevCapabilityRows/commands.md`. Primary capture: `extract.stdout` (sha256 `46e9abad6c95a1fb4be9ffc2dee7a20e26fc155b9bfacc470923c9030d7af417`), plus `extract.stderr`, `extract.exit`, `date.txt`, `head.txt`, `score-rev.txt`, `scorecard.status`, `scorecard.diffstat`. Method: `extract.mjs`.

This seat did not run `repair59-probe.mjs`, `doctrine59-probe.mjs`, `readme-map.mjs`, or `cite-sources.mjs`. It does not attest held counts. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. `git diff --cached --stat` and `git status --porcelain --untracked-files=no` printed nothing. Writes were confined to this report and `.ufo/waves/round-59/build/RevCapabilityRows/`. No install, pacman transaction, commit, push, or mutating git/jj command was used. No seat was dispatched.

Report: .ufo/waves/round-59/w1/RevCapabilityRows.md
