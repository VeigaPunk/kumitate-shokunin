FIDELITY scripts/charter-scribe/systemd/charter-scribe.service anchors=10 ok=9 moved=0 changed=1 gone=0

# C2 anchor-fidelity — charter-scribe.service

Note file: `corpus/knowledge/remaining-scripts-census.md` (the only corpus note citing this member; `grep -rln charter-scribe.service corpus/` → this file only).
Pin: `964f443e` (base) → `31c465f1` (upstream HEAD), read solely via `git -C /fast/scratch/kumitate-r35/src`.
Anchor count = 9 distinct cited lines (`:5`, `:6`, `:8`, `:7`, `:11`, `:10`, `:9`, `:13`, `:14`) + 1 member-section heading (`corpus/knowledge/remaining-scripts-census.md:435`) = 10. No `:N-M` range anchors exist. The census table row `corpus/knowledge/remaining-scripts-census.md:102` (`… | 14 | asset |`) is a member row, checked separately (below), not counted as an anchor.

## Anchor inventory (all 10)

| note:line | anchor | claim at cited line | 31c465f1 verdict |
|---|---|---|---|
| 435 | `## scripts/charter-scribe/systemd/charter-scribe.service` | member exists as section | ok (file present, 14 lines) |
| 437 | `…:5` `Type=oneshot` | oneshot is the runtime shape | ok (line 5 identical) |
| 437 | `…:6` `TimeoutStartSec=1200` | bounds one beat at 1200 s | ok (line 6 identical) |
| 437 | `…:8` `NoNewPrivileges=true` | hardening flag | ok (line 8 identical) |
| 437 | `:7` `Nice=10` | only other service key | ok (line 7 identical) |
| 437 | `:11` `ExecStart=` | names an absolute node binary followed by sibling `scripts/charter-scribe/sync.mjs` | **changed** — `ExecStart=/usr/bin/env node %h/Projects/ufo-fsd-alpha/scripts/charter-scribe/sync.mjs`; no absolute node binary anymore |
| 437 | `…:10` `WorkingDirectory=` | set to the checked-out tree | ok (`%h/Projects/ufo-fsd-alpha` is still the checkout root; value text relocated, see deltas) |
| 437 | `…:9` `Environment=PATH=` | pins PATH so child never inherits caller's | ok (line 9 byte-identical) |
| 437 | `:13` `[Install]` | single `[Install]` header | ok (line 13 identical) |
| 437 | `…:14` `WantedBy=default.target` | only install directive | ok (line 14 identical) |

## Non-ok anchor rows

note:437 | `:11` (bare continuation anchor) | `ExecStart=` "names an absolute node binary followed by the sibling `scripts/charter-scribe/sync.mjs`" | changed | `scripts/charter-scribe/systemd/charter-scribe.service:11` | `ExecStart=` (`:11`) runs `/usr/bin/env node` with node resolved through the pinned PATH, then the sibling `%h/Projects/ufo-fsd-alpha/scripts/charter-scribe/sync.mjs`; re-anchored at 31c465f1 from `964f443e`.

## Described behavior removed/changed by the diff (flag even where the line survives)

- `scripts/charter-scribe/systemd/charter-scribe.service:10` — value moved `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` → `%h/Projects/ufo-fsd-alpha`. Claim "set to the checked-out tree" still true, so :10 stays ok, but the unit no longer points at `origin-work`. `%h` is the systemd user-home specifier; under the user manager that is `/home/vgpnk` [INFERENCE], making the effective path `/home/vgpnk/Projects/ufo-fsd-alpha`.
- `:11` — node resolution changed from the absolute fnm binary `/home/vgpnk/.local/share/fnm/aliases/default/bin/node` to a PATH lookup via `/usr/bin/env node`. Node is now resolved *solely* by the PATH pinned at `:9`; `/usr/bin/env` exists (mode 0755, root, 68312 B) and the first PATH entry's `node` exists (`/home/vgpnk/.local/share/fnm/aliases/default/bin/node`, 126595440 B, 2026-09-07), while `/usr/bin/node` is absent on this host (`ls` ENOENT). A stripped/unreadable PATH would now fail the unit at exec (203/EXEC) where the absolute path previously could not [INFERENCE: systemd failure code].
- No other described behavior regressed: the file still declares no `Restart=` and no `User=`, so the note's "must not assume restart-on-failure or a privilege drop" holds (`grep -nE 'Restart=|User=|Environment=|WorkingDirectory=|ExecStart='` at 31c465f1 returned only lines 9, 10, 11).

## Commands run and observed output (condensed)

- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/charter-scribe/systemd/charter-scribe.service` → single hunk `@@ -7,8 +7,8 @@`; only lines 10–11 change (`-2/+2`), everything else identical.
- `git show <rev>:…service | nl -ba` for both revs → 14 lines each; line-for-line identical except 10 (`WorkingDirectory=…`) and 11 (`ExecStart=…`).
- `wc -l` on both blobs → `14` and `14`, so the census row at `corpus/knowledge/remaining-scripts-census.md:102` ("14") is accurate at 31c465f1.
- `git show 31c465f1:…charter-scribe.timer | nl -ba` → `Unit=charter-scribe.service` at line 9, so the note's sibling-timer activation claim holds. `git grep -n charter-scribe.service 31c465f1` → only `scripts/charter-scribe/systemd/charter-scribe.timer:9` references the unit.
- `git log --oneline 964f443e..31c465f1 -- <path>` → `2a04baf self-refine: delete PrimeAgent ledger stack; fix charter-scribe paths, telemetry, unit` (cherry-picked from `98e04a29`), `--stat` = 1 file, +2/−2.
- `git cat-file -t 31c465f1:scripts/charter-scribe/sync.mjs` → `blob` (ExecStart target still exists).
- `grep -o 'charter-scribe\.service:[0-9-]*'` on the note → 6 full-path anchors (5, 6, 8, 9, 10, 14); `sed -n '437p' | grep -o '`:[0-9-]*`'` → 3 continuation anchors (7, 11, 13). Union = 9; no duplicates, no ranges.
- `ls -l /home/vgpnk/.local/share/fnm/aliases/default/bin/node /usr/bin/env /usr/bin/node` → node and env present, `/usr/bin/node` absent (see above).

## Scope / limits

- Read-only: notes not edited; no production lane files, jj state, Git index, `~/.kimi-code`, or `~/.omp` touched. No subagent dispatch. No packages/tools installed (none needed).
- Not exercised: `systemd-analyze verify` on the re-pinned unit and live `%h` expansion (not assigned; the sibling timer note owns the verify claim). `systemd-analyze verify` result for this unit is therefore [INFERENCE]-free but unobserved.
- C2 impact: this member's anchor set survives at 88/88 with one wording fix (`:11`); zero anchors deleted or moved, so no coverage loss for this member.
