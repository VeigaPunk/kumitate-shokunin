# Round 65 — plan (frozen before any wave seat was dispatched or scored)

Round: kumitate 65, attempt 1, L1 `KumitateR65`. Base revision `47fe2383151909d31557ada118ad84f90404dc6c` (branch `master`,
ahead=0; the round-64 non-author spot-check commit). Frozen 2026-10-25. These sentences are the claims; the same words appear
in the counters' code and in the receipts' labels. Committed before the first `.ready` marker (QUALITY Q58).

## Axis state and nudge

Owned axes (SCORECARD `## Axes`): operability 9 (terminal integer of the frozen `f_O` proxy), coverage retired at 10,
coverage:script-layer / runtime-layer / kimi-layer 10. The last verified capability row is round 64 (`report-receipt-diff`); the
stagnation window is N = 3, so the nudge is **not** active and the lowest-axis obligation stands: **C1 works operability**, the
lowest non-retired axis. C2 works the frontier (coverage family). No score integer can move; the verdict is the counter. No axis
may be harmed. Base state's live defects are repaired as maintenance, not claimed (routed from
`corpus/lessons/round-64-verifier-spotcheck.md` §6): D2 the missing README row and pin for the spot-check file (`readme-map` read
`DRIFT files=157 rows=156` and `proxy-check` read `C2_TOTAL_DRIFT` at base, `base/readme-map-before.txt`, `base/proxy-before.txt`;
the row and pin land in the freeze commit and the proxy stanza refresh at the close), D1 the unreceipted selftest tally (`base/report-receipt-diff-selftest-freeze.txt`
reads `REPORT_RECEIPT_SELFTEST: PASS (125/125)`; `base/plan-before-ready-selftest-freeze.txt` reads `PASS (38/38)`).

## C1 — operability, capability acquisition `harm-matrix`

**Surface it moves:** a new tool, `scripts/harm-matrix.mjs` (contract `kumitate-harm-matrix-v1`) with its gate registry
`scripts/harm-matrix-gates.json` and selftest cases `scripts/harm-cases.json`. The admission rule "no axis harmed" has been checked by a
seat's hand-run list of gates at two revisions (round 64: K64R2ExecHarmBattery), and the round-64 closure's own commit moved two
gates from clean to not clean (`a004902d` → `47fe2383`: `readme-map` and `proxy-check`) with nothing in the lane to say so. The
tool runs the registry of gates at a BASE and a TIP revision, each in its own sandbox clone, and classifies every gate's
transition (HELD, REPAIRED, HARM, HARM_ABSENT, NEW_OK, NEW_RED, GONE, CARRIED, CARRIED_MOVED, ABSENT_BOTH). Command that shows it
unmoved: `test -e scripts/harm-matrix.mjs` at the base revision (absent).

**Frozen predicate `HARM65_HELD`** (rule H65 v1, checks H1..H5), measured at revision M over `git archive M`:

- H1 — the archive runs `node scripts/harm-matrix.mjs --selftest` and prints `HARM_MATRIX_SELFTEST: PASS (n/n)` with n >= 20, exit 0.
- H2 — `.ufo/waves/round-65/controls/harm/` holds >= 14 committed case dirs (16 at freeze, each altering one thing, with a `spec.json`
  carrying its `expect`); the probe builds each fixture repository itself, runs the archive's tool, and the exit code and the sorted
  `<gate> <ID>` rows equal the case's `expect`; >= 8 distinct row ids are exercised (9 at freeze) and >= 2 cases expect exit 0.
- H3 — real data, judged against direct runs of the gates the probe makes itself: the pair `a004902d` → `47fe2383` reads exit 1 with
  exactly `readme-map` and `proxy-check` as HARM rows (and the direct commands exit 0 then non-zero); the pair `6825a514` → `a004902d`
  reads exit 0, no HARM / HARM_ABSENT / NEW_RED row, `readme-map` and `proxy-check` both REPAIRED (direct commands non-zero then 0).
- H4 — the counter can fail: a stub tool that always prints `HARM_MATRIX: CLEAN` (exit 0) and one that always prints `HARM_MATRIX: HARM`
  (exit 1), each run through the same H2 + H3 harness, miss it; H4 counts only where the real tool passes H2 (never vacuous).
- H5 — `harm-matrix --base 47fe2383 --tip M` over the full registry prints a summary with gates >= 14 and exits 0 exactly when
  harm + harm_absent + new_red = 0.

