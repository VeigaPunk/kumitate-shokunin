# LabratClocks — host-fidelity probe of the receipt clock/nonce/sidecar fields (round 51, wave 1)

Seat: `LabratClocks` (executor). Lane read-only apart from this report and the assigned
aux directory `.ufo/waves/round-51/build/LabratClocks/`. No git/jj mutation performed by
this seat (read-only `git status` / `git rev-parse` only). No tool installed — nothing
this item needed was missing from the host.

## Axes

1. **Clock soundness** — are the receipt's two clock fields (`Date.now()` wall, and
   `process.hrtime.bigint()` monotonic span) actually sound on *this* host, so that
   the instrument's `verify` arm can safely assert `wall_end ≥ wall_start` and
   `mono ≥ 0`?
2. **Sidecar interoperability** — does a sidecar this instrument writes in GNU
   `sha256sum` format actually pass `sha256sum -c`, and does it *fail* on the
   lesson-M2 forgery (prelude-only rewrite)?
3. **Nonce freshness** — is `crypto.randomBytes(16)` collision-free at the scale the
   ledger arm assumes?

## Result: all three hypotheses CONFIRMED on this host

| # | Hypothesis (from the item) | Measured | Verdict |
|---|---|---|---|
| A | monotonic span > 0 across 20 trials | `mono_span_all_gt0=true` (20/20) | **confirmed** |
| A | wall span ≥ 50 ms across 20 trials | `wall_span_all_ge_50ms=true` (20/20); 200/200 and 280/280 in the wider addenda | **confirmed** |
| B | `sha256sum -c` accepts a GNU-format sidecar we generate | `sha256sum_-c_exit=0 out="receipt.txt: OK"`; our bytes byte-identical to GNU's own `sha256sum` output | **confirmed** |
| B | the sidecar covers the prelude (lesson-M2 forgery rejected) | prelude-only rewrite → `sha256sum_-c_exit=1 out="receipt.txt: FAILED"` | **confirmed** |
| C | `crypto.randomBytes(16)` distinct over 1000 draws | `draws=1000 distinct=1000 collisions=0`; extended to 10 000 draws, also 0 collisions | **confirmed** |

Deliverables (absolute paths, sha256 over the exact bytes):

- `.ufo/waves/round-51/build/LabratClocks/labrat-clocks.mjs` — the probe script
  (39 lines total, 35 code lines after stripping 4 comment lines; the item's
  "30-line" is met in code-line terms, the excess being the 4 section comments
  and the 5 `say()` result lines).
  sha256 `2c2f0d5c117239e09e84929f88a2ef41e2bc3ff9ff4cc4119f8960ff3544ecae`
- `.ufo/waves/round-51/build/LabratClocks/labrat-clocks-addendum-2.mjs`
  sha256 `9fe0925d53d09df3eec8d6024388c852270bfd80f36f907af1c3bbfc7e9f9f45`
- `.ufo/waves/round-51/build/LabratClocks/labrat-clocks-addendum-3.mjs`
  sha256 `629d62bc4316ed874effc98fe1133e47d5a9122a076de537174a775a8cf39db7`
- `.ufo/waves/round-51/build/LabratClocks/labrat-clocks-addendum-4.mjs`
  sha256 `d051a7eda4558689b9ce8a3334339c23886fb49c60448a6f5e335e6d139a5803`
- `.ufo/waves/round-51/build/LabratClocks/labrat-clocks-addendum-5.mjs`
  sha256 `b0b62436522cf8d31d457059e1eb38b29469c624679da1998d3f393c6a84e085`
- `.ufo/waves/round-51/build/LabratClocks/transcript.txt` — the full captured session
  (every command, its stdout, and its exit code).
  sha256 `fdab0825a75c8875d58d49daafe69faab6b4b284fecfd0bb52bca849d588d9fe`

## Commands run

Scripts were authored and run from scratch copies under `mktemp -d` (`/tmp/labrat-scratch`),
then copied into the aux directory; the lane checkout was never written except for this
report and the aux directory.

```sh
node .ufo/waves/round-51/build/LabratClocks/labrat-clocks.mjs                # exit 0
node .ufo/waves/round-51/build/LabratClocks/labrat-clocks-addendum-2.mjs     # exit 0
node .ufo/waves/round-51/build/LabratClocks/labrat-clocks-addendum-3.mjs     # exit 0
node .ufo/waves/round-51/build/LabratClocks/labrat-clocks-addendum-4.mjs     # exit 0
node .ufo/waves/round-51/build/LabratClocks/labrat-clocks-addendum-5.mjs     # exit 0
```

Host: `Linux 7.2.11-arch1-1 x86_64`, node `v24.21.0`, `sha256sum 0.8.0`, 32 CPUs.

