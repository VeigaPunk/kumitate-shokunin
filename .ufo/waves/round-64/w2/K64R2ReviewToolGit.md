VERDICT: `scripts/report-receipt-diff.mjs` v2 (`2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`) diverges between worktree mode and `--rev` mode on 6 of the 10 tested git/worktree cases (nested dirs, newline filenames, symlinked receipt dirs, in-ODB gitlinks, deleted/untracked receipts, and `--rev HEAD~1`/empty `--rev=`) and leaves `--report` bytes unbound to any git blob hash.

## Evidence

Lane commit `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (freeze `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`, base `6825a51425e91908f019ed65aa2f4209acbd7087`). All fixtures created under `/tmp/kumitate-r64/K64R2ReviewToolGit/` via `D=$(mktemp -d) && git -C "$D" init -q`, `git -C "$D" rev-parse --show-toplevel` verified equal to `"$D"`, commits inside `"$D"` with `-c user.name=fixture -c user.email=fixture@example.invalid`. Reproduction driver: `node /tmp/kumitate-r64/K64R2ReviewToolGit/run-matrix.mjs` and `node /tmp/kumitate-r64/K64R2ReviewToolGit/run-extra.mjs`.

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs --selftest
REPORT_RECEIPT_SELFTEST: PASS (52/52)   [exit 0]
```

### Worktree vs `--rev` Equivalence Matrix (`scripts/report-receipt-diff.mjs` v2)

