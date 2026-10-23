# ScoutCommands — frozen r49 census + round-open gates

Axes: operability (gate exit codes), coverage (all seven CORPUS.md census predicates plus both node gates).

Attacked: the frozen manual SOURCES census in `/home/vgpnk/Projects/shokunin/CORPUS.md` lines 131–148, run from the lane root, and the two gates the seat named as round-open proxy drift and the H1 header failure (`node scripts/proxy-check.mjs --strict`, `node scripts/sources-check.mjs`). Read-only. No tools installed.

## Tree

- Lane HEAD at the resnapshot: `6927903f99bbc26e397aa47387aa76950f42b3a5` (`round-50: record wave seat assignments`). That commit touches only `.ufo/waves/round-50/r50/swarm-registry.json`.
- Parent `378b6e732a1a40ae8adfcaaa5de352cee5163cf0` (`round-50: freeze guard and closure corrections`) is the commit that changes `SCORECARD.md`, `corpus/SOURCES.md` used-by cells, `corpus/knowledge/counter-amendment-discipline.md`, `scripts/cap-run.mjs`, `scripts/proxy-check.mjs`.
- Freeze rev named by `controls/H1-freeze-5b0de268.txt`: `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3`.
- `git status --porcelain -- scripts corpus SCORECARD.md` was empty. An earlier identical census+gate run while HEAD was still `378b6e7` printed the same seven census results and the same two MATCH/CLEAN lines.

## Live lane (HEAD 6927903) — commands and outputs

cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. stderr empty on every command. Exit 0 on every command.

```
$ grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
99

$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md
0

$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {t=$5; gsub(/[[:space:]]/,"",t); n[t]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
A=85 B=6 C=8 

$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {s=$9; gsub(/[[:space:]]/,"",s); n[s]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
mined=71 queued=12 rejected=16 

$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}' corpus/SOURCES.md | sort | uniq -d
<empty>

$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF==13 {i=$2;k=$4;t=$5;s=$9; gsub(/[[:space:]]/,"",i); gsub(/[[:space:]]/,"",k); gsub(/[[:space:]]/,"",t); gsub(/[[:space:]]/,"",s); if (t !~ /^[ABC]$/) print "tier", i, t; if (s !~ /^(queued|mined|rejected)$/) print "status", i, s; if (k !~ /^(spec|docs|paper|code|tool|dataset|talk|book|community|own-work)$/) print "kind", i, k; if (t=="A" && k=="community") print "tier-inflation", i}' corpus/SOURCES.md
<empty>

$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF==13 {s=$9; gsub(/[[:space:]]/,"",s); if (s=="mined") {n=split($12, a, /[,;]/); for (j=1;j<=n;j++) {p=a[j]; gsub(/^[[:space:]]+|[[:space:]]+$/,"",p); if (p!="" && p!="—") print p}}}' corpus/SOURCES.md | while read -r p; do [ -e "$p" ] || echo "missing: $p"; done
<empty>

$ node scripts/proxy-check.mjs --strict
PROXY: MATCH (A=43 C=22 operability=9; C1=19/19 C2=112/112 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)

$ node scripts/sources-check.mjs
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: CLEAN (rows=99 tiers=A:85,B:6,C:8 status=queued:12,mined:71,rejected:16 entries_with_source=6 legacy=38)
```

Histogram lines carry the trailing space the awk `printf` emits. `<empty>` means zero stdout bytes, which is what the contract requires for duplicate ids, enum/tier-inflation, and missing mined used-by paths. Counts close: 85+6+8=99 and 71+12+16=99.

## What the seat was told those two gates would show

They do not show it on the live tree. `proxy-check --strict` is MATCH exit 0, not DRIFT. `sources-check` is CLEAN exit 0; the only non-verdict line is the advisory `LEGACY_NO_HEADER count=38`. `corpus/knowledge/counter-amendment-discipline.md:1` is now `source: S095 …; S098 …; S099 …`.

The named failures are present at the freeze revision. Reproduced by `git archive 5b0de268e5a6bdd744fe47c6ee2ee58404693ac3 | tar -x` into a scratch dir (removed after the run), same two commands, no `--src` override:

```
$ node scripts/proxy-check.mjs --strict
PROXY  error  A_DRIFT  A: declared=38 computed=43 delta=+5
PROXY  error  C2_DRIFT  C2: declared=108 computed=110 delta=+2
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=108 computed=112 delta=+4
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY  warn  PIN_UNPINNED  scripts/bind-oracle.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY: DRIFT (A_DRIFT term=A declared=38 computed=43 delta=+5; C2_DRIFT term=C2 declared=108 computed=110 delta=+2; C2_TOTAL_DRIFT term=C2_total declared=108 computed=112 delta=+4; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/bind-oracle.mjs; src-rev=31c465f15669)
exit=1

$ node scripts/sources-check.mjs
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/counter-amendment-discipline.md:1  non-legacy knowledge file lacks source: header
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)
exit=1
```

Those lines match `controls/H1-freeze-5b0de268.txt` checklist items SKILL.md:693 and :697 (the receipt prefixes each line with `  | `). The manual census at that same freeze tree is identical to HEAD: rows 99, malformed 0, `A=85 B=6 C=8 `, `mined=71 queued=12 rejected=16 `, duplicate ids empty, enum violations empty, mined used-by existence empty. The header failure is not a missing used-by path; the file exists and the manual block only tests `-e`.

## Confidence and gaps

High on the pasted bytes (two agreeing live runs; freeze archive matches the committed H1 receipt). Unresolved: awk histogram key order is hash order, so a later run can print the same counts in a different order; this run's order is what is pasted. Not run: `sources-check.mjs --strict` (the seat named the unflagged command; the H1 failure is an error, not a warning, so `--strict` would not change the ENTRY_HEADER line). Not run: `surface-probe.mjs --checklists` (that is other seats' item).
