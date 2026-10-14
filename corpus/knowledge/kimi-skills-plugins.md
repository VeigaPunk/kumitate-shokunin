# Kimi skills & plugins plane — how skills and plugins resolve

## Scope — the skills and plugins plane of Kimi Code CLI

Plane covered: `~/.kimi-code/skills/` (user skills), `~/.kimi-code/plugins/installed.json`
(installation manifest), `~/.kimi-code/plugins/managed/kimi-webbridge/` (one managed
plugin). All reads on this host 2026-10-13. `~/.kimi-code` itself is mode `700`; the
`skills/` and `plugins/` subtrees are `755`, so the plane is world-readable by design
while the surrounding home dir is not.

OBSERVATION (`ls -la ~/.kimi-code/skills/`): the `skills/` root is a symlink farm, not a
content dir — the directory holds **five entries, all symlinks**, zero real files. The
skill *content* lives in two external roots.

| Skill (dir name) | Link target (`readlink`) | SKILL.md lines / bytes | Link mode |
|---|---|---|---|
| `godspeed` | `/home/vgpnk/Projects/myskills/godspeed` | 20 / 708 | `lrwxrwxrwx` |
| `reverse-engineer-anything` | `/home/vgpnk/.agents/skills/reverse-engineer-anything` | 221 / 13580 | `lrwxrwxrwx` |
| `shokunin` | `/home/vgpnk/Projects/myskills/shokunin` | 213 / 11919 | `lrwxrwxrwx` |
| `ufo` | `/home/vgpnk/Projects/myskills/ufo` | 632 / 39051 | `lrwxrwxrwx` |
| `wwkd` | `/home/vgpnk/Projects/myskills/wwkd` | 135 / 6302 | `lrwxrwxrwx` |

INFERENCE: the harness scans a *name → dir* map and dereferences links at read time;
the links exist so that one authored tree can be surfaced under two harnesses
(`myskills` is a git repo — `.git/` present at its root; `~/.agents/skills/` is the
OMP-flavored root, see cross-domain note).

OBSERVATION: `~/.kimi-code/skills/wwkd/` additionally ships `SHA256SUMS` (75 B) pinning its own body:
`172369e84a96661af55da38ea071b7741943675bfc511a8e338e3aaa623912cf  SKILL.md`, and the
on-disk `sha256sum` matches byte-for-byte. `reverse-engineer-anything/` is the only
member whose files are mode `600` (`SKILL.md`, all six `references/*.md`), the rest are
`644`.

OBSERVATION: the skill dir contains **only** `SKILL.md` (plus `references/` or
`protocol/`); there is no `~/.kimi-code/skills/<name>/skill.json`, no manifest, no
version file at the skill level.
A skill is defined by `SKILL.md` alone.

UNKNOWN: no frontmatter key beyond `name` / `description` / `metadata` was observed in
any of the five; whether `metadata` is a recognized harness field or inert YAML is not
determinable from files on this host.

Each member below is one `## ` section, cited by the **symlink path** as it appears
under `~/.kimi-code/skills/`; each section notes the `readlink` target it resolves to.

## `~/.kimi-code/skills/godspeed`

Member path `~/.kimi-code/skills/godspeed` is a symlink — `readlink` →
`/home/vgpnk/Projects/myskills/godspeed`. Frontmatter (L1–8):

- L2 `name: godspeed`
- L3–7 description (`>` folded scalar), trigger verbatim: *"Triggered by \"godspeed\",
  \"--with godspeed\", or a task marked with godspeed framing."*
- Body delegates to a second file: L12 *"You follow **one file**: `directive.md` (in this
  skill directory)."* — the quoted directive file is 429 B / 9 lines and is the entire posture.

## `~/.kimi-code/skills/reverse-engineer-anything`

Member path `~/.kimi-code/skills/reverse-engineer-anything` is a symlink — `readlink` →
`/home/vgpnk/.agents/skills/reverse-engineer-anything`. Frontmatter (L1–7):

- L2 `name: reverse-engineer-anything`
- L3 description (plain scalar), incl. the negative trigger: *"Skip REA for ordinary
  source-repository architecture analysis."*
- L4–6 `metadata:` block — `version: "37"`, `tool_count: 170`. This is the only user
  skill carrying a numeric version; it does not correspond to any file in the skill dir.
