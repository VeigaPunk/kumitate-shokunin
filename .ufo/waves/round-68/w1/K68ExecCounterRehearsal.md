# Seat K68ExecCounterRehearsal

VERDICT: Both frozen counters reproduce their base receipts exactly (UNMET, exit 1, identical modulo the receipt trailer line) and all three do-nothing controls print CONTROL-PASS, but both counters contain an unbounded recursive self-invocation that turns one run into a ~200 s process storm (65 nested self-spawns in 45 s, 786 concurrent probe processes host-wide).

## Evidence

Env: `node v24.21.0`; lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; rev `d23892ad44b41e1af63b3edb949d265ca1dd812d`; `TMPDIR=/fast/scratch/hyaku/kumitate-r68/K68ExecCounterRehearsal` (deleted on exit); `/usr/bin/time` absent (`error: command not found: /usr/bin/time`), times are `date +%s%N` deltas.

C1 base — `TMPDIR=$S node .ufo/waves/round-68/probe/ledger68-probe.mjs $LANE d23892ad… --seed 2583a841b9d97d5e`:

```
rc=1 wall_ms=196649 stderr=0B
LEDGER68_UNMET held=1/7 checks=7 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=L68 seed=2583a841b9d97d5e | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS exit=2 verdict=ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems: … | L4 MISS seed=2583a841b9d97d5e 7/20 mutants wrong: … | L5 MISS real-tool-passes-L4=false stubs-caught=always-clean+always-drift | L6 MISS skill-row=false quality=false capability-row=false
$ diff base/ledger68-base.txt build/…/ledger68-base.out
2d1
< ledger68 exit=1            # 998 B vs 982 B: the only difference is the receipt's trailer line
```

C2 base — `TMPDIR=$S node …/deprec68-probe.mjs $LANE d23892ad… --no-live`:

```
rc=1 wall_ms=34240 stderr=0B
DEPREC68_UNMET held=1/10 checks=10 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=M68 | M1 MISS entry-absent | M2 MISS cited=0 | M3 MISS cited=0 | M4 MISS section-absent | M5 MISS no-live | M6 MISS capture-table-absent | M7 MISS section=false | M8 MISS section=false cites201-206=null v18.13.1-row=false | M9 MISS readme-map-exit=1,province-entry-not-named
$ diff base/deprec68-base.txt build/…/deprec68-base.out
2d1
< deprec68 exit=1            # 376 B vs 360 B
```

Controls (byte-identical copies in `build/…/ctl/` with only `W=` redirected into my build dir, so no tracked receipt is touched; `HYAKU_SCRATCH` pointed at my seat scratch):

```
bash ctl/c1-controls.sh donothing   → wrapper_rc=0 wall_ms=191081 → CONTROL-PASS donothing   (control=donothing exit=1; LEDGER68_UNMET held=2/7)
bash ctl/c1-controls.sh autoledger  → wrapper_rc=0 wall_ms=198123 → CONTROL-PASS autoledger  (control=autoledger exit=1; held=2/7, items=61 rows=39 findings=26 first=QUOTE_ABSENT:A63x4@line27)
bash ctl/c2-donothing.sh            → wrapper_rc=0 wall_ms=37485  → CONTROL-PASS c2-donothing (control=c2-donothing exit=1; DEPREC68_UNMET held=1/10)
$ diff <(git show HEAD:.ufo/waves/round-68/controls/<mode>.txt | normalize seed/rev) <(normalize mine)
2a3
> CONTROL-PASS <mode>        # the only difference; CONTROL-PASS goes to stdout, not into the receipt file
```

(Compared against `git show HEAD:` blobs, not the worktree files: the worktree copies of
`c1-donothing.txt` and `c1-autoledger.txt` were rewritten by an external process at 12:07:58 — see
finding -6.)

Refusal arms: unknown rev → `… | rev-unreadable`, exit 2 (both); no args → `usage: …`, exit 64 (both); `GIT_DIR=/tmp/x` → `LEDGER68_UNMET held=0/7 … | ENV_POISONED:GIT_DIR` exit 2; `NODE_OPTIONS=--no-warnings` → `DEPREC68_UNMET held=0/10 … | ENV_POISONED:NODE_OPTIONS` exit 2.

## Findings

