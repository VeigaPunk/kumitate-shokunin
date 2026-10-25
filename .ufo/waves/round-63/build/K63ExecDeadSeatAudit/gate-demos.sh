#!/usr/bin/env bash
# gate-demos.sh — reproduce every inline-dispatch-evidence.mjs run cited by
# .ufo/waves/round-63/w1/K63ExecDeadSeatAudit.md (round-63 w1 dead-seat audit).
# Read-only against the lane; fixtures are built under /tmp. Run from the lane root.
set +e
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
GATE=$LANE/scripts/inline-dispatch-evidence.mjs
CTL=$LANE/.ufo/waves/round-63/controls/inline
SESS=/home/vgpnk/.omp/agent/sessions
R62SESS=$(find "$SESS" -maxdepth 3 -type d -name L1Kumitate62 | head -1)
T=/tmp/kumitate-r63/K63ExecDeadSeatAudit/demos
rm -rf "$T"; mkdir -p "$T"
run() { echo "### $1"; shift; "$@" 2>&1 | sed 's/^/    /'; echo "    EXIT=${PIPESTATUS[0]}"; echo; }

echo "== 1. round 63 w1 now (wave in flight: results.json not yet written)"
run "gate r63 w1" node "$GATE" --root "$LANE" --round 63 --wave w1 --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-63/kumitate.md

echo "== 2. historical rounds as committed (no ready marker / no results.json)"
for spec in "59 w1" "60 w1" "61 w2" "62 w2"; do
  set -- $spec
  run "gate r$1 $2" node "$GATE" --root "$LANE" --round "$1" --wave "$2" --report "/home/vgpnk/Projects/shokunin/.ufo/reports/round-$1/kumitate.md"
done

echo "== 3. committed honest control reads CLEAN"
run "honest control" node "$GATE" --root "$CTL/honest/lane" --round 7 --wave w1 --sessions-root "$CTL/honest/sessions" --dispatcher-log "$CTL/honest/dispatcher.log"

echo "== 4. DEAD_UNNAMED fires when a transcript exists without a yield and the report is silent"
cp -a "$CTL/honest" "$T/dead"; sed -i '/"name":"yield"/d' "$T/dead/sessions/orch/K63BetaTwo.jsonl"
printf 'nothing about any seat\n' > "$T/empty-report.md"
run "yield stripped, silent report" node "$GATE" --root "$T/dead/lane" --round 7 --wave w1 --sessions-root "$T/dead/sessions" --dispatcher-log "$T/dead/dispatcher.log" --report "$T/empty-report.md"

echo "== 5. the same dead seat passes when the report merely lists its name (no error text)"
printf 'Wave w1 dispatched seats: K63AlphaOne, K63BetaTwo, K63GammaThree. All three produced reports.\n' > "$T/roster-report.md"
run "roster-only report" node "$GATE" --root "$T/dead/lane" --round 7 --wave w1 --sessions-root "$T/dead/sessions" --dispatcher-log "$T/dead/dispatcher.log" --report "$T/roster-report.md"

echo "== 6. a seat with NO transcript at all is SESSION_ABSENT, not dead, and is never required to be named"
run "one-session-missing + silent report" node "$GATE" --root "$CTL/one-session-missing/lane" --round 7 --wave w1 --sessions-root "$CTL/one-session-missing/sessions" --dispatcher-log "$CTL/one-session-missing/dispatcher.log" --report "$T/empty-report.md"

