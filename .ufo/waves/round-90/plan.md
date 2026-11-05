# Kumitate round 90 — plan (frozen before data)

Lane `kumitate-shokunin`, hyaku run 15, round 90 attempt 1, Linux host.
Base `7218699cfbdec702ba42f35ceac0a8e52d1bd564` (lane branch tip at round open, `ahead=0 behind=0`).
Round-start census `open/census-start.txt` (`kumitate ok`, exit 0, the same 7 pinned `W04`
duplicate-url warnings as rounds 87–89).

**Fresh-start reads (operator authorization 2026-11-05, Amendment 27).** This lane resumed from a
run-15 pause; the last three closures of this capability are rejected-honest-stops, and their
non-author spot-checks were read in full before this declaration:
`corpus/lessons/round-87-verifier-spotcheck.md` (kill rule fired: `cand-a-worktree` 12/12),
`corpus/lessons/round-88-verifier-spotcheck.md` (nine constructions at 20/20; UNMET upheld),
`corpus/lessons/round-89-verifier-spotcheck.md` (three constructions at 30/30; UNMET upheld;
routed defects K89-V1..V8). The do-nothing control below is committed with this plan, before any
wave data, and every declared number is measured against it.

## Claims

### C1 — operability (lowest non-retired axis), capability acquisition `receipt-bind` (v4) with the Q82-blind scorer as the claimed work

One claim. Operability sits at its terminal integer 9 under the frozen `f_O` proxy and every
coverage row is a saturated sub-axis at 10, so a second claim would be the same claim under
`AXES.md` (two claims on one axis count as one, and no other axis has headroom). The stagnation
nudge is **active**: the saturation line is 9 on every live axis and the last verified capability
row is `counter-receipt` v3 (round 86), so rounds 87–89 added no row and the window N = 3 is
closed. The round is therefore a capability move, claimed on operability because the object it
moves is a runnable instrument plus its counter.

**Motivating evidence.** Rounds 87, 88 and 89 each lost this capability to the same frozen kill
rule: a seat-constructed control reached the terminal score while skipping a claimed behaviour
(round-87 `cand-a-worktree` 12/12; round-88 nine constructions at 20/20; round-89
`cand-probe-keyed` 30/30, `cand-skip-mode` 30/30, `labrat-label-only` 30/30). Round 89 root-caused
the class, not the instrument: the scorer handed the candidate its fixture's identity — the arm
name lived in every fixture directory path — and wrote the rule into `corpus/QUALITY.md` Q82
("a capability scorer may not hand the candidate its own fixture's identity"). The round-89
pre-registration binds this round: "Round-90 must not re-claim `receipt-bind` without a scorer
that satisfies Q82."

