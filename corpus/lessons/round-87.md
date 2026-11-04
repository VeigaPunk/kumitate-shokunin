# Round 87 — a receipt must name the instrument it measured, and the predicate must be able to see it

Lane kumitate, 2026-11-04, Linux run-15 host. Base `db97929212bb61ae970b10abac3cc4cd976713ae`;
freeze `25a3a75df123a59c5cf0de944a6d2f067e278f82` (plan, frozen 12-arm probe, four pre-data controls,
base census). One claim: C1 operability, capability acquisition `receipt-bind`. Paths beginning
`open/`, `controls/`, `build/`, `w1/` or `close/` resolve beneath `.ufo/waves/round-87/`.

## Method

Round 86's close runner hashed one script for every case inside its per-case loop
(`.ufo/waves/round-86/run-close.mjs:24`), so nine of its ten committed close receipts named an
instrument they never invoked. The round's claim was that the lane can bind a receipt to the
instrument its own `cmd=` names, at a judged revision — measured by a frozen 12-arm scorer
(`probe/probe87-c1.mjs`) that executes a candidate over the committed round-86 receipts (which must
read `DRIFT matched=1 mismatched=9 unchecked=0`), over the round-87 receipts (which must bind),
over four same-directory fixtures whose filenames do not change, and over a receipt generated at
run time from lane bytes. Four controls were scored before any data: base 0/12, constant-CLEAN
0/12, constant-DRIFT 1/12, path-keyed 3/12 (`controls/*.txt`).

The instrument `scripts/receipt-bind.mjs` (contract `kumitate-receipt-bind-v1`) landed with a
39-case hermetic selftest; the round-87 close receipts were emitted by a v2 runner that derives
the subject per case. The integrated bytes read `C87_C1: HELD held=12/12` at M.

**The claim is UNMET.** The frozen kill rule says a seat-constructed control that reaches 12/12
scores like a control in `controls/`; the critic's construction `cand-a-worktree` — identical to
the contract except that it hashes the worktree file instead of `git show <rev>:<path>` — reached
12/12 (`build/K87Critic/transcript-cand-a-worktree.txt`). The twelve arms therefore do not
discriminate revision binding from worktree binding, and under the round-84/85 precedent the
acquisition takes no credit. This is reported as a rejected-honest-stop, not as a pass: the
instrument, its gate row, its checklist item, the pin, the census and the repairs land as code and
history; the capability row does not enter the repertoire table.

## Gate

Sources opened by the L1 on 2026-11-04; every quote is at most 25 words and every capture is
committed under `open/`.

- **Admit — S250, mined, A, criterion Q80.** *in-toto attestation Statement layer specification*,
  https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md, section “Statement layer
  specification”. Located quote: “binding it to a particular subject and unambiguously identifying
  the types of the Predicate”. The same section requires each `subject` element to carry `digest`.
  Capture `open/intoto-statement.md`, sha256 `cbe684a18b812b8b613d9202eb43b2ea24477f91a2ad6ca5be935185a455ebea`.
- **Reject — S251, rejected, B, criterion Q80.** *Sigstore cosign — Verifying Signatures*,
  https://docs.sigstore.dev/cosign/verifying/verify/, section “Verifying Signatures”, Important
  Note block. Located quote: “Signature payloads created by `cosign` included the digest of the
  container image they are attached to”. It grounds artifact-to-signature binding, not a statement
  about the instrument that produced a measurement. Flip: a normative statement that a verification
  receipt records the verifier binary and its digest. Capture `open/cosign-verify.html`, sha256
  `cddc158241a16c414589b05f77674d24902660e61c722f9630414c16a753e298`.
- Registry changes: S250 added (`mined`, `used-by` `corpus/knowledge/receipt-subject-binding.md`),
  S251 added (`rejected`). No existing row's `status`, `recheck` or `used-by` changed this round.
- `scripts/sources-census.sh validate --root … kumitate` → exit 0 at round end (see the report).
- Non-author agree/disagree judgment on these two decisions is the closure integrator's, not
  self-attested here.

Assimilation: **none**. The package `/home/vgpnk/Projects/shokuknow/merge/kumitate` was not
adopted this round; the round's one claim and its routed-defect repairs filled the cap, and no
package entry was re-grounded. The latest operator proposals (`considerthese/2026-10-26.md`) were
re-checked: ideas 1/2/3/4/6 already have Q75/Q76/Q68/Q69/Q72 implementations and idea 5 (non-author
spot-check formatting) is outside this lane's authority. No still-unimplemented proposal is
represented as implemented.

## Mistakes

