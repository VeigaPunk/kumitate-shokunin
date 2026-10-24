# RevPlan — freeze-integrity review of round-51 plan vs counters A51/D51

Seat: `kumitate-r51.EagerTahr` (reviewer). Item RevPlan, wave 1, kumitate round 51.
Review only — nothing edited outside this report; no git/jj mutation; no tools installed.

## Pinned identities (bytes this review audited)

The lane was amended **four times during this review** (freeze 22:53:14 → repair 4
23:09:07). Every finding below was re-verified against the final pinned bytes:

| File | Bytes reviewed | sha256 @ pin | Last-touch commit |
|---|---|---|---|
| `.ufo/waves/round-51/plan.md` | full, incl. addendum | `cc9bb98b8ca6c31550cd49f777da81a1cd162267c4607dacc54bdfe42d38160d` | `8c07e88` (addendum appended; §C1/§C2 body unchanged from freeze) |
| `.ufo/waves/round-51/probe/attest51-probe.mjs` | full (v3, 7 checks) | `5e75af7983330b5c1091dbca6e3b405036c01a73434fed11e58365b1390ee913` | `8fd3cde` (repair 4) |
| `.ufo/waves/round-51/probe/doctrine51-probe.mjs` | full (v2, 5 checks) | `f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0` | `3ed875d` (repair 2) |

HEAD at review close: `8fd3cde172026f33ef6af7396afbfe98ce7c7d14`; `git status --porcelain`
on all three files: clean. Amendment chain: `06ecbf4` (freeze) → `1fd8ace` (r1: A51
comment-termination) → `3ed875d` (r2: D51 D3 column indexes) → `8c07e88` (r3: A51 v3
challenge arms + **plan addendum appended**) → `8fd3cde` (r4: A3c sidecar copy).

One mid-review torn read was observed (A51 transiently hashed `5e75af79` while `8c07e88`
was HEAD, then settled clean at that hash once `8fd3cde` landed). The lane is a live
freeze; all hashes here are re-checked at close.

---

## (a) Predicate-sentence byte-identity: plan ↔ counter headers ↔ report labels

**Verdict: NOT byte-identical anywhere.** Exact sentences:

- Plan §C1 (`plan.md:65-66`): `` `ATTEST_HELD` = held=5/5 exit 0; any other reading is
  `ATTEST_UNMET held=<k>/5` exit 1; crash/unreadable extraction = exit 2 (never a score). ``
- A51 header (`attest51-probe.mjs:42-44`): `Predicate ATTEST_HELD = held=7/7, exit 0. Any
  other reading is `ATTEST_UNMET held=<k>/7` exit 1. A crash, an unreadable extraction or
  a malformed verdict line is exit 2 (never a score).`
- Plan §C2 (`plan.md:96-97`): `` `DOCTRINE_HELD` = held=5/5 exit 0; else `DOCTRINE_UNMET
  held=<k>/5` exit 1; crash/unreadable = exit 2. ``
- D51 header (`doctrine51-probe.mjs:22-24`): `Predicate DOCTRINE_HELD = held=5/5, exit 0.
  Any other reading is `DOCTRINE_UNMET held=<k>/5` exit 1. A crash or unreadable
  extraction is exit 2 (never a score).`

Drift list (see Findings M-1, L-1 for severity):

1. **Arithmetic drift C1**: plan says `5/5`/`<k>/5` and "five checks" (`plan.md:50`); the
   live counter scores **seven** checks and emits `held=<k>/7 ... version=v3` (observed
   verbatim at base, below). The plan addendum (`plan.md:157-181`, item 3) declares the
   7-check set and "predicate label and kind unchanged", i.e. documented supersession —
   but the §C1 body sentence is left false as written.
2. **Exit-2 trigger-set drift C1**: plan `crash/unreadable extraction` vs A51 header
   adds `a malformed verdict line`. The header's extra trigger is unimplemented (L-1).
   D51 has no such clause; plan §C2 ↔ D51 header differ **cosmetically only**
   ("else" vs "Any other reading is"; comma placement). Semantics identical for C2.
