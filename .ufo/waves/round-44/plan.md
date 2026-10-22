# kumitate round 44 — plan (frozen at the plan commit; never amended)

Round open: lane `master` = `6cda8c353c7dd7a890eb20382ffa55fac9daaf6d`. Dispatched 2026-10-23T01:03Z;
scope freeze 03:03Z, hard stop 04:03Z. L1 `KumitateR44` holds the §3 planner seat.

Counter, shape and this plan are committed together before any seat runs. Nothing below is changed
after that commit. A finding that would change the predicate, the counter, the shape or the target
is recorded as a finding; the claim is then judged on what is written here.

## Anti-loop and repair-first

Rounds 42 and 43 were rejected on the `gate-mutants` capability (operability): r42 because the kill
rule changed after data, r43 because junk controls met the counter. This round claims nothing on
`gate-mutants` and moves to different ground: the OMP harness agent root `~/.omp/agent/`, which
`PROVINCE.md` lists as frontier ("OMP harness contract … first entry
`corpus/knowledge/omp-task-contract.md`") and which no lane gate reads today. The round-43 routed
defects R43-1..R43-6 are dispositioned first (below). None of them is a claim.

## C1 — operability: capability `omp-census` (a new gate over the OMP agent root)

Axis named by the surface it changes: the lane's runnable instruments (`scripts/`) gain a gate,
`scripts/omp-census.mjs`, that reads the shape of `~/.omp/agent/` (names, kinds, permission bits;
never contents) and decides CLEAN or DRIFT from per-member rules. It is operability (AXES: "scripts
that run … produce the stated outcome"), counted by a pass-sensitive counter (QUALITY Q26). The
coverage term is not claimed; PROVINCE moves no band this round.

**Census contract (what the build must satisfy).** `node scripts/omp-census.mjs [--root DIR]` (default
`$HOME/.omp/agent`) prints exactly one line starting `OMP_CENSUS: CLEAN` and exits 0, or exactly one
line starting `OMP_CENSUS: DRIFT` and exits 1; exit 2 fail-closed (root unreadable), 64 usage;
`--selftest` is a hermetic suite ending `VERDICT: PASS|FAIL`. One file, node built-ins only, `lstat`
and `readdir` only (no content read of any member). Member rules: exact name or chain template,
kind, permission ceiling, sidecars (`-shm`/`-wal`) and chain generations optional. Rules that name a
writer cite a `corpus/SOURCES.md` row opened this round.

### P44 — the predicate (same sentence as `probe/p44-count.mjs` and the receipt label `P44`)

A case PASSES iff the census under test, run alone in a bubblewrap sandbox that shows it only its
own file (/c/omp-census.mjs, read-only) and the case's shape mirror (/r, read-only), with a cleared
environment, `--root /r` as its only arguments, a 20 s wall limit and a 256 MB V8 heap, exits 0 and
prints exactly one line starting `OMP_CENSUS: CLEAN` and no line starting `OMP_CENSUS: DRIFT` when
the case expects CLEAN, or exits 1 and prints exactly one line starting `OMP_CENSUS: DRIFT` and no
line starting `OMP_CENSUS: CLEAN` when the case expects DRIFT. The counter reads `P44_COUNT: MET` iff
every generated case passes and there are at least 20 cases; otherwise `P44_COUNT: UNMET`.

Cases are generated from the frozen shape `probe/p44-shape.tsv` (38 entries of `~/.omp/agent` at
plan time: 19 base, 12 sidecar, 7 chain; sha256 recorded in the plan commit's receipt) by the
generic rules in the counter header: control and control-end (CLEAN), two random strays (DRIFT),
`near:<m>` (`<m>.orig` added, DRIFT), `kind:<m>` (file↔dir flip, DRIFT), `mode:<m>` (o+r on a member
with no group/other bits, DRIFT), `gen:<family>` (one fresh chain generation, CLEAN), `no-sidecars`
and `no-chains` (CLEAN). 59 cases at this shape. Order is shuffled, mirror entries are created in
random order, the mirror path is the same for every case.

### Measurement (one command over committed bytes)

```sh
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin; P=<plan commit>; R=<measured commit>
W=$(mktemp -d /fast/scratch/hyaku/kumitate-r44/measure.XXXXXX)
git -C $L show $P:.ufo/waves/round-44/probe/p44-count.mjs > $W/p44-count.mjs
git -C $L show $P:.ufo/waves/round-44/probe/p44-shape.tsv > $W/p44-shape.tsv
git -C $L show $R:scripts/omp-census.mjs > $W/omp-census.mjs 2>/dev/null || rm -f $W/omp-census.mjs
timeout 600 node $W/p44-count.mjs --census $W/omp-census.mjs --shape $W/p44-shape.tsv; echo exit=$?
```

- **Before (do-nothing control, round-open bytes `6cda8c35`):** `scripts/omp-census.mjs` is absent →
  `P44_COUNT: UNMET (passed=0 cases=59 …)` exit 1. Receipt: `open/p44-before-6cda8c35.txt`.
- **After (target, one value):** `P44_COUNT: MET (passed=59 cases=59 floor=20 …)` exit 0 at the
  measured commit, with the counter and shape extracted from the plan commit (sha256 printed in the
  receipt header). The counted run is the first run of the frozen counter on the census bytes of
  the measured commit; whatever it reads is the result. Later runs on the same bytes are
  re-derivations, never replacements, and each is named in the receipt. Development runs on
  candidate (uncommitted) census bytes happen only after the control receipts are committed; each
  is listed in `final/p44-dev-runs.txt` with the candidate's sha256 and its summary line.

### Controls (scored with the frozen counter before any census is scored; receipts committed first)

A control is a program that skips the claimed work: it does not read the mirror, or reads it but
encodes no per-member rule, or decides on anything other than the mirror's shape. Each must read
`P44_COUNT: UNMET`. Named before data: absent file; constant CLEAN; constant DRIFT; random verdict;
right exit codes with no verdict line; both verdict lines; hard-coded entry count; kind multiset
only; exact name set (no kind/mode); exact snapshot of names, kinds and modes with no chain or
sidecar rule; prefix-permissive (any name that starts with a known member); digit-permissive (any
name with a digit run); keyed on environment, argv, time, inode or creation order, mtime, or
persisted state; one that tries to read the lane, the counter or the live root from inside the
sandbox. **Kill rule (before data):** if any of these, or any further control a control-wave seat
builds that skips the work, reads `P44_COUNT: MET`, C1 is redesigned before any census is scored, or
declared exploratory; the predicate is never amended in place.

Work-minimal reference, declared now so it is not mistaken for a control later: a census that reads
the mirror and encodes, per member, a name or chain template, a kind and a permission ceiling, with
sidecars and chain generations optional, is the claimed work at its minimum. Such a program reaching
MET is the claim, not a shortcut. The counter's limits are stated here, not discovered later: it
measures discrimination over shapes derived from one root at one time; members absent from that
root, and the correctness of writer attributions, are outside it (the knowledge entry and the
falsify wave carry those).

### Kill rules for C1 (any one fails the claim)

1. The counted run reads anything other than `P44_COUNT: MET (passed=59 cases=59 …)` exit 0.
2. Any control above reads MET (before data → redesign; after data → C1 fails).
3. The census reads any member's content (a falsify review finds a read other than `lstat`/`readdir`
   of the root), or imports anything outside node built-ins.
4. `node scripts/omp-census.mjs --selftest` does not end `VERDICT: PASS` exit 0 at the measured commit.
5. An axis is harmed: `node scripts/proxy-check.mjs --strict` not `PROXY: MATCH` exit 0 at the
   measured commit, or any other lane gate's verdict moves from PASS/CLEAN to a failure.

## Frontier step (not a claim)

`corpus/SOURCES.md` gains rows for the upstream writers of the root's members and chains (oh-my-pi
at the tag of the installed `omp/18.12.6`; SQLite on `-wal`/`-shm`; the REA backup naming), each
opened this round with a ≤25-word located quote; C1's census rules cite them (sourced claim). The
lesson `corpus/lessons/round-44.md` mines the round-43 mistake (a target a skip-work control met).
Census before → after: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`.

## Round-43 routed defects — dispositions

- **R43-1** (gate-mutants counter gameable): not re-claimed (anti-loop). The capability row records
  the miss (R43-4). The remedy the closure named (one run prefix, non-listable scratch) is the P44
  sandbox design; the gate-mutants counter itself stays as is, open in `## Limits`.
- **R43-2** (A1 timing; "four routes → A1" attribution): appended correction to
  `corpus/lessons/round-43.md`; this round's report corrects the attribution.
- **R43-3** (measured ≠ shipped): a frozen-counter receipt over the shipped tip `b01ded32` (seat run,
  bounded) is committed as round-44 evidence; the capability row records the gap either way.
- **R43-4** (capability row `gate-mutants`): corrected in place per the round-43 pre-registered
  correction: the row records that the claim did not verify in rounds 42 and 43.
- **R43-5** (witness single points WA/WB/WC; both verdict lines accepted by K43 (c)): recorded open in
  SCORECARD `## Limits`; the owed seats MutCiteWitness and SentinelReaper run this round (findings
  recorded, nothing claimed). P44 rejects a run that prints both verdict lines.
- **R43-6** (receipts name earlier runs; report minors): appended note to the round-43 receipts
  record in the round-43 lesson; this report notes the duplicate `b01ded32` line and the dangling
  sentence of the round-43 report (the filed report is not rewritten).

## Swarm shape

Two v1 waves plus at most one residual call: wave 1 `controls` (control wave + recon + source
opening + census build, no seat runs the counter on a census that is not a control), then the L1
commits the control receipts, then the L1 runs the counted measurement, then wave 2 `falsify`.
Seats never write in the lane except their own report file; the L1 integrates through
`scripts/hyaku/jj-lane.sh`.

## Frozen bytes (recorded at the plan commit)

- `probe/p44-count.mjs` sha256 `26180b32c6deea7bd18abce6895da2a6d1b1bfdf9de45d41e52d4b8b7d7434c8`
- `probe/p44-shape.tsv` sha256 `fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71`
- Before receipt `open/p44-before-6cda8c35.txt`: `P44_COUNT: UNMET (passed=0 cases=59 floor=20 census_sha256=absent)` exit=1
