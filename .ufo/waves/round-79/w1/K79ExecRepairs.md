# K79ExecRepairs — scoped SQLite compare repair

Axes: operability + coverage (orchestration/tooling).

## Implementation

Shared clone pinned at ba940b512d980218b11ed6f34ac2f304c01287ee; only scripts/omp-census.mjs changed. The retained patch.diff is the deliverable; no lane implementation file or SCORECARD.md was edited, and no commit was made. The clone and all seat scratch were removed before handoff.

--compare alone excludes exact agent.db-shm, agent.db-wal, and agent.db-journal names from added/removed/changed/first. transient counts distinct excluded names present in either shape, including unchanged ones. Raw entries/receipt totals still count every entry. Snapshot, shape, census, metadata reading and member-content blindness remain unchanged. The header documents the compare-only contract. Ten new selftest cases cover each suffix added, removed and metadata-changed, plus real drift alongside a transient; all existing cases remain.

## Retained evidence

All files below are siblings in this report directory.

- open-checklist.txt: retained SKILL.md:753 failure excerpt, including entries=68 receipt=64 added=4 first=agent.db-shm.
- shape.json: byte copy of the pinned shape-only receipt used for synthetic and live comparisons. Synthetic members were empty, materialized solely from names/kinds/modes.
- before.txt: baseline compares for shm, wal and journal each read DRIFT entries=65 receipt=64 added=1, exit 1.
- after.txt: each suffix alone reads IN_SYNC entries=65 receipt=64 added=0 removed=0 changed=0 transient=1, exit 0. A real added member plus shm reads DRIFT added=1 first=zz-real-member transient=1, exit 1.
- live-twice.txt: both live reads are byte-identical: OMP_SHAPE_COMPARE: IN_SYNC entries=64 receipt=64 added=0 removed=0 changed=0 transient=0; exit 0. Live member contents were never opened or modified.
- pin.txt: exact old/new pin lines for L1; new SHA-256 c5986057a3fcd27761cbd77c7387267813089ed7c4affb6a4ad03f36d1164c98.
- patch.diff: single-file implementation, documentation and test additions.
- selftest.txt: explicit NOT RUN, with the parent gate command.

## Risks and blockers

The higher-priority editing-wave policy forbids running tests. Selftest PASS and clean patch application are therefore unverified; parent must apply the patch and run omp-census --selftest --work with explicit scratch, then write the pin from pin.txt. Requested comparison diagnostics were exercised and their exact commands/output/exit codes retained. No exposed LSP tool was available; symbol inspection used source reads. No tools were installed or updated. No credentials, token values or member content were read. Scope deliberately does not ignore other database sidecars, chain sidecars or real new members.

## Self-evaluation

Accuracy 4: exact observed diagnostics retained; selftest unrun. Completeness 4: all implementation and receipt files delivered, but parent-owned selftest/apply gates remain. Clarity 4: transient union semantics explicit; parent must distinguish raw totals from compared totals. Actionability 4: patch and exact pin ready, integration gate still needed. Conciseness 4: report repeats the key receipt readings for handoff. Overall 4.0/5. Improvement: parent runs the deferred gates before claiming acceptance. Would the user agree? The outstanding acceptance gate is disclosed rather than claimed passed.
