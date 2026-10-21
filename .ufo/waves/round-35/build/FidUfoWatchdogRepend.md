FIDELITY scripts/ufo-watchdog-repend.mjs anchors=8 ok=2 moved=5 changed=1 gone=0

# C2 anchor fidelity — `scripts/ufo-watchdog-repend.mjs` at 31c465f1

Scope: one upstream member, notes `corpus/knowledge/ops-watchers.md` and
`corpus/knowledge/remaining-scripts-census.md`, read-only (no note edited).
Source read only via `/fast/scratch/kumitate-r35/src` (base 964f443e, pin 31c465f1).

## Non-ok anchors

| note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording (<=30 words) |
|---|---|---|---|---|---|
| remaining-scripts-census.md:841 | `scripts/ufo-watchdog-repend.mjs:310` | exported as `main` | moved | `scripts/ufo-watchdog-repend.mjs:366` | Refusal-aware blocked-row repend duty exported as `main` (`scripts/ufo-watchdog-repend.mjs:366`, 964f443e census; re-anchored at 31c465f1). |
| remaining-scripts-census.md:841 | `:362` | `isMainModule(import.meta.url)` → `process.exitCode = main()` | moved | `scripts/ufo-watchdog-repend.mjs:426-427` | Run through `isMainModule(import.meta.url)` → `process.exitCode = main()` (`:426-427`, 964f443e census; re-anchored at 31c465f1). |
| remaining-scripts-census.md:841 | `:51` | `STATE_SCHEMA` = 2 | moved | `scripts/ufo-watchdog-repend.mjs:57` | Durable state file is `STATE_SCHEMA` = 2 (`:57`, 964f443e census; re-anchored at 31c465f1); it now also carries a `notes` dedupe member. |
| remaining-scripts-census.md:841 | `:58` | `STABLE_REFUSAL_REASONS` = {`mission_stale_registered`} | moved | `scripts/ufo-watchdog-repend.mjs:64` | `STABLE_REFUSAL_REASONS` = {`mission_stale_registered`} (`:64`, 964f443e census; re-anchored at 31c465f1). |
| remaining-scripts-census.md:841 | `:141` | `SPAWN_FAILURE_TAIL_MAX` = 120 characters | moved | `scripts/ufo-watchdog-repend.mjs:159` | Child stdout/stderr tails are telemetry redacted to `SPAWN_FAILURE_TAIL_MAX` = 120 characters (`:159`, 964f443e census; re-anchored at 31c465f1). |
| remaining-scripts-census.md:160 | table row `\| scripts/ufo-watchdog-repend.mjs \| 371 \| tool \|` | member line count 371 | changed | 428 lines at 31c465f1 | `\| scripts/ufo-watchdog-repend.mjs \| 428 \| tool \|` (964f443e census; re-anchored at 31c465f1). |

## Ok anchors

| note:line | citation | claim | evidence at 31c465f1 |
|---|---|---|---|
| remaining-scripts-census.md:839 | `## scripts/ufo-watchdog-repend.mjs` heading | member is a live S8 script | present in tree: `git ls-tree --name-only 31c465f1 scripts/ufo-watchdog-repend.mjs`; 428 lines |
| ops-watchers.md:176 | Sources list mention (`scripts/ufo-watchdog-repend.mjs`) | cited as source of the S6 watcher note; no line anchor or behavior claim | member still present at pin; no anchor to move |

## Observed

- Diff is `81 insertions(+), 24 deletions(-)` (matches the ticket); file 371 lines at
  964f443e, 428 at 31c465f1.
- Symbol map base 964f443e → pin 31c465f1: `STATE_SCHEMA` 51→57; `MAX_ATTEMPTS` 52→58;
  `DEFAULT_QUIET_SECONDS` 54→60; `STABLE_REFUSAL_REASONS` 58→64;
  `SPAWN_FAILURE_TAIL_MAX` 141→159; `export function main` 318→366;
  `isMainModule` guard 369-370→426-427.
