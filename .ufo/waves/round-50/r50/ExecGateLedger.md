# ExecGateLedger — round-49 ledger audit

Axes: coverage (source/entry curation) and quality/discernment (Q1/Q21 decisions and the outside sample).

## Required content and disposition

`CORPUS.md` requires each round lesson to record a `## Gate` with candidates, admits, rejections and spot-check result (lines 18–20); new source rows need URL, access date, and a located quote of at most 25 words (lines 112–115). `LEARNING.md` requires an outside non-author sample of at least one admit and one reject, with agree/disagree and reason (lines 40–46). Lane `QUALITY.md` Q21 requires decisions to name the candidate and criterion; a hold/reject also needs a flip condition (lines 215–241).

The r49 spec explicitly assigned `ScribeReopenS095` and `ScribeReopenS098` (r49-spec.json:237–252). The closure says neither has a committed re-open receipt (spot-check §5, item 3), so the ledger must not invent a re-open verdict or retain “no cell changed” as independently evidenced. Record them as held for missing durable re-open evidence, with the source URL, expected hash, and a flip condition. `S099` is the new source admitted as tier A/mined, with its location, date, quote, and body hash.

Include the C2/D49 result, but distinguish that counter result from Q1 corpus-entry admission. The non-author spot-check agreed with the D49 admission test; the H1 freeze receipt separately recorded `ENTRY_HEADER_REQUIRED` for this new knowledge file. The current file read for this audit has a provenance trio at lines 1–3; that live state does not erase the freeze-time failure or prove a check passed.

## Proposed exact append block

```markdown
## Gate

### Candidates

- **Hold — S095 re-open (Q2 / source-row verification).** `ScribeReopenS095` was specified in `.ufo/waves/round-49/r49-spec.json:237-243` to re-fetch `https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`, verify SHA-256 `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da`, and check the bind/tmpfs passages. The R49 closure has no committed S095 re-open receipt, so its source verdict is not established here; the existing Frontier sentence “Re-opened, no cell changed” is not a substitute for the receipt. **Flip:** commit the re-open result with the verified body hash and located passages, then record HOLD or DRIFT and any `recheck` change.
- **Hold — S098 re-open (Q2 / source-row verification).** `ScribeReopenS098` was specified in `.ufo/waves/round-49/r49-spec.json:246-252` to re-fetch `https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in`, verify SHA-256 `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a`, and check the cited alignment and unfinished/resumed spans. The R49 closure has no committed S098 re-open receipt, so its source verdict is not established here. **Flip:** commit the re-open result with the verified body hash and located spans, then record HOLD or DRIFT and any `recheck` change.
- **Admit candidate — S099, new `proc_pid_mountinfo(5)` source row (Q2).** URL `https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html`; opened 2026-10-23; tier A, `docs`; body SHA-256 `27a0e5ad5cf9fc4ef4059cd0c4a9b70fa2ac23457a4d39b82f2381a654b3813f`. Located quote: “This file contains information about mounts in the process's mount namespace (see mount_namespaces(7)).” — DESCRIPTION paragraph 1; the field-(5) locator identifies the mount point. The row is `mined`; used by `scripts/bind-oracle.mjs`, `corpus/knowledge/counter-amendment-discipline.md`, and this lesson.
- **C2/D49 result — record separately from corpus-entry admission.** The frozen rule D49 scored the `counter-amendment-discipline.md` entry `16/16` at the tip; the outside check agreed with that predicate result. This is not evidence that the entry cleared every corpus criterion: the R50 freeze H1 receipt records `SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)` for this new knowledge path (R50-10). The current R50 working bytes have the header trio at lines 1–3; do not rewrite the freeze-time result as a pass.

### Admitted

- **Admit — S099** as a tier-A, mined source row, on the opened source and located quotation above.
- **Admit — C2/D49 scoring outcome only:** the entry met the frozen D49 predicate at the scored tip (`16/16`, `rows=3`, `exit 0`); this does not waive Q1 for corpus entry admission.

### Rejected

- **No SOURCES candidate row was rejected this round.** The source-frontier record says “Rejected this round: none.”
- **Reject — the doctored C2 receipt control** (`.ufo/waves/round-49/r49/C2-doctored-control-589d25e4c2dc6600f6d8db1468b832555bda9dd0.txt`) under D49: the changed receipt hash produced `UNMET … hash-mismatch`, exit 1; the non-author verifier reproduced and agreed with this rejection.
- **Reject — C1 instrument mutants K4–K6** under B49: dropped binds produced `MISSING missing=3`, added `/etc` bind produced `EXTRA extra=1`, and removing `--tmpfs /tmp` produced `CONTROL_VISIBLE visible=1`, each exit 1; the non-author verifier agreed.

### Spot-check

The non-author closure `corpus/lessons/round-49-verifier-spotcheck.md` §3 (lines 98–109) agrees with the S099 admit, the C2/D49 predicate result, the doctored-receipt reject, and the K4–K6 rejects. It disagrees with the report's “discernment — improved” because the lesson had no `## Gate`, leaving no ledger to sample; routed defect 2. Its §5 item 3 also says S095/S098 had no committed re-open receipts, so those intended re-opens are held here rather than represented as independently verified decisions.
```

## Evidence inspected (read-only)

- `/home/vgpnk/.agents/skills/shokunin/protocol/CORPUS.md:18-20,112-115` and `LEARNING.md:40-46`; lane `corpus/QUALITY.md:12-17,118-124,215-241` establish the lesson, source-row, Q1 and Q21 requirements.
- `.ufo/waves/round-49/r49-spec.json:237-252` names both source re-open seats and the expected hashes; `corpus/SOURCES.md:108,111-112` records the S095/S098/S099 rows and current statuses/used-by paths.
- `corpus/lessons/round-49-verifier-spotcheck.md:98-109,126-140` records the missing Gate and the outside check. Its recorded command `grep -n '^## ' corpus/lessons/round-49.md` returned `## Mistakes`, `## Frontier — SOURCES`, with no `## Gate`; §3 records agreement on S099, the C2 entry, the doctored copy, and K4–K6, and disagreement on the absent ledger.
- Retained H1 evidence: `.ufo/waves/round-50/controls/H1-freeze-5b0de268.txt:19-22` says `SOURCES  error  ENTRY_HEADER_REQUIRED corpus/knowledge/counter-amendment-discipline.md:1` and `SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)`, `exit=1`. This seat did not rerun H1 or D49.
- Source-body hashes quoted above are the values recorded in `corpus/SOURCES.md` and the non-author spot-check, not newly fetched by this seat.

## Files, behavior, risks, blockers

- File written: this advisory report only. No lane behavior or source file was changed; no package/tool was installed.
- Risk: R1 in the frozen R50 repairs counter checks for the four lowercase words only, not ledger truth. This draft supplies candidate decisions, explicit no-source-rejection status, control rejects, and the outside-check result so the lesson is auditable rather than merely satisfying those word checks.
- Blocker/limit: R49's missing S095/S098 receipts prevent this audit from verifying the claimed re-opens. The draft explicitly holds them; only a committed source receipt can establish the re-open outcomes.
- No builds, tests, linters, formatters, probes, or validators were run.
