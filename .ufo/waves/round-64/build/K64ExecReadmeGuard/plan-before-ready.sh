#!/usr/bin/env bash
# plan-before-ready.sh — QUALITY criterion, mistake mined from round 62:
#   "a round's plan file is committed in the lane BEFORE the round's first wave .ready marker".
#
# Round 62's mistake (corpus/lessons/round-62-verifier-spotcheck.md §Verdict, routed defect 1):
# the lane read "the dispatched prompt contains no claim sentences" as "no claims declared" and
# filed a zero-claim round. It committed no .ufo/waves/round-62/plan.md at all. Nothing in the
# lane could fail on that, so this command exists to fail on it.
#
# Check, for round R at revision REV (default HEAD):
#   PLAN   = oldest commit that ADDS .ufo/waves/round-R/plan.md
#   MARKER = oldest commit that ADDS a top-level .ufo/waves/round-R/*.ready
#            (fallback, only if no .ready was ever added: a top-level *-dispatch.json)
#   PASS   iff PLAN exists, MARKER exists, PLAN is an ancestor-or-equal of MARKER,
#            and committer time(PLAN) <= committer time(MARKER).
#
# Exit codes (explicit, never overloaded):
#   0  PASS  — plan committed before the round's first wave marker (or in the same commit)
#   1  FAIL  — a wave marker exists but the plan is missing, not its ancestor, or later
#   2  NA    — the round has no plan AND no wave marker (nothing to judge), or no marker yet
#              (a round still in flight: plan committed, wave not dispatched/committed)
#
# Batch mode (--rounds A-B) aggregates: 1 if any round FAILs; else 2 if any round is NA;
# else 0. A single round's verdict is always on its own PLAN_BEFORE_READY line.
#
# readme-map arm (round 64; the R56-V3 recurrence's structural fix — a corpus file landed
# without its README row for the tenth time, and `readme-map` only ever detected it AFTER the
# fact). Every round that has a committed PLAN is additionally judged at PLAN, i.e. at the
# commit that carries the plan, by running `node scripts/readme-map.mjs` INSIDE
# `git archive PLAN` (the counter derives its lane from its own path, so the archived copy
# reads the archived corpus/README.md, .ufo/pins/readme-map.json and corpus/{knowledge,lessons}):
#   GREEN  = the archived counter exits 0 and prints `README_MAP: CLEAN`.
#   RED    = anything else: DRIFT (exit 1), FAIL-CLOSED (exit 2), exit 0 without a CLEAN
#            verdict (a counter that prints nothing cannot pass), node/archive/mktemp failure
#            or a 300 s timeout. RED makes the round FAIL with reason=MAP_DRIFT /
#            MAP_NO_VERDICT / MAP_UNRUNNABLE and exit 1 — before the marker/ordering arms, so a
#            round still in flight (plan committed, no wave marker yet: the freeze moment)
#            cannot read NA over a red map.
#   SKIP   = the arm does not apply: the readme-map gate did not exist when the plan was frozen
#            (the commit that first adds scripts/readme-map.mjs is not an ancestor-or-equal of
#            PLAN — rounds 41-56). `map=SKIP reason=MAP_PRE_EPOCH` is printed and the exit code
#            is unchanged, so historical verdicts keep their meaning.
#   MAP_ABSENT (FAIL, fail closed) = the gate existed before PLAN (its first-add commit is an
#            ancestor of PLAN) yet `scripts/readme-map.mjs` is missing at PLAN — a gate removed
#            at the freeze is never a pass.
# The arm never relaxes an existing verdict: it can only turn a would-be PASS/NA into FAIL.
#
# Pathspec hazard this script deliberately closes: git pathspec `*` matches `/`, so the
# unmagicked pathspec `.ufo/waves/round-63/*.ready` also matches NESTED fixture markers such as
# .ufo/waves/round-63/controls/inline/honest/lane/.ufo/waves/round-7/w1.ready. Every pathspec
# below carries the `:(glob)` magic so `*` stops at the directory separator. Selftest case 8
# locks that in.
#
# Read-only: uses only `git log` / `git show` / `git merge-base` / `git cat-file` /
# `git archive`, plus node. The map arm extracts `git archive PLAN` into a fresh mktemp dir and
# removes it again; nothing is ever written to the judged repository.
set -uo pipefail

