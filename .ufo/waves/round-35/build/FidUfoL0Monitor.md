FIDELITY scripts/ufo-l0-monitor.mjs anchors=73 ok=21 moved=50 changed=2 gone=0

# Fidelity re-verification — `scripts/ufo-l0-monitor.mjs` at 31c465f1

Source: private read-only clone `/fast/scratch/kumitate-r35/src` (detached 31c465f1; base 964f443e).
Notes: `corpus/knowledge/ops-watchers.md` §82–177 (member section), `corpus/knowledge/remaining-scripts-census.md`.
Diff measured: 25 insertions, 8 deletions, 1638 → 1655 lines.

## Anchor census (mechanical)

- 88 `:N` tokens in the member section; 15 cite sibling files and were excluded (ops-watchers.md:122 `:5743` dispatcher, :124 `:220` queue lib, :125 `:16-18` watchdog, :164 `:85` watch, :165 `:487`,`:489`,`:1399`, :166 `:1400`,`:1436`,`:1490`, :167 `:1358` — all inherited watch; :168 `:16-18`, :169 `:821` watchdog; :169 `:181-182`, :171 `:23-25` night-watchdog). **73 anchors cite this member.**
- 21 anchors are unmoved at 31c465f1 (all cite lines ≤378, before the first insertion hunk): ops-watchers.md:89 `:2,:11,:12,:13,:126,:133`; :90 `:17,:18-19`; :101 `:22,:23`; :102 `:374-378`; :121 `:226-232,:231`; :133 `:115`; :146 `:69-81`; :153 `:64,:102`; :159 `:56,:94`; :161 `:43-48`; :172 `:106`.
- 50 anchors are displaced by +1..+17 lines (diff-located below); 2 anchors carry behavior the diff changed.
- Census note contributes **0** anchors into this member: `remaining-scripts-census.md:53` is membership listing only (S1–S7 live population), and :715 references the module's policy surface without a `scripts/ufo-l0-monitor.mjs:N` anchor.

## Behavior changes the diff made (even where the line still exists)

1. `repend` skip set: old :802 `if (!task || TERMINAL.has(task.state)) continue;` → new :817 adds `|| task.state !== "blocked" || !inScope(task)`. Only BLOCKED, in-scope rows are now rependable; `launching` rows inside the double-launch window and foreign-fleet rows are skipped.
2. `sweepRependPending`: new signature at :625 (`inScopeFn = null`) and new early-carry at :631–638 — out-of-scope journal debt is carried untouched instead of aging toward gave-up; call site :1530 passes `inScope`.
3. Comment-only edits (:385-386, :496-497, :1031-1032, :1243-1244) now claim the shipped suite pins these helpers — verified true: `scripts/ufo-l0-monitor.test.mjs:35-36` destructures `diagnose, findStalled, forgeSuccessor, mergeRependPending, rependReportOk, settle, sweepRependPending` from the module at both revisions.
4. `sep` dropped from the `node:path` import (:34); at 964f443e `sep` occurred only on that import line (`grep -n '\bsep\b'`), so this is dead-import cleanup, not behavior.

## Non-ok anchors (52)

`note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording`

