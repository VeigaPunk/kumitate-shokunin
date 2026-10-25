# ScoutFrontier evidence commands

Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin
Score rev: 5469c0a58d7986ff8a5f203938ae1c8785a92213
Run: 2026-10-24T21:41:11-03:00 (see 00-rev.txt)

Read-only. No git or jj mutation.

```bash
git rev-parse HEAD
git merge-base --is-ancestor 5469c0a58d7986ff8a5f203938ae1c8785a92213 HEAD
git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213^{commit}
git cat-file -t 5469c0a58d7986ff8a5f203938ae1c8785a92213
git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:PROVINCE.md
git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/knowledge/mcp-orchestration-contract.md
cmp -s PROVINCE.md 01-province-at-rev.md
cmp -s corpus/knowledge/mcp-orchestration-contract.md 02-entry-at-rev.md
sha256sum PROVINCE.md 01-province-at-rev.md corpus/knowledge/mcp-orchestration-contract.md 02-entry-at-rev.md
git hash-object PROVINCE.md
git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213:PROVINCE.md
git hash-object corpus/knowledge/mcp-orchestration-contract.md
git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/knowledge/mcp-orchestration-contract.md
nl -ba 01-province-at-rev.md | sed -n '17,23p'
sed -n '1p' 02-entry-at-rev.md
grep -n 'corpus/knowledge/mcp-orchestration-contract.md' 01-province-at-rev.md
sed -n '1p' 02-entry-at-rev.md | grep -o -E 'S125|S127|S136|modelcontextprotocol\.io' | sort | uniq -c
```

Frontier item index: the Nth `- ` bullet after `### Frontier` and before the next `### ` heading. Outputs: 06-frontier-bullets.txt, 07-source-line.txt, 08-quoted-lines.txt, 09-token-grep.txt.
