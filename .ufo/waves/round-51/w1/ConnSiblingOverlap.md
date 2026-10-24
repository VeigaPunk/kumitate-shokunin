# ConnSiblingOverlap — kumitate round 51

Seat `kumitate-r51.ForeignGiraffe`. Scan only. No lane file outside this report was written. No tool installed or updated. Counters and `plan.md` were not edited.

Axes named for the scan: **claim separability** (does a live sibling own receipt-attest, an invocation-receipt instrument, a nonce ledger, man7 `clock_gettime(2)` / `getrandom(2)`, or a cap-run-adjacent runner?) and **operability hermeticity** (C1 must not inherit another lane's live PATH-hash attack). Coverage (C2 / `DOCTRINE_HELD`) is a no-harm constraint, not a second move.

## Conclusion

**Kumitate round 51 does not overlap any live sibling claim.** No other lane's current wave claims `scripts/receipt-attest.mjs`, contract `kumitate-receipt-attest-v1`, an invocation-record digest, a nonce ledger, SOURCES rows for man7 `clock_gettime(2)` or `getrandom(2)`, or `cap-run`. Zero `*-shokunin/.ufo/reports/round-51/` directories exist.

The only live operational adjacency is **chousa round 37 C1**, which pins an absolute `sha256sum` and refuses the caller's PATH. Kumitate's plan requires GNU `sha256sum` *format* (`plan.md:29`) and a hermetic selftest (`plan.md:39`). It does not require the `sha256sum` binary. Shelling out to it would import chousa's attack into A1/A3 without becoming chousa's claim. That is the one move below.

Shared words (`receipt`, `ledger`, `nonce`, `invocation`, `sha256sum`) are not shared claims. Those collisions are listed under Adjacent, not Contested.

## Evidence

### Command 1 — lane inventory and `.ufo/reports/round-51`

21 directories match `/home/vgpnk/Projects/shokunin/*-shokunin`. A directory walk of `<lane>/.ufo/reports/round-51` printed:

```
ufo_reports_round-51:
  NONE
```

(The walk that produced this line also started a per-wave byte count and was killed at 90s after the NONE line and the rows quoted in command 2. The NONE line was printed before any wave walk.)

Out of the contracted glob, read only as closure evidence, not as a lane report dir:

- Fleet `/home/vgpnk/Projects/shokunin/.ufo/reports/round-51/` contains `kotoba.md` and `kotodama.md` only. Both describe landed, closed rounds (headers below). Not live.
- `audio-shokunin/reports/round-51/` exists but is **not** under `.ufo/`. Audio's report dirs continue through `round-99`. Not current. Audio has no `.ufo/waves/` at all.
- `kotodama-shokunin/reports/round-51/` exists (claims, boundary counter) but is **not** under `.ufo/reports/`. It is the landed artifact of the closed round cited by the fleet report.

### Command 2 — precise needles in each sibling's latest wave

Byte counts of `receipt-attest`, `invocation-attestation`, `clock_gettime`, `getrandom`, `cap-run`, `helper-invocation`, `ledger_latest_check` over each sibling's newest `.ufo/waves/<round>/` (plus historical `round-51` where that dir exists and is not the newest). Text-claim surfaces were then re-read. Mtimes are local 2026-10-23 unless noted.

| Lane | Current wave | mtime | Precise hits in claim surfaces |
|---|---|---|---|
| audio | no `.ufo/waves` | — | n/a (reports already at round-99) |
| chousa | round-37 | 20:12 | CLEAN for all seven needles. Claim text is PATH/`sha256sum` (adjacent). |
| game-dev-2d, game-dev-3d | no waves | — | n/a |
| kagi | round-28 | 10-21 15:24 | `build/` and `falsify-spec.json`: no `clock_gettime` / `getrandom` / `receipt-attest` / `cap-run`. A raw count reported `getrandom=56810` across a tree whose `sandboxes/` child alone exceeds 20k files. Not a claim document. Stale. |
| kaidoku | round-34 | 08:20 | `clock_gettime` / `getrandom` occur only as ELF dynamic-symbol bytes in `prep/R34Expected-files/corpus/evidence/round-34/elf/e0{3,4,5,10,12}.bin` (and `elf-meta/` copies). Example `e05.bin`: `clock_gettime\0getrandom\0arc4random`. Claim is GNU version-needs (`claims.json` predicate `P34-version-needs`), sources `lsb-symversion.html` and `glibc-elf.h`. Not man7. |
| kake | round-44 | 22:57 | `ledger_latest_check=51` inside the round-44 wave. No receipt-attest, clock_gettime, getrandom, cap-run. |
| kama | round-31 | 20:40 | CLEAN for the seven needles. Census text mentions man7 `ld.so.8` / `ldconfig.8` duplicate-url warnings, not `clock_gettime(2)` / `getrandom(2)`. |
| kasegi | round-23 | 10-20 18:45 | CLEAN. Stale. |
| kengaku | round-29 | 10-21 15:12 | CLEAN on claim docs (text scan). Stale. |
| kotoba | **round-63** (live) | 22:52 | `helper-invocation=3`. Historical `round-51` (10-22 12:14): CLEAN. |
| kotodama | **round-64** (live) | 22:53 | CLEAN. Historical `round-51` (10-22 06:46): CLEAN. |
| lore | round-103 | 10-19 19:43 | CLEAN. Stale. |
| mado | round-28 | 20:10 | CLEAN. |
| mori | round-38 | 20:02 | `contract.md`: no needles. Census names man7 `proc_pid_oom_score`, not the two syscalls. |
| revenger | round-62 | 10-21 19:25 | text scan: no needles. Stale. |
| souji | round-22 | 10-21 12:07 | text scan: man7 `timeout(1)` only. Stale. |
| tabi | round-22 | 10-21 14:14 | text scan: navigation nonces, not CSPRNG nonces. Stale. |
| tameshi | round-35 | 20:00 | text scan: counter "control receipt" / "before receipt". No needles. |
| tsukuroi | round-35 | 08:52 | `w1-spec.json`: no needles. Existing `run-receipt.py` is their score harness, not a new attest instrument. |

A repo-wide search of tracked files for `clock_gettime(2)` / `getrandom(2)` / the man7 man2 URLs returned **no matches**. Tracked `clock_gettime` / `getrandom` hits are audio PCM fixtures (`audio-shokunin/corpus/fixtures/*.c`) and historical strace logs, not a sibling SOURCES row. `.ufo/` is gitignored, so that search did not see wave trees; command 2 did.

### What the two lanes that still have a `round-51` wave actually claimed

Both are closed. Fleet reports, first claims paragraph:

- `kotoba.md:9-14` — C1 freshness: `verifiers/verify_surfaces.py` 5/7 → 7/7 against omp 18.12.6. C2 depth: `check_overlap_levers.py` 0/7 → 7/7. Pushed head named in the header: `588f5824…`.
- `kotodama.md:7-10` — D depth: pastoralism boundary table 11 → 15 rows. C coverage: `corpus/knowledge/linguistics/sign-languages-manual-modality.md`. Header: pushed `10f433cd…`.

Neither is receipt-attest, a nonce ledger, or man7 syscall sourcing.

### Live claim sentences (quoted from the current wave spec / contract)

- **kotoba r63** (`w1-spec.json` context): C1 depth, close erratum survivor G9 in new `verifiers/check_scoped_rules_v32.py`. C2 calibration, new `verifiers/check_r63_routed_repairs.py`. The string "helper-invocation receipts" is a SCORECARD carry-forward debt inside `w2-spec.json` item `ScoutW2QualityDebt` and `w1/ExecScorecardRow.md`, grouped with "SentBounds' pre-wave baseline receipt" and "the r62 wave-2 dispositions". `receipts/C1-g9-measure.txt` is a 16-line self-test log (`survivors closed 6 of 6`), not a bound invocation record.
- **kotodama r64** (`w1-spec.json` context): C coverage, entry `language-socialization-and-acquisition.md`, rows S718–S749. O operability, `reports/round-64/accept-o.py` on unchanged `tools/reopen-row.py`. Ca calibration, `accept-ca.py`.
- **kake r44** (`w1-spec.json` context, line 10): C1 operability, witness classes G1–G10 plus `c44_audit.py` so 27 round-43 controls are witnessed under counter v5. C2 freshness: "the four r43 ledger figures routed by the round-43 verifier spot-check re-derive from committed receipts at the tip; a checker `scripts/ledger_latest_check.py` exits 0 iff the last statement of each declared figure in LOG.md / SCORECARD.md matches the receipt." `ledger-quotes.json` binds three prose figures (`rescore-tally`, `donothing-ratios`, `build-ratio-range`) to round-43 JSON receipts. Not an invocation nonce ledger.
- **chousa r37** (`w1-spec.json` context, line 9): C1 operability, "a claim's `sha256` revision pin is hashed through one pinned absolute `sha256sum` and never through the caller's PATH (`sha256sum`/`cut`)". C2 freshness, a `--pin` baseline independent of `BASH_ENV`, predicate `PIN_CAPTURE_ENV_MATCH=7/7`. Their "receipts" are counter outputs (`corpus/evidence/round37/receipts/`).
- **kama r31** (`preregistration.json`): C1 chat-completions parameter table on llama-server b11755. C2 revision-keyed SCORECARD claim rows. Receipt fields are counter JSON (`--out <receipt.json>`).
- **mado r28** (`registration.md:17-29`): C1 offline mutation-gate rotation (`PRED-C1-r28`). C2 nine routed record defects.
- **mori r38** (`contract.md:12-22`): C1 content half of the drift-corpus binding (`P-C4`). "Live receipt" means a drift-row log, not an invocation attest.
- **tameshi r35** (`spec-w1.json` context): C1 `tools/tally-audit-v3.py`; C2 six self-assessment mismatch classes.
- **kaidoku r34** (`claims.json:6-8`): twelve ELF carriers match frozen GNU version-needs records. Reader `tools/round-34/elf-version-needs.py`.
- **tsukuroi r35** (`w1-spec.json` context): C1 `tsukuroi-census.sh` pacnew/pacsave drift arm. C2 exploratory pacman 7.1 note, no counter.

No current-wave spec above contains `cap-run`, `receipt-attest`, `invocation-attestation`, `clock_gettime`, or `getrandom`.

### Frozen kumitate side (what must stay separable)

`plan.md:21-48` C1: `scripts/receipt-attest.mjs`, contract `kumitate-receipt-attest-v1`. Sidecar is GNU `sha256sum` format over the exact receipt bytes (`plan.md:29`). Inner digest binds nonce, argv, exit, output hashes, clocks (`plan.md:30-32`). `--ledger` rejects nonce reuse (`plan.md:34-37`). Q39 ceiling kept: not temporal proof (`plan.md:45-48`). `plan.md:75-85` C2 cites new rows S100 man7 `clock_gettime(2)` and S101 man7 `getrandom(2)`.

`attest51-probe.mjs:36` and `:53` hash with `createHash('sha256')`. The probe spawns `git`/`bash`/`node` for extraction and for the tool under test. It does not call `sha256sum`. A2/A3 (`:90-125`) accept only the tool's own `RECEIPT: VALID` / `RECEIPT: TAMPERED` lines.

## Contested scope

None.

## Adjacent scope (not a claim collision)

1. **chousa r37 C1/C2** — `/home/vgpnk/Projects/shokunin/chousa-shokunin/.ufo/waves/round-37/w1-spec.json` line 9, claims file `corpus/evidence/round37/claims.md` (named by that spec). Same day, operability axis, hashing tool. Different object: their gate's revision pin vs kumitate's receipt sidecar. Collision appears only if kumitate execs `sha256sum`.
2. **kake r44 C2** — `/home/vgpnk/Projects/shokunin/kake-shokunin/.ufo/waves/round-44/w1-spec.json` line 10 and `ledger-quotes.json`. Live. "Ledger" re-derives LOG/SCORECARD sentences from measurement JSON. Kumitate's ledger is a nonce set across `*.txt` receipts (`plan.md:36`). Do not merge the names in the SCORECARD capabilities row.
3. **kotoba r63 debt phrase** — `w2-spec.json` item `ScoutW2QualityDebt`; `w1/ExecScorecardRow.md`; `receipts/C1-g9-measure.txt`. "Helper-invocation receipts" is unfinished bookkeeping, not an instrument.
4. **kaidoku r34 ELF symbols** — the paths under `prep/R34Expected-files/corpus/evidence/round-34/elf/`. Symbol names only. Their sources are LSB/glibc headers, not S100/S101.
5. **kama r31 / mori r38 man7 census warnings** — `ld.so.8`, `ldconfig.8`, `proc_pid_oom_score`. Different pages. Not rows kumitate is opening.
6. **Closed homonym rounds** — kotoba and kotodama `.ufo/waves/round-51/` plus the fleet reports cited above.

## Proposed move (one)

**Ship `receipt-attest` so every digest is `node:crypto` `createHash('sha256')`, and the sidecar is only the GNU text-mode byte layout. Do not spawn `sha256sum`, `shasum`, or a shell.**

Format to emit and to parse, matching GNU `sha256sum` text mode (coreutils default, not `-b`):

```
<64 lowercase hex><two spaces><basename of the receipt file><newline>
```

No `*` binary marker. The name is the basename, because verify is given a path and the sidecar sits beside it (`<base>.txt.sha256`). Hash the exact receipt bytes, prelude included, which is what makes a prelude-only redate `TAMPERED` (`plan.md:42-44`, probe A3).

This improves operability hermeticity: A1's selftest and A3's TAMPERED reading cannot be flipped by `PATH` or `BASH_ENV`, which is the live chousa r37 claim, without kumitate taking that claim. It does not add a predicate, a SOURCES row, or a SCORECARD capability beyond `receipt-attest`. C2's S100/S101 prose stays about `CLOCK_MONOTONIC` and the kernel CSPRNG, not about the sidecar tool.

Do not, in the same edit, add a D2 clause whose `receipt:` path points at a sibling lane. Sibling paths are not blobs at the kumitate rev, so such a clause fails D2 (`doctrine51-probe.mjs` blob compare). A separability sentence, if the scribe wants one, stays ordinary prose: kake's checker re-derives prose figures; this nonce ledger does not.

## Risks

- **Format mismatch.** One space, a `*` marker, or an absolute path in the sidecar makes A2 fail even when the digest is right. The probe will not forgive it; it only reads the tool's verdict (`attest51-probe.mjs:93-94`, `:124-125`).
- **False comfort from "GNU format".** Calling the binary "because the plan says sha256sum" re-opens chousa's hole and makes `--selftest` non-hermetic (`plan.md:39`). A scratch golden file may be produced *once* by `/usr/bin/sha256sum` to lock the two-space layout; the shipped tool must not do that.
- **Name collision at close.** Calling the nonce walk "the receipt ledger" in SCORECARD next to kake r44's `ledger_latest_check.py` lets a later census treat them as one family. The plan's words are already "nonce ledger" (`plan.md:36`, `:44`). Keep them.
- **kagi bulk tree.** `getrandom=56810` was not attributed file-by-file (listing timed out). It sits in a 10-21 sandbox tree, and `build/` plus `falsify-spec.json` are clean. Not treated as a claim. If a later seat needs certainty, search `sandboxes/` only.
- **Stale "current".** Newest-wave mtime is the activity signal used here. A lane can be between rounds with an old newest dir (kagi, kasegi, lore, revenger, souji, tabi). None of those newest dirs claim this surface in the texts read.

## Verification (for the integrator, not run here)

The instrument does not exist at the lane tip yet, so nothing below was executed.

1. On the scratch copy, `grep -n` the shipped `receipt-attest.mjs` for `sha256sum`, `spawn`, `execFile`, `execSync`. Expected: no hash-binary spawn. Digests come from `createHash`.
2. Write one receipt, run `/usr/bin/sha256sum` on it in the scratch dir, and `cmp` that line to the tool's sidecar. Expected: identical bytes (two spaces, basename, trailing newline).
3. Selftest sidecar-mismatch case still prints `RECEIPT: TAMPERED` and exits 1 (`plan.md:37-39`). Then `node .ufo/waves/round-51/probe/attest51-probe.mjs <lane> <rev>` after integration. Expected `ATTEST_HELD held=5/5`. PATH must not be on that command's critical path.
4. Confirm the integrated entry's D2 clause lines do not cite kake, chousa, or kotoba paths.

## Contradiction (left standing)

Keyword search and claim search disagree. A byte or prose search for "receipt", "ledger", "invocation", "nonce", or "sha256sum" hits kake r44, kotoba r63, chousa r37, kama r31, mori r38, and tameshi r35. The predicate search hits none of them for C1 or C2. Scoring overlap by vocabulary would falsely contest kake's figure ledger and kotoba's debt phrase. Scoring it by predicate leaves kumitate r51 uncontested, with one build constraint borrowed from chousa's *attack*, not from chousa's *claim*.
