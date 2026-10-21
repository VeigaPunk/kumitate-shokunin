FIDELITY scripts/fleet-ledger-rotate.mjs anchors=6 ok=0 moved=6 changed=0 gone=0

Scope: every anchor in corpus/knowledge/remaining-scripts-census.md citing `scripts/fleet-ledger-rotate.mjs`. All six `:N` anchors (three full-path, three `:N` continuations) sit in the member's own section at note line 517; a repo-wide grep for `fleet-ledger-rotate\.mjs:[0-9]` confirms no other note line cites this member with a line anchor. Section heading (note:515) and census table row (note:111) are structural, reported separately.

## Non-ok anchor rows

note:517 | `scripts/fleet-ledger-rotate.mjs:994` | `rotateLedgerIfNeeded` export (dispatcher `importSiblingModule` path, CLI double) | moved | scripts/fleet-ledger-rotate.mjs:757 | it exports `rotateLedgerIfNeeded` (`scripts/fleet-ledger-rotate.mjs:757`) for the dispatcher's `importSiblingModule` path and doubles as a CLI — re-anchored at 31c465f1.
note:517 | `:114` | `LIFECYCLE_SCHEMA` = `ufo-process-lifecycle-v1` | moved | scripts/fleet-ledger-rotate.mjs:107 | lifecycle events (schema `ufo-process-lifecycle-v1`, `LIFECYCLE_SCHEMA` at `:107`) — re-anchored at 31c465f1; compaction keeps the FIRST occurrence verbatim (read.mjs alone is newest-wins).
note:517 | `:471` | content-addressed cold archive `<segment>.<sha256>.cold`, hardlink + copy+rename fallback (`preserveToCold`) | moved | scripts/fleet-ledger-rotate.mjs:392 | preserved content-addressed as `<segment>.<sha256>.cold` (`:392`, name template `:393`) via hardlink with a copy+rename fallback — re-anchored at 31c465f1.
note:517 | `:116` | `ROTATION_RECORD_SCHEMA` = `ufo-ledger-rotation-v1` | moved | scripts/fleet-ledger-rotate.mjs:109 | additive to `ROTATION_RECORD_SCHEMA` = `ufo-ledger-rotation-v1` (`:109`) — re-anchored at 31c465f1.
note:517 | `scripts/fleet-ledger-rotate.mjs:1450` | `CLI_USAGE` constant | moved | scripts/fleet-ledger-rotate.mjs:1228 | The CLI (`CLI_USAGE` at `scripts/fleet-ledger-rotate.mjs:1228`) takes `--incoming-bytes`, `--ledger`, `--threshold-bytes`, `--segments`, `--dry-run` and `--no-record` — re-anchored at 31c465f1.
note:517 | `scripts/fleet-ledger-rotate.mjs:1522` | malformed-invocation refusal: one JSON line on stderr, exit 2, empty stdout | moved | scripts/fleet-ledger-rotate.mjs:1296 | refuses as one JSON line on stderr with exit 2 and empty stdout (`scripts/fleet-ledger-rotate.mjs:1296-1300`) — re-anchored at 31c465f1.

## Evidence (commands + observed facts)

