set -e
S=/fast/scratch/hyaku/kumitate-r91/K91Sentinel
D=$S/ext/race2; rm -rf "$D"; mkdir -p "$D"
printf 'REAL\n' > "$D/real"; printf 'OTHER\n' > "$D/other"
DIG=$(sha256sum "$D/other" | cut -d' ' -f1)
mkdir -p "$S/rcpt/A7b"
printf 'rev=%s\ntool_sha256=%s\ncmd=node %s/inst\nexit=0\n' "$(git -C $S/fixture-lane rev-parse HEAD)" "$DIG" "$D" > "$S/rcpt/A7b/a.txt"
cat > "$S/racer_a7b.py" <<'PY'
import os,sys,time
d,real,other,path=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]
t0=time.time()
while time.time()-t0<40:
    try:
        os.symlink(os.path.basename(other), d+'.l'); os.replace(d+'.l', path)
        os.link(real, d+'.r'); os.replace(d+'.r', path)
    except OSError: pass
PY
python3 "$S/racer_a7b.py" "$D" "$D/real" "$D/other" "$D/inst" &
RP=$!
sleep 0.3
for i in $(seq 1 40); do
  prlimit --as=2147483648 -- timeout 5 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/controls/ref-fd-fstat.mjs --dir "$S/rcpt/A7b" --rev "$(git -C $S/fixture-lane rev-parse HEAD)" --lane "$S/fixture-lane" 2>&1 | grep -E "RECEIPT_BIND" || echo "NO-VERDICT"
done | sort | uniq -c | sort -rn
kill $RP 2>/dev/null || true
