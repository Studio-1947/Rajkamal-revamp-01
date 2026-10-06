/* Checkout: order summary + a delivery/payment form (demo only — placing the order just clears the cart and
   shows the confirmation page). Uses the same cart data as the popup. */
(function () {
  var grid = document.getElementById("coGrid"), back = document.getElementById("coBack");
  var q = new URLSearchParams(location.search), from = q.get("from") || "home";
  back.setAttribute("href", "../?" + (q.get("c") ? "c=" + q.get("c") + "&" : "") + "from=" + encodeURIComponent(from));

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function mrp(price, disc) { return Math.round(price / (1 - disc / 100)); }
  var prices = {}, C = window.RK_COLLECTIONS || {};
  Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { prices[b[4]] = b; }); });

  function render() {
    var S = window.RKStore;
    if (!S) { grid.innerHTML = '<p class="pd-loading">Loading…</p>'; return setTimeout(render, 200); }
    var counts = S.counts(), ids = Object.keys(counts);
    if (!ids.length) {
      grid.innerHTML = '<div class="co-empty"><h2>Your cart is empty</h2><p>Add some books before checking out.</p><a class="bk-btn bk-btn--buy" href="../?from=' + esc(from) + '">Browse books</a></div>';
      return;
    }
    var subtotal = 0, list = 0;
    var rows = ids.map(function (id) {
      var b = prices[id] || [id.replace(/-/g, " "), "", 0, 0, id], q = counts[id], line = b[2] * q;
      subtotal += line; list += (b[3] ? mrp(b[2], b[3]) : b[2]) * q;
      return '<li><img src="../covers/' + esc(id) + '.jpg" alt="" width="52" height="78" onerror="this.style.visibility=\'hidden\'">' +
        '<div class="co-line__info"><b>' + esc(b[0]) + '</b><span>' + esc(b[1]) + ' · Qty ' + q + '</span></div><strong>' + fmt(line) + '</strong></li>';
    }).join("");
    var save = Math.max(0, list - subtotal);
    var LIM = [[10000, 7], [5000, 7], [2000, 5]], tier = null;
    for (var t = 0; t < LIM.length; t++) if (subtotal >= LIM[t][0]) { tier = LIM[t]; break; }
    var extra = tier ? Math.round(subtotal * tier[1]) / 100 : 0;
    var payable = subtotal - extra;

    grid.innerHTML =
      '<form class="co-form" id="coForm" novalidate>' +
        '<section class="co-card"><h2>Delivery address</h2>' +
          '<div class="co-fields">' +
            '<label>Full name<input required name="name" placeholder="Your name" autocomplete="name"></label>' +
            '<label>Phone<input required name="phone" type="tel" inputmode="numeric" placeholder="10-digit mobile number" autocomplete="tel"></label>' +
            '<label class="co-span2">Address<input required name="addr" placeholder="House no., street, area" autocomplete="street-address"></label>' +
            /* PIN code comes right after the address: six digits fill City and State (both stay editable) — see pinLookup() */
            '<label class="co-span2 co-pin">PIN code<span class="co-pin__row"><input required name="pin" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="6-digit PIN code" autocomplete="postal-code" aria-describedby="coPinNote"><span class="co-pin__note" id="coPinNote" aria-live="polite">Enter your PIN code — we\'ll fill in the city and state.</span></span></label>' +
            '<label>City<input required name="city" placeholder="City" autocomplete="address-level2"></label>' +
            '<label>State<input required name="state" placeholder="State" autocomplete="address-level1"></label>' +
            '<label>Email (optional)<input name="email" type="email" placeholder="you@example.com" autocomplete="email"></label>' +
          '</div></section>' +
        '<section class="co-card"><h2>Payment method</h2>' +
          '<div class="co-pay">' +
            '<label class="co-pay__opt"><input type="radio" name="pay" value="upi" checked><span>UPI</span></label>' +
            '<label class="co-pay__opt"><input type="radio" name="pay" value="card"><span>Credit / Debit Card</span></label>' +
            '<label class="co-pay__opt"><input type="radio" name="pay" value="cod"><span>Cash on Delivery</span></label>' +
          '</div><p class="co-note">This is a design preview — no payment is collected and no real order is placed.</p></section>' +
      '</form>' +
      '<aside class="co-summary"><h2>Order summary</h2><ul class="co-lines">' + rows + '</ul>' +
        (tier ? '<div class="co-offer">Extra ' + tier[1] + '% off applied — you save ' + fmt(extra) + '</div>' : '') +
        '<dl class="co-sum"><div><dt>Subtotal</dt><dd>' + fmt(list) + '</dd></div>' +
        (save + extra ? '<div class="co-save"><dt>Discount</dt><dd>− ' + fmt(save + extra) + '</dd></div>' : '') +
        '<div><dt>Delivery</dt><dd>Free</dd></div>' +
        '<div class="co-total"><dt>Total</dt><dd>' + fmt(payable) + '</dd></div></dl>' +
        '<button type="submit" form="coForm" class="bk-btn bk-btn--buy co-place">Place order · ' + fmt(payable) + '</button>' +
        '<p class="co-secure"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/></svg>Safe, trusted &amp; encrypted checkout</p>' +
      '</aside>';

    pinLookup(document.getElementById("coForm"));

    document.getElementById("coForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!e.target.reportValidity()) return;
      var fd = new FormData(e.target), name = fd.get("name");
      var orderId = "RK" + Date.now().toString().slice(-8);
      var addr = [fd.get("addr"), fd.get("city"), fd.get("state") + " " + fd.get("pin")].filter(Boolean).join(", ");
      try {
        sessionStorage.setItem("rk-last-order", JSON.stringify({ id: orderId, name: name, total: payable, items: ids.length, pay: fd.get("pay"), addr: addr }));
      } catch (err) {}
      /* remember the order in localStorage so the My Account page can list it (design preview only) */
      try {
        var rec = { local: true, id: orderId, date: new Date().toISOString().slice(0, 10), eta: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
          total: payable, pay: fd.get("pay"), status: "transit", addr: addr,
          items: ids.map(function (id) { var b = prices[id] || [id, "", 0, 0, id]; return { id: id, qty: counts[id], price: b[2], disc: b[3], img: "../books/covers/" + id + ".jpg" }; }) };
        var past = JSON.parse(localStorage.getItem("rk-orders") || "[]");
        past.unshift(rec);
        localStorage.setItem("rk-orders", JSON.stringify(past.slice(0, 20)));
      } catch (err) {}
      S.clear();
      location.href = "../order/?id=" + orderId + "&from=" + encodeURIComponent(from);
    });
  }
  render();
  /* ---- PIN code → City + State ----
     Six digits: the state is filled at once from the PIN's first digits (built-in table, works offline), then India
     Post's public PIN directory (api.postalpincode.in) gives the district (city) and confirms the state.
     Both fields stay editable; a value the customer typed themselves is never overwritten. */
  function pinLookup(form) {
    var pin = form.elements.pin, city = form.elements.city, state = form.elements.state, note = document.getElementById("coPinNote");
    if (!pin || !city || !state) return;
    var P3 = { 160: "Chandigarh", 194: "Ladakh", 246: "Uttarakhand", 248: "Uttarakhand", 249: "Uttarakhand", 262: "Uttarakhand", 263: "Uttarakhand", 396: "Gujarat", 403: "Goa", 605: "Puducherry",
               737: "Sikkim", 744: "Andaman and Nicobar Islands", 790: "Arunachal Pradesh", 791: "Arunachal Pradesh", 792: "Arunachal Pradesh", 793: "Meghalaya", 794: "Meghalaya", 795: "Manipur",
               796: "Mizoram", 797: "Nagaland", 798: "Nagaland", 799: "Tripura", 814: "Jharkhand", 815: "Jharkhand", 816: "Jharkhand", 822: "Jharkhand", 825: "Jharkhand", 826: "Jharkhand", 827: "Jharkhand",
               828: "Jharkhand", 829: "Jharkhand", 831: "Jharkhand", 832: "Jharkhand", 833: "Jharkhand", 834: "Jharkhand", 835: "Jharkhand" };
    var P2 = { 11: "Delhi", 12: "Haryana", 13: "Haryana", 14: "Punjab", 15: "Punjab", 16: "Punjab", 17: "Himachal Pradesh", 18: "Jammu and Kashmir", 19: "Jammu and Kashmir",
               20: "Uttar Pradesh", 21: "Uttar Pradesh", 22: "Uttar Pradesh", 23: "Uttar Pradesh", 24: "Uttar Pradesh", 25: "Uttar Pradesh", 26: "Uttar Pradesh", 27: "Uttar Pradesh", 28: "Uttar Pradesh",
               30: "Rajasthan", 31: "Rajasthan", 32: "Rajasthan", 33: "Rajasthan", 34: "Rajasthan", 36: "Gujarat", 37: "Gujarat", 38: "Gujarat", 39: "Gujarat",
               40: "Maharashtra", 41: "Maharashtra", 42: "Maharashtra", 43: "Maharashtra", 44: "Maharashtra", 45: "Madhya Pradesh", 46: "Madhya Pradesh", 47: "Madhya Pradesh", 48: "Madhya Pradesh", 49: "Chhattisgarh",
               50: "Telangana", 51: "Andhra Pradesh", 52: "Andhra Pradesh", 53: "Andhra Pradesh", 56: "Karnataka", 57: "Karnataka", 58: "Karnataka", 59: "Karnataka",
               60: "Tamil Nadu", 61: "Tamil Nadu", 62: "Tamil Nadu", 63: "Tamil Nadu", 64: "Tamil Nadu", 67: "Kerala", 68: "Kerala", 69: "Kerala",
               70: "West Bengal", 71: "West Bengal", 72: "West Bengal", 73: "West Bengal", 74: "West Bengal", 75: "Odisha", 76: "Odisha", 77: "Odisha", 78: "Assam",
               80: "Bihar", 81: "Bihar", 82: "Bihar", 83: "Bihar", 84: "Bihar", 85: "Bihar" };
    function stateOf(p) { return P3[+p.slice(0, 3)] || P2[+p.slice(0, 2)] || ""; }
    var auto = { city: "", state: "" }, last = "", ctl = null;
    /* fill a field unless the customer has typed their own value into it */
    function fill(el, key, val) {
      if (!val) return false;
      if (el.value.trim() && el.value !== auto[key]) return false; /* their own text — leave it */
      el.value = val; auto[key] = val; el.classList.add("is-auto");
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }
    [["city", city], ["state", state]].forEach(function (p) {
      p[1].addEventListener("input", function (e) { if (e.isTrusted && p[1].value !== auto[p[0]]) p[1].classList.remove("is-auto"); });
    });
    function say(text, kind) { note.textContent = text; note.className = "co-pin__note" + (kind ? " is-" + kind : ""); }
    function title(s) { return String(s || "").toLowerCase().replace(/(^|[\s(-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }); }
    function run() {
      var p = pin.value.replace(/\D/g, "").slice(0, 6);
      if (p !== pin.value) pin.value = p;
      if (p.length < 6) { if (ctl) ctl.abort(); last = ""; say(p ? "Keep going — a PIN code has 6 digits." : "Enter your PIN code — we'll fill in the city and state."); return; }
      if (p === last) return; last = p;
      var guess = stateOf(p);
      if (!guess) { say("That doesn't look like an Indian PIN code — please check it, or type your city and state.", "warn"); return; }
      fill(state, "state", guess);
      say("Looking up " + p + "…", "busy");
      if (ctl) ctl.abort();
      ctl = "AbortController" in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
      fetch("https://api.postalpincode.in/pincode/" + p, ctl ? { signal: ctl.signal } : {})
        .then(function (r) { return r.json(); })
        .then(function (d) {
          clearTimeout(timer); if (p !== last) return;
          var po = d && d[0] && d[0].Status === "Success" && d[0].PostOffice && d[0].PostOffice[0];
          if (!po) { say("We couldn't find " + p + ". Check the PIN code, or type your city — we've set the state to " + guess + ".", "warn"); return; }
          var st = title(po.State), ct = title(po.District);
          var gotState = fill(state, "state", st) || state.value === st, gotCity = fill(city, "city", ct) || city.value === ct;
          if (gotState && gotCity) say("✓ " + ct + ", " + st + " — filled in for you. You can edit either one.", "ok");
          else say("This PIN code is in " + ct + ", " + st + ". We kept what you typed for the " + (!gotCity && !gotState ? "city and state" : !gotCity ? "city" : "state") + " — change it if you need to.", "ok");
        })
        .catch(function () {
          clearTimeout(timer); if (p !== last) return;
          say("State set to " + guess + " from your PIN code. We couldn't look up the city just now — please type it.", "warn");
          if (!city.value.trim()) city.focus();
        });
    }
    pin.addEventListener("input", run);
    pin.addEventListener("change", run);
    if (pin.value) run();
  }
})();
