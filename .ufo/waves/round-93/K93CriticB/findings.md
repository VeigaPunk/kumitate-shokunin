# K93CriticB — counter attack: H (held-out) and runtime clauses, type strictness, candidate spot-check

Seat: critic (leaf). Lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (detached).
Scratch `/fast/scratch/hyaku/kumitate-r93/K93CriticB` (removed before yield). Nothing under
`~/.omp/agent/sessions` was written or modified; every sessions-root experiment used a scratch copy
(`--sessions-root`). Every receipt below is in this directory.

Frozen artifacts read (sha256):
- `probe/probe93-c1.py` `e3ef62eabd70738b427e09a3f1bbe3e23ea2340ad72698f8bc8c03ec04d06fc9`
- `probe/oracle93.py` `7b2b2e08b13ab8783994aa0cf458b2c0667566b5ae28c90727478306b32c19fa`
- candidate `K93ExecTool/seat-route.mjs` `98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9` (READY)

---

## 1. H (held out) — the gate has no provenance and no clock

`draw_h()` (probe93-c1.py:82) admits a transcript iff **content** `first_ts >= --after` (a *string*
compare, `str(o["timestamp"])`) and **mtime** is older than 900 s; then it keeps the first `--h-max`
by `sha256("r93-H\0"+path)`. `score_files()` re-checks `live()` and silently `SKIP`s anything that
became fresh. All three inputs are author-writable: the sessions root is `$HOME/.omp/agent/sessions`
and the counter's own docstring claim — "These files did not exist when the candidate's contract and
this counter were frozen, so no author can compute the set" — is false. An author can *create*
members; the set is not computable only in the sense that the author cannot predict which real files
the fleet will produce.

Receipts: `h.receipt.txt` (concatenation), `h_bias.receipt.txt`, `h_forge.receipt.txt`,
`h_forge2.receipt.txt`, `h_pool.receipt.txt`; drivers `h_bias.py`, `h_forge.py`, `h_forge2.py`,
`h_pool.py`.

### 1a. Fabricated members are admitted and scored — HELD at the frozen thresholds
`h_forge2.py` builds, in a scratch sessions root, 60 transcripts with a forged
`{"type":"session","timestamp":"2026-11-06T21:45:xx.000Z"}` and `os.utime` backdated to 2020, plus 24
files carrying the two `locate()` byte marks. Frozen counter, default `--min-h 60 --h-max 120`,
`--after 2026-11-06T21:40:00.000Z`, oracle as tool:

```
C93_C1: HELD agree=161/161 A=61/61 F=16/16 H=60/60 W=24/24 h_pool=60 last_wave_located=12 thin_fields=0
H_ITEM_count=60
```

Every one of the 60 H members is fabricated; the H conjunct (`nh >= 60`) and the wave conjunct are
satisfied by content this seat wrote in four seconds. `h_forge.receipt.txt` shows the same 60 forged
members alone (`H=60/60 h_pool=60`). **Consequence:** the H threshold is a *count*, not a sample. An
author whose tool is wrong on real post-freeze transcripts can (i) pad `nh` with fabricated members
to clear 60, and (ii) suppress members it would fail by `os.utime(p, (now, now))` (makes `live()`
true → `SKIP`) or by rewriting the first `session` timestamp (below `--after`).

### 1b. The 900 s live exclusion is an mtime test, not a provenance test
`h_bias.receipt.txt` (scratch root, four files):

```
draw_h fresh-mtime  pool=0 items=[]                       # same file, mtime=now  -> excluded
draw_h backdated    pool=3 items=[JunkTs, PlusOneOffset, ForgedA]
first_ts equal-instant '+00:00' = '2026-11-06T21:40:00.000+00:00'  (string < 'Z' => excluded)
first_ts +01:00 same instant     = '2026-11-06T22:40:00.000+01:00'  (string > 'Z' => included)
first_ts junk 'zzz'              = 'zzz'                            (string >= after => included)
hash-grind: g000000.jsonl sha 7ca61c3c... < ForgedA sha d8fdb0ca... (attempts=0)
```

Three separate defects: (i) `os.utime` defeats the 900 s gate in both directions — backdate to
inject, touch to suppress; (ii) `>=` is a **lexicographic** compare, so the same instant written
`+00:00` is excluded while `+01:00` is included, and any string `>= "2026-11-06T21:40…"` (`"zzz"`)
passes; (iii) selection is min-hash over a path the author chooses, so a ground name buys a slot —
with `hmax=120` and `h_pool=229` at control time (`controls/ctl-positive.txt`), 109 real members are
dropped anyway.

