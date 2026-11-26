/* Home page: hero (home-v2), collection tiles and product shelves built from home-data.js (content of rajkamalprakashan.com). */
(function () {
  var H = window.RK_HOME, root = document.getElementById("hm");
  if (!H || !root) return;

  /* work regardless of whether this script is included from /home/ or from the site root (/) */
  var ROOT = (function () {
    var el = document.currentScript || [].slice.call(document.getElementsByTagName("script")).filter(function (s) { return /(^|\/)home\.js/.test(s.src); }).pop();
    return el ? el.src.replace(/home\/home\.js.*$/, "") : "/";
  })();
  function siteURL(p) { return ROOT + p.replace(/^\.\.\//, ""); }        // "../kt/…"        -> ROOT + "kt/…"
  function coverURL(p) { return ROOT + "books/" + p.replace(/^\.\.\/books\//, ""); } // "../books/covers/…" -> ROOT + "books/covers/…"
  function homeImg(p) { return /^img\//.test(p) ? ROOT + "home/" + p : (/^\.\.\/books\//.test(p) ? coverURL(p) : p); }
  var LOCAL = {}; // books that have a local product page
  var C = window.RK_COLLECTIONS || {};
  Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { LOCAL[b[4]] = k; }); });
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  var SITE = "https://www.rajkamalprakashan.com";
  /* shelf → [eyebrow, heading, collection slug]; "View all" opens that collection's own page (books/?c=<slug>) */
  var TITLES = { "हिन्दी दिवस": ["Hindi Divas", "हिन्दी दिवस", "hindi-divas"], "New Releases": ["Just arrived", "New Releases", "new-releases"], "Bestsellers": ["Readers' favourites", "Bestsellers", "bestsellers"], "Award Winners": ["Honoured writing", "Award Winners", "award-winners"], "Children Books": ["For young readers", "Children Books", "children-books"], "World Classic": ["Across languages", "World Classic", "world-classic"], "Magazine": ["Periodicals", "Magazine", "magazine"] };

  /* ---- hero: Kitab Dost in the middle, sloped flip slabs either side (same as home-v2/).
     This is only the markup; the slabs, speech bubble, phone carousel and search are wired by home-v2/hero.js. ---- */
  var DOST = siteURL("../home-v2/img/kitabdost-book.webp");
  var top = '<section class="hv" id="hv" aria-labelledby="hvTitle"><span class="hv-glow" aria-hidden="true"></span>' +
    '<h1 class="hv-sr" id="hvTitle">Rajkamal Prakashan Samuh</h1>' +
    /* phone greeting: what Kitab Dost says, shown as the heading beside him (hidden on desktop, where he has the speech bubble) */
    '<div class="hv-greet"><p class="hv-greet__eyebrow">75+ years of Hindi publishing</p><p class="hv-greet__title" lang="hi"><span class="hv-greet__line is-on"><span class="hv-greet__lead">मैं हूँ आपका</span><span class="hv-greet__main">किताब दोस्त</span></span><span class="hv-greet__line" aria-hidden="true"><span class="hv-greet__lead">साथ जुड़ें,</span><span class="hv-greet__main">साथ पढ़ें</span></span></p></div>' +
    '<div class="hv-phone-dost" aria-hidden="true"><span class="hv-pbubble"><span class="hv-tw"></span><span class="hv-pbubble__tail"></span></span>' +
      '<img class="hv-dost hv-float" src="' + DOST + '" alt="" width="700" height="903" draggable="false"></div>' +
    '<form class="hv-search hv-reveal" id="hvSearch" role="search" autocomplete="off" style="--d:0s"><div class="hv-search__pill">' +
      '<svg class="hv-search__ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
      '<span class="hv-field"><input id="hvQ" type="search" placeholder=" " aria-label="Search by title, author, publisher or category">' +
      '<span class="hv-ph" aria-hidden="true">Search by <span class="hv-ph__win"><span class="hv-ph__track"><span>Title</span><span>Author</span><span>Publisher</span><span>Category</span><span>Title</span></span></span></span></span>' +
      '<button type="button" class="hv-mic" id="hvMic" aria-label="Voice search" title="Voice search"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 19v3"/></svg></button>' +
      '<button type="submit" class="hv-go" aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>' +
      '</div><div class="hv-results" id="hvRes" hidden></div></form>' +
    '<div class="hv-row" id="hvRow"><div class="hv-row__dost hv-reveal" style="--d:.15s"><div class="hv-float">' +
      '<img class="hv-dost" src="' + DOST + '" alt="Kitab Dost, the Kitab Utsav mascot, holding up a book with a bag of books over one shoulder" width="700" height="903" draggable="false" fetchpriority="high">' +
      '<span class="hv-bubble" aria-hidden="true"><span class="hv-bubble__tail"></span><span class="hv-bubble__box"><span class="hv-tw"></span></span></span></div></div></div>' +
    '<div class="hv-carousel"><div class="hv-carousel__track" id="hvTrack"></div><div class="hv-carousel__dots" id="hvDots" aria-hidden="true"></div></div>' +
    '</section>';

  var html = top;

  /* ---- collection tiles: simple line-art icons instead of photos, label inside the box ---- */
  /* collection tiles: one warm palette, each card with its own traditional line motif (drawn in currentColor) */
  var MOTIFS = (function () {
    function rot(n, step, shape, cx, cy) { var o = ""; for (var i = 0; i < n; i++) o += '<g transform="rotate(' + i * step + " " + cx + " " + cy + ')">' + shape + "</g>"; return o; }
    return [
      /* mandala */
      '<circle cx="50" cy="50" r="6"/><circle cx="50" cy="50" r="12"/><circle cx="50" cy="50" r="31"/><circle cx="50" cy="50" r="46"/>' +
        rot(12, 30, '<path d="M50 38Q57 26 50 13Q43 26 50 38Z"/>', 50, 50) + rot(24, 15, '<circle cx="50" cy="11.5" r="1.2" fill="currentColor"/>', 50, 50) +
        rot(12, 30, '<path d="M44 4Q50 -1 56 4" transform="rotate(15 50 50)"/>', 50, 50),
      /* paisley (buta) */
      '<path d="M48 92C18 86 12 52 34 34C50 21 74 24 74 44C74 58 58 62 52 54C47 47 54 40 60 44"/>' +
        '<path d="M48 84C26 78 22 54 38 40C51 30 67 33 67 46C67 54 59 56 56 52"/>' +
        '<path d="M44 74C33 70 31 56 40 48"/><circle cx="60" cy="44" r="2" fill="currentColor"/>' +
        rot(9, 20, '<circle cx="45" cy="18" r="1.3" fill="currentColor"/>', 45, 50),
      /* lotus */
      '<path d="M50 82C40 64 41 44 50 26C59 44 60 64 50 82Z"/>' +
        '<path d="M50 82C34 72 25 58 24 40C38 46 47 60 50 82Z"/><path d="M50 82C66 72 75 58 76 40C62 46 53 60 50 82Z"/>' +
        '<path d="M50 82C30 80 14 70 8 56C24 54 40 64 50 82Z"/><path d="M50 82C70 80 86 70 92 56C76 54 60 64 50 82Z"/>' +
        '<path d="M20 88Q50 80 80 88"/><path d="M30 94Q50 88 70 94"/><circle cx="50" cy="18" r="2" fill="currentColor"/>',
      /* jaali lattice */
      (function () { var o = ""; for (var y = 0; y <= 100; y += 20) for (var x = 0; x <= 100; x += 20) o += '<circle cx="' + x + '" cy="' + y + '" r="10"/><circle cx="' + (x + 10) + '" cy="' + (y + 10) + '" r="2" fill="currentColor"/>'; return o; })(),
      /* kolam: dot grid with looping lines */
      (function () { var o = ""; for (var y = 14; y <= 86; y += 18) for (var x = 14; x <= 86; x += 18) o += '<circle cx="' + x + '" cy="' + y + '" r="1.6" fill="currentColor"/>';
        return o + '<path d="M50 5L95 50L50 95L5 50Z" stroke-linejoin="round"/><path d="M50 23L77 50L50 77L23 50Z"/>' +
          '<path d="M32 23Q41 14 50 23Q59 14 68 23M32 77Q41 86 50 77Q59 86 68 77M23 32Q14 41 23 50Q14 59 23 68M77 32Q86 41 77 50Q86 59 77 68"/>'; })(),
      /* toran: scalloped garland with hanging leaves */
      (function () { var o = '<path d="M0 8H100"/><path d="M0 12H100"/>'; for (var x = 0; x < 100; x += 20) o += '<path d="M' + x + ' 12Q' + (x + 10) + ' 30 ' + (x + 20) + ' 12"/>' + (x === 40 ? "" : '<path d="M' + (x + 10) + ' 21V30"/><path d="M' + (x + 10) + ' 30C' + (x + 5) + ' 37 ' + (x + 7) + ' 44 ' + (x + 10) + ' 47C' + (x + 13) + ' 44 ' + (x + 15) + ' 37 ' + (x + 10) + ' 30Z"/>'); return o; })() /* no centre leaf: the name sits there */
    ];
  })();
  /* every name on exactly two balanced lines, so all six cards match */
  function twoLines(name) {
    var w = String(name).trim().split(/\s+/);
    if (w.length < 2) return [name, "\u00a0"];
    var best = 1, diff = Infinity;
    for (var i = 1; i < w.length; i++) {
      var d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length);
      if (d < diff) { diff = d; best = i; }
    }
    return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
  }
  html += '<section class="hm-sec hm-tiles"><div class="hm-wrap"><div class="hm-tilegrid">' + H.tiles.map(function (t, i) {
    var l = twoLines(t.name);
    /* each tile opens its own page: the All Books layout for that collection (books/?c=<slug>) */
    return '<a class="hm-tile hm-tile--' + (i % 6 + 1) + '" href="' + siteURL("../books/?c=" + encodeURIComponent(t.slug) + "&from=home") + '">' +
      /* top part: traditional motif SVG */
      '<span class="hm-tile__pic"><svg class="hm-tile__motif" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">' + MOTIFS[i % MOTIFS.length] + '</svg></span>' +
      '<span class="hm-tile__bar"><span class="hm-tile__label"><span>' + esc(l[0]) + '</span><span>' + esc(l[1]) + '</span></span>' +
      '<svg class="hm-tile__go" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>';
  }).join("") + '</div></div></section>';

  /* ---- release months ----
     A book's "month" can be "September", "September 2026" or "2026-09". Without a year it's the latest such month up to
     today (in October 2026, "December" means December 2025), so the timeline stays in order across New Year. */
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function monthKey(s) {
    s = String(s || "").trim(); if (!s) return "";
    var iso = s.match(/^(\d{4})-(\d{1,2})$/), today = new Date(), y, mi;
    if (iso) { y = +iso[1]; mi = +iso[2] - 1; }
    else {
      var w = s.toLowerCase().split(/[\s,]+/);
      mi = MONTHS.map(function (n) { return n.slice(0, 3).toLowerCase(); }).indexOf(w[0].slice(0, 3));
      if (mi < 0) return "";
      y = /^\d{4}$/.test(w[1] || "") ? +w[1] : (mi > today.getMonth() ? today.getFullYear() - 1 : today.getFullYear());
    }
    return y + "-" + (mi < 9 ? "0" : "") + (mi + 1);
  }
  function nextKey(key) { var y = +key.slice(0, 4), m = +key.slice(5); m++; if (m > 12) { m = 1; y++; } return y + "-" + (m < 10 ? "0" : "") + m; }

  /* ---- shelves ---- */
  function card(b) {
    var local = LOCAL[b.id];
    var url = local ? siteURL("../books/product/?id=" + encodeURIComponent(b.id) + "&c=" + encodeURIComponent(local) + "&from=home") : SITE + "/products/" + b.id;
    return RKBookCard({ id: b.id, t: b.t, a: b.a || b.c, c: b.a ? b.c : "", p: b.p, m: b.m, off: b.off, oos: b.oos, img: homeImg(b.img), href: url, ext: !local, month: monthKey(b.month) });
  }

  function slug(s) { return "hm-sec-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  Object.keys(H.sections).forEach(function (k, idx) {
    var t = TITLES[k] || ["", k, ""];
    var months = [];
    H.sections[k].forEach(function (b) { if (b.month && months.indexOf(b.month) === -1) months.push(b.month); });
    /* month filter = a full-width timeline you drag (behaviour: "month timeline" further down). Built from the books'
       months, so new months appear on their own; months in between with no books are shown greyed and skipped. */
    var monthBar = "", MAXM = 12;
    var keys = []; H.sections[k].forEach(function (b) { var mk = monthKey(b.month); if (mk && keys.indexOf(mk) < 0) keys.push(mk); });
    if (keys.length) {
      keys.sort();
      var from = keys[0], to = keys[keys.length - 1], run = [];
      for (var key = from; key <= to; key = nextKey(key)) run.push(key);
      run = run.slice(-MAXM); /* the most recent 12 months at most (older books still show under All) */
      var multiYear = run[0].slice(0, 4) !== run[run.length - 1].slice(0, 4);
      var stops = [{ k: "", name: "All months", full: "All", s: "All", n: H.sections[k].length }].concat(run.map(function (key, j) {
        var y = key.slice(0, 4), mi = +key.slice(5) - 1, yr = multiYear && (j === 0 || mi === 0) ? " ’" + y.slice(2) : "";
        return { k: key, name: MONTHS[mi] + " " + y, full: MONTHS[mi] + yr, s: MONTHS[mi].slice(0, 3) + yr,
                 n: H.sections[k].filter(function (b) { return monthKey(b.month) === key; }).length };
      }));
      var last = stops.length - 1, ticks = "", labels = "", PER = last <= 6 ? 8 : last <= 9 ? 4 : 2, NT = last * PER;
      for (var ti = 0; ti <= NT; ti++) ticks += '<i class="hm-scale__tick' + (ti % PER ? (PER > 2 && ti % (PER / 2) === 0 ? " is-mid" : "") : " is-major") + '" data-f="' + (ti / NT) + '" style="left:' + (ti / NT * 100) + "%;--d:" + ti + '"></i>';
      stops.forEach(function (st, i) {
        labels += '<button type="button" class="hm-scale__label' + (i && !st.n ? " is-empty" : "") + '" data-i="' + i + '" style="left:' + (i / last * 100) + "%;--d:" + i + '" tabindex="-1" aria-hidden="true"><span class="hm-scale__full">' + esc(st.full) + '</span><span class="hm-scale__short">' + esc(st.s) + "</span></button>";
      });
      monthBar = '<div class="hm-scale is-pre" data-stops="' + esc(JSON.stringify(stops)) + '" style="--p:0">' +
        '<div class="hm-scale__track" aria-hidden="true"><b class="hm-scale__line"><i class="hm-scale__fill"></i></b>' + ticks + "</div>" +
        '<div class="hm-scale__handle" aria-hidden="true"><span class="hm-scale__bubble"><b>All months</b><i>' + stops[0].n + ' books</i></span><span class="hm-scale__knob"><i class="hm-scale__ripple"></i></span></div>' +
        '<input class="hm-scale__input" type="range" min="0" max="' + last + '" step="0.001" value="0" aria-label="Filter new releases by month" aria-valuetext="All months">' +
        '<div class="hm-scale__labels">' + labels + "</div>" +
        '<p class="hm-scale__now" aria-live="polite">All months · ' + stops[0].n + " books</p></div>";
    }
    var sId = t[2] ? "hm-sec-" + t[2] : slug(k);
    var sClass = t[2] ? " hm-sec--" + t[2] : "";
    html += '<section class="hm-sec' + (idx % 2 ? " hm-sec--alt" : "") + sClass + '" id="' + sId + '"><div class="hm-wrap"><header class="hm-head"><div><p class="hm-eyebrow">' + esc(t[0]) + '</p><h2>' + esc(t[1]) + '</h2></div>' +
      '<div class="hm-ctl"><a class="hm-all" href="' + (t[2] ? siteURL("../books/?c=" + encodeURIComponent(t[2]) + "&from=home") : siteURL("../books/?g=all")) + '">View all →</a></div></header>' +
      monthBar +
      /* arrows sit on the shelf's own left / right edges (large screens); phones swipe, with a small position bar */
      '<div class="hm-rail is-start"><button type="button" class="hm-nav hm-nav--prev" data-dir="-1" aria-label="Scroll left"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button>' +
      '<div class="hm-shelf" tabindex="0">' + H.sections[k].map(card).join("") + '</div>' +
      '<button type="button" class="hm-nav hm-nav--next" data-dir="1" aria-label="Scroll right"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>' +
      '<div class="hm-progress" aria-hidden="true"><i></i></div></div></div></section>';
  });
  root.innerHTML = html;

  /* smooth-scroll for hero cards that link to a section further down this page */
  document.addEventListener("click", function (e) {
    var a = e.target.closest(".hv-slab[href*='#']");
    if (!a || a.pathname !== location.pathname || !a.hash) return;
    var target = document.getElementById(a.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* navbar search stays hidden while the big search on the page is in view; it appears once you scroll past it */
  (function () {
    var big = document.getElementById("hvSearch"), b = document.body;
    if (!big || !("IntersectionObserver" in window)) return;
    b.classList.add("home-nosearch");
    new IntersectionObserver(function (es) {
      var e = es[0], gone = !e.isIntersecting && e.boundingClientRect.top < 0;
      b.classList.toggle("home-nosearch", !gone);
    }, { rootMargin: "-70px 0px 0px 0px" }).observe(big);
  })();

  /* shelf arrows */
  root.addEventListener("click", function (e) {
    var n = e.target.closest(".hm-nav");
    if (n) { var sh = n.closest(".hm-sec").querySelector(".hm-shelf"); sh.scrollBy({ left: +n.dataset.dir * sh.clientWidth * 0.85, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); return; }
    /* card buttons (cart / wishlist / buy) are handled once, site-wide, in kt/book-card.js */
  });

  /* shelves: hide the arrow at each end, and move the phone position bar as the shelf scrolls */
  function railState(sh) {
    var rail = sh.parentNode; if (!rail || !rail.classList.contains("hm-rail")) return;
    var max = sh.scrollWidth - sh.clientWidth, x = sh.scrollLeft;
    rail.classList.toggle("is-start", x <= 4); rail.classList.toggle("is-end", x >= max - 4); rail.classList.toggle("no-scroll", max <= 4);
    var bar = rail.querySelector(".hm-progress i");
    if (bar && sh.scrollWidth) { bar.style.width = (sh.clientWidth / sh.scrollWidth * 100) + "%"; bar.style.transform = "translateX(" + (x / sh.clientWidth * 100) + "%)"; }
  }
  document.querySelectorAll(".hm-rail .hm-shelf").forEach(function (sh) {
    var raf; sh.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { railState(sh); }); }, { passive: true });
    railState(sh);
  });
  window.addEventListener("resize", function () { document.querySelectorAll(".hm-rail .hm-shelf").forEach(railState); });
  document.addEventListener("hm:filtered", function () { setTimeout(function () { document.querySelectorAll(".hm-rail .hm-shelf").forEach(railState); }, 60); });

  /* month timeline: an invisible native range input on the line takes pointer / touch / keys; the drawn handle follows it
     on a spring (a slight ease while dragging, a soft overshoot when it snaps to the nearest month with books).
     Motion: the line draws in when the section first scrolls into view (ticks and labels follow in a wave, the handle
     drops in); the handle breathes while idle; ticks swell around it; labels lift as it passes; the bubble tilts with
     the drag; a ripple marks each snap; the books that leave fade out before the new month's books rise in. */
  document.querySelectorAll(".hm-scale").forEach(function (sc) {
    var input = sc.querySelector(".hm-scale__input"), stops = JSON.parse(sc.getAttribute("data-stops")), last = stops.length - 1;
    var bubble = sc.querySelector(".hm-scale__bubble"), knob = sc.querySelector(".hm-scale__knob"), now = sc.querySelector(".hm-scale__now"), rail = sc.nextElementSibling;
    var track = sc.querySelector(".hm-scale__track"), ticks = [].slice.call(sc.querySelectorAll(".hm-scale__tick")), labels = [].slice.call(sc.querySelectorAll(".hm-scale__label"));
    var tickF = ticks.map(function (t) { return +t.dataset.f; });
    var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var x = 0, v = 0, target = 0, cur = -1, raf = 0, prev = 0, dragging = false, swapT = 0;
    function usable(i) { return i === 0 || stops[i].n > 0; }
    function nearest(f) { /* nearest stop with books to position f (ties go to the newer month) */
      var best = 0, bd = Infinity;
      for (var i = 0; i <= last; i++) if (usable(i)) { var d = Math.abs(i - f); if (d <= bd) { bd = d; best = i; } }
      return best;
    }
    function step(i, dir) { for (var j = i + dir; j >= 0 && j <= last; j += dir) if (usable(j)) return j; return i; }
    function cards(m, animate) {
      var leaving = [], coming = [];
      rail.querySelectorAll(".hm-card").forEach(function (c) {
        var show = !m || c.getAttribute("data-month") === m;
        if (show && c.hidden) coming.push(c); else if (!show && !c.hidden) leaving.push(c);
        c.classList.remove("hm-rise", "hm-fall");
      });
      function enter() {
        leaving.forEach(function (c) { c.hidden = true; });
        coming.forEach(function (c, n) { c.hidden = false; if (animate) { void c.offsetWidth; c.style.animationDelay = (n * 55) + "ms"; c.classList.add("hm-rise"); } });
        var sh = rail.querySelector(".hm-shelf"); if (sh) sh.scrollTo({ left: 0, behavior: animate ? "smooth" : "auto" });
        document.dispatchEvent(new Event("hm:filtered"));
      }
      clearTimeout(swapT);
      if (animate && leaving.length) { leaving.forEach(function (c) { c.classList.add("hm-fall"); }); swapT = setTimeout(enter, 170); } else enter();
    }
    function apply(i, animate) {
      if (i === cur) return; cur = i;
      var st = stops[i], cnt = st.n + (st.n === 1 ? " book" : " books");
      labels.forEach(function (l) { l.classList.toggle("is-on", +l.dataset.i === i); });
      input.setAttribute("aria-valuetext", st.name + ", " + cnt);
      bubble.innerHTML = "<b>" + esc(st.name) + "</b><i>" + cnt + "</i>";
      bubble.classList.remove("is-swap"); void bubble.offsetWidth; bubble.classList.add("is-swap");
      now.textContent = st.name + " · " + cnt;
      cards(st.k, animate !== false && !calm);
      thin();
    }
    function paint() {
      var p = x / last, w = track.clientWidth || 1;
      sc.style.setProperty("--p", p);
      sc.style.setProperty("--tilt", Math.max(-14, Math.min(14, -v * 5)).toFixed(2) + "deg");
      for (var i = 0; i < ticks.length; i++) { var d = (tickF[i] - p) * w / 34; ticks[i].style.setProperty("--s", (1 + 1.7 * Math.exp(-d * d)).toFixed(3)); }
      for (var j = 0; j < labels.length; j++) { var e = (j - x) * w / last / 70; labels[j].style.setProperty("--near", Math.exp(-e * e).toFixed(3)); }
    }
    function loop(t) {
      var dt = Math.min(0.032, (t - prev) / 1000 || 0.016); prev = t;
      var stiff = dragging ? 420 : 200, damp = dragging ? 36 : 17;
      v += ((target - x) * stiff - v * damp) * dt; x += v * dt;
      if (Math.abs(target - x) < 0.0005 && Math.abs(v) < 0.001) { x = target; v = 0; paint(); raf = 0; return; }
      paint(); raf = requestAnimationFrame(loop);
    }
    function kick() { if (calm) { x = target; v = 0; paint(); return; } if (!raf) { prev = performance.now(); raf = requestAnimationFrame(loop); } }
    function ripple() { if (calm) return; knob.classList.remove("is-snap"); void knob.offsetWidth; knob.classList.add("is-snap"); }
    function go(i) { i = Math.max(0, Math.min(last, i)); if (!usable(i)) i = nearest(i); target = i; input.value = i; apply(i); kick(); ripple(); }
    /* labels that would collide are hidden — the selected month, then the ends, then months with books win */
    function thin() {
      var w = track.clientWidth; if (!w) return;
      var order = labels.slice().sort(function (a, b) {
        function rank(l) { var i = +l.dataset.i; return i === cur ? 0 : (i === 0 || i === last) ? 1 : usable(i) ? 2 : 3; }
        return rank(a) - rank(b);
      }), placed = [];
      order.forEach(function (l) {
        /* where the label really sits: the end labels are shifted to sit flush with the section edges (home.css) */
        var i = +l.dataset.i, c = i / last * w, lw = l.offsetWidth, r = parseFloat(getComputedStyle(sc).getPropertyValue("--r")) || 14, gap = 8;
        var lo = i === 0 ? -r : i === last ? c + r - lw : c - lw / 2, hi = lo + lw + gap;
        var hit = placed.some(function (r) { return lo < r[1] && hi > r[0]; });
        l.classList.toggle("is-thin", hit);
        if (!hit) placed.push([lo, hi]);
      });
    }
    input.addEventListener("pointerdown", function () { dragging = true; sc.classList.add("is-drag"); });
    input.addEventListener("input", function () { target = +input.value; apply(nearest(target)); kick(); });
    function release() { if (!dragging) return; dragging = false; sc.classList.remove("is-drag"); go(nearest(+input.value)); }
    input.addEventListener("pointerup", release); input.addEventListener("pointercancel", release); input.addEventListener("change", function () { dragging = true; release(); });
    input.addEventListener("keydown", function (e) {
      var i = nearest(+input.value), to = { ArrowLeft: step(i, -1), ArrowDown: step(i, -1), ArrowRight: step(i, 1), ArrowUp: step(i, 1), PageDown: step(i, -1), PageUp: step(i, 1), Home: 0, End: nearest(last) }[e.key];
      if (to == null) return; e.preventDefault(); go(to);
    });
    sc.querySelector(".hm-scale__labels").addEventListener("click", function (e) {
      var l = e.target.closest(".hm-scale__label"), r = track.getBoundingClientRect();
      go(l ? +l.dataset.i : nearest((e.clientX - r.left) / r.width * last));
      input.focus({ preventScroll: true });
    });
    window.addEventListener("resize", function () { paint(); thin(); });
    apply(0, false); paint();
    /* entrance: draw the timeline the first time it scrolls into view */
    if (calm || !("IntersectionObserver" in window)) sc.classList.remove("is-pre");
    else new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { sc.classList.remove("is-pre"); sc.classList.add("is-in"); ob.disconnect(); } }, { threshold: 0.4 }).observe(sc);
  });


})();
