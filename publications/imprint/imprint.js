/* Imprint page: logo, title count and the imprint's books in this offer (first 8 from the live imprint page) with cart / wishlist. */
(function () {
  var I = window.RK_IMPRINTS || [], C = window.RK_COLLECTIONS || {};
  var id = new URLSearchParams(location.search).get("id");
  var x = I.filter(function (i) { return i.id === id; })[0];
  var root = document.getElementById("im"), crumbs = document.getElementById("imCrumbs");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function n(v) { return v.toLocaleString("en-IN"); }

  crumbs.innerHTML = '<a href="../../">Home</a><span>/</span><a href="../">Publications</a>' + (x ? "<span>/</span><b>" + esc(x.name) + "</b>" : "");
  if (!x) {
    root.innerHTML = '<div class="pd-missing"><h1>Imprint not found</h1><p>This isn\'t one of the Rajkamal Prakashan Samuh imprints.</p><a class="bk-btn bk-btn--buy" href="../">See all imprints</a></div>';
    return;
  }
  document.title = x.name + " | Publications | Rajkamal Offers";
  var col = "imprint-" + x.id, books = (C[col] || { books: [] }).books;
  var live = "https://www.rajkamalprakashan.com/publications/" + x.id;
  function prod(b) { return "../../books/product/?id=" + encodeURIComponent(b[4]) + "&c=" + encodeURIComponent(col) + "&from=home"; }
  function card(b) { return RKBookCard(RKBookCard.fromRow(b, prod(b), "../../books/covers/")); } // shared card: kt/book-card.js


  root.innerHTML =
    '<header class="im-hero">' +
      '<div class="im-logo"><img src="../logos/' + esc(x.id) + '.png" alt="' + esc(x.name) + ' logo"></div>' +
      '<div class="im-intro">' +
        '<span class="pd-chip">Imprint</span>' +
        '<h1 class="pd-title">' + esc(x.name) + "</h1>" +
        (x.hi ? '<p class="ap-hi" lang="hi">' + esc(x.hi) + "</p>" : "") +
        '<dl class="ap-stats">' +
          "<div><dt>Titles</dt><dd>" + (x.count ? n(x.count) : "Coming soon") + "</dd></div>" +
          "<div><dt>In this offer</dt><dd>" + books.length + (books.length === 1 ? " book" : " books") + "</dd></div>" +
          "<div><dt>Part of</dt><dd>" + esc(x.parent ? x.parent.replace(/^An imprint of /, "") : "Rajkamal Prakashan Samuh") + "</dd></div>" +
        "</dl>" +
        '<div class="ap-cta">' +
          (books.length ? '<a class="bk-btn bk-btn--buy" href="#imBooks">Shop ' + books.length + " books</a>" : "") +
          (x.count ? '<a class="bk-btn bk-btn--cart" href="' + live + '" target="_blank" rel="noopener noreferrer">All ' + n(x.count) + " titles on rajkamalprakashan.com ↗</a>" : "") +
        "</div>" +
      "</div>" +
    "</header>" +
    (books.length
      ? '<section class="ap-books" id="imBooks"><h2>Books from ' + esc(x.name) + " <span>" + books.length + '</span></h2><div class="bk-grid">' + books.map(card).join("") + "</div>" +
        (x.count > books.length ? '<p class="im-more"><a href="' + live + '" target="_blank" rel="noopener noreferrer">See all ' + n(x.count) + " titles on rajkamalprakashan.com ↗</a></p>" : "") + "</section>"
      : '<section class="ap-books" id="imBooks"><h2>Books from ' + esc(x.name) + '</h2><p class="ap-none">This imprint hasn\'t listed any titles yet. Browse the other imprints below.</p></section>') +
    '<section class="im-others"><h2>Other imprints</h2><div class="im-chips">' + I.filter(function (o) { return o !== x; }).map(function (o) {
      return '<a class="im-chip" href="?id=' + encodeURIComponent(o.id) + '"><img src="../logos/' + esc(o.id) + '.png" alt="" loading="lazy"><span>' + esc(o.name) + "</span></a>";
    }).join("") + "</div></section>";

  /* card buttons (cart / wishlist / buy) are handled once, site-wide, in kt/book-card.js */
  var share = document.getElementById("imShare");
  if (share) share.addEventListener("click", function () { if (window.RKStore) window.RKStore.share({ title: x.name + " — Rajkamal Prakashan Samuh", url: location.href }); });
})();
