# MutCensusOverlap — R7 live-census vs the frozen manual census (mutation report)

Seat: `KumitateR50.MutCensusOverlap` (mutation-tester). Round 50, v2 wave. Read-only on the lane.
Lane rev at run: `6927903f99bbc26e397aa47387aa76950f42b3a5` (master, 2026-10-23); base rev `ff40d7d`.
Frozen counter: `.ufo/waves/round-50/probe/repairs50-probe.mjs`
sha256 `f69dbc3ecb6212646ed07503cfe395c8a32d5044e2ea8184b86ca74b7dca240d` (unmodified).
Census script: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`
sha256 `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30` (unmodified).
Frozen manual block: `/home/vgpnk/Projects/shokunin/CORPUS.md:131-148`.

**Verdict summary**

1. **No mutant was found where the manual census prints a defect and `sources-census.sh validate` exits 0** for any of the seven frozen manual predicates. The script is a strict superset on those predicates (E01/E03/E06/E07/E10/E11 verified by mutants), plus it catches E02/E04/E12 and indentation that the manual block misses. R7's *predicate coverage* is sound.
2. **R7 is not a function of `<rev>`.** It is a live spawn of a hard-coded census script against `--fleet`, with the subject selected by `$fleet/shokunin.conf` + directory discovery — never the `<lane>` argument whose `<rev>` the other seven checks read. It passes at two different revs with the same worktree, flips with the worktree at an identical rev, passes while the lane argument's SOURCES.md is broken (because it reads a different checkout), and ignores a broken census script placed in `$fleet`. **SURVIVED — real hole** against the counter's own header sentence "Checks committed bytes of `<rev>`".
3. **W-class defects do not fail R7.** A `mined` row with `used-by = —` (a definitional violation of CORPUS.md:103) emits only W03 and exits 0. The manual block also misses it (both skip `—`), so this is a shared blind spot, but it is a real "R7 PASS while SOURCES.md is broken" case.

---

## 1. Baseline (pristine bytes, no mutation)

Commands (from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`): the seven frozen manual
commands copied verbatim from CORPUS.md:133-147, then
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`.

```
=== rows ===           99
=== malformed ===      0
=== tier ===           A=85 B=6 C=8
=== status ===         mined=71 queued=12 rejected=16
=== dup-ids ===        (empty)
=== enums ===          (empty)
=== mined-usedby ===   (empty)
```

```
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
EXIT=0
```

`census` mode agrees with the manual histograms exactly: `rows 99`, `tier.A 85`, `tier.B 6`,
`tier.C 8`, `status.mined 71`, `status.queued 12`, `status.rejected 16`, `FLEET.missing 0`.
`SOURCES.md` sha256 `ff196fce9104532040912db2d1890d5d19d43577d9384ea591492997c10a0d8b`.

Frozen probe on the real lane (pre-data, read-only):
`PROBE rev=6927903… → R7 PASS exit=0`; `PROBE rev=ff40d7d → R7 PASS exit=0`.
R7 is already green at the base control, exactly as the plan declares ("R7 passes"), i.e. it
carries no signal about any r50 repair.

## 2. Method / scratch copy

```
TMP=$(mktemp -d /tmp/r50-mutcensus-XXXXXX)          # /tmp/r50-mutcensus-lkL6z7
mkdir -p $TMP/fleet/.git                             # probe only checks existsSync(fleet/.git)
git clone -q --no-hardlinks <lane> $TMP/fleet/kumitate-shokunin
printf 'kumitate|kumitate-shokunin|test\n' > $TMP/fleet/shokunin.conf
```

All mutants were written to the clone's working-tree `corpus/SOURCES.md` (a scratch copy under
mktemp), never to the lane; each was restored from the pristine copy before the next and at the end.
The manual block was run with CWD = clone root (as CORPUS.md:131 requires); the script was run as
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root $TMP/fleet kumitate` —
the same shape R7 spawns, with a fake fleet root so each mutant owns its subject.

## 3. Coverage matrix — R7 (script exit 0) vs the frozen manual block

Each row: mutation of the live `corpus/SOURCES.md`, the manual block's verdict, the script's
verdict (R7 = `exit 0`), and kill status. Rows M01-M14 were one-mutant-at-a-time on pristine bytes.

