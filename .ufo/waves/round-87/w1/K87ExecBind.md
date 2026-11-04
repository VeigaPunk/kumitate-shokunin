# K87ExecBind — `receipt-bind` (C1 candidate) and the round-87 close-receipt shape

Seat `K87ExecBind` (executor, leaf). Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Base revision `db97929212bb61ae970b10abac3cc4cd976713ae`; measured tree = lane HEAD
`25a3a75df123a59c5cf0de944a6d2f067e278f82` (freeze commit). Host `plazir27`.
Nothing committed, pushed, stashed, checked out or added. No tool was installed or upgraded
(all pacman transactions remain paused; nothing needed `uv tool`/`npx`/a release binary).
Scratch `/fast/scratch/hyaku/kumitate-r87/K87ExecBind/` (two `git clone --shared` trees, fixtures,
probe work dirs) is removed before yield; every receipt cited below lives in
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecBind/`.

Candidate: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecBind/receipt-bind.mjs`
(sha256 `b640ff3115228e2d7cc1ca748bc892db1887e33f356197ed86937b989eaf4c0a`, 27 984 bytes, 544 lines).

---

## 1. What the instrument does

Contract `kumitate-receipt-bind-v1`, exactly as the frozen plan states it:

```
node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>] [--json]
node scripts/receipt-bind.mjs --selftest [--work <dir>]
```

| input | rule implemented |
|---|---|
| receipts | every `*.txt` **directly** under `--dir`, sorted by name; other suffixes ignored |
| symlinked receipt | `RECEIPT_BIND: FAIL-CLOSED SYMLINK_RECEIPT <path>`, exit 2 (`lstat`, before reading) |
| missing/unreadable `--dir` (absent, or a file → `ENOTDIR`) | `FAIL-CLOSED DIR_UNREADABLE <dir> (<code>)`, exit 2 |
| instrument | the **second** whitespace token of `cmd=` (`node scripts/x.mjs …` → `scripts/x.mjs`) |
| no `cmd=` **or** no `tool_sha256=` | counted `unchecked` (never silently clean) |
| lane-relative / lane-absolute instrument | sha256 of `git cat-file blob <rev>:<path>` in `--lane` |
| absolute instrument outside the lane | sha256 of the file on disk, **also** counted in `external=` |
| per-receipt `rev=` | overrides `--rev` for that receipt (40 lowercase hex required) |
| unresolvable rev | `FAIL-CLOSED REV_UNRESOLVED`, exit 2 |
| unresolvable instrument (absent at rev, unreadable on disk, a directory at rev, or a `cmd=` with no second token) | `FAIL-CLOSED UNRESOLVED <file> …`, exit 2 |
| CLEAN | `mismatched==0 AND unchecked==0` **over at least one receipt**, exit 0 |
| otherwise | `DRIFT`, exit 1 |
| usage (bare, unknown flag, missing/duplicated value, non-40-hex `--rev`, `--work` without `--selftest`, `--selftest` with bind flags) | exit 64, `USAGE` |
| precedence | usage > fail-closed > drift > clean (fail-closed short-circuits the loop) |

Output, text mode, exactly one line on stdout:

```
RECEIPT_BIND: CLEAN matched=<n> mismatched=0 unchecked=0 external=<e>
RECEIPT_BIND: DRIFT matched=<n> mismatched=<m> unchecked=<u> external=<e> first=<file>
RECEIPT_BIND: FAIL-CLOSED <TOKEN>[ detail]
```

