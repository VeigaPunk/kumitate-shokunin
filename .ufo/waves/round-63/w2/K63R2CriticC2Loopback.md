VERDICT: Wave 1's finding is confirmed end-to-end — the frozen C2 counter reads `TOPOLOGY63_HELD held=7/7` exit 0 on a fixture whose two cited rows (S196/S197) point only at pages served by the lane itself on `127.0.0.1`, and a supplementary pinned-host check (registry host-set + private-address resolution) closes both that loopback case and a public foreign echo host while passing the integrated revision `a9531c8`.

## Evidence

Frozen probe byte-identical to wave 1 (`sha256sum …/probe/topology63-probe.mjs` = `122fcf041a39fa42396f7e989110fb3ca5e00161b3a34436964425e68414f53b`).

Fixture F1 (`fix-loopback`, head `8576bf992194da7e41fc944d98d8529c969d0fa0`): built from `git -C <lane> archive a9531c8e617338fd16cb69c61344ef8f17711117` into a `mktemp -d` + `git init` repo (toplevel asserted before first commit, fixture identity only inside). `maker.mjs` rewrote only the S196/S197 `source:` cells to `http://127.0.0.1:18765/S196.html` / `S197.html`, wrote lane-authored captures (page body holds the entry's own quote strings), recomputed sha256/size pins in `.ufo/pins/source-captures.json`, committed. Entry, PROVINCE.md, readme-map, census all untouched archive bytes. `python3 -m http.server 18765 --bind 127.0.0.1 --directory …/www` (fabricated page copies), killed after.

```
$ node .ufo/waves/round-63/probe/topology63-probe.mjs /tmp/kumitate-r63/K63R2CriticC2Loopback/fix-loopback 8576bf992194da7e41fc944d98d8529c969d0fa0
TOPOLOGY63_HELD held=7/7 checks=7 rev=8576bf992194da7e41fc944d98d8529c969d0fa0 rule=T63
probe-exit=0
```
Server log: `GET /S196.html` 200, `GET /S197.html` 200 — the only "source" the lane ever read is its own server.

Supplementary check `host-check.mjs` (independent of the frozen probe; reads entry + `## Registry` at rev via `git show`, fails when a cited row's URL host is not among hosts of OTHER tier-A rows, or resolves to loopback/private/link-local/unique-local/unspecified, or is unresolvable):

```
$ node …/host-check.mjs …/fix-loopback 8576bf99…   # F1 — expect FAIL
HOST_CHECK: FAIL S196:host-not-in-registry(127.0.0.1);S196:private-resolves(127.0.0.1);S197:host-not-in-registry(127.0.0.1);S197:private-resolves(127.0.0.1) rev=8576bf99… ids=S196,S197 tierA-hosts=36
exit=1
$ node …/host-check.mjs …/fix-httpbin 0816d72a…    # F2 (httpbin.org echo) — expect FAIL
HOST_CHECK: FAIL S196:host-not-in-registry(httpbin.org);S197:host-not-in-registry(httpbin.org) rev=0816d72a… ids=S196,S197 tierA-hosts=36
exit=1
$ node …/host-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin a9531c8e617338fd16cb69c61344ef8f17711117   # integrated — expect PASS
HOST_CHECK: PASS rev=a9531c8e617338fd16cb69c61344ef8f17711117 ids=S196,S197 tierA-hosts=36
exit=0
```

Context runs: frozen probe on the integrated rev → `TOPOLOGY63_HELD held=7/7 … rule=T63` exit 0; on F2 → `TOPOLOGY63_UNMET held=6/7 … | T5 MISS … quote-not-live …` exit 1 (httpbin JSON `\uXXXX`-escapes CJK, so the echo does not norm-match — see Limits).

## Findings

1. **K63R2CriticC2Loopback-1 (critical) — attacker-hosted page satisfies the whole counter, confirmed.** A lane that never fetches arXiv or Bailian reads HELD 7/7: T2/T3 read the lane's registry cells and lane-computed pins, T5 live-fetches the lane-authored URL. Reproduce: `node …/build/K63R2CriticC2Loopback/maker.mjs /tmp/kumitate-r63/K63R2CriticC2Loopback/fix-loopback http://127.0.0.1:18765/S196.html http://127.0.0.1:18765/S197.html`, then `python3 -m http.server 18765 --bind 127.0.0.1 --directory <www>` + the frozen probe (verdict above). This is wave‑1 `K63ReviewProbeC2-1` / `K63CriticC2Predicate-2` independently reproduced at the integrated revision's tree.
2. **K63R2CriticC2Loopback-2 (medium) — a pinned-host rule closes both loopback and foreign public hosts; measured.** `host-check.mjs` fails F1 (loopback, both arms) and F2 (public `httpbin.org`, registry-host-set arm) and passes `a9531c8` (36 distinct tier-A hosts include `arxiv.org` and `docs.bailian.console.aliyun.com`, the latter also used by S131). So the rule is strictly stronger than a private-IP filter. Residual, [INFERENCE] untested live: a hostname-level allowlist cannot judge authority — user-content paths on hosts already in the tier-A set (`github.com` ×24, `raw.githubusercontent.com` ×8 at this rev) would still pass both the probe and this check; closing that needs path/scope granularity or a freeze-time URL list, not just host allowlisting.
3. **K63R2CriticC2Loopback-3 (low) — T5's live arm skews the attack surface but does not gate on host.** The counter's only external check re-fetches the lane-written URL; my F2 attempt (httpbin echo) shows a public echo does not even satisfy CJK quote matching (`\uXXXX` escaping), i.e. an attacker must serve norm-matchable bytes (as F1 does locally). This does not change finding 1: host-check is the cheap, addable gate.

## Artifacts

- `.ufo/waves/round-63/w2/K63R2CriticC2Loopback.md` — this report
- `.ufo/waves/round-63/build/K63R2CriticC2Loopback/` — `maker.mjs` (rerunnable fixture builder), `host-check.mjs` (supplementary check), `f1-probe-verdict.txt`, `f2-probe-verdict.txt`, `integrated-probe-verdict.txt`, `host-check-verdicts.txt`
- Scratch: `/tmp/kumitate-r63/K63R2CriticC2Loopback/` — `fix-loopback` (head 8576bf99…), `fix-httpbin` (head 0816d72a…), `www/`, `server*.log`, `f2-urls.txt`

## Limits

- No live public-host HELD demonstration: the machine cannot publish to a foreign domain; F2's httpbin echo fails T5 (CJK `\uXXXX` escaping), so the public-host arm is measured through host-check only, not through probe-HELD.
- DNS rebinding (resolver returning a private address after the registry check) not simulated; the check classifies whatever `dns.lookup` returns at run time.
- The registry-host-set arm uses the rev's own tier-A rows excluding the cited rows; earlier revs with fewer rows (e.g. pre-S131) would have a smaller set — evaluated only at the two fixture heads and at `a9531c8`.
- No tools installed/upgraded; no pacman transaction; no frozen file edited; server processes started and killed (port 18765 verified free after).
