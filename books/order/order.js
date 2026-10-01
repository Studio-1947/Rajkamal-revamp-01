/* Order confirmation: reads the order recorded by checkout.js just before it cleared the cart. */
(function () {
  var q = new URLSearchParams(location.search), id = q.get("id"), from = q.get("from") || "home";
  var root = document.getElementById("ord");
  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem("rk-last-order") || "null"); } catch (e) {}
  if (!saved || saved.id !== id) {
    root.innerHTML = '<div class="ord-missing"><h1>Order not found</h1><p>We could not find details for this order in this browser session.</p>' +
      '<a class="bk-btn bk-btn--buy" href="../../' + (/^kt[23]?$|^hp$|^mobile$|^home$/.test(from) ? from : "kt") + '/">Back to shopping</a></div>';
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
      '<div class="ord-actions"><a class="bk-btn bk-btn--buy" href="../../' + (/^kt[23]?$|^hp$|^mobile$|^home$/.test(from) ? from : "kt") + '/">Continue shopping</a></div>' +
    '</div>';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
})();
