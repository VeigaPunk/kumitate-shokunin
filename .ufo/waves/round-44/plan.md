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

## Pre-data redesign (01:24Z, before any seat was dispatched and before any census existed or was scored)

The L1's own pre-dispatch control analysis found a label-keyed shortcut that the v1 case set admits:
a census that says DRIFT iff some name starts `zq` or ends `.orig`, or a known name changed kind or
gained group/other bits, reads MET under `p44-count.mjs` without any chain or sidecar rule, because
v1's strays carried fixed labels. Per this plan's own kill rule ("redesigned before any census is
scored"), the counter is replaced, not amended: `probe/p44b-count.mjs` (sha256
`6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517`) is the C1 counter from this
commit on. **The predicate P44 is unchanged, word for word** (`casePasses` is byte-identical); only case
generation changes: strays are random letters with a random extension; `near:<m>` is `<m>.` + random
letters; new `neardigit:<m>` (`<m>.` + 14 random digits, DRIFT) and `crossgen:<f>` (a fresh chain
generation re-based onto a base file of another extension, DRIFT). At the frozen shape the case set
is **87** (was 59). `p44-count.mjs` stays committed as history and is not the C1 counter.

Superseding values (everything else above stands):

- Counter: `probe/p44b-count.mjs` everywhere the plan says `probe/p44-count.mjs`.
- Before: `open/p44b-before-6cda8c35.txt` → `P44_COUNT: UNMET (passed=0 cases=87 floor=20 census_sha256=absent)` exit=1.
- After target (one value): `P44_COUNT: MET (passed=87 cases=87 floor=20 …)` exit 0 at the measured commit.
- Kill rule 1 reads `passed=87 cases=87`.
- Measurement command: as above with `p44b-count.mjs` in both the `git show` and the `node` line.

## Second pre-data redesign (2026-10-23 ~01:29Z by commit time; no census had been scored)

The control wave (`controls/`, 39 seats dispatched 01:19:52Z) found two skip-work programs that read
`P44_COUNT: MET (passed=87 cases=87)` under `p44b-count.mjs`: **CtlLabelKeyedA** (sha256 `964fce5d…`:
a global directory count, a global 600/644 split, at most nine 0644 files, and a reject rule for the
fixed crossgen target `RULES.md.*`; no per-member rule, no chain template) and **CtlLabelKeyedB**
(sha256 `bddddbe8…`: 19 names, a global directory count and a global permission-bit sum). Both keyed
on labels of the case generator (every added stray was a 0644 file; crossgen always re-based onto
`RULES.md`; every case perturbed one member, so global aggregates caught it). Under this plan's kill
rule the counter is replaced again before any census is scored: **`probe/p44c-count.mjs`** (sha256
`d7b806eb06af78d4fbdd92c3cb3732e67fc06a69a3175f7b175bbfb57975f025`) is the C1 counter from this commit
on. Its own `casePasses` text is unchanged from v1 and v2, so **the predicate P44 is unchanged word for
word**; a MET rule `isMet` (every case passed, at least 20 cases) is the same condition, factored.

Case-generation changes (all from control-wave findings): added entries take (kind, mode) from a random
shape entry; crossgen re-bases onto a random base member (different extension, no prefix relation);
new `swap:<m>` (exchange (kind, mode) with a random differing base member — every aggregate over the
entry set unchanged), `sidecarkind`/`sidecarwide`, `genkind`/`genwide`; six sourced CLEAN cases
(`src:agent.db.corrupt` from oh-my-pi v18.12.6 `packages/utils/src/sqlite.ts:193` with
`sqlite-credential-store.ts:601`; `src:themes|tools|commands|prompts|memories` from
`packages/utils/src/dirs.ts:1007-1035`), which a census built from the snapshot alone fails; chain
refills produce valid UTC stamps, epoch milliseconds and v4 UUIDs; a seeded HMAC-SHA256 stream
(`--seed HEX` replays a run exactly; the header prints the seed; every CASE line prints what changed)
answers CritClaimSizing objection 2; `--selftest` (21 rows: P44 clause truth table, MET rule, replay)
answers objection 1. At the frozen shape the case set is **150**.

