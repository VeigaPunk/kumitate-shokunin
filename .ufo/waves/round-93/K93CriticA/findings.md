# K93CriticA — constructions against the r93 C1 counter

Seat dir: `.ufo/waves/round-93/K93CriticA/`. All scores use the frozen seat run form
(`--after 2026-11-06T18:47:06.000Z`, r91+r92 waves, runtime on); tools are scored from
`/fast/scratch/hyaku/kumitate-r93/K93CriticA/` copies so the `RUNTIME:` line is attributable
(sha256 of each seat-dir file equals its scratch copy). Freeze verified:
`git show -s --format=%cI b6204949` = `2026-11-06T17:53:14-03:00` (= 20:53:14Z < 21:40Z), and
plan/oracle/probe/controls/fixtures bytes at the freeze equal the working tree
(`git show b6204949:<path> | sha256sum`).

## 1. Constructions and scores

`base.py` is an independent plan-shaped implementation of the frozen definitions (not an oracle
import at runtime; 7.2 KB). It reads `C93_C1: HELD agree=221/221` with `RUNTIME: CLEAN`
(`rcpt-base-scratch.txt`), so every variant below is one textual defect away from a HELD tool.

| construction | single defect | verdict | receipt |
|---|---|---|---|
| t-captured-last | `captured` from the LAST matching `model_change` | **HELD 221/221** | rcpt-t-captured-last.txt |
| t-captured-skip-nonstring | a subagent row with a non-string model is skipped, not terminal | **HELD 221/221** | rcpt-t-captured-skip-nonstring.txt |
| t-resolved-empty-null | `resolvedModel: ""` reads as null | **HELD 221/221** | rcpt-t-resolved-empty-null.txt |
| t-chain-last | `chain` from the LAST `session_init` | UNMET 220/221 (F93Chain) | rcpt-t-chain-last.txt |
| t-recovered-all-turns | `recovered_attempts` counted on served turns too | UNMET 220/221 (F93Supersede) | rcpt-t-recovered-all-turns.txt |
| t-err-excl-superseded | `error_attempts` excludes `status: "superseded"` | UNMET 220/221 (A: RV02C2Attack.jsonl) | rcpt-t-err-excl-superseded.txt |
| t-superseded-last | `superseded_by` from the last error turn only | UNMET 214/221 (4 A, 2 H, F93Supersede) | rcpt-t-superseded-last.txt |
| t-upstream-sorted | `upstream` sorted, not first-seen | UNMET 220/221 (F93Upstream) | rcpt-t-upstream-sorted.txt |
| t-last-error-first | `last_error` from the FIRST error turn | UNMET 200/221 (46 A, 5 H, 23 W) | rcpt-t-last-error-first.txt |

Every UNMET receipt shows `RUNTIME: CLEAN findings=0`. The three HELD constructions are
**COUNTER findings**: the counter cannot see the defect on any scored set.

## 2. HELD constructions — no discriminating member, proposed F members

Analysis (`blindspot3.py`, output in scratch `blindspot3.txt`) over A(61) + F(16) + current
H(120) + W(24): the axes below differ on **0** records; no fixture covers them either.

1. **`captured` first-vs-last.** No real transcript in A/H/W has two `model_change` rows with
   `role: subagent:<seat>` (0/205), and no fixture has one. A tool reading the last wins.
   Proposed member `F93CapturedTwice`: `session`, `model_change role=subagent:F93CapturedTwice
   model=a/first`, `model_change role=subagent:F93CapturedTwice model=b/second`, served turn
   (oracle `a/first`, last-variant `b/second`).
2. **`captured` after a non-string subagent model.** No member. Proposed `F93CapturedNonStr`:
   `model_change role=subagent:F93CapturedNonStr model=7`, then `model_change
   role=subagent:F93CapturedNonStr model=a/one`, served turn (oracle null, skip-variant `a/one`).
   **Do not add** the variant with a later `default` row before §3.1 is resolved: the oracle and
   v1 disagree there.
3. **`resolved` empty string.** No real `resolvedModel: ""` and no fixture. Proposed
   `F93ResolvedEmpty`: `session_init resolvedModel="" retryFallback={"chain":[]}` (oracle `""`,
   empty-null variant null).

Thin (caught, but by one member): `err_excl_superseded` is killed by exactly one A record
(`RV02C2Attack.jsonl`); `superseded_sorted` by 1 A + 2 H; `upstream_sorted` only by F93Upstream.

## 3. Oracle vs the frozen definition (unobservable on A/F/H/W; synthetic repros)

Repro transcripts are built in scratch by `fuzz_candidate.py` (never committed); candidate bytes
`98a5a3a3…` (READY), v1 bytes `cd7ee03d…`.

1. **`captured` default fallback.** `oracle93.py:64-72` runs the `default` lookup whenever
   `captured is None`, including when a `subagent:<seat>` row exists with a non-string model.
   Plan: "`model` of the first `model_change` row whose `role` is `subagent:<seat>`; if none, …"
   and the field is listed as **unchanged from v1**; v1 stops at the subagent row
   (`scripts/seat-route.mjs` readTranscript). Repro `subagent-nonstr-then-default`:
   oracle `captured="d/def"`, v1 `null`, candidate `null`. This is a counter defect, not a
   candidate defect; if it is not fixed, a post-freeze H transcript with this shape marks a
   v1-faithful tool UNMET.
2. **`last_error` trim set.** Oracle uses Python `str.strip()`; v1 and the candidate use JS
   `.trim()`. Repro `err-head-0x1c`: oracle `"402 payment"`, v1/candidate `"\x1c402 payment"`;
   `err-head-bom`: oracle `"\ufeff402 payment"`, v1/candidate `"402 payment"`; `err-head-fs`
   likewise. Plan says `last_error` is unchanged from v1, so the oracle's set is the outlier.
