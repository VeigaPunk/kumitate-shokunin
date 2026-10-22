RESULT ScoutKimiWebbridge rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=new-member evidence=distinct inode tree, skill 2.0.26 vs plugin 1.11.3

# ScoutKimiWebbridge — is `skills/kimi-webbridge` the plugin tree counted twice?

## Answer

**new-member.** Under the frozen counting rule `~/.kimi-code/skills/` is a
*counted-live* member (`names not gated`): every non-hidden child is one member slot, and
the tripwire count must be re-pinned 6 → 7 exactly as round 34 re-pinned 5 → 6 for
`cursor-lane`. The seventh child is **not** the managed plugin tree counted a second time:
the two trees share zero inodes, have different realpaths, different file sets, different
bytes, different versions and mtimes 7.4 days apart. The only thing they share is the skill
*name* `kimi-webbridge`, which is a real precedence collision the K2 note must now record.

## Observed facts

### 1. The two trees are distinct inodes, not links, not hardlink twins

`stat -c '%F inode=%i dev=%d mtime=%y size=%s'`:

```
~/.kimi-code/skills/kimi-webbridge            directory inode=95866022 dev=56 mtime=2026-10-21 23:36:39 size=36
~/.kimi-code/plugins/managed/kimi-webbridge   directory inode=31085    dev=56 mtime=2026-10-14 14:40:47 size=122
```

`realpath` returns each path itself (neither is a symlink; `find … -type l` = 0 in the
skills copy). Cross-tree inode intersection (same dev:inode present in both trees) = **0**.
No file in either tree has link count > 1.

### 2. Different file sets, different bytes

```
skills copy (7 files)                          plugin tree (5 files)
SKILL.md                 19437 B  600          kimi.plugin.json                 1273 B
references/operations.md  5911 B  644          SKILL.md (skills/kimi-webbridge) 11880 B
references/cli-creator/{companion-skill-template,go-layout,
  login-handling,site-exploration,workflow}.md          references/operations.md          2422 B
                                               03-browser-extension.txt         2703 B  (session note, 2026-10-14)
                                               04-headroom.txt                   338 B  (session note, 2026-10-14)
```

`sha256sum` of the same-named files:

```
defba946e6693fd4c890e8754a56fbeef63dc633e6ea32de504cbbc41bfc34b5  skills/.../SKILL.md
84a8e69d04c5b810e69695dec8d8e16c1cd9735b96ba81c39433b0c0451bea4b  plugin/.../SKILL.md
7f60c9811cf2c8755e5a66a07795620730aa1f1f23e3391f27f16f6f7142d7e6  skills/.../references/operations.md
b811d9c23dfdafa0b751b23acef25b02a324490a3389efdd5c17319a646734fc  plugin/.../references/operations.md
```

Versions: skills copy `metadata.version: "2.0.26"` (SKILL.md:6, title "Kimi Browser
Extension (formerly Kimi WebBridge)"); plugin copy `metadata.version: "1.11.3"`
(SKILL.md:6), matching `kimi.plugin.json` `"version": "1.11.3"`. The plugin tree's own
manifest pointer is still `"skills": "./skills/"`, and its root has been used as a scratch
dir (the two dated `.txt` dumps above are not payload files).

### 3. Installed-manifest and provenance evidence

`~/.kimi-code/plugins/installed.json` records exactly one plugin, `root:
/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge`, `updatedAt 2026-10-03T21:06:32Z`.
It has **no record of the skills/ copy** — i.e. the skills/ child is not a second view of
a manifest-declared install.

The skills/ copy is byte-identical across four harness roots (all 7 files, same hashes,
same modes dir 755 / SKILL.md 600 / refs 644):

```
~/.claude/skills/kimi-webbridge   SKILL.md defba946…  2.0.26
~/.codex/skills/kimi-webbridge    SKILL.md defba946…  2.0.26
~/.hermes/skills/kimi-webbridge   SKILL.md defba946…  2.0.26
~/.kimi-code/skills/kimi-webbridge SKILL.md defba946… 2.0.26
```

with **0** cross-tree inode overlap between the kimi copy and the claude copy (separate
copies). It is a normal per-harness skill install of the current release; it is not derived
from the kimi managed plugin (whose bytes are the older 1.11.3). The upstream source tree
`/home/vgpnk/Projects/kimi-code/plugins/official/kimi-webbridge` is also a different
version (`kimi.plugin.json` 2.0.11, SKILL.md `adf7ba09…`), so the 2.0.26 skill did not come
from that checkout either.

The plugin payload skill is **not** independently counted by the census: the only member
under it is `plugins/managed/kimi-webbridge` (presence-only dir), and `plugins/managed` is
enumerated by declared child name only.

## The frozen counting rule (as written)

`scripts/kimi-census.mjs`:

- `:111` `{ id: 'skills/', family: 'K2', path: 'skills', kind: 'dir', counted: 6 }`
- `:143` `{ dir: 'skills', childCount: 6 }`
- `:56-58` header: "`agents/secondary/` and `skills/` by live child count (names not
  gated — a rename is not a finding)"
