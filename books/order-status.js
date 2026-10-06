/* Order statuses, shared by My Account → Orders and the order details page.
   An order's `status` is one of: processing · packed · shipped · out · delivered · cancelled · returned
   ("transit", written by older checkouts, means shipped). RKOrder.tracker(o) draws the progress steps. */
(function () {
  var STEPS = ["processing", "packed", "shipped", "out", "delivered"];
  var META = {
    processing: { label: "Order placed", step: "Placed", tone: "new" },
    packed: { label: "Packed", step: "Packed", tone: "new" },
    shipped: { label: "In transit", step: "Shipped", tone: "move" },
    out: { label: "Out for delivery", step: "Out for delivery", tone: "move" },
    delivered: { label: "Delivered", step: "Delivered", tone: "done" },
    cancelled: { label: "Cancelled", tone: "stop" },
    returned: { label: "Returned · refunded", tone: "back" }
  };
  var PAY = { upi: "UPI", card: "Credit / Debit Card", cod: "Cash on Delivery" };
  function norm(s) { return s === "transit" ? "shipped" : META[s] ? s : "processing"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function date(iso, long) { var d = iso ? new Date(iso + "T00:00:00") : new Date(); return d.toLocaleDateString("en-IN", long ? { day: "numeric", month: "short", year: "numeric" } : { day: "numeric", month: "short" }); }
  function plus(iso, n) { var d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); function p(v) { return (v < 10 ? "0" : "") + v; } return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); } /* local date, not UTC */
  function money(n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function active(o) { var s = norm(o.status); return s !== "delivered" && s !== "cancelled" && s !== "returned"; }
  /* one plain sentence about where the order is */
  function line(o) {
    var s = norm(o.status), eta = date(o.eta), paid = o.pay !== "cod";
    if (s === "processing") return "We're preparing your order · arriving by " + eta;
    if (s === "packed") return "Packed and waiting for the courier · arriving by " + eta;
    if (s === "shipped") return "On the way · arriving by " + eta;
    if (s === "out") return "Out for delivery — arriving today";
    if (s === "delivered") return "Delivered on " + date(o.deliveredOn || o.eta);
    if (s === "cancelled") return "Cancelled on " + date(o.closedOn || o.date) + (paid ? " · " + money(o.total) + " refunded to " + (PAY[o.pay] || "your payment method") : " · no payment was taken");
    return "Returned on " + date(o.closedOn || o.eta) + " · " + money(o.total) + " refunded";
  }
  /* the dates each step happened (or is expected) */
  function when(o) {
    var s = norm(o.status), d = [o.date, plus(o.date, 1), plus(o.date, 2), o.eta, o.deliveredOn || o.eta];
    return { dates: d, reached: STEPS.indexOf(s) };
  }
  function tracker(o, big) {
    var s = norm(o.status), w = when(o), steps;
    if (s === "cancelled") steps = [["Placed", date(o.date), 1], ["Cancelled", date(o.closedOn || o.date), 2], [o.pay === "cod" ? "No payment taken" : "Refunded", o.pay === "cod" ? "" : date(o.closedOn || o.date), 2]];
    else if (s === "returned") steps = [["Placed", date(o.date), 1], ["Delivered", date(o.deliveredOn || o.eta), 1], ["Returned", date(o.closedOn || o.eta), 2], ["Refunded", date(o.closedOn || o.eta), 2]];
    else steps = STEPS.map(function (k, i) { return [META[k].step, i <= w.reached ? date(w.dates[i]) : i === STEPS.length - 1 ? "Expected " + date(o.eta) : "", i < w.reached || s === "delivered" ? 1 : i === w.reached ? 2 : 0]; });
    return '<ol class="rk-track rk-track--' + META[s].tone + (big ? " rk-track--big" : "") + '" aria-label="Order progress">' + steps.map(function (st) {
      return '<li class="' + (st[2] === 1 ? "is-done" : st[2] === 2 ? "is-now" : "") + '"' + (st[2] === 2 ? ' aria-current="step"' : "") + "><i></i><b>" + esc(st[0]) + "</b>" + (st[1] ? "<span>" + esc(st[1]) + "</span>" : "") + "</li>";
    }).join("") + "</ol>";
  }
  function chip(o) { var s = norm(o.status); return '<span class="rk-status rk-status--' + META[s].tone + '">' + META[s].label + "</span>"; }
  window.RKOrder = { norm: norm, meta: META, steps: STEPS, pay: PAY, line: line, tracker: tracker, chip: chip, active: active, date: date, money: money, esc: esc };
})();
