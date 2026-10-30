# Attack harness for seat K70AttackGitConfig — NOT an original control.
# Simulates the round-70 contract's generated private copy: explicit fixture-root
# git args + limited env scrub (GIT_DIR/GIT_WORK_TREE only — the under-specified
# reading of "scrub inherited repository environment"). Proves global
# hooksPath/template/signing-class git config redirects fixture writes.
set -u
MODE="${1:?usage: mini-control.sh donothing|autoledger}"
FX="${2:?fixture dir}"
OUT="${3:?receipt out}"
WORK="${4:?work root}"

# --- limited scrub (the flawed interpretation: repo vars only) ---
for v in GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_COMMON_DIR; do unset "$v"; done

mkdir -p "$WORK/tmp"
S="$WORK/fx"; mkdir -p "$S"
# fixture construction, explicit -C args (contract transform), no cd
git -C "$S" init -q
mkdir -p "$S/scripts" "$S/corpus"
printf 'x' > "$S/scripts/tool.mjs"
printf '# fixture\n' > "$S/README.md"
git -C "$S" add -A
git -C "$S" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c1-$MODE fixture"
REV="$(git -C "$S" rev-parse HEAD)"
echo "fixture-rev=$REV" > "$OUT"
echo "tree=$(git -C "$S" ls-tree -r --name-only HEAD | tr '\n' ' ')" >> "$OUT"
echo "CONTROL-FAIL $MODE" >> "$OUT"
exit 1