3. **Future report labels**: no wave-1 report yet asserts a measured `ATTEST_HELD` /
   `DOCTRINE_HELD`. Two concrete label hazards already exist:
   - `.ufo/waves/round-51/w1/ConnSiblingOverlap.md:135` instructs expecting
     `ATTEST_HELD held=5/5` — the **5/5 shape is dead**; the emitted HELD line will read
     `held=7/7 ... version=v3`.
   - `.ufo/waves/round-51/w1/ExecBaseCounter.md:20-21` quotes v2-era base lines
     (`held=0/5`, no `version=` token). True when recorded; superseded by the v3/v4
     re-measurement committed at `base/attest-base-v3.txt`.
   Canonical emitted shapes I observed at the pinned bytes:
   `ATTEST51: ATTEST_UNMET held=0/7 checks=7 rev=<rev> rule=A51 version=v3 | A1 MISS … | A2c MISS … | A3c MISS …`
   and `DOCTRINE51: DOCTRINE_UNMET held=0/5 checks=5 rev=<rev> rule=D51 | D1 MISS entry-absent`.
   Reports should quote the full emitted line (it carries rev + rule + version), not the
   plan's `held=5/5` fragment.

---

## (b) Per-check fail-closed audit and exit-2-on-crash — verified

All arms at pinned bytes, traced line-by-line; every arm can only fail toward MISS:

- **A51 (7 arms)**: A1 (`:112-121`) — absent tool / nonzero exit / token-not-final-line →
  MISS. A2 (`:124-152`) — absent files, unparseable JSON (caught), missing nonce/run-at,
  NaN dates (span forced to 0 → `<300` branch), non-distinct nonces/shas → MISS. A2c
  (`:155-176`) — run failure, missing receipt, unparseable JSON, argv-last≠probe nonce,
  stdout sha ≠ sha256(probe nonce), verify≠VALID, `sha256sum -c` nonzero → MISS. A3
  (`:179-188`) — absent or wrong exit/verdict → MISS. A3c (`:191-213`, post-r4) — same
  fail-closed shape; with repair 4 it now copies the **genuine** sidecar to the tampered
  copy, so a TAMPERED verdict can only come from prelude-rewrite + intact-sidecar
  binding, not the missing-sidecar class (this closes exactly the hole I found in the
  v3 bytes at `8c07e88`; commit credits CritC1 — independent convergence). A4
  (`:216-242`) — tool/dir absent, any ledger verify≠VALID, any prior-corpus nonce hit →
  MISS. A5 (`:245-259`) — pin absent, pin≠sha(script), proxy≠`PROXY: MATCH` exit 0 →
  MISS (the `a5d.length===2` detail gate is ugly but sound: exactly one detail is pushed
  per sub-arm, and every failure path lands a non-`['pin match','proxy MATCH']` pair).
  All 7 `hold()` calls are unconditional → `checks.length===7` always; `held===7` ⇔ exit 0.
- **D51 (5 arms)**: entry-absent → explicit `DOCTRINE_UNMET held=0/5` exit 1 (D2–D5 not
  evaluated — fail-closed direction; noted by ExecBaseCounter too). D1 regexes over the
  5-line head; D2 `clauses>=12 && bound>=12 && d2miss===0` with per-path `git show
  <rev>:<path>` blob-hash match (show failure or hash mismatch → MISS); D3 row cells
  `c[1]===id && c[8]==='mined' && c[11].includes(ENTRY)` — now matches the real
  11-column SOURCES.md registry (id=1, …, status=8, opened=9, recheck=10, used-by=11,
  trailing empty=12; verified against `corpus/SOURCES.md:8` header and the S001/S099
  rows); D4 sources-check CLEAN exit 0 (absent script → node exits 1 → MISS); D5 census
  exit 0. All fail-closed.
- **Exit 2 on crash, observed live** (not just read):

