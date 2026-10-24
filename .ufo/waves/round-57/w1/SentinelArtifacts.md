# SentinelArtifacts — round 57 w1

## Item
Check whether a crafted `corpus/README.md` row can smuggle a `..` path or a double backtick
that maps a file **outside** the corpus namespace (`corpus/knowledge` + `corpus/lessons`);
verify `format-unmapped` / `orphan-row` catches it and that no path escapes the two dirs.
Axes: operability + coverage. Read-only sentinel: no production edit, no commit.

## Verdict
**Escape claim NOT FALSIFIED.** No crafted README row can map, alias, or read a file outside
the two corpus dirs:

- a `..`-bearing row is captured verbatim and rejected as `orphan-row` (DRIFT, exit 1) —
  including the form that normalizes onto a live file (`knowledge/../knowledge/a.md`);
- a row can only ever be *accepted* by exact string equality with a `readdir`-derived label
  `knowledge/<dirent>` / `lessons/<dirent>`, so no accepted row can designate outside;
- strace of the gate over a traversal row proves it opens **no** row-derived path at all
  (0 hits for the canary and for `/etc/passwd`; 0 opens of corpus file contents).

**One Low finding (F1):** the `format-unmapped` net is bypassable by decoration *before* the
path, so a **dangling** decorated row (leading double/triple backtick, emphasis, link, a space
inside the opening backtick, a zero-width space) is silently dropped and the gate prints
`CLEAN`. It cannot map outside, cannot read outside, and cannot hide an unmapped live file
(that direction is caught by `uncovered`) — it breaks the gate's own "never silently dropped"
promise and lets a README display a mapping to a nonexistent file under a CLEAN verdict.

Scored revision `8c6f5b017d149b18134917378cdbed3b492d8e89` (lane HEAD at start and at the
final check; unmoved). Node v24.21.0. `scripts/readme-map.mjs` sha256
`058e5033…c7727`, `corpus/README.md` `75756148…205d`, `.ufo/pins/readme-map.json`
`9ef0cf6e…729c` — identical before and after all probes.

## What was run
Fixtures under `build/SentinelArtifacts/fx*` (own scratch only); gate invoked read-only with
explicit `--registry/--readme/--corpus`. Full transcripts: `01-crafted-rows.txt`,
`03-followup.txt`, `08-adjacent-forms.txt`, `10-extra-forms.txt`, `02-strace.log`,
`07-b10-grammar.txt`; scripts `probe.sh`, `probe2.sh`.

