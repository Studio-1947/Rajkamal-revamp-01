/* Publications: the 12 imprints of Rajkamal Prakashan Samuh, each opening its own imprint page. */
(function () {
  var I = window.RK_IMPRINTS || [];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function n(x) { return x.toLocaleString("en-IN"); }
  var total = I.reduce(function (s, x) { return s + x.count; }, 0);
  document.getElementById("pbCount").textContent = I.length + " imprints · " + n(total) + " titles";
  document.getElementById("pbGrid").innerHTML = I.map(function (x) {
    return '<a class="pb-card" href="imprint/?id=' + encodeURIComponent(x.id) + '">' +
      '<span class="pb-logo"><img src="logos/' + esc(x.id) + '.png" alt="' + esc(x.name) + ' logo" loading="lazy"></span>' +
      '<span class="pb-name">' + esc(x.name) + "</span>" +
      '<span class="pb-sub">' + esc(x.parent || "Rajkamal Prakashan Samuh") + "</span>" +
      '<span class="pb-count' + (x.count ? "" : " is-soon") + '">' + (x.count ? n(x.count) + " titles" : "Titles coming soon") + "</span></a>";
  }).join("");
})();
