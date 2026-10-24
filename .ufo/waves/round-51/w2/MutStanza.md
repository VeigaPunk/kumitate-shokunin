# MutStanza — mutation of the `kumitate-proxy-v1` stanza terms (round 51, wave 2)

**Seat**: `kumitate-r51.ResonantOpossum` (mutation-tester) · **Lane**: `kumitate-shokunin`
(jj-colocated; read-only except this report) · **Date**: 2026-10-23/24

**Attack surface (what this seat attacks)**: the *machine-checkability* of the
`kumitate-proxy-v1` stanza — the claim that the 23 declared terms and the
`kumitate-gate-pins-v1` block are **re-derived from the tree and compared**, not
merely *present*. The round's harm rule H3 (`proxy-check.mjs --strict` →
`PROXY: MATCH`) is only meaningful if the detector **fails closed** on a doctored
stanza. This seat therefore asks the falsification question directly:

> Is the `PROXY: MATCH` at `7d88faa` **vacuous** (a stanza that says the right
> thing, or a detector that never compares), or is it **earned** (every term is
> independently re-derived, and perturbing any declared value yields the exact
> DRIFT kind)?

**Verdict**: the MATCH is **earned, not vacuous**. 12 of 12 stanza/pin mutants
were killed with the **exact** expected DRIFT kind and **never** MATCHed. The
probe additionally surfaced **one live harm-gate incident** (H3 is currently
RED in the working tree) and **one structural coverage gap** (the `## Axes`
*evidence-cell prose* is unchecked). Details and evidence below.

---

## 1. Method — the bounded behavioural detector

One detector, applied identically to pristine, mutated and restored bytes:

```
node scripts/proxy-check.mjs --self <tree> --scorecard <mutant>/SCORECARD.md --strict
```

* **Tree**: a pristine `git archive HEAD` extraction at
  `/tmp/mutstanza-r51/tree-head` (committed bytes, never the working tree — the
  working tree is being written to concurrently by sibling seats; see §4).
* **Mutants**: byte-exact copies of the committed `SCORECARD.md`
  (`sha256 4b98541fcdbcd3e5d278d311fd6159f01a2b842078fbc60381b0fed6b3d87138`,
  237 204 B) with **one** stanza token changed each. Every mutant is the same
  length as the pristine file (237 204 B) — a single in-place token edit, no
  reformatting.
