# SentinelRegistryPaths — registry-input attack report (R57, wave 1)

- Lane: `kumitate-shokunin`; measured rev `8c6f5b017d149b18134917378cdbed3b492d8e89` (tree `877d9298…`), worktree unchanged, HEAD not moved.
- Surface: `covered` entries of `.ufo/pins/readme-map.json` and the registry container/file-type, as consumed by `scripts/readme-map.mjs` (`kumitate-readme-map-v1`).
- Evidence: `.ufo/waves/round-57/build/SentinelRegistryPaths/` (index in `evidence.md`). No production file, pin, probe, receipt or git/jj state touched; all mutations in scratch copies under that build dir; the scratch `git init` repo lives there too.
- Sources: none assessed — this item is a purely local registry surface, so no URL/quote/tier applies.

## Verdict on the assigned claim

**Corroborated for registry entries, with two low-severity defects at the layer below.** Every one of the named entry attacks is rejected fail-closed or surfaced as DRIFT; zero of 54 measured cases silently accepted an injected entry. The silent-acceptance window that does exist is **not** in entry validation: it is that corpus members are compared by *name only*, so a `covered` entry (or README row) can name a directory or a symlink and still be scored `CLEAN`.

## Method

`loadRegistry` (readme-map.mjs:80–117) is a single-pass validator: `lstat` regular-file check → JSON parse → object/array shape → `version !== 1` → `covered` array → per-entry `typeof p === 'string'` + `COVERED_RE = /^(knowledge|lessons)\/[A-Za-z0-9._-]+\.md$/` + exact-string duplicate set. Because the regex class excludes `/`, `.` is the only separator-like character and `..` cannot form a traversal segment; because `evaluate` additionally requires `covered ⊇ live files` and `covered ⊆ live files`, a regex-legal but non-existent name can only reach `stale-covered` DRIFT. I verified both properties by measurement, not by reading alone.

Harness: copy of `corpus/{knowledge,lessons}`, `corpus/README.md`, `scripts/readme-map.mjs`, shipped registry into a scratch tree; one registry variant per case; explicit `--registry/--readme/--corpus` argv; recorded exit code, verdict token and last line (`harness.mjs`, `results.json`).

## Measured matrix (54 cases, 54 as contracted, 0 silent)

| class | n | result |
|---|---|---|
| baseline (shipped registry) | 1 | `CLEAN files=135 rows=135 covered=135` exit 0 |
| `../` traversal (`knowledge/../scripts/x.md`, `knowledge/../../../../etc/passwd.md`, `lessons/../../corpus/knowledge/a.md`) | 3 | exit 2 `covered entry malformed` |
| absolute (`/etc/passwd.md`, absolute lane path to a live doc) | 2 | exit 2 |
| subdir (`lessons/sub/x.md`, `knowledge/sub/…`) | 2 | exit 2 |
| duplicate (one extra, two extra) | 2 | exit 2 `covered entry duplicated` |
| non-string (`42`, `null`, `true`, object, array) | 5 | exit 2 |
| format evasions (empty, `knowledge/` only, `//`, `./`, trailing `/`, trailing NUL, trailing `\n`, leading space, `Knowledge/`, backslash, `%2e%2e`, `knowledgex/`) | 12 | exit 2 |
| valid shape, no file (`knowledge/definitely-not-here.md`, `knowledge/..md`) | 2 | exit 1 `stale-covered` |
| container/schema (`covered` string/object, version absent/`2`/`"1"`/`null`) | 6 | exit 2 |
| `covered: []` while corpus present | 1 | exit 1 `unpinned`, 135 findings, never vacuous CLEAN |
| schema, benign | 3 | `version: 1.0` → CLEAN; extra key → CLEAN; `__proto__` payload key → CLEAN |
| registry file type (dir, symlink→valid JSON, dangling symlink, `/dev/null`, non-JSON, zero bytes, truncated JSON) | 7 | exit 2 `registry not a regular file` / `not valid JSON` |
| corpus-member types (below) | 8 | see F1 |

