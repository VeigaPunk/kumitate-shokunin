ATTACK scripts/fleet-ledger-rotate.mjs verdict=partial defects=1

Target: `## `scripts/fleet-ledger-rotate.mjs`` in
`corpus/knowledge/remaining-scripts-census.md` (lane working tree; heading line 553,
body line 555; diff vs master shows the round-35 rewrite). Pin
`/fast/scratch/kumitate-r35/src` @ `31c465f1`, base `964f443e`.

## D1 false claim at pin — `corpus/knowledge/remaining-scripts-census.md:555`

> it exports `rotateLedgerIfNeeded` (`scripts/fleet-ledger-rotate.mjs:757`) for the
> dispatcher's `importSiblingModule` path

`importSiblingModule` no longer exists in the dispatcher at `31c465f1`; the export is
consumed through a static ES import. Runs:

```
$ git show 31c465f1:scripts/fleet-dispatcher.mjs | sed -n '38p'
import { rotateLedgerIfNeeded as rotateLedgerFile } from "./fleet-ledger-rotate.mjs";
$ git show 31c465f1:scripts/fleet-dispatcher.mjs | grep -c importSiblingModule
0                       # exit 1
$ git show 964f443e:scripts/fleet-dispatcher.mjs | sed -n '286p;316p'
async function importSiblingModule(path) {
const ledgerRotateSibling = await importSiblingModule(LEDGER_ROTATE_MODULE_PATH);
$ git diff 964f443e 31c465f1 -- scripts/fleet-dispatcher.mjs | grep -n "importSiblingModule\|LEDGER_ROTATE_MODULE_PATH\|ledgerRotateSibling"
78:-const LEDGER_ROTATE_MODULE_PATH = join(MODULE_DIR, "fleet-ledger-rotate.mjs");
80:-async function importSiblingModule(path) {
101:-const ledgerReadSibling = await importSiblingModule(LEDGER_READ_MODULE_PATH);
110:-const ledgerRotateSibling = await importSiblingModule(LEDGER_ROTATE_MODULE_PATH);
111:-const ledgerRotateModule = firstFunctionExport(ledgerRotateSibling.module, [
124:-  rotate: siblingState(ledgerRotateSibling, ledgerRotateModule),
$ git grep -n importSiblingModule 31c465f1 -- scripts
31c465f1:scripts/fleet-ledger-read.mjs:898:  + "Import-only module: the dispatcher loads it via importSiblingModule and\n"
31c465f1:scripts/fleet-ledger-rotate.mjs:1230:  + "Normally invoked by the dispatcher (importSiblingModule), not by hand.\n\n"
```

So the clause was true at `964f443e` and is false at the pin; the audited diff is
exactly what removed the mechanism. Both remaining occurrences are stale source
comments (the rotate CLI_USAGE is the likely origin of the note's wording —
[INFERENCE]). Wave-1 (`build/FidFleetLedgerRotate.md`) recorded
`changed=0 gone=0` and did not flag this; the note carries no
`(round 35: …)` marker for the changed clause.

Minimal fix (keeps the true substance — dispatcher consumes the export — and
leaves the required trace): replace the clause with

> for the dispatcher's static import (`scripts/fleet-dispatcher.mjs:38`)

and append `(round 35: importSiblingModule loader removed — dispatcher now statically imports at :38)`
(the module's own CLI_USAGE still names the old loader; do not copy it forward).

## Verified holds — 9/9 anchors at `31c465f1`

`git show 31c465f1:scripts/fleet-ledger-rotate.mjs | sed -n 'Np'` for each:

- 757 `export function rotateLedgerIfNeeded(incomingBytes = 0, opts = {}) {`
- 107 `export const LIFECYCLE_SCHEMA = "ufo-process-lifecycle-v1";`
- 109 `export const ROTATION_RECORD_SCHEMA = "ufo-ledger-rotation-v1";`
- 392 `function preserveToCold(segPath, segName, rawSha, rawBuf, ledgerDir, linkFn = linkSync) {`
- 393 ``const coldName = `${segName}.${rawSha}.cold`;``
- 591 `record.coldVia = preserved.via;` — via values `existing`/`link`/`copy` confirmed in 392-430
- 975-978 `staleTempsRemoved`/`Remaining`/`RemainingNames`/`SkippedYoung`
- 1228 `const CLI_USAGE =`; all six flags in 1225-1226 (`--incoming-bytes`, `--ledger`,
  `--threshold-bytes`, `--segments`, `--dry-run`, `--no-record`)
- 1296-1300 catch → one JSON stderr line (1299), `process.exitCode = 2` (1300);
  stdout is written only after a successful call (`:1294`), so malformed invocations
  leave it empty

Behavior claims checked in-source, all true: FIRST occurrence kept verbatim (248-268,
per-segment `seen` set; header 12 says the same), payload drift counted (256,
`payloadDriftCount` in the record), eviction `<segment>.<uuid>.cold` (987), rotation
record schema (828), `record.error`/`record.degraded` stamped before rethrow
(1107/1128/1148), `--dryrun` history grounded in the pinned source comment (1223-1224).
The section's LAST→FIRST inversion of the old newest-wins clause is correct.

## Structural checks

- Population row `corpus/knowledge/remaining-scripts-census.md:134`
  (`| scripts/fleet-ledger-rotate.mjs | 1302 | tool |`) equals
  `wc -l` at pin: `1302` (final byte `\n`, `od -An -c`). The table's 60 rows sum to
  `33367`, matching the stanza total at line 105.
- Original revision label: the pre-edit section (master line 517, first landed round 13
  in `ed991d0`) carried no `964f443e`/date label, so none was dropped; the round-35
  edit appends `re-anchored at 31c465f1 (round 35)`.
- Removed-clause trace: the removed `LAST … matching fleet-ledger-read.mjs's
  newest-wins rule` clause is recorded in wave-1 `FidFleetLedgerRotate.md`
  (§Additional findings 2) and aggregate `LOG.md:1602` (“41 false clauses removed”);
  no inline marker, matching this file's convention of inline `(round 35: removed …)`
  only for absent-code claims (`:670`, `:796`) — not counted as a defect. D1 is the
  clause that did need a removal/changed marker and has none.
- New false claims introduced by the rewrite: none found. All new anchors and the
  FIRST/sweep/coldVia/schema wording are faithful at the pin.

## Gaps

- Nothing material left unobserved: every anchor and behavior line was read at
  `31c465f1` via `git show`; no test run is needed for a prose/anchor target.
- No tools installed or updated. No lane files modified.
