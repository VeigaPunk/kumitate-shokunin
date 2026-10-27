# Adversarial safety review — `scripts/routed-ledger.mjs` (K66SentinelTool)

VERDICT: the gate's *logic* holds under attack (no false CLEAN from `--rev` injection, from absolute/`..`
answer paths, or from `git show REV:../x`), but its *trust boundary* does not: the selftest inherits the
caller's git environment and commits into whatever repo `GIT_DIR` names while printing `PASS (33/33)`;
answer-path containment is lexical and a symlink defeats it; and an O(k·n) tag stripper recomputed per
row lets one 1 MB item hang the gate past 45 s.

- Target: `scripts/routed-ledger.mjs`, contract `kumitate-routed-ledger-v1`, blob at freeze
  `621212bac37f8249c72ac982d1d6534cb8d60701` — sha256 `f92a364d…d6ff3bf5`, still identical at lane HEAD
  `6c79d68c` when this review ran (both hashes printed in `receipts/repro.log:1-2`).
- Method: 20+ probes against copies and fixtures; `strace -f` on `--selftest` only (no frozen counter was
  traced); one `git clone --shared` sandbox to measure the repo mutation. Every command is in
  `repro.sh`; the run's verbatim output is `receipts/repro.log` and `receipts/supplement.log`.
- Axes: operability (the tool is the gate; a gate that mutates the repo it is checking, or can be hung,
  costs more than no gate). Nothing was patched; `proposed-hardening.md` holds the draft hunks.

---

## F1 (HIGH) `--selftest` commits into the repo named by `GIT_DIR` — outside `os.tmpdir()`

The docblock promises "Writes: nothing outside os.tmpdir()" (`:48`). But `selftest()` builds its fixture
repo with `spawnSync('git', ['-C', D, …])` (`:335`) and passes no `env`, so the caller's `GIT_DIR`,
`GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY` and `GIT_COMMON_DIR` override `-C`. The
selftest's own guard — `resolve(rev-parse --show-toplevel) === resolve(D)` — does not catch it, because
with `GIT_DIR` set and no `GIT_WORK_TREE`, `--show-toplevel` prints the **cwd**, which is the fixture.

```
$ GIT_DIR=$S/lane3/.git git -C $D rev-parse --show-toplevel   # $D = mktemp -d
/fast/scratch/hyaku/kumitate-r66/K66SentinelTool/probe.IAjryW
$ GIT_DIR=$S/lane3/.git node tool.mjs --selftest | tail -1
ROUTED_LEDGER_SELFTEST: PASS (33/33)
before: 6c79d68c commits=358      after: 608a0c57 commits=359
608a0c57 fixture
6c79d68c round-66: capture opened sources and record r65 D1 correction evidence
worktree entries now reported deleted: 119
```
(`receipts/repro.log`, section F.) The injected commit's tree replaces the lane's tree (the `--stat` shows
`.ufo/pins/anchor-truth.json | 8947 ------`), i.e. HEAD's tree became the 4-file selftest fixture while the
worktree stayed put. `GIT_INDEX_FILE=$S/idx` alone also writes a 550-byte index outside TMPDIR and still
prints PASS (`receipts/repro.log:96-97`). With a clean environment the strace is clean: the only absolute
write-mode open outside the scratch dir is `/dev/null`, and the only `chdir` is into the fixture
(`receipts/repro.log:12-18`) — so the leak is *only* reachable through the environment.

**Attack.** The frozen counter runs exactly this command — `node TOOL --selftest` with
`env: { ...process.env, TMPDIR: T }` (`probe/ledger66-probe.mjs:119`) — as does L1 of the plan. Any
harness, CI job or seat that exports `GIT_DIR` (a common scripting idiom, and the fleet's own git-heavy
agents set git vars) makes the *measurement* commit a fixture onto the lane branch: branch moved,
`status` shows 119 deletions, no error surfaced, `--selftest` still exits 0.

**Impact.** Uncommanded mutation of the repository under test, by the very artifact that is supposed to be
read-only; a lane branch whose HEAD tree is now a 4-file fixture. Severity is HIGH because the failure is
silent and the fix is one `env:` argument.

**Smallest remediation.** Scrub the git environment once (`GIT_ENV` in `proposed-hardening.md` H1) and pass
it to all four `spawnSync` sites; add a selftest case that runs with `GIT_DIR` pointing at a second repo
and asserts its commit count is unchanged.

## F2 (MEDIUM) the same inheritance redirects `--rev` reads — `--root` becomes advisory

`makeReader` runs `git -C root show rev:path` (`:140`) and `ls-tree` (`:144`) with the inherited env, so
with `GIT_DIR` set the gate reads another repository while `--root` says otherwise:

