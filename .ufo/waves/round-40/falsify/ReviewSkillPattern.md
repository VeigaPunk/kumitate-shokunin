RESULT ReviewSkillPattern rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=defects defects=7

# ReviewSkillPattern: round-40 SKILL.md error-pattern entry and anchor-truth checklist item

Judged on: operability. Milestone: r40 falsify at measured candidate.

## Scope and revisions

- Candidate code: 1530a75521345e0f4516ed7146180e65f788e017.
- The round-40 SKILL.md entry is not on the candidate. It arrived in the docs commit 0004ae3102c595338c269e56e3a6f5e0d4a28307 (lane master, one commit above the candidate). I reviewed that text. The docs commit changes SKILL.md (17 insertions, 0 deletions), LOG.md, SCORECARD.md, corpus/README.md, corpus/lessons/round-40.md and round-40 receipts. It changes no file under scripts/, .ufo/pins/ or the probe directory, so the candidate code is what the entry describes.
- Gate registry row for anchor-truth: SKILL.md:606. Round-40 entry: SKILL.md:636-651. Checklist header: SKILL.md:653-667. Checklist item 14 (anchor-truth burn-down): SKILL.md:682. Item 15 (anchor-truth selftest): SKILL.md:683.

## Findings, by severity

1. High. Checklist item 14 was not updated to the sound mode, and the command it runs accepts 13 of 26 attacks.
   - SKILL.md:682 runs `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9` with no `--open`, and passes on `exit 0 + TRUTH: CLEAN`. The docs commit did not touch this line.
   - Measured at 1530a755 with the probe's gate call changed only to drop `--open`: attacks_accepted=13/26 (evidence 8). Accepted: ATK_X1_REC38 and ATK_X1_REC40 (forged review records committed in the same change); P02 to P05 (base-true swaps); P11, P12, ATK_SLOTS_ALL, ATK_TRADE and ATK_FRESH (debt trades and debt headroom); ATK_REBREAK and ATK_RELOCATE2 (base-true moves).
   - With `--open f69817edf687c8ce4f87ed7953a353399232f69e`, the official probe refuses all 26 (attacks_accepted=0/26; evidence 7).
   - So the three symptoms in the entry (SKILL.md:637-641) still reproduce under the checklist command. The entry itself (SKILL.md:642-649) says the decision is `--open REV`. Neither the checklist (SKILL.md:653-667, 682) nor the registry (SKILL.md:606) says so.

2. Medium. The registry entry command omits `--open` (SKILL.md:606). The row reads `node scripts/anchor-truth.mjs [--base REV] [--write-pin --notes …]`. The code CLI line (scripts/anchor-truth.mjs:80-81) and the parser (:560) both define `--open REV`, and the entry requires it (SKILL.md:642). The same row says "the frozen `--base` commit holds the burn-down floor" and does not mention the round-open pin floor (compareOpen, scripts/anchor-truth.mjs:528-546).

3. Medium. The "Open limits" sentence leaves out the checklist-form gap (SKILL.md:649-651). It lists only the narrowing and widening limit and the token-kept limit. Without `--open`, 13 of the 26 attacks read CLEAN (finding 1). Eleven of those 13 need the open-pin floors (DEBT_NEW, and the open-pin copies of DEBT_GREW, CHECKED_SHRANK and BASE_TRUE_LOST), which run only under `--open`. The frozen base e18ff1af predates the repairs, so the base check alone cannot see them. The lesson's open-limits list (corpus/lessons/round-40.md:134-136) names only the record-binding half ("a forged record committed in the judged change binds").

4. Low. "for the same anchor identity" (SKILL.md:643-644) understates the binding rule. `ReviewRecords.bound` (scripts/anchor-truth.mjs:356-368; header :65) also binds a record on the same path whose cited range nests with the entry's range. The sentence also omits where records live (`.ufo/waves/<round>/anchor-reviews.json`, code :109) and their shape (`{ "<note>#<ord>": { seat, token } }`, header :59). Untested residual: a broad record could bind a narrower, different anchor that has the same seat and token.

