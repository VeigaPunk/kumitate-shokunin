# K65ConnCrossClaim — cross-claim / cross-lane pattern scan (lead-generating; no lane edits)

Base: `47fe2383151909d31557ada118ad84f90404dc6c`; freeze `2ca91a0c81542cad5f731049aa55dd2f99ade98d`.
Host measurement: `bash scripts/omp-binary-probe.sh` → `real_version=18.12.6`, `real_bytes=256702432`, exit 0.

## The shared pattern

C1 and C2 are the same instrument-shape twice: **one reading of one subject, valid only at a
pinned revision.** C1 runs the *same gate registry* at a BASE and a TIP revision and classifies
the transition; C2 runs the *same subject* (the OMP harness) as "upstream `main` docs" versus
"the installed release, measured". Both claims rest on a reading being valid at a pinned
revision. The pattern's failure mode is identical on both sides: **the reading is taken from a
moving target and the pin that makes it valid is recorded somewhere other than the URL that
produced it.**

Concretely in this lane:
- C1's `harm-matrix` sandboxes each revision (`git clone --no-hardlinks` + `checkout <rev>`),
  so the *code* is pinned. But the gates it runs read the *host*, and the corpus the gates read
  cites URLs that are not pinned (`/blob/main/`).
- C2's entry measures the installed release at `45c35e40` (tag `v18.12.6`), but the OMP docs
  rows it must re-ground on (`S001`, `S002`, `S003`, `S024`) all carry `/blob/main/` URLs.

So the cross-claim adjacency is: **C2 cannot be grounded on the lane's own OMP docs rows,
because those rows' URLs name a branch, not the revision the reading was taken at.**

## Count table — rows whose URL is a moving target

Command (lane root):

```
grep -E '^\| S[0-9]{3} \|' corpus/SOURCES.md | grep -cE '/main/|/latest/|/master/'
grep -E '^\| S[0-9]{3} \|' corpus/SOURCES.md | grep -E '/main/|/latest/|/master/' | cut -c1-120
```

| class | count | ids |
|---|---|---|
| URL contains `/main/` | 4 | S001, S002, S003, S024 |
| URL contains `/latest/` | 2 | S048, S114 |
| URL contains `/master/` | 0 | — |
| bare homepage (no path) | 1 | S039 (`https://pitest.org/`) |
| **total flagged** | **7** | of 139 registry rows (5.0%) |

Separately: **26 rows name a revision in the `anchor` cell that the `source` URL does not
carry** — i.e. the pin is recorded but not in the URL, so a reader following the URL gets a
different revision than the row claims. The four `/main/` OMP rows are the sharpest instance:
their anchors name `main 81fa40e (2026-10-19)` (S001–S003) and `main 10b9b493` (S024), which
the URL does not carry.

## The three worst offenders and the pin each needs

### 1. S001 — `https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md`
Worst because its **anchor's own revision has already drifted from `main`** — the pin is stale
*within the row*. Anchor names `main 81fa40e (2026-10-19)`; `main` is now `0b5c27ab`.

- `81fa40e` → 218 lines; live `main` → 220 lines; `45c35e40` (tag `v18.12.6`) → 220 lines.
- The 2-line delta is semantic, not cosmetic: live `main` adds
  *"Batch calls reject a top-level `agent` rather than silently discarding a specialist selector…"*.
- The entry `corpus/knowledge/omp-task-contract.md:3` recheck line still records
  `curl …/main/docs/tools/task.md | wc -l` → **218**; that command now returns **220**.
  The receipt is false against its own recheck command.
- **Pin needed:** `https://github.com/can1357/oh-my-pi/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/docs/tools/task.md`
  (the installed release) — the URL and the anchor then name the same bytes.

### 2. S002 — `https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md`
Anchor names `main 81fa40e (2026-10-19)`. Content at `81fa40e` == live `main` today (123 lines,
byte-identical) — so this row is **not yet** drifted, which is exactly what makes it dangerous:
the URL is unpinned and drift is possible without any signal. **Pin needed:** `…/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/docs/agent-hub.md`.

### 3. S003 — `https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md`
Anchor names `main 81fa40e (2026-10-19)`. Content at `81fa40e` == live `main` today (341 lines).
Same silent-drift exposure as S002. **Pin needed:** `…/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/docs/task-agent-discovery.md`.

Runners-up: **S024** (`/blob/main/docs/mcp-config.md`, anchor `main 10b9b493`; live `main` and
`10b9b493` are byte-identical at 567 lines today — silent-drift class), **S048**
(`/en/latest/` on readthedocs — a *version alias*, not a branch, and it drifts on every upstream
release), **S114** (`/latest/` AWS doc path — the same alias class, and its anchor names **no**
revision at all: only `fetched 2026-10-24` + a body sha256), **S039** (bare homepage — the
anchor cites two different pages, home and FAQ, behind one URL).