REPO_DEFAULT=/home/vgpnk/Projects/shokunin/kumitate-shokunin
REPO="$REPO_DEFAULT"
REV="HEAD"
ROUNDS=""
ROUND_ONE=""
ALL_ROUNDS=0
EARLIEST_MARKER=0
SELFTEST=0
QUIET=0

usage() {
  cat <<'EOF'
usage: plan-before-ready.sh [--repo DIR] [--rev REV] (--round N | --rounds A-B) [options]
       plan-before-ready.sh --selftest

  --repo DIR        lane repository (default /home/vgpnk/Projects/shokunin/kumitate-shokunin)
  --rev REV         revision whose history is judged (default HEAD)
  --round N         one round: N, round-N or rN
  --rounds A-B      inclusive range of round numbers
  --all             every .ufo/waves/round-* directory present at REV (standing gate)
  --earliest-marker take the EARLIEST of the first .ready and the first *-dispatch.json
                    (strictest reading) instead of .ready-else-dispatch
  --quiet           per-round lines only, no summary
  --selftest        build fixture repos in a temp dir and assert every exit code; no repo needed

Every round with a committed plan is also judged by the readme-map arm: `node
scripts/readme-map.mjs` is run inside `git archive PLAN` (the plan's own commit) and a red map
there makes the round FAIL (reason=MAP_DRIFT|MAP_NO_VERDICT|MAP_UNRUNNABLE|MAP_ABSENT) with exit
1, before any marker/ordering arm. Rounds whose plan predates the gate read `map=SKIP
reason=MAP_PRE_EPOCH` and are judged exactly as before. Every verdict line ends with its map
field; the summary adds `map_red=<rounds>`.

exit: 0 PASS, 1 FAIL, 2 NA (no plan/wave data). Batch: 1 if any FAIL, else 2 if any NA, else 0.
EOF
}

die_usage() { echo "plan-before-ready: $1" >&2; usage >&2; exit 2; }

while [ $# -gt 0 ]; do
  case "$1" in
    --repo)      [ $# -ge 2 ] || die_usage "--repo needs a value"; REPO="$2"; shift 2 ;;
    --rev)       [ $# -ge 2 ] || die_usage "--rev needs a value"; REV="$2"; shift 2 ;;
    --round)     [ $# -ge 2 ] || die_usage "--round needs a value"; ROUND_ONE="$2"; shift 2 ;;
    --rounds)    [ $# -ge 2 ] || die_usage "--rounds needs a value"; ROUNDS="$2"; shift 2 ;;
    --all)       ALL_ROUNDS=1; shift ;;
    --earliest-marker) EARLIEST_MARKER=1; shift ;;
    --quiet)     QUIET=1; shift ;;
    --selftest)  SELFTEST=1; shift ;;
    -h|--help)   usage; exit 0 ;;
    *)           die_usage "unknown argument: $1" ;;
  esac
done

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

norm_round() {  # 63 | round-63 | r63  ->  63
  local r="$1"
  r="${r#round-}"; r="${r#r}"
  case "$r" in
    ''|*[!0-9]*) die_usage "not a round number: $1" ;;
  esac
  printf '%s' "$r"
}

# oldest commit that adds $2 (a pathspec) in repo $1; prints "<sha>\t<ct>" or nothing
oldest_add() {
  git -C "$1" log "$REV_RESOLVED" --full-history --diff-filter=A \
      --format='%H%x09%ct' -- "$2" 2>/dev/null | tail -n 1
}

# first path added by commit $2 matching pathspec $3 in repo $1
first_added_path() {
  git -C "$1" show --diff-filter=A --name-only --format= "$2" -- "$3" 2>/dev/null | head -n 1
}

# ---------------------------------------------------------------------------
# readme-map arm (round 64). Semantics: judge `node scripts/readme-map.mjs` inside a
# `git archive` of the PLAN commit — not of REV, not of the tip, not of the working tree — so a
# late repair cannot launder a freeze made over a red map, and a working-tree edit cannot pass a
# red plan commit. Sets MAP_FIELD (the trailing verdict fragment) and MAP_FAIL_REASON (empty when
# the arm is green or does not apply). Never relaxes a verdict; only turns PASS/NA into FAIL.
# ---------------------------------------------------------------------------
MAP_GATE=scripts/readme-map.mjs

map_first_add() {  # $1=repo -> oldest commit (any revision) that ADDS the readme-map gate
  git -C "$1" log --full-history --diff-filter=A --format='%H' -- "$MAP_GATE" 2>/dev/null | tail -n 1
}