5. Low. "Measure with `.ufo/waves/round-40/probe/floor-probe-v2.mjs.txt` (26 attacks, 10 benign edits)" (SKILL.md:647-648) gives no command. The counts are right (evidence 7). The probe reads its script on stdin and needs `--lane <repo> --rev <commit> --src <clone>` (probe header lines 7-8). Its open revision defaults to f69817e.

6. Low. The registry verdict list (SKILL.md:606) reads `TRUTH: CLEAN|DRIFT|FAIL-CLOSED`. It omits `TRUTH: PINNED` (scripts/anchor-truth.mjs:694, exit 0), which the `--write-pin` form in the same row prints. The code's own verdict list (header :75-77) also omits it.

7. Low. The round label is wrong for Q19. SKILL.md:636 says "(round 40, corpus/QUALITY.md Q19 and Q20)". Q19 predates round 40: the round-39 entry (SKILL.md:617) cites it as round 39, and the diff of corpus/QUALITY.md from f69817e to 1530a755 adds only Q20 (29 insertions).

## Sentences checked and found consistent with the code

- Finding kinds REVIEW_UNBOUND, BASE_TRUE_LOST, DEBT_GREW, CHECKED_SHRANK, DEBT_NEW, TOKEN_FORGED, PIN_INVALID and TRUTH_WARN are all emitted (scripts/anchor-truth.mjs:439, :447, :478-498, :542, :636-637, :643-647). PIN_INVALID exits 2 (selftests AT26 and AT30).
- `--open` is read only from argv (:560). No other code assigns it.
- compareOpen is compareBase against the open pin plus an identity-and-token debt check (:528-546). `unchecked` anchors are exempt (header :84-85); the entry omits this, which is harmless.
- Fixture IDs exist and pass: AT31-AT34 (:1022-1049), AT39-AT42 (:1106-1137), AT43-AT45 (:1068-1086). Selftest result: 41/41 pass.
- TRUTH_WARN prints exactly once when `--open` is absent (:630-637).
- Checklist item 14 facts hold: four notes, 811 anchors, `src-rev=31c465f15669` in the verdict. "Item 14 fails closed without its origin pin" (SKILL.md:667) holds: ORIGIN_PIN_MISSING, exit 2.
- Exit codes match the registry: 0 clean or pinned, 1 drift, 2 fail-closed, 64 usage.
- The round-40 entry has no line pointers. Its file citations resolve: corpus/QUALITY.md Q20 at line 173; R39-1 to R39-3 at corpus/lessons/round-39-verifier-spotcheck.md:141-147; corpus/lessons/round-40.md exists; the probe file exists.
- The frozen round-38 replay still reproduces its own revision (evidence 10). The "Named legacy gaps" paragraph (SKILL.md:608-615) is accurate as history. Not a defect.

## Residual risk and verification gaps

- Not run: the "honest re-cites refused under `--open`" limit (code read only, compareBase identity check, :490-499). The nested-range over-binding (code read only, finding 4).
- Not checked: checklist items 3, 8 and 10 (outside this item).
- Tooling: no LSP device. `xd://lsp` is not mounted (mounted devices: ast_edit, debug), so caller checks were done by reading the code and with literal `git grep`. The `_grep` tool returned "No matches found" for strings that `git grep` finds in the same file, so only `git grep` output is cited here.
- Installs and updates by this seat: none. Runtimes used as already installed: git 2.56.0, Node v24.21.0, Python 3.14.8.
- Scratch only: /fast/scratch/hyaku/kumitate-r40/seats/ReviewSkillPattern/ (clone, probe copy, outputs). The lane was written only at this report file.

## Evidence (commands and outputs)