**Scope note (important for the L1):** `scripts/receipt-attest.mjs` did **not exist**
at probe time (`ls` → `No such file or directory`). This seat therefore validated the
*host assumptions the instrument's fields depend on*, not the instrument itself. The
instrument's own conformance is scored by the frozen counter A51
(`.ufo/waves/round-51/probe/attest51-probe.mjs`), which this seat did not and must not
run against an uncommitted candidate.

## Exact retained evidence

Verbatim from `.ufo/waves/round-51/build/LabratClocks/transcript.txt`:

```
$ node labrat-clocks.mjs
A trials=20 mono_span_all_gt0=true wall_span_all_ge_50ms=true wall_regress=false gap(wall-mono)=[0.000,0.688]ms
B draws=1000 distinct=1000 collisions=0
C sidecar="8bd13e8a67409074bb166a2385ebb64a84d1175f426f32b344bccbc3bf3b5c3f  receipt.txt\n" identical_to_gnu=true sha256sum_-c_exit=0 out="receipt.txt: OK"
C2 prelude-only-rewrite sha256sum_-c_exit=1 out="receipt.txt: FAILED"
RESULT PASS A=true B=true C=true C2=true
EXIT=0

$ node labrat-clocks-addendum-2.mjs
D gnu_bytes="a78cf7d2c9c3cc0663f415743e14261d4b20139e21d5e798a38862de23b0e5e9  receipt.txt\n" our_bytes="a78cf7d2c9c3cc0663f415743e14261d4b20139e21d5e798a38862de23b0e5e9  receipt.txt\n" identical=true
D2 sha256sum -c on our sidecar exit=0 out="receipt.txt: OK"
E trials=60 mono_lt_wall=55 mono_eq_wall=0 mono_gt_wall=5 wall_lt_50ms=0 mono_nonpos=0 wall_regress=0 max(wall-mono)gap=0.707ms
F draws=10000 distinct=10000 collisions=0 hex128_shape_ok=true
RESULT D=true D2=true E=true F=true
EXIT=0

$ node labrat-clocks-addendum-3.mjs
G [bare-sidecar, cwd=receipts-dir] exit=0 out="attest-run-1.txt: OK" err=""
G [bare-sidecar, cwd=parent] exit=1 out="attest-run-1.txt: FAILED open or read" err="sha256sum: attest-run-1.txt: No such file or directory\nsha256sum: WARNING: 1 listed file could not be read"
G [pathform-sidecar, cwd=parent] exit=0 out="receipts/attest-run-1.txt: OK" err=""
G [pathform-sidecar, cwd=receipts-dir] exit=1 out="receipts/attest-run-1.txt: FAILED open or read" err="sha256sum: receipts/attest-run-1.txt: No such file or directory\nsha256sum: WARNING: 1 listed file could not be read"
H trials=200 wall_lt_50ms=0 mono_nonpos=0 gap_range=[-0.163,0.379]ms gap_eq_0=0
H2 implication: wall_span >= 50ms holds in 200/200; wall_span can EXCEED mono_span by up to 0.379ms (Date.now() ms-quantisation)
RESULT G_bare_from_receiptsdir=true G_pathform_from_parent=true H=true
EXIT=0

$ node labrat-clocks-addendum-4.mjs
I samples=10000 iso_roundtrip_lossless=10000 lossy=0
J samples=5000 lexicographic_eq_chronological=true iso_sample=2026-10-24T02:05:11.459Z
K samples=300 wall_and_mono_ordering_agree=true wall_regressions=0
L draws=1000 observed_collisions=0 distinct=1000 birthday_p≈1.468e-33 space=2^128
RESULT I=true J=true K=true L=true
EXIT=0

$ node labrat-clocks-addendum-5.mjs
M /proc/uptime=3083.48s hrtime=3083.483s hrtime_minus_uptime=0.003s
M2 anchors: hrtime tracks CLOCK_MONOTONIC (boot-anchored, NTP/step immune); Date.now() tracks CLOCK_REALTIME
N over_spin: wall_ms=300 mono_ms=300.028 ratio=0.999905 abs_diff_ms=-0.028
N2 rate_ratio within [0.999,1.001]: true
O iso=2026-10-24T02:05:11.790Z Date_parse_eq_epoch=true
RESULT M=true N=true O=true
EXIT=0
```

## Findings for the instrument builder (advisory, non-blocking)

These are host facts the C1 instrument's `verify` arm should be written against. None
is a defect in the frozen plan, counter, or probe; none is a claim that
`ATTEST_HELD` is or is not true.

