# Round 37 — lessons (kumitate), repair-first

Base: lane tip `91da27c6ac17712aa53ea0adb27d89b133d60081`. Pin: `/fast/scratch/kumitate-r36/src` @
`31c465f15669f744848bd9f5d56191c5085670f7`. Round 36 was **REJECTED-HARMED** by the non-author
closure (`corpus/lessons/round-36-verifier-spotcheck.md`): 123 previously true anchors in four notes
were shifted one symbol off, the shipped pairing was right-first while the record called it
clause-guarded, and the falsify wave never ran. This round repairs that harm first.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| A green gate term certified false anchors | spot-check §Claims (123 true→false: S8 102, S4 12, S7 5, native-trial 4); `Log.md` round-36 correction | only the outside non-author spot-check, after landing; no QUALITY criterion existed | Anchors in the four notes reverted to their 0614092 sentence lines (every symbol-keyed anchor) and each note marked with a restoration notice; `QUALITY.md` Q16 now requires symbol-on-line re-measurement with an independent parser before a green line is cited. Shown able to fail: the new selftest case reads `FIDELITY: DRIFT (nonok=1)` when an anchor is shifted onto the next symbol. |
| Pairing rule could be satisfied by shifting the anchor | `scripts/claims-check.mjs` `pair = next ?? prev` at 91da27c6; spot-check D2 | the round-36 critic saw the heuristic risk; no code rule enforced it | Canonical rule now pairs LEFT first (`prev ?? next`) — the corpus writes `SYM` before its anchor — with a 47/47 selftest case where the right-hand span is the next symbol and the shifted anchor must read non-ok. |
| Ratchet ceilings were decorative | `claims-check.mjs`: CLEAN required `total.nonok === 0` even with a ratchet | reviewer `ReviewChecklist` | CLEAN with a ratchet now means "no note or total above its recorded ceiling"; the ratchet records the measured debt (`total 186`, per-note), so CLEAN is a no-regression claim, not a zero claim. |

## Gate

- D1 restore: `git -C <lane> diff --stat 0614092 -- <four notes>` (see report). Independent truth
  re-measurement is OWED: the lane gate's CLEAN is machine output, not anchor truth (Verify4), and
  D1's throwaway parser output was not committed.
- D2: `node scripts/claims-check.mjs --selftest` → `CLAIMS_SELFTEST: 47/47 pass`;
  `--fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → `FIDELITY: CLEAN (notes=20
  anchors=1551 src-rev=31c465f15669)`.
- D3: appended corrections in `SCORECARD.md` (`## Round 37 correction`) and `corpus/lessons/round-36.md`
  (`## Correction`); the live Axes runtime row now reads `92/92`; the historical `C2=81/81`/`82/82`
  quotes are named as that round's readings. Verify: `grep -n "Round 37 correction" SCORECARD.md`.
- D4: `corpus/QUALITY.md` Q16 (cited above).
- D5: falsify wave validated at 68 seats (`.ufo/waves/round-37/falsify-spec.json`), dispatched
  after the repairs and before the report; results are late evidence (records under
  `.ufo/waves/round-37/falsify/`), not integrated into this round's numbers.
- D6: fleet-root `-.rej` (72,390 B, 19 hunks) moved to
  `.ufo/waves/round-36/evidence/remaining-scripts-census.rej.txt` (moved copy sha256 `3f51c7e7…`, 249
  lines / 19 hunks, committed in `5ceb8cd`); fleet copy deleted. Verify6 notes the `cmp` output was not
  retained, so the move is evidenced by the committed copy's hash, not by a re-runnable cmp. Misroot
  re-sweep with timestamp: `.ufo/waves/round-37/final/misroot.txt` (driver files only; kumitate seat
  residue 0).
- D7: `ExecFidSmall.patch` **discarded** (its four `ReviewFidSmallB` semantic failures were never
  fixed and its green depended on the removed right-first rule) — recorded in
  `.ufo/waves/round-37/repairs.md`.
- D8: `corpus/README.md` row for `lessons/round-36-verifier-spotcheck.md`; `C2`/`C2_total` = 84 (commit `5ceb8cd` briefly carried 83/83 against 84 notes and its
  `final/proxy.txt` recorded `C2_TOTAL_DRIFT declared=83 computed=84`; `86c0676` added this lesson's
  row and set both terms to 84 → `PROXY: MATCH (… C2=84/84 …)`).
- Sources: census `sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` →
  `kumitate ok`, exit 0; no new rows this round (repair-first), rows 32 unchanged.
