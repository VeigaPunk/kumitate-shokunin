K93CriticB — counter attack (H, runtime, type strictness) + candidate spot-check; post-fix re-check PASS.

Seat dir: `.ufo/waves/round-93/K93CriticB/` (findings.md + receipts/drivers). Scratch removed.

H (held out) — no provenance, no clock:
- 60 fabricated transcripts (forged first `session` ts >= --after, mtime backdated) + 24 marker files in a scratch sessions root → frozen counter: `C93_C1: HELD agree=161/161 A=61/61 F=16/16 H=60/60 W=24/24 h_pool=60 last_wave_located=12`. H membership is author-writable; padding clears nh>=60, `os.utime(now)` suppresses members.
- `>=` is a string compare: same instant as `+00:00` excluded, `+01:00` included, `"zzz"` included. Selection is min-hash over an author-chosen path (h_pool=229 vs hmax=120 at control time → 109 real members dropped).
- Real-root feasibility (read-only): 41 transcripts started >= freeze 20:53Z, 0 non-live; 0 >= 21:40Z; 2.3 sessions/min → nh>=60 first reachable ~22:20-22:25Z. Round-93 seats started 20:55Z, below --after, so the round's own transcripts can never be H members.

Runtime clause — evadable, and false-positive on the seat form:
- 5 constructions read oracle93.py and probe93-c1.py with `RUNTIME: CLEAN findings=0`: neutral-name symlink, /proc/self/fd dirfd, chdir+relative path, worker_thread, literal-free argv-derived symlink (grep round-93|oracle93|probe93|fixtures = 0). Proofs in proof-*.json.
- A tool placed under round-93 (the seat run form) always reads VIOLATION on its own source — reproduced with shipped v1; builder's score1/score2 show it.
- execve-after-first catches a spawned child (negative control OK); readdir under round-93 is caught; execveat untraced (stated, not demonstrated).

Type strictness: only py-equal/node-distinguishing pair is textual `-0` vs `0` (diff() → []); everything else fails safe toward disagreement.

Candidate: `98a5a3a3…` had 17/300 fuzz disagreements (all `last_error`: `errorMessage:null` → null vs "", plus U+FEFF/U+0085 trim class). Reported with one-line fix; builder rewrote READY.

Post-fix re-check of `f86bde984ef8697a7351c0d7b1c78bcda0cf59d6b514d43b4b52f3d2d5829f1a`:
- recheck.py: 46 targeted + 120 randomized errorMessage cases → 0 disagreements; fuzz 300/300 agree; `isPySpace` equals Python `str.isspace()` over all 1 114 112 code points.
- Independent counter run on a byte-identical copy outside round-93: `RUNTIME: CLEAN findings=0`, `C93_C1: HELD agree=221/221 A=61/61 F=16/16 H=120/120 W=24/24 h_pool=279 last_wave_located=12 thin_fields=0` (13.2 s).
- Routed: F1 captured fall-through matches the oracle; plan is silent, so oracle is the only authority.

Clause (e) closed: candidate == READY == working tree == `7273ad2b91eff7a60372c1cdffefaeb55d60ef6889fbfecfc89e84f29c7d7bc8` (53471 B, byte-identical). My receipt scores exactly those bytes: `RUNTIME: CLEAN findings=0`, `HELD 221/221 … tool_sha256=7273ad2b…`; `--selftest` PASS 63/63. Standing condition for M: never ship one byte string and score another.

No kill event triggered by this seat; counter findings routed (H provenance/clock, runtime evasion + self-path false positive, `-0` canon asymmetry).
