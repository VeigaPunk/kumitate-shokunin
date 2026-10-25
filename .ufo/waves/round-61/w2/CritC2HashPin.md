# CritC2HashPin — round 61 w2

**Axis: coverage. Verdict: reproduced; D61 v1's E4 accepts a fabricated full-length digest when only its first 16 hex characters match the capture.**

## Scratch reproduction

All mutation was in `/tmp/kumitate-r61/CritC2HashPin/fleet/`; the scratch fleet used a clone of `kumitate-shokunin` and a scratch `shokunin.conf`. The frozen probe and census were invoked from their existing absolute paths. Scratch revisions included the live wave-1 build inputs so E1–E6 could be exercised; a probe-visible `|:S195:|` phantom row was appended outside `## Registry` to reach E4 despite the separate frozen row-matching defect. The row's only changed field between the positive and negative runs was its pin.

At scratch rev `0f37c3b`, the phantom row pin was `sha256 8ef2ee5f5e196d9d` followed by 48 zeroes. Actual `body.md` SHA-256 (computed with `sha256sum`) was `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`; the fabricated pin is not that digest. Exact command and output:

```text
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/probe/doctrine61-probe.mjs /tmp/kumitate-r61/CritC2HashPin/fleet/kumitate-shokunin 0f37c3b --census-root /tmp/kumitate-r61/CritC2HashPin/fleet
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=0f37c3b rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 8ef2ee5f5e196d9d0 sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=148 rows=148 covered=148
exit=0
```

Negative-prefix control at rev `43bfd22` changed only the pin to 64 `1` characters:

```text
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/probe/doctrine61-probe.mjs /tmp/kumitate-r61/CritC2HashPin/fleet/kumitate-shokunin 43bfd22 --census-root /tmp/kumitate-r61/CritC2HashPin/fleet
DOCTRINE61: DOCTRINE61_UNMET held=5/6 checks=6 rev=43bfd22 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 MISS pin=sha256 11111111111111111 sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=148 rows=148 covered=148
exit=1
```

## Finding and consequence

The frozen probe's exact E4 expression is `.ufo/waves/round-61/probe/doctrine61-probe.mjs:21`:

```js
add('E4',!!sha&&pin.includes(sha.slice(0,16)),`pin=${pin.slice(0,24)} sha=${sha.slice(0,16)}`);
```

This validates only a 16-hex substring, not digest equality. The positive/negative pair shows that the matching prefix is sufficient for E4 PASS and that a different prefix changes only E4 to MISS. **Yes: this independently makes a D61 `HELD` verdict unsound as verification of the capture pin.** It does not by itself make the honest build fail; the frozen E3/census incompatibility is a separate issue. The setup relies on the probe-visible phantom row because the frozen probe otherwise cannot reach the pin check with the honest contract row; therefore this reproduction specifically falsifies the E4 hash-pin claim, not the separate row/census behavior.
