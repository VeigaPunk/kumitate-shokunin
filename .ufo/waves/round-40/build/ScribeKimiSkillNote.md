RESULT ScribeKimiSkillNote rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=drafted heading=## `~/.kimi-code/skills/kimi-webbridge` anchors=11 source_row=S035

# ScribeKimiSkillNote — K2 note section for the seventh `skills/` child

## What I produced (scratch only; no lane file edited)

| Artifact | Path |
|---|---|
| The new `## ` section (one section, 11 `path:N` anchors) | `/fast/scratch/hyaku/kumitate-r40/seats/ScribeKimiSkillNote/section.md` |
| Append-only erratum block (2 anchors) | `/fast/scratch/hyaku/kumitate-r40/seats/ScribeKimiSkillNote/erratum.md` |
| The `SOURCES.md` row S035 (one row, 11 columns) | `/fast/scratch/hyaku/kumitate-r40/seats/ScribeKimiSkillNote/sources_row.txt` |
| Apply-clean patch for the L1 (2 files, +123 lines) | `/fast/scratch/hyaku/kumitate-r40/seats/ScribeKimiSkillNote/ScribeKimiSkillNote.patch` |
| Scratch clone used for every gate run | `/fast/scratch/hyaku/kumitate-r40/seats/ScribeKimiSkillNote/lane` (detached at `f69817e`) |

## Which file holds the per-skill sections (measured, not guessed)

`corpus/knowledge/kimi-skills-plugins.md` holds them — six `## ` sections, one per
`skills/` member, in this order: `godspeed` (:46), `reverse-engineer-anything` (:57),
`shokunin` (:75), `ufo` (:128), `wwkd` (:158), `cursor-lane` (:173).
`corpus/knowledge/kimi-lane-definitions.md` holds the `agents/secondary/` sections
instead (18 of them, :106–:174). I drafted for the former.

Heading style: the round-34 precedent (`cursor-lane`, landed in `1a8eed5`) is a
backticked **full home path**, confirmed byte-wise:

```
0000000   #   #       `   ~   /   .   k   i   m   i   -   c   o   d   e
0000020   /   s   k   i   l   l   s   /   c   u   r   s   o   r   -   l
0000040   a   n   e   `  \n
```

So the new heading is ``## `~/.kimi-code/skills/kimi-webbridge` `` — full path, not the
bare basename. This is load-bearing, not stylistic: the proxy's token normaliser strips
a leading `~/.kimi-code/` (`tok.replace(/^.*\.kimi-code\//u,'')` in
`scripts/proxy-check.mjs:838`), so the heading reduces to `skills/kimi-webbridge` and
hits the counted-child identity directly. The bare basename `kimi-webbridge` is now
owned by **two** members (`skills/kimi-webbridge` and `plugins/managed/kimi-webbridge`),
so a bare-name heading would bind to neither and raise `K_SECTION_AMBIGUOUS`.

## Facts the section states (all measured this round)

1. **Real dir, not a symlink.** `find ~/.kimi-code/skills/kimi-webbridge -type l` → 0
   links; `stat -c '%F %s %a %y inode=%i'` →
   `directory 36 755 2026-10-21 23:36:39.510359784 -0300 inode=95866022`.
2. **Frontmatter** (`SKILL.md`, 193 lines / 19437 B / mode `600`): L2 `name: kimi-webbridge`,
   L3 `description: |` (literal block), L4 the description opening, L5 `metadata:`,
   L6 `  version: "2.0.26"`, L9 the title `# Kimi Browser Extension (formerly Kimi WebBridge)`.
   Every one of these six line anchors was verified to carry its quoted symbol.
3. **File inventory — 7 files**, sizes + modes + sha256 prefixes:
   `SKILL.md` 19437/`600`/`defba946e6693fd4`; `references/operations.md` 5911/`644`/`7f60c9811cf2c875`;
   and `references/cli-creator/{companion-skill-template,go-layout,login-handling,site-exploration,workflow}.md`
   at 2511/`f17d70fc178b5070`, 4907/`89cbfb5127646ffb`, 1436/`fd6aa463dfd25fbb`,
   4389/`d7cdeb173add3dd5`, 3926/`a5bb3523cd9f5c66`.
4. **Relation to the plugin tree: different content at a different version, not a copy.**
   Plugin `SKILL.md` is 11880 B / mode `644` / sha256 `84a8e69d04c5b810…` / version
   `1.11.3`; plugin `references/operations.md` sha256 `b811d9c23dfdafa0…`. Cross-tree
   dev:inode intersection = **0**, no link count > 1. `~/.kimi-code/plugins/installed.json:5-6`
   records exactly one plugin (`"id": "kimi-webbridge"`, `"root":
   "/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge"`, `installedAt`/`updatedAt`
   `2026-10-03T21:06:32.435Z`) and **no** record of the `skills/` copy.
5. **Byte-identical in four harness roots** — `~/.claude/`, `~/.codex/`, `~/.hermes/`,
   `~/.kimi-code/` all carry `SKILL.md` sha256 `defba946e6693fd4…`, 19437 B, mode `600`;
   cross-root dev:inode overlap 0. The mechanism is the skill's own
   `references/operations.md:29` `install-skill` row (*"Installs this skill into detected
   agent runtimes"*). Marked INFERENCE.
6. **Name collision is real.** `skills/kimi-webbridge/SKILL.md:2` and
   `plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:2` both declare
   `name: kimi-webbridge`. The note's own rule (quoted at :316-320, *Project overrides
   User overrides Extra overrides Built-in*) makes the `User`-scope 2.0.26 copy win and
   the `Extra`-scope 1.11.3 plugin copy shadowed — stated as **INFERENCE, not measured**,
   because no live rendered skill listing was captured this round.

