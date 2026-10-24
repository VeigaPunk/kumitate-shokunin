# (c) `SKILL.md` checklist item 23

**OLD** (`SKILL.md:709`):

```text
- [ ] Receipt-attest hermetic suite (round 51; contract `kumitate-receipt-attest-v1`; hermetic; the final line is `ATTEST_SELFTEST: PASS`) — `node scripts/receipt-attest.mjs --selftest` → exit 0 + `ATTEST_SELFTEST: PASS`
```

**NEW** (only the round/contract descriptor changes):

```text
- [ ] Receipt-attest hermetic suite (round 52; contract `kumitate-receipt-attest-v2`; hermetic; the final line is `ATTEST_SELFTEST: PASS (n/n)`) — `node scripts/receipt-attest.mjs --selftest` → exit 0 + `ATTEST_SELFTEST: PASS`
```

The command and accepted substring do not change. The frozen v2 contract specifies final line `ATTEST_SELFTEST: PASS (n/n)`, which contains the existing expected substring `ATTEST_SELFTEST: PASS`.