Notable details:
- `version: 1.0` is accepted because JSON has one number type and `1.0 === 1`; contract-compatible, recorded as a boundary rather than a defect.
- `knowledge/..md` is not traversal: it is a regex-legal literal top-level name and, absent the file, DRIFTs. Its acceptance would require a real file of that name, which `readdirSync` would then also list — self-consistent.
- CLI: `--registry` with no value and unknown flags → exit 64; a repeated `--registry` is silently last-wins (`cli-probes.txt`), operator-only surface.

## F1 — corpus members are never type-checked; `covered` may name a non-file (LOW, coverage integrity)

**Exploit path.** `loadFiles` (readme-map.mjs:144–166) does `readdirSync(d)` and keeps every name ending `.md`; it never `lstat`s the member and never opens it. `evaluate` then compares *names* only. Consequence: `corpus/knowledge/x.md` being a directory, a dangling symlink, or a symlink to a file outside the corpus is indistinguishable from a live doc.

Measured (`ratchet-bypass.txt`, `corpus-member-findings.ndjson`):
- Delete `corpus/knowledge/agent-isolation-substrates.md` (29 506 bytes) and `mkdir` a directory of that name; registry and README untouched → `README_MAP: CLEAN files=135 rows=135 covered=135` exit 0, while `readFileSync` on the path returns `EISDIR` (`stat`: `directory 0`).
- Control: plain deletion of the same doc with row+pin untouched → `DRIFT files=134 … first=orphan-row:…` exit 1. So disappearance is detected only when the *name* disappears.
- New directory member `lessons/zdirmember.md` + row + `covered` → `CLEAN files=136` (lstat: `isDirectory=true`).
- Dangling symlink `knowledge/zlinkdang.md -> /nonexistent/target.md` + row + `covered` → `CLEAN files=136`; the same symlink without row/pin → `DRIFT uncovered` (so membership is policed, type is not).
- Symlink to `/etc/hostname` and sibling-file symlink + row + `covered` → `CLEAN files=136`.
- Corpus *directory* as a symlink → exit 2 `corpus dir not a directory` (lstat guard present for the directory, absent for its members).

**Impact.** The gate certifies coverage of a path that has no readable bytes. A same-name substitution (`mv`/`rsync`/`git checkout` collision leaving a directory, or a doctored symlink) keeps the map CLEAN and `stale-covered` can never fire. This falsifies the header claim that "a corpus file can never lose its row or disappear silently again" (readme-map.mjs:27–29) for the substitution case. No privilege boundary is crossed — the writer must already be able to write `corpus/` and the registry — so severity is LOW, but the failure is exactly the drift class C1 exists to make mechanical, and it propagates to `proxy-check`'s C2 counts (a directory still counts as one file).

**Smallest remediation** (not applied — remediation scope not granted): in `loadFiles`, skip non-regular members so the existing rules fire unchanged:

```js
for (const n of names) {
  if (!n.endsWith('.md')) continue;
  let st; try { st = lstatSync(join(d, n)); } catch { continue; }
  if (!st.isFile()) continue;          // directory / symlink / device: not a doc
  files.push(`${base}/${n}`);
}
```

Skipping (rather than FAIL-CLOSED) is the smallest fix because a substituted name then yields `orphan-row` (README row with no file) plus `stale-covered` (pin with no file) — both already-defined DRIFT findings, exit 1, no new finding type, no schema change. Note this changes gate bytes, so the round that applies it must re-mint `pin.readme-map`/`counter-pins` per the plan's existing re-pin mechanism.

## F2 — the committed case set does not pin duplicate-covered or format strictness (LOW, instrument coverage)

