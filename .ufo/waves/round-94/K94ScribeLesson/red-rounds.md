# The seven red rounds that stay red — token by token (K94ScribeLesson, round 94)

Read-only spot re-run for the round-94 C1 predicate (b): rounds 12, 46, 53, 57, 61, 62, 63 keep their
BASE `COMMIT_CITED_UNRESOLVED` sets and stay red after the declared-pin rule. This file is the
token-level backing, not the frozen counter (the counter `probe/probe94-c1.mjs` is the verdict of record;
`plan.md` pins its fleet reports dir at `87de49a6`).

Revisions at the time of these reads (the fleet is live and moved between two probes seconds apart):

- lane `kumitate-shokunin` HEAD `54add172b5613e98e32d8761c2efd549e240baf2` (detached); gate bytes at HEAD =
  `09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594`, identical to the gate blob at
  round-92 M `7a8afb5f` and round-93 M `2f8475cd` (`git show <M>:scripts/round-gate.mjs | sha256sum`).
- fleet `/home/vgpnk/Projects/shokunin` HEAD `815b5acf2071a54f939b37e1e620a07147ce7e18` (token probe) and
  `a976dd52eb3c0b0c12bf6e4d8e5d44dd90fff256` (provenance re-probe).
- origin `ufo-fsd-alpha` HEAD `fb7157fcf14625be9d0b91bdd425a4b3212e4194`.

## Command and readings

```
for n in 12 46 53 57 61 62 63; do
  node <lane>/scripts/round-gate.mjs --round "$n" --repo <lane> \
    --reports-dir <fleet>/.ufo/reports --main-repo <fleet> --origin <origin>
done
```

Each run: exit 1, one citation finding. Receipts `receipts/gate-red-round-<N>.txt`.

| round | gate line (BASE) |
|---|---|
| 12 | `COMMIT_CITED_UNRESOLVED cited=5 unresolved=1 [23e476e21]` |
| 46 | `COMMIT_CITED_UNRESOLVED cited=11 unresolved=1 [7af3d978]` |
| 53 | `COMMIT_CITED_UNRESOLVED cited=7 unresolved=1 [b717dc035bf687a3039123f4c70527bd3774f510]` |
| 57 | `COMMIT_CITED_UNRESOLVED cited=17 unresolved=1 [1cd6d667e20075fd2e77e6e655bc755f95e3d940]` |
| 61 | `COMMIT_CITED_UNRESOLVED cited=13 unresolved=2 [ab902da2fa30d051455a5f3563627e2c23c3a74d 4247d2d]` |
| 62 | `COMMIT_CITED_UNRESOLVED cited=5 unresolved=1 [4247d2da937842bd6846874d548b7125b356e14c]` |
| 63 | `COMMIT_CITED_UNRESOLVED cited=17 unresolved=1 [9237a72]` |

The eight distinct tokens were probed four ways (`receipts/red-token-objects.txt`,
`receipts/red-token-nearmiss.txt`, `receipts/red-rounds-provenance.txt`):

1. object DB, **all** objects incl. unreachable — `git -C <repo> cat-file --batch-all-objects
   --batch-check='%(objectname) %(objecttype)'` and `grep '^<token>'`: 0 hits in lane (28 515 objects),
   fleet (42 416), origin (62 204).
2. commit prefix — `git -C <repo> log --all --format=%H | grep -c '^<token>'`: 0 / 0 / 0, and
   `git -C <repo> rev-parse --disambiguate=<token>` prints nothing in all three repos for all eight
   (`receipts/red-token-disambiguate.txt`).
