# RevS126Quote — dead-seat report and byte accounting

## Counterexample

The dead-seat table asserts per-seat `.err` byte counts, but its source roster also contains a report file for the dead seat `RevS126Quote`: `.ufo/waves/round-60/w1/RevS126Quote.md` (6.7 KB in the current directory listing). This is not an exit-0 report: the table records `exit=-9`, `session=null`, and the reason section says it was killed at timeout. Thus existence of an `*.md` file cannot be used as evidence that the seat completed or that its work is accepted.

## Evidence

- `.ufo/waves/round-60/close/dead-seats-r60.md:39` records RevS126Quote as dead (`-9`), with null session, and `:73` records `.err bytes=7579`.
- `.ufo/waves/round-60/close/dead-seats-r60.md:63-65` defines that count as `.err` bytes and explains that `.err tail` is the last non-empty line; it does not define “report bytes” or include a per-seat report-presence/size column.
- `.ufo/waves/round-60/w1/` directory listing includes `RevS126Quote.md` (6.7 KB), alongside `RevS126Quote.err` (7.4 KB) and `.stream.jsonl` (47.6 KB). The report begins at `.ufo/waves/round-60/w1/RevS126Quote.md:1` with a substantive narrative, claims it was a reviewer seat and reports completed live fetch/cmp results, but ends at `:122` by claiming all commands were executed even though the dead-seat table records a kill and no session.
- The committed table provenance points to `HEAD=be4a820…` at its line 3, but explicit `git show be4a820c344d4eb2f94b999c3b5d649e76ab70f1:.ufo/waves/round-60/close/dead-seats-r60.md` returns fatal: path exists on disk, but not in that revision. Therefore the table currently inspected is worktree evidence, not a committed blob at the cited revision; do not promote its claims to committed evidence.

## Relevance / impact

The exact anomaly is that RevS126Quote has a report despite being dead. The table does not account for report bytes/presence, and its `.err bytes` metric is a different artifact and must not be interpreted as report output size. The report itself is evidence that a file exists, not that the dead process authored or finished it; its self-reported completion conflicts with the recorded timeout. This challenges operability/provenance and completeness of dead-seat accounting, not the truth of the underlying Temporal quote or digest.

## Smallest safe correction

For dead-seat accounting, enumerate the report artifact independently for every seat (present/missing and exact byte count), keep `.err` bytes explicitly labeled as stderr-only, and mark a report from a dead/null-session seat as unverified provenance rather than completion evidence. Rebuild or cite the table only from the exact committed revision actually containing it; the stated be4a820 revision does not contain the table path.
