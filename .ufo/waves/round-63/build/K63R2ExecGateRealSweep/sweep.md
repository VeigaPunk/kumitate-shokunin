# Final gate real-host sweep

Worktree mode, default sessions root and dispatcher log. Frozen comparator: controls/inline-real-hosts.txt.

| Wave | Frozen verdict | New verdict | Exit | Classification |
|---|---|---|---:|---|
| `kaidoku-shokunin r35 w1` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=64 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=64 dead=0)` | 1 | unchanged |
| `kasegi-shokunin r28 wave1` | `INLINE_DISPATCH: DRIFT (seats=69 sessions=0 done=0 reports=69 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=69 sessions=0 done=0 reports=69 dead=0)` | 1 | unchanged |
| `kasegi-shokunin r29 wave1` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=61 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=61 dead=0)` | 1 | unchanged |
| `kengaku-shokunin r33 build` | `INLINE_DISPATCH: DRIFT (seats=36 sessions=0 done=0 reports=36 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=36 sessions=0 done=0 reports=36 dead=0)` | 1 | unchanged |
| `kengaku-shokunin r34 build` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=62 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=62 dead=0)` | 1 | unchanged |
| `kengaku-shokunin r35 build` | `INLINE_DISPATCH: CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)` | `INLINE_DISPATCH: CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)` | 0 | unchanged |
| `kengaku-shokunin r35 falsify` | `INLINE_DISPATCH: CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)` | `INLINE_DISPATCH: CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)` | 0 | unchanged |
| `mado-shokunin r39 w1` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=60 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=60 dead=0)` | 1 | unchanged |
| `mori-shokunin r47 w1` | `INLINE_DISPATCH: DRIFT (seats=42 sessions=42 done=42 reports=41 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=42 sessions=42 done=42 reports=41 dead=0)` | 1 | unchanged |
| `mori-shokunin r47 w2` | `INLINE_DISPATCH: CLEAN (seats=37 sessions=37 done=37 reports=37 dead=0)` | `INLINE_DISPATCH: CLEAN (seats=37 sessions=37 done=37 reports=37 dead=0)` | 0 | unchanged |
| `souji-shokunin r26 w1` | `INLINE_DISPATCH: DRIFT (seats=87 sessions=0 done=0 reports=87 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=87 sessions=0 done=0 reports=87 dead=0)` | 1 | unchanged |
| `souji-shokunin r27 w1` | `INLINE_DISPATCH: DRIFT (seats=79 sessions=0 done=0 reports=78 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=79 sessions=0 done=0 reports=78 dead=0)` | 1 | unchanged |
| `souji-shokunin r28 w1` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=58 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=58 dead=0)` | 1 | unchanged |
| `tabi-shokunin r27 w1` | `INLINE_DISPATCH: DRIFT (seats=32 sessions=0 done=0 reports=32 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=32 sessions=0 done=0 reports=32 dead=0)` | 1 | unchanged |
| `tabi-shokunin r28 w1` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=62 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=62 dead=0)` | 1 | unchanged |
| `tameshi-shokunin r45 w1` | `INLINE_DISPATCH: DRIFT (seats=45 sessions=45 done=45 reports=45 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=45 sessions=45 done=45 reports=45 dead=0)` | 1 | unchanged |
| `tameshi-shokunin r45 w2` | `INLINE_DISPATCH: DRIFT (seats=36 sessions=35 done=35 reports=35 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=36 sessions=35 done=35 reports=35 dead=0)` | 1 | unchanged |
| `tsukuroi-shokunin r37 w1` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=61 dead=0)` | `INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=61 dead=0)` | 1 | unchanged |

Diff command: `diff /tmp/kumitate-r63/K63R2ExecGateRealSweep/frozen-verdicts.txt /tmp/kumitate-r63/K63R2ExecGateRealSweep/new-verdicts.txt` → `IDENTICAL: 18/18 lines unchanged`.
