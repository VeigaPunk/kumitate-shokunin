# K88Sentinel — boundary review of `receipt-bind` v2 (C1, round 88)

Seat: sentinel, round 88, wave w1. Leaf seat: no dispatch. Nothing committed, staged or checked out
in the lane or fleet repo. I read `plan.md` and `probe/probe88-c1.mjs` before doing anything else and
edited neither.

## 0. Subject, pinning, method

| field | value |
|---|---|
| target | `scripts/receipt-bind.mjs` @ `0ff3562f15c18d0ca01dc6a76c9f827d30c26950`, sha256 `098a6713e663cbb9444ea6ec1da503cbf4bba5690c492b5ec9e73f9ee6cace4d`, selftest `PASS held=39/39` |
| how it was executed | from a clean `git clone --shared` checkout of 0ff3562 under scratch (`git status` empty). Every receipt says `cmd=node scripts/receipt-bind.mjs …` with `rev=0ff3562…`, plus an `exec:` line naming the absolute file that ran |
| lane HEAD | `8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`. Fixtures bind `scripts/proxy-check.mjs` at this rev |
| frozen probe | `probe88-c1.mjs` sha256 `5ccd01ec459eacc5b9ae08717cc6154c08e09880d2580f9128fa9390c6739d2b` |
| **pinning incident** | During the review another writer modified the lane **worktree** `scripts/receipt-bind.mjs` (now sha256 `1f11f124…`, 625 lines, 59 selftest arms; `git status`: ` M scripts/receipt-bind.mjs`). My first pass ran the worktree path, so I deleted every first-pass artifact and re-ran everything against the pinned 0ff3562 bytes. The pinned verdicts match the first pass row for row; only the race counts and RSS figures moved. |
| self-binding | `node <0ff3562>/scripts/receipt-bind.mjs --dir <copy of edges/ inject/ races/ harness + probe receipts> --rev 8e4ea5f6… --lane <lane>` → `RECEIPT_BIND: CLEAN matched=55 mismatched=0 unchecked=0 external=0`, exit 0. The `controls/*.txt` receipts name untracked build-dir files, so they bind only once those files are committed. |

Harness re-run, exactly as assigned:

```
cd /fast/scratch/hyaku/kumitate-r88/K88Sentinel && \
TOOL=/fast/scratch/hyaku/kumitate-r88/K88Sentinel/lane0ff/scripts/receipt-bind.mjs \
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin SCRATCH=/fast/scratch/hyaku/kumitate-r88/K88Sentinel \
TMPDIR=/fast/scratch/hyaku/kumitate-r88/K88Sentinel/tmp \
bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Sentinel/probe-boundary.sh
# harness exit=0   receipt: build/K88Sentinel/harness-r87-on-v2.txt
```

The new edges come from `build/K88Sentinel/probe-edges-v2.sh` (one receipt per case in `edges/`),
`probe-inject-v2.sh` (`inject/`) and `race-v2.py` (`races/`, N=400 per race). All three ran with the
same pinned `TOOL=`, `CMDTOOL=scripts/receipt-bind.mjs` and `TREV=0ff3562…`.

## 1. Frozen probe and controls (pinned)

| subject | result | receipt |
|---|---|---|
| integrated 0ff3562 | `C88_C1: HELD held=20/20` exit 0 | `build/K88Sentinel/probe88-on-0ff3562.txt` |
| worktree twin of 0ff3562 (`controls/make-worktree-variant.mjs`) | `C88_C1: UNMET held=10/20` exit 1. The lane worktree is dirty, so part of this comes from that | `build/K88Sentinel/controls/twin-0ff3562.txt` |
| **seat control `ctl-escape-prefix.mjs`** (sha `ce20d32f…`) | **`C88_C1: HELD held=20/20` exit 0**, own selftest 39/39 | `controls/ctl-escape-prefix.txt` |
| **seat control `ctl-read-then-cap.mjs`** (sha `e0bd3df6…`) | **`C88_C1: HELD held=20/20` exit 0**, own selftest 39/39 | `controls/ctl-read-then-cap.txt` |

**Kill rule (plan lines 30–34): two seat-constructed controls reach 20/20.** Both come from
`make-seat-controls.mjs`, which applies one exact-string rewrite to the 0ff3562 source:

