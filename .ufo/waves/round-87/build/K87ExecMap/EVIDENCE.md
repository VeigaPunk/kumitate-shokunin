# EVIDENCE — K87ExecMap (round 87)

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, measured tree HEAD
`25a3a75df123a59c5cf0de944a6d2f067e278f82`. Base revision
`db97929212bb61ae970b10abac3cc4cd976713ae`. Nothing committed.

Pre-patch `scripts/readme-map.mjs` (committed blob at 25a3a75d):
sha256 `fc119ab6056998fdd8205e9277c2665112af872d43acde20fca98efc986d8831`.

| artifact | sha256 |
|---|---|
| `readme-map.mjs.patch` | `3a8a9f10fb5ea0bdc9cb8a366e6a5d21c0f6d126cbaf6fb7c29c94e2a606877c` |
| `readme-map.patched.mjs` | `263d961c3f42ed3da2479c4c985edd6eadd06f7c151b97370a619ff6880b2afe` |
| `repro/repro.sh` | `b3f9fdf12297ecdd45f93612bdc8d68e6a7c516192902176f53b3b9a5e676c13` |
| `repro/repro-transcript.txt` | `0267abdffa4d741699e1f92bc7364cefc1e1e6fc724e36ea527934f89091c457` |
| `repro/byte-identical.sh` | `d87a5549c74d474e81babfa0db1ecccd149c51d12d9438028a396af1c3579814` |
| `repro/byte-identical-transcript.txt` | `72b7748d37e539bc64ecdeb6d973d6661368058085cb817e70a9c2255aa48066` |
| `repro/patch-apply-transcript.txt` | `9e5f1a9e4c27c42d1345ca76d4f352469e90acd40daa686c6fe008fa251e9678` |
| `repro/selftest-transcript.txt` | `9b4ef08c3d59514a85d0dc632c4fa1eb3821c157ed92da2689b62a296ba7fc79` |
| `repro/red-state-committed-rev.txt` | `b3a63754720f491330fa52d06f524708abe0cd9b5fda749481a93ecb5687d8d9` |
| `repro/red-state-live-tree.txt` | `b349f9c7cc131b58d0ffd84c18514916876ad78fdfd218a9aede8b14e0fdf2aa` |
| `repro/adopt-canonical-delta.txt` | `76d01ed2c052e9f3a301258c50ec8724a9923af17fb657136e00f3ac30365cc9` |
| `repro/check-exit-conflation.txt` | `eefffe1c88a1f1830ca75279f00f4258c3a19e77a8365edcc3b50f2df89c63c3` |

## Replay

All replays need a scratch root (never `/tmp` for cited evidence):

```
S=$(mktemp -d /fast/scratch/hyaku/kumitate-r87/K87ExecMap/replay.XXXX)
git clone --shared -q /home/vgpnk/Projects/shokunin/kumitate-shokunin "$S/lane"
mkdir -p "$S/apply/scripts"
git -C "$S/lane" show 25a3a75d:scripts/readme-map.mjs > "$S/apply/scripts/readme-map.mjs"
patch -p1 -d "$S/apply" < <build>/readme-map.mjs.patch
TMPDIR="$S" node "$S/apply/scripts/readme-map.mjs" --selftest        # PASS (19/19)
bash <build>/repro/repro.sh "$S" "$S/apply/scripts/readme-map.mjs.orig" "$S/apply/scripts/readme-map.mjs"
```

`repro.sh` and `byte-identical.sh` take their paths as arguments; `byte-identical.sh` also needs a
pristine clone of the lane as its fourth argument.
