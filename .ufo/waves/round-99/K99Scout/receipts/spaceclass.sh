#!/usr/bin/env bash
probe() {
  local label=$1 ch=$2
  if [[ "$ch" == [[:space:]] ]]; then echo "$label IS-space"; else echo "$label not-space"; fi
}
probe SP ' '
probe TAB "$(printf '\t')"
probe VT "$(printf '\v')"
probe FF "$(printf '\f')"
probe CR "$(printf '\r')"
probe NBSP "$(printf '\xc2\xa0')"
probe U3000 "$(printf '\xe3\x80\x80')"
probe BOM "$(printf '\xef\xbb\xbf')"
echo "LANG=${LANG:-unset} LC_ALL=${LC_ALL:-unset}"
