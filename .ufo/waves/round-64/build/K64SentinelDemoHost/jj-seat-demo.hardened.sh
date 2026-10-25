#!/usr/bin/env bash
# jj-seat-demo.sh — hermetic demonstration of what a jj workspace does as a seat's working copy.
# Contract: kumitate-jj-seat-demo-v1 (round 64). Every repository is a fresh mktemp fixture; every git/jj call
# names its repository explicitly (-C / -R); no identity is configured outside the fixture (--config flags only).
# Output: `JJ_SEAT: <key>=<value>` lines, then `JJ_SEAT_DEMO: DONE jj=<version>` exit 0;
#         `JJ_SEAT_DEMO: FAIL-CLOSED <reason>` exit 2 when jj or git is absent or a fixture cannot be built.
#
# DRAFT (round 64, seat K64SentinelDemoHost) — host-safety hardening only; the 15 outcome keys and the DONE line
# are byte-identical to the frozen script. Three changes:
#   1. the demo re-execs itself ONCE under a scrubbed environment (`env -i`): no inherited GIT_DIR / GIT_WORK_TREE /
#      GIT_INDEX_FILE / GIT_CONFIG_* / BASH_ENV / TAR_OPTIONS / NODE_OPTIONS, a throwaway HOME and TMPDIR, and
#      GIT_CONFIG_GLOBAL=/dev/null so the operator's ~/.gitconfig (core.hooksPath, init.templateDir, include.path)
#      and ~/.jjconfig.toml cannot reach the fixtures;
#   2. the EXIT trap only removes paths it created, prefix-checked against the run root, with `rm -rf --`;
#   3. the fixture-root guard stays, but is no longer the only thing standing between the fixtures and the host.
set -u

if [ -z "${JJ_SEAT_DEMO_ISOLATED:-}" ]; then
  ROOT=$(mktemp -d) || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED mktemp'; exit 2; }
  mkdir -p "$ROOT/tmp" "$ROOT/home" || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED mktemp'; exit 2; }
  trap 'rm -rf -- "${ROOT:-}"' EXIT   # only if the exec below fails; a successful exec discards this shell
  exec env -i \
    PATH="${PATH:-/usr/local/bin:/usr/bin:/bin}" LANG="${LANG:-C}" LC_ALL="${LC_ALL:-}" LC_CTYPE="${LC_CTYPE:-}" \
    TMPDIR="$ROOT/tmp" HOME="$ROOT/home" \
    XDG_CONFIG_HOME="$ROOT/home/.config" XDG_CACHE_HOME="$ROOT/home/.cache" \
    XDG_STATE_HOME="$ROOT/home/.state" XDG_DATA_HOME="$ROOT/home/.local/share" \
    GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_CONFIG_NOSYSTEM=1 \
    JJ_CONFIG=/dev/null JJ_SEAT_DEMO_ISOLATED=1 JJ_SEAT_DEMO_ROOT="$ROOT" \
    bash "${BASH_SOURCE[0]}" "$@"
fi

ROOT=${JJ_SEAT_DEMO_ROOT:?}
cleanup() {
  for p in "${D:-}" "${S:-}" "$ROOT"; do
    case "$p" in
      ''|/) continue ;;
      "$ROOT"|"$ROOT"/*) rm -rf -- "$p" ;;
    esac
  done
}
trap cleanup EXIT

command -v jj >/dev/null 2>&1 || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED jj-absent'; exit 2; }
command -v git >/dev/null 2>&1 || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED git-absent'; exit 2; }
export JJ_CONFIG=/dev/null
J() { jj --config user.name=fixture --config user.email=fixture@example.invalid --no-pager --color never "$@"; }

D=$(mktemp -d) || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED mktemp'; exit 2; }
S=$(mktemp -d) || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED mktemp'; exit 2; }
git -C "$D" init -q || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED git-init'; exit 2; }
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED fixture-root'; exit 2; }
(cd "$D" && J git init >/dev/null 2>&1) || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED jj-git-init'; exit 2; }
echo base > "$D/base.txt"
J -R "$D" describe -m base >/dev/null 2>&1
J -R "$D" new -m trunk >/dev/null 2>&1
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1 || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED workspace-add'; exit 2; }
kv() { echo "JJ_SEAT: $1=$2"; }

kv workspaces_after_add "$(J -R "$D" workspace list 2>/dev/null | wc -l | tr -d ' ')"
kv seat_gets_base_file "$([ -f "$SEAT/base.txt" ] && echo yes || echo no)"
kv seat_has_git_dir "$(git -C "$SEAT" rev-parse --git-dir >/dev/null 2>&1 && echo yes || echo no)"

echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
kv seat_file_in_default_tree "$([ -f "$D/seat.txt" ] && echo yes || echo no)"
kv default_status_clean_after_seat_write "$(J -R "$D" status 2>/dev/null | grep -c 'The working copy has no changes')"
kv seat_snapshot_in_shared_op_log "$(J -R "$D" --ignore-working-copy op log --no-graph -T 'description.first_line()++"\n"' 2>/dev/null | grep -c 'snapshot working copy')"

# ignore-working-copy adds no operation
n1=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'id.short()++"\n"' 2>/dev/null | wc -l | tr -d ' ')
J -R "$D" --ignore-working-copy log -r 'all()' --no-graph -T 'change_id.short()++"\n"' >/dev/null 2>&1
n2=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'id.short()++"\n"' 2>/dev/null | wc -l | tr -d ' ')
kv ignore_working_copy_adds_op "$([ "$n1" = "$n2" ] && echo no || echo yes)"

# rewrite the seat's checked-out commit from the default workspace
SEAT_CHANGE=$(J -R "$SEAT" log -r @ --no-graph -T 'change_id.short()' 2>/dev/null)
J -R "$D" describe -r "$SEAT_CHANGE" -m rewritten >/dev/null 2>&1
out=$(J -R "$SEAT" status 2>&1)
kv rewrite_seat_head_seat_state "$(printf '%s' "$out" | grep -q 'working copy is stale' && echo stale || echo fresh)"
kv rewrite_seat_head_description_seen "$(J -R "$SEAT" log -r @ --no-graph -T 'description.first_line()' 2>/dev/null)"

# abandon the seat's checked-out commit from the default workspace
J -R "$D" abandon "$SEAT_CHANGE" >/dev/null 2>&1
out=$(J -R "$SEAT" status 2>&1)
kv abandon_seat_head_seat_state "$(printf '%s' "$out" | grep -q 'working copy is stale' && echo stale || echo fresh)"
kv abandon_seat_head_files_on_disk "$([ -f "$SEAT/seat.txt" ] && echo kept || echo removed)"
J -R "$SEAT" workspace update-stale >/dev/null 2>&1
out=$(J -R "$SEAT" status 2>&1)
kv update_stale_recovers "$(printf '%s' "$out" | grep -q 'working copy is stale' && echo no || echo yes)"

# absolute-path write: a seat can write into the default workspace; jj does not contain it
echo leak > "$D/leak.txt"
kv absolute_path_write_seen_in_default "$(J -R "$D" status 2>/dev/null | grep -c 'leak.txt')"

# forgetting the seat workspace removes the registration, not the directory
J -R "$D" workspace forget seat1 >/dev/null 2>&1
kv workspaces_after_forget "$(J -R "$D" workspace list 2>/dev/null | wc -l | tr -d ' ')"
kv seat_dir_after_forget "$([ -d "$SEAT" ] && echo present || echo removed)"

echo "JJ_SEAT_DEMO: DONE jj=$(jj --version | awk '{print $2}')"
