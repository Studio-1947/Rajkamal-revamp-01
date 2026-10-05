/* My Account: profile, orders, wishlist, saved addresses, gift cards, reward points, logout.
   Everything is stored locally (same localStorage keys as the cart/wishlist) — design preview only. */
(function () {
  var root = document.getElementById("acc");
  if (!root) return;

  var PKEY = "rk-profile",
    AKEY = "rk-addresses",
    OKEY = "rk-orders",
    GKEY = "rk-giftcards",
    RKEY = "rk-points",
    SKEY = "rk-signed-in";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>\"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmt(n) {
    return (
      "₹" +
      (Math.round(n * 100) / 100).toLocaleString("en-IN", {
        minimumFractionDigits: n % 1 ? 2 : 0,
        maximumFractionDigits: 2,
      })
    );
  }
  function mrp(price, disc) {
    return disc ? Math.round(price / (1 - disc / 100)) : price;
  }
  function read(k, d) {
    try {
      var v = JSON.parse(localStorage.getItem(k) || "null");
      return v == null ? d : v;
    } catch (e) {
      return d;
    }
  }
  function write(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }
  function load() {
    return window.RK_COLLECTIONS || {};
  }
  function allBooks() {
    var m = {},
      C = load();
    Object.keys(C).forEach(function (k) {
      (C[k].books || []).forEach(function (b) {
        m[b[4]] = b;
      });
    });
    return m;
  }

  /* ---------- seed data (first visit only) ---------- */
  if (read(SKEY, null) === null) write(SKEY, true);
  if (read(PKEY, null) === null)
    write(PKEY, {
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "98102 81912",
      dob: "1996-08-14",
      gender: "male",
      since: "March 2024",
      about:
        "Hindi literature lover — Premchand, Nirmal Verma and travelogues.",
    });
  if (read(AKEY, null) === null)
    write(AKEY, [
      {
        id: "a1",
        label: "Home",
        type: "home",
        name: "Aarav Sharma",
        phone: "98102 81912",
        default: true,
        line1: "B-14, Second Floor, Nizamuddin East",
        line2: "Near Humayun's Tomb",
        city: "New Delhi",
        state: "Delhi",
        pin: "110013",
      },
      {
        id: "a2",
        label: "Office",
        type: "office",
        name: "Aarav Sharma",
        phone: "98102 81912",
        default: false,
        line1: "3rd Floor, Tower B, Vatika Towers",
        line2: "Golf Course Road, Sector 54",
        city: "Gurugram",
        state: "Haryana",
        pin: "122003",
      },
    ]);
  if (read(GKEY, null) === null)
    write(GKEY, [
      {
        id: "g1",
        number: "RKPG-XXXX-8842-6107",
        balance: 500,
        initial: 500,
        expires: "2027-03-31",
        added: "2026-08-12",
      },
      {
        id: "g2",
        number: "RKPG-XXXX-3391-2754",
        balance: 120,
        initial: 200,
        expires: "2026-12-31",
        added: "2026-05-02",
      },
    ]);
  if (read(RKEY, null) === null) {
    var hist = [];
    var seedEvents = [
      ["Order #RK71829304 delivered", 120, "2026-09-18"],
      ["Order #RK71760112 delivered", 86, "2026-08-30"],
      ["Review written for 'Godaan'", 25, "2026-08-12"],
      ["Signed up — welcome bonus", 100, "2024-03-20"],
    ];
    var spend = 0;
    seedEvents.forEach(function (ev) {
      spend += ev[1];
      hist.push({ t: ev[0], pts: ev[1], d: ev[2] });
    });
    var used = 90;
    if (used)
      hist.push({
        t: "Redeemed ₹90 off on order #RK71500988",
        pts: -used,
        d: "2026-07-04",
      });
    write(RKEY, {
      points: spend - used,
      lifetime: spend,
      redeemed: used,
      history: hist,
    });
  }
  if (read(OKEY, null) === null) {
    var mk = function (id) {
      return "../books/covers/" + id + ".jpg";
    };
    var one = {
      id: "RK71829304",
      date: "2026-09-18",
      eta: "2026-09-24",
      total: 538.3,
      pay: "upi",
      status: "delivered",
      addr: "B-14, Second Floor, Nizamuddin East, New Delhi 110013",
      items: [
        { id: "godan", qty: 1, price: 269.1, disc: 10 },
        { id: "maila-anchal", qty: 1, price: 319.2, disc: 20 },
      ],
    };
    var two = {
      id: "RK71760112",
      date: "2026-08-30",
      eta: "2026-09-05",
      total: 239.2,
      pay: "cod",
      status: "delivered",
      addr: "3rd Floor, Tower B, Vatika Towers, Gurugram 122003",
      items: [
        { id: "nithalle-bahut-busy-hain", qty: 1, price: 239.2, disc: 20 },
      ],
    };
    [one, two].forEach(function (o) {
      o.items.forEach(function (it) {
        it.img = mk(it.id);
      });
    });
    write(OKEY, [one, two]);
  }

  /* ---------- store helpers ---------- */
  function profile() {
    return read(PKEY, {});
  }
  function addresses() {
    return read(AKEY, []);
  }
  function saveAddresses(a) {
    write(AKEY, a);
  }
  function giftcards() {
    return read(GKEY, []);
  }
  function rewards() {
    return read(RKEY, { points: 0, lifetime: 0, redeemed: 0, history: [] });
  }
  function orders() {
    // orders placed in this browser (from checkout) show first
    var stored = read(OKEY, []);
    return stored
      .filter(function (o) {
        return o.local;
      })
      .concat(
        stored.filter(function (o) {
          return !o.local;
        }),
      );
  }
  function signedIn() {
    return read(SKEY, true) === true;
  }

  function toast(msg) {
    var t = document.querySelector(".acc-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "acc-toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(t._h);
    t._h = setTimeout(function () {
      t.classList.remove("is-on");
    }, 2400);
  }

  function go(tab) {
    try {
      history.replaceState(null, "", location.pathname + "?tab=" + tab);
    } catch (e) {}
    render(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- icons ---------- */
  var I = {
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>',
    box: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="4"/><rect x="5" y="12" width="14" height="9"/><path d="M12 8v13"/><path d="M12 8c-2 0-4.5-.6-4.5-2.7C7.5 3.5 9 3 10 3c1.6 0 2 2.3 2 5z"/><path d="M12 8c2 0 4.5-.6 4.5-2.7C16.5 3.5 15 3 14 3c-1.6 0-2 2.3-2 5z"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z"/></svg>',
    out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
    trash:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  };

  /* ---------- section renderers ---------- */
  function sideNav(active) {
    var store = window.RKStore,
      wishCount = 0;
    if (store) wishCount = store.wish().length;
    var oCount = orders().length;
    var items = [
      ["profile", "My Profile", I.user, 0],
      ["orders", "Orders", I.box, oCount],
      ["wishlist", "Wishlist", I.heart, wishCount],
      ["address", "Saved Address", I.pin, addresses().length],
      ["giftcard", "Gift Card", I.gift, giftcards().length],
      ["rewards", "Reward Points", I.star, 0],
    ];
    var h =
      "<ul>" +
      items
        .map(function (it) {
          return (
            '<li><button type="button" class="acc-nav' +
            (active === it[0] ? " is-on" : "") +
            '" data-tab="' +
            it[0] +
            '">' +
            it[2] +
            "<span>" +
            it[1] +
            "</span>" +
            (it[3] ? '<span class="acc-nav__count">' + it[3] + "</span>" : "") +
            "</button></li>"
          );
        })
        .join("");
    h += '<li class="acc-sep" role="separator"></li>';
    h +=
      '<li><button type="button" class="acc-nav acc-nav--logout" data-act="logout">' +
      I.out +
      "<span>Logout</span></button></li>";
    h +=
      '<li class="acc-side__member">Member since ' +
      esc(profile().since || "2024") +
      "</li>";
    h += "</ul>";
    return h;
  }

  function empty(ic, title, text, cta, act) {
    return (
      '<div class="acc-empty"><span class="ic">' +
      ic +
      "</span><h3>" +
      title +
      "</h3><p>" +
      text +
      "</p>" +
      (cta
        ? '<a class="acc-btn acc-btn--primary" href="' +
          act +
          '">' +
          cta +
          "</a>"
        : "") +
      "</div>"
    );
  }

  function bookImg(id, cls, w, h) {
    return (
      '<img src="../books/covers/' +
      esc(id) +
      '.jpg" alt="" width="' +
      w +
      '" height="' +
      h +
      '" loading="lazy" onerror="this.style.visibility=\'hidden\'">'
    );
  }

  function secProfile() {
    var p = profile(),
      r = rewards();
    var ordersCount = read(OKEY, []).length;
    return (
      '<section class="acc-card"><h2>Personal information</h2>' +
      '<form id="accProfileForm" novalidate><div class="acc-fields">' +
      '<label>Full name<input name="name" value="' +
      esc(p.name) +
      '" required autocomplete="name"></label>' +
      '<label>Email address<input name="email" type="email" value="' +
      esc(p.email) +
      '" required autocomplete="email"></label>' +
      '<label>Mobile number<input name="phone" value="' +
      esc(p.phone) +
      '" inputmode="tel" autocomplete="tel"></label>' +
      '<label>Full name<input name="name" value="' +
      esc(p.name) +
      '" required autocomplete="name" data-rule="name" placeholder="Enter your full name"></label>' +
      '<label>Email address<input name="email" type="email" value="' +
      esc(p.email) +
      '" required autocomplete="email" placeholder="name@example.com"></label>' +
      '<label>Mobile number<input name="phone" value="' +
      esc(p.phone) +
      '" inputmode="tel" autocomplete="tel" data-rule="phone" placeholder="Enter 10-digit mobile number"></label>' +
      '<label>Date of birth<input name="dob" type="date" value="' +
      esc(p.dob) +
      '"></label>' +
      '<label>Gender<select name="gender">' +
      '<option value="female"' +
      (p.gender === "female" ? " selected" : "") +
      ">Female</option>" +
      '<option value="male"' +
      (p.gender === "male" ? " selected" : "") +
      ">Male</option>" +
      '<option value="other"' +
      (p.gender === "other" ? " selected" : "") +
      ">Other</option>" +
      '<option value="na"' +
      (p.gender === "na" ? " selected" : "") +
      ">Prefer not to say</option></select></label>" +
      '<label>About you<input name="about" value="' +
      esc(p.about) +
      '" placeholder="Favourite genres, authors…"></label>' +
      '</div><div class="acc-form-foot"><button type="submit" class="acc-btn acc-btn--primary">Save changes</button>' +
      '<button type="button" class="acc-btn acc-btn--ghost" data-act="reset-profile">Reset</button>' +
      '<span class="acc-note" style="margin:0">Demo profile — saved only in this browser.</span></div></form></section>' +
      '<section class="acc-card"><h2>Account overview</h2><div class="acc-stats">' +
      '<div class="acc-stat"><b>' +
      ordersCount +
      "</b><span>" +
      (ordersCount === 1 ? "Order" : "Orders") +
      " placed</span></div>" +
      '<div class="acc-stat"><b>' +
      r.points +
      "</b><span>Reward points</span></div>" +
      '<div class="acc-stat"><b>' +
      addresses().length +
      "</b><span>Saved " +
      (addresses().length === 1 ? "address" : "addresses") +
      "</span></div>" +
      "</div></section>"
    );
  }

  function orderCard(o) {
    var PAY = {
      upi: "UPI",
      card: "Credit / Debit Card",
      cod: "Cash on Delivery",
    };
    var delivered = o.status === "delivered";
    var items = (o.items || [])
      .map(function (it) {
        var b = allBooks()[it.id],
          t = b ? b[0] : it.title || it.id;
        var a = b ? b[1] : "";
        return (
          '<div class="acc-oi">' +
          (it.img
            ? '<img src="' +
              esc(it.img) +
              '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">'
            : bookImg(it.id, "", 44, 66)) +
          '<div><div class="acc-oi__t">' +
          esc(t) +
          '</div><div class="acc-oi__m">' +
          esc(a) +
          (a ? " · " : "") +
          "Qty " +
          it.qty +
          "</div></div></div>"
        );
      })
      .join("");
    return (
      '<article class="acc-order">' +
      '<div class="acc-order__top">' +
      "<div><span>Order ID</span><b>" +
      esc(o.id) +
      "</b></div>" +
      "<div><span>Placed on</span><b>" +
      fmtDate(o.date) +
      "</b></div>" +
      "<div><span>Payment</span><b>" +
      (PAY[o.pay] || esc(o.pay || "UPI")) +
      "</b></div>" +
      '<span class="acc-chip' +
      (delivered ? " acc-chip--done" : " acc-chip--transit") +
      '">' +
      (delivered ? "Delivered" : "In transit") +
      "</span>" +
      "</div>" +
      '<div class="acc-order__items">' +
      items +
      "</div>" +
      '<div class="acc-order__foot"><span class="acc-order__total">Total <b>' +
      fmt(o.total) +
      "</b></span>" +
      '<a class="acc-btn acc-btn--ghost" href="../books/order/?id=' +
      encodeURIComponent(o.id) +
      '">View details</a>' +
      '<button type="button" class="acc-btn acc-btn--primary" data-reorder="' +
      esc(o.id) +
      '">Buy again</button></div>' +
      "</article>"
    );
  }
  function fmtDate(iso) {
    var d = iso ? new Date(iso + "T00:00:00") : new Date();
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function secOrders() {
    var list = orders();
    if (!list.length)
      return empty(
        I.box,
        "No orders yet",
        "Books you order will show up here.",
        "Browse books",
        "../books/",
      );
    return (
      '<p class="acc-sub">Deliveries, invoices and re-orders — demo data saved in this browser.</p>' +
      list.map(orderCard).join("")
    );
  }

  function secWishlist() {
    var S = window.RKStore,
      all = allBooks();
    if (!S)
      return empty(
        I.heart,
        "Wishlist unavailable",
        "Reload the page to load your wishlist.",
      );
    var lists = S.wishlists(),
      activeId = S.activeWishlistId(),
      w = S.wish().filter(function (id) {
        return all[id];
      });
    var head =
      lists.length > 1
        ? '<div class="acc-wl">' +
          lists
            .map(function (l) {
              return (
                '<button type="button" class="acc-wl__chip' +
                (l.id === activeId ? " is-on" : "") +
                '" data-wl="' +
                l.id +
                '">' +
                esc(l.name) +
                "<span>" +
                l.count +
                "</span></button>"
              );
            })
            .join("") +
          "</div>"
        : "";
    if (!w.length)
      return (
        head +
        empty(
          I.heart,
          "Your wishlist is empty",
          "Tap the heart on any book to save it here.",
          "Browse books",
          "../books/",
        )
      );
    var total = 0;
    var cards = w
      .map(function (id) {
        var b = all[id];
        total += b[2];
        return (
          '<article class="acc-book">' +
          '<a href="../books/product/?id=' +
          encodeURIComponent(id) +
          '">' +
          bookImg(id, "", 56, 84) +
          "</a>" +
          '<div class="acc-book__t"><a href="../books/product/?id=' +
          encodeURIComponent(id) +
          '">' +
          esc(b[0]) +
          "</a>" +
          '<div class="acc-book__a">' +
          esc(b[1]) +
          "</div>" +
          '<div class="acc-book__p"><strong>' +
          fmt(b[2]) +
          "</strong>" +
          (b[3] ? "<s>" + fmt(mrp(b[2], b[3])) + "</s>" : "") +
          "</div>" +
          '<div class="acc-book__acts"><button type="button" class="acc-btn acc-btn--primary" data-move="' +
          esc(id) +
          '">Move to cart</button>' +
          '<button type="button" class="acc-btn acc-btn--ghost" data-unwish="' +
          esc(id) +
          '">Remove</button></div>' +
          "</div></article>"
        );
      })
      .join("");
    return (
      head +
      '<section class="acc-card"><h2>' +
      esc(S.wishName()) +
      " <small>" +
      w.length +
      (w.length === 1 ? " book" : " books") +
      " · worth " +
      fmt(total) +
      "</small></h2>" +
      '<div class="acc-books">' +
      cards +
      "</div>" +
      '<div class="acc-form-foot"><button type="button" class="acc-btn acc-btn--primary" data-moveall>Move all to cart</button></div></section>'
    );
  }

  function addrCard(a) {
    return (
      '<div class="acc-addr' +
      (a.default ? " is-default" : "") +
      '" data-addr="' +
      esc(a.id) +
      '">' +
      '<div class="acc-addr__top"><h3>' +
      esc(a.label) +
      "</h3>" +
      (a.default ? '<span class="acc-tag">Default</span>' : "") +
      "</div>" +
      "<p>" +
      esc([a.line1, a.line2].filter(Boolean).join(", ")) +
      "</p>" +
      "<p>" +
      esc([a.city, a.state, a.pin].filter(Boolean).join(", ")) +
      "</p>" +
      '<div class="acc-addr__phone">' +
      esc(a.name) +
      " · " +
      esc(a.phone) +
      "</div>" +
      '<div class="acc-addr__acts"><button type="button" class="acc-link" data-edit="' +
      esc(a.id) +
      '">Edit</button>' +
      (a.default
        ? ""
        : '<button type="button" class="acc-link" data-mkdef="' +
          esc(a.id) +
          '">Set as default</button>') +
      '<button type="button" class="acc-link acc-link--danger" data-del="' +
      esc(a.id) +
      '">Delete</button></div>' +
      "</div>"
    );
  }

  function secAddress() {
    var list = addresses();
    return (
      (list.length
        ? '<div class="acc-addr-grid">' + list.map(addrCard).join("") + "</div>"
        : empty(
            I.pin,
            "No saved addresses",
            "Add one to check out faster next time.",
          )) +
      '<div class="acc-form-foot"><button type="button" class="acc-btn acc-btn--primary" data-act="add-addr">+ Add new address</button></div>'
    );
  }

  function secGiftcard() {
    var gcs = giftcards(),
      sum = 0,
      soon = null;
    gcs.forEach(function (g) {
      sum += g.balance;
      var exp = g.expires ? new Date(g.expires) : null;
      if (exp && (!soon || exp < soon)) soon = exp;
    });
    return (
      '<a class="acc-gc-buy" href="../gift-cards/">Buy a gift card <span aria-hidden="true">→</span></a>' +
      (gcs.length
        ? '<section class="acc-card"><h2>Your gift cards</h2><div class="acc-gc">' +
          gcs
            .map(function (g) {
              return (
                '<div class="acc-gift"><h3>Rajkamal Gift Card</h3><div class="acc-gift__no">' +
                esc(g.number) +
                "</div>" +
                '<div class="acc-gift__row"><b>' +
                fmt(g.balance) +
                "</b><span>available of " +
                fmt(g.initial) +
                "</span></div>" +
                (g.expires
                  ? '<p class="acc-gift__exp">Valid till ' +
                    fmtDate(g.expires) +
                    "</p>"
                  : "") +
                "</div>"
              );
            })
            .join("") +
          "</div></section>"
        : empty(
            I.gift,
            "No gift cards yet",
            "Gift cards you buy or receive will appear here.",
          )) +
      '<section class="acc-card"><h2>Gift card summary</h2><div class="acc-gc-stats">' +
      '<div class="acc-stat"><span>Total balance</span><b>' +
      fmt(sum) +
      "</b></div>" +
      '<div class="acc-stat"><span>Cards</span><b>' +
      gcs.length +
      "</b></div>" +
      (soon
        ? '<div class="acc-stat"><span>Nearest expiry</span><b>' +
          fmtDate(soon.toISOString().slice(0, 10)) +
          "</b></div>"
        : "") +
      "</div></section>" +
      '<section class="acc-card"><h2>Add a gift card</h2>' +
      '<form id="accGcForm" novalidate><div class="acc-fields">' +
      '<label class="acc-span2">Gift card number<input name="gcnum" placeholder="RKPG-XXXX-XXXX-XXXX" required inputmode="numeric"></label>' +
      '<label>Pin / code<input name="gcpin" placeholder="6-digit PIN" inputmode="numeric"></label>' +
      '</div><div class="acc-form-foot"><button type="submit" class="acc-btn acc-btn--primary">Add to account</button>' +
      '<span class="acc-note" style="margin:0">Design preview — cards are saved locally, nothing is validated with a store.</span></div></form></section>'
    );
  }

  function secRewards() {
    var r = rewards(),
      tierAt = 500,
      pct = Math.max(0, Math.min(100, Math.round((r.points / tierAt) * 100)));
    var next = tierAt - r.points;
    return (
      '<section class="acc-card" style="padding:0;border:0;background:none;box-shadow:none"><div class="acc-rew-hero">' +
      '<div class="acc-rew-hero__txt"><b>' +
      r.points +
      "</b><span>Reward points balance</span></div>" +
      '<button type="button" class="acc-btn" data-act="redeem">Redeem</button>' +
      '<div class="acc-rew-hero__progress"><i style="width:' +
      pct +
      '%"></i></div>' +
      '<span class="acc-rew-hero__bar">' +
      (next > 0
        ? next + " more points to unlock a ₹100 voucher"
        : "You have unlocked the ₹100 voucher — redeem it on checkout!") +
      "</span>" +
      "</div></section>" +
      '<section class="acc-card"><h2>How you earned</h2><ul class="acc-rewards-list">' +
      r.history
        .map(function (h) {
          return (
            '<li><span class="ic">' +
            (h.pts >= 0 ? I.star : I.tag) +
            "</span><div><b>" +
            esc(h.t) +
            "</b><p>" +
            fmtDate(h.d) +
            "</p></div>" +
            '<span class="pts">' +
            (h.pts >= 0 ? "+" : "") +
            h.pts +
            " pts</span></li>"
          );
        })
        .join("") +
      "</ul></section>" +
      '<section class="acc-card"><h2>Good to know</h2><ul class="acc-rewards-list">' +
      '<li><span class="ic">' +
      I.star +
      "</span><div><b>Earn 2 points per ₹10</b><p>On every order, automatically after delivery.</p></div></li>" +
      '<li><span class="ic">' +
      I.tag +
      "</span><div><b>100 points = ₹100 off</b><p>Apply points at checkout, minimum order ₹300.</p></div></li>" +
      '<li><span class="ic">' +
      I.gift +
      "</span><div><b>Points never expire</b><p>As long as your account stays active.</p></div></li>" +
      "</ul></section>"
    );
  }

  function secLogout() {
    return (
      '<section class="acc-card"><div class="acc-signin" style="padding:14px 0 6px">' +
      '<span class="acc-avatar">' +
      I.user +
      "</span><h2>See you soon, " +
      esc((profile().name || "Reader").split(" ")[0]) +
      "</h2>" +
      "<p>Signing out only clears the demo sign-in flag in this browser — your cart, wishlist and account data stay saved.</p>" +
      '<button type="button" class="acc-btn acc-btn--primary" data-act="logout-confirm">Logout</button>' +
      '<button type="button" class="acc-btn acc-btn--ghost" data-act="back-profile">Stay signed in</button></div></section>'
    );
    return (
      '<section class="acc-card"><div class="acc-signin" style="padding:24px 16px 18px">' +
      '<span class="acc-avatar">' +
      I.out +
      "</span><h2>See you soon, " +
      esc((profile().name || "Reader").split(" ")[0]) +
      "</h2>" +
      "<p>Signing out clears your demo sign-in flag in this browser — your cart, wishlist and account data stay saved.</p>" +
      '<div class="acc-logout-actions">' +
      '<button type="button" class="acc-btn acc-btn--primary" data-act="logout-confirm">Log out</button>' +
      '<button type="button" class="acc-btn acc-btn--ghost" data-act="back-profile">Stay signed in</button>' +
      "</div></div></section>"
    );
  }

  /* ---------- logout confirmation modal popup ---------- */
  function openLogoutModal() {
    var p = profile();
    var m = document.createElement("div");
    m.className = "acc-modal";
    m.innerHTML =
      '<div class="acc-modal__scrim" data-x></div>' +
      '<div class="acc-modal__box acc-modal__box--confirm" role="dialog" aria-modal="true" aria-label="Confirm Logout">' +
      '<button type="button" class="acc-modal__x" data-x aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<div class="acc-logout-modal__content">' +
      '<span class="acc-logout-modal__ic">' +
      I.out +
      "</span>" +
      "<h2>Log out of your account?</h2>" +
      "<p>See you soon, " +
      esc((p.name || "Reader").split(" ")[0]) +
      ". Your cart, wishlist, and saved addresses will remain saved on this device.</p>" +
      '<div class="acc-logout-actions">' +
      '<button type="button" class="acc-btn acc-btn--primary" data-act="confirm-logout-now">Log out</button>' +
      '<button type="button" class="acc-btn acc-btn--ghost" data-x>Stay signed in</button>' +
      "</div>" +
      "</div>" +
      "</div>";
    function close() {
      m.remove();
    }
    m.addEventListener("click", function (e) {
      if (e.target.closest("[data-x]")) close();
      if (e.target.closest('[data-act="confirm-logout-now"]')) {
        close();
        write(SKEY, false);
        toast("Logged out");
        renderSignedOut();
      }
    });
    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", escHandler);
      }
    });
    document.body.appendChild(m);
  }

  var TITLES = {
    profile: "My Profile",
    orders: "Orders",
    wishlist: "Wishlist",
    address: "Saved Address",
    giftcard: "Gift Card",
    rewards: "Reward Points",
  };

  /* ---------- address modal ---------- */
  function openAddrModal(a) {
    var isNew = !a;
    var m = document.createElement("div");
    m.className = "acc-modal";
    m.innerHTML =
      '<div class="acc-modal__scrim" data-x></div><div class="acc-modal__box" role="dialog" aria-modal="true" aria-label="Address">' +
      '<div class="acc-modal__head"><h2>' +
      (isNew ? "Add new address" : "Edit address") +
      "</h2>" +
      '<button type="button" class="acc-modal__x" data-x aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<form id="accAddrForm" novalidate><div class="acc-fields">' +
      '<div class="acc-span2 acc-field">Save as<div class="acc-types">' +
      ["home", "office", "other"]
        .map(function (t) {
          return (
            '<label><input type="radio" name="type" value="' +
            t +
            '"' +
            (a && a.type === t ? " checked" : "") +
            "><span>" +
            t.charAt(0).toUpperCase() +
            t.slice(1) +
            "</span></label>"
          );
        })
        .join("") +
      "</div></div>" +
      '<label>Full name<input name="name" value="' +
      esc(a && a.name) +
      '" required autocomplete="name"></label>' +
      '<label>Phone<input name="phone" value="' +
      esc(a && a.phone) +
      '" inputmode="tel" required autocomplete="tel"></label>' +
      '<label>Full name<input name="name" value="' +
      esc(a && a.name) +
      '" required autocomplete="name" data-rule="name" placeholder="Enter full name"></label>' +
      '<label>Phone<input name="phone" value="' +
      esc(a && a.phone) +
      '" inputmode="tel" required autocomplete="tel" data-rule="phone" placeholder="10-digit mobile number"></label>' +
      '<label class="acc-span2">Address<input name="line1" value="' +
      esc(a && a.line1) +
      '" required autocomplete="address-line1" placeholder="House no., street, area"></label>' +
      '<label class="acc-span2">Landmark (optional)<input name="line2" value="' +
      esc(a && a.line2) +
      '" autocomplete="address-line2"></label>' +
      '<label>City<input name="city" value="' +
      esc(a && a.city) +
      '" required autocomplete="address-level2"></label>' +
      '<label>State<input name="state" value="' +
      esc(a && a.state) +
      '" required autocomplete="address-level1"></label>' +
      '<label>Pincode<input name="pin" value="' +
      esc(a && a.pin) +
      '" required inputmode="numeric" pattern="[0-9]{6}" autocomplete="postal-code" placeholder="6-digit PIN"></label>' +
      '<label class="acc-span2">Landmark (optional)<input name="line2" value="' +
      esc(a && a.line2) +
      '" autocomplete="address-line2" placeholder="Nearby landmark"></label>' +
      '<label>City<input name="city" value="' +
      esc(a && a.city) +
      '" required autocomplete="address-level2" data-rule="name" placeholder="City"></label>' +
      '<label>State<input name="state" value="' +
      esc(a && a.state) +
      '" required autocomplete="address-level1" data-rule="name" placeholder="State"></label>' +
      '<label>Pincode<input name="pin" value="' +
      esc(a && a.pin) +
      '" required inputmode="numeric" pattern="[0-9]{6}" autocomplete="postal-code" data-rule="digits" placeholder="6-digit PIN"></label>' +
      '<label class="acc-span2 acc-check"><input type="checkbox" name="def"' +
      (a && a.default ? " checked" : "") +
      "><span>Set as default address</span></label>" +
      '</div><div class="acc-form-foot"><button type="submit" class="acc-btn acc-btn--primary">' +
      (isNew ? "Save address" : "Update address") +
      "</button></div></form></div>";

    function close() {
      m.remove();
    }
    m.addEventListener("click", function (e) {
      if (e.target.closest("[data-x]")) close();
    });
    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", escHandler);
      }
    });
    m.querySelector("#accAddrForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target;
      if (!f.reportValidity()) return;
      var fd = new FormData(f),
        list = addresses();
      var rec = {
        id: isNew ? "a" + Date.now() : a.id,
        label:
          (fd.get("type") || "other").charAt(0).toUpperCase() +
          (fd.get("type") || "other").slice(1),
        type: fd.get("type") || "other",
        name: fd.get("name"),
        phone: fd.get("phone"),
        line1: fd.get("line1"),
        line2: fd.get("line2"),
        city: fd.get("city"),
        state: fd.get("state"),
        pin: fd.get("pin"),
        default: !!fd.get("def"),
      };
      if (rec.default)
        list.forEach(function (x) {
          x.default = false;
        });
      if (isNew) list.push(rec);
      else
        list = list.map(function (x) {
          return x.id === rec.id ? rec : x;
        });
      if (
        !list.some(function (x) {
          return x.default;
        }) &&
        list.length
      )
        list[0].default = true;
      saveAddresses(list);
      close();
      toast(isNew ? "Address saved" : "Address updated");
      go("address");
    });
    document.body.appendChild(m);
  }

  /* ---------- top-level render ---------- */
  function render(tab) {
    if (!signedIn()) {
      renderSignedOut();
      return;
    }
    tab = tab === "logout" || TITLES[tab] ? tab : "profile";
    var p = profile();
    root.innerHTML =
      '<div class="acc-head' +
      '">' +
      '<span class="acc-avatar">' +
      I.user +
      "</span>" +
      '<div class="acc-hello"><h1>Hello, ' +
      esc((p.name || "Reader").split(" ")[0]) +
      "</h1>" +
      "<p>" +
      esc(p.email || "") +
      (p.phone ? " · " + esc(p.phone) : "") +
      "</p></div>" +
      "</div>" +
      '<div class="acc-grid"><aside class="acc-side" aria-label="Account sections">' +
      sideNav(tab) +
      "</aside>" +
      '<div class="acc-panel" id="accPanel">' +
      {
        profile: secProfile,
        orders: secOrders,
        wishlist: secWishlist,
        address: secAddress,
        giftcard: secGiftcard,
        rewards: secRewards,
        logout: secLogout,
      }[tab]() +
      "</div></div>";
    wire(tab);
  }

  function renderSignedOut() {
    /* signed out: no account sections at all — just a way in */
    root.innerHTML =
      '<div class="acc-out">' +
      '<section class="acc-card acc-out__card"><div class="acc-signin">' +
      '<span class="acc-avatar">' +
      I.user +
      "</span>" +
      "<h1>You are signed out</h1>" +
      "<p>Sign in to see your profile, orders, wishlist, saved addresses, gift cards and reward points.</p>" +
      '<div class="acc-out__actions">' +
      '<button type="button" class="acc-btn acc-btn--primary" data-act="signin">Sign in</button>' +
      '<a class="acc-btn acc-btn--ghost" href="../auth/register/?next=' +
      encodeURIComponent("../../account/") +
      '">Create account</a>' +
      "</div>" +
      '<ul class="acc-perks"><li>Track orders</li><li>Synced wishlist</li><li>Reward points</li><li>Saved addresses</li></ul>' +
      "</div></section>" +
      "</div>";
    wire("signedout");
  }

  /* ---------- events ---------- */
  function wire(tab) {
    root.querySelectorAll("[data-tab]").forEach(function (b) {
      b.addEventListener("click", function () {
        go(b.getAttribute("data-tab"));
      });
    });

    if (tab === "profile") {
      var pf = document.getElementById("accProfileForm");
      if (pf)
        pf.addEventListener("submit", function (e) {
          e.preventDefault();
          if (!e.target.reportValidity()) return;
          var fd = new FormData(e.target),
            p = profile();
          ["name", "email", "phone", "dob", "gender", "about"].forEach(
            function (k) {
              p[k] = fd.get(k) || "";
            },
          );
          write(PKEY, p);
          toast("Profile saved");
          render("profile");
        });
    }

    if (tab === "orders") {
      root.querySelectorAll("[data-reorder]").forEach(function (b) {
        b.addEventListener("click", function () {
          var o = orders().filter(function (x) {
            return x.id === b.getAttribute("data-reorder");
          })[0];
          if (!o || !window.RKStore) return;
          var n = 0;
          o.items.forEach(function (it) {
            for (var i = 0; i < (it.qty || 1); i++) {
              window.RKStore.addToCart(it.id);
              n++;
            }
          });
          toast(
            "Added " + n + (n === 1 ? " book" : " books") + " to your cart",
          );
        });
      });
    }

    if (tab === "wishlist") {
      var S = window.RKStore;
      root.querySelectorAll("[data-wl]").forEach(function (c) {
        c.addEventListener("click", function () {
          S.setActiveWishlist(c.getAttribute("data-wl"));
          render("wishlist");
        });
      });
      root.querySelectorAll("[data-move]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-move");
          S.addToCart(id);
          S.toggleWish(id);
          toast("Moved to cart");
          render("wishlist");
        });
      });
      root.querySelectorAll("[data-unwish]").forEach(function (b) {
        b.addEventListener("click", function () {
          S.toggleWish(b.getAttribute("data-unwish"));
          render("wishlist");
        });
      });
      var ma = root.querySelector("[data-moveall]");
      if (ma)
        ma.addEventListener("click", function () {
          var all = allBooks();
          S.wish().forEach(function (id) {
            if (all[id]) S.addToCart(id);
          });
          S.wish()
            .slice()
            .forEach(function (id) {
              S.toggleWish(id);
            });
          toast("Wishlist moved to cart");
          render("wishlist");
        });
      document.addEventListener("rk-store", onStore);
    } else {
      document.removeEventListener("rk-store", onStore);
    }

    if (tab === "address") {
      var add = root.querySelector("[data-act='add-addr']");
      if (add)
        add.addEventListener("click", function () {
          openAddrModal(null);
        });
      root.querySelectorAll("[data-edit]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = addresses().filter(function (x) {
            return x.id === b.getAttribute("data-edit");
          })[0];
          openAddrModal(a);
        });
      });
      root.querySelectorAll("[data-mkdef]").forEach(function (b) {
        b.addEventListener("click", function () {
          var list = addresses();
          list.forEach(function (x) {
            x.default = x.id === b.getAttribute("data-mkdef");
          });
          saveAddresses(list);
          toast("Default address updated");
          render("address");
        });
      });
      root.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          var list = addresses().filter(function (x) {
            return x.id !== b.getAttribute("data-del");
          });
          saveAddresses(list);
          toast("Address deleted");
          render("address");
        });
      });
    }

    if (tab === "giftcard") {
      var gf = document.getElementById("accGcForm");
      if (gf)
        gf.addEventListener("submit", function (e) {
          e.preventDefault();
          var f = e.target;
          if (!f.reportValidity()) return;
          var num = (f.gcnum.value || "").trim();
          if (!/^RKPG-/i.test(num)) {
            toast("Gift card numbers start with RKPG-");
            return;
          }
          var gcs = giftcards();
          gcs.push({
            id: "g" + Date.now(),
            number: num.toUpperCase(),
            balance: 0,
            initial: 0,
            expires: "",
            added: new Date().toISOString().slice(0, 10),
          });
          write(GKEY, gcs);
          toast("Gift card added");
          render("giftcard");
        });
    }

    if (tab === "rewards") {
      var rd = root.querySelector("[data-act='redeem']");
      if (rd)
        rd.addEventListener("click", function () {
          var r = rewards();
          if (r.points < 100) {
            toast("You need at least 100 points to redeem");
            return;
          }
          r.points -= 100;
          r.redeemed += 100;
          r.history.unshift({
            t: "Redeemed ₹100 voucher",
            pts: -100,
            d: new Date().toISOString().slice(0, 10),
          });
          write(RKEY, r);
          toast("₹100 voucher unlocked — apply it at checkout");
          render("rewards");
        });
    }

    root.querySelectorAll("[data-act]").forEach(function (b) {
      var act = b.getAttribute("data-act");
      if (act === "logout")
        b.addEventListener("click", function () {
          go("logout");
        });
      if (act === "logout")
        b.addEventListener("click", function (e) {
          e.preventDefault();
          openLogoutModal();
        });
      if (act === "reset-profile")
        b.addEventListener("click", function () {
          localStorage.removeItem(PKEY);
          seedProfile();
          toast("Profile reset to demo data");
          render("profile");
        });
      if (act === "add-addr")
        b.addEventListener("click", function () {
          openAddrModal(null);
        });
      if (act === "back-profile")
        b.addEventListener("click", function () {
          go("profile");
        });
      if (act === "logout-confirm")
        b.addEventListener("click", function () {
          write(SKEY, false);
          toast("Logged out");
          renderSignedOut();
        });
      if (act === "signin")
        b.addEventListener("click", function () {
          location.href =
            "../auth/login/?next=" + encodeURIComponent("../../account/"); // the sign-in page sets rk-signed-in and comes back here
        });
    });
  }

  function seedProfile() {
    write(PKEY, {
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "98102 81912",
      dob: "1996-08-14",
      gender: "male",
      since: "March 2024",
      about:
        "Hindi literature lover — Premchand, Nirmal Verma and travelogues.",
    });
  }

  var onStore = function () {
    if (current === "wishlist") render("wishlist");
  };

  var current = (function () {
    var q = new URLSearchParams(location.search).get("tab");
    return TITLES[q] ? q : "profile";
  })();

  /* logout panel is reachable even when "signed out" is false; sign-in link in signed-out view */
  render(current);

  /* respond to cart/wishlist changes coming from other components */
  window.addEventListener("storage", function () {
    render(current);
  });
})();
