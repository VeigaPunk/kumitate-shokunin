# handread.md — K92Reviewer independent field derivations (round 92)

Method: `myread.py` (this seat dir) was written from plan.md § "Frozen field definitions"
sentences only, before comparing to the oracle. Every field of 7 transcripts (one per
stratum fallback/dead/aborted/silent/errfix/capnone + the lone `redact` transcript) was
derived independently, then compared to `python3 probe/oracle92.py --file <p> --json`.
Cross-checks with `jq` on 3 transcripts. Receipts: `oracle-*.json`, `my-*.json`,
`derive-*.txt`, `derive-all.txt` in this dir. Transcript bytes are read-only host records,
cited by path + sha256 only; no transcript content is copied here.

## Result: 7/7 transcripts, 70/70 compared fields ALL-MATCH (oracle vs my reader)

## Transcripts (path after `sessions/-Projects-shokunin/`, sha256)

| stratum | transcript | sha256 |
|---|---|---|
| fallback | 2026-10-25T16-43-09-760Z_01a173f1…/CritGlobal.jsonl | beb6601efc78f212a25fdca1b238764a36a4f13175b57ce0835e9d92d55364e2 |
| dead | 2026-11-03T17-37-19-922Z_01a1a27c…/RV02C2Attack.jsonl | c6aca09594ec903f2008cb6dcead5cee3861578906bf54d25fc64385db998288 |
| aborted | 2026-10-26T15-10-35-484Z_01a178c3…/R45CritIntent.jsonl | 705b273f3755d3d7ac1ad110c6ed69465f442fade21bf16e3325cda409d8921a |
| silent | 2026-10-26T03-41-55-460Z_01a1764c…/Mo50CritContractFreeze.jsonl | ba22243bd42a46240a7e0416169f05556fab2fd57cdb7333e6989ef0f0a32cdc |
| errfix | 2026-10-29T19-55-04-670Z_01a1893a…/K70ConnectPatterns-26.jsonl | 5b17d66cb157a5d9effd683cf3807346a754eb827fd8365bcf19af7437fd8eb2 |
| capnone | 2026-10-26T03-41-55-460Z_01a1764c…/Mo50ConnConsiderthese-2.jsonl | bb1241c38893c755f49cec305bba529be5e68de060d79d80c86eb230ba68772a |
| redact | 2026-10-28T14-01-34-216Z_01a182d0…/C2ExecF.jsonl | 0b2331f0a6048bb51c66a9d98e96c7d5571cba816f3630beff37a62e0baea6b0 |

## Per-field derivation

- **fallback / CritGlobal**: model_change rows idx 2 (no role, zai/glm-5.3), idx 5
  (`subagent:CritGlobal`, zai/glm-5.3), idx 14 and 80 (role `fallback`, devin/swe-2 and
  inception/mercury-3, `resolvedModelIsFallback:true`). captured = zai/glm-5.3 (first
  subagent row). Assistant turns: 2 `error` + 87 `toolUse` (jq). answered = first-seen served
  models [zai/glm-5.3, devin/swe-2, inception/mercury-3]; errors=2; aborted=0; last_error = the
  2nd error turn's first line, redacted, cut at 120 ("Devin stream error resource_exhausted: …");
  yielded=true (jq: one assistant `toolCall` named `yield`); final=served (last turn toolUse);
  fallback=true (answered ⊋ captured); parse_errors=0.
- **dead / RV02C2Attack**: 6 assistant turns, all `error`, all zai/glm-5.3-flashx (jq: "6 error").
  captured=zai/glm-5.3-flashx; answered=[] (error turns never enter answered); fallback=false
  (captured set, answered empty, so "some answered differs" is vacuously false); final=dead;
  last_error = 6th error's first line ("Retry budget exhausted after 5 retries: 429 …");
  yielded=false (jq: 0 yield rows).
- **aborted / R45CritIntent**: captured=kimi-code/kimi-for-coding; answered=[devin/swe-2] so
  fallback=true; errors=1, aborted=1; final=aborted (the LAST turn decides, not the worst one);
  last_error = the 429 rate-limit line, cut at 120.
- **silent / Mo50CritContractFreeze**: zero assistant message rows → final=silent;
  captured=null; answered=[]; last_error=null; fallback=false.
- **errfix / K70ConnectPatterns-26**: one 429 error, then recovery; answered=[kimi-code/kimi-for-coding]
  equals captured, so fallback=false; final=served; yielded=true; last_error = the mid-stream 429 line.
- **capnone / Mo50ConnConsiderthese-2**: no model_change rows → captured=null; no assistant
  turns → silent. Confirms "else null" and silent-with-no-turns.
- **redact / C2ExecF**: captured=cursor/deepseek-v41-flash-1017; fallback model_changes at idx 9
  and 44; answered=[devin/deepseek-v4-1-flash, devin/swe-2] (the error turn at idx 10 under the
  cursor model does not enter answered); errors=2; last_error from idx 46 contains
  "error ID: <redacted>" (a ≥24-char run was replaced); fallback=true; final=served; yielded=true.

## Synthetic edges (scratch fixtures; copies of the two receipts kept here)

- `edge1b.jsonl`: first `subagent:edge1b` row has `"model": null`; a later role-less row has
  `"default/a"`. Readings of `captured`: **oracle92.py → "default/a"**; my reader → null;
  shipped `seat-route.mjs` → null. Plan sentence: "`model` of the first model_change row whose role
  is subagent:<seat>; if none, …" — a row exists, so the plan gives null. The oracle falls through
  (oracle92.py:55-61, `if captured is None:` runs on a null subagent model). See review.md F1.
- edge2: non-string `errorMessage` → last_error = "" (not null), as the plan says.
- edge3: a 32-char token inside a 51-char first line → `<redacted> token-after <short> tail`;
  redaction runs before the 120-char cut.
- edge4: 37-char token with `-`/`_` redacted; a non-JSON line and a `[1,2]` line both count as
  parse_errors=2.
- Symlinked transcript (`LinkSeat.jsonl` → `RealSeat.jsonl`): oracle locates it; shipped tool
  returns `final=absent` (Dirent.isFile() is false for symlinks). See review.md F6.
