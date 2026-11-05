# K90Connector — sibling-overlap scan (round 90, C1 receipt-bind v4)

Scope: read-only scan of the 20 sibling shokunin lanes for receipt binding, invisible-character parsing, and blind-scorer discipline. Full evidence: `.ufo/waves/round-90/K90Connector/overlap.md` (commands, counts, verdict, 53-row hit table) and `.ufo/waves/round-90/K90Connector/hits.psv` (classified source). Raw grep outputs: `.ufo/waves/round-90/K90Connector/hits-{A-pattern,B-invisible,C-cf,E-blind-scorer}.txt`.

## Counts (`awk -F'|' 'NR>1{c[$5]++} END{...}' hits.psv`)

| Classification | Rows |
|---|---|
| OWNED-BY-SIBLING | 32 |
| REFERENCE | 8 |
| QUOTE | 2 |
| LABEL-COLLISION | 6 |
| NONE | 5 |
| TOTAL | 53 |

Raw census before classification: receipt/Q82/zero-width/U+ pattern 186 files; `invisible` 1696 lines (mostly prose, not usable as evidence); `Cf|format character|ZWSP` 31 lines.

## Verdict

**No sibling is already doing the round's claim.** The claim is that kumitate's `receipt-bind.mjs` v4 recognises `cmd=`/`rev=`/`tool_sha256=` field lines after stripping U+200B/U+200C/U+200D/U+200E/U+00A0/U+FEFF prefixes. No sibling instrument does this for kumitate's receipt format.

Same-class siblings, each in its own domain:

- **tameshi `tools/receipt-bytes-bind.py`** (round 79; selfstate row `receipt-bind-selftest`, `tools/selfstate-freshness.json:322`) binds a receipt's `tool_sha256` to committed bytes at the named revision. Same claim class, tameshi's own header convention. Its regex is column-0 anchored (line 83) and its malformed-count is a raw `^# name:` match (line 150). Probe run here: the regex matches a plain field line and fails for all six prefixes. **Cross-domain observation: tameshi's binder has the same invisible-prefix blind spot.** [INFERENCE] a prefixed duplicate would be invisible to both checks; not constructed end-to-end. Report to tameshi via orchestrator; not absorbed, not edited.
- **kake `scripts/instrument_receipts.py`** (kake PROVINCE:498-500) binds gate instruments' sha256 at a revision. Same family, kake's registry.
- **kasegi r46/r47 gates** count zero-width ghost F-rows as defects (strip, then compare). Method precedent only.
- **chousa, kagi, kake, kotodama** strip U+200B–U+FEFF in their own normalizers. None binds a receipt to a tool sha256 at a command name.

## Blind-scorer discipline

No sibling owns a cross-lane rule that a scorer may not hand the candidate its own fixture identity. Each lane has its own version: tsukuroi QUALITY 82 and 85; chousa QUALITY 135-137 (answer key in fixture commits); kaidoku QUALITY 67; kengaku PROVINCE:614-641 (grader cheat-probes); kake PROVINCE:567-587.

**"Q82" is a fleet-wide label collision.** Souji, tameshi, chousa, mado, mori and tabi each use numeric 82 for unrelated rules. Kumitate's Q82 (`corpus/QUALITY.md:1411`) is the only one about capability-scorer fixture identity. Cite it lane-qualified.

## Ruling

The round's claim is **kumitate-owned**: operability of kumitate's own instrument on its own close receipts. Basis: `scripts/*.mjs` is the lane's own band (`PROVINCE.md:15`); K89-V1 is the lane's own routed defect (`SCORECARD.md:4395`); the blind-scorer rule is kumitate's (Q82). **Not cross-domain.** The tameshi prefix blind spot is reported as a sibling observation only.

## Other checks

- kengaku `PROVINCE.md:345` names kumitate's `bind-oracle.mjs`, a different instrument. REFERENCE.
- 17 sibling lanes cite kumitate in 307 files (`grep -rIl -i kumitate */corpus */PROVINCE.md`). Substantive citations are in the table.
- `/home/vgpnk/Projects/shokunin/kumitate-shokinin/` (typo) holds only a nested `kumitate-shokunin/` with no `PROVINCE.md` and no matching terms. Not a lane; untouched.

## Writes and tooling

- Writes: `.ufo/waves/round-90/K90Connector/{overlap.md,hits.psv,hits-*.txt}` and this file. No lane, sibling, pin, probe or plan file was written. No git mutation. No scratch dir created. No tool installed or upgraded.
- Subagent dispatch: none (leaf member).