**Counting command:** `node .ufo/waves/round-65/probe/harm65-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`
→ `HARM65_HELD held=5/5 checks=5 rev=<M> rule=H65` exit 0.
**Kill rule:** any check MISS → the claim fails as declared. A rule changed after any seat scored is not this claim's rule.
**Ratchet (declared now, monotone):** any harm a wave seat finds that the tool reads as clean (a lying gate, a masked verdict, a
sandbox escape) is added to `controls/harm/` with its `expect` and the tool is fixed — a strengthening, never a relaxation; H2's floor
stays 14 and the 16 frozen controls and the counter are never edited (the manifest `controls/harm/MANIFEST.sha256` and the probe are pinned
in `.ufo/pins/counter-pins.json` at this freeze).

**Before (base `47fe2383`):** `HARM65_UNMET held=0/5` exit 1 (`base/harm65-base.txt`).
**Do-nothing controls:** H4 is the in-counter control (stubs that ignore their input fail); the base commit reads 0/5.
**Stated limit (declared now):** a gate's reading is only as good as its verdict line; two not-clean readings that differ are
CARRIED_MOVED and are not ranked; host-state gates read the same host at both revisions, so a host change between the two runs is not
told apart from a revision change; heavy gates (cite-check, gate-mutants, cap-run, `surface-probe --checklists`) are outside the registry;
text that embeds a random temp path makes a not-clean gate read CARRIED_MOVED. Wave seats are asked to find cheaper lies (ratchet).

## C2 — coverage, frontier ground: the installed OMP release, measured (sourced claim)

**Surface it moves:** `PROVINCE.md` frontier line "OMP harness contract" gains the first entry that **measures the installed release**.
The lane's `corpus/knowledge/omp-task-contract.md` § Version skew says the documentation is upstream `main` and "the binary's version was
observed, but its implementation was not inspected". The round lands a new entry,
`corpus/knowledge/omp-installed-release-mcp-runtime.md`, grounded on rows opened this round at the **tag of the installed release**
(`v18.12.6` = `45c35e40c46166dc726ccc52f5d27f40f2449f99`, `base/omp-release-tag.txt`) and on a re-runnable, read-only host probe,
`scripts/omp-binary-probe.sh` (15 outcome keys at freeze: wrapper, release version and size, which protocol literals and symbols the
release bytes carry, and that the documentation sentences are not in the binary). It enters via the assimilation theme "OMP MCP protocol
version and the installed host" of `merge/kumitate/` (staged `omp-mcp-protocol-version-code`, `omp-mcp-version-negotiation-decision`,
`omp-host-harness-protocol-skew-2026-10-27`, and the MCP half of `omp-session-sharing-and-mcp-lifecycle`) — one merged entry,
re-grounded on rows opened in round 65, never copied. Command that shows it unmoved: `test -e corpus/knowledge/omp-installed-release-mcp-runtime.md`
and `grep -c 'omp-installed-release-mcp-runtime' PROVINCE.md` at the base revision (absent; 0).

**Frozen predicate `OMP65_HELD`** (rule O65 v1, checks O1..O8), measured at revision M over `git archive M`:

