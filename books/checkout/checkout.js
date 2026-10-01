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
            '<label>City<input required name="city" placeholder="City" autocomplete="address-level2"></label>' +
            '<label>State<input required name="state" placeholder="State" autocomplete="address-level1"></label>' +
            '<label>Pincode<input required name="pin" inputmode="numeric" pattern="[0-9]{6}" placeholder="6-digit PIN code" autocomplete="postal-code"></label>' +
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
})();
