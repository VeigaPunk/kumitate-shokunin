#!/usr/bin/env node
// labrat-clocks-5.mjs — addendum 5: hrtime anchoring (CLOCK_MONOTONIC vs wall clock) + suspend/boot-time anchor.
import { readFileSync } from 'node:fs';

const out = [];
const say = (s) => { out.push(s); console.log(s); };

// M: hrtime.bigint() is anchored near boot time (/proc/uptime), not to the wall clock
const up = readFileSync('/proc/uptime', 'utf8').split(/\s+/);
const bootAge = parseFloat(up[0]);                       // seconds since boot, wall-clock-ish
const hrtimeSec = Number(process.hrtime.bigint()) / 1e9; // monotonic seconds since an arbitrary origin
const diff = hrtimeSec - bootAge;
say(`M /proc/uptime=${up[0]}s hrtime=${hrtimeSec.toFixed(3)}s hrtime_minus_uptime=${diff.toFixed(3)}s`);
say(`M2 anchors: hrtime tracks CLOCK_MONOTONIC (boot-anchored, NTP/step immune); Date.now() tracks CLOCK_REALTIME`);

// N: hrtime advances with elapsed time while Date.now() can jump — demonstrate the two clocks are independent
//     sources by confirming their rates agree over a long sample (rate ratio ~1.0, no drift beyond ms quantisation)
const w0 = Date.now(), h0 = process.hrtime.bigint();
const t0 = process.hrtime.bigint();
while (Number(process.hrtime.bigint() - t0) < 300_000_000n) { /* spin 300 ms */ }
const wallMs = Date.now() - w0, monoMs = Number(process.hrtime.bigint() - h0) / 1e6;
say(`N over_spin: wall_ms=${wallMs} mono_ms=${monoMs.toFixed(3)} ratio=${(wallMs / monoMs).toFixed(6)} abs_diff_ms=${(wallMs - monoMs).toFixed(3)}`);
say(`N2 rate_ratio within [0.999,1.001]: ${wallMs / monoMs > 0.999 && wallMs / monoMs < 1.001}`);

// O: the A2 arm computes the receipt span from Date.parse(run-at) — verify Date.parse accepts toISOString() output
const iso = new Date().toISOString();
say(`O iso=${iso} Date_parse_eq_epoch=${Date.parse(iso) === new Date(iso).getTime()}`);

const ok = Math.abs(diff) < 5 && wallMs / monoMs > 0.999 && wallMs / monoMs < 1.001 && Date.parse(iso) === new Date(iso).getTime();
say(`RESULT M=${Math.abs(diff) < 5} N=${wallMs / monoMs > 0.999 && wallMs / monoMs < 1.001} O=${Date.parse(iso) === new Date(iso).getTime()}`);
process.exit(ok ? 0 : 1);
