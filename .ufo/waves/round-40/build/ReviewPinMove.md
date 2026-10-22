RESULT ReviewPinMove rev=working-copy verdict=approve detail=pin move is path-only; pin clone at rev, clean, a-w, tree-identical to r39 closure clone; all four pin gates resolve and validate the new path identically, proved live

Item: R39-8 review. The L1 changed .ufo/pins/origin.json in the working copy; reviewed against f69817edf687c8ce4f87ed7953a353399232f69e.

Checks, all pass:

1. Revision unchanged. Both versions carry contract `kumitate-origin-pin-v1`, repo `ufo-fsd-alpha`, revision `31c465f15669f744848bd9f5d56191c5085670f7`. `diff <(git show f69817ed...:.ufo/pins/origin.json) .ufo/pins/origin.json` shows exactly three changed lines: `clone`, `recreate`, `verified_at` (2026-10-21 -> 2026-10-22).

2. Recreate command is the old one with only the path changed. The diff hunk is character-identical except the clone path substring, which changes in all three of its occurrences (clone target, `git -C`, `chmod -R`): `git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/hyaku/kumitate-pin/src && git -C /fast/scratch/hyaku/kumitate-pin/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/hyaku/kumitate-pin/src`.

3. Clone at the pin, clean, read-only. `git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD` -> `31c465f15669f744848bd9f5d56191c5085670f7` (== pin); `git status --porcelain` empty. Read-only is enforced on the filesystem: `stat` gives `dr-xr-xr-x vgpnk:vgpnk` for both `src` and `src/.git`, `test -w` fails, and `find /fast/scratch/hyaku/kumitate-pin/src -writable -print -quit` returns nothing across the whole tree — exactly what the recreate command's `chmod -R a-w` produces.

4. Byte-identical in tree to the r39 closure clone. `git -C /fast/scratch/hyaku/kumitate-pin/src ls-tree -r HEAD | sha256sum` and `git -C /fast/scratch/hyaku/kumitate-r39/src ls-tree -r HEAD | sha256sum` both give `0ebe866a2dba3e00039c789dd6a9f218c794e70293b25014a28f18ddafffd6cb`; the closure clone is also at `31c465f15669f744848bd9f5d56191c5085670f7` and clean, so both worktrees are byte-identical.

5. Every pin-reading gate validates the path the same way. `grep -i "origin\.json" scripts/` finds exactly four consumers: anchor-truth.mjs, claims-check.mjs, proxy-check.mjs, surface-probe.mjs. A repo-wide grep for `kumitate-origin-pin-v1|pins/origin` finds no further script (remaining hits are .ufo/waves reports and docs). All four: contract must equal `kumitate-origin-pin-v1`, revision must be 40 hex, clone non-empty; src = `--src`, else `pin.clone`; src must be a directory; `git rev-parse HEAD` (env-stripped child, GIT_OPTIONAL_LOCKS=0) must equal pin.revision, else fail-closed exit 2 (`SRC_NOT_A_DIR` / `SRC_REV_UNVERIFIABLE` / `SRC_REV_MISMATCH`). No gate hardcodes either path. anchor-truth.mjs:449-457, claims-check.mjs:181-200, proxy-check.mjs:409-428, surface-probe.mjs:1753-1777 + 192-205.

Live proof — my scratch clone `/fast/scratch/hyaku/kumitate-r40/seats/ReviewPinMove/lane` at f69817edf687c8ce4f87ed7953a353399232f69e with the working-copy origin.json copied over `.ufo/pins/origin.json`; bare runs, no `--src`, so every gate resolved src from `pin.clone` (the new path):

- `node scripts/anchor-truth.mjs` -> `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 src-rev=31c465f15669)`, exit 0 (also confirms the C1 round-open premise: the floor reads CLEAN).
- `node scripts/proxy-check.mjs` -> `PROXY: DRIFT (... src-rev=31c465f15669)`, exit 1, with the declared round-open rows: `C2_total: declared=88 computed=89`, `coverage: ## Axes row=10 derived=9`, `coverage:kimi-layer: ## Axes row=10 derived=9` (2 AXES_DRIFT) plus `K_members 51 vs 52` and 2 PIN_UNPINNED warns — matches the declared open state, no new drift from the move.
- `node scripts/claims-check.mjs` -> `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)`, exit 0.
- `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json` -> header `src=/fast/scratch/hyaku/kumitate-pin/src`, `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)`, exit 0.

Residual risk / notes (not defects in this change):

- The committed tree f69817ed still carries the old path `/fast/scratch/kumitate-r36/src`, which no longer exists (`stat`: No such file or directory), so every bare gate run at the open revision fails closed until this working-copy change is committed. The change under review is exactly that fix; it must land in this round's commit, or bare gate runs regress to fail-closed and the checklist needs explicit `--src` everywhere.
- Pre-existing documented asymmetry: anchor-truth.mjs fail-closes when origin.json is absent (`ORIGIN_PIN_MISSING`, pin mandatory), while claims/proxy/surface treat an absent default pin file as "no pin" (portability clause in their headers). That is a missing-file policy difference, not a path-validation difference; with the pin present, as here, all four resolve and validate identically.
- No tools installed or upgraded; nothing to record under the tooling directive.
