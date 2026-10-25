VERDICT: The integration map is complete: 11 ordered edit sites (proxy-check gate-pins map, SCORECARD stanza + gate-pins block + capabilities row, SKILL registry/checklist, SOURCES rows, source-captures, the three new corpus docs, README rows + readme-map.p pins, PROVINCE frontier, close receipt) with their reading gates and proof commands, and the post-round A/C2/C2_total values are computed from the frozen code.

## Evidence

- Base receipts (frozen b38a2065, verbatim):
  - `base/proxy-before.txt` → `proxy-check: fail-closed — GATE_PIN_KEY_UNKNOWN: line 330: pin.make-dispatch-actual is not a kumitate-gate-pins-v1 key` / `PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) …` / `EXIT=2`
  - `base/readme-map-before.txt` → `README_MAP: note unpinned:lessons/round-62-verifier-spotcheck.md` / `README_MAP: DRIFT files=151 rows=150 covered=150 bad=2 first=uncovered:lessons/round-62-verifier-spotcheck.md` / `EXIT=1`
  - `base/inline63-base.txt` (at round base dfa6fca8): `INLINE63_UNMET held=0/6 … | I1 MISS tool-absent | …`; `base/topology63-base.txt`: `TOPOLOGY63_UNMET held=1/7 … | T1 MISS entry-absent | …` (only census passes)
- Formulas from `scripts/proxy-check.mjs` (`deriveTerms`, lines 941-963):
  - A = `walkFiles(self)` filtered by `RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/` (recursive, `.git` pruned, symlinks not followed) — line 502, 942
  - C2 = `countLines(corpus/README.md, /^\| `(knowledge|lessons)\//)` — line 507, 945
  - C2_total = `listCorpusNotes(self).length` (`*.md` under corpus/knowledge + corpus/lessons, recursive) — lines 702-709, 946
  - C1/C1_total = `registryCounts(scorecardText, /^\| (S|R)\d+ \|/)`, covered = 4th cell trimmed starts `yes` (escaped `\|` honored) — lines 504, 728-738
- Measured at frozen b38a2065 (=HEAD) via `git ls-tree -r`/`git show`:
  - A computed = **122** (stanza declares 117, Δ+5: the four round-63 probes `inline63-probe/topology63-probe/make-inline-controls/make-topology-controls.mjs` + `scripts/inline-dispatch-evidence.mjs` itself, all committed at freeze)
  - C2 computed = **150** rows (matches stanza 150); C2_total computed = **151** (stanza declares 150, Δ+1: `lessons/round-62-verifier-spotcheck.md`); C=30, C1=19/19 (replicated `registryCounts` → `C1=19/19`)
  - `node scripts/readme-map.mjs` rerun now → same DRIFT, exit 1
- `node scripts/inline-dispatch-evidence.mjs --selftest` → `INLINE_DISPATCH_SELFTEST: PASS (25/25)`, exit 0; file present in b38a2065 (blob 100755; content sha256 fdd883927… at HEAD, base blob identical)

## Findings

- **K63ConnIntegrationMap-1** (high; blocks every proxy term at base): scorecard gate-pins block line 330 (`pin.make-dispatch-actual=f0194314e…`) is not in proxy-check.mjs's `GATE_PINS` (lines 461-479), so `parseGatePins` fails closed → `GATE_PIN_KEY_UNKNOWN` exit 2 before any comparison. Repair (L1): add `'pin.make-dispatch-actual': 'scripts/make-dispatch-actual.mjs'` to `GATE_PINS` (current sha `sha256sum scripts/make-dispatch-actual.mjs` = f0194314e…, matches block) — or drop the block line. Reproduce: `node scripts/proxy-check.mjs`.
- **K63ConnIntegrationMap-2** (high; readme-map gate): `lessons/round-62-verifier-spotcheck.md` has no README row and no `covered[]` entry → `uncovered` + `unpinned` (bad=2). Repair: add row in `corpus/README.md` + entry in `.ufo/pins/readme-map.json`. Reproduce: `node scripts/readme-map.mjs`.
- **K63ConnIntegrationMap-3** (medium; proxy stanza drift, currently masked by -1): computed A=122 vs declared 117 (`A_DRIFT`), C2_total=151 vs declared 150 (`C2_TOTAL_DRIFT`); will surface as drift once the gate-pin block is fixed. Repair: stanza `A=122`, `C2_total=154` after the round (see below), plus `pin.proxy-check` re-pin if proxy-check.mjs is edited. Reproduce: `node scripts/proxy-check.mjs --strict` after fixing -1.
- **K63ConnIntegrationMap-4** (medium; `proxy-check --strict` checklist item 8): `scripts/inline-dispatch-evidence.mjs` is unpinned → `PIN_UNPINNED` warn, which strict mode promotes to failure. Repair: add `'pin.inline-dispatch-evidence': 'scripts/inline-dispatch-evidence.mjs'` to `GATE_PINS` AND `pin.inline-dispatch-evidence=<sha>` to the scorecard gate-pins block. Reproduce: `node scripts/proxy-check.mjs --strict`.
- **K63ConnIntegrationMap-5** (medium; source-capture + T3): new rows S196/S197 must get captures in `.ufo/pins/source-captures.json` (sha256+bytes+date) or `source-capture` reads `uncaptured` DRIFT and topology T3 MISSes. Current staged captures (build/K63Capture, must be committed): `arxiv-2512.08296v3.html` 663997 B sha df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223; `bailian-managed-agents-multiagent.md` 3388 B sha 7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6. Reproduce: `node scripts/source-capture.mjs`.
- **K63ConnIntegrationMap-6** (low; cite-sources / source-dupes): README rows citing S196/S197 must keep those ids in `corpus/SOURCES.md` (else `CITE_SOURCES: DRIFT ghosts=…`); the two rows' URLs must not join a pinned duplicate-URL group (else `SOURCE_DUPES: DRIFT new-duplicate`).

## Artifacts

- `build/K63ConnIntegrationMap/integration-checklist.md` — full ordered checklist: file, exact edit, reading gate, proof command; includes draft scores for the scorecard stanza/gate-pins block, SOURCES S196/S197 rows, readme-map.json entries, SKILL registry/checklist rows, PROVINCE bullet, and the post-round predicted numbers.

## Post-round predicted proxy values (formula from code, base values above)

- Base values (frozen): A=122, C2=150, C2_total=151 (stanza 117/150/150).
- Round adds N=3 corpus md files ((b) knowledge entry, (c) round-63 lesson, (d) round-63-verifier-spotcheck.md); (a) the tool is already tracked at base.
- `A_final = 122 + (# new runnable files committed this round)` — build-tools/build-w1.mjs + common.mjs exist untracked; if committed they add 2 → 124. Canonical additions only: 122.
- `C2_total_final = 151 + 3 = 154`; `C2_final = 150 + 1 (repair row) + 3 = 154` (readme-map requires rows == files).
- Scores (unchanged): operability = floor(10×(122+30)/(122+30+3)) = 9; coverage = floor(10×19/19×154/154) = 10.

## Limits

- Did not run `topology63-probe`/`inline63-probe` end-to-end (wave results/entry/close receipts absent; T5 needs live fetch); verified their code paths and the gates they invoke.
- Did not verify all 17 existing gate-pin shas byte-by-byte (spot: make-dispatch-actual matches); any drifted script sha will surface as `GATE_PIN_DRIFT` on the post-repair run.
- Capture shas above are for the current untracked build/K63Capture bytes; they must be re-measured if the capture files change before commit.
- No file in the lane was edited; everything above is read-only evidence + drafts.
