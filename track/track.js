/* Track your order: one "AWB / Tracking Number" field and the help text, as on rajkamalprakashan.com/track.
   Design preview: there's no courier feed, so a believable timeline is built from the number (or from the order's own dates
   when it belongs to one of your orders on the account page). */
(function () {
  var root = document.getElementById("track");
  if (!root) return;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function read(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function inr(n) { return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
  var signed = read("rk-signed-in", true) !== false, orders = signed ? read("rk-orders", []) : [];
  function awbOf(o) { return "RKS" + String(o.id).replace(/\D/g, "").padStart(9, "0"); } // demo tracking number for each order
  var STEPS = ["Order placed", "Packed", "Shipped", "Out for delivery", "Delivered"];
  var NOTES = ["We've received your order.", "Your books are packed and labelled.", "Handed to our logistics partner.", "With the delivery agent today.", "Delivered. Happy reading!"];
  function d(s) { return new Date(s + (s.length === 10 ? "T10:00:00" : "")); }
  function fmt(dt, time) { return dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + (time ? ", " + dt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : ""); }

  root.innerHTML =
    '<div class="hp-wrap tr-wrap">' +
      '<header class="tr-head"><p class="bk-eyebrow">Live Shipment Updates</p><h1 class="bk-title">Track Your Order</h1></header>' +
      '<form class="tr-form" id="trForm" novalidate>' +
        '<label for="trAwb">AWB / Tracking Number</label>' +
        '<div class="tr-row"><input id="trAwb" name="awb" type="text" autocomplete="off" spellcheck="false" placeholder="e.g. RKS071829304" aria-describedby="trMsg"><button type="submit">Track</button></div>' +
        '<p class="tr-msg" id="trMsg">Tracking data is sourced from our logistics partner. Updates may take a few minutes to reflect.</p>' +
      "</form>" +
      '<div id="trResult" aria-live="polite"></div>' +
      (orders.length ? '<section class="tr-orders"><h2>Your recent orders</h2><ul>' + orders.slice(0, 4).map(function (o) {
        var n = (o.items || []).reduce(function (s, i) { return s + (i.qty || 1); }, 0);
        return '<li><span><b>#' + esc(o.id) + "</b><i>" + fmt(d(o.date)) + " · " + n + (n === 1 ? " book" : " books") + " · " + inr(o.total) + "</i></span>" +
          '<button type="button" data-awb="' + awbOf(o) + '">Track</button></li>';
      }).join("") + "</ul></section>"
      : '<p class="tr-signin">Ordered while signed in? <a href="../auth/login/?next=' + encodeURIComponent("../../track/") + '">Sign in</a> to track your orders in one tap.</p>') +
      '<section class="tr-help"><h2>Need help with a delivery?</h2><div class="tr-help__row">' +
        '<a class="tr-help__card" href="https://wa.me/" target="_blank" rel="noopener noreferrer"><b>WhatsApp Helpline</b><span>Chat with us about your order</span></a>' +
        '<a class="tr-help__card" href="../report-issue/"><b>Report an Issue</b><span>Damaged, missing or late? Tell us</span></a>' +
        '<a class="tr-help__card" href="../account/?tab=orders"><b>My Orders</b><span>See every order and invoice</span></a>' +
      "</div></section>" +
    "</div>";

  var form = document.getElementById("trForm"), input = form.awb, msg = document.getElementById("trMsg"), out = document.getElementById("trResult");
  var HELP = msg.textContent;
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function track(awb) {
    var order = orders.filter(function (o) { return awbOf(o) === awb; })[0], now = new Date(), times, stage;
    if (order) {
      var placed = d(order.date), eta = d(order.eta || order.date);
      stage = order.status === "delivered" ? 4 : 2;
      times = [placed, new Date(+placed + 0.6 * 864e5), new Date(+placed + 1.4 * 864e5), new Date(+eta - 0.25 * 864e5), eta];
    } else {
      stage = 1 + (hash(awb) % 4); // anything from Packed to Delivered
      var start = new Date(+now - (stage + 1) * 864e5);
      times = STEPS.map(function (_, i) { return new Date(+start + i * 864e5 + (i ? (hash(awb + i) % 300) * 6e4 : 0)); });
    }
    var etaTxt = stage === 4 ? "Delivered " + fmt(times[4]) : "Expected by " + fmt(times[4]);
    out.innerHTML = '<section class="tr-card">' +
      '<div class="tr-card__top"><div><span class="tr-k">AWB</span><b class="tr-awb">' + esc(awb) + "</b></div>" +
        '<div><span class="tr-k">Status</span><b class="tr-status tr-status--' + (stage === 4 ? "done" : "go") + '">' + STEPS[stage] + "</b></div>" +
        '<div><span class="tr-k">' + (stage === 4 ? "Delivered" : "Delivery") + '</span><b>' + etaTxt.replace(/^(Delivered|Expected by) /, "") + "</b></div></div>" +
      (order ? '<div class="tr-items">' + (order.items || []).map(function (it) { return '<img src="' + esc(it.img || "../books/covers/" + it.id + ".jpg") + '" alt="" loading="lazy" onerror="this.remove()">'; }).join("") +
        "<span>Order #" + esc(order.id) + " · " + esc(order.addr || "") + "</span></div>" : "") +
      '<ol class="tr-steps">' + STEPS.map(function (s, i) {
        var state = i < stage ? "done" : i === stage ? (stage === 4 ? "done" : "now") : "todo";
        return '<li class="is-' + state + '"' + (i === stage ? ' aria-current="step"' : "") + '><span class="tr-dot" aria-hidden="true"></span><div><b>' + s + "</b>" +
          (i <= stage ? "<span>" + NOTES[i] + "</span><time>" + fmt(times[i], true) + "</time>" : "<span>" + (i === 4 ? etaTxt : "Pending") + "</span>") + "</div></li>";
      }).join("") + "</ol>" +
      '<p class="tr-fine">Design preview — there\'s no live courier feed, so this timeline is illustrative.</p></section>';
    out.querySelector(".tr-card").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim().toUpperCase().replace(/\s+/g, "");
    var bad = !v ? "Enter the AWB / tracking number from your shipping SMS or email." : /^[A-Z0-9-]{6,25}$/.test(v) ? "" : "That doesn't look like a tracking number — use letters and numbers only.";
    input.closest(".tr-form").classList.toggle("is-bad", !!bad); input.setAttribute("aria-invalid", bad ? "true" : "false");
    msg.textContent = bad || HELP;
    if (bad) { input.focus(); out.innerHTML = ""; return; }
    input.value = v; track(v);
    try { history.replaceState(null, "", "?awb=" + encodeURIComponent(v)); } catch (er) {}
  });
  input.addEventListener("input", function () { if (form.classList.contains("is-bad")) { form.classList.remove("is-bad"); msg.textContent = HELP; } });
  root.addEventListener("click", function (e) { var b = e.target.closest("[data-awb]"); if (b) { input.value = b.dataset.awb; form.requestSubmit(); } });
  var pre = new URLSearchParams(location.search).get("awb");
  if (pre) { input.value = pre; form.requestSubmit(); }
})();
