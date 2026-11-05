# K91CriticA repro — extsh-gate-devalias (ROUTED, out-of-class)

- Candidate: `cand-extsh-gate.mjs` — takes the v4 readFileSync fallback because the token does not lexically
  start with `/dev/`, and blocks on the infinite char device: NO VERDICT (exit 124 at the bound).
- Positive control: descriptor discipline, fstat says character device -> FAIL-CLOSED UNRESOLVED exit 2.
- Per plan.md this input is in the NOT-claimed routed list ("a char device reachable without a
  `/dev/` spelling"): reported as a routed defect, NOT a kill.