ops-watchers.md:86 | `:1305` | `isMain` gate (`isMainModule`) | moved | `scripts/ufo-l0-monitor.mjs:1322` | "`isMain` gate `isMainModule(import.meta.url)` at :1322 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:86 | `:1308` | argv walk `process.argv.slice(2)` | moved | `scripts/ufo-l0-monitor.mjs:1325` | "argv walk at :1325 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:93 | `:1316` | `FLAG_ARGS` five flags | moved | `scripts/ufo-l0-monitor.mjs:1333` | "`FLAG_ARGS` at :1333 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:94 | `:1317` | `VALUE_ARGS` | moved | `scripts/ufo-l0-monitor.mjs:1334` | "`VALUE_ARGS` at :1334 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:95 | `:1321` | `parseDeclaredArgv` walk | moved | `scripts/ufo-l0-monitor.mjs:1338` | "`parseDeclaredArgv` at :1338 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:96 | `:1377-1379` | usage faults before any queue read | moved | `scripts/ufo-l0-monitor.mjs:1394-1396` | "refusal before queue read at :1394-1396 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:96 | `:1375` | refusal exits 64 | moved | `scripts/ufo-l0-monitor.mjs:1392` | "usage faults set exit 64 at :1392 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:97 | `:1329-1343` | `--fleet` rejects empty/dash-leading | moved | `scripts/ufo-l0-monitor.mjs:1346-1360` | "`--fleet` validation at :1346-1360 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:98 | `:1347-1362` | `--match` compiled with `u` | moved | `scripts/ufo-l0-monitor.mjs:1364-1379` | "`--match` compile at :1364-1379 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:99 | `:1359` | `--stale-after-min` default 10 | moved | `scripts/ufo-l0-monitor.mjs:1376` | "default 10 at :1376 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:99 | `:1360-1361` | finite and > 0 | moved | `scripts/ufo-l0-monitor.mjs:1377-1378` | "finite/>0 check at :1377-1378 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:99 | `:1366` | bare `--repend` refused | moved | `scripts/ufo-l0-monitor.mjs:1383` | "bare `--repend` refusal at :1383 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:100 | `:1367` | `--repend requires --repair` string | moved | `scripts/ufo-l0-monitor.mjs:1384` | "refusal string at :1384 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:105 | `:1409` | `healing` = rebind‖settle‖repair | moved | `scripts/ufo-l0-monitor.mjs:1426` | "`healing` OR at :1426 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:106 | `:1402-1408` | one lock/read per pass; per-step publish | moved | `scripts/ufo-l0-monitor.mjs:1419-1425` | "one-lock pass at :1419-1425 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:110 | `:920-984` | `rebind` span | moved | `scripts/ufo-l0-monitor.mjs:935-999` | "`rebind` at :935-999 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:111 | `:639-774` | `repair` span | moved | `scripts/ufo-l0-monitor.mjs:649-784` | "`repair` at :649-784 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:112 | `:1017-1091` | `settle` span | moved | `scripts/ufo-l0-monitor.mjs:1033-1107` | "`settle` at :1033-1107 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:113 | `:794-819` | `--repend` skips `!task \|\| TERMINAL.has(task.state)`; exits 0 + `repended === true` | changed | `scripts/ufo-l0-monitor.mjs:804-834` (skip condition :817) | "`!task \|\| TERMINAL.has(task.state) \|\| task.state !== "blocked" \|\| !inScope(task)`; success needs exit 0 and `repended === true` (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:113 | `:776-791` | `rependReportOk` classification | moved | `scripts/ufo-l0-monitor.mjs:786-801` | "`rependReportOk` at :786-801 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:115 | `:1421-1431` | `--repair` entails `--settle` | moved | `scripts/ufo-l0-monitor.mjs:1438-1448` | "repair-entails-settle at :1438-1448 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:117 | `:1443-1459` | journal before queue publish | moved | `scripts/ufo-l0-monitor.mjs:1460-1476` | "journal-before-publish at :1460-1476 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:117 | `:1462-1467` | `forgeSuccessor` torn-receipt mint | moved | `scripts/ufo-l0-monitor.mjs:1479-1484` | "`forgeSuccessor` at :1479-1484 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:121 | `:1419` | rebind `writeQueue` | moved | `scripts/ufo-l0-monitor.mjs:1436` | "rebind publish at :1436 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:121 | `:1431` | settle `writeQueue` | moved | `scripts/ufo-l0-monitor.mjs:1448` | "settle publish at :1448 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:121 | `:1459` | repair `writeQueue` | moved | `scripts/ufo-l0-monitor.mjs:1476` | "repair publish at :1476 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:121 | `:1467` | forged `writeQueue` | moved | `scripts/ufo-l0-monitor.mjs:1484` | "forged publish at :1484 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:130 | `:1281` | stall rule `scan.error !== null \|\| idleMs >= staleAfterMs` | moved | `scripts/ufo-l0-monitor.mjs:1298` | "stall gate at :1298 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:130 | `:1359` | default 10 min | moved | `scripts/ufo-l0-monitor.mjs:1376` | "default 10 at :1376 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:131 | `:511` | `MAX_REPEND_ATTEMPTS = 3` | moved | `scripts/ufo-l0-monitor.mjs:513` | "cap constant at :513 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:131 | `:623` | reap-gave-up: debt dropped with named gave-up past cap | changed | `scripts/ufo-l0-monitor.mjs:625-646` | "`sweepRependPending` drops debt with a named gave-up past `MAX_REPEND_ATTEMPTS = 3`, carrying out-of-scope rows untouched (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:132 | `:806` | `timeout: 60_000` | moved | `scripts/ufo-l0-monitor.mjs:821` | "repend child timeout at :821 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:132 | `:812` | `maxBuffer: 8 * 1024 * 1024` | moved | `scripts/ufo-l0-monitor.mjs:827` | "stdout bound at :827 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:134 | `:855` | `MAX_LOG_BYTES = MAX_EVIDENCE_LOG_BYTES` | moved | `scripts/ufo-l0-monitor.mjs:870` | "log cap at :870 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:135 | `:1127-1128` | successor mint round guard | moved | `scripts/ufo-l0-monitor.mjs:1143-1144` | "mint guard at :1143-1144 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:138 | `:1017` | `settle()` | moved | `scripts/ufo-l0-monitor.mjs:1033` | "`settle` entry at :1033 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:139 | `:1022` | only `acceptance_evidence_missing` | moved | `scripts/ufo-l0-monitor.mjs:1038` | "blocker filter at :1038 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:140 | `:1040-1057` | expected bag + `sha256File` | moved | `scripts/ufo-l0-monitor.mjs:1056-1073` | "receipt bag at :1056-1073 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:142 | `:1041-1056` | config-null dispatch-snapshot binding | moved | `scripts/ufo-l0-monitor.mjs:1057-1072` | "config-null binding at :1057-1072 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:143 | `:1062-1082` | receipt decision recorded | moved | `scripts/ufo-l0-monitor.mjs:1078-1098` | "decision record at :1078-1098 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:147 | `:867-882` | `writeState` | moved | `scripts/ufo-l0-monitor.mjs:882-897` | "`writeState` at :882-897 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:149 | `:864` | `appendLog` → `appendStampedLog` | moved | `scripts/ufo-l0-monitor.mjs:879` | "`appendLog` at :879 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:150 | `:1526-1548` | log line kinds, in order | moved | `scripts/ufo-l0-monitor.mjs:1543-1565` | "log-kind block at :1543-1565 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:150 | `:510` | `REPEND_PENDING_SCHEMA` | moved | `scripts/ufo-l0-monitor.mjs:512` | "schema constant at :512 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:153 | `:1375` | usage faults exit 64 | moved | `scripts/ufo-l0-monitor.mjs:1392` | "exit 64 at :1392 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:153 | `:1636` | runtime fault exit 1 | moved | `scripts/ufo-l0-monitor.mjs:1653` | "exit 1 at :1653 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:155 | `:523-524` | `repend_pending_path_outside_root` | moved | `scripts/ufo-l0-monitor.mjs:525-526` | "refusal pair at :525-526 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:155 | `:1361` | stale-after-min refusal string | moved | `scripts/ufo-l0-monitor.mjs:1378` | "string at :1378 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:156 | `:1367` | repend-requires-repair string | moved | `scripts/ufo-l0-monitor.mjs:1384` | "string at :1384 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:160 | `:516-526` | `resolveQueuePath` / `resolveRependPendingPath` | moved | `scripts/ufo-l0-monitor.mjs:518-528` | "resolvers at :518-528 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:172 | `:803` | repend `spawnSync` | moved | `scripts/ufo-l0-monitor.mjs:818` | "spawn at :818 (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:173 | `:1407-1408` | repend stays outside the lock | moved | `scripts/ufo-l0-monitor.mjs:1424-1425` | "lock-boundary comment at :1424-1425 (daa371583; re-anchored at 31c465f1)."