- Cited `:310` at base is `else { values.set(arg, value); i += 1; }`; at pin it is `}`.
  Cited `:362` at base is the malformed-state `lines.unshift(...)`; at pin it is `}`.
  Both anchors already missed at 964f443e (main then at :318, guard at :369-370), so that
  drift predates the round-35 diff. [INFERENCE: census anchors were authored on an earlier
  revision; offsets are 8 and 7 lines.]

## Claims still true at 31c465f1

- `export function main` :366; module guard :426-427.
- `STATE_SCHEMA` = 2 :57; legacy bare `{key:n}` read as attempts :203; attempts/refusals
  pruned for rows no longer blocked :343-345.
- `MAX_ATTEMPTS` = 3 :58; attempt only counted when `report.repended === true` :323-326;
  refusal and transient failure log "attempt not counted" :331, :337.
- `STABLE_REFUSAL_REASONS` set :64; suppression needs stable reason + `sig` match + `at <= now`
  + inside quiet window :244-249; `DEFAULT_QUIET_SECONDS` 900 :60; `rowSignature` :67.
- argv surface :355-364; `unsupported argument` :360; stderr `ufo-watchdog-repend:` lines and
  return 64 :368-371; blocked-row and fleet filters :278-280; age gate :235-237.
- Unreadable queue prints one stamped line and returns 0 :401-402 (read is now bounded).
- `SPAWN_FAILURE_TAIL_MAX` = 120 :159, used with `redactAbsolutePaths(tail, ROOT_TAGS)` :167.

## Behavior deltas the note does not describe (none falsifies an existing claim)

1. State gains a `notes` dedupe map while `STATE_SCHEMA` stays 2: normalize :192-199,
   per-row `notes` :274, `skip_cap`/`skip_suppressed` log-once :297, :305-308, delete on
   attempt :313, prune :345, emitted in state :347. Cap/suppression lines no longer print
   every tick; the state document shape changed without a schema bump.
2. `ROOT` is module-anchored, base :46 `process.cwd()` → pin :52
   `resolve(dirname(fileURLToPath(import.meta.url)), "..")`; default `--state` is
   repo-root relative (:377), default queue via `resolveQueuePath(ROOT, …)` (:393).
3. Explicit `--queue` now resolves against the caller cwd and bypasses the
   `resolveQueuePath` beneath-`.ufo` gate (:391-392); at base :340 every queue token went
   through that gate, which throws `queue_path_outside_root` (pinned helper
   `scripts/ufo-mission-result.mjs:2662-2673`). Behavioral loosening, undescribed.
4. Queue read is bounded via `readBoundedFile(…, MAX_QUEUE_BYTES, …)` (:394-396), removing
   the symlink/FIFO/oversized hang class the old `readFileSync` had.
5. Manifest class is read once per cycle through exported `manifestClassReader`
   (:92-106) passed as `manifestClass = manifestClassReader()` (:264), replacing per-row
   `loadManifestClass` re-reads.
6. The dispatcher child now receives `resolvedQueue` (:414-416) instead of the raw token, so
   child and parent target the same queue.

Removed described behavior: none found. All note claims (main export, guard, schema/legacy
migration/pruning, argv faults + 64, eligibility, refusal-suppression semantics, redaction
cap, unreadable-queue survival) hold at 31c465f1.

## Commands run

- `grep -n 'ufo-watchdog-repend' corpus/knowledge/ops-watchers.md corpus/knowledge/remaining-scripts-census.md`
- `git -C /fast/scratch/kumitate-r35/src diff --stat 964f443e 31c465f1 -- scripts/ufo-watchdog-repend.mjs`
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-watchdog-repend.mjs`
- `git -C /fast/scratch/kumitate-r35/src show <rev>:scripts/ufo-watchdog-repend.mjs | sed -n 'N,Mp'` at 964f443e and 31c465f1, plus `wc -l`
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-mission-result.mjs | sed -n '2662,2674p'`
- `git -C /fast/scratch/kumitate-r35/src ls-tree --name-only 31c465f1 scripts/ufo-watchdog-repend.mjs scripts/ufo-watchdog-repend.test.mjs`

Tool installs/upgrades: none. No production file, note, jj or git state was written; this
report is the only write.