map_at_plan() {  # $1=repo $2=plan_sha
  local repo="$1" plan="$2" t out rc line first fc gate_sha
  MAP_FIELD="map=SKIP reason=MAP_PRE_EPOCH"; MAP_FAIL_REASON=""

  if ! git -C "$repo" cat-file -e "$plan:$MAP_GATE" 2>/dev/null; then
    # The gate is absent at the plan commit. It applies only if the gate already existed when
    # this plan was frozen (its first-add commit is an ancestor-or-equal of PLAN); otherwise the
    # plan predates the gate and the arm does not apply (rounds 41-56 read exactly as before).
    gate_sha="$(map_first_add "$repo")"
    if [ -n "$gate_sha" ] \
       && git -C "$repo" merge-base --is-ancestor "$gate_sha" "$plan" 2>/dev/null; then
      MAP_FIELD="map=ABSENT"; MAP_FAIL_REASON=MAP_ABSENT
    fi
    return 0
  fi

  t="$(mktemp -d "${TMPDIR:-/tmp}/pbr-map.XXXXXX" 2>/dev/null)" || {
    MAP_FIELD="map=UNRUNNABLE reason=MKTEMP"; MAP_FAIL_REASON=MAP_UNRUNNABLE; return 0; }
  if ! git -C "$repo" archive --format=tar "$plan" 2>/dev/null | tar -x -C "$t" --no-same-owner 2>/dev/null; then
    rm -rf "$t"; MAP_FIELD="map=UNRUNNABLE reason=ARCHIVE"; MAP_FAIL_REASON=MAP_UNRUNNABLE; return 0
  fi
  if command -v timeout >/dev/null 2>&1; then
    out="$(cd "$t" && timeout 300 node "$MAP_GATE" 2>&1)"; rc=$?
  else
    out="$(cd "$t" && node "$MAP_GATE" 2>&1)"; rc=$?
  fi
  rm -rf "$t"

  if [ "$rc" = 0 ] && printf '%s\n' "$out" | grep -q '^README_MAP: CLEAN '; then
    line="$(printf '%s\n' "$out" \
      | sed -n 's/^README_MAP: CLEAN \(files=[0-9]* rows=[0-9]* covered=[0-9]*\).*/\1/p' | head -n 1)"
    MAP_FIELD="map=CLEAN ${line:-files=? rows=? covered=?}"
    return 0
  fi
  if [ "$rc" = 0 ]; then
    MAP_FIELD="map=NO_VERDICT map_exit=0"; MAP_FAIL_REASON=MAP_NO_VERDICT; return 0
  fi
  if [ "$rc" = 127 ]; then
    MAP_FIELD="map=UNRUNNABLE reason=NODE_ABSENT"; MAP_FAIL_REASON=MAP_UNRUNNABLE; return 0
  fi
  if [ "$rc" = 124 ]; then
    MAP_FIELD="map=UNRUNNABLE reason=TIMEOUT"; MAP_FAIL_REASON=MAP_UNRUNNABLE; return 0
  fi
  first="$(printf '%s\n' "$out" | sed -n 's/^README_MAP: DRIFT .*first=//p' | head -n 1)"
  fc="$(printf '%s\n' "$out" | sed -n 's/^README_MAP: FAIL-CLOSED reason=//p' | head -n 1)"
  if [ -n "$first" ]; then
    MAP_FIELD="map=DRIFT map_exit=$rc map_first=$first"; MAP_FAIL_REASON=MAP_DRIFT
  elif [ -n "$fc" ]; then
    MAP_FIELD="map=FAIL-CLOSED map_exit=$rc map_reason=$fc"; MAP_FAIL_REASON=MAP_FAIL_CLOSED
  else
    MAP_FIELD="map=UNRUNNABLE map_exit=$rc"; MAP_FAIL_REASON=MAP_UNRUNNABLE
  fi
  return 0
}

