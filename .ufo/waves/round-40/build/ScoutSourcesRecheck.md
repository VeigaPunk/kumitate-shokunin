RESULT ScoutSourcesRecheck rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=advanced row=S012 change=queued->mined

# Scout — source queue recon, one recheck, round 40 wave 1

Read-only recon at the round-open revision. The only lane write is this file.
No tool installed or upgraded this run.

## 1. Gate runs (before state)

Command (lane root, pinned upstream source):

    node scripts/sources-check.mjs --today 2026-10-22
    SOURCES  info  LEGACY_NO_HEADER  count=38
    SOURCES_CHECK: CLEAN (rows=34 tiers=A:33,B:1,C:0 status=queued:14,mined:18,rejected:2 entries_with_source=3 legacy=38)
    exit 0

`--json` emits keys schema, verdict, exitCode, findings, totals, counts, info — it does
not print per-row records, so the row list below was parsed from `corpus/SOURCES.md`.
`--src` is not an accepted option (usage: `--self DIR`, `--today DATE`, `--json`,
`--strict`, `--selftest`).

Command (fleet census):

    /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
    kumitate  W04  S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
    kumitate  ok   /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md

The W04 line is routed defect R39-6 observed live: S034 repeats S023's URL (S023 mined
2026-10-20, S034 mined 2026-10-22, same page, two scopes). Recorded, not fixed here.

Supporting run for the round's C2 claim (kimi substrate):

    node scripts/kimi-census.mjs
    INFO  COUNT  skills/  children=7 (counted live, names not gated)
    CENSUS  error  UNLISTED  skills/  skills has 7 children, 6 declared — an undeclared child appeared (names not gated)
    TOTALS: members=52 checked=52 errors=1 info=4 chain=7
    KIMI_CENSUS: DRIFT (UNLISTED skills/)

Live shape of the seventh child (`ls -la ~/.kimi-code/skills/`):

    kimi-webbridge      drwxr-xr-x  dir  Oct 21 23:36      <- real directory, not a symlink
    godspeed, reverse-engineer-anything, shokunin, ufo, wwkd   lrwxrwxrwx  symlinks
    cursor-lane         drwxr-xr-x  dir

`~/.kimi-code/skills/kimi-webbridge/` holds `SKILL.md` (0600, 19437 B, Oct 21 23:36)
and `references/`. So C2's premise is observed: a seventh, non-symlink user-scope
child exists, named after the managed plugin, and the census counts six.

## 2. Queued rows and recheck due

Queued (14): S010, S011, S012, S013, S014, S015, S016, S017, S018, S024, S025, S026,
S027, S028.

Recheck due on or before 2026-10-22: **none**. `RECHECK_OVERDUE` is absent from
`findings`. Earliest cadence horizon is S008 and S009 (opened 2026-10-19, 30d ->
2026-11-18), then S021 (2026-11-19) and S029 (2026-11-20). The 15 `on-release` rows
(S001, S002, S003, S004, S005, S006, S010, S012, S013, S014, S022, S024, S026, S027,
S031) have no date trigger at all; they come due only on a new release of their
source. The other 19 rows carry a `Nd` cadence; two are `rejected` (S019, S020).

## 3. Pick: S012 — Kimi Code CLI Docs: Agents and Sub-Agents

Why this one: the round names three claim domains — anchor-truth review binding,
mutant ledgers, kimi substrate. Every row serving the first two is already `mined`
(S023/S034 mutation vocabulary, S031/S032/S033 pinned evidence) and no queued row
touches them. Of the queued rows in the kimi-substrate domain (S012, S013), S012 is
the one whose text is operative for K2 as the census counts it: K2 is a live child
count over `agents/secondary/` and `skills/`, and S012 is the documented discovery
contract that decides which files those directories contribute and in what order.
It also states the plugin-injection rule (a plugin's manifest `agents` field, or the
`agents/` dir under the plugin root when omitted) — the same injection plane that put
a managed-plugin skill into the user skills tree this round. S013 (Tower) is
coordination behavior, not member discovery, so it serves no claim directly.

