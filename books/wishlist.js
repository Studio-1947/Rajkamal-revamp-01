/* Wishlist popup: same drawer/bottom-sheet mechanics as the cart, listing saved books with a
   "Move to cart" and a remove button. Loaded on demand from the navbar's wishlist button. */
(function () {
  if (window.RKWishlist) return;
  var script = document.currentScript;
  var BASE = script ? script.src.replace(/wishlist\.js.*$/, "") : "../books/";

  function css(href) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); }
  css(BASE + "cart.css?v=9"); // reuses the cart drawer's look

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

  var root, panel, list, expanded = false, menu, menuOpen = false;
  function renderMenu() {
    var S = window.RKStore, lists = S.wishlists(), activeId = S.activeWishlistId();
    menu.innerHTML = lists.map(function (w) {
      return '<div class="rkw__row' + (w.id === activeId ? ' is-active' : '') + '" data-wl="' + w.id + '">' +
        '<span class="rkw__row-name">' + esc(w.name) + '</span><span class="rkw__row-count">' + w.count + '</span>' +
        (lists.length > 1 ? '<button type="button" class="rkw__row-del" data-wl-del="' + w.id + '" aria-label="Delete ' + esc(w.name) + '"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' : '') +
        '</div>';
    }).join("") + '<button type="button" class="rkw__new" data-new-wl><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>New wishlist</button>';
  }
  function setMenu(on) {
    menuOpen = on;
    root.querySelector("#rkwSwitch").setAttribute("aria-expanded", String(on));
    if (on) renderMenu();
    menu.hidden = !on;
  }
  function build() {
    root = document.createElement("div");
    root.className = "rkc rkw";
    root.hidden = true;
    root.innerHTML =
      '<div class="rkc__scrim" data-close></div>' +
      '<aside class="rkc__panel" role="dialog" aria-modal="true" aria-labelledby="rkwTitle" tabindex="-1">' +
        '<button type="button" class="rkc__grab" aria-label="Expand wishlist" data-expand><i></i></button>' +
        '<header class="rkc__head"><h2 id="rkwTitle"><button type="button" class="rkw__switch" id="rkwSwitch" data-switch aria-haspopup="true" aria-expanded="false"><span id="rkwName"></span> <span class="rkc__count" id="rkwCount"></span><svg class="rkw__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></h2>' +
          '<div class="rkc__tools">' +
            '<button type="button" class="rkc__icon" aria-label="Rename wishlist" data-rename><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>' +
            '<button type="button" class="rkc__icon" aria-label="Share wishlist" data-share><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-3.2M8.6 13.4l6.8 3.2"/></svg></button>' +
            '<button type="button" class="rkc__icon rkc__expand" aria-label="Expand to full screen" data-expand><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>' +
            '<button type="button" class="rkc__icon" aria-label="Close wishlist" data-close><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
          '</div></header>' +
        '<div class="rkw__menu" id="rkwMenu" hidden></div>' +
        '<div class="rkc__body"><ul class="rkc__list" id="rkwList"></ul></div>' +
        '<footer class="rkc__foot" id="rkwFoot"></footer>' +
      '</aside>';
    document.body.appendChild(root);
    panel = root.querySelector(".rkc__panel");
    list = root.querySelector("#rkwList");

    menu = root.querySelector("#rkwMenu");
    root.addEventListener("click", function (e) {
      var t = e.target.closest("[data-close],[data-expand],[data-rm],[data-move],[data-moveall],[data-rename],[data-share],[data-switch],[data-wl],[data-wl-del],[data-new-wl]");
      if (!t) { if (menuOpen && !e.target.closest("#rkwMenu")) setMenu(false); return; }
      var S = window.RKStore;
      if (t.hasAttribute("data-close")) return close();
      if (t.hasAttribute("data-expand")) return setExpanded(!expanded);
      if (t.hasAttribute("data-switch")) return setMenu(!menuOpen);
      if (t.hasAttribute("data-rm")) { S.toggleWish(t.getAttribute("data-rm")); }
      else if (t.hasAttribute("data-move")) { var id = t.getAttribute("data-move"); S.addToCart(id); S.toggleWish(id); S.toast("Moved to cart"); }
      else if (t.hasAttribute("data-moveall")) {
        S.wish().forEach(function (id) { S.addToCart(id); });
        S.wish().slice().forEach(function (id) { S.toggleWish(id); });
        S.openCart(window.matchMedia("(max-width: 720px)").matches);
        close();
      } else if (t.hasAttribute("data-rename")) {
        var next = window.prompt("Name this wishlist", S.wishName());
        if (next !== null) { S.setWishName(next); root.querySelector("#rkwName").textContent = S.wishName(); }
      } else if (t.hasAttribute("data-share")) {
        var all = books(), ids = S.wish().filter(function (id) { return all[id]; });
        var lines = ids.slice(0, 5).map(function (id) { return all[id][0]; });
        var text = ids.length ? lines.join(", ") + (ids.length > 5 ? " and " + (ids.length - 5) + " more" : "") : "My wishlist on Rajkamal Offers";
        S.share({ title: S.wishName() + " — Rajkamal Offers", text: text, url: location.origin + BASE });
      } else if (t.hasAttribute("data-wl")) {
        S.setActiveWishlist(t.getAttribute("data-wl"));
        setMenu(false);
      } else if (t.hasAttribute("data-wl-del")) {
        var id2 = t.getAttribute("data-wl-del"), row = t.closest("[data-wl]");
        var name2 = row ? row.querySelector(".rkw__row-name").textContent : "this wishlist";
        if (window.confirm('Delete "' + name2 + '"? This can\'t be undone.')) { S.deleteWishlist(id2); renderMenu(); }
      } else if (t.hasAttribute("data-new-wl")) {
        var wname = window.prompt("Name your new wishlist", "");
        if (wname !== null && wname.trim()) { S.createWishlist(wname); setMenu(false); }
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !root.hidden) close(); });
    document.addEventListener("rk-store", function () { if (!root.hidden) { render(); if (menuOpen) renderMenu(); } });
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
    var S = window.RKStore, all = books(), ids = S.wish().filter(function (id) { return all[id]; });
    var countEl = root.querySelector("#rkwCount"), foot = root.querySelector("#rkwFoot");
    root.querySelector("#rkwName").textContent = S.wishName();
    countEl.textContent = ids.length ? "(" + ids.length + ")" : "";
    if (!ids.length) {
      list.innerHTML = '<li class="rkc__empty"><div class="rkc__empty-art" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>' +
        '<h3>Your wishlist is empty</h3><p>Tap the heart on any book to save it here.</p><button type="button" class="rkc__btn rkc__btn--ghost" data-close>Browse books</button></li>';
      foot.hidden = true; foot.innerHTML = ""; return;
    }
    var total = 0;
    list.innerHTML = ids.map(function (id) {
      var b = all[id]; total += b[2];
      return '<li class="rkc__item"><a class="rkc__cover" href="' + BASE + 'product/?id=' + esc(id) + '"><img src="' + BASE + 'covers/' + esc(id) + '.jpg" alt="" width="60" height="90" loading="lazy" onerror="this.style.visibility=\'hidden\'"></a>' +
        '<div class="rkc__info"><a class="rkc__name" href="' + BASE + 'product/?id=' + esc(id) + '">' + esc(b[0]) + '</a><span class="rkc__author">' + esc(b[1]) + '</span>' +
        '<div class="rkc__row"><div class="rkc__price"><strong>' + fmt(b[2]) + '</strong>' + (b[3] ? '<s>' + fmt(mrp(b[2], b[3])) + '</s>' : '') + '</div>' +
        '<button type="button" class="rkc__move" data-move="' + esc(id) + '">Move to cart</button></div></div>' +
        '<button type="button" class="rkc__remove" data-rm="' + esc(id) + '" aria-label="Remove ' + esc(b[0]) + '"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>';
    }).join("");
    foot.hidden = false;
    foot.innerHTML = '<div class="rkc__wtotal"><span>' + ids.length + (ids.length === 1 ? " book saved" : " books saved") + '</span><strong>' + fmt(total) + '</strong></div>' +
      '<button type="button" class="rkc__btn rkc__btn--primary" data-moveall>Move all to cart</button>' +
      '<div class="rkc__links"><button type="button" class="rkc__link" data-close>Continue browsing</button></div>';
  }

  function setExpanded(on) { expanded = on; panel.classList.toggle("is-full", on); root.querySelectorAll("[data-expand]").forEach(function (b) { b.setAttribute("aria-label", on ? "Shrink wishlist" : "Expand to full screen"); }); }
  function open(full) {
    if (!root) build();
    if (!window.RK_COLLECTIONS) { var s = document.createElement("script"); s.src = BASE + "books-data.js?v=2"; s.onload = function () { open(full); }; document.head.appendChild(s); return; }
    lookup = null;
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
    setMenu(false);
    setTimeout(function () { root.hidden = true; setExpanded(false); }, 260);
  }

  window.RKWishlist = { open: open, close: close };
})();
