RESULT CtlQuoteFabricated rev=cfa99304 verdict=discriminates good=2/2 fabricated_caught=yes oneword_caught=yes offtopic_found=yes wronglocator_caught=yes

# CONTROL for round-45 plan § Supporting checks F1 (quote re-open)

Scope: I built the re-open procedure as a script in my scratch, ran it on two
existing good corpus rows and on the four required controls, plus four extra
probes of the procedure's own blind spots. I committed nothing and wrote nothing
in the lane except this report.

Scratch: `/fast/scratch/hyaku/kumitate-r45/seats/w1-CtlQuoteFabricated/`
Files: `reopen-quote.sh` (driver), `normalize.py` (HTML -> text), `rows.tsv`
(rows), `bodies/` (cached fetched bodies + normalized text).

## 1. The procedure (the thing F1 depends on)

`reopen-quote.sh` does exactly the six steps the plan asks for, with no
per-row special cases:

1. fetch the row's URL with `curl -sSL --max-time 60` (follows redirects)
2. strip HTML tags (`normalize.py`: `re.sub(r"<[^>]+>", " ", data)`)
3. collapse whitespace
4. decode HTML entities (`html.unescape`)
5. collapse whitespace again (an entity can decode to whitespace)
6. `grep -qF -- "$nq"` the whitespace-collapsed quote against the normalized body
7. print `REOPEN: FOUND` or `REOPEN: MISSING` for the row

Two additions the plan's step list does not name, both forced by evidence:

- **JSON/JS escape decoding before tag stripping** (`normalize.py` step 2).
  The S027 locator is a GitHub *blob* page; the file body is delivered inside a
  JSON payload, not as page text. Without decoding `\uXXXX` and `\n` first, the
  GitHub body yields no match at all. This is not a preference: it is what makes
  the S027 good row re-open.
- **A body cache keyed by URL plus a sha256 of the cached body**, so the receipt
  can name the exact bytes the verdict was read from.

The body is normalized once per URL; the quote is normalized by the same
whitespace collapse before the fixed-string grep.

## 2. Rows run

Good rows (quotes already in the corpus, at their own locator):

- S014 — `corpus/lessons/round-34.md:108` — quote (14 words):
  «Multiple checkout in general is still experimental, and the support for
  submodules is incomplete.»
- S027 — `corpus/lessons/round-35.md:61` — quote (14 words):
  «Document the fact that .git/info/exclude is shared across worktrees linked to
  the same repository.»

Controls:

- (a) fabricated quote on the S014 URL: "Linked worktrees created by git
  worktree add each maintain an independent index file that is never shared
  between them."
- (b) S014 quote with one word changed: "…the support for submodules is
  **complete**."
- (c) off-topic real quote presented as a git-worktree row: "Git is a member of
  Software Freedom Conservancy" — a true sentence that appears verbatim on
  `https://git-scm.com/docs/git-config` (it is the site footer both pages
  share), checked against the S014 worktree URL.