### 1c. The gate is a wall-clock race the round does not control
`h_pool.receipt.txt` (read-only over the real root, 28 006 transcripts, 461 touched in the last 8 h):

```
CUTOFF freeze (2026-11-06T20:53:14.000Z): started=41 non_live_now=0
CUTOFF after  (2026-11-06T21:40:00.000Z): started=0  non_live_now=0
started_last_90min=211 => approx 2.3/min
```

The round-93 seats started 20:55–20:56Z (`oracle93.first_ts` on `K93*.jsonl`), i.e. **below** the
frozen `--after`; the round's own transcripts can never be H members. H can only be filled by
sessions started after 21:40Z, and each must then sit unmodified for 900 s. At the measured
2.1–2.3 sessions/min, `nh >= 60` is first reachable around **22:20–22:25Z (19:20–19:25 local)**. If
M is scored earlier, C1 is UNMET for want of members, independently of the tool. A candidate author
can bias this upward the legitimate way: start ~60 trivial sessions after the cutoff.

### 1d. `draw_h` cost
`draw_h` opens **every** `.jsonl` under the root (28 006) to read up to 51 lines, on every counter
run, before scoring. Measured walk of the same population: 0.1 s of metadata + one open per file;
tolerable, but it is paid twice per M (two receipts) and once per control.

**Smallest safe corrections (counter, not tool):** (1) require a provenance predicate the author
cannot write — e.g. exclude any path whose `st_uid`/`st_ctime` is newer than the freeze, or take H
members only from a directory the counter itself creates; (2) compare timestamps after
`datetime.fromisoformat` normalisation, not as strings; (3) make `live()` fail closed on
`st_ctime != st_mtime` or on any mtime in the future; (4) state in the plan that `nh >= 60` is a
*rate* requirement, and record the scoring instant, so an UNMET is attributable.

---

## 2. Runtime clause — evadable in five ways; false-positives on the seat run form

`runtime_check()` (probe93-c1.py:165) straces `open,openat,openat2,execve`, flags a path containing
`oracle93`/`probe93`, or containing `/.ufo/waves/round-93/` whose `realpath` is not the `--results`
file, or any `execve` after the first. It keys on **path text only**; `symlinkat`, `chdir`,
`getdents`, `execveat` are not traced and `realpath` is applied only when the marker is already in
the path.

Receipts: `runtime.receipt.txt` (consolidated, with tool sha256 and each invocation's proof of what
it read), drivers `run_runtime.sh`, tools `ev/*.mjs`. All tools were run from scratch copies outside
round-93 (a tool *inside* round-93 trips the clause on its own source — see 2f).

| construction | reads | RUNTIME |
|---|---|---|
| `nul.mjs` (clean control) | nothing | `CLEAN findings=0` |
| `symlink_read.mjs` — `$S/alias.py -> round-93/probe/oracle93.py` | oracle93.py (sha `7b2b2e08…`) | **`CLEAN findings=0`** |
| `procfd_read.mjs` — `openSync(aliasdir)` + `/proc/self/fd/N/{n.py,c.jsonl}` | oracle93.py + `F93Chain.jsonl` | **`CLEAN findings=0`** |
| `cwd_read.mjs` — `chdir(symlink-to-probe)` then `readFileSync("fixtures/F93Chain.jsonl")` | two fixtures | **`CLEAN findings=0`** |
| `worker_read.mjs` — same alias read from a `worker_threads` thread | oracle93.py | **`CLEAN findings=0`** |
| `derive2_read.mjs` — **zero marker literals**; derives `probe/` from `--results`, `symlinkSync` to `$TMPDIR/kd…`, reads the alias | oracle93.py + probe93-c1.py | **`CLEAN findings=0`** |
| `derive_read.mjs` — derives then `readdirSync`s the round-93 dirs | all of probe/ | `VIOLATION findings=3` (the `readdir` opens carry the marker) |
| `spawn_child.mjs` (negative control) | spawns node | `VIOLATION findings=1` (`execve`) |
| `v1copy.mjs` = shipped v1 **placed under round-93** | its own source | `VIOLATION findings=1` |

Proof the reads happened while the clause said CLEAN (`proof-derive2.json`):