```
$ node tool.mjs --root $S/fx --from 55 --rev 88041bc9
ROUTED_LEDGER: FAIL-CLOSED reason=rev-unreadable:88041bc9
$ GIT_DIR=$S/lane3/.git node tool.mjs --root $S/fx --from 55 --rev 88041bc9
ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md
$ node tool.mjs --root $S/lane3 --from 55 --rev 88041bc9     # identical output
ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md
```
(`receipts/repro.log`, section G.) The second line is the *lane3* verdict, produced from a run that named
`--root fx`. A CLEAN can therefore be manufactured from a different repository's history —
the `git` binary is trusted, the environment is not.

**Remediation.** H1. Same fix, same test.

## F3 (MEDIUM) answer-path containment is lexical: a symlink inside the root answers from outside

`:215` refuses `isAbsolute`, `startsWith('..')`, the ledger name and spot-check names — string tests only;
`:131` then does `readFileSync(join(root, p))`, which follows symlinks.

```
$ ln -sf $S/outside-answer.md $S/fxL/notes/outside.md    # target is outside the root
$ node tool.mjs --root $S/fxL --from 55 --to 55
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=2 rows=2 open=1 closed=1 wontfix=0
root=…/fxL  answer-target=…/outside-answer.md
```
(`receipts/repro.log`, section C; the absolute-path control immediately above it correctly gives
`ANSWER_DEAD … answer-path-not-allowed:/etc/passwd`.) The same hole closes an item against `/etc/passwd`:
`notes/outside.md -> /etc/passwd` yields `answer-quote-not-at` rather than `answer-file-absent`, i.e. the
file *was read*.

**The self-answer guard is lexical too.** `p === ledgerNorm` refuses the ledger by name, so any alias works:
with `ln` (hardlink) `corpus/ledger-hard.md` and a symlink `corpus/ledger-link.md`, a row that quotes its
own line through the alias is accepted —

```
$ node tool.mjs --root $S/fxA --from 55 --to 55
FINDING ANSWER_DEAD R55-D1@line7:answer-path-not-allowed:corpus/routed-ledger.md   # direct path: refused
ROUTED_LEDGER: DRIFT … findings=1                                                  # R55-D2 via ledger-hard.md: accepted
```
Both aliases are committed to git with one `ln -s` (mode 120000) — legal in any lane commit — and the
frozen counter's independent mirror (`probe/ledger66-probe.mjs:161-162`) uses the same string comparison,
so the alias would satisfy its "answer outside the ledger" clause as well. (Frozen: reported, not patched.)

**Impact.** A gate whose contract is "the answer is a located lane line" can be satisfied by a line in
another repository, in `/etc/passwd`, or in the ledger itself. **Remediation.** H2 — `realpath` containment
and identity comparison, plus the two selftest cases.

## F4 (MEDIUM) `--ledger` accepts a path that resolves outside the root

`join(root, p)` normalises `..` away from the root (`:131`), and nothing validates the ledger path:

```
$ node tool.mjs --root $S/fx --from 55 --to 55 --ledger ../outside-ledger.md
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=2 rows=2 open=1 closed=1 wontfix=0
ledger actually read: /fast/scratch/hyaku/kumitate-r66/K66SentinelTool/outside-ledger.md
$ node tool.mjs --root $S/fx --from 55 --to 55 --ledger ../../../../../../../etc/passwd
ROUTED_LEDGER: FAIL-CLOSED reason=ledger-has-no-Ledger-section:../../../../../../../etc/passwd
```
(`receipts/repro.log`, section E; the absolute form is *contained* — `join` yields `root/etc/passwd` and the
run is `ledger-absent` — which makes the asymmetry worse, not better: a relative escape silently succeeds.)
**Impact.** The "ledger at that path" binding can be satisfied by a file outside the repository, and any
readable file is parsed as a ledger (5 MB → 5 000 000 cells in 52 ms; 50 MB read whole in 36 ms,
`receipts/supplement.log`). **Remediation.** H2's ledger gate + H4's size cap.

## F5 (MEDIUM) `norm` is O(k·n) and is recomputed per row — a 1 MB item hangs the gate

`:62`'s `/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi` scans to end-of-string from every opening
token that has no closing partner; `norm(s.items[k - 1])` runs inside the row loop (`:214`), so the cost is
rows × k × n:

