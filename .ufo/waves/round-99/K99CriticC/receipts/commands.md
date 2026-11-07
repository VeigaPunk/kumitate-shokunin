# H99 command receipt (K99CriticC)

All commands run 2026-11-07, cwd `/fast/scratch/hyaku/kumitate-r99/K99CriticC` (scratch) or the seat dir.
Host cwd for every command was the fleet root only where a relative path was never written.

## Inputs (read-only)
```
cat /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99ExecTool/READY
  -> 50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99ExecTool/sources-check.mjs
  -> 50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31  (matches READY)
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show f9cd1bff:scripts/sources-check.mjs > tools/base.mjs
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show f9cd1bff:scripts/cap-spawn.mjs > tools/cap-spawn.mjs
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show f9cd1bff:scripts/cap-run.mjs   > tools/cap-run.mjs
sha256sum tools/base.mjs -> 1def379fb98555c6a648f0585c0ff61faaf812218d688589e5c831bc16dd780b  (== ctl-nothing)
python3 probe/make-controls99.py controls   # frozen generator, 17 sha256 all match controls/controls-sha256.txt
cp K99ExecTool/sources-check.mjs tools/cand-ready-50b94567.mjs   # the READY bytes, run from my scratch
sha256sum /home/vgpnk/Projects/shokunin/scripts/sources-census.sh
  -> 3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30
```

## Generator (seeded; prints the seed)
```
python3 h99gen.py --seed 88cfbc703ba9d731 --out fx1 --manifest manifest-fx1.json
  -> fixtures=932 excluded=16
     families=A:630 B:80 C:33 D:12 E:26 F:12 G:8 H:65 I:30 J:16 K:8 L:12
python3 h99gen.py --seed 526073babd5a8d03 --out fx2 --manifest manifest-fx2.json   # confirmation seed
```
Each fixture is a lane directory `corpus/SOURCES.md` (+ empty `corpus/knowledge/`, `corpus/lessons/u.md`);
the data row is line 7 (one row per fixture; duplicate families carry two or three rows).

## Differential (census live on the same file + tool `--json`)
```
node h99diff.py --manifest manifest-fx1.json \
  --tools cand-READY-50b94567=tools/cand-ready-50b94567.mjs \
  --tools BASE-f9cd1bff=tools/base.mjs \
  --out full --jobs 6 --scratch . --emptyroot emptyroot
```
per fixture it runs, with `LANG=LC_ALL=C.UTF-8`, `TZ=UTC`, `TMPDIR=<scratch>/tmp`,
`SHOKUNIN_ROOT=<empty dir>`:
```
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <fx>/corpus/SOURCES.md --today 2026-11-07
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh census   --file <fx>/corpus/SOURCES.md --today 2026-11-07
node <tool> --self <fx> --today 2026-11-07 --json
```
Observed (both seeds identical except the seed):
```
cand-READY-50b94567: rows=943 agree=943 disagree=0 counts_bad=0 problems=0
BASE-f9cd1bff:       rows=943 agree=704 disagree=239 counts_bad=121 problems=0
```

## Analysis / null test
```
python3 h99analyze.py --manifest manifest-fx1.json --results full/results.json --out full/analysis.json
  -> pad classes 105/105; base control: 270 possible-divergence fixtures, 231 disagreed,
     0 unexplained, 633 fixtures with no possible divergence and no disagreement; census model bad 0
```

## Minimal one-row fixtures
```
python3 minimal.py          # 13 one-row lanes under <scratch>/minimal/, census+cand+BASE on each
  -> receipts/minimal.md
```

## Oracle stability (census under LC_ALL=C)
```
python3 locale_check.py     # 128 fixtures (13 minimal + every 8th scored) re-run census validate with LC_ALL=C
  -> 128 fixtures, 0 differ on the mapped E-code lines
```
