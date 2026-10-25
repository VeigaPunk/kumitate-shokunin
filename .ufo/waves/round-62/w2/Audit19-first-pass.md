# Audit19 r62 missing-dimensions review

Read-only review of the r61 Audit19 handoff against the r62 dispatch and the r62 `w1/Audit19.md`. No files edited except this report; no commits, tests, installs, fixtures, or prior identity recontact.

## Scope and identity

Former item: r61 `w2-spec.json` `Audit19` entry (lines 298–304), explicitly re-queued in the r62 dispatch. The old identity `L1Kumitate61.Audit19` is not revived or contacted. The r62 report actually present is `.ufo/waves/round-62/w1/Audit19.md`; the r62 w2 dispatch carries a separately assigned Audit19 item, but `.ufo/waves/round-62/w2/Audit19.md` is absent. I compare the former prompt's dimensions with the actual w1 report and identify its incomplete checks; I do not claim the round's plan or verdict (dispatch context says the claim plan is not frozen).

## Original test dimensions vs r62 report

Former prompt: “Audit `.ufo/waves/round-60/close/dead-seats-r60.md` against committed progress, stream files and launcher log: count 32/5/27, full errors no truncation, traceback exact.” The detailed r61 follow-up enumerates four required checks (r61 w1 `Audit19.md:58–61`):

| Dimension | r62 w1 report | Assessment |
|---|---|---|
| Independently re-derive counts from committed progress and launcher line counts | Reports counts but does not show an independently reproducible command/output; this review independently ran the committed-byte count below | Partial, not a demonstrated self-check in the report |
| Full no-truncation scan of all 64 `.err` and `.stream.jsonl` files, including all tails/events | Report only states 32 `.err` files and gives two examples; does not inspect/cite the complete 64-file set | **Missing** |
| Byte-exact traceback comparison and end-of-log/no-DONE | Quotes lines 65–68 and says end/no DONE; no byte-comparison command/output | **Missing exact byte comparison**; end/no-DONE assertion is present but not independently substantiated there |
| Cross-check each of 32 rows' pid/exit/session against matching spawn/settled records | Reports aggregate session/exit correlation, not the 32 row-by-row pid/exit/session joins | **Missing** |

Additional inherited claims that also need full evidence to close the actual dead-seat table: one `session.resume_hint` per live seat and none per dead seat; all 589 retries/events and their `max_attempts`, delay range, and HTTP 429/provider error; all 27 timeout durations and their relation to 420-second `SEAT_TIMEOUT`; the claimed window bounds; complete table/error-tail agreement and launcher-registry crash explanation. The r62 report gives aggregate summaries, examples, or assertions, but not exhaustive per-seat/per-file evidence for these dimensions. Its own §4 correctly marks four tests unexecuted; it must not describe the original audit as complete.

## Independent committed-byte checks

Commands used explicit repository and revision:

```sh
D=/home/vgpnk/Projects/shokunin/kumitate-shokunin
R=be4a820c344d4eb2f94b999c3b5d649e76ab70f1
git -C "$D" show "$R:.ufo/waves/round-60/w1/launcher-progress.tsv" | awk -F '\t' 'NF { n++; if ($4 ~ /exit=0/) z++; else if ($4 ~ /exit=-9/) m++; else other++ } END {print "rows=" n, "exit0=" z, "exit-9=" m, "other=" other+0}'
git -C "$D" show "$R:.ufo/waves/round-60/w1-launcher.log" | awk '/spawn/ {s++} /settled/ {t++} /DONE/ {d++} END {print "spawn="s, "settled="t, "DONE="d+0}'
```

Observed: `rows=32 exit0=5 exit-9=27 other=0`; `spawn=32 settled=32 DONE=0`. The final committed log lines are exactly:

```text
65:Traceback (most recent call last):
66:  File "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-60/launcher.py.txt", line 95, in <module>
67:    parts = dict(p.split("=", 1) for p in line.split("\t")[1:])
68:ValueError: dictionary update sequence element #6 has length 1; 2 is required
```

Important provenance limitation: the cited r61/r62 Audit19 text says its target table is present at `be4a820c`, but `git -C "$D" show "$R:.ufo/waves/round-60/close/dead-seats-r60.md"` fails: “path … exists on disk, but not in …”. Thus the evidence supports independent recomputation of the raw counts/log state, not a revision-pinned comparison against the alleged table at that revision. The same pinned revision's w1 tree has 72 paths (including the 32 error and 32 stream files), but this audit did not read/check every such file; no full no-truncation claim is made.

## Finding

The r62 w1 Audit19 report is useful corroboration and explicitly preserves four incomplete checks, but it does not satisfy the former prompt's full audit dimensions. The main concrete gaps are exhaustive scanning of all 64 files, byte-level traceback verification, and per-row pid/exit/session reconciliation; additionally the alleged comparison target table is absent from the claimed committed revision. These are missing tests/evidence, not a verdict on r62 claims. Evidence pointers: `.ufo/waves/round-61/w2-spec.json:298-304`; `.ufo/waves/round-62/w1/Audit19.md:40-68`; committed evidence at `be4a820c344d4eb2f94b999c3b5d649e76ab70f1` paths above; r62 dispatch `.ufo/waves/round-62/w2-dispatch.json`.
