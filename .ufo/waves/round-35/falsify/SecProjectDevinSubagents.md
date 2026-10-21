ATTACK S8 member section `## `scripts/project-devin-subagents.mjs`` (census :642-644, roster :150) verdict=holds defects=0

Axes: coverage:script-layer (judged) + census honesty of the re-anchored section.
Ground truth: /fast/scratch/kumitate-r35/src @ 31c465f1 (379 L; `git show 31c465f1:scripts/project-devin-subagents.mjs | wc -l` = 379; base 964f443e = 444 L).
Wave-1 input read: .ufo/waves/round-35/build/FidProjectDevinSubagents.md (anchors=9 ok=1 moved=5 changed=2 gone=1).

## Arm 1 — every body anchor at :644 vs the pin (all 16 resolve)

Command: `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/project-devin-subagents.mjs | cat -n | sed -n '33p;92,101p;361,379p'` plus `grep -n -E '<symbols>'` (full map quoted in evidence below).

| Note claim (:644) | Pin | Observed at 31c465f1 |
|---|---|---|
| `devin-native-v1` seat profiles `:100` | 100 | `const profileId = "devin-native-v1";` |
| `loadProfile` `:107` | 107 | `function loadProfile() {` |
| `config/ufo.json` `nativeProfiles.devin-native-v1` `:99-101` | 99-101 | `configPath`/`profileId`/`canonicalAgents` constants |
| rooted at repo (`root`, `:86`) | 86 | `const root = join(dirname(fileURLToPath(import.meta.url)), "..");` |
| `safeRoleKey` `:31` | 31 | `const safeRoleKey = /^[a-z][a-z0-9-]*$/u;` |
| `assertSafeRoleKey` `:33` | 33 | `function assertSafeRoleKey(role) {` |
| shared `readBoundedFile` `:29` | 29 | `import { readBoundedFile, writeFileAtomic } from "./ufo-mission-result.mjs";` (shared ✓; wave-1 verified export at ufo-mission-result.mjs:832) |
| `MAX_REPO_FILE_BYTES` 1 MiB `:84` | 84 | `= 1024 * 1024` |
| read sites `:114`, `:251`, `:306` | ✓ | exactly the three `readBoundedFile` call sites (grep) |
| missing card throws plain error `:247` | 247 | `throw new Error(\`canonical agent card missing for devin seat: agents/${role}.md\`)` — plain Error, no code field ✓ |
| `ok:false` plus `error` `:362-379` | 362-379 | try/catch: `ok: false` :366, `error: error.message` :375 |
| `--check` read-only, `checkOnly` `:98`, accepted `:93` | 93 | `if (arg !== "--check") {` rejection arm — `--check` is the sole accepted flag ✓ |
| `ok` `:336` | 336 | `const ok = !checkOnly || (missing.length === 0 && drifted.length === 0 && extras.length === 0);` |
| `assertSafeDest` (unanchored) | 46 | `function assertSafeDest(...)` exists; dest-guard ordering preserved (:274-276, :292, :297, :305, :309) |

No anchor is out of range or symbol-off-line. cite-check (lane gate, read-only):
`node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --symbols --json`
→ findings for census lines 150/642/644: 0 error, 0 warn; every ref kind OK
(tool itself confirms target "scripts/project-devin-subagents.mjs (379 lines)" at the pin).
Note: the checker's "sticky" heuristic attributes bare `:N` refs on :644 to the
preceding `config/ufo.json` token (in-range pass without symbol check), so the
table above is the load-bearing verification, done per-line at the pin.

## Arm 2 — population-table row vs wc -l

`sed -n '150p' census` → `| \`scripts/project-devin-subagents.mjs\` | 379 | tool |`;
`git ... show 31c465f1:... | wc -l` → 379. Equal ✓. The table sits under
"Current observed (pinned origin `31c465f1`, 2026-10-20)" (:101), so the column's
declared measurement revision is the pin ✓. Class `tool` ✓ (not `*.test.mjs`).

## Arm 3 — revision label + removed-clause traces

- Master body (:658) carried NO revision label (single prose paragraph ending
  "…never an omp-native-v1 handoff."); nothing was dropped. New body carries
  `re-anchored at 31c465f1 (round 35)` ✓ plus the explicit removal trace
  `(round 35: removed card_missing — absent at 31c465f1)` ✓.
- `card_missing` literal: absent at the pin (`grep -E 'card_missing'` on the
  numbered source → no match; only prose "card missing" at :247). Wave-1's
  `git log -S'card_missing' 31c465f1 -- <file>` → empty (never existed at either
  revision); the trace says "absent at 31c465f1", which is true.
- Clauses dropped from master with behavior STILL present at the pin (no trace
  owed, none needed): "repo and packaged `ufo-<role>.md` files" (targets
  :101-104 unchanged), "refusing symlinked or out-of-root seat paths before any
  mkdir or write" (assertSafeDest body :46 vs base :53 unchanged, ordering kept),
  "exit codes are 0 ok, 1 projection failure, 64 usage error" (:90/:95/:379).
  Compression, not falsification — behavior re-verified above.

## Arm 4 — new false claims: none found

Sentence-by-sentence against the pin: the two master falsehoods are FIXED, not
relocated — (a) "true only when missing, drifted and extra all empty" → now
"means all missing, drifted and extra lists are empty **only in check mode**"
(matches :336 exactly; in sync mode `ok` is unconditionally true); (b) master's
"refusal arm always carries a stable snake_case `errorCode`" → now "The JSON
report exposes the error message rather than a stable error-code field" (grep:
`errorCode` occurs nowhere in the 379-line file; catch sets only `error` :375).
Non-goal sentence matches the header comment :12-16 verbatim in substance.
Departed row :413 (`project-devin-subagents.test.mjs`): confirmed absent at
964f443e (`git show` → fatal, exit 128) and at 31c465f1 (ls-tree: only the
.mjs) — matches the round-32 removals claim; cite-check's UNRESOLVED on that
line is the intentional departed-row convention shared by all 15 rows of that
list, not a defect.

## Residual (out of my member's scope — named only for dispatch)

Census-wide cite-check verdict is FAIL, driven by sibling members, none mine:
:616 `local-helper.mjs` (10× SYMBOL_OFF_LINE/LINE_OOR at pin), :620
`omp-native-shutdown.mjs` `MAX_STOP_BLOCKS` off :36, :655
`sync-global-routing.mjs` PIN_MISMATCH (sha256 vs 31c465f1). Also two
note-level PIN_UNTYPED on the census pin sites (:6, :15). Owners: the per-member
falsify lanes for those sections / RerunProxy.

Verification gaps: none for this member — every claim in :644 was read against
the pin. No tool installs (git/sed/node only; cite-check is the lane's own).
No [INFERENCE] items.
