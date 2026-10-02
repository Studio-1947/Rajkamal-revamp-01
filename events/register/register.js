/* Event registration: fields and bilingual labels as on rajkamalprakashan.com/events/<id>/register.
   Design preview: the registration is kept in this browser only (localStorage "rk-event-regs"). */
(function () {
  var U = window.RKEv,
    esc = U.esc,
    F = window.RK_EVENT_FORM || { categories: [], heard: [] };
  var id = new URLSearchParams(location.search).get("id"),
    e = U.byId(id);
  var root = document.getElementById("evRoot"),
    crumbs = document.getElementById("evCrumbs");
  function read(k, d) {
    try {
      var v = JSON.parse(localStorage.getItem(k) || "null");
      return v == null ? d : v;
    } catch (x) {
      return d;
    }
  }
  function write(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (x) {}
  }
  crumbs.innerHTML =
    '<a href="../../home/">Home</a><span>/</span><a href="../">Events</a>' +
    (e
      ? '<span>/</span><a href="../event/?id=' +
        encodeURIComponent(e.id) +
        '" lang="hi">' +
        esc(e.title) +
        "</a><span>/</span><b>Register</b>"
      : "");
  if (!e) {
    root.innerHTML =
      '<div class="pd-missing"><h1>Event not found</h1><a class="bk-btn bk-btn--buy" href="../">See all events</a></div>';
    return;
  }
  document.title = "Register — " + e.title + " | Rajkamal Offers";
  var s = U.status(e),
    back =
      '<a class="evr-back" href="../event/?id=' +
      encodeURIComponent(e.id) +
      '" lang="hi">← कार्यक्रम पर वापस जाएँ</a>';
  var summary =
    '<div class="evr-event"><img src="../' +
    esc(e.imgs[0]) +
    '" alt=""><div><b lang="hi">' +
    esc(e.title) +
    '</b><span lang="hi">' +
    esc(e.sub) +
    "</span><span>" +
    esc(U.when(e)) +
    "</span></div></div>";
  if (!e.register || s.k === "past") {
    root.innerHTML =
      '<div class="evr">' +
      back +
      '<section class="evr-card evr-done"><h1>Registration is closed</h1><p>' +
      (s.k === "past"
        ? "This event has already taken place."
        : "This event doesn't need registration — just come along.") +
      "</p>" +
      summary +
      '<a class="ev-btn" href="../">See upcoming events</a></section></div>';
    return;
  }
  var mine = read("rk-event-regs", {})[e.id],
    V = window.RKForms;
  function sel(name, label, opts) {
    return (
      '<div class="evr-field"><label for="r-' +
      name +
      '" lang="hi">' +
      label +
      '</label><select id="r-' +
      name +
      '" name="' +
      name +
      '"><option value="" lang="hi">एक विकल्प चुनें / Select an option</option>' +
      opts
        .map(function (o) {
          return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>";
        })
        .join("") +
      "</select></div>"
    );
  }
  function done(r) {
    root.innerHTML =
      '<div class="evr">' +
      back +
      '<section class="evr-card evr-done" tabindex="-1"><span class="evr-ok" aria-hidden="true">✓</span>' +
      "<h1>You're registered!</h1><p>See you there, " +
      esc(r.name.split(" ")[0]) +
      ". " +
      (r.email
        ? "We'll send the details to <b>" + esc(r.email) + "</b>."
        : "We'll message the details to <b>" + esc(r.phone) + "</b>.") +
      "</p>" +
      summary +
      '<div class="evr-actions"><button type="button" class="ev-btn" data-ics>Add to calendar</button><a class="ev-btn ev-btn--ghost" href="' +
      esc(e.map || "../event/?id=" + e.id) +
      '"' +
      (e.map ? ' target="_blank" rel="noopener noreferrer"' : "") +
      ">Get directions</a></div>" +
      '<p class="evr-fine">Design preview — nothing was sent; this registration is saved in this browser only.</p></section></div>';
    root.querySelector(".evr-done").focus();
  }
  if (mine) {
    done(mine);
    return;
  }
  root.innerHTML =
    '<div class="evr">' +
    back +
    '<section class="evr-card"><h1>Event Registration</h1>' +
    summary +
    '<form class="evr-form" novalidate>' +
    '<div class="evr-field"><label lang="hi">कार्यक्रम / Event</label><p class="evr-static" lang="hi">' +
    esc(e.title) +
    "</p></div>" +
    '<div class="evr-field"><label for="r-name" lang="hi">नाम / Name <b aria-hidden="true">*</b></label><input id="r-name" name="name" type="text" autocomplete="name" data-rule="name" placeholder="Enter your full name / अपना पूरा नाम लिखें" required aria-describedby="r-name-msg"><p class="evr-msg" id="r-name-msg"></p></div>' +
    '<div class="evr-two">' +
    '<div class="evr-field"><label for="r-phone" lang="hi">मोबाइल नंबर / Mobile Number</label><input id="r-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" data-rule="phone" placeholder="Enter 10-digit mobile number / 10 अंकों का मोबाइल नंबर" maxlength="16" aria-describedby="r-phone-msg"><p class="evr-msg" id="r-phone-msg"></p></div>' +
    '<div class="evr-field"><label for="r-email" lang="hi">ई-मेल / E-Mail</label><input id="r-email" name="email" type="email" autocomplete="email" placeholder="name@example.com / ई-मेल पता" aria-describedby="r-email-msg"><p class="evr-msg" id="r-email-msg"></p></div>' +
    "</div>" +
    sel("cat", "आप किस रूप में आ रहे हैं? / Category", F.categories) +
    sel(
      "heard",
      "आपको इस कार्यक्रम के बारे में कैसे पता चला? / How did you hear about this event?",
      F.heard,
    ) +
    '<div class="evr-field" id="rOther" hidden><label for="r-other">Please specify</label><input id="r-other" name="other" type="text" placeholder="Where did you hear about it?"></div>' +
    '<button type="submit" class="ev-btn ev-btn--block" lang="hi">पंजीकरण करें / Register</button>' +
    '<p class="evr-fine">We\'ll only use your details for this event.</p>' +
    "</form></section></div>";
  var form = root.querySelector(".evr-form");
  function err(input, msg) {
    var m = document.getElementById(input.id + "-msg");
    input.closest(".evr-field").classList.toggle("is-bad", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (m) m.textContent = msg;
    return !msg;
  }
  form.addEventListener("input", function (x) {
    if (x.target.closest(".is-bad")) err(x.target, "");
  });
  form.name.addEventListener("blur", function () {
    var v = form.name.value.trim();
    if (v && (!V.nameOk(v) || /\d/.test(v)))
      err(form.name, "Name can only contain letters — no numbers or symbols.");
  });
  form.phone.addEventListener("blur", function () {
    var p = form.phone.value.replace(/[\s()-]/g, "");
    if (p && !V.phoneOk(p))
      err(
        form.phone,
        "Enter a valid 10-digit mobile number starting with 6–9.",
      );
  });
  form.email.addEventListener("blur", function () {
    var em = form.email.value.trim();
    if (em && !V.emailOk(em))
      err(form.email, "Enter a valid email address (e.g. name@example.com).");
  });
  form.heard.addEventListener("change", function () {
    document.getElementById("rOther").hidden = form.heard.value !== "other";
  });
  form.addEventListener("submit", function (x) {
    x.preventDefault();
    var nm = form.elements.namedItem("name"),
      ph = form.phone,
      em = form.email;
    var p = ph.value.replace(/[\s()-]/g, "");
    var ok = err(
      nm,
      !nm.value.trim()
        ? "Enter your name."
        : /\d/.test(nm.value) || !V.nameOk(nm.value)
          ? "Name can only contain letters — no numbers or symbols."
          : "",
    );
    ok =
      err(
        ph,
        !p || V.phoneOk(p)
          ? ""
          : "Enter a valid 10-digit mobile number starting with 6–9.",
      ) && ok;
    ok =
      err(
        em,
        !em.value.trim() || V.emailOk(em.value)
          ? ""
          : "That email doesn't look right.",
      ) && ok;
    if (ok && !p && !em.value.trim())
      ok = err(
        ph,
        "Add a mobile number or email so we can send you the details.",
      );
    if (!ok) {
      form.querySelector("[aria-invalid=true]").focus();
      return;
    }
    var r = {
      name: nm.value.trim(),
      phone: p,
      email: em.value.trim(),
      cat: form.cat.value,
      heard: form.heard.value,
      other: form.other.value.trim(),
      at: new Date().toISOString(),
    };
    var all = read("rk-event-regs", {});
    all[e.id] = r;
    write("rk-event-regs", all);
    done(r);
  });
  root.addEventListener("click", function (x) {
    if (x.target.closest("[data-ics]")) {
      U.ics(e, new URL("../event/?id=" + e.id, location.href).href);
      if (window.RKStore) window.RKStore.toast("Calendar file downloaded");
    }
  });
})();