- O1 — the entry exists and opens with `source:` (>= 3 distinct S### ids), `verified-at: 2026-10-25` and `recheck:`.
- O2 — every S-id on its `source:` lines is a row inside `## Registry` that is new this round (absent at the base revision) with exactly 11
  cells, status `mined`, opened 2026-10-25, a URL, tier A or B, and a `used-by` cell naming the entry.
- O3 — each cited row is bound in `.ufo/pins/source-captures.json` to a committed capture whose sha256 and size equal the pin.
- O4 — the entry's `## Located quotes` section holds >= 6 bullets `- S### — "<quote>"`, each <= 25 words, each found (markup/whitespace-normalised)
  in that row's capture, every cited row carrying at least one, at least one carrying the literal `2025-11-25`.
- O5 — each bullet's quote is also found in a fresh live fetch of the row's URL (unreachable = MISS).
- O6 — the entry's `## Host measurements` section lists `- <key>=<value>` bullets (>= 12) and `bash scripts/omp-binary-probe.sh` in the archive,
  run now on this host, exits 0 and prints the same keys with the same values (set equal); the measured `real_version` is pinned by >= 2 cited
  rows (their URL carries `/v<real_version>/` or the release commit); the entry body names `lit_2026_07_28` and `real_version`.
- O7 — `sources-census.sh validate --file <archive>/corpus/SOURCES.md` exits 0, `sources-check` reads `SOURCES_CHECK: CLEAN`, `PROVINCE.md` names the
  entry path on a frontier line, and `node scripts/readme-map.mjs` in the archive prints `README_MAP: CLEAN`.
- O8 — `corpus/knowledge/omp-task-contract.md` at M begins with exactly the bytes it had at the base revision (append-only) and carries an appended
  `Amendment 2026-10-25` section naming the entry path and `Version skew`.

**Counting command:** `node .ufo/waves/round-65/probe/omp65-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`
→ `OMP65_HELD held=8/8 checks=8 rev=<M> rule=O65` exit 0.
**Kill rule:** any check MISS → the claim fails as declared; the same no-retroactive-change rule and the same monotone ratchet apply.

**Before (base):** `OMP65_UNMET held=0/8` exit 1 (`base/omp65-base.txt`).
**Do-nothing control (committed before data):** `probe/omp-donothing-control.sh` — on a sandbox clone at the base, copy a staged entry
byte-for-byte to the new path, add a PROVINCE frontier line and an amendment naming it, change nothing else: `OMP65_UNMET held=1/8` exit 0 of the script
(`base/omp65-donothing.txt`; only O8 passes). A control that meets 8/8 would mean the counter is wrong.
**Stated limit (declared now):** the counter measures an evidence chain plus a live probe re-run; it cannot tell a sound entry from a well-grounded
wrong one; an attacker-hosted row URL would pass O5; the probe's literal counts are byte sweeps of a compiled binary and prove presence, not use.
It scores the surface it names, so on a retired axis it carries no integer; the verdict is the counter.
**Sourced claim (§2b.4):** C2's rows are opened this round; the entry and rows cite their S-ids.

## Frontier step and assimilation (inside the claim cap; not claims)

- **Census** before (`base/census-before.txt`, exit 0, six W04 warnings) and after, pasted in the report.
- **Assimilation:** ONE theme from `merge/kumitate/` — OMP MCP protocol version and the installed host — adopting ONE merged entry (C2), re-grounded
  on rows opened this round at the installed release tag. Collision guard run in scratch (`assimilation/`) with its proof-of-failure fixture;
  adopted ids continue the lane registry at S201 and are re-pointed by document. Quarantine slice re-derived (`assimilation/quarantine-slice`).
  The lesson's `## Gate` records >= 1 admit and >= 1 reject from the assimilation set (the staged `omp-session-sharing-and-mcp-lifecycle` collab half and the
  staged tracker-state entry are the reject candidates unless re-grounded).
- **considerthese (one proposal):** `considerthese/2026-10-25.md` idea 4 "count recurrences" — a counted recurrence table for routed-defect classes
  lands as a lesson table and a QUALITY criterion (a class past three recurrences gets a structural fix, not another routed item); C1 is the structural
  fix for the class "a landing moved a gate the lane did not run". Ideas 1 and 2 were taken in round 64; idea 1 (forge each new gate) is applied to C1 and C2
  by wave-2 forge seats.
- **Mistake mined (§2b.3):** the round-64 closure commit moved `readme-map` and `proxy-check` from clean to not clean (the `reference-drift` class, now the
  eleventh R56-V3-family recurrence) and nothing the lane ran noticed until the next round opened; captured-by `readme-map` (after the fact, at round open only).
  Fix: C1's H3(a) reproduces exactly that transition from committed bytes.
- **Routed R64 defects answered:** D1 (selftest transcripts committed at freeze), D2 (README row + pin at freeze), D3 (dangling pointers: appended correction in
  the lesson/report, not a rewrite of filed bytes), D4 (kimi layer carried DEGRADED, K = 49 of 53), D5 (R61-V2 and Audit19 residuals recorded as open items again).
- **Maintenance repairs (not claims):** `proxy-check` stanza refresh at the close; `readme-map` stays CLEAN.

## Round shape

Two v1 waves (policy `ufo-wave-policy.json`, band 32–64), seats prefixed `K65` (seat names are global in the dispatcher). Wave 1 (36–42 seats):
build + first falsifiers (scouts open rows; scribes draft the entry, rows, lesson; executors harden the tool and probe; attack seats forge C1/C2).
Wave 2 (>= 32 seats, only if wave 1 yields >= 32 distinct attack items): fresh reviewers / critics / mutation-testers re-run each counting command,
re-open every new source row, mutate the tool, forge the counters. Planner seat: the L1 (the validator rejects `planner`). Round total 64–100; strict
m_flash share (executor/scribe/simplifier) >= 50% planned per wave; attack roles >= 25%.

## Write scope

Lane repo only: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Seats write only their own report (`.ufo/waves/round-65/<wave>/<Seat>.md`), build
artifacts under `.ufo/waves/round-65/build/<Seat>/` and scratch under `/tmp/kumitate-r65/<Seat>/`; the L1 is the sole integration owner of `scripts/`,
`SCORECARD.md`, `corpus/`, `PROVINCE.md`, `LOG.md`, `SKILL.md`, `.ufo/pins/`. No seat touches the fleet repo, sibling lanes, jj state, `.ufo/state/`, `.scratch/`.