- Layout: `SKILL.md` + `~/.kimi-code/skills/reverse-engineer-anything/references/` (6 files:
  `~/.kimi-code/skills/reverse-engineer-anything/references/native-and-artifacts.md`,
  `~/.kimi-code/skills/reverse-engineer-anything/references/javascript-applications.md`,
  `~/.kimi-code/skills/reverse-engineer-anything/references/connection-and-recovery.md`,
  `~/.kimi-code/skills/reverse-engineer-anything/references/evidence-workflows.md`,
  `~/.kimi-code/skills/reverse-engineer-anything/references/android-applications.md`,
  `~/.kimi-code/skills/reverse-engineer-anything/references/runtime-observation.md`).

## `~/.kimi-code/skills/shokunin`

Member path `~/.kimi-code/skills/shokunin` is a symlink — `readlink` →
`/home/vgpnk/Projects/myskills/shokunin`. Full internal layout (the assigned deep member).

`SKILL.md` is 213 lines / 11919 B. Frontmatter is the **shortest** of the five:
L1 `---`, L2 `name: shokunin`, L3 one plain-scalar description line, L4 `---` — no
`metadata:` block at all. Trigger text (end of L3): *"Activate on \"craft round\",
\"axis move\", \"grind an axis\", minting/creating a specialist agent, running or judging
a shokunin round, or fleet/watchdog operations."*

Body sections (`grep -n '^#' SKILL.md`): L6 title, L12 `## Identity — you are the
shokunin orchestrator on Kimi`, L28 `## Load order`, L49 `## Running a craft round
(in-session, Kimi-native)`, L102 `## Minting a new agent (the auto-creation mechanic)`,
L133 `## Fleet mode (the watchdog driver)`, L147 `## Promotion gates`, L169
`## Invariants`, L192 `## Honesty rules`, L204 `## Pointers`.

`protocol/` — five own-file contracts, all mode `644`:

| File | lines / bytes | top headings (line) |
|---|---|---|
| `PROTOCOL.md` | 501 / 43391 | L1 title, L7 `Fleet root and substrate`, L19 `Lifecycle`, L55 `Promotion gates`, L76 `Round-robin rounds`, L323 `Evidence standard`, L355 `Gate standard`, L402 `File contract per shokunin repo`, L429 `Invariants`, L477 `Fleet-2 conventions (adopted)`, L500 `Appendix — incident digest` |
| `PROTOCOL-APPENDIX.md` | 48 / 12737 | L1 `## Appendix — incident digest (why these rules exist)` |
| `MISSION.md` | 88 / 4625 | L1 title, L7 `Fleet shape (declared config)`, L38 `The axes framework`, L48 `L2 concurrency — required`, L62 `Round prompt`, L72 `Round end`, L76 `Push scope — hard rule`, L84 `L0 side channel` |
| `CORPUS.md` | 56 / 2926 | L1 title, L7 `Layout (per child repo)`, L16 `Rules`, L23 `Rules added from the round-1/2 corpus audits` |
| `AXES.md` | 32 / 1952 | L1 title, L7 `The six axes`, L18 `Working an axis`, L26 `SCORECARD.md contract (per child repo)` |

OBSERVATION — the load ladder is declared, not implied. SKILL.md L28–41
`## Load order` is ordered and binding: *"each layer is binding on the next"* —
(1) `~/.kimi-code/skills/shokunin/protocol/PROTOCOL.md` *"**the contract**. Read it on every
activation"*, (2) `PROTOCOL-APPENDIX.md` *"why each rule exists ... the rule still binds
until the protocol lane changes it"*, (3) `MISSION.md` *"the fleet SSOT"*, (4)
`AXES.md` + `CORPUS.md`. Note the paths are prefixed `skills/shokunin/…`, i.e. authored
**relative to a fleet root**, not to the skill dir.

OBSERVATION (integrity) — **dangling runtime kit**. SKILL.md L43–47 and L208–211
(`## Pointers`) name files that "matter at runtime":
`~/.kimi-code/skills/shokunin/templates/mint/` ("the canonical 7-file seed kit"),
`~/.kimi-code/skills/shokunin/templates/round-prompt.md`,
`~/.kimi-code/skills/shokunin/templates/MANIFEST.schema.json`,
`~/.kimi-code/skills/shokunin/templates/shokunin.conf.example`,
`scripts/shokunin-watchdog.sh`, `~/.kimi-code/skills/shokunin/scripts/mint-agent.sh`,
`~/.kimi-code/skills/shokunin/commands/shokunin.md`. Measured absent in **both** candidate
roots: not in the resolved skill dir (`~/.kimi-code/skills/shokunin/<p>` MISS for all
six probed) and not in the skill's own source root (`/home/vgpnk/Projects/myskills/<p>`
MISS for all eight probed, including
`/home/vgpnk/Projects/myskills/skills/shokunin/protocol/PROTOCOL.md`). The only surviving
member of that
family is the fleet driver, which lives at the *fleet repo* root, not the skill:
`/home/vgpnk/Projects/shokunin/scripts/shokunin-watchdog.sh` (5540 B, mode `755`).
INFERENCE: `shokunin`'s pointer block describes a fleet-repo layout that the published
skill does not carry; only the `protocol/` half shipped.

