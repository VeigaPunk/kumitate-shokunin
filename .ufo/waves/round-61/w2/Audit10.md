# Audit10 — Source-Hash — round 61 w2

Scope: independently hash
`.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` and compare
with the SOURCES row and the source-captures pin. Scribe output not trusted;
every claim below was re-measured in this seat's shell. Axes: operability,
coverage.

## Independent hash (this seat, 2026-10-25)

```
sha256sum body.md = 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc
wc -c body.md     = 9645
```

- **SOURCES row**: `corpus/SOURCES.md:147` `| S195 |` pin cell reads
  `sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` —
  **MATCH**, full 64 hex.
- **source-captures pin**: `.ufo/pins/source-captures.json` entry
  `"sourceId": "S195"` → same sha256, `"bytes": 9645`, path ==
  the file hashed — **MATCH**. File is valid JSON (`json.tool` OK); S195 is
  the sole entry referencing this path.
- **Teaches cell**: byte-exact contiguous substring of the capture —
  `grep -cF` → 1, at `body.md:39`; anchor heading `### Pinned Workflows` at
  `body.md:37`. Row is well-formed: `awk -F'|'` → NF=13 (11 cells).
- **used-by target**: `corpus/knowledge/temporal-worker-versioning-pinning.md`
  exists (3057 B), frontmatter `source: S195`, `verified-at: 2026-10-25`,
  `recheck:` present; `corpus/README.md` maps it (row :182);
  `.ufo/pins/readme-map.json` lists it.
- **Stability**: pin written 06:47Z, capture 06:40Z; hash identical now → no
  post-pin drift on disk.

Verdict on the narrow claim: **pin ⇔ row ⇔ bytes all agree — confirmed.**

## Findings

**F1 — the entire S195 chain is working-tree only; the capture is untracked
(provenance gap, blocks honest E4).** At HEAD none of it exists:
`git show HEAD:corpus/SOURCES.md | grep -c S195` → 0;
`git show HEAD:.ufo/pins/source-captures.json | grep -c S195` → 0;
`git status` → ` M corpus/SOURCES.md`, ` M .ufo/pins/source-captures.json`,
`?? .ufo/waves/round-61/build/` (whole build dir untracked, incl. `body.md`),
entry file untracked too. Meanwhile `probe/doctrine61-probe.mjs:21` reads the
row via `git show <rev>:corpus/SOURCES.md` but hashes the capture via
`readFileSync` on the **working tree**. Consequence: E4 can "pass" at a
revision that never carried the capture, as long as the file sits on disk —
false provenance, exactly the failure the pin file exists to prevent.
Round-60 precedent confirms captures are commit-tracked
(`git ls-files .ufo/waves/round-60/build/` lists scout bodies).
Smallest safe correction: the admit commit must be a single atom —
`build/ScoutSourceWorkerVersioning/{body.md,findings.md}` + `SOURCES.md` +
`source-captures.json` + entry + `README.md` + `readme-map.json` — and
closure should record `git show <rev>:.../body.md | sha256sum` against the
full 64-hex pin.

**F2 — duplicate authority confirmed at the source: the staged merge package
key-collides and re-keys this same URL.** Verified directly:
`/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md:7` stages
`| S195 | MCP Architecture overview — https://modelcontextprotocol.io/…architecture`
(a different source), and `:29` stages this same Temporal URL as `| S217 |`.
Measured defects in the staged rows: **both are malformed NF=14** (escaped
pipe inside a cell; census E01 as staged), and the staged S217 row carries
**no sha256 pin at all** — weaker provenance than the lane row (fetched
2026-10-23, unpinned, so its bytes cannot even be compared to the lane's
capture). If both appends land: E03 id collision on S195, duplicate-URL, and
a path collision on `corpus/knowledge/temporal-worker-versioning-pinning.md`
(staged entry cites S217, lane entry cites S195 — divergent bodies).
Smallest safe correction: one re-key decision before merge — keep lane S195
(it is the only keyed version with a verifiable pin: NF=13 + full sha256) and
re-key the package's MCP row, plus drop/dedup staged S217; the alternative
(adopt S217) forfeits the only pinned capture of the two.

**F3 — E4's comparison is a 16-hex prefix check.** Probe line 21:
`pin.includes(sha.slice(0,16))` — 16 of 64 hex characters compared. A capture
differing in the trailing 48 chars would still satisfy the probe. This seat's
check compared all 64 (match), but the gate itself is weaker than the claim
"sha256 equals the pin" it is meant to enforce.

**F4 — corroborated: the frozen probe cannot observe an honest S195 row at
all.** `/^\|[[:space:]]*S195[[:space:]]*\|/` is POSIX-class syntax that
JavaScript reads as a literal character class — it can never match
`| S195 |`, so E3/E4 print row-absent/`pin=''` for every well-formed row.
Additionally E3 reads `c[9]/c[10]/c[12]` after `split('|')`; a real 11-cell
row (NF=13) holds status/opened/used-by at `c[8]/c[9]/c[11]`. Even with F1
fixed (everything committed), the counter returns E3=false — a correct row
MISSes the falsifier, and a row bent to satisfy E3 (12 cells) would fail
census E01. Fixable only by re-grounding the probe — frozen-rule tradeoff,
judge's call; evidence stands.

## Commands / evidence pointers

- `sha256sum`, `wc -c` on `…/build/ScoutSourceWorkerVersioning/body.md`
- `corpus/SOURCES.md:147` (live row), `awk -F'|'` → NF=13
- `.ufo/pins/source-captures.json` S195 block (~line 186); `python3 -m json.tool` → valid
- `grep -cF '<teaches>' body.md` → 1; `body.md:37` heading, `:39` sentence
- `git status --porcelain`, `git show HEAD:corpus/SOURCES.md|grep -c S195` → 0,
  `git show HEAD:.ufo/pins/source-captures.json|grep -c S195` → 0,
  `git ls-files .ufo/waves/round-60/build/` (precedent)
- `probe/doctrine61-probe.mjs:14,17,21` (E2/E3/E4 code)
- `/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md:7,29`
  (`awk -F'|'` → NF=14 both)

## Not done / out of scope

- No lane production files, pins, probes, or registries edited (report-only
  seat). No re-fetch of the URL (network freshness outside scope; scout's
  `last-modified` 2026-10-24 noted).
- Tool installs/updates: none (pacman paused per round context; stock
  coreutils/git used).