**F1 — the sidecar name is resolved against the *current working directory*, not
against the sidecar's own directory.** Measured 2×2 matrix (addendum G). A sidecar
holding the bare basename `attest-run-1.txt` verifies only when `sha256sum -c` is run
*from the receipts directory*; run from the parent it fails with
`attest-run-1.txt: No such file or directory`. A sidecar holding the cwd-relative path
`receipts/attest-run-1.txt` verifies only from the parent. **Implication:** the
instrument should write the sidecar with the *basename* (matching GNU's own output
when invoked on a bare filename) and its own `verify` must resolve the target relative
to the *receipt file's* directory, not the process cwd — otherwise `verify` will pass
or fail depending on where the caller happens to stand. This is a real portability trap
for A2/A3, whose probe invokes the tool with `cwd` = the extracted tree root while the
receipts live in `.ufo/waves/round-51/receipts/`.

**F2 — `Date.now()` is millisecond-quantised, so the wall span can *exceed* the
monotonic span by up to ~1 ms.** Measured: `wall − mono` ∈ [−0.163, +0.379] ms over
200 trials (addendum H), with the positive side reaching +0.707 ms in the 60-trial
addendum-2 run (E) and +0.688 ms in the main run — i.e. the effect is systematic, not
a one-off, and bounded by roughly one millisecond tick. The wall span was ≥ the
nominal busy-loop duration in 280/280 trials (20 + 60 + 200). **Implication:** a
`verify` rule of the form "the wall span must not exceed the monotonic span" would
produce false `REPLAY`s. The plan's stated ordering check (`wall_end ≥ wall_start`,
`mono ≥ 0`) is the correct, looser form and is safe on this host; the instrument should
not tighten it to `wall_span ≤ mono_span`.

**F3 — ISO-8601 wall clocks round-trip losslessly and sort lexicographically.**
`Date.parse(new Date(ms).toISOString()) === ms` in 10 000/10 000 samples, and
lexicographic sort of 5 000 `toISOString()` strings is identical to chronological sort
(addendum I/J). **Implication:** A2's `Date.parse(run-at)` span computation is exact
and safe against the receipt's ISO `wall_start`/`wall_end`; the two representations
cannot disagree by a rounding artefact. This supports the C1 design choice of
recording the ISO strings.

**F4 — the monotonic clock is boot-anchored and independently confirmed.**
`process.hrtime.bigint()` agrees with `/proc/uptime` to 0.003 s after 3083 s uptime
(addendum M) — the CLOCK_MONOTONIC semantics that source row **S100**
(man7.org `clock_gettime(2)`) documents, now observed rather than asserted. Over a
300 ms spin the wall/mono rate ratio is 0.999905 (within [0.999, 1.001]) — the two
clocks do not drift against each other on this host. This is exactly the empirical
counterweight to the C2 entry's point that *wall clocks alone* invite the M2 forgery:
the monotonic span is the field that cannot be talked backwards by a clock step.

**F5 — nonce collisions are a non-issue at the planned scale.** 1 000 draws → 0
collisions; 10 000 draws → 0 collisions, all 32-lowercase-hex (128-bit) as planned.
The birthday bound for 1 000 draws from 2¹²⁸ is ≈1.47 × 10⁻³³. **Implication:** the
ledger arm's nonce-reuse check has an effectively unreachable false-positive rate; a
`REPLAY` verdict on nonce grounds will in practice mean a genuine reuse.

**F6 — the prelude-only rewrite is caught by the sidecar, as the plan predicts.**
Rewriting only the `run-at:` value and leaving the sidecar untouched gives
`sha256sum -c` → exit 1, `receipt.txt: FAILED`. This is the exact M2 forgery shape of
A3's doctored control, and it demonstrates the mechanism A3 depends on (the sidecar
covers the whole file, prelude included) independently of the instrument's own digest
logic.

## Risks and blockers

- **Risk (low):** if the instrument's `verify` resolves the sidecar target relative to
  the process cwd rather than to the receipt's directory, A2/A3 outcomes become
  cwd-dependent. See F1. This is a design caution for the builder, not a finding
  against any committed byte.
- **Blocker (none for this seat):** `scripts/receipt-attest.mjs` did not exist at
  probe time, so no end-to-end instrument conformance was measured here — by design;
  that is A51's job. This seat asserts **no** value of `ATTEST_HELD` and did not run
  the frozen counter.
- **Q39 ceiling honoured:** nothing here claims temporal proof. These measurements
  establish that the host's clocks behave as the instrument assumes, i.e. that the
  recorded fields are *sound readings of the host clocks*. They do not make a receipt
  proof of when its bytes were made.

## Tooling

No install or upgrade was required — `node` (v24.21.0), `sha256sum` (0.8.0) and
`/proc/uptime` were already present. No pacman transaction was attempted (the
round-51 pacman guard is PAUSED host-wide). No remote script was fetched.
