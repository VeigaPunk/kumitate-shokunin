# Spec the C1 gate may rely on — dispatcher, seat naming, session storage

Ground: `/fast/scratch/hyaku-run7/dispatcher.py` (read-only), `dispatcher.log`, and the host store
`~/.omp/agent/sessions/-Projects-shokunin/` (two orchestrator sessions, 1 614 `*.jsonl`).
Everything below is observed unless marked **[INFERENCE]**.

## S1 — storage layout
- Root `~/.omp/agent/sessions/`; level 1 is the project key = cwd with `/`→`-` (`-Projects-shokunin`).
- Orchestrator session: `<ts>_<uuid>.jsonl` **plus a sibling directory** `<ts>_<uuid>/` holding its children.
- Child spawned by the orchestrator: `<root>/<projectKey>/<ts>_<uuid>/<Label>.jsonl` and `<Label>.md`.
- Child spawned by a **subagent**: `<root>/<projectKey>/<ts>_<uuid>/<ParentLabel>/<ParentLabel>.<Label>.jsonl`
  (e.g. `KengakuR33/` 108 files, `TabiR27/` 144, `SoujiR27a2/` 4, S1-era `L1Souji22/`, `L1Kaidoku34-2/`).
- `<Label>.md` is the seat's **yield payload** (the `data` object of its `yield` call), written when the
  yield is accepted — before `session_exit`. It is not the wave-dir report of the same name.

## S2 — naming, and what `-N` means
- Label = `tasks[].name`; `dispatcher.py:72` `HANDLES[t['name']] = agent(prompt, agent=t['agent'], label=t['name'])`.
- The harness keeps labels unique **per parent session**: the 2nd spawn of a used label becomes `<Label>-2`,
  the 3rd `-3`, … and `agent()` returns the suffixed id. Observed map (orchestrator cell, 17:24:00Z):
  `{'R33WaveBook': 'R33WaveBook-2', 'R33ExecVerifySelf': 'R33ExecVerifySelf-2', 'R33SentinelScope': 'R33SentinelScope-2'}`.
- The dispatcher expects this: `live()` (`dispatcher.py:38-39`) matches `<name>` **or** `<name>-\d+`.
- `-N` therefore means **"this label was already used in this parent session"** — not "this wave retried".
  tameshi r45 w1: 45 base, 38 `-2`, 33 `-3`, 1 `-4` (`MutC1Counter-4`); the `-2` set is a contiguous prefix
  of the dispatch order, the `-3` set is not.

## S3 — prompt composition (three generations exist in the store)
- gen C, frozen dispatcher `register()` (`dispatcher.py:71`): `tc.context + "\n\n# Seat " + name + "\n" + task`;
  the harness prepends `Complete assignment thoroughly:\n\n`. Observed tameshi bytes:
  `...route table decides.\n# Seat ExecRows01\n/skill:godspeed...` — a single `\n` before the header, i.e. the
  code live at 19:44Z was not byte-identical to the rebuilt file; the gate must not depend on the separator.
- gen B (custom `dispatch_ready`, orchestrator cell 17:21Z): `context + SEAT_NOTE + "\n\n---\n\n" + task` — no `# Seat`.
- gen A: task only — no context, no `# Seat`.
- K63 w1: 40/40 seats satisfy `# Seat <name>\n` + context head + task tail (verified independently).

## S4 — parentSession and ids
- `session.parentSession` = absolute path of the parent session's `.jsonl`; identical for every seat of an
  orchestrator-dispatched wave (tameshi w1 45/45, K63 w1 40/40, kengaku build 32/32), all pointing at
  `.../2026-10-25T16-43-09-760Z_01a173f1-….jsonl`.
- Seats spawned by an L1 point at that L1's jsonl instead (and land in the nested directory of S1).
- `session.id` is unique per session: 0 duplicates across those three waves.

## S5 — end of a seat
- Order: `message{toolCall yield}` → `custom{tool_execution_start yield}` → `message{toolResult "Result submitted."}`
  → `custom{session_exit, data:{reason:"dispose", kind:"normal"}}`.
- **Every** `session_exit` row in the store is `reason=dispose, kind=normal` — 1 445 of 1 445. The cancelled L1
  `TsukuroiR37` (replaced by `TsukuroiR37a2` after a stale-model pin) also ended `normal`.
- Death is recorded only as the **absence of a yield row**. A killed/cancelled seat has no yield and usually no
  exit row at all.
- There is a live **yield→dispose window**: at the time of writing, 17 of the 40 K63 w1 seats have a yield row,
  no `session_exit`, and their `.md` present.

## S6 — dispatcher log semantics
- `spawned <lane> <round> <wave> N` is written **after** the spawn loop (`dispatcher.py:73-77`), and
  `N = len(tasks)` from the dispatch JSON — never the number actually spawned.
- `done <lane> <wave> <abs path to <wave>-results.json>` is written by `finalize()`.
- `cap-defer <ready>` = the pre-spawn cap check refused; `wave-error <ready> RuntimeError('Background job limit
  reached (100)…')` = a spawn loop aborted mid-list (this is what produces duplicate labels on the next attempt);
  `adopted <ready>` = the orchestrator kernel restarted and re-adopted the wave.
- An aborted attempt writes no `.dispatched`, no `spawned` line, no `WAVES` entry: the next attempt restarts at
  `tasks[0]` **[INFERENCE: the pass→suffix mapping is not recorded anywhere; the prefix shape of the suffix
  census and the single `wave-error` line are consistent with it]**.
