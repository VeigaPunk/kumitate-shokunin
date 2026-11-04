### Proposed Q78 — pre-data control classes, each with an exact unique verdict assertion (round 85)

Number and placement are an L1 integration decision; the text below is the criterion as
drafted for `corpus/QUALITY.md`.

- **Q78 — every claim freezes four pre-data control classes, each asserted with an exact unique
  verdict, before its first data run.** Grounding: round-84's `vacuous` row
  (`corpus/lessons/round-84.md`): a six-line label-keyed no-reader printed the same 16 labels
  and reached `held=16/16` without opening a receipt, so the round's claim stopped even though
  the instrument's own arms were green. Q29 had already required named skip-work controls
  before data, but only the absent and constant classes were measured. A claim whose evidence
  is a counter's own output must freeze, **before its first data commit**, four control
  classes scored by the same frozen counter: (a) the **absent tool** — the base tree without
  the work; (b) the **constant printer** — a program that always answers the success verdict;
  (c) the **label-keyed no-reader** — canned answers keyed on the input's label that never open
  it; (d) the **same-path content variation** — one input path written N times with different
  content, which must yield N distinct answers and N distinct input-derived digests. Each
  class is asserted with an **exact unique verdict** — the exit code *and* the derived verdict
  line the counter prints, including its byte count and digest — and the four assertions must
  differ from one another and from the claimed success verdict: a control that reaches the
  claim's success verdict falsifies the counter, not the claim.
  - **Who checks.** The lane L1 before the freeze commit, and before the first data run of the
    claim it guards; the non-author closure re-runs one committed control against the frozen
    counter.
  - **Field.** For every round claim whose evidence is a counter's or probe's own output: the
    four control classes above, each with its committed control source, its committed control
    receipt (command, exit code, and the revision measured), and the exact expected verdict
    string. A claim evidenced by a committed artifact of another kind names the equivalent
    control that skips its work.
  - **Command.** The frozen counter and the frozen controls, each with its own `--lane` and
    `--work`: the probe scores the base tree, the constant printer, the label-keyed no-reader,
    and the content-variation control; the same content-variation control is also scored
    against each of the three control tools. The receipts are committed **before** the
    measured receipt, and each control's expected verdict is checked as an exact string —
    exit code plus the derived line, not a tally.
  - **Fails when.** A control class is missing or is measured after data; a control reaches the
    claim's success verdict; two control classes assert the same verdict, so a control that
    cannot be told from the work is not yet a control; a control's receipt names a tally
    instead of the exact expected verdict; the same-path variation control does not produce N
    distinct digests for N distinct contents.
  - **Shown able to fail.** Round 84's `vacuous` row: the label-keyed no-reader
    (`.ufo/waves/round-84/build/K84Critic/no-work-probe-node.txt`) reached `held=16/16` against
    the frozen 16-arm probe. Round 85 freezes the same class as
    `.ufo/waves/round-85/controls/noreader.txt` and reads `UNMET held=1/20` against the
    20-arm probe, and `.ufo/waves/round-85/controls/cv-noreader.txt` reads
    `UNMET held=0/3` — the class is caught by the derived line, not by the label.
  - **Limit.** A control class is a floor on what a claim must distinguish, not a proof that
    the claim's counter is correct: the classes cover absent, constant, label-keyed and
    same-path variation, and a class outside those four (for example a program that reads
    bytes without understanding them) is not excluded by them. The criterion bounds vacuity; it
    does not establish semantic correctness, and it does not claim that a frozen counter's own
    success verdict is an oracle.
  - **Supersedes.** None; extends Q29's named-control requirement with the same-path content
    variation class and with the exact-unique-verdict requirement per class.
