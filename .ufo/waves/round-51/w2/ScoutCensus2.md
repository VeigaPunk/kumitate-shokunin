# ScoutCensus2 — sources before→before-close

Seat: ScoutCensus2 (scout). Attacked: H4 / D5 live census, the CORPUS.md frozen manual row count and tier/status histograms, and `node scripts/sources-check.mjs` (D4), then the frozen D51 counter those arms feed. No lane file edited except this report. No tool installed.

Axes: census exit (H4/D5), row-count fidelity (base vs tip), histogram integrity (sums vs row count), checker cleanliness (D4 / `SOURCES_CHECK`).

## Rev

Measured live tree and `HEAD` = `3304a56db425ea9c7cd496b426876aaedbce3949` (two w2-dispatch commits after the brief's `7d88faa`). Integration commit `a476977` is the last change to both files. Blobs are identical at `a476977`, `7d88faa733c5621da1cac174515e4a7d7d8896ea`, and `HEAD`:

- `corpus/knowledge/invocation-attestation.md` = `1781620dc7413514fc0143030d2e6f40c6dfae72`
- `corpus/SOURCES.md` = `e57e1f14d05296de12f0a976ca8ccbf40ca24ed0`

`git status --porcelain` on those two paths: empty (working tree = HEAD). Base for the before side: `c90b9de94009b938fa19a089bfaa97df20b54f86`. UTC date at measurement: `2026-10-24` (local `2026-10-23`).

Census script sha256 `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30` (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`). Checker sha256 `5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434` (`scripts/sources-check.mjs`).

## Commands and verbatim output

### 1. Census (H4 / D5) — exit 0

```
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
```

```
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
```

Exit `0`. None of the four W04 ids is S100 or S101. S095 is a pre-round row (`corpus/SOURCES.md:108`).

### 2. Frozen manual row count — 101

Cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

```
grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
```

```
101
```

Exit `0`.

### 3. Tier histogram (CORPUS.md recipe) — A=87 B=6 C=8

```
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {t=$5; gsub(/[[:space:]]/,"",t); n[t]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
```

```
A=87 B=6 C=8 
```

87+6+8 = 101.

### 4. Status histogram (CORPUS.md recipe) — mined=73 queued=12 rejected=16

```
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {s=$9; gsub(/[[:space:]]/,"",s); n[s]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
```

```
mined=73 queued=12 rejected=16 
```

73+12+16 = 101.

### 5. `sources-check` (D4, live tree) — DRIFT, exit 1

```
node scripts/sources-check.mjs
```

```
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/invocation-attestation.md:1  non-legacy knowledge file lacks source: header
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)
```

Exit `1`. That was the only `error` line; row checks (opened, recheck, used-by, rejected) did not fire.

### 6. Same recipes at base `c90b9de9` (before)

`git show c90b9de94009b938fa19a089bfaa97df20b54f86:corpus/SOURCES.md` piped into the same three recipes:

```
99
A=85 B=6 C=8 
mined=71 queued=12 rejected=16 
```

85+6+8 = 99. 71+12+16 = 99. `git show HEAD:corpus/SOURCES.md` matched the live 101 / `A=87 B=6 C=8` / `mined=73 queued=12 rejected=16`.

### Extra frozen CORPUS.md checks (live `corpus/SOURCES.md`, not in the seat sentence)

Malformed `NF!=13`: `0`. Duplicate ids: empty. Enum / tier-inflation: empty.

S100 and S101 (lines 113–114) are both `docs | A | … | mined | 2026-10-23 | 180d | corpus/knowledge/invocation-attestation.md`.

## Before → before-close

| | base `c90b9de9` | before-close `3304a56` (= `7d88faa` blobs) |
|---|---|---|
| manual rows | 99 | 101 |
| tier | A=85 B=6 C=8 | A=87 B=6 C=8 |
| status | mined=71 queued=12 rejected=16 | mined=73 queued=12 rejected=16 |
| delta | | +2 tier A, +2 mined (S100, S101 only) |

H4 census exit is 0 at before-close. The close can re-run the same command; this snapshot is not a census failure.

## Finding — `DOCTRINE_UNMET` held=2/5 (HIGH)

The row delta is clean. The integrated entry is not. Frozen counter, read-only, on `HEAD` (archive of the same blobs as `7d88faa`):

```
node .ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin HEAD
```

```
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=HEAD rule=D51 | D1 MISS trio incomplete in first 5 lines | D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1 SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS
```

Exit `1`. D3 (S100/S101 mined, used-by names the entry) and D5 (census exit 0) hold. D1, D2, D4 do not. `DOCTRINE_HELD` is false on the integration bytes. The verdict line prints the literal argument `HEAD`; resolved sha is `3304a56` above.

### D4 / D1 — header is not in the checker's or the probe's window

`scripts/sources-check.mjs:359` requires `lines[0]` to start with `source:`. Passing non-legacy entries do that on line 1 and put `verified-at:` / `recheck:` on lines 2–3 (`corpus/knowledge/agent-isolation-substrates.md`, `counter-amendment-discipline.md`, `kimi-mcp-plane.md`, `mount-order-and-bind-scope.md`, `omp-agent-root.md`, `omp-task-contract.md`, `pinned-evidence.md`). This entry's first five lines are:

```
1:# Invocation attestation — why receipts are built the way they are
2:
3:source: S100 https://man7.org/linux/man-pages/man2/clock_gettime.2.html (DESCRIPTION,
4:CLOCK_MONOTONIC paragraph; man-pages 6.19, page 2026-03-07; fetched 2026-10-24T01:59:31Z;
5:body sha256 7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69);
```

`source:` is line 3, so the checker emits `ENTRY_HEADER_REQUIRED` and `continue`s (`sources-check.mjs:360-366`) without reading the rest. `S101` starts line 6, `verified-at:` is line 9, `recheck:` is line 10. D1 (`doctrine51-probe.mjs:64-70`) joins only `split('\n').slice(0, 5)`, so S101, the getrandom URL, `verified-at:`, and `recheck:` are outside the window. That is why D1 and D4 miss together.

[INFERENCE] Moving the H1 below the trio without also collapsing `source:` / `verified-at:` / `recheck:` into the first five lines would still fail D1, and would then surface `HEADER_INCOMPLETE` (`sources-check.mjs:369-390`, trio must sit in `lines.slice(0, 5)`, ids parsed from `lines[0]` only). Not executed; no fixture was written.

### D2 — 12 clause openers, 5 same-line bindings

Probe rule (`doctrine51-probe.mjs:12-14,74-87`): a clause is a line starting with `- `, and the `receipt:<path>@sha256:<64hex>` must be on that same line; need `clauses>=12`, `bound>=12`, `hash-miss=0`. Measured: 12 openers, 5 bindings, hash-miss 0 (probe; the five hashes were not recomputed here).

Openers that carry a binding: lines 40, 42, 45, 50, 52. Openers that do not: 20, 24, 29, 35, 54, 57, 60. Two further bindings sit on indented continuation line 23 (`ReRunB49-2.txt`, `G50-ab3c64e9.txt`) and are invisible to the `- ` filter. Grep `receipt:` hits only lines 23, 40, 42, 45, 50, 52 — the seven unbound openers have no binding anywhere in the file.

## Not claimed

- H4 is green. Census W04 warnings do not change exit status.
- `ATTEST_HELD` was not scored.
- D5 still runs the live fleet script with no pin (wave-1 item 31). This seat did not stub it; the hash above is the script that returned exit 0.
- Probe `rev=HEAD` was not re-issued as the 40-hex sha. Blob identity across `a476977` / `7d88faa` / `HEAD` was checked with `git rev-parse <rev>:<path>`.

## Confidence

High on the four required measurements, the 99→101 delta, and `DOCTRINE_UNMET held=2/5` for these blobs. High on the D1/D4 line-window cause (file text + checker/probe source). Medium on "seven openers have no binding at all" only in the sense that wrapped prose was read, not that a looser paragraph scanner was run — the frozen scanner is the line scanner, and it returns bound=5.
