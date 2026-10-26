#!/usr/bin/env bash
# arms.sh — negative control for the round-65 C2 host instrument `scripts/omp-binary-probe.sh`.
#
# Replays every failure arm of the probe by overriding exactly the environment the probe reads
# (OMP_BIN_WRAPPER, OMP_BIN_REAL, OMP_BIN_TIMEOUT, PATH, HOME) and prints PASS/FAIL per arm.
#
#   PASS = TARGET (default omp-binary-probe.v2.sh) keeps the contract on that arm:
#            exit 0 with all 15 `OMP_BIN:` keys and final `OMP_BIN_PROBE: DONE omp=<x.y.z>`, or
#            exit 2 with `OMP_BIN_PROBE: FAIL-CLOSED <reason>` as its only line and no `OMP_BIN:` keys;
#          plus the arm's expected exit class and reason.
#   The ORIG column replays the frozen pre-round-65 script (work/omp-binary-probe.v1.sh) as the negative control:
#   where it prints partial keys, exits 1, hangs, or reports a fake measurement, that is the defect the arm exists
#   for. ORIG is not judged.
#
# Usage: bash arms.sh            (TARGET=… ORIG=… override the two scripts; SCRATCH=… the scratch dir)
# Writes arms-table.txt next to this script and exits 0 only when every arm passes (SKIP is not PASS).
set -u
export LC_ALL=C

HERE=$(cd -- "$(dirname -- "$0")" && pwd)
SEAT=K65ExecOmpRobust
TARGET=${TARGET:-$HERE/omp-binary-probe.v2.sh}
ORIG=${ORIG:-$HERE/work/omp-binary-probe.v1.sh}
SCRATCH=${SCRATCH:-/tmp/kumitate-r65/$SEAT/arms}
FREEZE=$HERE/../../base/omp-binary-probe-freeze.txt
BASH_BIN=$(type -P bash)
TABLE=$HERE/arms-table.txt

EXPECT_KEYS='collab_hosts_literal,docs_phrase_never_replayed,header_MCP-Protocol-Version,lit_2025_03_26,lit_2025_11_25,lit_2026_07_28,real_bytes,real_is_elf,real_version,sym_DeferredMCPTool,sym_MCP_PROTOCOL_VERSION,wrapper_is_script,wrapper_max_restarts,wrapper_names_real,wrapper_restart_codes,'

rm -rf -- "$SCRATCH"
mkdir -p -- "$SCRATCH/bin" "$SCRATCH/dir-wrapper" "$SCRATCH/real-is-dir" "$SCRATCH/sp ace"

FAILS=0; SKIPS=0; ROWS=0
: > "$TABLE"
row() { printf '%s\n' "$1" >> "$TABLE"; ROWS=$((ROWS+1)); }

# ---- fixtures ------------------------------------------------------------------------------------------
GOOD_WRAPPER=$SCRATCH/good-wrapper
printf '%s\n' '#!/usr/bin/env bash' \
  'BIN="${OMP_REAL:-$HOME/.local/bin/omp.real}"' \
  'case $1 in 132|133|134|135|136|137|138|139) ;; esac' \
  'crashes=0; if [ "$crashes" -gt 5 ]; then exit 1; fi' \
  'exec "$BIN" "$@"' > "$GOOD_WRAPPER"
chmod +x "$GOOD_WRAPPER"

NOBIN_WRAPPER=$SCRATCH/nobin-wrapper
printf '%s\n' '#!/usr/bin/env bash' \
  'exec "${OMP_REAL:?}" "$@"' > "$NOBIN_WRAPPER"
chmod +x "$NOBIN_WRAPPER"

UNREADABLE_WRAPPER=$SCRATCH/unreadable-wrapper
cp -- "$GOOD_WRAPPER" "$UNREADABLE_WRAPPER"
chmod 000 "$UNREADABLE_WRAPPER"

ln -s loop "$SCRATCH/wrapper-loop" 2>/dev/null || true

for u in grep wc tr awk head; do
  p=$(type -P "$u") || p=''
  [ -n "$p" ] && ln -s "$p" "$SCRATCH/bin/$u"
