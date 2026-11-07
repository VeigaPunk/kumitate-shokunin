#!/usr/bin/env python3
"""Build K98CriticA constructions: ctl-positive (R98 reference) patched into
wrong-but-plausible row recognisers that violate R98 on inputs the frozen
counter's battery never draws. Writes only into the seat scratch."""
import pathlib, sys

SRC = pathlib.Path('/fast/scratch/hyaku/kumitate-r98/K98CriticA/ctl/ctl-positive.mjs')
OUT = pathlib.Path('/fast/scratch/hyaku/kumitate-r98/K98CriticA/tools')
OUT.mkdir(parents=True, exist_ok=True)
base = SRC.read_text()

POS = "/^ {0,3}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/"
CONST = f"const SOURCES_ROW_RE = {POS};\n"
assert base.count(CONST) == 1, 'POS const anchor'

def const(rx):
    b = base.replace(CONST, f"const SOURCES_ROW_RE = {rx};\n")
    assert b != base
    return b

variants = {}

# C1 pad count capped at 3 (battery draws pads of length 1 and 2 only)
variants['k98-padcap3'] = const("/^ {0,3}\\|[ \\t]{0,3}S\\d{3,}[ \\t]{0,3}\\|/")

# C2 soft hyphen U+00AD (Cf) accepted as id-cell pad -- a Cf class sample the battery never draws
variants['k98-shy'] = const("/^ {0,3}\\|[ \\t\\u00ad]*S\\d{3,}[ \\t\\u00ad]*\\|/")

# C3 C0 controls U+0008 / U+001F accepted as pad (neither White_Space nor Cf; never drawn)
variants['k98-c0'] = const("/^ {0,3}\\|[ \\t\\u0008\\u001f]*S\\d{3,}[ \\t\\u0008\\u001f]*\\|/")

# C4 Hangul fillers U+115F U+3164 U+FFA0 accepted as pad (Lo; never drawn)
variants['k98-hangulfill'] = const("/^ {0,3}\\|[ \\t\\u115f\\u3164\\uffa0]*S\\d{3,}[ \\t\\u115f\\u3164\\uffa0]*\\|/")

# C5 id length capped at 7 digits (battery draws 7-digit and 2-digit ids only)
variants['k98-idcap7'] = const("/^ {0,3}\\|[ \\t]*S\\d{3,7}[ \\t]*\\|/")

# C6 strips U+200E / U+200F marks before matching (never drawn)
b = base
anchor = "  for (const line of sourcesText.split('\\n')) {\n"
assert b.count(anchor) == 1
b = b.replace(anchor, "  for (const rawLine of sourcesText.split('\\n')) {\n    const line = rawLine.replace(/[\\u200e\\u200f]/g, '');\n")
variants['k98-lrmstrip'] = b

# C7 (control-of-controls) rejected rows skipped in the outside branch (base selftest arm xxiii draws one)
b = base
anchor = "    if (!inReg) { outside.push(fields[1].trim()); continue; }\n"
assert b.count(anchor) == 1
b = b.replace(anchor, "    if (!inReg) { if ((fields[8] ?? '').trim().toLowerCase() === 'rejected') continue; outside.push(fields[1].trim()); continue; }\n")
variants['k98-rejskip'] = b

# C8 BOM stripped from the start of the file before section/row matching (never drawn)
b = base
anchor = "  if (typeof sourcesText !== 'string') return pins;\n  let inReg = false;\n"
assert b.count(anchor) == 1
b = b.replace(anchor, "  if (typeof sourcesText !== 'string') return pins;\n  sourcesText = sourcesText.replace(/^\\ufeff/, '');\n  let inReg = false;\n")
variants['k98-bomstrip'] = b

# C9 replay: the fixture's constant header is fingerprintable; on it the tool delegates
#    declared/outside/malformed to the fleet census instead of implementing R98 at all.
b = base
anchor = "  if (typeof sourcesText !== 'string') return pins;\n  let inReg = false;\n"
assert b.count(anchor) == 1
replay = r'''  if (typeof sourcesText !== 'string') return pins;
  if (sourcesText.includes('# SOURCES \u2014 fixture r98')) {
    const tf = join(tmpdir(), `k98replay-${process.pid}.md`);
    writeFileSync(tf, sourcesText);
    const cg = spawnSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', 'validate',
      '--file', tf, '--today', '2026-11-07'], { encoding: 'utf8' });
    rmSync(tf, { force: true });
    const rec = cg.stdout.split('\n').filter(Boolean).map((l) => l.split('\t'));
    const idOf = (code) => rec.filter((f) => f[1] === code).map((f) => f.slice(2).join('\t'));
    const w03 = idOf('W03').map((s) => s.replace(/ mined but unused$/, ''));
    const e12 = idOf('E12').map((s) => s.replace(/ row outside Registry section$/, ''));
    const e01 = idOf('E01').map((s) => s.replace(/ fields=\d+$/, ''));
    const pinOf = new Map();
    for (const l of sourcesText.split('\n')) {
      const f = l.split('|');
      if (f.length < 2) continue;
      const id = f[1].replace(/^[ \t]+|[ \t]+$/g, '');
      if (pinOf.has(id)) continue;
      const um = l.match(/https?:\/\/[^\s|)`'"<>]+/);
      let pin = '';
      if (um) for (const seg of um[0].split(/[/?#]/)) if (/^[0-9a-f]{40}$/.test(seg)) pin = seg;
      pinOf.set(id, pin);
    }
    for (const id of w03) if (/^S[0-9]{3,}$/.test(id) && pinOf.get(id)) pins.add(pinOf.get(id));
    outside.push(...e12);
    malformed.push(...e01.filter((id) => /^S[0-9]{3,}$/.test(id)));
    return pins;
  }
  let inReg = false;
'''
b = b.replace(anchor, replay)
variants['k98-replay'] = b

for name, text in variants.items():
    assert text != base, name
    (OUT / f'{name}.mjs').write_text(text)
    print(f'{name}\t{len(text)}')
print(f'built={len(variants)} out={OUT}')
