# ReviewS117Admission — S117 Temporal detecting-activity-failures re-open (round 57)

Verdict: **CORROBORATED — admission upheld.** The S117 row, its Gate quote, its pin,
and the tier A judgment all survive independent re-verification. No production byte was
changed; no commit, jj/git mutation, pacman call, or install was performed.

## Re-open record (as required)

- **URL:** https://docs.temporal.io/encyclopedia/detecting-activity-failures
- **Access date:** 2026-10-24 (re-fetched this seat; `curl -sS -L` → HTTP 200, 80,679 bytes)
- **Located quote (18 words ≤ 25):** "An Activity Heartbeat is a ping from the Worker
  that is executing the Activity to the Temporal Service."
- **Tier judgment:** **A — defensible.** `kind=docs`; per SOURCES-CONTRACT-v1, tier A =
  primary or authoritative for the row's scope, official docs named. S117's scope is
  *Temporal's* worker-liveness contract; the vendor's own documentation of its own
  heartbeat semantics is the primary source by definition. Scope is correctly confined
  to Temporal — no cross-system generalization is claimed for the row.

## Byte-identity of the capture

`sha256(s117-live.html)` re-fetched 2026-10-24 =
`c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50`, byte-identical to
the scout capture `.ufo/waves/round-57/build/ScoutTemporalHb/temporal-activity-failures.html`
and to the `.ufo/pins/source-captures.json` S117 pin (same sha256, `bytes: 80679`,
`captured: 2026-10-24`). The pinned capture is the live page; no drift since admission.

## Quote verification against live bytes

| check | result |
|---|---|
| Gate quote verbatim (incl. terminal period) | exact string, **1 occurrence** at byte 53,945 |
| Word count | 18 words — under the 25-word cap |
| Located | nearest preceding heading = `Activity Heartbeat` (h2 at byte 53,629); quote is the section's first sentence — § located |
| Supporting quotes in `corpus/knowledge/worker-heartbeat-liveness.md` | all verbatim: "informs the Temporal Service that the Activity Execution is making progress and the Worker has not crashed"; "Activity Heartbeats work in conjunction with a Heartbeat Timeout" (contiguous once markup strips); "We strongly recommend setting a Start-To-Close Timeout"; "we recommend using a relatively short Heartbeat Timeout and a frequent Heartbeat"; "an application layer payload" |
| Scope clause "four timeout slots bound each leg" | page h2s confirmed: Schedule-To-Start, Start-To-Close, Schedule-To-Close, Heartbeat Timeout |

## Findings

**None blocking.** Two cosmetic notes, neither affecting the admission:

1. `SOURCES.md` anchor and `corpus/lessons/round-57.md` locator write
   `§Activity Heartbeats` (plural); the rendered page heading is `Activity Heartbeat`
   (singular). The section is unambiguous — located regardless; the quote sits directly
   under it.
2. The row's scope phrase "a missed Heartbeat Timeout marks the Activity failed" is a
   fair paraphrase, not a quote — the page's own wording is "If an Activity Task
   Execution times out due to a missed Heartbeat, the next Activity Task can access and
   continue with that payload" (i.e., failed *attempt* retried with progress). The
   entry `worker-heartbeat-liveness.md` does not overstate this.

## Evidence retained

`.ufo/waves/round-57/build/ReviewS117Admission/` — `s117-live.html` (re-fetch bytes),
`evidence.txt` (full transcript: fetch, hashes, quote checks, tier contract, section
text), `curl-stderr.txt` (empty; clean fetch).

Residual risk: none identified in scope. Tier A is scoped to Temporal's own contract —
any future row generalizing heartbeat semantics across vendors would need its own
scoped tier, which this row does not attempt.