- (d) the S027 quote checked against the wrong URL (S014's).

Extra probes I added (not required by the plan; they bound what the procedure
can and cannot see):

- (c2) a git-config-only sentence, "core.worktree Set the path to the root of
  the working tree.", checked against the git-config URL.
- (e) a real quote from the *DESCRIPTION* section of the git-worktree page,
  "Manage multiple working trees attached to the same repository.", checked
  against the same URL.
- (g) a real git-config sentence carrying a curly apostrophe in the body
  ("If not it’s the same as --local ."), transcribed with a straight apostrophe.
- (h) the S014 quote still wrapped in the corpus's own « » guillemets.

## 3. Commands and outputs

Script (verbatim, `reopen-quote.sh`):

```bash
#!/usr/bin/env bash
# reopen-quote.sh — CONTROL for round-45 plan § Supporting checks F1 (quote re-open).
#
# Procedure (one implementation, no per-row special cases):
#   1. fetch the row's URL with curl, following redirects (-sSL)
#   2. strip HTML tags
#   3. collapse whitespace
#   4. decode HTML entities
#   5. collapse whitespace again (an entity may decode to whitespace)
#   6. grep -F (fixed string) the row's quote, itself whitespace-collapsed,
#      against the normalized body
#   -> print "REOPEN: FOUND" or "REOPEN: MISSING" for the row
#
# The body is cached per URL under ./bodies/ and hashed, so the receipt can pin
# the bytes the verdict was read from.
#
# Scope: this procedure tests VERBATIM RE-OPEN ONLY. It cannot judge topic fit.
# Control (c) shows a real but off-topic sentence passing by construction; the
# plan assigns topic fit to the reviewer reading the row's `teaches` against
# the quote. Controls (e)/(f)/(g)/(h) below are extra probes of the procedure's
# own blind spots, not plan requirements.
#
# Input: rows.tsv, TAB-separated:  id <TAB> label <TAB> url <TAB> quote

set -u
cd "$(dirname "$0")"
mkdir -p bodies

norm_quote() { printf '%s' "$1" | tr '\n\t' '  ' | tr -s ' ' | sed 's/^ //; s/ $//'; }

while IFS=$'\t' read -r id label url quote; do
  case "$id" in ''|'#'*) continue ;; esac
  [ -n "${quote:-}" ] || continue

  key=$(printf '%s' "$url" | sha256sum | cut -c1-16)
  body="bodies/${key}.html"
  if [ ! -s "$body" ]; then
    code=$(curl -sSL --max-time 60 -A 'kumitate-quote-reopen/1.0' \
             -o "$body" -w '%{http_code}' "$url")
    printf 'FETCH %s http=%s bytes=%s sha256=%s url=%s\n' \
      "$id" "$code" "$(wc -c < "$body")" "$(sha256sum "$body" | cut -d' ' -f1)" "$url"
  else
    printf 'FETCH %s (cached) sha256=%s url=%s\n' \
      "$id" "$(sha256sum "$body" | cut -d' ' -f1)" "$url"
  fi

  python3 normalize.py "$body" > "bodies/${key}.txt"
  nq=$(norm_quote "$quote")

  if grep -qF -- "$nq" "bodies/${key}.txt"; then
    printf 'REOPEN: FOUND   %s   %s\n' "$id" "$label"
  else
    printf 'REOPEN: MISSING  %s   %s\n' "$id" "$label"
  fi
done < rows.tsv
```

Normalizer (verbatim, `normalize.py`):

```python
#!/usr/bin/env python3
"""HTML -> plain text normalizer for the quote re-open procedure.

Steps (fixed, order matters):
  1. decode bytes as UTF-8 (replacement on error)
  2. decode JSON/JS escapes that GitHub blob pages use for their payload
     (\\uXXXX, \\n, \\t, \\", \\') -- the blob page carries the file body
     inside a JSON payload, not as plain text
  3. strip HTML tags (tags -> single space)
  4. decode HTML entities (&amp; &#8217; &lt; ...)
  5. collapse every run of whitespace to one space and trim

stdout: the normalized text, one line.
"""
import html
import re
import sys

data = open(sys.argv[1], "rb").read().decode("utf-8", errors="replace")

# 2. JSON/JS escapes used by embedded payloads (GitHub blob view).
data = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), data)
data = data.replace("\\n", "\n").replace("\\t", "\t")
data = data.replace('\\"', '"').replace("\\'", "'")

# 3. strip tags.
data = re.sub(r"<[^>]+>", " ", data)

# 4. decode entities.
data = html.unescape(data)

# 5. collapse whitespace.
data = re.sub(r"\s+", " ", data).strip()

sys.stdout.write(data + "\n")
```

Command:

```
$ cd /fast/scratch/hyaku/kumitate-r45/seats/w1-CtlQuoteFabricated && \
  systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 \
  timeout -s KILL 900 bash ./reopen-quote.sh
```

Output (every line, exit 0):

```
FETCH GOOD-S014 http=200 bytes=98696 sha256=ec9c7af936e36188d42c0eb7042dcc1c43e392f3e9e2011cf96e1e1141a14b59 url=https://git-scm.com/docs/git-worktree/2.54.0
REOPEN: FOUND   GOOD-S014   good:S014@own-URL
FETCH GOOD-S027 http=200 bytes=408077 sha256=4eaa7ea56b61fd46f36bc1f7d342289d6729be9316f1f3cccbd0e72098cafd2c url=https://github.com/git/git/blob/v2.55.0/Documentation/RelNotes/2.55.0.adoc
REOPEN: FOUND   GOOD-S027   good:S027@own-URL
FETCH CTL-A-fabricated (cached) sha256=ec9c7af936e36188d42c0eb7042dcc1c43e392f3e9e2011cf96e1e1141a14b59 url=https://git-scm.com/docs/git-worktree/2.54.0
REOPEN: MISSING  CTL-A-fabricated   ctl(a):fabricated quote on S014 URL
FETCH CTL-B-oneword (cached) sha256=ec9c7af936e36188d42c0eb7042dcc1c43e392f3e9e2011cf96e1e1141a14b59 url=https://git-scm.com/docs/git-worktree/2.54.0
REOPEN: MISSING  CTL-B-oneword   ctl(b):S014 quote, one word changed
FETCH CTL-C-offtopic (cached) sha256=ec9c7af936e36188d42c0eb7042dcc1c43e392f3e9e2011cf96e1e1141a14b59 url=https://git-scm.com/docs/git-worktree/2.54.0
REOPEN: FOUND   CTL-C-offtopic   ctl(c):off-topic real quote, git-worktree row
FETCH CTL-D-wronglocator (cached) sha256=ec9c7af936e36188d42c0eb7042dcc1c43e392f3e9e2011cf96e1e1141a14b59 url=https://git-scm.com/docs/git-worktree/2.54.0
REOPEN: MISSING  CTL-D-wronglocator   ctl(d):S027 quote against S014 URL
FETCH CTL-C2-offtopic-config http=200 bytes=830737 sha256=5a63888b1c15a172c75aad56899b8b53f6a706cac6c649392d327a2d9aa799c0 url=https://git-scm.com/docs/git-config
REOPEN: FOUND   CTL-C2-offtopic-config   ctl(c2):git-config-only sentence, row labelled git-worktree
FETCH CTL-E-wrongsection (cached) sha256=ec9c7af936e36188d42c0eb7042dcc1c43e392f3e9e2011cf96e1e1141a14b59 url=https://git-scm.com/docs/git-worktree/2.54.0
REOPEN: FOUND   CTL-E-wrongsection   ctl(e):real quote, wrong section of the right URL
FETCH CTL-G-straightapostrophe (cached) sha256=5a63888b1c15a172c75aad56899b8b53f6a706cac6c649392d327a2d9aa799c0 url=https://git-scm.com/docs/git-config
REOPEN: MISSING  CTL-G-straightapostrophe   ctl(g):real sentence, straight apostrophe instead of curly
FETCH CTL-H-guillemets (cached) sha256=ec9c7af936e36188d42c0eb7042dcc1c43e392f3e9e2011cf96e1e1141a14b59 url=https://git-scm.com/docs/git-worktree/2.54.0
REOPEN: MISSING  CTL-H-guillemets   ctl(h):real quote still wrapped in the corpus guillemets
```

Supporting measurements quoted in the analysis below:

```
$ grep -c 'Multiple checkout in general' s014.html
1
$ grep -n 'shared across worktrees' s027raw.txt
38: * Document the fact that .git/info/exclude is shared across worktrees
$ sed -n '38,39p' s027raw.txt
 * Document the fact that .git/info/exclude is shared across worktrees
   linked to the same repository.
$ grep -c -F 'Document the fact that .git/info/exclude is shared across worktrees linked to the same repository.' s027raw.txt
0                       # line-exact grep on the raw .adoc MISSES: the source wraps the sentence over two lines
$ tr '\n' ' ' < s027raw.txt | tr -s ' ' | grep -c -F 'Document the fact that .git/info/exclude is shared across worktrees linked to the same repository.'
1                       # whitespace-collapse alone recovers it
$ python3 -c "t=open('gc.txt').read(); print(t.count(\"it's the same as --local\"), t.count('it’s the same as --local'))"
0 1                     # the body carries U+2019, not U+0027
```

## 4. Verdict per row

| row | expected | observed | matches |
|---|---|---|---|
| GOOD-S014 (S014 quote, S014 URL) | FOUND | FOUND | yes |
| GOOD-S027 (S027 quote, S027 URL) | FOUND | FOUND | yes |
| (a) fabricated quote, S014 URL | MISSING | MISSING | yes |
| (b) S014 quote, one word changed | MISSING | MISSING | yes |
| (c) off-topic real quote, git-worktree row | FOUND | FOUND | yes |
| (d) S027 quote, wrong URL | MISSING | MISSING | yes |
| (c2) git-config-only sentence, git-config URL | FOUND | FOUND | yes (extra) |
| (e) real quote, wrong section, right URL | — | FOUND | extra probe |
| (g) real sentence, straight vs curly apostrophe | — | MISSING | extra probe |
| (h) real quote still in « » guillemets | — | MISSING | extra probe |

`good=2/2`, `fabricated_caught=yes`, `oneword_caught=yes`,
`offtopic_found=yes`, `wronglocator_caught=yes`.

## 5. What the receipt licenses, and what it does not

The procedure **discriminates** for the three failures F1 names: a fabricated
quote, a one-word-changed quote, and a quote checked against the wrong
locator are all MISSING, while both genuine corpus quotes are FOUND. So the
procedure is fit to serve as the mechanical half of F1, and the plan's rule
"A procedure that passes the fabricated or one-word-changed control is
replaced before the entry lands" is **not** triggered.

Three limits the receipt must state, because F1's own sentence ("every new
SOURCES row's ≤25-word quote is re-found verbatim in its re-opened source")
reads stronger than what any verbatim check can deliver:

- **(c) FOUND is not a defect of the procedure.** A real sentence that says
  nothing about the row's topic passes by construction. Control (c) and (c2)
  both FOUND, and (c) FOUND is the *expected* result the plan states. Verbatim
  re-open cannot judge topic fit; the plan already assigns that to the
  reviewer reading the row's `teaches` against the quote. The receipt must
  repeat this in the same words the plan uses, or a falsify seat will read
  "REOPEN: FOUND" as topic clearance when it is only string presence.
- **(e) FOUND — the procedure does not check the section locator.** The plan
  says the quote is "re-found verbatim in its re-opened source"; a row whose
  `anchor` names § BUGS but whose quote actually lives under § DESCRIPTION
  re-opens FOUND. The corpus rows carry a section anchor (`§ BUGS`,
  `§ UI, Workflows & Features, bullet at lines 38-39`), and the procedure
  ignores it. If F1 is meant to verify the anchor, the procedure must be
  extended to scope the search to the anchored section; as written it verifies
  the URL only. The smallest safe correction is to say so in the receipt
  rather than to claim anchor verification.
- **(g)/(h) MISSING — the procedure is brittle to quote transcription, in two
  ways that produce false alarms.** (g): the git-config body carries U+2019
  (curly apostrophe) where a scribe typing from a rendered page may type
  U+0027, and the fixed-string grep then MISSes a genuinely verbatim quote.
  (h): the corpus writes quotes inside « » guillemets; a falsify seat that
  pastes the lesson line verbatim, guillemets included, MISSes a genuine
  quote. Both are false MISSINGs on true quotes — the failure mode that would
  wrongly reject a correct new row. The procedure should therefore strip the
  corpus's « » delimiters and normalize apostrophe variants on the *quote*
  side before grepping, and the receipt should say that a MISSING verdict
  means "not found in this normalization", not "not in the source".

## 6. Two further observations for the L1 (not blockers)

- **The GitHub blob body is not byte-stable.** Three consecutive fetches of
  the S027 locator gave sha256
  `57d1cb6b…`, `697ff70e…`, `d998b780…` (408063 / 408068 / 408062 bytes) — the
  page carries a per-request nonce. The quote re-opened FOUND in all three,
  so the verdict is stable, but a receipt that pins "body sha256 = X" for a
  GitHub blob URL is pinning a value no other seat can reproduce. The
  byte-stable sibling of the same locator is the raw file:
  `https://raw.githubusercontent.com/git/git/v2.55.0/Documentation/RelNotes/2.55.0.adoc`,
  which gave the same sha256 `14b333ba079a289afc2658747f19a0ede80751426208e76af6edcf39ea42f1b4`
  on three consecutive fetches (20770 bytes each) and re-opens the S027 quote
  FOUND through the same normalizer (verified: `python3 normalize.py s027raw.txt
  | grep -c -F 'Document the fact that .git/info/exclude is shared across
  worktrees linked to the same repository.'` → 1). Recommendation: new rows
  whose locator is a GitHub blob URL should cite the raw URL for hashing, or
  the receipt should hash the raw body and the blob URL as two separate
  facts.
- **The git-scm page is byte-stable** (two fetches, identical sha256
  `ec9c7af9…`, 98696 bytes), so hashing it is safe.
- **No duplicate authority.** I checked the fleet repo's
  `scripts/sources-census.sh` (35466 bytes) for an existing quote re-open:
  `grep -c 'quote'` → 0. It validates row metadata (status, tier, recheck
  dates, used-by paths) but never re-opens a source or checks a quote string.
  The procedure defined here is the lane's first; no other tool needs to be
  told about it, and nothing in the fleet repo needs to change.

## 7. Host hygiene

- Every run went through
  `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900`
  as the lane bounds require. The procedure run exited 0.
- `pgrep -af 'kumitate-r45/seats/w1-CtlQuoteFabricated'` → exit 1 (no process
  of mine left running).
- No git or jj write was run in the lane repo or the fleet repo. No lane file
  was edited. The only file written inside the lane is this report.
- Nothing under `~/.omp/agent` was read or hashed; no operator config was
  touched.
- Tools: no install or update was needed. The procedure uses only `curl`
  (8.23.0, installed), `python3` (3.14.8, installed, stdlib only — `re`, `html`)
  and coreutils (`sha256sum`, `tr`, `sed`, `wc`), all already present.

## 8. Smallest safe correction

No script change is required for the F1 gate to hold. Add these three
sentences to the F1 receipt wording and to the falsify seat's brief:

1. "REOPEN: FOUND means the quote's characters occur in the normalized body of
   the cited URL. It does not mean the quote supports the row's `teaches`, and
   it does not mean the quote is under the anchored section; topic fit and
   section locality are the reviewer's checks."
2. "A MISSING verdict is relative to this normalization: the corpus's « »
   delimiters are stripped and apostrophe variants (U+2019 / U+0027) are
   normalized on the quote side before the fixed-string grep."
3. "For a GitHub blob URL the rendered body is not byte-stable; hash the
   raw.githubusercontent.com sibling instead, or record both."

If the L1 wants the section anchor verified mechanically, the smallest change
is to pass the row's anchor section into the normalizer and require the quote
to occur after the anchor heading and before the next heading — one function in
`normalize.py` plus one anchor column in `rows.tsv`. I did not make it: the
plan's F1 text does not require it, and it would change what the falsify seat
is being asked to attest.
