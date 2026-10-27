# Open rows — why they stay open (seat K66ScribeLedger5758)

- **R57.1** (`dispatch-evidence`, round-57 item 1, "two live L1s dispatched … second launch absent from watchdog dispatch evidence").
  Searched the lane tip for an answer: `grep -rn -i -E 'double-live|two live L1|dead call' --include=*.md .` (excluding the
  spot-check itself) returns **no line outside `corpus/lessons/round-57-verifier-spotcheck.md`**; `grep -rn -i -E
  'watchdog.*dispatch|second launch|two concurrent L1' corpus/lessons/round-59.md corpus/lessons/round-6*.md LOG.md SCORECARD.md`
  likewise returns nothing about the duplicate launch. The nearest lane surface is the `dispatch-evidence` capability
  (`SCORECARD.md:1799`), which judges a **lane round's** dispatch record (progress file, session ids, report files, dead seats) —
  it does not observe orchestrator L1 liveness or a second launch of the same round. Double-dispatch is orchestrator-owned and the
  spot-check itself calls it "status-neutral, no claim harm"; no lane file closes it, so it is left open rather than pointed at a
  line that does not answer it.
- **R57.4** (`carried-l0`, round-57 item 4, "Carried L0 items unchanged: R41-2, R43-1/R43-5, A3e, R53-2.").
  This item is a carry-forward of already-open L0 questions, not a defect the lane can close. At the tip the registry still reads
  open/pending: `SCORECARD.md:2587-2588` — "(3) A3e captured-invocation question; (4) R43-1/R43-5 stay open; the R41-2 gate-pins
  ruling stays pending"; `SCORECARD.md:2562` carries R53-2 separately. A `closed` row would need an answer line that says the
  questions were resolved; none exists. Kept `open` with `-`.
