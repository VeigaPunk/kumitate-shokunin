# CritDoNothing — K1 honesty

- Axes: operability, coverage
- Base: `c49f2a8dc1e6e5e4341e15ac279185aab7e0be37`
- Freeze: `50548ae5b4a47bb8d8cdc62212ec0648aa3776ee`
- Integration/HEAD: `6affb9ebde37b7d663658f1959d64f0f0b68f480`

## Observed conclusion

K1's substantive do-nothing requirement is independently corroborated: both counters extracted from the freeze commit read `UNMET` and exited `1` when run against the named base. The freeze tree contains both counters, both base receipts, and both scratch-HELD witnesses, and the available git history places freeze before any committed round-58 close transcript.

The stronger claim that the filed base receipts are byte-faithful raw transcripts of those frozen counters is **not corroborated**. Both differ from independent re-execution in diagnostic details, although the verdict, held count, revision, and exit code agree.

## Independent base re-execution

I extracted the counter bytes directly from freeze with `git archive`; I did not move HEAD or use a working-tree production copy. Each run used a `TMPDIR` inside this seat's build directory.

| Counter | Observed stdout prefix | Exit | Stderr |
|---|---|---:|---|
| Freeze A58 at base | `ATTEST58: ATTEST58_UNMET held=0/10 checks=10 rev=c49f2a8dc1e6e5e4341e15ac279185aab7e0be37` | 1 | empty |
| Freeze D58 at base | `DOCTRINE58: DOCTRINE58_UNMET held=2/5 checks=5 rev=c49f2a8dc1e6e5e4341e15ac279185aab7e0be37` | 1 | empty |

The R1 counter copies also produced the same UNMET readings and exit codes. `git diff 50548ae5… 6affb9eb…` was empty for both counters, so the freeze and R1 counter bytes did not change. The base tree itself has no `.ufo/waves/round-58` paths.

Full commands, separated stdout/stderr, and exit codes:

- `build/CritDoNothing/evidence/freeze-attest58-at-base.{command,stdout,stderr,exit-code}.txt`
- `build/CritDoNothing/evidence/freeze-doctrine58-at-base.{command,stdout,stderr,exit-code}.txt`
- `build/CritDoNothing/evidence/r1-attest58-at-base.{command,stdout,stderr,exit-code}.txt`
- `build/CritDoNothing/evidence/r1-doctrine58-at-base.{command,stdout,stderr,exit-code}.txt`
- `build/CritDoNothing/evidence/base-round58-tree.log`
- `build/CritDoNothing/evidence/freeze-to-r1-probe-diff.log`

## Filed-receipt fidelity caveat

Independent diffs against the receipts stored in freeze observed:

- **A58:** filed and fresh output both read `ATTEST58_UNMET held=0/10`, but fresh B10 output additionally contains `K_MEMBERS_DRIFT term=K_members declared=53 computed=52 delta=-1` and `K_SECTIONS_DRIFT term=K_sections declared=53 computed=52 delta=-1`. The filed receipt omits both terms.
- **D58:** filed and fresh output both read `DOCTRINE58_UNMET held=2/5`, but filed E3 says `S121:missing` and `S121:pin-miss`; the frozen counter's fresh E3 says `S112:rejected` and reports pin misses only for `S122`, `S123`, and `S124`.

Thus the UNMET kill readings are real and reproducible, but exact diagnostic/transcript provenance is not. Evidence: `build/CritDoNothing/evidence/attest58-filed-vs-rerun.diff` and `build/CritDoNothing/evidence/doctrine58-filed-vs-rerun.diff` (both `diff` exit `1`, meaning the files differ).

## Freeze contents and git ordering

`git ls-tree -r 50548ae5…` directly observed these blobs:

| Artifact | Freeze blob |
|---|---|
| `probe/attest58-probe.mjs` | `bd62df0506fe427fcc9aa418e50f596526e10fd2` |
| `probe/doctrine58-probe.mjs` | `8453a9fed5f585f76d1bf755180738862097a2a0` |
| `base/attest58-base.txt` | `852095a0c73217d843bdb26383a5de14e88be190` |
| `base/doctrine58-base.txt` | `be3c58c9d7a3bac2177bdd4ed1cee6174868df68` |
| `witness/scratch-held-attest58.txt` | `e0b66a240405ef4a8a7a0a6e8083eb214ac374da` |
| `witness/scratch-held-doctrine58.txt` | `e8315d4aa7ad0e96620cdaf3f975bb8a2cc5739a` |

The two freeze witness files read `ATTEST58_HELD held=10/10` and `DOCTRINE58_HELD held=5/5`, respectively, at synthetic revision `87d9efc85db0fb9dadbdc969acc8c7c89bff35b4`. This is an observation of the filed witness contents, not a fresh synthetic-post-state score.

Topology and close-order observations:

- Freeze's parent is the named base; R1's parent is freeze.
- `HEAD` is exactly R1, and `git rev-list 50548ae5b4a47bb8d8cdc62212ec0648aa3776ee..HEAD` contains only R1.
- No round-58 `close/` or `final/` path exists in the freeze or R1 trees.
- `git log --all` returned no entries for round-58 `close/`, `final/`, or `.ufo/reports/round-58`.

Accordingly, freeze predates every committed close transcript in the available history; in fact, no round-58 close transcript has been committed yet. This does not corroborate any future close result.

Evidence (paths relative to `.ufo/waves/round-58/`): `build/CritDoNothing/evidence/freeze-tree.log`, `build/CritDoNothing/evidence/revisions-and-ancestry.log`, `build/CritDoNothing/evidence/round58-git-log.log`, `build/CritDoNothing/evidence/head-and-close-absence.log`, `build/CritDoNothing/evidence/all-close-locations-git-log.log`, and `build/CritDoNothing/evidence/freeze-to-r1-evidence-diff.log`.

No tools were installed. No production file, index, commit, or jj state was changed.

Report: .ufo/waves/round-58/w1/CritDoNothing.md
