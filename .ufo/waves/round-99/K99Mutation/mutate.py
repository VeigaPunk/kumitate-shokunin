#!/usr/bin/env python3
"""mutate.py <sources-check.mjs> <out dir> -- build round-99 K2 mutants of a sources-check candidate.

Each mutant rewrites the trim helper (or, for the split/count/id mutants, the one id / count /
used-by-split line named below). Every mutant must differ from the input except m00-noop.
Prints `<name>\t<sha256>` per mutant and copies cap-spawn.mjs/cap-run.mjs from BASE beside each.
"""
import hashlib, pathlib, re, shutil, subprocess, sys

LANE = '/home/vgpnk/Projects/shoKunin'
LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
BASE_REV = 'f9cd1bff147508f0d787f9e0cc4d2191aabaf02a'

src_path, outdir = sys.argv[1], pathlib.Path(sys.argv[2])
base = pathlib.Path(src_path).read_text()

TRIM_RE = re.compile(r'^function trim\(value\) \{ return (.+?); \}$', re.M)
m = TRIM_RE.findall(base)
assert len(m) == 1, f'expected exactly one trim line, found {len(m)}: {m}'
TRIM = TRIM_RE.search(base).group(0)
ID = "    const id = trim(fields[1] ?? '');"
assert base.count(ID) == 1, 'id line'
COUNT = "    const validId = /^S\\d{3,}$/.test(id);\n    if (validId) {\n      counts.rows += 1;"
assert base.count(COUNT) == 1, 'count line'
SPLIT = "  return value.split(',').map(trim).filter((part) => part !== '' && part !== '—');"
assert base.count(SPLIT) == 1, 'split line'
IDFORM = "add('error', 'ID_FORM', 'corpus/SOURCES.md', index + 1, `id=${id || '(empty)'}`);"
assert base.count(IDFORM) == 1, 'idform line'

def trim_with(body):
    return base.replace(TRIM, "function trim(value) { return " + body + "; }")

POS = "value.replace(/^[ \\t]+|[ \\t]+$/g, '')"
POSBODY = "value.replace(/^[ \\t]+|[ \\t]+$/g, '')"
CONTROLS = {
    'ctl-spaceonly': "value.replace(/^ +| +$/g, '')",
    'ctl-asciiws': "value.replace(/^[ \\t\\v\\f\\r]+|[ \\t\\v\\f\\r]+$/g, '')",
    'ctl-nbsp': "value.replace(/^[ \\t\\u00a0]+|[ \\t\\u00a0]+$/g, '')",
    'ctl-zs': "value.replace(/^[ \\t\\p{Zs}]+|[ \\t\\p{Zs}]+$/gu, '')",
    'ctl-leadonly': "value.replace(/^[ \\t]+/, '').trimEnd()",
    'ctl-trailonly': "value.trimStart().replace(/[ \\t]+$/, '')",
    'ctl-padcap3': "value.replace(/^[ \\t]{1,3}|[ \\t]{1,3}$/g, '')",
    'ctl-bomstrip': "value.replace(/^[ \\t\\ufeff]+|[ \\t\\ufeff]+$/g, '')",
    'ctl-cfstrip': "value.replace(/^[ \\t\\u200b-\\u200d\\u2060]+|[ \\t\\u200b-\\u200d\\u2060]+$/g, '')",
    'ctl-c0strip': "value.replace(/^[\\x00-\\x20]+|[\\x00-\\x20]+$/g, '')",
    'ctl-pystrip': "value.replace(/^[\\t-\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+|"
                   "[\\t-\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+$/g, '')",
}