```
"reads": [["oracle93.py", 7390, "7b2b2e08b13ab8783994aa0cf458b2c0667566b5ae28c90727478306b32c19fa"],
          ["probe93-c1.py", 11417, "e3ef62eabd70738b427e09a3f1bbe3e23ea2340ad72698f8bc8c03ec04d06fc9"]]
RUNTIME: CLEAN findings=0
```

`derive2_read.mjs` also survives kill clause (d)'s byte grep: `grep -E 'round-93|oracle93|probe93|fixtures'`
returns nothing (names built with `["ora","cle","9","3"].join("")`).

**2f (false positive, hit by the builder).** `K93ExecTool/score1.txt` and `score2.txt` read
`RUNTIME: VIOLATION findings=1 — open …/round-93/K93ExecTool/seat-route.mjs` for a *clean* tool,
because node opens the script path it was given; only `score1-clean.txt` / `score2-clean.txt`
(copies outside round-93) read CLEAN. The seat run form (`--tool <TOOL>` pointing at the candidate's
round-93 path) therefore cannot produce a CLEAN line for any candidate, and the builder's own
receipts show it. This is a harness defect, not a tool defect: the clause compares against
`realpath(--results)` only.

**Smallest safe corrections:** (1) resolve every traced path with `realpath()` and compare the
*resolved* path against the round-93 prefix (a symlink alias then fails); (2) also trace
`symlink,symlinkat,link,linkat,chdir,execveat` and flag any symlink target under round-93; (3)
exempt the tool's own path (or run the copy the seat is told to use) so the clause does not
false-positive on the candidate's location; (4) treat `openat` with a dirfd whose path is under
round-93 as a violation regardless of the relative name.

Residual (not demonstrated, stated as such): `execveat` is untraced, so an `exec` that bypasses the
`execve` count is not excluded by construction; node cannot reach it without native code.

---

## 3. Type strictness — one pair, and it is a text artefact

`canon(v) = json.dumps(v, sort_keys=True)`; `diff()` parses the tool's stdout with Python `json`
first, so the comparison happens between two Python objects. `type_strict.py` /
`type_strict.receipt.txt`:

```
-0 vs 0 (int form)   py canon EQUAL ("0" == "0"), node Object.is(-0, 0) = false, 1/-0 = -Infinity
1 vs 1.0             py canon 1 != 1.0        (counter separates)
true vs 1 / false vs 0 / null vs []           (counter separates)
1e2 vs 100           py 100.0 != 100          (counter separates)
2**53 vs 2**53+1     py separates; node collapses both to 9007199254740992  (fail-safe: tool cannot emit the exact value)
10**30 vs 1e30       py separates; node collapses                          (fail-safe)
"\ud800" vs "\ufffd" py separates; node JSON.parse keeps the lone surrogate (fail-safe)
```

**The only py-equal / node-distinguishing pair is textual `-0` vs `0`**: Python's `int("-0")` is
`0`, so a tool that emits the raw text `-0` for a count is scored as agreeing with oracle `0`, while
a JS consumer of that same text holds `-0` (`Object.is` false, `1/x = -Infinity`). Confirmed through
the counter's own comparator (`type_strict.receipt.txt`):

```
canon(0) = 0 | canon(json.loads("-0")) = 0
diff({"error_attempts":0}, json.loads('{"error_attempts":-0}')) = []
```

It is harmless for the compared domain (counts `>= 0`) but it is a real asymmetry: `canon` is not
injective on the JSON number grammar. Everything else is fail-safe in the useful direction — Python
is *stricter* than node (int/float, big ints, lone surrogates), so a node tool can only ever
*disagree*, never silently agree on a different value. No `NaN`/`Infinity` hole:
`canon(float("nan")) == "NaN"` and `json.loads("NaN")` yields that float, which never equals an
oracle field.

---

## 4. Candidate spot-check (READY `98a5a3a3…`) — one clause-(c) class defect

`fuzz.py` / `fuzz.receipt.txt`: 300 structured random transcripts, candidate vs oracle, compared
with the counter's own `diff()`:

```
cases=300 disagree=17 field_histogram={'last_error': 17}
```

**17 disagreements, all `last_error`**, in two classes.

`candidate_defects.py` / `candidate_defects.receipt.txt` reduce them to minimal transcripts:

```
CASE X99NullErr  {"stopReason":"error", "errorMessage": null}
  oracle last_error=""    tool last_error=null    diff=['last_error']
CASE X99BomErr   {"errorMessage":"\ufeffbom first line"}
  oracle "\ufeffbom first line"   tool "bom first line"
CASE X99NelErr   {"errorMessage":"\u0085nel lead"}
  oracle "nel lead"               tool "\u0085nel lead"
```

