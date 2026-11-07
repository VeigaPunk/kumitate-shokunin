# K94CriticA — frozen-counter forgeries (round 94, claim C1)

Target: the frozen counter `.ufo/waves/round-94/probe/probe94-c1.mjs` (freeze `73317eca`,
base round-gate sha256 `09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594`).
Question: can a wrong-but-plausible gate reach `C94_C1: HELD`?

Run form (every receipt below is one run):

    TMPDIR=<scratch> node .ufo/waves/round-94/probe/probe94-c1.mjs \
      --tool .ufo/waves/round-94/K94CriticA/constructions/<name>.mjs \
      --work <scratch>/work/<name> --freeze 73317eca18c3927fc3c92fe492cd882dc4cda953

Generator: `make-forgeries.py` (patches the BASE bytes; anchor counts asserted; base hash asserted).
Constructions + `cap-spawn.mjs`/`cap-run.mjs` live in `constructions/`; full stdout per run in
`receipts/<name>.txt`. Registry-gap evidence in `receipts/registry-gaps.txt`.

Frozen rule (plan §C1): a token that resolves nowhere is `declared` iff it is a prefix of a 40-hex
string that is a complete path segment (URL split on `/`, `?`, `#`) of an `http(s)://` URL on a
`corpus/SOURCES.md` registry row (`^ {0,3}\|\s*S\d{3,}\s*\|`) whose status cell (8th column) is not
`rejected`.

## Verdicts

| # | construction (sha256 prefix) | rule clause violated | counter verdict | finding |
|---|---|---|---|---|
| 1 | `w-len8` ef6b9ac0 — declares only tokens of length >= 8 | token floor is 7 (`[0-9a-f]{7,40}`); any prefix length counts | **HELD** a=1 b=7/7 c=77/77 d=2/2 e=1 | **COUNTER** |
| 2 | `w-minedonly` dcf656d2 — status cell must equal `mined` | "status cell is not `rejected`" ⇒ `queued` (14 rows) counts; S036 is `queued` with URL pin `140f2119…` | **HELD** a=1 b=7/7 c=77/77 d=2/2 e=1 | **COUNTER** |
| 3 | `w-nosplit-q` ea00ce63 — split URL on `/` and `#` only | rule names `?` (e.g. `/blob/<pin>?plain=1`) | **HELD** a=1 b=7/7 c=77/77 d=2/2 e=1 | **COUNTER** |
| 4 | `w-col0` ad2862e4 — row regex `^\|`, no leading-space allowance | `^ {0,3}\|` (1–3 spaces allowed) | **HELD** a=1 b=7/7 c=77/77 d=2/2 e=1 | **COUNTER** |
| 5 | `w-linescan-rejected` 7021b525 — drop a row if `rejected` occurs anywhere on it | status is the 8th **cell**, not the whole row (S112 is `mined` and says "REJECTED" in its anchor/teaches) | **HELD** a=1 b=7/7 c=77/77 d=2/2 e=1 | **COUNTER** |
| 6 | `w-extra-declared` 2a2b189f — correct rule + pushes `deadbeef` into `declared` on round 93 | `declared` is defined only for tokens that resolve nowhere and match the registry; (a) only checks membership | **HELD** a=1 b=7/7 c=77/77 d=2/2 e=1 | **predicate (a) looseness** |
| 7 | `w-thin512` f26e8930 — correct rule + `REPORT_MIN_BYTES 1024→512` | unrelated check weakened (C1 changes none of it) | **HELD** a=1 b=7/7 c=77/77 d=2/2 e=1 | **(c)/(e) blind spot** |
| 8 | `w-hardcode` 02260b29 — declares only the two r93 pin strings | no registry read at all | UNMET a=1 b=7/7 c=77/77 **d=1/2** e=1 | separated (fixture) |
| 9 | `w-round93` 8b4eb094 — declares every unresolved token when round == 93 | registry requirement | UNMET a=1 b=7/7 c=77/77 **d=1/2** e=1 | separated (fixture) |
| 10 | `w-mainrepo` 04cea912 — reads SOURCES from `--main-repo`, not `--repo` | `corpus/SOURCES.md` of the audited repo | UNMET **a=0/1** b=7/7 c=77/77 d=2/2 e=1 | separated (a) |
| 11 | `w-nonhttp` c98b1caa — any 40-hex on the row, no `http(s)` requirement | `http(s)://` URL path segment | UNMET a=1 b=7/7 c=77/77 **d=1/2** e=1 | separated (fixture) |
| 12 | `w-unrelated-plan-warning` d3d0c6b0 — correct rule + `SCORECARD_PLAN_MISSING` forced ok=true | unrelated check weakened | UNMET a=1 b=7/7 **c=77/77** d=2/2 **e=0/1** (selftest 56/61) | (c) blind, (e) catches |

