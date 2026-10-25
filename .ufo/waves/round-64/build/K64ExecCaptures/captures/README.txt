Captured by seat K64ExecCaptures (kumitate round 64, wave 1) on 2026-10-25 with
`curl -sSL -A 'Mozilla/5.0 (kumitate-r64)'`, so wave-1/2 seats draft from fixed bytes.

jj-technical-concurrency.html             <- https://docs.jj-vcs.dev/latest/technical/concurrency/  (HTTP/2 200, text/html; charset=UTF-8, 48988 bytes, sha256 5e2f757641748faf15df032f51e14435ddd579b13c30ab54fea0d40ce2e00bf6)
jj-working-copy.html                      <- https://docs.jj-vcs.dev/latest/working-copy/          (HTTP/2 200, text/html; charset=UTF-8, 47694 bytes, sha256 947d0c56c02f9c10b4c14e8aaa8cc3f435f7650536ab9386ef6a52f1d64ff3c7)
firefox-jujutsu.html                      <- https://firefox-source-docs.mozilla.org/contributing/jujutsu.html (HTTP/2 200, text/html; charset="utf-8", 53233 bytes, sha256 abbe47cfa45e809694b224d0db0ea7d6b00e9846b94086d077aea0604db7b3d2, Last-Modified Sat, 24 Oct 2026 08:10:33 GMT)

Stability-hardened alternates (same documents at the immutable release path; the lane's host runs
`jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`):
jj-technical-concurrency-v0.45.1.html     <- https://docs.jj-vcs.dev/v0.45.1/technical/concurrency/ (HTTP 200, 48988 bytes, sha256 5e2f7576…e2e00bf6, byte-identical to /latest/)
jj-working-copy-v0.45.1.html              <- https://docs.jj-vcs.dev/v0.45.1/working-copy/          (HTTP 200, 47168 bytes, sha256 b660365a1b951cf24973397c69763bb130971c245e57e1e8d6cf760290543c3d, /latest/ DIFFERS)

Every URL was fetched at least twice (three times for the /latest/ pair and the Firefox page) and the
sha256 was equal each time: the pages are static HTML (mkdocs-material 9.6.23 for the jj docs, Sphinx +
Read the Docs theme for Firefox Source Docs); no nonce, build timestamp or cache-busting token appears
in any body. The `last updated` string in jj-working-copy.html is prose about the operation log, not a
date. All five files are far under 1 MiB (47–53 KB).
