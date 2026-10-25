# Audit23 — round 61 w2, Trend-Expansion (reviewer)

**Scope:** verify the new Temporal Worker Versioning entry is sourced to opened mined S195 and genuinely adds band-4 knowledge; distinguish this trend from the failed frozen C2 counter (`doctrine61-probe.mjs` v1).

## Verdict

- **V1 — entry is sourced to opened mined S195: PASS.** Bidirectional binding verified byte-for-byte:
  - S195 row (`corpus/SOURCES.md:147`): 11 data cells (fields 2–12; awk NF=13 with leading/trailing empties), `mined`, opened `2026-10-25`, `docs`, `A`, used-by `corpus/knowledge/temporal-worker-versioning-pinning.md` exactly; the row sits inside `## Registry` (line 10–152), not a phantom row elsewhere.
  - Entry header (`corpus/knowledge/temporal-worker-versioning-pinning.md`): `source: S195 — https://docs.temporal.io/worker-versioning.md — § Versioning behaviors → § Pinned Workflows / § Auto-Upgrade Workflows; § Continue-as-new, Child Workflow, and Retry Semantics`, `verified-at: 2026-10-25`, `recheck: 90d`.
  - Capture pin: `body.md` sha256 = `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` (computed `sha256sum`), equals the S195 row pin and `.ufo/pins/source-captures.json` S195 pin (`bytes 9645`, `captured 2026-10-25`).
  - Quote fidelity: 13-word guarantee sentence at `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md:39` appears verbatim in the row teaches and the entry body.
