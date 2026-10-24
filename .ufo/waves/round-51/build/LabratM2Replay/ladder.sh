#!/usr/bin/env bash
# ladder.sh — the full forger ladder against a receipt-attest implementation.
# Each rung is a fresh directory so no rung contaminates another.
#
# usage: ladder.sh <tool.mjs> <workdir>
set -u
TOOL="$1"; WORK="$2"
rm -rf "$WORK"; mkdir -p "$WORK"; cd "$WORK" || exit 2

step() { echo; echo "--- $1"; }
verdict() { local f="$1"; shift; local out rc; out=$(node "$TOOL" verify "$@" "$f" 2>&1); rc=$?; printf '    %-58s -> %s (exit=%s)\n' "$(basename "$f")" "$out" "$rc"; }
mk() { node "$TOOL" run --out "$1" -- /bin/sh -c "printf $2" >/dev/null 2>&1; }
redate() { node -e '
const fs=require("fs");const p=process.argv[1],t=process.argv[2];
const l=fs.readFileSync(p,"utf8").split("\n");l[0]="run-at: "+t;fs.writeFileSync(p,l.join("\n"));' "$1" "$2"; }
residecar() { ( cd "$(dirname "$1")" && sha256sum "$(basename "$1")" > "$(basename "$1").sha256" ); }
rebody() { # rewrite a semantic field AND the prelude, then recompute digest + sidecar
node -e '
const fs=require("fs"),c=require("crypto"),path=require("path");
const canon=(v)=>Array.isArray(v)?"["+v.map(canon).join(",")+"]":(v&&typeof v==="object"?"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+canon(v[k])).join(",")+"}":JSON.stringify(v));
const p=process.argv[1],t=process.argv[2],fresh=process.argv[3]==="fresh";
const lines=fs.readFileSync(p,"utf8").split("\n");
const ji=lines.findIndex(l=>l.startsWith("{"));
const o=JSON.parse(lines[ji]);
o.wall_start=t; o.wall_end=new Date(Date.parse(t)+1000).toISOString();
if("wall_start_ms" in o) o.wall_start_ms=Date.parse(t);
if("wall_end_ms" in o) o.wall_end_ms=Date.parse(t)+1000;
if(fresh) o.nonce=c.randomBytes(16).toString("hex");
const {digest,...rf}=o;
o.digest=c.createHash("sha256").update(canon(rf)).digest("hex");
lines[0]="run-at: "+t; lines[ji]=canon(o);
const b=Buffer.from(lines.join("\n"),"utf8");
fs.writeFileSync(p,b);
fs.writeFileSync(p+".sha256",c.createHash("sha256").update(b).digest("hex")+"  "+path.basename(p)+"\n");
' "$1" "$2" "$3"; }

echo "================================================================"
echo "FORGER LADDER — tool: $TOOL"
echo "sha256: $(sha256sum "$TOOL" | cut -d' ' -f1)"
echo "================================================================"

step "RUNG 0 — genuine receipt (baseline: must be VALID)"
D=$WORK/r0; mkdir -p $D; mk $D/attest-run-1 one
verdict $D/attest-run-1.txt

step "RUNG 1 — exact lesson-M2 move: rewrite ONLY the prelude, KEEP the old sidecar"
D=$WORK/r1; mkdir -p $D; mk $D/attest-run-1 one
cp $D/attest-run-1.txt $D/attest-run-2-replayed.txt
redate $D/attest-run-2-replayed.txt "2030-01-01T00:00:00.000Z"
cp $D/attest-run-1.txt.sha256 $D/attest-run-2-replayed.txt.sha256
verdict $D/attest-run-2-replayed.txt

step "RUNG 2 — the forger REFRESHES the sidecar over the re-dated bytes (no secret needed)"
D=$WORK/r2; mkdir -p $D; mk $D/attest-run-1 one
cp $D/attest-run-1.txt $D/attest-run-2-replayed.txt
redate $D/attest-run-2-replayed.txt "2030-01-01T00:00:00.000Z"
residecar $D/attest-run-2-replayed.txt
verdict $D/attest-run-2-replayed.txt
echo "    with --ledger over the dir holding the original:"
verdict $D/attest-run-2-replayed.txt --ledger $D

step "RUNG 3 — the M2 PRESENTATION: ONE genuine invocation shown as THREE time-spaced runs"
D=$WORK/r3; mkdir -p $D; mk $D/attest-run-1 only-one-real-run
for i in 2 3; do
  cp $D/attest-run-1.txt $D/attest-run-$i.txt
  redate $D/attest-run-$i.txt "$(date -u -d "+$(( (i-1)*600 )) seconds" +%Y-%m-%dT%H:%M:%S.000Z)"
  residecar $D/attest-run-$i.txt
done
for i in 1 2 3; do verdict $D/attest-run-$i.txt --ledger $D; done

step "RUNG 4 — re-dated AND re-bodied (semantic clocks rewritten), OLD nonce, digest+sidecar recomputed"
D=$WORK/r4; mkdir -p $D; mk $D/attest-run-1 one
cp $D/attest-run-1.txt $D/attest-run-2.txt
rebody $D/attest-run-2.txt "2030-01-01T00:00:00.000Z" old
verdict $D/attest-run-2.txt --ledger $D

step "RUNG 5 — full forge: FRESH nonce + re-dated + recomputed digest + recomputed sidecar"
D=$WORK/r5; mkdir -p $D; mk $D/attest-run-1 one
cp $D/attest-run-1.txt $D/attest-run-2.txt
rebody $D/attest-run-2.txt "2030-01-01T00:00:00.000Z" fresh
verdict $D/attest-run-2.txt --ledger $D
echo "    (RUNG 5 is the kept Q39 ceiling: an unkeyed digest cannot detect a wholly"
echo "     invented record. The plan keeps this ceiling verbatim.)"
echo "### DONE"