* **K88-S1 `ctl-escape-prefix`** raises ESCAPES_LANE only when the token *text* starts with `../`.
  Any other relative token that resolves outside the lane keeps v1's disk read. The probe's
  `escape-relative` arm uses only `../outside/ext.mjs`, and 0ff3562's own selftest has no interior-`..`
  case, so the control passes every arm. Evidence that it skips the claimed boundary: with
  `cmd=node scripts/../../../../../../etc/hostname` and the digest of `/etc/hostname`, 0ff3562 gives
  `FAIL-CLOSED ESCAPES_LANE` exit 2 (`controls/esc-demo-receipt-bind.txt`) and the control gives
  `CLEAN matched=1 mismatched=0 unchecked=0 external=1` exit 0 (`controls/esc-demo-ctl-escape-prefix.txt`).
  The modified worktree selftest adds `escapes-lane-interior-dotdot`. That makes this control fail
  the `selftest` arm against the new worktree bytes, but it does not change the frozen probe, and the
  frozen probe judges a candidate's selftest only by its own claim.
* **K88-S2 `ctl-read-then-cap`** moves the size check after `readFileSync`. The plan (line 64) defines
  RECEIPT_TOO_LARGE as "refused **before it is read**". The probe sees only the token, not the read.
  On a 64 MiB receipt both tools print `FAIL-CLOSED RECEIPT_TOO_LARGE … 67109024 bytes` exit 2, but
  max RSS is 57932 kB (0.18 s) for 0ff3562 and 188504 kB (0.37 s) for the control (`controls/rss-*.txt`).

I reported both to the L1 mid-wave. The L1 acknowledged (C1 UNMET; they match critic f1/f4). Applying
the rule is the L1's call. My reading: K88-S2 skips a sub-property written into the claim sentence
and K88-S1 skips the boundary for a class of inputs, so each counts as a by-construction skip.

## 2. Round-87 rows, v1 vs v2 (row ids from `round-87/w1/K87Sentinel.md`)

Rows 1e and 2d come from the round-87 "extra" transcript (1j/1k′/1l, 2d/2e/2f). I re-ran them in
`edges/x*.txt`. The other rows come from the harness.