`first=` is the first offending receipt in sorted order (`-` when the directory holds no receipt).
`--json` prints one object with the same tallies plus a row per receipt (verdict, instrument, rev,
source `git|disk`, declared/computed digest). `--selftest` is hermetic: its own `git init` fixture
repo under `--work` (or a private `mkdtemp`), removed on exit, and it strips `GIT_DIR`,
`GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, … from every git it spawns.

Four decisions worth stating, because each closes a hole the arms would otherwise leave open:

1. **The default revision is judged before any receipt is read.** Otherwise a directory whose
   receipts are all external or all `unchecked` would never touch git and could answer CLEAN/DRIFT
   where the spec demands `REV_UNRESOLVED` (probe arm 10). Measured: `receipts/selftest.txt` arm
   `rev-unresolved` and the probe's `rev-bad` arm both fire on the eager check.
2. **`git cat-file blob` is used instead of `git show`** for the same `<rev>:<path>`: `git show
   <rev>:<dir>` prints a *tree listing* and exits 0 (measured at `19b4e44:scripts`), so a receipt
   naming a directory would be hashed as garbage; `git cat-file blob <rev>:<dir>` exits 128
   (measured) and therefore fails closed as `UNRESOLVED`.
3. **`external=` is additive, not a third bucket.** An external instrument is hashed and compared;
   it counts in `matched`/`mismatched` *and* in `external`. This is what makes the round-86 arm
   read `matched=1 mismatched=9` — the census receipt names the fleet-root script, which is
   external *and* mismatched.
4. **An empty (or non-`*.txt`) directory is DRIFT, not CLEAN**, per "CLEAN requires … over at
   least one receipt"; a crash is `FAIL-CLOSED INTERNAL`, so a bug can never read as a verdict.

Declared limit (in the file header): the pair is read as text, so a receipt that names an
instrument without ever running it still binds when its digest equals those bytes — this gate
checks the *claim*, not the history of the run.

## 2. Measurements

Every line below is a transcript in `.../build/K87ExecBind/receipts/`. Nothing is inferred.

### 2.1 `--selftest` — `RECEIPT_BIND_SELFTEST: PASS held=39/39`, exit 0

`receipts/selftest.txt`. 39 hermetic arms over one fixture repo (two commits: `c1` alpha v1,
`c2` alpha v2 + beta): clean · clean-multi(3) · clean-crlf · digest-flip · cmd-flip ·
unchecked-no-cmd · unchecked-no-digest · unchecked-bad-digest · unresolved-instrument ·
unresolved-directory-instrument · unresolved-bare-instrument · dir-missing · dir-is-file ·
rev-unresolved · rev-per-receipt-overrides · rev-default-is-judged · symlink-receipt ·
external-disk · external-mismatch · lane-absolute-instrument · empty-dir-not-clean ·
non-txt-ignored · non-txt-only-is-empty · sorted-first · lane-flag-from-outside ·
default-lane-is-toplevel · git-env-canary-ignored · json-drift · json-clean · json-fail-closed ·
dirty-worktree-cannot-launder · worktree-bytes-not-truth · 7 usage arms.

Three of those are the ones that make the rest non-vacuous: `rev-per-receipt-overrides` (a receipt
whose `rev=c1` binds a `c1` digest while `--rev c2` is in force), `dirty-worktree-cannot-launder`
(a dirty worktree still binds the committed bytes) and `worktree-bytes-not-truth` (a digest of the
dirty bytes does **not** bind at the committed rev).

### 2.2 `detect-r86` alone, exact acceptance command — PASS

`receipts/detect-r86.txt`:

```
$ node <candidate> --dir /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/../round-86/close \
      --rev 19b4e440e83ea9d618708003f36c3a799eb13e08 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin
RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=1 first=c1-probe.txt
exit=1
```

The one match is `selftest.txt` (`cmd=node scripts/counter-receipt.mjs --selftest …`, and
`sha256(counter-receipt.mjs@19b4e44) = e9531370…`, the digest all ten receipts repeat). The nine
mismatches are the nine receipts that name an instrument they did not measure — the R86-D1 class.
`external=1` is `census.txt`, whose instrument is the fleet-root `scripts/sources-census.sh`.
Byte-identical on a second run (`receipts/determinism.txt`, `IDENTICAL=yes`).

### 2.3 Frozen probe on the real lane — `UNMET held=5/12`, 7 arms blocked by the absent close dir

`receipts/probe87-integrated-default.txt` (no `--tool`: the default `<lane>/scripts/receipt-bind.mjs`
is already integrated byte-identically, sha256 `b640ff31…`), `--rev 25a3a75d…`, exit 1:

```
ARM usage: PASS exit=64
ARM selftest: PASS exit=0 RECEIPT_BIND_SELFTEST: PASS held=39/39
ARM detect-r86: PASS exit=1 RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=1 first=c1-probe.txt
ARM clean-r87: FAIL no-r87-close
ARM flip-cmd: FAIL no-r87-close
ARM flip-hash: FAIL no-r87-close
ARM unchecked: FAIL no-r87-close
ARM unresolved: FAIL no-r87-close
ARM dir-missing: PASS exit=2 RECEIPT_BIND: FAIL-CLOSED DIR_UNREADABLE …/absent-87-dir (ENOENT)
ARM rev-bad: FAIL no-r87-close
ARM symlink: FAIL no-r87-close
ARM random-fixture: PASS pick=scripts/bind-oracle.mjs clean_exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0 | flip_exit=1 RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=0 first=gen.txt
C87_C1: UNMET held=5/12
```

`receipts/probe87-real-lane.txt` is the same run with an explicit `--tool <candidate>` — identical
result, so the candidate and the integrated copy behave alike. `/home/…/.ufo/waves/round-87/close`
does not exist yet (`ls -d` → `No such file or directory`), so seven arms cannot be measured in the
lane. That is the only reason the count is 5 and not 12.

### 2.4 The same frozen probe, 12/12, over a *rehearsed* round-87 close directory

`receipts/probe87-rehearsal-12of12.txt`. Scratch `git clone --shared` of the lane at `25a3a75d`,
candidate committed there as `scripts/receipt-bind.mjs` (`562bc4b109c86aa92f8dc1feedba8fbe3d0c97a9`),
eleven close receipts emitted by `rehearse/emit-close-receipts.mjs` (each command really run; the
digest taken from git at that rev, from disk for the external census case), exit 0:

```
ARM usage: PASS exit=64
ARM selftest: PASS exit=0 RECEIPT_BIND_SELFTEST: PASS held=39/39
ARM detect-r86: PASS exit=1 RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=2 first=c1-probe.txt
ARM clean-r87: PASS exit=0 RECEIPT_BIND: CLEAN matched=11 mismatched=0 unchecked=0 external=1
ARM flip-cmd: PASS exit=1 RECEIPT_BIND: DRIFT matched=10 mismatched=1 unchecked=0 external=1 first=bind.txt edited=bind.txt
ARM flip-hash: PASS exit=1 RECEIPT_BIND: DRIFT matched=10 mismatched=1 unchecked=0 external=1 first=bind.txt edited=bind.txt
ARM unchecked: PASS exit=1 RECEIPT_BIND: DRIFT matched=10 mismatched=0 unchecked=1 external=1 first=bind.txt edited=bind.txt
ARM unresolved: PASS exit=2 RECEIPT_BIND: FAIL-CLOSED UNRESOLVED bind.txt instrument absent at 562bc4b1…: scripts/absent-87-probe.mjs edited=bind.txt
ARM dir-missing: PASS exit=2 RECEIPT_BIND: FAIL-CLOSED DIR_UNREADABLE …/absent-87-dir (ENOENT)
ARM rev-bad: PASS exit=2 RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED --rev 0000… is not a commit in …/lane
ARM symlink: PASS exit=2 RECEIPT_BIND: FAIL-CLOSED SYMLINK_RECEIPT …/symlink/bind.txt
ARM random-fixture: PASS pick=scripts/counter-receipt.mjs clean_exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0 | flip_exit=1 RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=0 first=gen.txt
C87_C1: HELD held=12/12
```

`external=2` there is honest and instructive: in a clone, the round-86 `c1-probe.txt` receipt's
*lane-absolute* instrument (`/home/…/kumitate-shokunin/.ufo/waves/round-86/probe/probe86-c1.mjs`)
points at the real lane, i.e. outside the clone, so it is hashed from disk — and still mismatches.
The same probe at a **later** rev (`018a3a07…`, `receipts/probe87-rehearsal-later-rev.txt`) also
reads `HELD held=12/12`: receipts that declare their own `rev=` stay valid across later commits.

This rehearsal is the receipt-shape proof the L1 needs, not a substitute for the lane run: it
exercises arms 4–8, 10 and 11 end-to-end, which the lane cannot until the close directory exists.

## 3. Integration points (exact)

1. **`scripts/receipt-bind.mjs`** — already in the working tree, byte-identical to the candidate
   (`sha256sum` = `b640ff31…`; `diff -q` → identical). If it must be re-placed:
   `cp /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecBind/receipt-bind.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-bind.mjs`
   then confirm the same sha256. No other file needs to import it; it is a standalone CLI gate.

2. **`proxy-check --strict` will not read MATCH without a pin key.** `scripts/proxy-check.mjs`
   warns `PIN_UNPINNED` for any `scripts/*.mjs` no pin key covers, and `--strict` promotes that
   warning to DRIFT. Measured in a fresh clone with the candidate integrated
   (`receipts/proxy-strict-pin.txt`):

   ```
   PROXY  warn  PIN_UNPINNED  scripts/receipt-bind.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
   PROXY: DRIFT (…; PIN_UNPINNED term=scripts/receipt-bind.mjs; …)      exit=1
   ```

   The measured three-part recipe (also verified in that clone: the warning disappears, exit still
   1 only because that clone carries the round-86 declared stanza):
   * `scripts/proxy-check.mjs`, `GATE_PINS` (after `'pin.counter-receipt'`):
     `  'pin.receipt-bind': 'scripts/receipt-bind.mjs', // round 87: close-receipt instrument binding (C1)`
     — the key set is a fixed map, so an undeclared `pin.receipt-bind` line in the scorecard fails
     closed with `GATE_PIN_KEY_UNKNOWN`;
   * `SCORECARD.md` gate-pin block, after `pin.counter-receipt=…`:
     `pin.receipt-bind=<sha256 of scripts/receipt-bind.mjs>`;
   * `SCORECARD.md` v1 block: recompute `pin.proxy-check=<sha256 of the edited scripts/proxy-check.mjs>`
     (the file is itself pinned; in the rehearsal this was
     `35557c39e2084b8fd756645c6d7306d1202c7d19335a108dbeecd7bbac08ce09` for a `proxy-check.mjs`
     that differs from the lane's only by the one added line, so **recompute, do not copy**).

   After the recipe: `PIN_UNPINNED` gone, no `GATE_PIN_DRIFT` for `pin.proxy-check`
   (`receipts/proxy-strict-pin.txt`, `## AFTER`). Integrating the script also moves `A` by +1 and
   `A_wave` by +1 per wave `.mjs`; the stanza's declared integers are the L1's close accounting.

3. **The frozen probe must be run at a revision that carries `scripts/receipt-bind.mjs`.**
   Arm 12 picks a *worktree* `scripts/*.mjs` name and reads it at `--rev`; the worktree now has 33
   `scripts/*.mjs` against 32 at `25a3a75d`, the only delta being `scripts/receipt-bind.mjs`
   (`receipts/rev-coverage.txt`, which also shows the mechanism deterministically:
   `FAIL-CLOSED UNRESOLVED self.txt instrument absent at 25a3a75d…: scripts/receipt-bind.mjs`).
   At the freeze rev arm 12 therefore has a 1/33 chance of picking a file the rev lacks; at the
   integration commit M it cannot. **Run the predicate at M (or later), never at
   `db979292…`/`25a3a75d…`.**

4. **`.ufo/waves/round-87/close/` must hold ≥8 plain `*.txt` receipts, each with `rev=` (40
   lowercase hex), `tool_sha256=` = sha256 of **the instrument its own `cmd=` runs** at that rev,
   and `cmd=` whose second token is that instrument.** The rehearsal set that binds clean
   (`receipts/rehearsal-close-dir.txt`) is:

   | file | instrument (second token of `cmd=`) | hashed from |
   |---|---|---|
   | `bind.txt` | `scripts/receipt-bind.mjs` | git |
   | `c1-probe.txt` | `.ufo/waves/round-87/probe/probe87-c1.mjs` | git |
   | `census.txt` | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` | disk (`external=1`) |
   | `map-selftest.txt`, `map.txt` | `scripts/readme-map.mjs` | git |
   | `plan.txt` | `scripts/plan-before-ready.sh` | git |
   | `proxy-selftest.txt`, `proxy.txt` | `scripts/proxy-check.mjs` | git |
   | `ready.txt` | `scripts/ready-handoff.mjs` | git |
   | `selftest.txt` | `scripts/counter-receipt.mjs` | git |
   | `spotcheck.txt` | `scripts/spotcheck-adopt.mjs` | git |

   `rehearse/emit-close-receipts.mjs --lane <lane> --rev <M> --out <lane>/.ufo/waves/round-87/close --work <scratch>`
   computes exactly that pairing (it really runs each command and records its real exit and
   output; red bodies are fine — the gate reads the pair, never the exit code). It is a rehearsal
   harness, not an integrated tool: delete it before close if you do not want its `A_wave` unit.

   Three traps this set demonstrates: a receipt naming a **scratch** path would be hashed from disk
   and fail closed (`UNRESOLVED`) once scratch is cleaned — keep instruments lane-relative; a
   receipt naming an **external** fleet script is digested from disk, so it must be re-digested at
   close time and will read DRIFT if that file changes afterwards (and arm 5 needs exactly one
   mismatch); receipts must be regular files, never symlinks.

## 4. Risks / open items (not mine to close)

1. **The seven blocked arms are blocked by absence, not by a red.** `clean-r87`, `flip-cmd`,
   `flip-hash`, `unchecked`, `unresolved`, `rev-bad`, `symlink` read `no-r87-close` in the lane.
   They are proven end-to-end only in the rehearsal clone (§2.4). The predicate stays `UNMET 5/12`
   until the L1 emits the real close directory **and** measures at the integration commit.
2. **`pin.proxy-check` churn.** Any further edit to `scripts/proxy-check.mjs` (e.g. a sibling's
   candidate) invalidates the pin; recompute it last, after all script edits for the round.
3. **`--rev` coverage** (§3.3) — a base/freeze-rev run can fail arm 12 at random; that would be a
   probe-usage error, not a tool defect, and must not be "fixed" by editing the probe.
4. **Declared limit**: the gate binds claims, not executions. A receipt that names an instrument it
   never ran still binds if the digest matches those bytes. The round's `detect-r86` arm is what
   makes that limit visible in the record (9 of 10 committed receipts name the wrong subject).
5. `A_wave` accounting: my two `.mjs` files under `.ufo/waves/round-87/build/K87ExecBind/` are
   wave runnables and move `A_wave` (as do every other seat's). They are the L1's declared-integer
   problem, flagged here so it is not mistaken for drift caused by a script change.

## 5. Files written

* `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecBind/receipt-bind.mjs` — the candidate.
* `.../build/K87ExecBind/rehearse/emit-close-receipts.mjs` — rehearsal harness (labelled non-integrated).
* `.../build/K87ExecBind/EVIDENCE.md` — index with digests.
* `.../build/K87ExecBind/receipts/` — `selftest.txt`, `detect-r86.txt`, `probe87-integrated-default.txt`,
  `probe87-real-lane.txt`, `probe87-rehearsal-12of12.txt`, `probe87-rehearsal-later-rev.txt`,
  `proxy-strict-pin.txt`, `rehearsal-close-dir.txt`, `rev-coverage.txt`, `determinism.txt`, `cli-samples.txt`.
* This report.

Nothing was written outside `.../build/K87ExecBind/` and `.../w1/K87ExecBind.md`; the frozen
`plan.md`, `probe/`, `controls/`, `scripts/`, `corpus/`, `SCORECARD.md`, `LOG.md`, `SKILL.md`,
`MANIFEST.json` and the fleet root are untouched by this seat (`git status --porcelain` filtered on
those paths shows only sibling-seat edits that predate this run).
