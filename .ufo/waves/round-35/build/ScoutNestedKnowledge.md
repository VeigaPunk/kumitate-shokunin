NESTED depth_rules=proxy-check:C2=inf(recursive;prunes .git),sources-check:knowledge=1(flat),cite-check:corpus=inf(recursive;prunes node_modules/.git/target/.ufo) gap=yes

# Nested-knowledge boundary — `corpus/knowledge/**` at depth > 1

Scope: `scripts/proxy-check.mjs` (C2 counting), `scripts/sources-check.mjs` (header/legacy rules),
`scripts/cite-check.mjs` (corpus doc walk), plus `scripts/claims-check.mjs` because proxy imports its
S/R probe in process (`proxy-check.mjs:28`). Read-only; lane commit `1770305fae20`.

## 1. Live state (observed)

```
$ find corpus -mindepth 2 -type d          # nothing
$ find corpus -name '*.md' | wc -l         # 81
$ find corpus -mindepth 2 -name '*.md' | wc -l   # 78  (40 knowledge + 38 lessons)
$ ls corpus/*.md                           # QUALITY.md README.md SOURCES.md
```

No depth > 1 entry exists under `corpus/knowledge` today; every note is a direct child.

## 2. Exact boundary per tool

| tool | root | depth | extension | prune / skip | line refs |
|---|---|---|---|---|---|
| proxy-check C2 | `corpus/knowledge` + `corpus/lessons` | unbounded | `.md` | `.git`; symlinks dropped | `284`, `495-505`, `508-514`, `512`, `750` |
| sources-check | `corpus/knowledge` only | **1 (flat)** | `.md` | none (no recursion exists) | `6`, `341`, `344-347`, `359-364` |
| cite-check docs | `corpus` (both dirs) | unbounded | `.md` | `node_modules`, `.git`, `target`, `.ufo`; symlinks | `121`, `280-297`, `290`, `292`, `311-321`, `316` |
| claims-check notes (imported by proxy) | `corpus/knowledge` / `corpus/lessons` | **1 (path-join only)** | `.md` | stem charset rejects `/` | `96`, `241-247` |

Details:
- proxy `walkFiles` recurses (`proxy-check.mjs:501`), skipping only a `.git` component (`:497`);
  `listCorpusNotes` (`:508-514`) keeps `rel.endsWith('.md')` (`:512`). `C2_total = notes.length`
  (`:750`) — a full recursive census. `kSections` (`:696`) also walks `corpus/knowledge` recursively,
  so a nested `kimi-*.md` can feed `K_sections`.
- sources-check lists exactly one level: `readdirSync(knowledgeDir, { withFileTypes: true })`
  filtered to `entry.isFile() && entry.name.endsWith('.md')` (`sources-check.mjs:344-347`). Header and
  legacy rules (`:359-364`) run only over that list. `LEGACY_KNOWLEDGE_FILES` is 38 exact
  `corpus/knowledge/<name>.md` strings (`:62-101`); no nested path could ever match it.
- cite-check `walk` recurses with `maxDepth = Infinity` (`cite-check.mjs:280`, `:292`), dropping
  symlinks and `EXCLUDE_DIRS` (`:121`, `:290`); `listDocs` walks `corpus` and keeps `.md` (`:311-321`,
  `:316`), then `runCheck` analyzes every returned doc (`:1540`).
- claims-check resolves a row's note only as `${dir}/${stem}.md` with
  `/^[A-Za-z0-9_.\-]+$/` on stem (`claims-check.mjs:241-247`) — it cannot name a nested note.

## 3. Asymmetry matrix ("counted" = enters that tool's census / is analyzed)

| path under `corpus/knowledge/` | proxy C2 | sources-check | cite-check |
|---|---|---|---|
| `<dir>/note.md` (ordinary dir) | **YES** (`C2_total`) | **NO** (never enumerated) | YES (analyzed) |
| `node_modules|target|.ufo/…md` | **YES** | **NO** | **NO** (pruned) |
| `.git/…md` | **NO** (pruned `:497`) | **NO** | **NO** |
| symlink `note.md` at depth 1 | NO (Dirent `isFile` false) | NO (`isFile` false) | NO (explicit skip) |
| `note.txt` (non-`.md`) | NO | NO | NO |
| `corpus/lessons/<dir>/note.md` | YES | N/A (lessons never read) | YES |