End-to-end, with the null member as the only `--fixtures` entry:

```
DISAGREE F …/X99NullErr.jsonl fields=last_error
C93_C1: UNMET agree=73/74 A=61/61 F=0/1 H=0/0 W=12/12
```

Cause (`seat-route.mjs:352,384`): `lastErrorMessage = message.errorMessage` then
`last_error: lastErrorMessage === null ? null : redactLastError(...)`. The `null` sentinel means both
"no error turn" and "error turn whose `errorMessage` is JSON null", so the latter emits `null` where
the frozen definition says non-string → `""`. The same sentinel exists in the shipped v1
(`node v1copy.mjs --file X99NullErr.jsonl --json` → `last_error=null`), so the defect is inherited,
not introduced by v2 — and it is a contradiction of the frozen definition either way (kill clause
(c) explicitly covers "also when the oracle shares the error"; here the oracle is right and both
tools are wrong). `F93ErrNonStr.jsonl` uses `"errorMessage": 123`, which the tool maps to `""`
correctly — the `null` variant is uncovered.

Prevalence (read-only, `errmsg_census.receipt.txt`): A61 87 error turns / 0 null / 0 missing; the
builder's H120 42 / 0 / 0; files touched in the last 8 h 141 / 0 / 0; random 600 transcripts 642 / 0
/ 0. So the defect is **latent**: it needs an error turn with `errorMessage: null`, which omp has not
written in 912 sampled error turns. It is still a contradiction of the frozen definition on a
synthetic transcript (kill clause (c) wording), and H is drawn from a future population.

**Smallest safe correction (candidate, one line):** track `hasErrorTurn` and emit
`last_error: hasErrorTurn ? redactLastError(lastErrorMessage) : null` — `redactLastError` already maps
every non-string to `""`. The trim-class divergences need Python `str.strip()` semantics: strip
`\x1c-\x1f`, `\x85` and the other `str.isspace()` characters, and do **not** strip `\uFEFF`
(`candidate_defects.receipt.txt` cases 2–3). No real transcript in the sampled population carries
either character class in an error line (0/644), so those two are synthetic-only.

---

## Verdict for this seat