| row | case | v1 (K87, observed) | v2 0ff3562 (observed line, exit) | verdict |
|---|---|---|---|---|
| 1a | `../../etc/passwd` | `UNRESOLVED … (ENOENT)` 2 | `FAIL-CLOSED ESCAPES_LANE r.txt relative instrument resolves outside the lane: ../../etc/passwd` 2 | SAFE (stricter) |
| 1b | `scripts/../../etc/passwd` | `UNRESOLVED … (ENOENT)` 2 | `FAIL-CLOSED ESCAPES_LANE … scripts/../../etc/passwd` 2 | SAFE (stricter) |
| 1c | abs outside lane, right digest | `CLEAN matched=1 … external=1` 0 | same | SAFE (disclosed) |
| 1d | abs outside lane, wrong digest | `DRIFT … mismatched=1 … external=1` 1 | same | SAFE |
| **1e** | relative escape → `/etc/hostname`, right digest | **FAIL-OPEN** `CLEAN … external=1` 0 | `FAIL-CLOSED ESCAPES_LANE … ../../../../../etc/hostname` 2 (`x1j`) | **FIXED** |
| 1e′ | `bash ../scripts/sources-census.sh` (fleet root) | **FAIL-OPEN** `CLEAN … external=1` 0 | `FAIL-CLOSED ESCAPES_LANE … ../scripts/sources-census.sh` 2 (`x1k`); the absolute form still reads `CLEAN … external=1` 0 (`x1k2`) | **FIXED** |
| 1l | relative escape, wrong digest | `DRIFT mismatched=1 external=1` 1 | `FAIL-CLOSED ESCAPES_LANE` 2 (`x1l`) | SAFE (stricter) |
| 1f | abs token `/etc` (directory) | `UNRESOLVED … (EISDIR)` 2 | same | SAFE |
| 1g | lane-abs with `..` | `CLEAN … external=0` 0 | same | SAFE |
| 1h | `/proc/self/environ` | `DRIFT mismatched=1 external=1` 1 | same | SAFE (disclosed) |
| **2a** | `--dir` symlink → dir with a valid receipt | **FAIL-OPEN** `CLEAN matched=1` 0 | `FAIL-CLOSED SYMLINK_DIR …/2link` 2 | **FIXED** |
| **2b** | same link + a mismatching receipt | **FAIL-OPEN** `DRIFT matched=1 mismatched=1` 1 | `FAIL-CLOSED SYMLINK_DIR …/2link` 2 | **FIXED** |
| 2c | `--dir` symlink → `/etc` | `DRIFT … first=-` 1 | `FAIL-CLOSED SYMLINK_DIR …/2etc` 2 | SAFE (stricter) |
| **2d** | `--dir` symlink → round-86 close | **FAIL-OPEN** `DRIFT matched=1 mismatched=9` 1 | `FAIL-CLOSED SYMLINK_DIR …/x2d` 2. `--json`: `"verdict":"FAIL-CLOSED","token":"SYMLINK_DIR"` (`x2d`, `x2e`) | **FIXED** |
| 2f | round-86 close by its real path | `DRIFT matched=1 mismatched=9 … external=1 first=c1-probe.txt` 1 | same (`x2f`) | SAFE |
| 3a | fully CRLF | `CLEAN matched=1` 0 | same | SAFE |
| 3b / 3b2 | mixed endings `rev=OLD` / LF control | `DRIFT mismatched=1` 1 / same | same / same | SAFE |
| **3c** | dup `cmd=`, correct first | first-wins `CLEAN` 0 | `FAIL-CLOSED AMBIGUOUS_FIELD r.txt carries 2 cmd= lines` 2 | **FIXED** |
| **3d** | dup `cmd=`, wrong first | first-wins `DRIFT` 1 | `FAIL-CLOSED AMBIGUOUS_FIELD r.txt carries 2 cmd= lines` 2 | **FIXED** |
| 3e | dup `tool_sha256=` | first-wins `CLEAN` 0 | `FAIL-CLOSED AMBIGUOUS_FIELD r.txt carries 2 tool_sha256= lines` 2 | **FIXED** |
| **4** | 64 MiB receipt | **UNBOUNDED** `CLEAN`, max RSS 185048 kB | `FAIL-CLOSED RECEIPT_TOO_LARGE …/big.txt is 67109028 bytes (limit 1048576)` 2 | **FIXED** for the receipt read; the external-instrument read is still unbounded (§3 n10) |
| 5a / 5b / 5c / 5d | `/`, lane root, missing, empty | DRIFT `first=-` / DRIFT `unchecked=1 first=r8-in-tree-pollution.txt` / `DIR_UNREADABLE (ENOENT)` / DRIFT `first=-` | same (5d = `x5d`) | SAFE |
| 6a–6d | `--rev` 1111…, blob sha, precedence, receipt `rev=` 1111… | `REV_UNRESOLVED` 2 ×4 | same ×4 | SAFE |
| 7a–7d | `;`, `$( )`, backticks, `\| tee` | `UNRESOLVED` ×3, 7d `CLEAN` (tail ignored), no sentinel file | same; `ls …/work/sentinel.*` → no such file | SAFE |
| 8a–8e | subdir / FIFO / mode 000 / empty / cmd w/o token | `RECEIPT_UNREADABLE` ×3, `DRIFT unchecked=1`, `UNRESOLVED` | same | SAFE |
| 9 | `--lane` symlink | `LANE_UNREADABLE … is not a directory` 2 | same (`x9`) | SAFE |
| 10 | `--selftest` | `PASS held=39/39` | `PASS held=39/39` (`x10`) | SAFE |

**Every row the assignment named (1e, 2a, 2b, 2d, 3c, 3d, 4) now fails closed, and every row that
was SAFE in round 87 is still SAFE.** 1a/1b/1l/2c changed token but stayed fail-closed or got
stricter.

## 3. New v2 edges

