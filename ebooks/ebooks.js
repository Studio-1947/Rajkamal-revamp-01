/* E-Books listing: search, Sort and Filter (genre + price) in the same bar and panels as All Books (books.css).
   Filter state lives in the URL. */
(function () {
  var E = window.RK_EBOOKS || [], G = window.RK_EBOOK_GENRES || [];
  var PRICES = [["any", "Any price"], ["0-200", "Under ₹200"], ["200-400", "₹200 – ₹400"], ["400-", "₹400 & above"]];
  var SORTS = [["featured", "Featured"], ["new", "Newest first"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["az", "Title A–Z"]];
  var grid = document.getElementById("ebGrid"), bar = document.getElementById("ebFilters");
  var input = document.getElementById("ebSearch"), popSort = document.getElementById("ebPopSort"), popFilter = document.getElementById("ebPopFilter");
  var sortBtn = bar.querySelector('[data-pop="sort"]'), filterBtn = bar.querySelector('[data-pop="filter"]'), badge = document.getElementById("ebFiltBadge");
  var empty = document.getElementById("ebEmpty"), count = document.getElementById("ebCount");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var GN = {}; G.forEach(function (g) { GN[g[0]] = g[1]; });

  var q = new URLSearchParams(location.search);
  var state = { g: q.get("g") || "all", price: q.get("price") || "any", q: q.get("q") || "", sort: q.get("sort") || "featured" };
  if (state.g !== "all" && !GN[state.g]) state.g = "all";
  if (!PRICES.some(function (p) { return p[0] === state.price; })) state.price = "any";
  if (!SORTS.some(function (o) { return o[0] === state.sort; })) state.sort = "featured";
  input.value = state.q;

  function inPrice(b, key) {
    key = key || state.price;
    if (key === "any") return true;
    var r = key.split("-"), lo = +r[0] || 0, hi = r[1] ? +r[1] : Infinity;
    return b.p >= lo && b.p < hi;
  }
  function card(b) {
    return '<a class="eb-card" href="ebook/?id=' + encodeURIComponent(b.id) + '">' +
      '<span class="eb-cover"><img src="covers/' + esc(b.id) + '.jpg" alt="" width="300" height="460" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'no-img\');this.remove()"><b>' + esc(b.t) + "</b></span>" +
      '<span class="eb-tag">' + esc(GN[b.g] || "E-Book") + "</span>" +
      '<span class="eb-title" title="' + esc(b.t) + '">' + esc(b.t) + "</span>" +
      '<span class="eb-author">' + esc(b.a) + "</span>" +
      '<span class="eb-foot"><strong>₹' + b.p + '</strong><span class="eb-stores" aria-label="Available on Kindle and Google Play"><i>Kindle</i><i>Google Play</i></span></span>' +
      "</a>";
  }
  function norm(s) { return s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g, " "); }
  function matches(b, g, price, needle) {
    if (g !== "all" && b.g !== g) return false;
    if (!inPrice(b, price)) return false;
    return !needle || norm(b.t + " " + b.a + " " + (GN[b.g] || "")).indexOf(needle) >= 0;
  }
  function popHead(t) { return '<div class="bk-pop__head"><b>' + t + '</b><button type="button" class="bk-pop__x" data-close aria-label="Close"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'; }
  function chip(attr, val, label, on, n) { return '<button type="button" class="bk-pop__chip' + (on ? " is-on" : "") + '" ' + attr + '="' + val + '" aria-pressed="' + on + '"' + (!on && !n ? " disabled" : "") + ">" + esc(label) + " <i>" + n + "</i></button>"; }
  function apply() {
    var needle = norm(state.q).trim();
    var list = E.filter(function (b) { return matches(b, state.g, state.price, needle); });
    if (state.sort === "new") list.sort(function (x, y) { return y.year - x.year; });
    else if (state.sort === "price-asc") list.sort(function (x, y) { return x.p - y.p; });
    else if (state.sort === "price-desc") list.sort(function (x, y) { return y.p - x.p; });
    else if (state.sort === "az") list.sort(function (x, y) { return x.t.localeCompare(y.t); });
    grid.innerHTML = list.map(card).join("");
    empty.hidden = list.length > 0;
    var on = (state.g !== "all") + (state.price !== "any"), filtered = on || needle;
    count.textContent = filtered ? list.length + " of " + E.length + " e-books" : E.length + " e-books · Kindle & Google Play";
    /* panels: every option shows how many e-books it leaves; options that leave none are disabled */
    function n(g, price) { return E.filter(function (b) { return matches(b, g, price, needle); }).length; }
    popSort.innerHTML = popHead("Sort by") + SORTS.map(function (o) { var sel = o[0] === state.sort; return '<button type="button" class="bk-pop__opt' + (sel ? " is-on" : "") + '" role="option" aria-selected="' + sel + '" data-sort="' + o[0] + '">' + o[1] + "</button>"; }).join("");
    document.getElementById("ebSortLabel").textContent = SORTS.filter(function (o) { return o[0] === state.sort; })[0][1];
    sortBtn.classList.toggle("is-active", state.sort !== "featured");
    popFilter.innerHTML = popHead("Filter") +
      '<p class="bk-pop__label">Genre</p><div class="bk-pop__row">' + [["all", "All"]].concat(G).map(function (g) { return chip("data-g", g[0], g[1], state.g === g[0], n(g[0], state.price)); }).join("") + "</div>" +
      '<p class="bk-pop__label">Price</p><div class="bk-pop__row">' + PRICES.map(function (p) { return chip("data-price", p[0], p[1], state.price === p[0], n(state.g, p[0])); }).join("") + "</div>" +
      '<div class="bk-pop__foot"><button type="button" class="bk-pop__clear" data-clear' + (on ? "" : " disabled") + '>Clear all</button><button type="button" class="bk-pop__apply" data-close>Show ' + list.length + (list.length === 1 ? " e-book" : " e-books") + "</button></div>";
    badge.hidden = !on; badge.textContent = on; filterBtn.classList.toggle("is-active", !!on);

    var p = new URLSearchParams();
    if (state.g !== "all") p.set("g", state.g);
    if (state.price !== "any") p.set("price", state.price);
    if (state.q.trim()) p.set("q", state.q.trim());
    if (state.sort !== "featured") p.set("sort", state.sort);
    var qs = p.toString();
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "")); } catch (e) {}
  }

  function closePops() { popSort.hidden = true; popFilter.hidden = true; sortBtn.setAttribute("aria-expanded", "false"); filterBtn.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("bk-pop-open"); }
  function toggle(btn, pop) {
    return function (e) {
      e.stopPropagation();
      var open = pop.hidden; closePops(); pop.hidden = !open; btn.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("bk-pop-open", open);
      if (open && window.innerWidth > 720) { /* under its button, kept inside the screen */
        pop.style.left = "0px";
        var r = pop.getBoundingClientRect(), br = btn.getBoundingClientRect(), fr = bar.getBoundingClientRect();
        var left = br.left - fr.left, over = fr.left + left + r.width - (document.documentElement.clientWidth - 16);
        pop.style.left = Math.max(0, left - Math.max(0, over)) + "px";
      }
    };
  }
  sortBtn.addEventListener("click", toggle(sortBtn, popSort));
  filterBtn.addEventListener("click", toggle(filterBtn, popFilter));
  document.addEventListener("click", function (e) { if (!e.target.closest(".bk-pop") && !e.target.closest("[data-pop]")) closePops(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePops(); });
  popSort.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) return closePops();
    var o = e.target.closest("[data-sort]"); if (!o) return; state.sort = o.dataset.sort; closePops(); apply();
  });
  popFilter.addEventListener("click", function (e) {
    e.stopPropagation();
    if (e.target.closest("[data-close]")) return closePops();
    if (e.target.closest("[data-clear]")) { state.g = "all"; state.price = "any"; apply(); return; }
    var c = e.target.closest(".bk-pop__chip"); if (!c || c.disabled) return;
    if (c.hasAttribute("data-g")) state.g = c.dataset.g; else state.price = c.dataset.price;
    apply();
  });
  var t;
  input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { state.q = input.value; apply(); }, 80); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && grid.children.length === 1) location.href = grid.firstChild.href;
  });
  document.getElementById("ebReset").addEventListener("click", function () {
    state.g = "all"; state.price = "any"; state.q = ""; input.value = ""; apply(); input.focus();
  });
  apply();

  /* the banner stays pinned under the nav (same behaviour as All Books) */
  (function () {
    var ban = document.getElementById("ebBanner"), header = document.getElementById("siteHeader"), raf = 0, stuck = false;
    if (!ban) return;
    function navH() { return header && getComputedStyle(header).display !== "none" ? header.getBoundingClientRect().height : 0; }
    function set(on) {
      if (on === stuck) return; stuck = on; ban.style.marginBottom = "";
      if (on) { var h0 = ban.offsetHeight; ban.classList.add("is-stuck"); ban.style.marginBottom = ((parseFloat(getComputedStyle(ban).marginBottom) || 0) + h0 - ban.offsetHeight) + "px"; }
      else ban.classList.remove("is-stuck");
    }
    function check() { raf = 0; var top = navH(); ban.style.setProperty("--bk-top", top + "px"); set(window.scrollY > 40 && ban.getBoundingClientRect().top <= top + 1); }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
    window.addEventListener("resize", function () { set(false); check(); });
    check();
  })();
})();
