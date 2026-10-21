AUDIT RouteProbe2 anchors=4 false=3 overreverted=0 notice=bad verdict=refuted

Scope: `corpus/knowledge/route-probe-cluster.md`, group 2 of 8 (changed-anchor tokens 5-8).
Lane HEAD 86c0676; note blob e529214 = worktree (`git diff HEAD` empty). Base 0614092 (note blob 1146985, same as 4c9e407). Round-36 = 3d5760a (blob 7995f9f).
Pin: `/fast/scratch/kumitate-r36/src` @ 31c465f15669 (clean; `scripts/probe-ufo-route-health.mjs` blob 137b968 = on-disk).
Base column = 964f443e (the revision the sections state; copied to `/fast/scratch/kumitate-r37/AuditRouteProbe2/rh-964f443e.mjs`, 1195 L, matching the note's "1195 L").

## Method
- `git -C <lane> diff --no-color -U0 0614092 -- corpus/knowledge/route-probe-cluster.md`: 19 hunks, one pure insert (the notice). Changed anchor = a `file:line` or `:line` token whose text differs, zipped line by line per hunk.
- 29 changed tokens (script-counted; the atomic-write row counted by hand as 4). Balanced 8-way split (5x4, 3x3): group 2 = tokens 5-8.
- Pin and base checks: `read` and `grep -n` on the pinned file and on the 964f443e copy.

## Group 2 (tokens 5-8)

| tok | sentence symbol | 0614092 (B) pin / base | 3d5760a (S) pin / base | HEAD (H, restored line) pin / base | verdict |
|---|---|---|---|---|---|
| 5 | `Authorization` header ("constructs an HTTP ... header") | `:2-3` header comment, no token: FALSE / FALSE | `:72` CREDENTIAL_SHAPE regex literal `authorization` (`/iu`): token present / comment, FALSE | `:72` (unchanged from S): token present / FALSE | WEAK. Token on the line, but it is a redaction regex, not a header construction. Not counted false. |
| 6 | `usage` prints to stderr, exits 2 | `:97` blank line: FALSE / `function usage` TRUE | `:108` parseArgs `--help` guard, no `usage`, no exit 2: FALSE / `const routes` FALSE | `:108` (= S): FALSE / FALSE | FALSE. Pin: `function usage` L101, `process.exit(2)` L104. |
| 7 | `spawnCollect("omp", [...])` (definition), call site `:813` | `:678` = `}` closing the catch: FALSE / `function spawnCollect` TRUE | `:678` (= B): FALSE / TRUE | `:813` = `"--no-title",`: FALSE / call line `await spawnCollect("omp", [`, not the definition | FALSE. Pin: definition L669, call L804 (the "call site :813" clause is also FALSE at pin). Round-37 moved 678 to 813, away from base. |
| 8 | `DEFAULT_TIMEOUT_MS` 240_000 | `:39` = `MAX_SESSION_FILE_BYTES`: FALSE / `const DEFAULT_TIMEOUT_MS` TRUE | `:44` = `MAX_BUFFER`: FALSE / `SYSTEM_PROMPT`: FALSE | `:45` = `MAX_ROUTES`: FALSE / `FAILURE_CLASSES`: FALSE | FALSE. Pin: L43. Round-37 moved 44 to 45, away from base. |

- Restored-but-still-false (pin): tokens 6, 7, 8. Count 3.
- Restorations applied in group 2 (H = B where S differs from B): 0. Round-37 touched only tokens 7 and 8, both moved away from B. Tokens 5 and 6 are unchanged round-36 values.
- Overreverted (a restoration that reverted a true improvement): 0 actual.
- Latent: token 5 is the one true improvement in this group (pin: B lacks the symbol, S has it). Reverting it to `:2-3`, the notice's stated method, would be an overreversion. D1 forbids that: "keep the base line wherever its symbol is still on that line" (`corpus/lessons/round-36-verifier-spotcheck.md:193-196`).

## Notice (`corpus/knowledge/route-probe-cluster.md:2`)
- Present: yes. Blockquote dated 2026-10-21.
- Accurate: NO.
  - "Anchors in this note were reverted to the lines their 0614092 sentences named": 0 of 4 group-2 anchors equal their 0614092 line. 29 tokens in the whole note still differ from 0614092.
  - "treat line anchors here as at their base revision": H is not at base for token 5 (`:72`), token 6 (`:108`) or token 8 (`:45`). Token 7's `:813` is the base call site, not the definition.
  - Its source, `corpus/lessons/round-37.md:13` ("reverted ... (every symbol-keyed anchor)"), is contradicted by this diff. D1 itself is conditional and the notice does not state the condition.
- Not uniformly false: round-37 did return other anchors to base (3d5760a to HEAD diff: persistState :1073 to :1080, main :320 to :1164, parseArgs :50 to :103, writeVerdict :35 to :40, openTmpExclusive :63 to :66). Those are outside group 2 and not audited here.

## Enumeration (29 changed tokens; group 2 = 5-8)
- 1-4 (group 1): atomic-write row, `probe-ufo-route-health.mjs:1080`, `1117`, `probe-token-plan-models.mjs:40`, `:66` to bare `66` x4. File names dropped and no 0614092 line kept. Corruption, not restoration.
- 5 `:2-3`->`:72`; 6 `:97`->`:108`; 7 `:678`->`:813`; 8 `:39`->`:45` (group 2).
- 9 `:41`->`:49`; 10 `:939`->`:943`; 11 `:1015` prefix only; 12 `:1037`->`:1186`; 13 `:1174`->`...:1346`; 14 `:1191`->`:1358`; 15 `:23`->`:51`; 16 `:30`->`:943`; 17 `:100`->`:39`; 18 `:123`->`:140`; 19 `:110`->`:943`; 20 `:67`->`:92`; 21 `:31`->`:47`; 22 `:95`->`:98`; 23 `:1164`->`...:1015`; 24 `:813` prefix only; 25 `:678`->`:813`; 26 `:20`->`:84`; 27 `:51`->`:84`; 28 `:51`->`:84`; 29 `:61`->`:784`. (groups 3-8, not audited here)

## Evidence (commands and output)
```
$ git -C <lane> diff --no-color -U0 0614092 -- corpus/knowledge/route-probe-cluster.md
  -> hunks @@ -100 +102, -108,2 +110,2, -112,4 +114,4, -117,4 +119,4 ... (19 hunks)
$ git show 0614092:corpus/...md | grep -n 'constructs an HTTP'   -> 100: (`:2-3`)
$ git show 3d5760a:corpus/...md | grep -n 'constructs an HTTP'   -> 100: (`:72`)
$ grep -n 'constructs an HTTP' corpus/...md (HEAD)               -> 102: (`:72`)
$ grep -n -E 'const (MAX_SESSION_FILE_BYTES|DEFAULT_TIMEOUT_MS|MAX_BUFFER|MAX_ROUTES) ' pin/scripts/probe-ufo-route-health.mjs
  -> 39 MAX_SESSION_FILE_BYTES, 43 DEFAULT_TIMEOUT_MS, 44 MAX_BUFFER, 45 MAX_ROUTES
$ grep -n -E 'function (usage|parseArgs|spawnCollect)|process\.exit\((0|2)\)|spawnCollect\("omp"' pin
  -> 101 usage, 104 exit(2), 107 parseArgs, 110 exit(0), 669 spawnCollect def, 804 spawnCollect("omp" call
$ read pin:96-100 -> L97 blank;  read pin:664-684 -> L678 "}";  read pin:798-830 -> L813 "--no-title",
$ grep -n -i authorization pin -> 72 (CREDENTIAL_SHAPE, /iu), 79 (REDACT key list), 247 (replace regex). No header construction.
$ base copy (964f443e): 2-3 header (no token); 39 DEFAULT; 40 MAX_BUFFER; 45 FAILURE_CLASSES; 44 SYSTEM_PROMPT;
  72 comment line (no token); 97 function usage; 108 const routes; 678 function spawnCollect; 813 spawnCollect("omp" call
```

Same-sentence tokens not in the changed set (pin drift, the round-35 class, not round-37 edits): `call site :813` is L804 at pin; `parseArgs (:103)` is L107; `main (:1164)` is L1157.

## Gaps
- Tokens 1-4 and 9-29 are not audited here (other groups).
- Token 5 WEAK is a judgement. If token-only matches count as false, false=4.
- `claims-check.mjs` not run. No installs or package transactions. Scratch: `/fast/scratch/kumitate-r37/AuditRouteProbe2/`.