| # | mutation | manual block output | script findings | R7 | verdict |
|---|---|---|---|---|---|
| M00 | none (control) | rows=99, malformed=0, no dup/enum/missing | W04×4 only, rc=0 | PASS | control valid |
| M01 | duplicate **3-digit** id `S095`, row inside Registry | `dupids=[S095]` | `E03:S095 duplicate id`, rc=1 | MISS | **killed** (both) |
| M02 | malformed row `\| S096 \| broken \| only \|` (NF=5), inside Registry | `malformed=1` (and `dupids=[S096]`, S096 pre-exists) | `E01:S096 fields=3`, rc=1 | MISS | **killed** (both) |
| M03 | valid row `S900` placed under `## Paths` (outside Registry) | silent; rows=100 | `E12:S900 row outside Registry section`, rc=1 | MISS | **killed** (script only) |
| M04 | two-space-indented row `S901 tier=Z`, inside Registry | silent; rows stays 99 | `E06:S901 tier=Z`, rc=1 | MISS | **killed** (script only) |
| M05 | mined `S001` used-by → `corpus/knowledge/r50-missing.md` | `missing:corpus/knowledge/r50-missing.md` | `E11:S001 missing used-by …`, rc=1 | MISS | **killed** (both) |
| M06 | invalid `tier=Q` on 4-digit id `S1234` | `tier:S1234(Q)` | `E06:S1234 tier=Q`, rc=1 | MISS | **killed** (both) |
| M07 | duplicate 4-digit id `S1235` ×2 inside Registry, distinct URLs | `dupids=[S1235]` | `E03:S1235 duplicate id`, rc=1 | MISS | **killed** (both) |
| M08 | mined `S001` used-by → `—` | silent (skips `—`) | **`W03:S001 mined but unused`, rc=0** | **PASS** | **SURVIVED** (W-class) |
| M09 | semicolon used-by, both paths exist | silent (splits `[,;]`) | `E11:S001 missing used-by <whole cell>`, rc=1 | MISS | script stricter (opposite direction) |
| M10 | mined used-by → **untracked** file | present: silent; removed: `missing:…` | present: rc=0; removed: `E11`, rc=1 | PASS→MISS | **SURVIVED** (live-disk) |
| M11 | tier C + mined + existing used-by `S902` | silent | `W01:S902 tierC mined used-by=…`, rc=0 | PASS | **SURVIVED** (W-class) |
| M12 | duplicate URL+scope of `S001` (`S903`) | silent | `E04:S903 duplicate url … within scope`, rc=1 | MISS | **killed** (script only) |
| M13 | status `halted` on `S904` | `status:S904(halted)` | `E07:S904 status=halted`, rc=1 | MISS | **killed** (both) |
| M14 | kind `community` at tier A on `S905` | `infl:S905` | `E10:S905 community-at-A`, rc=1 | MISS | **killed** (both) |

Answer to the literal question: **no** — I could not make R7 pass while the manual block reported a
defect on the same bytes. Every manual predicate is covered, often twice (script + manual), and the
script adds E02/E04/E05/E08/E09/E10/E12 plus 0-3-space indentation tolerance the manual block lacks.
The one directional gap is M09: the manual splits used-by on `[,;]`, the script on `,` only
(`sources-census.sh:562`), so the script *fails* a semicolon cell the manual accepts. Since
CORPUS.md:107-108 says used-by is comma-separated, that is the script being correctly strict, not a
false pass — **acceptable limit, record it**.

## 4. Hole 1 — R7's subject is the live worktree, not `<rev>` (SURVIVED)

Probe code (frozen bytes, lines 102-105):

```js
const census = sh('/home/vgpnk/Projects/shokunin/scripts/sources-census.sh',
  ['validate', '--root', fleet, 'kumitate']);
const g7ok = census.status === 0;
```

No rev, no `lane`; a hard-coded host script path and the `fleet` directory. Experiment (scratch
clone; identical `<rev>` in every run):

```
== probe R7 on pristine clone, two different revs ==
PROBE rev=6927903f99bbc26e397aa47387aa76950f42b3a5 rc=1   R7 PASS exit=0
PROBE rev=ff40d7d                                 rc=1   R7 PASS exit=0

== same rev, live SOURCES.md broken in the worktree ==
LIVE_SHA_BROKEN=14f966cb78566cbf8719b6f2377f1efbcaa9fac4da881bc9d59b817c19f83a81
PROBE rev=6927903… rc=1   R7 MISS exit=1
RESTORED_SHA=ff196fce9104532040912db2d1890d5d19d43577d9384ea591492997c10a0d8b
PROBE rev=6927903… rc=1   R7 PASS exit=0
```

