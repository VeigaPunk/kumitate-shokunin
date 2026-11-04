# Fleet-report erratum (D1, D2, D8) — certified copy and status

Target file (fleet repo, NOT the lane): `/home/vgpnk/Projects/shokunin/.ufo/reports/round-79/kumitate.md`
Repair class: append-only erratum naming the superseded text (PROTOCOL §Round-robin rounds).
Status at audit time (2026-11-04, lane tip `509afb1d`): block EXISTS VERBATIM in the fleet
working tree (`git status` → ` M .ufo/reports/round-79/kumitate.md`, +26/-0 lines,
hunk `@@ -178,3 +178,29 @@`) but is **UNCOMMITTED**. No edit required; the L1 must
commit it. The block is 25 lines including its `##` heading (23 body lines) — at the
"under 25 lines" bound; acceptable as-is.

## Exact text to land (verbatim from the fleet working tree)

```markdown
## Erratum — appended at round 80 (2026-11-04); supersedes only the text it names

The non-author spot-check of this round (`corpus/lessons/round-79-verifier-spotcheck.md`) routed eight
record defects (D1–D8). This erratum corrects the filed-report ones; the filed bytes above are not
rewritten (`PROTOCOL.md` §Round-robin rounds: a correction lands as an appended erratum naming the text
it supersedes — never a rewrite, labelled or silent).

- **D1 — superseded citation.** The "Round-open repair" bullet cites `.ufo/waves/round-79/open/gates-open.txt`
  for `README_MAP: CLEAN files=191 rows=191 covered=191`. That file is the before-snapshot and reads
  `DRIFT files=191 rows=190`; the clean reading is committed at
  `.ufo/waves/round-79/w1/K79ScoutOpen/gates.txt:35` and
  `.ufo/waves/round-79/w1/K79ReviewFreeze/scaffold-tree-readme-map.txt`.
- **D2 — dead pointer.** The "Independent attacks" bullet names the C2 mutation seat's matrix at
  `w1/K79MutC2/`; no such path exists at any lane revision, and the bullet itself records that the seat
  filed no report and no matrix. The absence is the record; the pointer is void.
- **D8 — recorded, not repaired.** This report was rewritten in place at `59aa9ae` (one header line and
  one Landed-changes bullet, plus a regenerated receipt) instead of an appended erratum; the superseded
  text is not recoverable from the filed bytes. Round 80 files this erratum rather than repeat the
  rewrite, and its own report is filed once.

D3–D7 (lesson counter names, the S229 quote word count, the round-78 SCORECARD placeholder, the close
receipts' missing `rev=` lines, and the missing committed round-start sources census) live in the lane
repo and are repaired there by appended errata and by this round's regime: every round-80 close receipt
carries a `rev=` line naming the measured revision, and the round-start census is committed under
`.ufo/waves/round-80/open/`.
```

## Audit certification of this block's factual claims

- D1 sentence: TRUE. `sed -n '31p' .ufo/waves/round-79/open/gates-open.txt` →
  `README_MAP: DRIFT files=191 rows=190 covered=190 bad=2 first=uncovered:lessons/round-78-verifier-spotcheck.md`.
  Clean reading at `w1/K79ScoutOpen/gates.txt:35` (verified, line 35 = `README_MAP: CLEAN files=191
  rows=191 covered=191`) and at `w1/K79ReviewFreeze/scaffold-tree-readme-map.txt:1` (verified).
- D2 sentence: TRUE. `ls .ufo/waves/round-79/w1/` shows no `K79MutC2` entry;
  `git log --all --oneline -- '.ufo/waves/round-79/w1/K79MutC2*'` → 0 commits.
- D8 sentence: TRUE with one number fixed elsewhere (see report §D8): the rewrite is
  `cbb52bd`→`59aa9ae`, report 14070→14251 bytes; the block's prose avoids the spotcheck's
  unverifiable "13495" start figure. Classification "recorded, not repaired" is the correct
  append-only treatment for an already-performed rewrite.