# judge one round in repo $1 at revision $2; prints one verdict line; echoes exit code on stdout? no:
# sets globals VERDICT_LINE and returns the exit code (0/1/2)
judge_round() {
  local repo="$1" round="$2" dir plan_line
  dir=".ufo/waves/round-$round"

  local plan_sha="" plan_ct="" marker_sha="" marker_ct="" marker_kind="" marker_path=""
  plan_line="$(oldest_add "$repo" ":(glob)$dir/plan.md")"
  if [ -n "$plan_line" ]; then
    plan_sha="${plan_line%%$'\t'*}"; plan_ct="${plan_line##*$'\t'}"
  fi

  local ready_line dispatch_line
  ready_line="$(oldest_add "$repo" ":(glob)$dir/*.ready")"
  dispatch_line="$(oldest_add "$repo" ":(glob)$dir/*-dispatch.json")"

  local ready_sha="" ready_ct="" dispatch_sha="" dispatch_ct=""
  [ -n "$ready_line" ]    && { ready_sha="${ready_line%%$'\t'*}";       ready_ct="${ready_line##*$'\t'}"; }
  [ -n "$dispatch_line" ] && { dispatch_sha="${dispatch_line%%$'\t'*}"; dispatch_ct="${dispatch_line##*$'\t'}"; }

  if [ "$EARLIEST_MARKER" = 1 ]; then
    if [ -n "$ready_sha" ] && [ -n "$dispatch_sha" ]; then
      if [ "$ready_ct" -le "$dispatch_ct" ]; then marker_sha="$ready_sha"; marker_ct="$ready_ct"; marker_kind=ready
      else marker_sha="$dispatch_sha"; marker_ct="$dispatch_ct"; marker_kind=dispatch; fi
    elif [ -n "$ready_sha" ]; then marker_sha="$ready_sha"; marker_ct="$ready_ct"; marker_kind=ready
    elif [ -n "$dispatch_sha" ]; then marker_sha="$dispatch_sha"; marker_ct="$dispatch_ct"; marker_kind=dispatch
    fi
  else
    if [ -n "$ready_sha" ]; then marker_sha="$ready_sha"; marker_ct="$ready_ct"; marker_kind=ready
    elif [ -n "$dispatch_sha" ]; then marker_sha="$dispatch_sha"; marker_ct="$dispatch_ct"; marker_kind=dispatch
    fi
  fi

  if [ -n "$marker_sha" ]; then
    case "$marker_kind" in
      ready)    marker_path="$(first_added_path "$repo" "$marker_sha" ":(glob)$dir/*.ready")" ;;
      dispatch) marker_path="$(first_added_path "$repo" "$marker_sha" ":(glob)$dir/*-dispatch.json")" ;;
    esac
  fi

  local base="rev=$REV_RESOLVED round=$round dir=$dir"

  # readme-map arm: a plan frozen over a red map is a FAIL, and it fires BEFORE the marker arms,
  # so a round still in flight (plan committed, no wave marker yet — the freeze moment) cannot
  # read NA over a red map.
  MAP_FIELD="map=SKIP reason=NO_PLAN"; MAP_FAIL_REASON=""
  if [ -n "$plan_sha" ]; then
    map_at_plan "$repo" "$plan_sha"
    if [ -n "$MAP_FAIL_REASON" ]; then
      VERDICT_LINE="PLAN_BEFORE_READY: FAIL $base reason=$MAP_FAIL_REASON plan=$plan_sha plan_ct=$plan_ct marker=${marker_sha:--} marker_kind=${marker_kind:--} marker_ct=${marker_ct:--} marker_path=${marker_path:--} $MAP_FIELD"
      return 1
    fi
  fi

  if [ -z "$marker_sha" ]; then
    if [ -z "$plan_sha" ]; then
      VERDICT_LINE="PLAN_BEFORE_READY: NA $base reason=NO_PLAN_NO_MARKER plan=- marker=- $MAP_FIELD"
    else
      VERDICT_LINE="PLAN_BEFORE_READY: NA $base reason=NO_MARKER plan=$plan_sha plan_ct=$plan_ct marker=- $MAP_FIELD"
    fi
    return 2
  fi

  if [ -z "$plan_sha" ]; then
    VERDICT_LINE="PLAN_BEFORE_READY: FAIL $base reason=NO_PLAN plan=- marker=$marker_sha marker_kind=$marker_kind marker_ct=$marker_ct marker_path=$marker_path $MAP_FIELD"
    return 1
  fi

  local ancestor_rc=0
  git -C "$repo" merge-base --is-ancestor "$plan_sha" "$marker_sha" 2>/dev/null || ancestor_rc=$?
  if [ "$ancestor_rc" -ne 0 ]; then
    VERDICT_LINE="PLAN_BEFORE_READY: FAIL $base reason=PLAN_NOT_ANCESTOR plan=$plan_sha plan_ct=$plan_ct marker=$marker_sha marker_kind=$marker_kind marker_ct=$marker_ct marker_path=$marker_path $MAP_FIELD"
    return 1
  fi

  if [ "$plan_ct" -gt "$marker_ct" ]; then
    VERDICT_LINE="PLAN_BEFORE_READY: FAIL $base reason=PLAN_CT_AFTER_MARKER plan=$plan_sha plan_ct=$plan_ct marker=$marker_sha marker_kind=$marker_kind marker_ct=$marker_ct marker_path=$marker_path $MAP_FIELD"
    return 1
  fi

  VERDICT_LINE="PLAN_BEFORE_READY: PASS $base plan=$plan_sha plan_ct=$plan_ct marker=$marker_sha marker_kind=$marker_kind marker_ct=$marker_ct marker_path=$marker_path $MAP_FIELD"
  return 0
}

# ---------------------------------------------------------------------------
# selftest: fixture repos under a fresh mktemp dir; every exit code asserted
# ---------------------------------------------------------------------------
run_selftest() {
  local pass=0 fail=0
  local root; root="$(mktemp -d "${TMPDIR:-/tmp}/pbr-selftest.XXXXXX")" || {
    echo "PLAN_BEFORE_READY_SELFTEST: ERROR (mktemp failed)" >&2; return 2; }

  fixture() {  # $1=name -> echoes dir, inits it, verifies toplevel
    local d="$root/$1"
    mkdir -p "$d"
    git -C "$d" init -q || return 1
    [ "$(git -C "$d" rev-parse --show-toplevel)" = "$d" ] || { echo "toplevel mismatch $d" >&2; return 1; }
    printf '%s' "$d"
  }
  fcommit() {  # $1=dir $2=date-epoch $3=msg $4...=paths (relative)
    local d="$1" ts="$2" msg="$3"; shift 3
    local p
    for p in "$@"; do
      mkdir -p "$d/$(dirname "$p")"
      if [ "$p" = "scripts/readme-map.mjs" ]; then map_stub > "$d/$p"
      else printf 'x\n' > "$d/$p"; fi
    done
    git -C "$d" add -A -- "$@" >/dev/null 2>&1
    GIT_AUTHOR_DATE="@$ts +0000" GIT_COMMITTER_DATE="@$ts +0000" \
      git -C "$d" -c user.name=pbr-fixture -c user.email=pbr@fixture.invalid \
      commit -q -m "$msg" -- "$@" >/dev/null 2>&1
  }
  fcommit_all() {  # $1=dir $2=date-epoch $3=msg -> stages EVERYTHING (incl. deletions) and commits
    local d="$1" ts="$2" msg="$3"
    git -C "$d" add -A >/dev/null 2>&1
    GIT_AUTHOR_DATE="@$ts +0000" GIT_COMMITTER_DATE="@$ts +0000" \
      git -C "$d" -c user.name=pbr-fixture -c user.email=pbr@fixture.invalid \
      commit -q -m "$msg" >/dev/null 2>&1
  }
  map_stub() {  # contract-shaped stand-in for scripts/readme-map.mjs; MAP_STUB=green|red|silent|failclosed
    case "${MAP_STUB:-green}" in
      red)    printf '%s\n%s\n' \
                "process.stdout.write('README_MAP: DRIFT files=2 rows=1 covered=1 bad=1 first=uncovered:lessons/b.md\\n');" \
                'process.exit(1);' ;;
      failclosed) printf '%s\n%s\n' \
                "process.stdout.write('README_MAP: FAIL-CLOSED reason=registry unreadable: ENOENT\\n');" \
                'process.exit(2);' ;;
      silent) printf '%s\n' 'process.exit(0);' ;;
      *)      printf '%s\n%s\n' \
                "process.stdout.write('README_MAP: CLEAN files=2 rows=2 covered=2\\n');" \
                'process.exit(0);' ;;
    esac
  }
  check() {  # $1=label $2=want_rc $3=dir $4=round ; uses judge_round
    local label="$1" want="$2" d="$3" round="$4" got
    REV_RESOLVED="$(git -C "$d" rev-parse HEAD)"
    judge_round "$d" "$round"; got=$?
    if [ "$got" = "$want" ]; then
      pass=$((pass+1)); printf 'SELFTEST ok   %-24s want=%s got=%s  %s\n' "$label" "$want" "$got" "$VERDICT_LINE"
    else
      fail=$((fail+1)); printf 'SELFTEST BAD  %-24s want=%s got=%s  %s\n' "$label" "$want" "$got" "$VERDICT_LINE"
    fi
  }
  check_has() {  # $1=label $2=want_rc $3=dir $4=round $5=substring that must appear in the line
    local label="$1" want="$2" d="$3" round="$4" sub="$5" got
    REV_RESOLVED="$(git -C "$d" rev-parse HEAD)"
    judge_round "$d" "$round"; got=$?
    if [ "$got" = "$want" ] && printf '%s' "$VERDICT_LINE" | grep -qF -- "$sub"; then
      pass=$((pass+1)); printf 'SELFTEST ok   %-24s want=%s got=%s  %s\n' "$label" "$want" "$got" "$VERDICT_LINE"
    else
      fail=$((fail+1)); printf 'SELFTEST BAD  %-24s want=%s got=%s  %s\n' "$label" "$want" "$got" "$VERDICT_LINE"
    fi
  }

  # 1 honest: plan first, .ready later
  local d; d="$(fixture honest)" || return 2
  fcommit "$d" 1000000000 "plan"  .ufo/waves/round-9/plan.md
  fcommit "$d" 1000000100 "ready" .ufo/waves/round-9/w1.ready
  check honest-plan-then-ready 0 "$d" 9

  # 2 wrong order: .ready first, plan later (the fixture the criterion must reject)
  d="$(fixture wrong-order)" || return 2
  fcommit "$d" 1000000000 "ready" .ufo/waves/round-9/w1.ready
  fcommit "$d" 1000000100 "plan"  .ufo/waves/round-9/plan.md
  check wrong-order-ready-first 1 "$d" 9

  # 3 round 62's shape: marker, no plan at all
  d="$(fixture no-plan)" || return 2
  fcommit "$d" 1000000000 "dispatch" .ufo/waves/round-9/w2-dispatch.json
  check marker-without-plan 1 "$d" 9

  # 4 plan, no wave marker yet (round in flight)
  d="$(fixture plan-only)" || return 2
  fcommit "$d" 1000000000 "plan" .ufo/waves/round-9/plan.md
  check plan-only-in-flight 2 "$d" 9

  # 5 nothing at all
  d="$(fixture empty)" || return 2
  fcommit "$d" 1000000000 "unrelated" README.md
  check empty-round 2 "$d" 9

  # 6 same commit (round 50's shape)
  d="$(fixture same-commit)" || return 2
  fcommit "$d" 1000000000 "plan+dispatch" .ufo/waves/round-9/plan.md .ufo/waves/round-9/r9-dispatch.json
  check same-commit 0 "$d" 9

  # 7 dispatch fallback when no .ready was ever added
  d="$(fixture dispatch-fallback)" || return 2
  fcommit "$d" 1000000000 "plan"     .ufo/waves/round-9/plan.md
  fcommit "$d" 1000000100 "dispatch" .ufo/waves/round-9/w1-dispatch.json
  check dispatch-fallback 0 "$d" 9

  # 8 nested control-fixture marker must NOT count as the round's marker
  d="$(fixture nested-marker)" || return 2
  fcommit "$d" 1000000000 "plan"   .ufo/waves/round-9/plan.md
  fcommit "$d" 1000000100 "nested" .ufo/waves/round-9/controls/inline/honest/lane/.ufo/waves/round-7/w1.ready
  check nested-marker-ignored 2 "$d" 9

  # 9 ancestry holds but the plan commit's clock is after the marker's: ct arm alone
  d="$(fixture clock-skew)" || return 2
  fcommit "$d" 1000000000 "plan"  .ufo/waves/round-9/plan.md
  fcommit "$d"  999999000 "ready" .ufo/waves/round-9/w1.ready
  check clock-skew-ct-arm 1 "$d" 9

  # 10 --all: enumerates every round dir at the rev; one PASS + one FAIL -> exit 1, failed=2
  d="$(fixture all-rounds)" || return 2
  fcommit "$d" 1000000000 "r1 plan"   .ufo/waves/round-1/plan.md
  fcommit "$d" 1000000100 "r1 ready"  .ufo/waves/round-1/w1.ready
  fcommit "$d" 1000000200 "r2 marker" .ufo/waves/round-2/w1.ready
  local out rc2; out="$(bash "${BASH_SOURCE[0]}" --repo "$d" --all 2>&1)"; rc2=$?
  if [ "$rc2" = 1 ] \
     && printf '%s' "$out" | grep -q 'PASS .*round=1 ' \
     && printf '%s' "$out" | grep -q 'FAIL .*round=2 ' \
     && printf '%s' "$out" | grep -q 'failed=2'; then
    pass=$((pass+1)); printf 'SELFTEST ok   %-24s want=1 got=%s  %s\n' all-rounds-enumeration "$rc2" "$(printf '%s' "$out" | tail -1)"
  else
    fail=$((fail+1)); printf 'SELFTEST BAD  %-24s want=1 got=%s  %s\n' all-rounds-enumeration "$rc2" "$(printf '%s' "$out" | tail -1)"
  fi

  # --- readme-map arm (round 64). Each case pins the reason and the map field, not only the code.
  # 11 a plan frozen over a RED map fails closed: this is the R56-V3 structural fix. Without the
  #    arm the identical history reads PASS 0 (plan before .ready, both committed in order).
  d="$(fixture map-red-at-plan)" || return 2
  MAP_STUB=red fcommit "$d" 1000000000 "gate+plan" scripts/readme-map.mjs .ufo/waves/round-9/plan.md
  fcommit "$d" 1000000100 "ready" .ufo/waves/round-9/w1.ready
  check_has map-red-at-plan 1 "$d" 9 'reason=MAP_DRIFT'
  check_has map-red-names-file 1 "$d" 9 'map_first=uncovered:lessons/b.md'

  # 12 the same history with a GREEN map passes, and the line carries the counter's counts
  d="$(fixture map-green-at-plan)" || return 2
  MAP_STUB=green fcommit "$d" 1000000000 "gate+plan" scripts/readme-map.mjs .ufo/waves/round-9/plan.md
  fcommit "$d" 1000000100 "ready" .ufo/waves/round-9/w1.ready
  check_has map-green-at-plan 0 "$d" 9 'map=CLEAN files=2 rows=2 covered=2'

  # 13 the freeze moment: plan committed, no wave marker yet, map red -> FAIL, never NA
  d="$(fixture map-red-no-marker)" || return 2
  MAP_STUB=red fcommit "$d" 1000000000 "gate+plan" scripts/readme-map.mjs .ufo/waves/round-9/plan.md
  check_has map-red-no-marker 1 "$d" 9 'reason=MAP_DRIFT'

  # 14 the gate existed before the plan and the plan commit itself drops it: fail closed, never skip
  d="$(fixture map-absent-at-plan)" || return 2
  MAP_STUB=green fcommit "$d" 1000000000 "gate" scripts/readme-map.mjs
  git -C "$d" rm -q -- scripts/readme-map.mjs
  mkdir -p "$d/.ufo/waves/round-9"; printf 'x\n' > "$d/.ufo/waves/round-9/plan.md"
  fcommit_all "$d" 1000000100 "plan, gate dropped"
  fcommit "$d" 1000000300 "ready" .ufo/waves/round-9/w1.ready
  check_has map-absent-at-plan 1 "$d" 9 'reason=MAP_ABSENT'

  # 15 a plan that predates the gate is judged exactly as before: arm skipped, verdict unchanged
  d="$(fixture map-pre-epoch)" || return 2
  fcommit "$d" 1000000000 "plan"  .ufo/waves/round-9/plan.md
  fcommit "$d" 1000000100 "ready" .ufo/waves/round-9/w1.ready
  check_has map-pre-epoch-skip 0 "$d" 9 'map=SKIP reason=MAP_PRE_EPOCH'

  # 16 exit 0 without a CLEAN verdict is not a pass (a counter that prints nothing proves nothing)
  d="$(fixture map-silent-zero)" || return 2
  MAP_STUB=silent fcommit "$d" 1000000000 "gate+plan" scripts/readme-map.mjs .ufo/waves/round-9/plan.md
  fcommit "$d" 1000000100 "ready" .ufo/waves/round-9/w1.ready
  check_has map-silent-zero 1 "$d" 9 'reason=MAP_NO_VERDICT'

  # 17 a FAIL-CLOSED counter (exit 2) fails the round with its own reason, not as a bare drift
  d="$(fixture map-fail-closed)" || return 2
  MAP_STUB=failclosed fcommit "$d" 1000000000 "gate+plan" scripts/readme-map.mjs .ufo/waves/round-9/plan.md
  fcommit "$d" 1000000100 "ready" .ufo/waves/round-9/w1.ready
  check_has map-fail-closed 1 "$d" 9 'reason=MAP_FAIL_CLOSED'

  echo "PLAN_BEFORE_READY_SELFTEST: $([ "$fail" -eq 0 ] && echo PASS || echo FAIL) ($pass/$((pass+fail))) fixtures=$root"
  [ "$fail" -eq 0 ] && return 0 || return 1
}

# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

if [ "$SELFTEST" = 1 ]; then
  run_selftest
  exit $?
fi

if [ -n "$ROUND_ONE" ] && [ -n "$ROUNDS" ]; then
  die_usage "--round and --rounds are mutually exclusive"
fi
if [ "$ALL_ROUNDS" = 1 ] && [ -n "$ROUND_ONE$ROUNDS" ]; then
  die_usage "--all is exclusive with --round/--rounds"
fi
[ "$ALL_ROUNDS" = 1 ] || [ -n "$ROUND_ONE$ROUNDS" ] || die_usage "one of --round/--rounds/--all is required"

top="$(git -C "$REPO" rev-parse --show-toplevel 2>/dev/null)" || {
  echo "plan-before-ready: not a git repository: $REPO" >&2; exit 2; }
[ "$top" = "$(cd "$REPO" && pwd -P)" ] || {
  echo "plan-before-ready: --repo is not the repository root (got $top)" >&2; exit 2; }

REV_RESOLVED="$(git -C "$REPO" rev-parse --verify "$REV^{commit}" 2>/dev/null)" || {
  echo "plan-before-ready: cannot resolve revision: $REV" >&2; exit 2; }

ROUND_LIST=()
if [ "$ALL_ROUNDS" = 1 ]; then
  # every round directory present at REV; numeric sort on the suffix
  while IFS= read -r d; do
    [ -n "$d" ] && ROUND_LIST+=("${d#round-}")
  done < <(git -C "$REPO" ls-tree --name-only "$REV_RESOLVED:.ufo/waves" 2>/dev/null \
             | grep -E '^round-[0-9]+$' | sed 's/^round-//' | sort -n | sed 's/^/round-/')
  [ "${#ROUND_LIST[@]}" -gt 0 ] || {
    echo "plan-before-ready: no .ufo/waves/round-* directories at $REV_RESOLVED" >&2; exit 2; }
  RANGE_LABEL="all(${#ROUND_LIST[@]})"
elif [ -n "$ROUND_ONE" ]; then
  lo="$(norm_round "$ROUND_ONE")" || exit 2; hi="$lo"
  ROUND_LIST+=("$lo"); RANGE_LABEL="$lo-$hi"
else
  # accept 50-63, round-50-round-63, r50-r63; norm_round strips each prefix
  RANGE="${ROUNDS#round-}"
  lo="${RANGE%%-*}"; hi="${RANGE##*-}"
  [ -n "$lo" ] && [ -n "$hi" ] || die_usage "not a round range: $ROUNDS"
  lo="$(norm_round "$lo")" || exit 2; hi="$(norm_round "$hi")" || exit 2
  [ "$lo" -le "$hi" ] || die_usage "round range is reversed: $ROUNDS"
  for ((r=lo; r<=hi; r++)); do ROUND_LIST+=("$r"); done
  RANGE_LABEL="$lo-$hi"
fi

npass=0; nfail=0; nna=0; anyfail=0; anyna=0; FAILED=(); NA_ROUNDS=(); MAP_FAILED=()
for r in "${ROUND_LIST[@]}"; do
  judge_round "$REPO" "$r"; rc=$?
  echo "$VERDICT_LINE"
  [ -n "$MAP_FAIL_REASON" ] && MAP_FAILED+=("$r")
  case "$rc" in
    0) npass=$((npass+1)) ;;
    1) nfail=$((nfail+1)); anyfail=1; FAILED+=("$r") ;;
    *) nna=$((nna+1)); anyna=1; NA_ROUNDS+=("$r") ;;
  esac
done

if [ "$anyfail" = 1 ]; then rc=1; elif [ "$anyna" = 1 ]; then rc=2; else rc=0; fi
joined() { local IFS=,; printf '%s' "$*"; }
[ "$QUIET" = 1 ] || echo "PLAN_BEFORE_READY_SUMMARY: pass=$npass fail=$nfail na=$nna rounds=$RANGE_LABEL rev=$REV_RESOLVED exit=$rc failed=$(joined "${FAILED[@]:-}") na_rounds=$(joined "${NA_ROUNDS[@]:-}") map_red=$(joined "${MAP_FAILED[@]:-}")"
exit "$rc"
