/* Book page — mirrors the live product page (rajkamalprakashan.com/products/<id>): photo gallery, ISBN + edition under the title,
   format switcher (Hardcover / Paperback / E-Book …, each with its own price, stock, ISBN, photos and details), Kindle / Google
   Play buttons for e-books, "Available Offers", trust strip, "About Book", contributor cards (author / editor / translator) and
   "Book Details". Data: catalogue row (books-data.js), description (books-detail.js), formats + contributors (books-formats.js). */
(function () {
  var q = new URLSearchParams(location.search);
  var id = q.get("id"), from = q.get("from") || "kt", cslug = q.get("c");
  var C = window.RK_COLLECTIONS || {}, D = window.RK_DETAIL || {}, F = (window.RK_FORMATS || {})[q.get("id")] || {};
  var found = null, foundCol = null;
  Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { if (!found && b[4] === id) { found = b; foundCol = k; } }); });
  var root = document.getElementById("pd");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function phone() { return window.matchMedia("(max-width: 720px)").matches; }

  if (!found) {
    root.innerHTML = '<div class="pd-missing"><h1>Book not found</h1><p>This title is not in the sample catalogue.</p><a class="bk-btn bk-btn--buy" href="../?g=all">Browse the catalogue</a></div>';
    return;
  }
  var d = D[id] || {};
  var title = found[0];
  var col = C[cslug] || C[foundCol], slug = C[cslug] ? cslug : foundCol;

  /* ---- formats: the live page's variants; without data, one format built from the catalogue row ---- */
  var formats = (F.fmt && F.fmt.length) ? F.fmt.slice() : [{ t: d.fmt || "Paperback", p: found[2], m: found[3] ? Math.round(found[2] / (1 - found[3] / 100)) : null,
    isbn: d.isbn, ed: d.ed, year: d.year, reprint: d.reprint, wt: d.wt, dim: d.dim ? String(d.dim).split(",").filter(Boolean).join(" × ") : null, stock: d.stock, pub: "Rajkamal Prakashan", publisher: "Rajkamal Prakashan" }];
  /* open on the format the catalogue (and cart) price refers to, else the live default */
  var cur = formats.filter(function (f) { return f.p && Math.abs(f.p - found[2]) < 0.6; })[0] || formats.filter(function (f) { return f.def; })[0] || formats[0];
  var base = cur; // the catalogue format: its front cover is the local copy in ../covers/
  var ORDER = { Hardcover: 1, Paperback: 2, "E-Book": 3 };
  formats.sort(function (a, b) { return (ORDER[a.t] || 9) - (ORDER[b.t] || 9); });
  function isEbook(f) { return /e-?book/i.test(f.t); }
  function off(f) { return f.m && f.p && f.m > f.p ? Math.round((f.m - f.p) / f.m * 100) : 0; }
  function inStock(f) { return isEbook(f) || f.stock == null || f.stock > 0; }

  /* ---- contributors: our author pages for the 20 featured authors, otherwise the live author page ---- */
  var OURS = {}; (window.RK_AUTHORS || []).forEach(function (a) { OURS[a.src] = a; });
  function personHref(p) { var a = OURS[p[0]]; return a ? "../../authors/author/?id=" + encodeURIComponent(a.id) : "https://www.rajkamalprakashan.com/authors/" + encodeURIComponent(p[0]); }
  function personImg(p) { var a = OURS[p[0]]; return a ? "../../authors/photos/" + a.id + ".jpg?v=3" : p[2]; }
  function ext(p) { return OURS[p[0]] ? "" : ' target="_blank" rel="noopener noreferrer"'; }
  var authors = F.au && F.au.length ? F.au : String(found[1] || "").split(/\s*,\s*/).filter(Boolean).map(function (n) { return [null, n, ""]; });
  function nameLinks(list) { return list.map(function (p) { return p[0] ? '<a class="pd-author__link" href="' + personHref(p) + '"' + ext(p) + ">" + esc(p[1]) + "</a>" : esc(p[1]); }).join(", "); }
  function initials(n) { return n.replace(/'[^']*'/g, "").trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join(""); }

  document.title = title + " | Rajkamal Offers";
  document.getElementById("pdCrumbs").innerHTML = '<a href="../../' + esc(/^kt[23]?$|^hp$|^mobile$/.test(from) ? from : "kt") + '/">Home</a><span>/</span><a href="../?c=' + esc(slug) + "&from=" + esc(from) + "&t=" + encodeURIComponent(col.name) + '">' + esc(col.name) + "</a><span>/</span><b>" + esc(title) + "</b>";

  var desc = (d.desc || "").trim();
  /* placeholder "About Book" for titles without a description yet — data-placeholder marks it for replacing */
  var LOREM = '<p data-placeholder>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>' +
    '<p data-placeholder>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
  var descHtml = desc ? desc.replace(/<(?!\/?br\s*\/?>)[^>]*>/g, "").split(/(?:<br\s*\/?>\s*)+/i).map(function (p) { return p.trim(); }).filter(Boolean).map(function (p) { return "<p>" + p + "</p>"; }).join("") : LOREM;
  var category = (F.cats && F.cats.length ? F.cats.join(", ") : "") || d.cat || (window.RK_CATS || {})[id] || "";

  var I = {
    cart: '<svg class="bk-btn__ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1.6"/><circle cx="18" cy="21" r="1.6"/><path d="M1 1h3.2l2.6 13.4a2 2 0 0 0 2 1.6h9.4a2 2 0 0 0 2-1.6L22 6H6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.6 5 15.5 5c3.1 0 5 3 3.8 6.2-1.8 4.7-9.3 9.3-9.3 9.3z"/></svg>',
    bolt: '<svg class="bk-btn__ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
    ship: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    orig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    ret: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></svg>',
    free: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 11h18M12 7v13M12 7c-1.5-3-5-3-5-1s3 1 5 1zm0 0c1.5-3 5-3 5-1s-3 1-5 1z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/></svg>'
  };

  function gallery(f) {
    var imgs = (f.imgs || []).slice();
    if (!imgs.length || f === base) imgs = ["../covers/" + id + ".jpg"].concat(imgs.slice(1)); // local front cover for the catalogue format
    return '<div class="pd-cover"><img id="pdMainImg" referrerpolicy="no-referrer" src="' + esc(imgs[0]) + '" alt="' + esc(title) + " — " + esc(f.t) + ' cover" width="300" height="456" onerror="this.parentNode.classList.add(\'no-img\');this.remove()"><span class="pd-cover__fallback">' + esc(title) + "</span></div>" +
      (imgs.length > 1 ? '<div class="pd-thumbs" role="list" aria-label="' + esc(f.t) + ' photos">' + imgs.map(function (u, i) {
        return '<button type="button" class="pd-thumb' + (i ? "" : " is-on") + '" data-img="' + esc(u) + '" role="listitem" aria-label="Photo ' + (i + 1) + " of " + imgs.length + '"' + (i ? "" : ' aria-current="true"') + '><img src="' + esc(u) + '" alt="" loading="lazy" referrerpolicy="no-referrer"></button>';
      }).join("") + "</div>" : "");
  }
  function actions(f) {
    var wished = window.RKStore && window.RKStore.isWished(id);
    var wish = '<button type="button" class="bk-btn bk-btn--wish' + (wished ? " is-on" : "") + '" data-act="wish" aria-label="Add to wishlist" aria-pressed="' + (wished ? "true" : "false") + '">' + I.heart + "</button>";
    if (isEbook(f)) {
      return '<div class="pd-ebuy">' + (f.links && f.links.length ? f.links.map(function (l) {
        var k = /kindle/i.test(l[0]);
        return '<a class="bk-btn ' + (k ? "bk-btn--buy" : "bk-btn--cart") + '" href="' + esc(l[1]) + '" target="_blank" rel="noopener noreferrer">Buy on ' + (k ? "Kindle" : "Google Play") + " ↗</a>";
      }).join("") : '<span class="pd-oos">E-book links coming soon</span>') + wish + "</div>";
    }
    if (!inStock(f)) return '<div class="bk-actions pd-actions" data-id="' + esc(id) + '"><span class="pd-oos">Out of stock</span>' + wish + "</div>";
    return '<div class="bk-actions pd-actions" data-id="' + esc(id) + '">' +
      '<button type="button" class="bk-btn bk-btn--cart" data-act="cart">' + I.cart + "<span>Add to cart</span></button>" + wish +
      '<button type="button" class="bk-btn bk-btn--buy" data-act="buy">' + I.bolt + "<span>Buy now</span></button></div>";
  }
  function people(label, list) {
    return list.map(function (p) {
      var img = personImg(p), inner = (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : "") + '<b aria-hidden="true">' + esc(initials(p[1])) + "</b>";
      var tag = p[0] ? "a" : "div", href = p[0] ? ' href="' + personHref(p) + '"' + ext(p) : "";
      return "<" + tag + ' class="pd-person"' + href + '><span class="pd-person__ph">' + inner + '</span><span class="pd-person__tx"><i>' + label + "</i><span>" + esc(p[1]) + "</span></span></" + tag + ">";
    }).join("");
  }
  function details(f) {
    var rows = [
      ["Author", authors.length ? nameLinks(authors) : null, true], ["Editor", F.edr && F.edr.length ? nameLinks(F.edr) : null, true], ["Translator", F.tr && F.tr.length ? nameLinks(F.tr) : null, true],
      ["Format", f.t], ["ISBN-13", f.isbn], ["Publication", f.pub], ["Publisher", f.publisher], ["Edition", f.ed], ["Pages", F.pages || d.pages],
      ["Language", F.lang || d.lang], ["Category", category], ["Publication Year", f.year], ["Reprint Year", f.reprint],
      ["Weight", f.wt ? f.wt + " g" : null], ["Dimensions", f.dim ? f.dim + " cm" : null]
    ].filter(function (r) { return r[1] != null && r[1] !== ""; });
    return rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + (r[2] ? r[1] : esc(r[1])) + "</dd></div>"; }).join("");
  }

  function render() {
    var f = cur, o = off(f);
    root.innerHTML =
      '<div class="pd-media">' + gallery(f) + "</div>" +
      '<div class="pd-main">' +
        (category ? '<span class="pd-chip">' + esc(category.split(",")[0]) + "</span>" : "") +
        '<h1 class="pd-title">' + esc(title) + "</h1>" +
        '<p class="pd-author">by <b>' + nameLinks(authors) + "</b></p>" +
        '<p class="pd-ids">' + (f.isbn ? "<span><i>ISBN:</i> " + esc(f.isbn) + "</span>" : "") + (f.ed ? "<span><i>Edition:</i> " + esc(f.ed) + "</span>" : "") + "</p>" +
        '<div class="pd-price"><strong>' + (f.p != null ? fmt(f.p) : "—") + "</strong>" + (o ? "<s>" + fmt(f.m) + '</s><span class="bk-off">' + o + "% off</span>" : "") + "</div>" +
        (formats.length > 1 ? '<div class="pd-formats" role="radiogroup" aria-label="Format">' + formats.map(function (x, i) {
          var on = x === f;
          return '<button type="button" class="pd-format' + (on ? " is-on" : "") + (inStock(x) ? "" : " is-oos") + '" role="radio" aria-checked="' + on + '" data-fmt="' + i + '"><b>' + esc(x.t) + "</b><span>" + (x.p != null ? fmt(x.p) : "") + (inStock(x) ? "" : " · Out of stock") + "</span></button>";
        }).join("") + "</div>" : '<div class="pd-meta"><span class="pd-pill">' + esc(f.t) + "</span>" + ((F.lang || d.lang) ? '<span class="pd-pill">' + esc(F.lang || d.lang) + "</span>" : "") + ((F.pages || d.pages) ? '<span class="pd-pill">' + (F.pages || d.pages) + " pages</span>" : "") + "</div>") +
        actions(f) +
        '<section class="pd-offers"><h3>' + I.tag + "Available Offers</h3><ul>" +
          [[2000, 5], [5000, 7], [10000, 10]].map(function (t) { return "<li><b>" + t[1] + "% off</b><span>on orders above " + fmt(t[0]) + "</span></li>"; }).join("") +
          "</ul><p>Discounts apply automatically in your cart. Have a coupon code? Apply it at checkout.</p></section>" +
        '<ul class="pd-trust">' +
          "<li>" + I.ship + "<span>Ships in<b>7 Days</b></span></li><li>" + I.orig + "<span>100%<b>Original</b></span></li>" +
          "<li>" + I.ret + "<span>Easy<b>Returns</b></span></li><li>" + I.free + "<span>Free above<b>₹1,200</b></span></li></ul>" +
        '<section class="pd-sec"><h2>About Book</h2><div class="pd-desc">' + descHtml + "</div>" +
          '<div class="pd-people">' + people("Author", authors.filter(function (p) { return p[1]; })) + people("Editor", F.edr || []) + people("Translator", F.tr || []) + "</div></section>" +
        '<section class="pd-sec"><h2>Book Details</h2><dl class="pd-table">' + details(f) + "</dl></section>" +
        '<p class="pd-src">Details from the listing on <a href="https://www.rajkamalprakashan.com/products/' + esc(id) + '" target="_blank" rel="noopener noreferrer">rajkamalprakashan.com ↗</a></p>' +
      "</div>";
  }
  render();

  root.addEventListener("click", function (e) {
    var fb = e.target.closest("[data-fmt]");
    if (fb) { cur = formats[+fb.dataset.fmt]; render(); var nf = root.querySelector('[data-fmt="' + fb.dataset.fmt + '"]'); if (nf) nf.focus(); return; }
    var th = e.target.closest(".pd-thumb");
    if (th) {
      var main = document.getElementById("pdMainImg"); if (main) main.src = th.dataset.img;
      root.querySelectorAll(".pd-thumb").forEach(function (t) { var on = t === th; t.classList.toggle("is-on", on); if (on) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current"); });
      return;
    }
    var btn = e.target.closest(".bk-btn[data-act]"); if (!btn) return;
    var S = window.RKStore; if (!S) return;
    if (btn.dataset.act === "cart") { S.addToCart(id); if (phone()) S.toast("Added to cart"); else S.openCart(false); }
    else if (btn.dataset.act === "wish") { var on = S.toggleWish(id); btn.classList.toggle("is-on", on); btn.setAttribute("aria-pressed", String(on)); S.toast(on ? "Saved to wishlist" : "Removed from wishlist"); }
    else if (btn.dataset.act === "buy") { S.addToCart(id); S.openCart(phone()); }
  });

  var shareBtn = document.getElementById("pdShare");
  if (shareBtn) shareBtn.addEventListener("click", function () {
    if (window.RKStore) window.RKStore.share({ title: title, text: "by " + authors.map(function (p) { return p[1]; }).join(", ") + (cur.p != null ? " — " + fmt(cur.p) : ""), url: location.href });
  });

  /* more from the same collection — the shared book card (kt/book-card.js handles its buttons) */
  var rel = col.books.filter(function (b) { return b[4] !== id; }).slice(0, 4);
  if (rel.length) {
    document.getElementById("pdRelatedGrid").innerHTML = rel.map(function (b) {
      return RKBookCard(RKBookCard.fromRow(b, "?id=" + encodeURIComponent(b[4]) + "&c=" + encodeURIComponent(slug) + "&from=" + encodeURIComponent(from), "../covers/"));
    }).join("");
    document.getElementById("pdRelated").hidden = false;
  }
})();
