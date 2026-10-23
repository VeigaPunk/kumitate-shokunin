# SonicCensus — frozen SOURCES census, verbatim

Seat: SonicCensus (scout). Read-only. No lane edits. No tools installed.

Axes: operability (commands actually run, exit codes kept) and coverage (validate script plus every frozen manual check, not a subset).

Commands taken from `/home/vgpnk/Projects/shokunin/CORPUS.md` § `### Census — run from the lane root` lines 131–148 (contract v1). Manual block cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

Tree pin at the manual run (`run-at=2026-10-23T20:46:28Z`):

- `git rev-parse HEAD` → `6927903f99bbc26e397aa47387aa76950f42b3a5`
- `git diff --stat -- corpus/SOURCES.md` → empty, exit 0 (worktree `SOURCES.md` matches HEAD)
- `sha256sum corpus/SOURCES.md` → `ff196fce9104532040912db2d1890d5d19d43577d9384ea591492997c10a0d8b`
- `sha256sum /home/vgpnk/Projects/shokunin/scripts/sources-census.sh` → `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30`
- `git status --porcelain` at that instant listed only untracked `.ufo/waves/round-50/` seat files (count 12 then; more seat files appeared before a later status). None is `corpus/SOURCES.md`.

## 1. `sources-census.sh validate`

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
exit=0
```

## 2. Frozen manual block (cwd = lane root)

```
$ grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
99
exit=0
```

```
$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md
0
exit=0
```

```
$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {t=$5; gsub(/[[:space:]]/,"",t); n[t]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
A=85 B=6 C=8 
exit=0
```

```
$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {s=$9; gsub(/[[:space:]]/,"",s); n[s]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
mined=71 queued=12 rejected=16 
exit=0
```

```
$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}' corpus/SOURCES.md | sort | uniq -d
(empty stdout)
exit=0 (awk, sort, uniq all 0)
```

```
$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF==13 {i=$2;k=$4;t=$5;s=$9; gsub(/[[:space:]]/,"",i); gsub(/[[:space:]]/,"",k); gsub(/[[:space:]]/,"",t); gsub(/[[:space:]]/,"",s); if (t !~ /^[ABC]$/) print "tier", i, t; if (s !~ /^(queued|mined|rejected)$/) print "status", i, s; if (k !~ /^(spec|docs|paper|code|tool|dataset|talk|book|community|own-work)$/) print "kind", i, k; if (t=="A" && k=="community") print "tier-inflation", i}' corpus/SOURCES.md
(empty stdout)
exit=0
```

```
$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF==13 {s=$9; gsub(/[[:space:]]/,"",s); if (s=="mined") {n=split($12, a, /[,;]/); for (j=1;j<=n;j++) {p=a[j]; gsub(/^[[:space:]]+|[[:space:]]+$/,"",p); if (p!="" && p!="—") print p}}}' corpus/SOURCES.md | while read -r p; do [ -e "$p" ] || echo "missing: $p"; done
(empty stdout)
exit=0
```

Tier and status lines above keep the command's trailing space before the newline.

## Index (same bytes)

| check | stdout | exit |
|---|---|---|
| validate kumitate | 4× W04 (S034, S068, S084, S095) then `kumitate ok` | 0 |
| rows | 99 | 0 |
| malformed | 0 | 0 |
| tier | `A=85 B=6 C=8 ` | 0 |
| status | `mined=71 queued=12 rejected=16 ` | 0 |
| duplicate ids | empty | 0 |
| enum / tier-inflation | empty | 0 |
| mined used-by missing | empty | 0 |