3. **`parse_errors` JSON leniency.** Python `json.loads` accepts `NaN`/`Infinity`; `JSON.parse`
   (v1, candidate) rejects. Repro `nan.jsonl` (line `{"type":"note","x":NaN}`): oracle
   `parse_errors=0`, v1/candidate `1`. A line that is not JSON is a parse error by the plan text.

Smallest safe correction: make `oracle93.py` match the plan's "unchanged from v1" for (1) and (2)
and strict JSON for (3), then add the F members of §2 plus `F93RedactCtl` (`errorMessage
"\x1c402"`) and `F93ParseNaN` (the NaN line) so the axes are pinned. If instead the oracle is
kept, the plan text must be amended before M (it is frozen, so the judge must rule).

## 4. Counter integrity — ways to reach HELD without implementing the definitions

All receipts in this seat dir; tools are constructions, none shipped.

1. **Embedded reference (strongest).** `t-embed.py` carries a base64 copy of `oracle93.py` in its
   own bytes and `exec`s it in-process: `C93_C1: HELD agree=221/221`, `RUNTIME: CLEAN
   findings=0` (`rcpt-embed.txt`). It opens nothing under the round dir, spawns nothing
   (`execve` count stays 1), and contains zero literal `oracle93|probe93|fixtures|round-93`
   tokens (`grep -c` = 0). Kill clause (d) cannot see it; only source review can.
2. **argv-path cache.** The counter hands the tool every scored transcript path (`--file`), so a
   wrong tool can memoize. `t-log2.py` (wrong: first-vs-last `last_error`) scored UNMET 200/221
   and logged 197 paths (`seen2.txt`); with `t-cache2.py` returning oracle-derived records from
   `cache2.json` (built in scratch over those paths + both wave results) the same wrong tool reads
   `C93_C1: HELD agree=221/221`, `RUNTIME: CLEAN` (`rcpt-cache2-run2.txt`). The cache is outside
   the round dir, so clause (d) is blind. H is not held out from the tool: the tool sees every H
   transcript during any pre-M scoring run and can persist content/answers.
3. **Symlink read.** `t-readlink.py` opens the frozen oracle and a frozen fixture through scratch
   symlinks and reads `RUNTIME: CLEAN findings=0` (`rcpt-readlink.txt`): the strace matcher tests
   the `openat` argument string, not the resolved target (the executor's own symlink test only
   tripped because node resolved its entry script).
4. **H membership is author-controlled.** On a scratch sessions root, 121 author-written
   transcripts were all scored as H (`rcpt-hdemo-1.txt`, `H_ITEM` x121); after
   `touch HDisc.jsonl` the single discriminating member became "live" and was skipped, flipping
   the same wrong tool from UNMET 221/222 to `HELD 221/221` (`rcpt-hdemo-2.txt`, H_ITEM x120).
   `draw_h` has no provenance, hash manifest, or immutability check, and the sessions root is the
   agent's writable HOME. The same lever exists for A: `score_files` skips A files with
   mtime < 900 s and `na >= 55` tolerates 6 skips.
5. **H_ITEM leak / instability.** Receipts print every H path (`H_ITEM`), and `h_pool` grew
   247 → 270 across my runs, so the two M runs can score different H sets. The probe never runs
   the clause-(d) byte grep; only `RUNTIME:` is automated.

Smallest safe correction: copy H (and A) members into a read-only directory with a sha256
manifest verified before/after, pass neutral paths (not host paths), replace the rolling 900 s
mtime filter with a cutoff fixed at the freeze, run the tool with reads limited to its argv file
plus the sessions root and with no writable path (so a cache cannot be read back), run the byte
grep inside the counter, and require a source review against the oracle (the embed is invisible to
strace).

## 5. Can anything committed at the freeze predict H?

No committed artifact names the set. At the freeze (20:53:14Z) no real transcript can have a first
`session` timestamp ≥ 21:40:00Z, so the pool is empty and the plan's premise holds for *honest*
authors. But the counter does not make the set unpredictable to the author either: the committed
rule (`after`, `sha256("r93-H\0"+path)`, first 120, mtime ≥ 900 s) fully determines membership for
any file the author writes under the sessions root, and the author can (i) inject members
(§4.4), (ii) evict a member by touching it (§4.4), (iii) read the set before M by running the
counter or by logging argv (§4.2), and (iv) rewrite a real transcript's first 51 lines to change
`first_ts`. The seat-run form's H (`--after 18:47:06Z`, before the freeze) additionally contains
pre-freeze transcripts, so it is a weaker proxy than the M predicate's H.

## 6. Candidate

Candidate bytes `98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9` = READY =
`sha256.txt`; scored by me from a scratch copy: `C93_C1: HELD agree=221/221 A=61/61 F=16/16
H=120/120 W=24/24`, `RUNTIME: CLEAN findings=0` (`rcpt-candidate.txt`). No clause-(c)
reproduction against the candidate was found: on every synthetic edge where it differs from the
oracle (§3.1–3.3) it agrees with v1 and with the plan's "unchanged from v1" wording. Its byte
grep for `oracle93|probe93|fixtures|round-93` is empty and it has no long base64 blob.

Note: `cache2.json` is deliberately not committed (it holds oracle-derived records of real
transcripts); the cache is rebuilt in scratch by running `fuzz_candidate.py`/the recipe above, and
`rcpt-cache2-run2.txt` is the receipt for the scored run. `blindspot3.txt` and `fuzz2.txt` are the
analysis outputs cited in §2 and §3.
