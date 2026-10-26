VERDICT: The three instruments and both frozen counters read the same verdict from the worktree and from `git archive 2ed8a5f8` (stray/uncommitted bytes in a scratch copy change nothing), and none of them writes into the tree it judges — but `jj-seat-demo.sh` is not hermetic against its **caller**: a cwd inside another jj repo and an absent/hostile `VISUAL` each turn it into `FAIL-CLOSED` and drop the frozen `JJ64` counter from 8/8 to 7/8, so the archive/worktree equivalence holds only while the ambient env does.

## Evidence

Archive of the integrated tree: `git archive 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 | tar -x -C /tmp/kumitate-r64/K64R2ExecWorktreeArchive/lane-archive` (190M, 14624 tracked `.ufo` files — the archive does carry `.ufo/`). Dirty twin: `git clone` of the lane into scratch, then `printf … >> scripts/jj-seat-demo.sh`, `>> scripts/report-receipt-diff.mjs`, `>> corpus/knowledge/jj-workspace-seat-containment.md`, plus untracked `STRAY-UNTRACKED.md` and `.ufo/waves/round-64/controls/receipt/zzz-stray/`.

| instrument | worktree | archive 2ed8a5f | bwrap `--ro-bind / /` | HOME unset | unwritable TMPDIR | `env -i PATH=/usr/bin:/home/vgpnk/.local/bin` |
|---|---|---|---|---|---|---|
| `report-receipt-diff.mjs --selftest` | PASS (52/52) exit 0 | PASS (52/52) exit 0 | PASS exit 0 | PASS exit 0 | **node stack trace, exit 1** (F3) | PASS exit 0 (node v26.12.0) |
| `jj-seat-demo.sh` | DONE 21 keys exit 0 | DONE, `diff` of stdout empty | PASS from cwd=/tmp; **FAIL-CLOSED describe-base exit 2** from cwd=lane (F1) | DONE exit 0 | `FAIL-CLOSED mktemp` exit 2 (clean) | **FAIL-CLOSED squash-into exit 2** (F2) |
| `plan-before-ready.sh --selftest` | PASS (18/18) exit 0 | PASS (18/18) exit 0 | PASS exit 0 | PASS exit 0 | `ERROR (mktemp failed)` exit 2 (clean) | PASS exit 0 |
| `receipt64-probe.mjs` (frozen) | `RECEIPT64_UNMET held=4/5 … \| P5 MISS report-not-given` exit 1 | same on the dirty clone | same exit 1 | same | **node stack trace, exit 1** (F4) | same exit 1 |
| `jj64-probe.mjs` (frozen) | `JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8… rule=J64` exit 0 | same on the dirty clone | **`held=7/8 \| J6 MISS demo-exit=2;…`** (F1) | same 8/8 | **node stack trace, exit 1** (F4) | **`held=7/8`** (F2) |

Verbatim, in order of the findings:

```
# F1 — demo from cwd=lane, whole root read-only (bwrap); jj's own error, un-redirected copy of the script
Internal error: Failed to determine the secure config for a repo
Caused by:
1: Cannot access /home/vgpnk/Projects/shokunin/kumitate-shokunin/.jj/repo
2: Read-only file system (os error 30) at path "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.jj/repo/.tmpzYfTkd"
JJ_SEAT_DEMO: FAIL-CLOSED describe-base          (exit 2)
# F1 — same counter, lane bound read-only, cwd=lane
JJ64_UNMET held=7/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64 | J6 MISS demo-exit=2;workspaces_after_add:stated-not-live;…
# F2 — env -i and hostile VISUAL
JJ_SEAT: rewrite_seat_head_description_seen=rewritten
JJ_SEAT_DEMO: FAIL-CLOSED squash-into           (exit 2)
Error: Failed to edit description / 1: Failed to run editor 'nano' / 2: No such file or directory (os error 2)
# F2 — the counter flips with the ambient var
JJ64_UNMET held=7/8 … | J6 MISS demo-exit=2;rewrite_treechange_seat_state:stated-not-live;…   (VISUAL=/bin/false, and env -u VISUAL -u EDITOR)
# F3/F4 — unwritable TMPDIR
Error: EACCES: permission denied, mkdtemp '/tmp/kumitate-r64/K64R2ExecWorktreeArchive/ro-tmp/rrd-self.XXXXXX'
    at mkdtempSync (node:fs:3134:18) at selftest (…/scripts/report-receipt-diff.mjs:180:13)     (exit 1, no verdict line)
    at file:///…/.ufo/waves/round-64/probe/receipt64-probe.mjs:42:11                             (exit 1)
    at file:///…/.ufo/waves/round-64/probe/jj64-probe.mjs:51:11                                  (exit 1)
# F4 — the same infrastructure failure, two different verdict shapes (PATH without tar)
RECEIPT64_UNMET held=0/5 checks=5 rev=2ed8a5f8… rule=R64 | P1 MISS tool-absent | P2 MISS tool-absent | P3 MISS tool-absent | P4 MISS tool-absent | P5 MISS report-not-given   (exit 1)
JJ64_UNMET held=0/8 checks=8 rev=2ed8a5f8… rule=J64 | archive-failed                          (exit 2)
```

