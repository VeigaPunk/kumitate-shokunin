# (a) `pin.receipt-attest` — blocked on v2 bytes

No v2 pin line is derivable from the observed artifacts: `.ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs` is absent, and no own scratch v2 was created. I will not label v1 or a parallel reconstruction as the delivered v2.

The current SCORECARD line is the v1 pin and must **not** be reused:

```text
pin.receipt-attest=44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
```

When the delivered artifact is present, hash its exact bytes for the requested artifact line; after staging, re-derive against the final `scripts/receipt-attest.mjs` bytes before integrating the SCORECARD pin. The dependency is recorded in `w1/ExecPinsRecipe.md`.