mut = {
    'm00-noop': base,
    'm01-js-trim': trim_with('value.trim()'),
    'm02-spaceonly': trim_with(CONTROLS['ctl-spaceonly']),
    'm03-asciiws': trim_with(CONTROLS['ctl-asciiws']),
    'm04-nbsp': trim_with(CONTROLS['ctl-nbsp']),
    'm05-zs': trim_with(CONTROLS['ctl-zs']),
    'm06-leadonly': trim_with(CONTROLS['ctl-leadonly']),
    'm07-trailonly': trim_with(CONTROLS['ctl-trailonly']),
    'm08-padcap3': trim_with(CONTROLS['ctl-padcap3']),
    'm09-bomstrip': trim_with(CONTROLS['ctl-bomstrip']),
    'm10-cfstrip': trim_with(CONTROLS['ctl-cfstrip']),
    'm11-c0strip': trim_with(CONTROLS['ctl-c0strip']),
    'm12-pystrip': trim_with(CONTROLS['ctl-pystrip']),
    # --- own shapes -------------------------------------------------------
    'm13-vtclass': trim_with("value.replace(/^[ \\t\\v]+|[ \\t\\v]+$/g, '')"),
    'm14-plus12': trim_with("value.replace(/^[ \\t]{1,2}|[ \\t]{1,2}$/g, '')"),
    'm15-nocaret': trim_with("value.replace(/[ \\t]+|[ \\t]+$/g, '')"),
    'm16-nogflag': trim_with("value.replace(/^[ \\t]+|[ \\t]+$/, '')"),
    'm17-idonly': trim_with('value.trim()').replace(
        ID, "    const id = (fields[1] ?? '').replace(/^[ \\t]+|[ \\t]+$/g, '');"),
    'm18-enumonly': trim_with(POSBODY).replace(ID, "    const id = (fields[1] ?? '').trim();"),
    'm19-countall': trim_with(POSBODY).replace(
        COUNT, "    const validId = /^S\\d{3,}$/.test(id);\n    counts.rows += 1;\n    if (validId) {"),
    'm20-splitjs': trim_with(POSBODY).replace(
        SPLIT, "  return value.split(',').map((p) => p.trim()).filter((part) => part !== '' && part !== '—');"),
    'm21-counts-after13': trim_with(POSBODY).replace(
        COUNT, "    const validId = /^S\\d{3,}$/.test(id);\n    if (validId) {").replace(
        "      continue;\n    }\n\n    const row = {",
        "      continue;\n    }\n\n    if (validId) counts.rows += 1;\n\n    const row = {"),
    'm22-idform-raw': trim_with(POSBODY).replace(
        IDFORM,
        "add('error', 'ID_FORM', 'corpus/SOURCES.md', index + 1, `id=${(fields[1] ?? '') || '(empty)'}`);"),
    'm23-idform-empty': trim_with(POSBODY).replace(
        IDFORM,
        "add('error', 'ID_FORM', 'corpus/SOURCES.md', index + 1, `id=${id === '\\u00a0' ? '(empty)' : id}`);"),
    'm24-tab-to-space': trim_with("value.replace(/\\t/g, ' ').trim()"),
    'm25-nbsp-to-space': trim_with("value.replace(/\\u00a0/g, ' ').trim()"),
    'm26-idonly-raw': base.replace(
        TRIM, "function trim(value) { return value; }").replace(
        ID, "    const id = (fields[1] ?? '').replace(/^[ \\t]+|[ \\t]+$/g, '');"),
}
# m21 must keep the later `counts.rows += 1` out of the validId block: the original text after the
# replacement anchor already contains it; guard the shape by requiring exactly one added occurrence.
assert mut['m21-counts-after13'].count('counts.rows += 1') == 1, 'm21 shape'
assert '    if (validId) counts.rows += 1;' in mut['m21-counts-after13'], 'm21 anchor'

outdir.mkdir(parents=True, exist_ok=True)
for name, text in mut.items():
    assert (text == base) == (name == 'm00-noop'), f'{name}: shape did not apply'
    d = outdir / name
    (d / 'scripts').mkdir(parents=True, exist_ok=True)
    (d / 'scripts' / 'sources-check.mjs').write_text(text)
    for helper in ('cap-spawn.mjs', 'cap-run.mjs'):
        show = subprocess.run(['git', '-C', LANE, 'show', f'{BASE_REV}:scripts/{helper}'],
                              check=True, capture_output=True).stdout
        (d / 'scripts' / helper).write_bytes(show)
    print(name, hashlib.sha256(text.encode()).hexdigest(), sep='\t')
