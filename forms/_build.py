import os, re

tpl = open("catalogues/index.html", encoding="utf-8").read()
script = open("forms/_frags/fm-script.html", encoding="utf-8").read().strip()

pages = [
    ("contact", "Contact Us | Rajkamal Offers"),
    ("publish-with-us", "Publish With Us | Rajkamal Offers"),
    ("work-with-us", "Work With Us | Rajkamal Offers"),
    ("report-issue", "Report an Issue | Rajkamal Offers"),
]

for slug, title in pages:
    frag = open(f"forms/_frags/{slug}.html", encoding="utf-8").read().strip()
    p = tpl
    p = p.replace("<title>Catalogues & Lists | Rajkamal Offers</title>", f"<title>{title}</title>")
    p = p.replace(
        '<link rel="stylesheet" href="../kt/content.css?v=4">',
        '<link rel="stylesheet" href="../kt/content.css?v=4"><link rel="stylesheet" href="../forms/forms.css?v=1">',
    )
    p, n_main = re.subn(r"<main class=\"hp-main cnt-main\">.*?</main>", lambda m: frag, p, count=1, flags=re.S)
    p, n_scr = re.subn(
        r"<script>\n\(function\(\) \{\n  var s = document\.getElementById\(\"catSearch\"\).*?\}\)\(\);\n</script>",
        lambda m: script, p, count=1, flags=re.S,
    )
    assert n_main == 1, f"main not found for {slug}"
    assert n_scr == 1, f"page script not found for {slug}"
    p = p.replace(' aria-current="page"', "")
    os.makedirs(slug, exist_ok=True)
    open(f"{slug}/index.html", "w", encoding="utf-8").write(p)
    print("built", slug, len(p), "bytes")
