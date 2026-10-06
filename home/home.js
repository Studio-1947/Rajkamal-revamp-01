/* Home page: hero slider, collection tiles and product shelves built from home-data.js (content of rajkamalprakashan.com). */
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
  var TITLES = { "हिन्दी दिवस": ["Hindi Divas", "हिन्दी दिवस", "/hindi-divas"], "New Releases": ["Just arrived", "New Releases", "/collections/new-releases"], "Bestsellers": ["Readers' favourites", "Bestsellers", "/collections/bestsellers"], "Award Winners": ["Honoured writing", "Award Winners", "/collections/award-winners"], "Children Books": ["For young readers", "Children Books", "/collections/children-books"], "World Classic": ["Across languages", "World Classic", "/collections/world-classic"], "Magazine": ["Periodicals", "Magazine", "/collections/magazine"] };

  /* ---- hero slider ---- */
  var slides = H.slides.map(function (s, i) {
    var ext = /^https?:/.test(s.link) && s.link.indexOf("rajkamalprakashan.com") > -1;
    return '<a class="hm-slide" href="' + esc(s.link) + '" ' + (ext ? 'target="_blank" rel="noopener noreferrer"' : "") + ' aria-label="' + esc(s.title) + '"><img src="' + esc(homeImg(s.img)) + '" alt="' + esc(s.alt) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '></a>';
  }).join("");
  /* the big card: one Kitab Teras image (the same artwork as the Offers page it opens). Add entries to rotate more. */
  var BIG = [
    { href: siteURL("../offers/"), img: siteURL("home/img/hero/kt-hero-3.png"), t: "Kitab Teras", s: "10–20 October · up to 40% off + free delivery" }
  ];
  var newRel = (H.sections["New Releases"] || [])[0];
  var SMALL_HREF = "#hm-sec-new-releases", SMALL_T = "New Releases", SMALL_S = "Fresh picks weekly";
  /* six new-release cover shots, blinking (crossfading) one by one in the small card */
  var NEWREL = [1, 2, 3, 4, 5, 6].map(function (n) { return siteURL("home/img/newrel/nr-" + n + ".png"); });
  function cap(x) { return '<span class="hm-feat__cap"><span class="hm-feat__txt"><b>' + esc(x.t) + '</b><i>' + esc(x.s) + '</i></span><span class="hm-go" aria-hidden="true"><svg class="hm-go__ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></span></span>'; }
  var bigHtml = '<div class="hm-feat__card is-big hm-carousel" id="hmBig" aria-roledescription="carousel" aria-label="Featured offers"><div class="hm-carousel__track" id="hmBigTrack">' +
    BIG.map(function (x, i) { return '<a class="hm-carousel__slide" href="' + x.href + '"><img src="' + x.img + '" alt="' + esc(x.t) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '>' + cap(x) + '</a>'; }).join("") +
    "</div>" + (BIG.length > 1 ? '<div class="hm-carousel__dots" id="hmBigDots">' + BIG.map(function (x, i) { return '<button type="button" data-i="' + i + '" aria-label="Show ' + esc(x.t) + '"></button>'; }).join("") + "</div>" : "") + "</div>";
  var EVENTS = [
["Kitab Utsav : Barelly", "23–27 October", "Widmere Thetre", "Starting from 23rd October to 27th October", "/events"],
    ["किताब उत्सव – इन्दौर", "4–8 सितम्बर", "प्रीतमलाल दुआ सभागृह, इन्दौर", "पाठक-लेखक संवाद, बातचीत, पाठ, चर्चा, लोकार्पण · प्रवेश निःशुल्क", "/events/kitab-utsav-indore-2026"],
    ["मेरी माँ मेरी गैंगस्टर | बातचीत • बुक साइनिंग", "3 अगस्त", "इंडिया इंटरनेशनल सेंटर, नई दिल्ली", "अरुंधति रॉय की किताब पर बातचीत और बुक साइनिंग · प्रवेश निःशुल्क", "/events/meri-maan-meri-gangster-discussion-and-book-signing"]
  ];
  var eventArt = '<div class="hm-event__art" aria-hidden="true"><svg viewBox="0 0 160 88" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="26" r="12"/><path d="M10 68c0-18 10-28 22-28s22 10 22 28"/><circle cx="128" cy="26" r="12"/><path d="M106 68c0-18 10-28 22-28s22 10 22 28"/><path d="M58 62 80 52 102 62"/><path d="M58 62v10l22-10 22 10V62"/><line x1="80" y1="52" x2="80" y2="72"/><circle cx="70" cy="34" r="2" fill="currentColor" stroke="none"/><circle cx="80" cy="30" r="2" fill="currentColor" stroke="none"/><circle cx="90" cy="34" r="2" fill="currentColor" stroke="none"/></svg></div>';
  var eventHtml = '<article class="hm-feat__card hm-event" aria-label="Events"><div class="hm-event__body">' + eventArt + '<p class="hm-event__tag"><span></span>Events</p>' +
    '<ul class="hm-event__list">' + EVENTS.map(function (e, i) {
      return '<li' + (i ? '' : ' class="is-first"') + '><a href="' + SITE + e[4] + '" target="_blank" rel="noopener noreferrer"><time>' + esc(e[1]) + '</time><b>' + esc(e[0]) + '</b><span class="hm-event__where">📍 ' + esc(e[2]) + '</span><span class="hm-event__desc">' + esc(e[3]) + '</span></a></li>';
    }).join("") + '</ul><a class="hm-event__all" href="' + SITE + '/events" target="_blank" rel="noopener noreferrer"><span>Register</span><span class="hm-go" aria-hidden="true"><svg class="hm-go__ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></span></a></div></article>';

  var top = '<section class="hm-top"><div class="hm-wrap hm-top__grid">' +
    '<div class="hm-intro"><h1 class="hm-intro__title">\u0938\u093e\u0925 <span class="hm-cycle"><span class="hm-cycle__word" id="hmCycleWord">\u091c\u0941\u0921\u093c\u0947\u0902</span></span></h1><p class="hm-intro__sub">\u0939\u0930 \u0915\u093f\u0924\u093e\u092c \u092e\u0947\u0902 \u0939\u0948 \u090f\u0915 \u0928\u0908 \u0926\u0941\u0928\u093f\u092f\u093e</p>' +
    '<form class="hm-search" id="hmSearch" role="search" autocomplete="off">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><span class="hm-field"><input id="hmQ" type="search" placeholder=" " aria-label="Search by title, author, publisher or category"><span class="hm-ph" aria-hidden="true">Search by <span class="hm-ph__win"><span class="hm-ph__track"><span>Title</span><span>Author</span><span>Publisher</span><span>Category</span><span>Title</span></span></span></span></span><button type="button" class="hm-mic" id="hmMic" aria-label="Voice search" title="Voice search"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 19v3"/></svg></button><button type="submit" aria-label="Search">→</button><div class="hm-results" id="hmRes" hidden></div></form></div>' +
    '<div class="hm-feat">' + bigHtml + eventHtml +
    '<div class="hm-feat__card hm-carousel" id="hmSmall" aria-roledescription="carousel" aria-label="New releases"><div class="hm-carousel__track" id="hmSmallTrack">' +
      NEWREL.map(function (img, i) { return '<a class="hm-carousel__slide' + (i ? '' : ' on') + '" href="' + SMALL_HREF + '"><img src="' + esc(img) + '" alt="' + esc(SMALL_T) + '" loading="lazy"></a>'; }).join("") +
    '</div>' + cap({ t: SMALL_T, s: SMALL_S }) + '</div>' +
    '</div></div></section>';

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
    return '<a class="hm-tile hm-tile--' + (i % 6 + 1) + '" href="' + SITE + '/collections/' + esc(t.slug) + '" target="_blank" rel="noopener noreferrer"><span class="hm-tile__ic"><svg class="hm-tile__motif" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true">' + MOTIFS[i % MOTIFS.length] + '</svg><span class="hm-tile__label"><span>' + esc(l[0]) + '</span><span>' + esc(l[1]) + '</span></span></span></a>';
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
    html += '<section class="hm-sec' + (idx % 2 ? " hm-sec--alt" : "") + '" id="' + slug(k) + '"><div class="hm-wrap"><header class="hm-head"><div><p class="hm-eyebrow">' + esc(t[0]) + '</p><h2>' + esc(t[1]) + '</h2></div>' +
      '<div class="hm-ctl"><a class="hm-all" href="' + SITE + t[2] + '" target="_blank" rel="noopener noreferrer">View all ↗</a></div></header>' +
      monthBar +
      /* arrows sit on the shelf's own left / right edges (large screens); phones swipe, with a small position bar */
      '<div class="hm-rail is-start"><button type="button" class="hm-nav hm-nav--prev" data-dir="-1" aria-label="Scroll left"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button>' +
      '<div class="hm-shelf" tabindex="0">' + H.sections[k].map(card).join("") + '</div>' +
      '<button type="button" class="hm-nav hm-nav--next" data-dir="1" aria-label="Scroll right"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>' +
      '<div class="hm-progress" aria-hidden="true"><i></i></div></div></div></section>';
  });
  root.innerHTML = html;

  /* generic crossfade carousel wiring: auto-advance, optional dots, swipe; pauses on hover / touch / hidden tab */
  function wireCarousel(boxId, trackId, dotsId, intervalMs) {
    var box = document.getElementById(boxId), track = document.getElementById(trackId);
    if (!box || !track) return;
    var dots = dotsId ? [].slice.call(document.querySelectorAll("#" + dotsId + " button")) : [];
    var slideEls = [].slice.call(track.querySelectorAll(".hm-carousel__slide"));
    var cur = 0, tm, hold = false, x0 = null;
    function go(i) {
      cur = (i + slideEls.length) % slideEls.length;
      slideEls.forEach(function (sl, n) { sl.classList.toggle("on", n === cur); });
      dots.forEach(function (d, n) { d.classList.toggle("on", n === cur); d.setAttribute("aria-current", n === cur ? "true" : "false"); });
    }
    function run() { clearInterval(tm); if (slideEls.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) tm = setInterval(function () { if (!hold && !document.hidden) go(cur + 1); }, intervalMs); }
    if (dotsId) document.getElementById(dotsId).addEventListener("click", function (e) { var d = e.target.closest("button"); if (d) { go(+d.dataset.i); run(); } });
    box.addEventListener("mouseenter", function () { hold = true; }); box.addEventListener("mouseleave", function () { hold = false; });
    box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; hold = true; }, { passive: true });
    box.addEventListener("touchend", function (e) { if (x0 !== null) { var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); run(); } } x0 = null; setTimeout(function () { hold = false; }, 1500); });
    function place() { var im = track.querySelector("img"); if (im) box.style.setProperty("--imgh", im.getBoundingClientRect().height + "px"); }
    window.addEventListener("resize", place); window.addEventListener("load", place);
    var firstImg = track.querySelector("img"); if (firstImg) firstImg.addEventListener("load", place);
    place();
    go(0); run();
  }
  wireCarousel("hmBig", "hmBigTrack", BIG.length > 1 ? "hmBigDots" : null, 4500);
  wireCarousel("hmSmall", "hmSmallTrack", null, 2600);

  /* smooth-scroll for feature cards that link to a section further down this page */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('.hm-feat__card[href^="#"], .hm-carousel__slide[href^="#"]');
    if (!a) return;
    var target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* navbar search stays hidden while the big search on the page is in view; it appears once you scroll past it */
  (function () {
    var big = document.getElementById("hmSearch"), b = document.body;
    if (!big || !("IntersectionObserver" in window)) return;
    b.classList.add("home-nosearch");
    new IntersectionObserver(function (es) {
      var e = es[0], gone = !e.isIntersecting && e.boundingClientRect.top < 0;
      b.classList.toggle("home-nosearch", !gone);
    }, { rootMargin: "-70px 0px 0px 0px" }).observe(big);
  })();

  /* search: live results from the catalogue (up to 6), Enter opens the top result */
  (function () {
    var form = document.getElementById("hmSearch"), q = document.getElementById("hmQ"), res = document.getElementById("hmRes"), all = [];
    var mic = document.getElementById("hmMic");
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Rec) {
      var rec = new Rec(); rec.lang = "hi-IN"; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.addEventListener("result", function (e) { q.value = e.results[0][0].transcript; q.dispatchEvent(new Event("input")); q.focus(); });
      rec.addEventListener("end", function () { mic.classList.remove("is-listening"); });
      rec.addEventListener("error", function () { mic.classList.remove("is-listening"); });
      mic.addEventListener("click", function () {
        if (mic.classList.contains("is-listening")) { rec.stop(); return; }
        mic.classList.add("is-listening");
        try { rec.start(); } catch (e) { mic.classList.remove("is-listening"); }
      });
    } else {
      mic.disabled = true;
      mic.title = "Voice search is not supported in this browser";
    }
    /* matches title, author, category (books-cats.js) and publisher / imprint (books-pubs.js) */
    var CATS = window.RK_CATS || {}, PUBS = window.RK_PUBS;
    Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { all.push({ b: b, k: k, hay: [b[0], b[1], CATS[b[4]] || "", PUBS ? PUBS.of(b[4]) : ""].join(" ").toLowerCase() }); }); });
    function find(v) {
      v = v.trim().toLowerCase(); if (v.length < 2) return [];
      var seen = {}, out = [];
      all.forEach(function (x) { if (x.hay.indexOf(v) > -1 && !seen[x.b[4]]) { seen[x.b[4]] = 1; out.push(x); } });
      return out.slice(0, 6);
    }
    function url(x) { return siteURL("../books/product/?id=" + encodeURIComponent(x.b[4]) + "&c=" + encodeURIComponent(x.k) + "&from=home"); }
    function show() {
      var r = find(q.value);
      if (!q.value.trim() || q.value.trim().length < 2) { res.hidden = true; return; }
      res.innerHTML = r.length ? r.map(function (x) { return '<a href="' + url(x) + '"><img src="' + coverURL("../books/covers/" + esc(x.b[4]) + ".jpg") + '" alt="" width="34" height="50"><span><b>' + esc(x.b[0]) + '</b><i>' + esc(x.b[1]) + ' · ' + fmt(x.b[2]) + '</i></span></a>'; }).join("") : '<p>No matching books in this sample catalogue.</p>';
      res.hidden = false;
    }
    q.addEventListener("input", show);
    q.addEventListener("focus", show);
    form.addEventListener("submit", function (e) { e.preventDefault(); var r = find(q.value); if (r.length) location.href = url(r[0]); else show(); });
    document.addEventListener("click", function (e) { if (!form.contains(e.target)) res.hidden = true; });
  })();

  /* hero shelf: gentle auto-advance, pauses on touch / hover / when out of view */
  var hero = document.getElementById("hmHero"), timer, paused = false;
  if (hero) {
    var step = function () {
      if (paused || document.hidden) return;
      var r = hero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var end = hero.scrollLeft + hero.clientWidth >= hero.scrollWidth - 4;
      hero.scrollTo({ left: end ? 0 : hero.scrollLeft + hero.clientWidth * 0.8, behavior: "smooth" });
    };
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(step, 5000);
    ["mouseenter", "touchstart", "focusin"].forEach(function (ev) { hero.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["mouseleave", "touchend", "focusout"].forEach(function (ev) { hero.addEventListener(ev, function () { setTimeout(function () { paused = false; }, 1500); }, { passive: true }); });
  }

  /* shelf arrows */
  root.addEventListener("click", function (e) {
    var n = e.target.closest(".hm-nav");
    if (n) { var sh = n.closest(".hm-sec").querySelector(".hm-shelf"); sh.scrollBy({ left: +n.dataset.dir * sh.clientWidth * 0.85, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); return; }
    /* card buttons (cart / wishlist / buy) are handled once, site-wide, in kt/book-card.js */
  });

  /* headline word-cycle: "साथ" stays put, one JS-swapped word blinks between जुड़ें / पढ़ें.
     A single element (never two overlapping ones) avoids the ghosting/double-stroke rendering
     glitch that two co-located, independently gradient-animated spans produced. */
  var cycleWord = document.getElementById("hmCycleWord");
  if (cycleWord && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var CYCLE_WORDS = ["जुड़ें", "पढ़ें"], ci = 0;
    setInterval(function () {
      cycleWord.classList.add("is-out");
      setTimeout(function () {
        ci = (ci + 1) % CYCLE_WORDS.length;
        cycleWord.textContent = CYCLE_WORDS[ci];
        cycleWord.classList.remove("is-out");
      }, 260);
    }, 2000);
  }

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