## `~/.kimi-code/skills/ufo`

Member path `~/.kimi-code/skills/ufo` is a symlink — `readlink` →
`/home/vgpnk/Projects/myskills/ufo`. Frontmatter (L1–17):

- L2 `name: ufo`
- L3–12 description (`>` folded), trigger verbatim: *"Typing \"ufo\", \"/ufo\", or
  \"$ufo\" runs the full skillset end to end. \"open the hatch\", \"open ufo
  sighting\", and \"i wanna see the ufos\" open its visible fleet wall."*
- L13–16 `metadata:` — `axis_family: orchestration`, `language: match-repo`,
  `substrate: all`. The only frontmatter that self-classifies a skill against the
  repo axis taxonomy.
- Layout: `SKILL.md` (632 lines, the largest) + `~/.kimi-code/skills/ufo/references/` =
  `~/.kimi-code/skills/ufo/references/run-logic.md` (65802 B, the actual contract),
  `~/.kimi-code/skills/ufo/references/CHANGELOG.md` (21016 B), `godspeed-core/`
  (`~/.kimi-code/skills/ufo/references/godspeed-core/directive.md` 429 B,
  `~/.kimi-code/skills/ufo/references/godspeed-core/filter.md`,
  `~/.kimi-code/skills/ufo/references/godspeed-core/velocity.md`).

OBSERVATION (mirror invariant, verified by hash) — `ufo`'s L24–36 `## Load order` names
`~/.kimi-code/skills/ufo/references/godspeed-core/directive.md` among *"Host and packaged copies ... **checked
generated mirrors**, not additional authorities. The sync gate checks their bytes without
requiring agents to read every copy. ... Duplicate assignment markers or drift from the
authored bytes fail closed."* Measured: the `godspeed` skill's own directive and ufo's
mirror are **byte-identical** —
`db88963cbdf5a0db22b460b284bf6f1d1f4abac9eaadb28bdb5e9bffe27be3bb` for both
`~/.kimi-code/skills/godspeed/directive.md` and
`~/.kimi-code/skills/ufo/references/godspeed-core/directive.md` (both 429 B). The
declared sync gate is therefore satisfied on this host.

## `~/.kimi-code/skills/wwkd`

Member path `~/.kimi-code/skills/wwkd` is a symlink — `readlink` →
`/home/vgpnk/Projects/myskills/wwkd`. Frontmatter (L1–13):

- L2 `name: wwkd`
- L3–12 description (`>` folded), trigger verbatim: *"Activate on \"/wwkd\", \"plan
  this\", \"map the axes\", \"break this down\", or whenever ufo loads its planner
  stance."*
- L11–12 add a precedence clause, quoted: *"Under ufo, run-logic §5 is normative: this
  file is the enrichment, and any drift resolves in §5's favor (I9)."*
- Body L17 opens `# WWKD — Axes-Mapping Posture (ufo L1)` and L27–28 restate the same
  subordination: *"it is enrichment, never a gate (I9; run-logic §5 wins on drift)."*
- Carries `SHA256SUMS` (see `## Scope`); no `references/`, no `metadata:`.

## `~/.kimi-code/plugins/installed.json`

The versioned install manifest.

390 B, mode `644`, mtime 2026-10-03T18:06. Full body quoted verbatim:

```json
{
  "version": 1,
  "plugins": [
    {
      "id": "kimi-webbridge",
      "root": "/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge",
      "source": "zip-url",
      "enabled": true,
      "installedAt": "2026-10-03T21:06:32.435Z",
      "updatedAt": "2026-10-03T21:06:32.435Z",
      "originalSource": "https://code.kimi.ai/kimi-code/plugins/official/kimi-webbridge.zip"
    }
  ]
}
```

