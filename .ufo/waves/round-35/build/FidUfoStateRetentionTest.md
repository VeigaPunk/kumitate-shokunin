FIDELITY scripts/ufo-state-retention.test.mjs anchors=14 ok=1 moved=5 changed=3 gone=5

# C2 anchor-fidelity: scripts/ufo-state-retention.test.mjs

Note source: `corpus/knowledge/remaining-scripts-census.md:803` (member section `## scripts/ufo-state-retention.test.mjs` at `:801`; census frozen against `964f443e`, label at `:795`). Pinned revision `31c465f1`. Read-only; no note or production file edited. No tool installs.

## Member identity: holds
Member still exists at `31c465f1`; becomes 951 L (was 870 L at `964f443e`). One upstream commit touched it: `7674380 retention: live-owner run locks, FIFO-safe leaf IO, cap-only guards, drop dead watch verb, symlink-safe entry (p0-logs-state F6, F7, F8, F9, F13)`, `+161/-80`.

## Rows (non-ok anchors; all on note line 803)
Format: note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording.

note:803 | scripts/ufo-state-retention.test.mjs:191 | closed-file bound, head/tail evidence, JSONL byte-identical | moved | scripts/ufo-state-retention.test.mjs:167 (test start; JSONL assert :184, head/tail :197-205) | re-anchored at 31c465f1 (was 964f443e): cap apply bounds both generations at `:167`, JSONL byte-identical at `:184`.
note:803 | `:233` | cap second apply is a true no-op | moved | scripts/ufo-state-retention.test.mjs:210 | re-anchored at 31c465f1 (was 964f443e): `cap second apply is a true no-op` at `scripts/ufo-state-retention.test.mjs:210`.
note:803 | `:267` | open-writer deferral | moved | scripts/ufo-state-retention.test.mjs:244 (writable fd); new read-only counterpart :449 | re-anchored at 31c465f1 (was 964f443e): writable-fd deferral at `:244`; a read-only holder now caps instead (`:449`).
note:803 | `:655` | watcher lock read from on-disk shape, not path existence | gone | none: watch fixture/verb deleted; nearest surviving lock-body matrix scripts/ufo-state-retention.test.mjs:736-778 | re-anchored at 31c465f1 (was 964f443e): watch verb deleted; sweep gates `watch_active` on recorded owner liveness (`:736-778`).
note:803 | scripts/ufo-state-retention.test.mjs:674 | FIFO/pidless/link/dir bodies as `watch_lock_unverifiable` | gone | none: string absent repo-wide at both revisions | re-anchored at 31c465f1 (was 964f443e): no `watch_lock_unverifiable`; malformed/pid-0/dead lock bodies are non-owners (`:736-771`).
note:803 | scripts/ufo-state-retention.test.mjs:560 | `watch_active` | moved | scripts/ufo-state-retention.test.mjs:595 (fixture row), :771 (live-owner proof) | re-anchored at 31c465f1 (was 964f443e): `watch_active` at `:595`, granted only to the live lock owner (`:771`).
note:803 | `:851` | `watch_active` only to a verifiably live owner | changed | scripts/ufo-state-retention.test.mjs:771 (test :736-778); base granted it on path existence (`964f443e` mjs:1484) | re-anchored at 31c465f1 (was 964f443e): dead/malformed/pid-0 locks do not protect; only a live owner does (`:771`).
note:803 | scripts/ufo-state-retention.test.mjs:1019 | unreadable ledger segment reports `ledger_incomplete` | moved | scripts/ufo-state-retention.test.mjs:650 (test :629) | re-anchored at 31c465f1 (was 964f443e): unreadable ledger yields `ledger_incomplete` at `:650`.
note:803 | `:886` | FIFO at state-global lock refuses typed under spawn deadline | changed | scripts/ufo-state-retention.test.mjs:781-793 (FIFO at queue guard `pending-work.json`; no lock-path FIFO case) | re-anchored at 31c465f1 (was 964f443e): FIFO at the queue guard yields `queue_unsafe` under a 2 s spawn deadline (`:781-793`).
note:803 | `:909` | FIFO at cap session lock refuses typed under spawn deadline | changed | scripts/ufo-state-retention.test.mjs:795-800 (FIFO at event log `session-retention.jsonl`) | re-anchored at 31c465f1 (was 964f443e): FIFO at the event log is never written through; cap still completes (`:795-800`).
note:803 | `:1387` | four wall-cap cases | gone | none in member (:1387 exceeds the 951-L file); `wallCapacity` lives in scripts/fleet-dispatcher.mjs:7134 | re-anchored at 31c465f1 (was 964f443e): remove; this suite holds no wall-cap cases.
note:803 | `:1443` | caller's 1 MiB stdout bound | gone | none (:1443 exceeds the 951-L file; no such assertion in member) | re-anchored at 31c465f1 (was 964f443e): remove; no 1 MiB stdout bound exists in this suite.
note:803 | scripts/ufo-state-retention.test.mjs:1355 | external consumer `capRunBashLogs` | gone | none: `capRunBashLogs` absent repo-wide at `964f443e` and `31c465f1` | re-anchored at 31c465f1 (was 964f443e): remove the named consumer; no `capRunBashLogs` symbol exists.

