# C1 registry identity/control finding

Axes: control reachability and identity provenance. Scope: compare the C1 harness registry with the gate's launcher/actual-record contract and assess the null/foreign-ID swap counterexample and exact existing control. Evidence is limited to committed round-61 material; no round-62 plan/claim is asserted.

## Evidence

- `.ufo/waves/round-61/build/ScoutWaveValidator/findings.md` §1b (committed evidence pointer): harness `swarm-registry.json` is `ufo-swarm-registry-v1`, with `members` as a name-keyed object; after `record`, its 32 entries have non-null `agentId` values of form `L1Kumitate61.<Name>` (hub job ids).
- Same file §4: C1's `dispatch-evidence.mjs` does not read or cross-check `swarm-registry.json`. It accepts any non-null `session` string in launcher progress; `dispatch-actual.json` members must instead be an array, and the gate checks internal row/count agreement. The harness hub id and transcript session UUID are distinct identities; the finding explicitly recommends session UUID for `session=`/`members[].agentId`, with hub id retained separately.
- `.ufo/waves/round-61/controls/ctl-c1-critic-live-gate.txt` lines 6–16 records the exact live control: gate exited 2 with `DISPATCH_EVIDENCE: FAIL-CLOSED progress-absent`, while the harness registry existed with 32 non-null agentIds; harness did not emit either gate-specific record file.
- `.ufo/waves/round-61/probe/dispatch61-probe.mjs` lines 15–21 defines P2 as gate CLEAN plus committed progress, actual record, and at least 32 seat reports. Lines 31–34 show the probe only aggregates P1–P4 pass/fail; it does not compare member identities with registry entries.

## Counterexample assessment

The null/foreign-ID swap is not prevented by the gate's identity semantics: according to the committed source analysis in ScoutWaveValidator §4, a non-null arbitrary `session` passes the session-presence condition, and no registry agreement is checked. Therefore a forged `dispatch-actual.json`/progress pair can internally agree while substituting null/foreign member identities, as long as its count and dead-seat rules are satisfied. The existing exact live control does **not** exercise that attack; it tests only absence of launcher progress and correctly fails closed. The committed probe's P2 condition proves files and gate CLEAN, not provenance or correspondence to the harness registry. This is a counterexample to any interpretation of P2 as registry-backed identity verification, not a claim that the gate fails its stated internal-consistency contract.

## Finding

P2/C1 can be satisfied without proving same-identity correspondence to the committed harness registry. The exact existing live control is insufficient to falsify this: it has no progress file and stops at `PROGRESS_ABSENT`. Evidence pointers: `.ufo/waves/round-61/build/ScoutWaveValidator/findings.md` §§1b, 4; `.ufo/waves/round-61/controls/ctl-c1-critic-live-gate.txt`; `.ufo/waves/round-61/probe/dispatch61-probe.mjs` lines 15–21, 31–34.
