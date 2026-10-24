# ScoutS124 — round 58, wave 1

- Axes: operability, coverage.
- Measured integration revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1). Registry, source row, lesson, entry, and pinned capture were read with read-only `git show`.
- Outcome: **independently corroborated**. The S124 quote and scoped tier-A judgment hold, and `queued` is the correct R1 status rather than `mined`. This is a source finding, not an A58/D58 counter verdict.

## Source, access, and quote

- URL: https://nightlies.apache.org/flink/flink-docs-master/docs/dev/datastream/fault-tolerance/checkpointing/
- Access date: `2026-10-24`; independent refetch at `2026-10-24T22:44:49Z`.
- Observed fetch: curl exit `0`, empty stderr, HTTP `200`, effective URL unchanged, `content_type=text/html`.
- Located quote (lead, 13 words): “In order to make state fault tolerant, Flink needs to checkpoint the state.”

The exact quote occurs once in decoded, whitespace-normalized visible text in both the R1 pinned capture and the independent refetch. Its inline `<strong>` markup does not change the prose. The R1 row and capture receipt both name this same lead quote.

The fresh and R1-pinned bodies are each `149730` bytes and have SHA-256 `1aafd5e2a7242ef7fbe1b8ce8945fa64f98e332c30af6b876e02a5189533f7d4`. Independent `sha256sum` exited `0`; `cmp --silent` exited `0`, proving byte identity. R1 `.ufo/pins/source-captures.json` points S124 to `.ufo/waves/round-58/build/ScoutFlink/body.html` with that same hash and byte count.

## Tier judgment

**Tier A, scoped to Flink checkpointing and its configuration semantics.** This is first-party Apache Flink documentation, hence primary/authoritative under `CORPUS.md`'s tier rule for that scope. It directly documents checkpoint-based state and stream-position recovery plus the named controls. Because the URL tracks `master` nightlies rather than a fixed release, the access date, capture hash, and `on-release` recheck remain material. The tier does not make Flink authoritative for kumitate's separate orchestrator design.

## `queued` versus `mined`

**Keep `queued`; do not promote S124 to `mined` in this round.** This is a deferral, not a quality rejection or a finding that the source is irrelevant.

1. The fleet contract defines `queued` as opened and worth mining, and `mined` as cited by at least one path in `used-by` (`CORPUS.md:103-108`). R1's S124 row is `queued` with `used-by` `—`. D58 correspondingly requires S112/S122/S123 to be mined but only requires S124's capture pin.
2. The source is topically relevant: besides the pinned quote, it says checkpoints recover state and stream positions. The named interval, timeout, storage, minimum-pause, and tolerable-failure controls were all independently located. Thus the evidence does not support rejecting S124 or claiming the knobs are absent.
3. Those controls are nevertheless Flink `StreamExecutionEnvironment` / checkpoint-configuration mechanics. R1's admitted mapping uses Temporal, Kafka, and LangGraph; S124 appears only as opened/queued and under **Withheld claims**, where the Flink-to-orchestrator state-plane mapping is explicitly deferred. A gate-table or withheld-claim mention is not substantive mining. Marking the row `mined` without that mapping and a `used-by` target would overstate coverage and conflict with the registry contract.

A future round can mine S124 when it actually uses the source in a scoped knowledge/lesson mapping—most cleanly an embedded-streaming/durable-state mapping rather than an unsupported equivalence to dispatcher state—and records that path in `used-by`. No such change is needed to corroborate C2 as frozen.

## Evidence and boundary

Full commands, stdout, stderr, and exit codes are under `.ufo/waves/round-58/build/ScoutS124/`:

- `01-r1-sources.*` through `04-r1-entry.*`: R1 source row, capture registry, lesson, and knowledge entry; all exits `0`.
- `05-live-fetch.*` and `06-access-date.*`: independent URL reopen and access timestamp; exits `0`.
- `07-r1-pinned-capture.*` and `08-r1-capture-receipt.*`: exact R1 capture and receipt; exits `0`.
- `09-status-contract.*`: tier/status contract excerpt; exit `0`.
- `10-sha256.*`, `11-byte-compare.*`, and `12-quote-knobs-check.*`: hash, byte-identity, quote, recovery-statement, and knob checks; all exits `0`, with empty stderr.

No production file, source row, knowledge entry, pin, Git/jj state, or other seat directory was changed. No commit, push, dispatch, subagent, or install occurred.

Report: .ufo/waves/round-58/w1/ScoutS124.md