**Predicate (frozen; the same sentence in the probe's header, the receipt label and this line).**
`node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-90/probe/probe90-c1.mjs
--lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work <SCRATCH> --rev <REV>` prints
`C90_C1: HELD held=47/47` and exits 0 at REV, with the verdict line and exit agreeing across two
independent runs over independent run-time fixtures (the runner prints
`RUN_CLOSE: PROBE_DETERMINISM SAME`; printed arm details embed per-run random fixture labels, so
line-for-line stdout identity is NOT the determinism claim — the verdict line and exit are).

**Kill rule (frozen).** Any control — a committed pre-data control below, the worktree twin of the
integrated instrument at M, or any seat-constructed tool that skips a claimed behaviour — that
reaches 47/47 makes C1 UNMET (rejected-honest-stop). A seat-constructed control is a tool that
skips a claimed behaviour (revision binding against HEAD / the index / the worktree, a receipt's
own `rev=` precedence, the size limit or its order, `ESCAPES_LANE` by resolution,
`AMBIGUOUS_FIELD` including invisible-prefix duplicates, realpath lane membership through
`/proc/self/root` or a symlinked ancestor, BOM/invisible-prefix tolerance, or the mode-120000
instrument refusal) by construction.

**Q82 field, satisfied by construction (the scorer's own discipline, frozen in its header).**
Every fixture directory is named `d-<4 random hex>` per run and every receipt file an arm-free
counter (`r.txt`, `r2.txt`, …); no arm name, scenario word or round constant appears in any path
the candidate sees; the fixture root itself is `r-<4 random hex>` under `--work`. Every
shape-gated arm carries a positive twin that the same shape test gets wrong:
`alias-proc-root` ↔ `alias-proc-root-clean` (same `/proc/self/root` alias shape, opposite
digests), `alias-ancestor` ↔ `alias-ancestor-worktree` ↔ `alias-ancestor-external-twin` (same
absolute-through-directory shape, three containment truths), `dotdot-inside` ↔
`dotdot-inside-worktree` and `escape-inner-dotdot` (same interior-`..` shape, escape / clean /
drift), `symlink-instrument` ↔ `symlink-instrument-twin` (same receipt shape, symlink vs regular
instrument), `symlink-instrument-space-target` (the D1 twin that breaks a "blob looks like a path"
heuristic), `dup-feff`…`dup-nbsp` ↔ `single-zwsp`/`single-nbsp`/`bom-rev` (prefixed duplicate
refused, prefixed single parsed).

**The 47 arms** (byte-frozen in `probe/probe90-c1.mjs`; names below are the probe's OUTPUT labels,
which the candidate never sees during scoring):

| class | arms | asserts / kills |
|---|---|---|
| behavioural mode arms (K89-V4) | `usage`, `selftest` | bare invocation exits 64, prints USAGE and no verdict line; `--selftest` prints `PASS held=N/N` with equal N ≥ 68 (the v3 suite floor: no arm shrinkage) and no per-arm FAIL |
| lane-history arms at the rev (K89-V4) | `detect-r86-at-rev`, `detect-r86-renamed`, `clean-r87-at-rev` | the round-86/round-87 receipt bytes are read from `git cat-file blob <rev>:…`, never the worktree; renamed copies score identically (no name key survives) |
| v2/v3 carried arms | `unchecked`, `unresolved`, `dir-missing`, `rev-bad`, `symlink-receipt`, `rev-receipt-wins`, `worktree-forgery`, `default-rev`, `rev-receipt-negative`, `untracked-instrument`, `escape-relative`, `symlink-dir`, `oversize`, `duplicate-field`, `sweep`, `default-rev-not-head`, `index-not-judged`, `abs-in-lane-at-rev`, `limit-edge`, `limit-before-read`, `escape-inner-dotdot`, `dup-equal-field`, `alias-proc-root`, `bom-rev`, `symlink-instrument` | the round-89 semantics unchanged: revision-not-HEAD/index/worktree, `rev=` precedence, limits and their order, escapes by resolution, duplicate fields, realpath membership, BOM parse twin, mode-120000 refusal |
| Q82 twins (this round) | `alias-proc-root-clean`, `symlink-instrument-twin`, `alias-ancestor-external-twin` | the same surface shapes as their negatives with the correct at-rev digests read CLEAN (external=0 / external=1 as containment truth dictates): a shape key or blanket refusal fails at least one of each pair |
| K89-V2 arm gaps (this round) | `symlink-instrument-space-target`, `abs-symlink-instrument`, `dotdot-inside`, `dotdot-inside-worktree`, `alias-ancestor`, `alias-ancestor-worktree` | a mode-120000 link whose target text contains a space is still `SYMLINK_INSTRUMENT`; an absolute in-lane token naming the link too; interior `..` that stays inside binds (its worktree-digest twin drifts); an alias through a symlinked ancestor is a realpath in-lane member (clean at the rev; drift with external=0 on the worktree digest) |
| K89-V1 invisible-prefix classes (this round) | `dup-feff`, `dup-zwsp`, `dup-zwnj`, `dup-zwj`, `dup-lrm`, `dup-nbsp`, `single-zwsp`, `single-nbsp` | a duplicate `cmd=` line prefixed with U+FEFF/U+200B/U+200C/U+200D/U+200E/U+00A0 is still `AMBIGUOUS_FIELD`; a receipt whose field lines are ALL prefixed with U+200B or U+00A0 still parses (the twins that kill a strip-only-FEFF or a reject-all-non-ASCII construction) |

**Pre-data controls** (scored with the frozen probe, receipts `controls/ctl-*.txt`, table
`controls/table.txt`, driver `controls/run-controls90.mjs`; base `7218699…`):

| control | held | failing arms (abridged) |
|---|---|---|
| `base-v3-at-rev` (do-nothing: the committed v3 at the base rev) | **39/47** | exactly `dup-feff`…`dup-nbsp`, `single-zwsp`, `single-nbsp` (the K89-V1 classes) |
| `r89-probe-keyed` (round-89 kill: read the `--dir` arm name) | 2/47 | the blind labels carry no arm name |
| `r89-skip-mode` (round-89 kill: blob-shape + `/proc/self/root` strip) | 35/47 | `symlink-instrument-space-target`, `alias-ancestor`, `alias-ancestor-worktree`, the 8 prefix arms, `selftest`, `alias-proc-root`, `alias-proc-root-clean` |
| `r89-label-only` / `r89-probe-aware` | 2/47 | label-only oracles cannot map opaque labels |
| eight round-88 constructions (worktree-twin, head-default, loose-limit, dup-equal-ok, fixture-gated, size-after-read, abs-disk, nogit-overfit) | 15–29/47 | their own skip classes plus the new twins and prefix arms |
| `r90-size-oracle` (new: a content-blind size-signature oracle, written from the contract text only) | 18/47 | content-dependent arms (tallies, escapes, symlink modes) |
| `refuse-all` | 2/47 | blanket refusal is not a pass |
| `absent` | — | a missing tool scores nothing |
| `worktree-twin-at-rev` (make-worktree-variant on the v3 blob) | 18/47 | revision binding |

Every construction that fired a previous round's kill rule is below the terminal 47 before any
wave data exists, so the kill rule cannot fire on a construction this lane already knows.

**Instrument changes the claim lands** (`scripts/receipt-bind.mjs`, v3 → v4, contract
`kumitate-receipt-bind-v4`): field lines are recognized after stripping a bounded set of leading
invisible prefixes — U+FEFF, U+200B, U+200C, U+200D, U+200E, U+00A0 — so a prefixed duplicate
`cmd=`/`tool_sha256=`/`rev=` line is `AMBIGUOUS_FIELD` (K89-V1) while an all-prefixed receipt
still parses; the same normalization subsumes the v3 file-leading-BOM strip; the selftest grows
68 → 76 arms (six prefixed-duplicate arms, one per prefix class, plus the two all-prefixed parse
twins); the header documents the v4 boundary and the CONTRACT constant moves to v4.

**Harm rules (declared before data).** H1 `node scripts/proxy-check.mjs --strict` must read MATCH
at M (the stanza re-pinned in the integration commit — `pin.receipt-bind` moves to the v4 digest).
H2 `node scripts/surface-probe.mjs --checklists` must not lose an item that passes at the base,
and its close receipt must carry the per-item lines (K89-V5). H3 `node scripts/sources-check.mjs`,
`source-capture.mjs`, `source-dupes.mjs` and `counter-pins.mjs` exit 0 at M. H4 the census exits 0
at round end. H5 the instrument's selftest passes at M with every pre-existing arm retained
(≥ 68 arms, 76 expected).

**Routed defects this round lands as round work (not claims; K89-V5..V8):** V5 — the close
checklists receipt carries per-item lines and the report's named red set reconciles with its
tally; V6 — a named append-only correction in the knowledge entry's recheck (the committed bytes
print 68/68, not the quoted 64/64); V7 — the S255 quote-location drift is corrected by a
superseding row or a section-only anchor in the round lesson's Gate; V8 — every gate receipt the
report cites is quoted with its verdict, including any red one.

## Limits, recorded not hidden

(a) The probe is an output-text oracle: it reads the instrument's verdict lines, so an
implementation that prints a verdict it did not compute is out of its reach; the instrument's
bytes are the judged object and the wave's mutation seats attack them. Q82 narrows this class (the
candidate no longer learns which fixture it is judging), it does not eliminate it.
(b) Determinism is claimed for the verdict line and exit only (the runner's comparison);
line-for-line stdout differs across runs because fixture labels are per-run random by design.
(c) The selftest floor 68 pins no-shrinkage of the suite; a suite that grows is not probed.
(d) The alias arms depend on `/proc` being mounted (`/proc/self/root`); on a host without it the
probe fails closed rather than scoring a blind 47.
(e) The symlinked-ancestor arms need symlink creation rights under `--work`; on a filesystem
without symlink support the probe fails closed.
(f) `limit-before-read` proves size-before-read order, not that no read is attempted for a
readable oversize file (unchanged from round 89).

## Round shape

ONE v1 wave of 12 seats under `ufo-wave-policy.json` (band 8–16), attack share 4/12 = 33 % under
the dispatcher's own attack set (`ready-handoff.mjs` ATTACK = reviewer, critic, mutation-tester:
one reviewer, two critic seats, one mutation-tester), one connector seat, one sentinel, one scout,
one scribe, four executors. `labrat` is a probe seat the validator refuses as a swarm role, so the
keyed-oracle-possible item rides the reviewer seat. The L1 holds the canonical §3 planner seat
(the validator rejects `planner`); a bounded planning data-walk rides the scout item. Every seat
works in `/fast/scratch/hyaku/kumitate-r90/<seat-name>/` and removes it before yielding.

## Frontier step

`corpus/SOURCES.md` curation: the round opens the sources grounding the v4 boundary and the
scorer-blindness design — the Unicode prefix classes (general categories/ZWSP–LRM semantics) and
the test-oracle problem (a scorer that leaks fixture identity can be keyed) — one row per opened
source with its located quote and capture; at least one claim evidence cites a new `S###`. One
mined mistake: rounds 87–89 froze scorers whose arm names lived in the fixture paths despite the
nonce discipline (`## Mistakes` in `corpus/lessons/round-90.md`, captured-by Q82's author round).
The sourced claim: C1's knowledge section cites the new `S###` rows.