All 26 control programs that the control-wave seats left on disk, plus the absent file, were
re-scored under p44c by the L1 before any census was scored: all 27 read UNMET (highest 136/150,
CtlPartialNoKind and CtlPartialUnanchored); receipts `controls-v3/*.txt`. Resource probes of
SentinelProcLeak that spin, sleep or allocate were not re-scored (they cannot print a verdict within the
20 s limit; their p44b receipts stand). A fresh residual call of adversarial seats attacks p44c before
data; its receipts are committed before the measured run.

Superseding values (everything else above stands):

- Counter: `probe/p44c-count.mjs`; selftest receipt `open/p44c-selftest.txt` (`P44_SELFTEST: 21/21`, `VERDICT: PASS`).
- Before: `open/p44c-before-6cda8c35.txt` → `P44_COUNT: UNMET (passed=0 cases=150 floor=20 census_sha256=absent)` exit=1.
- After target (one value): `P44_COUNT: MET (passed=150 cases=150 floor=20 …)` exit 0 at the measured commit.
- Kill rule 1 reads `passed=150 cases=150`.
- Measurement command: as in § Measurement with `p44c-count.mjs`, plus `--seed` recorded from the receipt header for replay.

## Third pre-data redesign (2026-10-23 ~01:38Z by commit time; still no census scored)

Correction to the first redesign heading: it says "01:24Z"; the commit that carries it, `292d9266`,
is dated 01:16:44Z and its receipt ran 01:16:28Z (ReviewCounterVsPlan F4). The heading time is wrong;
the commit time stands.

The residual call (8 seats, dispatched ~01:30Z against `p44c` at `28e29bbe`; two seats, CritV3Channels
and CritV3LabelA, ended on a provider `cyber_policy` refusal and are holds) found programs that read
`P44_COUNT: MET (passed=150 cases=150)` under p44c while dropping per-member knowledge:
**CritV3LabelB** `histogram-bag.mjs` (sha256 `a8c35e88…`: a bag of per-entry (sorted name-character
histogram, kind, mode); `agents` → `stagen` passes) and **CritV3Boundary** (six of eight one-piece
removals read MET: no kind or permission rule for the six sourced members, `source-names-only`, no
ceiling on RULES.md, no chain end anchoring; base presence also survives, which the census contract
does not require). CritV3Expectations found one latent label conflict (a random stray could equal a
sourced name such as `tools`). Under the kill rule the counter is replaced a third time before any
census is scored: **`probe/p44d-count.mjs`** (sha256
`9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e`) is the C1 counter from this commit
on. **P44 is unchanged word for word** (`casePasses`, `isMet` byte-identical to p44c).

Case-generation changes: `wide:<m>` replaces `mode:<m>` and covers every base member (one missing
group/other read or write bit added); `anagram:<m>` (m renamed to a permutation of its own
characters, same kind and mode); `sidecarwide` and `genwide` cover every sidecar/family with `wide`;
`junkgen:<f>` (valid generation + 2-3 letters); `srckind:<id>` / `srcwide:<id>` for every sourced
member; no generated DRIFT entry may take a sourced name (`RESERVED`). At the frozen shape the case
set is **207**.

Pre-data control receipts under p44d (`controls-v4/*.txt`, L1 re-score, before any census): all 44
control programs read UNMET — the 26 control-wave programs and the absent file (as before), the
residual seats' 4 CritV3LabelB variants, 7 CritV3Boundary removals and 6 ReviewV3Receipts controls.
Highest: 206/207 (`no-rules-mode`, `no-sessions-kind`, `no-themes-name`: each fails exactly the one
case that exercises the dropped rule). Not scored, by classification made before scoring:
CritV3Boundary `full-unscored.mjs` and `no-base-presence.mjs` — both encode every per-member rule
the census contract names (absence is optional in the contract), so they are the claimed work, not
controls; and CritV3ClauseDrops' counter copies (counter mutants, not censuses).

Superseding values (everything else above stands):

- Counter: `probe/p44d-count.mjs`; selftest `open/p44d-selftest.txt` (`P44_SELFTEST: 21/21`, `VERDICT: PASS`).
- Before: `open/p44d-before-6cda8c35.txt` → `P44_COUNT: UNMET (passed=0 cases=207 floor=20 census_sha256=absent)` exit=1.
- After target (one value): `P44_COUNT: MET (passed=207 cases=207 floor=20 …)` exit 0 at the measured commit.
- Kill rule 1 reads `passed=207 cases=207`. No further counter replacement: from this commit on, any
  control that reads MET (wave 2 included) fails C1 under kill rule 2; it does not trigger a redesign.
