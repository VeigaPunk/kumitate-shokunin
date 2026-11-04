# kumitate round 86 — plan (frozen before the first wave marker)

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Base `232350995d3001e606609aaf22ba1b58168d3655`
(round-85 tip, pushed). Round-85 non-author spot-check adopted before this freeze
(`node scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-85-verifier-spotcheck.md` →
`SPOTCHECK_ADOPT: ADOPTED … wrote=both`, `README_MAP: CLEAN files=217 rows=217 covered=217`).

## Claims

**One claim.** The lane's live axes are operability (integer 9, terminal under `f_O`) and five saturated
coverage rows (10 each); a second operability claim would be one claim under `AXES.md`, and no coverage row
can move, so the round carries one claim and spends the rest of its seats on the routed defects and on
the pre-registered measurement amendment.

**C1 — operability (lowest non-retired axis), capability acquisition `counter-receipt` v3.**
The lane's cross-round counter transcript checker must bind BOTH halves of its answer to the bytes it
read: the receipt half already does (`RECEIPT: bytes=… rows=… held=… sha256=…`), the source half does
not (`SOURCE: sites=… declared=… receipt=…` is counts only). This is the round-85 pre-registration
candidate (7) and the three survivor arms (6) carried forward.

- **Frozen predicate.** At the measured commit M,
  `node .ufo/waves/round-86/probe/probe86-c1.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work "$HYAKU_SCRATCH/kumitate-r86/L1/probe"`
  prints `C86_C1: HELD held=24/24` and exits 0. The probe's 24-arm table is the only denominator.
- **Frozen kill rule.** Any arm red at M, OR any control in `controls/` reaching `24/24`, means
  **UNMET** (reported, never narrowed after data). A control that reads the bytes and re-derives the
  answer is an *equivalent*, not a cheat, and is declared as such; the kill clause binds controls that
  do not read the input.
- **Frozen target contract** (the probe asserts these lines exactly):
  - `COUNTER_RECEIPT: CLEAN | DRIFT <TOKEN> | FAIL-CLOSED <TOKEN> | USAGE`
  - `RECEIPT: bytes=<n> rows=<r> held=<h>/<d> findings=<TOKEN|none> sha256=<hex|->`
  - `SOURCE: sites=<n> declared=<n|absent> receipt=<r> sha256=<hex of the source file bytes|->` (only with `--src`)
  - exit map unchanged: 0 clean, 1 per-receipt/source drift, 2 fail-closed, 64 usage; first finding wins,
    a receipt finding outranks a source finding; the receipt/source grammars, the finding vocabulary and
    the v2 behaviour on every non-source arm stay exactly as shipped.
- **Why the probe can differ from a cheat.** Twelve arms generate their receipt at run time (random arm
  count, prefix, arm names, padding, metadata nonce, CRLF) and compute the expected derived lines from
  those bytes; four arms assert the source digest equals the sha256 of the source this probe just wrote;
  two arms (`src-digest-a`/`src-digest-b`) prove identical counts with different bytes yield different
  digests; two mutation arms prove one status byte flips the verdict and the receipt digest.
- **Before (frozen).** v2 bytes (`controls/base.txt`) read `C86_C1: UNMET held=14/24` exit 1 — the ten
  source arms fail because v2 prints no source digest.
- **Controls, frozen and scored before this commit** (each receipt carries `rev=`, `cmd=` and `exit=`):
  `controls/base.txt` 14/24 exit 1; `controls/stub.txt` (constant printer) 0/24 exit 1;
  `controls/noreader.txt` (label-keyed, never opens the file) 0/24 exit 1; `controls/replay.txt`
  (reads only the `rev=` nonce and replays a canned CLEAN answer) 0/24 exit 1.
- **Coherence disclosure.** The probe was validated in scratch against an L1 reference implementation
  (`/fast/scratch/hyaku/kumitate-r86/ref`, v2 + the digest line) reading `HELD held=24/24`; the reference
  is not the claim's evidence and is not committed.
- **Limits.** The claim is about the instrument's binding and its failure modes, not about the semantic
  correctness of any counter. A forged source whose digest matches its own bytes still passes; the digest
  binds bytes, not authorship; the source binding stays textual (comments/strings bind); the probe is
  deterministic in grammar coverage but random only in generation.

## Non-claim work landed this round (no axis credit claimed)

1. **Pre-registered `A` re-baseline** (round-85 §Pre-registration (1)), measured BEFORE round-86 data:
   `open/a-rebaseline.txt` records the v2 reading (A=980 walk / 972 declared), the amendment reading
   (`A=35` tracked non-`.ufo` runnable files, `A_wave=945`), and `f_O` under both denominators (9 in both).
   The stanza gains the non-scoring `A_wave` term and `proxy-check.mjs` a selftest arm in which a
   wave-shaped `.mjs` under `.ufo/` does not move `A`.
2. **Routed defects R85-V1…V14** from `corpus/lessons/round-85-verifier-spotcheck.md` §6 — each fixed,
   relabelled or disclosed in the round report/lesson; V12 (section-blind `readme-map`) is fixed in the gate
   with a section-membership arm.
3. **Corpus curation**: S245 superseded (title + tier), S246 re-opened and adopted or re-rejected with the
   new locator, one knowledge entry for the v3 binding, `round-86.md` lesson with `## Gate` (≥1 admit,
   ≥1 reject) and `## Mistakes`; census before/after.
4. **Assimilation: none** — the package at `/home/vgpnk/Projects/shokuknow/merge/kumitate` is present;
   no staged package row is adopted. The round reopens its own instrument sources instead.

## Round shape

ONE v1 wave of 12 seats (`ufo-wave-policy.json`, band 8–16): 4 executor, 1 scribe, 1 scout, 1 reviewer,
1 critic, 1 mutation-tester, 1 sentinel, 1 connector, 1 revenger. Attack seats at least 3/12 (≥25 %).
The L1 holds the canonical planner seat (the validator refuses `planner`). No residual call planned.

## Scratch

Every seat works under `$HYAKU_SCRATCH/kumitate-r86/<seat-name>/` with `HYAKU_SCRATCH` defaulting to
`/fast/scratch/hyaku`, and deletes its tree on exit. Nothing citable lives under `/tmp`.