```sh
node .ufo/waves/round-51/probe/attest51-probe.mjs "$PWD" 0000…0000
# → "ATTEST51: FAIL-CLOSED git archive 0000…0000 exit=2", exit 2
node .ufo/waves/round-51/probe/doctrine51-probe.mjs "$PWD" 0000…0000
# → "DOCTRINE51: FAIL-CLOSED git archive 0000…0000 exit=2", exit 2
```

  Both probes also pass `node --check` and both base controls reproduce at the pinned
  bytes (exit 1, UNMET, lines quoted in §(a)). `node`, `bash`, `git` are still
  PATH-spawned by the probes; addendum item 5's absolute-path rule covers only
  `/usr/bin/printf` and `/usr/bin/sha256sum` (both present on this host, verified) —
  residual, not a defect against the plan text.

---

## (c) Counting commands vs counter usage lines — match

- `plan.md:68`: `node .ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`
  ↔ A51 header usage `:6` and argv parse `[laneArg, rev, ...rest]` with usage-exit 64 on
  extra/missing args and on non-git lane. **Match.**
- `plan.md:99` ↔ D51 `:8`. **Match.**
- Both counters were executed by this seat with exactly the plan-shaped command
  (absolute lane + 40-hex rev) at base `c90b9de9…` — see outputs above. Repair history
  r1/r3/r4 did not touch argv handling or usage lines (verified in each diff).

---

## (d) Claim-sizing per AXES.md

- **Distinct axes**: C1 operability (capability acquisition), C2 coverage —
  `plan.md:5-6`; two claims within AXES.md's 1–3; a capability-acquisition claim is an
  allowed claim type ("still lands a per-axis verdict"). ✓
- **Causal separability**: no arm of A51 reads any C2 artifact and no arm of D51 runs or
  inspects `receipt-attest` — each counter scores its claim from `<rev>` bytes plus its
  declared live gate. ✓ One caution: D2's clause bindings are entry-author-chosen repo
  paths; binding them to round-51 receipt paths (C1 artifacts) would couple D2's
  pass to C1's artifacts at the same rev. Keep D2 bindings on non-C1 paths to preserve
  clean separability.
- **No universal clause the counter cannot enumerate** — violations/residues found:
  1. `plan.md:36-37` "`--selftest` hermetic suite ≥10 cases including a flake-injection
     case … and a sidecar-mismatch case" — A1 checks only the final line token + exit 0.
     Post-r4, A3c covers the sidecar-mismatch class **live**, but **no arm anywhere
     asserts a `RECEIPT: REPLAY` verdict**; the flake-injection/REPLAY class remains
     tool-self-attested inside `--selftest` (CritC1:138 makes the same point for A1/A3).
  2. `plan.md:37-38` "No env is recorded; receipts carry no secret material (QUALITY
     Q42 class)" — no arm checks this.
  3. `plan.md:38` verdict/exit mapping "usage 64; unreadable 2" — no arm checks
     (A2/A3 pin only VALID=0 and TAMPERED=1).
  4. `plan.md:61-62` A4's negative claim — bounded by a finite deterministic walk, so
     enumerable, but the plan misdescribes the walked set (L-4).
  5. Honest-by-design: A2's ≥300 s span is author-scheduled and declared so
     (`plan.md:146-148`, limit (b)); the Q39 ceiling is prose, deliberately kept outside
     the counter and carried verbatim into limits (a). No objection.

---

## Findings by severity

### HIGH (historic, repaired before any data seat scored; repair verified by this seat)

- **H-1 — A51 v1 was unparseable.** The v1 JSDoc contained the glob `round-4*/**`; the
  `*/` terminated the block comment early → SyntaxError, node exits **1** with a stack
  trace — no counter line, no exit 2, indistinguishable by exit code from a legitimate
  UNMET for a harness keying on exit codes. Directly violates the counter's own
  "crash … = exit 2 (never a score)" contract. Repaired `1fd8ace` (2+/1−, comment lines
  only — verified in the patch myself). Converges with ExecBaseCounter F-A51-1 / CritC1.
