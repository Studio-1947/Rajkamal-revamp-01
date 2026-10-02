/* Sign-in screens: login (OTP or password), register, forgot / reset password, verify email.
   Copy and fields follow rajkamalprakashan.com/auth/*. Design preview: nothing is sent — any 6-digit code works, and signing in
   sets the same demo flag the account page uses (localStorage "rk-signed-in", profile in "rk-profile"). */
(function () {
  var root = document.getElementById("auth");
  if (!root) return;
  var view = root.getAttribute("data-view");
  var q = new URLSearchParams(location.search);
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function read(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function toast(m) { if (window.RKStore) window.RKStore.toast(m); }
  /* where to go after signing in: a same-site ?next= path, otherwise the account page */
  function nextUrl() { var n = q.get("next"); return n && /^(\/|\.\.?\/)(?!\/)/.test(n) ? n : "../../account/"; }
  function withNext(path) { var n = q.get("next"); return path + (n ? (path.indexOf("?") < 0 ? "?" : "&") + "next=" + encodeURIComponent(n) : ""); }

  var I = {
    phone: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    ok: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    warn: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v5"/><circle cx="12" cy="16.5" r=".8" fill="currentColor"/><path d="M10.3 3.8 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>',
    track: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    heart: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.4 5 6.5 5c1.9 0 3.3 1 4.1 2.3h.8C12.2 6 13.6 5 15.5 5c3.1 0 5 3 3.8 6.2-1.8 4.7-9.3 9.3-9.3 9.3z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>'
  };

  /* ---------- the brand side: same on every screen, copy from the live pages ---------- */
  var BRAND = {
    login: ["Welcome Back", "Sign in to access your premium account, track your orders, and discover new publications."],
    register: ["Join Our Community", "Create an account to quickly checkout, track your orders, and manage your wishlist."],
    "forgot-password": ["Forgot your password?", "It happens. We'll send a secure link to the email on your account."],
    "reset-password": ["Choose a new password", "Pick something you'll remember — at least 8 characters."],
    verify: ["Email verification", "One last step to keep your account secure."]
  };
  function brand() {
    var C = window.RK_COLLECTIONS || {}, picks = ((C.bestsellers || C["home-picks"] || { books: [] }).books || []).slice(0, 3);
    var b = BRAND[view] || BRAND.login;
    return '<aside class="auth-brand">' +
      '<p class="auth-brand__eyebrow">Rajkamal Prakashan Samuh</p>' +
      '<h1 class="auth-brand__title">' + esc(b[0]) + "</h1>" +
      '<p class="auth-brand__text">' + esc(b[1]) + "</p>" +
      '<ul class="auth-perks">' +
        "<li>" + I.track + "<span>Track every order from dispatch to doorstep</span></li>" +
        "<li>" + I.heart + "<span>Save books to wishlists and come back to them</span></li>" +
        "<li>" + I.bolt + "<span>Faster checkout with saved addresses</span></li>" +
      "</ul>" +
      (picks.length ? '<div class="auth-stack" aria-hidden="true">' + picks.map(function (p, i) { return '<img src="../../books/covers/' + esc(p[4]) + '.jpg" alt="" style="--i:' + i + '" onerror="this.remove()">'; }).join("") + "</div>" : "") +
    "</aside>";
  }
  function page(card) { root.innerHTML = '<div class="hp-wrap auth-wrap">' + brand() + '<section class="auth-card">' + card + "</section></div>"; }

  /* ---------- small building blocks ---------- */
  function tabs(name, items, on) {
    return '<div class="auth-tabs" role="tablist" aria-label="' + esc(name) + '">' + items.map(function (t) {
      return '<button type="button" role="tab" class="auth-tab' + (t[0] === on ? " is-on" : "") + '" data-tab="' + t[0] + '" aria-selected="' + (t[0] === on) + '">' + t[2] + "<span>" + esc(t[1]) + "</span></button>";
    }).join("") + "</div>";
  }
  function field(o) {
    var id = "f-" + o.name;
    return '<div class="auth-field' + (o.prefix ? " auth-field--prefix" : "") + '">' +
      '<label for="' + id + '">' + esc(o.label) + (o.optional ? " <i>(optional)</i>" : "") + "</label>" +
      '<div class="auth-input">' + (o.prefix ? '<span class="auth-prefix">' + o.prefix + "</span>" : "") +
        '<input id="' + id + '" name="' + o.name + '" type="' + (o.type || "text") + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") +
        (o.auto ? ' autocomplete="' + o.auto + '"' : "") + (o.mode ? ' inputmode="' + o.mode + '"' : "") + (o.value ? ' value="' + esc(o.value) + '"' : "") + ' aria-describedby="' + id + '-msg">' +
        (o.type === "password" ? '<button type="button" class="auth-eye" data-eye="' + id + '" aria-label="Show password" aria-pressed="false">' + I.eye + "</button>" : "") +
      "</div>" +
      '<p class="auth-msg" id="' + id + '-msg">' + esc(o.help || "") + "</p>" +
      (o.meter ? '<div class="auth-meter" data-meter="' + id + '" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' : "") +
    "</div>";
  }
  function primary(label) { return '<button type="submit" class="auth-btn">' + esc(label) + "</button>"; }
  var DEMO = '<p class="auth-demo">Design preview — nothing is sent, and any 6-digit code signs you in.</p>';
  function state(kind, title, text, actions) {
    return '<div class="auth-state auth-state--' + kind + '"><span class="auth-state__ic">' + I[kind === "ok" ? "ok" : kind === "mail" ? "inbox" : "warn"] + "</span>" +
      "<h2>" + esc(title) + "</h2><p>" + text + "</p>" + (actions || "") + "</div>";
  }

  /* ---------- validation ---------- */
  function cleanPhone(v) { return v.replace(/[\s()-]/g, ""); }
  function phoneOk(v) { v = cleanPhone(v); return /^[6-9]\d{9}$/.test(v) || /^\+\d{8,15}$/.test(v); }
  function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  function strength(v) { var s = 0; if (v.length >= 8) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) s++; return s; }
  function setErr(input, msg) {
    var m = document.getElementById(input.id + "-msg");
    input.closest(".auth-field").classList.toggle("is-bad", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (m) { if (m.dataset.help === undefined) m.dataset.help = m.textContent; m.textContent = msg || m.dataset.help; m.setAttribute("role", msg ? "alert" : "status"); }
    return !msg;
  }
  function maskPhone(v) { v = cleanPhone(v); var n = v.replace(/^\+?91(?=\d{10}$)/, ""); return (v[0] === "+" && n === v ? "" : "+91 ") + n.slice(0, 2) + "•••••" + n.slice(-3); }
  function maskEmail(v) { var p = v.trim().split("@"); return p[0].slice(0, 2) + "•••@" + p[1]; }

  /* ---------- shared wiring: show/hide password, strength meter, tabs ---------- */
  root.addEventListener("click", function (e) {
    var eye = e.target.closest("[data-eye]");
    if (eye) {
      var inp = document.getElementById(eye.dataset.eye), show = inp.type === "password";
      inp.type = show ? "text" : "password"; eye.setAttribute("aria-pressed", String(show)); eye.setAttribute("aria-label", show ? "Hide password" : "Show password");
    }
  });
  root.addEventListener("input", function (e) {
    var t = e.target;
    if (t.closest(".is-bad")) setErr(t, "");
    var meter = root.querySelector('[data-meter="' + t.id + '"]');
    if (meter) { var s = t.value ? Math.max(1, strength(t.value)) : 0; meter.setAttribute("data-s", s); }
  });
  function onTabs(handler) {
    var list = root.querySelector(".auth-tabs"); if (!list) return;
    list.addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) handler(b.dataset.tab); });
    list.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var all = [].slice.call(list.querySelectorAll("[data-tab]")), i = all.indexOf(document.activeElement);
      if (i < 0) return; e.preventDefault();
      var n = all[(i + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length]; handler(n.dataset.tab); root.querySelector('[data-tab="' + n.dataset.tab + '"]').focus();
    });
  }

  /* ---------- OTP step (login + register) ---------- */
  function otpStep(dest, via, back, done) {
    var timer;
    function draw() {
      root.querySelector(".auth-card").innerHTML =
        '<button type="button" class="auth-back" data-back>← Change ' + (via === "WhatsApp" ? "number" : "email") + "</button>" +
        "<h2>Enter the 6-digit code</h2>" +
        '<p class="auth-lede">We sent a code ' + (via === "WhatsApp" ? "on WhatsApp to " : "to ") + "<b>" + esc(dest) + "</b>. It's valid for 10 minutes.</p>" +
        '<form class="auth-form" novalidate><div class="auth-otp" role="group" aria-label="6-digit code">' +
          [0, 1, 2, 3, 4, 5].map(function (i) { return '<input type="text" inputmode="numeric" autocomplete="' + (i ? "off" : "one-time-code") + '" maxlength="1" aria-label="Digit ' + (i + 1) + '">'; }).join("") +
        '</div><p class="auth-msg auth-otp-msg" role="status"></p>' + primary("Verify & continue") +
        '<p class="auth-resend"><span data-left></span><button type="button" class="auth-link" data-resend hidden>Resend code</button></p></form>' + DEMO;
      var boxes = [].slice.call(root.querySelectorAll(".auth-otp input"));
      boxes[0].focus();
      boxes.forEach(function (b, i) {
        b.addEventListener("input", function () {
          b.value = b.value.replace(/\D/g, "").slice(-1);
          root.querySelector(".auth-otp").classList.remove("is-bad");
          if (b.value && boxes[i + 1]) boxes[i + 1].focus();
          if (boxes.every(function (x) { return x.value; })) root.querySelector(".auth-form").requestSubmit();
        });
        b.addEventListener("keydown", function (e) {
          if (e.key === "Backspace" && !b.value && boxes[i - 1]) { boxes[i - 1].focus(); boxes[i - 1].value = ""; e.preventDefault(); }
          else if (e.key === "ArrowLeft" && boxes[i - 1]) boxes[i - 1].focus();
          else if (e.key === "ArrowRight" && boxes[i + 1]) boxes[i + 1].focus();
        });
        b.addEventListener("paste", function (e) {
          var d = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
          if (!d) return; e.preventDefault();
          d.split("").forEach(function (c, j) { if (boxes[j]) boxes[j].value = c; });
          (boxes[d.length] || boxes[5]).focus();
          if (d.length === 6) root.querySelector(".auth-form").requestSubmit();
        });
      });
      var left = 30, lbl = root.querySelector("[data-left]"), again = root.querySelector("[data-resend]");
      function tick() {
        if (left > 0) { lbl.textContent = "Resend code in 0:" + (left < 10 ? "0" : "") + left; left--; }
        else { clearInterval(timer); lbl.textContent = "Didn't get it? "; again.hidden = false; }
      }
      clearInterval(timer); tick(); timer = setInterval(tick, 1000);
      again.addEventListener("click", function () { again.hidden = true; left = 30; tick(); timer = setInterval(tick, 1000); toast("A new code is on its way"); });
      root.querySelector("[data-back]").addEventListener("click", function () { clearInterval(timer); back(); });
      root.querySelector(".auth-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var code = boxes.map(function (x) { return x.value; }).join("");
        if (code.length < 6) {
          root.querySelector(".auth-otp").classList.add("is-bad");
          root.querySelector(".auth-otp-msg").textContent = "Enter all 6 digits of the code.";
          (boxes.filter(function (x) { return !x.value; })[0] || boxes[0]).focus();
          return;
        }
        clearInterval(timer); done();
      });
    }
    draw();
  }
  function signIn(profilePatch, msg) {
    if (profilePatch) { var p = read("rk-profile", {}); Object.keys(profilePatch).forEach(function (k) { if (profilePatch[k]) p[k] = profilePatch[k]; }); write("rk-profile", p); }
    write("rk-signed-in", true);
    root.querySelector(".auth-card").innerHTML = state("ok", msg || "You're signed in", "Taking you to your account…");
    setTimeout(function () { location.href = nextUrl(); }, 900);
  }

  /* ---------- LOGIN ---------- */
  function login() {
    var mode = q.get("mode") === "password" ? "password" : "otp", tab = mode === "password" ? "email" : "mobile";
    function draw() {
      var otp = mode === "otp";
      page(
        "<h2>Sign in to your account</h2>" +
        '<p class="auth-lede">' + (otp ? "Use your mobile number or email to get a one-time code." : "Sign in with your password.") + ' <span class="auth-nowrap">New here? <a class="auth-link" href="' + withNext("../register/") + '">Create account</a></span></p>' +
        tabs("Sign-in method", otp ? [["mobile", "Mobile OTP", I.phone], ["email", "Email OTP", I.mail]] : [["mobile", "Mobile + Password", I.phone], ["email", "Email + Password", I.mail]], tab) +
        '<form class="auth-form" novalidate>' +
          (tab === "mobile"
            ? field({ name: "phone", label: "Mobile number", type: "tel", ph: "10-digit mobile number", prefix: "+91", auto: "tel-national", mode: "tel", help: otp ? "WhatsApp preferred. International numbers supported." : "" })
            : field({ name: "email", label: "Email address", type: "email", ph: "you@example.com", auto: "email" })) +
          (otp ? "" : field({ name: "password", label: "Password", type: "password", ph: "Your password", auto: "current-password" }) + '<p class="auth-row"><a class="auth-link" href="../forgot-password/">Forgot password?</a></p>') +
          (otp ? '<p class="auth-note">OTP valid for 10 minutes.</p>' : "") +
          primary(otp ? "Send code" : "Sign in") +
        "</form>" +
        '<p class="auth-switch">' + (otp ? 'Prefer a password? <a class="auth-link" href="' + withNext("?mode=password") + '">Login via password instead</a>'
                                         : 'Prefer OTP? <a class="auth-link" href="' + withNext("./") + '">Login via OTP instead</a>') + "</p>" + DEMO);
      onTabs(function (t) { if (t !== tab) { tab = t; draw(); root.querySelector(".auth-form input").focus(); } });
      root.querySelector(".auth-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target, ok = true, ph = f.phone, em = f.email, pw = f.password;
        if (ph) ok = setErr(ph, !ph.value.trim() ? "Enter your mobile number." : phoneOk(ph.value) ? "" : "Enter a valid 10-digit mobile number (or +country code).") && ok;
        if (em) ok = setErr(em, !em.value.trim() ? "Enter your email address." : emailOk(em.value) ? "" : "That email doesn't look right.") && ok;
        if (pw) ok = setErr(pw, pw.value ? "" : "Enter your password.") && ok;
        if (!ok) { f.querySelector("[aria-invalid=true]").focus(); return; }
        if (!otp) return signIn(null, "Welcome back!");
        otpStep(ph ? maskPhone(ph.value) : maskEmail(em.value), ph ? "WhatsApp" : "email", draw, function () { signIn(null, "Welcome back!"); });
      });
    }
    draw();
  }

  /* ---------- REGISTER ---------- */
  function register() {
    var tab = "mobile", saved = {};
    function details() {
      root.querySelector(".auth-card").innerHTML =
        "<h2>Tell us about you</h2><p class=\"auth-lede\">You're in! Add your name so we know what to call you.</p>" +
        '<form class="auth-form" novalidate>' +
          field({ name: "name", label: "Full name", ph: "Enter your full name", auto: "name" }) +
          field({ name: "email", label: "Email", type: "email", ph: "name@example.com", auto: "email", optional: true, value: saved.email || "", help: "For order updates and receipts." }) +
          primary("Finish") + "</form>";
      root.querySelector("#f-name").focus();
      root.querySelector(".auth-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target, ok = setErr(f.elements.namedItem("name"), !f.elements.namedItem("name").value.trim() ? "Enter your name." : window.RKForms.nameOk(f.elements.namedItem("name").value) ? "" : "Use letters only — no numbers or symbols.");
        ok = setErr(f.email, !f.email.value.trim() || emailOk(f.email.value) ? "" : "That email doesn't look right.") && ok;
        if (!ok) return f.querySelector("[aria-invalid=true]").focus();
        signIn({ name: f.elements.namedItem("name").value.trim(), email: f.email.value.trim(), phone: saved.phone, since: new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }) }, "Account created");
      });
    }
    function draw() {
      var mob = tab === "mobile";
      page(
        "<h2>Create an account</h2>" +
        '<p class="auth-lede">It takes less than a minute. <span class="auth-nowrap"><a class="auth-link" href="' + withNext("../login/") + '">Sign in instead</a></span></p>' +
        tabs("Sign-up method", [["mobile", "Mobile OTP", I.phone], ["email", "Email & Password", I.mail]], tab) +
        '<form class="auth-form" novalidate>' +
          (mob
            ? '<p class="auth-note auth-note--top">Use your mobile number to sign in with OTP. We will ask for your name and email after you are in.</p>' +
              field({ name: "phone", label: "Mobile number", type: "tel", ph: "Enter 10-digit mobile number", prefix: "+91", auto: "tel-national", mode: "tel", help: "WhatsApp preferred. International numbers supported." }) +
              field({ name: "email", label: "Email", type: "email", ph: "name@example.com (optional)", auto: "email", optional: true, help: "Used only if mobile delivery fails." }) +
              '<p class="auth-note">OTP valid for 10 minutes.</p>' + primary("Send code")
            : field({ name: "name", label: "Full name", ph: "Enter your full name", auto: "name" }) +
              field({ name: "email", label: "Email address", type: "email", ph: "name@example.com", auto: "email" }) +
              field({ name: "password", label: "Password", type: "password", ph: "At least 8 characters", auto: "new-password", help: "At least 8 characters. Mix letters and numbers for a stronger password.", meter: true }) +
              primary("Create account")) +
        "</form>" +
        '<p class="auth-fine">By continuing you agree to our <a class="auth-link" href="https://www.rajkamalprakashan.com/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms</a> and <a class="auth-link" href="https://www.rajkamalprakashan.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>' + DEMO);
      onTabs(function (t) { if (t !== tab) { tab = t; draw(); root.querySelector(".auth-form input").focus(); } });
      root.querySelector(".auth-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target, ok = true;
        if (mob) {
          ok = setErr(f.phone, !f.phone.value.trim() ? "Enter your mobile number." : phoneOk(f.phone.value) ? "" : "Enter a valid 10-digit mobile number (or +country code).");
          ok = setErr(f.email, !f.email.value.trim() || emailOk(f.email.value) ? "" : "That email doesn't look right.") && ok;
          if (!ok) return f.querySelector("[aria-invalid=true]").focus();
          saved = { phone: cleanPhone(f.phone.value), email: f.email.value.trim() };
          otpStep(maskPhone(f.phone.value), "WhatsApp", draw, details);
        } else {
          ok = setErr(f.elements.namedItem("name"), !f.elements.namedItem("name").value.trim() ? "Enter your name." : window.RKForms.nameOk(f.elements.namedItem("name").value) ? "" : "Use letters only — no numbers or symbols.");
          ok = setErr(f.email, !f.email.value.trim() ? "Enter your email address." : emailOk(f.email.value) ? "" : "That email doesn't look right.") && ok;
          ok = setErr(f.password, f.password.value.length >= 8 ? "" : "Use at least 8 characters.") && ok;
          if (!ok) return f.querySelector("[aria-invalid=true]").focus();
          var p = read("rk-profile", {}); p.name = f.elements.namedItem("name").value.trim(); p.email = f.email.value.trim(); write("rk-profile", p);
          root.querySelector(".auth-card").innerHTML = state("mail", "Check your inbox", "We've sent a verification link to <b>" + esc(maskEmail(f.email.value)) + "</b>. Open it to activate your account.",
            '<a class="auth-btn" href="../verify/?token=demo">Open the link (demo)</a><a class="auth-link auth-state__alt" href="../login/">Back to sign in</a>');
        }
      });
    }
    draw();
  }

  /* ---------- FORGOT PASSWORD ---------- */
  function forgot() {
    page(
      "<h2>Reset your password</h2>" +
      "<p class=\"auth-lede\">Enter the email address linked to your account and we'll send you a secure link to choose a new password.</p>" +
      '<form class="auth-form" novalidate>' + field({ name: "email", label: "Email address", type: "email", ph: "you@example.com", auto: "email" }) + primary("Send reset link") + "</form>" +
      '<p class="auth-switch">Remembered it? <a class="auth-link" href="../login/?mode=password">Return to sign in</a></p>');
    root.querySelector(".auth-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var em = e.target.email;
      if (!setErr(em, !em.value.trim() ? "Enter your email address." : emailOk(em.value) ? "" : "That email doesn't look right.")) return em.focus();
      root.querySelector(".auth-card").innerHTML = state("mail", "Check your email",
        "If an account exists for <b>" + esc(maskEmail(em.value)) + "</b>, a reset link is on its way. It works once and expires in an hour.",
        '<a class="auth-btn" href="../reset-password/?token=demo">Open the reset link (demo)</a><a class="auth-link auth-state__alt" href="../login/?mode=password">Return to sign in</a>');
    });
  }

  /* ---------- RESET PASSWORD ---------- */
  function reset() {
    if (!q.get("token")) {
      page(state("warn", "Reset link missing", "The password reset link is incomplete or has expired. Request a fresh link to continue.",
        '<a class="auth-btn" href="../forgot-password/">Request new link</a>'));
      return;
    }
    page(
      "<h2>Create a new password</h2><p class=\"auth-lede\">Choose a password you haven't used here before.</p>" +
      '<form class="auth-form" novalidate>' +
        field({ name: "password", label: "New password", type: "password", ph: "At least 8 characters", auto: "new-password", help: "At least 8 characters. Mix letters and numbers for a stronger password.", meter: true }) +
        field({ name: "confirm", label: "Confirm new password", type: "password", ph: "Type it again", auto: "new-password" }) +
        primary("Update password") + "</form>");
    root.querySelector(".auth-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target, ok = setErr(f.password, f.password.value.length >= 8 ? "" : "Use at least 8 characters.");
      ok = setErr(f.confirm, !f.confirm.value ? "Type the password again." : f.confirm.value === f.password.value ? "" : "The passwords don't match.") && ok;
      if (!ok) return f.querySelector("[aria-invalid=true]").focus();
      root.querySelector(".auth-card").innerHTML = state("ok", "Password updated", "You can now sign in with your new password.",
        '<a class="auth-btn" href="../login/?mode=password">Sign in</a>');
    });
  }

  /* ---------- VERIFY EMAIL ---------- */
  function verify() {
    if (!q.get("token")) {
      page(state("warn", "We could not verify your email", "Verification token is missing. Please use the link from your email.",
        '<a class="auth-btn" href="../login/">Go to sign in</a><p class="auth-state__fine">Need a new link? Try registering again or contact support if the issue persists.</p>'));
      return;
    }
    write("rk-signed-in", true);
    page(state("ok", "Email verified", "Thanks — your account is active and you're signed in.",
      '<a class="auth-btn" href="' + esc(nextUrl()) + '">Continue to your account</a><a class="auth-link auth-state__alt" href="../../books/?g=all">Start browsing books</a>'));
  }

  ({ login: login, register: register, "forgot-password": forgot, "reset-password": reset, verify: verify }[view] || login)();
})();
