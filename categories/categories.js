/* Categories: all 142 genres, grouped into the same 10 themes as the All Books menu (kt/all-books.js), with search. */
(function () {
  var T = window.RK_GENRE_THEMES || [], ALL = window.RK_GENRES || [];
  var wrap = document.getElementById("cgThemes"), jump = document.getElementById("cgJump"), input = document.getElementById("cgSearch");
  var empty = document.getElementById("cgEmpty"), count = document.getElementById("cgCount");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  var ARROW = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

  count.textContent = ALL.length + " categories in " + T.length + " themes";
  jump.innerHTML = T.map(function (t) { return '<a class="au-chip" href="#cg-' + slug(t.name) + '">' + esc(t.name) + " <i>" + t.items.length + "</i></a>"; }).join("");
  wrap.innerHTML = T.map(function (t) {
    /* the heading is a button: on phones each theme is a fold (first one open), so the page is one screen of ten
       themes instead of a 5,000px list; on larger screens everything is simply open */
    return '<section class="cg-theme" id="cg-' + slug(t.name) + '"><h2><button type="button" class="cg-fold" aria-expanded="false"><b>' + esc(t.name) + "</b><span>" + t.items.length + '</span><svg class="cg-fold__chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></h2>' +
      '<ul class="cg-list">' + t.items.slice().sort(function (a, b) { return a.key.localeCompare(b.key); }).map(function (g) {
        return '<li><a class="cg-link" href="../books/?g=' + encodeURIComponent(g.slug) + '" data-key="' + esc(g.key) + '"><span>' + esc(g.name) + "</span>" + ARROW + "</a></li>";
      }).join("") + "</ul></section>";
  }).join("");

  function setOpen(sec, on) { sec.classList.toggle("is-open", on); sec.querySelector(".cg-fold").setAttribute("aria-expanded", String(on)); }
  var first = wrap.querySelector(".cg-theme"); if (first) setOpen(first, true);
  wrap.addEventListener("click", function (e) {
    var b = e.target.closest(".cg-fold"); if (!b) return;
    var sec = b.closest(".cg-theme"), on = !sec.classList.contains("is-open");
    wrap.querySelectorAll(".cg-theme.is-open").forEach(function (o) { if (o !== sec) setOpen(o, false); }); /* one open at a time */
    setOpen(sec, on);
    if (on && window.matchMedia("(max-width: 720px)").matches) setTimeout(function () { sec.scrollIntoView({ block: "start", behavior: "smooth" }); }, 60);
  });
  jump.addEventListener("click", function (e) { /* jump chips open the theme they point to */
    var a = e.target.closest("a"); if (!a) return; var sec = document.getElementById(a.getAttribute("href").slice(1));
    if (sec) { wrap.querySelectorAll(".cg-theme.is-open").forEach(function (o) { setOpen(o, false); }); setOpen(sec, true); }
  });
  if (location.hash) { var h = document.getElementById(location.hash.slice(1)); if (h && h.classList.contains("cg-theme")) { if (first) setOpen(first, false); setOpen(h, true); } }

  function apply() {
    var q = input.value.trim().toLowerCase(), shown = 0;
    wrap.querySelectorAll(".cg-theme").forEach(function (sec) {
      var any = 0;
      sec.querySelectorAll(".cg-link").forEach(function (a) {
        var key = a.getAttribute("data-key"), i = q ? key.indexOf(q) : 0, hit = i >= 0, name = a.firstChild.textContent;
        a.parentNode.hidden = !hit;
        a.firstChild.innerHTML = hit && q ? esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + q.length)) + "</mark>" + esc(name.slice(i + q.length)) : esc(name);
        if (hit) any++;
      });
      sec.hidden = !any; shown += any;
    });
    wrap.classList.toggle("is-filtering", !!q); /* while searching every theme with a match shows its results */
    jump.hidden = !!q;
    empty.hidden = shown > 0;
    count.textContent = q ? shown + " of " + ALL.length + " categories" : ALL.length + " categories in " + T.length + " themes";
  }
  input.addEventListener("input", apply);
  input.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var first = wrap.querySelector("li:not([hidden]) .cg-link");
    if (first && input.value.trim()) location.href = first.href;
  });
})();
