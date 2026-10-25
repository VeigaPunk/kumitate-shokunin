# R22 — round-60 `session.resume_hint` count

**Counterexample / result.** The all-stream count is 5 actual `session.resume_hint` records, not a larger count inferred from the literal token appearing in prose or serialized tool-call text. A full parse of every `*.stream.jsonl` under `.ufo/waves/round-60` found 32 stream files, 1,040 JSON records, zero malformed lines, 5 records whose parsed top-level `type` equals `session.resume_hint`, and 5 raw lines containing the string. All five coincide, each in a separate live-seat stream.

**Reproduction (worktree evidence):**

```text
python -c 'import json,pathlib; p=pathlib.Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-60"); fs=sorted(p.rglob("*.stream.jsonl")); rec=[]; texts=[]; total=0
for f in fs:
 for n,line in enumerate(f.read_text().splitlines(),1):
  o=json.loads(line); total+=1
  if o.get("type")=="session.resume_hint": rec.append((f.name,n,o.get("role"),o.get("session_id")))
  if "session.resume_hint" in line: texts.append((f.name,n,o.get("type")))
print("files",len(fs),"json_records",total,"actual_type_events",len(rec),"text_occurrences",len(texts)); print("events",rec); print("occurrences",texts)'
```

Output:

```text
files 32 json_records 1040 actual_type_events 5 text_occurrences 5
events [('ExecCensus.stream.jsonl', 40, 'meta', 'session_985f1d42-bc52-4443-b1e2-0eb0ef8f9c9e'), ('ExecGates.stream.jsonl', 36, 'meta', 'session_3954136f-c596-42bb-96e2-452eca6a312f'), ('ExecRows.stream.jsonl', 34, 'meta', 'session_9b3e6593-23c2-4015-8f93-bbe4ecca6efa'), ('RevS133Quote.stream.jsonl', 22, 'meta', 'session_f3ea5f29-29bb-48d5-ba98-5c93e56aa2fa'), ('RevS190Quote.stream.jsonl', 32, 'meta', 'session_1b69d280-68da-4eb8-9147-f2113a964d69')]
occurrences [('ExecCensus.stream.jsonl', 40, 'session.resume_hint'), ('ExecGates.stream.jsonl', 36, 'session.resume_hint'), ('ExecRows.stream.jsonl', 34, 'session.resume_hint'), ('RevS133Quote.stream.jsonl', 22, 'session.resume_hint'), ('RevS190Quote.stream.jsonl', 32, 'session.resume_hint')]
```

**Claim cross-check.** The committed dead-seat table says there are five `exit=0` seats and that each has one matching resume-hint event, while no `exit=-9` seat has one (`.ufo/waves/round-60/close/dead-seats-r60.md:14-17`). The enumerated five records exactly match its five live seats and session IDs: ExecRows, ExecGates, ExecCensus, RevS133Quote, RevS190Quote (same file lines 28-31, 38). The count is supported by recorded stream data; it is not merely an author-string claim. This scan is current worktree evidence, while the cited table explicitly states its derivation from committed blobs at `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`; no committed-blob recount was performed here.

**Why this reaches the target.** Parsed `type` equality distinguishes event identity from an incidental string occurrence; recursively scanning the complete round-60 stream tree covers all 32 stream files, rather than a sample. Here the lexical and typed counts agree, and the typed records independently reconcile to the five reported live seats. Evidence pointers: `.ufo/waves/round-60/w1/{ExecCensus,ExecGates,ExecRows,RevS133Quote,RevS190Quote}.stream.jsonl` at the line numbers above; committed `close/dead-seats-r60.md:14-17,28-31,38`.