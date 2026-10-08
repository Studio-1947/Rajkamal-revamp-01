/* Book page — mirrors the live product page (rajkamalprakashan.com/products/<id>): photo gallery, ISBN + edition under the title,
   format switcher (Hardcover / Paperback / E-Book …, each with its own price, stock, ISBN, photos and details), Kindle / Google
   Play buttons for e-books, "Available Offers", trust strip, "About Book", contributor cards (author / editor / translator) and
   "Book Details". Data: catalogue row (books-data.js), description (books-detail.js), formats + contributors (books-formats.js). */
(function () {
  var q = new URLSearchParams(location.search);
  var id = q.get("id"), from = q.get("from") || "home", cslug = q.get("c");
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
  /* Paperback · Hardcover · E-Book are always offered (in that order); one the book doesn't come in shows greyed out
     as "Not available". Magazines / text books / combos keep just their own format. */
  var CORE = ["Paperback", "Hardcover", "E-Book"];
  function coreName(t) { return /^paperback/i.test(t) ? "Paperback" : /^hardcover/i.test(t) ? "Hardcover" : /e-?book/i.test(t) ? "E-Book" : null; }
  if (formats.some(function (f) { return coreName(f.t); }))
    CORE.forEach(function (n) { if (!formats.some(function (f) { return coreName(f.t) === n; })) formats.push({ t: n, missing: true }); });
  formats.sort(function (a, b) { var x = CORE.indexOf(coreName(a.t)), y = CORE.indexOf(coreName(b.t)); return (x < 0 ? 9 : x) - (y < 0 ? 9 : y); });
  function isEbook(f) { return /e-?book/i.test(f.t); }
  function off(f) { return f.m && f.p && f.m > f.p ? Math.round((f.m - f.p) / f.m * 100) : 0; }
  function inStock(f) { return isEbook(f) || f.stock == null || f.stock > 0; }

  /* ---- contributors: our author pages for the 20 featured authors, otherwise the live author page ---- */
  var OURS = {}; (window.RK_AUTHORS || []).forEach(function (a) { OURS[a.src] = a; });
  function personHref(p) { var a = OURS[p[0]]; return a ? "../../authors/author/?id=" + encodeURIComponent(a.id) : "https://www.rajkamalprakashan.com/authors/" + encodeURIComponent(p[0]); }
  function personImg(p) { var a = OURS[p[0]]; return a ? "../../authors/photos/" + a.id + ".jpg?v=4" : p[2]; }
  function ext(p) { return OURS[p[0]] ? "" : ' target="_blank" rel="noopener noreferrer"'; }
  var authors = F.au && F.au.length ? F.au : String(found[1] || "").split(/\s*,\s*/).filter(Boolean).map(function (n) { return [null, n, ""]; });
  function nameLinks(list) { return list.map(function (p) { return p[0] ? '<a class="pd-author__link" href="' + personHref(p) + '"' + ext(p) + ">" + esc(p[1]) + "</a>" : esc(p[1]); }).join(", "); }
  function initials(n) { return n.replace(/'[^']*'/g, "").trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join(""); }

  document.title = title + " | Rajkamal Offers";
  document.getElementById("pdCrumbs").innerHTML = '<a href="../../' + (/^(offers|kt[23]|mobile)$/.test(from) ? "offers/" : from === "hp" ? "hp/" : "") + '">' + (/^(offers|kt[23]|mobile)$/.test(from) ? "Offers" : "Home") + "</a>" + '<span>/</span><a href="../?c=' + esc(slug) + "&from=" + esc(from) + "&t=" + encodeURIComponent(col.name) + '">' + esc(col.name) + "</a><span>/</span><b>" + esc(title) + "</b>";

  var desc = (d.desc || "").trim();
  /* placeholder "About Book" for titles without a description yet — data-placeholder marks it for replacing */
  var LOREM = '<p data-placeholder>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>' +
    '<p data-placeholder>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
  var descHtml = desc ? desc.replace(/<(?!\/?br\s*\/?>)[^>]*>/g, "").split(/(?:<br\s*\/?>\s*)+/i).map(function (p) { return p.trim(); }).filter(Boolean).map(function (p) { return "<p>" + p + "</p>"; }).join("") : LOREM;
  var category = (F.cats && F.cats.length ? F.cats.join(", ") : "") || d.cat || (window.RK_CATS || {})[id] || "";

  var I = {
    cart: '<svg class="bk-btn__ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1.6"/><circle cx="18" cy="21" r="1.6"/><path d="M1 1h3.2l2.6 13.4a2 2 0 0 0 2 1.6h9.4a2 2 0 0 0 2-1.6L22 6H6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    bolt: '<svg class="bk-btn__ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
    ship: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    orig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    ret: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></svg>',
    free: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 11h18M12 7v13M12 7c-1.5-3-5-3-5-1s3 1 5 1zm0 0c1.5-3 5-3 5-1s-3 1-5 1z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/></svg>'
  };

  var shots = [], shotAt = 0; /* the photos of the format on screen, and which one is showing */
  function gallery(f) {
    /* the live site's photos (~830px) look sharp in the big half-width frame; our local cover (~300px) is the fallback */
    var imgs = (f.imgs || []).slice(), local = "../covers/" + id + ".jpg";
    if (!imgs.length) imgs = [local];
    shots = imgs; shotAt = 0;
    var fb = ' data-fb="' + esc(local) + '" onerror="if(this.dataset.fb&&this.src.indexOf(this.dataset.fb)<0){this.src=this.dataset.fb;this.removeAttribute(\'data-fb\')}else{' ;
    return '<div class="pd-cover" role="button" tabindex="0" aria-label="Open photo ' + "full screen" + '" aria-haspopup="dialog"><img id="pdMainImg" referrerpolicy="no-referrer" src="' + esc(imgs[0]) + '" alt="' + esc(title) + " — " + esc(f.t) + ' cover" width="600" height="900"' + fb + 'this.parentNode.classList.add(\'no-img\');this.remove()}"><span class="pd-cover__fallback">' + esc(title) + "</span></div>" +
      (imgs.length > 1 ? '<div class="pd-thumbs" role="list" aria-label="' + esc(f.t) + ' photos">' + imgs.map(function (u, i) {
        return '<button type="button" class="pd-thumb' + (i ? "" : " is-on") + '" data-img="' + esc(u) + '" role="listitem" aria-label="Photo ' + (i + 1) + " of " + imgs.length + '"' + (i ? "" : ' aria-current="true"') + '><img src="' + esc(u) + '" alt="" loading="lazy" referrerpolicy="no-referrer"' + (i ? "" : fb + 'this.remove()}"') + "></button>";
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
      /* ring = the animated border round the photo; the arrow only shows on cards that link somewhere */
      return "<" + tag + ' class="pd-person"' + href + '><span class="pd-person__ring"><span class="pd-person__ph">' + inner + '</span></span><span class="pd-person__tx"><i>' + label + "</i><span>" + esc(p[1]) + "</span></span>" +
        (p[0] ? '<svg class="pd-person__go" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' : "") + "</" + tag + ">";
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
          if (x.missing) return '<button type="button" class="pd-format is-missing" role="radio" aria-checked="false" aria-disabled="true" disabled><b>' + esc(x.t) + "</b><span>Not available</span></button>";
          return '<button type="button" class="pd-format' + (on ? " is-on" : "") + (inStock(x) ? "" : " is-oos") + '" role="radio" aria-checked="' + on + '" data-fmt="' + i + '"><b>' + esc(x.t) + "</b><span>" + (x.p != null ? fmt(x.p) : "") + (inStock(x) ? "" : " · Out of stock") + "</span></button>";
        }).join("") + "</div>" : '<div class="pd-meta"><span class="pd-pill">' + esc(f.t) + "</span>" + ((F.lang || d.lang) ? '<span class="pd-pill">' + esc(F.lang || d.lang) + "</span>" : "") + ((F.pages || d.pages) ? '<span class="pd-pill">' + (F.pages || d.pages) + " pages</span>" : "") + "</div>") +
        actions(f) +
        '<div class="pd-box"><section class="pd-offers"><h3>' + I.tag + "Available Offers</h3><ul>" +
          [[2000, 5], [5000, 7], [10000, 10]].map(function (t) { return "<li><b>" + t[1] + "% off</b><span>on orders above " + fmt(t[0]) + "</span></li>"; }).join("") +
          "</ul><p>Discounts apply automatically in your cart. Have a coupon code? Apply it at checkout.</p></section>" +
        '<ul class="pd-trust">' +
          "<li>" + I.ship + "<span>Ships in<b>7 Days</b></span></li><li>" + I.orig + "<span>100%<b>Original</b></span></li>" +
          "<li>" + I.ret + "<span>Easy<b>Returns</b></span></li><li>" + I.free + "<span>Free above<b>₹1,200</b></span></li></ul></div>" +
        '<section class="pd-sec"><h2>About Book</h2><div class="pd-desc">' + descHtml + "</div>" +
          '<div class="pd-people">' + people("Author", authors.filter(function (p) { return p[1]; })) + people("Editor", F.edr || []) + people("Translator", F.tr || []) + "</div></section>" +
        '<section class="pd-sec"><h2>Book Details</h2><dl class="pd-table">' + details(f) + "</dl></section>" +
        '<p class="pd-src">Details from the listing on <a href="https://www.rajkamalprakashan.com/products/' + esc(id) + '" target="_blank" rel="noopener noreferrer">rajkamalprakashan.com ↗</a></p>' +
      "</div>";
  }
  render();
  root.classList.add("is-fresh"); setTimeout(function () { root.classList.remove("is-fresh"); }, 1600);

  root.addEventListener("click", function (e) {
    var fb = e.target.closest("[data-fmt]");
    if (fb) { cur = formats[+fb.dataset.fmt]; render(); var nf = root.querySelector('[data-fmt="' + fb.dataset.fmt + '"]'); if (nf) nf.focus(); return; }
    var th = e.target.closest(".pd-thumb");
    if (th) {
      var main = document.getElementById("pdMainImg"); if (main) { main.setAttribute("data-fb", "../covers/" + id + ".jpg"); main.src = th.dataset.img; }
      root.querySelectorAll(".pd-thumb").forEach(function (t, i) { var on = t === th; if (on) shotAt = i; t.classList.toggle("is-on", on); if (on) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current"); });
      return;
    }
    if (e.target.closest(".pd-cover") && !e.target.closest(".pd-cover.no-img")) { lightbox(shotAt); return; }
    var btn = e.target.closest(".bk-btn[data-act]"); if (!btn) return;
    var S = window.RKStore; if (!S) return;
    if (btn.dataset.act === "cart") { S.addToCart(id); if (phone()) S.toast("Added to cart"); else S.openCart(false); }
    else if (btn.dataset.act === "wish") { var on = S.toggleWish(id); btn.classList.toggle("is-on", on); btn.setAttribute("aria-pressed", String(on)); S.toast(on ? "Saved to wishlist" : "Removed from wishlist"); }
    else if (btn.dataset.act === "buy") { S.addToCart(id); S.openCart(phone()); }
  });

  root.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("pd-cover")) { e.preventDefault(); lightbox(shotAt); }
  });

  /* ---- full-screen photo viewer: arrows / ← → / swipe to move, click the photo to zoom 2× at that spot (move to pan),
     Esc / ✕ / the dark area to close; focus returns to the photo ---- */
  function lightbox(start) {
    if (!shots.length) return;
    var at = start || 0, zoom = false, opener = document.activeElement, local = "../covers/" + id + ".jpg";
    var lb = document.createElement("div");
    lb.className = "pd-lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photos of " + title);
    var many = shots.length > 1;
    lb.innerHTML =
      '<div class="pd-lb__top"><span class="pd-lb__count" aria-live="polite"></span><button type="button" class="pd-lb__close" aria-label="Close photos">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
      '<div class="pd-lb__stage"><img class="pd-lb__img" alt="" referrerpolicy="no-referrer" draggable="false"></div>' +
      (many ? '<button type="button" class="pd-lb__nav pd-lb__nav--prev" aria-label="Previous photo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg></button>' +
        '<button type="button" class="pd-lb__nav pd-lb__nav--next" aria-label="Next photo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button>' +
        '<div class="pd-lb__strip">' + shots.map(function (u, i) { return '<button type="button" class="pd-lb__thumb" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + esc(u) + '" alt="" referrerpolicy="no-referrer" loading="lazy"></button>'; }).join("") + "</div>" : "");
    document.body.appendChild(lb);
    var img = lb.querySelector(".pd-lb__img"), stage = lb.querySelector(".pd-lb__stage"), count = lb.querySelector(".pd-lb__count");
    img.addEventListener("error", function () { if (img.src.indexOf(local) < 0) img.src = local; });
    function show(i, dir) {
      at = (i + shots.length) % shots.length; setZoom(false);
      img.classList.remove("is-in", "from-left", "from-right"); void img.offsetWidth;
      img.src = shots[at]; img.alt = title + " — photo " + (at + 1) + " of " + shots.length;
      img.classList.add("is-in", dir < 0 ? "from-left" : "from-right");
      count.textContent = many ? (at + 1) + " / " + shots.length : "";
      lb.querySelectorAll(".pd-lb__thumb").forEach(function (t, j) { t.classList.toggle("is-on", j === at); if (j === at) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current"); });
    }
    function setZoom(on, ev) {
      zoom = on; lb.classList.toggle("is-zoom", on);
      if (on && ev) pan(ev); else img.style.transformOrigin = "50% 50%";
    }
    function pan(ev) { var r = img.getBoundingClientRect(); img.style.transformOrigin = ((ev.clientX - r.left) / r.width * 100) + "% " + ((ev.clientY - r.top) / r.height * 100) + "%"; }
    function close() {
      lb.classList.remove("is-open"); document.documentElement.classList.remove("pd-lb-lock");
      document.removeEventListener("keydown", onKey, true);
      setTimeout(function () { lb.remove(); }, 220);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" && many) { e.preventDefault(); show(at + 1, 1); }
      else if (e.key === "ArrowLeft" && many) { e.preventDefault(); show(at - 1, -1); }
      else if (e.key === "Tab") { /* keep focus inside the viewer */
        var f = [].slice.call(lb.querySelectorAll("button")), i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    }
    lb.addEventListener("click", function (e) {
      if (e.target.closest(".pd-lb__close")) return close();
      if (e.target.closest(".pd-lb__nav--prev")) return show(at - 1, -1);
      if (e.target.closest(".pd-lb__nav--next")) return show(at + 1, 1);
      var t = e.target.closest(".pd-lb__thumb"); if (t) return show(+t.dataset.i, +t.dataset.i < at ? -1 : 1);
      if (e.target === img) { if (!moved) setZoom(!zoom, e); return; }
      if (e.target === stage || e.target === lb) close();
    });
    img.addEventListener("mousemove", function (e) { if (zoom) pan(e); });
    /* swipe (touch) to change photo; while zoomed a drag pans instead */
    var x0 = null, y0 = 0, moved = false;
    stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; y0 = e.clientY; moved = false; });
    stage.addEventListener("pointermove", function (e) { if (x0 == null) return; if (Math.abs(e.clientX - x0) > 8) moved = true; if (zoom && e.pointerType !== "mouse") pan(e); });
    stage.addEventListener("pointerup", function (e) {
      if (x0 == null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (!zoom && many && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(at + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      setTimeout(function () { moved = false; }, 0);
    });
    document.addEventListener("keydown", onKey, true);
    document.documentElement.classList.add("pd-lb-lock");
    show(at, 1);
    requestAnimationFrame(function () { lb.classList.add("is-open"); lb.querySelector(".pd-lb__close").focus({ preventScroll: true }); });
  }

  var shareBtn = document.getElementById("pdShare");
  if (shareBtn) shareBtn.addEventListener("click", function () {
    if (window.RKStore) window.RKStore.share({ title: title, text: "by " + authors.map(function (p) { return p[1]; }).join(", ") + (cur.p != null ? " — " + fmt(cur.p) : ""), url: location.href });
  });

  function relCard(b, c) { return RKBookCard(RKBookCard.fromRow(b, "?id=" + encodeURIComponent(b[4]) + "&c=" + encodeURIComponent(c) + "&from=" + encodeURIComponent(from), "../covers/")); }

  /* more books by the same author(s): every other catalogue book that shares an author — matched on the live site's
     author id (books-formats.js) or, failing that, the author's name. Sits above "More from this collection". */
  var shownIds = {};
  (function () {
    var ALLF = window.RK_FORMATS || {};
    function norm(n) { return String(n || "").toLowerCase().replace(/[^a-z\u0900-\u097f]+/g, " ").trim(); }
    var mine = {}, myNames = {};
    authors.forEach(function (p) { if (p[0]) mine[p[0]] = p[1]; if (norm(p[1])) myNames[norm(p[1])] = p[1]; });
    var seen = {}, hits = [], matched = {};
    seen[id] = 1;
    Object.keys(C).forEach(function (k) {
      C[k].books.forEach(function (b) {
        if (seen[b[4]]) return;
        var who = null;
        ((ALLF[b[4]] || {}).au || []).forEach(function (p) { if (!who && mine[p[0]]) who = mine[p[0]]; });
        if (!who) String(b[1] || "").split(/\s*,\s*/).forEach(function (n) { if (!who && myNames[norm(n)]) who = myNames[norm(n)]; });
        if (who) { seen[b[4]] = 1; matched[who] = 1; hits.push([b, k]); }
      });
    });
    if (!hits.length) return;
    var names = Object.keys(matched), MAX = 5;
    document.getElementById("pdByAuthorTitle").textContent = "More books by " + (names.length === 1 ? names[0] : names.length === 2 ? names.join(" & ") : "these authors");
    document.getElementById("pdByAuthorGrid").innerHTML = hits.slice(0, MAX).map(function (h) { shownIds[h[0][4]] = 1; return relCard(h[0], h[1]); }).join("");
    /* "all books" link: the author's page — ours for the featured authors, the live site's otherwise */
    var first = authors.filter(function (p) { return p[0] && matched[p[1]]; })[0], all = document.getElementById("pdByAuthorAll");
    if (first) {
      all.href = personHref(first); if (!OURS[first[0]]) { all.target = "_blank"; all.rel = "noopener noreferrer"; }
      all.textContent = (hits.length > MAX ? "All " + hits.length + " in this catalogue · " : "") + "Author page " + (OURS[first[0]] ? "→" : "↗");
      all.hidden = false;
    }
    document.getElementById("pdByAuthor").hidden = false;
  })();

  /* more from the same collection — the shared book card (kt/book-card.js handles its buttons); books already shown
     in the author row are skipped */
  var rel = col.books.filter(function (b) { return b[4] !== id && !shownIds[b[4]]; }).slice(0, 4);
  if (rel.length) {
    document.getElementById("pdRelatedGrid").innerHTML = rel.map(function (b) { return relCard(b, slug); }).join("");
    document.getElementById("pdRelated").hidden = false;
  }
})();