## The erratum (append-only)

`corpus/knowledge/kimi-skills-plugins.md:333-335` currently asserts *"INFERENCE, not
measured: no collision between a user skill and `kimi-webbridge` exists on this host"*.
That is now falsified by the live tree. The drafted erratum records the falsification,
keeps the precedence outcome labelled as rule-derived, and corrects the stale child
count (the Scope block's "five entries, all symlinks" at :12 and the round-34 erratum's
"six children" at :440) to the measured **seven** children — five symlinks plus two real
directories (`cursor-lane`, `kimi-webbridge`).

## The SOURCES.md row (S035)

Next free id after S034 (verified: no S035 exists in the lane or in any round-40 build
report). Kind `own-work`, **tier A** for the skill's own file, status `mined`, opened
`2026-10-22`, recheck `30d`, used-by `corpus/knowledge/kimi-skills-plugins.md`. The
`teaches` cell carries a located quote of 12 words —
*"Kimi Browser Extension（Kimi 浏览器扩展，原 Kimi WebBridge）lets AI control the user's
real browser"* — with its location (`SKILL.md:4`) in the `anchor` cell; the `source` cell
records the access time `2026-10-22 11:07 -0300` and the opening method (`find`/`stat`/
`sha256sum`, read-only).

## Gate evidence (all run in my scratch clone, never in the lane)

```
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json
K_sections computed 52  declared 51   -> K_SECTIONS_DRIFT (the L1's stanza edit closes it)
K_members   computed 52  declared 51   -> K_MEMBERS_DRIFT (the census seat re-pinned; see below)
coverage_kimi computed 10 declared 10   -> MATCH
```

At the open revision the same command read `K_members=52, K_sections=51,
coverage_kimi=9`; after my heading is added, `K_sections` goes **51 → 52** and
`coverage_kimi` **9 → 10**, i.e. the C2 `coverage:kimi-layer` axis row resolves to its
declared 10.

```
$ node scripts/sources-check.mjs --self .
SOURCES_CHECK: CLEAN (rows=35 tiers=A:34,B:1,C:0 status=queued:14,mined:19,rejected:2 entries_with_source=3 legacy=38)
```

```
$ node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --fleet /home/vgpnk/Projects/shokunin --json
base   bySeverity {note:9212, warn:465, error:510}
final  bySeverity {note:9260, warn:465, error:510}   # +48 notes, 0 new warns, 0 new errors
```

Per-file diff of `cite-check` findings on `corpus/knowledge/kimi-skills-plugins.md` and
`corpus/SOURCES.md`, before vs after my patch: **zero new errors and zero new warns**
(the two "NEW" lines the diff prints are the *same* pre-existing findings at shifted
line numbers — `references/` AMBIG and `mcp.json` UNRESOLVED, both of which already
existed in the base file at lines 312 and 448).

```
$ node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --src /fast/scratch/hyaku/kumitate-pin/src
TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af... src-rev=31c465f15669)
```

```
$ git apply --check /fast/scratch/hyaku/kumitate-r40/seats/ScribeKimiSkillNote/ScribeKimiSkillNote.patch
   (run in the live lane working tree)
APPLY-CHECK OK
```

## Out of scope for this seat (routed, not absorbed)

- **The census re-pin (6 → 7)** is `scripts/kimi-census.mjs` — the census seat's file.
  I confirmed its effect without editing it: with the sibling's re-pin in place the
  census reads `KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4)`.
- **The SCORECARD stanza** (`K_members=52`, `K_sections=52`, `coverage_kimi=10`) and the
  `## Axes` row are the L1's. The live tree already carries `K_members=52` /
  `K_sections=52` / `coverage_kimi=10` at `SCORECARD.md:298-300`, and the round-40
  `C2_total` 88 → 89 fix (the `corpus/README.md` map row for
  `lessons/round-39-verifier-spotcheck.md`, already present in the working tree) is
  another seat's edit. Neither is mine to land.
- **Plugin internals** (daemon, browser extension, CLI workflow) belong to
  `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md` under the K-block
  boundary clause at `SCORECARD.md:1614-1619`. The section cites that note and states no
  browser-command list.

## Tooling

No tool was installed or upgraded this round: the work needed only `node`, `git`,
`stat`, `find`, `sha256sum` and `sed`, all already present. No pacman transaction was
attempted (host-wide pacman pause in force).

## Secrets

No credential, token, oauth or server.token content was read. `~/.kimi-webbridge/identity.json`
was touched shape-only (one key name, `device_id`, no value read). The
`references/cli-creator/site-exploration.md` matches for "token"/"authorization"/"Bearer"
are *documentation examples of header shapes* for a CLI the user would write, not
secrets; the section does not reproduce them.

## Known limits

- The precedence outcome is rule-derived (the note's own quoted scope rule), not
  measured — no live rendered skill listing was captured this round. The section says so.
- Who created `~/.kimi-code/skills/kimi-webbridge` at 2026-10-21 23:36:39 is not
  recoverable from files: `grep -c -i webbridge ~/.kimi-code/logs/kimi-code.log` = 0, and
  no install or registry record outside `plugins/installed.json` mentions it. The
  `install-skill` mechanism is the skill's own documented explanation, labelled INFERENCE.
- The upstream source tree for the plugin (`code.kimi.ai/kimi-code/plugins/official/
  kimi-webbridge.zip`, named in `installed.json`) was **not** opened — the sourcing rule
  and the province bound do not require it for this question. The 1.11.3 plugin payload
  is the older of the two; whether it will be updated to 2.0.26 is not measured.
