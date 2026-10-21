FIDELITY scripts/charter-scribe/config.json anchors=8 ok=4 moved=4 changed=0 gone=0

# Anchor re-verification — `scripts/charter-scribe/config.json`

Read-only scout. Notes judged: `corpus/knowledge/remaining-scripts-census.md`
(line 423 heading, line 425 member section, line 429 prompt-section anchor,
line 99 inventory row). Source read only via `/fast/scratch/kumitate-r35/src`.

## Anchors counted (n=8)

- `:423` `## \`scripts/charter-scribe/config.json\`` (member-section heading)
- `notes:425` explicit `scripts/charter-scribe/config.json:2`, continuation `:8`, `:11`, `:16`, `:23`, `:24`
- `notes:429` explicit `scripts/charter-scribe/config.json:21` (prompt section cites this member)

Statuses: heading ok; `:2` ok; `:8` moved; `:11` moved; `:16` moved;
`:21` moved; `:23` ok; `:24` ok.

## Non-ok anchor rows

note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 (file:line) | proposed replacement wording
--- | --- | --- | --- | --- | ---
notes:425 | `:8` | `grokWeb` block / `cdpPort` `mode` `waitCeilingSec` `maxPromptChars` | moved | `scripts/charter-scribe/config.json:7` (grokWeb :7-13, cdpPort :9, mode :10, waitCeilingSec :11, maxPromptChars :12) | replace `:8` by `:7` (grokWeb; cdpPort `:9`, mode `:10`, waitCeilingSec `:11`, maxPromptChars `:12`) — re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1
notes:425 | `:11` | `mode` (grokWeb arm) | moved | `scripts/charter-scribe/config.json:10` (line 11 is now `waitCeilingSec`) | replace `:11` by `:10` (mode; waitCeilingSec `:11`) — re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1
notes:425 | `:16` | `kimi` block / `chatMode` `timeoutSec` `promptTemplate` | moved | `scripts/charter-scribe/config.json:15` (kimi :15-21, chatMode :17, timeoutSec :19, promptTemplate :20) | replace `:16` by `:15` (kimi; chatMode `:17`, timeoutSec `:19`, promptTemplate `:20`) — re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1
notes:429 | `scripts/charter-scribe/config.json:21` | `promptTemplate` | moved | `scripts/charter-scribe/config.json:20` (line 21 is now `},`) | replace `...config.json:21` by `...config.json:20` — re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1

## Claim drift with no citation anchor (flagged per assignment)

note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording
--- | --- | --- | --- | --- | ---
notes:425 | none (prose "27 L") | file length 27 L | changed | file is 26 lines at 31c465f1 (`wc -l` = 26) | policy file (26 L at 31c465f1; 27 L at 964f443e), JSON, no runnable arm — re-anchored at 31c465f1
notes:99 | none (inventory row) | `L` cell 27 | changed | 26 | set the row's L cell to 26; re-censused 2026-10-14 against `964f443e`, re-anchored at 31c465f1
notes:425 | none (triple claim) | `repo`/`charterRepo`/`charterOrigin` host-specific and absolute | changed (repo key gone) | `charterRepo` :5, `repo` absent (`sync.mjs:55`, `:189`, `:613`) | `charterRepo` is relative (`../charter-ufo-fsd`) and `repo` deleted, defaulting to the checkout root (`scripts/charter-scribe/sync.mjs:55`, `:189`) — re-censused 2026-10-14 against `964f443e`, re-anchored at 31c465f1

`charterOrigin` (:6) is unchanged and still the canonical SSH URL; it was never a
host filesystem path. The remaining absolute host paths are `grokWeb.bin` (:8),
`grokWeb.launcher` (:13) and `kimi.bridge` (:16) — the file is still partly
machine-bound, but the cited `repo`/`charterRepo` pair no longer is.

## Observed facts (upstream, pinned clone)

- Diff `964f443e..31c465f1 -- scripts/charter-scribe/config.json`: `1 file changed,
  1 insertion(+), 2 deletions(-)`; commit `2a04baf "self-refine: delete PrimeAgent
  ledger stack; fix charter-scribe paths, telemetry, unit"`.
