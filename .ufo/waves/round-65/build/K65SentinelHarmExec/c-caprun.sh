#!/usr/bin/env bash
# Does cap-run.mjs contain gates? Three registry gates + a hostile write/net probe, in a clone.
set -u
S=/tmp/kumitate-r65/K65SentinelHarmExec
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
C=$S/clone; rm -rf "$C"
git clone -q --no-hardlinks "$LANE" "$C" && echo clone-ok
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] && echo CLONE_TOP_OK=1
echo "clone-head=$(git -C "$C" rev-parse --short HEAD)"
for g in readme-map sources-check counter-pins; do
  echo "=== cap-run $g"
  ( cd "$C" && /usr/bin/node "$LANE/scripts/cap-run.mjs" --mem 1024 --tasks 64 --budget 300 -- /usr/bin/node "$C/scripts/$g.mjs" > "$S/cap-$g.out" 2> "$S/cap-$g.err"; echo "caprun-exit=$?" )
  echo '--- child stdout (last 3):'; tail -3 "$S/cap-$g.out"
  echo '--- runner stderr (last 2):'; tail -2 "$S/cap-$g.err"
done

echo '=== cap-run under a hostile probe'
cat > "$C/probe.mjs" <<'EOF'
import { writeFileSync } from 'node:fs';
import net from 'node:net';
const r = [];
const w = (p, name) => { try { writeFileSync(p, 'x'); r.push(name + '=WROTE'); } catch (e) { r.push(name + '=' + (e.code || e.message)); } };
w('/home/vgpnk/K65_CAPRUN_ESCAPE', 'realhome');
w((process.env.HOME || '/nonexistent') + '/K65_CAPRUN_HOME', 'envHOME');
w('/tmp/caprun-inner', 'tmp');
w('inner', 'cwd');
const netp = await new Promise((res) => { const s = net.connect({ host: '1.1.1.1', port: 443 }); const t = setTimeout(() => { s.destroy(); res('timeout'); }, 4000); s.on('connect', () => { clearTimeout(t); s.destroy(); res('open'); }); s.on('error', (e) => { clearTimeout(t); res('err:' + e.code); }); });
r.push('net=' + netp, 'cwd=' + process.cwd(), 'home=' + String(process.env.HOME), 'pid1=' + process.pid);
console.log(r.join(' '));
EOF
( cd "$C" && /usr/bin/node "$LANE/scripts/cap-run.mjs" --mem 1024 --tasks 64 --budget 120 -- /usr/bin/node "$C/probe.mjs" > "$S/cap-probe.out" 2> "$S/cap-probe.err"; echo "caprun-exit=$?" )
echo '--- probe stdout:'; cat "$S/cap-probe.out"
echo '--- runner stderr:'; tail -2 "$S/cap-probe.err"
if [ -f /home/vgpnk/K65_CAPRUN_ESCAPE ]; then echo 'HOSTHOME_WRITE=SUCCEEDED'; rm -f /home/vgpnk/K65_CAPRUN_ESCAPE; else echo 'HOSTHOME_WRITE=blocked'; fi
if [ -f /tmp/caprun-inner ]; then echo 'HOST_TMP_VISIBLE=1'; rm -f /tmp/caprun-inner; else echo 'HOST_TMP_VISIBLE=0'; fi
echo "clone-inner-exists=$(test -f "$C/inner" && echo yes || echo no)"; rm -f "$C/inner"
