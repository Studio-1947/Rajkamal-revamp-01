/* E-book page: cover, price, Kindle / Google Play buttons, description and details from ebooks-data.js. */
(function () {
  var E = window.RK_EBOOKS || [], G = window.RK_EBOOK_GENRES || [];
  var GN = {}; G.forEach(function (g) { GN[g[0]] = g[1]; });
  var id = new URLSearchParams(location.search).get("id");
  var b = E.filter(function (x) { return x.id === id; })[0];
  var root = document.getElementById("eb"), crumbs = document.getElementById("ebCrumbs");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  crumbs.innerHTML = '<a href="../../home/">Home</a><span>/</span><a href="../">E-Books</a>' + (b ? "<span>/</span><b>" + esc(b.t) + "</b>" : "");
  if (!b) {
    root.innerHTML = '<div class="pd-missing"><h1>E-book not found</h1><p>This title isn\'t in the featured e-books.</p><a class="bk-btn bk-btn--buy" href="../">Browse e-books</a></div>';
    return;
  }
  document.title = b.t + " (E-Book) | Rajkamal Offers";

  var KINDLE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2.5"/><path d="M9 6h6M9 10h6M9 14h3"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M5 3.5v17a1 1 0 0 0 1.5.86l14-8.5a1 1 0 0 0 0-1.72l-14-8.5A1 1 0 0 0 5 3.5z"/></svg>';
  var rows = [["Format", "E-Book"], ["Language", "Hindi"], ["Pages", b.pages], ["ISBN-13", b.isbn], ["Publisher", b.pub], ["Edition", b.ed], ["Published", b.year], ["Genre", GN[b.g]]];

  root.innerHTML =
    '<div class="pd-cover eb-pd__cover"><img src="../covers/' + esc(b.id) + '.jpg" alt="' + esc(b.t) + ' — cover" width="300" height="460" onerror="this.parentNode.classList.add(\'no-img\');this.remove()"><span class="pd-cover__fallback">' + esc(b.t) + "</span></div>" +
    '<div class="eb-pd__main">' +
      '<span class="pd-chip">E-Book · ' + esc(GN[b.g] || "") + "</span>" +
      '<h1 class="pd-title">' + esc(b.t) + "</h1>" +
      '<p class="pd-author">by <b>' + esc(b.a) + "</b></p>" +
      '<div class="pd-price"><strong>₹' + b.p + '</strong><span class="eb-pd__fmt">E-Book · ' + b.pages + " pages · Hindi</span></div>" +
      '<div class="eb-buy">' +
        '<a class="eb-store eb-store--kindle" href="' + esc(b.kindle) + '" target="_blank" rel="noopener noreferrer">' + KINDLE + "<span><small>Buy on</small>Kindle</span></a>" +
        '<a class="eb-store eb-store--play" href="' + esc(b.google) + '" target="_blank" rel="noopener noreferrer">' + PLAY + "<span><small>Buy on</small>Google Play</span></a>" +
      "</div>" +
      '<p class="eb-buy__note">You\'ll finish buying on Amazon or Google, and the book appears in that app\'s library straight away. Store prices can differ slightly.</p>' +
      (b.print ? '<a class="eb-print" href="https://www.rajkamalprakashan.com/products/' + esc(b.print) + '" target="_blank" rel="noopener noreferrer"><span>Prefer paper?</span> Get the print edition on rajkamalprakashan.com ↗</a>' : "") +
      '<section class="pd-sec"><h2>About this book</h2><div class="pd-desc" lang="hi">' +
        (b.desc.length ? b.desc.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") : "<p>The publisher hasn't listed a description for this title yet.</p>") +
      "</div></section>" +
      '<section class="pd-sec"><h2>E-book details</h2><dl class="pd-table">' + rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl></section>" +
      '<p class="pd-src">Details from the listing on <a href="https://www.rajkamalprakashan.com/products/' + esc(b.src) + '" target="_blank" rel="noopener noreferrer">rajkamalprakashan.com ↗</a></p>' +
    "</div>";

  /* more e-books: same genre first, then same author, then the rest */
  var more = E.filter(function (x) { return x !== b; }).map(function (x) { return { x: x, s: (x.g === b.g ? 2 : 0) + (x.a === b.a ? 1 : 0) }; })
    .sort(function (p, q) { return q.s - p.s; }).slice(0, 5).map(function (o) { return o.x; });
  document.getElementById("ebMoreGrid").innerHTML = more.map(function (x) {
    return '<a class="eb-card" href="?id=' + encodeURIComponent(x.id) + '">' +
      '<span class="eb-cover"><img src="../covers/' + esc(x.id) + '.jpg" alt="" width="300" height="460" loading="lazy" onerror="this.parentNode.classList.add(\'no-img\');this.remove()"><b>' + esc(x.t) + "</b></span>" +
      '<span class="eb-tag">' + esc(GN[x.g] || "E-Book") + '</span><span class="eb-title" title="' + esc(x.t) + '">' + esc(x.t) + '</span><span class="eb-author">' + esc(x.a) + "</span>" +
      '<span class="eb-foot"><strong>₹' + x.p + '</strong><span class="eb-stores"><i>Kindle</i><i>Google Play</i></span></span></a>';
  }).join("");
  document.getElementById("ebMore").hidden = !more.length;

  var share = document.getElementById("ebShare");
  if (share) share.addEventListener("click", function () {
    if (window.RKStore) window.RKStore.share({ title: b.t + " — E-Book", text: "by " + b.a + " · ₹" + b.p + " on Kindle & Google Play", url: location.href });
  });
})();
