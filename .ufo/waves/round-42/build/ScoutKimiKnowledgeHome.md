RESULT ScoutKimiKnowledgeHome rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=confirmed file=corpus/knowledge/kimi-session-state.md heading=`## `~/.kimi-code/locks/` — the lock directory; one child, empty (shape only)`

# C2 heading scout — `~/.kimi-code/locks`

Scope: (a) which `corpus/knowledge/kimi-*.md` note owns the `~/.kimi-code` root members, (b) the exact
heading form `scripts/proxy-check.mjs` accepts into `K_sections`, (c) the exact line for `locks` and its
file, (d) whether a basename collision would make it ambiguous. All measurements at lane revision
`b237e3f09c9559e130c7367bd2efa981c4ea516f`, own clone
`/fast/scratch/hyaku/kumitate-r42/seats/ScoutKimiKnowledgeHome/lane`, host kimi root `~/.kimi-code`.

## (a) File that owns the root members

The K3 plane note `corpus/knowledge/kimi-session-state.md` (`# K3 — Kimi Code session & runtime state
plane`, Scope "nine members, one plane", lines 1-17) holds the sections for `sessions/`,
`session_index.jsonl`, `workspace-trust/`, `telemetry/`, `logs/kimi-code.log`, `file-history/`,
`user-history/`, `cache/`, `search-index/` — e.g. `## `~/.kimi-code/sessions/` — the worktree-keyed
session store` (line 49) and `## `~/.kimi-code/file-history/` — two tiers: …` (line 339).
`workspaces.json`, `tui.toml.bak`, `rc-qrcode.png` live in `corpus/knowledge/kimi-residue-files.md`
(K5 residue), config in `kimi-config-plane.md`, lanes in `kimi-lane-definitions.md`, binaries/secrets in
`kimi-binary-secrets.md`, skills/plugins in `kimi-skills-plugins.md`, modes in `kimi-modes-machinery.md`,
`mcp.json` in `kimi-mcp-plane.md`. `locks/` is session-install state, so it belongs to
**`corpus/knowledge/kimi-session-state.md`** (K3), not the residue note.

## (b) Heading form the counter accepts (read, not inferred)

`scripts/proxy-check.mjs`: `RE_KIMI_NOTE = /^kimi-.*\.md$/` (line 489); `kSections()` (line 857)
walks `<self>/corpus/knowledge` and matches `/^## (.+)$/u` per line — exactly two hashes, one space, so
`### ` never counts; heading text is trimmed. `kMembersNamedByHeading()` (line 833) collects tokens
from every backticked span plus every whitespace token containing `/`, then normalizes each token:
strip greedy `^.*\.kimi-code\/`, strip leading non-`[\w~./-]`, strip trailing non-`[\w~./*-]`, strip
trailing slashes. A token binds when it equals a member identity exactly (`kimi.identities.has(tok)`) or,
failing that, when its basename is owned by exactly ONE member (`byBasename`); a basename with >1 owner
binds to none and emits warning `K_SECTION_AMBIGUOUS`. `K_sections` is the count of DISTINCT members
named (line 899), so one member named twice still counts once.

## (c) Exact proposed line and member declaration

File: `corpus/knowledge/kimi-session-state.md` — place it after the `sessions/` section, and update the
note's Scope block (line 6 "the nine of the K3 registry row") to ten members with a `(10)` entry; prose
is not counted but an internally stale count is a citation defect.

Heading line (verbatim):

    ## `~/.kimi-code/locks/` — the lock directory; one child, empty (shape only)

Token normalization: `~/.kimi-code/locks/` → `locks/` → `locks`, an exact identity match once the member
is declared. Required companion declaration (K3, presence-only, NOT counted — see (d)):
`{ id: 'locks/', family: 'K3', path: 'locks', kind: 'dir' }` in `scripts/kimi-census.mjs` MEMBERS and
`scripts/proxy-check.mjs` K_MEMBER_RULES. Measured effect of exactly that pair:
`{"K_members":53,"K_sections":53,"coverage_kimi":10}`; the only K findings are
`K_MEMBERS_DRIFT declared=52 computed=53` and `K_SECTIONS_DRIFT declared=52 computed=53`, which the
`SCORECARD.md` stanza rows 298/299 resolve.

## (d) Basename collision

Live identities (53 after the declaration) audited against `byBasename`: `locks` has **exactly one
owner** (`locks`); `sessions` has exactly one (`sessions`). The only ambiguous basename in the whole K
universe is the pre-existing `kimi-webbridge` (`skills/kimi-webbridge` vs
`plugins/managed/kimi-webbridge`, already documented in `SCORECARD.md` line 317). So this heading is
unambiguous — **only if `locks` is declared `kind: 'dir'`**. Measured counter-example: declaring it
`kind: 'counted'` pulls its live child `locks/sessions` into the identity set, which arms the
`sessions` basename collision (2 owners) and moves `K_members` 53 with `K_sections` 52,
`coverage_kimi` 9 (52/53). It does not steal the existing `sessions` headings (exact identity match
precedes the basename fallback), but a non-empty `locks/` would then inflate `K_members` by one per
child — the wrong counting rule for a lock dir.

