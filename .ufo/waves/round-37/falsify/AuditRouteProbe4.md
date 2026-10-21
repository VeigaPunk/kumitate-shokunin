AUDIT RouteProbe4 anchors=4 false=4 overreverted=4 notice=ok verdict=refuted

Snapshot audited: corpus/knowledge/route-probe-cluster.md sha256 f4c09038 (578 L, mtime 03:34:49, "S3").
Earlier state I first read: sha256 9b116b2e (579 L, "S1"; copy /fast/scratch/kumitate-r37/AuditRouteProbe4/restored.md).
The note changed three times during this audit (sibling edits; notice now "amended by AuditRouteProbe1/2/6").
Pin: /fast/scratch/kumitate-r36/src @ 31c465f (HEAD verified). probe-ufo-route-health.mjs 1188 L, probe-token-plan-shared.mjs 159 L, probe-token-plan-models.mjs 244 L.

## Universe
- As dispatched (S1, `git diff 0614092`): 29 anchor tokens in document order (26 numeric, 3 qualifier-only).
  My eighth = positions 11-14 (3N/8 < p <= 4N/8) = base L117 interpretRouteHealth (qualifier-only), base L117 interpretPersistedHealth, base L118 healthy, base L120 envelope. Rows 1-4.
- On disk now (S3): `git diff 0614092` shows one inserted line (L2). Zero anchors differ, so the dispatched universe is empty.
  The restoration-relevant universe is the reverted set R36 -> 0614092 (N=27, my reconstruction). Positions 11-13 = base L109 spawnCollect call site, L110 PROBE_CONCURRENCY, L111 mapPool (rows 5-7). Under an N=26 convention, base L112 DEFAULT_TIMEOUT_MS (row 8) also falls in the eighth.

## Anchors (pin test: sentence symbol on the line at 31c465f; R36 = round-36 lane copy)
| row | base L (S3 L) | symbol | 0614092 value -> pin line | S1 value -> pin | R36 value -> pin | status |
|---|---|---|---|---|---|---|
| 1 | 117 (118) | interpretRouteHealth | :1015 -> `if (!row \|\| typeof row !== "object" ...` NO | `...mjs:1015` (qualifier only) NO | :1008 `function interpretRouteHealth(` YES | restored-but-false; overreverted |
| 2 | 117 (118) | interpretPersistedHealth | :1037 -> `const observedAtMs = Date.parse(state.observedAt);` NO | :1186 -> `  }));` NO | :1030 `function interpretPersistedHealth(` YES | restored-but-false; overreverted |
| 3 | 118 (119) | healthy | :1174 -> `persistState(statePath, payload, maxAgeMs);` NO | :1346 -> beyond EOF NO | :1167 `healthy: results.every(` YES | restored-but-false; overreverted |
| 4 | 120 (121) | schema "ufo-route-health-error-v1" | :1191 -> beyond EOF NO | :1358 -> beyond EOF NO | :1184 `schema: "ufo-route-health-error-v1",` YES | restored-but-false; overreverted |
| 5 | 109 (110) | spawnCollect call site | :813 -> `      "--no-title",` NO | n/a | "call site line 804" -> `result = await spawnCollect("omp", [` YES | restored-but-false; overreverted |
| 6 | 110 (111) | PROBE_CONCURRENCY | :61 -> `];` NO | n/a | :65 `const PROBE_CONCURRENCY = 8;` YES | restored-but-false; overreverted |
| 7 | 111 (112) | mapPool | :784 -> `  };` NO | n/a | :775 `async function mapPool(items, limit, fn) {` YES | restored-but-false; overreverted |
| 8 | 112 (113) | DEFAULT_TIMEOUT_MS (N=26 boundary) | :39 -> `const MAX_SESSION_FILE_BYTES = 64 * 1024 * 1024;` NO | n/a | :43 `const DEFAULT_TIMEOUT_MS = 240_000;` YES | restored-but-false; overreverted |

Counts: dispatched eighth anchors=4 false=4 overreverted=4 (rows 1-4). Current reverted-set eighth anchors=3 false=3 overreverted=3 (rows 5-7; row 8 is the boundary).
Every failing row has the same shape: the base line lacks the sentence symbol (or lies past EOF), while the round-36 line carries it. S1 values for rows 1-4 were not base values either; they were also false.

