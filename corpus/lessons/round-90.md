# kumitate round 90 — lesson (receipt-bind v4, attempt 1)

Frozen at `b67fa9639ca6537b92021ea938f769ff1ed6c883` (plan, probe, controls). Integrated at the
round-90 commit that carries this file. Wave: `.ufo/waves/round-90/w1` (12 seats: 3 executor,
2 scribe, scout, connector, sentinel, reviewer, 2 critic, mutation-tester). Claim C1 operability,
capability acquisition `receipt-bind` v4: **UNMET** (kill rule fired).

## Gate

Candidates considered and their verdict:

- **Admitted — `scripts/receipt-bind.mjs` v4 (field-line prefix recognition, K89-V1).** The
  executor's candidate (`K90ExecInst/receipt-bind-v4.mjs`, sha256 `35f4f25e…cc1fce`) integrated
  byte-identically. Measured on the lane: `C90_C1: HELD held=47/47` on two runs; selftest
  `PASS held=76/76`. Admitted as instrument quality, not as the capability: the frozen kill rule
  holds (below).
- **Admitted — QUALITY Q83** (`corpus/QUALITY.md`): a field-line parser declares one prefix class
  with a positive twin and a negative twin per member. Grounded in the round-89 sentinel rows B2,
  B3, B7 (`.ufo/waves/round-89/build/K89Sentinel/attacks.txt`) and in the round-90 probe's own
  arm-count gap (four members have a duplicate arm and no single-prefix twin;
  `.ufo/waves/round-90/K90ScribeLesson/evidence/q83-source-counts.txt`).
- **Admitted — knowledge `receipt-invisible-prefix-fields.md`**, citing S260, S261 (Unicode tr44
  and PropList, mined) and S258 (BOM, already mined). S262 (realpath(3)) is queued and cited by no
  entry, so it stays queued.
- **Rejected — the scribe draft's U+200F/U+2060/U+00AD membership.** Those code points are Cf and
  outside the six-member set; no source row opened here grounds a claim about them. Reason kept;
  flip: a round that adds an arm for them and a row that grounds their class.
- **Rejected — the round-89 `file-leading BOM` as the sole prefix rule (the v2 idea, generalised).**
  Reason: arms `single-zwsp`/`single-nbsp` read it as CLEAN-required and it fails them; flip: none
  while the probe stands.
- **Rejected — the reviewer's global strip (`cand-1-global-strip`) as a v4 design.** It scores
  47/47 on the frozen probe and rewrites a mid-token `cmd=` name (`K90Reviewer.md` step 4). It is
  the failure the frozen counter cannot see, not a candidate for the lane. Flip: a probe arm that
  places an invisible code point mid-token (round 91).

