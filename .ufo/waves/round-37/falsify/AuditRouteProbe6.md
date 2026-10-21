AUDIT RouteProbe6 anchors=3 false=3 overreverted=0 notice=bad verdict=refuted

Scope: `corpus/knowledge/route-probe-cluster.md`. Worktree = committed 5ceb8cd = HEAD a5d627b (`git status --short -- <note>` empty). History: 0614092 base (round-35 spot-check, 00:43) -> 91da27c round-36 state = lane base (02:50) -> 5ceb8cd round-37 restoration (03:14). Pin: `/fast/scratch/kumitate-r36/src` @ 31c465f15669f744848bd9f5d56191c5085670f7, tracked tree clean. Test (strict): the clause's own symbol token must appear as a whole word on the pinned line.

Group: `git diff 0614092 -- corpus/knowledge/route-probe-cluster.md` -> `1 file changed, 28 insertions(+), 26 deletions(-)`. 29 changed citations in document order: 25 `path:line` pairs from hunk line-pairs, plus 4 in the atomic-write row (restored as bare `66`/`66`, `66`/`66`, no path). `np.array_split(29 items, 8)[5]` = items 21-23.

| # | Clause (worktree) | Symbol | 0614092 | r36 91da27c | WT | Pinned line at WT | Symbol on WT line | Symbol on base line | Finding |
|---|---|---|---|---|---|---|---|---|---|
| 21 | fake-omp L195: `MODE` defaulting to "healthy" ... value (`:47`) | MODE | :31 | :47 | :47 | 47 = `const CATALOG = [` | no | no (31 holds the default; `const MODE` is 29) | FALSE, not reverted (WT = r36). Borrowed CATALOG's clause anchor. |
| 22 | fake-omp L198: `emit`/`emitRaw` (`:98`, `:98`) | emit | :95 | :95 | :98 | 98 = `function emitRaw(line) {` | no (word `emit` absent; line names `emitRaw`) | yes (95 = `function emit(obj) {`) | FALSE. Round-37 moved a TRUE anchor onto the next symbol. emitRaw's own `:98` is TRUE. |
| 23 | route-health L230: `**Persisted-health status** (interpretRouteHealth, scripts/probe-ufo-route-health.mjs:1015` | interpretRouteHealth | :1164 | :1164 | scripts/...:1015 | 1015 = `if (!row || typeof row !== "object" || Array.isArray(row)) {` (inside the fn starting 1008) | no | no (1164 is a comment inside `main()`) | FALSE (strict). Not restored to base. In-body, not on-symbol. |

- Restored-but-still-false: 21, 22, 23 (all three).
- Reverted a true improvement (symbol absent at base line): none.

Commands and outputs (pinned lines via `read` at the pin path):
1. `read .../scripts/fake-omp.mjs:29-31` -> `29 const MODE = (() => {`; `31 if (raw == null || raw === "") return "healthy";`
2. `read .../scripts/fake-omp.mjs:47` -> `47 const CATALOG = [`
3. `read .../scripts/fake-omp.mjs:95-98` -> `95 function emit(obj) {`; `96 emitRaw(JSON.stringify(obj));`; `98 function emitRaw(line) {`
4. `read .../scripts/probe-ufo-route-health.mjs:1008` -> `function interpretRouteHealth(row, { nowMs, expiresAtMs }) {`; `:1015` -> `if (!row || typeof row !== "object" || Array.isArray(row)) {`; `:1164` -> `// as health; the exit code reflects BOTH: 0 healthy+clean, 3 clean but` (inside `main`, 1157-1179)
5. `_grep` symbol sites in pin: `const MODE =` 29; `const CATALOG =` 47; `function emit(` 95; `function emitRaw(` 98; `function flushSession(` 174; `function interpretRouteHealth(` 1008; `function interpretPersistedHealth(` 1030; `export function redact(` 67 (probe-redact.mjs)
6. `git show <rev>:corpus/knowledge/route-probe-cluster.md`: 0614092 L193 `value (`:31`)...`, L196 `emit`/`emitRaw` (`:95`, `:98`), L228 `interpretRouteHealth`, `:1164`; 91da27c L193 `(`:47`)`, L196 `(`:95`, `:174`)`, L228 `:1164`; WT L195 `(`:47`)`, L198 `(`:98`, `:98`)`, L230 `scripts/probe-ufo-route-health.mjs:1015`.
7. `git diff 91da27c 5ceb8cd -- <note>` (citation pairs): MODE `:47` untouched; emit `:95`->`:98`; Persisted `:1164`->`scripts/...:1015`.

Over-reverts: 0. A revert counts only if round-36 had the symbol on its line and the base line lacks it. MODE: r36 `:47` already lacked MODE (no true improvement). interpretRouteHealth: r36 `:1164` = base (nothing shifted). emit: base and r36 are both `:95` (TRUE); WT moved it off, a regression counted under false, not over-revert.

Notice (line 2 of the note): present. Accurate: NO -> notice=bad.
- "Anchors ... reverted to the lines their 0614092 sentences named": FALSE. `git diff --stat 0614092 -- <note>` still shows 28+/26-, 29 citations differ from base. None of 31, 95, 1164 is at its WT line (47, 98, 1015).
- "treat line anchors here as at their base revision until then": FALSE for those 29.
- Pairing citations in `git diff 0614092 91da27c` (26 round-36 shifts) against `git diff 91da27c 5ceb8cd`: round-37 restored 16 to base; left 7 at their round-36 value (`:2-3`->`:72`, `:97`->`:108`, `:41`->`:49`, `:23`->`:51`, `:100`->`:39`, `:123`->`:140`, MODE `:31`->`:47`); moved 3 to a third value (`:39`->`:45`, `:939`->`:943`, `:1037`->`:1186`).
- Round-37 added deviations on lines round-36 never touched: `:678`->`:813`, `:1174`->`:1346`, `:1191`->`:1358`, `:30`->`:943`, `:110`->`:943`, `:67`->`:92`, `:95`->`:98`, `:1164`->`:1015`.
- "(spot-check D1)" appears only as an item name in `.ufo/waves/round-37/falsify-spec.json`; the D1 record was not audited.
- The mechanism ("moved them one symbol off") fits MODE (`:47` = CATALOG) and emitRaw (`:174` = flushSession), but the scope claim is false.

Boundary, not counted (for the integrator):
- Item 20 (group 5): `redact` `:67`->`:92`. Base TRUE (`read probe-redact.mjs:67` = `export function redact(value) {`). WT `:92` = `}` closing `parseJsonPayload` (75-92). Round-37 regression.
- Items 1-4 (group 1): atomic-write row reads "`66`/`66` and `66`/`66`" with no file path; unresolvable.
- Same Persisted-health sentence, `interpretPersistedHealth` `:1186` (unchanged from base, not in changed set): pinned 1186 = `}));`; function starts at 1030.

Residual risk and gaps:
- Partition convention: floor or ceil splits shift membership by one item (20-22 or 19-21). Item 20 is a true->false regression, so the verdict stays refuted under each.
- Checked at pin 31c465f1, not base revision 964f443e.
- claims-check and selftest not run (out of scope).
- Tooling: nothing installed; no package transactions; read-only except this report.