**K68ExecCounterRehearsal-1 — HIGH — unbounded recursive self-invocation in both frozen counters.**
Attacks: operability (axis 9) of C1/C2 at counting time; also host stability for every seat.
`ledger68-probe.mjs:439` (L7(b)) spawns the entire counter (`spawnSync(process.execPath, [SELF, D, rev2])`) and the child unconditionally re-enters L7(b) and spawns again; `deprec68-probe.mjs:370` (M10(b)) is identical. No depth guard exists (`grep -n 'DEPTH\|depth' probe/ledger68-probe.mjs probe/deprec68-probe.mjs` → no match). Termination is accidental (resource limits/ancestor timeouts), and each nested level repeats the 2×20 stub harness, so one base C1 run costs `wall_ms=196649` where its real work is ~60 short `node` calls.
Reproducer (fixture = L7(b) construction: symlink `scripts/routed-ledger.mjs` mode 120000; `git -C` throughout; `git rev-parse --show-toplevel` asserted `= $R/fx` before the first commit):

```
TMPDIR=$R/tmp timeout 45 node …/ledger68-probe.mjs "$R/fx" e11af57c232a926566b5af3abf70386fa2f266e9
→ probe_rc=124 wall_ms=45025 (no verdict line ever printed)
→ find "$R/tmp" -name 'ledger68.*' | wc -l = 65   (nested path component depth up to 73)
```

Live host snapshot right after my base run exited: `pgrep -fc 'ledger68-probe.mjs|deprec68-probe.mjs'` = **786**, decaying 786→662→526→422 within ~10 s; sibling orphan cmdline shows 4-deep nesting `/K68ScribeScorecard/ledger68.cTVO8C/ledger68.CiYcP8/ledger68.Ha7861/ledger68.V1ttXb/fx-symtool`. My own orphans were killed by filtering `pgrep -af 'ledger68-probe\.mjs'` on my scratch path (`mine_after=0`); no process outside my seat's paths was touched. Strengthening proposal for the L1 (not applied — frozen): pass a depth counter in `CHILD_ENV(T)` and refuse above depth 2, or replace the self-spawn with an in-process assertion on the extracted tree.

**K68ExecCounterRehearsal-2 — LOW — plan cites receipts that are not in `base/`.**
Plan (§C1/§C2 "Do-nothing controls") names `base/ledger68-donothing.txt`, `base/ledger68-autoledger.txt`, `base/deprec68-donothing.txt`; `base/` holds only `census-before.txt`, `ledger68-base.txt`, `deprec68-base.txt`. The three control receipts are tracked at `.ufo/waves/round-68/controls/{c1-donothing,c1-autoledger,c2-donothing}.txt`. Reproducer: `ls .ufo/waves/round-68/base/ .ufo/waves/round-68/controls/`.

**K68ExecCounterRehearsal-3 — LOW — base receipts contain a trailer the probes never emit.**
`base/ledger68-base.txt` ends `ledger68 exit=1` and `base/deprec68-base.txt` ends `deprec68 exit=1`; neither probe prints such a line (its whole stdout is the single verdict line). A byte-exact replay of the receipts therefore needs the trailer appended by hand, which weakens QUALITY Q64's "exercised receipt" claim unless the trailer is declared as authored. Reproducer: `diff <(cat .ufo/waves/round-68/base/ledger68-base.txt) <(node probe/ledger68-probe.mjs $LANE d23892ad… --seed 2583a841b9d97d5e)`.

**K68ExecCounterRehearsal-4 — LOW — C1 control receipts are not seed-reproducible as committed.**
`controls/c1-donothing.txt` embeds `seed=45b0c2952889bb42` (random per run). The mutant-failure *count* is stable (tracked 7/20; my 5de2cc484521af7b 7/20; ddb209d676ae0256 7/20), but the failing mutant set is unpinned, so a later run can only be compared modulo seed. C2 has no seed arm and reproduces byte-for-byte. Reproducer: `grep -o 'seed=[0-9a-f]*' .ufo/waves/round-68/controls/*.txt`.

