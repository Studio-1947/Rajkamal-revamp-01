/* Cart popup: a drawer on laptops, a bottom sheet on phones that can be expanded to full screen.
   Works on every page (loaded on demand from the navbar's cart button). Uses window.RKStore for the items. */
(function () {
  if (window.RKCart) return;
  var script = document.currentScript;
  var BASE = script ? script.src.replace(/cart\.js.*$/, "") : "../books/";

  function load(src, cb) { var s = document.createElement("script"); s.src = src; s.onload = cb; document.head.appendChild(s); }
  function css(href) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); }
  css(BASE + "cart.css?v=9");

  function fmt(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mrp(price, disc) { return Math.round(price / (1 - disc / 100)); }

  var lookup = null;
  function books() {
    if (lookup) return lookup;
    lookup = {};
    var C = window.RK_COLLECTIONS || {};
    Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { if (!lookup[b[4]]) lookup[b[4]] = b; }); });
    return lookup;
  }

  var root, panel, list, foot, countEl, lastFocus, expanded = false;
  function build() {
    root = document.createElement("div");
    root.className = "rkc";
    root.hidden = true;
    root.innerHTML =
      '<div class="rkc__scrim" data-close></div>' +
      '<aside class="rkc__panel" role="dialog" aria-modal="true" aria-labelledby="rkcTitle" tabindex="-1">' +
        '<button type="button" class="rkc__grab" aria-label="Expand cart" data-expand><i></i></button>' +
        '<header class="rkc__head"><h2 id="rkcTitle">Your cart <span class="rkc__count" id="rkcCount"></span></h2>' +
          '<div class="rkc__tools">' +
            '<button type="button" class="rkc__icon" aria-label="Share cart" data-share><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-3.2M8.6 13.4l6.8 3.2"/></svg></button>' +
            '<button type="button" class="rkc__icon rkc__expand" aria-label="Expand to full screen" data-expand><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>' +
            '<button type="button" class="rkc__icon" aria-label="Close cart" data-close><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
          '</div></header>' +
        '<div class="rkc__body"><ul class="rkc__list" id="rkcList"></ul></div>' +
        '<footer class="rkc__foot" id="rkcFoot"></footer>' +
      '</aside>';
    document.body.appendChild(root);
    panel = root.querySelector(".rkc__panel");
    list = root.querySelector("#rkcList");
    foot = root.querySelector("#rkcFoot");
    countEl = root.querySelector("#rkcCount");

    root.addEventListener("click", function (e) {
      var t = e.target.closest("[data-close],[data-expand],[data-inc],[data-dec],[data-rm],[data-clear],[data-checkout],[data-share]");
      if (!t) return;
      var S = window.RKStore;
      if (t.hasAttribute("data-close")) return close();
      if (t.hasAttribute("data-expand")) return setExpanded(!expanded);
      if (t.hasAttribute("data-inc")) S.addToCart(t.getAttribute("data-inc"));
      else if (t.hasAttribute("data-dec")) S.removeOne(t.getAttribute("data-dec"));
      else if (t.hasAttribute("data-rm")) S.removeAll(t.getAttribute("data-rm"));
      else if (t.hasAttribute("data-clear")) S.clear();
      else if (t.hasAttribute("data-checkout")) { location.href = BASE + "checkout/"; }
      else if (t.hasAttribute("data-share")) {
        var counts = S.counts(), all = books(), ids = Object.keys(counts);
        var lines = ids.slice(0, 5).map(function (id) { var b = all[id]; return b ? b[0] + " ×" + counts[id] : id; });
        var text = ids.length ? "My cart: " + lines.join(", ") + (ids.length > 5 ? " and " + (ids.length - 5) + " more" : "") : "My cart on Rajkamal Offers";
        S.share({ title: "My cart — Rajkamal Offers", text: text, url: location.origin + BASE });
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !root.hidden) close(); });
    document.addEventListener("rk-store", function () { if (!root.hidden) render(); });
    // swipe down on the grab handle / header closes (or shrinks from full screen)
    var y0 = null;
    root.querySelector(".rkc__grab").addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    root.querySelector(".rkc__grab").addEventListener("touchend", function (e) {
      if (y0 === null) return;
      var dy = e.changedTouches[0].clientY - y0; y0 = null;
      if (dy > 60) { if (expanded) setExpanded(false); else close(); }
      else if (dy < -40) setExpanded(true);
    });
  }

  function render() {
    var S = window.RKStore, counts = S.counts(), all = books(), ids = Object.keys(counts);
    var n = ids.reduce(function (a, id) { return a + counts[id]; }, 0);
    countEl.textContent = n ? "(" + n + ")" : "";
    if (!ids.length) {
      list.innerHTML = '<li class="rkc__empty"><div class="rkc__empty-art" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M8 12h8l6 30h28l6-22H20"/><circle cx="26" cy="52" r="4"/><circle cx="46" cy="52" r="4"/></svg></div>' +
        '<h3>Your cart is empty</h3><p>Books you add will show up here.</p><button type="button" class="rkc__btn rkc__btn--ghost" data-close>Browse books</button></li>';
      foot.innerHTML = ""; foot.hidden = true; return;
    }
    var subtotal = 0, list_price = 0;
    list.innerHTML = ids.map(function (id) {
      var b = all[id] || [id.replace(/-/g, " "), "", 0, 0, id];
      var q = counts[id], line = b[2] * q; subtotal += line; list_price += (b[3] ? mrp(b[2], b[3]) : b[2]) * q;
      return '<li class="rkc__item"><a class="rkc__cover" href="' + BASE + 'product/?id=' + esc(id) + '"><img src="' + BASE + 'covers/' + esc(id) + '.jpg" alt="" width="60" height="90" loading="lazy" onerror="this.style.visibility=\'hidden\'"></a>' +
        '<div class="rkc__info"><a class="rkc__name" href="' + BASE + 'product/?id=' + esc(id) + '">' + esc(b[0]) + '</a><span class="rkc__author">' + esc(b[1]) + '</span>' +
        '<div class="rkc__row"><div class="rkc__qty" role="group" aria-label="Quantity"><button type="button" data-dec="' + esc(id) + '" aria-label="Decrease quantity">−</button><output>' + q + '</output><button type="button" data-inc="' + esc(id) + '" aria-label="Increase quantity">+</button></div>' +
        '<div class="rkc__price"><strong>' + fmt(line) + '</strong>' + (b[3] ? '<s>' + fmt(mrp(b[2], b[3]) * q) + '</s>' : '') + '</div></div></div>' +
        '<button type="button" class="rkc__remove" data-rm="' + esc(id) + '" aria-label="Remove ' + esc(b[0]) + '"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg></button></li>';
    }).join("");
    var save = Math.max(0, list_price - subtotal);
    // Extra offer: 5% off from ₹2,000, 7% off from ₹5,000 (same tiers as the offer boxes)
    var LIM = [[10000, 7], [5000, 7], [2000, 5]], tier = null, next = null;
    for (var t = 0; t < LIM.length; t++) { if (subtotal >= LIM[t][0]) { tier = LIM[t]; break; } }
    if (subtotal < 2000) next = [2000, 5]; else if (subtotal < 5000) next = [5000, 7];
    var extra = tier ? Math.round(subtotal * tier[1]) / 100 : 0;
    var offerHtml;
    if (tier) {
      offerHtml = '<div class="rkc__offer is-on"><b>Extra ' + tier[1] + '% off unlocked</b><span>Your cart is worth ' + fmt(subtotal) + ' — you save another ' + fmt(extra) + (next ? '. Add ' + fmt(next[0] - subtotal) + ' more for Extra ' + next[1] + '% off.' : '.') + '</span><i style="width:100%"></i></div>';
    } else {
      var base = 0, target = next[0], pct = Math.min(100, Math.round(subtotal / target * 100));
      offerHtml = '<div class="rkc__offer"><b>Your picks are worth ' + fmt(subtotal) + '</b><span>Add ' + fmt(target - subtotal) + ' more to unlock Extra ' + next[1] + '% off.</span><i style="width:' + pct + '%"></i></div>';
    }
    var payable = subtotal - extra;
    foot.hidden = false;
    foot.innerHTML = offerHtml +
      '<div class="rkc__perk"><svg viewBox="0 0 24 24"><rect x="1" y="7" width="14" height="10"/><path d="M15 10h4l3 3v4h-7z"/><circle cx="6" cy="19" r="1.6"/><circle cx="18" cy="19" r="1.6"/></svg><span>Free delivery on this offer</span></div>' +
      '<dl class="rkc__sum"><div><dt>Subtotal</dt><dd>' + fmt(list_price) + '</dd></div>' +
      (save ? '<div class="rkc__save"><dt>You save</dt><dd>− ' + fmt(save) + '</dd></div>' : '') +
      (extra ? '<div class="rkc__save"><dt>Extra ' + tier[1] + '% offer</dt><dd>− ' + fmt(extra) + '</dd></div>' : '') +
      '<div class="rkc__total"><dt>Total</dt><dd>' + fmt(payable) + '</dd></div></dl>' +
      '<button type="button" class="rkc__btn rkc__btn--primary" data-checkout>Checkout · ' + fmt(payable) + '</button>' +
      '<div class="rkc__links"><button type="button" class="rkc__link" data-close>Continue shopping</button><button type="button" class="rkc__link" data-clear>Clear cart</button></div>';
  }

  function setExpanded(on) {
    expanded = on;
    panel.classList.toggle("is-full", on);
    root.querySelectorAll("[data-expand]").forEach(function (b) { b.setAttribute("aria-label", on ? "Shrink cart" : "Expand cart"); });
  }
  function open(full) {
    if (!root) build();
    if (!window.RK_COLLECTIONS) { load(BASE + "books-data.js?v=2", function () { open(full); }); return; }
    lookup = null;
    lastFocus = document.activeElement;
    render();
    setExpanded(!!full);
    root.hidden = false;
    document.documentElement.classList.add("rkc-lock");
    requestAnimationFrame(function () { root.classList.add("is-open"); panel.focus(); });
  }
  function close() {
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    document.documentElement.classList.remove("rkc-lock");
    setTimeout(function () { root.hidden = true; setExpanded(false); if (lastFocus && lastFocus.focus) lastFocus.focus(); }, 260);
  }

  window.RKCart = { open: open, close: close };
})();
