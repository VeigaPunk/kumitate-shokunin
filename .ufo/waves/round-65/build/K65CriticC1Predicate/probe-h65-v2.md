# H65 v2 — hardening draft (round-65 C1 forgery response)

Status: DRAFT for the NEXT round (66). Rule H65 v1 is frozen and cannot change after scoring; this file is the
ratchet, not an edit of the frozen probe. Nothing here touches `probe/harm65-probe.mjs`.

Files: `probe-h65-v2-draft.mjs` (tested copy), `probe-h65-v2.diff` (4 hunks vs the frozen probe).
Tested on this host, same clone:

| revision | tool | v2 verdict | exit |
|---|---|---|---|
| 2ca91a0 (frozen) | honest `harm-matrix.mjs` | `HARM65_HELD held=5/5` | 0 |
| 3e9757 (replay forgery) | never runs a gate | `HARM65_UNMET held=0/5` — H1/H2/H3/H4/H5 all MISS | 1 |
| 8d387e (embedded forgery) | never runs a gate | `HARM65_UNMET held=0/5` — same four misses, fresh random ids | 1 |

No relaxation: the frozen 16 controls and H2's floor stay; held-out cases and the third H3 pair are additions.


## What the forgery proved

| forgery module | lines | check it defeats | why it works |
|---|---|---|---|
| `HARM_MATRIX_SELFTEST: PASS (20/20)` + exit 0 | 1 | H1 | H1 only regex-matches the line; it never reads the archived `harm-cases.json` (26 cases) nor the `CASE ok` lines. |
| answer-key replay: match the fixture's `gates.json` + base/tip trees against `.ufo/waves/round-65/controls/harm/*/spec.json`, print `expect` | 21 | H2 | the controls travel **inside the same archive the tool runs from**; the tool reads the key and never executes a gate. |
| 16-entry inlined table keyed by sha256(gates, base tree, tip tree) | +4 | H1/H2 after the key is hidden | the expects are public committed bytes, so a forger can inline them. |
| dispatch on `--base` prefix `a004902d` / `6825a514` | 9 | H3 | the counter hands the tool exactly its two hardcoded pairs, so a 9-line table answers both. No third pair, no per-gate cross-check. |
| `HARM_MATRIX: CLEAN gates=15 … harm=0` + exit 0 for every other pair | 2 | H5 | H5 derives `bad` from the tool's own summary numbers; there is no requirement that the summary match printed rows or the registry. |

## The four hunks

1. **H1 cross-check** (~5 lines). Read `<archive>/scripts/harm-cases.json`; require the PASS count to equal
   `cases.length` and require a `CASE ok <id>` line for every case id. `PASS (20/20)` dies against 26 cases.
   Honest tool prints `PASS (26/26)` with 26 `CASE ok` lines.
2. **H2 held-out cases** (~25 lines). After the 16 frozen cases, generate 8 fixtures in memory with random gate ids
   and random verdict words (HELD / HARM / REPAIRED / NEW_OK / ABSENT_BOTH+HELD / CARRIED_MOVED), expects computed
   by construction. No answer key exists on disk, so neither replay nor an inlined table can answer; the only way to
   pass is to execute the fixture gate. H2's frozen floor (>= 14 controls) is untouched — the held-out cases are
   additional and all 8 must pass.
3. **H3 measured third pair** (~12 lines). Sample 10 recent revisions (`rev-list --max-count=10 --all`), run
   `readme-map` directly at each, pick a pair whose direct readings differ, then require the tool's `--only readme-map`
   row to be `HARM` (base clean, tip dirty) or `REPAIRED` (base dirty, tip clean). The pair is not in any table.
4. **H5 self-consistency** (~9 lines). Read the registry ids from `<archive>/scripts/harm-matrix-gates.json`; require
   every id printed exactly once, `gates` == printed rows minus `ABSENT_BOTH`, and `harm`/`harm_absent`/`new_red` ==
   the counts of the printed rows. A summary with zero rows (or 15 invented gates) dies.

## Optional, only cost-raising

Sanitize the tool's tree: `cp -a A A2 && rm -rf A2/.ufo`, run the tool from `A2`. Measured: the replay forgery drops
to 0/16 fixtures (ENOENT crash); the embedded forgery still scores 16/16. So sanitizing is **not** a substitute for
hunk 2 — it only removes the cheapest variant.