So yes: a nested `.md` is counted by one tool and not another — and the header/legacy gate is the flat
one. `.git` and symlinks are consistently dark in all three; non-`.md` is consistently ignored.

## 4. Empirical A/B (pinned copy under private scratch, since removed)

Copy made without touching the lane: `git -C <lane> archive 1770305fa | tar -x -C <scratch>/self`.
Baseline on the copy reproduced the frozen baseline exactly (`sources legacy=38`; `proxy C2_total=78`).

Probes added to the copy only:
`corpus/knowledge/nested/deep.md` (no `source:` header), `corpus/knowledge/nested/kimi-nested.md`,
`corpus/knowledge/node_modules/pkg/pkg.md` (no header).

- sources-check, before → after: **byte-identical** `{"verdict":"CLEAN",... "entriesWithSource":2,
  "legacy":38}`, zero findings. The headerless nested note and the `node_modules` note are invisible:
  **no `ENTRY_HEADER_REQUIRED`**.
- proxy-check: `C2_TOTAL_DRIFT declared=77 computed=78` → **`computed=81`** (+3): every nested file is
  counted, including the headerless one and the one under `node_modules`.
- cite-check `--json`: `docs` 82 → **84**; `corpus/knowledge/nested/deep.md` and
  `nested/kimi-nested.md` are analyzed (`deep.md` produced
  `UNRESOLVED scripts/definitely-absent.mjs`), while `node_modules/pkg/pkg.md` is absent from `files`.

## 5. Second defect exposed: C2's numerator and denominator have different authorities

`C2 = countLines(readmeText, /^\| `(knowledge|lessons)\//)` (`proxy-check.mjs:328`, `:749`, read at
`:1026`); `C2_total = notes.length` (`:750`). README rows are never cross-checked against the walk.
Observed in the copy:

- append `| \`knowledge/nested/deep.md\` | … |` → `C2` 77 → 78 while `C2_total` stays 81 and
  sources-check still never validates that file's header;
- append `| \`knowledge/does-not-exist.md\` | … |` → `C2` 78 → **79** with no file at all.

No tool reconciles README rows with the note set: sources-check reads only `corpus/SOURCES.md`
(`sources-check.mjs:6`), cite-check does not read README claims. A nested note with a README row is
score-neutral *and* header-unchecked; a phantom row inflates the numerator.

## 6. Why it matters for operability / coverage

- `coverage = floor(10 * C1/C1_total * C2/C2_total)` (`proxy-check.mjs:749-750`, `coverageOf`). A
  nested note (no README row) lowers the coverage term without any named rule; `C1` cannot compensate
  because claims-check cannot resolve a nested note to a member section (it is also excluded from
  `S_sections`). So nested notes can only depress the score, never raise it — while the header gate,
  the one check meant to keep notes sourced, reports CLEAN.
- The reverse direction is worse for citation integrity: `corpus/knowledge/.ufo/x.md` (or
  `node_modules/…`) is counted by proxy but never citation-checked by cite-check, so its claims are
  unverified by every gate that reads the corpus.

## 7. Remaining unknowns / limits

- No fourth keeper found: `scripts/kimi-census.mjs` and `scripts/round-gate.mjs` contain no
  `corpus/knowledge` references (grep, no output). `scripts/surface-probe.mjs` was not inspected
  beyond grep for `corpus/knowledge` (none).
- Symlink row in §3 is from code (`Dirent.isFile()` false for symlinks), not executed.
- I did not test `corpus/lessons` nesting end-to-end; code path is the same `listCorpusNotes` walk.
- Experiment copy was deleted after measurement; no lane file, index, or jj state was touched.

## 8. Commands actually run (excerpt)

```
node scripts/sources-check.mjs --self <copy> --json            # CLEAN, entriesWithSource=2 legacy=38
node scripts/proxy-check.mjs --self <copy> --src /fast/scratch/kumitate-r35/src [--json]
node scripts/cite-check.mjs  --self <copy> --src /fast/scratch/kumitate-r35/src --json
node scripts/sources-check.mjs --selftest                      # SOURCES_SELFTEST 46/46 pass
```

No tools installed or upgraded (nothing needed).
