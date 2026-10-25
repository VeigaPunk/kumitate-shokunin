# C2 bundle round-trip check

## Evidence

Ran from the lane root, without changing the lane repository:

```text
$ sha256sum .ufo/waves/round-61/controls/r61-c2-full-forgery.bundle
c5c0154010d5becc752179bee2cbf81c8fb5dc8a8bd7ed8debb2a20ec9f0526b  .ufo/waves/round-61/controls/r61-c2-full-forgery.bundle
$ git bundle verify .ufo/waves/round-61/controls/r61-c2-full-forgery.bundle
.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle is okay
The bundle contains these 6 refs:
4247d2da937842bd6846874d548b7125b356e14c refs/heads/fixture-forgery
be4a820c344d4eb2f94b999c3b5d649e76ab70f1 refs/heads/master
4247d2da937842bd6846874d548b7125b356e14c refs/heads/r61-c2-forgery
be4a820c344d4eb2f94b999c3b5d649e76ab70f1 refs/remotes/origin/HEAD
be4a820c344d4eb2f94b999c3b5d649e76ab70f1 refs/remotes/origin/master
4247d2da937842bd6846874d548b7125b356e14c HEAD
The bundle records a complete history.
The bundle uses this hash algorithm: sha1
$ git bundle list-heads .ufo/waves/round-61/controls/r61-c2-full-forgery.bundle
[the same six ref/OID pairs above]
```

The target forgery ref resolves to `4247d2da937842bd6846874d548b7125b356e14c`, matching the assigned forgery revision; the baseline refs resolve to `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`. This independently confirms bundle integrity, complete-history status, advertised refs, and the expected object IDs. Bundle identity is the pinned SHA-256 above.

## Round-trip limit and C2 implication

A full extraction/fetch round-trip requires a destination repository. The governing assignment expressly forbids creating fixture repositories or commits, so I did not initialize or modify a destination repo. Thus this check does **not** claim a successful round-trip or independently inspect the extracted tree. The existing round-61 evidence records the resulting forged revision's probe behavior: `.ufo/waves/round-61/close/a2-repro-c2-forgery.txt:1-9` reports `DOCTRINE61_HELD held=6/6` at `4247d2d`; the source attack report is `.ufo/waves/round-61/w1/CritControlC2.md:31-35`. The bundle itself verifies and names that same forged commit, but verification alone cannot establish that the behavior persists when imported into another repository.
