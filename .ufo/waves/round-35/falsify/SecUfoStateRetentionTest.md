ATTACK scripts/ufo-state-retention.test.mjs verdict=holds defects=1

Target: `## `scripts/ufo-state-retention.test.mjs`` in
`corpus/knowledge/remaining-scripts-census.md` — working tree heading :769, note :771;
master :801/:803 (`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff master --
corpus/knowledge/remaining-scripts-census.md`). Pin `31c465f1`, base `964f443e`, read only
through `/fast/scratch/kumitate-r35/src`. No tool installed or upgraded; nothing written
outside this report; lane worktree untouched.

Verdict: all 13 anchor citations resolve at the pin and each names the behavior the note
attaches to it; the table row equals `wc -l`; the `29 test(` count is true; the five
removed-clause traces are true; no new false claim. The one defect is a lost blank-line
separator introduced by this edit (formatting only, no claim/gate impact).

## Anchors — all read at 31c465f1

Template: `git -C /fast/scratch/kumitate-r35/src show
31c465f1:scripts/ufo-state-retention.test.mjs | sed -n 'N p'`.

| note cite | pinned line (abridged) | verdict |
|---|---|---|
| `:2-4` scratch-tree header | :2-4 “owned behavioral suite… every case builds a scratch state tree and drives the CLI…” | ok, byte-identical at 964f443e |
| `:167` cap apply bounds both generations | `test("cap apply bounds both generations, preserves head/tail evidence, leaves JSONL byte-identical"` | ok |
| `:197-205` head/tail evidence | :197/:198 sourceSha256 + mode; :205 head bytes match row (tail :206) | ok |
| `:184` JSONL immutability | `assert.equal(sha(readFileSync(jsonlPath)), jsonlSha, "structured JSONL evidence is immutable")` | ok |
| `:210` second apply no-op | `test("cap second apply is a true no-op"`; :232-240 assert manifest/log bytes and mtimes unchanged | ok |
| `:244` open-writer deferral | `test("cap defers a generation with an open writable fd and bounds it once closed"`; :253 deferred=1; :261 caps after close | ok |
| `:449` read-only holder caps | `test("cap bounds a generation held open read-only: a reader is not a writer"`; :458 deferred=0; :459 capped=1 | ok; behavior is new — pin scanner parses fdinfo flags at :548-554 |
| `:595` watch_active admitted | `assert.deepEqual(sweepRow(json, watchedRun).protectedReasons, ["watch_active"]` | ok; fixture lock body `${process.pid}` at :544 |
| `:771` only live owner | `…liveLockRun… ["watch_active"]`; :767 dead, :769 malformed, :770 pid-0 all `[]` | ok |
| `:767-771` malformed/dead/pid-0 no protect | same matrix (:768 dead is `retire`) | ok |
| `:650` ledger_incomplete | `assert.equal(json.guardSources.ledger, "ledger_incomplete")`; :646 writes `not json at all` | ok (inherited wording: parse-malformed, not EACCES) |
| `:781-793` FIFO at queue guard | test :781; :788 `cli([...], {state, timeout: 2000})`; :791 `guardSources.queue === "queue_unsafe"` | ok |
| `:795-800` FIFO event log | :795 mkfifo log; :797 cap status 0; :798 capped=1; :800 log still FIFO | ok |

Count/scratch claims: `grep -nE '^\s*test\('` → 29 lines (also `grep -o 'test(' | wc
-l` → 29); no `test.only|skip|todo`. Module fixtures `capState = scratch("cap-state")`
:122 and `sweepState = scratch("sweep-state")` :504; `raceFixture` → `scratch(name)`
:889-890, so every case runs under scratch.

## Population table

- :175 `| scripts/ufo-state-retention.test.mjs | 951 | suite |`.
- `git show 31c465f1:scripts/ufo-state-retention.test.mjs | wc -l` → **951**;
  `git cat-file -e` → exists; heading occurs once; class `suite` (node:test import).
- `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8 --json`
  → member entry `anchors:13 … symbolHit:true`; `sections:60`, `errors:0`, verdict
  `MATCH`.

## Revision label and removed-clause traces

- The master section carried **no** revision label (`git show master:… | sed -n
  '801,804p' | grep -c 964f443e` → 0), so none was dropped; the edit adds the required
  `re-anchored at 31c465f1 (round 35)`. Census-level `964f443e` history survives at
  :5/:26.
- Trace claims at the pin: `watchFixture` 0, `watch_lock_unverifiable` 0,
  `capRunBashLogs` 0 (0 files repo-wide via `git grep … -- scripts/`), `wallCap` 0 in
  the member, and no literal `1 MiB` bound (the two `1 MiB` substrings sit inside
  `101 MiB`, :121/:146). All five traces are true.
- Count correction 49 → 29: the base file had **26** `test(` at 964f443e and the pin
  has **29**, so 49 was false at both; the replacement is true. The census carries no
  “corrected” trace anywhere (0 hits), so the silent correction matches convention.

## Defect 1 — lost blank-line separator (formatting; no claim/gate impact)

- `corpus/knowledge/remaining-scripts-census.md:771-772`: the note paragraph is
  immediately followed by `## scripts/ufo-statusline-hook.test.mjs` with no blank
  line. Master had one (master :803 note, :804 blank, :805 heading); the edit deleted
  the old note line *and* its trailing blank.
- Systemic: `awk 'NR>1 && prev!="" && /^## /{c++} {prev=$0} END{print c+0}'` → **13**
  in the working tree vs **0** on master. This section's trailing boundary is one of
  the 13 (its preceding boundary :768-769 is another). Markdown, `/^## /m` splitters,
  the Arm-1 heading regex, claims-check and cite-check are unaffected — shown by the
  MATCH/60-of-60 output above.
- Minimal fix: insert one blank line after :771 (and before each of the other 12
  merged headings).

## Observations (not defects)

- The master FIFO clause (state-global lock / cap session lock, `:886`, `:909`) was
  replaced by the pin's actual FIFO test (queue guard + event log) without a
  `(round 35: removed …)` marker. Both cited lines exceed the 870-line base file, so
  those anchors never resolved; the sibling-seat convention treats a reworded (not
  symbol-removed) clause as silently replaceable, and every replacement sentence is
  true at the pin.
- The `:650` test writes a malformed ledger (`not json at all`), not a
  permission-unreadable one; the note's “unreadable ledger” phrasing is inherited from
  master, so it is not a new claim.
- [INFERENCE] History after 31c465f1 is not in the clone, so where the old
  `:1019`/`:1355`/`:1387`/`:1443` anchors came from (possibly a longer revision)
  cannot be confirmed.

Confidence: high for every line read, count and absence; medium only for treating the
inherited “every case” universal as fully verified.
