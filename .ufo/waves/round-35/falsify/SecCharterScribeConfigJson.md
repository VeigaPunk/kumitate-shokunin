ATTACK scripts/charter-scribe/config.json verdict=holds defects=0

Target: `## \`scripts/charter-scribe/config.json\`` at
`corpus/knowledge/remaining-scripts-census.md:461` (body `:463`), population-table
row `:122`, and the cross-citation `config.json:20` in the prompt section `:467`.
Source read only via `/fast/scratch/kumitate-r35/src` (HEAD `31c465f1`).

## Anchor audit — every anchor in the section (n=17), all hold at the pin

Line content read with
`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/charter-scribe/config.json | sed -n 'Np'`.

| anchor | cited symbol/claim | pin line (verbatim, trimmed) | verdict |
|---|---|---|---|
| `:2` | `worker` = `"charter-scribe"` | `"worker": "charter-scribe",` | ok |
| `:7` | `grokWeb` block | `"grokWeb": {` | ok |
| `:9` | `cdpPort` | `"cdpPort": 9222,` | ok |
| `:10` | `mode` | `"mode": "Expert",` | ok |
| `:11` | `waitCeilingSec` | `"waitCeilingSec": 240,` | ok |
| `:12` | `maxPromptChars` | `"maxPromptChars": 4000,` | ok |
| `:15` | `kimi` block | `"kimi": {` | ok |
| `:17` | `chatMode` | `"chatMode": "kimi-instant-high",` | ok |
| `:19` | `timeoutSec` | `"timeoutSec": 120,` | ok |
| `:20` | `promptTemplate` | `"promptTemplate": "prompts/kimi-update.prompt.txt"` | ok |
| `:22` | `limits` block | `"limits": {` | ok |
| `:23` | `maxEntryHtmlBytes` | `"maxEntryHtmlBytes": 6000,` | ok |
| `:24` | `maxSubjectChars` | `"maxSubjectChars": 160` | ok |
| `:6` | `charterOrigin` SSH URL | `"charterOrigin": "git@github.com:VeigaPunk/charter-ufo-fsd.git",` | ok |
| `:8` | `grokWeb.bin` absolute | `"bin": "/home/vgpnk/.local/bin/grok-web",` | ok |
| `:13` | `grokWeb.launcher` absolute | `"launcher": "/home/vgpnk/Projects/the-musketeer/scripts/musketeer-chrome"` | ok |
| `:16` | `kimi.bridge` absolute | `"bridge": "/home/vgpnk/.local/bin/kimiraikkoner",` | ok |

Cross-citation in the prompt section: `config.json:20` → `promptTemplate` ok
(`cite-check`: `promptTemplate present on scripts/charter-scribe/config.json:20`).
No absolute path is missed: python key dump shows the only remaining host paths are
exactly the three cited ones; `charterRepo` is `../charter-ufo-fsd`; `repo` is absent
(`has repo key: False`).

## Population row and line count

`corpus/knowledge/remaining-scripts-census.md:122`:
`| \`scripts/charter-scribe/config.json\` | 26 | asset |`.

```
$ git show 31c465f1:scripts/charter-scribe/config.json | wc -l
26
$ git show 964f443e:scripts/charter-scribe/config.json | wc -l
27
$ git ls-tree 31c465f1 scripts/charter-scribe/config.json
100644 blob 10f32328c5e1cba8063ea4f2115d581ae7a619d3	scripts/charter-scribe/config.json
```

Class `asset` matches the note's own rule (`config.json` → asset); mode 100644 and
line 1 `{` support "JSON, no runnable arm"; `json.load` on the pin file succeeds.

## Revision trace (original value kept, removed clause traced)

