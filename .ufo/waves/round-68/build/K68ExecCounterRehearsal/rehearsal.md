# K68ExecCounterRehearsal — counter rehearsal (round 68, w1)

Seat: `K68ExecCounterRehearsal` (leaf). Host: linux 7.2.11-arch1-1 x64, `node v24.21.0`
(fnm node at `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`).
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Base revision rehearsed:
`d23892ad44b41e1af63b3edb949d265ca1dd812d`. Seat scratch (deleted on exit):
`/fast/scratch/hyaku/kumitate-r68/K68ExecCounterRehearsal`.
Receipts copied here before scratch deletion: `ledger68-base.out`, `deprec68-base.out`,
`c1-donothing.out`, `c1-autoledger.out`, `c2-donothing.out`, `rec-out.txt`, `ctl/`.

Wall times are `date +%s%N` deltas around a single invocation (`/usr/bin/time` is not installed
on this host — `error: command not found: /usr/bin/time`).

## A. C1 counter vs BASE

    S=/fast/scratch/hyaku/kumitate-r68/K68ExecCounterRehearsal
    LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
    REV=d23892ad44b41e1af63b3edb949d265ca1dd812d
    TMPDIR="$S" node "$LANE/.ufo/waves/round-68/probe/ledger68-probe.mjs" "$LANE" "$REV" \
        --seed 2583a841b9d97d5e > "$S/ledger68-base.out" 2> "$S/ledger68-base.err"

`rc=1 wall_ms=196649 stderr=0B`, and 0 leftover `ledger68.*` temp dirs afterwards. stdout (982 B):

    LEDGER68_UNMET held=1/7 checks=7 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=L68 seed=2583a841b9d97d5e | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS exit=2 verdict=ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems: ledger-empty-or-absent,unledgered:55#1,unledgered:55#2,unledgered:55#3,unledgered:56#1,unledgered:56#2 | L4 MISS seed=2583a841b9d97d5e 7/20 mutants wrong: good:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 clo;ordinal:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=8 open=7 clo;one-word-quote:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 clo;ambiguous-quote:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 clo | L5 MISS real-tool-passes-L4=false stubs-caught=always-clean+always-drift | L6 MISS skill-row=false quality=false capability-row=false

(`L7` — self-confinement — is the single passing check, which is why `held=1/7`.)

Diff against the frozen receipt `base/ledger68-base.txt` (998 B), with the same `--seed`:

    $ diff <(cat .ufo/waves/round-68/base/ledger68-base.txt) <(cat build/.../ledger68-base.out)
    2d1
    < ledger68 exit=1
    $ wc -c base/ledger68-base.txt build/K68ExecCounterRehearsal/ledger68-base.out
     998 .../base/ledger68-base.txt
     982 .../build/K68ExecCounterRehearsal/ledger68-base.out

The only difference is the receipt's trailer line `ledger68 exit=1` (added by whoever froze the
receipt; the probe itself writes exactly one verdict line). **Verdict reproduces byte-for-byte
modulo that trailer.**

## B. C2 counter vs BASE

    TMPDIR="$S" node "$LANE/.ufo/waves/round-68/probe/deprec68-probe.mjs" "$LANE" "$REV" \
        --no-live > "$S/deprec68-base.out" 2> "$S/deprec68-base.err"

`rc=1 wall_ms=34240 stderr=0B`, 0 leftover `deprec68.*` temp dirs. stdout (360 B):

    DEPREC68_UNMET held=1/10 checks=10 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=M68 | M1 MISS entry-absent | M2 MISS cited=0 | M3 MISS cited=0 | M4 MISS section-absent | M5 MISS no-live | M6 MISS capture-table-absent | M7 MISS section=false | M8 MISS section=false cites201-206=null v18.13.1-row=false | M9 MISS readme-map-exit=1,province-entry-not-named

(`M10` — self-confinement — is the single passing check, hence `held=1/10`.)

    $ diff <(cat .ufo/waves/round-68/base/deprec68-base.txt) <(cat build/.../deprec68-base.out)
    2d1
    < deprec68 exit=1
    $ wc -c base/deprec68-base.txt build/K68ExecCounterRehearsal/deprec68-base.out
     376 .../base/deprec68-base.txt
     360 .../build/K68ExecCounterRehearsal/deprec68-base.out

Same shape as A: identical modulo the `deprec68 exit=1` trailer. No seed arm exists in M68, so this
is a full byte-level reproduction.

