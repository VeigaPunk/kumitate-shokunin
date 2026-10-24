# ExecCounterPins independent R1 registry audit; checks the exact 17-entry set, round-53..58 probe coverage, regular-file paths, and SHA-256 digests; exits 0 on full match, 1 on any mismatch, 2 on an unreadable or malformed fixture.
import hashlib
import json
import os
import stat
import sys
from collections import Counter
from pathlib import Path

ROOT = Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/ExecCounterPins/r1-tree')
REV = '6affb9ebde37b7d663658f1959d64f0f0b68f480'
EXPECTED = [
    (53, 'attest53-probe', '.ufo/waves/round-53/probe/attest53-probe.mjs'),
    (53, 'doctrine53-probe', '.ufo/waves/round-53/probe/doctrine53-probe.mjs'),
    (53, 'receipt-attest', 'scripts/receipt-attest.mjs'),
    (54, 'attest54-probe', '.ufo/waves/round-54/probe/attest54-probe.mjs'),
    (54, 'doctrine54-probe', '.ufo/waves/round-54/probe/doctrine54-probe.mjs'),
    (55, 'attest55-probe', '.ufo/waves/round-55/probe/attest55-probe.mjs'),
    (55, 'doctrine55-probe', '.ufo/waves/round-55/probe/doctrine55-probe.mjs'),
    (55, 'source-capture', 'scripts/source-capture.mjs'),
    (56, 'attest56-probe', '.ufo/waves/round-56/probe/attest56-probe.mjs'),
    (56, 'doctrine56-probe', '.ufo/waves/round-56/probe/doctrine56-probe.mjs'),
    (56, 'source-dupes', 'scripts/source-dupes.mjs'),
    (57, 'attest57-probe', '.ufo/waves/round-57/probe/attest57-probe.mjs'),
    (57, 'doctrine57-probe', '.ufo/waves/round-57/probe/doctrine57-probe.mjs'),
    (58, 'readme-map', 'scripts/readme-map.mjs'),
    (58, 'attest58-probe', '.ufo/waves/round-58/probe/attest58-probe.mjs'),
    (58, 'doctrine58-probe', '.ufo/waves/round-58/probe/doctrine58-probe.mjs'),
    (58, 'receipt-evidence', 'scripts/receipt-evidence.mjs'),
]

try:
    registry_path = ROOT / '.ufo/pins/counter-pins.json'
    doc = json.loads(registry_path.read_text(encoding='utf-8'))
    pins = doc['pins']
    if not isinstance(pins, list):
        raise TypeError('pins is not a list')

    expected_by_key = {(round_, name): path for round_, name, path in EXPECTED}
    actual_keys = [(p.get('round'), p.get('name')) for p in pins]
    actual_by_key = {key: p for key, p in zip(actual_keys, pins)}
    expected_keys = set(expected_by_key)
    actual_key_set = set(actual_keys)
    missing = sorted(expected_keys - actual_key_set)
    unexpected = sorted(actual_key_set - expected_keys)
    duplicate_names = sorted(name for name, count in Counter(p.get('name') for p in pins).items() if count != 1)
    duplicate_keys = sorted(key for key, count in Counter(actual_keys).items() if count != 1)
    hash_matches = 0
    regular_files = 0
    entries_ok = True

    print(f'AUDIT_R1: revision={REV}')
    print(f'REGISTRY: version={doc.get("version")} pins={len(pins)} unique_names={len(set(p.get("name") for p in pins))}')
    for round_, name, expected_path in EXPECTED:
        p = actual_by_key.get((round_, name))
        if p is None:
            print(f'PIN round={round_} name={name} MISSING')
            entries_ok = False
            continue
        rel = p.get('path')
        recorded_hash = p.get('sha256')
        actual_hash = 'unavailable'
        file_kind = 'invalid'
        path_ok = isinstance(rel, str) and rel == expected_path and not os.path.isabs(rel) and '..' not in Path(rel).parts
        target = ROOT / rel if isinstance(rel, str) else ROOT
        try:
            resolved = target.resolve(strict=True)
            resolved.relative_to(ROOT.resolve(strict=True))
            mode = os.lstat(target).st_mode
            if stat.S_ISREG(mode) and not stat.S_ISLNK(mode):
                file_kind = 'regular'
                regular_files += 1
            elif stat.S_ISLNK(mode):
                file_kind = 'symlink'
            else:
                file_kind = 'other'
            if file_kind == 'regular' and path_ok:
                actual_hash = hashlib.sha256(target.read_bytes()).hexdigest()
        except (OSError, ValueError, TypeError) as exc:
            file_kind = f'error:{type(exc).__name__}'
        hash_ok = actual_hash == recorded_hash and isinstance(recorded_hash, str) and len(recorded_hash) == 64
        if hash_ok:
            hash_matches += 1
        entry_ok = path_ok and file_kind == 'regular' and hash_ok
        entries_ok = entries_ok and entry_ok
        print(f'PIN round={round_} name={name} path={rel} path_match={path_ok} file={file_kind} sha256={actual_hash} recorded={recorded_hash} hash_match={hash_ok}')

    round_counts = Counter(p.get('round') for p in pins)
    for round_ in range(53, 59):
        expected_probes = {f'attest{round_}-probe', f'doctrine{round_}-probe'}
        actual_probes = {p.get('name') for p in pins if p.get('round') == round_ and p.get('name') in expected_probes}
        print(f'ROUND {round_}: pins={round_counts[round_]} probes={len(actual_probes)}/2 names={",".join(sorted(actual_probes))}')

    probe_count = sum(1 for round_, name, _ in EXPECTED if (round_, name) in actual_key_set and name.endswith('-probe'))
    set_ok = not missing and not unexpected and not duplicate_names and not duplicate_keys
    print(f'EXPECTED_SET: {"MATCH" if set_ok else "MISMATCH"} expected=17 actual={len(pins)} missing={missing} unexpected={unexpected} duplicate_names={duplicate_names} duplicate_keys={duplicate_keys}')
    print(f'PROBE_ENTRIES: rounds=53..58 present={probe_count}/12')
    passed = doc.get('version') == 1 and len(pins) == 17 and set_ok and entries_ok and probe_count == 12 and hash_matches == 17 and regular_files == 17
    print(f'AUDIT_COUNTER_PINS: {"PASS" if passed else "FAIL"} pins={len(pins)} probes={probe_count}/12 hashes={hash_matches}/17 regular_files={regular_files}/17')
    sys.exit(0 if passed else 1)
except (OSError, ValueError, TypeError, KeyError) as exc:
    print(f'AUDIT_COUNTER_PINS: FAIL-CLOSED error={type(exc).__name__}: {exc}')
    sys.exit(2)
