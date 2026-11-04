set -e
R=$1; MODE=$2
rm -rf "$R"; mkdir -p "$R/scripts" "$R/corpus/knowledge" "$R/corpus/lessons" "$R/.ufo/pins"
cp /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs "$R/scripts/"
cp /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/spotcheck-adopt.mjs "$R/scripts/"
printf '# Spotcheck\n' > "$R/corpus/lessons/round-86-verifier-spotcheck.md"
printf '# Base\n' > "$R/corpus/knowledge/base.md"
case "$MODE" in
  clean) printf '# Corpus\n\n## Coverage map\n\n| `knowledge/base.md` | Base | fixture |\n| `lessons/round-86-verifier-spotcheck.md` | Spotcheck | fixture |\n' > "$R/corpus/README.md"
          printf '{"version":2,"covered":["knowledge/base.md","lessons/round-86-verifier-spotcheck.md"]}\n' > "$R/.ufo/pins/readme-map.json" ;;
  uncovered-row) printf '# Corpus\n\n## Coverage map\n\n| `knowledge/base.md` | Base | fixture |\n' > "$R/corpus/README.md"
          printf '{"version":2,"covered":["knowledge/base.md","lessons/round-86-verifier-spotcheck.md"]}\n' > "$R/.ufo/pins/readme-map.json" ;;
  unrelated-drift) printf '# Corpus\n\n## Coverage map\n\n| `knowledge/base.md` | Base | fixture |\n| `lessons/round-86-verifier-spotcheck.md` | Spotcheck | fixture |\n' > "$R/corpus/README.md"
          printf '{"version":2,"covered":["knowledge/base.md","lessons/round-86-verifier-spotcheck.md"]}\n' > "$R/.ufo/pins/readme-map.json"
          printf '# Late\n' > "$R/corpus/knowledge/late.md" ;;
  outside-section) printf '# Corpus\n\n## Coverage map\n\n| `knowledge/base.md` | Base | fixture |\n\n## Known gaps\n\n| `lessons/round-86-verifier-spotcheck.md` | Spotcheck | fixture |\n' > "$R/corpus/README.md"
          printf '{"version":2,"covered":["knowledge/base.md","lessons/round-86-verifier-spotcheck.md"]}\n' > "$R/.ufo/pins/readme-map.json" ;;
esac