- **H-2 — D51 v1 D3 was unsatisfiable.** v1 read `c[9]==='mined' && c[12].includes(ENTRY)`;
  the real SOURCES.md registry has 11 columns (status=c[8], used-by=c[11], c[12]=trailing
  empty), so no schema-conforming row could pass → `DOCTRINE_HELD` unreachable as frozen
  (and a row without a trailing pipe would have thrown on `undefined.includes` → exit 2).
  I derived this from the pre-repair bytes before seeing the repair. Repaired `3ed875d`
  (one line, verified in the patch; current `doctrine51-probe.mjs:97` matches the
  registry I read). Converges with ScoutRandomSource / ScoutClockSource.

### MEDIUM (open at pinned bytes)

- **M-1 — Plan §C1 predicate arithmetic is superseded but left false in the body.**
  Body (`plan.md:50,65-66,69`): "five checks", `held=5/5`, `<k>/5`, control expects
  `held=0/5`. Live counter (observed): 7 checks, `held=<k>/7 … version=v3`; base reading
  is `held=0/7`. The addendum (`plan.md:157-181`) documents the 7-check set and says it
  "supersedes the freeze bytes it names", but §C1 remains the only predicate sentence in
  the body and no longer describes the counter. Any consumer quoting §C1's shape
  (e.g. ConnSiblingOverlap.md:135) will mis-record the verdict.
- **M-2 — Plan §C1 ledger sentence states the superseded literal rule.** `plan.md:31-33`
  ("walks every other `*.txt` receipt … rejects a nonce already present") is the rule
  addendum item 4 (`plan.md:172-178`) replaces with the same-digest exemption — which is
  also what makes A3+A4 co-passable (the doctored control shares run-2's nonce but has a
  byte-identical JSON line, i.e. an identical record digest). Operative contract =
  addendum; body sentence wrong as written. Note the probe cannot verify which ledger
  semantics the instrument implements; a literal-rule instrument fails A4 → fail-closed.
- **M-3 — Plan §C1 control kill-rule was demonstrated false.** `plan.md:70-73` ("a stub
  script printing verdict strings cannot clear A1 … nor A3 … requires its exact final
  line from real execution") — the probe's A1 is `exit 0 + last-line regex`; CritC1
  demonstrated a real-execution stub clearing A1–A4 against v2, and addendum item 3
  concedes it. A2c/A3c are the real teeth. The body sentence remains as the "declared"
  control and overstates the counter to any §C1-only reader.
- **M-4 — D1 window drift, open.** Plan `plan.md:89-90` "in its first **three** lines"
  vs D51 `head = …slice(0, 5)` and header "within its first **five** lines"
  (`doctrine51-probe.mjs:11`, D1 arm). The counter is strictly more permissive: a trio
  on lines 4–5 passes D51 while violating the plan sentence. Not touched by r2/r4.
- **M-5 — D2 "each" drift, open.** Plan `plan.md:90-91` "≥12 clause lines, **each**
  carrying a … binding" vs acceptance `clauses.length >= 12 && bound.length >= 12 &&
  d2miss === 0`: an entry with unbound clause lines beyond the twelfth satisfies the
  counter but not "each". (Converges CritFreeze F3 and CritC2's proposed
  `bound.length === clauses.length`.)

### LOW (open)

- **L-1** A51 header (`:43-44`) promises exit 2 for "a malformed verdict line"; no code
  path does so (a malformed verdict scores an arm MISS → UNMET exit 1). Three-way
  divergence plan ↔ header ↔ code; implemented behavior is the safe one. D51 has no such
  clause.
- **L-2** `const T = mkdtempSync(…)` sits **outside** the try in both probes
  (`attest51-probe.mjs:104`, `doctrine51-probe.mjs:46`): a throw there exits 1 with no
  counter line — exit-code-indistinguishable from UNMET (though no score line is
  emitted, so a line-parsing harness stays safe).
- **L-3** A5's pin regex scans **all** of SCORECARD.md, not the `kumitate-gate-pins-v1`
  block (`plan.md:62-63` scopes it to the block); a stray `pin.receipt-attest=<64hex>`
  outside the block satisfies the arm.
- **L-4** A4 description drift: plan says the prior corpus is "listed in the probe
  (r49/r50 receipt files)" and Limits (c) claims "the probe names it" and "a
  negative-claim sweep command is included in the probe output". Actual: a dynamic walk
  of `.ufo/waves` (excluding exactly `round-51`) filtered by `/receipt|ReRun|L1-score/i`,
  and the output carries `prior-files=<n>` — a count, not a command. The walked set is
  broader than described (safe direction for a negative claim).
- **L-5** Rule-label asymmetry: §C1's predicate sentence never contains `A51`
  (`plan.md:50-66`), while §C2 binds "(rule `D51`)" at `plan.md:88`. The addendum names
  A51 repairs, partially healing the provenance gap; the sentence itself is still
  unbound. (Converges CritFreeze F2.)
- **L-6** A2c's `outOk` disjunction compares three byte-identical expressions
  (`sha(Buffer.from(nonce,'utf8'))` three ways) — dead discriminants, no hole.
- **L-7** The addendum's "All repairs are named" (`plan.md:157`) is false again: repair
  4 (`8fd3cde`, A3c sidecar copy) postdates the addendum and is not named in it;
  addendum item 3 still describes the v3-shape A3c.
- **L-8** A4's prior-corpus sweep skips unreadable files silently
  (`catch { continue }`) — a nonce present in an unreadable prior file would be missed.
  All corpus files are committed text; negligible, recorded for completeness.

---

## Residual risk

- **Live freeze**: four amendments in ~16 minutes; the counter was modified (once
  uncommitted, observed as a torn read) while this review ran. Findings are pinned to
  the hashes in the identity table; anything after `8fd3cde` is out of my pin.
- **Probe dependency closure** is not frozen: D4 runs the rev-extracted (replaceable)
  `scripts/sources-check.mjs`; D5 spawns the live fleet census
  (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`) with no hash/rev binding;
  A5's `proxy-check --strict` runs with inherited `process.env` plus `UFO_SRC`. This is
  CritFreeze F1's structural point — confirmed by my read; not re-litigated.