Source opened by ordinary means (plain HTTP read, no headless browser, no challenge
passing) at 2026-10-22, immediately before 14:04Z:

    https://moonshotai.github.io/kimi-code/en/customization/agents.html
    HTTP 200, served HTML, VitePress v1.6.4, title "Agents and Sub-Agents | Kimi Code CLI Docs"

Recorded anchor verified: both headings are present — `### Agent Locations` and
`### Agent File Format`.

Recorded teaches confirmed verbatim (quote, 18 words):

    "more specific scopes take higher priority: Explicit (--agent-file) > Project > Extra > User > Plugin > Built-in"

The same section states "Each directory is scanned recursively for `.md` files."
and "Unknown fields are ignored, so newer files stay readable by older versions." —
both halves of the row's teaches tail are still on the page. Nothing in the row is
refuted; no flip condition arises.

## 4. Old -> new the L1 should log

    status   queued  ->  mined
    used-by  —       ->  corpus/knowledge/kimi-lane-definitions.md
    opened   2026-10-19        (unchanged)
    recheck  on-release        (unchanged)
    anchor   "§ Agent Locations and § Agent File Format; fetched 2026-10-19"  (unchanged)

`opened` is deliberately not rewritten: `corpus/SOURCES.md:7-8` freezes a row as
append-only except `status`, `recheck`, `used-by`, so the 2026-10-22 re-open is a
recheck event recorded here and in the round lesson, not a row edit. `recheck` stays
`on-release` because the Kimi docs site versions with the CLI release, which is the
cadence the row already declares.

Why that used-by target: `corpus/knowledge/kimi-lane-definitions.md` documents the 18
`~/.kimi-code/agents/secondary/` files and their frontmatter, and its `## Unknowns`
section states "the exact load/resolution order (file vs registry precedence) is
unverified". S012 is exactly that upstream answer (scope precedence, same-name
higher-scope-wins, recursive scan), so the mining closes a named gap in the substrate
note the K2 count rests on. `corpus/knowledge/kimi-skills-plugins.md` is the K2 note
the round must extend; S012 does not speak about skills discovery, so pointing
used-by there would be a false attribution.

Post-change gate result, in my own clone at f69817ed (nothing written to the lane):

    node scripts/sources-check.mjs --self . --today 2026-10-22
    SOURCES_CHECK: CLEAN (rows=34 tiers=A:33,B:1,C:0 status=queued:13,mined:19,rejected:2 entries_with_source=3 legacy=38)
    exit 0

`kimi-lane-definitions.md` exists and is a legacy knowledge file without a `source:`
header, so `USED_BY_MISSING` and `USED_BY_ASYMMETRY` stay quiet and
`entries_with_source` does not move (3).

Patch (one row line, apply-clean against f69817ed):

    /fast/scratch/hyaku/kumitate-r40/seats/ScoutSourcesRecheck/ScoutSourcesRecheck.patch
    md5 7b9542c743c8e490106944fa7fd2ca81
    git apply --check  -> FORWARD_APPLY_CLEAN_AT_BASE   (checked on a stashed pristine tree)

## 5. Two cautions for the K2 / coverage work

- Scope order must not be shared between the two planes. The K2 note quotes the
  runtime listing rule for skills, "Project overrides User overrides Extra overrides
  Built-in"; S012's order puts Extra above User and adds Explicit and Plugin, but it
  governs agent files, not skills. Do not import one into the other.
- The page's `Next steps` links Agent Skills at `./skills.html`
  (https://moonshotai.github.io/kimi-code/en/customization/skills.html). That locator
  is unopened and is not named by the existing lead bullet "Kimi Code hooks, env-vars,
  and plugin pages"; it is the page a K2 skills-member note would want. Suggested as
  the one line to add under `## Leads (unopened)`; not opened here.

## 6. Not done here

No lane file other than this report was written; the clone's change is only the
demonstration row edit and its patch. No commit, push, or ref update anywhere. The
W04 duplicate and the census drift are reported, not repaired — both belong to the
L1's integration.
