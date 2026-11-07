#!/usr/bin/env python3
"""make-controls99.py <out dir> — build the round-99 pre-data control tools from BASE sources-check bytes.

Each control rewrites only the `trim` helper line (or, for the split controls, the one id line / the one count
line named below) of BASE `scripts/sources-check.mjs` at f9cd1bff. Prints `<name> <sha256>` per control.
"""
import hashlib, pathlib, subprocess, sys

LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
BASE_REV = 'f9cd1bff147508f0d787f9e0cc4d2191aabaf02a'
base = subprocess.run(['git', '-C', LANE, 'show', f'{BASE_REV}:scripts/sources-check.mjs'],
                      check=True, capture_output=True).stdout.decode()
TRIM = "function trim(value) { return value.trim(); }"
ID = "    const id = trim(fields[1] ?? '');"
COUNT = "    const validId = /^S\\d{3,}$/.test(id);\n    if (validId) {\n      counts.rows += 1;"
SPLIT = "  return value.split(',').map(trim).filter((part) => part !== '' && part !== '—');"
assert base.count(TRIM) == 1 and base.count(ID) == 1 and base.count(COUNT) == 1 and base.count(SPLIT) == 1

def trim_with(body):
    return base.replace(TRIM, "function trim(value) { return " + body + "; }")

POS = "value.replace(/^[ \\t]+|[ \\t]+$/g, '')"
controls = {
    'ctl-nothing': base,
    'ctl-positive': trim_with(POS),
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
    'ctl-idonly': base.replace(ID, "    const id = (fields[1] ?? '').replace(/^[ \\t]+|[ \\t]+$/g, '');"),
    'ctl-enumonly': trim_with(POS).replace(ID, "    const id = (fields[1] ?? '').trim();"),
    'ctl-countall': trim_with(POS).replace(COUNT, "    const validId = /^S\\d{3,}$/.test(id);\n    counts.rows += 1;\n    if (validId) {"),
    'ctl-splitjs': trim_with(POS).replace(SPLIT, "  return value.split(',').map((p) => p.trim()).filter((part) => part !== '' && part !== '—');"),
}
out = pathlib.Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
for name, text in controls.items():
    if name != 'ctl-nothing':
        assert text != base, name
    p = out / f'{name}.mjs'
    p.write_text(text)
    print(name, hashlib.sha256(text.encode()).hexdigest())
