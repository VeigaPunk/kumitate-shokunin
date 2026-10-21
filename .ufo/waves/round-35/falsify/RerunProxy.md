ATTACK round-end-proxy-line verdict=holds defects=0
Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin (uncommitted round tree, base master 1770305f). Scratch: /fast/scratch/kumitate-r35/w/RerunProxy/. Every gate run passed `--src /fast/scratch/kumitate-r35/src` (read-only clone, detached at 31c465f1 — `git rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`). No tools installed (none needed; node v24.21.0 already present).

## 1. Round-end proxy line re-run (default / --json / --strict)

`node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` (lane worktree):

```
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10; S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match)
EXIT=0
```

Byte-identical to the round-end claim quoted in LOG.md:1608-1621 — every token matches: A=7, C=13, operability=8, C1=19/19, C2=79/79, coverage=10, S=88/88, coverage:script-layer=10, R=83/92, coverage:runtime-layer=9, K=51/51, coverage:kimi-layer=10, pins=6 match, plus the retained round-34 PIN_UNPINNED warning.

`--json`: `ok:true, verdict MATCH, errors 0, warnings 1`; computed terms equal the stanza's declared strings for all 17 TERM_KEYS; all six pins `match:true` (stanza line 283). `--strict`: exit 1, `PROXY: DRIFT (PIN_UNPINNED term=scripts/sources-check.mjs)` — the documented strict promotion (scripts/proxy-check.mjs:943-948, summarize promotes warn→exit 1). This is the gate's designed strictness, not round-35 drift: the same warning exists in the master baseline and the round-34 note declares `sources-check` deliberately outside the v1 23-key set (SCORECARD.md:325-333 correction block). The round-end claim quotes the default-mode line; MATCH at default + designed strict warn = no contradiction.

## 2. Cross-check against SCORECARD `## Axes` rows

- stanza (SCORECARD.md:283-303) declares A=7 C=13 C1=19/19 C2=79/79 S_members=88 S_sections=88 R_members=92 R_sections=83 coverage_script=10 coverage_runtime=9 C1k=5/5 K_members=51 K_sections=51 coverage_kimi=10 → equals computed terms exactly (AXES_DRIFT would fire otherwise; none fired).
- `## Axes` rows read as claimed: operability 8 (f_O 20/23 ≈ 0.870), coverage 10 (retired/saturated), coverage:script-layer 10 (`floor(10×8/8×88/88)`, S_members = 70 top-level + 18 nested at 31c465f1), coverage:runtime-layer 9 (11/11 × 83/92), coverage:kimi-layer 10 (5/5 × 51/51). Derived scores equal the rows; the gate verified this itself (compareAxes, no AXES_DRIFT).

## 3. Hand recompute of S_members and S8 from the pinned src

- `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` → 31c465f15669f744848bd9f5d56191c5085670f7 ✓ pin held.
- `ls /fast/scratch/kumitate-r35/src/scripts/*.mjs | wc -l` → **70**
- `find /fast/scratch/kumitate-r35/src/scripts -mindepth 2 -type f | wc -l` → **18**
- 70 + 18 = **88** = stanza `S_members=88` and the `## Axes` coverage:script-layer row's "70 + 18" — the member census is independently reproduced, not fitted.
- S8 census: `grep -c '^## `scripts/' corpus/knowledge/remaining-scripts-census.md` → **60** member sections, matching the S8 row's 60-member claim; `## Departed members (re-census 31c465f1, 2026-10-20)` at line 814 keeps the 5 departed members as history, as declared (C2: 63→60). S1–S7 = 28 live members (88 − 60), consistent with the S4/S7 row notes.
- K shape-only check (stat only, never content-read): `stat -c '%a %F %n' ~/.kimi-code/mcp.json` → `644 regular file` — presence + kind file confirmed; 0400-floor is the census's own minimum-band check, and KIMI_CENSUS CLEAN (members=51) is the L1's reading.

## 4. Mutation test: stale (master) stanza must fail the gate

Copied the whole round tree (`tar` excl. `.git`) to /fast/scratch/kumitate-r35/w/RerunProxy/ and reverted only the stanza's C2 pair to master values (`C2=79→77`, `C2_total=79→77` via edit on the copy; lane tree untouched). Master-tree stanza confirmed (master-tree SCORECARD.md:277-296: C2=77 C2_total=77, S_members=91 S_sections=91 K=50/50). Results in the copy:

```
PROXY  error  C2_DRIFT  C2: declared=77 computed=79 delta=+2
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=77 computed=79 delta=+2
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs ...
PROXY: DRIFT (C2_DRIFT ...; C2_TOTAL_DRIFT ...; PIN_UNPINNED ...)  EXIT=1   (--strict exit 1 too)
```

`--json`: `declared:"77"` vs `computed:79`, errors=2, exitCode=1. Running the copy's gate with cwd inside the copy and no `--self` still resolved `self=/fast/scratch/kumitate-r35/w/RerunProxy` and exited 1 — the gate measures the scorecard beside the script, not the agent's cwd. **The gate would have caught the stale master stanza: MUTATION_KILLS 1/1 for this target.** All other terms stayed MATCH, so the failure is attributable to the stanza mutation alone.

## 5. Hermetic suite (round-35 claim C1 rider)

`node scripts/proxy-check.mjs --selftest` → `PROXY_SELFTEST: 107/107 pass | VERDICT: PASS`, exit 0 (node v24.21.0). Case 15/16 are the distinct-derivation kills (duplicate-one/drop-one ⇒ S_SECTIONS_DRIFT / R_SECTIONS_DRIFT), cases 67 the strict PIN_UNPINNED promotion, cases 59/86 the frozen 23-key v1 grammar — all green.

## Residual risk / verification gaps

- [INFERENCE] The 0400-floor semantics of K1 were verified by the census tool, not re-derived here (only stat'd 644, kind file — the shape-only facts the proxy itself uses). No content ever read.
- [INFERENCE] The lane worktree is uncommitted; the round report cites a work-commit hash for the integrated tree. I verified the working tree's measured behavior directly (the thing the round-end line claims), not the commit object.
- The lane repo's own `considerthese/` directory was left unread (out of target scope).
- The C2 census (79 corpus rows) and K 51/51 live derivations are the L1's separate CLAIMS/KIMI_CENSUS gates, not this item's runs; only their proxy-term echoes were cross-checked here.

Verdict: holds. The round-end proxy line reproduces exactly (default and --json), matches the stanza and `## Axes`, the S_members/S8 census re-derives by hand at the pin, the hermetic suite passes 107/107, and the stale-stanza mutation is killed with the exact expected findings.
