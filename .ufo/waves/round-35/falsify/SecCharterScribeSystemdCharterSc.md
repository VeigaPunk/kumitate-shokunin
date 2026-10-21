ATTACK scripts/charter-scribe/systemd/charter-scribe.service#census-section verdict=partial defects=3

Target: `## `scripts/charter-scribe/systemd/charter-scribe.service`` — integrated note
lines 473-475 (heading 473, body 475), population row 125; base master heading 435,
body 437. Pin verified: `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` ->
`31c465f15669f744848bd9f5d56191c5085670f7`. Every source read went through that clone;
lane tree untouched; no git mutation; no tools installed.

## What holds (measured)

Anchors — all 9 cited lines plus the heading resolve to the named directive at
31c465f1 (`git -C … show 31c465f1:<path> | cat -n`, byte-checked with `cat -A`):
  :5 `Type=oneshot` | :6 `TimeoutStartSec=1200` | :7 `Nice=10` |
  :8 `NoNewPrivileges=true` |
  :9 `Environment=PATH=/home/vgpnk/.local/share/fnm/aliases/default/bin:…` |
  :10 `WorkingDirectory=%h/Projects/ufo-fsd-alpha` |
  :11 `ExecStart=/usr/bin/env node %h/Projects/ufo-fsd-alpha/scripts/charter-scribe/sync.mjs` |
  :13 `[Install]` | :14 `WantedBy=default.target`.
Anchor count in the integrated section: 9 (2 full-path `scripts/…:N`, 7 bare `:N`).
`scripts/claims-check.mjs:375` binds bare `:N` to the section's own file, so the form
change (master had 6 full-path + 3 bare) costs no coverage. Gate re-run:
`node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src` ->
`SUMMARY: errors=0 warnings=6` and `CLAIMS: MATCH (rows=19 yes=19 notes=27
sections=175 adv=6)`, exit 0; no finding for S8 or this member.