## C. Do-nothing controls

The frozen scripts write their receipts to the tracked directory `.ufo/waves/round-68/controls/`
(`git ls-files` lists `c1-donothing.txt`, `c1-autoledger.txt`, `c2-donothing.txt`), which is outside
this seat's write scope. To rehearse without mutating tracked receipts I ran byte-identical copies in
`build/K68ExecCounterRehearsal/ctl/` with a single line changed — the receipt dir `W=`:

    $ diff -u probe/c1-controls.sh build/K68ExecCounterRehearsal/ctl/c1-controls.sh
    -W="$LANE/.ufo/waves/round-68/controls"
    +W="/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ExecCounterRehearsal/ctl"

(the same one-line delta in `c2-donothing.sh`). `LANE`, `PROBE`, `STAGED`, `S` and every control
semantic are untouched. Scratch is redirected under the seat dir via
`HYAKU_SCRATCH=/fast/scratch/hyaku/kumitate-r68/K68ExecCounterRehearsal`, so the scripts' own
`S="${HYAKU_SCRATCH}/kumitate-r68/..."` lands inside the seat's scratch.

### C1a — `c1-controls.sh donothing`

    HYAKU_SCRATCH="$S" bash build/K68ExecCounterRehearsal/ctl/c1-controls.sh donothing

`wrapper_rc=0 wall_ms=191081`:

    LEDGER68_UNMET held=2/7 checks=7 rev=f6377745c2e17f1ec917bd28a8f10128ae0560ac rule=L68 seed=5de2cc484521af7b | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS exit=1 verdict=ROUTED_LEDGER: DRIFT spotchecks=12 sections=12 items=61 rows=0 open=0 closed=0 wontfix=0 findings=61 first=UNLEDGERED:round-55-item-1 own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems: ledger-empty-or-absent,unledgered:55#1,unledgered:55#2,unledgered:55#3,unledgered:56#1,unledgered:56#2 | L4 MISS seed=5de2cc484521af7b 7/20 mutants wrong: good:exit=1:... | L5 MISS ... | L6 MISS ...
    control=donothing exit=1 rev=f6377745c2e17f1ec917bd28a8f10128ae0560ac
    CONTROL-PASS donothing

(`| L4/L5/L6` tails elided here only; the full 1053-byte line is in `ctl/c1-donothing.txt` and the
normalized diff below is byte-exact.) Compared with the tracked receipt, seed/rev/trailer normalized:

    $ diff <(norm < .ufo/waves/round-68/controls/c1-donothing.txt) <(norm < c1-donothing.out)
    2a3
    > CONTROL-PASS donothing

i.e. identical except the `CONTROL-PASS` marker, which the script prints to stdout but does not
append to its own receipt file. `held=2/7` in both (L2 is *attempted* here, so it is not the
FAIL-CLOSED arm of the base reading, and L7 passes).

### C1b — `c1-controls.sh autoledger`

    HYAKU_SCRATCH="$S" bash build/K68ExecCounterRehearsal/ctl/c1-controls.sh autoledger

`wrapper_rc=0 wall_ms=198123`:

    LEDGER68_UNMET held=2/7 checks=7 rev=a11cf039f8be6eb38dc74775cdee140e2cdf9b39 rule=L68 seed=ddb209d676ae0256 | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS exit=1 verdict=ROUTED_LEDGER: DRIFT spotchecks=12 sections=12 items=61 rows=39 open=39 closed=0 wontfix=0 findings=26 first=QUOTE_ABSENT:A63x4@line27:round-63-item-4 own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 31 problems: A63x4:quote-not-word-boundary-in-item,A63x6:quote-not-word-boundary-in-item,unledgered:55#3,unledgered:56#1,unledgered:56#2,unledgered:56#3 | L4 MISS ... | L5 MISS ... | L6 MISS ...
    control=autoledger exit=1 rev=a11cf039f8be6eb38dc74775cdee140e2cdf9b39
    CONTROL-PASS autoledger

    $ diff <(norm < controls/c1-autoledger.txt) <(norm < c1-autoledger.out)
    2a3
    > CONTROL-PASS autoledger
    $ wc -c controls/c1-autoledger.txt c1-autoledger.out
    1108 / 1132   (delta 24 = len("CONTROL-PASS autoledger\n"))

### C2 — `c2-donothing.sh`

    HYAKU_SCRATCH="$S" bash build/K68ExecCounterRehearsal/ctl/c2-donothing.sh