```
single norm 192KB k=1800 ms=108.2
single norm 1MB   k=9000 ms=4983
$ time timeout 45 node tool.mjs --root fxbig --from 55 --to 55   # 1 MB item, 20 rows
real 0m45.002s   EXIT(timeout)=124
```
(`receipts/repro.log`, section H.) The tool takes no timeout of its own, so one committed spot-check whose
routed item quotes a minified HTML line (or simply many `<style` tokens, as a captured page would) burns
minutes on every gate run — including the frozen counter's L2/L4, which spawn the tool with
`timeout: 300000`. **Remediation.** H3 — linear `stripRaw` plus a per-item `norm` memo; ratchet with a
1 MB × 20-row selftest case under a wall-clock bound.

## F6 (LOW) no size cap on any read; a >256 MB blob is silently "absent"

`readFileSync` at `:131` has no limit (a 50 MB ledger is read whole: `receipts/supplement.log`), while
`git show` carries `maxBuffer: 256 MB` (`:140`) and maps a buffer overflow to `status !== 0 → null`, which
callers read as "absent" (`ANSWER_DEAD … answer-file-absent`, `ledger-absent`) rather than as an explicit
fail-closed. Same class, two shapes. **Remediation.** H4 plus a distinct `reason=read-overflow` when
`spawnSync` returns `error.code === 'ENOBUFS'`.

## F7 (LOW) `--selftest` crashes with a raw stack trace when TMPDIR is unusable

```
$ TMPDIR=/nonexistent/x node tool.mjs --selftest
node:fs:3134 … Error: ENOENT: no such file or directory, mkdtemp '/nonexistent/x/routed-ledger-st.XXXXXX'
EXIT=1   stdout-bytes=0
```
(`receipts/supplement.log`.) No `ROUTED_LEDGER_SELFTEST: FAIL` line, no cleanup, and the same for a
read-only TMPDIR (EACCES). There is also no signal handler (`grep -c 'process.on'` = 0), so SIGINT/SIGTERM
mid-run leaves a git repo in TMPDIR. The exit code is still non-zero, so L1 fails correctly — this is a
shape/operability defect, not a false pass. **Remediation.** H5.

## F8 (INFO, closed) argument injection via `--rev` does not work

Every option-shaped value either fails the CLI or fails `rev-parse`, and no value is ever a shell word
(`spawnSync` argv array, no `sh -c`):

```
--rev=--output=/x → ROUTED_LEDGER: USAGE unknown argument --rev=--output=/x            (64)
--rev --output=/x → ROUTED_LEDGER: USAGE --rev needs a value                          (64)
--rev -q|-1|-n1|-h|-v|-b|- → ROUTED_LEDGER: FAIL-CLOSED reason=rev-unreadable:<v>     (2)
--rev --quiet     → ROUTED_LEDGER: USAGE --rev needs a value                          (64)
```
(`receipts/repro.log`, section B.) One cosmetic gap: `val()` (`:340`) rejects only `--`-prefixed values, so
a single-dash string reaches git instead of the CLI; git refuses it, so the verdict is correct. `git show
REV:../x` is refused by git itself — `fatal: '../outside-ledger.md' is outside repository`, exit 128 →
`FAIL-CLOSED` (`receipts/supplement.log`) — so the `--rev` reader cannot be walked out of the repo with
`..`. **Remediation.** Optional H6.

---

## What held (checked, no finding)

- Verdict discipline: every path reviewed ends in CLEAN / DRIFT / FAIL-CLOSED / USAGE with the documented
  exit code; unreadable rev, absent ledger, missing `## Ledger`, empty range all fail closed.
- `--` handling: `--from`/`--to` non-integers → USAGE 64; `--from -5` parses to an integer but cannot
  inject (no shell).
- Binary spot-check (200 KB of `/dev/urandom`) → no crash, section not found, verdict unchanged.
- Clean-environment `--selftest` writes: only `/dev/null` and paths under TMPDIR; single `chdir` into the
  fixture; TMPDIR is removed (no leftover after the run).
- Answer regex on 1 MB cells (no colon / many colons / many quotes): ≤ 1.1 ms — no backtracking blow-up
  there; the pathology is confined to `norm` (F5).

## Limits

- Not run: a >256 MB blob in a repo (F6 is argued from `maxBuffer` + the `status !== 0 → null` mapping,
  not measured); SIGINT-mid-run cleanup (argued from the absence of handlers); Windows path semantics.
- The counter's own shell use (`probe/ledger66-probe.mjs:50`, `bash -c "git -C \"${lane}\" archive …"`) and
  its inherited `env` at `:119` are frozen artifacts; F1/F3 note the exposure but were not probed further —
  out of this seat's surface, and not patchable here.
- No integration: the L1 owns `scripts/`; `proposed-hardening.md` is a draft, unapplied.
