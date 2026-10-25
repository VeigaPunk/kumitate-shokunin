# CritC2 subcase 7 — reproduction of frozen D61 v1 forgery (HELD 6/6)

Wave: round-62 w2 · Agent: L1Kumitate62.CritC2UnrelatedRow · Scope: reproduce round-61 C2 subcase 7 behavior in scratch only; no edits/commits/tests in any lane repo. Lane jj/git state untouched.

## Setup (scratch only)

- Scratch fleet root: `/tmp/kumitate-r61-w2/fleet/` (`shokunin.conf` with `LANES="…kumitate|kumitate-shokunin|…"`, `SHOKUNIN_ROOT=/tmp/kumitate-r61-w2/fleet`).
- Lane clone: `/tmp/kumitate-r61-w2/fleet/kumitate-shokunin`, cloned from the frozen bundle `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle`; HEAD = `4247d2da937842bd6846874d548b7125b356e14c` ("A5 forgery") on top of `be4a820` (lane @ round-61).
- Frozen probe: `.ufo/waves/round-61/probe/doctrine61-probe.mjs` (D61 v1) run unmodified.
- No tools installed/updated.

## Named frozen-probe behaviors (each reproduced in scratch)

### 1. JS POSIX-class row regex
Probe lines 17/21: `/^\|[[:space:]]*S195[[:space:]]*\|/`. JS has no POSIX classes; `[[:space:]]` is a literal class over `[ : s p a c e ]`:

```
regex "| S195 |"  -> false
regex "|:S195:|"  -> true
regex "| S195 | x |" -> false
```

Honest `| S195 |` never matches (space not in class); a forged row can match by putting `:` right after the pipe. The phantom row exploits this.

### 2. Shifted SOURCES cell indices
Probe E3 reads `c[9]==='mined' && c[10]==='2026-10-25' && c[12]===ep`. On the 11-column contract row (`NF=13`), those cells are opened/recheck/trailing-empty:

```
contract cells: c[8]="queued" c[9]="2026-10-01" c[11]="—" c[12]=""
phantom cells:  c[9]="mined" c[10]="2026-10-25" c[12]="corpus/knowledge/temporal-worker-versioning-pinning.md"
```

E3/E5 are jointly unsatisfiable for any census-valid Registry row (census requires `NF=13` and id `^S[0-9]{3,}$`; the phantom's id `:S195:` would trip E02, and its 13 pipes exceed NF=13). The phantom lives **outside** `## Registry`, so census never parses it.

### 3. Arbitrary bytes with a matching invented digest
`body.md` = `fabricated capture: no source was opened\n` (one line, committed in the forgery rev). Its full sha256 is written as the row's pin:

```
body.md sha256=15841c50876fe839f1a3bc8d31a77a9c3ccbb1f60f9a67a0f2c6e1fe0249f75d
row pin=sha256 15841c50876fe839f1a3bc8d31a77a9c3ccbb1f60f9a67a0f2c6e1fe0249f75d
```

E4 passes because the pin is simply the digest of whatever bytes sit in the worktree capture file (probe reads the worktree path, not the rev).

### 4. Lane-root census exit
Probe E5 default (`--root <lane>`) vs fleet root:

```
$ sources-census.sh validate --root /tmp/kumitate-r61-w2/fleet/kumitate-shokunin kumitate
ERROR: config not found: /tmp/kumitate-r61-w2/fleet/kumitate-shokunin/shokunin.conf
ERROR: unknown lane (not a dir, not in conf or root): kumitate
exit=2

$ sources-census.sh validate --root /tmp/kumitate-r61-w2/fleet kumitate
kumitate	ok	/tmp/kumitate-r61-w2/fleet/kumitate-shokunin/corpus/SOURCES.md
exit=0
```

(Also reproduces the E5 MISS exit=2 default: `DOCTRINE61_UNMET held=5/6`.)

### 5. Mutable live census vs measured rev
Census reads the live worktree; `git show <rev>:` is never consulted. Appending one malformed row to the worktree `corpus/SOURCES.md` (rev unchanged) flips census:

```
kumitate	E12	S999 row outside Registry section
census exit=1
```

while `git show 4247d2d:corpus/SOURCES.md | tail -1` still prints the intact phantom forgery line (worktree restored afterward; `git status` clean).

### 6. README working-tree map
E6 mixes rev with worktree: `mapped` from `git show rev:corpus/README.md`, but `readme-map.mjs` runs on the worktree. Deleting the two forged README rows in the worktree only (rev unchanged):

```
README_MAP: DRIFT files=147 rows=145 covered=147 bad=2 first=uncovered:knowledge/temporal-worker-versioning-pinning.md
readme-map exit=1
```

`mapped` (from rev) stays true. Worktree restored.

### 7. Fake non-Registry row
The phantom `|:S195:| …` line is appended at EOF of `corpus/SOURCES.md`, outside any `## Registry` section. Census E12 only fires on `^\|[ \t]*S[0-9]{3,}[ \t]*\|`; the colon after the pipe escapes it, so census reports `kumitate ok` exit=0 while the probe's E3 `find()` matches the line.

### 8. Partial-hash acceptance
E4: `pin.includes(sha.slice(0,16))` — only the first 16 hex chars of the digest are compared:

```
partial-hash acceptance pin.includes(sha.slice(0,16)) -> true
```

## Composition (subcase 7) — verbatim run

```
$ node doctrine61-probe.mjs /tmp/kumitate-r61-w2/fleet/kumitate-shokunin 4247d2d --census-root /tmp/kumitate-r61-w2/fleet
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=4247d2d rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 15841c50876fe839f sha=15841c50876fe839
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
probe exit=0

$ sources-census.sh validate --root /tmp/kumitate-r61-w2/fleet kumitate
kumitate	ok	/tmp/kumitate-r61-w2/fleet/kumitate-shokunin/corpus/SOURCES.md
exit=0
```

Identical to the frozen receipt `controls/ctl-c2-critic-a5-full-forgery-held.txt` (line 11, 12–17; exit=0). The build has **no S195 line inside `## Registry`**, a fabricated `body.md`, and an un-re-grounded entry (header rewritten `S217→S195`, date `2026-10-23→2026-10-25`, `recheck` still `(ran 2026-10-23)`, body still cites S217).

## Does subcase 7 independently prevent D61 from verifying?

Yes. Subcase 7 is self-contained: every named defect is exercised by a single craft rev that yields `DOCTRINE61_HELD 6/6` with exit 0. Because the composition requires no census-valid Registry row (E3 is satisfiable only by the off-Registry phantom), no honest build can satisfy E3 while a forged build can satisfy all six — so **any** `DOCTRINE61_HELD` verdict under v1 is forgery-satisfiable and reversible honest provenance. This holds independently of the other C2 subcases: fixing only E2/E4/E5/E6 would not repair E3's regex/cell mismatch, and fixing only E3 would not repair the worktree-vs-rev measures. D61 v1 therefore cannot verify (distinguish honest from forged) even if every other subcase is set aside; the judge must reject a v1 HELD at face value.

## Residual risk / verification gaps

- The run relied on the frozen bundle for the forgery commit; the bundle itself is the check artifact from round 61 (in lane repo, `controls/`), and the scratch clone's HEAD matches receipt rev `4247d2d` byte-for-byte.
- Worktree mutation demos (5, 6) were performed and restored on the scratch clone only; verified `git status --porcelain` empty afterward and probe re-run green.
- No claim is made about D61 v2 or about other wave verdicts.