- **V2 — genuinely adds band-4 knowledge: PASS.** No prior band-4 entry covers version-pinning: `grep -rln "Worker Versioning|Deployment Version|pinned.*version" corpus/knowledge/` → only the new entry (the one hit in `at-least-once-dedupe.md:26` is S107's RabbitMQ doc "version scope is pinned", unrelated). PROVINCE.md §Frontier (line 22) records the advance: `advanced round 61 by corpus/knowledge/temporal-worker-versioning-pinning.md (S195): the version boundary for Pinned Workflows and the narrower Auto-Upgrade/retry-inheritance contract`. `corpus/README.md:182` maps the entry to S195 + the capture dir; `.ufo/pins/readme-map.json` diff adds the entry to the map (README_MAP CLEAN files=148 rows=148 covered=148). Entry content is faithful to the opened capture: auto-upgrade replay-safety duty (body.md:43), inheritance rules (body.md:94/95/105–108/120/129–133/141/145–148), independent-activity task-queue version (body.md:53–56), and the retry-version gap is honestly kept UNKNOWN (scout [INFERENCE] gap).
- **V3 — distinct from the failed frozen C2 counter: PASS (with F1–F3).** The trend is attested by primary evidence above; the C2 counter cannot attest it. Direct run of the frozen probe (v1) at the lane base just now:
  - `node .ufo/waves/round-61/probe/doctrine61-probe.mjs . be4a820 --census-root /home/vgpnk/Projects/shokunin` → `DOCTRINE61_UNMET held=1/6 … E1 MISS absent … E4 MISS pin= sha=8ef2ee5f5e196d9d … E6 MISS mapped=false`, exit=1. This is the honest-build refusal the critic recorded (CritControlC2: E3/E4 jointly unsatisfiable for any Registry row; E4 binds pin↔file and reads the capture from the worktree, not the rev). The probe's verdict is therefore **not** evidence about the trend — the trend's truth is independent of it. The "failed frozen C2 counter" is the probe, not the knowledge entry: the entry is admitted (lesson round-61.md:12, "ADMIT … claim C2 does not verify"); the probe is the broken artifact.

## Findings by severity

### High

- **F1 — the S195 trend evidence is uncommitted (worktree-only).** `git status --short` shows modified `corpus/SOURCES.md`, `corpus/README.md`, `PROVINCE.md`, `corpus/QUALITY.md`, `corpus/lessons/round-61.md`, `.ufo/pins/readme-map.json`, `.ufo/pins/source-captures.json`, and untracked `corpus/knowledge/temporal-worker-versioning-pinning.md`, `.ufo/waves/round-61/build/` (incl. the capture `body.md`), `.ufo/waves/round-61/w1/` (all seat reports), `.ufo/waves/round-61/close/`, `controls/`. `git show HEAD:corpus/SOURCES.md` contains no S195; `git show HEAD:PROVINCE.md` / `HEAD:corpus/README.md` contain no temporal entry. The claim "one assimilated entry … opened 2026-10-25 in-round" is only satisfiable at the future close revision, not at the committed base `be4a820` — which is exactly why the frozen probe fails E1–E4/E6. The wave-2 framing says inputs are "committed round-61 wave-1 evidence"; the S195 evidence is not yet committed. If the close commit drops/rewrites the row or entry, this verification becomes stale; re-run at the close revision.
- **F2 — the entry's own recheck command is wrong for the source, verbatim.** The entry header says `recheck: 90d — curl -fsSL 'https://docs.temporal.io/worker-versioning.md' | grep -c 'Pinned Workflows' (expected 1)`, but the captured page contains the phrase twice: body.md:37 heading `### Pinned Workflows` and body.md:50 `For Pinned Workflows, an Activity starts on the pinned version.` (`grep -c` → 2, not 1). The recheck expectation will therefore fail despite the source being unchanged. The row cell 7 is unaffected (it cites the located guarantee sentence). Suggested (report-only, not edited): `grep -c 'guaranteed to complete on a single Worker Deployment Version'` (expected 1), or `grep -c '^### Pinned Workflows'`.

### Low

- **F3 — E4's capture path is untracked, so the C2 pin check depends on the close commit including `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`** (`git ls-files` count 0 for `build/`). If the commit omits it, the "in-round source capture hash matches" half stays unsatisfiable. This is a close-process dependency, not a defect in the entry.

## Residual risk

- The trend's provenance is verified only against the current worktree bytes; the committed close revision is the durable artifact (F1).
- The frozen C2 counter cannot falsify or confirm this trend; a future re-declared v2 probe is the only counter that could attest C2 (CritControlC2's disclosed v2 design).

## Verification gaps

- Did not re-fetch the live URL (network fetch of `docs.temporal.io` not run; the committed capture standing in as the in-round source). The `last-modified 2026-10-24` header and curl access record are in `build/ScoutSourceWorkerVersioning/findings.md`.
- Did not run the census or readme-map gates independently; both are exercised inside the probe run above (`E5 PASS exit=0`; `README_MAP: CLEAN files=148 rows=148 covered=148`), and the S195 row cells were counted directly (11 data cells).

## Evidence pointers

- Entry: `corpus/knowledge/temporal-worker-versioning-pinning.md` (header lines 1–7; quote line 15)
- Row: `corpus/SOURCES.md:147`; section `## Registry` (lines 10–152); band-4 path `corpus/SOURCES.md:155`
- Capture: `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md:37/39/43/50/53-56/79-148`; `findings.md`
- Pins: `.ufo/pins/source-captures.json` (S195 sha256 8ef2ee5f…f8fc, bytes 9645); `.ufo/pins/readme-map.json` (entry added)
- Frontier: `PROVINCE.md:22`; README map: `corpus/README.md:182`
- Counter: `.ufo/waves/round-61/probe/doctrine61-probe.mjs` (lines 7/11/17/21/24/29); run output `DOCTRINE61_UNMET held=1/6`, exit=1; CritControlC2 (`w1/CritControlC2.md`); frozen control `controls/ctl-c2-unopened-row.txt`
- Lesson: `corpus/lessons/round-61.md:12,14,22,26` (ADMIT; S217→S195 re-grounding; collision check)
- Commands: `sha256sum build/ScoutSourceWorkerVersioning/body.md`; `grep -c 'Pinned Workflows' body.md` → 2; `awk -F'|' 'NR==147{print NF}' corpus/SOURCES.md` → 13 (11 data cells); `git status --short`; `git show HEAD:corpus/SOURCES.md | grep -c S195` → 0

*Command exits: probe exit=1 (UNMET); sha256sum exit=0; grep -c exit=0; awk exit=0; git status/show exit=0.*