| # | crafted first cell | live files fully mapped? | observed | exit |
|---|---|---|---|---|
| E0 | clean baseline | yes | `CLEAN files=2 rows=2 covered=2` | 0 |
| E1 | `` `knowledge/../../../../canary/secret.md` `` (canary exists on disk) | yes | `DRIFT … bad=1 first=orphan-row:knowledge/../../../../canary/secret.md` | 1 |
| E2 | `` `knowledge/../knowledge/a.md` `` (normalizes onto live a.md) | yes | `DRIFT … first=orphan-row:knowledge/../knowledge/a.md` | 1 |
| E2b | E2 form is the **only** row for a.md | — | `note uncovered:knowledge/a.md` + `first=orphan-row:…` | 1 |
| E3 | ```` ``knowledge/gone.md`` ```` (leading double backtick, dangling) | yes | **`CLEAN files=2 rows=2 covered=2`** | **0** |
| E3b | E3 form on **live** a.md, no normal row | — | `first=uncovered:knowledge/a.md` | 1 |
| E3c | ```` ```knowledge/gone.md``` ```` (triple) | yes | **CLEAN** | **0** |
| E3d | `` `knowledge/gone.md`` `` (trailing double) | yes | `first=format-unmapped:`knowledge/gone.md`` | 1 |
| E4 | `` `knowledge/a.md \| ../..` `` (pipe inside backticks) | yes | `first=orphan-row:knowledge/a.md \| ../..` | 1 |
| E5 | registry `covered` = `knowledge/…/canary/secret.md` | — | `FAIL-CLOSED reason=covered entry malformed` | 2 |
| E6 | registry `covered` = `knowledge/../lessons/b.md` | — | `FAIL-CLOSED reason=covered entry malformed` | 2 |
| E8 | `--corpus` symlink, basename ≠ knowledge | — | `FAIL-CLOSED corpus dir outside the covered namespace` | 2 |
| E8b | `--corpus` symlink **named** `knowledge` | — | `FAIL-CLOSED corpus dir not a directory` (`lstat`, no follow) | 2 |
| E10 / E12a | `` ``…`` ``, ` ```…``` `, `` *`…`* ``, `` **`…`** ``, `` _`…`_ ``, `` [`…`](x) ``, ZWSP+`` `…` `` — all dangling | yes | **CLEAN** for all seven | **0** |
| E10 | bare `` `knowledge/gone.md` `` | yes | `first=orphan-row:…` | 1 |
| E10 | `knowledge/gone.md` (no backticks) | yes | `first=format-unmapped:…` | 1 |
| E11 | `` ` knowledge/gone.md` `` (space inside opening tick) | yes | **CLEAN** | **0** |
| E11 | same decoration, **live** a.md, no normal row | — | `first=uncovered:knowledge/a.md` | 1 |
| E11 | `` `knowledge/gone.md`/x `` (junk after closing tick) | yes | `first=format-unmapped:…` | 1 |

Live lane (read-only), `04-live-lane.txt`: `README_MAP: CLEAN files=135 rows=135 covered=135`
exit 0; `--selftest` → `case format-unmapped: PASS` … `README_MAP_SELFTEST: PASS (14/14)` /
`VERDICT: PASS` exit 0; registry `version 1 covered 135`.
Live README census (`05-live-readme-scan.txt`): 137 table lines, 135 accepted rows, 0
`format-unmapped`, **0 invisible corpus-shaped cells**; accepted paths are 135 unique and all
map to live files. So F1 has no instance at this rev.

## Why no row can designate outside (invariant, code-verified)
- Row capture is `readme-map.mjs:134`: ``/^\|\s*`((?:knowledge|lessons)\/[^`]+)`\s*\|/``.
  ``[^`]+`` admits `..`, spaces, `|`, `\r`, `/` — but captures a **string**; the gate never
  `resolve()`s, `normalize()`s or `open()`s it.
- File labels are `readme-map.mjs:160`: `${base}/${n}` for `n` from `readdirSync(d)` — i.e.
  `knowledge/<dirent>` where a dirent can never contain `/`. Acceptance is exact Set
  membership (`:176-190`), so an accepted row is by construction inside the two dirs, and
  `knowledge/../x` ≠ `knowledge/x` as strings.
- `..` rows therefore always land in `bad` as `orphan-row` (`:184`) — regardless of whether the
  traversal target exists (E1 had a real canary; still DRIFT).
- Registry side (`COVERED_RE` `:73`) forbids `/` after the namespace and is anchored to `.md`,
  so `knowledge/../lessons/b.md` and `knowledge/…/outside.md` are FAIL-CLOSED (E5/E6), never
  silently admitted.
- Corpus dirs: basename must be `knowledge|lessons` (`:148`) and must be a real directory by
  `lstat` (`:151`), so a symlinked dir fails closed (E8b).
- No row-derived read: `strace -f -e trace=openat,open,stat,statx,newfstatat,readlink` over E9
  (traversal rows to a real canary **and** `/etc/passwd`) shows the gate touching only
  `scripts/readme-map.mjs`, `reg.json`, `corpus/README.md`, the two corpus **directories**, and
  the node runtime libs/proc files (`02-strace.log`). Zero hits for `canary/secret.md`, zero
  for `/etc/passwd`, zero opens of `a.md`/`b.md` content.

## F1 — `format-unmapped` is silent for decorated first cells (severity: Low)
**Exploit path.** A corpus contributor adds, inside the coverage table:

```
| ``knowledge/ghost.md`` | orchestration notes | none |
```

Markdown renders that first cell as a code span naming a corpus file; the gate's clean-row
regex (`:134`) fails (second backtick where `knowledge` is expected) and the format probe
(`:137`, ``/^\s*`?(knowledge|lessons)\//``) also fails (after its one optional backtick it sees
the second backtick), so the cell is dropped with **no finding**. With every live file still
mapped, the verdict is `CLEAN files=135 rows=135 covered=135` — E3/E3c/E10/E11 measured this
(`CLEAN`, exit 0, `rows` unchanged). The README can thus display mappings to nonexistent files
while the gate reports a clean bimap, contradicting the gate's own header promise
(`:35`, "never silently dropped").

**Impact / non-impact.** No namespace escape, no read, no false coverage: E3b/E11-live show
that the same decoration on a **live** path yields `uncovered` DRIFT (fail-closed), and
traversal targets stay `orphan-row` when properly quoted (E1/E2). F1 is a README-hygiene
bypass only. It matters for coverage because the frozen counter cannot see it either: B1 runs
selftest case 5 (bare `knowledge/stray.md`, `readme-map.mjs:266-271`) as the **only**
`format-unmapped` evidence; B3's five arms are uncovered/orphan/duplicate/covered-uncovered/
unpinned (`attest57-probe.mjs:177-244`) with **no** format arm; and B10's "independent"
recomputation re-uses the same single-backtick grammar (`attest57-probe.mjs:137-142`), which I
re-ran verbatim over the E3 README: it reads `["knowledge/a.md","lessons/b.md"]`, orphans `[]`
(`07-b10-grammar.txt`) — i.e. gate and B10 agree by sharing the blind spot, so `ATTEST57_HELD`
can hold while the defect is present.

**Smallest remediation (round 58; A57 and the gate pin are frozen this round).** One line in
`loadRows` — widen the format probe to skip any leading decoration before the namespace:

```js
// readme-map.mjs:137 (now)
if (firstCell && /^\s*`?(knowledge|lessons)\//.test(firstCell)) {
// proposed
if (firstCell && /^\s*[`*_~[\]]*\s*(knowledge|lessons)\//.test(firstCell)) {
```

plus one selftest case (`| ``knowledge/ghost.md`` | … |` ⇒ `format-unmapped`) and, in the next
counter version only, one B3 format arm using the decorated dangling form. This is
strictness-only for the format class: it does not change any accepted row, the registry, or
the exit map.

## Observed limits (not defects for this item)
1. `--corpus` is an operator-argv seam, not a README-byte seam: a dir outside the lane whose
   basename is `lessons` is accepted (`E7b`: `CLEAN files=2`). This is required by the hermetic
   selftest (fixtures live under `mkdtemp`) and is not reachable from README content. Both
   counter invocations call the gate with **no** args (`attest57-probe.mjs` B2/B10), so
   `LANE`-relative defaults bind in the extraction tree.
2. `readdirSync` name-only enumeration counts a **directory** named `x.md` (E12c:
   `CLEAN files=2`) and a **symlink** named `link.md` → `/etc/hostname` (E12d:
   `CLEAN files=3`). No content is dereferenced
   (strace), so nothing is read outside; overlaps CriticC1Scope's non-regular-entry point, not
   a new escape.
3. A tab-indented row is invisible to `loadRows` (`^ {0,3}` strips spaces only) but counted by
   B10's `^\s{0,3}` grammar (E12b: gate `CLEAN`, B10-style rows include the dangling path),
   i.e. the counter reads UNMET
   (fail-closed) rather than forging HELD. Crafted-README self-DoS at worst; not an escape.

## Lane integrity
`git status --porcelain -- scripts corpus .ufo/pins` → 0 lines before and after
(`00-env.txt`, `09-final-integrity.txt`); HEAD `8c6f5b01…` unmoved; the three production
sha256 values unchanged. All writes confined to
`build/SentinelArtifacts/` (fixtures, scripts, transcripts, one canary file) and this report.
No commit/push/jj, no `.ufo/state`, no sibling repo, no pacman/network/subagent.

## Limits / inference
- Fixtures are 2-file hermetic trees run against the lane gate; the live 135-row README was
  additionally measured read-only and is clean. F1's non-impact on live files is measured
  (E3b/E11), not inferred.
- [INFERENCE] Any decoration invisible to both `:134` and `:137` inherits F1; the seven forms
  tested are representative (backtick runs, emphasis, link, space-inside-tick, ZWSP), not
  exhaustive over Unicode.
- B10's grammar was re-implemented verbatim for `07-b10-grammar.txt`; the frozen probe itself
  was not executed by this seat (no receipts at this rev, and the counter's verdict is not this
  item).
- Sibling overlap: `ExecMapFormat` owns the bare no-backtick arm; `CriticC1Scope` owns nested
  dirs and non-regular entries. This seat's delta is the **dangling decorated** row and the
  strace non-read proof.

## Ops
No installs or updates (none needed); no pacman, no network, no subagents. Report trailer
`.ufo/waves/round-57/w1/SentinelArtifacts.md`.