The worktree flip at an unchanged rev proves R7 has no rev dependence; the two-rev runs prove the
rev argument cannot change R7. Therefore, with `<rev>`'s committed `SOURCES.md` broken and the
worktree carrying fixed bytes, R7 prints PASS. (I did not create a broken commit — the seat
contract forbids `git add/commit/checkout` anywhere; the same-rev flip is the strongest
non-mutating proof and is complete in one direction: R7 = f(live bytes) and not f(rev).)

**Subject selection follows `--fleet`, not `<lane>`.** With the clone's worktree broken and
`--fleet` pointed at the real fleet:

```
clone live sha=14f966cb… (broken); real lane live sha=ff196fce… (clean)
PROBE lane=clone(broken) --fleet=REAL  rc=1   R7 PASS exit=0
PROBE lane=clone(broken) --fleet=FAKE  rc=1   R7 MISS exit=1
```

So R7 can score PASS while the `<lane>` whose rev the other seven checks read is broken, because it
reads `$fleet/kumitate-shokunin` instead. The real counting command happens to set both to the same
directory, but nothing in the probe enforces `lane == fleet/kumitate-shokunin`; a probe run against
a scratch or mutant lane (the standard mutation-test setup) scores the *real* lane's registry.

**E11 (used-by existence) also reads the live disk**, not the rev tree: M10 above — an untracked
`corpus/knowledge/r50-untracked.md` made a mined row's used-by valid (`rc=0`); deleting it flipped
to `E11` and `rc=1`. The frozen manual block is equally live (same M10: `mined-usedby` silent with
the file present, `missing:…` after removal), so no frozen census command in this repo is
rev-pinned; R7 merely inherits it while *claiming* rev bytes.

**The instrument is unpinned.** The script path is the literal host path, so `--fleet` does not
choose it: a fake fleet containing `scripts/sources-census.sh` that is just `exit 1` still yielded
`R7 PASS exit=0`. `scripts/sources-census.sh` appears nowhere in `scripts/proxy-check.mjs`
(`grep -n sources-census` → no match), and it is a fleet-repo file, outside the lane's
`PINS`/`GATE_PINS` family (`proxy-check.mjs:451`, `:461`) and outside `<rev>`. An edit to the host
script changes R7's verdict with no receipt and no pin.

### Is the live-tree dependence an acceptable limit?

Declared: probe header line 20 calls R7 a "(live run)"; the plan's R7 text says "fleet
sources-census `validate kumitate` exit 0". Undeclared: probe header line 7 says "Checks committed
bytes of `<rev>` in `<lane>` plus one fleet-repo check (the r49 report erratum …)" — R7 is neither
committed bytes nor the external fleet check R8 names. `LEDGER_HELD held=8/8` therefore cannot be
read as "the committed rev is registry-conformant"; one of eight checks is a live-tree predicate
over a mutable fleet-selected path with an unpinned instrument.

**Ruling: acceptable only with a receipt that closes the gap; otherwise a real hole.** The frozen
predicate must not be edited after seats score (the r42 rule); the L1 can make R7's PASS honest
without amending it by recording, at close:

```
sha256sum <lane>/corpus/SOURCES.md
git -C <lane> show <rev>:corpus/SOURCES.md | sha256sum        # must equal the line above
git -C <lane> status --porcelain -- corpus/SOURCES.md          # must be empty
sha256sum /home/vgpnk/Projects/shokunin/scripts/sources-census.sh
$S validate --root /home/vgpnk/Projects/shokunin kumitate      # stdout attached
```

and by running the probe only after the close commit, with `<lane>` == `$fleet/kumitate-shokunin`.
If the two sha256 lines differ, R7's PASS says nothing about `<rev>` and should not be cited as
evidence for it. A future round wanting the property structurally would need a new frozen counter
that extracts `<rev>` (e.g. `git archive`/`git show` to a tree, then `--file` for the seven text
predicates); that is a predicate change, not a seat fix, and is out of scope for r50.

