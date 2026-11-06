# K92Mutation — mutation battery, round 92 claim C1 (`seat-route`)

Frozen ground truth: `probe/oracle92.py` sha256 `07e84a8f32356362b117520ae85101c2efe6d11a856afc278c9b54f270b0465d`,
counter `probe/probe92-c1.py` sha256 `323c0449b3360c0f73ea8d681a362a01b3b5c5abfac1737601153d719d55ca0d`.
Candidate `K92ExecTool/seat-route.mjs` sha256 `3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608`
(READY line matches the bytes; baseline HELD `agree=133/133 A=61/61 C=60/60 W=12/12`, `--selftest PASS held=30/30`).

Every mutant is one single-point textual replacement of a pristine copy in scratch, asserted to
produce exactly one diff hunk and to compile (`python3 -m py_compile` / `node --check`); the
mutant sources are reproduced by `gen_oracle_mutants.py` / `gen_cand_mutants.py` (copied here).
Scored with the frozen counter, run form: `probe92-c1.py --tool <mutant> --index probe/index92.tsv
--sample-a probe/sampleA.tsv --waves .ufo/waves/round-91/w1-results.json --out <receipt>`.

## Battery 1 — 17 mutants of the oracle's field readings

| id | edit | counter verdict | counter | selftest |
|---|---|---|---|---|
| m01 | redaction threshold {24,} -> {25,} | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=a7d1c4bd5d61fe14 tool_sha256=a7d1c4bd5d61fe1470731c2365951fdc33e7f1a4cd02067239a4ea10fac23440` | SURVIVED | n/a (frozen oracle has no --selftest) |
| m02 | truncate last_error [:120] -> [:121] | `C92_C1: UNMET agree=89/133 A=38/61 C=40/60 W=11/12 last_wave_located=12 salt=db4990c2b970c6de tool_sha256=db4990c2b970c6de755b5c52e5b3cc230508021a60938bfc10429a48f2bbce05` | KILLED | n/a (frozen oracle has no --selftest) |
| m03 | last error -> first error | `C92_C1: UNMET agree=112/133 A=46/61 C=54/60 W=12/12 last_wave_located=12 salt=8ca50439710df1e8 tool_sha256=8ca50439710df1e8360f116cabee21d15da3849502ec19ef42f5916b17419c7e` | KILLED | n/a (frozen oracle has no --selftest) |
| m04 | SERVED drops "length" | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=d7bce1ece736fc25 tool_sha256=d7bce1ece736fc25a5baa1b0bbdd318b704ac3fb9e7ce1e785bba3a06e6038f8` | SURVIVED | n/a (frozen oracle has no --selftest) |
| m05 | SERVED drops "stop" | `C92_C1: UNMET agree=127/133 A=59/61 C=58/60 W=10/12 last_wave_located=12 salt=f943621af73ceec9 tool_sha256=f943621af73ceec9c60d814f4470de7d66e77a87c49df654f4a1fe0ace30cf6f` | KILLED | n/a (frozen oracle has no --selftest) |
| m06 | captured = first model_change regardless of role | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=28807d936f3d0f2c tool_sha256=28807d936f3d0f2cfd3e8189c8ec9b928485d4ef8236634a05999e5420400a1c` | SURVIVED | n/a (frozen oracle has no --selftest) |
| m07 | locate tie-break: newest -> oldest | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=4c45a69a1aeea68b tool_sha256=4c45a69a1aeea68ba5931f5479cc228e6b527cf3f4e4e1f8d90b20e1345afc97` | SURVIVED | n/a (frozen oracle has no --selftest) |
| m08 | answered dedupe off | `C92_C1: UNMET agree=24/133 A=11/61 C=13/60 W=0/12 last_wave_located=12 salt=ea1f173cc9957187 tool_sha256=ea1f173cc9957187dbfe4b75fca10ed77fc2ab706700e6d2f00c20fbf9a8cb71` | KILLED | n/a (frozen oracle has no --selftest) |
| m09 | aborted turns also counted as errors | `C92_C1: UNMET agree=121/133 A=55/61 C=54/60 W=12/12 last_wave_located=12 salt=db7a0b276f661582 tool_sha256=db7a0b276f6615829cfcec15097b2b27dad64f9f37d3079e4ccdcfc846da0d41` | KILLED | n/a (frozen oracle has no --selftest) |
| m10 | yield detected on toolResult instead of toolCall | `C92_C1: UNMET agree=43/133 A=23/61 C=20/60 W=0/12 last_wave_located=12 salt=522206583fd8de53 tool_sha256=522206583fd8de534daa1dc88f5a66e8320109cb7c76daf25b3c13016dfd7c66` | KILLED | n/a (frozen oracle has no --selftest) |
| m11 | final silent when nothing served (not when no turns) | `C92_C1: UNMET agree=125/133 A=58/61 C=55/60 W=12/12 last_wave_located=12 salt=c5fc4bfd38f6fda8 tool_sha256=c5fc4bfd38f6fda8ff543dc742023ae9368967f6ad86681bdc366b54a7635118` | KILLED | n/a (frozen oracle has no --selftest) |
| m12 | provider/model "?" guard dropped | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=5d4975cd4473b126 tool_sha256=5d4975cd4473b126a43278c5dd133414063b03caf88def1d13c705e435c06851` | SURVIVED | n/a (frozen oracle has no --selftest) |
| m13 | non-object parse targets ignored, not counted | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=58e9a223aa107d16 tool_sha256=58e9a223aa107d1658c3bf121a3ed329ff94e18d89b36b30fde4637cdea61601` | SURVIVED | n/a (frozen oracle has no --selftest) |
| m14 | locate newest by path, session timestamp ignored | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=a38c7e223b92101a tool_sha256=a38c7e223b92101a0ceb793839c05e4d1e425fd7d0c8a7495a7d6a21dde0794f` | SURVIVED | n/a (frozen oracle has no --selftest) |
| m15 | fallback from last answered model only | `C92_C1: UNMET agree=132/133 A=60/61 C=60/60 W=12/12 last_wave_located=12 salt=90213bf547c4a471 tool_sha256=90213bf547c4a471b8582b25009e70233d4e253defcf44b50297ec9d1d6a7932` | KILLED | n/a (frozen oracle has no --selftest) |
| m16 | locate lane marker dropped (round marker only) | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=5d2b074a96267d45 tool_sha256=5d2b074a96267d4529980fe7114ffb3035fe3ac88315e93bc28d74b2d9a6bb2b` | SURVIVED | n/a (frozen oracle has no --selftest) |
| m17 | last_error takes whole text stripped, not first line | `C92_C1: UNMET agree=115/133 A=55/61 C=49/60 W=11/12 last_wave_located=12 salt=07eeb2df1bdddecb tool_sha256=07eeb2df1bdddecb6c0141f05ef3bcfe9dd5c4cbddf1339ace4de94b4f1b9105` | KILLED | n/a (frozen oracle has no --selftest) |

