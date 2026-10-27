VERDICT: GREEN — `scripts/jj-seat-demo.sh` (round-64 capability) still passes on this host on jj 0.45.1 (exit 0, 27 `JJ_SEAT:` keys byte-identical to the round-64 close receipt and to the corpus `## Demo outcomes` pin, J64 probe 8/8), but the brief's "21 outcome keys" figure is stale: the script has printed 27 since wave-2 commit f8743539, and one live doc still says 21.

## Evidence

Environment (the lane is at HEAD 39f61816d4ee7a8d401df42c1818c91a9c537bce; `git status --porcelain` before and after my runs shows only untracked `.ufo/waves/round-68/…` files — the demo wrote nothing into the lane):

```
$ jj --version
jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
$ command -v jj; ls -l $(command -v jj)
/home/vgpnk/.local/bin/jj   (31 MB, Oct 3)
$ sha256sum scripts/jj-seat-demo.sh
80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a  scripts/jj-seat-demo.sh
$ grep -n '^pin.jj-seat-demo=' SCORECARD.md
333:pin.jj-seat-demo=80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a
```
→ the script under test is byte-identical to its SCORECARD pin (`pin.jj-seat-demo`), so the run below is the pinned artifact, not a drifted copy.

Scratch discipline read from the script and confirmed empirically (`.ufo/waves/round-68/build/K68ExecDemoJj/`): `D`/`S` are `mktemp -d`, `trap cleanup EXIT` removes both; `HOME`/`XDG_CONFIG_HOME` are fixture-local; `GIT_CEILING_DIRECTORIES="${S%/*}"`, `JJ_CONFIG=/dev/null`; ambient `GIT_*`/`JJ_*`/`EDITOR`/`VISUAL` unset; every git/jj call names its repository (`-C`/`-R`). My runs left only my own receipts in the scratch dir.

### 1. Demo run, TMPDIR under my seat scratch
```
$ cd /fast/scratch/hyaku/kumitate-r68/K68ExecDemoJj && TMPDIR=$PWD timeout 900 \
    bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/jj-seat-demo.sh
EXIT=0
JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
```
27 `JJ_SEAT:` lines, 9 `JJ_SKEW:` lines. Host-specific skew (0.45.1 has no `jj workspace remove`; the `--no-colocate` pin is a no-op here):
```
JJ_SKEW: jj_version=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
JJ_SKEW: workspace_add_no_colocate_flag=absent
JJ_SKEW: default_flags_seat_has_git_dir=no
JJ_SKEW: default_flags_seat_gitdir=none
JJ_SKEW: workspace_remove_supported=no   (+ 4 × workspace_remove_*=n/a)
```

### 2. Key identity, three ways
```
$ diff <(grep '^JJ_SEAT: ' .ufo/waves/round-64/close/jj-seat-demo-run.txt | sort) \
       <(grep '^JJ_SEAT: ' …/build/K68ExecDemoJj/demo-run.txt | sort)
IDENTICAL                                    (27 vs 27, no line differs)
$ # entry bullets of corpus/knowledge/jj-workspace-seat-containment.md ## Demo outcomes vs live run
entry keys=27 live keys=27
ENTRY==LIVE
```

### 3. Frozen J64 counter on lane HEAD
```
$ TMPDIR=<scratch> node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> 39f61816d4ee7a8d401df42c1818c91a9c537bce
JJ64_HELD held=8/8 checks=8 rev=39f61816d4ee7a8d401df42c1818c91a9c537bce rule=J64
EXIT=0
```
J6 of that probe re-runs the demo from the git archive of HEAD and compares all 27 stated keys — so a second, independent fixture run also matched.

### 4. The "21 keys" question, resolved by revision
```
$ for r in dd1a3e6f d92cf1ff f8743539 39f61816; do git show $r:scripts/jj-seat-demo.sh | grep -o 'kv [a-z0-9_]*' | awk '{print $2}' | sort -u | wc -l; done
15   21   27   27
$ git show d92cf1ff:scripts/jj-seat-demo.sh > <scratch>/jj-seat-demo-v2.sh   # run live
EXIT=0 ; v2 live JJ_SEAT keys=21 ; JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb…
$ comm -23 <(v2 21 pairs sorted) <(current 27 pairs sorted)
(empty)   → all 21 v2 key=value pairs reappear verbatim in the current run
```
i.e. the 21 keys the brief names do hold — and six more do too: `rewrite_preserves_change_id_changes_commit_id`, `update_stale_treechange_seat_file`, `pending_edit_on_tree_preserving_rewrite_seat_state`, `pending_delete_matching_abandoned_tree_seat_state`, `squash_seat_into_parent_seat_state`, `stale_seat_iwc_can_abandon_peer`. `f8743539`'s own message reads "demo v3 (27 keys, cwd/editor hermetic)".

### 5. Fail-closed and hermeticity still intact
```
$ TMPDIR=<fresh git fixture> bash scripts/jj-seat-demo.sh     → EXIT=0, keys=27, diff vs run #1 empty
  fixture afterwards: `.git` only (no stray files from the demo)
$ env PATH=/usr/bin:/bin bash scripts/jj-seat-demo.sh         → EXIT=2, JJ_SEAT_DEMO: FAIL-CLOSED jj-absent
```

## Findings

