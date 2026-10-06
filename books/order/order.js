/* Order confirmation: reads the order recorded by checkout.js just before it cleared the cart. */
(function () {
  var q = new URLSearchParams(location.search), id = q.get("id"), from = q.get("from") || "home";
  var root = document.getElementById("ord");
  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem("rk-last-order") || "null"); } catch (e) {}
  /* opened from My Account → Orders ("View details" adds view=1), or any order that isn't the one just placed:
     show the full order from the orders saved in this browser */
  var past = []; try { past = JSON.parse(localStorage.getItem("rk-orders") || "[]"); } catch (e) {}
  var full = past.filter(function (o) { return o && o.id === id; })[0];
  if (full && (q.get("view") || !saved || saved.id !== id)) { details(full); return; }
  if (!saved || saved.id !== id) {
    root.innerHTML = '<div class="ord-missing"><h1>Order not found</h1><p>We could not find details for this order in this browser session.</p>' +
      '<a class="bk-btn bk-btn--buy" href="../../' + (/^(offers|kt[23]|mobile)$/.test(from) ? "offers/" : from === "hp" ? "hp/" : "") + '">Back to shopping</a></div>';
    return;
  }
  function fmt(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }
  var PAY = { upi: "UPI", card: "Credit / Debit Card", cod: "Cash on Delivery" };
  var eta = new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "long" });

  root.innerHTML =
    '<div class="ord-card">' +
      '<div class="ord-tick"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg></div>' +
      '<h1>Order placed!</h1>' +
      '<p class="ord-sub">Thank you' + (saved.name ? ", " + esc(saved.name) : "") + '. A confirmation has been noted for this session.</p>' +
      '<div class="ord-box">' +
        '<div class="ord-row"><span>Order ID</span><b>' + esc(saved.id) + '</b></div>' +
        '<div class="ord-row"><span>Items</span><b>' + saved.items + (saved.items === 1 ? " book" : " books") + '</b></div>' +
        '<div class="ord-row"><span>Payment method</span><b>' + (PAY[saved.pay] || saved.pay) + '</b></div>' +
        (saved.addr ? '<div class="ord-row"><span>Delivery to</span><b>' + esc(saved.addr) + '</b></div>' : "") +
        '<div class="ord-row"><span>Expected delivery</span><b>' + eta + '</b></div>' +
        '<div class="ord-row ord-row--total"><span>Amount paid</span><b>' + fmt(saved.total) + '</b></div>' +
      '</div>' +
      '<p class="ord-note">This is a design preview — no real payment was taken and no order has actually shipped.</p>' +
      '<div class="ord-actions"><a class="bk-btn bk-btn--buy" href="../../' + (/^(offers|kt[23]|mobile)$/.test(from) ? "offers/" : from === "hp" ? "hp/" : "") + '">Continue shopping</a></div>' +
    '</div>';
  function details(o) {
    var R = window.RKOrder, C = window.RK_COLLECTIONS || {}, books = {};
    Object.keys(C).forEach(function (k) { C[k].books.forEach(function (b) { books[b[4]] = b; }); });
    var st = R.norm(o.status), on = R.active(o), mrp = 0, n = 0;
    var rows = (o.items || []).map(function (it) {
      var b = books[it.id], t = b ? b[0] : it.title || it.id, a = b ? b[1] : "", qty = it.qty || 1, was = it.disc ? it.price / (1 - it.disc / 100) : it.price;
      mrp += was * qty; n += qty;
      return '<li class="od-item"><a href="../product/?id=' + encodeURIComponent(it.id) + '"><img src="../covers/' + esc(it.id) + '.jpg" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'"></a>' +
        '<div class="od-item__tx"><a href="../product/?id=' + encodeURIComponent(it.id) + '">' + esc(t) + "</a><span>" + esc(a) + (a ? " · " : "") + "Qty " + qty + "</span></div>" +
        '<div class="od-item__pr"><b>' + R.money(it.price * qty) + "</b>" + (it.disc ? "<s>" + R.money(Math.round(was) * qty) + "</s>" : "") + "</div></li>";
    }).join("");
    var saved = Math.max(0, Math.round(mrp) - o.total);
    document.title = "Order " + o.id + " | Rajkamal Prakashan Samuh";
    root.classList.add("ord--details");
    root.innerHTML =
      '<div class="od">' +
        '<a class="od-back" href="../../account/?tab=orders">← My orders</a>' +
        '<header class="od-head"><div><p class="od-eyebrow">Order</p><h1>' + esc(o.id) + "</h1>" +
          '<p class="od-placed">Placed on ' + R.date(o.date, true) + " · " + n + (n === 1 ? " book" : " books") + "</p></div>" + R.chip(o) + "</header>" +
        '<section class="od-card od-status od-status--' + st + '" id="track"><p class="od-line">' + esc(R.line(o)) + "</p>" + R.tracker(o, true) +
          (o.awb && on ? '<p class="od-awb">Courier: <b>' + esc(o.awb) + "</b></p>" : "") + "</section>" +
        '<div class="od-grid">' +
          '<section class="od-card"><h2>Books in this order</h2><ul class="od-items">' + rows + "</ul></section>" +
          '<aside class="od-side">' +
            '<section class="od-card"><h2>Payment</h2><dl class="od-sum">' +
              "<div><dt>Subtotal</dt><dd>" + R.money(Math.round(mrp)) + "</dd></div>" +
              (saved > 0 ? '<div class="od-save"><dt>Discount</dt><dd>− ' + R.money(saved) + "</dd></div>" : "") +
              "<div><dt>Delivery</dt><dd>Free</dd></div>" +
              '<div class="od-total"><dt>' + (st === "cancelled" || st === "returned" ? "Order total" : o.pay === "cod" && on ? "To pay on delivery" : "Paid") + "</dt><dd>" + R.money(o.total) + "</dd></div></dl>" +
              '<p class="od-pay">' + (R.pay[o.pay] || esc(o.pay || "")) + "</p></section>" +
            '<section class="od-card"><h2>Delivery address</h2><p class="od-addr">' + esc(o.addr || "—") + "</p></section>" +
          "</aside>" +
        "</div>" +
        '<div class="od-actions">' +
          (on ? '<a class="bk-btn bk-btn--buy" href="../../track/?awb=' + encodeURIComponent(o.id) + '">Track shipment</a>' : '<button type="button" class="bk-btn bk-btn--buy" id="odAgain">Buy again</button>') +
          '<a class="bk-btn bk-btn--cart" href="../../contact/">Need help?</a>' +
          (st === "delivered" ? '<a class="bk-btn bk-btn--cart" href="../../return-refund-policy/">Return or exchange</a>' : "") +
        "</div>" +
        (o.demo ? '<p class="ord-note">Demo order for the design preview — not a real purchase.</p>' : "") +
      "</div>";
    var again = document.getElementById("odAgain");
    if (again) again.addEventListener("click", function () {
      var S = window.RKStore; if (!S) return;
      (o.items || []).forEach(function (it) { for (var i = 0; i < (it.qty || 1); i++) S.addToCart(it.id); });
      S.openCart(window.matchMedia("(max-width: 720px)").matches);
    });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
})();