Schema, per observed keys: top-level `version` (integer, currently `1` — a manifest
format version, not a plugin version) and `plugins[]`; each record is
`id` (string, matches the managed dir basename), `root` (**absolute** path, the install
location), `source` (enum-ish provenance kind; only `"zip-url"` observed), `enabled`
(bool gate), `installedAt`/`updatedAt` (ISO-8601 with ms and `Z`; equal here because the
plugin has never been updated since install), `originalSource` (the fetch URL, preserved
even though `source` is the abbreviated kind). INFERENCE: `id` + `root` are the pair a
loader needs — it resolves the plugin dir then reads the plugin's own manifest; the
manifest records **no** hash, signature, or file list, so tamper detection is not part of
this schema. UNKNOWN: whether `enabled: false` suppresses a plugin entirely or only its
tools; no disabled record exists on this host to observe.

## `~/.kimi-code/plugins/managed/kimi-webbridge`

A managed plugin is a package, not a skill.

Layout (measured, `find -L … | sort`), only 3 files total:

```
plugins/managed/kimi-webbridge/                       drwx------  700
├── kimi.plugin.json                                   -rw-r--r--  644  1273 B
└── skills/                                            drwxr-xr-x  755
    └── kimi-webbridge/                                drwxr-xr-x  755
        ├── SKILL.md                                   -rw-r--r--  644  11880 B
        └── references/
            └── operations.md                          -rw-r--r--  644
```

OBSERVATION: the plugin **root** is mode `700` while every child is `755`/`644` — the
installer locks the package root and opens the payload. Contrast the user-skill entry
point, which is a `755` symlink with no manifest at all.

