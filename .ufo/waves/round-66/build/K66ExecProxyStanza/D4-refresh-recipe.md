# D4 — proxy stanza refresh (routed defect D4), round 66 w1

Seat: K66ExecProxyStanza. Lane tip measured: `f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed`.

## What the defect is

`node scripts/proxy-check.mjs` reads DRIFT on the lane because the
`kumitate-proxy-v1` stanza in `SCORECARD.md` was last refreshed at round 64
(`A=351`) and every round since added files. The stanza is a *claim block*: the
gate re-derives all 17 terms plus 6 pins from the tree and compares them with
the declared values. The drift is not a broken derivation — it is a stale
claim.

## The three files in `D4-proxy-stanza.patch`

1. `scripts/proxy-check.mjs` — three keys added to the `GATE_PINS` map:
   `pin.harm-matrix`, `pin.routed-ledger`, `pin.omp-binary-probe`.
   `scripts/omp-binary-probe.sh` IS pinnable: the gate's pin map is keyed by
   file path with no extension restriction (`pin.plan-before-ready` and
   `pin.jj-seat-demo` already name `.sh` files), so a `.sh` gate pins exactly
   like a `.mjs` one.
   This edit changes `scripts/proxy-check.mjs`'s own bytes, so
   `pin.proxy-check` is re-pinned in the same patch (self-reference).
2. `SCORECARD.md` — the `kumitate-proxy-v1` block refreshed (A, C2, C2_total,
   K_members, K_sections) and `pin.proxy-check` re-pinned; the
   `kumitate-gate-pins-v1` block gains the three new keys.
3. `corpus/README.md` — one row for `lessons/round-66-verifier-spotcheck.md`.
   Without it `C2_total` (162) exceeds `C2` (161) and
   `coverage = floor(10 × 19/19 × 161/162) = 9`, so the `## Axes` `coverage`
   row (10) drifts. See "the coverage question" below.

## Applying it

```
git apply D4-proxy-stanza.patch          # from the lane root
node scripts/proxy-check.mjs              # → PROXY: MATCH (…), exit 0
node scripts/proxy-check.mjs --strict     # → PROXY: MATCH (…), exit 0
```

## Refreshing it again later

`refresh-proxy-stanza.mjs` (same directory) recomputes both blocks from the
tree and rewrites them, so the next round does not repeat this hand-edit:

```
node refresh-proxy-stanza.mjs --self <lane-root> --check   # prints the diff, exit 1 if stale
node refresh-proxy-stanza.mjs --self <lane-root> --write   # rewrites the two blocks
```

It calls `scripts/proxy-check.mjs --json` and reads the gate's OWN computed
terms, so it can never disagree with the gate about the numbers. It reads the
`PINS` and `GATE_PINS` maps out of `scripts/proxy-check.mjs` rather than
hardcoding them, so a key the gate does not know cannot be written.

## The coverage question (base receipt `proxy-before.txt`)

The base receipt shows `AXES_DRIFT coverage: ## Axes row=10 derived=9`.
**This is not a K-layer artifact and not the kimi-census `MEMBER_MISSING`.**
`coverage` is `floor(10 × C1/C1_total × C2/C2_total)` — the C2 term (README
rows vs corpus notes) is the only thing in it besides C1. Measured:

* base tree `8d557f85`: C2=159, C2_total=160 → `floor(10 × 19/19 × 159/160)`
  = 9. The cause is `lessons/round-65-verifier-spotcheck.md` having no README
  row — the same D7 defect the base receipt's `readme-map-before.txt` names
  (`README_MAP: DRIFT files=160 rows=159 … first=uncovered:lessons/round-65-verifier-spotcheck.md`).
* controlled experiment (patched tree, `--kimi-root` fixture with
  `search-index/` absent): K_members 52, K_sections 52, `coverage` still
  **10**, `coverage_kimi` 10. Removing the K layer's search-index member moves
  both K terms by one together and leaves every score unchanged.
* controlled experiment (patched tree, K restored, one README row removed):
  C2=161, C2_total=162 → `coverage` 9 and `coverage_kimi` still 10, with
  `AXES_DRIFT coverage` raised.

So `coverage declared=10 computed=9` is a **real axis drop of the retired
aggregate `coverage` axis**, caused by a C2/README-map row gap, and it is
**independent of the K layer**. It is repaired by adding the README row (C2
returns to C2_total), not by touching K.

The `MEMBER_MISSING search-index/` in `scripts/kimi-census.mjs` is a separate,
real fact about the host: `~/.kimi-code/search-index` was absent when the base
receipt was taken and exists now (`drwxr-xr-x … Oct 27 03:40 search-index`).
`K_members`/`K_sections` therefore read 52 at base and 53 now. Because the K
score is `floor(10 × 5/5 × K_sections/K_members)` and both terms move
together, `coverage:kimi-layer` stays 10 either way — the ratio cannot show
this move, exactly as the lane's own round-42 note already says.