Table row — note:125 `| `scripts/charter-scribe/systemd/charter-scribe.service` | 14 |
asset |`: `git … show 31c465f1:<path> | wc -l` -> `14` (trailing newline present:
`tail -c 1 | od -An -c` -> `\n`); base `964f443e` is also 14. Same counting convention
as adjacent rows (`config.json` wc 26 vs row 26; `land-fleet-run.mjs` wc 133 vs row
133). Class `asset` matches the note's own rule (.service). Suffix `re-anchored at
31c465f1 (round 35)` present.

File facts the section states check out at the pin: no `Restart=`/`User=`
(`grep -nE '^(Restart|User|Type|Nice|NoNewPrivileges|Environment|WorkingDirectory|ExecStart|\[)'`
-> only :5,7,8,9,10,11); timer `Unit=charter-scribe.service` (:9), `WantedBy=
timers.target` (:12); ExecStart target `scripts/charter-scribe/sync.mjs` exists
(`git cat-file -t 31c465f1:scripts/charter-scribe/sync.mjs` -> `blob`).

## Defects

D1 (new false claim, medium) `corpus/knowledge/remaining-scripts-census.md:475` —
"`WorkingDirectory=` (`:10`) remains the checked-out tree." The cited value changed
in the base->pin diff: `git -C … diff 964f443e 31c465f1 -- <path>` ->
`-WorkingDirectory=/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` /
`+WorkingDirectory=%h/Projects/ufo-fsd-alpha`. The configured path text changed
(`origin-work/ufo-fsd-alpha` -> `Projects/ufo-fsd-alpha`; whether the new path is a
symlink back to the old tree is unobserved), so "remains" asserts an unchanged value
the diff contradicts. `%h` is also manager-dependent: `man systemd.unit` — "%h … home
directory of the user running the service manager instance. In case of the system
manager this resolves to \"/root\"." The section never says user unit (its only
"user" is the `User=` in the last clause), while the sibling timer section at :479
says "*user* timer unit". Under the system manager `%h` is `/root`, so the claim
fails unless `/root/Projects/ufo-fsd-alpha` exists (unobserved).
Minimal fix: "`WorkingDirectory=` (`:10`) is `%h/Projects/ufo-fsd-alpha` —
`/home/vgpnk/Projects/ufo-fsd-alpha` under the user manager; under the system manager
`%h` is `/root`, not the checkout."

D2 (provenance gap, medium) `…census.md:475` — removed clauses leave no trace. Master
claimed ExecStart "names an absolute node binary"; at the pin it is `/usr/bin/env
node` (`diff` hunk `@@ -7,8 +7,8 @@`: `-ExecStart=/home/vgpnk/.local/share/fnm/
aliases/default/bin/node …` / `+ExecStart=/usr/bin/env node …`). The rewritten
sentence asserts only the new state plus the generic suffix; no `@ 964f443e` and no
`(round 35: …)` marker, while the note uses 44 "(round 35: removed …)" traces and 11
"was N @ 964f443e" markers elsewhere (e.g. :463 "(26 L; was 27 @ 964f443e…)", :596).
The convention is not universal (`fleet-ledger-rotate` :555 also lacks one), so this
is a provenance gap, not a claim refutation. There was no original revision label in
master for this member (master 435-437 carry none), so none was dropped; but the
964f443e state is now untraceable from the note.
Minimal fix: append "(was the absolute fnm node binary and `/home/vgpnk/Projects/
origin-work/ufo-fsd-alpha` @ 964f443e)".

D3 (false clause, low; carried from master) `…census.md:475` — "(`Nice=10` at `:7` is
the only other service key)". `[Service]` carries six other keys: `Environment` :9,
`WorkingDirectory` :10, `ExecStart` :11 (all enumerated by this same sentence) plus
`Type` :5, `TimeoutStartSec` :6, `NoNewPrivileges` :8. Wave-1
`FidSystemdCharterScribeService.md` marks :7 "ok — line 7 identical" without judging
the clause.
Minimal fix: delete the parenthetical or change "service key" to "non-wiring knob".

## Advisory (not counted)

A1 `…census.md:475` — "Activation comes from the sibling charter-scribe.timer:
`[Install]` (`:13`) declares only `WantedBy=default.target` (`:14`)." The timer claim
is true (timer:9), but the colon makes the unit's own `WantedBy=default.target` read
as inert; enabling the service directly installs a `default.target.wants` symlink and
starts it at boot [INFERENCE: systemd enable semantics]. Master's stronger false
clause ("rather than from anything in this unit") is gone; this is the residue.
Fix: "Scheduled by the sibling timer (`Unit=charter-scribe.service` at timer:9); the
unit's own `WantedBy=default.target` would also start it at boot if enabled directly."

## [INFERENCE] / unobserved

- Actual `%h` expansion and whether `/home/vgpnk/Projects/ufo-fsd-alpha` exists: not
  stat'ed (lane contract forbids using that path). If it is absent, the unit fails at
  start under either manager, which the note does not mention.
- No charter-scribe unit is installed on this host, so manager mode cannot be read
  off it: `systemctl --user list-unit-files 'charter-scribe*'` and
  `systemctl list-unit-files 'charter-scribe*'` both -> `0 unit files listed`;
  `/home/vgpnk/.config/systemd/user/charter-scribe.{service,timer}` and
  `/etc/systemd/system/charter-scribe.service` -> ENOENT.
- No `systemd-analyze verify` run (this section makes no such claim).

## Wave-1 report note

`FidSystemdCharterScribeService.md` cites note:435/437 — pre-integration line
numbers; the integrated note has heading 473 and body 475 (row 102 -> 125). Its
`anchors=10 ok=9 changed=1` verdict is reproduced here, and its proposed `:11`
wording ("runs `/usr/bin/env node` … resolved through the pinned PATH") is accurate
at the pin. The `:10` and `:7` misses above are the falsify delta; the section's
C2 anchor count for this member is honest (9/9), so this member does not move
`S=88/88`.