**Exploit path.** A57 constrains registry validation behaviorally only through B4's five arms — malformed JSON, `version: 2`, `covered: 'x'`, `covered.push('scripts/escape.md')`, missing README (attest57-probe.mjs:247–266) — and through B1's 14 hermetic selftest cases (`selftest.txt`), which contain no duplicate-`covered`, traversal, absolute, subdir or non-string entry. B2's own predicate is *looser* than the gate (`/^(knowledge|lessons)\/.+\.md$/`, probe:167–168). B10's independent recomputation compares set membership only (probe:397–409) and has no duplicate or format term. So the per-entry rules are protected today only by B5/B6 byte pins — and those are re-minted by design whenever the gate is amended.

Measured with the frozen counter on a scratch repo of the HEAD tree (`mutD-lane/`; control `probe-control.txt` = `ATTEST57_HELD held=10/10`):

- **MUT-D** — delete the `seen.has(p)` duplicate branch: gate on shipped corpus + one duplicated `covered` entry → `README_MAP: CLEAN files=135 rows=135 covered=136` exit 0 (two duplicates → `covered=137`, still CLEAN). Frozen A57: `held=8/10 | B1 PASS | B2 PASS | B3 PASS | B4 PASS | B5 MISS pins=14 misses=["readme-map","readme-map-pin"] | B6 MISS … | B7..B10 PASS`. The only misses are the byte pins; no behavioral arm notices a registry that silently accepts duplicates.
- **MUT-R** — relax `COVERED_RE` to `/^(knowledge|lessons)\/.+\.md$/`: traversal and subdir entries downgrade from exit 2 to exit 1 `stale-covered`; B4 arm (d) still exits 2 (`scripts/…` has no prefix), so `B1–B4, B7–B10` all PASS and again only B5/B6 miss (`probe-mutR.txt`).

**Impact.** The next legitimate gate revision that re-pins the instrument can regress duplicate detection (silent CLEAN with `covered` longer than `files`) or the FAIL-CLOSED-vs-DRIFT distinction for malformed entries, and A57 would still print `held=10/10 checks=10`. The failure mode is not present in the shipped gate — it rejects all 26 malformed entry injections measured here and surfaces the two valid-shape/no-file names as `stale-covered` — so this is a ratchet gap in the instrument, on the coverage axis: no committed case would fail if a future revision stopped enforcing those rules.

**Smallest remediation** (not applied): extend the committed case set, no production code change.
1. Four selftest cases in the existing `fixture` style: duplicate `covered` → exit 2; `knowledge/../scripts/x.md` → exit 2; `lessons/sub/x.md` → exit 2; `covered: [42]` → exit 2 (raises the count 14 → 18; B1 only requires `>= 12`, so the frozen predicate is unaffected).
2. One extra arm inside B4: `d.covered.push(d.covered[0])` → exit 2. B4 stays a single check with six internal arms, so the frozen sentence `held=10/10 checks=10` remains byte-identical.

## Informational boundaries (no action implied)

- `version: 1.0` and extra top-level keys are accepted; the contract pins `version` numerically and does not require a closed schema. `__proto__` as a JSON key is inert (`JSON.parse` makes it an own data property; nothing merges the doc).
- Repeated `--registry` is silently last-wins; argv is operator-supplied and every evaluated path is explicit, so this is CLI hygiene only.
- No external source was assessed for this item; the frozen S117–S120 rows are untouched.

## Limits of this report

- I did not re-run the full A57/D57 predicates against the lane rev beyond the control run on a scratch copy of the HEAD tree (`probe-control.txt`, 10/10) — the frozen probe needs a git repo and I kept all git work in the scratch repo. The lane rev itself was only read.
- Findings are limited to the registry-input surface; README row-parsing (fenced/duplicate rows, `format-unmapped` shapes) and `proxy-check`'s C2 count term were out of scope and are not judged here.
- F1's severity assumes the same-writer threat model implied by the lane (a writer who can edit `corpus/` can edit the registry); if the registry is treated as a higher-integrity pin than `corpus/`, the substitution path becomes a way to keep the pin satisfied while the pinned doc is gone — still bounded by the write requirement.