- Base (964f443e) 27 lines: `:3 "repo": "/home/vgpnk/Projects/origin-work/ufo-fsd-alpha"`,
  `:6 "charterRepo": "/home/vgpnk/Projects/origin-work/charter-ufo-fsd"`.
- Pin (31c465f1) 26 lines: `repo` key deleted; `:5 "charterRepo": "../charter-ufo-fsd"`;
  every value the note names is byte-identical to base (worker, sinceHours 8,
  maxCommits 12, cdpPort 9222, mode Expert, waitCeilingSec 240, maxPromptChars 4000,
  chatMode kimi-instant-high, timeoutSec 120, maxEntryHtmlBytes 6000, maxSubjectChars 160).
- Pin `sync.mjs`: `CHECKOUT_ROOT = resolve(SCRIPT_DIR, "../..")` (`:55`),
  `resolveBeatPaths` (`:188`) resolves `cfg.repo` (optional) against CHECKOUT_ROOT and
  `cfg.charterRepo` against `repo`; `runBeat` validates both worktrees before collect
  (`:613-618`). So `../charter-ufo-fsd` is intentional, resolved relative to the checkout.
- Reader claim "read only by `scripts/charter-scribe/sync.mjs`" still holds:
  repo-wide `git grep 31c465f1 'charter-scribe/config'` finds no other reader;
  `loadConfig` default is `join(SCRIPT_DIR, "config.json")` (`sync.mjs:160`).
- `:23`/`:24` land exactly on `maxEntryHtmlBytes`/`maxSubjectChars` at the pin. At base
  the pair was `limits` (:23) and `maxEntryHtmlBytes` (:24), i.e. the note's pairing was
  latent off-by-one; the pin's line deletion corrected it.

## Mechanical cross-check (informational)

`node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --symbols --json`,
filtered to this member:

```
L425 OK :2  ... (26 lines)
L425 OK :11 ... (26 lines)
L425 OK :16 ... (26 lines)
L425 OK :23 ... (26 lines)
L425 OK :24 ... (26 lines)
L425 OK :8  ... (26 lines)
L425 SYMBOL_OFF_LINE :8 maxPromptChars not on ...:8 — occurs at line(s) 12
L429 OK :21 ... (26 lines)
L429 SYMBOL_OFF_LINE :21 promptTemplate not on ...:21 — occurs at line(s) 20
```

Same run against a read-only `git archive 964f443e` mirror showed `:8` already
`SYMBOL_OFF_LINE` at base (`maxPromptChars` at 13) and `:21` OK at base. Therefore:
`:21` is a pin-introduced break; `:8` is a pre-existing note defect that the pin also
preserves. The checker does not symbol-check `:11`, `:16`, `:23`, `:24` (continuation
refs with no adjacent identifier), which is why the semantic moves at `:11`/`:16` are
invisible to it.

## Commands run

```
git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/charter-scribe/config.json
git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/charter-scribe/config.json | cat -n
git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/charter-scribe/config.json | cat -n
git -C /fast/scratch/kumitate-r35/src grep -n "charterRepo|charterOrigin|\"repo\"|config.json" 31c465f1 -- scripts/charter-scribe
git -C /fast/scratch/kumitate-r35/src grep -n "charter-scribe/config" 31c465f1 -- .
node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --symbols --json
```

No tool installed or upgraded. No note file edited. The base-revision mirror for the
symbol cross-check was a read-only `git archive 964f443e` export under /tmp, removed
after use; the pinned clone was never checked out, reset, fetched or edited.

## Confidence / remaining unknowns

- Confidence: high on line numbers and diff shape (direct pinned reads); high on
  reader claim (repo-wide grep); the relative-`charterRepo` semantics are read from
  `sync.mjs` source, not executed — [INFERENCE] that the beat resolves
  `../charter-ufo-fsd` to `<checkout>/../charter-ufo-fsd` at runtime.
- Unknown: whether the note's later re-census intends to restate all four moved
  anchors or only the machine-checked two; the four rows above cover both.