- The plan's saturation/stagnation preconditions (`plan.md:7-10`) rest on SCORECARD
  state I did not audit (out of item scope).

## Verification gaps (checks I did not run)

- A2c/A3c/ledger arms were audited statically only — they require the integrated
  `scripts/receipt-attest.mjs`, which does not exist at base; wave-1 build seats own the
  live exercise. The base readings quoted here are real executions at the pinned bytes.
- D5 was last executed live by ExecBaseCounter (exit 0, recorded); I did not rerun the
  census myself.
- SOURCES.md was read in the working tree at review time; the counters score it from
  `<rev>` via `git archive` — identical if the tree stays clean (verified clean at pin).

## Commands this seat ran (cwd lane root)

`git log/-1/-3` and `git show`/`diff` (read-only) on the three files;
`git rev-parse HEAD`; `git status --porcelain` (scoped); `sha256sum` ×3;
`node --check` both probes; base controls: both probes at `c90b9de94009b938fa19a089bfaa97df20b54f86`
→ `ATTEST_UNMET held=0/7 … version=v3` exit 1 (at `5e75af79…`) and `DOCTRINE_UNMET
held=0/5 … exit 1` (at `f2d27071…`); bogus-rev runs of both probes → `FAIL-CLOSED … exit=2`;
`ls -1 /usr/bin/printf /usr/bin/sha256sum` (present, for A2c/A3c). No packages installed
or updated (pacman guard respected; nothing needed).

---

## Post-pin addendum — repair 5 (`4b8da21`) verified

After this report was delivered, freeze repair 5 landed (HEAD now `4b8da2166f62d7bda814132a669ad873a05833d3`,
tree clean). Re-verified at the new bytes:

| File | sha256 @ `4b8da21` |
|---|---|
| `plan.md` | `c23b6881b11795e92fd0300f4a54a276dcb47a8016d4bdd8b6b8ed328c0b262e` |
| `attest51-probe.mjs` | `f3169a676ede4265d00355cae9e900e70ee27043f624d3c28306249b26348d32` |
| `doctrine51-probe.mjs` | unchanged: `f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0` |

