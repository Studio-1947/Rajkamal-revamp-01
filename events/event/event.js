/* Event page: cover, description, gallery (with a simple viewer) and a details card with register / add to calendar / map. */
(function () {
  var U = window.RKEv, esc = U.esc, id = new URLSearchParams(location.search).get("id"), e = U.byId(id);
  var root = document.getElementById("evRoot"), crumbs = document.getElementById("evCrumbs");
  crumbs.innerHTML = '<a href="../../">Home</a><span>/</span><a href="../">Events</a>' + (e ? '<span>/</span><b lang="hi">' + esc(e.title) + "</b>" : "");
  if (!e) { root.innerHTML = '<div class="pd-missing"><h1>Event not found</h1><p>It may have been removed or the link is wrong.</p><a class="bk-btn bk-btn--buy" href="../">See all events</a></div>'; return; }
  document.title = e.title + " | Events | Rajkamal Offers";
  var s = U.status(e), url = location.href;
  var others = (window.RK_EVENTS || []).filter(function (x) { return x !== e; }).sort(function (a, b) { return Math.abs(new Date(a.start) - new Date(e.start)) - Math.abs(new Date(b.start) - new Date(e.start)); }).slice(0, 3);

  root.innerHTML =
    '<div class="evp">' +
      '<figure class="evp-cover"><img src="../' + esc(e.imgs[0]) + '" alt="' + esc(e.title) + '"></figure>' +
      '<div class="evp-main">' +
        '<div class="evp-tags"><span class="ev-pill ev-pill--' + s.k + '">' + esc(s.label) + "</span>" + e.tags.map(function (t) { return '<span class="evp-tag">' + esc(t) + "</span>"; }).join("") + "</div>" +
        '<h1 class="pd-title" lang="hi">' + esc(e.title) + "</h1>" +
        '<p class="evp-sub" lang="hi">' + esc(e.sub) + "</p>" +
        (e.desc.length ? '<div class="evp-desc" lang="hi">' + e.desc.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" : "") +
        (e.imgs.length > 1 ? '<section class="evp-gallery"><h2>Gallery</h2><div class="evp-thumbs">' + e.imgs.slice(1).map(function (src, i) {
          return '<button type="button" class="evp-thumb" data-i="' + (i + 1) + '" aria-label="View photo ' + (i + 1) + '"><img src="../' + esc(src) + '" alt="" loading="lazy"></button>';
        }).join("") + "</div></section>" : "") +
      "</div>" +
      '<aside class="evp-card">' +
        "<h2>Event details</h2>" +
        '<dl><div><dt>Date &amp; time</dt><dd>' + esc(U.when(e)) + "</dd></div>" +
        '<div><dt>Venue</dt><dd lang="hi">' + esc(e.venue) + (e.map ? ' <a class="evp-map" href="' + esc(e.map) + '" target="_blank" rel="noopener noreferrer">View on map ↗</a>' : "") + "</dd></div></dl>" +
        (s.k !== "past"
          ? (e.register ? '<a class="ev-btn ev-btn--block" href="../register/?id=' + encodeURIComponent(e.id) + '">Register now →</a>' : '<p class="evp-note">Entry is open to all — no registration needed.</p>') +
            '<button type="button" class="ev-btn ev-btn--ghost ev-btn--block" data-ics>Add to calendar</button>'
          : '<p class="evp-note">This event has ended. See what’s coming up on the <a href="../">events page</a>.</p>') +
        '<div class="evp-help"><b>Need help?</b><span>Questions about this event? Please contact our support team.</span><a href="../../contact/">Contact Support →</a></div>' +
      "</aside>" +
    "</div>" +
    (others.length ? '<section class="evp-more"><h2>More events</h2><div class="ev-grid">' + others.map(function (x) {
      var b = U.block(x);
      return '<a class="ev-card" href="?id=' + encodeURIComponent(x.id) + '"><span class="ev-card__img"><img src="../' + esc(x.imgs[0]) + '" alt="" loading="lazy"><span class="ev-date" aria-hidden="true"><b>' + esc(b.day) + "</b><i>" + esc(b.month) + "</i></span></span>" +
        '<span class="ev-card__body"><b lang="hi">' + esc(x.title) + '</b><span class="ev-card__sub" lang="hi">' + esc(x.sub) + '</span><span class="ev-card__meta">' + esc(x.city) + " · " + esc(U.status(x).k === "past" ? "Past" : U.status(x).label) + "</span></span></a>";
    }).join("") + "</div></section>" : "");

  /* gallery viewer */
  var dlg = document.createElement("dialog"); dlg.className = "evp-view"; dlg.setAttribute("aria-label", "Photo");
  dlg.innerHTML = '<button type="button" class="evp-view__x" aria-label="Close">×</button><img alt=""><div class="evp-view__nav"><button type="button" data-step="-1" aria-label="Previous photo">‹</button><span></span><button type="button" data-step="1" aria-label="Next photo">›</button></div>';
  document.body.appendChild(dlg);
  var cur = 1, img = dlg.querySelector("img"), lbl = dlg.querySelector(".evp-view__nav span");
  function show(i) { cur = (i - 1 + e.imgs.length - 1) % (e.imgs.length - 1) + 1; img.src = "../" + e.imgs[cur]; img.alt = e.title + " — photo " + cur; lbl.textContent = cur + " / " + (e.imgs.length - 1); }
  root.addEventListener("click", function (ev) {
    var t = ev.target.closest(".evp-thumb"); if (t) { show(+t.dataset.i); dlg.showModal(); return; }
    if (ev.target.closest("[data-ics]")) { U.ics(e, url); if (window.RKStore) window.RKStore.toast("Calendar file downloaded"); }
  });
  dlg.addEventListener("click", function (ev) {
    if (ev.target === dlg || ev.target.closest(".evp-view__x")) dlg.close();
    var st = ev.target.closest("[data-step]"); if (st) show(cur + +st.dataset.step);
  });
  dlg.addEventListener("keydown", function (ev) { if (ev.key === "ArrowRight") show(cur + 1); if (ev.key === "ArrowLeft") show(cur - 1); });
  var share = document.getElementById("evShare");
  if (share) share.addEventListener("click", function () { if (window.RKStore) window.RKStore.share({ title: e.title, text: e.sub + " · " + U.when(e), url: url }); });
})();
