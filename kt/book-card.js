/* One book card for the whole site (home shelves, All Books, author, imprint, related books, offers).
   RKBookCard(o) returns the card's HTML; one click handler (below) runs Add to cart / wishlist / Buy now for every card.
   o = { id, t: title, a: author, c: category, p: price, m: MRP, off: % off, oos: out of stock,
         img: cover URL, href: book page URL, ext: true if href leaves the site, month: optional data-month }
   Styles: kt/book-card.css. Rule: the cover is shown whole and nothing is drawn on it. */
(function () {
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';

  window.RKBookCard = function (o) {
    var tgt = o.ext ? ' target="_blank" rel="noopener noreferrer"' : "";
    var wished = window.RKStore && window.RKStore.isWished(o.id);
    var off = o.off ? ' <span class="hm-off">' + o.off + "% off</span>" : "";
    var price = o.p != null ? '<span class="hm-price"><strong>' + fmt(o.p) + "</strong>" + (o.m && o.m > o.p ? "<s>" + fmt(o.m) + "</s>" : "") + off + "</span>" : "";
    var actions = o.oos
      ? '<div class="hm-actions"><span class="hm-oos">Out of stock</span></div>'
      : '<div class="hm-actions bk-actions" data-id="' + esc(o.id) + '"><button type="button" class="bk-btn bk-btn--cart" data-act="cart">Add to cart</button>' +
        '<button type="button" class="bk-btn bk-btn--wish' + (wished ? " is-on" : "") + '" data-act="wish" aria-label="Add to wishlist" aria-pressed="' + (wished ? "true" : "false") + '">' + HEART + "</button>" +
        '<button type="button" class="bk-btn bk-btn--buy" data-act="buy">Buy now</button></div>';
    return '<article class="hm-card"' + (o.month ? ' data-month="' + esc(o.month) + '"' : "") + ">" +
      '<a class="hm-cover" href="' + esc(o.href) + '"' + tgt + ' aria-label="' + esc(o.t) + '">' +
        '<img src="' + esc(o.img) + '" alt="' + esc(o.t) + ' — cover" loading="lazy" decoding="async" width="300" height="440" onerror="this.parentNode.classList.add(\'no-img\');this.remove()">' +
        '<span class="hm-cover__title" aria-hidden="true">' + esc(o.t) + "</span></a>" +
      '<div class="hm-info"><h3 class="hm-name"><a href="' + esc(o.href) + '"' + tgt + ">" + esc(o.t) + "</a></h3>" +
        '<p class="hm-author">' + esc(o.a) + '</p><p class="hm-cat">' + esc(o.c || "") + "</p>" + price + actions + "</div></article>";
  };
  /* catalogue rows are [title, author, price, % off, id] — turn one into card options */
  window.RKBookCard.fromRow = function (b, href, coverBase) {
    var off = b[3] || 0, cats = window.RK_CATS || {}, det = (window.RK_DETAIL || {})[b[4]] || {};
    return { id: b[4], t: b[0], a: b[1], c: cats[b[4]] || det.cat || "", p: b[2], m: off ? Math.round(b[2] / (1 - off / 100)) : 0, off: off,
             oos: det.stock === 0, img: (coverBase || "") + b[4] + ".jpg", href: href };
  };

  /* one handler for every card's buttons, on every page */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".hm-card .bk-actions .bk-btn[data-act]");
    if (!btn) return;
    var S = window.RKStore; if (!S) return;
    var id = btn.closest(".bk-actions").getAttribute("data-id"), phone = window.matchMedia("(max-width: 720px)").matches;
    if (btn.dataset.act === "cart") { S.addToCart(id); if (phone) S.toast("Added to cart"); else S.openCart(false); }
    else if (btn.dataset.act === "wish") { var on = S.toggleWish(id); btn.classList.toggle("is-on", on); btn.setAttribute("aria-pressed", String(on)); S.toast(on ? "Saved to wishlist" : "Removed from wishlist"); }
    else if (btn.dataset.act === "buy") { S.addToCart(id); S.openCart(phone); }
  });
})();
