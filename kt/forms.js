/* Type-safe form fields, site-wide. Characters that don't belong in a field can't be typed or pasted into it:
   mobile numbers   → digits (and one leading "+" for international numbers), 10 digits for Indian numbers
   PIN / codes      → digits only, fixed length
   amounts          → digits only
   names, city      → letters (any script, so Hindi works), spaces and . ' -
   tracking numbers → letters and digits, upper-case
   A field can opt in or out with data-rule="phone|digits|name|code|off". */
(function () {
  var RULES = {
    phone: function (v) {
      var plus = /^\s*\+/.test(v),
        d = v.replace(/\D/g, "");
      return plus ? "+" + d.slice(0, 15) : d.slice(0, 10);
    },
    digits: function (v, el) {
      var d = v.replace(/\D/g, ""),
        max =
          +el.getAttribute("data-max") || +el.getAttribute("maxlength") || 0;
      return max > 0 ? d.slice(0, max) : d;
    },
    name: function (v) {
      return v
        .replace(/[^\p{L}\p{M} .'-]/gu, "")
        .replace(/\s{2,}/g, " ")
        .replace(/^\s+/, "");
    },
    name: function (v) {
      return v
        .replace(/\d+/g, "")
        .replace(/[^\p{L}\p{M} .'-]/gu, "")
        .replace(/\s{2,}/g, " ")
        .replace(/^\s+/, "");
    },
    code: function (v) {
      return v
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, "")
        .slice(0, 25);
    },
  };
  /* which rule a field gets when it doesn't say */
  function ruleFor(el) {
    if (el.dataset.rule)
      return el.dataset.rule === "off" ? null : el.dataset.rule;
    var n = (el.name || "").toLowerCase(),
      ac = (el.getAttribute("autocomplete") || "").toLowerCase();
    if (
      el.type === "tel" ||
      n === "phone" ||
      n === "mobile" ||
      ac.indexOf("tel") === 0
    )
      return "phone";
    if (n === "pin" || n === "pincode" || n === "gcpin") {
      if (!el.getAttribute("maxlength")) el.setAttribute("maxlength", "6");
      return "digits";
    }
    if (n === "amt" || n === "amount" || n === "qty") return "digits";
    if (
      n === "name" ||
      n === "toname" ||
      n === "fullname" ||
      n === "city" ||
      n === "state" ||
      ac === "name"
    )
      return "name";
    if (n === "awb" || n === "gcnum") return "code";
    var n = ((el.name || "") + " " + (el.id || "")).toLowerCase(),
      ac = (el.getAttribute("autocomplete") || "").toLowerCase();
    if (
      el.type === "tel" ||
      /phone|mobile|contact/.test(n) ||
      ac.indexOf("tel") === 0
    )
      return "phone";
    if (/pin|pincode|gcpin|otp|amt|amount|qty/.test(n)) {
      if (!el.getAttribute("maxlength") && /pin/.test(n))
        el.setAttribute("maxlength", "6");
      return "digits";
    }
    if (/name|fullname|toname|city|state/.test(n) || ac === "name")
      return "name";
    if (/awb|gcnum/.test(n)) return "code";
    return null;
  }
  function prep(el) {
    var r = ruleFor(el);
    if (!r) return null;
    if (r === "phone") {
      el.setAttribute("inputmode", "tel");
      if (!el.getAttribute("maxlength")) el.setAttribute("maxlength", "16");
    }
    if (r === "digits") el.setAttribute("inputmode", "numeric");
    if (r === "name") {
      el.setAttribute("autocapitalize", "words");
      el.setAttribute("spellcheck", "false");
    }
    if (r === "code") el.setAttribute("autocapitalize", "characters");
    return r;
  }

  /* prevent invalid characters before they even appear */
  document.addEventListener(
    "beforeinput",
    function (e) {
      var el = e.target;
      if (!el || el.tagName !== "INPUT" || !e.data) return;
      var r = prep(el);
      if (!r) return;
      if (r === "name" && /\d/.test(e.data)) {
        e.preventDefault();
        return;
      }
      if (r === "digits" && /\D/.test(e.data)) {
        e.preventDefault();
        return;
      }
      if (r === "phone" && /[^\d+]/.test(e.data)) {
        e.preventDefault();
        return;
      }
    },
    true,
  );

  /* keydown fallback */
  document.addEventListener(
    "keydown",
    function (e) {
      var el = e.target;
      if (
        !el ||
        el.tagName !== "INPUT" ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.key.length !== 1
      )
        return;
      var r = prep(el);
      if (!r) return;
      if (r === "name" && /[0-9]/.test(e.key)) {
        e.preventDefault();
        return;
      }
      if (r === "digits" && !/[0-9]/.test(e.key)) {
        e.preventDefault();
        return;
      }
      if (r === "phone" && !/[0-9+]/.test(e.key)) {
        e.preventDefault();
        return;
      }
    },
    true,
  );

  document.addEventListener(
    "input",
    function (e) {
      var el = e.target;
      if (
        !el ||
        el.tagName !== "INPUT" ||
        /^(checkbox|radio|date|email|password|search|file|hidden|submit|button)$/.test(
          el.type,
        )
      )
        return;
      var r = prep(el);
      if (!r) return;
      var before = el.value,
        after = RULES[r](before, el);
      if (after === before) return;
      var pos = el.selectionStart,
        cut = before.length - after.length;
      el.value = after;
      try {
        var p = Math.max(0, (pos || after.length) - cut);
        el.setSelectionRange(p, p);
      } catch (x) {} // keep the caret where the person was typing
    },
    true,
  );
  /* set inputmode / maxlength up front so phones show the right keyboard */
  function scan(rootEl) {
    (rootEl || document).querySelectorAll("input").forEach(function (el) {
      if (
        !/^(checkbox|radio|date|email|password|search|file|hidden|submit|button)$/.test(
          el.type,
        )
      )
        prep(el);
    });
  }
  if (document.readyState !== "loading") scan();
  else
    document.addEventListener("DOMContentLoaded", function () {
      scan();
    });
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1) scan(n);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* shared checks for submit-time validation */
  window.RKForms = {
    nameOk: function (v) {
      v = String(v || "").trim();
      return v.length >= 2 && /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(v);
    },
    nameOk: function (v) {
      v = String(v || "").trim();
      return (
        v.length >= 2 &&
        !/\d/.test(v) &&
        /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(v)
      );
    },
    phoneOk: function (v) {
      v = String(v || "").replace(/[\s()-]/g, "");
      return /^[6-9]\d{9}$/.test(v) || /^\+\d{8,15}$/.test(v);
    },
    emailOk: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
    },
    pinOk: function (v) {
      return /^[1-9]\d{5}$/.test(String(v || ""));
    },
  };
})();
