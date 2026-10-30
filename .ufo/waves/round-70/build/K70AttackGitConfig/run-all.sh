#!/usr/bin/env bash
# Driver for K70AttackGitConfig counterexample. Runs each arm in an isolated
# work dir; prints observed outcomes. No original control bytes are used.
set -u
BASE=/fast/scratch/hyaku/kumitate-r70/K70AttackGitConfig
EVILHOME="$BASE/evilhome"
EVILTMPL="$BASE/evil-template"
RES="$BASE/receipts"; mkdir -p "$RES"
chmod +x "$BASE"/mini-control.sh "$BASE"/corrected-control.sh "$EVILTMPL"/hooks/post-commit "$BASE"/evil-hooks/post-commit 2>/dev/null

run_arm () { # name, env-setup-fn, script
  local name="$1"; shift
  local W="$BASE/work/$name"; rm -rf "$W"; mkdir -p "$W"
  echo "=== ARM $name ==="
  "$@" "$W" > "$RES/$name.log" 2>&1
  local rc=$?
  echo "exit=$rc"
  sed 's/^/  /' "$RES/$name.log"
  if [ -d "$W/fx/.git" ]; then
    echo "  hook-fired-file: $(ls "$W/fx/.git"/evil-* 2>/dev/null | tr '\n' ' ')"
    echo "  fixture-head-tree: $(git -C "$W/fx" ls-tree -r --name-only HEAD | tr '\n' ' ')"
    echo "  head-subject: $(git -C "$W/fx" log -1 --format=%s)"
  fi
  echo
}

armA () { local W="$1"; HOME="$EVILHOME" XDG_CONFIG_HOME="$EVILHOME/noxdg" "$BASE/mini-control.sh" donothing "$W/fx" "$W/out.txt" "$W"; }
armA2 () { local W="$1"; GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=init.templatedir GIT_CONFIG_VALUE_0="$BASE/evil-template" "$BASE/mini-control.sh" donothing "$W/fx" "$W/out.txt" "$W"; }
armB () { local W="$1"; GIT_CONFIG_SYSTEM="$BASE/evil-system-config" "$BASE/mini-control.sh" donothing "$W/fx" "$W/out.txt" "$W"; }
armC () { local W="$1"; GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=init.templatedir GIT_CONFIG_VALUE_0="$EVILTMPL" "$BASE/mini-control.sh" donothing "$W/fx" "$W/out.txt" "$W"; }
armD () { local W="$1"; HOME="$EVILHOME" "$BASE/corrected-control.sh" donothing "$W/fx" "$W/out.txt" "$W"; }
armE () { local W="$1"; GIT_CONFIG_SYSTEM="$BASE/evil-system-config" GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hookspath GIT_CONFIG_VALUE_0="$BASE/evil-hooks" "$BASE/corrected-control.sh" donothing "$W/fx" "$W/out.txt" "$W"; }

run_arm A-global-template-hooks armA
run_arm A2-template-config-inject armA2
run_arm B-system-hookspath armB
run_arm C-env-count-inject armC
run_arm D-corrected-vs-global armD
run_arm E-corrected-vs-system+env armE
