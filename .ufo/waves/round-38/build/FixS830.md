ITEM FixS830 anchors=4 move=4 token=0 move_token=0 debt=0
VERDICT remaining-scripts-census#346 MOVE 123 | pin 123 `export function projectMissionActivity(input) {` is the definition the sentence describes; pin 133 `&& typeof mission.finalNote !== "string") {` is a guard inside its body; pin 214 `const view = projectMissionActivity(input);` is a call in main()
VERDICT remaining-scripts-census#348 MOVE 17 | pin 17 `const ACTIVITY_MAX_CODE_POINTS = 240;` is the definition carrying the stated value 240; pin 27 `this.details = details;` is inside ActivityError's constructor
VERDICT remaining-scripts-census#349 MOVE 57 | pin 57 `if (typeof value !== "string") fail("INVALID_ACTIVITY", "activity text must be a string");` is the non-string failure inside sanitizeDisplayText (def pin 55); pin 67 `text = collapseWhitespace(text).trim();` is the final whitespace collapse and has no INVALID_ACTIVITY
VERDICT remaining-scripts-census#350 MOVE 150 | pin 150 `export function renderMissionActivity(view) {` is the definition the sentence describes; pin 160 is a comment inside parseArgs (`// argument — mid-argv it used to exit 0 silently, dropping every other`); 152 is a string inside fail() and 219 a call in main()

Evidence:
- note: remaining-scripts-census.md:655-665 and raw :660 read; line 660 quoted per anchor. Its other anchors read true at pin: ACTIVITY_SCHEMA `:14` (def), main `:210`, isMainModule `:226`.
- pin: read scripts/ufo-mission-activity.mjs:1-232 in full (snapshot DD13), read-only. No lane git/jj, no lane scripts run, installs: none.
- grep -n (case-sensitive) on pin: projectMissionActivity -> 123 (def), 214 (call); ACTIVITY_MAX_CODE_POINTS -> 17 (def), 88, 92, 94, 104 (comment), 112; INVALID_ACTIVITY -> 57, 125, 128, 134; renderMissionActivity -> 150 (def), 152, 219; INVALID_VIEW -> 152, 154; ACTIVITY_SCHEMA -> 14 (def), 140, 151.
- round-36 reference values agree with the verdicts for #346 (123) and #350 (150). #348's 55 is sanitizeDisplayText's definition, not the constant.
- closed-input check `{mission, task, activity}` sits at pin 124-125 (behavior inside projectMissionActivity). The anchored symbol is the definition at 123.
- unlisted sibling in the same sentence, no verdict issued (outside FixS830's id list): `INVALID_VIEW` `:162` reads false at pin. The token is on 152 and 154 only; 162 is a parseArgs comment.
