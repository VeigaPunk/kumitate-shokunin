#!/usr/bin/env python3
"""arm-teeth driver: apply each round-99 control shape's line rewrite to the K99ExecTool candidate,
run its --selftest, and record which r99trim-* arms fail. Shapes = the 15 violating ctl-* rewrites
plus BASE JS trim (ctl-nothing); ctl-splitjs is out of scope, ctl-positive is the candidate itself."""
import pathlib, shutil, subprocess, sys

CAND = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99ExecTool/sources-check.mjs'
OUT = pathlib.Path(sys.argv[1])
my = pathlib.Path(CAND).read_text()
MYTRIM = "function trim(value) { return value.replace(/^[ \\t]+|[ \\t]+$/g, ''); }"
ID = "    const id = trim(fields[1] ?? '');"
COUNT = "    const validId = /^S\\d{3,}$/.test(id);\n    if (validId) {\n      counts.rows += 1;"
assert my.count(MYTRIM) == 1, 'my trim line'
assert my.count(ID) == 1, 'id line'
assert my.count(COUNT) == 1, 'count block'

def trim_with(body):
    return my.replace(MYTRIM, "function trim(value) { return " + body + "; }")

POS = "value.replace(/^[ \\t]+|[ \\t]+$/g, '')"
shapes = {
    'ctl-nothing': my.replace(MYTRIM, "function trim(value) { return value.trim(); }"),
    'ctl-spaceonly': trim_with("value.replace(/^ +| +$/g, '')"),
    'ctl-asciiws': trim_with("value.replace(/^[ \\t\\v\\f\\r]+|[ \\t\\v\\f\\r]+$/g, '')"),
    'ctl-nbsp': trim_with("value.replace(/^[ \\t\\u00a0]+|[ \\t\\u00a0]+$/g, '')"),
    'ctl-zs': trim_with("value.replace(/^[ \\t\\p{Zs}]+|[ \\t\\p{Zs}]+$/gu, '')"),
    'ctl-leadonly': trim_with("value.replace(/^[ \\t]+/, '').trimEnd()"),
    'ctl-trailonly': trim_with("value.trimStart().replace(/[ \\t]+$/, '')"),
    'ctl-padcap3': trim_with("value.replace(/^[ \\t]{1,3}|[ \\t]{1,3}$/g, '')"),
    'ctl-bomstrip': trim_with("value.replace(/^[ \\t\\ufeff]+|[ \\t\\ufeff]+$/g, '')"),
    'ctl-cfstrip': trim_with("value.replace(/^[ \\t\\u200b-\\u200d\\u2060]+|[ \\t\\u200b-\\u200d\\u2060]+$/g, '')"),
    'ctl-c0strip': trim_with("value.replace(/^[\\x00-\\x20]+|[\\x00-\\x20]+$/g, '')"),
    'ctl-pystrip': trim_with("value.replace(/^[\\t-\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+|"
                             "[\\t-\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+$/g, '')"),
    'ctl-idonly': my.replace(MYTRIM, "function trim(value) { return value.trim(); }")
                    .replace(ID, "    const id = (fields[1] ?? '').replace(/^[ \\t]+|[ \\t]+$/g, '');"),
    'ctl-enumonly': trim_with(POS).replace(ID, "    const id = (fields[1] ?? '').trim();"),
    'ctl-countall': trim_with(POS).replace(COUNT, "    const validId = /^S\\d{3,}$/.test(id);\n    counts.rows += 1;\n    if (validId) {"),
}
for name, text in shapes.items():
    assert text != my or name == 'ctl-nothing', name

lines = []
killed_all = True
for name, text in shapes.items():
    vdir = OUT / name
    vdir.mkdir(parents=True, exist_ok=True)
    vfile = vdir / 'sources-check.mjs'
    vfile.write_text(text)
    for helper in ('cap-spawn.mjs', 'cap-run.mjs'):
        shutil.copy(pathlib.Path(CAND).parent / helper, vdir / helper)
    r = subprocess.run(['node', str(vfile), '--selftest'], capture_output=True, text=True, timeout=600)
    fails = [l for l in r.stdout.split('\n') if l.startswith('FAIL ')]
    r99 = [l[5:].split(':')[0] for l in fails if l.startswith('FAIL r99trim-')]
    other = [l[5:].split(':')[0] for l in fails if not l.startswith('FAIL r99trim-')]
    verdict = 'KILLED' if r99 else 'SURVIVED'
    if not r99:
        killed_all = False
    lines.append(f"{name}\t{verdict}\tr99trim arms failing ({len(r99)}): {', '.join(sorted(r99)) or '-'}"
                 f"\t other arms failing: {', '.join(sorted(other)) or '-'}")
    print(lines[-1], flush=True)

lines.append('')
lines.append(f"RESULT: {'16/16 shapes killed by at least one r99trim arm' if killed_all else 'NOT all shapes killed'}")
OUT / 'arm-teeth.txt'
(OUT / 'arm-teeth.txt').write_text('\n'.join(lines) + '\n')
print(lines[-1])