- `:286-289` verify counted branch: when `kids.length !== m.counted` it errors
  `UNLISTED` with "an undeclared child appeared (names not gated)" when the live count
  exceeds the declared count.
- `:327` enumeration pass 2 comment: "A declared child that is itself a member path is
  owned by the member pass — never double-reported." (this is why
  `plugins/managed/kimi-webbridge` is not counted twice; there is no cross-path dedup,
  and member identity is the path)
- `:150` `FROZEN = { K1: 4, K2: 26, … }` (informational cross-round constant)

`scripts/proxy-check.mjs` re-derives the same rules independently: `:500-506`
`K_MEMBER_RULES` includes `{ id: 'skills/', …, kind: 'counted' }`; `kMembers()` adds
`members += kids.length` and names each member `${path}/${child}`. `coverage_kimi =
floor(10 × C1k/C1k_total × K_sections/K_members)` (`:158`).

Observed at the open revision on the live root:

```
$ node scripts/kimi-census.mjs
INFO  COUNT  skills/  children=7 (counted live, names not gated)
CENSUS  error  UNLISTED  skills/  skills has 7 children, 6 declared — an undeclared child appeared (names not gated)
TOTALS: members=52 checked=52 errors=1 info=4 chain=7
KIMI_CENSUS: DRIFT (UNLISTED skills/); exit=1
FAMILY K2  members=27  checked=27  frozen=26
```

```
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src
K_MEMBERS_DRIFT  K_members: declared=51 computed=52 delta=+1
COVERAGE_KIMI_DRIFT  coverage_kimi: declared=10 computed=9 delta=-1
AXES_DRIFT  coverage:kimi-layer: ## Axes row=10 derived=9
exit=1
```

JSON terms: `C1k=5/5, K_members=52, K_sections=51, coverage_kimi=9`
(`floor(10 × 5/5 × 51/52) = 9`). One member is unnamed by the note's headings — the new
`skills/kimi-webbridge`.

## Round-34 precedent, verified in history