3. near-miss (a truncation or one-hex mistype shares the token's first 5–6 hex chars): 0 commits in any
   of the three repos, for all eight tokens.
4. registry — `grep -c <token> corpus/SOURCES.md`: 0 for all eight.

The registry has 208 rows; 24 rows carry a complete 40-hex URL path segment, 10 distinct pins, and exactly
one pin-carrying row is `rejected` (S045, pin `e7f1a99f…` — that pin declares nothing). S203's
`…/commit/10bce690….patch` is not a complete segment, so it declares nothing either. None of the eight
tokens is a prefix of any of the 10 pins.

## One line per token

| round | token | what it is (provenance) | why it stays red |
|---|---|---|---|
| 12 | `23e476e21` (9 hex) | an **origin-lane commit id** dated 2026-09-24, cited for `conformance/vectors/native/judge-wave.json:1368` ("reordered code", "Owner: origin runtime lane"; fleet report line 159). Not in the probeable origin's history (no commit on 2026-09-24 in its refs; 0 objects with that prefix in 62 204 objects); the full form appears nowhere else in the lane (53 files only repeat the 9-char token). | Resolves in no probeable repo, is not a registry pin, and is not a truncation/mistype of any lane or fleet commit. Nothing in the rule can declare it. |
| 46 | `7af3d978` (8 hex) | the short of **sandbox commit B** `7af3d978d89d5b3bf71b5955d963f30b1ebafcbb`, built in round 46's control sandbox (`.ufo/waves/round-46/build/CtlC2LabelKeyed.md:4`, `B=7af3d978…`); the report cites it for the label-keyed counter reading 6/6 → 0/6 (line 83). Never a lane commit. | A synthetic sandbox commit; no object in any ODB, no registry pin. |
| 53 | `b717dc035bf687a3039123f4c70527bd3774f510` (40 hex) | "scratch repo rev" of the Q43/M5 conformant post-state witness (fleet report line 35; receipts `.ufo/waves/round-53/witness/scratch-held*.txt`, `/tmp` clone). | A scratch-clone revision, not a repo commit; no registry pin. |
| 57 | `1cd6d667e20075fd2e77e6e655bc755f95e3d940` (40 hex) | the scratch conformant post-state commit of the pre-score witness in a `/tmp` clone (fleet report line 85; `witness/`), re-run this round. | Same class as r53: scratch revision, no ODB object, no registry pin. |
| 61 | `ab902da2fa30d051455a5f3563627e2c23c3a74d` (40 hex) | the rev of the **fabrication fixture repo** `/tmp/kumitate-r61/CritControlC1/a4-full-fabrication` (`.ufo/waves/round-61/close/a2-repro-c1-fabrication.txt:1-2`, `rev=ab902da2…`); the report cites it for a falsifier that reads HELD 4/4 (line 65). | A synthetic fixture repo revision; nothing to resolve. |
| 61 | `4247d2d` (7 hex) | the short of the **forged commit** `4247d2da937842bd6846874d548b7125b356e14c`, which is `HEAD` and `refs/heads/fixture-forgery` of `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` (`git bundle list-heads`); the report calls it "the forged commit" (line 73). | A deliberately forged bundle commit — not a lane/fleet/origin object by construction. |
| 62 | `4247d2da937842bd6846874d548b7125b356e14c` (40 hex) | the same bundle's revision, named as a **bundle revision** with its size and `git bundle verify` status (line 9). | Same forged object; the r61/r62 pair is one forged bundle, cited short and full. |
| 63 | `9237a72` (7 hex) | **Q51's grounding hash** in `corpus/QUALITY.md:903`; r63's own report already lists "the Q51 grounding hash `9237a72` that resolves nowhere" (line 79). `K63R2ReviewQuality` Q52 sweep: 0 hits in `git log --all` and `git fsck --lost-found`, absent from the fleet ODB; companions `01b70bb`, `c432cc9` resolve as lane commits. | A dead citation inside a landed criterion; the lane has known it since round 63 and has not repaired Q51. |

Classes, restated: six tokens are revisions of scratch/sandbox/fixture repos (four tokens) or of a forged
bundle (two tokens — the 7-hex short and the full form of the same forged commit) — never repo commits and
never citable as such; one is an origin commit the probeable origin no longer holds; one is a dead citation
in a QUALITY criterion; none is a typo or stale short of a real lane or fleet commit. They stay red under
`COMMIT_CITED_UNRESOLVED` after round 94's declared-pin rule because the only new escape requires a
`corpus/SOURCES.md` registry pin, and a registry row is a claim written after opening the source — it cannot
be used to launder a scratch fixture or a forged commit.

## Not proposed

Adding registry rows for these tokens would make the reds green by policy, not evidence; the registry is
for sources the lane opened (CORPUS.md rule 1), and a scratch sandbox or a forged commit is not a source.
The r12 token could only become resolvable if the origin side publishes that commit in its probeable
history (owner: origin runtime lane), and Q51's `9237a72` needs a correction row in `QUALITY.md`, which is
a quality repair, not a citation exemption.
