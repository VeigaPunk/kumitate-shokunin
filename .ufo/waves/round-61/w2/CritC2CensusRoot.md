# CritC2CensusRoot — round 61 w2, C2 subcase 4: lane-root census exit (falsify)

**Seat:** `CritC2CensusRoot` (w2-plan.json / w2-spec.json name for subcase 4).
**W1 artifact attacked:** `.ufo/waves/round-61/w1/CritControlC2.md` counterexample 6
(“Plan's counting command can never pass E5”), receipt
`controls/ctl-c2-critic-a6-default-census-root.txt`.
**Scratch:** `/tmp/kumitate-r61/CritC2CensusRoot/` (fleet root `fleet/` with
`shokunin.conf` copied verbatim from the real fleet; lane = clone of
`kumitate-shokunin` @ `be4a820`, clean, no `shokunin.conf` in the clone — mirroring
the real layout). No lane/fleet/gate files touched; no tools installed
(probe/census run from existing binaries ` node v24.21.0).
Probe sha256: `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965`.

## Frozen behavior under attack (w1 claim)

> Plan's counting command can never pass E5 — without `--census-root` the probe calls
> census with `--root <lane>`: `ERROR: config not found: …/kumitate-shokunin/shokunin.conf`
> / `unknown lane … kumitate` exit=2 → `E5 MISS exit=2`. plan.md E5 names
> `--root /home/vgpnk/Projects/shokunin` (that reads `ok` exit=0).

Probe line 24 (`doctrine61-probe.mjs`): `spawnSync('…/sources-census.sh',['validate','--root',censusRoot||lane,'kumitate'],…)` — the root **defaults to the lane path**, so the count command (`node .ufo/waves/round-61/probe/doctrine61-probe.mjs <lane> <rev>`; plan.md “Counting command”, no `--census-root`) feeds the lane as the fleet root.

## Reproduction (exact commands / output / exits)

### A. The census call E5 emits when `--census-root` is omitted
```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /tmp/kumitate-r61/CritC2CensusRoot/fleet/kumitate-shokunin kumitate
ERROR: config not found: /tmp/kumitate-r61/CritC2CensusRoot/fleet/kumitate-shokunin/shokunin.conf
ERROR: unknown lane (not a dir, not in conf or root): kumitate
exit=2
```
(Matches w1 receipt a6 exactly. `die()` at script lines 453–454/525 fires first; the
“unknown lane” line is emitted by the same run because `build_roster` is re-invoked per
arg and both errors print before `exit 2`.)

### B. Frozen count command (no `--census-root`) on the scratch lane
```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/probe/doctrine61-probe.mjs /tmp/kumitate-r61/CritC2CensusRoot/fleet/kumitate-shokunin be4a820
DOCTRINE61: DOCTRINE61_UNMET held=0/6 checks=6 rev=be4a820 rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=
 | E5 MISS exit=2
 | E6 MISS mapped=false readme-map=1 README_MAP: note unpinned:lessons/round-60-verifier-spotcheck.md
exit=1
```
Run is deterministic: E1–E4 MISS at `be4a820` (entry not yet landed), E5 MISS purely from the census exit=2.

### C. Same probe, `--census-root <scratch fleet>` (the documented-but-not-in-count flag)
```
$ node …doctrine61-probe.mjs …/fleet/kumitate-shokunin be4a820 --census-root …/fleet
DOCTRINE61: DOCTRINE61_UNMET held=1/6 checks=6 rev=be4a820 rule=D61
 | …
 | E5 PASS exit=0
 | E6 MISS mapped=false readme-map=1 README_MAP: note unpinned:lessons/round-60-verifier-spotcheck.md
exit=1
```

### D. plan.md E5 command verbatim on the scratch fleet root
```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /tmp/kumitate-r61/CritC2CensusRoot/fleet kumitate
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/… across scopes
… (W04 x6; warnings only) …
kumitate	ok	/tmp/kumitate-r61/CritC2CensusRoot/fleet/kumitate-shokunin/corpus/SOURCES.md
exit=0
```
So E5's *intended* invocation (fleet root) exits 0; the probe never makes it.

### E. Can E5 exit 0 in the default (lane-root) position at all?
- **Empty/default:** lane root has no `shokunin.conf` → always “config not found” (A, B). The lane clone and the real lane (`ls …/kumitate-shokunin/shokunin.conf` → “No such file or directory”) both lack it, and the real conf has no self-referencing row (only `kumitate|kumitate-shokunin|…` at fleet root).
- **Contrived pass (M4):** adding a `shokunin.conf` + inner `kumitate-shokunin/corpus/SOURCES.md` under the lane root makes the same census command exit 0 — but it validates the *inner* registry (`…/kumitate-shokunin/kumitate-shokunin/corpus/SOURCES.md`), not the lane's `corpus/SOURCES.md` (proven: `git ls-tree be4a820` shows the real registry blob `825d3ce4…`; the validated path did not exist at the rev).
- **Fleet-root-as-lane (E):** `probe <fleet-root> <rev>` → `E5 PASS exit=0` but `E1 MISS absent` (fleet root is a git repo (`git -C /home/vgpnk/Projects/shokunin rev-parse --show-toplevel` → `/home/vgpnk/Projects/shokunin`), yet `git ls-tree … <fleet> be4a820` fails `fatal: not a git repository` — the rev does not exist there; E6 also fails `readme-map=1`).

**Verdict on the w1 phrasing:** “can never pass E5” is strictly over-broad (E/M4 show exit-0 positions exist), but the *operational* claim is confirmed: **on the real deployed layout, the frozen count command cannot produce `E5 PASS`** — the only exit-0 positions require either an undocumented `--census-root` flag that the count command does not pass, or a lane layout whose census validates a registry other than the measured lane registry.

## Independent effect on D61 verification

Yes — **E5's lane-root default independently prevents D61 from verifying on the real layout.** The kill rule (“any check MISS → fails as declared”, plan.md) plus E5 MISS exit=2 in every count-command run means `DOCTRINE61_HELD` is unreachable via the declared counting command. Also an internal inconsistency is frozen into v1: plan.md E5 names `--root /home/vgpnk/Projects/shokunin` (fleet, exits 0) while the probe's code path used by the count command never passes it — the spec and the probe cannot both be honored by one command line.

## Axis impact

- **coverage / verifiability (C2):** the v1 gate as *invoked* cannot certify any revision; E5 either fails (real layout) or attests an unrelated registry (contrived layouts). This compounds w1 cex 6's finding: unchanged `DOCTRINE61_HELD` under v1 remains false provenance — here from the *probe's* root default, not just from a missing flag in the doc.
- **operability:** the flag required for E5 to work (`--census-root`) is documented in the probe's usage string but absent from the plan's count command — the plan's stated command is not runnable to HELD.

## Smallest safe correction (v2 candidate)

1. Make the probe's default census root the fleet root (e.g. derive from the script location or require `--census-root` whenever `lane` is a repo path): `sources-census.sh validate --root <fleet> kumitate`, so the count command's E5 behaves exactly as plan.md E5 states.
2. Resolve the lane argument strictly as a git repo (E1–E4/E6) and the census root strictly as the fleet (E5) — never one argument serving both namespaces.
3. Run E5's census against the *rev-* `corpus/SOURCES.md` (extract via `git archive/` or `git show` into a temp fleet), not the live worktree — corroborated here: the census reads whatever file sits at `$ROOT/kumitate-shokunin/corpus/SOURCES.md` at run time (N2a/N2b: identical command, different on-disk bytes → different finding sets; rev blob `825d3ce4…` vs scratch-file `5c2e4ebe…`), so E5 as frozen cannot attest the measured revision regardless of root fix.

## Evidence pointers

- This report + `repro-abcd.txt` in scratch (runs A–N2b, M4 with verbatim commands/exits).
- `controls/ctl-c2-critic-a6-default-census-root.txt` (w1 receipt, matching output).
- Probe source lines 7, 24 (`doctrine61-probe.mjs`); census source lines 453–454, 495–529 (`sources-census.sh`); plan.md E5 line ~134 and “Counting command” line ~136.
