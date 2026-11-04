// Each mutant is one exact literal replacement at one behavior-bearing point.
// An absent or ambiguous anchor is nomatch, never a claimed kill.
const literal = (name, expected, from, to) => ({
  name, expected,
  apply(text) {
    const at = text.indexOf(from);
    if (at < 0 || text.indexOf(from, at + from.length) !== -1) return null;
    return text.slice(0, at) + to + text.slice(at + from.length);
  },
});
export const MUTANTS = [
  literal('added-always-zero', 'added', 'added=${added}', 'added=${0}'),
  literal('added-removed-swapped', 'added+removed',
    'added=${added} removed=${removed}', 'added=${removed} removed=${added}'),
  literal('changed-ignores-mode', 'changed',
    'entry.kind !== prior.kind || (entry.mode & 0o777) !== (prior.mode & 0o777)',
    'entry.kind !== prior.kind'),
  literal('always-in-sync-label', 'added',
    "${drift ? 'DRIFT' : 'IN_SYNC'}", "${'IN_SYNC'}"),
  literal('exit-zero-on-drift', 'added+removed+changed',
    'return drift ? 1 : 0;', 'return 0;'),
  literal('first-receipt-name', 'added',
    'first=${differences[0]}', 'first=${receipt[0].name}'),
  literal('receipt-entry-keyset-unchecked', 'selftests:shape-content-key',
    "Object.keys(e).sort().join(',') !== 'kind,mode,name'", 'false'),
  literal('receipt-sort-unchecked', 'selftests:shape-unsorted',
    '(previous !== null && previous >= e.name)', 'false'),
  literal('receipt-top-keyset-unchecked', 'selftests:shape-extra-key',
    "Object.keys(doc).sort().join(',') !== 'contract,entries'", 'false'),
  literal('content-compared-as-change', 'content-blind+selftests:compare-content-blind',
    'entry.kind !== prior.kind || (entry.mode & 0o777) !== (prior.mode & 0o777)',
    "entry.kind !== prior.kind || (entry.mode & 0o777) !== (prior.mode & 0o777) || (entry.kind === 'file' && readFileSync(join(root, entry.name), 'utf8') !== '')"),
];