**K68ExecDemoJj-1 — "21 outcome keys" is a stale count (severity low; attacks the doc claim the brief inherits, not the demo).**
`corpus/knowledge/agent-isolation-substrates.md:317` still says "The demo exits 0 and prints 21 keys", while the script prints 27 and the sibling entry it points at says the opposite at `corpus/knowledge/jj-workspace-seat-containment.md:85` ("the 27 `JJ_SEAT:` keys are identical on 0.45.1 and 0.46.0"). The 21 was accurate for d92cf1ff (round-64 wave 1); f8743539 (wave 2) added the six keys listed in Evidence §4 and the amendment sentence was never updated. Nothing reads that number today: J64's J6 reads the entry's `## Demo outcomes` (27 bullets, all matched), which is why the probe is 8/8 despite the drift. Ratchet proposal for the L1 (I did not edit `corpus/`): change `21` → `27` at `agent-isolation-substrates.md:317`, or name the 21-key v2 subset explicitly. This does **not** endanger J64's J8: J8 requires the bytes of the file *at base revision 6825a514* to be unchanged, and the amendment sits after them — editing line 317 keeps the base prefix intact (verify with `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> <rev>` after the edit; expected `JJ64_HELD held=8/8`).
Reproduce: `bash scripts/jj-seat-demo.sh | grep -c '^JJ_SEAT: '` → `27`; `sed -n '315,318p' corpus/knowledge/agent-isolation-substrates.md`.

**K68ExecDemoJj-2 — the pinned script misdescribes its own contract and integration state (severity low; attacks operability of the contract identity).**
`scripts/jj-seat-demo.sh:3` declares "Contract: kumitate-jj-seat-demo-v2", and `:11` declares "v3 DRAFT (round 64 w2, K64R2ExecJjOtherVersion — **NOT integrated**; the L1 owns scripts/)". Both statements are false for this file: the v3 code is present and live (`:62-63` `WSADD=(--no-colocate)` pin, `:64` `skew()`, the `jj workspace remove` probe block at `:247-277`), it is the revision the round-64 close receipt was produced with (`JJ_SKEW:` lines exist in `.ufo/waves/round-64/close/jj-seat-demo-run.txt`), it is what `pin.jj-seat-demo` hashes, and `f8743539`'s message calls it "demo v3". A reader (or a future counter that greps the header for the contract id) cannot tell whether the version-skew repair is active. Fix belongs to the L1: update `:3` to `kumitate-jj-seat-demo-v3` and delete/replace the `:11` "NOT integrated" clause (the file itself is the integrated artifact). Re-pin `pin.jj-seat-demo` in the same change, otherwise SCORECARD's hash check will read the old bytes as the current tool.
Reproduce: `sed -n '1,15p' scripts/jj-seat-demo.sh`; `diff <(sha256sum scripts/jj-seat-demo.sh | cut -d' ' -f1) <(grep '^pin.jj-seat-demo=' SCORECARD.md | cut -d= -f2)` → no output today (they match), and would differ after any header edit.

## Artifacts
- `.ufo/waves/round-68/build/K68ExecDemoJj/demo-run.txt` — full stdout of run #1 (27 `JJ_SEAT:` + 9 `JJ_SKEW:` + DONE), exit 0
- `.ufo/waves/round-68/build/K68ExecDemoJj/jj64-probe.txt` — `JJ64_HELD held=8/8 checks=8 rev=39f61816… rule=J64`, exit 0
- `.ufo/waves/round-68/build/K68ExecDemoJj/demo-v2-at-d92cf1ff.txt` — live run of the extracted v2 script: 21 keys, exit 0
- `.ufo/waves/round-68/build/K68ExecDemoJj/key-count-reconciliation.txt` — 21 vs 27, empty `comm` (all v2 pairs reproduced)
- `.ufo/waves/round-68/build/K68ExecDemoJj/tmpdir-in-repo.txt` — run with TMPDIR inside a fresh git fixture: exit 0, 27 keys, fixture clean
- `.ufo/waves/round-68/build/K68ExecDemoJj/failclosed-nojj.txt` — `JJ_SEAT_DEMO: FAIL-CLOSED jj-absent`, exit 2
- `.ufo/waves/round-68/w1/K68ExecDemoJj.md` — this report
No tools installed or upgraded (host guard forbids writing to PATH dirs; see Limits). Scratch `/fast/scratch/hyaku/kumitate-r68/K68ExecDemoJj/` created and deleted before yield.

## Limits
- **jj 0.46 not measured today.** Only `jj 0.45.1` exists on this host (`/home/vgpnk/.local/bin/jj`; no 0.46 binary in `~/.local/bin` or `/fast/scratch`). My host guard forbids writing to PATH directories and pacman is paused host-wide, so I did not install the 0.46 release binary; the "identical 27 keys on 0.46.0" claim remains round-64's measurement (corpus entry:85), not mine. The 0.46-only surface (`jj workspace remove`, `--no-colocate`) is unexercised here — on 0.45.1 those keys read `n/a`/`absent`.
- I did not run the demo under a loaded host or repeatedly for flakiness (two independent runs matched: my direct run and J6's archived run). I did not test the multi-version matrix, `bwrap`/M5 containment, or any other substrate — out of seat scope.
- I did not edit `scripts/`, `corpus/`, `SCORECARD.md` or `LOG.md`; both findings are proposals for the L1. I ran no build/lint/test gate (parent owns post-integration gates).
