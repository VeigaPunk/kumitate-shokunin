set -u; BASE=/fast/scratch/hyaku/kumitate-r70/K70AttackGitConfig; W=$1
mkdir -p "$W/empty"; E=$W/empty
S=$W/fx; mkdir -p "$S"
git -c init.templateDir=$E -c core.hooksPath=$E -C "$S" init -q; echo x > "$S/a"; git -c init.templateDir=$E -c core.hooksPath=$E -C "$S" add -A
git -c init.templateDir=$E -c core.hooksPath=$E -C "$S" -c user.name=t -c user.email=t@i -c commit.gpgsign=false commit -q --no-verify -m base
echo "tree=$(git -c init.templateDir=$E -c core.hooksPath=$E -C "$S" ls-tree -r --name-only HEAD | tr '\n' ' ')"
