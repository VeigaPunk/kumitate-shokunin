# K88Review2 — determinism and independence check (round 88, C1 `receipt-bind` v2)

Target M = `0ff3562f15c18d0ca01dc6a76c9f827d30c26950` (`scripts/receipt-bind.mjs` sha256 `098a6713…cace4d`,
byte-identical in the worktree and at M). The frozen plan/probe are unchanged between 114877a3 and the lane tip
8e4ea5f6 (`git diff --stat 114877a3 8e4ea5f6 -- plan.md probe/` is empty; only the 17 control receipts were added).
Artifacts: `.ufo/waves/round-88/build/K88Review2/`. Scratch `/fast/scratch/hyaku/kumitate-r88/K88Review2` was
removed before this report. Nothing committed. No tools installed.

## Findings by severity

### F1 (HIGH — kill-rule candidate, L1 decision): a no-git, probe-aware control reaches 20/20
`build/K88Review2/nogit-overfit.mjs` (sha256 `2835894a…a58741`) never imports `child_process`, never spawns git and
never reads git objects. It hashes lane instruments from the **worktree**, decides "revision exists" from the text of
`<lane>/.git/logs/HEAD`, "tracked" from a substring test on `<lane>/.git/index`, tells the probe's fixture commits
apart by reflog order (1st entry = A, 2nd = B) and maps them to the probe's public `BODY.v1`/`BODY.v2` constants,
and hardcodes one lane digest (`d3f64dc4…:scripts/receipt-bind.mjs → b640ff31…`, the round-87 `cand-e` class).
- Receipt `build/K88Review2/ctl-nogit-overfit.txt`: `C88_C1: HELD held=20/20`, `exit=0`.
- Same file, `NOGIT_PURE=1` (constants and hardcode disabled, plain worktree): `ctl-nogit-pure.txt` →
  `C88_C1: UNMET held=13/20` exit 1.

By the plan's kill rule ("a seat-constructed control is a tool that skips a claimed behaviour (revision binding…) by
construction"; any control at 20/20 makes C1 UNMET), this control is in scope: it never binds a revision. A
counter-argument is that it is overfit to the frozen probe's constants. The kill rule makes no exception for overfit
controls, though, and the plan's own control set already includes a hardcoded control (`r87-cand-e-hardcoded-r86`).
Root cause in the scorer: the fixture bodies are fixed strings in the frozen probe. A tool can learn A and B from
plain-text git metadata, so the five revision-discriminating fixture arms (plus the three positive sub-runs that bind
v2-at-B against a v3 worktree) can be passed without reading any revision. I sent this to KumitateR88 for the
kill-rule call. I do not decide it.

