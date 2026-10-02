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
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.6 5 15.5 5c3.1 0 5 3 3.8 6.2-1.8 4.7-9.3 9.3-9.3 9.3z"/></svg>';

  /* ---- hero slider ---- */
  var slides = H.slides.map(function (s, i) {
    var ext = /^https?:/.test(s.link) && s.link.indexOf("rajkamalprakashan.com") > -1;
    return '<a class="hm-slide" href="' + esc(s.link) + '" ' + (ext ? 'target="_blank" rel="noopener noreferrer"' : "") + ' aria-label="' + esc(s.title) + '"><img src="' + esc(homeImg(s.img)) + '" alt="' + esc(s.alt) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '></a>';
  }).join("");
  var BIG = [
    { href: siteURL("../kt/"), img: siteURL("home/img/hero/kt-hero-2.jpg"), t: "Kitab Teras", s: "10–20 October · up to 40% off + free delivery" },
    { href: siteURL("../kt/"), img: siteURL("home/img/hero/kt-hero-3.png"), t: "Kitab Teras", s: "10–20 October · up to 40% off + free delivery" },
    { href: siteURL("../kt/"), img: siteURL("../kt/assets/hero/hero.jpg"), t: "Kitab Teras", s: "10–20 October · up to 40% off + free delivery" }
  ];
  var newRel = (H.sections["New Releases"] || [])[0];
  var SMALL_HREF = "#hm-sec-new-releases", SMALL_T = "New Releases", SMALL_S = "Fresh picks weekly";
  /* six new-release cover shots, blinking (crossfading) one by one in the small card */
  var NEWREL = [1, 2, 3, 4, 5, 6].map(function (n) { return siteURL("home/img/newrel/nr-" + n + ".png"); });
  function cap(x) { return '<span class="hm-feat__cap"><span class="hm-feat__txt"><b>' + esc(x.t) + '</b><i>' + esc(x.s) + '</i></span><span class="hm-go" aria-hidden="true"><svg class="hm-go__ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></span></span>'; }
  var bigHtml = '<div class="hm-feat__card is-big hm-carousel" id="hmBig" aria-roledescription="carousel" aria-label="Featured offers"><div class="hm-carousel__track" id="hmBigTrack">' +
    BIG.map(function (x, i) { return '<a class="hm-carousel__slide" href="' + x.href + '"><img src="' + x.img + '" alt="' + esc(x.t) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '>' + cap(x) + '</a>'; }).join("") +
    '</div><div class="hm-carousel__dots" id="hmBigDots">' + BIG.map(function (x, i) { return '<button type="button" data-i="' + i + '" aria-label="Show ' + esc(x.t) + '"></button>'; }).join("") + '</div></div>';
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
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><input id="hmQ" type="search" placeholder="Search by title…" aria-label="Search books"><button type="button" class="hm-mic" id="hmMic" aria-label="Voice search" title="Voice search"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 19v3"/></svg></button><button type="submit" aria-label="Search">→</button><div class="hm-results" id="hmRes" hidden></div></form></div>' +
    '<div class="hm-feat">' + bigHtml + eventHtml +
    '<div class="hm-feat__card hm-carousel" id="hmSmall" aria-roledescription="carousel" aria-label="New releases"><div class="hm-carousel__track" id="hmSmallTrack">' +
      NEWREL.map(function (img, i) { return '<a class="hm-carousel__slide' + (i ? '' : ' on') + '" href="' + SMALL_HREF + '"><img src="' + esc(img) + '" alt="' + esc(SMALL_T) + '" loading="lazy"></a>'; }).join("") +
    '</div>' + cap({ t: SMALL_T, s: SMALL_S }) + '</div>' +
    '</div></div></section>';

  var html = top;

  /* ---- collection tiles: simple line-art icons instead of photos, label inside the box ---- */
  var TILE_ICONS = {
    "author-of-the-week": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/><path d="M17 4.5c1 .4 1.7 1.3 1.7 2.5S18 9.1 17 9.5"/>',
    "must-read": '<path d="M4 5.5c2.4-1.4 5.2-1.4 7.5 0v14c-2.3-1.4-5.1-1.4-7.5 0v-14z"/><path d="M19.5 5.5c-2.3-1.4-5.1-1.4-7.5 0v14c2.4-1.4 5.2-1.4 7.5 0v-14z"/>',
    "deal-of-the-day": '<path d="M12 2 3.5 10.5a2 2 0 0 0 0 2.8l7.2 7.2a2 2 0 0 0 2.8 0l8.5-8.5V3.5A1.5 1.5 0 0 0 20.5 2H12z"/><circle cx="16.5" cy="7.5" r="1.5"/>',
    "representative-poem": '<path d="M20 4c-6 0-11 5-13 12-1 3.3.7 5 4 4 7-2 12-7 12-13a3 3 0 0 0-3-3z"/><path d="M11 15 4 22"/>',
    "representative-stories": '<path d="M3 6h11v13H3z"/><path d="M14 8h7v11h-7"/><path d="M6.5 10h5M6.5 13h5M6.5 16h5"/>',
    "children-books": '<circle cx="12" cy="7" r="4"/><path d="M5 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5"/><path d="M9 7c0-1.5 1-2.5 2-2.5M15 7c0-1.5-1-2.5-2-2.5"/>',
    "read-more-save-more": '<path d="M4 5.5c2.4-1.4 5.2-1.4 7.5 0v14c-2.3-1.4-5.1-1.4-7.5 0v-14z"/><path d="M19.5 5.5c-2.3-1.4-5.1-1.4-7.5 0v14c2.4-1.4 5.2-1.4 7.5 0v-14z"/><circle cx="19" cy="6" r="3.4" fill="currentColor" stroke="none"/><text x="19" y="8.1" font-size="4.4" text-anchor="middle" fill="#fff" font-family="sans-serif">%</text>'
  };
  html += '<section class="hm-sec hm-tiles"><div class="hm-wrap"><div class="hm-tilegrid">' + H.tiles.map(function (t) {
    var icon = TILE_ICONS[t.slug] || '<circle cx="12" cy="12" r="8"/>';
    return '<a class="hm-tile" href="' + SITE + '/collections/' + esc(t.slug) + '" target="_blank" rel="noopener noreferrer"><span class="hm-tile__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icon + '</svg><span class="hm-tile__label">' + esc(t.name) + '</span></span></a>';
  }).join("") + '</div></div></section>';

  /* ---- shelves ---- */
  function card(b) {
    var monthAttr = b.month ? ' data-month="' + esc(b.month) + '"' : "";
    var local = LOCAL[b.id];
    var url = local ? siteURL("../books/product/?id=" + encodeURIComponent(b.id) + "&c=" + encodeURIComponent(local) + "&from=home") : SITE + "/products/" + b.id;
    var tgt = local ? "" : ' target="_blank" rel="noopener noreferrer"';
    var off = b.off ? ' <span class="hm-off">' + b.off + '% off</span>' : "";
    var price = b.p != null ? '<span class="hm-price"><strong>' + fmt(b.p) + '</strong>' + (b.m && b.m > b.p ? '<s>' + fmt(b.m) + '</s>' : '') + off + '</span>' : "";
    var actions = b.oos
      ? '<div class="hm-actions"><span class="hm-oos">Out of stock</span></div>'
      : '<div class="hm-actions bk-actions" data-id="' + esc(b.id) + '"><button type="button" class="bk-btn bk-btn--cart" data-act="cart">Add to cart</button><button type="button" class="bk-btn bk-btn--wish" data-act="wish" aria-label="Add to wishlist" aria-pressed="' + (window.RKStore && RKStore.isWished(b.id) ? "true" : "false") + '">' + HEART + '</button><button type="button" class="bk-btn bk-btn--buy" data-act="buy">Buy now</button></div>';
    return '<article class="hm-card"' + monthAttr + '><a class="hm-cover" href="' + esc(url) + '"' + tgt + ' aria-label="' + esc(b.t) + '"><img src="' + esc(homeImg(b.img)) + '" alt="' + esc(b.t) + ' — cover" loading="lazy" width="300" height="440"></a>' +
      '<div class="hm-info"><h3 class="hm-name"><a href="' + esc(url) + '"' + tgt + '>' + esc(b.t) + '</a></h3><p class="hm-author">' + esc(b.a || b.c) + '</p><p class="hm-cat">' + esc(b.a ? b.c : "") + '</p>' + price + actions + '</div></article>';
  }
  function slug(s) { return "hm-sec-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  Object.keys(H.sections).forEach(function (k, idx) {
    var t = TITLES[k] || ["", k, ""];
    var months = [];
    H.sections[k].forEach(function (b) { if (b.month && months.indexOf(b.month) === -1) months.push(b.month); });
    var monthBar = months.length ? '<div class="hm-months" role="tablist" aria-label="Filter by month">' +
      '<button type="button" class="hm-month is-on" data-month="" role="tab" aria-selected="true">All</button>' +
      months.map(function (m) { return '<button type="button" class="hm-month" data-month="' + esc(m) + '" role="tab" aria-selected="false">' + esc(m) + '</button>'; }).join("") +
      '</div>' : "";
    html += '<section class="hm-sec' + (idx % 2 ? " hm-sec--alt" : "") + '" id="' + slug(k) + '"><div class="hm-wrap"><header class="hm-head"><div><p class="hm-eyebrow">' + esc(t[0]) + '</p><h2>' + esc(t[1]) + '</h2></div>' +
      '<div class="hm-ctl"><a class="hm-all" href="' + SITE + t[2] + '" target="_blank" rel="noopener noreferrer">View all ↗</a><button type="button" class="hm-nav" data-dir="-1" aria-label="Scroll left">←</button><button type="button" class="hm-nav" data-dir="1" aria-label="Scroll right">→</button></div></header>' +
      monthBar +
      '<div class="hm-shelf" tabindex="0">' + H.sections[k].map(card).join("") + '</div></div></section>';
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
    function run() { clearInterval(tm); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) tm = setInterval(function () { if (!hold && !document.hidden) go(cur + 1); }, intervalMs); }
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
  wireCarousel("hmBig", "hmBigTrack", "hmBigDots", 4500);
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
    Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { all.push({ b: b, k: k, hay: (b[0] + " " + b[1]).toLowerCase() }); }); });
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
    var mo = e.target.closest(".hm-month");
    if (mo) {
      var bar = mo.closest(".hm-months"), shelf = bar.nextElementSibling, month = mo.getAttribute("data-month");
      bar.querySelectorAll(".hm-month").forEach(function (btn) { var on = btn === mo; btn.classList.toggle("is-on", on); btn.setAttribute("aria-selected", String(on)); });
      shelf.querySelectorAll(".hm-card").forEach(function (c) { c.hidden = !!month && c.getAttribute("data-month") !== month; });
      return;
    }
    var n = e.target.closest(".hm-nav");
    if (n) { var sh = n.closest(".hm-sec").querySelector(".hm-shelf"); sh.scrollBy({ left: +n.dataset.dir * sh.clientWidth * 0.85, behavior: "smooth" }); return; }
    var btn = e.target.closest(".bk-btn");
    if (!btn) return;
    var S = window.RKStore, id = btn.closest(".bk-actions").getAttribute("data-id");
    if (!S) return;
    if (btn.dataset.act === "cart") { S.addToCart(id); if (matchMedia("(max-width: 720px)").matches) S.toast("Added to cart"); else S.openCart(false); }
    else if (btn.dataset.act === "wish") { var on = S.toggleWish(id); btn.classList.toggle("is-on", on); btn.setAttribute("aria-pressed", String(on)); S.toast(on ? "Saved to wishlist" : "Removed from wishlist"); }
    else { S.addToCart(id); S.openCart(matchMedia("(max-width: 720px)").matches); }
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
})();
