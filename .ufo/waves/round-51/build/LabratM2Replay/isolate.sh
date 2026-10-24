#!/usr/bin/env bash
# isolate.sh — clean, confound-free confirmation of the ledger-rule question.
# Each case gets its OWN directory; no other file is ever present.
#
# usage: isolate.sh <tool.mjs> <workdir>
set -u
TOOL="$1"; WORK="$2"
rm -rf "$WORK"; mkdir -p "$WORK"; cd "$WORK" || exit 2

run() { echo "\$ $*"; "$@"; echo "EXIT=$?"; echo; }
runenv() { local e="$1"; shift; echo "\$ (env $e) $*"; env "$e" "$@"; echo "EXIT=$?"; echo; }
mkreceipt() { node "$TOOL" run --out "$1" -- /bin/sh -c "printf $2" >/dev/null; }
redate() { # rewrite ONLY the run-at prelude of $1 in place
  node -e '
const fs=require("fs");const p=process.argv[1];
const l=fs.readFileSync(p,"utf8").split("\n");l[0]="run-at: 2030-01-01T00:00:00.000Z";fs.writeFileSync(p,l.join("\n"));' "$1"
}
residecar() { ( cd "$(dirname "$1")" && sha256sum "$(basename "$1")" > "$(basename "$1").sha256" ); }
digestof() { node -e 'const fs=require("fs");const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8").split("\n").find(l=>l.startsWith("{")));process.stdout.write(j.digest)' "$1"; }

echo "================================================================"
echo "ISOLATED ledger-rule matrix — each case in its own directory"
echo "tool: $TOOL   sha256: $(sha256sum "$TOOL" | cut -d' ' -f1)"
echo "================================================================"
echo

# ---------------------------------------------------------------- CASE 1
echo "### CASE 1 — genuine run-1 + a prelude-rewritten copy whose sidecar was RECOMPUTED"
echo "###          (the forger defeats the sidecar arm; same JSON body => same inner digest)"
C1="$WORK/case1"; mkdir -p "$C1"
mkreceipt "$C1/attest-run-1" one
cp "$C1/attest-run-1.txt" "$C1/attest-run-2-forged.txt"
redate "$C1/attest-run-2-forged.txt"
residecar "$C1/attest-run-2-forged.txt"
printf '  digest run-1   : %s\n' "$(digestof "$C1/attest-run-1.txt")"
printf '  digest forged  : %s\n' "$(digestof "$C1/attest-run-2-forged.txt")"
for RULE in l1frozen intact literal; do
  echo "  -- rule=$RULE, verify --ledger over the dir --"
  runenv "RECEIPT_ATTEST_LEDGER=$RULE" node "$TOOL" verify --ledger "$C1" "$C1/attest-run-2-forged.txt"
done
echo

# ---------------------------------------------------------------- CASE 2
echo "### CASE 2 — genuine run-1 + a prelude-rewritten copy whose sidecar was NOT recomputed"
echo "###          (the exact lesson-M2 move; the A3 committed control's shape)"
C2="$WORK/case2"; mkdir -p "$C2"
mkreceipt "$C2/attest-run-1" one
cp "$C2/attest-run-1.txt" "$C2/attest-run-2-replayed.txt"
redate "$C2/attest-run-2-replayed.txt"
cp "$C2/attest-run-1.txt.sha256" "$C2/attest-run-2-replayed.txt.sha256"
echo "  -- no ledger (the A3 arm's exact call) --"
run node "$TOOL" verify "$C2/attest-run-2-replayed.txt"
for RULE in l1frozen intact literal; do
  echo "  -- rule=$RULE, verify --ledger over the dir --"
  runenv "RECEIPT_ATTEST_LEDGER=$RULE" node "$TOOL" verify --ledger "$C2" "$C2/attest-run-2-replayed.txt"
done
echo

# ---------------------------------------------------------------- CASE 3
echo "### CASE 3 — the counter's A4 arm: genuine run-2 + its stale-sidecar twin in one dir"
echo "###          (A4 requires attest-run-2.txt to verify VALID under --ledger)"
C3="$WORK/case3"; mkdir -p "$C3"
mkreceipt "$C3/attest-run-1" one
mkreceipt "$C3/attest-run-2" two
mkreceipt "$C3/attest-run-3" three
cp "$C3/attest-run-2.txt" "$C3/attest-run-2-replayed.txt"
redate "$C3/attest-run-2-replayed.txt"
cp "$C3/attest-run-2.txt.sha256" "$C3/attest-run-2-replayed.txt.sha256"
for RULE in l1frozen intact literal; do
  echo "  -- rule=$RULE, verify --ledger attest-run-2.txt --"
  runenv "RECEIPT_ATTEST_LEDGER=$RULE" node "$TOOL" verify --ledger "$C3" "$C3/attest-run-2.txt"
done
echo

# ---------------------------------------------------------------- CASE 4
echo "### CASE 4 — the item's requested variant: NEW body (recomputed inner digest), OLD nonce"
echo "###          + recomputed sidecar; verified with --ledger over a 3-receipt dir"
C4="$WORK/case4"; mkdir -p "$C4"
mkreceipt "$C4/attest-run-1" one
mkreceipt "$C4/attest-run-2" two
mkreceipt "$C4/attest-run-3" three
node -e '
const fs=require("fs"),c=require("crypto"),path=require("path");
const src=process.argv[1],dst=process.argv[2];
const canon=(v)=>Array.isArray(v)?"["+v.map(canon).join(",")+"]":(v&&typeof v==="object"?"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+canon(v[k])).join(",")+"}":JSON.stringify(v));
const j=JSON.parse(fs.readFileSync(src,"utf8").split("\n").find(l=>l.startsWith("{")));
const f={...j}; delete f.digest;
f.wall_start="2030-01-01T00:00:00.000Z"; f.wall_end="2030-01-01T00:00:01.000Z";
const full={...f,digest:c.createHash("sha256").update(canon(f)).digest("hex")};
const b=Buffer.from("run-at: "+f.wall_start+"\n"+canon(full)+"\n");
fs.writeFileSync(dst,b);
fs.writeFileSync(dst+".sha256",c.createHash("sha256").update(b).digest("hex")+"  "+path.basename(dst)+"\n");
' "$C4/attest-run-1.txt" "$C4/attest-run-4-oldnonce.txt"
for RULE in l1frozen intact literal; do
  echo "  -- rule=$RULE, verify --ledger attest-run-4-oldnonce.txt --"
  runenv "RECEIPT_ATTEST_LEDGER=$RULE" node "$TOOL" verify --ledger "$C4" "$C4/attest-run-4-oldnonce.txt"
done
echo "### DONE"