`git -C ... diff 964f443e 31c465f1 -- scripts/charter-scribe/config.json` →
`1 file changed, 1 insertion(+), 2 deletions(-)` (commit `2a04baf`, "…fix
charter-scribe paths, telemetry, unit"): `repo` key deleted; `charterRepo`
made relative. Word-diff of master `:425` vs current `:463` shows the case is
handled as ExecS8Fidelity declared. The section never carried a dated revision
label beyond the bare count `27 L`, so nothing was dropped; the old size is
retained with its revision as `was 27 @ 964f443e`, and the falsified clause ("`repo`/`charterRepo`/`charterOrigin`
triple is host-specific and absolute") is replaced by the corrected, traceable
statement (`repo` absent, `charterRepo` relative, `charterOrigin` still the SSH URL,
"remaining absolute paths … remains partly machine-bound"). `sinceHours`/`maxCommits`
serve `--since`/`--max-count` (`sync.mjs:264-268`); `worker` is consumed at
`sync.mjs:639`; `grokWeb`, `kimi`, `limits` and `charterOrigin` are all read
(`sync.mjs:386,432,447,534,569-596,690,734,753`).

## Reader claim

```
$ git grep -n "config\.json" 31c465f1 -- scripts
31c465f1:scripts/charter-scribe/sync.mjs:160:function loadConfig(path = join(SCRIPT_DIR, "config.json")) {
$ git show 31c465f1:scripts/charter-scribe/sync.mjs | grep -n "loadConfig"
160:function loadConfig(path = join(SCRIPT_DIR, "config.json")) {
609:  const cfg = loadConfig();
```

`tests/charter-scribe.test.js` imports `sync.mjs` only; it contains no
`config.json` read (single hit is a comment at `:563`). "Read only by sync.mjs;
imports nothing" holds.

## Mechanical gates (read-only)

- `node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --symbols --json`:
  every finding at note lines 461/463 is `OK` (`…:2`, `:6`-`:24`, all "(26 lines)");
  no `SYMBOL_OFF_LINE` remains (wave-1's `:8` defect is fixed by the `:8`→bin /
  `:12`→maxPromptChars split).
- `node scripts/claims-check.mjs --src … --row S8`: `SECTIONS: 60`,
  `SUMMARY: errors=0 warnings=0`, `CLAIMS: MATCH`; this section reports
  `anchors: 17, live: true, symbols: 19, symbolHit: true, inFamily: true`.
- Membership reproduced from the note's own recipe:
  `layer: 88  s8: 60`, `s8 lines: 33367 total`, config row present, `26` lines.
- Member-probe (note-embedded script, run from
  `/fast/scratch/kumitate-r35/w/SecCharterScribeConfigJson/`):
  `HEADINGS: 60 MEMBERS: 60 DUPLICATE: 0` / `MEMBER_PROBE: 60/60 ok` (exit 0).

## Non-defect observation (not counted; optional hardening)

Line 463 carries no `re-anchored at 31c465f1 (round 35)` trailer, unlike 34 other
sections, and its only revision reference is `964f443e` — where 16 of the 17
anchors resolve to a different key (`:7`=charterOrigin, `:9`=bin, `:10`=cdpPort,
`:11`=mode, `:12`=waitCeilingSec, `:15`=`},`, `:17`=bridge, `:19`=enabled,
`:20`=timeoutSec, `:22`=`},`, `:23`=limits, `:24`=maxEntryHtmlBytes, `:6`=charterRepo,
`:8`=grokWeb, `:13`=maxPromptChars, `:16`=kimi; only `:2` also holds at base).
Nothing false is asserted today (the note-wide pin at `:33-35` governs, and
`was 27 @ 964f443e` correctly scopes the old count), so it is not a defect.
Minimal hardening if desired: append `re-anchored at 31c465f1 (round 35)` to `:463`.

## Residual unknowns

- [INFERENCE] Relative `charterRepo` resolution is read from `sync.mjs:188-193` + the F12 test, not executed on a live charter checkout.
- [INFERENCE] `charter-scribe` is a timer-fired oneshot, not a long-running daemon; "daemon's policy file" is inherited wording from master, unchanged by round 35.

No tools installed or upgraded; no lane tree, source clone, or host state written.
Scratch used only under `/fast/scratch/kumitate-r35/w/SecCharterScribeConfigJson/`.
