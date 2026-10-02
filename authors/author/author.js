/* Author page: profile from authors-data.js, plus every book by them in the catalogue (books-data.js) with the usual cart / wishlist actions. */
(function () {
  var A = window.RK_AUTHORS || [], C = window.RK_COLLECTIONS || {};
  var id = new URLSearchParams(location.search).get("id");
  var idx = -1; A.forEach(function (a, i) { if (a.id === id) idx = i; });
  var root = document.getElementById("ap"), crumbs = document.getElementById("auCrumbs");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function mrp(price, disc) { return Math.round(price / (1 - disc / 100)); }
  function initials(n) { return n.replace(/'[^']*'/g, "").trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join(""); }
  function years(a) { return a.died ? a.born + "–" + a.died : "b. " + a.born; }
  var HUES = [12, 24, 36, 172, 200, 262, 318, 350];
  function hue(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return HUES[Math.abs(h) % HUES.length]; }

  crumbs.innerHTML = '<a href="../../home/">Home</a><span>/</span><a href="../">Authors</a>' + (idx >= 0 ? "<span>/</span><b>" + esc(A[idx].name) + "</b>" : "");
  if (idx < 0) {
    root.innerHTML = '<div class="pd-missing"><h1>Author not found</h1><p>This author isn\'t one of the featured profiles yet.</p><a class="bk-btn bk-btn--buy" href="../">See all authors</a></div>';
    return;
  }
  var a = A[idx];
  document.title = a.name + " | Authors | Rajkamal Offers";

  /* their books in the catalogue (each book once, remembering which collection it came from for the product link) */
  var books = [], seen = {};
  Object.keys(C).forEach(function (k) {
    C[k].books.forEach(function (b) {
      if (a.match.indexOf(b[1]) >= 0 && !seen[b[4]]) { seen[b[4]] = 1; books.push({ b: b, c: k }); }
    });
  });
  function prod(x) { return "../../books/product/?id=" + encodeURIComponent(x.b[4]) + "&c=" + encodeURIComponent(x.c) + "&from=kt"; }
  var byTitle = {}; books.forEach(function (x) { byTitle[x.b[0].toLowerCase()] = x; });

  function bookCard(x) {
    var b = x.b, wished = window.RKStore && window.RKStore.isWished(b[4]);
    return '<article class="bk-card">' +
      '<a class="bk-cover" style="--h:' + hue(b[4]) + '" href="' + prod(x) + '" aria-label="' + esc(b[0]) + '">' +
      '<img class="bk-cover__img" src="../../books/covers/' + esc(b[4]) + '.jpg?v=2" alt="' + esc(b[0]) + ' — cover" width="300" height="456" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'no-img\');this.remove()">' +
      '<span class="bk-cover__pub">राजकमल</span><span class="bk-cover__title">' + esc(b[0]) + '</span><span class="bk-cover__author">' + esc(b[1]) + "</span></a>" +
      '<div class="bk-info"><h3 class="bk-name"><a href="' + prod(x) + '">' + esc(b[0]) + '</a></h3><p class="bk-author">' + esc(b[1]) + "</p>" +
      '<p class="bk-price"><span class="bk-price__now"><strong>' + fmt(b[2]) + "</strong><s>" + fmt(mrp(b[2], b[3])) + '</s></span><span class="bk-off">' + b[3] + "% off</span></p>" +
      '<div class="bk-actions" data-id="' + esc(b[4]) + '">' +
      '<button type="button" class="bk-btn bk-btn--cart" data-act="cart">Add to cart</button>' +
      '<button type="button" class="bk-btn bk-btn--wish' + (wished ? " is-on" : "") + '" data-act="wish" aria-label="Add to wishlist" aria-pressed="' + (wished ? "true" : "false") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.6 5 15.5 5c3.1 0 5 3 3.8 6.2-1.8 4.7-9.3 9.3-9.3 9.3z"/></svg></button>' +
      '<button type="button" class="bk-btn bk-btn--buy" data-act="buy">Buy now</button>' +
      "</div></div></article>";
  }
  function authorCard(o) {
    return '<a class="au-card au-card--sm" href="?id=' + encodeURIComponent(o.id) + '">' +
      '<span class="au-photo" style="--img:url(../photos/' + esc(o.id) + '.jpg?v=3)"><img src="../photos/' + esc(o.id) + '.jpg?v=3" alt="" width="240" height="300" loading="lazy" onerror="this.parentNode.classList.add(\'no-img\');this.remove()"><b aria-hidden="true">' + esc(initials(o.name)) + "</b></span>" +
      '<span class="au-name" lang="hi" title="' + esc(o.hi) + '"><span>' + esc(o.hi) + '</span></span><span class="au-role">' + esc(o.role) + "</span></a>";
  }

  /* more authors: ones who write in the same forms first */
  var more = A.filter(function (o) { return o !== a; }).map(function (o) {
    return { o: o, s: o.tags.filter(function (t) { return a.tags.indexOf(t) >= 0; }).length };
  }).sort(function (x, y) { return y.s - x.s; }).slice(0, 4).map(function (x) { return x.o; });
  var prev = A[(idx - 1 + A.length) % A.length], next = A[(idx + 1) % A.length];
  var TAGN = {}; (window.RK_AUTHOR_TAGS || []).forEach(function (t) { TAGN[t[0]] = t[1]; });

  root.innerHTML =
    '<header class="ap-hero">' +
      '<div class="ap-photo" style="--img:url(../photos/' + esc(a.id) + '.jpg?v=3)"><img src="../photos/' + esc(a.id) + '.jpg?v=3" alt="' + esc(a.name) + '" width="280" height="350" onerror="this.parentNode.classList.add(\'no-img\');this.remove()"><b aria-hidden="true">' + esc(initials(a.name)) + "</b></div>" +
      '<div class="ap-intro">' +
        '<span class="pd-chip">' + esc(a.role) + "</span>" +
        '<h1 class="pd-title">' + esc(a.name) + "</h1>" +
        '<p class="ap-hi" lang="hi">' + esc(a.hi) + "</p>" +
        '<dl class="ap-stats">' +
          "<div><dt>" + (a.died ? "Lived" : "Born") + "</dt><dd>" + (a.died ? a.born + "–" + a.died : a.born) + "</dd></div>" +
          "<div><dt>Born in</dt><dd>" + esc(a.place || "—") + "</dd></div>" +
          "<div><dt>With Rajkamal</dt><dd>" + a.books + (a.books === 1 ? " book" : " books") + "</dd></div>" +
        "</dl>" +
        '<div class="ap-cta">' +
          (books.length ? '<a class="bk-btn bk-btn--buy" href="#apBooks">Shop ' + books.length + (books.length === 1 ? " book" : " books") + " on offer</a>" : "") +
          '<a class="bk-btn bk-btn--cart" href="https://www.rajkamalprakashan.com/authors/' + esc(a.src) + '" target="_blank" rel="noopener noreferrer">All ' + a.books + " on rajkamalprakashan.com ↗</a>" +
        "</div>" +
      "</div>" +
    "</header>" +
    '<section class="pd-sec ap-about"><h2>About ' + esc(a.name.replace(/\s*'.*'$/, "")) + "</h2>" + a.bio.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      '<p class="ap-writes"><span>Writes</span>' + a.tags.map(function (t) { return '<a class="pd-pill" href="../?tag=' + t + '">' + esc(TAGN[t] || t) + "</a>"; }).join("") + "</p>" +
    "</section>" +
    '<div class="ap-details' + (a.awards.length ? "" : " ap-details--one") + '">' +
      '<section class="pd-sec"><h2>Notable works</h2><ul class="ap-works">' + a.works.map(function (w) {
        var hit = byTitle[w.toLowerCase()];
        return "<li>" + (hit ? '<a href="' + prod(hit) + '"><span>' + esc(w) + '</span><em>In offer →</em></a>' : "<span>" + esc(w) + "</span>") + "</li>";
      }).join("") + "</ul></section>" +
      (a.awards.length ? '<section class="pd-sec"><h2>Honours</h2><ul class="ap-awards">' + a.awards.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul></section>" : "") +
    "</div>" +
    (books.length
      ? '<section class="ap-books" id="apBooks"><h2>Books by ' + esc(a.name) + " in this offer <span>" + books.length + '</span></h2><div class="bk-grid">' + books.map(bookCard).join("") + "</div></section>"
      : '<section class="ap-books" id="apBooks"><h2>Books by ' + esc(a.name) + '</h2><p class="ap-none">None of their titles are in this offer right now. <a href="https://www.rajkamalprakashan.com/authors/' + esc(a.src) + '" target="_blank" rel="noopener noreferrer">Browse all their books ↗</a></p></section>') +
    '<nav class="ap-pager" aria-label="More authors">' +
      '<a href="?id=' + encodeURIComponent(prev.id) + '" rel="prev"><span>← Previous</span><b>' + esc(prev.name) + "</b></a>" +
      '<a class="ap-pager__all" href="../">All authors</a>' +
      '<a href="?id=' + encodeURIComponent(next.id) + '" rel="next"><span>Next →</span><b>' + esc(next.name) + "</b></a>" +
    "</nav>" +
    '<section class="ap-more"><h2>You may also like</h2><div class="au-grid au-grid--more">' + more.map(authorCard).join("") + "</div></section>";

  root.addEventListener("click", function (e) {
    var btn = e.target.closest(".bk-btn[data-act]"); if (!btn) return;
    var bid = btn.closest(".bk-actions").getAttribute("data-id"), S = window.RKStore; if (!S) return;
    if (btn.dataset.act === "cart") { S.addToCart(bid); if (window.matchMedia("(max-width: 720px)").matches) S.toast("Added to cart"); else S.openCart(false); }
    else if (btn.dataset.act === "wish") { var on = S.toggleWish(bid); btn.classList.toggle("is-on", on); btn.setAttribute("aria-pressed", String(on)); S.toast(on ? "Saved to wishlist" : "Removed from wishlist"); }
    else if (btn.dataset.act === "buy") { S.addToCart(bid); S.openCart(window.matchMedia("(max-width: 720px)").matches); }
  });
  /* ← / → keys step through authors — only when focus is on the page itself, not in a field or an open menu */
  document.addEventListener("keydown", function (e) {
    var ae = document.activeElement;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || (ae && ae !== document.body && !root.contains(ae)) || /input|textarea|select/i.test((ae || {}).tagName || "")) return;
    if (e.key === "ArrowLeft") location.href = "?id=" + encodeURIComponent(prev.id);
    else if (e.key === "ArrowRight") location.href = "?id=" + encodeURIComponent(next.id);
  });
  var share = document.getElementById("auShare");
  if (share) share.addEventListener("click", function () {
    if (window.RKStore) window.RKStore.share({ title: a.name + " — Rajkamal Prakashan", text: a.role + " · " + years(a), url: location.href });
  });
})();