done
mkdir -p -- "$SCRATCH/bin-no-sed"
for u in grep wc tr awk head timeout; do
  p=$(type -P "$u") || p=''
  [ -n "$p" ] && ln -s "$p" "$SCRATCH/bin-no-sed/$u"
done

TEXT_REAL=$SCRATCH/text-real
printf '%s\n' '#!/bin/sh' 'echo omp/9.9.9' > "$TEXT_REAL"
chmod +x "$TEXT_REAL"

CC=$(type -P cc || type -P gcc || type -P clang || true)
STUB=$SCRATCH/stub
mkdir -p -- "$STUB"
mkstub() { # $1 name, $2 C source
  [ -n "$CC" ] || return 1
  printf '%s\n' "$2" > "$STUB/$1.c"
  "$CC" -O0 -o "$STUB/$1" "$STUB/$1.c" 2>/dev/null
}
mkstub ok '#include <stdio.h>
int main(void){printf("omp/1.2.3\n");return 0;}'
mkstub failver '#include <stdio.h>
int main(void){printf("omp/9.9.9\n");return 1;}'
mkstub junk '#include <stdio.h>
int main(void){printf("not-a-version\n");return 0;}'
mkstub hang '#include <unistd.h>
int main(void){int i; for(i=0;i<25;i++)sleep(1); return 0;}'
mkstub errver '#include <stdio.h>
int main(void){fprintf(stderr,"omp/7.7.7\n");return 0;}'
mkstub silent 'int main(void){return 0;}'
HAVE_STUBS=0
[ -x "$STUB/ok" ] && [ -x "$STUB/failver" ] && [ -x "$STUB/junk" ] && [ -x "$STUB/hang" ] && [ -x "$STUB/errver" ] && [ -x "$STUB/silent" ] && HAVE_STUBS=1
if [ "$HAVE_STUBS" = 0 ]; then
  echo "ARMS: FATAL stub-compile-failed (cc=${CC:-none}) — 20 of 24 arms need ELF stubs"
  exit 2
fi

NOTEXEC=$SCRATCH/real-notexec
cp -- "$STUB/ok" "$NOTEXEC" 2>/dev/null && chmod 644 "$NOTEXEC"
EXECONLY=$SCRATCH/real-execonly
cp -- "$STUB/ok" "$EXECONLY" 2>/dev/null && chmod 111 "$EXECONLY"
ln -s real-loop "$SCRATCH/real-loop" 2>/dev/null || true

SPACE_DIR="$SCRATCH/sp ace"
cp -- "$GOOD_WRAPPER" "$SPACE_DIR/w rap.sh"
cp -- "$STUB/ok" "$SPACE_DIR/omp real"

# ---- runner --------------------------------------------------------------------------------------------
OUT=''
last_rc=0
last_line() { tail -n 1 -- "$1" 2>/dev/null | tr -d '\r'; }

run_one() { # $1 script, $2 harness timeout seconds, rest = args to `env`
  local script=$1 tmo=$2; shift 2
  OUT=$SCRATCH/run.out
  timeout "$tmo" env "$@" "$BASH_BIN" "$script" > "$OUT" 2>"$OUT.err"
  last_rc=$?
}

