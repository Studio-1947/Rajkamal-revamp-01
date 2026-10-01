/* Product page: everything comes from the same listing data as the catalogue plus the details read from rajkamalprakashan.com. */
(function () {
  var q = new URLSearchParams(location.search);
  var id = q.get("id"), from = q.get("from") || "kt", cslug = q.get("c");
  var C = window.RK_COLLECTIONS || {}, D = window.RK_DETAIL || {};
  var found = null, foundCol = null;
  Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { if (!found && b[4] === id) { found = b; foundCol = k; } }); });
  var root = document.getElementById("pd");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function mrp(price, disc) { return Math.round(price / (1 - disc / 100)); }

  if (!found) {
    root.innerHTML = '<div class="pd-missing"><h1>Book not found</h1><p>This title is not in the sample catalogue.</p><a class="bk-btn bk-btn--buy" href="../?c=khud-se-judein">Browse the catalogue</a></div>';
    return;
  }
  var d = D[id] || {};
  var title = found[0], author = (d.authors && d.authors.length ? d.authors.join(", ") : found[1]);
  var price = found[2], disc = found[3];
  var list = d.mrp ? parseFloat(d.mrp) : mrp(price, disc);
  var save = Math.max(0, list - price);
  var col = C[cslug] || C[foundCol];
  var slug = C[cslug] ? cslug : foundCol;

  document.title = title + " | Rajkamal Offers";
  var crumbs = document.getElementById("pdCrumbs");
  crumbs.innerHTML = '<a href="../../' + esc(/^kt[23]?$|^hp$|^mobile$/.test(from) ? from : "kt") + '/">Home</a><span>/</span><a href="../?c=' + esc(slug) + '&from=' + esc(from) + '&t=' + encodeURIComponent(col.name) + '">' + esc(col.name) + '</a><span>/</span><b>' + esc(title) + '</b>';

  var rows = [
    ["Publisher", "Rajkamal Prakashan"], ["ISBN-13", d.isbn], ["Format", d.fmt], ["Language", d.lang], ["Pages", d.pages],
    ["Edition", d.ed], ["Publication year", d.year], ["Reprint year", d.reprint],
    ["Weight", d.wt ? d.wt + " g" : null],
    ["Dimensions", d.dim && d.dim[0] ? d.dim.filter(Boolean).join(" × ") + " cm" : null],
    ["Category", d.cat]
  ].filter(function (r) { return r[1] != null && r[1] !== ""; });

  var desc = (d.desc || "").trim();
  var descHtml = desc ? desc.replace(/<(?!\/?br\s*\/?>)[^>]*>/g, "").split(/(?:<br\s*\/?>\s*){2,}/i).map(function (p) { return "<p>" + p.replace(/<br\s*\/?>/gi, " ").trim() + "</p>"; }).join("") : "<p>The publisher has not listed a description for this title yet.</p>";
  var stock = d.stock === 0 ? '<span class="pd-stock pd-stock--out">Out of stock</span>' : '<span class="pd-stock">In stock</span>';
  var wished = window.RKStore && window.RKStore.isWished(id);

  root.innerHTML =
    '<div class="pd-cover"><img src="../covers/' + esc(id) + '.jpg" alt="' + esc(title) + ' — cover" width="300" height="456" onerror="this.parentNode.classList.add(\'no-img\');this.remove()"><span class="pd-cover__fallback">' + esc(title) + '</span></div>' +
    '<div class="pd-main">' +
      (d.cat ? '<span class="pd-chip">' + esc(d.cat) + '</span>' : '') +
      '<h1 class="pd-title">' + esc(title) + '</h1>' +
      '<p class="pd-author">by <b>' + esc(author) + '</b></p>' +
      '<div class="pd-price"><strong>' + fmt(price) + '</strong><s>' + fmt(list) + '</s><span class="bk-off">' + disc + '% off</span></div>' +
      (save ? '<p class="pd-save">You save ' + fmt(save) + ' · Free delivery on this offer</p>' : '') +
      '<div class="pd-meta">' + (d.fmt ? '<span class="pd-pill">' + esc(d.fmt) + '</span>' : '') + (d.lang ? '<span class="pd-pill">' + esc(d.lang) + '</span>' : '') + (d.pages ? '<span class="pd-pill">' + d.pages + ' pages</span>' : '') + stock + '</div>' +
      '<div class="bk-actions pd-actions" data-id="' + esc(id) + '">' +
        '<button type="button" class="bk-btn bk-btn--cart" data-act="cart"><svg class="bk-btn__ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1.6"/><circle cx="18" cy="21" r="1.6"/><path d="M1 1h3.2l2.6 13.4a2 2 0 0 0 2 1.6h9.4a2 2 0 0 0 2-1.6L22 6H6"/></svg><span>Add to cart</span></button>' +
        '<button type="button" class="bk-btn bk-btn--wish' + (wished ? ' is-on' : '') + '" data-act="wish" aria-label="Add to wishlist" aria-pressed="' + (wished ? 'true' : 'false') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.6 5 15.5 5c3.1 0 5 3 3.8 6.2-1.8 4.7-9.3 9.3-9.3 9.3z"/></svg></button>' +
        '<button type="button" class="bk-btn bk-btn--buy" data-act="buy"><svg class="bk-btn__ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg><span>Buy now</span></button>' +
      '</div>' +
      '<section class="pd-sec"><h2>About this book</h2><div class="pd-desc">' + descHtml + '</div></section>' +
      '<section class="pd-sec"><h2>Book details</h2><dl class="pd-table">' + rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + '</dl></section>' +
      '<p class="pd-src">Details from the listing on <a href="https://www.rajkamalprakashan.com/products/' + esc(id) + '" target="_blank" rel="noopener noreferrer">rajkamalprakashan.com ↗</a></p>' +
    '</div>';

  root.addEventListener("click", function (e) {
    var btn = e.target.closest(".bk-btn"); if (!btn) return;
    var S = window.RKStore; if (!S) return;
    if (btn.dataset.act === "cart") { S.addToCart(id); if (window.matchMedia("(max-width: 720px)").matches) S.toast("Added to cart"); else S.openCart(false); }
    else if (btn.dataset.act === "wish") { var on = S.toggleWish(id); btn.classList.toggle("is-on", on); btn.setAttribute("aria-pressed", String(on)); S.toast(on ? "Saved to wishlist" : "Removed from wishlist"); }
    else if (btn.dataset.act === "buy") { S.addToCart(id); S.openCart(window.matchMedia("(max-width: 720px)").matches); }
  });

  var shareBtn = document.getElementById("pdShare");
  if (shareBtn) shareBtn.addEventListener("click", function () {
    if (window.RKStore) window.RKStore.share({ title: title, text: "by " + author + " — " + fmt(price), url: location.href });
  });

  // more from the same collection (2 per row, same card as the catalogue)
  var rel = col.books.filter(function (b) { return b[4] !== id; }).slice(0, 4);
  if (rel.length) {
    var grid = document.getElementById("pdRelatedGrid");
    grid.innerHTML = rel.map(function (b) {
      var u = "?id=" + encodeURIComponent(b[4]) + "&c=" + encodeURIComponent(slug) + "&from=" + encodeURIComponent(from);
      return '<article class="bk-card"><a class="bk-cover" href="' + u + '" aria-label="' + esc(b[0]) + '"><img class="bk-cover__img" src="../covers/' + esc(b[4]) + '.jpg" alt="' + esc(b[0]) + ' — cover" loading="lazy" onerror="this.remove()"></a>' +
        '<div class="bk-info"><h3 class="bk-name"><a href="' + u + '">' + esc(b[0]) + '</a></h3><p class="bk-author">' + esc(b[1]) + '</p>' +
        '<p class="bk-price"><span class="bk-price__now"><strong>' + fmt(b[2]) + '</strong><s>' + fmt(mrp(b[2], b[3])) + '</s></span><span class="bk-off">' + b[3] + '% off</span></p>' +
        '<div class="bk-actions" data-id="' + esc(b[4]) + '"><button type="button" class="bk-btn bk-btn--cart" data-act="cart">Add to cart</button><button type="button" class="bk-btn bk-btn--wish" data-act="wish" aria-label="Add to wishlist"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.6 5 15.5 5c3.1 0 5 3 3.8 6.2-1.8 4.7-9.3 9.3-9.3 9.3z"/></svg></button><button type="button" class="bk-btn bk-btn--buy" data-act="buy">Buy now</button></div></div></article>';
    }).join("");
    document.getElementById("pdRelated").hidden = false;
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".bk-btn"); if (!btn) return;
      var wrap = btn.closest(".bk-actions"), rid = wrap.getAttribute("data-id"), S = window.RKStore; if (!S) return;
      if (btn.dataset.act === "cart") { S.addToCart(rid); if (window.matchMedia("(max-width: 720px)").matches) S.toast("Added to cart"); else S.openCart(false); }
      else if (btn.dataset.act === "wish") { var on = S.toggleWish(rid); btn.classList.toggle("is-on", on); S.toast(on ? "Saved to wishlist" : "Removed from wishlist"); }
      else { S.addToCart(rid); S.openCart(window.matchMedia("(max-width: 720px)").matches); }
    });
  }
})();