| class | evidence | captured-by | fix and shown-able-to-fail boundary |
|---|---|---|---|
| attribution | R86-D1: `.ufo/waves/round-86/run-close.mjs:24` computes `sha256(scripts/counter-receipt.mjs)` inside the per-case loop, so 9 of the 10 round-86 close receipts name a subject they never invoked (`open/census-toolbind.txt`: receipts=239 bound=1 mismatch=9 no_cmd=229, i.e. 225 receipts with neither field plus 4 round-85 receipts with `cmd=` only) | Q79 (a receipt names the instrument it executed) plus PROTOCOL's revision-bound-evidence rule; neither was enforced by a gate | `scripts/receipt-bind.mjs` re-derives the pair from the receipt's own `cmd=`; shown able to fail: the round-86 bytes read `DRIFT matched=1 mismatched=9 unchecked=0` and a same-filename fixture flips to `mismatched=1` (arms `detect-r86`, `flip-cmd`, `flip-hash` of the frozen probe) |
| landing | the round-86 non-author spot-check again landed without its `corpus/README.md` map row (the frozen plan calls it the fourth recurrence in this series); `spotcheck-adopt --check` read `uncovered=1` at round open | Q80's predecessor (the map gate) reports the state but nothing forced adoption before the next freeze | adopted in-round through `scripts/spotcheck-adopt.mjs --lane . --adopt corpus/lessons/round-86-verifier-spotcheck.md` → `wrote=both`, `README_MAP: CLEAN files=220 rows=220 covered=220`; shown able to fail: `--check` read `DRIFT uncovered=1` immediately before the adoption |
| survivor | the frozen 12 arms cannot see a worktree-vs-revision hash substitution: `build/K87Critic/cand-a-worktree.mjs` reaches 12/12 while binding the wrong byte source | the frozen kill rule (a seat-constructed control reaching the target scores like a committed control) | disclosed as the reason C1 is UNMET; the fix is a v2 arm that makes the worktree and the judged revision differ (pre-registered for round 88), never a post-data edit of the frozen probe |
| number-drift | the plan's own count of "four same-directory fixtures" is right, but the arm table's `clean-r87` arm also requires `matched>=8`, a threshold that the seat fixtures satisfy only because the close runner emits 12 cases — a future close with fewer than 8 receipts would read `no-r87-close` instead of a clean miss | the L1's post-data re-read of `probe/probe87-c1.mjs:112` | recorded here as a descriptive limit of the frozen arm; the arm is not edited and the count is not restated as a claim |
| number-drift | the frozen plan and this round's first knowledge draft said "229 receipts carry neither `cmd=` nor `tool_sha256=`"; measured, 229 is the census bucket `no_cmd=229` = 225 with neither field + 4 round-85 receipts with `cmd=` only (`grep -L '^cmd=' .ufo/waves/round-{74..86}/close/*.txt` → 225; the four are `c1-probe.txt`, `content-variation.txt`, `history-v2.txt`, `selftest.txt`) | the scribe seat's field-state census (`build/K87ScribeLesson/census-field-states.txt`), reported to the L1 before integration; the bucket label was read as a field count | corrected in `corpus/knowledge/receipt-subject-binding.md`, `corpus/QUALITY.md` Q80 and this lesson; the frozen plan keeps its bytes and the correction is recorded here. Shown able to fail: the two statements disagree on the same committed file set |
| reference-drift | the frozen plan and the first knowledge draft cited `.ufo/waves/round-86/run-close.mjs:20` for the digest; line 20 is the `plan` case entry and the digest is line 24 | the scribe seat re-opened the file at `19b4e440`; the L1 had cited the line from the plan instead of the source | corrected in the knowledge entry and Q80; the plan's frozen prose stays as history. Shown able to fail: `git show 19b4e440:.ufo/waves/round-86/run-close.mjs` prints `['plan', …]` at line 20 |
| provider | one seat (`K87ExecSources`) reported no artifact before the wave settled, and the sentinel reviewed the L1 reference because the executor's candidate did not exist at its start time | the wave's tranche spawning under a shared 60-seat fleet cap | disclosed in the report with each seat's last status; no dead seat is credited |

## Frontier

The `receipt-bind` surface enters the operability repertoire as a *landed instrument without a
capability row* (the claim is UNMET). Round 88 pre-registration carries: a v2 predicate arm that
makes the worktree differ from the judged revision; the sentinel's open items on the reference
(unbounded receipt read, duplicate-`cmd=` precedence, symlinked receipt directory) re-checked
against the integrated bytes; and the three recon candidates the scout opened this round.

## Limits

- The 229 historical receipts without `cmd=` stay unbound; no round may claim otherwise.
- An instrument outside the lane cannot be revision-bound; it is counted `external=` and its
  receipt binds today's bytes only.
- A digest match is identity, never correctness.
- The claim's predicate is under-powered (see `survivor` above); the instrument is stronger than
  its scorer, and the report says so rather than crediting the claim.