## Non-anchor drift (not counted in anchors=)

ops-watchers.md:84 | `wc -lc` measurement | "1638 lines / 82265 bytes" | changed | `scripts/ufo-l0-monitor.mjs` (whole file) | "1655 lines / 83102 bytes (`wc -lc scripts/ufo-l0-monitor.mjs`); prior 1638/82265 at 964f443e (daa371583; re-anchored at 31c465f1)."
ops-watchers.md:7 | family size vector `1010 1638 1679 831 859` | monitor slot stale | changed | `scripts/ufo-l0-monitor.mjs` | "monitor slot 1655 at 31c465f1 (was 1638 at 964f443e; daa371583)."
Heading ops-watchers.md:82 `## scripts/ufo-l0-monitor.mjs` | — | member exists at 31c465f1 | ok | — | no change.

## Observed facts vs inference

- Observed: every non-ok anchor's claimed symbol exists at the mapped 31c465f1 line (verified by direct read); none is gone. `:623` now lands on a comment while the function is at :625; `:794` now lands inside `rependReportOk` (new :794) while `repend` is at :804.
- Observed: the diff's only semantic edits are the scoped sweep and the blocked+in-scope repend gate; other hunks are comments or the dead `sep` import.
- Observed: `daa371583` (the note's own label) is ABSENT from the pin clone (`git cat-file -e` → `fatal: Not a valid object name`), so the note's measured-at revision cannot be re-read here; 1638/82265 equals 964f443e exactly.
- [INFERENCE] The size vector at ops-watchers.md:7 and :84 was taken at a 964f443e-era tree despite the `daa371583` label; re-measurement is needed when the note is rewritten.
- Adjacent, out of this member's anchor scope: `remaining-scripts-census.md:715` cites `scripts/ufo-l0-monitor.test.mjs:18` for the policy import, but at both revisions :18 is `validateTaskReceipt` and the policy import is :35-36. The census claim that `sweepRependPending` is imported still holds (it remains exported).

## Commands run (all read-only)

```
git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-l0-monitor.mjs
git -C /fast/scratch/kumitate-r35/src diff -U0 964f443e 31c465f1 -- scripts/ufo-l0-monitor.mjs
git -C ... show {964f443e,31c465f1}:scripts/ufo-l0-monitor.mjs   # piped through sed/awk/grep
git -C ... show {964f443e,31c465f1}:scripts/ufo-l0-monitor.test.mjs
git -C ... show 31c465f1:scripts/ufo-l0-monitor.mjs | wc -lc      # 1655 83102 (base 1638 82265)
grep -n 'ufo-l0-monitor' corpus/knowledge/{ops-watchers,remaining-scripts-census}.md
python3 difflib anchor→line map over the two blobs (73 member anchors; 88 raw tokens − 15 sibling)
```
No tools installed or upgraded. No note files edited.