## The cross-claim coupling that makes this a C1 defect, not only a C2 defect

`scripts/harm-matrix-gates.json` lists `readme-map` as gate #1. `readme-map` is CLEAN only if
every `corpus/{knowledge,lessons}/*.md` has a README row **and** a `.ufo/pins/readme-map.json`
`covered` entry. C2's surface *adds* `corpus/knowledge/omp-installed-release-mcp-runtime.md`.

Reproduced in a sandbox clone (`git clone --no-hardlinks` of the lane into
`/tmp/kumitate-r65/K65ConnCrossClaim/clone.*`; the clone's own commits only):

```
README_MAP: CLEAN files=157 rows=157 covered=157
# add corpus/knowledge/omp-installed-release-mcp-runtime.md, no README row:
README_MAP: DRIFT files=158 rows=157 covered=157 bad=2 first=uncovered:knowledge/omp-installed-release-mcp-runtime.md
```

and then, with that file committed:

```
node scripts/harm-matrix.mjs --base 2ca91a0c81542cad5f731049aa55dd2f99ade98d --tip HEAD --only readme-map
HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM …
HARM_MATRIX: HARM gates=1 held=0 repaired=0 … harm=1
```

**So a C2 landing that adds the entry file without a README row + pin converts C1's `readme-map`
gate from CLEAN to NOT_CLEAN, and C1's own counter reads that as `HARM`.** C1's H5 requires
`harm + harm_absent + new_red = 0` over the registry; a C2 landing that omits the README row
makes C1 fail. The two claims are coupled through `readme-map` in the direction C1 → C2, and the
coupling is invisible until the C2 landing lands.

The same coupling exists in the other direction through `source-capture` (gate #6). A new
`S2xx` row with no capture binding makes `source-capture` DRIFT, which the registry reads as
`HARM` for C1. Reproduced in the same clone:

```
# add row | S201 | … | mined | 2026-10-25 | … | to corpus/SOURCES.md, no capture binding
node scripts/harm-matrix.mjs --base 2ca91a0c… --tip HEAD --only source-capture
HARM_ROW gate=source-capture base=CLEAN tip=NOT_CLEAN id=HARM
  base_text="SOURCE_CAPTURE: CLEAN captures=32 exemptions=107"
  tip_text="SOURCE_CAPTURE: DRIFT captures=32 exemptions=107 bad=1 first=S201:uncaptured [exit=1]"
HARM_MATRIX: HARM gates=1 … harm=1
```

So C2's landing must bring **three** things or C1's counter reads `HARM` twice: the entry file
+ its README row + its `.ufo/pins/readme-map.json` `covered` entry (readme-map), and the new
row's capture binding in `.ufo/pins/source-captures.json` (source-capture).

## Sibling-lane statement contradicting the host measurement

Host measurement (`scripts/omp-binary-probe.sh`, this host, 2026-10-25):

```
OMP_BIN: real_version=18.12.6
OMP_BIN: real_bytes=256702432
OMP_BIN_PROBE: DONE omp=18.12.6
```

Sibling lanes, read-only grep of `/home/vgpnk/Projects/shokunin/*-shokunin/corpus`:

| lane | statement | agrees with host 18.12.6? |
|---|---|---|
| kotoba | `corpus/lessons/round-51.md:4` — "run against the installed omp 18.12.6" | yes |
| kotoba | `corpus/lessons/round-51-verifier-spotcheck.md:40` — "`omp --version` → `omp/18.12.6`" | yes |
| kotoba | `corpus/lessons/round-47.md:19` — "`omp --version` → `omp/18.12.5`" (a dated BASE observation) | dated, not a contradiction |
| kotoba | `corpus/lessons/round-47.md:19` — quotes SCORECARD text "installed omp 18.12.3" | quoted history, not the host now |
| mori | `corpus/knowledge/harness-job-capacity-r25.md:24` — "bound to one version, omp/oh-my-pi **18.12.6** (tag `v18.12.6`, commit `45c35e40…`)" | yes — and it pins by **commit**, and uses `raw.githubusercontent.com/…/45c35e40…/` URLs |
| souji | 0 corpus files mention `oh-my-pi` / `omp.real` | n/a |

**No sibling lane contradicts the host measurement.** mori's `raw.githubusercontent.com/…/<commit>/…`
URL form (mori S098–S103) is the sibling precedent for the fix: it is byte-stable and fetchable.

**The contradiction is inside this lane.** `corpus/knowledge/omp-task-contract.md:205` still says
"the installed host reports `omp/18.12.3` (S004)", and `corpus/README.md:91` still says
"installed `omp/18.12.3`". The lane's own registry already records the newer value —
`S081` (`omp/18.12.6`, opened 2026-10-23, "supersedes S004") — but:

- `S081`'s `used-by` names `corpus/knowledge/omp-task-contract.md`, and that entry cites only
  `S001 S002 S003 S004` (`grep -c S081 corpus/knowledge/omp-task-contract.md` → **0**).
- `S004` (omp/18.12.3) is still `mined` and still `used-by` the same entry.
- `sources-check` warns `USED_BY_ASYMMETRY` only in the *entry→row* direction
  (`scripts/sources-check.mjs:377`, "used-by omits <path>"). The *row→entry* direction — a row
  claiming `used-by: X` where X does not cite it — is **not checked**. Measured: **27 of 139 rows**
  claim a `used-by` entry that does not cite them (S029, S059, S080, S081, S082–S084, S087–S092,
  S093, S095, S096). `sources-check` reads `SOURCES_CHECK: CLEAN` while this is true.

So the lane has *two* live rows for the same fact (S004 = 18.12.3, S081 = 18.12.6), the entry
cites only the stale one, and no instrument notices.

## O5 trap for C2's new rows (adjacency with the frozen counter)

`omp65-probe.mjs` O5 live-fetches each cited row's **URL** (not its capture) and requires the
quote to appear in the fetched body after `norm()`. `norm()` strips `<script>…</script>`. On a
GitHub `/blob/` URL the fetch returns **HTML**, and the file's source text lives inside a
`<script type="application/json" data-target="react-app.embeddedData">` block — which `norm()`
deletes. Measured on `packages/utils/src/dirs.ts` at `45c35e40`: 20/20 candidate quotes are in
the raw file, but only **12/20** survive the `/blob/` HTML; 8 miss, e.g.
`import * as fs from "node:fs";`. The corpus's own S053 quote
`/** Get the custom themes directory (~/.omp/agent/themes). */` is in the raw file and **not**
in the blob HTML.

A `/blob/` URL also carries the revision, so it passes O6's pin test — the row looks right and
O5 still red-lights. Two URL forms are byte-identical to the pinned raw file and fetch as text:

```
https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/dirs.ts
https://github.com/can1357/oh-my-pi/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/dirs.ts?raw=1
```
both → sha256 `2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24`, identical to
the raw file. `/v18.12.6/` and `/45c35e40…/` are the same bytes
(sha256 `2d423f4f…` both), so both satisfy O6's `/v<real_version>/` **or** release-commit test.

**Recommendation to the C2 scribe (a strengthening, not a relaxation):** open the new rows at
`https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/<path>` — pinned, byte-stable,
O5-fetchable as text, and O6-pinning by the tag. `?raw=1` on a `/blob/` URL is the equivalent
if the row's house style requires the `github.com` host.

## Proposed move (one, bounded)

**Repin the four `/main/` OMP doc rows (S001, S002, S003, S024) to the installed release commit
`45c35e40…` in the URL, and add the sibling-lane `raw.githubusercontent.com` form for the C2 rows.**

Effects, traced:
- **C2 (coverage axis) improves.** O5 live-fetches the row's URL; a `/blob/main/` URL drifts
  under the fetch and a `/blob/<sha>/` URL serves HTML that `norm()` guts. Repinned raw URLs
  make O5's live fetch and the committed capture the same bytes.
- **C1 (operability axis) is not harmed, and its `readme-map`/`source-capture` coupling is
  disclosed.** Repinning SOURCES URLs does not touch the registry or the README/pins; the
  coupling is real but lives on the C2 side (the new file + row + capture), so C2's landing must
  bring the README row and the pin with it, or C1's counter reads HARM.
- **No frozen artefact is edited.** `plan.md`, `probe/*`, `controls/`, `base/` are untouched; the
  changes are to `corpus/SOURCES.md` (a subject) and the new C2 rows.

## Limits
- I did not modify any lane file; all reproductions are in a scratch clone under
  `/tmp/kumitate-r65/K65ConnCrossClaim/`.
- GitHub `/blob/` HTML survival was measured on two files (`docs/tools/task.md`,
  `packages/utils/src/dirs.ts`); the 8/20 miss rate is file-specific, not a universal constant.
- I did not test the `?raw=1` form through the counter's `curl` flags
  (`-fsSL --max-time 90 --retry 2 -A Mozilla/5.0`) — only plain `curl -fsSL`.
- Sibling scan covered `*/corpus` for `oh-my-pi|omp.real|omp/18.`; a sibling claiming an OMP
  version outside those tokens would not appear here.
- `.ufo/pins/readme-map.json` is **not** in `counter-pins.json` (that file pins
  `scripts/readme-map.mjs` itself, round 58, plus the round-65 probes and the controls
  manifest) — so adding a `covered` entry to `readme-map.json` needs no counter-pin update.
  The round-65 pins are: `harm65-probe`, `omp65-probe`, `gen-harm-cases65`,
  `omp-donothing-control65`, `harm65-controls-manifest`.
