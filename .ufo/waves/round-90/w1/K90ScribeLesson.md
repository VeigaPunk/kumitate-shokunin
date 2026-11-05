# K90ScribeLesson — scoped findings (round 90, C1 receipt-bind v4)

Seat: K90ScribeLesson (leaf scribe, no subagent dispatch). Lane HEAD read: `b67fa9639ca6537b92021ea938f769ff1ed6c883`. No lane file was written; the drafts sit in the seat directory. The Report line named this path, so the report is here and the drafts are in `.ufo/waves/round-90/K90ScribeLesson/`.

## Produced

| file | lines | content |
|---|---|---|
| `.ufo/waves/round-90/K90ScribeLesson/lesson-round-90.md` | 34 | `## Gate` (6 Reject/Hold bullets, Admit bullets for M1/M2 and the drafts), `## Mistakes` (2 rows: M1 fixture identity in paths, rounds 87-89; M2 invisible-prefix field lines, K89-V1) |
| `.ufo/waves/round-90/K90ScribeLesson/knowledge-receipt-invisible-prefix-fields.md` | 45 | `source:` / `verified-at:` / `recheck:` on lines 1-3; v4 class, Cf/White_Space table, bypass shape, positive twins, limits |
| `.ufo/waves/round-90/K90ScribeLesson/quality-q83-draft.md` | 15 | proposed Q83 in the Q82 block style (Rule, Grounding, Who checks, Field, Command, Fails when, Shown able to fail, Limit) |
| `.ufo/waves/round-90/K90ScribeLesson/evidence/` | — | observer, probe runs, sentinel copy, Unicode checks, Q83 counts, sha256 list |
| `.ufo/waves/round-90/K90ScribeLesson/open/` | — | `PropList.txt` (PropList-18.0.0), `DerivedGeneralCategory.txt` (DerivedGeneralCategory-18.0.0) |

## Commands and the outputs that matter

1. Frozen probe, do-nothing tool (`git show 7218699…:scripts/receipt-bind.mjs`, sha256 `37201ad0…1bb3`), `--rev b67fa96…`:
   `C90_C1: UNMET held=39/47`, exit 1. Failing arms: `dup-feff`, `dup-zwsp`, `dup-zwnj`, `dup-zwj`, `dup-lrm`, `dup-nbsp`, `single-zwsp`, `single-nbsp`. Matches `controls/ctl-base-v3-at-rev.txt`. (`evidence/probe-base-v3-direct.txt`)
2. Same tool, run through a read-only observer (`evidence/wrap.mjs`), which logs what the candidate is handed, then delegates unchanged: `C90_C1: UNMET held=39/47`. (`evidence/probe-wrap-observed.txt`, `evidence/wrap.log`). A first observer run crashed on an unhandled ENOENT in the observer itself (`dir-missing` arm, exit 1, no ARM lines); the observer was fixed and re-run. That crash is not a probe result.
3. Q83 source counts on the frozen probe: `dup-` classes 6, `single-` arms 2. (`evidence/q83-source-counts.txt`)
4. Unicode classes (Node v24.21.0, Unicode 17.0 by `process.versions.unicode`): U+FEFF, U+200B–U+200E and U+200F are `Cf`; U+00A0 is `Zs` and `White_Space`. JS `\s` / `trim()` strips FEFF and NBSP only. (`evidence/unicode-classes.txt`). UCD 18.0.0 lines: `DerivedGeneralCategory` 3554, 3600, 3604; `PropList` 15, 29, 37. (`evidence/ucd-lines.txt`). Hashes: `evidence/sha256.txt`.
5. Q82 timing: `git log -S'### Q82'` → `7a8afb5f` (2026-11-04 21:14:07 -0300). Round-89 probe freeze: `adfc2f55` (20:46:17 -0300). Q82 did not precede the freeze.
6. Sentinel K89-V1 bypass: `.ufo/waves/round-89/build/K89Sentinel/attacks.txt` rows B2 and B7 read `CLEAN` on base v2 and on the candidate; the attack file is first committed in `7a8afb5f`, after the freeze.

## Findings

- **M1 (admitted).** Rounds 87, 88 and 89 each froze a scorer that handed the candidate fixture identity in a path. The three forms differ (87: arm name `random-fixture`; 88: arm-named directories under a round-constant root `probe88`, plus a construction gated on that root reaching 20/20; 89: `<arm>-<nonce>`). The "one form" wording was rejected in the lesson's Gate.
- **M1 capture.** Q82 was written after the round-89 failure, not before it. A pre-data name-keyed control would have been the pre-freeze catch [INFERENCE]: round 87 had one (`controls/path-keyed.txt`, 3/12), and the round-89 pre-data table has no keyed row.
- **M2 (admitted).** Invisible-prefix duplicates were never armed in round 89; the bypass was found by the sentinel after the freeze. The round-90 probe arms them (A36–A43).
- **Residual in the frozen round-90 probe (Hold, routed to K90ExecAudit).** The probe header claims no scenario word in any candidate-visible path. The observer shows the candidate is handed `absent-<nonce>.mjs` and `absent-<nonce>-dir`, `fresh-<nonce>.mjs`, `other-<nonce>.mjs`, `ext-`/`ext2-`/`ex-` names, `lk-<hex>`, `sp-<nonce>.mjs`, and `an-<hex>` directories. The effect on the score is not measured; the probe is frozen and was not edited.
- **Q83 gap in the frozen probe (Hold).** Positive single-prefix twins exist for U+200B and U+00A0 only. U+FEFF, U+200C, U+200D and U+200E have duplicate arms but no positive twin.
- **Set gap (Hold).** U+200F (RLM) is `Cf` and is outside the v4 six-member set; no arm covers it.
- **Sources.** `.ufo/waves/round-90/K90ScribeSources/` was empty when this seat wrote. The knowledge entry cites S258 (existing, BOM only) and the two UCD captures by URL and sha256, with no S-id assigned. Assigning S-ids is the scribe-sources seat's job or the L1's.

## Blockers and limits

- No blocker for the three drafts.
- The `## Gate` spot-check line is the required placeholder, `spot-check: to be recorded by the non-author verifier`.
- The UCD captures need S-ids before the knowledge entry can be admitted under Q2 (see the Gate bullet).
- The observer result shows the residual tokens exist. It does not show a score change; that stays [INFERENCE] until K90ExecAudit measures it.

## Tools

No tool was installed or upgraded. `node`, `git`, `curl`, `sha256sum` were already on the host. The UCD files were fetched with `curl` over HTTPS from unicode.org.

## Scratch

`/fast/scratch/hyaku/kumitate-r90/K90ScribeLesson/` (observer log, base-v3 blob, probe work dir) is removed before yield; every cited file is copied into the seat directory.