## Evidence (commands and outputs, clone at b237e3f)

1. `ls -la ~/.kimi-code/locks` → `drwx------ … locks` containing one `drwx------ sessions` (empty, mtime 2026-10-22 14:03); `ls -1a ~/.kimi-code` → 35 root children incl. `locks`, 8 `config.toml.*.bak` generations.
2. `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json | jq -c '.terms|{K_members,K_sections,coverage_kimi}'` (open bytes) → `{"K_members":52,"K_sections":52,"coverage_kimi":10}`; unrelated pre-existing findings only (`C2_TOTAL_DRIFT`, `AXES_DRIFT coverage`, `PIN_DRIFT`, 3 `PIN_UNPINNED`).
3. After adding `{ id: 'locks/', family: 'K3', path: 'locks', kind: 'dir' }` to K_MEMBER_RULES plus the (c) heading → `{"K_members":53,"K_sections":53,"coverage_kimi":10}`, K findings `K_MEMBERS_DRIFT … 53` and `K_SECTIONS_DRIFT … 53`, zero `K_SECTION_AMBIGUOUS`.
4. Same with `kind: 'counted'` → `{"K_members":53,"K_sections":52,"coverage_kimi":9}` (heading binds nothing; `locks/sessions` is the identity).
5. Identity audit (rules block eval'd from the clone, live root): `members=53 identities=53`, `locks owners=["locks"]`, `sessions owners=["sessions"]`, `ambiguous basenames=[["kimi-webbridge",["skills/kimi-webbridge","plugins/managed/kimi-webbridge"]]]`.
6. `node scripts/kimi-census.mjs` (clone, census unmodified) → `CENSUS error UNLISTED locks … TOTALS: members=52 checked=52 errors=1 info=4 chain=8` → `KIMI_CENSUS: DRIFT (UNLISTED locks)` exit 1.
7. `grep -c "^## " corpus/knowledge/kimi-*.md` → binary-secrets 18, config-plane 7, lane-definitions 25, mcp-plane 6, modes-machinery 12, residue-files 6, **session-state 16**, skills-plugins 18.

## C2 edit surface the heading requires (found while measuring; all at b237e3f)

- `scripts/kimi-census.mjs`: MEMBERS entry (K3); `FROZEN` line 155 `K3: 9` → `10`; USAGE line 167 `(52 members)`; header comments lines 9/24/90; selftest pins 518/522 `members=52` → 53, 528-535 families `4/27/9/9/3` → `4/27/10/9/3` and `members.length === 29` → 30, 546, 701, 717, 739 `members=51` → 52, 806 `(52 → 51)` → `(53 → 52)`, 836 `clean(r,'members=52')`. `fixtureTree()` needs no change (it iterates MEMBERS; `kind:'dir'` creates the empty dir).
- `scripts/proxy-check.mjs`: K_MEMBER_RULES entry; `FX_KIMI_DIRS` gains `'locks'`; fixture arithmetic comment line 1325 (`K3 9 … = 30`) → 31; expectations at 1499, 1608, 1890, 1921, 2048, 2112, 2131 (`30` → `31`).
- `SCORECARD.md`: stanza 298/299 → 53; axes row 317 text `floor(10 × 5/5 × 52/52)` → `53/53` and the round-42 log row.
- No other gate pins the K counts: `grep -rln "members=52\|KIMI_CENSUS" scripts/` → `scripts/kimi-census.mjs` only.
- Live chain is **8** generations now (`CHAIN … generations=8`, never gated); quote `chain=8` in the census CLEAN line, not the stale `chain=7` in `SCORECARD.md` line 317.

## Bounds and unknowns

Observed: file ownership, heading grammar, `locks/` shape (dir, mode 700, one empty `sessions/` child),
all counter outcomes above. Inferred: that `locks/` is Kimi Code's session/install lock root (its
`locks/sessions/<key>` layout matches the `sessions/<wd_*>` keys); **not verified**, and plan C2 forbids
an unsourced declaration — the section body needs a `corpus/SOURCES.md` row opened this round naming
what creates `locks/`, with a located quote ≤ 25 words. If no source opens by ordinary means, C2 stops.
No model calls, no headless browser, no bot-challenge workaround, no tool installs (nothing needed).
Open: the mechanism/source row (outside this item's question); whether the Scope-block renumber is
accepted as part of the same commit (recommended, prose only).