J_OK=1; J_WHY=''
judge() { # $1 expected rc, $2 expected reason ('-' any), $3 exact line that must appear ('-' none)
  local exp_rc=$1 exp_reason=$2 expect_line=$3
  local nlines nkeys keys last
  J_OK=1; J_WHY=''
  last=$(last_line "$OUT")
  if [ "$last_rc" -eq 0 ]; then
    case "$last" in
      'OMP_BIN_PROBE: DONE omp='*) ;;
      *) J_OK=0; J_WHY="done-line";;
    esac
    nkeys=$(grep -c '^OMP_BIN: ' "$OUT" 2>/dev/null || true)
    [ "${nkeys:-0}" -eq 15 ] || { J_OK=0; J_WHY="${J_WHY} keys=${nkeys:-0}"; }
    keys=$(grep -o '^OMP_BIN: [A-Za-z0-9_-]*=' "$OUT" | sed 's/^OMP_BIN: //; s/=$//' | sort | tr '\n' ',')
    [ "$keys" = "$EXPECT_KEYS" ] || { J_OK=0; J_WHY="$J_WHY keyset"; }
    if [ "$expect_line" != '-' ] && ! grep -qxF -- "$expect_line" "$OUT"; then J_OK=0; J_WHY="$J_WHY missing:[$expect_line]"; fi
  elif [ "$last_rc" -eq 2 ]; then
    nlines=$(wc -l < "$OUT")
    [ "$nlines" -eq 1 ] || { J_OK=0; J_WHY="fail-lines=$nlines"; }
    if ! printf '%s' "$last" | grep -qE '^OMP_BIN_PROBE: FAIL-CLOSED [A-Za-z0-9_.-]+$'; then
      J_OK=0; J_WHY="$J_WHY fail-shape"
    fi
    if [ "$exp_reason" != '-' ] && [ "$last" != "OMP_BIN_PROBE: FAIL-CLOSED $exp_reason" ]; then
      J_OK=0; J_WHY="$J_WHY reason=[$last]"
    fi
  else
    J_OK=0; J_WHY="exit=$last_rc"
  fi
  [ "$last_rc" -eq "$exp_rc" ] || { J_OK=0; J_WHY="$J_WHY expected-rc=$exp_rc"; }
}

show() { # $1 rc $2 file
  local l
  l=$(last_line "$2")
  if [ "$1" -eq 124 ]; then l="HANG(harness-timeout) $l"; fi
  printf '%s|%s' "$1" "${l:0:64}"
}

check_arm() { # name desc exp_rc exp_reason expect_line envargs...
  local name=$1 desc=$2 exp_rc=$3 exp_reason=$4 expect_line=$5 v1 v2 verdict why
  shift 5
  run_one "$ORIG" 20 "$@";   v1=$(show "$last_rc" "$OUT")
  run_one "$TARGET" 20 "$@"; v2=$(show "$last_rc" "$OUT")
  if [ "$name" = A00 ]; then cp -- "$OUT" "$SCRATCH/a00-target.out"; fi
  judge "$exp_rc" "$exp_reason" "$expect_line"
  if [ "$J_OK" = 1 ]; then verdict=PASS; why=''; else verdict=FAIL; why=$J_WHY; FAILS=$((FAILS+1)); fi
  row "$name	$desc	$v1	$v2	$verdict	$why"
  printf '%-6s %-44s %-7s %s\n' "$name" "$desc" "$verdict" "$why"
}

# ---- arms ----------------------------------------------------------------------------------------------
check_arm A00 'no overrides: the installed host'                 0 DONE - \
  --
check_arm A01 'wrapper absent (OMP_BIN_WRAPPER=/nonexistent)'    2 wrapper-absent - \
  OMP_BIN_WRAPPER=$SCRATCH/no-such-wrapper OMP_BIN_REAL=$STUB/ok
check_arm A02 'wrapper present without BIN=, real overridden'    0 DONE 'OMP_BIN: wrapper_names_real=none' \
  OMP_BIN_WRAPPER=$NOBIN_WRAPPER OMP_BIN_REAL=$STUB/ok
check_arm A02b 'wrapper without BIN=, no real override'          2 real-unidentified - \
  OMP_BIN_WRAPPER=$NOBIN_WRAPPER
check_arm A03 'real absent (OMP_BIN_REAL=/nonexistent)' 2 real-absent - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$SCRATCH/no-such-real
check_arm A04 'real present but not executable (0644)'           2 real-not-executable - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$NOTEXEC
check_arm A05 'real is a text script that prints omp/9.9.9'      2 real-not-elf - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$TEXT_REAL
check_arm A06 'real (ELF) prints an empty --version'             2 version-unreadable - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/silent
check_arm A07 'real prints omp/9.9.9 and exits 1'                2 version-exit-1 - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/failver
check_arm A08 'real hangs on --version (probe timeout 2s)'       2 version-timeout - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/hang OMP_BIN_TIMEOUT=2
check_arm A09 'HOME unset with explicit wrapper+real'            0 DONE - \
  -u HOME OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/ok