- `git show 964f443e:scripts/fleet-ledger-rotate.mjs | wc -l` → 1414; same at 31c465f1 → 1302. Diff `964f443e 31c465f1` → 1 file, +30/−142.
- Base anchor targets (964f443e): export at 887; `LIFECYCLE_SCHEMA` 108; `ROTATION_RECORD_SCHEMA` 110; `preserveToCold` 393 (template 394); `CLI_USAGE` 1340; refusal catch 1408-1412. So `:994` hit dry-run residue (`};` at 994), `:114` hit `MAX_ERROR_MESSAGE_CHARS`, `:471` hit `sourceFile,` inside `compactionHeaderFields`, and `:1450`/`:1522` were past base EOF (1414). All six anchors predate the 964f443e pin; they are stale at both audited revisions, with different wrong targets.
- Pinned targets (31c465f1, verified by `cat -n`): export 757; `LIFECYCLE_SCHEMA` 107; `ROTATION_RECORD_SCHEMA` 109; `preserveToCold` 392 (template 393); `CLI_USAGE` 1228; refusal boundary 1296 (`stderr.write` 1299, `exitCode = 2` 1300).
- Behavior survival at pinned — every claim next to the anchors still holds: drift counting never silent (246-265); cold preserve hardlink/copy (392+); `<uuid>.cold` eviction convention (987); `coldVia` link/copy/existing + stale-temp sweep counts (392-401 region, 974-978); `record.error`/`degraded` stamped before rethrow (1106-1149); strict CLI refusal contract (1225-1301, unchanged from base); dispatcher still imports the export (fleet-dispatcher.mjs:38 at pinned).
- Diff-only changes: imports (`−readFileSync`, `−rmSync`, `+import { withDirLock } from "./ufo-mission-result.mjs"` at pinned 89) and the lock implementation — the hand-rolled `acquireRotateLock`/`releaseRotateLock`/owner-token machinery is replaced by shared `withDirLock` (pinned 1160), mutating body wrapped in a `rotateLocked` closure (971-1152), busy message mapped to `LEDGER_BUSY` (1169). The note text makes no lock-protocol claims, so no described behavior was removed or changed by the diff — hence changed=0, gone=0.

## Additional findings

1. Census table row note:111 declares 1414 lines — exactly the 964f443e `wc -l`. At 31c465f1 the member is 1302 lines; the re-census must set 1302.
2. Prose flag (pre-existing, NOT introduced by 964f443e..31c465f1): note:517 says the dedupe contract keeps "the LAST occurrence inside a segment kept verbatim, matching `fleet-ledger-read.mjs`'s newest-wins rule". At both revisions rotate's compaction keeps the FIRST occurrence (own header comment line 12 "first occurrence kept verbatim"; logic: first hit `kept.push`, later hits dropped, pinned 246-269). read.mjs is the newest-wins side ("within it the LAST line replaces", read.mjs:20-21 at pinned); only the dedupe KEY is shared. Proposed fix, folded into the `:114` row wording above; the re-census should invert LAST→FIRST.
3. Residual (upstream-internal, for C2 wording hygiene): pinned 114-117 still carries the comment "both modules are standalone drop-ins importing no sibling" while pinned 89 imports sibling `ufo-mission-result.mjs` — stale in-code comment; the current census note does not echo the standalone claim, so no note change required.
4. Residual (test member's scope, FYI for the `fleet-ledger-rotate.test.mjs` reviewer): the four-case lock family's semantics now live in `withDirLock` (ufo-mission-result.mjs:1576): owner.json token, `pidIsAlive` stale-break via quarantine rename, fresh-mtime deferral, 30s timeout/stale defaults, seized-token restore — protocol-equivalent to the deleted private copy, but refusal timing is now mediated by the shared helper; test-file anchors unchanged by this member's diff.

## Verification gaps

- None for the six anchors: each cited region was read verbatim at both 964f443e and 31c465f1 via `git -C /fast/scratch/kumitate-r35/src show`.
- read.mjs newest-wins wording was checked at pinned only; its cross-revision stability is [INFERENCE] (irrelevant to this member's anchors — rotate's first-occurrence behavior is proven at both revisions from rotate's own source).

Commands: `git show <rev>:scripts/fleet-ledger-rotate.mjs | cat -n` (both revs), `git diff 964f443e 31c465f1 -- scripts/fleet-ledger-rotate.mjs`, `wc -l` both revs, targeted `grep`/`sed -n` on pinned rotate, read.mjs, dispatcher, ufo-mission-result.mjs; `grep fleet-ledger-rotate` and `grep 'fleet-ledger-rotate\.mjs:[0-9]'` on the census notes. No tools installed or updated. No notes or lane files were modified.
