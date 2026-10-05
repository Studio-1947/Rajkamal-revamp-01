/* Catalogue page: shows 40+ books for the chosen collection, two per row. */
(function () {
  var q = new URLSearchParams(location.search);
  var slug = q.get("c") || "khud-se-judein";
  var from = q.get("from") || "kt";
  var title = q.get("t");
  var data = window.RK_COLLECTIONS || {};
  var col = data[slug] || data["khud-se-judein"];
  var MIN = 40;
  /* ?g=<genre> (from the All Books menu): a genre page, or g=all for the whole catalogue.
     The mock data has no genre tags yet, so a genre shows a mix drawn from every collection. */
  var genre = q.get("g"), eyebrow = null;
  if (genre) {
    var gHit = (window.RK_GENRES || []).filter(function (g) { return g.slug === genre; })[0];
    col = { name: genre === "all" ? "All Books" : gHit ? gHit.name : genre.replace(/-/g, " "), books: [] };
    eyebrow = genre === "all" ? "Rajkamal Prakashan" : "Browse by Genre";
    if (genre === "all") MIN = Infinity;
  }


  // own books first, then fill up to 40 from the other collections (round robin, no duplicates)
  var own = col.books.slice(), filler = [];
  if (own.length < MIN) {
    var others = Object.keys(data).filter(function (k) { return data[k] !== col; }).map(function (k) { return data[k].books.slice(); });
    var seen = {}; own.forEach(function (b) { seen[b[4]] = 1; });
    var i = 0;
    while (own.length + filler.length < MIN) {
      var progressed = false;
      for (var c = 0; c < others.length && own.length + filler.length < MIN; c++) {
        var b = others[c][i];
        if (b && !seen[b[4]]) { seen[b[4]] = 1; filler.push(b); progressed = true; }
      }
      i++;
      if (!progressed && i > 60) break;
    }
  }

  function prod(id) { return 'product/?id=' + encodeURIComponent(id) + '&c=' + encodeURIComponent(slug) + '&from=' + encodeURIComponent(from); }

  function card(b) { return RKBookCard(RKBookCard.fromRow(b, prod(b[4]), "covers/")); } // shared card: kt/book-card.js

  var grid = document.getElementById("bkGrid");
  var ALL = own.concat(filler);

  /* ---- sort / filter ----
     Options are the ones this catalogue really has: books are 10% or 20% off (or not discounted), formats are
     Paperback / Hardcover / E-Book, prices cluster between ₹150 and ₹500, a few titles are out of stock.
     Every option shows how many books it leaves (given the other choices); options that would leave none are disabled. */
  var DET = window.RK_DETAIL || {}, FAC = window.RK_FACETS || {};
  var SORTS = [["rec", "Recommended"], ["new", "Newest first"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["disc", "Biggest discount"], ["title", "Title A–Z"]];
  var FORMATS = [[1, "Paperback"], [2, "Hardcover"], [4, "E-Book"]];
  var PRICES = [["any", "Any", 0, Infinity], ["u200", "Under ₹200", 0, 199.99], ["200-300", "₹200–₹300", 200, 300], ["300-500", "₹300–₹500", 300.01, 500], ["500", "₹500+", 500.01, Infinity]];
  var OFFERS = [[0, "Any discount"], [10, "10% or more"], [20, "20% or more"], [30, "30% or more"], [50, "50% or more"]]; /* higher ones show 0 and are disabled until such books exist */
  var state = { sort: "rec", fmt: 0, price: "any", disc: 0, stock: false };
  function inStock(id) { var f = FAC[id]; if (f && f.length > 2) return !!f[2]; var d = DET[id]; return !d || !("stock" in d) || d.stock > 0; }
  function priceOf(key) { return PRICES.filter(function (p) { return p[0] === key; })[0] || PRICES[0]; }
  function pass(b, st, skip) {
    if (skip !== "fmt" && st.fmt) { var f = FAC[b[4]]; if (f && !(f[0] & st.fmt)) return false; }
    if (skip !== "price") { var pr = priceOf(st.price); if (b[2] < pr[2] || b[2] > pr[3]) return false; }
    if (skip !== "disc" && st.disc && b[3] < st.disc) return false;
    if (skip !== "stock" && st.stock && !inStock(b[4])) return false;
    return true;
  }
  function count(group, patch) { var st = {}; for (var k in state) st[k] = state[k]; for (var p in patch) st[p] = patch[p]; return ALL.filter(function (b) { return pass(b, st, null); }).length; }
  function active() { return (state.fmt ? 1 : 0) + (state.price !== "any" ? 1 : 0) + (state.disc ? 1 : 0) + (state.stock ? 1 : 0); }

  function apply() {
    var list = ALL.filter(function (b) { return pass(b, state, null); });
    var by = { "price-asc": function (a, b) { return a[2] - b[2]; }, "price-desc": function (a, b) { return b[2] - a[2]; }, disc: function (a, b) { return b[3] - a[3]; },
               "new": function (a, b) { return ((FAC[b[4]] || [0, 0])[1]) - ((FAC[a[4]] || [0, 0])[1]); }, title: function (a, b) { return a[0].localeCompare(b[0]); } }[state.sort];
    if (by) list.sort(by);
    var isDefault = state.sort === "rec" && !active();
    var html;
    if (isDefault) {
      html = own.map(card).join("");
      if (filler.length) html += (own.length ? '<h2 class="bk-more">More from Rajkamal Prakashan</h2>' : "") + filler.map(card).join("");
    } else if (list.length) html = list.map(card).join("");
    else html = '<p class="bk-empty">No books match these filters. <button type="button" class="bk-empty__clear" data-clear>Clear filters</button></p>';
    grid.innerHTML = html;
    var n = list.length + (list.length === 1 ? " book" : " books");
    document.getElementById("bkCount").textContent = n + (isDefault ? "" : " found");
    var bc = document.getElementById("bkBarCount"); if (bc) bc.textContent = n;
    if (bar) syncUI();
  }

  /* card buttons (cart / wishlist / buy) are handled once, site-wide, in kt/book-card.js */

  /* ---- bar wiring ---- */
  var bar = document.getElementById("bkFilters");
  var sortBtn, filterBtn, discBtn, popSort, popFilter, popDisc, badge, seg;
  function chip(attr, val, label, on, n) {
    return '<button type="button" class="bk-pop__chip' + (on ? " is-on" : "") + '" ' + attr + '="' + val + '" aria-pressed="' + on + '"' + (!on && !n ? " disabled" : "") + ">" + label + ' <i>' + n + "</i></button>";
  }
  function syncUI() {
    popSort.innerHTML = SORTS.map(function (o) { var on = o[0] === state.sort; return '<button type="button" class="bk-pop__opt' + (on ? " is-on" : "") + '" role="option" aria-selected="' + on + '" data-sort="' + o[0] + '">' + o[1] + "</button>"; }).join("");
    document.getElementById("bkSortLabel").textContent = SORTS.filter(function (o) { return o[0] === state.sort; })[0][1];
    sortBtn.classList.toggle("is-active", state.sort !== "rec");
    var shown = ALL.filter(function (b) { return pass(b, state, null); }).length;
    popFilter.innerHTML =
      '<p class="bk-pop__label">Format</p><div class="bk-pop__row">' + FORMATS.map(function (f) { var on = !!(state.fmt & f[0]); return chip("data-fmt", f[0], f[1], on, count("fmt", { fmt: on ? state.fmt : state.fmt | f[0] })); }).join("") + "</div>" +
      '<p class="bk-pop__label">Price</p><div class="bk-pop__row">' + PRICES.map(function (p) { return chip("data-price", p[0], p[1], state.price === p[0], count("price", { price: p[0] })); }).join("") + "</div>" +
      '<p class="bk-pop__label">Offer</p><div class="bk-pop__row">' + OFFERS.map(function (o) { return chip("data-disc", o[0], o[1], state.disc === o[0], count("disc", { disc: o[0] })); }).join("") + "</div>" +
      '<label class="bk-pop__switch"><input type="checkbox" data-stock' + (state.stock ? " checked" : "") + '><span>In stock only</span><em aria-hidden="true"></em></label>' +
      '<div class="bk-pop__foot"><button type="button" class="bk-pop__clear" data-clear' + (active() ? "" : " disabled") + '>Clear all</button><button type="button" class="bk-pop__apply" data-close>Show ' + shown + (shown === 1 ? " book" : " books") + "</button></div>";
    /* format segment on the bar: All · Paperback · Hardcover · E-Book (one at a time; the Filter panel allows several) */
    seg.innerHTML = [[0, "All"]].concat(FORMATS).map(function (f) {
      var on = f[0] ? !!(state.fmt & f[0]) : !state.fmt, n = count("fmt", { fmt: f[0] });
      return '<button type="button" class="bk-seg__opt' + (on ? " is-on" : "") + '" data-seg="' + f[0] + '" aria-pressed="' + on + '"' + (!on && !n ? " disabled" : "") + ">" + f[1] + " <i>" + n + "</i></button>";
    }).join("");
    popDisc.innerHTML = OFFERS.map(function (o) {
      var on = state.disc === o[0], n = count("disc", { disc: o[0] });
      return '<button type="button" class="bk-pop__opt' + (on ? " is-on" : "") + '" role="option" aria-selected="' + on + '" data-disc="' + o[0] + '"' + (!on && !n ? " disabled" : "") + ">" + o[1] + " <i>" + n + "</i></button>";
    }).join("");
    document.getElementById("bkDiscLabel").textContent = state.disc ? state.disc + "%+ off" : "Discount";
    discBtn.classList.toggle("is-active", !!state.disc);
    var a = active();
    badge.hidden = !a; badge.textContent = a;
    filterBtn.classList.toggle("is-active", !!a);
    bar.querySelectorAll("[data-quick]").forEach(function (q) {
      var on = state.stock;
      q.classList.toggle("is-on", on); q.setAttribute("aria-pressed", String(on));
    });
  }
  function clearAll() { state.fmt = 0; state.price = "any"; state.disc = 0; state.stock = false; apply(); }
  if (bar) {
    sortBtn = bar.querySelector('[data-pop="sort"]'); filterBtn = bar.querySelector('[data-pop="filter"]');
    popSort = document.getElementById("bkPopSort"); popFilter = document.getElementById("bkPopFilter"); badge = document.getElementById("bkFiltBadge");
    discBtn = bar.querySelector('[data-pop="disc"]'); popDisc = document.getElementById("bkPopDisc"); seg = document.getElementById("bkSeg");
    function closePops() {
      popSort.hidden = true; popFilter.hidden = true; popDisc.hidden = true;
      sortBtn.setAttribute("aria-expanded", "false"); filterBtn.setAttribute("aria-expanded", "false"); discBtn.setAttribute("aria-expanded", "false");
    }
    function toggle(btn, pop) {
      return function (e) {
        e.stopPropagation();
        var open = pop.hidden; closePops(); pop.hidden = !open; btn.setAttribute("aria-expanded", String(open));
        /* keep the panel inside the screen: open it under its button, shifted left if it would run off the right edge */
        if (open && window.innerWidth > 720) {
          pop.style.left = "0px";
          var r = pop.getBoundingClientRect(), br = btn.getBoundingClientRect(), fr = bar.getBoundingClientRect();
          var left = br.left - fr.left, over = fr.left + left + r.width - (document.documentElement.clientWidth - 16);
          pop.style.left = Math.max(0, left - Math.max(0, over)) + "px";
        }
      };
    }
    sortBtn.addEventListener("click", toggle(sortBtn, popSort));
    filterBtn.addEventListener("click", toggle(filterBtn, popFilter));
    discBtn.addEventListener("click", toggle(discBtn, popDisc));
    popDisc.addEventListener("click", function (e) { var o = e.target.closest("[data-disc]"); if (!o || o.disabled) return; state.disc = +o.dataset.disc; closePops(); apply(); });
    seg.addEventListener("click", function (e) { var o = e.target.closest("[data-seg]"); if (!o || o.disabled) return; state.fmt = +o.dataset.seg; apply(); });
    document.addEventListener("click", function (e) { if (!bar.contains(e.target)) closePops(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePops(); });
    popSort.addEventListener("click", function (e) {
      var opt = e.target.closest("[data-sort]"); if (!opt) return;
      state.sort = opt.dataset.sort; closePops(); apply();
    });
    popFilter.addEventListener("click", function (e) {
      e.stopPropagation();
      var c = e.target.closest(".bk-pop__chip");
      if (c) {
        if (c.hasAttribute("data-fmt")) state.fmt ^= +c.dataset.fmt;
        else if (c.hasAttribute("data-price")) state.price = c.dataset.price;
        else if (c.hasAttribute("data-disc")) state.disc = +c.dataset.disc;
        apply(); return;
      }
      if (e.target.closest("[data-clear]")) { clearAll(); return; }
      if (e.target.closest("[data-close]")) closePops();
    });
    popFilter.addEventListener("change", function (e) { if (e.target.hasAttribute("data-stock")) { state.stock = e.target.checked; apply(); } });
    bar.querySelectorAll("[data-quick]").forEach(function (q) {
      q.addEventListener("click", function () {
        state.stock = !state.stock;
        apply();
      });
    });
    grid.addEventListener("click", function (e) { if (e.target.closest("[data-clear]")) clearAll(); });
  }

  apply();

  /* ---- title banner: the whole banner (title, count, sort / filter) stays pinned under the nav while you scroll.
     Pinned, it condenses a little; its bottom margin grows by exactly the height it loses, so the books below never jump. */
  (function () {
    var ban = document.getElementById("bkBanner"); if (!ban) return;
    var header = document.getElementById("siteHeader"), raf = 0, stuck = false;
    function navH() { return header && getComputedStyle(header).display !== "none" ? header.getBoundingClientRect().height : 0; }
    function set(on) {
      if (on === stuck) return; stuck = on;
      ban.style.marginBottom = "";
      if (on) {
        var h0 = ban.offsetHeight; ban.classList.add("is-stuck");
        var base = parseFloat(getComputedStyle(ban).marginBottom) || 0;
        ban.style.marginBottom = (base + h0 - ban.offsetHeight) + "px";
      } else ban.classList.remove("is-stuck");
    }
    function check() {
      raf = 0;
      var top = navH(); ban.style.setProperty("--bk-top", top + "px");
      set(window.scrollY > 40 && ban.getBoundingClientRect().top <= top + 1);
    }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
    window.addEventListener("resize", function () { set(false); check(); });
    check();
  })();

  document.getElementById("bkTitle").textContent = title || col.name;
  var bt = document.getElementById("bkBarTitle"); if (bt) bt.textContent = title || col.name;
  document.getElementById("bkCollection").textContent = eyebrow || col.name;
  document.title = (title || col.name) + " | Catalogue";
  var back = document.getElementById("bkBack");
  back.setAttribute("href", "../" + (/^kt[23]?$|^hp$|^mobile$/.test(from) ? from : "kt") + "/");
})();
