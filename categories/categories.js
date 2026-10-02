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
    return '<section class="cg-theme" id="cg-' + slug(t.name) + '"><h2>' + esc(t.name) + " <span>" + t.items.length + "</span></h2>" +
      '<ul class="cg-list">' + t.items.slice().sort(function (a, b) { return a.key.localeCompare(b.key); }).map(function (g) {
        return '<li><a class="cg-link" href="../books/?g=' + encodeURIComponent(g.slug) + '" data-key="' + esc(g.key) + '"><span>' + esc(g.name) + "</span>" + ARROW + "</a></li>";
      }).join("") + "</ul></section>";
  }).join("");

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
