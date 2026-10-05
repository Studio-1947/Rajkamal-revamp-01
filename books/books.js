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

  /* ---- sort / filter state ---- */
  var state = { sort: "pop", disc: 0, price: "any", q50: false, qStock: false };
  var DET = window.RK_DETAIL || {};
  function inStock(id) { var d = DET[id]; return !d || !("stock" in d) || d.stock > 0; }
  function priceRange(key) {
    if (key === "0-200") return [0, 200];
    if (key === "200-500") return [200, 500];
    if (key === "500-999999") return [500, Infinity];
    return null;
  }

  function apply() {
    var list = ALL.slice();
    var minDisc = Math.max(state.disc, state.q50 ? 50 : 0);
    if (minDisc) list = list.filter(function (b) { return b[3] >= minDisc; });
    var pr = priceRange(state.price);
    if (pr) list = list.filter(function (b) { return b[2] >= pr[0] && b[2] <= pr[1]; });
    if (state.qStock) list = list.filter(function (b) { return inStock(b[4]); });

    if (state.sort === "price-asc") list.sort(function (a, b) { return a[2] - b[2]; });
    else if (state.sort === "price-desc") list.sort(function (a, b) { return b[2] - a[2]; });
    else if (state.sort === "discount") list.sort(function (a, b) { return b[3] - a[3]; });

    var isDefault = state.sort === "pop" && minDisc === 0 && !pr && !state.qStock;
    var html;
    if (isDefault) {
      html = own.map(card).join("");
      if (filler.length) html += (own.length ? '<h2 class="bk-more">More from Rajkamal Prakashan</h2>' : "") + filler.map(card).join("");
    } else if (list.length) {
      html = list.map(card).join("");
    } else {
      html = '<p class="bk-empty">No books match these filters.</p>';
    }
    grid.innerHTML = html;
    document.getElementById("bkCount").textContent = list.length + " books" + (isDefault ? "" : " found");
  }

  /* card buttons (cart / wishlist / buy) are handled once, site-wide, in kt/book-card.js */


  /* ---- filter bar wiring ---- */
  var bar = document.getElementById("bkFilters");
  if (bar) {
    var sortBtn = bar.querySelector('[data-pop="sort"]'), filterBtn = bar.querySelector('[data-pop="filter"]');
    var popSort = document.getElementById("bkPopSort"), popFilter = document.getElementById("bkPopFilter");
    var chip50 = bar.querySelector('[data-quick="discount50"]'), chipStock = bar.querySelector('[data-quick="stock"]');

    function closePops() {
      popSort.hidden = true; popFilter.hidden = true;
      sortBtn.setAttribute("aria-expanded", "false"); filterBtn.setAttribute("aria-expanded", "false");
    }
    sortBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = popSort.hidden;
      closePops();
      popSort.hidden = !open;
      sortBtn.setAttribute("aria-expanded", String(open));
    });
    filterBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = popFilter.hidden;
      closePops();
      popFilter.hidden = !open;
      filterBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) { if (!bar.contains(e.target)) closePops(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePops(); });

    popSort.addEventListener("click", function (e) {
      var opt = e.target.closest("[data-sort]");
      if (!opt) return;
      state.sort = opt.dataset.sort;
      popSort.querySelectorAll(".bk-pop__opt").forEach(function (o) { o.classList.toggle("is-on", o === opt); });
      sortBtn.classList.toggle("is-active", state.sort !== "pop");
      closePops();
      apply();
    });

    popFilter.addEventListener("click", function (e) {
      var chip = e.target.closest(".bk-pop__chip");
      if (chip) {
        if (chip.hasAttribute("data-disc")) {
          state.disc = Number(chip.dataset.disc);
          popFilter.querySelectorAll("[data-disc]").forEach(function (c) { c.classList.toggle("is-on", c === chip); });
        } else if (chip.hasAttribute("data-price")) {
          state.price = chip.dataset.price;
          popFilter.querySelectorAll("[data-price]").forEach(function (c) { c.classList.toggle("is-on", c === chip); });
        }
        filterBtn.classList.toggle("is-active", state.disc > 0 || state.price !== "any");
        apply();
        return;
      }
      if (e.target.id === "bkFiltClear") {
        state.disc = 0; state.price = "any";
        popFilter.querySelectorAll(".bk-pop__chip").forEach(function (c) { c.classList.toggle("is-on", c.dataset.disc === "0" || c.dataset.price === "any"); });
        filterBtn.classList.remove("is-active");
        apply();
        return;
      }
      if (e.target.closest("[data-close]")) closePops();
    });

    chip50.addEventListener("click", function () {
      state.q50 = !state.q50;
      chip50.classList.toggle("is-on", state.q50);
      apply();
    });
    chipStock.addEventListener("click", function () {
      state.qStock = !state.qStock;
      chipStock.classList.toggle("is-on", state.qStock);
      apply();
    });
  }

  apply();

  document.getElementById("bkTitle").textContent = title || col.name;
  document.getElementById("bkCollection").textContent = eyebrow || col.name;
  document.title = (title || col.name) + " | Catalogue";
  var back = document.getElementById("bkBack");
  back.setAttribute("href", "../" + (/^kt[23]?$|^hp$|^mobile$/.test(from) ? from : "kt") + "/");
})();