Commit `1a8eed5` ("round-34: … kimi skills tripwire 5->6 + cursor-lane section
(coverage:kimi-layer live 9->10)"). Diff hunks:

```
-{ id: 'skills/', … counted: 5 }      +{ id: 'skills/', … counted: 6 }
-{ dir: 'skills', childCount: 5 }     +{ dir: 'skills', childCount: 6 }
-const FROZEN = { K1: 3, K2: 25, … }  +const FROZEN = { K1: 3, K2: 26, … }
SCORECARD: -K_members=49 -K_sections=49  +K_members=50 +K_sections=50
```

plus a new `## ~/.kimi-code/skills/cursor-lane` section in
`corpus/knowledge/kimi-skills-plugins.md` and a round-34 erratum recording the seventh…
(sixth) child. The rule itself was unchanged: a new counted-live child is a new member;
only the pins and the note moved. That is exactly the shape round 40 needs.

## Consequence for round 40 (what the fix touches)

- `scripts/kimi-census.mjs`: `:111` counted 6 → 7; `:143` childCount 6 → 7; `:150`
  `FROZEN.K2` 26 → 27; header prose `:24-29` (51 → 52 members, "6 entries under skills/"
  → 7) and a round-40 header note at `:82`.
- Selftest literals (currently 48/48 PASS): `:513,517,523,527,541,696,712,831` members
  51 → 52; `:552,565,585,734,804,819` 50 → 51; `:568-571` drop case uses
  `skills-lane-06` and `"6 children, 7 declared"`; `:574-579` extra case uses
  `skills-lane-07` and `"8 children, 7 declared"`, expected members 52 → 53; `:592`
  extra-lane case 52 → 53; `:531` `frozen.K2 === 26` → 27. `fixtureTree()` builds
  `e.childCount` skills children automatically, so the fixture follows the pin.
- `SCORECARD.md`: stanza `K_members=51` → 52 and `K_sections=51` → 52 (`:298-299`),
  coverage row text `:317`, round table row.
- `corpus/knowledge/kimi-skills-plugins.md`: a new `## ~/.kimi-code/skills/kimi-webbridge`
  section naming the member makes `K_sections` 52 and `coverage_kimi` 10 (fixes
  `COVERAGE_KIMI_DRIFT` and both `AXES_DRIFT` rows).

Evidence needed in that section (all observed this round): real dir (not a symlink),
7 files, `SKILL.md` 19437 B mode 600 sha256 `defba946…`, `metadata.version: "2.0.26"`,
`references/operations.md` 5911 B sha256 `7f60c981…`, plus `references/cli-creator/`
(five files, sha256 `f17d70fc… 89cbfb51… fd6aa463… d7cdeb17… a5bb3523…`).

## Note obligation: the name collision is now real

`kimi-skills-plugins.md:326-330` currently says: *"INFERENCE, not measured: no collision
between a user skill and `kimi-webbridge` exists on this host, so the tie-break is
rule-derived, not observed on live data."* That inference is falsified by the live tree:
`~/.kimi-code/skills/kimi-webbridge/SKILL.md` and the plugin's
`…/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md` both declare
`name: kimi-webbridge`. Under the note's own quoted precedence (*"Project overrides User
overrides Extra overrides Built-in"*, `:316-320`) the user-skill copy (2.0.26, User) wins
and the plugin copy (1.11.3, Extra) is shadowed. The new section must state this, and an
append-only erratum should record that `skills/` now holds seven children: five symlinks
(`godspeed`, `reverse-engineer-anything`, `shokunin`, `ufo`, `wwkd`) and two real dirs
(`cursor-lane`, `kimi-webbridge`).

## Confidence

- The two trees are distinct installs, not one tree counted twice: **high** (inode,
  realpath, hardlink and byte evidence all agree).
- Seventh child is a new member under the frozen rule: **high** (rule text is explicit;
  round-34 precedent is a literal re-pin of the same two lines).
- The skills copy is a per-harness 2.0.26 install (same bytes in claude/codex/hermes
  roots): **high** for the byte identity; **medium** for "installed by the same
  distribution step" (no installer record observed).

## Remaining unknowns

- Who/what created `~/.kimi-code/skills/kimi-webbridge` at 2026-10-21 23:36:39 is not
  recoverable from files: `grep -c -i webbridge ~/.kimi-code/logs/kimi-code.log` = 0, and
  no install/registry record outside `plugins/installed.json` mentions it.
- Whether the live loader now renders `kimi-webbridge` under `User` and shadows the
  `Extra` plugin copy is rule-derived, not measured this round (no live skill listing was
  captured; the round-19 observation predates the collision).
- Whether the plugin payload will be updated to 2.0.26 (upstream zip unopened; sourcing
  rule — not needed for this question).

## Commands run (all read-only; no clone, no patch, no tool installs)

```
ls -la ~/.kimi-code/skills/ ~/.kimi-code/plugins/managed/
stat -c '%n type=%F inode=%i dev=%d mtime=%y size=%s' <both dirs>; realpath <both>
find -L <both trees> -exec stat -c '%F %s %a %y %n' {} \;
find -L <both trees> -type f -exec sha256sum {} \;
find … -printf '%D:%i\n' | sort | uniq -d   # cross-tree hardlink check → 0
sed -n '1,40p' ~/.kimi-code/skills/kimi-webbridge/SKILL.md
sed -n '1,14p' ~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md
cat ~/.kimi-code/plugins/installed.json
sha256sum ~/.claude|.codex|.hermes/skills/kimi-webbridge/SKILL.md
node scripts/kimi-census.mjs
node scripts/kimi-census.mjs --selftest          # 48/48 pass, exit 0
node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src [--json]
git --no-pager log --oneline -S"counted: 6" -- scripts/kimi-census.mjs
git --no-pager show 1a8eed5 -- scripts/kimi-census.mjs SCORECARD.md
```

No writes outside this report; no lane index/ref changes; no secrets read (credentials/,
oauth/, server.token untouched by shape only).
