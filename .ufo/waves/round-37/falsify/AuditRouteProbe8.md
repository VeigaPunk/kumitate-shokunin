AUDIT RouteProbe8 anchors=0 false=0 overreverted=0 notice=ok verdict=partial

Audited state: `corpus/knowledge/route-probe-cluster.md` blob `512ed82` at lane HEAD `ea63c4e` (worktree clean). The lane moved during this audit: `5bc40d0` (03:31) reset the note to its 0614092 bytes, `c589b38` (03:34) rewrote the notice, then HEAD advanced to `1f72f3d` and `ea63c4e` with the note blob unchanged. The state I was dispatched against, `e529214` (HEAD `86c0676`), is scored in section 4: refuted.

## 1. Group 8/8 at the audited state

| group | changed anchors vs 0614092 | false at pin | overreverted (in group) |
|---|---|---|---|
| 8/8 (last eighth) | 0 (set is empty) | 0 | 0 |

Commands and output:
- `git -C <lane> diff --numstat 0614092 HEAD -- corpus/knowledge/route-probe-cluster.md` → `1	0	corpus/knowledge/route-probe-cluster.md`
- `git -C <lane> diff -U0 0614092 HEAD -- <note> | grep '^[-+][^-+]'` → only the inserted notice line.
- `python3 audit2.py current` → `content lines differing base->HEAD after dropping the inserted notice: 0` / `changed anchor tokens vs base = 0`.

## 2. Notice (line 2, blob 512ed82)

Present: yes. Text: "Round-37 restoration (2026-10-21; final, amended by AuditRouteProbe1/2/6). This note is reset to its 0614092 bytes: the round-36 shift-repair is removed, so no anchor here is a round-36 artifact. Pre-existing anchors that were already false at the pin remain as ratcheted fidelity debt; re-verification against the pin is owed. Do not claim this note as pin-true."

- "reset to its 0614092 bytes": TRUE (numstat 1/0 above).
- "no anchor here is a round-36 artifact": TRUE for the text. `audit2.py current` reports 25 round-36 lines that now equal base.
- "remain as ratcheted fidelity debt": NOT REPRODUCED. `.ufo/pins/fidelity-ratchet.json`, `notes["corpus/knowledge/route-probe-cluster.md"]` = 23 (ratchet sum 200 = total). The round-35 per-anchor table `.ufo/waves/round-35/evidence/fidelity-anchors-final.tsv` (pin 31c465f1) has 82 rows for this note: 49 with hit31c=0, 36 of those with a parsed symbol. The gate also mis-parses rows: line 148 `:100` and line 196 `:95` are marked 0 although `process.exit(2);` and `function emit(obj)` sit on the cited pinned lines.
- "re-verification owed" / "do not claim pin-true": honest.
- Omission: the notice does not disclose that the reset discards 7 round-36 anchors that were true at the pin (section 3).

Notice verdict: ok on scope. The debt count is unreconciled (gap, section 6).

## 3. Reverts of true improvements, note-wide

Command: `python3 audit2.py current` → `SUMMARY current: overreverts=7 restored_base_true=10 neutral=9`.

Overreverts: round-36 value TRUE at the pin, base line FALSE, HEAD now base.
- persistState: r36 `probe-ufo-route-health.mjs:1073` HIT (`function persistState(`) → base `:1080` miss (`const document = {`)
- PROBE_CONCURRENCY: r36 `:65` HIT (`const PROBE_CONCURRENCY = 8;`) → base `:61` miss (`];`)
- mapPool: r36 `:775` HIT (`async function mapPool(`) → base `:784` miss (`};`)
- assertNoSecrets (route-health): r36 `:932` HIT (`function assertNoSecrets(value) {`) → base `:939` miss (`throw new Error("refusing to emit credential-shaped route-health output");`)
- session_truncated: r36 `:897` HIT (`failureClass = "session_truncated";`) → base `:904` miss (`facts.errorMessage,`)
- interpretPersistedHealth: r36 `:1030` HIT (`function interpretPersistedHealth(`) → base `:1037` miss (`const observedAtMs = Date.parse(state.observedAt);`)
- authorization header: r36 `:72` HIT only inside the `CREDENTIAL_SHAPE` regex literal (weak) → base `:2-3` miss (header comment)