Fixed drafts, re-run in the failing scenarios (bytes in `## Artifacts`):

```
(cd lane && bash build/…/jj-seat-demo.hermetic.sh)                → EXIT=0, `diff` vs the worktree baseline stdout empty (KEYS_IDENTICAL)
env -i PATH=/usr/bin:/home/vgpnk/.local/bin bash …hermetic.sh     → JJ_SEAT_DEMO: DONE jj=0.45.1-… EXIT=0, key=value lines identical to the baseline
VISUAL=/bin/false bash …hermetic.sh                               → DONE EXIT=0
bwrap --ro-bind / / … --chdir <lane> bash …hermetic.sh            → DONE EXIT=0
TMPDIR=<ro> node build/…/report-receipt-diff.failclosed.mjs --selftest → REPORT_RECEIPT_SELFTEST: ERROR (mkdtemp failed in <ro>: EACCES)  EXIT=2
node build/…/report-receipt-diff.failclosed.mjs --selftest        → REPORT_RECEIPT_SELFTEST: PASS (52/52) EXIT=0
entry `## Demo outcomes` key set (21) vs hermetic demo key set   → diff empty (J6_KEYSET_EQUAL)
patch -p1 --dry-run on fresh copies of both files                 → rc=0, rc=0; applied copy `cmp`s equal to the drafts
```

## Findings

**K64R2ExecWorktreeArchive-1 — high — `jj-seat-demo.sh` writes into the caller's enclosing repo; a read-only enclosing repo turns the demo into a false FAIL-CLOSED and the frozen `JJ64` counter into 7/8.** The demo bounds *git* discovery (`GIT_CEILING_DIRECTORIES="${S%/*}"`) but not *jj's*: with `-R "$D"` and a cwd inside another jj repo, jj 0.45.1 probes that repo's `.jj/repo/` with a temp file and, when that repo is not writable, dies at `describe-base`. Measured: demo from cwd=lane under `--ro-bind / /` → `FAIL-CLOSED describe-base` exit 2 (stderr above); `jj64-probe` with the lane ro-bound → `held=7/8 | J6 MISS`. Non-bwrap repro on a fixture (repo-level config set, `chmod -R a-w .jj/repo`, cwd inside it) gives the same `FAIL-CLOSED describe-base`. Repro: `bwrap --ro-bind / / --dev-bind /dev /dev --proc /proc --tmpfs /tmp --chdir /home/vgpnk/Projects/shokunin/kumitate-shokunin /usr/bin/bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/jj-seat-demo.sh`. Fix (draft, verified): `cd "$S" || fail chdir` before the first jj call — every path in the script is already absolute.

**K64R2ExecWorktreeArchive-2 — high — the demo's exit code is decided by ambient `VISUAL`/`EDITOR`; the same var drops `JJ64` to 7/8.** `jj squash --from @ --into <seat>` combines descriptions and opens `$VISUAL` (then `$EDITOR`, then `nano`) unless `ui.editor` is pinned. This host has `VISUAL=true EDITOR=true`, which is the only reason the demo passes here. `env -i PATH=…` and `VISUAL=/bin/false` → `FAIL-CLOSED squash-into` exit 2; `EDITOR=/bin/false` alone still passes (VISUAL wins); `env -u VISUAL -u EDITOR node …/jj64-probe.mjs <lane> <rev>` → `held=7/8 | J6 MISS`. The failed runs also litter `/tmp/editor-*.jjdescription` (28 files present). Repro: `env -i PATH=/usr/bin:/home/vgpnk/.local/bin bash scripts/jj-seat-demo.sh`. Fix (draft, verified): `unset EDITOR VISUAL` plus `--config 'ui.editor="true"'` in `J()`.

**K64R2ExecWorktreeArchive-3 — medium — `report-receipt-diff.mjs --selftest` crashes with a node stack trace (exit 1) on an unwritable TMPDIR.** Contract fail-closed is exit 2 with a verdict-shaped line; `mkdtempSync` at `scripts/report-receipt-diff.mjs:180` is unguarded. Repro: `TMPDIR=<chmod 500 dir> node scripts/report-receipt-diff.mjs --selftest`. Fix (draft, verified): try/catch → `REPORT_RECEIPT_SELFTEST: ERROR (mkdtemp failed in <dir>: EACCES)` exit 2.

**K64R2ExecWorktreeArchive-4 — medium — both frozen counters crash on an unwritable TMPDIR, and the same infrastructure failure reads as a *claim failure* in one and as a fail-closed in the other.** `receipt64-probe.mjs:42` / `jj64-probe.mjs:51` call `mkdtempSync` unguarded → stack trace, exit 1, no verdict line. With `tar` absent from PATH, `receipt64-probe` prints `held=0/5 … P1..P4 MISS tool-absent` exit 1 — indistinguishable from "the claim fails as declared" — while `jj64-probe` prints `| archive-failed` exit 2. So a broken harness can read as a falsified claim. Repro: `env -i PATH=<dir with node,git,bash only> node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> <rev>`; `TMPDIR=<chmod 500 dir> node .ufo/waves/round-64/probe/{receipt64,jj64}-probe.mjs <lane> <rev>`. Frozen counters: reported, not patched (suggested shape: guard `mkdtempSync` and the `git archive | tar` status, print `<LABEL>_UNMET held=0/5 checks=5 … | archive-failed`, exit 2, as J64 already does).

**K64R2ExecWorktreeArchive-5 — low — `report-receipt-diff` in worktree mode (no `--rev`) accepts an *uncommitted* receipt.** In the scratch clone, an untracked `.ufo/waves/round-64/close/stray.txt` carrying `R64S_HELD held=2/2` flipped a report from `DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` (with `--rev 2ed8a5f…`) to `REPORT_RECEIPT: CLEAN (round=64 rev=worktree …)` exit 0. The header does disclose `rev=worktree`, and both counters pass `--rev` (P2 case lanes have no git, so they use worktree mode by design), so no counter verdict is affected; the risk is a hand-run gate or a future caller. Repro: `mkdir -p <clone>/.ufo/waves/round-64/close && printf 'R64S_HELD held=2/2\n' > <clone>/.ufo/waves/round-64/close/stray.txt && node <clone>/scripts/report-receipt-diff.mjs --lane <clone> --round 64 --report <report citing that tally>`.

**K64R2ExecWorktreeArchive-6 — low — `plan-before-ready.sh --selftest` never removes its fixture tree.** `run_selftest` prints `fixtures=$root` and returns without `rm -rf "$root"` (`scripts/plan-before-ready.sh:300,477`); 7 `/tmp/pbr-selftest.*` trees accumulated from this seat's runs alone (the report-receipt-diff selftest does `rmSync` at line 271). Repro: `for i in 1 2 3; do bash scripts/plan-before-ready.sh --selftest >/dev/null; done; ls -d /tmp/pbr-selftest.* | wc -l`.

**K64R2ExecWorktreeArchive-7 — low (observation for the L1, not this claim's instrument) — the standing gate is red at the integrated tree.** `bash scripts/plan-before-ready.sh --rounds 60-64` → `PLAN_BEFORE_READY_SUMMARY: … exit=1 failed=62`, with `round=62 … reason=NO_PLAN plan=- marker_kind=dispatch`. Identical from the worktree and from the archive tree, so it is data (round 62 has a dispatch marker and no committed plan at the rev), not an instrument difference; flagged because the plan's maintenance item asks the gate to read clean at the tip.

## Artifacts

- `.ufo/waves/round-64/build/K64R2ExecWorktreeArchive/jj-seat-demo.hermetic.sh` — full-file draft fixing -1 and -2 (verified: keys identical, passes env -i / VISUAL=/bin/false / ro-bind).
- `.ufo/waves/round-64/build/K64R2ExecWorktreeArchive/jj-seat-demo.hermetic.patch` — minimal unified diff (+9/−1), `patch -p1` dry-run rc=0.
- `.ufo/waves/round-64/build/K64R2ExecWorktreeArchive/report-receipt-diff.failclosed.mjs` — full-file draft fixing -3 (verified: 52/52 normally, clean exit 2 on unwritable TMPDIR).
- `.ufo/waves/round-64/build/K64R2ExecWorktreeArchive/report-receipt-diff.failclosed.patch` — minimal unified diff, `patch -p1` dry-run rc=0.
- Scratch transcripts under `/tmp/kumitate-r64/K64R2ExecWorktreeArchive/` (`jj-worktree.out`, `jj-archive.out`, `jj-draft.out`, `jj-draft-envi.out`, `pbr-{worktree,archive}.out`, `entry-keys.txt`, `draft-keys.txt`); lane archive and clone copies deleted after the runs. No tool was installed or upgraded this seat (node v24.21.0 from fnm, `/usr/bin/node` v26.12.0, jj 0.45.1, git 2.56.0, bwrap already present).

## Limits

- Did not run the full `jj64-probe` against a tree that *carries* the fixed demo (frozen counter, no write access to `scripts/`); J6 was instead shown to be satisfied component-wise (`## Demo outcomes` key set == hermetic demo key set, values identical under `env -i`).
- The exact jj 0.45.1 trigger for the enclosing-repo write was pinned only empirically (repo-level config + read-only `.jj/repo` reproduces; a bare `jj git init` fixture under a read-only bind does not) — the mechanism inside jj is not traced beyond its own error text.
- Not tested: `plan-before-ready.sh` real-mode map arm under a read-only tree with a post-epoch round (`PBR_MAP_FROM=65`; round 64 reads `map=SKIP reason=MAP_PRE_EPOCH_ROUND`, so the map extraction path stayed unexercised); network loss for J5; Windows/macOS hosts.
- `git archive` of this lane is 190 MB and each counter extracts it to TMPDIR (measured 4–8 s per counter run); disk/TMPDIR headroom was not audited.
