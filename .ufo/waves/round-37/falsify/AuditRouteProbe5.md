AUDIT RouteProbe5 anchors=3 false=2 overreverted=1 notice=ok verdict=refuted

# Scope and definition
- Target: corpus/knowledge/route-probe-cluster.md. Lane HEAD c589b38, note blob 512ed82 (audited state).
- Pin: /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7 (HEAD matches, `git status` clean). Stated revision: 964f443e (the note's S7 scope section names it; present in the pin repo).
- The literal `git diff 0614092 -- corpus/knowledge/route-probe-cluster.md` is now ONE inserted line (the notice). Commit 5bc40d0 reset the body to 0614092 bytes after this item was issued. The item was issued against 5ceb8cd, where the same diff had 29 changed positions (see Superseded state). The literal changed-anchor count at HEAD is therefore 0.
- Audited set = the anchors the restoration changed relative to its input, the round-36 state 3d5760a: 26 positions in document order (route-health 15, shared 1, kimi 2, models 2, redact 1, fake-omp 5).
- Chunking: group k = positions [floor((k-1)*26/8), floor(k*26/8)) 0-based. Group 5 = 0-based 13..15 = ranks 14, 15, 16 below.
- Symbol test (strict): the sentence's own symbol is a token on the cited pinned line. Loose test (line inside the symbol's body) is noted where it changes a result.

# Group 5 (3 anchors)
| rank | 0614092 anchor | sentence symbol | restored line @31c465f1 (HEAD = 0614092) | round-36 line @31c465f1 | @964f443e restored / round-36 | class |
|---|---|---|---|---|---|---|
| 14 | route-health `:1015` (line 117) | interpretRouteHealth | 1015 is `if (!row ... Array.isArray(row)) {`; symbol absent (def is 1008) | 1030 = interpretPersistedHealth def, symbol absent | T / F | restored-but-false; not a reversion of a true anchor |
| 15 | route-health `:1037` (line 117) | interpretPersistedHealth | 1037 is `const observedAtMs = Date.parse(state.observedAt);`; symbol absent (def is 1030) | 1030 = def, symbol PRESENT | T / F | restored-but-false AND OVERREVERTED (true r36 1030 -> false 1037) |
| 16 | shared `:23` (line 129) | ROUTE_TIMEOUT_MS | 23 is `const ROUTE_TIMEOUT_MS = 250_000;`, symbol present | 51 = runOmpCatalog, absent | T / F | restored-true (correct revert) |

Loose test: 1015 and 1037 lie inside the bodies of interpretRouteHealth (def 1008, next def 1030) and interpretPersistedHealth (def 1030, next def 1073). Under the loose test both would pass; the item's strict symbol-on-line test fails them.

# Notice (header line 2 at c589b38) - present, accurate
- "reset to its 0614092 bytes": `git diff --stat 0614092 -- corpus/knowledge/route-probe-cluster.md` -> `1 file changed, 1 insertion(+)`.
- "no anchor here is a round-36 artifact": body identical to 0614092 (same diff).
- "already false at the pin remain as ratcheted fidelity debt": `.ufo/waves/round-37/final/fidelity.txt` -> `FIDELITY note=corpus/knowledge/route-probe-cluster.md anchors=80 ok=32 elsewhere=18 absent=5 dead=1 noid=24 nonok=23`; `.ufo/pins/fidelity-ratchet.json` notes entry = 23 (matches nonok=23).
- "re-verification against the pin is owed. Do not claim this note as pin-true": consistent with nonok=23.
- Superseded 5ceb8cd notice ("reverted to the lines their 0614092 sentences named") was false: all 29 changed positions in that body differed from 0614092, 26 with a different line number (3 kept the number: models 66 path drop, route 1015 path add, route row 813 path drop). It no longer exists at HEAD.