echo "== 7. round 60 reconstructed: 27 dead in the lane record, dead=0 at the gate, no DEAD_UNNAMED"
R60=$T/r60; mkdir -p "$R60/lane/.ufo/waves/round-60"
S="$R60" node -e '
const fs=require("fs");const S=process.env.S;
const names=fs.readFileSync(process.argv[1],"utf8").trim().split("\n").map(l=>l.split("\t")[0]);
const tasks=names.map(n=>({name:n,agent:"L1Kumitate60."+n,task:`round-60 item for ${n}`}));
fs.writeFileSync(S+"/lane/.ufo/waves/round-60/w1-dispatch.json", JSON.stringify({taskCall:{context:"synthesized round-60 record (not committed in the lane)",tasks}},null,1));
fs.writeFileSync(S+"/lane/.ufo/waves/round-60/w1-results.json", JSON.stringify({round:60,wave:"w1",seats:tasks.length,results:tasks.map(t=>({name:t.name,agent:t.agent}))},null,1));
fs.writeFileSync(S+"/lane/.ufo/waves/round-60/w1.ready", JSON.stringify({round:60,wave:"w1",l1:"L1Kumitate60",lane:"kumitate",dispatch:S+"/lane/.ufo/waves/round-60/w1-dispatch.json"}));
fs.writeFileSync(S+"/lane/.ufo/waves/round-60/w1.ready.dispatched","{}");
fs.writeFileSync(S+"/dispatcher.log","2026-10-24T23:43:00 spawned kumitate 60 w1 32\n2026-10-25T02:44:00 done kumitate w1 "+S+"/lane/.ufo/waves/round-60/w1-results.json\n");
' "$LANE/.ufo/waves/round-60/w1/launcher-progress.tsv"
run "r60 synthesized record + real sessions root" node "$GATE" --root "$R60/lane" --round 60 --wave w1 --sessions-root "$SESS" --dispatcher-log "$R60/dispatcher.log" --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-60/kumitate.md

echo "== 8. round 62: committed w2-dispatch.json has no taskCall wrapper"
R62=$T/r62; mkdir -p "$R62/lane/.ufo/waves/round-62" "$R62/sessions"
cp "$LANE/.ufo/waves/round-62/w2-dispatch.json" "$R62/lane/.ufo/waves/round-62/"
for f in "$R62SESS"/L1Kumitate62.*.jsonl; do b=$(basename "$f"); cp "$f" "$R62/sessions/${b#L1Kumitate62.}"; done
S="$R62" node -e '
const fs=require("fs");const S=process.env.S;
const d=JSON.parse(fs.readFileSync(S+"/lane/.ufo/waves/round-62/w2-dispatch.json","utf8"));
const tasks=d.tasks.map(t=>({...t,agent:"L1Kumitate62."+t.name}));
fs.writeFileSync(S+"/lane/.ufo/waves/round-62/w2-results.json", JSON.stringify({round:62,wave:"w2",seats:tasks.length,results:tasks.map(t=>({name:t.name,agent:t.agent}))},null,1));
fs.writeFileSync(S+"/lane/.ufo/waves/round-62/w2.ready", JSON.stringify({round:62,wave:"w2",l1:"L1Kumitate62",lane:"kumitate",dispatch:S+"/lane/.ufo/waves/round-62/w2-dispatch.json"}));
fs.writeFileSync(S+"/lane/.ufo/waves/round-62/w2.ready.dispatched","{}");
fs.writeFileSync(S+"/dispatcher.log","2026-10-25T13:27:00 spawned kumitate 62 w2 40\n2026-10-25T14:00:00 done kumitate w2 "+S+"/lane/.ufo/waves/round-62/w2-results.json\n");
'
run "r62 committed dispatch shape" node "$GATE" --root "$R62/lane" --round 62 --wave w2 --sessions-root "$R62/sessions" --dispatcher-log "$R62/dispatcher.log" --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-62/kumitate.md

echo "== 9. round 62 with a synthesized taskCall wrapper and the real transcripts: identity does not bind"
S="$R62" node -e '
const fs=require("fs");const p=process.env.S+"/lane/.ufo/waves/round-62/w2-dispatch.json";
const d=JSON.parse(fs.readFileSync(p,"utf8"));
fs.writeFileSync(p, JSON.stringify({taskCall:{context:d.context,tasks:d.tasks.map(t=>({...t,agent:"L1Kumitate62."+t.name}))}},null,1));
'
run "r62 wrapped + real transcripts" node "$GATE" --root "$R62/lane" --round 62 --wave w2 --sessions-root "$R62/sessions" --dispatcher-log "$R62/dispatcher.log" --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-62/kumitate.md
echo "== 10. what the real round-62 seat prompt actually carried (no seat marker, no committed context)"
S="$R62" node -e '
const fs=require("fs");const raw=fs.readFileSync(process.env.S+"/sessions/Audit01.jsonl","utf8").split("\n").filter(Boolean);
for(const l of raw){let r;try{r=JSON.parse(l)}catch{continue}
 if(r.type==="message"&&r.message&&r.message.role==="user"){const t=r.message.content.map(c=>c.text||"").join("");console.log("    user-head:",JSON.stringify(t.slice(0,180)));console.log("    has-seat-marker:",t.includes("# Seat "));break;}}
'