**K68ExecCounterRehearsal-5 — HIGH — the frozen C2 counter was edited in-wave (freeze breach by another seat).**
Worktree `probe/deprec68-probe.mjs` sha256 `8c64f323bd2ee5dc…` vs HEAD blob `f0a3142e82ba1791…`; mtime `2026-10-27 12:08:52` — after the freeze commit `39f61816` and after my base run (11:55). The diff adds an `isSepRow` separator predicate to M6's snapshot-row filter. Base behaviour is unchanged (post-edit re-run, `rc=1 wall_ms=36976`, identical `DEPREC68_UNMET held=1/10 …` modulo the trailer), but the file the round measures no longer matches the file the round froze, and the base receipt was produced from the pre-edit bytes. This seat did not write under `probe/` or `controls/`.
Reproducer: `git -C <lane> status --porcelain -- .ufo/waves/round-68/probe; sha256sum probe/deprec68-probe.mjs; git show HEAD:.ufo/waves/round-68/probe/deprec68-probe.mjs | sha256sum`.

**K68ExecCounterRehearsal-6 — HIGH — committing the control receipts in place makes them destructible; frozen evidence is churning.**
`c1-controls.sh`/`c2-donothing.sh` write straight into the tracked dir (`W="$LANE/.ufo/waves/round-68/controls"`) with `> "$W/c1-$MODE.txt"`. Observed sequence (all external — this seat never wrote there): at `12:07:58` `c1-donothing.txt` (worktree `5c468ce02294` vs HEAD `062ff99f234c`) and `c1-autoledger.txt` were rewritten, the latter at one observation being **0 bytes** (`e3b0c44298fc…` = sha256 of the empty string, i.e. a run killed between the `>` redirect and its output); re-checked at `12:11:06`, `c1-autoledger.txt` held a fresh 1108-byte body (`16ed464b41f6` vs HEAD `cad3c5bb457e`) while `c2-donothing.txt`, previously intact at 556 bytes matching HEAD, was now **0 bytes**. Round-68's frozen control receipts are therefore neither pinned to the commit nor stable while the wave runs — and any comparison made against the worktree files silently compares different bytes.
Reproducer: `for f in c1-donothing c1-autoledger c2-donothing; do sha256sum .ufo/waves/round-68/controls/$f.txt; git show HEAD:.ufo/waves/round-68/controls/$f.txt | sha256sum; done`, plus `stat -c '%y %n' .ufo/waves/round-68/controls/*.txt`.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ExecCounterRehearsal/rehearsal.md` — every arm with command, verbatim output, wall time.
- `…/build/K68ExecCounterRehearsal/{ledger68-base.out,deprec68-base.out,deprec68-base-after-edit.out,c1-donothing.out,c1-autoledger.out,c2-donothing.out,rec-out.txt}` — copies of the runs cited here (taken before scratch deletion).
- `…/build/K68ExecCounterRehearsal/ctl/{c1-controls.sh,c2-donothing.sh,c1-donothing.txt,c1-autoledger.txt,c2-donothing.txt}` — the control copies (one-line `W=` delta) and their receipts.
- This report: `.ufo/waves/round-68/w1/K68ExecCounterRehearsal.md`.

## Limits

- Not checked: the counters at the integration tip `M` (the claim's real measurement point) — `corpus/routed-ledger.md`, the S207–S213 rows and the entry do not exist yet, so C1's HELD path (L1–L7 all passing, L2 CLEAN, L4 in-tool mutant set) and C2's live M5 arm are untested; only the base/UNMET side and the guards were exercised.
- Live network arms (C2 M5) were not exercised: base runs use `--no-live` by design; the M5 fetch path, its 45 s abort and a `--no-live`-free run remain unmeasured.
- `routed-ledger.mjs` v1 was exercised only through the counters; its `--selftest` at base prints `PASS (33/33)` and exits 0, which is what makes L1 MISS.
- The mkdir-only `extract()` walk tolerates symlinks and the traversal cost were not independently audited; only the arms the counters claim (symlinked tool → L1 MISS, symlink at a static path → FAIL-CLOSED, special files → `EXTRACTION_UNSAFE`) were observed indirectly through L7/M10 passing at base.
- Host was heavily loaded by sibling seats running these same counters (781–827 live probe processes at sample time); wall times here are upper bounds under contention, not isolated measurements.
- The C2 base run at 11:55 executed the `HEAD` bytes of `deprec68-probe.mjs`; the post-edit worktree copy (finding -5) was re-run at 12:10 and gives the same UNMET line, so no base reading in this report depends on which of the two bytes was used.
