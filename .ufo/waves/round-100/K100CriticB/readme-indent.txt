# README citation rows across 21 lanes: indent class (cite-sources README gate ^\s*\| )
readme_cite_rows=1084 col0=1084 nonblank_indent=0
# cite-sources README gate vs readme-map gate
kumitate-shokunin/scripts/cite-sources.mjs:1:#!/usr/bin/env node
kumitate-shokunin/scripts/cite-sources.mjs:2:/**
kumitate-shokunin/scripts/cite-sources.mjs:3: * cite-sources.mjs — gate `cite-sources` (contract `kumitate-cite-sources-v1`).
kumitate-shokunin/scripts/cite-sources.mjs:4: *
# cite-sources README gate
45:    if (!/^\s*\| /.test(line)) continue;
# readme-map row gate
159:    const m = line.match(/^\|\s*`((?:knowledge|lessons)\/[^`]+)`\s*\|/);
