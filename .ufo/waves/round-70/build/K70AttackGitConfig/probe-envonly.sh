set -u; BASE=/fast/scratch/hyaku/kumitate-r70/K70AttackGitConfig; W=$1
export GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_CONFIG_COUNT=0
S=$W/fx; mkdir -p "$S"
git -C "$S" init -q; echo x > "$S/a"; git -C "$S" add -A
git -C "$S" -c user.name=t -c user.email=t@i -c commit.gpgsign=false commit -q --no-verify -m base
echo "tree=$(git -C "$S" ls-tree -r --name-only HEAD | tr '\n' ' ')"
