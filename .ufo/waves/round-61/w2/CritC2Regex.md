# CritC2Regex — round 61 w2, C2 subcase 1 falsify: JS POSIX-class row regex

**Falsified claim** (w1 `CritControlC2.md` defect 1): probe row regex
`/^\|[[:space:]]*S195[[:space:]]*\|/` is bogus — JS has no POSIX `[[:space:]]`; it
accidentally accepts the malformed row shape that the census rejects and never matches a
real contract row.

**Verdict: reproduced, both directions, in scratch.** `E3` alone makes D61 v1 unverifiable
(see "Prevents D61 verifying?" below).

## Setup (scratch only)

- Scratch: `/tmp/kumitate-r61/CritC2Regex/fleet` (fleet root w/ `shokunin.conf`; clone of
  lane @ `be4a820`). Lane repo read-only; only scratch commits created.
- Honest build rev `30e3b52`: worktree overlay of the live lane state — contract 11-column
  S195 row (`SOURCES.md:147`), `corpus/knowledge/temporal-worker-versioning-pinning.md`
  entry, `corpus/README.md` map row, capture
  `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`.
- Frozen probe: `.ufo/waves/round-61/probe/doctrine61-probe.mjs` (verbatim, unmodified).
- Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
  /tmp/kumitate-r61/CritC2Regex/fleet kumitate`.

## 1. regex truth table (node v24.21.0, verbatim probe regex)

```js
const re = /^\|[[:space:]]*S195[[:space:]]*\|/;   // probe lines 17 and 21
```

| Candidate row | `re.test` |
|---|---|
| `\| S195 \|` honest contract row, single spaces | false |
| `\|\tS195\t\|` tab-separated | false |
| `\|S195\|` no whitespace | false |
| `\|  S195  \|` double spaces | false |
| `\|:S195:\|` probe-shaped forgery | **true** |
| `\|[S195a\|` class chars | **true** |
| `\|s]]]S195c]\|` class char + literal `]` run | **true** |
| `\|:]]S195:\|` colons + literal `]]` | **true** |
| `\|::S195::\|` two colons | false |
| `\|x S195 \|` non-class char | false |

Interpretation: `[[:space:]]*` parses as class `{[, :, s, p, a, c, e}`, then a literal
`]`, then `*` on the literal `]`. I.e. exactly one of `[ : s p a c e` after `|`, then any
number of literal `]`. No whitespace of any kind is accepted. (`node -e` one-liner
replayed; full table in `regex-truth-table.txt`.)

## 2. honest rev 30e3b52 — probe E3 false negative

```
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2Regex/fleet/kumitate-shokunin 30e3b52 --census-root /tmp/kumitate-r61/CritC2Regex/fleet
DOCTRINE61: DOCTRINE61_UNMET held=3/6 checks=6 rev=30e3b52 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 MISS mapped=true readme-map=1 README_MAP: note unpinned:knowledge/temporal-worker-versioning-pinning.md
exit=1
```

The honest row IS committed at that rev:
```
$ git show 30e3b52:corpus/SOURCES.md | grep -n 'S195' | head -1
147:| S195 | Worker Versioning — Temporal documentation — https://docs.temporal.io/worker-versioning.md | docs | A | ...
```
`E3` reports `row-absent` anyway (regex rejects `| S195 |`). The same regex on the live lane
worktree row:
```
$ node -e 'const re=/^\|[[:space:]]*S195[[:space:]]*\|/; const l=require("fs").readFileSync("corpus/SOURCES.md","utf8").split("\n")[146]; console.log(re.test(l));'
false
```
(Note: `E4` uses the same regex to locate the row, so it also can't see the honest row; the
`pin=` blank shows it never extracted the row's `sha256` token. `E4`'s partial-hash
acceptance is a sibling subcase.)

## 3. phantom malformed row — E3 passes, census ignores

`|:S195:| x | x | x | x | x | x | x | mined | 2026-10-25 | x | corpus/knowledge/temporal-worker-versioning-pinning.md |`
(12 cells, col 0, directly after `## Leads` — outside `## Registry`), rev `a04d9b4`:

```
$ sources-census.sh validate --root /tmp/kumitate-r61/CritC2Regex/fleet kumitate
kumitate	ok	/tmp/kumitate-r61/CritC2Regex/fleet/kumitate-shokunin/corpus/SOURCES.md
exit=0

$ node doctrine61-probe.mjs ... a04d9b4 --census-root /tmp/kumitate-r61/CritC2Regex/fleet
DOCTRINE61: DOCTRINE61_UNMET held=4/6 checks=6 rev=a04d9b4 rule=D61
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E5 PASS exit=0
exit=1
```

Same row shape inside `## Registry` (rev `f256936`) flips census to exit=1:

```
$ sources-census.sh validate --root /tmp/kumitate-r61/CritC2Regex/fleet kumitate
kumitate	E01	:S195: fields=12
kumitate	E02	:S195:
exit=1
```

So E3's only satisfiable row shape is the shape the census rejects (E01/E02 in-Registry) or
ignores (outside Registry). Matches w1 receipt `ctl-c2-critic-a3-malformed-row-census.txt`
(variants 4/5).

## Prevents D61 verifying? — Yes

The regex defect alone, independent of the cell-offset defect (sibling subcase), makes the
v1 D61 verdict unverifiable:

- **No honest row can pass E3.** Real `| S195 |` rows contain spaces; the regex cannot
  match any whitespace. `E3 MISS row-absent` on every census-valid Registry row.
- **Every E3 pass is a malformed/off-Registry row.** The only shapes the regex accepts
  (`|:S195:|` etc.) are the shapes the census flags (E01/E02, exit=1) or silently ignores
  (outside `## Registry`).
- The w1 strongest counterexample (a5, full HELD 6/6) is exactly the "census ignores"
  branch + sibling defects; the regex supplies its E3 leg.

Any `DOCTRINE61_HELD` under frozen v1 is therefore either forged or smuggled off-Registry —
false provenance by construction. E3 cannot be fixed without changing the regex
(disclosed v2: `/^\|\s*S195\s*\|/` scoped to `## Registry` lines, per w1 smallest-safe
correction); until then D61 v1 cannot verify anything.

## Artifacts

- `/tmp/kumitate-r61/CritC2Regex/regex-truth-table.txt` — full truth-table output.
- Scratch revs: `30e3b52` (honest), `a04d9b4` (phantom outside Registry), `f256936`
  (phantom inside Registry). Lane jj/git state untouched; no tools installed.