`~/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json` (the plugin's own manifest, distinct from `~/.kimi-code/plugins/installed.json`) — quoted
keys verbatim: `"$schema": "https://kimi.com/schemas/kimi.plugin.schema.json"`,
`"name": "kimi-webbridge"`, `"version": "1.11.3"`, `"author": "Moonshot AI"`,
`"license": "Proprietary"`, **`"skills": "./skills/"`**, and a nested `interface` object
(`displayName`, `shortDescription`, `longDescription`, `developerName`, `websiteURL`),
plus a six-element `keywords` array (`browser, webbridge, cdp, automation, web, scraping`).

Mechanics: `"skills": "./skills/"` is a **relative directory pointer** — the plugin
declares where its skills live and the loader enumerates that dir, which is why the
skill sits at `~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md` (plugin name repeated as
the skill dir name). INFERENCE: a plugin may declare zero or many skill dirs under that
pointer; only the one-dir case is observable here.

Its `SKILL.md` frontmatter (L1–7) is structurally the same contract as a user skill —
`name: kimi-webbridge`, description, `metadata: version: "1.11.3"` (L6, matching
`~/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json` L4). Two style differences from the user skills: the description uses
a **literal** block scalar `|` (L3) where the user skills use `>` or a plain scalar, and
the version is **owned by the plugin manifest and mirrored into frontmatter**, where the
user skills carry no version at all (`reverse-engineer-anything`'s `metadata.version: "37"`
is the sole exception and has no file backing it).

OBSERVATION (declared endpoint): `SKILL.md` L11 — *"Control the user's real browser ...
via a local daemon at `http://127.0.0.1:10086`"*; the tool table's rows L17–30 enumerate
14 browser tools
(`navigate, find_tab, snapshot, click, fill, evaluate, cdp, screenshot, network, upload,
save_as_pdf, list_tabs, close_tab, close_session`), with `~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md`
(4 headings: `## The daemon`, `## Recovery …`, `## Do NOT do automatically`, `## /status
JSON fields`) holding daemon lifecycle/recovery detail. Routed to kama (see below).

**Managed plugin vs user skill — structural contrast**

| | User skill (`~/.kimi-code/skills/<n>`) | Managed plugin skill (`…/managed/<p>/skills/<n>`) |
|---|---|---|
| Entry point | symlink → external dir, mode `755` | real dir inside `plugins/`, parent plugin root mode `700` |
| Manifest | **none** — `SKILL.md` is the whole contract | `~/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json` (own schema URL) **plus** registry row in `~/.kimi-code/plugins/installed.json` |
| Version | absent (or `metadata.version`, unbacked) | plugin manifest `1.11.3`, mirrored into frontmatter `metadata.version` |
| Provenance | the symlink target *is* the provenance | `source`/`originalSource`/`installedAt` recorded in `~/.kimi-code/plugins/installed.json` |
| Enable gate | none observed | `enabled: true` in `~/.kimi-code/plugins/installed.json` |
| Skill dir discovery | dir name under the scanned root | via the manifest's `"skills": "./skills/"` pointer |
| Bundle | `SKILL.md` + `references/` or `protocol/` | `SKILL.md` + `references/` only, but also plugin-level metadata + `interface` block |

## The assigned question — precedence of user skills vs managed plugins

OBSERVATION (governing rule text, verbatim from this session's skill listing):
*"Skills are grouped by scope (`Project`, `User`, `Extra`, `Built-in`) so you can tell
where each came from. ... When multiple scopes define a skill with the same name, the
more specific scope takes precedence: **Project overrides User overrides Extra overrides
Built-in**."*

OBSERVATION (rendered listing, this session — the direct answer): the eight
`~/.kimi-code/skills` + `~/.agents/skills` skills render under **`### User`**, while
`kimi-webbridge` renders alone under **`### Extra`**, with the path
`/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md`.
Three further entries (`check-kimi-code-docs`, `update-config`, `write-goal`) render
under `### Built-in` with `builtin://` URIs and have no file anchor on this host.

⇒ **Answer:** a managed-plugin skill lands in the **`Extra`** scope, strictly *below*
`User`. A name collision between a user skill and a managed plugin's skill resolves to
the **user skill** (per the rule) — the user-skill path is the one that survives into the
rendered list. The `Extra` label is attached because the skill came from an installed
plugin bundle rather than a scanned skills dir. INFERENCE, not measured: no collision
between a user skill and `kimi-webbridge` exists on this host, so the tie-break is
rule-derived, not observed on live data.

OBSERVATION (dedup across user roots): the two user roots supply **10** entries but the
listing shows **8** names. `godspeed`, `shokunin`, and `ufo` exist in *both*
`~/.kimi-code/skills/` (→ `myskills`) and `~/.agents/skills/` (→ `ompskills/.omp/skills`);
`reverse-engineer-anything` is reachable both as the `~/.kimi-code/skills` symlink and as
a real dir in `~/.agents/skills`. In every collision the listing reports the
**`~/.kimi-code/skills/…` path** (`godspeed`, `shokunin`, `ufo`, `reverse-engineer-anything`
all render with that prefix). `omarchy`, `swarm`, `tower` — present only under
`~/.agents/skills` — render with the `~/.agents/skills/…` path, so both roots are scanned
and merged by name with the kimi-code root winning.

OBSERVATION (config plays no part): `grep -i 'skill|plugin|marketplace'` over
`~/.kimi-code/config.toml` (150 sections, all `[providers.*]` / `[models.*]`) returns
**no matches**; `~/.kimi-code/tui.toml` (31 lines) holds only client prefs
(`theme`, `tui_mode`, `[editor]`, `[notifications]`, `[upgrade]`) with no skill/plugin
key. ⇒ INFERENCE: skill/plugin resolution is **purely filesystem-driven** — roots plus
`~/.kimi-code/plugins/installed.json` — not declarable in config.

UNKNOWN (recorded, not guessed): the exact filesystem scan order across the two user
roots; whether `Project` scope is populated from `<cwd>/.kimi/skills` or similar; whether
an `enabled: false` plugin is filtered out or merely inert; whether plugin skills can ever
outrank user skills by explicit `interface` config.

## Blocker / unverifiable rows

| Surface | Status | Evidence |
|---|---|---|
| Runtime load telemetry for skills/plugins | **absence** | `grep -i 'skill\|plugin\|webbridge' ~/.kimi-code/logs/kimi-code.log` (7882 B) → *"No non-sensitive matches found"*. Loading leaves no log line; only the rendered prompt listing shows the result. |
| `builtin://` skills | **opaque** | `check-kimi-code-docs`, `update-config`, `write-goal` have no resolvable file path on this host. |
| `shokunin` `templates/` + `scripts/` + `commands/` runtime kit | **absent** | Probed MISS in skill dir and in source root `/home/vgpnk/Projects/myskills/` (see `~/.kimi-code/skills/shokunin`). |
| `~/.kimi-code/plugins/installed.json` disabled-plugin semantics | **unobservable** | Single record, `enabled: true`; no counterexample. |
| Secret-adjacent surfaces | **not opened** | `~/.kimi-code/credentials/` (`700`), `~/.kimi-code/oauth/`, `~/.kimi-code/server.token` (43 B, `600`) noted shape-only, never read. |

## Cross-domain findings — report, do not absorb

- **OMP skills root shares names with the Kimi root.** `~/.agents/skills/*` are mostly
  symlinks into `/home/vgpnk/Projects/ompskills/.omp/skills/*` (`shokunin`, `ufo`, `swarm`,
  `tower`), and `omarchy` → `~/.local/share/omarchy/default/omarchy-skill`. The Kimi
  plane scans it as a second User root and dedups by name against
  `~/.kimi-code/skills/`. Whoever owns the OMP substrate plane should hold the
  `.omp/skills` layout; this note records only that Kimi consumes it. → **OMP/host-plane lane.**
- **Local daemon endpoint** declared by the managed plugin: `http://127.0.0.1:10086`
  (WebBridge drives Chrome/Edge over CDP via a browser extension). → **kama (endpoints).**
- **Credential/secret surface modes** observed on this host: `credentials/` `700`,
  `oauth/` `700`, `server.token` `600`, `~/.kimi-code/config.toml` `600` with 14 timestamped
  `.bak` siblings. → **kagi (credentials), report only.**
- **No model-quality or route data** was measured in this lane. → nothing for kengaku.

## Sources

`ls -la ~/.kimi-code/skills/` (5 symlinks, targets via `readlink`) and
`ls -la ~/.kimi-code/skills/<name>/` for each member;
`~/.kimi-code/skills/{godspeed,reverse-engineer-anything,shokunin,ufo,wwkd}/SKILL.md`
(frontmatter line anchors as cited per member);
`~/.kimi-code/skills/shokunin/protocol/{PROTOCOL,PROTOCOL-APPENDIX,MISSION,CORPUS,AXES}.md`;
`~/.kimi-code/skills/wwkd/SHA256SUMS`; `sha256sum` over
`~/.kimi-code/skills/godspeed/directive.md` +
`~/.kimi-code/skills/ufo/references/godspeed-core/directive.md`;
`~/.kimi-code/plugins/installed.json`; `~/.kimi-code/plugins/managed/kimi-webbridge/`
(`~/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json`,
`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md`,
`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md`);
`stat` modes for all of the above; `~/.kimi-code/config.toml` and `~/.kimi-code/tui.toml` grepped
shape-only; `~/.kimi-code/logs/kimi-code.log` grepped for load lines; rendered skill
listing of this session (scope grouping and precedence rule text).

## Errata (round-19 audit A2, 2026-10-13, append-only)

- **Nits (three counts):** live `~/.kimi-code/config.toml` section count at audit time =
  **148**, not 150 (the note's count was taken pre-drift); `oauth/` mode =
  **0755**, not 0700 (mode-floor consequence, matches the census gate's
  floor design); the drift chain is **11 timestamped `.bak` + 1 plain
  `config.toml.bak`** (the note's "14" double-counted).

**Erratum (round-24 triage C, 2026-10-13, append-only).** (1) The round-19
nit above contained a bare config-plane filename inside pre-existing
errata text; the minimal home-dir prefix was added to that one token in
place — the only in-place edit inside pre-existing errata text —
disclosed here per the
sibling-lane protocol. (2) Seventeen bare substrate-relative refs flagged
by round 23's honest fence geometry (the plugin manifest at four sites,
the registry manifest at six, the plugin skill and operations files —
one of the skill sites an ellipsis shorthand — and the config/tui
filenames including one brace-expansion shorthand) were prefixed to
their full home-dir form per the round-13 house rule; no claim text
changed. (3) Nine ambiguous
bare names in the skill-member sections (the wwkd dir, the REA
references dir, the ufo layout basenames run-logic / CHANGELOG /
directive / filter / velocity, and the mirror-invariant mention) were
prefixed to the symlink-path
form this note declares as its citation convention. A tenth site (the
godspeed directive prose mention) could not take the prefix: a full path
placed beside the verbatim-quote mention on the preceding line acted as a
directory-context hint and re-bound the quoted bare name to the origin
tree's 8-line mirror copy, putting every downstream SKILL.md line anchor
out of range (32 LINE_OOR before the reword); the prose site now reads
"the quoted directive file" and the quote itself stays byte-identical.
Four genuinely
generic references-dir mentions and one directive filename inside a
verbatim quote of the godspeed skill body were deliberately left as-is:
prefixing the former would assert a specificity the sentence does not
claim, and editing the latter would alter quoted bytes.
