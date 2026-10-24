# ExecSourceCapture — round 58, wave 1

- Axes: operability, coverage.
- Measured revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1); `git rev-parse HEAD` returned the same full hash.
- Outcome: **independently corroborated** for the assigned source-capture gate and S112/S122/S123/S124 binding checks. No defect observed.

## Gate observation

Command:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/source-capture.mjs
```

Observed stdout:

```text
SOURCE_CAPTURE: CLEAN captures=16 exemptions=107
```

Observed stderr: empty. Exit code: `0`. This matches the expected `SOURCE_CAPTURE: CLEAN` result.

## Required bindings and exact-byte checks

Independent command:

```sh
python3 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/ExecSourceCapture/03-verify-captures.py --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev 6affb9ebde37b7d663658f1959d64f0f0b68f480
```

The helper read the live registry and each live capture, independently obtained the R1 registry and blobs with read-only `git show`, and compared SHA-256 digests and byte counts. It exited `0` with empty stderr and printed:

```text
SOURCE_CAPTURE_BINDINGS: PASS required=4 live=4 revision=4 rev=6affb9ebde37b7d663658f1959d64f0f0b68f480
```

The live and R1 registry bytes were identical (SHA-256 `c80ed41f2ae9ef1cf189ff9a382da9da0e901cb9c7d1fcae3de96e8278569101`). Each required source had exactly one live and one R1 binding; each capture was a regular file. All observed live and R1 digests below equal the pinned digest, and both byte counts equal the pinned count:

- **S112** — `.ufo/waves/round-58/build/ScoutTemporalReplay/body.html`; `71398` bytes; SHA-256 `79866f9f8e3a53a1b6a5059d7d1d04e2d7d7fb9b9d86a969c6e5de645851d66b`.
- **S122** — `.ufo/waves/round-58/build/ScoutKafkaOffsets/body.html`; `268296` bytes; SHA-256 `ed0068fabe16e861a4be746dbd91db68c7fdef5742f08f6a51d3d26d209e9d41`.
- **S123** — `.ufo/waves/round-58/build/ScoutLangGraph/body.html`; `1285044` bytes; SHA-256 `7effcf4dce8f2da1715281d68afa670ddbc10a3827fa9cdada921c5f5dc09ac0`.
- **S124** — `.ufo/waves/round-58/build/ScoutFlink/body.html`; `149730` bytes; SHA-256 `1aafd5e2a7242ef7fbe1b8ce8945fa64f98e332c30af6b876e02a5189533f7d4`.

All four bindings record capture date `2026-10-24`.

## Evidence and scope

Full commands, stdout, stderr, exit codes, and the independent helper are under `.ufo/waves/round-58/build/ExecSourceCapture/`:

- `01-source-capture.{command,stdout,stderr,exit}.txt`
- `02-revision.{command,stdout,stderr,exit}.txt`
- `03-verify-captures.py` and `03-verify-captures.{command,stdout,stderr,exit}.txt`

This was a mechanical persistence/integrity check only; source content and tier judgments were not assessed. No production file, pin, Git/jj state, or other seat directory was changed; no commit, push, dispatch, or install occurred.
