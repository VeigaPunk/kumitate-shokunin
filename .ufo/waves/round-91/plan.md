# Kumitate round 91 — plan (frozen before data)

Lane `kumitate-shokunin`, hyaku run 15, round 91 attempt 1, Linux host. Base
`0bff4babeec90dd57ea36efeaa94b66db9af381d` (lane branch tip at round open, `ahead=0 behind=0`, clean).
Round-start census `open/census-start.txt` (`kumitate ok`, exit 0, the same 7 `W04` duplicate-url
warnings as rounds 87–90). No earlier attempt of round 91 (`.ufo/watchdog.log` holds only the
attempt-1 launch line); nothing inherited.

**Fresh-start reads (Amendment 35, 2026-11-05).** The lane resumed from a quality pause. The last
three closures (rounds 88, 89, 90) are rejected-honest-stops; their non-author spot-checks were read
before this declaration: `corpus/lessons/round-88-verifier-spotcheck.md` (nine constructions at
20/20), `round-89-verifier-spotcheck.md` (three constructions at 30/30), `round-90-verifier-spotcheck.md`
(three constructions at 47/47; routed M3, M4, RD-1..RD-6, S260 quote hygiene, K89-V7, round-gate
receipt for round 90, a wording defect). Common root of r87–r90: the claimed behaviour was larger
than what the frozen scorer enumerated (worktree/HEAD/index binding, invisible prefixes,
scratch-path context), so a construction could skip part of it and still reach the terminal score.
This round claims a behaviour the scorer enumerates class by class, scores every arm in two fixture
contexts, and commits the failing-before controls, the forgery controls and a positive control
before any seat runs.

## Claims

### C1 — operability (lowest non-retired axis), capability acquisition `receipt-bind` v5 (contract `kumitate-receipt-bind-v5`): bounded external reads

One claim. Operability sits at integer 9, terminal under the frozen `f_O`; every coverage row is a
saturated sub-axis at 10, so a second operability claim would be the same claim and no other owned
axis has headroom. The stagnation nudge is active (saturation line 9, window N = 3; last verified
capability row `counter-receipt` v3 in round 86), so the round is a capability move on a runnable
instrument.

**Motivating evidence.** Round-90 sentinel (`.ufo/waves/round-90/w1/K90Sentinel.md`, rows A4/A5,
routed as RD-2): `cmd=node /dev/zero` gives no verdict (V8 OOM abort under a 2 GiB cap) and an
external FIFO instrument blocks `open()` (15 s timeout, no verdict). v4 lstat's an external
instrument only for the symlink test and then `readFileSync(abs)` — no type check, no size check.

**Claimed behaviour (the classes the probe enumerates; nothing else is claimed).** For an ABSOLUTE
instrument token that resolves outside the lane (the `fromDisk` branch):
1. a non-regular file — character device that never reaches EOF (`/dev/zero`), character device that
   reads empty (`/dev/null`), FIFO with no writer, directory — is `FAIL-CLOSED UNRESOLVED`, exit 2,
   within 20 s wall time under a 2 GiB address-space limit;
2. a regular file larger than 16777216 bytes is `FAIL-CLOSED UNRESOLVED` with the same bounds, even
   when the receipt carries its correct digest; a regular file of exactly 16777216 bytes and an empty
   regular file bind as before (CLEAN external=1 with the correct digest);
3. every v4 verdict on the 47 carried arms is unchanged, the mid-token invisible code point stays a
   value byte (M4), and every arm holds in both fixture contexts (M3).

**Not claimed (routed, out of class):** atomicity of the type/size check against a concurrent path
swap (sentinel RD-3/A7, RD-4/A8 — probabilistic races, no deterministic arm), in-lane blob size at the
judged revision, a char device reachable without a `/dev/` spelling, new invisible code-point classes,
RD-1 worktree-symlink laundering, RD-5 replace-ref redirects. A seat finding in these classes is a
routed defect, not a kill.

**Predicate (frozen; the same sentence in the probe header, the receipt label and this line).**
`node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/probe/probe91-c1.mjs
--lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work <SCRATCH> --alt /fast/scratch/hyaku
--rev <REV>` prints `C91_C1: HELD held=56/56` and exits 0 at REV, on two independent runs (verdict
line and exit identical; arm details embed per-run labels by design). The probe sha256 is
`3bd88e8efe4bb0851b5ef57c90e80792eada34cd0f2450922d75fbe9fc313f4c`.

