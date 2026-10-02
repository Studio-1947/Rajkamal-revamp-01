/* E-Books listing: 20 e-books with search, genre + price filters and sorting. Filter state lives in the URL. */
(function () {
  var E = window.RK_EBOOKS || [], G = window.RK_EBOOK_GENRES || [];
  var PRICES = [["any", "Any price"], ["0-200", "Under ₹200"], ["200-400", "₹200 – ₹400"], ["400-", "₹400 & above"]];
  var grid = document.getElementById("ebGrid"), genres = document.getElementById("ebGenres"), prices = document.getElementById("ebPrices");
  var input = document.getElementById("ebSearch"), sortSel = document.getElementById("ebSort");
  var empty = document.getElementById("ebEmpty"), count = document.getElementById("ebCount");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var GN = {}; G.forEach(function (g) { GN[g[0]] = g[1]; });

  var q = new URLSearchParams(location.search);
  var state = { g: q.get("g") || "all", price: q.get("price") || "any", q: q.get("q") || "", sort: q.get("sort") || "featured" };
  if (state.g !== "all" && !GN[state.g]) state.g = "all";
  if (!PRICES.some(function (p) { return p[0] === state.price; })) state.price = "any";
  input.value = state.q; sortSel.value = state.sort;

  genres.innerHTML = [["all", "All"]].concat(G).map(function (g) {
    var n = g[0] === "all" ? E.length : E.filter(function (b) { return b.g === g[0]; }).length;
    return '<button type="button" class="au-chip" data-g="' + g[0] + '" aria-pressed="false">' + esc(g[1]) + " <i>" + n + "</i></button>";
  }).join("");
  prices.innerHTML = PRICES.map(function (p) { return '<button type="button" class="au-chip au-chip--sm" data-price="' + p[0] + '" aria-pressed="false">' + esc(p[1]) + "</button>"; }).join("");

  function inPrice(b) {
    if (state.price === "any") return true;
    var r = state.price.split("-"), lo = +r[0] || 0, hi = r[1] ? +r[1] : Infinity;
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
  function apply() {
    var needle = norm(state.q).trim();
    var list = E.filter(function (b) {
      if (state.g !== "all" && b.g !== state.g) return false;
      if (!inPrice(b)) return false;
      return !needle || norm(b.t + " " + b.a + " " + (GN[b.g] || "")).indexOf(needle) >= 0;
    });
    if (state.sort === "new") list.sort(function (x, y) { return y.year - x.year; });
    else if (state.sort === "price-asc") list.sort(function (x, y) { return x.p - y.p; });
    else if (state.sort === "price-desc") list.sort(function (x, y) { return y.p - x.p; });
    else if (state.sort === "az") list.sort(function (x, y) { return x.t.localeCompare(y.t); });
    grid.innerHTML = list.map(card).join("");
    empty.hidden = list.length > 0;
    var filtered = state.g !== "all" || state.price !== "any" || needle;
    count.textContent = filtered ? list.length + " of " + E.length + " e-books" : E.length + " e-books · Kindle & Google Play";
    genres.querySelectorAll(".au-chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.g === state.g)); });
    prices.querySelectorAll(".au-chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.price === state.price)); });

    var p = new URLSearchParams();
    if (state.g !== "all") p.set("g", state.g);
    if (state.price !== "any") p.set("price", state.price);
    if (state.q.trim()) p.set("q", state.q.trim());
    if (state.sort !== "featured") p.set("sort", state.sort);
    var qs = p.toString();
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "")); } catch (e) {}
  }

  genres.addEventListener("click", function (e) { var c = e.target.closest(".au-chip"); if (c) { state.g = c.dataset.g; apply(); } });
  prices.addEventListener("click", function (e) { var c = e.target.closest(".au-chip"); if (c) { state.price = c.dataset.price; apply(); } });
  var t;
  input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { state.q = input.value; apply(); }, 80); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && grid.children.length === 1) location.href = grid.firstChild.href;
  });
  sortSel.addEventListener("change", function () { state.sort = sortSel.value; apply(); });
  document.getElementById("ebReset").addEventListener("click", function () {
    state.g = "all"; state.price = "any"; state.q = ""; input.value = ""; apply(); input.focus();
  });
  apply();
})();