## Notice
- S1 text (what I was dispatched on): BAD. It says anchors "were reverted to the lines their 0614092 sentences named". False: 26 numeric values differ from 0614092.
  Rows 1-4 S1 values are the round-12 ledger rows of the same file (S1 L543 `:1186 function interpretPersistedHealth`, L551 `:1346 process.exit(!payload.ok ...`, L553 `:1358 schema:`), not 0614092 lines.
  S1 L89 reads "`66`/`66` and `66`/`66`" with file names dropped. `:943` (S1 L135, L167) points past EOF of the 159 L shared and 244 L models files.
- S3 text (current): OK on scope. Verified: `git diff 0614092` is the notice line only; "no anchor here is a round-36 artifact" holds; "re-verification against the pin is owed" and "do not claim this note as pin-true" are honest.
  Not verified: "ratcheted fidelity debt". .ufo/pins/fidelity-ratchet.json:18 pins 23 for this note, while this note's round-35 notice (L5-12) reports 65 non-landing anchors under another measure. Not reconciled.
  Omission, not misstatement: the reset re-breaks R36 pin-true anchors (rows 1-8), and the notice does not say so.
- Revision frame: rows 1-4 base values are true at 964f443e (the revision the 0614092 sentences state; see E4) and false at the pin. R36 values are the reverse. The reset is a revision choice; the pin test rejects it.

## Verdict
refuted. Failing condition met: restored anchors (rows 1-7) whose symbol is not on the line at the pin. Each restoration discards a round-36 anchor that is on-symbol at the pin.

## Evidence (command -> output, abridged)
E1 `git diff --no-color -U0 0614092 -- corpus/knowledge/route-probe-cluster.md` (S3) -> `@@ -1,0 +2 @@` with one `+` notice line. Same command on S1 -> 29 anchor tokens (scratch diff.txt).
E2 `awk 'NR==...' scripts/probe-ufo-route-health.mjs` @31c465f -> 1008 `function interpretRouteHealth(row, { nowMs, expiresAtMs }) {`; 1015 `  if (!row || typeof row !== "object" || Array.isArray(row)) {`; 1030 `function interpretPersistedHealth(state, now = new Date()) {`; 1037 `  const observedAtMs = Date.parse(state.observedAt);`; 1167 `    healthy: results.every(...)`; 1174 `    persistState(statePath, payload, maxAgeMs);`; 1184 `    schema: "ufo-route-health-error-v1",`; 1186 `  }));`; `wc -l` -> 1188.
E3 same file -> 61 `];`; 65 `const PROBE_CONCURRENCY = 8;`; 775 `async function mapPool(items, limit, fn) {`; 784 `  };`; 804 `    result = await spawnCollect("omp", [`; 813 `      "--no-title",`; 39 `const MAX_SESSION_FILE_BYTES = 64 * 1024 * 1024;`; 43 `const DEFAULT_TIMEOUT_MS = 240_000;`.
E4 `git -C /fast/scratch/kumitate-r36/src show 964f443e:scripts/probe-ufo-route-health.mjs | wc -l` -> 1195; same tree at 1015 `function interpretRouteHealth`, 1037 `function interpretPersistedHealth`, 1174 `healthy: results.every`, 1186 `}`, 1191 `schema: "ufo-route-health-error-v1"`.
E5 R36 values: w/ExecFidRouteProbe.patch (0614092 -> R36) L446-452 (main/parseArgs/usage, spawnCollect `:669` call site line 804, PROBE_CONCURRENCY `:65`, mapPool `:775`), L462-467 (interpretRouteHealth `:1008`, interpretPersistedHealth `:1030`, healthy `:1167`, envelope `:1184`).
E6 S1 ledger rows: restored S1 L543 (`:1186`), L551 (`:1346`), L553 (`:1358`).
E7 `grep -n route-probe-cluster .ufo/pins/fidelity-ratchet.json` -> `18: "corpus/knowledge/route-probe-cluster.md": 23,`.
E8 `wc -l` pinned shared 159, models 244; `git cat-file -t 964f443e` -> commit.

## Residual risk and gaps
1. Universe is reconstructed: 29 (dispatched) and 27 (reverted set, atomic row handled by hand). The lead's eighth boundaries may differ; N=26 adds row 8.
2. Results are per snapshot (S1, S3). Re-run if the sha changes.
3. Symbol test is strict: symbol must be on the line, no adjacent-symbol tolerance. The canonical claims-check was not run (lane tool; may write caches).
4. Not checked: other sections, reverted-set anchors outside my eighth, the ratchet count.
5. Installs or updates: none. Scratch: /fast/scratch/kumitate-r37/AuditRouteProbe4/.
