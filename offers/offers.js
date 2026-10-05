/* Offers: the live / next campaign, the every-day order discount, the biggest discounts in the catalogue and recently ended sales. */
(function () {
  var O = window.RK_OFFERS || { campaigns: [], orderTiers: [] }, C = window.RK_COLLECTIONS || {};
  var body = document.getElementById("ofBody");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function inr(n) { return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
  function day(s) { var d = new Date(s + "T00:00:00"); return d; }
  function fmtRange(a, b) {
    var A = day(a), B = day(b), o = { day: "numeric", month: "long" };
    return A.getMonth() === B.getMonth() ? A.getDate() + "–" + B.toLocaleDateString("en-IN", o) : A.toLocaleDateString("en-IN", o) + " – " + B.toLocaleDateString("en-IN", o);
  }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function status(c) {
    var s = day(c.start), e = day(c.end), DAY = 864e5;
    if (today < s) { var n = Math.round((s - today) / DAY); return { k: "soon", label: n === 1 ? "Starts tomorrow" : "Starts in " + n + " days" }; }
    if (today <= e) { var m = Math.round((e - today) / DAY); return { k: "live", label: m === 0 ? "Live — last day" : "Live now · " + m + (m === 1 ? " day" : " days") + " left" }; }
    return { k: "ended", label: "Ended" };
  }
  var camps = O.campaigns.map(function (c) { return { c: c, s: status(c) }; });
  var featured = camps.filter(function (x) { return x.s.k === "live"; })[0] ||
    camps.filter(function (x) { return x.s.k === "soon"; }).sort(function (a, b) { return day(a.c.start) - day(b.c.start); })[0];
  var ended = camps.filter(function (x) { return x.s.k === "ended"; }).sort(function (a, b) { return day(b.c.end) - day(a.c.end); });

  /* biggest discounts in this offer's catalogue (each book once) */
  var seen = {}, books = [];
  Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { if (!seen[b[4]] && b[3] > 0) { seen[b[4]] = 1; books.push({ b: b, c: k }); } }); });
  books.sort(function (x, y) { return y.b[3] - x.b[3] || x.b[2] - y.b[2]; });
  var deals = books.slice(0, 8);
  function deal(x) { // shared card: kt/book-card.js
    return RKBookCard(RKBookCard.fromRow(x.b, "../books/product/?id=" + encodeURIComponent(x.b[4]) + "&c=" + encodeURIComponent(x.c) + "&from=kt", "../books/covers/"));
  }


  var h = "";
  if (featured) {
    var c = featured.c;
    h += '<section class="of-hero of-hero--' + featured.s.k + '">' +
      '<a class="of-hero__img" href="' + esc(c.href || "#") + '"><img src="' + esc(c.img) + '" alt="' + esc(c.title + " — " + (c.text || c.textEn)) + '"></a>' +
      '<div class="of-hero__body">' +
        '<span class="of-pill of-pill--' + featured.s.k + '">' + esc(featured.s.label) + "</span>" +
        '<h2 lang="hi">' + esc(c.title) + "</h2>" +
        '<p class="of-hero__en">' + esc(c.en) + " · " + fmtRange(c.start, c.end) + "</p>" +
        (c.text ? '<p class="of-hero__text" lang="hi">' + esc(c.text) + "</p>" : "") +
        '<p class="of-hero__text2">' + esc(c.textEn) + "</p>" +
        (c.tiers ? '<ul class="of-tiers">' + c.tiers.map(function (t) {
          return '<li><b>' + inr(t[0]) + "+</b><span>" + t[1] + '% extra off</span><i lang="hi">+ ' + t[2].map(esc).join(", ") + "</i></li>";
        }).join("") + "</ul>" : "") +
        (c.href ? '<a class="of-btn" href="' + esc(c.href) + '">' + esc(c.cta) + ' <span aria-hidden="true">→</span></a>' : "") +
      "</div></section>";
  }
  h += '<section class="of-sec"><div class="of-sec__head"><h2>Every order, every day</h2><p>Extra discount on bigger orders, applied at checkout.</p></div>' +
    '<div class="of-every">' + O.orderTiers.map(function (t, i) {
      return '<div class="of-every__card" style="--n:' + i + '"><span>Orders above</span><b>' + inr(t[0]) + "</b><em>" + t[1] + "% off</em></div>";
    }).join("") + "</div></section>";
  if (deals.length) h += '<section class="of-sec"><div class="of-sec__head"><h2>Biggest discounts right now</h2><p><a href="../books/?g=all">See all books →</a></p></div><div class="bk-grid of-deals">' + deals.map(deal).join("") + "</div></section>";
  if (ended.length) h += '<section class="of-sec"><div class="of-sec__head"><h2>Recently ended</h2><p>Missed these? Keep an eye on this page — new offers go up often.</p></div><div class="of-past">' +
    ended.map(function (x) {
      var c = x.c, tag = c.href ? "a" : "div";
      return "<" + tag + ' class="of-past__card"' + (c.href ? ' href="' + esc(c.href) + '"' : "") + '><span class="of-past__img"><img src="' + esc(c.img) + '" alt="" loading="lazy"></span>' +
        '<span class="of-past__body"><span class="of-pill of-pill--ended">Ended ' + day(c.end).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + "</span>" +
        '<b lang="hi">' + esc(c.title) + "</b><span>" + esc(c.textEn) + "</span></span></" + tag + ">";
    }).join("") + "</div></section>";
  h += '<section class="of-cta"><p>New offers go up often. Browse the collections while you wait.</p><a class="of-btn of-btn--ghost" href="../collections/">Browse collections</a></section>';
  body.innerHTML = h;
  var live = camps.filter(function (x) { return x.s.k === "live"; }).length, soon = camps.filter(function (x) { return x.s.k === "soon"; }).length;
  document.getElementById("ofCount").textContent = (live ? live + " live now" : "No sale live today") + (soon ? " · " + soon + " coming up" : "") + " · extra savings on every order";
})();