# Superseded state (5ceb8cd, the diff the item named)
Group 5 there (29 positions, floor chunk, 0-based 14..17): shared `:23`->51, shared `:30`->943, kimi `:100`->39, kimi `:123`->140.
anchors=4 false=4 overreverted=0. Each 0614092 line carries its symbol at the pin (23 ROUTE_TIMEOUT_MS; 30 assertNoSecrets; 100 process.exit(2); 123 targets.some(). The restored lines do not: 943 is beyond EOF in shared (159 L) and models (244 L); 51 = runOmpCatalog; 39 = probeTarget; 140 = process.exit(available ? 0 : 2). Reset at 5bc40d0 returned all four to base values, which are TRUE at the pin.

# Whole-note reversions at HEAD (pin test; outside group 5 but live in the reset)
Round-36 value TRUE at the pin, HEAD (= 0614092) line FALSE at the pin:
- route-health `:1080` (persistState; r36 1073 = def) -> 1080 is `const document = {`
- route-health `:61` (PROBE_CONCURRENCY; r36 65 = def) -> 61 is `];`
- route-health `:784` (mapPool; r36 775 = def) -> 784 is `};`
- route-health `:939` (assertNoSecrets; r36 932 = def) -> 939 is the throw line inside the body
- route-health `:904` (session_truncated; r36 897 = assignment) -> 904 is `facts.errorMessage,`
- route-health `:1037` (interpretPersistedHealth; r36 1030) -> group rank 15 above
At the stated revision 964f443e all six HEAD lines carry their symbols (T). These are pin-only reversions: the round-36 values were pin-true but false at 964f443e.
Other: route-health `:2-3` ("constructs an HTTP Authorization header") is false at both revisions. Round-36 `:72` carries the token only inside the CREDENTIAL_SHAPE redaction regex, not header construction; not counted as an improvement.

# Full 26-position table (HEAD = 0614092 values)
Columns: anchor (HEAD) -> round-36 value | symbol | HEAD @pin | r36 @pin | HEAD @964f443e | class
1. route `:2-3` -> `:72` | Authorization header | F | T(regex only) | F | restored-false
2. route `:1080` -> `:1073` | persistState | F | T | T | OVERREVERTED
3. route `:1164` -> `:320` | main | F | F | T | restored-false
4. route `:103` -> `:50` | parseArgs | F | F | T | restored-false
5. route `:97` -> `:108` | usage | F | F | T | restored-false
6. route `:61` -> `:65` | PROBE_CONCURRENCY | F | T | T | OVERREVERTED
7. route `:784` -> `:775` | mapPool | F | T | T | OVERREVERTED
8. route `:39` -> `:44` | DEFAULT_TIMEOUT_MS | F | F | T | restored-false
9. route `:40` -> `:45` | MAX_BUFFER | F | F | T | restored-false
10. route `:41` -> `:49` | MAX_ROUTES | F | F | T | restored-false
11. route `:45` -> `:497` | FAILURE_CLASSES | F | F | T | restored-false
12. route `:939` -> `:932` | assertNoSecrets | F | T | T | OVERREVERTED
13. route `:904` -> `:897` | session_truncated | F | T | T | OVERREVERTED
14. route `:1015` -> `:1030` | interpretRouteHealth | F | F | T | restored-false (GROUP)
15. route `:1037` -> `:1030` | interpretPersistedHealth | F | T | T | OVERREVERTED (GROUP)
16. shared `:23` -> `:51` | ROUTE_TIMEOUT_MS | T | F | T | restored-true (GROUP)
17. kimi `:100` -> `:39` | process.exit(2) | T | F | T | restored-true
18. kimi `:123` -> `:140` | targets.some( | T | F | T | restored-true
19. models `:40` -> `:35` | writeVerdict | T | F | T | restored-true
20. models `:66` -> `:63` | openTmpExclusive | T | F | T | restored-true
21. redact `:33` -> `:11` | COMPILED_REDACT_PATTERNS | T | F | T | restored-true
22. fake `:35` -> `:3` | FAKE_OMP_DELAY_MS | T | T(comment) | T | restored-true
23. fake `:31` -> `:47` | MODE default "healthy" | T | F | T | restored-true
24. fake `:60` -> `:58` | catalogHasRoute | T | F | T | restored-true
25. fake `:98` -> `:174` | emitRaw | T | F | T | restored-true
26. fake `:177` -> `:7` | fake-omp-session.jsonl | T | F | T | restored-true

Totals: restored-true 11; restored-false 15 (of which 6 OVERREVERTED, 9 not). At the stated revision 964f443e, 25 of 26 HEAD lines are true (only #1 fails).

# Other chunkings of the same 26 positions
- array_split (sizes 4,4,3,3,3,3,3,3): group = ranks 15-17 = #15 (false, overreverted), #16 (true), #17 (true). anchors=3 false=1 overreverted=1 notice=ok verdict=refuted.

# Verdict basis
- Failing condition met on the item's pin test: ranks 14 and 15 are restored lines that do not carry their symbol at 31c465f1; rank 15 also discards a pin-true round-36 anchor.
- Notice accurate. At the stated revision 964f443e all three group lines carry their symbols. The refutation is of the pin claim, which the notice disclaims ("Do not claim this note as pin-true").

# Evidence (commands and outputs)
1. `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff --stat 0614092 -- corpus/knowledge/route-probe-cluster.md` -> `1 file changed, 1 insertion(+)`.
2. `git -C ...kumitate-shokunin show 3d5760a:corpus/knowledge/route-probe-cluster.md` aligned against 0614092 (python difflib, scratch /fast/scratch/kumitate-r37/AuditRouteProbe5/) -> 26 differing anchor positions as listed.
3. `git -C /fast/scratch/kumitate-r36/src show 31c465f1:scripts/probe-ufo-route-health.mjs` (numbered reads): 1008 `function interpretRouteHealth(row, { nowMs, expiresAtMs }) {`; 1015 `  if (!row || typeof row !== "object" || Array.isArray(row)) {`; 1030 `function interpretPersistedHealth(state, now = new Date()) {`; 1037 `  const observedAtMs = Date.parse(state.observedAt);`; 1073 `function persistState(...)`. Shared: 23 `const ROUTE_TIMEOUT_MS = 250_000;`; 51 `export function runOmpCatalog() {`.
4. `git -C /fast/scratch/kumitate-r36/src show 964f443e:scripts/probe-ufo-route-health.mjs` (1196 split-lines): 1015 `function interpretRouteHealth(row, { nowMs, expiresAtMs }) {`; 1030 `  }`; 1037 `function interpretPersistedHealth(state, now = new Date()) {`. At the stated revision both group anchors are the symbol definitions themselves.
5. `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` -> 31c465f15669f744848bd9f5d56191c5085670f7; `status --short` empty.
6. Lane HEAD moved during this audit (5bc40d0, 469500f, c589b38, then ea63c4e). Note blob 512ed82 is unchanged at ea63c4e; all numbers are for it, and its body is identical to 0614092.

# Installs and transactions
None. No packages installed or updated. Scratch only: /fast/scratch/kumitate-r37/AuditRouteProbe5/.