- **REPLAY class now asserted (closes my (d) residue 1):** A4c crafts a same-nonce /
  different-body twin (argv appended) with the inner digest recomputed over the
  contract-canonical form (digest removed, keys recursively sorted) and a recomputed GNU
  sidecar; twin alone must verify VALID and `--ledger` over {original, twin} must answer
  `RECEIPT: REPLAY` exit 1 for **both** files. Fail-closed: craft errors are caught →
  MISS; `mkdtempSync` for the ledger dir is inside the try. Note the twin-VALID leg is
  also a cross-check that the probe's canonicalization byte-matches the instrument's —
  a mismatch fails honestly (UNMET), not falsely.
- **M-1 repaired in the predicate sentence:** §C1 body now reads `held=8/8` / `<k>/8`
  with the supersession named (addendum items 3 and 7; the addendum now lists repairs
  1–7, so L-7 is healed too).
- **L-1 repaired honestly:** header now says "A crash or an unreadable extraction is
  exit 2 …; a malformed verdict line from the tool simply fails its check's pattern
  (a MISS, not a crash)" — matches the code.
- **Live re-checks at `f3169a67…`:** `node --check` OK; base control
  `ATTEST_UNMET held=0/8 checks=8 … version=v3` exit 1 (A4c present in the MISS list);
  bogus rev → `FAIL-CLOSED … exit=2`.
- **Residue (one line):** `plan.md:72` — the §C1 "Before (control)" line still expects
  `` `ATTEST_UNMET held=0/5` `` and should read `held=0/8` (the D51 control at
  `plan.md:103` is correct as written). Same drift class as M-1, one line, trivial.
- L-2 (mkdtemp outside try) and L-8 (unreadable priors skipped) remain open as recorded
  limits; the remaining unenumerated universals (env/secret sweep, usage-64 mapping)
  are wave-2 attack items per the parent. Concur with that disposition.

## Post-pin addendum 2 — repair 6 (`779b16e`) verified, with two pointer nits

- Plan-only change; probe bytes unchanged (`f3169a67…`). Plan now `a5c5b2840dda6a20326ddcfefe202fc825b7b2b23331c6c9aa8eeb5add081ba4`
  at HEAD `779b16e570de4bf7a19135b78f8eb96101a948f9`, tree clean. `plan.md:72-74` now
  reads `held=0/8` with the measured receipt named (`base/attest-base-v3r5.txt` — exists ✓),
  and the do-nothing-control paragraph carries the SUPERSEDED marker. My residue is closed.
- **Forger reading independently reproduced by this seat** (not taken from the parent or
  RevCounterA): `node .ufo/waves/round-51/probe/attest51-probe.mjs /tmp/forger-lane 9cb611b7761fe04081ba9d90658f17a5b65f1ebc`
  → `ATTEST51: ATTEST_UNMET held=5/8 checks=8 … version=v3 | A1 PASS | A2 PASS | A2c MISS
  run exit=64 | A3 PASS | A3c MISS run exit=64 | A4 PASS | A4c MISS run exit=64 | A5 PASS`,
  exit 1. The kill rule holds: the challenge arms stop the print-stub class (the forger
  has no `run` mode).
- **Nit 1 (LOW) — scratch-rev provenance:** `plan.md:76` cites "forger rev `9cb611b7`"
  without naming its repo. It is a commit of RevCounterA's throwaway lane
  `/tmp/forger-lane` (`RevCounterA.md:16`), not of this lane — `git archive 9cb611b7`
  in the lane FAIL-CLOSES with exit 2, and `/tmp` is ephemeral. The plan should name the
  hosting repo or rely on the committed transcripts (RevCounterA.md records v2 `held=5/5`
  — the full v2 defeat — and v3 `held=5/7`; my run above records v3r5 `held=5/8`).
- **Nit 2 (LOW) — dangling artifact pointer:** `plan.md:78` says the control reading is
  "committed at `build/ExecForgerControl/`" — that directory does not exist (the
  ExecForgerControl seat filed no report and landed no artifacts; confirmed by directory
  listing and `DistWave1/wave2-items.md:9`). The real receipts are `w1/CritC1.md`,
  `w1/RevCounterA.md`, and this addendum. Both nits are evidence-pointer hygiene; the
  substantive claims are true and now measured by this seat as well.