| id | edge | observed (exit) | class |
|---|---|---|---|
| n1 | dangling symlink `--dir` | `FAIL-CLOSED SYMLINK_DIR …/dangling` 2 | SAFE |
| n2 / n2b / n2c / n2d | `--dir link/`, `link/.`, `link`, `link86/` (→ round-86) | `FAIL-CLOSED SYMLINK_DIR …/link` 2 (×3), `…/link86` 2. `main()` `resolve()` strips the slash before `lstat` | SAFE |
| **n3** | **symlinked PARENT**: `--dir parent-link/close` | **`CLEAN matched=1 mismatched=0 unchecked=0 external=0` 0** | **FAIL-OPEN** (K88-S3) |
| n3b | symlinked parent → round-86: `--dir r86parent/close` | `DRIFT matched=1 mismatched=9 … first=c1-probe.txt` 1: another round judged under this path | FAIL-OPEN (K88-S3) |
| n3c | parent symlink into `/etc` (`etcparent/ssh`) | `DRIFT … first=-` 1 | FAIL-OPEN (followed, never CLEAN) |
| n4a | receipt exactly 1048576 B | `CLEAN matched=1` 0 | SAFE |
| n4b | receipt exactly 1048577 B | `FAIL-CLOSED RECEIPT_TOO_LARGE … is 1048577 bytes (limit 1048576)` 2 | SAFE |
| **race-grow** | receipt swapped (atomic rename) between a small CLEAN file and a 2 MiB wrong-digest file | N=400: CLEAN 293, RECEIPT_TOO_LARGE 94, **DRIFT 13**. Each DRIFT means the 2 MiB bytes were read and judged after a small `lstat` | **FAIL-OPEN, reproduced** (K88-S4) |
| **race-symfile** | `r.txt` swapped between a regular wrong-digest file and a symlink to a CLEAN receipt | N=400: SYMLINK_RECEIPT 238, DRIFT 142, **CLEAN 20**. Each CLEAN means the link target was read | **FAIL-OPEN, reproduced** (K88-S4) |
| race-symdir | `--dir` swapped between a real dir (wrong digest) and a symlink to a CLEAN dir | N=400: DIR_UNREADABLE 348, SYMLINK_DIR 46, RECEIPT_UNREADABLE 3, DRIFT 2, **CLEAN 1** | FAIL-OPEN, reproduced (rare) (K88-S4) |
| n6a | dup `cmd=`, first line CRLF, second LF | `AMBIGUOUS_FIELD … 2 cmd= lines` 2 | SAFE |
| n6b / n6c | two `cmd=` on one LF line, split by a lone CR / U+2028 | `AMBIGUOUS_FIELD` 2 | SAFE (over-strict, fail-closed) |
| **n6d** | UTF-8 BOM + `cmd=node scripts/counter-receipt.mjs` on line 1, real `cmd=` later | **`CLEAN matched=1` 0**. `^cmd=` misses the BOM line, while a viewer shows two `cmd=` lines | **FAIL-OPEN (low)** (K88-S5) |
| **n6e** | BOM + `rev=OLD`, digest of TIP bytes | **`CLEAN matched=1` 0**. The BOM-less control 3b2 reads DRIFT, so the displayed `rev=` is ignored and the receipt is judged at `--rev` | **FAIL-OPEN (low)** (K88-S5) |
| n9d | second `cmd=` line prefixed by NUL | `CLEAN matched=1` 0 | FAIL-OPEN (low) (K88-S5) |
| n6f / n6g | second `cmd=` with a leading space / split by VT on one line | `CLEAN matched=1` 0 | DISCLOSED (visible; not a field by line grammar) |
| n7 | `cmd=node ./../x` | `FAIL-CLOSED ESCAPES_LANE … ./../x` 2 | SAFE |
| n7b | `./scripts/../scripts/./proxy-check.mjs` (stays inside) | `CLEAN matched=1 external=0` 0 | SAFE |
| n8a | fixture lane, committed `scripts/link-out -> /etc`, token `scripts/link-out/hostname` | `FAIL-CLOSED UNRESOLVED … instrument absent at <rev>: scripts/link-out/hostname` 2 | SAFE (git does not traverse tree symlinks) |
| n8c | same through the absolute lane path | `UNRESOLVED` 2 | SAFE |
| n8d | untracked worktree link `scripts/wt-link -> /etc` | `UNRESOLVED … absent at <rev>: scripts/wt-link/hostname` 2 | SAFE |
| n8b | token = the committed symlink itself, digest = sha256(`/etc`) | `CLEAN matched=1 external=0` 0 | DISCLOSED (binds a mode-120000 link-text blob, not a program) |
| n8e / n8g | ABSOLUTE token reaching the lane through an alias (symlink to the lane / `/proc/self/cwd`), digest of the **dirty** worktree bytes | `CLEAN matched=1 … external=1` 0 | DISCLOSED by `external=1`. This is a worktree-binding path, and the after-state sentence (`mismatched=0 unchecked=0`) does not exclude it (K88-S6) |
| n9a | NUL inside a relative token | `FAIL-CLOSED INTERNAL The argument 'args[4]' must be a string without null bytes…` 2 | SAFE (fail-closed; token should be UNRESOLVED) |
| n9b | NUL inside an absolute token | `FAIL-CLOSED UNRESOLVED … (ERR_INVALID_ARG_VALUE)` 2; a raw NUL is echoed on stdout | SAFE |
| n9c / n9e | NUL as the separator / NUL ending the first of two `cmd=` | `UNRESOLVED cmd= names no instrument` 2 / `AMBIGUOUS_FIELD` 2 | SAFE |
| n10a | external instrument `/dev/zero` | no `RECEIPT_BIND` line: V8 `Fatal process out of memory` under `ulimit -v 4 GiB` / SIGKILL at 10 s, exit 137 | UNBOUNDED (R87-S5's external leg carried over) (K88-S7) |
| n10b | external instrument = a FIFO with no writer | hangs; SIGKILL at 5 s, exit 137, no verdict line | UNBOUNDED (K88-S7) |
| n11 | `--rev HEAD` | usage, exit 64 (40-hex enforced) | SAFE |
| n12 | uppercase `tool_sha256=` | `CLEAN` (lower-cased) | DISCLOSED (R87-S9 carried over) |
| n13 / n14 | token = lane root (`<lane>/`, `.`) | `UNRESOLVED … lane root` 2 | SAFE |
| **i1** | receipt **file name** containing `\nRECEIPT_BIND: CLEAN matched=9 …\n` | stdout line 1 `DRIFT … first=x` (exit 1); **line 2 `RECEIPT_BIND: CLEAN matched=9 mismatched=0 unchecked=0 external=0`**; `grep -c '^RECEIPT_BIND: CLEAN'` = 1 | FAIL-OPEN for line-oriented consumers (K88-S8). Exit code and first line stay correct, and the frozen probe reads the first match plus the exit code |
| i2 | ESC sequences in the `cmd=` token | echoed raw into the FAIL-CLOSED detail, exit 2 | DISCLOSED (terminal display spoofing only) |
| i3 | file name injecting `\ncmd=node evil.txt` | stdout line 2 begins `cmd=node evil.txt`, so a receipt captured from this run gains a second `cmd=` (later AMBIGUOUS_FIELD) | DISCLOSED (fails closed downstream) |

**Race receipts:** `races/race-*.txt` holds the full tally per race. A first unpinned pass against
the worktree path reproduced all three races at higher rates (grow DRIFT 73/400, symfile CLEAN 39/400,
symdir CLEAN 1/400). Its artifacts were deleted with the rest of the unpinned pass.

## 4. Findings (severity · exploit path · evidence · impact · smallest remediation)

| id | class · severity | exploit path | evidence | impact | smallest remediation |
|---|---|---|---|---|---|
| **K88-S1** | KILL-RULE · high (claim disposition) | prefix-only ESCAPES_LANE control | `controls/ctl-escape-prefix.txt` 20/20; `esc-demo-*.txt` | the frozen probe cannot tell a full ESCAPES_LANE from a textual `../` check | probe-side, next round: an interior-`..` sub-run in `escape-relative` |
| **K88-S2** | KILL-RULE · high | read-then-cap control | `controls/ctl-read-then-cap.txt` 20/20; `rss-*.txt` 57932 vs 188504 kB | "refused before it is read" cannot be observed by the probe | probe-side: an oversize sub-run with a memory/time bound (e.g. a sparse multi-GiB receipt under `ulimit -v`) |
| **K88-S3** | FAIL-OPEN · medium | `--dir <symlinked-parent>/close` | n3 `CLEAN` 0, n3b round-86 judged | the R87-S2 relocation one level up: another directory's receipts are judged under this round's path | after the `lstat`: `if (realpathSync(dir) !== dir) throw new FailClosed('SYMLINK_DIR', …)` |
| **K88-S4** | FAIL-OPEN (TOCTOU) · low-medium | a concurrent writer in `--dir` swaps entries between `lstat` and `readdir`/`readFileSync` (lines 227–229, 242–248) | races: grow 13, symfile 20, symdir 1 per 400 | RECEIPT_TOO_LARGE, SYMLINK_RECEIPT and SYMLINK_DIR are each bypassable while the gate runs | `fd = openSync(path, O_RDONLY\|O_NOFOLLOW\|O_NONBLOCK)`; `fstatSync(fd)` isFile and size ≤ cap; read at most cap+1 bytes from the fd; re-check `realpathSync(dir) === dir` after the loop |
| **K88-S5** | FAIL-OPEN · low | invisible prefix (BOM, NUL) on a field line (lines 249–252) | n6d, n6e, n9d `CLEAN` 0 | hides a duplicate `cmd=` and makes a displayed `rev=` ignored: the same "change nothing visibly" rationale AMBIGUOUS_FIELD was built for | fail closed (`RECEIPT_UNREADABLE`) on a leading BOM or any C0 byte other than `\t\r\n` |
| **K88-S6** | DISCLOSED · low-medium | absolute alias of the lane (symlink to the lane, `/proc/self/cwd`) (lines 286–290, 300–302) | n8e, n8g `CLEAN external=1` on dirty bytes | a worktree-binding path that the after-state sentence does not exclude | classify `realpathSync(abs)` against `realpathSync(lane)` (inside → git read); add `external=0` to the close after-state |
| **K88-S7** | UNBOUNDED · low-medium | external instrument `/dev/zero` or a FIFO (line 301) | n10a OOM / exit 137, n10b hang / exit 137, no verdict line | DoS of the gate with no verdict line, despite the "a crash must not read as a measured verdict" INTERNAL promise | `statSync(abs)`: require `isFile()` and size ≤ cap before reading |
| **K88-S8** | OUTPUT-INTEGRITY · low | newline or ESC in a receipt file name / token (lines 209, 251, 331) | i1 forged `RECEIPT_BIND: CLEAN` line; i3 forged `cmd=` line | misleads `grep`-style consumers and captured receipts | `JSON.stringify` names and tokens in the detail and `first=`, or fail closed on names outside `[A-Za-z0-9._-]` |

None of K88-S3…S8 is exercised by a frozen arm. They cannot lift a committed control to 20/20; they
only show the instrument is not yet fail-closed under a live adversary.

## 5. Limits and honesty notes

* All conclusions are about the 0ff3562 bytes. I did **not** review the modified worktree instrument
  (`1f11f124…`). Its added `escapes-lane-interior-dotdot` selftest case would fail K88-S1 against those
  bytes, but the frozen probe would still accept any candidate whose own selftest omits that case.
* I did not attempt the races at the syscall level beyond the N=400 bounded loops. Rates depend on
  load and are not a probability claim.
* n10a was bounded (`ulimit -v 4194304`, `timeout -s KILL 10`). An unbounded run would hit the host
  OOM killer, and I did not do that.
* Fixture-lane commits (n8) were made in a `mktemp -d` repo under scratch with `-C "$D"` and inline
  identity, after asserting `git rev-parse --show-toplevel` equalled `$D`. The only other mutating git
  use was `checkout --detach 0ff3562` inside my scratch `clone --shared`.
* Nothing was installed or upgraded (no tool/version/channel entry).
* My persistent shell carried a stale `set -e`, which truncated two receipts (twin, esc demo). I
  detected it, re-ran both with `set +e`, and the files now in `controls/` are the complete re-runs.
* Scratch `/fast/scratch/hyaku/kumitate-r88/K88Sentinel/` was `rm -rf`'d before yield. Scratch paths in
  receipt `cmd=` lines therefore no longer exist; the receipts and drivers are the evidence.

## 6. Artifacts (under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88Sentinel/`)

| path | content |
|---|---|
| `harness-r87-on-v2.txt` | round-87 harness re-run against pinned v2 (33 cases) |
| `probe88-on-0ff3562.txt` | frozen probe on the pinned target, 20/20 |
| `probe-edges-v2.sh`, `edges/*.txt`, `edges-summary.log` | round-87 extra re-runs (x*) + new edges (n*), one receipt each |
| `probe-inject-v2.sh`, `inject/*.txt`, `inject-summary.log` | output-injection cases i1–i3 |
| `race-v2.py`, `races/race-{grow,symfile,symdir}.txt`, `races-summary.log` | TOCTOU races, N=400 each |
| `make-seat-controls.mjs`, `controls/ctl-*.mjs`, `controls/ctl-*.txt` | kill-rule candidate controls and their probe scores |
| `controls/esc-demo-*.txt`, `controls/rss-*.txt` | property evidence for K88-S1 / K88-S2 |
| `controls/twin-0ff3562.{mjs,txt}` | worktree twin of the pinned target, 10/20 |
| `findings.json` | machine-readable rows, edges, defects |
