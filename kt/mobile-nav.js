/* Phone navbar: search collapses to an icon and expands on tap; a burger menu holds the links and account icons. */
(function () {
  /* iOS Safari (iOS 15+) floats its address bar over the bottom of the page, and pages can't measure it.
     Flag it so bottom sheets keep their last rows above that bar. Not needed when saved to the home screen. */
  (function () {
    var ua = navigator.userAgent, iOS = /iP(hone|od|ad)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua); // Chrome/Firefox/Edge on iOS keep their bar at the bottom too, but outside the page
    if (iOS && !navigator.standalone && !window.matchMedia("(display-mode: standalone)").matches && safari) document.documentElement.classList.add("ios-safari");
  })();
  var header = document.getElementById("siteHeader");
  if (!header) return;
  var top = header.querySelector(".header-top");
  var icons = header.querySelector(".header-icons");
  var search = header.querySelector(".header-search");
  var input = document.getElementById("searchInput");
  var navList = header.querySelector(".header-nav-main ul");
  if (!top || !icons || !search) return;

  /* highlight the section you're in: the top-nav item for this page gets .is-current + aria-current="page" */
  (function () {
    if (!navList) return;
    var SECTION = { books: "All Books", categories: "All Books", collections: "All Books", authors: "Authors", ebooks: "E-Books", publications: "Publications", catalogues: "Catalogue", events: "Events" };
    var segs = location.pathname.split("/").filter(Boolean), label = null;
    for (var i = 0; i < segs.length && !label; i++) label = SECTION[segs[i]] || null;
    if (/\/books\/(checkout|order)\//.test(location.pathname)) label = null; // the cart flow isn't "All Books"
    if (!label) return;
    navList.querySelectorAll("li > a").forEach(function (a) {
      if (a.textContent.trim() === label) { a.classList.add("is-current"); a.setAttribute("aria-current", "page"); }
    });
  })();

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
  /* a small banner at the TOP of the screen (people missed it at the bottom), with an icon that fits the message */
  var TOAST_IC = {
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 3h2.2l2.4 11.2a2 2 0 0 0 2 1.6h8.700a2 2 0 0 0 1.950-1.550L21.500 7H5.600"/><circle cx="9.500" cy="20" r="1.400"/><circle cx="17.500" cy="20" r="1.400"/><path class="rk-toast__tick" d="m10.500 10.500 2 2 3.500-4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14c1.490-1.460 3-3.210 3-5.500A5.500 5.500 0 0 0 16.500 3c-1.760 0-3 .5-4.500 2-1.500-1.500-2.740-2-4.500-2A5.500 5.500 0 0 0 2 8.500c0 2.300 1.500 4.050 3 5.500l7 7Z"/></svg>',
    ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.500 3 3 5-6"/></svg>'
  };
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "rk-toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    var kind = /cart/i.test(msg) ? "cart" : /wish/i.test(msg) ? "heart" : "ok";
    toastEl.innerHTML = '<span class="rk-toast__ic rk-toast__ic--' + kind + '">' + TOAST_IC[kind] + "</span><span></span>";
    toastEl.lastChild.textContent = msg;
    toastEl.classList.remove("show"); void toastEl.offsetWidth; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
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
      document.querySelectorAll(".pill-btn--wish .pill-badge").forEach(function (b) { var n = getActiveWishlist().items.length; b.textContent = n; b.hidden = !n; b.parentNode.classList.toggle("has-items", !!n); });
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
  wishBtn.innerHTML = '<svg class="pill-ic pill-ic--heart" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
  badge(wishBtn);
  icons.insertBefore(wishBtn, cartBtn || icons.firstChild);
  var cartUrl = (function () {
    var s = document.querySelector('script[src*="mobile-nav.js"]');
    return s ? s.src.replace(/kt\/mobile-nav\.js.*$/, "books/cart.js?v=9") : null;
  })();
  Store.openCart = function (full) {
    if (window.RKCart) return window.RKCart.open(full);
    if (!cartUrl) return;
    var el = document.createElement("script"); el.src = cartUrl;
    el.onload = function () { if (window.RKCart) window.RKCart.open(full); };
    document.head.appendChild(el);
  };
  if (cartBtn) cartBtn.addEventListener("click", function () { Store.openCart(); });
  var wishUrl = cartUrl ? cartUrl.replace(/cart\.js.*$/, "wishlist.js?v=8") : null;
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
      '<a class="mobile-tab mobile-tab--home" href="' + ROOT + '" data-tab="home"><img class="mobile-tab__logo mobile-tab__logo--light" src="' + ROOT + 'kt/assets/logo/rkp-favicon.svg" alt="" width="20" height="20"><img class="mobile-tab__logo mobile-tab__logo--dark" src="' + ROOT + 'kt/assets/logo/rkp-favicon-dark.svg" alt="" width="20" height="20"><span>Home</span></a>' +
      '<button type="button" class="mobile-tab" data-tab="search" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4.5c1.6-1 3.4-1 5 0v11.5c-1.6-1-3.4-1-5 0V4.5z"/><path d="M12 4.5c1.6-1 3.4-1 5 0v11.5c-1.6-1-3.4-1-5 0V4.5z"/><path d="M7 4.5c1.6-1 3.4-1 5 0"/><circle cx="16.3" cy="15.3" r="3.3"/><path d="m18.7 17.7 2 2"/></svg><span>Explore</span></button>' +
      '<button type="button" class="mobile-tab" data-tab="profile"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg><span>Profile</span></button>' +
      '<button type="button" class="mobile-tab" data-tab="wish"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg><span class="mobile-tab__badge" hidden></span><span>Wishlist</span></button>' +
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
        '<h2 class="mobile-search-sheet__title">Explore</h2>' +
        /* a real search box: finds books by title or author as you type (books-data.js is loaded on demand) */
        /* results appear ABOVE the box, so the sheet stays where it is and the box stays under the thumb */
        '<div class="mobile-explore__res" id="mxRes" aria-live="polite" hidden></div>' +
        '<form class="mobile-explore__find" role="search" autocomplete="off"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
          '<input type="search" id="mxQ" placeholder="Search books or authors" aria-label="Search books or authors" enterkeyhint="search"><button type="button" class="mobile-explore__clear" id="mxClear" aria-label="Clear search" hidden>✕</button></form>' +
        '<p class="mobile-search-sheet__label">Browse</p><div class="mobile-search-sheet__grid">' +
        '<a class="mobile-search-sheet__row mobile-search-sheet__tile" href="' + ROOT + 'books/?g=all"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.500c2.400-1.400 5.200-1.400 7.500 0v14c-2.300-1.400-5.100-1.400-7.500 0zM19.500 5.500c-2.300-1.400-5.100-1.400-7.500 0v14c2.400-1.400 5.200-1.400 7.500 0z"/></svg></span><span>All Books</span></a>' +
        '<a class="mobile-search-sheet__row mobile-search-sheet__tile" href="' + ROOT + 'authors/"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span><span>Authors</span></a>' +
        '<a class="mobile-search-sheet__row mobile-search-sheet__tile" href="' + ROOT + 'ebooks/"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.500" width="12" height="19" rx="2.500"/><path d="M10 7h4M10 11h4M11 18h2"/></svg></span><span>E-Books</span></a>' +
        '<a class="mobile-search-sheet__row mobile-search-sheet__tile" href="' + ROOT + 'publications/"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6M2 21h20"/></svg></span><span>Publications</span></a>' +
        '<a class="mobile-search-sheet__row mobile-search-sheet__tile" href="' + ROOT + 'catalogues/"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg></span><span>Catalogue</span></a>' +
        '<a class="mobile-search-sheet__row mobile-search-sheet__tile" href="' + ROOT + 'events/"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.500" y="5" width="17" height="15" rx="2"/><path d="M3.500 10h17M8 3v4M16 3v4"/></svg></span><span>Events</span></a>' +
        '<button type="button" class="mobile-search-sheet__row mobile-search-sheet__tile" data-pop-act="cat"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.500"/><rect x="13" y="3" width="8" height="8" rx="1.500"/><rect x="3" y="13" width="8" height="8" rx="1.500"/><rect x="13" y="13" width="8" height="8" rx="1.500"/></svg></span><span>Categories</span></button>' +
        '<a class="mobile-search-sheet__row mobile-search-sheet__tile" href="' + ROOT + 'collections/"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="5" rx="1.500"/><rect x="4" y="12" width="16" height="8" rx="1.500"/></svg></span><span>Collections</span></a>' +
        '<a class="mobile-search-sheet__row mobile-search-sheet__tile" href="' + ROOT + 'offers/"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.500" cy="8.500" r="1.400"/></svg></span><span>Offers</span></a>' +
        '<a class="mobile-search-sheet__row mobile-search-sheet__tile" href="' + ROOT + '"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.500 12 4l9 7.500"/><path d="M5.500 10v10h13V10"/></svg></span><span>Home</span></a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(searchSheet);
    (function () {
      var q = searchSheet.querySelector("#mxQ"), res = searchSheet.querySelector("#mxRes"), clear = searchSheet.querySelector("#mxClear"), form = searchSheet.querySelector(".mobile-explore__find"), all = null, loading = false;
      function esc2(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
      function build() { var C = window.RK_COLLECTIONS || {}, seen = {}; all = []; Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { if (!seen[b[4]]) { seen[b[4]] = 1; all.push({ b: b, k: k, hay: (b[0] + " " + b[1]).toLowerCase() }); } }); }); }
      function ready(cb) {
        if (all) return cb();
        if (window.RK_COLLECTIONS) { build(); return cb(); }
        if (loading) return; loading = true;
        var sc = document.createElement("script"); sc.src = ROOT + "books/books-data.js?v=4"; sc.onload = function () { build(); cb(); }; document.head.appendChild(sc);
      }
      function show() {
        var v = q.value.trim().toLowerCase(); clear.hidden = !q.value;
        searchSheet.classList.toggle("is-searching", v.length >= 2);
        if (v.length < 2) { res.hidden = true; res.innerHTML = ""; return; }
        ready(function () {
          if (q.value.trim().toLowerCase() !== v) return;
          var hits = all.filter(function (x) { return x.hay.indexOf(v) > -1; });
          hits.sort(function (x, y) { return (x.b[0].toLowerCase().indexOf(v) === 0 ? 0 : 1) - (y.b[0].toLowerCase().indexOf(v) === 0 ? 0 : 1); });
          res.innerHTML = hits.length ? hits.slice(0, 6).map(function (x) {
            return '<a href="' + ROOT + "books/product/?id=" + encodeURIComponent(x.b[4]) + "&c=" + encodeURIComponent(x.k) + '"><img src="' + ROOT + "books/covers/" + esc2(x.b[4]) + '.jpg" alt="" width="34" height="50" loading="lazy" onerror="this.style.visibility=\'hidden\'"><span><b>' + esc2(x.b[0]) + "</b><i>" + esc2(x.b[1]) + "</i></span></a>";
          }).join("") + (hits.length > 6 ? '<p>' + (hits.length - 6) + " more — keep typing to narrow it down</p>" : "") : "<p>No book or author matches that.</p>";
          res.hidden = false;
        });
      }
      q.addEventListener("input", show);
      /* the sheet stays at the bottom; when the on-screen keyboard opens it is lifted just above it */
      var panel = searchSheet.querySelector(".mobile-search-sheet__sheet"), vv = window.visualViewport;
      function lift() {
        var kb = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
        panel.style.bottom = kb > 60 ? kb + "px" : "";
        panel.style.maxHeight = kb > 60 ? Math.max(200, vv.height - 10) + "px" : "";
        searchSheet.classList.toggle("is-kb", kb > 60);
      }
      if (vv) { vv.addEventListener("resize", lift); vv.addEventListener("scroll", lift); }
      q.addEventListener("focus", function () { searchSheet.classList.add("is-typing"); setTimeout(lift, 250); });
      q.addEventListener("blur", function () { setTimeout(function () { searchSheet.classList.remove("is-typing"); lift(); }, 150); });
      clear.addEventListener("click", function () { q.value = ""; show(); q.focus(); });
      form.addEventListener("submit", function (e) { e.preventDefault(); var first = res.querySelector("a"); if (first) location.href = first.href; });
      searchSheet.__reset = function () { q.value = ""; res.hidden = true; res.innerHTML = ""; clear.hidden = true; searchSheet.classList.remove("is-typing", "is-searching", "is-kb"); panel.style.bottom = ""; panel.style.maxHeight = ""; };
    })();
    /* a sheet taller than the screen (small phone / large text) shows a soft fade at the bottom until you reach the end */
    function sheetCue(panel) {
      if (!panel || panel.__cue) return; panel.__cue = true;
      function upd() { panel.classList.toggle("has-more", panel.scrollHeight - panel.clientHeight - panel.scrollTop > 6); }
      panel.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd);
      panel.__cueUpdate = upd;
    }
    function cueNow(panel) { if (panel && panel.__cueUpdate) requestAnimationFrame(panel.__cueUpdate); }
    function setSearchSheet(open) {
      searchSheet.hidden = !open;
      searchTab.setAttribute("aria-expanded", String(open));
      if (open) { requestAnimationFrame(function () { searchSheet.classList.add("is-open"); }); var ps = searchSheet.querySelector(".mobile-search-sheet__sheet"); sheetCue(ps); ps.scrollTop = 0; cueNow(ps); }
      else { searchSheet.classList.remove("is-open"); if (searchSheet.__reset) searchSheet.__reset(); }
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
        if (window.RKAllBooks) window.RKAllBooks.open(); else location.href = ROOT + "books/?g=all";
      } else if (act.dataset.popAct === "collections") {
        location.href = ROOT + "collections/";
      } else if (act.dataset.popAct === "publications") {
        location.href = ROOT + "publications/";
      } else if (act.dataset.popAct === "ebooks") {
        location.href = ROOT + "ebooks/";
      } else if (act.dataset.popAct === "authors") {
        location.href = ROOT + "authors/";
      } else if (act.dataset.popAct === "offers") {
        location.href = ROOT + "offers/";
      } else if (act.dataset.popAct === "all") {
        location.href = ROOT;
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
        '<a class="mobile-profile__row" href="' + ROOT + 'auth/login/" data-act="signin" data-when="out"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/></svg></span><span class="mobile-profile__label">Sign in<i>Track orders, wishlist & rewards</i></span></a>' +
        '<a class="mobile-profile__row" href="' + ROOT + 'auth/register/" data-act="register" data-when="out"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="8" r="4"/><path d="M2.5 20c1.4-3.8 4.4-6 7.5-6 1.4 0 2.8.4 4 1.2"/><path d="M19 15v6M16 18h6"/></svg></span><span class="mobile-profile__label">Create account</span></a>' +
        '<a class="mobile-profile__row" href="' + ROOT + 'account/" data-act="account" data-when="in"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg></span><span class="mobile-profile__label">My Account</span></a>' +
        '<a class="mobile-profile__row" href="' + ROOT + 'account/?tab=orders" data-act="orders" data-when="in"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5"/></svg></span><span class="mobile-profile__label">My Orders</span></a>' +
        '<button type="button" class="mobile-profile__row" data-act="wish" data-when="in"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></span><span class="mobile-profile__label">Wishlist</span></button>' +
        '<button type="button" class="mobile-profile__row" data-act="cart"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2l2.3 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6"/></svg></span><span class="mobile-profile__label">Cart</span></button>' +
        '<a class="mobile-profile__row" href="https://wa.me/" target="_blank" rel="noopener noreferrer" data-act="help"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.3 8.3 0 0 1-4-1L3 20l1.2-5.5a8.3 8.3 0 0 1-1.1-4.2A8.4 8.4 0 0 1 11.5 2 8.4 8.4 0 0 1 21 11.5Z"/></svg></span><span class="mobile-profile__label">Help via WhatsApp</span></a>' +
        /* Log out: always the last row; only shown when signed in */
        '<button type="button" class="mobile-profile__row mobile-profile__row--logout" data-act="logout" data-when="in"><span class="mobile-profile__ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg></span><span class="mobile-profile__label">Log out</span></button>' +
      '</div>';
    document.body.appendChild(profileSheet);

    function syncThemeSwitch() {
      var dark = document.documentElement.getAttribute("data-theme") !== "light";
      var val = profileSheet.querySelector("#mobileProfileThemeVal");
      if (val) { val.classList.toggle("is-dark", dark); val.setAttribute("aria-checked", String(dark)); }
    }
    /* signed out: hide My Account / My Orders / Wishlist and offer Sign in / Create account (same flag as the account page) */
    function syncSignedIn() {
      var on = true;
      try { var v = JSON.parse(localStorage.getItem("rk-signed-in") || "null"); on = v !== false; } catch (e) {}
      profileSheet.querySelectorAll("[data-when]").forEach(function (r) { r.hidden = (r.getAttribute("data-when") === "in") !== on; });
    }
    function setProfile(open) {
      profileSheet.hidden = !open;
      if (open) {
        syncSignedIn();
        syncThemeSwitch();
        requestAnimationFrame(function () { profileSheet.classList.add("is-open"); });
        var pp = profileSheet.querySelector(".mobile-profile__sheet"); sheetCue(pp); pp.scrollTop = 0; cueNow(pp);
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
      else if (row.dataset.act === "logout") {
        /* same flag the account page uses; if you're on the account page it reloads into its signed-out view */
        try { localStorage.setItem("rk-signed-in", "false"); } catch (err) {}
        setProfile(false);
        if (Store.toast) Store.toast("Logged out");
        document.dispatchEvent(new CustomEvent("rk-signed-out"));
        if (/\/account\/?(index\.html)?$/.test(location.pathname)) setTimeout(function () { location.reload(); }, 500);
      }
      else if (row.dataset.act === "cart") { setProfile(false); Store.openCart(true); }
      else if (row.dataset.act === "books" && window.RKAllBooks) { e.preventDefault(); setProfile(false); window.RKAllBooks.open(); }
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
  var ROOT_MENU = (function () { var sc = document.querySelector('script[src*="mobile-nav.js"]'); return sc ? sc.src.replace(/kt\/mobile-nav\.js.*$/, "") : "../"; })();
  var html = '<ul class="mobile-menu__links">';
  if (navList) {
    navList.querySelectorAll("li > a").forEach(function (a) {
      var label = a.textContent.replace(/\s+/g, " ").trim();
      var to = a.getAttribute("href") || "#";
      if (to === "#" && /^All Books/.test(label)) to = ROOT_MENU + "books/?g=all"; // the All Books menu trigger has no page of its own
      html += '<li><a href="' + to + '">' + label + '<span aria-hidden="true">→</span></a></li>';
    });
  }
  html += "</ul>";
  html += '<div class="mobile-menu__actions">';
  [["pill-btn--help", "WhatsApp"]].forEach(function (pair) {
    var src = icons.querySelector("." + pair[0]);
    if (!src) return;
    html += '<a href="https://wa.me/" target="_blank" rel="noopener noreferrer" class="mobile-menu__action">' + src.innerHTML + "<span>" + pair[1] + "</span></a>";
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

  /* ---- footer on phones: collapsed to logo + contact + Rajkamal's social links, with a "Show more" button that
     opens the whole footer and turns into "Show less" (styles: kt/styles.css; nothing changes on larger screens) ---- */
  (function () {
    var f = document.querySelector(".site-footer"), con = f && f.querySelector(".footer-connect"); if (!f || !con || f.querySelector(".footer-more")) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "footer-more"; b.setAttribute("aria-expanded", "false");
    b.innerHTML = '<span>Show more</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    con.parentNode.insertBefore(b, con.nextSibling);
    b.addEventListener("click", function () {
      var on = f.classList.toggle("is-more");
      b.setAttribute("aria-expanded", String(on)); b.querySelector("span").textContent = on ? "Show less" : "Show more";
      if (!on) b.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  })();
})();
