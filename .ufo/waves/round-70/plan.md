# Round 70 — frozen replay-control isolation

Base B = 78b98d762ccf3e3a0961f94c4042eaabd2bcb706. One claim, on the lowest non-retired axis, operability (integer held at terminal 9). No coverage score or new knowledge entry is claimed.

## C1 — operability / capability control-replay

Predicate, counter and receipt label: **REPLAY70_HELD iff the ten bounded replay obligations hold.** Target 10/10, from the base receipt's 2/10. Command:

`TMPDIR=/fast/scratch/hyaku/kumitate-r70/L1 node .ufo/waves/round-70/probe/replay70-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin REV`

R1 preserves the two frozen round-69 control scripts; R2 exercises an isolated selftest; R3–R7 re-run c1 donothing/autoledger and c2 donothing/autoorigin/forgecapture into new private output files, require the old UNMET predicate plus CONTROL-PASS, preserve prior receipt digests, and reclaim work directories; R8 invalid args return 64; R9 existing output is unchanged after refusal; R10 tool registry, source pin and demonstrated capability row agree. Counter code is normative. Frozen r69 counters and original scripts remain unchanged; no semantic-remediation or universal forgery-resistance claim is made. The live c2 forged capture arm remains network-dependent: failure is reported, never waived.

## Implementation contract

New `scripts/control-replay.mjs`: `--lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR`, self-invocation `--selftest`. Bound only to the five frozen controls, not an arbitrary command runner. Generate a versioned private script copy: substitute LANE/PROBE/W/S assignments exactly once, remove the known unused fixed temporary write, use explicit fixture-root git arguments and scrub inherited repository environment. Unique mkdtemp child under the supplied work root, receipts copied out before cleanup, output creation exclusive. Refuse unexpected frozen source bytes. Original files are read-only; do not run originals directly. Selftest is hermetic, with stable finding ids and expected exit maps. Reuse existing patterns, no host/routing writes.

## Controls and freeze

`base/replay70-base.txt` is the do-nothing control: absent tool must remain UNMET (2/10), exit 1. A print-PASS/no-output stub must remain UNMET; seats attack this and implementation-forgery controls, with limits disclosed rather than changing this predicate after scoring. Existing-output red case is R9; scratch-before offending source is preserved at r69 c2 line 80. Counter and plan freeze before any ready file or seat scores candidate data. `base/freeze-map.txt` must be CLEAN at this commit; do not anticipate PLAN_BEFORE_READY PASS before an observed marker exists. Pins are added without changing counter bytes.

## Wave and ownership

One v2 wave, 64 distinct build/audit/attack seats, at least 16 attack roles; L1 holds canonical planner seat. Few connectors cover sibling-overlap and cross-surface pattern search. Executors/scribes write only unique private build/report paths; L1 alone integrates production paths and commits through jj-lane.sh. Every spawned seat is leaf. No report before WAVE-DONE and results reconciliation. No replacements or residual wave intended.

## Frontier, limits and admission

Opened source S217 is own-work, the frozen r69 c2 control at B; lesson Gate locates the fixed-output assignment and temporary write. Registry additions only after opening; capture source bytes and record census before/after. Expansion unchanged (no new uncovered knowledge entry). Assimilation none; one considerthese proposal (2026-10-26 idea 4) is mined. Mistakes and routed notes are in corpus/lessons/round-70.md. No inherited dirty work at start. Required non-author closure remains outside this lane.

## Close sequence

Integrate findings, run one final verification pass after seats settle, commit work/pins/docs/receipts, measure committed REV, record exact receipts and measured hash in SCORECARD/LOG. Preserve frozen counter. Refresh proxy terms without changing formulas. Misroot sweep, remote ls-remote final lane hash, then report last with one SHONEN section and four boxes; report-receipt comparison; fleet-commit --as kumitate. Delete round scratch after landing. No installs planned; pacman paused.
