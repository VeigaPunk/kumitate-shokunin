# FALSIFY scripts/ufo-state-retention.mjs — S8 member section (round 35)

Target: census.md:766-768 (`## \`scripts/ufo-state-retention.mjs\`` paragraph, re-anchored at
31c465f1) vs upstream `scripts/ufo-state-retention.mjs` at 31c465f1 (1924 L) and base
964f443e (2124 L). All reads via `git -C /fast/scratch/kumitate-r35/src show <rev>:<path>`.
No lane writes; scratch only in /tmp. No tool installs (none needed).

## Population-table row (census.md:174)

- Row says 1924 tool. `git show 31c465f1:scripts/ufo-state-retention.mjs | wc -l` → **1924**. MATCH.
- Master row (155) said 2124; base `git show 964f443e:… | wc -l` → 2124. The round-35 label
  history ("was 2124" context) is carried by the composition note (census.md:191: "largest
  members … `scripts/ufo-state-retention.mjs` (1924 L)") updated in lockstep; no stale 2124
  remains anywhere in corpus/ or SCORECARD.md (grep: only sighting-wall.md:216 names the member,
  with no line count; LOG.md:507's "2,284 L" is a historical round-13 account).

## Anchor-by-anchor verdict at 31c465f1

| # | anchor | claim | line at pin | verified content |
|---|--------|-------|-------------|------------------|
| 1 | `:4-12` | `cap` and `sweep` verbs | 4-12 | `// Verbs (frozen contract):` + cap spec (5-12). MATCH |
| 2 | `:1893` | dispatched through `isMainModule` | 1893 | `if (isMainModule(import.meta.url)) {`. MATCH |
| 3 | `:1912` | printing JSON | 1912 | `process.stdout.write(\`${JSON.stringify(payload, null, 2)}\n\`);`. MATCH |
| 4 | `:85` | `CAP_BYTES = 100 * 1024 * 1024` | 85 | `export const CAP_BYTES = 100 * 1024 * 1024; // per bash-log generation`. MATCH |
| 5 | `:86` | `RUN_BASH_LOG_CAP_BYTES = 1024 * 1024 * 1024` | 86 | verbatim. MATCH |
| 6 | `:24-26` | open-writer generations report `defer_open_writer` | 24-26 | comment: "any / generation with an open writable fd is reported \`defer_open_writer\` and / re-checked…". MATCH |
| 7 | `:98` | `NEWEST_PROTECTED_RUNS = 10` | 98 | `const NEWEST_PROTECTED_RUNS = 10;`. MATCH |
| 8 | `:99` | `YOUNG_PROTECTED_MS` 14 days | 99 | `14 * 24 * 60 * 60 * 1000`. MATCH |
| 9 | `:100` | `RETIRE_MIN_AGE_MS` 30 days | 100 | `30 * 24 * 60 * 60 * 1000`. MATCH |
| 10 | `:1664-1677` | `retentionLockHolder` supplies owner-pid liveness | 1664-1677 | `function retentionLockHolder(lockPath, deps = {})` … returns `{ ownerPid, live: ownerPid !== null && alive(ownerPid) }`. MATCH |
| 11 | `:1486` | `watch_active` applied only for a live holder | 1486 | `if (retentionLockHolder(join(candidate.path, ".session-retention.lock"), d).live) reasons.push("watch_active");`. MATCH |
| 12 | `RECLAIM_SCHEMA, :124` | `ufo-runtime-reclaim-v1` row | 124 | `const RECLAIM_SCHEMA = "ufo-runtime-reclaim-v1";`. MATCH |
| 13 | `:184` | `$UFO_STATE_DIR/session-retention.jsonl` | 184 | `logPath: resolve(d.logPath \|\| join(stateRoot, "session-retention.jsonl"))`, stateRoot `env.UFO_STATE_DIR` at :174. MATCH |
| 14 | `appendEvent at :441-456` | typed JSONL events | 441-456 | `function appendEvent(logPath, event) {` (441) … closing `}` (456); JSON.stringify with `ts`. MATCH |
| 15 | `:1799` | dry-run unless `--apply` | 1799 | `case "--apply":` inside parseArgs (options.apply default false at 1795: `{ verb, apply: false }`). MATCH |
| 16 | `:1831-1832` | dry-run unless `--apply` (lock wrapper) | 1831-1832 | `function withLock(schema, verb, run, deps) {` / `if (!run.apply) return run.run({ apply: false });`. MATCH |
| 17 | `:1901-1903` | missing verb exits 2 with `retention_usage_error` | 1901-1903 | `…{ kind: "retention_usage_error", message: "missing verb (expected cap\|sweep)" }…` / `process.exit(2);`. MATCH |
| 18 | `:1922` | typed refusals exit 2, untyped escape exit 1 | 1922 | `process.exitCode = error?.kind ? 2 : 1;`. MATCH |

15/18 anchors are byte-verified at the cited lines. Anchors 1/2/3 are re-anchored replacements
for the master paragraph's `:7`+`:2253` pair and were checked against the pin (the master `:7`
line itself is unchanged text at the pin — header line 7 — but the master claim it carried,
"three frozen verbs — cap, sweep, watch", is false at the pin; the new text drops `watch`, so
the replacement is correct, not a stale transplant).

## Removal-trace clauses (both present, both true)

- `(round 35: removed watch — absent at 31c465f1)`: `grep -n "watch"` at the pin returns only
  watchdog/watch_active/retention_watch_active hits; no `watchRun`, no `--run-id`/`--interval-ms`,
  no `case "watch"`; unknown-verb message says "expected cap|sweep" (:1871). At 964f443e the
  watch verb exists (header :18 `watch --run-id ID …`). Clause TRUE.
- `(round 35: removed watch_lock_unverifiable — absent at 31c465f1)`: `git grep -c
  watch_lock_unverifiable 31c465f1 -- scripts/ufo-state-retention.mjs` → zero hits; the string
  never existed in the .mjs at 964f443e either (it is test-suite vocabulary). The new paragraph
  correctly never attributes it to the .mjs; the clause records the removal from the shared
  suite description. Clause TRUE as written (it documents suite-vocabulary removal, cf. the
  sibling test paragraph which drops it from :674).

## Behavior-flip claims (new text vs base) — verified true

- Old `:1431`/`:1440` claims ("held watcher lock read from on-disk shape … regular lock with
  dead pid is stale … `watch_lock_unverifiable` fail closed") described master's suite-side
  contract; at the pin the .mjs enforces liveness via `retentionLockHolder(...).live` (:1486)
  and dead/malformed/pid-0 locks are NOT owners. New sentence "supplies owner-pid liveness;
  `watch_active` is applied only for a live holder (`:1486`), while dead or malformed locks are
  not owners" states exactly the pin behavior. Base mjs:1484 was bare `existsSync(...)` →
  watch_active, so the flip is real and correctly described.
- Base anchors that were mis-cited at 964f443e (:41-42 was the st_blocks disk-accounting comment,
  `:136` was CONTRACT_ROOT_NAMES, `:199` a bare `try {`, `:2101` the missing-verb message, and
  `:2253`/`:2261`/`:2282` out of range for a 2124-line file) were all silently corrected by the
  re-anchor; the new line numbers carry the same claims at the pin.

## Suite paragraph (census.md:769-771) — spot-verified

29 `test(` declarations: `grep -c "test("` at pin → 29. MATCH. Spot checks all MATCH at the
cited lines: `:2-4` scratch-tree header; `:167` cap apply bounds (head/tail at :197-205);
`:184` JSONL immutability assert; `:210` second-apply no-op; `:244` open-writer deferral;
`:449` read-only holder caps; `:595` `watch_active` fixture row; `:771` live-owner grant;
`:767-771` malformed/dead/pid-0 do not protect; `:650` `ledger_incomplete`; `:781-793`
queue_unsafe within spawn deadline; `:795-800` FIFO event log not overwritten ("the squatter is
never replaced or written through", cap completes, `capped: 1`). Removed-clause traces all
check out: no `watch fixture`, `watch_lock_unverifiable`, `wall-cap`, `1 MiB stdout bound`,
`capRunBashLogs` anywhere in the pin suite (git grep → ABSENT).

## Findings

1. **[minor] census.md:768 anchor `:4-12` spans a comment block, and line 7 itself is mid-cap
   description** — the cited range does cover both verb header lines (`cap` at :5, `sweep` at
   :12), but the range's first line (:4) is the banner comment, not a verb. Cosmetic at worst;
   the claim ("the cap and sweep verbs") is true of the cited region. No fix required.
2. **[none] No false claim found.** Every line-anchored clause in the section resolves to real
   pin content; both removal clauses leave accurate traces; the population row (1924) and the
   composition paragraph (1924 L) agree with `wc -l` at the pin; the historical label
   (2124 @ 964f443e / "was") is preserved in the diff lineage and no stale 2124 survives in
   corpus/ or SCORECARD.md.

## Wave-1 fidelity cross-check

`.ufo/waves/round-35/build/FidUfoStateRetention.md` reported ok=0 moved=12 changed=2 gone=1 with
15 proposed re-anchors; the landed section implements exactly those re-anchor targets
(:4-12, :1893, :1912, :85, :86, :24-26, :98, :99, :100, :1664-1677, :1486, :124, :184, :441-456,
:1799, :1831-1832, :1901-1903, :1922 — 18 clause anchors from 15 rows), dropped the `watch` verb
claim, and added the liveness-flip sentence. Its [INFERENCE] about note:155/note:171 stale 2124
was also resolved (table row 174 and composition 191 now read 1924). Fidelity report and landed
text agree; no divergence.

## Verdict

ATTACK scripts/ufo-state-retention.mjs verdict=holds defects=0

The re-anchored section survives falsification: all 18 line anchors verify at 31c465f1, the
population row equals `wc -l` (1924/951), both removal clauses are true and traced, the
lock-liveness behavior flip is accurately described, and no new false claim was introduced.
Residual risk: none actionable for this member; the cosmetic note in finding 1 is informational.