check_arm A10 'HOME unset, no overrides (set -u arm)'            2 real-unidentified - \
  -u HOME
check_arm A11 'grep missing from PATH'                           2 util-absent-grep - \
  PATH=/nonexistent
check_arm A12 'wrapper is a symlink loop'                        2 wrapper-symlink-loop - \
  OMP_BIN_WRAPPER=$SCRATCH/wrapper-loop OMP_BIN_REAL=$STUB/ok
check_arm A13 'paths containing spaces'                          0 DONE - \
  OMP_BIN_WRAPPER="$SPACE_DIR/w rap.sh" OMP_BIN_REAL="$SPACE_DIR/omp real"
check_arm A14 'real is a directory'                              2 real-is-dir - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$SCRATCH/real-is-dir
check_arm A15 'real executable but unreadable (0111)'            2 real-unreadable - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$EXECONLY
check_arm A16 'env -i (no PATH, no HOME)'                        2 - - \
  -i
check_arm A17 'real prints a non-version line, exit 0'           2 version-shape - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/junk
check_arm A18 'wrapper is a directory'                           2 wrapper-is-dir - \
  OMP_BIN_WRAPPER=$SCRATCH/dir-wrapper OMP_BIN_REAL=$STUB/ok
check_arm A19 'real prints version on stderr only'               2 version-unreadable - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/errver
check_arm A20 'timeout missing from PATH'                        2 util-absent-timeout - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/ok PATH=$SCRATCH/bin
check_arm A21 'OMP_BIN_TIMEOUT invalid'                          2 timeout-invalid - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/ok OMP_BIN_TIMEOUT=abc
check_arm A22 'wrapper unreadable (0000)'                        2 wrapper-unreadable - \
  OMP_BIN_WRAPPER=$UNREADABLE_WRAPPER OMP_BIN_REAL=$STUB/ok
check_arm A23 'real is a symlink loop'                           2 real-symlink-loop - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$SCRATCH/real-loop
check_arm A24 'OMP_BIN_TIMEOUT above the counter spawn limit'    2 timeout-too-large - \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/ok OMP_BIN_TIMEOUT=151
check_arm A25 'PATH lacking sed (v1 sed dependency removed)'     0 DONE 'OMP_BIN: wrapper_names_real=omp.real' \
  OMP_BIN_WRAPPER=$GOOD_WRAPPER OMP_BIN_REAL=$STUB/ok PATH=$SCRATCH/bin-no-sed

# ---- freeze compatibility: the happy path must be byte-equal to the frozen receipt ----------------------
if [ -f "$FREEZE" ] && [ -f "$SCRATCH/a00-target.out" ]; then
  if diff <(grep '^OMP_BIN' "$SCRATCH/a00-target.out") <(grep '^OMP_BIN' "$FREEZE") > "$SCRATCH/freeze.diff" 2>&1; then
    row "A00f	freeze-compat (A00 keys=values vs base/omp-binary-probe-freeze.txt)	-	-	PASS	"
    printf '%-6s %-44s %-7s %s\n' A00f 'freeze-compat vs frozen receipt' PASS ''
  else
    FAILS=$((FAILS+1))
    row "A00f	freeze-compat (A00 keys=values vs base/omp-binary-probe-freeze.txt)	-	-	FAIL	diff-see-scratch"
    printf '%-6s %-44s %-7s %s\n' A00f 'freeze-compat vs frozen receipt' FAIL "see $SCRATCH/freeze.diff"
  fi
else
  SKIPS=$((SKIPS+1))
  row "A00f	freeze-compat	-	-	SKIP	no-receipt-or-no-A00"
  printf '%-6s %-44s %-7s %s\n' A00f 'freeze-compat vs frozen receipt' SKIP 'no receipt'
fi

echo "ARMS: rows=$ROWS fail=$FAILS skip=$SKIPS target=$(basename -- "$TARGET") orig=$(basename -- "$ORIG")"
echo "TABLE: $TABLE"
[ "$FAILS" -eq 0 ]
