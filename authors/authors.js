/* Authors directory: featured authors with search, "what they write" filters, sorting and a letter index
   (every Hindi letter, or A–Z). Filter state lives in the URL.

   Letter index — authors are often known by one name (दिनकर, निराला, रेणु…), so a letter matches ANY part of a name:
   the best-known name (data: `known` / `knownEn`), the first name, the last name and other parts. Within a letter the
   order is: best-known name, then first name, then last name, then the rest — and the card highlights the word that
   matched, so it's clear why the author is there. Filler middle names (कुमार, नाथ, लाल…) don't create entries.
   Words that start with a conjunct (श्री…, त्रि…, क्ष…, ज्ञा…) are listed under the conjunct and under its base letter. */
(function () {
  var A = window.RK_AUTHORS || [], TAGS = window.RK_AUTHOR_TAGS || [];
  var grid = document.getElementById("auGrid"), chips = document.getElementById("auChips");
  var input = document.getElementById("auSearch"), sortSel = document.getElementById("auSort");
  var empty = document.getElementById("auEmpty"), count = document.getElementById("auCount");
  var lettersEl = document.getElementById("auLetters"), hint = document.getElementById("auHint"), scriptEl = document.getElementById("auScript");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function initials(n) { return n.replace(/'[^']*'/g, "").trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join(""); }
  function years(a) { return a.died ? a.born + "–" + a.died : "b. " + a.born; }

  /* ---- the letter index ---- */
  var HI = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न",
            "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ", "श्र"];
  var EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  var CONJ = ["क्ष", "त्र", "ज्ञ", "श्र"], VIRAMA = "्";
  var FILLER = { hi: ["सिंह", "कुमार", "नाथ", "लाल", "चन्द्र", "चंद्र", "प्रसाद", "माधव"], en: ["singh", "kumar", "nath", "lal", "chandra", "prasad", "madhav"] };
  function clean(w) { return String(w || "").replace(/['"‘’“”().,]/g, "").replace(/़/g, "").trim(); } // drop quotes and the nukta (ज़ → ज)
  function lettersOf(word, ab) {
    var w = clean(word); if (!w) return [];
    if (ab === "en") return /[a-z]/i.test(w[0]) ? [w[0].toUpperCase()] : [];
    var out = [w[0]];
    if (w[1] === VIRAMA && CONJ.indexOf(w[0] + VIRAMA + w[2]) >= 0) out.unshift(w[0] + VIRAMA + w[2]);
    return out;
  }
  /* every name part of an author with its rank: 0 best-known name · 1 first name · 2 last name · 3 other */
  function parts(a, ab) {
    var full = ab === "en" ? a.name : a.hi, known = clean(ab === "en" ? a.knownEn : a.known);
    var words = full.split(/\s+/).map(clean).filter(Boolean), out = [];
    words.forEach(function (w, i) {
      var rank = known && w === known ? 0 : i === 0 ? 1 : i === words.length - 1 ? 2 : 3;
      if (rank === 3 && FILLER[ab].indexOf(ab === "en" ? w.toLowerCase() : w) >= 0) return;
      out.push({ w: w, rank: rank });
    });
    if (known && !out.some(function (p) { return p.w === known; })) out.push({ w: known, rank: 0 });
    return out;
  }
  function hit(a, letter, ab) { /* the best-ranked name part of this author that starts with the letter */
    var best = null;
    parts(a, ab).forEach(function (p) { if (lettersOf(p.w, ab).indexOf(letter) >= 0 && (!best || p.rank < best.rank)) best = p; });
    return best;
  }
  function sortKey(a, ab) { return clean(ab === "en" ? (a.knownEn || a.name) : (a.known || a.hi)); }

  var q = new URLSearchParams(location.search);
  var state = { tag: q.get("tag") || "all", q: q.get("q") || "", sort: q.get("sort") || "az", ab: q.get("ab") === "en" ? "en" : "hi", letter: q.get("l") || "" };
  if (state.tag !== "all" && !TAGS.some(function (t) { return t[0] === state.tag; })) state.tag = "all";
  if ((state.ab === "en" ? EN : HI).indexOf(state.letter) < 0) state.letter = "";
  if (state.sort === "az" && state.ab === "en") state.sort = "az-en";
  input.value = state.q; sortSel.value = state.sort;

  chips.innerHTML = [["all", "All"]].concat(TAGS).map(function (t) {
    var n = t[0] === "all" ? A.length : A.filter(function (a) { return a.tags.indexOf(t[0]) >= 0; }).length;
    return '<button type="button" class="au-chip" data-tag="' + t[0] + '" aria-pressed="false">' + esc(t[1]) + " <i>" + n + "</i></button>";
  }).join("");

  function drawLetters() {
    var list = state.ab === "en" ? EN : HI;
    lettersEl.innerHTML = '<button type="button" class="au-letter au-letter--all" data-l="" aria-pressed="' + (!state.letter) + '">All</button>' + list.map(function (l) {
      var n = A.filter(function (a) { return hit(a, l, state.ab); }).length;
      return '<button type="button" class="au-letter" data-l="' + l + '" aria-pressed="' + (state.letter === l) + '"' + (n ? ' title="' + n + (n === 1 ? " author" : " authors") + '"' : ' disabled title="No authors"') +
        (state.ab === "hi" ? ' lang="hi"' : "") + ">" + l + "</button>";
    }).join("");
    lettersEl.setAttribute("aria-label", state.ab === "en" ? "Filter by letter, A to Z" : "Filter by Hindi letter");
    scriptEl.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.ab === state.ab)); });
  }

  /* the name with the matched word marked */
  function nameHtml(full, h) {
    if (!h) return esc(full);
    var done = false;
    return full.split(/(\s+)/).map(function (tok) {
      if (!done && clean(tok) === h.w) { done = true; return '<mark class="au-hit">' + esc(tok) + "</mark>"; }
      return esc(tok);
    }).join("");
  }
  /* "Poet, lyricist & filmmaker" → one pill per role, all styled the same (none is a state) */
  function rolePills(role) {
    return '<span class="au-roles">' + String(role || "").split(/\s*,\s*|\s+&\s+/).filter(Boolean).map(function (r) {
      return '<span class="au-role">' + esc(r.charAt(0).toUpperCase() + r.slice(1)) + "</span>";
    }).join("") + "</span>";
  }
  function card(a, h) {
    var en = state.ab === "en";
    var primary = nameHtml(en ? a.name : a.hi, h && (en ? a.name : a.hi).split(/\s+/).map(clean).indexOf(h.w) >= 0 ? h : null);
    return '<a class="au-card" href="author/?id=' + encodeURIComponent(a.id) + '">' +
      '<span class="au-photo"><img src="photos/' + esc(a.id) + '.jpg?v=5" alt="" width="960" height="1200" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'no-img\');this.remove()"><b aria-hidden="true">' + esc(initials(a.name)) + "</b></span>" +
      '<span class="au-body">' +
      '<span class="au-name"' + (en ? "" : ' lang="hi"') + ' title="' + esc(en ? a.name : a.hi) + '"><span>' + primary + "</span></span>" +
      (en ? '<span class="au-hi" lang="hi">' + esc(a.hi) + "</span>" : "") +
      rolePills(a.role) +
      '<span class="au-meta"><span>' + years(a) + "</span><span>" + a.books + (a.books === 1 ? " book" : " books") + "</span></span>" +
      "</span></a>";
  }

  function norm(s) { return s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g, " "); }
  function apply() {
    var needle = norm(state.q).trim(), ab = state.ab, L = state.letter;
    var rows = [];
    A.forEach(function (a) {
      if (state.tag !== "all" && a.tags.indexOf(state.tag) < 0) return;
      if (needle && norm([a.name, a.hi, a.known || "", a.knownEn || "", a.role, a.place, a.works.join(" ")].join(" ")).indexOf(needle) < 0) return;
      var h = L ? hit(a, L, ab) : null;
      if (L && !h) return;
      rows.push({ a: a, h: h });
    });
    var loc = ab === "en" ? "en" : "hi";
    rows.sort(function (x, y) {
      if (L) return (x.h.rank - y.h.rank) || x.h.w.localeCompare(y.h.w, loc) || sortKey(x.a, ab).localeCompare(sortKey(y.a, ab), loc);
      if (state.sort === "books") return y.a.books - x.a.books;
      if (state.sort === "born") return x.a.born - y.a.born;
      var s = state.sort === "az-en" ? "en" : "hi";
      return sortKey(x.a, s).localeCompare(sortKey(y.a, s), s);
    });
    grid.innerHTML = rows.map(function (r) { return card(r.a, r.h); }).join("");
    empty.hidden = rows.length > 0;
    var filtered = state.tag !== "all" || needle || L;
    count.textContent = filtered ? rows.length + " of " + A.length + " authors" : A.length + " featured authors";
    chips.querySelectorAll(".au-chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.tag === state.tag)); });
    lettersEl.querySelectorAll(".au-letter").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.l === L)); });
    hint.innerHTML = L
      ? "<b" + (ab === "hi" ? ' lang="hi"' : "") + ">" + L + "</b> — " + rows.length + (rows.length === 1 ? " author" : " authors") + " with a name starting with this letter. The name they're best known by comes first; the matching word is marked."
      : ab === "en" ? "Pick a letter — it matches any part of a name, so Ramdhari Singh 'Dinkar' is under <b>D</b> and <b>R</b>."
      : "Pick a letter — it matches any part of a name, so <span lang=\"hi\">रामधारी सिंह 'दिनकर'</span> is under <b lang=\"hi\">द</b> and <b lang=\"hi\">र</b>.";
    sortSel.disabled = !!L; sortSel.title = L ? "Sorted by the matching name while a letter is chosen" : "";
    var nowEl = document.getElementById("auIndexNow"); /* the chosen letter stays visible in the header, even when the panel is hidden */
    if (nowEl) { nowEl.hidden = !L; nowEl.textContent = L; if (ab === "hi") nowEl.setAttribute("lang", "hi"); else nowEl.removeAttribute("lang"); }

    var p = new URLSearchParams();
    if (state.tag !== "all") p.set("tag", state.tag);
    if (state.q.trim()) p.set("q", state.q.trim());
    if (state.sort !== "az") p.set("sort", state.sort);
    if (ab === "en") p.set("ab", "en");
    if (L) p.set("l", L);
    var qs = p.toString();
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "")); } catch (e) {}
  }

  chips.addEventListener("click", function (e) { var c = e.target.closest(".au-chip"); if (!c) return; state.tag = c.dataset.tag; apply(); });
  lettersEl.addEventListener("click", function (e) {
    var b = e.target.closest(".au-letter"); if (!b || b.disabled) return;
    state.letter = state.letter === b.dataset.l ? "" : b.dataset.l; apply();
  });
  scriptEl.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-ab]"); if (!b || b.dataset.ab === state.ab) return;
    state.ab = b.dataset.ab; state.letter = "";
    if (state.sort === "az" || state.sort === "az-en") { state.sort = state.ab === "en" ? "az-en" : "az"; sortSel.value = state.sort; }
    drawLetters(); apply();
  });
  var t;
  input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { state.q = input.value; apply(); }, 80); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { var first = grid.querySelector(".au-card"); if (first && grid.children.length === 1) location.href = first.href; }
  });
  sortSel.addEventListener("change", function () { state.sort = sortSel.value; apply(); });
  document.getElementById("auReset").addEventListener("click", function () {
    state.tag = "all"; state.q = ""; state.letter = ""; input.value = ""; apply(); input.focus();
  });
  drawLetters(); apply();

  /* ---- "Browse by name" can be hidden / shown; the choice is remembered (phones start with it hidden) ---- */
  (function () {
    var box = document.getElementById("auIndex"), btn = document.getElementById("auIndexToggle"), body = document.getElementById("auIndexBody");
    if (!box || !btn) return;
    var saved = null; try { saved = localStorage.getItem("rk-au-index"); } catch (e) {}
    var open = saved ? saved === "open" : !window.matchMedia("(max-width: 720px)").matches;
    if (state.letter) open = true; /* arriving with ?l=… shows the letters */
    function set(on, remember) {
      open = on; box.classList.toggle("is-closed", !on); body.hidden = !on;
      btn.setAttribute("aria-expanded", String(on)); btn.querySelector("span").textContent = on ? "Hide" : "Show";
      if (remember) try { localStorage.setItem("rk-au-index", on ? "open" : "closed"); } catch (e) {}
      window.dispatchEvent(new Event("resize")); /* lets kt/strip.js re-measure the letter row */
    }
    btn.addEventListener("click", function () { set(!open, true); });
    set(open, false);
  })();

  /* ---- search + sort stay pinned under the nav while you scroll ---- */
  (function () {
    var tools = document.querySelector(".au-tools"), header = document.getElementById("siteHeader"), raf = 0;
    if (!tools) return;
    function navH() { return header && getComputedStyle(header).display !== "none" ? header.getBoundingClientRect().height : 0; }
    function check() {
      raf = 0; var top = navH(); tools.style.setProperty("--au-top", top + "px");
      tools.classList.toggle("is-stuck", window.scrollY > 40 && tools.getBoundingClientRect().top <= top + 1);
    }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
    window.addEventListener("resize", check);
    check();
  })();
})();
