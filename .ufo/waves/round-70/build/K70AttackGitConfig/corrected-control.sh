# Corrected simulated private copy — smallest safe correction under test.
# Same construction as mini-control.sh, but every git invocation runs with:
#   GIT_CONFIG_NOSYSTEM=1, GIT_CONFIG_GLOBAL=/dev/null, GIT_CONFIG_SYSTEM=/dev/null,
#   GIT_CONFIG_COUNT=0 (kills env-file + env-count + file config),
# plus explicit -c init.templateDir=<empty> -c core.hooksPath=<empty>.
set -u
MODE="${1:?usage: corrected-control.sh MODE}"
FX="${2:?fixture dir}"
OUT="${3:?receipt out}"
WORK="${4:?work root}"

EMPTY="$WORK/emptycfg"; mkdir -p "$EMPTY" "$WORK/tmp"
export GIT_CONFIG_NOSYSTEM=1
export GIT_CONFIG_GLOBAL=/dev/null
export GIT_CONFIG_SYSTEM=/dev/null
export GIT_CONFIG_COUNT=0
G() { git -c init.templateDir="$EMPTY" -c core.hooksPath="$EMPTY" "$@"; }

S="$WORK/fx"; mkdir -p "$S/scripts" "$S/corpus"
G -C "$S" init -q
printf 'x' > "$S/scripts/tool.mjs"
printf '# fixture\n' > "$S/README.md"
G -C "$S" add -A
G -C "$S" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c1-$MODE fixture"
REV="$(G -C "$S" rev-parse HEAD)"
echo "fixture-rev=$REV" > "$OUT"
echo "tree=$(G -C "$S" ls-tree -r --name-only HEAD | tr '\n' ' ')" >> "$OUT"
echo "CONTROL-FAIL $MODE" >> "$OUT"
exit 1