**Kill rule (frozen).** C1 is UNMET (rejected-honest-stop) if (a) the integrated instrument at M does
not print `HELD held=56/56` on both runs, or (b) any committed pre-data control other than the
declared positive control, or (c) the worktree twin of the integrated instrument at M, or (d) any
tool — seat-built or committed — that reaches 56/56 while a committed reproduction shows it returning
a wrong verdict on an input **of a declared class above** (an external non-regular file of any of
the four kinds, an external regular file on either side of the cap, a carried v4 arm's input shape,
a mid-token invisible code point, either fixture context). Reproductions must use the probe's own
receipt shape (`rev=`/`tool_sha256=`/`cmd=` lines) and name the input; a tool that is right on every
declared class is performing the claimed behaviour and is not a kill.

**Pre-data controls (committed with this plan, scored by the frozen probe at base REV
`0bff4bab…`; `controls/table.txt`, receipts `controls/ctl-*.txt`, generator
`controls/run-controls91.mjs`).** Every control except refuse-all/absent is v4 at REV (or a committed
round-90 construction) with ONE edit at the external read line.

| control | verdict | failing arms |
|---|---|---|
| base-v4-at-rev (do-nothing) | UNMET 52/56 | ext-zero, ext-null, ext-fifo, ext-overcap |
| dev-prefix (refuse `/dev/*`) | UNMET 54/56 | ext-fifo, ext-overcap |
| refuse-external | UNMET 49/56 | selftest, detect-r86-at-rev, detect-r86-renamed, escape-relative, alias-ancestor-external-twin, ext-empty-twin, ext-atcap |
| type-only (no cap) | UNMET 55/56 | ext-overcap |
| cap-only (no type check) | UNMET 53/56 | ext-zero, ext-null, ext-fifo |
| cap-edge-minus1 | UNMET 55/56 | ext-atcap |
| refuse-empty | UNMET 55/56 | ext-empty-twin |
| bounded-nonblock (bounded read, no type check) | UNMET 54/56 | ext-null, ext-fifo |
| r90-global-strip + ref graft | UNMET 54/56 | selftest, midtoken-invisible (M4 kills it in both contexts) |
| r90-tmpdir-gated + ref graft | UNMET 47/56 | selftest + 8 prefix arms, each `A=PASS B=FAIL` (M3 kills it) |
| r90-roundpath-gated (re-keyed to `/kumitate-r91/`) + ref graft | UNMET 47/56 | selftest + 8 prefix arms, each `A=PASS B=FAIL` (M3) |
| refuse-all | UNMET 8/56 | 48 arms |
| absent | UNMET 0/56 | all |
| **ref-fd-fstat (POSITIVE control)** | **HELD 56/56** | — (`controls/ref-fd-fstat.mjs`, sha256 `bc3df527…94db`) |

The positive control shows the predicate is reachable by exactly the claimed edit (descriptor open
with `O_RDONLY|O_NOFOLLOW|O_NONBLOCK`, `fstat` the descriptor, refuse non-regular and size > cap, read
from the descriptor), so blanket refusal is not a gain (refuse-all 8/56, refuse-external 49/56).

**Integration target.** `scripts/receipt-bind.mjs` v5 = the positive control's edit + the same
descriptor discipline on the receipt open (`O_NONBLOCK`, RD-4 hardening — not claimed) + selftest
arms for each new class (suite > 76) + the v5 contract header. Measured at M with the close battery;
`SCORECARD` capability row only if the predicate holds and the kill rule does not fire.

## Frontier step (§2b)

- `corpus/SOURCES.md`: open fifo(7) and open(2) (Linux man-pages) and the Node.js `fs` docs this
  round; rows land only after opening, Gate quotes in `corpus/lessons/round-91.md`. C1's knowledge
  entry cites them (the sourced claim). Corrections: S260 quote hygiene, K89-V7 (S255 quote location).
- Mistake mined: round-90 M3 (the mandated scratch root carried the round token into every
  candidate-visible path) — fix shown able to fail: `controls/ctl-r90-roundpath-gated+ref.txt`.
- Census before → after: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`.
- Assimilation: none planned (one claim; package adoption not this round). considerthese: none mined
  unless a seat finds an unimplemented proposal on this surface.

## Wave

One v1 wave, 12 seats, under `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`
(band 8–16): executors ExecInst, ExecCarry; scribes ScribeSources, ScribeLesson; scout; connector;
sentinel; reviewers Reviewer (probe/graft review) and ReviewProc (pseudo-file hypothesis: a
`/proc`/`/sys` regular file reports `st_size` 0, so a size-from-fstat cap does not bound the read —
out-of-class unless it breaks a declared class; a reviewer seat because the validator refuses
`labrat`); critics CriticA (kill constructions) and CriticB (history harm); mutation-tester. Attack
seats 2 reviewers + 2 critics + mutation-tester = 5/12 (42 %). The L1 holds the planner seat (the
validator refuses `planner`).