### F2 (MEDIUM): `clean-r87` depends on where the lane lives; a clone-based replay reads 19/20
I ran the frozen probe in a `git clone --shared` of the lane, checked out at M, with `--lane <clone>`. Result:
`C88_C1: UNMET held=19/20` (`probe-run3-clone.txt`, exit 1). The failing arm was
`clean-r87: … CLEAN matched=11 … external=1`. Round-87's `c1-probe.txt` has an absolute `cmd=` token under
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/`. Under any other `--lane` that token is external, but the arm
asserts `external=0`. In the same way, `detect-r86` reports `external=2` instead of 1 (that arm does not assert
`external`). This is not nondeterminism: at a fixed lane path the results match exactly (§2). It does mean the
predicate holds only when `--lane` is the canonical path, so a non-author verifier replaying the probe from a clone
gets UNMET against the integrated instrument. Disclose this in the close receipt or verifier notes.

### F3 (LOW): the lane-side arms cannot tell the worktree from the revision at M
`detect-r86`, `detect-r86-renamed` and `sweep` pass under a pure worktree tool (`ctl-nogit-pure.txt`) because the lane
worktree's `scripts/*` equal M. Of the lane arms, only `clean-r87` separates worktree from revision (receipt-bind
changed after d3f64dc4). This is by design, since the fixture arms carry that load, but together with F1 it means
revision discrimination rests entirely on probe constants plus one lane fact.

## 1. Independent checker vs the integrated tool
The checker is `build/K88Review2/mycheck.mjs` (48 lines, sha256 `74f44ff1…b6e3`) and shares no code with the tool or
the probe. For each receipt it parses the fields, takes token 2 of `cmd=`, and reads the bytes with
`git -C <lane> cat-file blob <R>:<path>`, where R is the receipt's `rev=` (or `--rev`; `--force-rev` always uses
`--rev`). An absolute token outside the lane is read from disk and counted as external. It then compares the sha256
with `tool_sha256=`. Driver: `bash build/K88Review2/drive.sh check`.

| dir | integrated tool `--rev M` (receipt) | mycheck receipt-rev | mycheck force-rev M |
|---|---|---|---|
| round-86/close | `DRIFT matched=1 mismatched=9 unchecked=0 external=1 first=c1-probe.txt` exit 1 (`tool-r86.txt`) | matched=1 mismatched=9 unchecked=0 external=1 exit 1 (`mycheck-r86.txt`) | 1/9/0 ext=1 (`mycheck-r86-forcerev.txt`) |
| round-87/close | `CLEAN matched=12 mismatched=0 unchecked=0 external=1` exit 0 (`tool-r87.txt`) | matched=12 mismatched=0 unchecked=0 external=1 exit 0 (`mycheck-r87.txt`) | matched=10 mismatched=2 (`bind-selftest.txt`, `bind.txt`: M blob `098a6713` ≠ claimed `b640ff31`) (`mycheck-r87-forcerev.txt`) |

The tallies agree exactly. The force-rev column shows that `rev=` precedence matters for round-87. For round-86 it
coincides because every receipt claims the counter-receipt digest `e9531370…`, which is equal at 19b4e440 and at M.
Disclosure: the `tool_sha256=` in the `mycheck-*.txt` receipts is the digest of my untracked checker file, so
`receipt-bind` would read those receipts UNRESOLVED at M. They are seat receipts, not close receipts.

## 2. Determinism (K87-V4 repair)
Three runs of the frozen probe at M against the canonical lane, each with a different `--work`, cwd and TMPDIR (the
probe overrides the child's TMPDIR with `--work` anyway):
- run1: `cd / && TMPDIR=$S/t1 node …/probe88-c1.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work $S/w1 --rev M` → `HELD held=20/20` exit 0 (`probe-run1.txt`)
- run2: `cd $S && TMPDIR=$S/t2 node … --work $S/w2 …` → `HELD held=20/20` exit 0 (`probe-run2.txt`)
- run3: `cd $S/clone && TMPDIR=$S/t4 LC_ALL=C node … --work $S/w-four/deeper …` → `HELD held=20/20` exit 0 (`probe-run3.txt`)

Normalisation (`build/K88Review2/norm.sh`): keep the `ARM`/`C88_C1` lines, replace `…/K88Review2/<w>/probe88` with
`<WORK>/probe88`, replace M with `<M>`, and replace any other 40-hex string (fixture commits) with `<FIXREV>`.
`determinism-diff.txt`: `diff norm-run1.out norm-run2.out` exits 0 and `diff norm-run1.out norm-run3.out` exits 0.
**The diff is empty.** The sweep flip target is stable at `s-cite-sources.mjs.txt`: 33 scripts, 33 mod 7 = 5.
The extra clone-lane run (`probe-run3-clone.txt`) differs only as described in F2.

## 3. Per-arm git dependence
Column W is a pure worktree tool with no git (`ctl-nogit-pure.txt`). Column O is W plus probe constants, reflog order
and one hardcoded lane digest (`ctl-nogit-overfit.txt`). For reference, column T is the integrated tool's worktree twin
(`controls/make-worktree-variant.mjs` → `build/K88Review2/receipt-bind-worktree-twin.mjs`, sha256 `bbe4a196…`,
`ctl-worktree-twin.txt`, `UNMET 11/20`; its own selftest fails 36/39).

| arm | W | O | T | needs revision content? why |
|---|---|---|---|---|
| usage | P | P | P | no |
| selftest | P | P | F | no: the probe trusts the tool's self-report |
| detect-r86 | P | P | P | no: worktree = M for these scripts, and all 9 claims mismatch anyway |
| detect-r86-renamed | P | P | P | no (same) |
| clean-r87 | F | P | F | yes (receipt-bind at d3f64dc4 ≠ worktree); one hardcoded digest defeats it |
| unchecked | P | P | P | no |
| unresolved | P | P | P | no: absent from the worktree as well |
| dir-missing | P | P | P | no |
| rev-bad | P | P | P | no: rejected via `.git/logs/HEAD` text lookup |
| symlink-receipt | P | P | P | no |
| rev-receipt-wins | F | P | F | yes; defeated by reflog order + `BODY.v1` constant |
| worktree-forgery | F | P | F | yes; defeated by `BODY.v2` constant |
| default-rev | F | P | F | yes; same |
| rev-receipt-negative | P | P | P | no: worktree v3 ≠ claimed v2, so it reads DRIFT by accident |
| untracked-instrument | P | P | F | no: an `.git/index` substring test suffices |
| escape-relative | P | P | P | no: path arithmetic only |
| symlink-dir | F | P | F | positive sub-run binds v2@B against a v3 worktree; defeated by constant |
| oversize | F | P | F | same |
| duplicate-field | F | P | F | same |
| sweep | P | P | P | no: worktree = M |

**Answer:** 13 of 20 arms can be passed by a tool that never runs git and uses no constants. The remaining 7 need
revision content, and all 7 can be passed without git using reflog text plus the frozen probe's constants (F1).

## Residual risk and gaps
- F1's kill-rule status is the L1's call. If it counts, C1 is UNMET (rejected-honest-stop) under the frozen rule. If
  it does not, the plan should record why overfit controls are excluded, which would be a post-data reading of a
  frozen rule.
- I did not run the round's close battery, the census, or the committed controls (they were already committed at
  8735f70f with max 16/20).
- My checker does not implement the v2 fail-closed tokens (symlink/oversize/ambiguous/escape), apart from counting
  duplicates. Neither close dir exercises them.
