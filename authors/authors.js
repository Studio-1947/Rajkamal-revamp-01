/* Authors directory: 20 featured authors with search, "what they write" filters and sorting. Filter state lives in the URL. */
(function () {
  var A = window.RK_AUTHORS || [], TAGS = window.RK_AUTHOR_TAGS || [];
  var grid = document.getElementById("auGrid"), chips = document.getElementById("auChips");
  var input = document.getElementById("auSearch"), sortSel = document.getElementById("auSort");
  var empty = document.getElementById("auEmpty"), count = document.getElementById("auCount");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function initials(n) { return n.replace(/'[^']*'/g, "").trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join(""); }
  function years(a) { return a.died ? a.born + "–" + a.died : "b. " + a.born; }

  var q = new URLSearchParams(location.search);
  var state = { tag: q.get("tag") || "all", q: q.get("q") || "", sort: q.get("sort") || "az" };
  if (state.tag !== "all" && !TAGS.some(function (t) { return t[0] === state.tag; })) state.tag = "all";
  input.value = state.q; sortSel.value = state.sort;

  chips.innerHTML = [["all", "All"]].concat(TAGS).map(function (t) {
    var n = t[0] === "all" ? A.length : A.filter(function (a) { return a.tags.indexOf(t[0]) >= 0; }).length;
    return '<button type="button" class="au-chip" data-tag="' + t[0] + '" aria-pressed="false">' + esc(t[1]) + " <i>" + n + "</i></button>";
  }).join("");

  function card(a) {
    return '<a class="au-card" href="author/?id=' + encodeURIComponent(a.id) + '">' +
      '<span class="au-photo" style="--img:url(' + new URL('photos/' + a.id + '.jpg?v=3', location.href).href + ')"><img src="photos/' + esc(a.id) + '.jpg?v=3" alt="" width="240" height="300" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'no-img\');this.remove()"><b aria-hidden="true">' + esc(initials(a.name)) + "</b></span>" +
      '<span class="au-name" lang="hi" title="' + esc(a.hi) + '"><span>' + esc(a.hi) + "</span></span>" +
      '<span class="au-role">' + esc(a.role) + "</span>" +
      '<span class="au-meta"><span>' + years(a) + "</span><span>" + a.books + (a.books === 1 ? " book" : " books") + "</span></span>" +
      "</a>";
  }

  function norm(s) { return s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g, " "); }
  function apply() {
    var needle = norm(state.q).trim();
    var list = A.filter(function (a) {
      if (state.tag !== "all" && a.tags.indexOf(state.tag) < 0) return false;
      if (!needle) return true;
      return norm([a.name, a.hi, a.role, a.place, a.works.join(" ")].join(" ")).indexOf(needle) >= 0;
    });
    list.sort(function (x, y) {
      if (state.sort === "books") return y.books - x.books;
      if (state.sort === "born") return x.born - y.born;
      return x.hi.replace(/'/g, "").localeCompare(y.hi.replace(/'/g, ""), "hi");
    });
    grid.innerHTML = list.map(card).join("");
    empty.hidden = list.length > 0;
    var filtered = state.tag !== "all" || needle;
    count.textContent = filtered ? list.length + " of " + A.length + " authors" : A.length + " featured authors";
    chips.querySelectorAll(".au-chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.tag === state.tag)); });

    var p = new URLSearchParams();
    if (state.tag !== "all") p.set("tag", state.tag);
    if (state.q.trim()) p.set("q", state.q.trim());
    if (state.sort !== "az") p.set("sort", state.sort);
    var qs = p.toString();
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "")); } catch (e) {}
  }

  chips.addEventListener("click", function (e) {
    var c = e.target.closest(".au-chip"); if (!c) return;
    state.tag = c.dataset.tag; apply();
  });
  var t;
  input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { state.q = input.value; apply(); }, 80); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { var first = grid.querySelector(".au-card"); if (first && grid.children.length === 1) location.href = first.href; }
  });
  sortSel.addEventListener("change", function () { state.sort = sortSel.value; apply(); });
  document.getElementById("auReset").addEventListener("click", function () {
    state.tag = "all"; state.q = ""; input.value = ""; apply(); input.focus();
  });
  apply();
})();
