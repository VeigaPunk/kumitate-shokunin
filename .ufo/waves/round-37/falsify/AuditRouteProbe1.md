AUDIT RouteProbe1 anchors=4 false=4 overreverted=0 notice=bad verdict=refuted

| # | W line | sentence symbol | B 0614092 → pin 31c465f | R 3d5760a | W restored → pin | verdict |
|---|---|---|---|---|---|---|
| 1 | 89 (atomic row) | `persistState`, durable write inlined | `probe-ufo-route-health.mjs:1080` → L1080 `const document = {`. Definition is L1073 → false | 1080 | `66`, no file → rh L66 blank; models L66 `function openTmpExclusive(tmp)` → false | FALSE (non-base, file-less) |
| 2 | 89 (atomic row) | pid-timestamp tmp | `:1117` → L1117 `} finally {`. Tmp template is L1110 → false | 1117 | `66` → rh L66 blank → false | FALSE (non-base, file-less) |
| 3 | 89 (atomic row) | `writeVerdict` | `probe-token-plan-models.mjs:40` → L40 `function writeVerdict(verdict) {` → **true** | 40 | `66` → models L66 `function openTmpExclusive(tmp)` → false | FALSE; round-37 broke a true base anchor |
| 4 | 102 | HTTP `Authorization` header construction | `probe-ufo-route-health.mjs:2-3` → L2–3 header comments (SQLite/token clause only) → false | 72 | `:72` → L72 `const CREDENTIAL_SHAPE = /(?:authorization\|proxy-authorization)…/` (detector, token only) → false (judgement) | FALSE |

**Partition.** `git diff 0614092` changes 28 anchor positions in document order (atomic row 3, others 25). The atomic row's 4th token `66` is textually unchanged (`probe-token-plan-models.mjs:66` → `66`), so it is excluded. It is TRUE at pin (L66 `openTmpExclusive`); if you count it, use anchors=5 and keep false=4. Group 1/8 = positions 1–4 (sizes 4,4,4,4,3,3,3,3). Groups 2–8 not audited.

**Overreverted in group = 0.** R = B for #1–#3 (round-36 never shifted the atomic row). #4 was not reverted: W = R = 72.

**#4 judgement.** `authorization` on L72 sits inside `CREDENTIAL_SHAPE`, a detector that refuses credential-shaped output. It constructs no header, so it cannot carry "never constructs". Counting bare case-insensitive token matches instead gives false=3.

**Restoration state.** W = 5ceb8cd = HEAD 86c0676 = working tree (`git diff HEAD` on the note is empty). The restoration is already committed; the lane's "uncommitted" premise is stale for this note.

**Round-37 notice (L2–3).** Present: yes. Accurate: **no**.
- "Anchors … were reverted to the lines their 0614092 sentences named": over the 28 positions, 2 carry base numbers (both file-qualifier additions on `:1015` and `:813`); 7 still carry the round-36 number unchanged (`:72 :108 :49 :51 :39 :140 :47`); 19 carry numbers in neither (e.g. `:943` for shared `assertNoSecrets` in a 159-line file; `:1346`, `:1358` in a 1188-line file; `:813` as the spawnCollect definition). 26/28 not reverted; 0/4 in group 1.
- "the round-36 shift-repair moved them one symbol off": does not apply to group 1 (R = B there). The stated cause is wrong for the atomic row.
- "treat line anchors here as at their base revision": base lines are false at pin for #1, #2 and #4. The advice points readers at false anchors.
- "Re-verification against the pin is pending": accurate; no pin check was made.

**Outside group 1 (spot evidence; not in overreverted=).** Note-wide, at least three round-37 overreversions:
- Round-36 TRUE → round-37 base FALSE (R true, W = B):
  - body `persistState (:1080)`: R `:1073` = L1073 `function persistState(` (true); L1080 `const document = {` (false).
  - `PROBE_CONCURRENCY = 8 (:61)`: R `:65` = L65 `const PROBE_CONCURRENCY = 8;` (true); L61 `];` (false).
  - `session_truncated (:904)`: R `:897` = L897, its only occurrence (true); `:904` (false).
- Round-37 moved true anchors onto false lines: `ROUTE_TIMEOUT_MS (:23→:51)` (L23 true; L51 = `runOmpCatalog`); shared `assertNoSecrets (:30→:943)` (L30 true; `:943` past EOF); route-health `assertNoSecrets (:932→:943)` (R true); `interpretPersistedHealth (R :1030→W :1186)` (R true; definition L1030).
- Out of range: route-health `:1346`, `:1358` (file 1188 L); models `:943` (244 L).

**Commands and output (abridged).**
```
$ git -C <lane> diff 0614092 -- corpus/knowledge/route-probe-cluster.md
-| … inlined in `probe-ufo-route-health.mjs:1080`/`1117` and `probe-token-plan-models.mjs:40`/`66` |
+| … inlined in `66`/`66` and `66`/`66` |
-constructs an HTTP `Authorization` header (`scripts/probe-ufo-route-health.mjs:2-3`),
+constructs an HTTP authorization header (`scripts/probe-ufo-route-health.mjs:72`),
$ read …/probe-token-plan-models.mjs:40   → 40| function writeVerdict(verdict) {
$ read …/probe-token-plan-models.mjs:66   → 66| function openTmpExclusive(tmp) {
$ read …/probe-ufo-route-health.mjs:66    → 66| (blank);  65| const PROBE_CONCURRENCY = 8;
$ read …/probe-ufo-route-health.mjs:72    → 72| const CREDENTIAL_SHAPE = /(?:authorization|proxy-authorization)\s*[:=]|…
$ read …/probe-ufo-route-health.mjs:1080  → 1080| const document = {
$ read …/probe-ufo-route-health.mjs:1117  → 1117| } finally {
$ git -C <lane> diff --no-index B.md R.md ; R.md W.md   (scratch copies)
    B→R: 1080→1073, 61→65, 904→897    R→W: 1073→1080, 65→61, 897→904
$ python over pin copies (definition lines): persistState 1073; tmp template 1110; writeVerdict 40;
    openTmpExclusive 66; PROBE_CONCURRENCY 65; session_truncated 897; ROUTE_TIMEOUT_MS 23;
    shared assertNoSecrets 30; rh assertNoSecrets 932; interpretPersistedHealth 1030;
    file lengths rh 1188, shared 159, models 244
$ python classify 28 positions vs B and R: base-value 2, round36-value-left 7, new-value 19 (total 28)
```

**Gaps.** Groups 2–8 not audited. #4 is a judgement (token vs construction; see above). "Definition line" means the `function`/`const` line, not call sites. Pin copies were taken with `git show <pin>:<path>`; on-disk == git copy by cmp for two files only. Spot-check D1 not examined.

**Operability.** Three rows are unbindable (file-less `66`). The claims gate checks anchor liveness, not symbol-on-line (the note's own round-35 notice says so), so it cannot catch this class.

**State.** No installs, no spawns. Writes: this report and /fast/scratch/kumitate-r37/AuditRouteProbe1/. Pin and lane git read-only.