Restored, base TRUE and round-36 FALSE, HEAD now correct: ROUTE_TIMEOUT_MS `shared:23`, kimi not-configured exit `kimi:100`, kimi some() `kimi:123`, writeVerdict `models:40`, openTmpExclusive `models:66`, COMPILED_REDACT_PATTERNS `redact:33`, MODE default `fake-omp:31`, catalogHasRoute `fake-omp:60`, emitRaw `fake-omp:98`, fake-omp-session `fake-omp:177`.

Net against round-36: 10 restored, 7 overreverted. These sit outside any eighth because the changed-anchor set is empty, so no group auditor covers them.

## 4. Superseded state e529214 (dispatch), group 8/8 scored

Command: `python3 audit2.py historical` → `GROUP 8 (items [25, 26, 27, 28]): false=4 of 4`, `BOUNDARY (items 23-24): false=2 of 2`, `ALL CHANGED TOKENS: true=1 of 28`.

| # | sentence symbol | base | round-36 | round-37 restored | pinned line at round-37 value | result |
|---|---|---|---|---|---|---|
| 25 | CATALOG_COMMAND (kimi/models posture) | shared:20 TRUE | shared:20 | `:84` | shared:84 `export function probeListedModel(`; kimi:84, models:84, rh:84 also miss | FALSE, base TRUE regressed |
| 26 | runOmpCatalog (kimi/models posture) | shared:51 TRUE | shared:51 | `:84` | same as 25 | FALSE, base TRUE regressed |
| 27 | spawnSync("omp") (shared posture) | shared:51 (fn header; spawnSync at :52) | shared:51 | `:84` | same as 25 | FALSE |
| 28 | PROBE_CONCURRENCY (concurrency row) | rh:61 FALSE (`];`) | rh:61 | `rh:784` | rh:784 `};` (PROBE_CONCURRENCY is at :65) | FALSE, base also false |
| 23* | spawnCollect call site (route-health posture) | rh:813 FALSE | rh:813 | `rh:813` | `"--no-title",` (call is at :804) | FALSE |
| 24* | spawnCollect def (route-health evidence) | rh:678 FALSE | rh:678 | `rh:813` | `"--no-title",` (def is at :669) | FALSE |

*Boundary: in group 8 only under a line-based eighth. Checked regardless.

- Overreverts in group 8: 0. Round-36 equals base on all six rows.
- Notice at e529214 ("Anchors in this note were reverted to the lines their 0614092 sentences named"): FALSE. 28 changed tokens: 21 are new round-37 values, all FALSE at the pin; 7 round-36 values kept (6 FALSE, `:72` TRUE).
- Verdict for e529214: refuted (restored-but-false anchors; notice misstates scope).
- Coverage: the round-35 table has one row at line 300 or later (max noteLine 366). No row covers the posture and concurrency table at lines 309–346, so those anchors were never gate-checked.

## 5. Commands and artifacts

- `python3 /fast/scratch/kumitate-r37/AuditRouteProbe8/audit2.py current|historical`; outputs `audit2.current.out`, `audit2.historical.out` in the same folder.
- Pinned tree: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`; `git status --short` empty (clean).
- Snapshots in `snap/`: `note.HEAD.md` (512ed82), `../note.cur.md` (e529214), `../note.base.md` (1146985), `../note.r36.md` (7995f9f).
- No installs, no package transactions, no REA calls, no lane writes except this report.

## 6. Verification gaps

- Ratchet 23 versus the per-anchor table's 49 false rows (36 with a parsed symbol): not reconciled. The round-37 gate may differ from the round-35 gate; I did not run it.
- I did not verify the attribution "amended by AuditRouteProbe1/2/6" or the cause "round-36 shift-repair moved them one symbol off (spot-check D1)".
- I did not classify every base anchor against the pin. The pre-existing debt count is unverified beyond the round-36-touched and round-37-touched anchors.
- HEAD moved three times during this audit. Findings bind to blob 512ed82 and blob e529214 only.