## 5. Hole 2 — W-classes pass R7 (SURVIVED)

`validate` exits 0 when only W01/W02/W03/W04 fire (`sources-census.sh:24-33`, validate case
`:737-747`, exit codes `:803-806`). M08 is the sharp case: CORPUS.md:103 defines `mined` as "cited by ≥1 path in
`used-by`", yet a mined row with `used-by = —` emits only `W03` and R7 prints PASS. M11 (tier-C
mined) is the same class and is defensible as a warning by design; M08 is not — the row's declared
status contradicts its own cell. The frozen manual block shares the blind spot (it skips `—` when
collecting paths, CORPUS.md:147), so this is not a "manual catches/script misses" case, but it is a
concrete "R7 PASS while SOURCES.md is broken" case. **Acceptable only if the closure does not claim
"registry conformant"; R7's real meaning is "no E-class findings on the live file".**

## 6. Exploitability ranking (R7)

1. **Subject is `$fleet`, not `<lane>`** — highest. A probe run against any copied/mutant lane
   scores the real lane's registry; at close, any divergence between the two paths is unscored.
   No committed check closes it; the close command's explicit `--fleet /home/vgpnk/Projects/shokunin`
   plus real lane happens to make them equal today.
2. **Live worktree vs `<rev>`** — medium. The lane is currently dirty while the L1 integrates
   (`git status --porcelain` at my run: 53 untracked under `.ufo/waves/round-50/`, 1 modified
   `scripts/cap-run.mjs`; `corpus/SOURCES.md` itself clean). If the probe runs before the close
   commit or with a dirty registry, R7 scores non-rev bytes. Fixed only by the receipt in §4.
3. **Unpinned instrument** — medium. Host-file edit changes the verdict silently; no GATE_PINS
   entry exists or can exist for a fleet-repo file in the lane's pin family.
4. **E11 live disk** — low-medium. Untracked/added used-by targets satisfy it; at close the
   knowledge entries should be committed, but nothing asserts that.
5. **W-class exit 0** — low, real: M08.

## 7. Limits of this attack (recorded, not hidden)

- I did not exercise the 120 s `spawnSync` timeout or a hanging census; on timeout `status` is
  `null` and `g7ok` is false — fails closed, so not a false-pass surface.
- `SOURCES_CENSUS_SELFTEST_BAD_GAWK=1` (script:576) makes gawk fail → `die` exit 2 → R7 MISS;
  fails closed, not a bypass.
- R8 was observed to PASS pre-data on fleet master (its six strings and `## Erratum` are already in
  fleet master's r49 report); that is another live-state check, not my seat's subject. It does mean
  two of eight LEDGER checks are not functions of the lane rev.
- Sibling lanes were not touched or validated; `validate --root <fleet> kumitate` is lane-filtered
  and emitted only `kumitate` rows in every run (verified in the output above).
- The manual-vs-script matrix uses one mutation per predicate class; within a class the script's
  detection is a single code path (E05/E06/E07 share the enum shape, E01/E03 share the row
  parser), so additional variants would repeat the same path.

## 8. Restoration evidence

Scratch clone (`/tmp/r50-mutcensus-lkL6z7/fleet/kumitate-shokunin`):

```
FINAL_SHA=ff196fce9104532040912db2d1890d5d19d43577d9384ea591492997c10a0d8b
PRISTINE=ff196fce9104532040912db2d1890d5d19d43577d9384ea591492997c10a0d8b
FINAL_DIRTY=0        # git status --porcelain -- corpus/SOURCES.md
```

Lane repo (read-only seat; only the report file was written):

```
sha256sum corpus/SOURCES.md  -> ff196fce9104532040912db2d1890d5d19d43577d9384ea591492997c10a0d8b
git status --porcelain -- corpus/SOURCES.md  -> 0 lines
HEAD -> 6927903 (master)
```

The scratch dirs and runner scripts remain under `/tmp/r50-mutcensus-lkL6z7` and
`/tmp/r50-mutcensus-run.sh`, `/tmp/r50-mutcensus-fix.sh`, `/tmp/r50-mutcensus-last.sh`
(disposable; no lane state depends on them).

## 9. Tooling

No installs or upgrades (nothing was needed; `node`, `git`, `gawk`, `bash` already present).

**Report:** `.ufo/waves/round-50/r50/MutCensusOverlap.md`
