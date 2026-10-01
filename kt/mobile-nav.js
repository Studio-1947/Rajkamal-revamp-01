/* Phone navbar: search collapses to an icon and expands on tap; a burger menu holds the links and account icons. */
(function () {
  var header = document.getElementById("siteHeader");
  if (!header) return;
  var top = header.querySelector(".header-top");
  var icons = header.querySelector(".header-icons");
  var search = header.querySelector(".header-search");
  var input = document.getElementById("searchInput");
  var navList = header.querySelector(".header-nav-main ul");
  if (!top || !icons || !search) return;

  /* voice search: the header's mic button dictates into the search field (Web Speech API where supported) */
  (function () {
    var mic = header.querySelector(".mic-btn");
    if (!mic) return;
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) { mic.disabled = true; mic.title = "Voice search is not supported in this browser"; return; }
    var rec = new Rec(); rec.lang = "hi-IN"; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.addEventListener("result", function (e) {
      if (input) { input.value = e.results[0][0].transcript; input.dispatchEvent(new Event("input")); input.focus(); }
    });
    rec.addEventListener("end", function () { mic.classList.remove("is-listening"); });
    rec.addEventListener("error", function () { mic.classList.remove("is-listening"); });
    mic.addEventListener("click", function (e) {
      e.preventDefault();
      if (mic.classList.contains("is-listening")) { rec.stop(); return; }
      if (mq.matches && !search.classList.contains("open")) setSearch(true);
      mic.classList.add("is-listening");
      try { rec.start(); } catch (err) { mic.classList.remove("is-listening"); }
    });
  })();

  /* browser bar colour follows the light / dark theme (Chrome, Safari, Android WebView) */
  (function () {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    var root = document.documentElement, plain = document.body.classList.contains("hp");
    function paint() { meta.setAttribute("content", root.getAttribute("data-theme") === "light" ? "#fffdfb" : (plain ? "#1a0d0a" : "#1a120a")); }
    paint();
    new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  })();

  /* phones: the navbar tucks away as soon as the page scrolls, freeing up the screen; it comes back at the very top */
  (function () {
    var phoneQ = window.matchMedia("(max-width: 720px)");
    function onScroll() {
      if (!phoneQ.matches) { header.classList.remove("nav-hidden"); return; }
      if (header.classList.contains("menu-open") || header.classList.contains("search-open")) return;
      header.classList.toggle("nav-hidden", window.scrollY > 4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ---- tiny cart / wishlist store (localStorage) shared with the catalogue page ---- */
  var KEY_CART = "rk-cart", KEY_WISH = "rk-wish", KEY_WISH_NAME = "rk-wish-name";
  var KEY_WISHLISTS = "rk-wishlists", KEY_WISH_ACTIVE = "rk-wish-active";
  function read(k) { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch (e) { return []; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* multiple named wishlists: [{id,name,items:[bookId,...]}], with one "active" list that the
     heart button on a book card adds to/removes from. Legacy single-list data (rk-wish / rk-wish-name)
     is migrated into the first wishlist the first time this runs. */
  var wishlistsCache = null;
  function readWishlists() {
    if (wishlistsCache) return wishlistsCache;
    var arr;
    try { arr = JSON.parse(localStorage.getItem(KEY_WISHLISTS) || "null"); } catch (e) { arr = null; }
    if (!arr || !arr.length) {
      var legacyItems = read(KEY_WISH);
      var legacyName = (function () { try { return localStorage.getItem(KEY_WISH_NAME); } catch (e) { return null; } })();
      arr = [{ id: "w1", name: legacyName || "My Wishlist", items: legacyItems }];
      write(KEY_WISHLISTS, arr);
    }
    wishlistsCache = arr;
    return arr;
  }
  function writeWishlists(arr) { wishlistsCache = arr; write(KEY_WISHLISTS, arr); }
  function activeWishlistId() {
    var arr = readWishlists();
    var id = (function () { try { return localStorage.getItem(KEY_WISH_ACTIVE); } catch (e) { return null; } })();
    if (id && arr.some(function (w) { return w.id === id; })) return id;
    return arr[0].id;
  }
  function getActiveWishlist() {
    var arr = readWishlists(), id = activeWishlistId();
    var w = arr.filter(function (x) { return x.id === id; })[0];
    return w || arr[0];
  }
  function uid() { return "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "rk-toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  }
  /* ---- add-to-cart pulse: overshoot bounce + a small burst of dots + a rolling badge count ---- */
  function spawnBurst(host) {
    var r = host.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var n = 7;
    for (var i = 0; i < n; i++) {
      var dot = document.createElement("span");
      dot.className = "rk-burst-dot";
      var ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      var dist = 18 + Math.random() * 10;
      dot.style.left = cx + "px";
      dot.style.top = cy + "px";
      dot.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
      dot.style.setProperty("--dy", (Math.sin(ang) * dist).toFixed(1) + "px");
      document.body.appendChild(dot);
      dot.addEventListener("animationend", function () { this.remove(); });
      setTimeout(function (d) { return function () { if (d.parentNode) d.remove(); }; }(dot), 700);
    }
  }
  function rollBadge(badge, n) {
    badge.textContent = n;
    badge.classList.remove("rk-roll"); void badge.offsetWidth; badge.classList.add("rk-roll");
  }
  function pulseCart() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll('.pill-btn--cart, .mobile-tab[data-tab="cart"]').forEach(function (host) {
      if (!host.offsetParent && host !== document.body) return; // skip hosts that aren't actually visible (e.g. the tab bar on desktop)
      host.classList.remove("rk-beat"); void host.offsetWidth; host.classList.add("rk-beat");
      spawnBurst(host);
      var b = host.querySelector(".pill-badge, .mobile-tab__badge");
      if (b && !b.hidden) rollBadge(b, b.textContent);
    });
  }

  var Store = window.RKStore = {
    cart: function () { return read(KEY_CART); },
    wish: function () { return getActiveWishlist().items; },
    addToCart: function (id) { var c = read(KEY_CART); c.push(id); write(KEY_CART, c); Store.refresh(); pulseCart(); },
    toggleWish: function (id) {
      var w = getActiveWishlist(), i = w.items.indexOf(id);
      if (i < 0) w.items.push(id); else w.items.splice(i, 1);
      writeWishlists(readWishlists()); Store.refresh(); return i < 0;
    },
    counts: function () { var o = {}; read(KEY_CART).forEach(function (i) { o[i] = (o[i] || 0) + 1; }); return o; },
    removeOne: function (id) { var c = read(KEY_CART), i = c.indexOf(id); if (i >= 0) c.splice(i, 1); write(KEY_CART, c); Store.refresh(); },
    removeAll: function (id) { write(KEY_CART, read(KEY_CART).filter(function (x) { return x !== id; })); Store.refresh(); },
    clear: function () { write(KEY_CART, []); Store.refresh(); },
    isWished: function (id) { return getActiveWishlist().items.indexOf(id) >= 0; },
    wishName: function () { return getActiveWishlist().name; },
    setWishName: function (name) { return Store.renameWishlist(activeWishlistId(), name); },

    /* ---- multiple named wishlists ---- */
    wishlists: function () {
      return readWishlists().map(function (w) { return { id: w.id, name: w.name, count: w.items.length }; });
    },
    activeWishlistId: function () { return activeWishlistId(); },
    setActiveWishlist: function (id) {
      var arr = readWishlists();
      if (!arr.some(function (w) { return w.id === id; })) return;
      try { localStorage.setItem(KEY_WISH_ACTIVE, id); } catch (e) {}
      Store.refresh();
    },
    createWishlist: function (name) {
      var arr = readWishlists(), id = uid();
      arr.push({ id: id, name: String(name || "").trim() || "New Wishlist", items: [] });
      writeWishlists(arr);
      try { localStorage.setItem(KEY_WISH_ACTIVE, id); } catch (e) {}
      Store.refresh();
      return id;
    },
    renameWishlist: function (id, name) {
      var arr = readWishlists(), w = arr.filter(function (x) { return x.id === id; })[0];
      if (!w) return null;
      name = String(name || "").trim() || w.name;
      w.name = name; writeWishlists(arr); Store.refresh();
      return name;
    },
    deleteWishlist: function (id) {
      var arr = readWishlists();
      if (arr.length <= 1) return false; // always keep at least one
      var next = arr.filter(function (x) { return x.id !== id; });
      writeWishlists(next);
      if (activeWishlistId() === id) {
        try { localStorage.setItem(KEY_WISH_ACTIVE, next[0].id); } catch (e) {}
      }
      Store.refresh();
      return true;
    },
    share: function (data) {
      data = data || {};
      var payload = { title: data.title || document.title, text: data.text || "", url: data.url || location.href };
      if (navigator.share) { navigator.share(payload).catch(function () {}); return; }
      var copyText = payload.url + (payload.text ? " — " + payload.text : "");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(function () { toast("Link copied to clipboard"); }, function () { toast("Couldn't copy the link"); });
      } else { toast("Sharing isn't supported in this browser"); }
    },
    toast: toast,
    refresh: function () {
      document.querySelectorAll(".pill-btn--cart .pill-badge").forEach(function (b) { var n = read(KEY_CART).length; b.textContent = n; b.hidden = !n; });
      document.querySelectorAll(".pill-btn--wish .pill-badge").forEach(function (b) { var n = getActiveWishlist().items.length; b.textContent = n; b.hidden = !n; });
      // keep every book card's heart in sync with the *active* wishlist (matters when switching between named wishlists)
      var wished = getActiveWishlist().items;
      document.querySelectorAll(".bk-actions[data-id]").forEach(function (wrap) {
        var btn = wrap.querySelector(".bk-btn--wish"); if (!btn) return;
        var on = wished.indexOf(wrap.getAttribute("data-id")) >= 0;
        btn.classList.toggle("is-on", on); btn.setAttribute("aria-pressed", String(on));
      });
      document.dispatchEvent(new CustomEvent("rk-store"));
    }
  };
  function badge(btn) { if (!btn.querySelector(".pill-badge")) { var b = document.createElement("span"); b.className = "pill-badge"; b.hidden = true; btn.appendChild(b); } }
  var cartBtn = icons.querySelector(".pill-btn--cart");
  if (cartBtn) badge(cartBtn);
  var wishBtn = document.createElement("button");
  wishBtn.type = "button"; wishBtn.className = "pill-btn pill-btn--wish"; wishBtn.setAttribute("aria-label", "Wishlist"); wishBtn.title = "Wishlist";
  wishBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.600 5 15.500 5c3.100 0 5 3 3.800 6.200-1.800 4.700-9.300 9.300-9.300 9.300z"/></svg>';
  badge(wishBtn);
  icons.insertBefore(wishBtn, cartBtn || icons.firstChild);
  var cartUrl = (function () {
    var s = document.querySelector('script[src*="mobile-nav.js"]');
    return s ? s.src.replace(/kt\/mobile-nav\.js.*$/, "books/cart.js?v=8") : null;
  })();
  Store.openCart = function (full) {
    if (window.RKCart) return window.RKCart.open(full);
    if (!cartUrl) return;
    var el = document.createElement("script"); el.src = cartUrl;
    el.onload = function () { if (window.RKCart) window.RKCart.open(full); };
    document.head.appendChild(el);
  };
  if (cartBtn) cartBtn.addEventListener("click", function () { Store.openCart(); });
  var wishUrl = cartUrl ? cartUrl.replace(/cart\.js.*$/, "wishlist.js?v=3") : null;
  Store.openWishlist = function () {
    if (window.RKWishlist) return window.RKWishlist.open();
    if (!wishUrl) return;
    var el = document.createElement("script"); el.src = wishUrl;
    el.onload = function () { if (window.RKWishlist) window.RKWishlist.open(); };
    document.head.appendChild(el);
  };
  wishBtn.addEventListener("click", function () { Store.openWishlist(); });
  Store.refresh();
  window.addEventListener("storage", Store.refresh);

  /* My Account: the header's account button opens the account page */
  var accountUrl = (function () {
    var s = document.querySelector('script[src*="mobile-nav.js"]');
    var base = s ? s.src.replace(/kt\/mobile-nav\.js.*$/, "") : "";
    return base + "account/";
  })();
  var accountBtn = icons.querySelector(".pill-btn--account");
  if (accountBtn) accountBtn.addEventListener("click", function () { location.href = accountUrl; });

  /* ---- bottom tab bar (phones only): docked out of sight, slides into view once the page is scrolled ---- */
  (function () {
    var ROOT = (function () {
      var s = document.querySelector('script[src*="mobile-nav.js"]');
      return s ? s.src.replace(/kt\/mobile-nav\.js.*$/, "") : "../";
    })();
    var bar = document.createElement("nav");
    bar.className = "mobile-tabbar";
    bar.setAttribute("aria-label", "Quick navigation");
    bar.innerHTML =
      '<a class="mobile-tab mobile-tab--home" href="' + ROOT + 'home/" data-tab="home"><img class="mobile-tab__logo mobile-tab__logo--light" src="' + ROOT + 'kt/assets/logo/rkp-favicon.svg" alt="" width="20" height="20"><img class="mobile-tab__logo mobile-tab__logo--dark" src="' + ROOT + 'kt/assets/logo/rkp-favicon-dark.svg" alt="" width="20" height="20"><span>Home</span></a>' +
      '<button type="button" class="mobile-tab" data-tab="search" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4.5c1.6-1 3.4-1 5 0v11.5c-1.6-1-3.4-1-5 0V4.5z"/><path d="M12 4.5c1.6-1 3.4-1 5 0v11.5c-1.6-1-3.4-1-5 0V4.5z"/><path d="M7 4.5c1.6-1 3.4-1 5 0"/><circle cx="16.3" cy="15.3" r="3.3"/><path d="m18.7 17.7 2 2"/></svg><span>Search Books</span></button>' +
      '<button type="button" class="mobile-tab" data-tab="profile"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg><span>Profile</span></button>' +
      '<button type="button" class="mobile-tab" data-tab="wish"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.6 5 15.5 5c3.1 0 5 3 3.8 6.2-1.8 4.7-9.3 9.3-9.3 9.3z"/></svg><span class="mobile-tab__badge" hidden></span><span>Wishlist</span></button>' +
      '<button type="button" class="mobile-tab" data-tab="cart"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2l2.3 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6"/></svg><span class="mobile-tab__badge" hidden></span><span>Cart</span></button>';
    document.body.appendChild(bar);

    var searchTab = bar.querySelector('[data-tab="search"]');
    var searchSheet = document.createElement("div");
    searchSheet.className = "mobile-search-sheet";
    searchSheet.hidden = true;
    searchSheet.innerHTML =
      '<div class="mobile-search-sheet__scrim" data-search-close></div>' +
      '<div class="mobile-search-sheet__sheet" role="dialog" aria-modal="true" aria-label="Search">' +
        '<button type="button" class="mobile-search-sheet__close" data-search-close aria-label="Close"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="mobile-search-sheet__grab" data-search-close></div>' +
        '<h2 class="mobile-search-sheet__title">Search</h2>' +
        '<button type="button" class="mobile-search-sheet__row" data-pop-act="books"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4.5c1.6-1 3.4-1 5 0v11.5c-1.6-1-3.4-1-5 0V4.5z"/><path d="M12 4.5c1.6-1 3.4-1 5 0v11.5c-1.6-1-3.4-1-5 0V4.5z"/><path d="M7 4.5c1.6-1 3.4-1 5 0"/><circle cx="16.3" cy="15.3" r="3.3"/><path d="m18.7 17.7 2 2"/></svg></span><span>Search by Book Names</span></button>' +
        '<button type="button" class="mobile-search-sheet__row" data-pop-act="cat"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg></span><span>Search by Categories</span></button>' +
        '<button type="button" class="mobile-search-sheet__row" data-pop-act="offers"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7z"/><path d="m9 12 2 2 4-4"/></svg></span><span>Best Offers</span></button>' +
        '<button type="button" class="mobile-search-sheet__row" data-pop-act="all"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></span><span>All Sections</span></button>' +
      '</div>';
    document.body.appendChild(searchSheet);
    function setSearchSheet(open) {
      searchSheet.hidden = !open;
      searchTab.setAttribute("aria-expanded", String(open));
      if (open) requestAnimationFrame(function () { searchSheet.classList.add("is-open"); });
      else searchSheet.classList.remove("is-open");
    }
    searchSheet.addEventListener("click", function (e) {
      if (e.target.closest("[data-search-close]")) { setSearchSheet(false); return; }
      var act = e.target.closest("[data-pop-act]");
      if (!act) return;
      setSearchSheet(false);
      if (act.dataset.popAct === "books") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(function () { setSearch(true); if (input) input.focus(); }, 350);
      } else if (act.dataset.popAct === "cat") {
        location.href = ROOT + "books/?c=khud-se-judein&from=kt";
      } else if (act.dataset.popAct === "offers") {
        location.href = ROOT + "kt/";
      } else if (act.dataset.popAct === "all") {
        location.href = ROOT + "home/";
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !searchSheet.hidden) setSearchSheet(false); });

    (function markActive() {
      var here = location.pathname.replace(/\/index\.html$/, "/");
      bar.querySelectorAll(".mobile-tab[href]").forEach(function (a) {
        var path = a.getAttribute("href").split("?")[0].replace(/^https?:\/\/[^/]+/, "");
        a.classList.toggle("is-on", here.indexOf(path) !== -1);
      });
    })();

    /* ---- profile sheet: theme preference + the site's other important shortcuts ---- */
    var profileSheet = document.createElement("div");
    profileSheet.className = "mobile-profile";
    profileSheet.hidden = true;
    profileSheet.innerHTML =
      '<div class="mobile-profile__scrim" data-profile-close></div>' +
      '<div class="mobile-profile__sheet" role="dialog" aria-modal="true" aria-label="Profile">' +
        '<button type="button" class="mobile-profile__close" data-profile-close aria-label="Close"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="mobile-profile__grab" data-profile-close></div>' +
        '<h2 class="mobile-profile__title">Profile</h2>' +
        '<button type="button" class="mobile-profile__row" data-act="theme">' +
          '<span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></span>' +
          '<span class="mobile-profile__label">Appearance<i>Light / dark mode</i></span>' +
          '<span class="mobile-profile__switch" id="mobileProfileThemeVal" role="switch" aria-checked="false"><i>Light</i><b class="mobile-profile__knob"></b><i>Dark</i></span>' +
        '</button>' +
        '<a class="mobile-profile__row" href="' + ROOT + 'account/" data-act="account"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg></span><span class="mobile-profile__label">My Account</span></a>' +
        '<a class="mobile-profile__row" href="' + ROOT + 'account/?tab=orders" data-act="orders"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5"/></svg></span><span class="mobile-profile__label">My Orders</span></a>' +
        '<button type="button" class="mobile-profile__row" data-act="wish"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.6 5 15.5 5c3.1 0 5 3 3.8 6.2-1.8 4.7-9.3 9.3-9.3 9.3z"/></svg></span><span class="mobile-profile__label">Wishlist</span></button>' +
        '<button type="button" class="mobile-profile__row" data-act="cart"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2l2.3 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6"/></svg></span><span class="mobile-profile__label">Cart</span></button>' +
        '<a class="mobile-profile__row" href="' + ROOT + 'books/?c=khud-se-judein&from=kt" data-act="books"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg></span><span class="mobile-profile__label">All Books</span></a>' +
        '<a class="mobile-profile__row" href="https://wa.me/" target="_blank" rel="noopener noreferrer" data-act="help"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.3 8.3 0 0 1-4-1L3 20l1.2-5.5a8.3 8.3 0 0 1-1.1-4.2A8.4 8.4 0 0 1 11.5 2 8.4 8.4 0 0 1 21 11.5Z"/></svg></span><span class="mobile-profile__label">Help via WhatsApp</span></a>' +
      '</div>';
    document.body.appendChild(profileSheet);

    function syncThemeSwitch() {
      var dark = document.documentElement.getAttribute("data-theme") !== "light";
      var val = profileSheet.querySelector("#mobileProfileThemeVal");
      if (val) { val.classList.toggle("is-dark", dark); val.setAttribute("aria-checked", String(dark)); }
    }
    function setProfile(open) {
      profileSheet.hidden = !open;
      if (open) {
        syncThemeSwitch();
        requestAnimationFrame(function () { profileSheet.classList.add("is-open"); });
      } else {
        profileSheet.classList.remove("is-open");
      }
    }
    profileSheet.addEventListener("click", function (e) {
      if (e.target.closest("[data-profile-close]")) { setProfile(false); return; }
      var row = e.target.closest("[data-act]");
      if (!row) return;
      if (row.dataset.act === "theme") {
        var toggle = document.getElementById("themeToggle");
        if (toggle) toggle.click();
        syncThemeSwitch();
      } else if (row.dataset.act === "wish") { setProfile(false); Store.openWishlist(); }
      else if (row.dataset.act === "cart") { setProfile(false); Store.openCart(true); }
      else if (row.dataset.act === "account" || row.dataset.act === "orders") {
        setProfile(false); // real href now — navigates to the account page
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !profileSheet.hidden) setProfile(false); });

    bar.addEventListener("click", function (e) {
      var t = e.target.closest("[data-tab]");
      if (!t) return;
      if (t.dataset.tab === "wish") { Store.openWishlist(); }
      else if (t.dataset.tab === "cart") { Store.openCart(true); }
      else if (t.dataset.tab === "profile") { setProfile(true); }
      else if (t.dataset.tab === "search") { setSearchSheet(searchSheet.hidden); }
    });

    function refreshBadges() {
      var cartCount = read(KEY_CART).length, wishCount = getActiveWishlist().items.length;
      var cartBadge = bar.querySelector('[data-tab="cart"] .mobile-tab__badge'), wishBadge = bar.querySelector('[data-tab="wish"] .mobile-tab__badge');
      if (cartBadge) { cartBadge.textContent = cartCount; cartBadge.hidden = !cartCount; }
      if (wishBadge) { wishBadge.textContent = wishCount; wishBadge.hidden = !wishCount; }
    }
    refreshBadges();
    document.addEventListener("rk-store", refreshBadges);

    var shown = false;
    function onScroll() {
      var y = window.scrollY;
      var should = y > 4; // matches the top navbar's own hide threshold, so the bottom bar takes over right away
      if (should !== shown) { shown = should; bar.classList.toggle("is-visible", shown); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ---- burger button (far right) ---- */
  var burger = document.createElement("button");
  burger.type = "button";
  burger.className = "pill-btn pill-btn--burger";
  burger.setAttribute("aria-label", "Open menu");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-controls", "mobileMenu");
  burger.innerHTML = '<span class="burger-lines" aria-hidden="true"><i></i><i></i><i></i></span>';
  icons.appendChild(burger);

  /* ---- menu panel: built from the existing menu links + account/help/cart buttons ---- */
  var panel = document.createElement("div");
  panel.className = "mobile-menu";
  panel.id = "mobileMenu";
  panel.hidden = true;
  var html = '<ul class="mobile-menu__links">';
  if (navList) {
    navList.querySelectorAll("li > a").forEach(function (a) {
      var label = a.textContent.replace(/\s+/g, " ").trim();
      html += '<li><a href="' + (a.getAttribute("href") || "#") + '">' + label + '<span aria-hidden="true">→</span></a></li>';
    });
  }
  html += "</ul>";
  html += '<div class="mobile-menu__actions">';
  [["pill-btn--help", "WhatsApp"]].forEach(function (pair) {
    var src = icons.querySelector("." + pair[0]);
    if (!src) return;
    html += '<a href="#" class="mobile-menu__action">' + src.innerHTML + "<span>" + pair[1] + "</span></a>";
  });
  html += "</div>";
  panel.innerHTML = html;
  header.appendChild(panel);

  function setMenu(open) {
    panel.hidden = !open;
    header.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) setSearch(false);
  }
  burger.addEventListener("click", function (e) { e.stopPropagation(); setMenu(panel.hidden); });
  panel.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  /* ---- search: tap the icon to expand, blur / Escape / outside tap to collapse ---- */
  var mq = window.matchMedia("(max-width: 720px)");
  function setSearch(open) {
    header.classList.toggle("search-open", open);
    search.classList.toggle("open", open);
    if (input) { if (open) input.setAttribute("placeholder", "Search books, authors…"); else input.removeAttribute("placeholder"); }
  }
  var closeBtn = document.createElement("button");
  closeBtn.type = "button"; closeBtn.className = "search-close"; closeBtn.setAttribute("aria-label", "Cancel search");
  closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  search.appendChild(closeBtn);
  closeBtn.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); if (input) { input.value = ""; input.blur(); } setSearch(false); });
  search.addEventListener("click", function (e) {
    if (!mq.matches || search.classList.contains("open")) return;
    e.preventDefault();
    setMenu(false);
    setSearch(true);
    if (input) input.focus();
  });
  if (input) input.addEventListener("blur", function () { setTimeout(function () { if (!search.contains(document.activeElement)) setSearch(false); }, 150); });
  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) { setSearch(false); setMenu(false); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setSearch(false); setMenu(false); } });
  mq.addEventListener && mq.addEventListener("change", function (e) { if (!e.matches) { setSearch(false); setMenu(false); } });
})();
