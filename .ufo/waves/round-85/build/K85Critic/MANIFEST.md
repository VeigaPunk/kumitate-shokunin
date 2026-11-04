# K85Critic build manifest — round 85 C1 design attack

Freeze revision: `9db0c6b5eb9111cfc5581006ba976ca2cd112792`; base revision: `a5d3e7549501ae76dbd86a6f81c5e858f1f92446`; repair: `6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8`.
Frozen probe sha256: `6e7b1eb77988f58e7469661e5e412fb9048dda2a275dd9eec4e9acbf7a53ec94`; content-variation sha256: `08beaba332e4fddd5dc4cd72db90fd72d249cb3d1dd49218d33fd7a5787d0cb7`.
Every receipt names command, exit code and revision, plus tool/probe sha256 where applicable. The `--lane`/`--work` paths point at the deleted scratch mirror; each lane is reproduced by `--lane <build>/K85Critic/<name>` with a fresh `--work`, because the tool source is copied verbatim.

| artifact | command | exit | tool sha256 |
|---|---|---|---|
| `label-keyed/probe.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/label-keyed --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/label-keyed-probe` | 0 | `1e9176bd652d0c2c` |
| `label-keyed/cv.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/controls/content-variation.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/label-keyed --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/label-keyed-cv` | 1 | `1e9176bd652d0c2c` |
| `content-keyed/probe.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/content-keyed --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/content-keyed-probe` | 0 | `ea5f3ac2e8dc6fa3` |
| `content-keyed/cv.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/controls/content-variation.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/content-keyed --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/content-keyed-cv` | 0 | `ea5f3ac2e8dc6fa3` |
| `line-lenient/probe.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/line-lenient --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/line-lenient-probe` | 0 | `391b1da2486793e3` |
| `no-reader-smart/probe.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/no-reader-smart --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/no-reader-smart-probe` | 1 | `9ada2d20a97e308f` |
| `repro/base-probe.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/base --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/p-base` | 1 | `` |
| `repro/cv-base.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/controls/content-variation.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/base --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/cv-base` | 1 | `` |
| `repro/stub-probe.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/stub --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/p-stub` | 1 | `` |
| `repro/cv-stub.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/controls/content-variation.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/stub --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/cv-stub` | 1 | `` |
| `repro/noreader-probe.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/noreader --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/p-noreader` | 1 | `` |
| `repro/cv-noreader.txt` | `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/controls/content-variation.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/noreader --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/cv-noreader` | 1 | `` |
| `realtask/base-five.txt` | `five runs, see file` | 1,0,0,2,2 | `190a4c1f893a5ffc` |
| `support/base-selftest.txt` | `node /fast/scratch/hyaku/kumitate-r85/K85Critic/base/scripts/counter-receipt.mjs --selftest --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/base-selftest` | 0 | `190a4c1f893a5ffc` |

Scratch root `/fast/scratch/hyaku/kumitate-r85/K85Critic` is deleted after these durable copies.

## Additional receipts

- `line-lenient/direct-output.txt` — revision `9db0c6b5eb9111cfc5581006ba976ca2cd112792`; command `node /fast/scratch/hyaku/kumitate-r85/K85Critic/line-lenient/scripts/counter-receipt.mjs --receipt /fast/scratch/hyaku/kumitate-r85/K85Critic/work/lenient/src-bound-clean.txt --src /fast/scratch/hyaku/kumitate-r85/K85Critic/work/lenient/source.mjs`; exit 0; tool sha256 `391b1da2486793e3725663b6ea0adf2c74da1037515a7f2fdeaa71cd2581d237`. Prints a 4th line `EXTRA-LINE-NOT-CHECKED` after `SOURCE:`; the frozen probe still scores 20/20.
- `content-keyed-single-strip/probe.txt` — revision `9db0c6b5eb9111cfc5581006ba976ca2cd112792`; command `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs --lane /fast/scratch/hyaku/kumitate-r85/K85Critic/content-keyed-single-strip --work /fast/scratch/hyaku/kumitate-r85/K85Critic/gen-work/p-ck-single`; exit 1; tool sha256 `1eef2dd21650664c200a00abfe25c49f793b5ca4cf3d7d44c0417d58a7f7a3e4`; probe sha256 `6e7b1eb77988f58e7469661e5e412fb9048dda2a275dd9eec4e9acbf7a53ec94`. Scored 19/20 with `clean` red (the `clean` fixture carries two nonce lines; expected `bytes=95`).