`wrapper_rc=0 wall_ms=37485`:

    DEPREC68_UNMET held=1/10 checks=10 rev=82544d9abc38fb8fc96f79c21ffb788334e563cf rule=M68 | M1 MISS sources=2 verified-at=true recheck=true | M2 MISS cited=2 S233:row-absent,S234:row-absent | M3 MISS cited=2 S233:pin-absent,S234:pin-absent | M4 MISS section-absent | M5 MISS no-live | M6 MISS capture-table-absent | M7 MISS section=false | M8 MISS section=false cites201-206=null v18.13.1-row=false | M9 MISS census-exit=2,sources-check-exit=1,source-capture-exit=1,readme-map-exit=1
    control=c2-donothing exit=1 rev=82544d9abc38fb8fc96f79c21ffb788334e563cf
    CONTROL-PASS c2-donothing

    $ diff <(norm < controls/c2-donothing.txt) <(norm < c2-donothing.out)
    2a3
    > CONTROL-PASS c2-donothing

All three controls print `CONTROL-PASS` and exit 0; every reading is UNMET at exit 1 as frozen.

## D. Refusal / guard arms (rehearsed directly)

    node ledger68-probe.mjs "$LANE" deadbeefdeadbeefdeadbeefdeadbeefdeadbeef
    LEDGER68_UNMET held=0/7 checks=7 rev=deadbeefdeadbeefdeadbeefdeadbeefdeadbeef rule=L68 | rev-unreadable
    exit=2
    node ledger68-probe.mjs
    usage: ledger68-probe.mjs <lane-dir> <rev> [--tool path] [--seed hex]
    exit=64
    node deprec68-probe.mjs "$LANE" deadbeef...
    DEPREC68_UNMET held=0/10 checks=10 rev=deadbeef... rule=M68 | rev-unreadable
    exit=2
    node deprec68-probe.mjs
    usage: deprec68-probe.mjs <lane-dir> <rev> [--no-live]
    exit=64
    GIT_DIR=/tmp/x node ledger68-probe.mjs "$LANE" d23892ad...
    LEDGER68_UNMET held=0/7 checks=7 rev=unknown rule=L68 | ENV_POISONED:GIT_DIR
    exit=2
    NODE_OPTIONS=--no-warnings node deprec68-probe.mjs "$LANE" d23892ad... --no-live
    DEPREC68_UNMET held=0/10 checks=10 rev=unknown rule=M68 | ENV_POISONED:NODE_OPTIONS
    exit=2

## E. Measured operability defect: unbounded recursive self-invocation

A single base run of C1 costs **196.6 s** while its real work is ~60 short `node` invocations
(L4's 20 mutants + L5's 2×20 stub runs). Instrumented reproducer — a one-commit fixture whose
`scripts/routed-ledger.mjs` is a symlink (mode 120000, exactly the L7(b) construction):

    R=$S/rec; mkdir -p "$R/fx/scripts" "$R/tmp"; cd "$R/fx"; git init -q
    printf 'placeholder\n' > scripts/routed-ledger.mjs
    printf 'process.stdout.write("ROUTED_LEDGER_SELFTEST: PASS (99/99)\\n");\n' > outside-tool.mjs
    git add -A; git rev-parse --show-toplevel   # => /fast/scratch/.../rec/fx  (asserted before first commit)
    git -c user.name=f -c user.email=f@invalid -c commit.gpgsign=false commit -q --no-verify -m base
    rm scripts/routed-ledger.mjs
    H=$(git hash-object -w outside-tool.mjs)
    git update-index --add --cacheinfo "120000,$H,scripts/routed-ledger.mjs"
    git -c user.name=f -c user.email=f@invalid -c commit.gpgsign=false commit -q --no-verify -m symlink-tool
    TMPDIR="$R/tmp" timeout 45 node .../ledger68-probe.mjs "$R/fx" e11af57c232a926566b5af3abf70386fa2f266e9

    rev=e11af57c232a926566b5af3abf70386fa2f266e9
    120000 blob d54b31d2dcc71f931376520da701c869fcb9d2a0      64	scripts/routed-ledger.mjs
    probe_rc=124 wall_ms=45025          # killed by timeout(1): no verdict line was ever printed
    nested witness dirs left under TMPDIR: 65   (path component depth up to 73)
    rec-out.txt = 0 bytes

