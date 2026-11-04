## Round 74 correction — proxy-check digest (2026-11-04, round 75; routed R74-spotcheck D1; append-only)

The round-74 SCORECARD re-pin bullet says:

> Same-commit re-pins per the row's own rule: `pin.kimi-census` `9d27bc9c…` → `73bea81c…`,
> `pin.proxy-check` `d6f8dce9…` → `25e7eccc…` (both scripts edited in the work rev).

Only its proxy-check destination digest is superseded: the landed value is **`aabf389ef768be9a8367740842cbc709ec243a6ec066c39dd15ef0658174b975`**, abbreviated `aabf389e…`, not `25e7eccc…`.

Authority: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 0d2185b3:scripts/proxy-check.mjs | sha256sum` → `aabf389ef768be9a8367740842cbc709ec243a6ec066c39dd15ef0658174b975  -`. This scribe observed the equivalent command from the lane cwd; the process exited 0 and object lookup resolved `0d2185b3df5705fda8212177924e215d72a38147` as a commit. Receipt: `.ufo/waves/round-75/build/K75ScribeLesson/proxy-pin-observed.txt` (L1 must commit it before citing it as committed evidence).

The earlier sentence and filed report are preserved as historical bytes. This correction does not change the frozen round-74 predicate, re-run a round-74 gate, or establish any round-75 admission.
