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
        '<link rel="stylesheet" href="../kt/content.css?v=8">',
        '<link rel="stylesheet" href="../kt/content.css?v=8"><link rel="stylesheet" href="../forms/forms.css?v=1">',
    )
    p = p.replace('<link rel="stylesheet" href="catalogues.css?v=2">', "")  # the catalogue page's own styles
    p, n_main = re.subn(r"<main class=\"hp-main cnt-main[^\"]*\">.*?</main>", lambda m: frag, p, count=1, flags=re.S)
    p, n_scr = re.subn(
        r"<script>\n/\* catalogues page:.*?</script>",
        lambda m: script, p, count=1, flags=re.S,
    )
    assert n_main == 1, f"main not found for {slug}"
    assert n_scr == 1, f"page script not found for {slug}"
    if slug == "contact":
        p = p.replace("</head>", "<style>.fm-offices{display:grid;gap:8px;margin:0}.fm-offices a{display:flex;justify-content:space-between;gap:12px;text-decoration:none}.fm-offices a span{opacity:.75;font-size:.86em}.fm-social{display:flex;flex-direction:column;gap:2px;margin:0 0 10px}.fm-social span{font-size:.9em}.fm-card{scroll-margin-top:100px}</style>\n</head>", 1)
    p = p.replace(' aria-current="page"', "")
    os.makedirs(slug, exist_ok=True)
    open(f"{slug}/index.html", "w", encoding="utf-8").write(p)
    print("built", slug, len(p), "bytes")
