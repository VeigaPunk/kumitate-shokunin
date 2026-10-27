VERDICT: The gate's verdict logic survives attack, but its trust boundary does not — `--selftest` commits a fixture tree into whatever repo `GIT_DIR` names while printing `PASS (33/33)`, answer-path containment is lexical (a symlink answers from outside the root), `--ledger` walks out of the root with `..`, and an O(k·n) tag stripper recomputed per row hangs the gate past 45 s on one 1 MB item.

## Evidence

Target is the frozen blob: `sha256sum scripts/routed-ledger.mjs` → `f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5`, identical to `git show 621212ba…:scripts/routed-ledger.mjs` and to lane HEAD `6c79d68c` (`receipts/repro.log:1-2`). Every reproducer is in `.ufo/waves/round-66/build/K66SentinelTool/repro.sh`; verbatim output in `receipts/repro.log` (108 lines) and `receipts/supplement.log`. Selftest baseline `ROUTED_LEDGER_SELFTEST: PASS (33/33)` exit 0.

Environment mutation (new clone, `git clone --shared`, guard asserted inside the clone):
```
$ GIT_DIR=$S/lane3/.git git -C $D rev-parse --show-toplevel        # $D = mktemp -d
/fast/scratch/…/probe.IAjryW                                       # == $D, so the selftest guard passes
$ GIT_DIR=$S/lane3/.git node tool.mjs --selftest | tail -1
ROUTED_LEDGER_SELFTEST: PASS (33/33)
before: 6c79d68c commits=358      after: 608a0c57 commits=359
608a0c57 fixture
6c79d68c round-66: capture opened sources and record r65 D1 correction evidence
worktree entries now reported deleted: 119
 .ufo/pins/anchor-truth.json   | 8947 ------
```
Root escapes and containment:
```
$ node tool.mjs --root fxL --from 55 --to 55        # fxL/notes/outside.md -> ../outside-answer.md
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=2 rows=2 open=1 closed=1 wontfix=0
root=…/fxL  answer-target=…/outside-answer.md
$ node tool.mjs --root fx --from 55 --to 55 --ledger ../outside-ledger.md
ROUTED_LEDGER: CLEAN …        ledger actually read: …/outside-ledger.md
$ node tool.mjs --root fxA --from 55 --to 55        # D1 answers in the ledger, D2 via hardlink corpus/ledger-hard.md
FINDING ANSWER_DEAD R55-D1@line7:answer-path-not-allowed:corpus/routed-ledger.md
ROUTED_LEDGER: DRIFT … findings=1                    # R55-D2 (alias) accepted
```
Cost and closed vectors:
```
single norm 192KB k=1800 ms=108.2 ; single norm 1MB k=9000 ms=4983
$ time timeout 45 node tool.mjs --root fxbig --from 55 --to 55   # 1 MB item, 20 rows
real 0m45.002s   EXIT=124
--rev=--output=/x → USAGE unknown argument (64) ; --rev --output=/x → USAGE --rev needs a value (64)
--rev -q|-1|-n1|-h|-v|-b|-  → FAIL-CLOSED reason=rev-unreadable:<v> (2)
git show HEAD:../outside-ledger.md → fatal: '../outside-ledger.md' is outside repository (128)
TMPDIR=/nonexistent/x node tool.mjs --selftest → node:fs stack, EXIT=1, stdout-bytes=0
```
Clean-environment strace of `--selftest` (no frozen counter traced): one `chdir` into the fixture; the only absolute write-mode open outside scratch is `/dev/null` (`receipts/repro.log:12-18`).

## Findings

