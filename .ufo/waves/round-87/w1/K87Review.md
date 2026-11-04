# K87Review — external falsification of C1 `receipt-bind` (round 87)

Seat `K87Review`, leaf reviewer. Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Base `/home/vgpnk/Projects/shokunin/kumitate-shokunin` @ `db97929212bb61ae970b10abac3cc4cd976713ae`;
freeze `25a3a75df123a59c5cf0de944a6d2f067e278f82` (lane HEAD; working tree dirty only in
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/readme-map.json` and
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/README.md`, neither touched by me).
I edited nothing outside
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/**` and this file.
No commits, no installs, no mutating git/jj (read-only `log`/`show`/`cat-file`/`rev-parse`/`status`/`diff`,
plus one `git clone --shared` under scratch).

## Verdict

**The predicate does not discriminate binding from non-binding, and by its own frozen kill rule C1 is
UNMET.** A control that reads **zero receipt bytes** — it looks only at `--dir`, at whether that
directory exists, and at its own call counter — scores **`C87_C1: HELD held=12/12`, exit 0** in the
after-state the plan requires, the same score as the genuinely correct candidate. The plan freezes:
"Any seat-constructed control that reaches 12/12 is scored the same way" (kill rule → C1 UNMET,
rejected-honest-stop). The plan's defence sentence — "a tool that answers from a canned table, a
directory name or a filename scores at most 3/12 (measured, `controls/path-keyed.txt`)" — is false by
measurement: the probe hands every arm its identity through the fixture directory name, and the
committed `path-keyed` control itself rises from 3/12 to 4/12 as soon as the round's close receipts
exist.

The **candidate instrument is not the defect**:
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecBind/receipt-bind.mjs`
reads 12/12 over genuinely bound receipts, 39/39 on its hermetic selftest (including
`dirty-worktree-cannot-launder` and `worktree-bytes-not-truth`), and reproduces the round-86 numbers
exactly. The defect is in the scorer, and the scorer is frozen; the honest consequence is a rejected
claim, not a probe edit.

## 1. Frozen artifacts read before any work (unmodified)

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/plan.md` (7264 B: 12-arm table,
  predicate sentence, kill rule, pre-data control table).
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs` (258 lines;
  all twelve arm bodies read in full, lines 1–120 and 120–258 raw).
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/controls/` — `base.txt`,
  `base.mjs` (absent by design), `stub-clean.{mjs,txt}`, `constant-drift.{mjs,txt}`,
  `path-keyed.{mjs,txt}`.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-86/close/` — the ten receipts.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-86/run-close.mjs:20` — the emitter
  that produced the misnaming: `const hash=createHash('sha256').update(readFileSync(\`${lane}/scripts/counter-receipt.mjs\`))`
  sits inside the `for` loop, so one digest is stamped on all ten cases.

## 2. Round-86 numbers, re-derived independently

Command (my own resolver; hashes `git cat-file blob <rev>:<path>` for lane instruments, disk bytes for
the one external instrument; the instrument is the second whitespace token of `cmd=`):

```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/rederive.mjs \
     /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-86/close \
     19b4e440e83ea9d618708003f36c3a799eb13e08
```

exit 0. Receipt:
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/rederive-r86.txt`.
Every digest was re-checked a second, independent way (`git show <rev>:<path> | sha256sum`) and agrees
to the byte.

| receipt | instrument named by `cmd=` | source | `tool_sha256=` (claimed) | digest of the instrument | verdict |
|---|---|---|---|---|---|
| `c1-probe.txt` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-86/probe/probe86-c1.mjs` | git@19b4e44 | `e9531370…31069` | `a59dabdb…8e807` | **MISMATCH** |
| `census.txt` | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` | disk (external) | `e9531370…31069` | `3fb72615…64e30` | **MISMATCH** |
| `map-selftest.txt` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs` | git@19b4e44 | `e9531370…31069` | `fc119ab6…d8831` | **MISMATCH** |
| `map.txt` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs` | git@19b4e44 | `e9531370…31069` | `fc119ab6…d8831` | **MISMATCH** |
| `plan.txt` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh` | git@19b4e44 | `e9531370…31069` | `4d927ce3…554ab` | **MISMATCH** |
| `proxy-selftest.txt` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/proxy-check.mjs` | git@19b4e44 | `e9531370…31069` | `fd51dc98…a8ef7` | **MISMATCH** |
| `proxy.txt` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/proxy-check.mjs` | git@19b4e44 | `e9531370…31069` | `fd51dc98…a8ef7` | **MISMATCH** |
| `ready.txt` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/ready-handoff.mjs` | git@19b4e44 | `e9531370…31069` | `d6e6ba8a…36a53` | **MISMATCH** |
| `selftest.txt` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/counter-receipt.mjs` | git@19b4e44 | `e9531370…31069` | `e9531370…31069` | **MATCH** |
| `spotcheck.txt` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/spotcheck-adopt.mjs` | git@19b4e44 | `e9531370…31069` | `e2b0f0de…87346` | **MISMATCH** |

**Totals: 10 receipts — matched=1, mismatched=9, unchecked=0, unresolved=0, external=1.** That is
exactly the round-86 defect R86-D1 and exactly what probe arm 3 asserts. Independent recount of the
census denominator
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/census-recount.txt`):
239 committed close receipts in rounds 74–86, **229** with no `cmd=`+`tool_sha256=` pair, **10** with
both, **1** bound / **9** mismatched — the plan's motivating numbers hold.

## 3. Do the predicate sentence, the twelve arms and the kill rule agree?

Yes on **name, exit code and tally semantics** — no arm's assertion contradicts the plan's table, and the
plan names no arm the probe lacks. The disagreements are of a different kind (fixture identity, field
parsing, nondeterminism; §5 F1–F4). Arm by arm, with the probe line that decides it:

| arm | plan sentence | probe assertion (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs`) | agree |
|---|---|---|---|
| `usage` | bare invocation exits 64 and prints `USAGE` | `status===64 && /USAGE/` over stdout+stderr (A1) | yes |
| `selftest` | `--selftest` prints `RECEIPT_BIND_SELFTEST: PASS` exit 0 | `status===0 && /RECEIPT_BIND_SELFTEST: PASS/` (A2) | yes |
| `detect-r86` | DRIFT matched=1 mismatched=9 unchecked=0 exit 1 | exit 1, `/^RECEIPT_BIND: DRIFT/`, `field matched===1 && mismatched===9 && unchecked===0` (A3) | yes |
| `clean-r87` | CLEAN, mismatched=0 unchecked=0, exit 0, matched≥8 | requires `receiptsOf(R87).length>=8`, exit 0, `CLEAN`, 0/0, `matched>=8` (A4) | yes |
| `flip-cmd` | same filename, `cmd=` re-pointed → mismatched=1 exit 1 | copies R87, sets `toks[1]='scripts/proxy-check.mjs'` on the first non-proxy receipt, requires exit 1 + mismatched===1 (A5) | yes (F4 caveat) |
| `flip-hash` | one `tool_sha256=` zeroed → mismatched=1 exit 1 | zeroes the first digest in the first sorted receipt, exit 1 + mismatched===1 (A6) | yes |
| `unchecked` | `cmd=` removed → unchecked=1 mismatched=0 exit 1 | strips `^cmd=` from the first receipt, exit 1 + unchecked===1 + mismatched===0 (A7) | yes |
| `unresolved` | `cmd=` names a script the revision lacks → UNRESOLVED exit 2 | sets `toks[1]='scripts/absent-87-probe.mjs'`, exit 2 + `/FAIL-CLOSED UNRESOLVED/` (A8) | yes |
| `dir-missing` | missing receipt dir → DIR_UNREADABLE exit 2 | `--dir <work>/absent-87-dir`, exit 2 + token (A9) | yes |
| `rev-bad` | no `rev=` + unresolvable default → REV_UNRESOLVED exit 2 | strips `rev=` from every receipt, passes `--rev 0…0`, exit 2 + token (A10) | yes |
| `symlink` | symlinked receipt → SYMLINK_RECEIPT exit 2 | replaces the first receipt with a symlink to the second, exit 2 + token + `lstat.isSymbolicLink()` (A11) | yes |
| `random-fixture` | run-time receipt from lane bytes reads CLEAN matched=1; one flipped digest → mismatched=1 | random `scripts/*.mjs` from the **worktree** (line 233), digest of `git show <rev>:<rel>`, then `1`×64, exit 0/1 (A12) | yes (F3 caveat) |

**Kill rule vs arms:** the probe carries no kill-rule logic; the rule is procedural and *is* satisfied by
the four committed controls, which stay below 12 (§4.2). It is also fired by a seat-constructed control
(§4.1, §5 F1).

**Arms that can pass without reading receipt bytes.** Three by design — `usage`, `selftest`,
`dir-missing` (none of them touches a receipt). In practice **all twelve**, because the probe hands each
arm a stable, arm-named directory: `<work>/probe87/flip-cmd`, `<work>/probe87/flip-hash`,
`<work>/probe87/unchecked`, `<work>/probe87/unresolved`, `<work>/probe87/rev-bad`,
`<work>/probe87/symlink`, `<work>/probe87/random-fixture`, plus
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-86/close` and
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/close`. Only arm 12 reuses one
directory for two calls, and a one-line call counter separates them. Measured, not argued (§4).

## 4. Controls, measured with the frozen probe

Every run is `node <probe> --lane <L> --work <W> --rev <R> --tool <T>`; each `<W>` is under
`/fast/scratch/hyaku/kumitate-r87/K87Review/`. Receipts are committed under
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/`.

### 4.1 My control:
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/dirkey-control.mjs`

Reads **zero receipt bytes**. It branches on `basename(--dir)` and `basename(dirname(--dir))`, checks
only that `--dir` exists (arm 9 is a directory-existence arm), and writes a `.k87review-calls` counter
into the one directory the probe reuses (arm 12).

| lane state | result | receipt |
|---|---|---|
| live lane, `--rev db97929212bb61ae970b10abac3cc4cd976713ae`, no `round-87/close/` yet | `C87_C1: UNMET held=5/12` exit 1 — arms 4, 5, 6, 7, 8, 10, 11 all read `no-r87-close` | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-dirkey-live.txt` |
| after-state (scratch clone of the lane, 10 bound round-87 receipts, `--rev 25a3a75df123a59c5cf0de944a6d2f067e278f82`) | **`C87_C1: HELD held=12/12` exit 0** | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-dirkey-afterstate.txt` |
| after-state, 8 bound receipts that all name `scripts/proxy-check.mjs` | **`HELD held=12/12` exit 0** | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-uniform-instrument.txt` |

**The exact arms it passes:** all twelve — `usage`, `selftest`, `detect-r86`, `clean-r87`, `flip-cmd`,
`flip-hash`, `unchecked`, `unresolved`, `dir-missing`, `rev-bad`, `symlink`, `random-fixture`. It fails
**no** arm in the after-state, so there is no single "arm it fails on": the cheapest no-work control ties
the correct candidate. That is the finding.

### 4.2 The committed controls, re-scored in the after-state (their receipts are base-state only)

| control | plan (at base) | measured at base (committed receipt) | measured in after-state | receipt |
|---|---|---|---|---|
| instrument absent (`controls/base.txt`) | 0/12 | 0/12 | 0/12 | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-committed-controls-afterstate.txt` |
| `stub-clean.mjs` (constant CLEAN) | 0/12 | 0/12 | **1/12** (`clean-r87` passes: a constant CLEAN satisfies arm 4 once receipts exist) | same file |
| `constant-drift.mjs` | 1/12 | 1/12 | 1/12 (`detect-r86`) | same file |
| `path-keyed.mjs` | 3/12 | 3/12 | **4/12** (`+ clean-r87`) | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-pathkeyed-afterstate.txt` |

None reaches 12, so the plan's literal sentence "every tool under `controls/` still scores below 12/12"
holds — but the **ceiling** the plan uses to argue non-vacuity ("at most 3/12") does not: it is a
base-state artefact, and a directory-name-keyed tool that also knows the fixture names reaches 12/12.

## 5. Findings

### F1 — CRITICAL: the twelve arms are distinguishable from `--dir` alone; the kill rule fires → C1 UNMET
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs` builds every
fixture at a **fixed** path, `<work>/probe87/<arm-name>/`, and hands that path to the candidate as
`--dir`. Arm identity is therefore readable from argv without opening a single receipt.
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/dirkey-control.mjs`
does exactly that and scores 12/12 (receipts
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-dirkey-afterstate.txt`
and
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-uniform-instrument.txt`),
so the frozen kill rule ("Any seat-constructed control that reaches 12/12 is scored the same way") fires
and C1 is UNMET. The plan's defence ("a tool that answers from … a directory name … scores at most
3/12") is falsified:
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/controls/path-keyed.mjs` measures
4/12 in the after-state, and a fixture-name-keyed control measures 12/12.
*Fix direction for a future round (the probe is frozen):* name each fixture `mkdtempSync(join(work,'probe87-'))`
so the arm cannot be inferred from the path, and score each arm over a pair of runs whose order the tool
cannot observe.

### F2 — HIGH: `field()` is an unanchored regex, so `matched=` matches inside `mismatched=`
`function field(line, key) { const m = line.match(new RegExp(\`${key}=(\\d+)\`)); … }` —
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs:62`.
`field(line,'matched')` therefore returns the number after `mismatched=` whenever `mismatched=` appears
first. Measured with
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/orderflip-control.mjs`,
which is verdict-for-verdict identical to `dirkey` and differs **only** in printing `mismatched=` before
`matched=`: **9/12**, failing `detect-r86` (`matched=1` present but read as 9), `clean-r87` (`matched=10`
present but read as 0) and `random-fixture` (`matched=1` present but read as 0) — all three *while the
printed tallies are correct*
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-orderflip-afterstate.txt`).
Consequence: the probe silently requires an undocumented output field order. The plan states the order
only inside an example line (`RECEIPT_BIND: DRIFT matched=<n> mismatched=<m> …`) and nowhere as a
requirement; a correct implementation that emits `mismatched=` first is scored as failing the capability
it implements.

### F3 — HIGH: arm `random-fixture` is nondeterministic and reads the worktree, not the revision
A12 picks `scripts[(Date.now()+process.pid) % scripts.length]` from `readdirSync(<lane>/scripts)` — the
**worktree** — at
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs:233`, then
requires `git show <rev>:scripts/<pick>` to succeed. Any `scripts/*.mjs` present in the worktree but
absent at `--rev` makes the arm fail with `no-scripts` for *every* tool, at random. Measured on a scratch
clone whose `scripts/` holds one tracked and one untracked `.mjs`: six identical invocations of the same
tool over the same lane at the same rev gave `5/12, 5/12, 4/12, 4/12, 4/12, 5/12`
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-arm12-nondeterminism.txt`).
At the live lane this is not hypothetical: `git cat-file -e <rev>:scripts/receipt-bind.mjs` fails at
**both** `db97929212bb61ae970b10abac3cc4cd976713ae` and
`25a3a75df123a59c5cf0de944a6d2f067e278f82`, and the integration adds it as the 33rd `scripts/*.mjs`;
unless the measured `REV` is a commit that contains it, **one probe run in 33 reads `UNMET` for a correct
tool**. That makes the claim's score flaky and invites re-run-until-green — the exact anti-pattern this
lane exists to prevent. *Fix direction:* enumerate from `git ls-tree <rev> scripts/`.

### F4 — MEDIUM: arm `flip-cmd` is a no-op when every round-87 receipt names `scripts/proxy-check.mjs`
A5 searches the copied close directory for a receipt whose instrument is *not*
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/proxy-check.mjs`; if none exists it falls back
to `receiptsOf(d)[0]` and writes the same token back — an unchanged fixture. Measured: with 8 bound
receipts that all name that script, the **correct** candidate reads `CLEAN matched=8 mismatched=0` and
arm 5 FAILS → `held=11/12`
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-uniform-instrument.txt`),
while `dirkey`, which reads nothing, passes. Arm 5's discriminating power is a property of the round's own
receipt content, not of the tool.

### F5 — MEDIUM: the external-instrument rule in the plan is under-specified, and arm 3 silently decides it
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/plan.md` says an absolute instrument
outside the lane is "hashed from the file on disk (counted `external=`)" but never says whether such a
receipt enters `matched`/`mismatched`. Arm 3 forces the answer: one of the ten round-86 receipts
(`census.txt`, instrument `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`) is external, and the
arm demands `matched=1 mismatched=9 unchecked=0`, so an external mismatch must count as `mismatched`; a
candidate that follows the plan's sentence literally (external excluded from the verdict) fails arm 3.
Separately, an external receipt is **not** bound at a judged revision at all: `CLEAN` over
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` is only as stable as the fleet root's working
tree and can go red with no lane commit — a hole in "bind at a judged revision" that the plan does not
acknowledge. The candidate's header states the disk-hash rule explicitly and counts external as
matched/mismatched, which is the reading arm 3 requires; the **plan** is the stale document.

### F6 — MEDIUM: arms 4–8, 10, 11 are gated on the round's own close receipts; the claim is unscoreable until they exist
`clean-r87` needs ≥8 `.txt` receipts in
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/close/`; `symlink` needs ≥2; five
more arms derive from that directory. Measured today on the live lane, the candidate scores **5/12** with
seven arms reading `no-r87-close`
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-candidate-live.txt`)
— not a tool defect, but it means the predicate's after-state is produced by the same round it scores, so
the L1 must run the probe **only after** close emission and must not report the 5/12 as a tool failure.
Arm 4 also cannot distinguish a correct verifier from a re-run of the emitter's own digest logic: it
measures self-consistency between the close runner and the verifier. Arm 3 is the only arm that measures
the historical defect.

### F7 — LOW: arm 3's `external=` count is lane-location dependent
Re-scored against a scratch clone, `c1-probe.txt`'s absolute instrument
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-86/probe/probe86-c1.mjs`) falls outside
the clone and is counted `external=2` instead of `external=1`. The probe does not assert `external=`, so
scoring is unaffected, but anyone reproducing with `--lane <elsewhere>` should expect the lane-absolute
receipt to be exercised as external.

### F8 — LOW: the candidate's remaining sharp edges (no arm covers them; recorded for the L1)
- `laneRel()` treats any absolute path inside the lane as lane-relative, including `.ufo/**`; that is what
  arm 3 needs for `c1-probe.txt` and it matches the plan's "lane-relative or lane-absolute".
- A receipt whose `cmd=` second token is a flag fails closed as `UNRESOLVED` (declared in the header);
  `cmd=node` alone also fails closed. No probe arm distinguishes those from "absent at rev", which is
  harmless because the token is the same.
- `--json` is exercised only by the selftest (3 arms), never by the probe.

## 6. Candidate scoring, line by line

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecBind/receipt-bind.mjs`
(sha256 `b640ff3115228e2d7cc1ca748bc892db1887e33f356197ed86937b989eaf4c0a`, 544 lines).

- Hermetic selftest: `node <candidate> --selftest --work <scratch>` → `RECEIPT_BIND_SELFTEST: PASS
  held=39/39`, exit 0
  (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/candidate-selftest.txt`).
- Live lane, `--rev db97929212bb61ae970b10abac3cc4cd976713ae`: `C87_C1: UNMET held=5/12`, exit 1 — PASS
  `usage`, `selftest`, `detect-r86` (`DRIFT matched=1 mismatched=9 unchecked=0 external=1
  first=c1-probe.txt`), `dir-missing`, `random-fixture`; FAIL `clean-r87`, `flip-cmd`, `flip-hash`,
  `unchecked`, `unresolved`, `rev-bad`, `symlink` — **every one of the seven reads `no-r87-close`**
  (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-candidate-live.txt`).
- After-state (scratch clone + 10 receipts bound at `25a3a75df123a59c5cf0de944a6d2f067e278f82`, generated
  by
  `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/gen-r87-close.mjs`):
  **`C87_C1: HELD held=12/12`, exit 0**
  (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-candidate-afterstate.txt`):

| arm | line |
|---|---|
| `usage` | PASS `exit=64` |
| `selftest` | PASS `exit=0 RECEIPT_BIND_SELFTEST: PASS held=39/39` |
| `detect-r86` | PASS `exit=1 RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=2 first=c1-probe.txt` (external=2 is F7; the live lane reads external=1) |
| `clean-r87` | PASS `exit=0 RECEIPT_BIND: CLEAN matched=10 mismatched=0 unchecked=0 external=1` |
| `flip-cmd` | PASS `exit=1 RECEIPT_BIND: DRIFT matched=9 mismatched=1 unchecked=0 external=1 first=c1-probe.txt edited=c1-probe.txt` |
| `flip-hash` | PASS `exit=1 RECEIPT_BIND: DRIFT matched=9 mismatched=1 unchecked=0 external=1 first=c1-probe.txt` |
| `unchecked` | PASS `exit=1 RECEIPT_BIND: DRIFT matched=9 mismatched=0 unchecked=1 external=1 first=c1-probe.txt` |
| `unresolved` | PASS `exit=2 RECEIPT_BIND: FAIL-CLOSED UNRESOLVED … scripts/absent-87-probe.mjs` |
| `dir-missing` | PASS `exit=2 RECEIPT_BIND: FAIL-CLOSED DIR_UNREADABLE …/absent-87-dir (ENOENT)` |
| `rev-bad` | PASS `exit=2 RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED … is not a commit in …` |
| `symlink` | PASS `exit=2 RECEIPT_BIND: FAIL-CLOSED SYMLINK_RECEIPT …/symlink/c1-probe.txt` |
| `random-fixture` | PASS `pick=scripts/cite-sources.mjs clean_exit=0 CLEAN matched=1 … flip_exit=1 DRIFT mismatched=1` |

- Uniform-instrument after-state (F4): `held=11/12`, `flip-cmd` FAIL `exit=0 CLEAN matched=8`.

The candidate therefore **does** the claimed thing: it binds each receipt to the instrument its own `cmd=`
names, at the receipt's revision, refuses to launder a dirty worktree, and reproduces the round-86
misnaming to the digit. Its only red readings are the two probe artefacts F3/F4 and the missing
after-state receipts F6.

## 7. What the L1 must do (no frozen file edited)

1. **C1 as written: UNMET.** The frozen kill rule fires on a 12/12 seat-constructed control (§4.1, F1).
   Do not re-run the probe hoping for a different arm-12 pick (F3), and do not edit the probe or the plan.
   Record the rejected-honest-stop the way rounds 84/85 did, with F1 as the reason and
   `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-dirkey-afterstate.txt`
   as the evidence.
2. **Keep the candidate**; it is correct (§6). Do not reshape it to satisfy F1 — that is unachievable
   against a scorer that hands out arm identity through `--dir`.
3. **When the close receipts are emitted** (R86-D1), run the probe once, at a `REV` that is a commit
   containing `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-bind.mjs` and every
   `scripts/*.mjs` present in the worktree (F3), and report the number it prints — including a red one.
4. **Next-round scorer repair (pre-registered, not this round):** randomise fixture directory names
   (`mkdtemp`), anchor field extraction (`(?:^|\s)<key>=`), enumerate the arm-12 script from
   `git ls-tree <rev> scripts/`, make arm 5's target selection assert that the edit actually changed the
   token, and state in the contract that external instruments count as matched/mismatched.

## 8. Residual risk and verification gaps

- My 12/12 measurements use a **scratch clone** of the lane with 10 receipts generated from lane bytes at
  the freeze commit
  (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/gen-r87-close.mjs`),
  because the live lane has no `round-87/close/` yet. The reproduction is faithful for the question asked
  (does the scorer distinguish a binding tool from a non-binding one), but the L1's own after-state run
  remains the authority; my prediction is `dirkey = 12/12` there too, for the same structural reason.
- I did not run the probe against a *committed*
  `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-bind.mjs`; integration is the L1's act.
- I did not audit the candidate for behaviours no arm covers beyond §5 F8 (e.g. CRLF handling exists only
  in its selftest, not in the probe).
- The round-86 `census.txt` verdict is a **disk** comparison, not a revision comparison (F5); its
  mismatch is nevertheless certain, because the claimed digest is byte-identical to
  `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/counter-receipt.mjs` and the external file is
  not that file.
- Unrun checks are not claimed as passed. Everything above is a command that ran; exit codes and receipt
  paths are named. Tooling: no install or upgrade was needed or performed.

## Evidence index

All paths absolute, beneath
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/`.

| path | what it is |
|---|---|
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/dirkey-control.mjs` | my no-receipt-read control (12/12 in the after-state) |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/orderflip-control.mjs` | same verdicts, `mismatched=` printed first (9/12 — F2) |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/rederive.mjs` | independent round-86 resolver used in §2 |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/gen-r87-close.mjs` | after-state fixture generator (10 bound receipts at `25a3a75df123a59c5cf0de944a6d2f067e278f82`) |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/rederive-r86.txt` | per-file table + `SUMMARY … matched=1 mismatched=9 unchecked=0 external=1` |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/census-recount.txt` | 239 / 229 / 10 / 1 / 9 recount |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/candidate-selftest.txt` | `RECEIPT_BIND_SELFTEST: PASS held=39/39` |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-candidate-live.txt` | candidate, live lane: `UNMET held=5/12` |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-dirkey-live.txt` | dirkey, live lane: `UNMET held=5/12` |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-candidate-afterstate.txt` | candidate, after-state: `HELD held=12/12` |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-dirkey-afterstate.txt` | dirkey, after-state: **`HELD held=12/12`** |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-orderflip-afterstate.txt` | field-order control: `UNMET held=9/12` |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-pathkeyed-afterstate.txt` | committed `path-keyed`: `UNMET held=4/12` |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-committed-controls-afterstate.txt` | base 0/12, stub-clean 1/12, constant-drift 1/12 |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-uniform-instrument.txt` | arm 5 no-op: candidate 11/12, dirkey 12/12 |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Review/receipts/probe-arm12-nondeterminism.txt` | six identical runs: 5/12, 5/12, 4/12, 4/12, 4/12, 5/12 |

Scratch (`/fast/scratch/hyaku/kumitate-r87/K87Review/`, including three scratch clones) is removed after
this report; nothing citable lives there.
