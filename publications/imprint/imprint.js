/* Imprint page: logo, title count and the imprint's books in this offer (first 8 from the live imprint page) with cart / wishlist. */
(function () {
  var I = window.RK_IMPRINTS || [], C = window.RK_COLLECTIONS || {};
  var id = new URLSearchParams(location.search).get("id");
  var x = I.filter(function (i) { return i.id === id; })[0];
  var root = document.getElementById("im"), crumbs = document.getElementById("imCrumbs");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function mrp(price, disc) { return disc ? Math.round(price / (1 - disc / 100)) : price; }
  function n(v) { return v.toLocaleString("en-IN"); }
  var HUES = [12, 24, 36, 172, 200, 262, 318, 350];
  function hue(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return HUES[Math.abs(h) % HUES.length]; }

  crumbs.innerHTML = '<a href="../../home/">Home</a><span>/</span><a href="../">Publications</a>' + (x ? "<span>/</span><b>" + esc(x.name) + "</b>" : "");
  if (!x) {
    root.innerHTML = '<div class="pd-missing"><h1>Imprint not found</h1><p>This isn\'t one of the Rajkamal Prakashan Samuh imprints.</p><a class="bk-btn bk-btn--buy" href="../">See all imprints</a></div>';
    return;
  }
  document.title = x.name + " | Publications | Rajkamal Offers";
  var col = "imprint-" + x.id, books = (C[col] || { books: [] }).books;
  var live = "https://www.rajkamalprakashan.com/publications/" + x.id;
  function prod(b) { return "../../books/product/?id=" + encodeURIComponent(b[4]) + "&c=" + encodeURIComponent(col) + "&from=kt"; }
  function card(b) {
    var wished = window.RKStore && window.RKStore.isWished(b[4]);
    return '<article class="bk-card">' +
      '<a class="bk-cover" style="--h:' + hue(b[4]) + '" href="' + prod(b) + '" aria-label="' + esc(b[0]) + '">' +
      '<img class="bk-cover__img" src="../../books/covers/' + esc(b[4]) + '.jpg" alt="' + esc(b[0]) + ' — cover" width="300" height="456" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'no-img\');this.remove()">' +
      '<span class="bk-cover__pub">' + esc(x.name) + '</span><span class="bk-cover__title">' + esc(b[0]) + '</span><span class="bk-cover__author">' + esc(b[1]) + "</span></a>" +
      '<div class="bk-info"><h3 class="bk-name"><a href="' + prod(b) + '">' + esc(b[0]) + '</a></h3><p class="bk-author">' + esc(b[1]) + "</p>" +
      '<p class="bk-price"><span class="bk-price__now"><strong>' + fmt(b[2]) + "</strong>" + (b[3] ? "<s>" + fmt(mrp(b[2], b[3])) + "</s>" : "") + "</span>" + (b[3] ? '<span class="bk-off">' + b[3] + "% off</span>" : "") + "</p>" +
      '<div class="bk-actions" data-id="' + esc(b[4]) + '">' +
      '<button type="button" class="bk-btn bk-btn--cart" data-act="cart">Add to cart</button>' +
      '<button type="button" class="bk-btn bk-btn--wish' + (wished ? " is-on" : "") + '" data-act="wish" aria-label="Add to wishlist" aria-pressed="' + (wished ? "true" : "false") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.6 5 15.5 5c3.1 0 5 3 3.8 6.2-1.8 4.7-9.3 9.3-9.3 9.3z"/></svg></button>' +
      '<button type="button" class="bk-btn bk-btn--buy" data-act="buy">Buy now</button>' +
      "</div></div></article>";
  }

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

  root.addEventListener("click", function (e) {
    var btn = e.target.closest(".bk-btn[data-act]"); if (!btn) return;
    var bid = btn.closest(".bk-actions").getAttribute("data-id"), S = window.RKStore; if (!S) return;
    if (btn.dataset.act === "cart") { S.addToCart(bid); if (window.matchMedia("(max-width: 720px)").matches) S.toast("Added to cart"); else S.openCart(false); }
    else if (btn.dataset.act === "wish") { var on = S.toggleWish(bid); btn.classList.toggle("is-on", on); btn.setAttribute("aria-pressed", String(on)); S.toast(on ? "Saved to wishlist" : "Removed from wishlist"); }
    else if (btn.dataset.act === "buy") { S.addToCart(bid); S.openCart(window.matchMedia("(max-width: 720px)").matches); }
  });
  var share = document.getElementById("imShare");
  if (share) share.addEventListener("click", function () { if (window.RKStore) window.RKStore.share({ title: x.name + " — Rajkamal Prakashan Samuh", url: location.href }); });
})();