**K66SentinelTool-1 (HIGH)** — `--selftest` mutates the repo named by `GIT_DIR`, contradicting its own docblock `Writes: nothing outside os.tmpdir()` (`:48`). `spawnSync('git', ['-C', D, …])` at `:335` passes no `env`, so `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`/`GIT_OBJECT_DIRECTORY`/`GIT_COMMON_DIR` override `-C`; the selftest's `rev-parse --show-toplevel === D` guard cannot see it because with `GIT_DIR` set the toplevel is the cwd (the fixture). Reachable by the plan's L1 and by the frozen counter's `spawnSync('node',[TOOL,'--selftest'],{env:{...process.env,TMPDIR:T}})` (`probe/ledger66-probe.mjs:119`): the *measurement* moves the lane branch to a 4-file fixture tree, silently, exit 0. Repro: `GIT_DIR=<repo>/.git node scripts/routed-ledger.mjs --selftest` (section F of repro).
**K66SentinelTool-2 (MED)** — the same inheritance redirects `--rev` reads (`:140`, `:144`), so `--root` is advisory: `--root fx --rev 88041bc9` alone is `FAIL-CLOSED rev-unreadable`, but with `GIT_DIR=lane3/.git` it returns lane3's verdict (`ledger-absent:corpus/routed-ledger.md`) — byte-identical to `--root lane3`. A CLEAN can be produced from another repository's history. Repro: section G.
**K66SentinelTool-3 (MED)** — answer containment (`:215`) is lexical; `readFileSync(join(root,p))` (`:131`) follows symlinks, so an answer located outside the root is accepted (`CLEAN` above) and `/etc/passwd` is readable as an answer file. The self-answer guard `p === ledgerNorm` is also lexical: a hardlink or symlink alias of the ledger closes a row against its own text (D2 accepted above). The frozen counter's mirror (`probe/ledger66-probe.mjs:161-162`) shares the string comparison — reported, not patched.
**K66SentinelTool-4 (MED)** — `--ledger ../outside-ledger.md` is read from outside the root and yields `CLEAN`; the absolute form is contained only incidentally (`join(root,'/etc/passwd')` → `ledger-absent`), and `../../../../../../../etc/passwd` is read and parsed (`ledger-has-no-Ledger-section`). No size cap: a 50 MB file is read whole in 36 ms.
**K66SentinelTool-5 (MED)** — `norm`'s `/<script[\s\S]*?<\/script>|<style…>/gi` (`:62`) is O(k·n) and `norm(s.items[k-1])` is recomputed per row (`:214`): 192 KB/1800 tokens = 108 ms, 1 MB/9000 = 5.0 s, and 1 MB × 20 rows does not finish in 45 s (exit 124). One committed spot-check quoting a minified HTML line hangs every gate run, including the counter's 300 s-bounded L2/L4.
**K66SentinelTool-6 (LOW)** — no read cap anywhere; `git show` maps a `maxBuffer` (256 MB) overflow to `null`, reported as `answer-file-absent` / `ledger-absent` instead of an explicit fail-closed reason.
**K66SentinelTool-7 (LOW)** — `--selftest` with an unwritable/absent TMPDIR dies with a raw Node stack (exit 1, no `ROUTED_LEDGER_SELFTEST:` line, `stdout-bytes=0`, no cleanup); no `process.on` handler, so SIGINT mid-run leaves a git repo in TMPDIR. Fails closed on exit code, so L1 would not false-pass.
**K66SentinelTool-8 (INFO, closed)** — `--rev` injection is not possible: equals-form and `--`-prefixed values give `USAGE` 64, every single-dash value fails `rev-parse` → `FAIL-CLOSED` 2, argv arrays with no shell. `git show REV:../x` is refused by git (128). Cosmetic: `val()` (`:340`) rejects only `--`, so single-dash strings reach git — verdict still correct.

## Artifacts

- `.ufo/waves/round-66/build/K66SentinelTool/review.md` — full review, per-finding impact and smallest remediation.
- `.ufo/waves/round-66/build/K66SentinelTool/proposed-hardening.md` — draft hunks H1–H6 + the five selftest cases the ratchet should add (unapplied; L1 integrates).
- `.ufo/waves/round-66/build/K66SentinelTool/repro.sh` — the 9-section reproducer; `receipts/repro.log`, `receipts/supplement.log`.
- This report: `.ufo/waves/round-66/w1/K66SentinelTool.md`.

## Limits

Not measured: a >256 MB blob (F6 argued from `:140` + the `status !== 0 → null` mapping); SIGINT cleanup (argued from `grep -c 'process.on'` = 0); Windows path semantics. The counter's own `bash -c "git -C \"${lane}\" archive …"` (`:50`) and inherited `env` (`:119`) are frozen artifacts — noted, not probed further, out of this seat's surface. No remediation applied: `scripts/` is L1-owned; the lane's tool blob was unchanged throughout (`f92a364d…` at HEAD `6c79d68c`). Scratch `/fast/scratch/hyaku/kumitate-r66/K66SentinelTool/` deleted after the receipts were copied.
