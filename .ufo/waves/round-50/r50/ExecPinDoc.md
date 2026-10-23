# ExecPinDoc

## Placement and exact lines

`SCORECARD.md`'s `kumitate-gate-pins-v1` entries are in historical/insertion order, not alphabetical order. Keep the round-50 oracle pin immediately after `pin.cap-run` and before `pin.cap-spawn` (current lines 318–320):

```text
pin.cap-run=64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672
pin.bind-oracle=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5
pin.cap-spawn=1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0
```

In `scripts/proxy-check.mjs`'s `GATE_PINS`, keep the same insertion point (after `pin.cap-run`, before `pin.cap-spawn`; current line 468):

```js
  'pin.bind-oracle': 'scripts/bind-oracle.mjs', // round 50: child-side mount oracle for bind visibility
```

## Pins affected by the edits

Recompute `pin.cap-run` after the cap-run guard edit and `pin.proxy-check` in the `kumitate-proxy-v1` stanza after editing `proxy-check.mjs`. Set/add `pin.bind-oracle` from the current `scripts/bind-oracle.mjs` hash; it does not need recomputation unless that file changes. Other gate-pin values do not cover either edited file.

No `ExecBindGuardPatch.md` report was present at the expected path when checked. As instructed, these hashes are from the current lane files, not a scratch tree containing that report's diff. Current bytes already show the `/tmp` refusal in `cap-run.mjs:131-132` and the bind-oracle GATE_PINS entry at `proxy-check.mjs:468`.

Command and output:

```text
$ sha256sum scripts/cap-run.mjs scripts/proxy-check.mjs scripts/bind-oracle.mjs
64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672  scripts/cap-run.mjs
0d5c00c26950788f3ef20fc86fac6c78523438a8d75637021fe89ea4a506f929  scripts/proxy-check.mjs
c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5  scripts/bind-oracle.mjs
```

The three hashes match the current `pin.cap-run`, `pin.proxy-check`, and `pin.bind-oracle` declarations respectively. No tools were installed; no checks were run.