`fails=none` is printed on rows 8, 9, 11 even though (a)/(d) failed: the `fails` list only records
(b)/(c) mismatches. Not a verdict defect (the `C94_C1` line carries a/b/c/d/e), noted for readers.

## Why each HELD construction is a forgery

1. **w-len8** — `citationTokens` admits 7-char tokens, but the fixture's shortest token is `url8`
   (8 chars) and the only 7-char tokens in the filed corpus (r61 `4247d2d`, r63 `9237a72`) are not in
   the registry. So a gate that refuses 7-char prefixes loses nothing on any tested input while
   violating the rule (a report citing `79fa222` would stay red). Correction: add
   `url7: PIN.A.slice(0, 7)` to `EXP_DECL` in the fixture.

2. **w-minedonly** — the registry has 14 `queued` rows, one of them with a URL pin:
   `| S036 | … https://raw.githubusercontent.com/stryker-mutator/mutation-testing-elements/140f2119…/packages/…json |`
   (`receipts/registry-gaps.txt`). No filed report cites `140f2119` today, so no live vector moves —
   but the rule says a `queued` (non-rejected) row declares, and this gate does not. This is the
   strongest forgery: the difference is live registry data, not a synthetic corner. Correction: add a
   fixture row with status `queued` (e.g. S005, `.../blob/${PIN.F}/q.ts`) and `PIN.F.slice(0,8)` to
   `EXP_DECL`.

3. **w-nosplit-q** — the registry has 17 URLs containing `?` but zero with a 40-hex segment adjacent
   to `?` (`receipts/registry-gaps.txt`), and the fixture puts its pin before `/x.ts` (S001) or behind
   `#diff-1` (S002) — nothing behind `?`. A gate without `?` splitting therefore matches on every
   tested input. Correction: fixture row `.../blob/${PIN.G}/z.ts?plain=1` declaring `PIN.G.slice(0,8)`.

4. **w-col0** — zero indented registry rows in the lane and in the fixture (`receipts/registry-gaps.txt`).
   Correction: indent one fixture registry row by 2 spaces (`  | S006 | … |`) and declare its pin.

5. **w-linescan-rejected** — S112 is `mined` and contains "REJECTED" outside the status cell; only the
   fact that S112's URL carries no pin keeps the difference latent. Correction: a fixture row whose
   teaches cell says "rejected" while status is `mined`, with its pin declared.

6. **w-extra-declared** — (a) is `FIX_TOKENS.every((t) => decl(c.j).includes(t))` (probe line ~146),
   i.e. a lower bound; `declared` on round 93 is not compared to an exact set anywhere ((c) checks
   `declared` only off round 93). A gate that adds a bogus 7-hex token to round 93's `declared` still
   HELDs. Correction: `setEq(decl(c.j), FIX_TOKENS)` in (a).

7. **w-thin512** — the 77 filed reports are 122 B (round 7) or >= 2256 B, so any threshold in
   (122, 2256] yields identical (c) vectors; the selftest thin fixture is far below 512 B, so (e)
   still reports 61/61. The candidate demonstrably weakens `REPORT_THIN` 8× and the counter cannot
   see it. This is the answer to "could a candidate that changes an unrelated check pass (c)?": yes,
   whenever the change is invisible on the 77-round corpus **and** on the selftest fixtures. (Row 12
   shows (c) alone is also blind to `SCORECARD_PLAN_MISSING`; (e) happened to catch that one.)
   Correction (predicate cannot be edited — route): add one fixture asserting an unrelated check that
   is false at BASE, e.g. a 1023-byte report (`REPORT_THIN` false at the contract floor) and a
   SCORECARD without `## Planned` (`SCORECARD_PLAN_MISSING` false), and require the candidate's
   `(id, ok)` for those ids to equal BASE.

## Not findings (separations that worked)

`w-hardcode` and `w-round93` die on (d): the fixture's `declared` is exactly `{url8, full,
commitfrag}`, so any rule that does not read `--repo`'s registry declares nothing there. `w-mainrepo`
dies on (a): the fleet root has no `corpus/`, so round 93 declares nothing. `w-nonhttp` dies on (d):
the fixture's sha256 `digest` token is a prefix of a 64-hex run, and a gate without the `http(s)` /
path-segment restriction declares it.

## Scope

These constructions do not change the frozen verdict: at the integration commit the counter still
prints what it prints. Rows 1–5 are counter-coverage findings (rule clauses the frozen fixture does
not exercise; row 2 is live registry data). Row 6 is an (a)-clause looseness. Row 7 is a (c)/(e)
coverage limit. All are routed; none edits `plan.md`, the probe, the controls, or the lane.
