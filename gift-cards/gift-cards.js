/* Gift cards: copy, limits (₹10–₹10,000), fields and the RKGC-XXXX-XXXX-XXXX code format follow rajkamalprakashan.com/gift-cards.
   Preset amounts are our addition. Design preview: no payment is taken; a bought card can be added to the account's gift cards. */
(function () {
  var root = document.getElementById("gift");
  if (!root) return;
  var MIN = 10, MAX = 10000, PRESETS = [250, 500, 1000, 2000, 5000];
  var st = { amt: 500, via: "email" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function inr(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
  function read(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  var signed = read("rk-signed-in", true) !== false, V = window.RKForms;
  var LOGO = "../kt/assets/logo/rkp-logo-text-only-white.svg";

  function field(name, label, type, ph, val, req, help) {
    return '<div class="gc-field"><label for="g-' + name + '">' + esc(label) + (req ? ' <b aria-hidden="true">*</b>' : ' <i>(optional)</i>') + "</label>" +
      '<input id="g-' + name + '" name="' + name + '" type="' + type + '" placeholder="' + esc(ph) + '"' + (val ? ' value="' + esc(val) + '"' : "") + (req ? " required" : "") + ' aria-describedby="g-' + name + '-msg">' +
      '<p class="gc-msg" id="g-' + name + '-msg">' + esc(help || "") + "</p></div>";
  }
  function preview() {
    return '<div class="gc-card" id="gcCard" aria-hidden="true">' +
      '<div class="gc-card__top"><img src="' + LOGO + '" alt=""><span>Gift Card</span></div>' +
      '<div class="gc-card__amt" data-p="amt">' + inr(st.amt) + "</div>" +
      '<div class="gc-card__to" data-p="to">For someone who loves books</div>' +
      '<div class="gc-card__msg" data-p="msg"></div>' +
      '<div class="gc-card__code">RKGC-XXXX-XXXX-XXXX</div></div>';
  }
  root.innerHTML =
    '<div class="hp-wrap">' +
      '<header class="gc-head"><p class="bk-eyebrow">Gift cards</p><h1 class="bk-title">The gift of stories</h1>' +
        "<p class=\"gc-lede\">Let someone you love choose their next favourite book. Gift cards are delivered instantly — by email or as a code — and never expire unless you choose otherwise.</p>" +
        '<ul class="gc-facts"><li>Instant delivery</li><li>Partial balance use</li><li>₹10 – ₹10,000</li></ul></header>' +
      '<div class="gc-grid">' +
        '<form class="gc-form" id="gcForm" novalidate>' +
          '<fieldset class="gc-step"><legend><span>1</span>Choose an amount</legend>' +
            '<div class="gc-presets" role="radiogroup" aria-label="Amount">' + PRESETS.map(function (p) {
              return '<button type="button" role="radio" class="gc-preset' + (p === st.amt ? " is-on" : "") + '" data-amt="' + p + '" aria-checked="' + (p === st.amt) + '">' + inr(p) + "</button>";
            }).join("") + "</div>" +
            '<div class="gc-field gc-field--amt"><label for="g-amt">Or enter an amount</label><div class="gc-amt"><span>₹</span><input id="g-amt" name="amt" type="text" inputmode="numeric" data-rule="digits" data-max="5" placeholder="10 – 10,000" aria-describedby="g-amt-msg"></div><p class="gc-msg" id="g-amt-msg">Any amount from ₹10 to ₹10,000.</p></div>' +
          "</fieldset>" +
          '<fieldset class="gc-step"><legend><span>2</span>How should it arrive?</legend>' +
            '<div class="gc-via" role="radiogroup" aria-label="Delivery">' +
              '<button type="button" role="radio" class="gc-via__opt is-on" data-via="email" aria-checked="true"><b>Send via email</b><span>We email it to them, right away</span></button>' +
              '<button type="button" role="radio" class="gc-via__opt" data-via="code" aria-checked="false"><b>Get the code</b><span>Print it, write it in a card, or keep it</span></button>' +
            "</div>" +
            '<div class="gc-to" id="gcTo">' + field("toName", "Their name", "text", "Who is it for?", "", true) + field("toEmail", "Their email", "email", "name@example.com", "", true) + "</div>" +
          "</fieldset>" +
          '<fieldset class="gc-step"><legend><span>3</span>From you</legend>' +
            '<div class="gc-two">' + field("name", "Your name", "text", "Your name", "", true) + field("email", "Your email", "email", "you@example.com", "", true, "We'll send the receipt here.") + "</div>" +
            '<div class="gc-field"><label for="g-note">Personal message <i>(optional)</i></label><textarea id="g-note" name="note" rows="3" maxlength="300" placeholder="Happy reading!"></textarea><p class="gc-msg gc-count" id="g-note-msg">0/300</p></div>' +
          "</fieldset>" +
          '<div class="gc-pay"><div><span>You pay</span><b id="gcPay">' + inr(st.amt) + '</b></div><button type="submit" class="gc-buy">Buy Gift Card</button></div>' +
          '<p class="gc-fine">Secure payment powered by Razorpay. <span>Design preview — no payment is taken.</span></p>' +
        "</form>" +
        '<aside class="gc-side">' + preview() +
          '<ol class="gc-how"><li><b>Pick an amount</b><span>Anything from ₹10 to ₹10,000.</span></li><li><b>Send it or keep the code</b><span>Delivered instantly by email, or shown to you as a code.</span></li><li><b>They choose the books</b><span>Use it at checkout — whatever is left stays on the card.</span></li></ol>' +
          '<a class="gc-mine" href="../account/?tab=giftcard">My Gift Cards <span aria-hidden="true">→</span></a>' +
        "</aside>" +
      "</div>" +
    "</div>";

  var form = document.getElementById("gcForm"), amtIn = form.elements.namedItem("amt"), pay = document.getElementById("gcPay"), card = document.getElementById("gcCard");
  function setP(k, v) { card.querySelector('[data-p="' + k + '"]').textContent = v; }
  function setAmt(n, fromPreset) {
    st.amt = n;
    form.querySelectorAll(".gc-preset").forEach(function (b) { var on = +b.dataset.amt === n && fromPreset; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", String(on)); });
    var ok = n >= MIN && n <= MAX;
    pay.textContent = ok ? inr(n) : "—"; setP("amt", ok ? inr(n) : "₹ ——");
  }
  function err(input, msg) {
    var m = document.getElementById(input.id + "-msg"), f = input.closest(".gc-field");
    if (m && m.dataset.help === undefined) m.dataset.help = m.textContent; // remember the help text once (it may be empty)
    f.classList.toggle("is-bad", !!msg); input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (m) m.textContent = msg || m.dataset.help;
    return !msg;
  }
  form.addEventListener("click", function (e) {
    var p = e.target.closest(".gc-preset");
    if (p) { amtIn.value = ""; err(amtIn, ""); setAmt(+p.dataset.amt, true); return; }
    var v = e.target.closest(".gc-via__opt");
    if (v) {
      st.via = v.dataset.via;
      form.querySelectorAll(".gc-via__opt").forEach(function (b) { var on = b === v; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", String(on)); });
      document.getElementById("gcTo").hidden = st.via !== "email";
      setP("to", st.via === "email" ? (form.toName.value.trim() ? "For " + form.toName.value.trim() : "For someone who loves books") : "For you to give");
    }
  });
  form.addEventListener("input", function (e) {
    var t = e.target;
    if (t.closest(".is-bad")) err(t, "");
    if (t === amtIn) { var n = Math.round(+amtIn.value); if (amtIn.value) setAmt(n, false); else setAmt(500, true); }
    if (t.name === "toName" && st.via === "email") setP("to", t.value.trim() ? "For " + t.value.trim() : "For someone who loves books");
    if (t.name === "note") { setP("msg", t.value.trim() ? "“" + t.value.trim() + "”" : ""); document.getElementById("g-note-msg").textContent = t.value.length + "/300"; }
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true, n = st.amt;
    if (amtIn.value) ok = err(amtIn, n >= MIN && n <= MAX ? "" : "Choose an amount between ₹10 and ₹10,000.") && ok;
    if (st.via === "email") {
      ok = err(form.toName, !form.toName.value.trim() ? "Who is it for?" : V.nameOk(form.toName.value) ? "" : "Use letters only — no numbers or symbols.") && ok;
      ok = err(form.toEmail, emailOk(form.toEmail.value) ? "" : "Enter their email address.") && ok;
    }
    ok = err(form.elements.namedItem("name"), !form.elements.namedItem("name").value.trim() ? "Enter your name." : V.nameOk(form.elements.namedItem("name").value) ? "" : "Use letters only — no numbers or symbols.") && ok;
    ok = err(form.email, emailOk(form.email.value) ? "" : "Enter your email address.") && ok;
    if (!ok) { form.querySelector("[aria-invalid=true]").focus(); return; }
    var code = "RKGC-" + [0, 0, 0].map(function () { return Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, "X").padEnd(4, "7"); }).join("-");
    var exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
    var gc = { id: "g" + Date.now().toString(36), number: code, balance: n, initial: n, expires: exp.toISOString().slice(0, 10), added: new Date().toISOString().slice(0, 10) };
    var who = st.via === "email" ? form.toName.value.trim() : "";
    form.outerHTML = '<section class="gc-done" aria-live="polite"><span class="gc-done__ic" aria-hidden="true">✓</span>' +
      "<h2>" + (who ? "Your gift is on its way to " + esc(who) : "Here's your gift card") + "</h2>" +
      "<p>" + (who ? "We've emailed a " + inr(n) + " gift card to <b>" + esc(form.toEmail.value.trim()) + "</b>. A receipt is on its way to you." : "Keep this code safe — it works like cash at checkout.") + "</p>" +
      '<div class="gc-done__code"><code>' + code + "</code><button type=\"button\" class=\"gc-copy\" data-code=\"" + code + '">Copy</button></div>' +
      '<div class="gc-done__actions">' + (!who && signed ? '<button type="button" class="gc-buy" data-add>Add to my account</button>' : "") +
        '<a class="gc-ghost" href="../account/?tab=giftcard">My Gift Cards →</a><button type="button" class="gc-ghost" data-again>Buy another</button></div>' +
      '<p class="gc-fine">Design preview — no payment was taken and nothing was emailed.</p></section>';
    card.querySelector(".gc-card__code").textContent = code;
    var done = root.querySelector(".gc-done");
    done.addEventListener("click", function (ev) {
      var c = ev.target.closest(".gc-copy");
      if (c) { (navigator.clipboard ? navigator.clipboard.writeText(c.dataset.code) : Promise.reject()).then(function () { c.textContent = "Copied"; }, function () { c.textContent = "Select & copy"; }); }
      if (ev.target.closest("[data-add]")) { var all = read("rk-giftcards", []); all.unshift(gc); write("rk-giftcards", all); ev.target.closest("[data-add]").outerHTML = '<span class="gc-added">Added to your account ✓</span>'; }
      if (ev.target.closest("[data-again]")) location.reload();
    });
    done.setAttribute("tabindex", "-1"); done.focus(); // move focus to the confirmation for screen readers
  });
})();