Counted from the rows above: counter killed **9/17** (8 survived).

## Battery 2 — 19 mutants of the candidate tool

| id | edit | counter verdict | counter | selftest |
|---|---|---|---|---|
| c01 | REDACT_RE 24+ -> 25+ | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=0f5e73255bed0bec tool_sha256=0f5e73255bed0bec6cee4bd998e69d75305540a761c64699e2d26b93fb651fd7` | SURVIVED | FAIL held=29/30 |
| c02 | LAST_ERROR_CAP 120 -> 121 | `C92_C1: UNMET agree=87/133 A=38/61 C=38/60 W=11/12 last_wave_located=12 salt=72df8ecfb3f54430 tool_sha256=72df8ecfb3f54430090340da79afa4c82c5ffcf7b51599a5db9a3d9e3afa8db6` | KILLED | FAIL held=29/30 |
| c03 | last error -> first error | `C92_C1: UNMET agree=110/133 A=46/61 C=52/60 W=12/12 last_wave_located=12 salt=5f64a17849cf954c tool_sha256=5f64a17849cf954c324ef127adc76ce672b2fbc99586d6d283d031023266e5a8` | KILLED | PASS held=30/30 |
| c04 | SERVED_STOPS drops "length" | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=a32a08dc0b9cda2c tool_sha256=a32a08dc0b9cda2ce7c72ff35f166c3d748192efff9c2cfa7b0b30d1e1e04177` | SURVIVED | PASS held=30/30 |
| c05 | SERVED_STOPS drops "stop" | `C92_C1: UNMET agree=129/133 A=59/61 C=60/60 W=10/12 last_wave_located=12 salt=f580e3c90e500822 tool_sha256=f580e3c90e5008228d62c36824f3622462bbad11e55c41e42d70bf21e4fe7f0f` | KILLED | FAIL held=22/30 |
| c06 | captured = first model_change regardless of role | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=3a80ccf27e9e5e7e tool_sha256=3a80ccf27e9e5e7e564ae7c2a76260582a9292749fa839278fed05e3deec4689` | SURVIVED | PASS held=30/30 |
| c07 | locate tie-break newest -> oldest | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=9221b27031160d68 tool_sha256=9221b27031160d68aad719e8f0b145ca05119cca28b2e12d37d909da9778370b` | SURVIVED | FAIL held=29/30 |
| c08 | answered dedupe off | `C92_C1: UNMET agree=24/133 A=11/61 C=13/60 W=0/12 last_wave_located=12 salt=64d364ae04ad2073 tool_sha256=64d364ae04ad207391e8f29d92a1c6c6b56a49e763d13201f7a8d9ab0272ae3c` | KILLED | FAIL held=29/30 |
| c09 | aborted turns also counted as errors | `C92_C1: UNMET agree=120/133 A=55/61 C=53/60 W=12/12 last_wave_located=12 salt=d0aab69340e1ed07 tool_sha256=d0aab69340e1ed0749384882ae2901f38e34cba3c3f25b08347d5b1f108fa513` | KILLED | FAIL held=29/30 |
| c10 | yield detected on toolResult instead of toolCall | `C92_C1: UNMET agree=45/133 A=23/61 C=22/60 W=0/12 last_wave_located=12 salt=71814abb40b63c5b tool_sha256=71814abb40b63c5b1b5b81973eeb76a1f0ba89cb0b1a0264294b108e2e91f0ed` | KILLED | FAIL held=29/30 |
| c11 | final silent when nothing served (not when no turns) | `C92_C1: UNMET agree=125/133 A=58/61 C=55/60 W=12/12 last_wave_located=12 salt=b6da13ce8db60abe tool_sha256=b6da13ce8db60abef00f7be3914ea8b6142cfec9ca9593998a952bd174586658` | KILLED | FAIL held=24/30 |
| c12 | provider/model "?" guard dropped | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=4189bc3c4b408ce5 tool_sha256=4189bc3c4b408ce56de3a3b3de2c9edb4d62f2d37e456e183162d37bea4c5746` | SURVIVED | FAIL held=29/30 |
| c13 | non-object JSON rows skipped, not counted as parse errors | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=356ef1f94c3f95af tool_sha256=356ef1f94c3f95af35cca6cfdaeccb93444bfd3d418a652fffa7c81da256395a` | SURVIVED | FAIL held=29/30 |
| c14 | locate ignores session timestamp (greatest path only) | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=a8535d505e866240 tool_sha256=a8535d505e866240dc36e36341c9ce074f9a69239ec230286a4778c9bb611907` | SURVIVED | PASS held=30/30 |
| c15 | fallback from last answered model only | `C92_C1: UNMET agree=132/133 A=60/61 C=60/60 W=12/12 last_wave_located=12 salt=12d62b77c272984c tool_sha256=12d62b77c272984cc545e138bc852628181c025517688d0e3bf389d3b455cbef` | KILLED | PASS held=30/30 |
| c16 | locate lane marker dropped (round marker only) | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=43a0dd3db9980d23 tool_sha256=43a0dd3db9980d233a1e7ec7dace40f4abaef1a2b4fa1aee871787acf60f6790` | SURVIVED | FAIL held=29/30 |
| c17 | cut to 120 before redaction instead of after | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=d32c35b8f157185b tool_sha256=d32c35b8f157185b42ca94948fd81335a9b82e638b8422b8a32439910a5511c6` | SURVIVED | PASS held=30/30 |
| c18 | last_error from whole text, not first line | `C92_C1: UNMET agree=115/133 A=55/61 C=49/60 W=11/12 last_wave_located=12 salt=5d04decb4c121a2b tool_sha256=5d04decb4c121a2b64e296486f225d8f63be6d7a7b0dfe5e580bc8ed8ee18068` | KILLED | FAIL held=29/30 |
| c19 | captured default branch drops role "default" | `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=b5dc2f007206a5ba tool_sha256=b5dc2f007206a5ba62e4b103101ab24733100c139ee4d01962cf5e08096c045e` | SURVIVED | PASS held=30/30 |

Counted from the rows above: counter killed **9/19** (10 survived).
Selftest killed **12/19**; a mutant is scored killed when EITHER the counter or the tool's own `--selftest` kills it: **14/19**, survivors of both **5/19**.

## Survivors and the stratum that would kill them

- **m01** (redaction threshold {24,} -> {25,}) — no indexed transcript holds a 24-char [A-Za-z0-9_-] run (host scan: runs are 20/21/22/28/30/32); stratum `redact` alone does not discriminate. Killer: a transcript with a run of exactly 24 (witness wit/run24.jsonl) — pristine `<redacted>`, mutant raw.
- **m04** (SERVED drops "length") — 55 indexed transcripts carry a `stopReason:length` turn (strata fallback,multi 38 / fallback 6 / fallback,aborted,multi 5 / clean 3 / fallback,aborted 1 / fallback,dead,multi 1 / errfix 1); A and C drew none. Real killer: RevC2Counter.jsonl (fallback,multi) — pristine answered 2 models fallback=true, mutant 1 model fallback=false.
- **m06** (captured = first model_change regardless of role) — all 23206 indexed transcripts have a null-role first model_change (23139 carry a subagent: row later); the role filter is never exercised on the first row. Killer: a transcript whose first model_change carries a non-seat role (witness wit/firstrole.jsonl).
- **m07** (locate tie-break: newest -> oldest) — wave mode only, and r91 w1 has 12 unique seat names. Killer: wave mode on a results.json naming a seat with 2 same-round same-lane hits — 14 such names exist (rounds 29,42,45,46,50,56,57,61,63,64); e.g. round-45 R45RevProvince: pristine 2026-10-27T03-03 (served), mutant 2026-10-26T15-10 (aborted). Synthetic witness w2/.
- **m12** (provider/model "?" guard dropped) — no indexed assistant message has an empty/missing provider or model (host scan 0). Killer: constructed turn without provider (witness wit/pmguard.jsonl).
- **m13** (non-object parse targets ignored, not counted) — no indexed transcript holds a non-object JSON line, and index92.tsv has no `parseerr` stratum at all (the C quota's 2 parseerr seats are unfillable). Killer: constructed file with a `[1,2]` line (witness wit/nonobj.jsonl).
- **m14** (locate newest by path, session timestamp ignored) — killer needs >=2 locate hits where path order conflicts with first-session-timestamp order; r91 seats are unique and the real R45RevProvince pair agrees on both keys. Killer: synthetic root w2/ (aaa195 newest ts, zzz195 greatest path).
- **m16** (locate lane marker dropped (round marker only)) — killer needs a same-name same-round file in ANOTHER lane with a greater timestamp; r91 names are unique. Killer: synthetic root w2/ (mmm195 tabi-shokunin, ts 2026-12).
- **c04** (SERVED_STOPS drops "length") — counter blind as m04 (55 real length transcripts undrawn) AND the candidate --selftest has no length case (PASS). Real killer: RevC2Counter.jsonl (answered 1 vs 2, fallback false vs true).
- **c06** (captured = first model_change regardless of role) — counter blind as m06; --selftest PASS (its multicap case uses two subagent rows). Killer: first model_change with a non-seat role (wit/cand-firstrole.jsonl).
- **c14** (locate ignores session timestamp (greatest path only)) — counter blind AND --selftest PASS: path-only locate passes every selftest and every r91 seat. Killer: synthetic root w2/ (path order beats timestamp).
- **c17** (cut to 120 before redaction instead of after) — counter blind AND --selftest PASS: no case has a credential run crossing the 120-char cut. Killer: wit/capcross.jsonl — pristine `<redacted>`, mutant leaks the first 20 of 40 credential chars.
- **c19** (captured default branch drops role "default") — counter blind (no indexed first model_change carries role `default`; the selftest's default case is roleless) AND --selftest PASS. Killer: wit/defrole.jsonl (captured prov/def-model vs null).

## Counter findings (not kill-rule events)

1. **HELD without implementing the definitions.** Eight oracle mutations and ten candidate
   mutations read `C92_C1: HELD agree=133/133` (rows above). Each omits or inverts one frozen
   field reading on inputs A, C and the r91 wave do not contain. The mechanism that lets them
   in is structural: every gap is a *stratum gap* — the 10-stratum draw never exercises a
   `length` turn, a 24-char credential run, a role-tagged first `model_change`, a non-object
   line (the `parseerr` stratum is empty in index92.tsv), an empty provider/model, a locate
   tie-break, or the lane marker. A candidate can therefore omit these readings and still be
   scored HELD; conversely the counter's C sample is keyed to the tool's own sha256, so a
   construction may enumerate self-hash variants and keep one whose C draw it passes.
2. **The positive control contradicts the plan text and the candidate.** `plan.md` freezes
   `captured` = model of the first `model_change` with role `subagent:<seat>`, and *if none*, of
   the first roleless/`default` one. oracle92.py enters the fallback whenever the subagent row's
   `model` is not a string (`captured = r.get("model") if isinstance(...) else None; break` then
   `if captured is None:` re-scans). `K92ExecTool/seat-route.mjs` implements the text: on
   `wit/` fixture rows `{role:subagent:Seat, model:null}` then `{role:default, model:prov/default-model}`
   the candidate reads `captured=null`, the oracle reads `captured="prov/default-model"`, so the
   definition-faithful tool is scored DISAGREE. No real transcript fires it today (23139 indexed
   transcripts carry a subagent: `model_change`, 0 have a non-string model on the first one) —
   latent, not live, until the round-92 wave writes such a row.
3. **Selftest gaps** (rows with `PASS` in Battery 2): c04 (`length`), c06 (role filter), c14
   (locate ignores timestamp), c17 (redact-vs-cut order), c19 (role `default`). c17 is the
   costly one: cutting before redaction leaks 20 of 40 credential chars (`wit/capcross.jsonl`).
