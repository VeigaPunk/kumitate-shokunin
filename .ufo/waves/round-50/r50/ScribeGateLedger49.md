# ScribeGateLedger49 — draft only

Declared round axes: **operability** and **coverage**. This ledger draft concerns the SOURCES frontier and the `discernment` gate record; it makes no axis-score claim. I did not edit `corpus/lessons/round-49.md`; the block below is for the L1 to append.

## Proposed appendable block

```markdown
## Gate

### Candidates

- **S095 — bubblewrap 0.13.1 manual** (`https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`): re-opened per `r49-spec.json` / `ScribeReopenS095` for bind, tmpfs, and filesystem-action order. The round's recorded disposition is **HOLD**; the existing `mined` / `on-release` row remains unchanged. Recorded body SHA-256: `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da`.
- **S098 — strace(1) 7.2 manual** (`https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in`): re-opened per `r49-spec.json` / `ScribeReopenS098` for return-column alignment and unfinished/resumed records. The round's recorded disposition is **HOLD**; the existing `mined` / `on-release` row remains unchanged. Recorded body SHA-256: `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a`.
- **S099 — Linux man-pages `proc_pid_mountinfo(5)`** (`https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html`): new candidate opened 2026-10-23; body SHA-256 `27a0e5ad5cf9fc4ef4059cd0c4a9b70fa2ac23457a4d39b82f2381a654b3813f`.

### Admitted

- **S099 — admitted, tier A, status `mined`.** Its ≤25-word source quote is “This file contains information about mounts in the process's mount namespace (see mount_namespaces(7)).” (DESCRIPTION paragraph 1; the mount-point locator is field (5)). The row is used by `scripts/bind-oracle.mjs`, `corpus/knowledge/counter-amendment-discipline.md`, and this lesson.
- **S095 and S098 — HOLD on re-open; no row-cell change.** These are re-open dispositions for existing mined rows, not new admissions. The lesson records the HOLD outcomes, but the non-author verifier found no committed per-seat re-open receipts under `.ufo/waves/round-49/`; therefore the dispositions are recorded as the round's stated outcomes, not independently receipt-backed here (routed R50-3).

### Rejected

- **None this round.** The doctored-receipt and K4–K6 results below are counter-control rejections, not rejected SOURCES candidates.

### Spot-check

The non-author `corpus/lessons/round-49-verifier-spotcheck.md` §3 (checked against lane tip `c432cc958304856d989438fb74c4cb48cb0ea3fc`) **agrees** with S099's tier-A/mined admission, the doctored C2 receipt's rejection, and the C1 K4–K6 mutant rejections. It **disagrees** with the report's “discernment — improved” because the lesson then had no `## Gate`, candidate/admit/reject ledger, or spot-check slot. This addendum records that routed omission; it does not retroactively claim the verifier checked this later-added text.
```

## Evidence reviewed (read-only)

- `r49-spec.json:237-252`: the named `ScribeReopenS095` and `ScribeReopenS098` assignments, with the source URLs, hashes, and re-open subjects.
- `corpus/SOURCES.md:108-112`: S095 hash `2cb77d…be1da`, S098 hash `c16859…e67ae9a`, and S099 hash `27a0e5…3813f`; S095/S098 are `mined` with `on-release`; S099 is `docs`, tier A, `mined`, opened 2026-10-23, with the listed `used-by` paths.
- `corpus/lessons/round-49.md:35-45`: existing Frontier records S099 admitted and both re-opens as no-cell-change; the same text says “Rejected this round: none.”
- `corpus/lessons/round-49-verifier-spotcheck.md:5-13, 98-109, 126-140`: tip identity, agree/disagree outcomes, missing-ledger finding, and routed defect 3 (missing re-open receipts).
- `/home/vgpnk/Projects/shokunin/CORPUS.md:18-20` and `/home/vgpnk/Projects/shokunin/LEARNING.md:68-71`: the required `## Gate` fields are candidates, admitted, rejected with reasons, and spot-check result.

Read-only searches used the exact paths above: spec terms `ScribeReopenS095|ScribeReopenS098`; spot-check terms `S099|doctored receipt|K4–K6|round gate ledger|no ## Gate|disagree`; policy terms `Gate|candidates|admitted|rejected|spot-check result`. The matched lines are cited above; no build, test, lint, formatter, or install was run.