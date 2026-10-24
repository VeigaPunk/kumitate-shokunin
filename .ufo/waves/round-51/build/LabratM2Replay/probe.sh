#!/usr/bin/env bash
# probe.sh — LabratM2Replay: end-to-end probe of the exact lesson-M2 forgery against
# the genuine receipt-attest implementation (contract kumitate-receipt-attest-v1).
#
# usage: probe.sh <tool.mjs> <workdir>
# Pure scratch: writes only under <workdir>.
set -u
TOOL="$1"; WORK="$2"
rm -rf "$WORK"; mkdir -p "$WORK"
cd "$WORK" || exit 2

run() { echo "\$ $*"; "$@"; echo "EXIT=$?"; echo; }
runenv() { local e="$1"; shift; echo "\$ (env $e) $*"; env "$e" "$@"; echo "EXIT=$?"; echo; }
nonces() { for f in "$1"/*.txt; do printf '  %-30s nonce=%s\n' "$(basename "$f")" "$(node -e 'const fs=require("fs");const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8").split("\n").find(l=>l.startsWith("{")));process.stdout.write(j.nonce)' "$f")"; done; }
digest() { node -e 'const fs=require("fs");const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8").split("\n").find(l=>l.startsWith("{")));process.stdout.write(j.digest)' "$1"; }

echo "================================================================"
echo "LabratM2Replay — probe of the lesson-M2 forgery"
echo "tool        : $TOOL"
echo "tool sha256 : $(sha256sum "$TOOL" | cut -d' ' -f1)"
echo "date        : $(date -Is)"
echo "node        : $(node -v)"
echo "workdir     : $WORK"
echo "================================================================"
echo

echo "############ SECTION 1 — genuine receipt ############"
echo "### 1.1 run"
run node "$TOOL" run --out "$WORK/r/attest-run-1" -- /bin/sh -c 'printf "hello-stdout"; printf "hello-stderr" 1>&2; exit 0'
echo "### 1.2 receipt bytes"
cat "$WORK/r/attest-run-1.txt"
echo "### 1.3 sidecar (GNU sha256sum format)"
cat "$WORK/r/attest-run-1.txt.sha256"
echo "### 1.4 sha256sum -c accepts the sidecar"
( cd "$WORK/r" && sha256sum -c attest-run-1.txt.sha256; echo "EXIT=$?" )
echo
echo "### 1.5 verify the genuine receipt"
run node "$TOOL" verify "$WORK/r/attest-run-1.txt"

echo
echo "############ SECTION 2 — the exact M2 forgery: rewrite ONLY the run-at prelude, keep the OLD sidecar ############"
cp "$WORK/r/attest-run-1.txt" "$WORK/r/attest-run-2-replayed.txt"
node -e '
const fs=require("fs");const p=process.argv[1],fake=process.argv[2];
const l=fs.readFileSync(p,"utf8").split("\n");
if(!l[0].startsWith("run-at:")) throw new Error("prelude is not the first line");
l[0]=fake; fs.writeFileSync(p,l.join("\n"));' "$WORK/r/attest-run-2-replayed.txt" "run-at: $(date -u -d '+2 hours' +%Y-%m-%dT%H:%M:%S.000Z)"
cp "$WORK/r/attest-run-1.txt.sha256" "$WORK/r/attest-run-2-replayed.txt.sha256"
echo "### 2.1 diff genuine vs forged (only the prelude line may differ)"
diff "$WORK/r/attest-run-1.txt" "$WORK/r/attest-run-2-replayed.txt"; echo "DIFF_EXIT=$?"
echo "### 2.2 the kept (stale) sidecar — note it names attest-run-1.txt"
cat "$WORK/r/attest-run-2-replayed.txt.sha256"
echo "### 2.3 VERDICT: verify the forged receipt  [expect RECEIPT: TAMPERED, exit 1]"
run node "$TOOL" verify "$WORK/r/attest-run-2-replayed.txt"
echo "### 2.4 the same forgery with NO sidecar file of its own (plan's 'sidecar untouched', reading #2)"
cp "$WORK/r/attest-run-2-replayed.txt" "$WORK/r/attest-run-2b-nosidecar.txt"
run node "$TOOL" verify "$WORK/r/attest-run-2b-nosidecar.txt"
echo "### 2.5 the same forgery, sidecar kept, verified WITH --ledger over the dir holding the original"
run node "$TOOL" verify --ledger "$WORK/r" "$WORK/r/attest-run-2-replayed.txt"

echo
echo "############ SECTION 3 — variant: the forger RECOMPUTES the sidecar over the tampered bytes ############"
cp "$WORK/r/attest-run-2-replayed.txt" "$WORK/r/attest-run-3-residecar.txt"
( cd "$WORK/r" && sha256sum attest-run-3-residecar.txt > attest-run-3-residecar.txt.sha256 )
echo "### 3.1 the new sidecar matches the doctored bytes"
cat "$WORK/r/attest-run-3-residecar.txt.sha256"
echo "### 3.2 digests: the forged body is byte-identical to the original body"
printf '  attest-run-1.txt           digest=%s\n' "$(digest "$WORK/r/attest-run-1.txt")"
printf '  attest-run-3-residecar.txt digest=%s\n' "$(digest "$WORK/r/attest-run-3-residecar.txt")"
echo "### 3.3 verify WITHOUT a ledger"
run node "$TOOL" verify "$WORK/r/attest-run-3-residecar.txt"
echo "### 3.4 verify WITH --ledger over the dir holding the original run-1"
run node "$TOOL" verify --ledger "$WORK/r" "$WORK/r/attest-run-3-residecar.txt"

echo
echo "############ SECTION 4 — the 3-receipt ledger dir (the item's ledger probe) ############"
mkdir -p "$WORK/ledger3"
node "$TOOL" run --out "$WORK/ledger3/attest-run-1" -- /bin/sh -c 'printf one' >/dev/null; echo "run1 EXIT=$?"
node "$TOOL" run --out "$WORK/ledger3/attest-run-2" -- /bin/sh -c 'printf two' >/dev/null; echo "run2 EXIT=$?"
echo "### 4.1 forged third receipt: body copied from run-1, prelude re-dated, sidecar RECOMPUTED"
cp "$WORK/ledger3/attest-run-1.txt" "$WORK/ledger3/attest-run-3-forged.txt"
node -e '
const fs=require("fs");const p=process.argv[1];
const l=fs.readFileSync(p,"utf8").split("\n");l[0]="run-at: 2030-01-01T00:00:00.000Z";fs.writeFileSync(p,l.join("\n"));' "$WORK/ledger3/attest-run-3-forged.txt"
( cd "$WORK/ledger3" && sha256sum attest-run-3-forged.txt > attest-run-3-forged.txt.sha256 )
ls -l "$WORK/ledger3" | sed 's/^/  /'
nonces "$WORK/ledger3"
echo "### 4.2 VERDICT: verify --ledger attest-run-3-forged.txt  [expect REPLAY: nonce reuse]"
run node "$TOOL" verify --ledger "$WORK/ledger3" "$WORK/ledger3/attest-run-3-forged.txt"
echo "### 4.3 verify --ledger attest-run-1.txt (the GENUINE receipt; its forged twin shares its nonce)"
run node "$TOOL" verify --ledger "$WORK/ledger3" "$WORK/ledger3/attest-run-1.txt"
echo "### 4.4 verify --ledger attest-run-2.txt (unrelated nonce)"
run node "$TOOL" verify --ledger "$WORK/ledger3" "$WORK/ledger3/attest-run-2.txt"

echo
echo "############ SECTION 5 — counter layout: run-2 and its stale-sidecar twin in ONE dir ############"
echo "(mirrors the frozen A3/A4 arms: attest-run-{1,2,3}.txt + attest-run-2-replayed.txt share a dir)"
mkdir -p "$WORK/counter"
for i in 1 2 3; do
  node "$TOOL" run --out "$WORK/counter/attest-run-$i" -- /bin/sh -c "printf run$i" >/dev/null
  node -e '
  const fs=require("fs"),c=require("crypto"),path=require("path");
  const p=process.argv[1],t=process.argv[2];
  const l=fs.readFileSync(p,"utf8").split("\n");l[0]="run-at: "+t;
  fs.writeFileSync(p,l.join("\n"));
  const b=fs.readFileSync(p);
  fs.writeFileSync(p+".sha256",c.createHash("sha256").update(b).digest("hex")+"  "+path.basename(p)+"\n");' \
    "$WORK/counter/attest-run-$i.txt" "$(date -u -d "+$(( (i-1)*400 )) seconds" +%Y-%m-%dT%H:%M:%S.000Z)"
done
cp "$WORK/counter/attest-run-2.txt" "$WORK/counter/attest-run-2-replayed.txt"
node -e '
const fs=require("fs");const p=process.argv[1];
const l=fs.readFileSync(p,"utf8").split("\n");l[0]="run-at: 2031-01-01T00:00:00.000Z";fs.writeFileSync(p,l.join("\n"));' "$WORK/counter/attest-run-2-replayed.txt"
cp "$WORK/counter/attest-run-2.txt.sha256" "$WORK/counter/attest-run-2-replayed.txt.sha256"
nonces "$WORK/counter"
echo "### 5.1 A3 arm: verify the doctored control (stale sidecar) -> must be TAMPERED exit 1"
run node "$TOOL" verify "$WORK/counter/attest-run-2-replayed.txt"
echo "### 5.2 A4 arm: verify --ledger each of the three genuine receipts -> must be VALID exit 0"
for i in 1 2 3; do echo "-- attest-run-$i.txt --"; run node "$TOOL" verify --ledger "$WORK/counter" "$WORK/counter/attest-run-$i.txt"; done

echo
echo "############ SECTION 6 — the three forger sub-variants, isolated ############"
echo "### 6.1 (b) genuinely NEW body, OLD nonce, recomputed inner digest + recomputed sidecar"
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
' "$WORK/ledger3/attest-run-1.txt" "$WORK/ledger3/attest-run-5-oldnonce-newbody.txt"
run node "$TOOL" verify --ledger "$WORK/ledger3" "$WORK/ledger3/attest-run-5-oldnonce-newbody.txt"
echo "### 6.2 (c) fully forged: FRESH nonce + recomputed inner digest + recomputed sidecar"
node -e '
const fs=require("fs"),c=require("crypto"),path=require("path");
const src=process.argv[1],dst=process.argv[2];
const canon=(v)=>Array.isArray(v)?"["+v.map(canon).join(",")+"]":(v&&typeof v==="object"?"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+canon(v[k])).join(",")+"}":JSON.stringify(v));
const j=JSON.parse(fs.readFileSync(src,"utf8").split("\n").find(l=>l.startsWith("{")));
const f={...j}; delete f.digest;
f.nonce=c.randomBytes(16).toString("hex");
f.wall_start="2030-01-01T00:00:00.000Z"; f.wall_end="2030-01-01T00:00:01.000Z";
const full={...f,digest:c.createHash("sha256").update(canon(f)).digest("hex")};
const b=Buffer.from("run-at: "+f.wall_start+"\n"+canon(full)+"\n");
fs.writeFileSync(dst,b);
fs.writeFileSync(dst+".sha256",c.createHash("sha256").update(b).digest("hex")+"  "+path.basename(dst)+"\n");
' "$WORK/ledger3/attest-run-1.txt" "$WORK/ledger3/attest-run-6-fullforge.txt"
run node "$TOOL" verify --ledger "$WORK/ledger3" "$WORK/ledger3/attest-run-6-fullforge.txt"
echo "(6.2 is the kept Q39 ceiling: the digest is an unkeyed sha256, so a wholly invented"
echo " receipt is indistinguishable from a genuine one. Not a defect; the ceiling.)"

echo
echo "############ SECTION 7 — ledger-rule matrix (the three readings of the --ledger arm) ############"
for RULE in l1frozen intact literal; do
  echo "--- rule=$RULE : forged twin with RECOMPUTED sidecar, --ledger over the 3-dir ---"
  runenv "RECEIPT_ATTEST_LEDGER=$RULE" node "$TOOL" verify --ledger "$WORK/ledger3" "$WORK/ledger3/attest-run-3-forged.txt"
  echo "--- rule=$RULE : genuine run-2 in the counter dir (its stale-sidecar twin is present) ---"
  runenv "RECEIPT_ATTEST_LEDGER=$RULE" node "$TOOL" verify --ledger "$WORK/counter" "$WORK/counter/attest-run-2.txt"
done

echo
echo "############ SECTION 8 — prelude-binding knob (does the re-dated prelude survive a recomputed sidecar?) ############"
echo "--- 8.1 RECEIPT_ATTEST_PRELUDE_BIND=0 (contract default: prelude is display-only) ---"
runenv "RECEIPT_ATTEST_PRELUDE_BIND=0" node "$TOOL" verify "$WORK/r/attest-run-3-residecar.txt"
echo "--- 8.2 RECEIPT_ATTEST_PRELUDE_BIND=1 (prelude must equal the digest-bound wall_start) ---"
runenv "RECEIPT_ATTEST_PRELUDE_BIND=1" node "$TOOL" verify "$WORK/r/attest-run-3-residecar.txt"
echo "--- 8.3 PRELUDE_BIND=1 on a genuine receipt (must stay VALID) ---"
runenv "RECEIPT_ATTEST_PRELUDE_BIND=1" node "$TOOL" verify "$WORK/r/attest-run-1.txt"

echo
echo "############ SECTION 9 — selftest of the probed implementation ############"
run node "$TOOL" --selftest
echo "### DONE"
