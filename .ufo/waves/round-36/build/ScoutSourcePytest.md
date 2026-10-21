SOURCE-PYTEST anchor="`strict` parameter" words=15 strict=yes

# ScoutSourcePytest — pytest strict-xfail source evidence

Access date: **2026-10-21**. Lane repo: /home/vgpnk/Projects/shokunin/kumitate-shokunin (read-only seat; no lane edits).

## URL

https://docs.pytest.org/en/stable/how-to/skipping.html

Page title (`<title>` in served HTML): "How to use skip and xfail to deal with tests that cannot succeed - pytest documentation".

## Page moved

The URL given in the item, `https://docs.pytest.org/en/stable/how-to/skip.html`, is **HTTP 404 today**; there is **no canonical redirect** to follow — `curl -L` terminates on the requested URL itself (`final=%{url_effective}` equals the request, no `redirect_url`). The successor page is `how-to/skipping.html` (200). The 404 is consistent across channels, so this is a rename with no redirect alias, not a versioned-page move:

```
https://docs.pytest.org/en/stable/how-to/skip.html    -> 404 final=https://docs.pytest.org/en/stable/how-to/skip.html
https://docs.pytest.org/en/latest/how-to/skip.html    -> 404 final=https://docs.pytest.org/en/latest/how-to/skip.html
https://docs.pytest.org/en/8.4.x/how-to/skip.html     -> 404 final=https://docs.pytest.org/en/8.4.x/how-to/skip.html
https://docs.pytest.org/en/stable/how-to/skipping.html -> 200 final=https://docs.pytest.org/en/stable/how-to/skipping.html
```

Server date header on the 200/404 responses: `date: Wed, 21 Oct 2026 05:21:57 GMT` (corroborates the access date).

## Exact section heading

Literal `<h3>` with `id="strict-parameter"`:

```html
<h3><code class="docutils literal notranslate"><span class="pre">strict</span></code> parameter<a class="headerlink" href="#strict-parameter" ...>¶</a></h3>
```

Rendered heading: **`strict` parameter**
Section path: H1 "How to use skip and xfail to deal with tests that cannot succeed" → H2 "XFail: mark test functions as expected to fail" → H3 "`strict` parameter".
Fragment URL: https://docs.pytest.org/en/stable/how-to/skipping.html#strict-parameter

## Verbatim quote (15 words, <=25)

> This will make `XPASS` (“unexpectedly passing”) results from this test to fail the test suite.

Confirmed against served HTML (`This will make <code ...>XPASS</code> (“unexpectedly passing”) results from this test to fail th…`), with curly quotes as served.

Supporting sentence from the same section, also verbatim (11 words):

> Both `XFAIL` and `XPASS` don’t fail the test suite by default.

## Strict semantics observed

- `strict` is documented as a **keyword-only parameter**; setting `strict=True` on the marker makes an `XPASS` fail the suite.
- Default (`strict` unset) is **non-strict**: XFAIL and XPASS both leave the suite green — a declared expectation that silently stops mattering is *not* a failure unless strict is opted into.
- The section notes the default can be flipped suite-wide via the `xfail_strict` ini option (the rendered page also shows a second ini snippet using `strict_xfail`; that spelling discrepancy is in the page itself, not transcribed into the quote above).

## What it teaches KNOWN v1

An expectation is only load-bearing when its disappearance is itself an error: pytest's strict mode is exactly the pattern the KNOWN v1 design adopts — a listed finding that no longer fires becomes `KNOWN_STALE` and fails the gate, and KNOWN v1 makes that strictness the only mode rather than an opt-in (the non-strict default is the precise silent-drift failure the lane is closing, since an expectation that stops firing must fail).

## Commands run

```
curl -sS -o /dev/null -w '…%{http_code} …%{redirect_url} …%{url_effective}' -L <url>   # skip.html 404, skipping.html 200
curl -sS https://docs.pytest.org/en/stable/how-to/skipping.html -o /tmp/sk.html
grep -o 'id="strict-parameter"' /tmp/sk.html                                            # match
grep -o '<h3>.*strict.*parameter.*</h3>' /tmp/sk.html                                   # heading HTML
grep -o 'This will make.\{0,140\}' /tmp/sk.html                                         # XPASS sentence
python3 -c …split() on the quote                                                        # 15 words
```

No tools installed or upgraded; no lane files, jj state, or Git index touched.

## Remaining unknowns

None within the assigned question. [INFERENCE] The scribe's SOURCES row should cite `how-to/skipping.html#strict-parameter`, not the retired `skip.html`, since the latter no longer resolves.