| # | Fixture case | Worktree mode (no `--rev`) | Rev mode (`--rev <rev>`) | Same verdict? | Why |
|---|---|---|---|---|---|
| 1 | Nested receipt dir `close/sub/p-tip.txt` | `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | `exit=0 CLEAN` | **NO** | `ls-tree -r` recurses (`:95`); `readdirSync` (`:104`) does not, `lstatSync.isFile()` skips `sub/` |
| 2a | Space name `close/space name.txt` (uncited / cited) | `exit=0 CLEAN` / `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | `exit=0 CLEAN` / `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | **YES** (both fail when cited) | `RECEIPT_PATH` (`:47`) stops at space (`close/space`), truncating `cited(line)` |
| 2b | Newline name `close/nl\nname.txt` (uncited / glob `nl*`) | `exit=0 CLEAN` | `exit=1 DRIFT TALLY_UNRECEIPTED` (or `+RECEIPT_MISSING`) | **NO** | `/^(\d{6}) \w+ [0-9a-f]+\t(.+)$/` (`:98`) lacks `/s` (`dotAll`), so `.+` fails on `\n` and drops the file in rev mode |
| 2c | Non-ASCII `close/nonascii-日本.txt` (uncited / cited) | `exit=0 CLEAN` / `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | `exit=0 CLEAN` / `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | **YES** (both fail when cited) | `RECEIPT_PATH` (`:47`) is ASCII-only (`[A-Za-z0-9._*/-]*`), truncating at `日本` |
| 3 | 70 MB receipt `close/big.txt` | `exit=0 CLEAN` | `exit=0 CLEAN` | **YES** | v2 raised `git show` `maxBuffer` to 256 MB (`:100`) |
| 4a | Symlinked receipt file `close/link.txt -> ../../../outside.txt` | `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | **YES** | `:99` skips mode `120000`; `:107` `lstatSync(p).isFile()` skips symlink |
| 4b | Symlinked receipt dir `.ufo/waves/round-9/base -> ../../outside-dir` | `exit=0 CLEAN` | `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | **NO** | `existsSync` + `readdirSync` (`:103-104`) follow dir symlinks; `lstatSync` only checks leaf `p-base.txt` |
| 5a | Gitlink `160000` to external commit (absent from lane ODB) | `exit=1 DRIFT RECEIPT_MISSING` | `exit=1 DRIFT RECEIPT_MISSING` | **YES** | `git show <rev>:<gitlink>` exits 128 (`b.status !== 0`) |
| 5b | Gitlink `160000` to commit present in lane ODB (`seedSha`) | `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | `exit=0 CLEAN` | **NO** | `:98-101` matches `160000 commit` (`m[1] !== '120000'`); `git show` dumps commit message + diff as receipt text |
| 6 | Receipt deleted in worktree, committed at `HEAD` | `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | `exit=0 CLEAN` | **NO** | By design: worktree reads live FS, `--rev` reads tree at `rev` |
| 7 | Receipt untracked in worktree, absent at `HEAD` | `exit=0 CLEAN` | `exit=1 DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` | **NO** | Worktree mode trusts untracked files (`readdirSync` without `git ls-files`) |
| 8a | `--rev` as tag (`v1-light`), annotated tag (`v1-ann`), branch, `9be15fa` | `exit=0 CLEAN` | `exit=0 CLEAN` | **YES** | `:287` `rev-parse --verify <rev>^{commit}` peels all to `HEAD` |
| 8b | `--rev HEAD~1` (report cites `HEAD` commit `c2`) | `exit=0 CLEAN` | `exit=1 DRIFT HASH_ORPHAN` | **NO** | `tip` is `HEAD` in worktree mode vs `HEAD~1` in rev mode (`:156-166`) |
| 8c | `--rev=`, `--rev ""`, or trailing `--rev` (with untracked receipt) | `exit=0 CLEAN (rev=worktree)` | `exit=1 DRIFT` (at `--rev HEAD`) | **NO** | `:285-286` `if (revFull)` is falsy on `''`/`undefined`, silently falling back to worktree mode |
| 9 | Shallow clone `git clone --depth 1` (report cites base `c1` & tip `c2`) | `exit=1 DRIFT HASH_DEAD 4570094d...` (vs `exit=0 CLEAN` in full repo) | `exit=1 DRIFT HASH_DEAD 4570094d...` (vs `exit=0 CLEAN` in full repo) | **YES** (both false-DRIFT vs full repo) | Grafted parent `c1` is absent from shallow ODB; `cat-file -e c1^{commit}` (`:163`) fails |
| 10a | `--fleet` at non-repo outside git (report cites fleet hash) | `exit=1 DRIFT HASH_DEAD` (or `exit=0 CLEAN` if no fleet hash) | `exit=1 DRIFT HASH_DEAD` (or `exit=0 CLEAN` if no fleet hash) | **YES** (neither fails closed exit 2) | `--fleet` is never validated (`:293`); `git -C fleet cat-file` exits 128 → `inFleet=false` |
| 10b | `--fleet` at plain non-repo subdir inside an ancestor git repo | `exit=0 CLEAN` | `exit=0 CLEAN` | **YES** (both false-CLEAN) | `git -C <subdir>` walks up `..` to ancestor `.git` and accepts its commits |

### Report-Bytes Binding Analysis (`--report` read from disk after `--rev`)

`scripts/report-receipt-diff.mjs:292,295` reads `--report` from disk via `readFileSync(resolve(report), 'utf8')` and prints `REPORT_RECEIPT: CLEAN (round=N rev=<M> bytes=<B>)`. **Nothing in the verdict or committed lane tree is cryptographically bound to the report bytes**:
- The L1 commits lane tip `M` (including `.ufo/waves/round-64/close/*`) *before* filing the round report in the fleet repo (since the report must cite `M`).
- Only `bytes=<B>` (byte length) appears in the output line. In `run-extra.mjs` case E, mutating `report.md` on disk after `M` from `X9_HELD held=3/3` to `X9_PASS held=9/9` (same byte length `219`) yields the byte-identical verdict `REPORT_RECEIPT: CLEAN (round=9 rev=b9ece5100d61b5137a74fcdb6d7e7e29eba41ef9 bytes=219)` (`exit 0`).
- **What a non-author verifier must pin for a reproducible diff**:
  1. **Report blob hash**: `git hash-object -t blob -- <report>` (40-hex git blob OID) or `sha256sum <report>` (or the fleet commit + path `<fleet-rev>:.ufo/reports/round-N/kumitate.md`).
  2. **Lane commit (`--rev <40-hex>`)**: exact 40-hex lane commit `M` (shallow clone forbidden: `git -C <lane> rev-parse --is-shallow-repository` must be `false`).
  3. **Tool blob hash**: `git rev-parse <M>:scripts/report-receipt-diff.mjs` (currently `35a5a124...` sha256).
  4. **Fleet commit (`<fleet-rev>`)**: `inFleet` (`:164`) queries `git -C fleet cat-file -e <h>^{commit}` against whatever objects happen to exist in `--fleet` at runtime without checking ancestry against a pinned fleet revision.

## Findings

- **K64R2ReviewToolGit-1 (high)** — Attacks `scripts/report-receipt-diff.mjs:98-101` (gitlink `160000` accepted as receipt in `--rev` mode; newline receipt filenames silently dropped in `--rev` mode). `/^(\d{6}) \w+ [0-9a-f]+\t(.+)$/` matches `160000 commit <sha>\t<path>` (`m[1] !== '120000'`); if `<sha>` exists in the lane ODB, `git show <rev>:<path>` exits 0 and injects the commit's log message + patch as a valid receipt (`5b`: rev mode `CLEAN` exit 0 vs worktree `DRIFT` exit 1). Conversely, without `/s`, `.+` fails on filenames containing `\n`, dropping committed newline receipts in rev mode while worktree mode reads them (`2b`: worktree `CLEAN` exit 0 vs rev mode `DRIFT` exit 1). Repro: `node /tmp/kumitate-r64/K64R2ReviewToolGit/run-matrix.mjs` cases `2b-i`, `2b-ii`, `5b`. Minimal diff:
  ```js
  const m = /^(100\d{3}) blob ([0-9a-f]+)\t([\s\S]+)$/.exec(row);
  if (!m) continue;
  const b = spawnSync('git', ['-C', lane, 'cat-file', 'blob', m[2]], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (b.status === 0) receiptNames.set(m[3], b.stdout);
  ```
- **K64R2ReviewToolGit-2 (high)** — Attacks `scripts/report-receipt-diff.mjs:103-111` (worktree mode follows symlinked `base/`/`close/` parent directories and ignores nested subdirectories). `existsSync(join(lane, rel))` and `readdirSync` follow directory symlinks, while `lstatSync(p).isFile()` only checks the leaf entry; a symlink `.ufo/waves/round-9/base -> ../../outside-dir` reads `CLEAN` (exit 0) in worktree mode vs `DRIFT` (exit 1) in rev mode (`4b`). Conversely, `readdirSync` is flat, so `close/sub/p-tip.txt` reads `DRIFT` (exit 1) in worktree mode vs `CLEAN` (exit 0) in rev mode (`1a`, `1b`). Repro: `node /tmp/kumitate-r64/K64R2ReviewToolGit/run-matrix.mjs` cases `1a`, `1b`, `4b`. Minimal diff: walk `['.ufo', 'waves', 'round-' + round, d]` and subdirectories with `lstatSync(p).isDirectory()`, never traversing symlinks (`walkWorktreeReceipts` in `build/K64R2ReviewToolGit/report-receipt-diff.patch`).
- **K64R2ReviewToolGit-3 (high)** — Attacks `scripts/report-receipt-diff.mjs:278-290` (`--rev=`, `--rev ""`, and trailing `--rev` silently drop to worktree mode). When a caller passes `--rev "$REV"` with an empty `$REV`, `--rev=`, or unquoted trailing `--rev`, `opt('--rev')` returns `''` or `undefined` (falsy); `if (revFull)` (`:286`) is skipped and `diffReport` runs in worktree mode (`rev=worktree`), accepting untracked/dirty worktree receipts with `exit 0` instead of failing closed (`exit 2`). Repro: `node /tmp/kumitate-r64/K64R2ReviewToolGit/run-matrix.mjs` cases `8c-i..iii`. Minimal diff: `if (argv.includes('--rev') && (!revFull || revFull.startsWith('-'))) { process.stdout.write(...); process.exit(2); }`.
- **K64R2ReviewToolGit-4 (medium)** — Attacks `scripts/report-receipt-diff.mjs:164,293` (`--fleet` is never validated as a git toplevel). Passing `--fleet /nonexistent` or a non-repo outside git exits 0 (`CLEAN`) when no fleet hash is cited (`10b`) or misreports fleet hashes as `DRIFT HASH_DEAD` (exit 1) instead of `FAIL-CLOSED` (exit 2) (`10a`). Passing a plain non-repo directory inside an ancestor git repo (`10c`) causes `git -C fleet` to walk up `..` and trust the ancestor repo's object DB. Repro: `node /tmp/kumitate-r64/K64R2ReviewToolGit/run-matrix.mjs` cases `10a..10c`. Minimal diff: when `argv.includes('--fleet')`, verify `git(fAbs, ['rev-parse', '--show-toplevel'])` exits 0 and matches `realpathSync(fAbs)`, else exit 2 `FAIL-CLOSED fleet-unreadable`.
- **K64R2ReviewToolGit-5 (medium)** — Attacks `scripts/report-receipt-diff.mjs:120-129,149` (glob `*` and directory `/` citations bypass `RECEIPT_EMPTY`, and directory citations on a tally line cause false `TALLY_UNRECEIPTED`). Lines `120-127` `continue` on `p.endsWith('/')` and `p.includes('*')` without checking `.trim()`, so a 0-byte `empty.txt` satisfies `.ufo/waves/round-9/close/` and `.ufo/waves/round-9/close/empty*` as `CLEAN` (`exit 0`). Line `149` checks `sp.includes('*') ? globRe(sp).test(h.file) : sp === h.file`, omitting `sp.endsWith('/') ? h.file.startsWith(sp)`, so citing `.ufo/waves/round-9/close/` on a tally line always emits false `TALLY_UNRECEIPTED`. Repro: `node /tmp/kumitate-r64/K64R2ReviewToolGit/run-extra.mjs` cases `C2`, `C3` and `run-matrix.mjs` case `1c`.
- **K64R2ReviewToolGit-6 (medium)** — Attacks `scripts/report-receipt-diff.mjs:159-161` (`inUrl(raw)` global hash deduplication lets a URL exempt a standalone dead/orphan commit claim of the same hash). `for (const raw of new Set(text.match(HASH) || []))` calls `inUrl(raw)` across `textLines.some(...)`; placing `https://github.com/x/y/commit/<dead40>` anywhere in the report silences `HASH_DEAD` and `HASH_ORPHAN` for standalone `Landed commit <dead40>` claims elsewhere in the report. Repro: `node /tmp/kumitate-r64/K64R2ReviewToolGit/run-extra.mjs` case `D` (`exit=0 CLEAN`). Minimal diff: strip URL tokens from a copy of `text` before `match(HASH)` instead of filtering `Set` entries by `textLines.some`.
- **K64R2ReviewToolGit-7 (medium)** — Attacks `scripts/report-receipt-diff.mjs:163-166,292-295` (shallow clone false `HASH_DEAD` and unbound `--report` bytes). In a `--depth 1` clone (`9b`), grafted ancestor commits fail `cat-file -e <h>^{commit}` and read `HASH_DEAD`. Meanwhile, `render()` records only `bytes=<B>`, not `report_sha256`, so same-length edits to `--report` after `--rev` leave the verdict line identical (`run-extra.mjs` case `E`). Minimal diff: append `report_sha256=<12-hex>` to `meta` (`build/K64R2ReviewToolGit/report-receipt-diff.patch`; verified `SELFTEST: PASS (61/61)`, 37/37 P2 controls pass, P3 `r60`/`r63` preserved).

## Artifacts

- `.ufo/waves/round-64/w2/K64R2ReviewToolGit.md` (this report)
- `.ufo/waves/round-64/build/K64R2ReviewToolGit/report-receipt-diff.v3.mjs` (full-file draft, `SELFTEST: PASS (61/61)`)
- `.ufo/waves/round-64/build/K64R2ReviewToolGit/report-receipt-diff.patch` (unified diff against `2ed8a5f8`)
- `/tmp/kumitate-r64/K64R2ReviewToolGit/{run-matrix.mjs,run-extra.mjs,verify-v3.mjs}` (scratch reproducers)

## Limits

- `xd://lsp` is not mounted in this environment (`No such tool: xd://lsp`); callers were enumerated via `grep` fallback.
- No tools were installed or upgraded (`node` v24.21.0 and `git` 2.56.0 pre-installed).
- Did not test partial clones (`--filter=blob:none` with unreachable promisor remote) or >256 MB single blobs.