Spot-check result: **to be recorded by the non-author verifier** (the L1 is the lane; the
discernment check is the closure's). Samples offered: admitted Q83 and the S260 row; rejected
global-strip construction.

## Kill rule (frozen) — fired twice

1. Reviewer candidate `cand-1-global-strip` (whole-text delete of the six code points): 47/47.
   Read `.ufo/waves/round-90/w1/K90Reviewer.md`.
2. Critic candidates `d-tmpdir-gated-prefix` and `e-round-path-gated-prefix` (prefix tolerance only
   when `TMPDIR` is an ancestor of `--dir`, or when `--dir` contains `/kumitate-r90/`): 47/47 on two
   runs each. Read `.ufo/waves/round-90/w1/K90CriticA.md`.

Verdict: **C1 UNMET — rejected-honest-stop.** No capability row enters SCORECARD. The probe is
frozen; the rule is not narrowed.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| M1 — the scorer hands the candidate its fixture identity in the path (rounds 87, 88, 89: `random-fixture`; `probe88` root with arm-named dirs; `<arm>-<nonce>` basenames) | `corpus/lessons/round-89-verifier-spotcheck.md` §2; `.ufo/waves/round-89/build/K89Review/probe-cand-probe-keyed.txt` (30/30) | none before the freeze: Q82 entered the corpus at `7a8afb5f` (`git log -S'### Q82'`), after the round-89 freeze `adfc2f55`. The round-89 pre-data control table had no name-keyed row. | round-90 probe uses per-run random fixture labels and arm-free counters; `K90ExecAudit` (`q82-audit.mjs`) scans candidate-visible paths for arm labels: `CLEAN labels=47 scanned=130 hits=0` and, as a shown-able-to-fail negative, `LEAK hits=161` (`.ufo/waves/round-90/K90ExecAudit/audit-*.txt`). |
| M2 — the invisible-prefix class was never armed: a duplicate field behind U+200B/U+FEFF reads CLEAN (K89-V1) | `.ufo/waves/round-89/build/K89Sentinel/attacks.txt` rows B2, B3, B7; first committed at `7a8afb5f`, after the freeze | none: the round-89 probe had only the file-leading `bom-rev` arm | probe90 arms `dup-feff` … `dup-nbsp` and `single-zwsp`/`single-nbsp`. Red-before: base v3 `39/47`, failing exactly those eight arms (`controls/ctl-base-v3-at-rev.txt`). Green: v4 `47/47`. |
| M3 — the probe header's no-round-token claim is false: the mandated scratch root `/fast/scratch/hyaku/kumitate-r90/…` is the `--work` path the candidate sees, and the probe sets `TMPDIR=<work>` for every call | `.ufo/waves/round-90/w1/K90CriticA.md` (constructions d, e: 47/47 on two runs) | none: `K90ExecAudit` checked arm labels in path and file names only, not the scratch root token | **not fixed in round 90** (the probe is frozen; a rule changed after data is not the claim's rule). Routed to round 91: a counter version that runs each arm under two `TMPDIR` values and two work roots with no round token, and a context-invariance control outside the frozen probe. |
| M4 — the counter cannot tell field-line scoping from a whole-text strip (no arm places an invisible code point mid-token) | `.ufo/waves/round-90/w1/K90Reviewer.md` candidate 1 (47/47) and step 4 (`cmd=scripts/legit\u200B.mjs` binds CLEAN to `scripts/legit.mjs`) | none | **not fixed in round 90** (frozen). Routed to round 91: mid-token arm with a positive twin (the same receipt without the code point binds clean) and an arm with an invisible code point in a non-field line. |
| M5 — round 89 closed with the round-gate's required record lines absent (`SCORECARD` row 89, `LOG` round-89 line, `## Planned` naming no later round) | `node scripts/round-gate.mjs --round 89` at base `7218699c` (`.ufo/waves/round-90/w1/K90Scout.md` §3) | none: the closure ran the proxy and checklists, not the round gate on the base commit | appended the row, the LOG line and the round-90 `## Planned` pointer (`SCORECARD.md`, `LOG.md`); the round-90 close runs `round-gate` on the committed tree. |

## Routed to round 91

- M3 and M4 above (counter versions, not edits to the frozen probe).
- Sentinel (base v3, not a v4 claim; `K90Sentinel.md`): A1 — an absolute in-lane spelling
  launders the judged revision through an untracked worktree symlink (MED; RD-1); A4/A5 —
  `cmd=node /dev/zero` and a FIFO instrument are unbounded in memory and time (MED; RD-2); A7/A8 —
  TOCTOU on the external instrument and on the receipt FIFO (LOW; RD-3/RD-4); A9/A10 — the
  `GIT_REPLACE_REF_BASE` and `refs/replace/` read redirect (LOW; RD-5, fix untested); DESIGN-1 —
  external instruments are any readable file, a digest oracle (A2). These remain in v4 as shipped;
  none is claimed here.
- K89-V6: `corpus/knowledge/receipt-lane-membership-and-link-binding.md` recheck quoted 64/64. A
  named correction is appended in that file and points to the measured counts.
- The sentinel's K89-V1 class (B2/B3/B7) now reads AMBIGUOUS_FIELD on the lane instrument.
- U+200F, U+2060 and U+00AD are Cf outside the v4 set; unmeasured (knowledge entry, Limits).

## Operator note

None. No L0 question was filed this round.
