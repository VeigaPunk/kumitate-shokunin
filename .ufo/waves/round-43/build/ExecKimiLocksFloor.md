RESULT ExecKimiLocksFloor rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=implemented red_before=2 live_census=CLEAN selftest=54/54 patch_sha256=47ea7eccae55edd819185331d8153f729e4f78386616b31daf65e18155c1f029

Changed file: `scripts/kimi-census.mjs` only.
Secret directories now require their floor bits, reject permissions outside their declared mode mask, and must be owned by the running uid. Metadata checks remain `lstat`-only. `oauth/` retains its documented 0755 mode through an explicit ceiling while preserving the 0700 floor.
The two added selftest cases cover `locks/` mode 0777 and a mismatched owner uid. The fixture uses the declared oauth ceiling.

Red-before, base verifier at e5ffc (the two new tests were present; implementation was unchanged):
Command in the lane clone: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node scripts/kimi-census.mjs --selftest; echo exit=$?`
`FAIL SHAPE_DRIFT: locks/ rejects group and other bits beyond its 0700 floor` — old verifier returned CLEAN, exit 0.
`FAIL SHAPE_DRIFT: locks/ owner must match the running uid` — `locksFinding=undefined`.
`KIMI_CENSUS_SELFTEST: 52/54 pass`; `VERDICT: FAIL`; `exit=1`.

Base live census at e5ffc:
Command in the lane clone: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node scripts/kimi-census.mjs; echo exit=$?`
`KIMI_CENSUS: CLEAN (members=53 checked=53 chain=8 info=4)`; `exit=0`.

Patched selftest, same bounded command:
`KIMI_CENSUS_SELFTEST: 54/54 pass`; `VERDICT: PASS`; `exit=0`.
Patched live census, same bounded command:
`KIMI_CENSUS: CLEAN (members=53 checked=53 chain=8 info=4)`; `exit=0`.

No other declared member's live verdict changed: both census outputs show K1 4/4, K2 27/27, K3 10/10, K4 9/9, and K5 3/3. The metadata check observed locks mode 700, credentials mode 700, and oauth mode 755; all had uid 1000. No `locks/` children were enumerated, and no secret contents were read.
`pgrep -af '[n]ode scripts/kimi-census.mjs'` after the runs: `no census process remains`. Selftest removes its temporary fixture tree in its `finally` block.

Patch: `/fast/scratch/hyaku/kumitate-r43/seats/ExecKimiLocksFloor/ExecKimiLocksFloor.patch`
SHA-256: `47ea7eccae55edd819185331d8153f729e4f78386616b31daf65e18155c1f029`.
Risk/limit: `locks/sessions` remains ungated; this scoped move adds no child census. LSP was unavailable in the provided tool inventory. Tools installed or updated: none. Blockers: none.