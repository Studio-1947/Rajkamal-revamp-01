/* Hero variant: Kitab Dost in the middle, sloped flip "slabs" either side (design from Kitab Utsav),
   filled with the same content as the current homepage hero (home/home.js). */
(function () {
  var hv = document.getElementById("hv");
  if (!hv) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }

  /* ---------- content (same as the current hero) ---------- */
  var EVENT_URL = function (id) { return "../events/event/?id=" + encodeURIComponent(id); };
  var NEWREL = [1, 2, 3, 4, 5, 6].map(function (n) { return "../home/img/newrel/nr-" + n + ".png"; });

  /* `desk`: shown in the desktop row (in this order: outer-left, inner-left, inner-right, outer-right). All show on phones. */
  var SLABS = [
    {
      desk: true, side: "left",
      imgs: ["../home/img/hero/kt-hero-5.jpg"], alt: "Kitab Teras",
      eyebrow: "Kitab Teras", title: "11–22 October", href: "../offers/",
      back: { text: "11–22 October · up to 40% off + free delivery", details: [["calendar", "11–22 October"], ["tag", "Up to 40% off"], ["truck", "Free delivery"]], cta: "View offers" }
    },
    {
      desk: true, side: "left",
      imgs: ["../events/img/kitab-utsav-bareilly-1.jpg"], alt: "Kitab Utsav : Barelly",
      eyebrow: "Events · 23–27 October", title: "Kitab Utsav : Barelly", href: EVENT_URL("kitab-utsav-bareilly"),
      back: { text: "Starting from 23rd October to 27th October", details: [["calendar", "23–27 October"], ["pin", "Widmere Thetre"]], cta: "View event" }
    },
    {
      desk: true, side: "right",
      imgs: ["../events/img/kitab-utsav-indore-2026-1.jpg"], alt: "किताब उत्सव – इन्दौर", pos: "86% center",
      eyebrow: "Events · 4–8 सितम्बर", title: "किताब उत्सव – इन्दौर", href: EVENT_URL("kitab-utsav-indore-2026"),
      back: { text: "पाठक-लेखक संवाद, बातचीत, पाठ, चर्चा, लोकार्पण · प्रवेश निःशुल्क", details: [["calendar", "4–8 सितम्बर"], ["pin", "प्रीतमलाल दुआ सभागृह, इन्दौर"]], cta: "View event" }
    },
    {
      desk: true, side: "right",
      imgs: NEWREL, alt: "New Releases",
      eyebrow: "Fresh picks weekly", title: "New Releases", href: "../#hm-sec-new-releases"
    },
    {
      desk: false, side: "right",
      imgs: ["../events/img/meri-maan-meri-gangster-discussion-and-book-signing-1.jpg"], alt: "मेरी माँ मेरी गैंगस्टर | बातचीत • बुक साइनिंग",
      eyebrow: "Events · 3 अगस्त", title: "मेरी माँ मेरी गैंगस्टर", href: EVENT_URL("meri-maan-meri-gangster-discussion-and-book-signing")
    }
  ];

  var ICONS = {
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + "</svg>"; }

  /* ---------- slab shapes: SVG masks so the top edge slopes towards the centre ---------- */
  var W = 200, H = 342, SLOPE = 34, R = 34, PHOTO_H = 800, PHOTO_R = 28;
  function slopedPath(w, h, slope, r, br) {
    if (br == null) br = r;
    var len = Math.hypot(w, slope), ux = (w / len) * r, uy = (slope / len) * r;
    return "M0 " + r + "Q0 0 " + ux + " " + uy + "L" + (w - ux) + " " + (slope - uy) + "Q" + w + " " + slope + " " + w + " " + (slope + r) +
      "L" + w + " " + (h - br) + "Q" + w + " " + h + " " + (w - br) + " " + h + "L" + br + " " + h + "Q0 " + h + " 0 " + (h - br) + "Z";
  }
  function svgUrl(w, h, d, mirror, stretch) {
    var flip = mirror ? ' transform="matrix(-1 0 0 1 ' + w + ' 0)"' : "";
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h + '"' + (stretch ? ' preserveAspectRatio="none"' : "") + "><path" + flip + ' d="' + d + '"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }
  /* photo outline is sized by width only, so for each card ratio (phone / laptop / large) it gets the matching slope */
  function photoMask(cardH, mirror) {
    var slope = (SLOPE / H) * cardH * ((W - 12) / W);
    return svgUrl(W, PHOTO_H, slopedPath(W, PHOTO_H, slope, PHOTO_R, 0), mirror, false);
  }
  [["l", false], ["r", true]].forEach(function (s) {
    hv.style.setProperty("--card-" + s[0], svgUrl(W, H, slopedPath(W, H, SLOPE, R), s[1], true));
    hv.style.setProperty("--pm-" + s[0] + "-sm", photoMask(210, s[1]));
    hv.style.setProperty("--pm-" + s[0] + "-md", photoMask(290, s[1]));
    hv.style.setProperty("--pm-" + s[0] + "-lg", photoMask(H, s[1]));
  });

  /* ---------- slab markup ---------- */
  function slab(s, i, eager) {
    var multi = s.imgs.length > 1;
    var imgs = s.imgs.map(function (src, k) {
      return '<img class="hv-slab__img' + (multi ? " hv-fade" + (k ? "" : " on") : "") + '"' + (s.pos ? ' style="object-position:' + s.pos + '"' : "") + ' src="' + esc(src) + '" alt="' + (k ? "" : esc(s.alt)) + '"' + (eager && !k ? ' fetchpriority="high"' : ' loading="lazy"') + ' draggable="false">';
    }).join("");
    var b = s.back, back = "";
    if (b) {
      back = '<span class="hv-slab__back" aria-hidden="true"><span class="hv-slab__bg hv-slab__bg--back"></span><span class="hv-slab__dots"></span>' +
        '<span class="hv-slab__mark" lang="hi">उत्सव</span><span class="hv-slab__bbody">' +
        '<span class="hv-slab__eyebrow">' + esc(s.eyebrow) + '</span><span class="hv-slab__btitle">' + esc(s.title) + '</span><span class="hv-slab__rule"></span>' +
        '<span class="hv-slab__text">' + esc(b.text) + "</span>" +
        (b.details ? '<span class="hv-slab__details">' + b.details.map(function (d) { return "<span>" + icon(d[0]) + "<span>" + esc(d[1]) + "</span></span>"; }).join("") + "</span>" : "") +
        '<span class="hv-slab__cta">' + esc(b.cta) + ' <span aria-hidden="true">→</span></span></span></span>';
    }
    return '<a class="hv-slab hv-slab--' + s.side + (b ? " has-back" : "") + '" href="' + esc(s.href) + '"><span class="hv-slab__inner">' +
      '<span class="hv-slab__front"><span class="hv-slab__bg"></span><span class="hv-slab__photo">' + imgs + '<span class="hv-slab__shade"></span></span>' +
      '<span class="hv-slab__cap"><span class="hv-slab__eyebrow">' + esc(s.eyebrow) + '</span><span class="hv-slab__title"><span>' + esc(s.title) + '</span><span class="hv-slab__arrow" aria-hidden="true">→</span></span></span></span>' +
      back + "</span></a>";
  }

  /* desktop row: outer-left, inner-left, [Kitab Dost], inner-right, outer-right */
  var row = document.getElementById("hvRow"), dost = row.querySelector(".hv-row__dost");
  var desk = SLABS.filter(function (s) { return s.desk; });
  var DELAYS = [".05s", ".12s", ".12s", ".05s"];
  desk.forEach(function (s, i) {
    var cell = document.createElement("div");
    cell.className = "hv-row__cell hv-reveal" + (i === 0 || i === 3 ? " is-outer" : " is-inner");
    cell.style.setProperty("--d", DELAYS[i]);
    cell.innerHTML = slab(s, i, i === 0);
    row.insertBefore(cell, i < 2 ? dost : null);
  });
  /* the "All events" link sits under the row on desktop, since the third event has no slot there */
  var more = document.createElement("a");
  more.className = "hv-more"; more.href = "../events/";
  more.innerHTML = 'All events <span aria-hidden="true">→</span>';
  row.parentNode.insertBefore(more, row.nextSibling);

  /* phone carousel: every slab */
  var track = document.getElementById("hvTrack"), dots = document.getElementById("hvDots");
  track.innerHTML = SLABS.map(function (s, i) { return '<div class="hv-carousel__item">' + slab(s, i, false) + "</div>"; }).join("") + '<span class="hv-carousel__end" aria-hidden="true"></span>';
  dots.innerHTML = SLABS.map(function () { return "<span></span>"; }).join("");
  var items = track.querySelectorAll(".hv-carousel__item"), dotEls = dots.children;
  function setCurrent() {
    var first = items[0]; if (!first) return;
    var step = first.offsetWidth + 12, cur = Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / step)));
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("is-next", i > cur); items[i].classList.toggle("is-prev", i < cur);
      dotEls[i].classList.toggle("on", i === cur);
    }
  }
  var raf; track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(setCurrent); }, { passive: true });
  setCurrent();

  /* New Releases covers crossfade one by one (same six covers as the current hero) */
  if (!reduce) {
    setInterval(function () {
      hv.querySelectorAll(".hv-slab__photo").forEach(function (p) {
        var f = p.querySelectorAll(".hv-fade"); if (f.length < 2) return;
        var on = 0; for (var i = 0; i < f.length; i++) if (f[i].classList.contains("on")) on = i;
        f[on].classList.remove("on"); f[(on + 1) % f.length].classList.add("on");
      });
    }, 2600);
  }

  /* ---------- Kitab Dost speech bubble: types, holds, erases, next line ---------- */
  var LINES = [{ text: "Mai Hu Aapka Kitab Dost", lang: "hi-Latn" }, { text: "साथ जुड़ें, साथ पढ़ें", lang: "hi", center: true }];
  function letters(t) {
    if (window.Intl && Intl.Segmenter) return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(t), function (s) { return s.segment; });
    return Array.from(t);
  }
  document.querySelectorAll(".hv-tw").forEach(function (el) {
    var fit = el.hasAttribute("data-fit");
    if (reduce) { el.innerHTML = LINES.map(function (l) { return '<span lang="' + l.lang + '" style="display:block' + (l.center ? ";text-align:center" : "") + '">' + esc(l.text) + "</span>"; }).join(""); return; }
    el.innerHTML = (fit ? "" : LINES.map(function (l) { return '<span class="hv-tw__hold" lang="' + l.lang + '">' + esc(l.text) + '<span style="display:inline-block;width:.5em"></span></span>'; }).join("")) +
      '<span class="hv-tw__live"><span class="hv-tw__txt"></span><span class="hv-tw__caret"></span></span>';
    var live = el.querySelector(".hv-tw__live"), txt = el.querySelector(".hv-tw__txt");
    var line = 0, count = 0, erasing = false, cur = letters(LINES[0].text);
    function tick() {
      var delay;
      if (!erasing && count < cur.length) { count++; delay = 85; }
      else if (!erasing) { erasing = true; delay = 1600; }
      else if (count > 0) { count--; delay = 40; }
      else { erasing = false; line = (line + 1) % LINES.length; cur = letters(LINES[line].text); delay = 350; }
      txt.textContent = cur.slice(0, count).join("");
      live.setAttribute("lang", LINES[line].lang);
      live.style.textAlign = LINES[line].center && !fit ? "center" : "";
      setTimeout(tick, delay);
    }
    tick();
  });

  /* ---------- search (same behaviour as the current hero: title / author / category / publisher) ---------- */
  (function () {
    var form = document.getElementById("hvSearch"), q = document.getElementById("hvQ"), res = document.getElementById("hvRes"), mic = document.getElementById("hvMic"), all = [];
    var C = window.RK_COLLECTIONS || {}, CATS = window.RK_CATS || {}, PUBS = window.RK_PUBS;
    Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { all.push({ b: b, k: k, hay: [b[0], b[1], CATS[b[4]] || "", PUBS ? PUBS.of(b[4]) : ""].join(" ").toLowerCase() }); }); });
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
      mic.hidden = true;
    }
    function find(v) {
      v = v.trim().toLowerCase(); if (v.length < 2) return [];
      var seen = {}, out = [];
      all.forEach(function (x) { if (x.hay.indexOf(v) > -1 && !seen[x.b[4]]) { seen[x.b[4]] = 1; out.push(x); } });
      return out.slice(0, 6);
    }
    function url(x) { return "../books/product/?id=" + encodeURIComponent(x.b[4]) + "&c=" + encodeURIComponent(x.k) + "&from=home"; }
    function show() {
      if (q.value.trim().length < 2) { res.hidden = true; return; }
      var r = find(q.value);
      res.innerHTML = r.length ? r.map(function (x) { return '<a href="' + url(x) + '"><img src="../books/covers/' + esc(x.b[4]) + '.jpg" alt="" width="34" height="50"><span><b>' + esc(x.b[0]) + "</b><i>" + esc(x.b[1]) + " · " + fmt(x.b[2]) + "</i></span></a>"; }).join("") : "<p>No matching books in this sample catalogue.</p>";
      res.hidden = false;
    }
    q.addEventListener("input", show);
    q.addEventListener("focus", show);
    q.addEventListener("keydown", function (e) { if (e.key === "Escape") { q.value = ""; res.hidden = true; } });
    form.addEventListener("submit", function (e) { e.preventDefault(); var r = find(q.value); if (r.length) location.href = url(r[0]); else show(); });
    document.addEventListener("click", function (e) { if (!form.contains(e.target)) res.hidden = true; });
  })();
})();