Cause: `ledger68-probe.mjs:439` (`L7(b)`) spawns `process.execPath [SELF, D, rev2]` — the full
counter — and the child unconditionally reaches its own `L7(b)` and spawns again; there is no depth
guard anywhere in either probe (`grep -n 'DEPTH\|depth' ledger68-probe.mjs deprec68-probe.mjs` →
no match). `deprec68-probe.mjs:370` does the same for `M10(b)`. Termination is accidental (resource
limits / ancestor timeouts), and every level re-runs the 2×20 stub harness (~4 s), which is why the
base run takes ~196 s instead of ~10 s. Live host snapshot taken after my base run exited:
`pgrep -fc 'ledger68-probe.mjs|deprec68-probe.mjs'` = **786**, decaying 786 → 662 → 526 → 422 over
~10 s; sample nested cmdlines from sibling seats:

    114674 node .../probe/ledger68-probe.mjs /fast/scratch/.../K68ScribeScorecard/ledger68.cTVO8C/ledger68.CiYcP8/ledger68.Ha7861/ledger68.V1ttXb/fx-symtool b338271f...

i.e. a grandchild-of-grandchild invocation path. My own orphans were killed by filtering
`pgrep -af 'ledger68-probe\.mjs'` on my scratch path (`mine_after=0`); scratch removed.

Suggested strengthening (for the L1, not applied): a `K68_DEPTH`-style counter in the spawn env
(`CHILD_ENV(T)` plus `DEPTH: n+1`, refuse above e.g. 2) or replacing the symlink-proof self-spawn
with an in-process assertion over the extracted tree.

## F. External mutations observed while rehearsing (not by this seat)

This seat wrote only `build/K68ExecCounterRehearsal/` and its `w1` report; it never wrote under
`probe/` or `controls/`. Two tracked frozen paths changed under me during the wave:

    $ git -C "$LANE" status --porcelain -- .ufo/waves/round-68/probe .ufo/waves/round-68/base .ufo/waves/round-68/controls
     M .ufo/waves/round-68/controls/c1-autoledger.txt
     M .ufo/waves/round-68/controls/c1-donothing.txt
     M .ufo/waves/round-68/probe/deprec68-probe.mjs
    $ stat -c '%y %n' controls/*.txt probe/deprec68-probe.mjs
    2026-10-27 12:07:58 … controls/c1-autoledger.txt
    2026-10-27 12:07:58 … controls/c1-donothing.txt
    2026-10-27 11:46:55 … controls/c2-donothing.txt
    2026-10-27 12:08:52 … probe/deprec68-probe.mjs
    $ sha256sum probe/deprec68-probe.mjs | cut -c1-16          → 8c64f323bd2ee5dc
    $ git show HEAD:.ufo/waves/round-68/probe/deprec68-probe.mjs | sha256sum | cut -c1-16 → f0a3142e82ba1791
    $ sha256sum controls/c1-autoledger.txt                     → e3b0c44298fc… (sha256 of the empty string)

`git diff -U1 probe/deprec68-probe.mjs` shows an added `isSepRow` predicate in M6. Re-running C2 at
base against the edited worktree copy still reproduces the frozen receipt:

    rc=1 wall_ms=36976
    DEPREC68_UNMET held=1/10 checks=10 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=M68 | M1 MISS entry-absent | … | M9 MISS readme-map-exit=1,province-entry-not-named
    $ diff base/deprec68-base.txt deprec68-base-after-edit.out
    2d1
    < deprec68 exit=1

Because `c1-controls.sh`/`c2-donothing.sh` write their receipts into the tracked directory
(`W="$LANE/.ufo/waves/round-68/controls"`, `> "$W/c1-$MODE.txt"`), any later run of a frozen control
overwrites frozen evidence, and a killed run truncates it to 0 bytes — exactly what `c1-autoledger.txt`
now is. My own comparisons therefore use `git show HEAD:` blobs, not the worktree files.

## G. Follow-up observation (12:11:06) — the churn continues

Re-checked after the first draft of §F: `c1-autoledger.txt` is again 1108 bytes with a *new* hash
(`16ed464b41f6`, HEAD `cad3c5bb457e`) while `c2-donothing.txt`, intact at 556 bytes in §F, is now
**0 bytes** (`e3b0c44298fc…`). So each external control run truncates and rewrites a committed
receipt, and a killed run leaves it empty; `git status` for `controls/` flips between "modified" and
"clean" depending on the moment of observation. All comparisons in this rehearsal use
`git show HEAD:` blobs for that reason.