OK anchor: `:2-4` — header lines 2-4 are byte-identical at both revisions ("every case builds a scratch state tree"), scratch helper at :58, TMP at :43.

## Non-anchor claim drift (same paragraph / member rows)
- `corpus/knowledge/remaining-scripts-census.md:803` "holds 49 `test(` call sites": actual 26 at `964f443e`, 29 at `31c465f1` (`grep -o 'test(' | wc -l`).
- `corpus/knowledge/remaining-scripts-census.md:156` table size `870`: stale at pin; file is 951 L.
- Note's watch-scope sentence is dead: the `watch` verb is removed from the CLI and its three tests deleted; the suite header comment was rewritten (+live-owner-only lock protection, +FIFO guard/log refusal, +symlinked CLI entry; −watch scope/stop conditions).
- `:655` claim was already inverted at base: sweep's `watch_active` used `existsSync(lock)` (`964f443e` scripts/ufo-state-retention.mjs:1484). At pin it uses `retentionLockHolder(...).live` (`31c465f1` mjs:1486, function :1664), i.e. body-pid liveness, not file shape.
- Six anchors (`:886`, `:909`, `:1019`, `:1355`, `:1387`, `:1443`) exceed the base file length (870) yet cite real base behavior only for `:1019` (base actual :579) — the anchor set appears imported from a longer, different revision.

## Evidence and commands (all against /fast/scratch/kumitate-r35/src)
- `git diff --stat 964f443e 31c465f1 -- scripts/ufo-state-retention.test.mjs` → `241 +++--`, `161 insertions(+), 80 deletions(-)`; `git show <rev>:file | wc -l` → 870 / 951.
- `git diff 964f443e 31c465f1 -- scripts/ufo-state-retention.test.mjs` → deletes `watchFixture`, three `watch` tests, `WATCH_SCHEMA` surface; adds `captorn-state`, `reader-state`, `capguards-state`, lock-liveness test, FIFO test, symlink-entry test.
- Anchor reads (`git show <rev>:scripts/ufo-state-retention.test.mjs | sed -n 'N,Mp'`): base 166→pin 167, base 209→pin 210, base 243→pin 244; base 508→pin 579; base 524→pin 595; base 579→pin 650; base 656/674 watch fixture+tests → deleted (pin:655 is `// ── Archive fixture`); base 850→pin 931.
- Pin assertions: `:595` and `:771` `protectedReasons, ["watch_active"]`; `:650` `guardSources.ledger, "ledger_incomplete"`; `:791` `queue_unsafe`; `:800` `isFIFO()`.
- Base mobile risk (strengthens `:851` changed): base fixture wrote lock body `"123\n"` while asserting `watch_active` (diff hunk `@@ -470,7 +541,7 @@` changes it to `${process.pid}`).
- `git grep -n 'capRunBashLogs\|watch_lock_unverifiable' 964f443e -- scripts/` and `... 31c465f1 ...` → no output. `git log --all -S` → no commits.
- `git show 964f443e:scripts/ufo-state-retention.mjs | grep -n ...` → `1484: if (existsSync(join(candidate.path, ".session-retention.lock"))) reasons.push("watch_active")`; pin → `1486: ... retentionLockHolder(...).live`.

## Confidence
High for every line number, token absence, and file-size fact (direct reads at both revisions). Medium for status classification (moved vs changed) where a deleted surface has a surviving analog, and for the hypothesis that the note's anchors came from a later/longer revision.

## Remaining unknowns
- Upstream revisions after `31c465f1` are not in the shallow private clone, so whether the exact anchor set matches some later file cannot be checked.
- `capRunBashLogs` may exist in unfetched history; at both pinned revisions it is absent, so the note's claim is unsupported as written.
- "Four wall-cap cases" could belong to `scripts/fleet-dispatcher.test.mjs` (`wallCapacity`), not verified as a count of four — out of this member's scope.
