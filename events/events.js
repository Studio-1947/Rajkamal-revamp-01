/* Events list: upcoming events featured first (register + add to calendar), then past events with a city filter. */
(function () {
  var E = (window.RK_EVENTS || []).slice(), U = window.RKEv, esc = U.esc;
  var body = document.getElementById("evBody");
  var CAL = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M16 3v4M8 3v4M3 10h18M12 14v4M10 16h4"/></svg>';
  var PIN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  E.forEach(function (e) { e._s = U.status(e); });
  var up = E.filter(function (e) { return e._s.k !== "past"; }).sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
  var past = E.filter(function (e) { return e._s.k === "past"; }).sort(function (a, b) { return new Date(b.start) - new Date(a.start); });
  var cities = Array.from(new Set(past.map(function (e) { return e.city; })));
  var city = new URLSearchParams(location.search).get("city") || "all";
  if (city !== "all" && cities.indexOf(city) < 0) city = "all";

  function dateBlock(e) { var b = U.block(e); return '<span class="ev-date" aria-hidden="true"><b>' + esc(b.day) + "</b><i>" + esc(b.month) + "</i></span>"; }
  function feature(e) {
    var href = "event/?id=" + encodeURIComponent(e.id);
    return '<article class="ev-feature">' +
      '<a class="ev-feature__img" href="' + href + '"><img src="' + esc(e.imgs[0]) + '" alt="' + esc(e.title) + '"></a>' +
      '<div class="ev-feature__body">' +
        '<div class="ev-feature__top">' + dateBlock(e) + '<span class="ev-pill ev-pill--' + e._s.k + '">' + esc(e._s.label) + "</span></div>" +
        '<h2 lang="hi"><a href="' + href + '">' + esc(e.title) + "</a></h2>" +
        '<p class="ev-sub" lang="hi">' + esc(e.sub) + "</p>" +
        '<p class="ev-meta">' + CAL + "<span>" + esc(U.when(e)) + "</span></p>" +
        '<p class="ev-meta">' + PIN + '<span lang="hi">' + esc(e.venue) + "</span></p>" +
        '<div class="ev-actions">' + (e.register ? '<a class="ev-btn" href="register/?id=' + encodeURIComponent(e.id) + '">Register now</a>' : "") +
          '<a class="ev-btn ev-btn--ghost" href="' + href + '">Event details</a>' +
          '<button type="button" class="ev-btn ev-btn--plain" data-ics="' + esc(e.id) + '">' + CAL + "Add to calendar</button></div>" +
      "</div></article>";
  }
  function card(e) {
    var href = "event/?id=" + encodeURIComponent(e.id);
    return '<a class="ev-card" href="' + href + '" data-city="' + esc(e.city) + '">' +
      '<span class="ev-card__img"><img src="' + esc(e.imgs[0]) + '" alt="" loading="lazy">' + dateBlock(e) + "</span>" +
      '<span class="ev-card__body"><span class="ev-card__tags">' + e.tags.slice(0, 2).map(function (t) { return "<i>" + esc(t) + "</i>"; }).join("") + "</span>" +
        '<b lang="hi">' + esc(e.title) + '</b><span class="ev-card__sub" lang="hi">' + esc(e.sub) + "</span>" +
        '<span class="ev-card__meta">' + PIN + esc(e.city) + " · " + esc(new Date(e.start).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })) + "</span></span></a>";
  }
  function draw() {
    var list = past.filter(function (e) { return city === "all" || e.city === city; });
    body.innerHTML =
      '<section class="ev-sec"><h2 class="ev-h">Upcoming</h2>' +
        (up.length ? up.map(feature).join("") : '<p class="ev-none">No upcoming events right now — follow us for the next Kitab Utsav.</p>') + "</section>" +
      '<section class="ev-sec"><div class="ev-sec__head"><h2 class="ev-h">Past events</h2>' +
        '<div class="au-chips ev-chips" role="group" aria-label="Filter by city">' + [["all", "All cities"]].concat(cities.map(function (c) { return [c, c]; })).map(function (c) {
          var n = c[0] === "all" ? past.length : past.filter(function (e) { return e.city === c[0]; }).length;
          return '<button type="button" class="au-chip" data-city="' + esc(c[0]) + '" aria-pressed="' + (c[0] === city) + '">' + esc(c[1]) + " <i>" + n + "</i></button>";
        }).join("") + "</div></div>" +
        '<div class="ev-grid">' + list.map(card).join("") + "</div></section>";
    document.getElementById("evCount").textContent = up.length + " upcoming · " + past.length + " past";
  }
  draw();
  body.addEventListener("click", function (e) {
    var c = e.target.closest(".ev-chips .au-chip");
    if (c) {
      city = c.dataset.city; draw();
      try { history.replaceState(null, "", city === "all" ? location.pathname : "?city=" + encodeURIComponent(city)); } catch (er) {}
      return;
    }
    var i = e.target.closest("[data-ics]");
    if (i) { var ev = U.byId(i.dataset.ics); U.ics(ev, new URL("event/?id=" + ev.id, location.href).href); if (window.RKStore) window.RKStore.toast("Calendar file downloaded"); }
  });
})();