* **Scope discipline**: nothing under the lane tree was created or modified. All
  mutation material lives under `/tmp/mutstanza-r51/`. The lane's
  `SCORECARD.md` still hashes to the pristine value and `scripts/proxy-check.mjs`
  still hashes to `495e5164ffe4b3500f128f256699b6f82e0d1e54b5618fafbe81b2b857af63e9`
  (= the stanza's own `pin.proxy-check`), and `scripts/receipt-attest.mjs` to
  `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`
  (= `pin.receipt-attest`) — **restoration verified byte-for-byte**.
* **Detector health**: `node scripts/proxy-check.mjs --selftest` →
  `PROXY_SELFTEST: 122/122 pass`, `VERDICT: PASS`, exit 0 (22 finding kinds
  observed, 17 fail-closed arms observed). The detector is not merely running —
  it is green on its own hermetic suite.

### Baseline (pristine control, same detector)

```
$ node scripts/proxy-check.mjs --self /tmp/mutstanza-r51/tree-head \
      --scorecard /tmp/mutstanza-r51/tree-head/SCORECARD.md --strict
PROXY: MATCH (A=67 C=23 operability=9; C1=19/19 C2=117/117 coverage=10;
  S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10;
  K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
exit=0
```

`SCORECARD.md` is **byte-identical** at `7d88faa` and at `HEAD` (`3304a56`):
both hash to `4b98541f…7138` and the stanza block diffs empty. So the MATCH
quoted at `7d88faa` is the same object this seat attacked.

---

## 2. Findings — stanza-term mutations (the assigned attack)

Every mutant: **exit 1**, verdict `PROXY: DRIFT (…)`, **never** `PROXY: MATCH`,
and the finding kind is **exactly** the one the term's name implies.

| # | Mutant (one-token edit) | Exit | Verdict / finding kind | Declared → computed |
|---|---|---|---|---|
| 01 | `A=67` → **`A=66`** | 1 | `A_DRIFT` | declared=66 computed=67 delta=**+1** |
| 02 | `A=67` → **`A=68`** | 1 | `A_DRIFT` | declared=68 computed=67 delta=**−1** |
| 03 | `C=23` → **`C=22`** | 1 | `C_DRIFT` | declared=22 computed=23 delta=**+1** |
| 04 | `C2=117` → **`C2=116`** | 1 | `C2_DRIFT` | declared=116 computed=117 delta=**+1** |
| 05 | `C2_total=117` → **`C2_total=118`** | 1 | `C2_TOTAL_DRIFT` | declared=118 computed=117 delta=**−1** |
| 06 | both of 04+05 together | 1 | `C2_DRIFT` **and** `C2_TOTAL_DRIFT` (two findings, one verdict line, joined `; `) | — |
| 07 | `pin.bind-oracle` → first hex `c…`→**`d…`** | 1 | **`GATE_PIN_DRIFT`** | declared=`d3929a97…` computed=`c3929a97…` |
| 08 | `pin.cite-check` → first hex `7…`→**`8…`** (v1 pin, control) | 1 | `PIN_DRIFT` | declared=`8484274f…` computed=`7484274f…` |
| 09 | `\| operability \| 9 \|` → **`\| operability \| 8 \|`** | 1 | `AXES_DRIFT` | `## Axes` row=8 derived=9 |
| 12 | 01 + 09 together | 1 | `A_DRIFT` **and** `AXES_DRIFT` | — |

Verbatim verdict lines (from
`/tmp/mutstanza-r51/transcripts/mutstanza-battery.txt`):

```
01-A-66              exit=1  PROXY: DRIFT (A_DRIFT term=A declared=66 computed=67 delta=+1; src-rev=31c465f15669)
02-A-68              exit=1  PROXY: DRIFT (A_DRIFT term=A declared=68 computed=67 delta=-1; src-rev=31c465f15669)
03-C-22              exit=1  PROXY: DRIFT (C_DRIFT term=C declared=22 computed=23 delta=+1; src-rev=31c465f15669)
04-C2-116-of-117     exit=1  PROXY: DRIFT (C2_DRIFT term=C2 declared=116 computed=117 delta=+1; src-rev=31c465f15669)
05-C2-total-118      exit=1  PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=118 computed=117 delta=-1; src-rev=31c465f15669)
06-C2-both           exit=1  PROXY: DRIFT (C2_DRIFT term=C2 declared=116 computed=117 delta=+1; C2_TOTAL_DRIFT term=C2_total declared=118 computed=117 delta=-1; src-rev=31c465f15669)
07-gatepin-hex       exit=1  PROXY: DRIFT (GATE_PIN_DRIFT term=pin.bind-oracle declared=d3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5 computed=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5; src-rev=31c465f15669)
08-v1pin-hex         exit=1  PROXY: DRIFT (PIN_DRIFT term=pin.cite-check declared=8484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2 computed=7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2; src-rev=31c465f15669)
09-axes-operability  exit=1  PROXY: DRIFT (AXES_DRIFT term=operability declared=8 computed=9; src-rev=31c465f15669)
12-A-66-plus-axes-8  exit=1  PROXY: DRIFT (A_DRIFT term=A declared=66 computed=67 delta=+1; AXES_DRIFT term=operability declared=8 computed=9; src-rev=31c465f15669)
```

**All four assigned terms are killed with the exact kind, in both directions:**
`A_DRIFT` fires for `A=66` **and** `A=68` (delta sign is correct in both
directions — `+1` when the declared value is *below* the computed one, `−1` when
above, so the delta is not a hard-coded magnitude); `C_DRIFT` fires for `C=22`;
`C2_DRIFT` and `C2_TOTAL_DRIFT` fire **distinguishably** — mutating the
numerator and the denominator produce **different kinds**, so the two C2 keys
are not collapsed into one. Mutant 07 confirms `pin.bind-oracle` (a
`kumitate-gate-pins-v1` key) reports **`GATE_PIN_DRIFT`**, while mutant 08
confirms the v1 `pin.*` keys report the distinct **`PIN_DRIFT`** — the two pin
families are not conflated.

### 2b. Non-vacuity: the terms are *live-derived*, not self-consistent

Mutating the **stanza** only proves the detector compares stanza↔tree. To prove
the terms are *derived from the tree* (and not merely echoed), this seat
mutated the **tree** in scratch copies instead — the declared stanza untouched:

| Tree mutation (pristine stanza) | Exit | Findings | Term moved |
|---|---|---|---|
| add `.ufo/waves/round-51/probe/zz-mutstanza-probe.mjs` | 1 | `A_DRIFT` | A 67 → 68 |
| add `scripts/zz-mutstanza.mjs` | 1 | `A_DRIFT` **+** `PIN_UNPINNED` | A 67 → 68 |
| append `- [ ] …` to `SKILL.md` | 1 | `C_DRIFT` | C 23 → 24 |
| add `corpus/knowledge/zz-mutstanza.md` (no README row) | 1 | `C2_TOTAL_DRIFT` **+** `AXES_DRIFT` (coverage 10→9) | C2_total 117 → 118 |
| add a `corpus/README.md` row (no note file) | 1 | `C2_DRIFT` | C2 117 → 118 |

This is the decisive non-vacuity evidence: **the same declared stanza that
yields `PROXY: MATCH` on the pristine tree yields `PROXY: DRIFT` when any of
its five input surfaces is perturbed.** The MATCH is earned by re-derivation,
not by the stanza agreeing with itself. Note also that the two C2 directions
are independent (a note without a README row moves `C2_total` only; a README
row without a note moves `C2` only) — the numerator and denominator are
separately grounded in different files.

Corpus integrity at HEAD (no orphan rows, no unlisted notes, no duplicate
paths): 117 README rows / 117 distinct paths / 117 `corpus/**/*.md` files, with
an empty set in each of {rows without a file, files without a row, duplicate
paths}.

---

## 3. Finding — `PIN_UNPINNED` degradation: dropping a gate pin is caught only in `--strict`

Two further mutants target the **gate-pin block's integrity** rather than its
values:

| # | Mutant | `--strict` | **default mode** |
|---|---|---|---|
| 10 | delete the **entire** `kumitate-gate-pins-v1` block | exit 1 — 10 × `PIN_UNPINNED` | **exit 0 — `PROXY: MATCH`** |
| 11 | delete only the `pin.bind-oracle=` **line** | exit 1 — 1 × `PIN_UNPINNED` (`scripts/bind-oracle.mjs`) | **exit 0 — `PROXY: MATCH`** |

```
10-gatepins-block-deleted  DEFAULT exit=0
  PROXY: MATCH (A=67 C=23 operability=9; … ; pins=6 match; src-rev=31c465f15669)
11-gatepin-line-removed    DEFAULT exit=0
  PROXY: MATCH (A=67 C=23 operability=9; … ; pins=6 match; src-rev=31c465f15669)
```

**Severity: medium — a coverage finding, not a defect in the contract.** In
default mode the gate-pin block is **advisory**: deleting a gate pin (or the
whole block) silently drops that file from the verified set and the verdict
still says `MATCH` with `pins=6 match`. The proxy's own header documents this
("`PIN_UNPINNED` … advisory; `--strict` promotes it to a gate"), and the lane
already mitigates it — `SKILL.md` checklist item 8 has read
`--strict` since round 42 precisely so that "a missing or renamed
`kumitate-gate-pins-v1` block re-raises `PIN_UNPINNED`, which strict mode
fails". H3 is `proxy-check.mjs --strict`, so **the round's harm gate is
covered**; the exposure is only to any *other* caller that omits `--strict`.

**Note for the integrator**: `SKILL.md:605` documents the command as
`node scripts/proxy-check.mjs [--strict]` — the optional-bracket form
invites a default-mode invocation, which is exactly the mode that reads
`MATCH` on mutant 10/11. Not a change to make here; a coverage note.

---

## 4. Finding (LIVE, H3 currently RED) — 14 untracked runnable files break the `A` term

This is the most consequential finding of the seat, and it is **not** a mutant:
it was observed in the **live lane** while this seat was measuring.

The `A` term is a **whole-tree** count of runnable files:
`walkFiles(self).filter(RE_RUNNABLE)` with `RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/`
(`scripts/proxy-check.mjs:495, 935`). It is not restricted to `scripts/` — it
counts **everything** under the lane, including `.ufo/`.

At the committed `HEAD` the decomposition is:

| Tree | `A` total | under `scripts/` | under `.ufo/` |
|---|---|---|---|
| base `c90b9de9` | 43 | 15 | 28 |
| `HEAD` (`3304a56`) | 67 | 16 | 51 |

So **51 of the 67 `A`-counted files are committed wave scratch under `.ufo/`**
— committed probe/build artifacts, not lane capabilities. The single
`scripts/` addition since base is `scripts/receipt-attest.mjs` (round 51's
instrument). `A` is therefore dominated by, and coupled to, the *accumulated
build scratch of the whole lane history*.

**Live observation.** During this seat's run, the `A` count moved **67 → 81**,
and the live lane's H3 gate went **RED**:

```
$ node scripts/proxy-check.mjs --strict          # in the live lane
PROXY  error  A_DRIFT  A: declared=67 computed=81 delta=+14
PROXY: DRIFT (A_DRIFT term=A declared=67 computed=81 delta=+14; src-rev=31c465f15669)
exit=1
```

The 14 newly-counted files are **untracked** artifacts of a sibling wave-1
seat, `.ufo/waves/round-51/build/ExecForgerControl/`:

```
build-control-variants.mjs, build-f1-argv-hashing-forger.mjs,
build-honest-baseline.mjs, probe-A2c-stdin-fix.candidate.mjs,
lanes/{C1-identical-nonce-distinct-bytes,C2-distinct-nonce-static-stub,
       C3-filename-keyed-stub,F1-argv-hashing-forger,honest-baseline}/
       scripts/{proxy-check,receipt-attest}.mjs      (10 files)
```

Total untracked runnable files in the lane right now: **14** (all under
`ExecForgerControl/`). One further artifact, `fakeclock.cjs`, is a `.cjs` and is
therefore **not** counted by `RE_RUNNABLE` — the extension filter is exact.

**Why this matters for round 51.** The plan's stanza re-derivation rides the
close commit. Two consequences, both of which the integrator (L1) must handle:

1. **If these scratch files are committed**, the committed `A` becomes **81**,
   not 67 — the stanza's `A=67` would then be stale and H3 would be RED *at
   the close commit* unless the stanza is re-pinned to the new `A`. This is a
   real risk because the plan explicitly *records* the wave-1 build scratch as
   committed material ("the control reading is committed at
   `build/ExecForgerControl/`"). Committing 14 `.mjs` files moves `A` by 14.
2. **If they are not committed** (stayed untracked scratch), the working tree
   stays RED until they are removed or the measurement is taken against
   committed bytes.

Either way the close-time measurement must be taken against the **committed**
tree (as this seat did: `git archive HEAD | tar -x` into `/tmp`), or the
`A` term must be re-pinned. Note the plan's own declared expectation —
"`A 43 → 44`" — is itself already stale relative to the committed tree
(`A` was already **67** at `HEAD` before any wave-2 scratch appeared, because
`.ufo/` scratch counts). The plan's "Terms expected to move" section says
*"A 43 → 44 (the new shipped instrument; round-51 probe counters live under
`.ufo/waves/round-51/probe/` and add to the frozen A count only by the frozen
`RE_RUNNABLE` walk — recorded, not claimed)"* — so the plan **does** disclose
this coupling, and the stanza's `A=67` is the honest current value. The
finding is that the **coupling is stronger than one round's counters**: it is
the entire accumulated `.ufo/` history, and any sibling seat's build scratch
moves `A` live.

This is a **coverage/robustness finding for the integrator**, not a request to
change the frozen definition (the `RE_RUNNABLE` walk is frozen and the plan
records the coupling explicitly). No edit was made.

**Dependency note (recorded, not blocking)**: this seat's own measurements were
taken against a `git archive` extraction of `HEAD` precisely because the live
tree is being written concurrently. Every mutant result in §2 and §2b was
reproduced 3× on the clean tree and is byte-stable.

---

## 5. Finding — the `## Axes` evidence-cell *prose* is unchecked

Mutating only the **prose** inside the `## Axes` table (leaving the stanza and
the row's integer untouched) is **not** caught:

| # | Mutant | Result |
|---|---|---|
| 13 | `## Axes` operability cell: `**A=10**` → `**A=99**` | **exit 0 — `PROXY: MATCH`** |
| 14 | `## Axes` operability cell: `and **C=19**` → `and **C=99**` | **exit 0 — `PROXY: MATCH`** |
| 15 | prose in the round-41 correction note: `live terms are A=9, C=17` → `A=999` | **exit 0 — `PROXY: MATCH`** |

The proxy checks the `## Axes` row's **integer** (mutant 09 → `AXES_DRIFT`
killed) but not the **evidence cell's quoted term values** in that same row.
The lane's `## Axes` operability row currently quotes **A=10, C=19** while the
live stanza declares **A=67, C=23** — the row's evidence is already stale
relative to its own stanza, and nothing in the toolchain notices.

**Severity: low — a coverage finding.** The proxy's contract is explicit that
it compares *derived integers* against the `## Axes` rows; the prose in an
evidence cell is out of the contract's scope by design. The lane has
historically tracked this class as calibration corrections by hand (the
round-40/42 "Calibration corrections" paragraphs in `SCORECARD.md`). Recording
it as an honest **coverage limit of the frozen `AXES_DRIFT` arm**: a doctored
evidence cell cannot move a score, but it can misstate one in prose. **This is
a coverage finding, not a licence to change the frozen contract.**

---

## 6. Verdict summary

| Claim under attack | Verdict | Evidence |
|---|---|---|
| The stanza's terms are compared against re-derived values (A, C, C2, C2_total) | **HELD** | 6/6 term mutants killed, exact kinds, never MATCH (§2) |
| `C2` numerator and denominator are distinguished | **HELD** | `C2_DRIFT` vs `C2_TOTAL_DRIFT`, distinct kinds (04, 05, 06) |
| The gate-pin block is verified | **HELD** | `GATE_PIN_DRIFT` on a one-hex flip (07); `PIN_DRIFT` distinct for v1 pins (08) |
| The `## Axes` integers are checked | **HELD** | `AXES_DRIFT` (09, 12) |
| The terms are **live-derived**, not self-consistent | **HELD** | 5/5 tree-side mutations drift (T1–T5, §2b) |
| The MATCH at `7d88faa` is non-vacuous | **HELD** | pristine `SCORECARD.md` byte-identical at `7d88faa` and `HEAD`; control MATCH, 12 mutants DRIFT |
| Gate-pin **integrity** (block present / line present) | **HELD under `--strict`; NOT HELD in default mode** | §3 — mutants 10/11 |
| `## Axes` evidence-cell **prose** | **NOT CHECKED** (out of contract scope) | §5 — mutants 13/14/15 |
| H3 (`proxy-check --strict` → MATCH) at the live lane | **RED right now** | §4 — `A_DRIFT declared=67 computed=81` from 14 untracked sibling scratch files |

**Bottom line.** The round-51 stanza re-derivation is **machine-checked, not
asserted**: the `PROXY: MATCH` at `7d88faa` is earned — every one of the four
assigned terms, in both directions, plus both pin families, produces the exact
DRIFT kind and no MATCH. Two coverage limits are recorded (§3 default-mode
`PIN_UNPINNED`, §5 unchecked `## Axes` prose) — neither changes a score and
neither is a licence to alter the frozen contract. One **live** item needs the
integrator's attention before the close commit: the `A` term is 51/67 wave
scratch under `.ufo/`, and 14 untracked sibling-seat `.mjs` files currently
hold the live lane's H3 gate at `A_DRIFT declared=67 computed=81` (§4).

---

## 7. Artifacts and restoration evidence

* **Mutant corpus**: `/tmp/mutstanza-r51/{00..15}-*/SCORECARD.md` — 16
  single-token copies of the committed file (each 237 204 B, one of which is the
  byte-identical control), with a machine-readable manifest at
  `/tmp/mutstanza-r51/manifest.json` and `/tmp/mutstanza-r51/manifest2.json`
  (each mutant's sha256, byte length, and the exact edit applied).
* **Transcripts**: `/tmp/mutstanza-r51/transcripts/mutstanza-battery.txt`, copied
  to the lane at `.ufo/waves/round-51/w2/MutStanza-transcripts/mutstanza-battery.txt`
  (`.txt`, never a runnable extension) — full stdout of the detector for all 16
  mutants, each preceded by the mutant's sha256 and followed by its exit code.
  The two mutant manifests are copied alongside it as
  `MutStanza-transcripts/manifest.json` and `manifest2.json` (each mutant's
  sha256, byte length, and the exact edit applied). **These lane copies add 0
  to the `A` term** (`.txt`/`.json` are not matched by `RE_RUNNABLE`).
* **Clean tree**: `/tmp/mutstanza-r51/tree-head` (`git archive HEAD`), and
  `/tmp/mutstanza-r51/tree-base` (`git archive c90b9de9`) for the base
  decomposition.
* **Restoration**: the lane was **never** written to by this seat. Post-run
  verification — `SCORECARD.md` = `4b98541fcdbcd3e5d278d311fd6159f01a2b842078fbc60381b0fed6b3d87138`
  (pristine), `scripts/proxy-check.mjs` = `495e5164ffe4b3500f128f256699b6f82e0d1e54b5618fafbe81b2b857af63e9`
  (= stanza `pin.proxy-check`), `scripts/receipt-attest.mjs` =
  `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`
  (= stanza `pin.receipt-attest`). `git status --porcelain` shows **no
  modification** to any tracked file; the only untracked paths are sibling
  seats' own report/build artifacts (`.ufo/waves/round-51/w2/*.md`,
  `.ufo/waves/round-51/build/ExecForgerControl/`, `.ufo/waves/round-51/close/`).
  No `.mjs`/`.js`/`.sh`/`.py` file was created by this seat anywhere under the
  lane tree.
* **Tools installed**: none. No package manager transaction was performed
  (PACMAN GUARD observed — no `pacman` invocation of any kind).

**Report**: `.ufo/waves/round-51/w2/MutStanza.md`
