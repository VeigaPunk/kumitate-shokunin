# CritC2Subcase8 — inherited D61 subcase 8

## Reproduction

Scratch-only reproduction of the named arbitrary-bytes / invented-digest behavior used the frozen D61 v1 probe and the recorded scratch run in `round-61/controls/ctl-c2-critic-a1b-fabricated-capture.txt` (scratch root `/tmp/kumitate-r61/CritControlC2/`; no lane state modified). The capture was replaced with invented bytes; the attacker pinned those exact bytes' SHA-256 in the probe-shaped S195 row. The recorded invocation and result:

```
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritControlC2/fleet/kumitate-shokunin d79fc61 --census-root /tmp/kumitate-r61/CritControlC2/fleet
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=d79fc61 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 15841c50876fe839f sha=15841c50876fe839
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
exit=0
$ sources-census.sh validate --root /tmp/kumitate-r61/CritControlC2/fleet kumitate
kumitate ok /tmp/kumitate-r61/CritControlC2/fleet/kumitate-shokunin/corpus/SOURCES.md
exit=0
```

The independently recorded real capture digest is `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`; the forged capture's observed digest begins `15841c50876fe839`. Probe source confirms the mechanism: `probe/doctrine61-probe.mjs:20` hashes the mutable worktree `body.md`; line 21 accepts `pin.includes(sha.slice(0,16))`, not source-derived bytes or a rev-pinned full digest. Thus arbitrary self-consistent bytes satisfy E4.

## D61 impact

**Yes, this case independently prevents D61 from verifying the claimed source-grounded capture predicate.** E4 reports PASS for invented material with no fetch/source opening, so HELD cannot establish the claimed provenance. It is independently actionable even though the composite HELD reproduction also relies on the probe-shaped row and other defects. Evidence: receipt `round-61/controls/ctl-c2-critic-a1b-fabricated-capture.txt`; probe lines 20–21. No tools installed; no tests run.