1. `git diff --stat 1530a755 0004ae3 -- scripts .ufo/pins corpus/QUALITY.md` printed nothing. `git diff --stat 1530a755 0004ae3 -- SKILL.md` printed `SKILL.md | 17 +++++++++++++++++`.
2. `node scripts/anchor-truth.mjs --selftest` (clone at 0004ae3, code identical to 1530a755) printed `ANCHOR_TRUTH_SELFTEST: 41/41 pass`, `VERDICT: PASS`, exit 0.
3. `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9` printed one `TRUTH_WARN review sources are bound against the lane's current HEAD (0004ae3102c5)…` line, then `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af… src-rev=31c465f15669)`, exit 0.
4. The same command plus `--open f69817edf687c8ce4f87ed7953a353399232f69e` printed no TRUTH_WARN line and `TRUTH: CLEAN (… open=f69817ed… src-rev=31c465f15669)`, exit 0.
5. `node scripts/anchor-truth.mjs --bogus` printed `anchor-truth: unknown argument --bogus`, exit 64. `node scripts/anchor-truth.mjs --open` printed `anchor-truth: --open needs a value`, exit 64.
6. `node scripts/anchor-truth.mjs --self <empty dir> --base e18ff1af…` printed `TRUTH: FAIL-CLOSED (ORIGIN_PIN_MISSING …)`, exit 2.
7. Official probe: `node --input-type=module - --lane <clone> --rev 1530a75521345e0f4516ed7146180e65f788e017 --src /fast/scratch/hyaku/kumitate-pin/src --open f69817edf687c8ce4f87ed7953a353399232f69e < floor-probe-v2.mjs.txt` printed `FLOOR_PROBE2 attacks_accepted=0/26`, `benign_clean=10/10`, `setup_errors=0`, with 36 CASE lines (26 attack, 10 benign). Wall time 29.67 s.
8. Scratch copy `probe-noopen.mjs.txt` (sha256 b6c1f7ee…). One line changed: `if (openSupported && !process.env.PROBE_NOOPEN) a.push('--open', OPENREV);`. Command: `PROBE_NOOPEN=1 node --input-type=module - --lane <clone> --rev 1530a755… --src /fast/scratch/hyaku/kumitate-pin/src < probe-noopen.mjs.txt`. Printed `FLOOR_PROBE2 attacks_accepted=13/26`, `benign_clean=10/10`, `setup_errors=0`. Refused in this mode: P01, P06 to P10, A1 to A6, ATK_REORDER_REC.
9. Probe case ATK_X1_REC40 (probe lines 402-410) writes a record naming `review:NoSuchSeat` for S8#92, commits it, and re-pins. It is accepted without `--open` and refused with it (REVIEW_UNBOUND).
10. `python3 .ufo/waves/round-38/frozen/replay.py.txt <clone> /fast/scratch/hyaku/kumitate-pin/src .ufo/waves/round-38/frozen/expected.json` printed `FROZEN: digests_verified inputs=7 source=80`, `FROZEN: MATCH revision=01aab4b0a9756cb0d2ebea0e073a49f50a6d0223`, exit 0.
11. Lesson text (corpus/lessons/round-40.md:134-136): "No `--open` in the checklist command… so a forged record committed in the judged change binds." It names no pin-floor attacks.
12. Entry text (SKILL.md:642-643): "Decision since round 40: pass the round-open revision as `--open REV` (from the command line, never from a lane file)."
13. Code (scripts/anchor-truth.mjs:560): `else if (a === '--open') o.open = val();`. Other `o.open` uses are at :627-630 and :722-727 and only read it.
14. Code (scripts/anchor-truth.mjs:365): `if ((rec.a <= e.a && e.b <= rec.b) || (e.a <= rec.a && rec.b <= e.b)) return true;`
15. `git log --oneline -- .ufo/pins/anchor-truth.json` lists 4e34c35 (round 39) as newest. Round 40 did not change the pin.
16. `git diff --stat f69817e 1530a755 -- corpus/QUALITY.md` printed `29 insertions(+)`, and the added block is Q20 only.
17. Checklist item text (SKILL.md:682): "- [ ] Per-anchor truth burn-down — `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9` → exit 0 + `TRUTH: CLEAN`".
