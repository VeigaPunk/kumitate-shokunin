# Proposal — data-grounded structural floor + respawn tolerance for the inline gate

Target: `scripts/inline-dispatch-evidence.mjs` (round-63 build, not frozen). NOT applied by this
seat — the L1 integrates. Every number below is measured by `stats.mjs` over the real host
transcripts (`~/.omp/agent/sessions`, 4596 files / 3.12 GB, snapshot 2026-10-25T21:17:17Z);
see `stats.summary.txt` and `stats.tsv`.

## 1. Measured population

- 4596 `.jsonl` files, depth <= 3, none over 50 MB, none skipped.
- 639 carry the `# Seat <name>` user marker the gate matches on; of those 538 are `finished`
  (`yield` tool call + last `session_exit` kind `normal`), 58 have no `yield`, 46 have a `yield`
  but no `session_exit` record. Finish rate 83.6 %; death rate 16.4 %.
- 1439 files are `finished` in total (the rest are orchestrator sessions, sub-session fragments
  and probe runs that never carried a seat marker).

## 2. Zero-violation thresholds over the 538 finished seat-marked transcripts

| property | observed min | p5 | median | proposed floor (margin below min) |
|---|---|---|---|---|
| toolResult rows | 9 | 13 | 31 | `>= 6` |
| toolCall parts | 9 | 13 | 31 | `>= 6` |
| transcript rows | 40 | 51 | 92 | `>= 30` |
| bytes | 132136 | 210157 | 380102 | `>= 80000` |
| span seconds | 453 | 485 | 640 | `>= 240` |
| distinct tool names | 3 | 4 | 5 | `>= 2` |
| duplicate row ids | 0 | 0 | 0 | `== 0` |
| dangling `parentId` | 0 | 0 | 0 | `== 0` |
| JSON parse failures | 0 | 0 | 0 | `== 0` |
| `session` row with an id | 1 | 1 | 1 | `>= 1` |
| `yield` call answered by a `toolResult` | 1 | 1 | 1 | required |

Do **not** require `model_usage` rows: 239 of the 538 finished seat-marked transcripts have none
(the row type postdates part of the corpus).

Do **not** require `toolResult === toolCalls`: one real finished seat breaks it —
`ScoutPlanned` (chausa-shokunin) has 161 calls, 162 results, 162 `tool_execution_start` rows and
1 orphan result. The safe form is `Math.abs(toolResult - toolCalls) <= 1 && orphanResults <= 1`.

## 3. Respawn tolerance (measured defect, finding -1)

`candidates()` (line 114) returns `<name>` and every `<name>-<N>`; the prompt predicate is a
substring test on the same first user message, so when a seat was dispatched twice with the same
prompt both files match and line 224 emits `SESSION_AMBIGUOUS`. Real corpus: 98 seat-marked `-<N>` files whose
prompt names the *base* seat (i.e. genuine respawns, all in the live run-7 session), 96 with a
base-named sibling that is itself `finished`, and **63 whose first user message is byte-identical**
to that sibling's. Minimal pair: `node ambig-probe.mjs` → `ExecRows01` (3 transcripts) reads
`DRIFT … [SESSION_AMBIGUOUS]` while `ExecDiffScope` (1 transcript) reads `CLEAN`, same fixture.

Proposed replacement for line 224:

```js
    if (matched.length > 1) {
      // A genuine harness respawn writes <Seat>-N.jsonl with the same prompt; both members can
      // be clean. Prefer the clean/latest transcript and record the duplication as a note, not a
      // finding: the forger gains nothing, both files still have to carry the echoed prompt.
      const scored = matched
        .map((m) => ({ ...m, clean: m.tr.yielded && m.tr.exitKind === 'normal', at: m.tr.lastTs || '' }))
        .sort((a, b) => (Number(b.clean) - Number(a.clean)) || a.at.localeCompare(b.at));
      if (!scored[0].clean) findings.push(`SESSION_AMBIGUOUS:${t.name}`);
      else notes.push(`RESPAWNED:${t.name}=${matched.length}`);
      matched.splice(0, matched.length, scored[0]);
    }
```

(`parseTranscript` must then also expose `lastTs`; `notes` is printed after the verdict line and
never changes the exit code.)

## 4. Residual (do not overclaim)

A forger that writes a 30-row, 6-call, 80 KB transcript with a 240 s span, unique ids, a
consistent parent chain and the echoed prompt still passes. The floor raises the cost from
"one row with a yield call" to "a mechanically generated plausible session"; the barrier that
actually holds is the prompt echo + `session` id + `parentSession` + the dispatcher log line,
which live outside the lane. The floor is a cheap second lock, not a proof.