- **Counter findings (routed, not kill events by the plan's own wording):** H membership is
  forgeable and its 900 s/`>=` gate is an mtime/string test (1a/1b); the H threshold is a wall-clock
  race the round cannot control (1c); the runtime clause is evadable by symlink/`/proc/self/fd`/
  `chdir`/worker/literal-free derivation (2) and false-positives on any tool living under round-93
  (2f). A tool can read `oracle93.py` and `probe93-c1.py` at scoring time with `RUNTIME: CLEAN
  findings=0` and no marker literal in its source.
- **Candidate defect (clause (c) class, latent):** `errorMessage: null` on an error turn yields
  `last_error: null` where the definition requires `""`; uncovered by F, not present in 912 sampled
  real error turns. Fix is one line; the builder should re-run the counter afterwards.
- **Type strictness:** no false-agreement hole in the compared domain except textual `-0` vs `0`;
  everything else errs toward disagreement.
- Kill rule itself is untouched by this seat: (a)/(b)/(e)/(f) were not re-run here, and the
  candidate's HELD receipts (`score1-clean.txt`, `score2-clean.txt`, 221/221, RUNTIME CLEAN) stand.

---

## Hygiene note (not a counter finding)

Importing `probe93-c1.py` as a module (as this seat did to call `draw_h`/`diff` directly) makes
CPython write `probe/__pycache__/probe93-c1.cpython-314.pyc` inside the frozen `probe/` directory.
This seat removed the file it created and left `oracle93.cpython-314.pyc` (present since 17:57,
before this seat started). Any seat that imports the counter should run with
`PYTHONDONTWRITEBYTECODE=1`; running the counter as a script does not write bytecode.

---

## 5. Post-fix re-check — READY `f86bde984ef8697a7351c0d7b1c78bcda0cf59d6b514d43b4b52f3d2d5829f1a`

The builder fixed §4 (and its own Reviewer's F1) and rewrote READY. Re-attacked the new bytes:

- `recheck.py` / `recheck.receipt.txt`: 46 targeted cases (null / missing / number / array / bool /
  object / empty-string `errorMessage`; error-after-error overwrite in both orders; every member of
  Python's whitespace set at both edges of the first line; redaction 23/24 boundary; token crossing
  the 120 cap; astral cap; captured fall-through for empty-string / null / number subagent models,
  roleless rows, and default-row null/empty) → **0 disagreements**; plus 120 randomized
  `errorMessage` property cases drawn from letters + the full whitespace set + emoji → **0**.
- `fuzz.py` re-run on the new bytes: `cases=300 disagree=0 field_histogram={}` (was 17/300).
- Exhaustive whitespace check: `candidate_isPySpace_set_matches=True` over all 1 114 112 code points
  — the tool's `isPySpace` is exactly Python's `str.isspace()` set, so `pyStrip` == `str.strip()`.
- Independent counter run on a byte-identical copy outside round-93 (`recheck-counter.receipt.txt`):
  `RUNTIME: CLEAN findings=0` and
  `C93_C1: HELD agree=221/221 A=61/61 F=16/16 H=120/120 W=24/24 h_pool=279 last_wave_located=12
  thin_fields=0 tool_sha256=f86bde98…` (13.2 s wall). This reproduces the builder's
  `score1-clean/score2-clean` claim from my own scratch copy.

Routed note on F1 (not a defect): with the fix, a `subagent:<seat>` row whose `model` is not a string
falls through to the first `default`/roleless row, which is what `oracle93.read_one` does (its
`if captured is None` second pass). The plan text is silent on a non-string subagent model, so the
frozen oracle is the only authority here; the tool now matches it on all six shapes tested. If L1
wants the opposite reading, both the oracle and the tool must change, not just the tool.

§4 above is kept as the historical finding; it applies to `98a5a3a3…` only.

---

## 6. Clause (e) hazard: the working-tree `scripts/seat-route.mjs` is not the READY bytes

While this seat was finishing, `scripts/seat-route.mjs` changed in the working tree (uncommitted,
`git diff --stat` = 275 insertions vs v1). Measured:

```
7273ad2b91eff7a60372c1cdffefaeb55d60ef6889fbfecfc89e84f29c7d7bc8  scripts/seat-route.mjs   (53471 B)
f86bde984ef8697a7351c0d7b1c78bcda0cf59d6b514d43b4b52f3d2d5829f1a  K93ExecTool/seat-route.mjs (52422 B, READY)
```

`diff -u` shows **3 hunks, all inside the `--selftest` block** (K93Mutation's M01/M02 survivors:
an extra exact-`recovered` row, a lone non-object `supersededBy` arm). Production code is
byte-identical. `node scripts/seat-route.mjs --selftest` → `PASS held=63/63`.

Clause (e) requires `tool_sha256` in both M receipts to equal `sha256sum` at M. The existing
receipts name `f86bde98…`; if M ships `7273ad2b…`, the receipts must be regenerated on the shipped
bytes. This seat did that once, on a byte-identical copy outside round-93
(`shipped-counter.receipt.txt`):

```
RUNTIME: CLEAN findings=0
C93_C1: HELD agree=221/221 A=61/61 F=16/16 H=120/120 W=24/24 h_pool=283 last_wave_located=12
thin_fields=0 tool_sha256=7273ad2b91eff7a60372c1cdffefaeb55d60ef6889fbfecfc89e84f29c7d7bc8
```

So the shipped bytes are HELD/CLEAN; only the receipt hash must match the bytes actually committed.
Not a kill event yet — a bookkeeping requirement for M.

### 6a. Closure (verified by this seat)

The builder adopted the shipped bytes, so candidate == READY == working tree:

```
7273ad2b91eff7a60372c1cdffefaeb55d60ef6889fbfecfc89e84f29c7d7bc8  scripts/seat-route.mjs
7273ad2b91eff7a60372c1cdffefaeb55d60ef6889fbfecfc89e84f29c7d7bc8  K93ExecTool/seat-route.mjs
7273ad2b91eff7a60372c1cdffefaeb55d60ef6889fbfecfc89e84f29c7d7bc8  K93ExecTool/READY
identical_bytes=True len=53471/53471
```

My earlier `shipped-counter.receipt.txt` already scores exactly these bytes
(`tool_sha256=7273ad2b…`, `RUNTIME: CLEAN findings=0`, `HELD 221/221`), so clause (e) is now
consistent without any further run. The `diff -u` recorded above (3 hunks, first at line 893, all
inside `--selftest`) is the evidence that the production prefix is unchanged; `--selftest` on these
bytes reads `PASS held=63/63`.
