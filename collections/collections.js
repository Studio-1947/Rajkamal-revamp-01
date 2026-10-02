/* Collections: the shelves in this offer (books-data.js, open here) + the live site's collections (open on rajkamalprakashan.com). */
(function () {
  var C = window.RK_COLLECTIONS || {}, LIVE = window.RK_LIVE_COLLECTIONS || [], SITE = "https://www.rajkamalprakashan.com";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var OUT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

  /* in this offer: every collection except the imprint shelves added by publications-data.js */
  var local = Object.keys(C).filter(function (k) { return k.indexOf("imprint-") !== 0; });
  document.getElementById("clLocal").innerHTML = local.map(function (k) {
    var c = C[k], covers = c.books.slice(0, 3);
    return '<a class="cl-card" href="../books/?c=' + encodeURIComponent(k) + '">' +
      '<span class="cl-stack" aria-hidden="true">' + covers.map(function (b, i) {
        return '<img src="../books/covers/' + esc(b[4]) + '.jpg" alt="" loading="lazy" style="--i:' + i + '" onerror="this.remove()">';
      }).join("") + "</span>" +
      '<span class="cl-name">' + esc(c.name) + '</span><span class="cl-meta">' + c.books.length + " books</span></a>";
  }).join("");

  function href(x) { return x.local ? "../books/?c=" + encodeURIComponent(x.local) : SITE + (x.path || "/collections/" + x.slug); }
  function ext(x) { return x.local ? "" : ' target="_blank" rel="noopener noreferrer"'; }
  var featured = LIVE.filter(function (x) { return x.img; }), rest = LIVE.filter(function (x) { return !x.img; });
  document.getElementById("clFeatured").innerHTML = featured.map(function (x) {
    return '<a class="cl-tile" href="' + href(x) + '"' + ext(x) + ' aria-label="' + esc(x.name) + (x.local ? "" : " (opens rajkamalprakashan.com)") + '">' +
      '<img src="img/' + esc(x.slug) + '.jpg" alt="" loading="lazy"></a>';
  }).join("");
  document.getElementById("clMore").innerHTML = rest.map(function (x) {
    return '<a class="cl-row" href="' + href(x) + '"' + ext(x) + "><span" + (/[ऀ-ॿ]/.test(x.name) ? ' lang="hi"' : "") + ">" + esc(x.name) + "</span>" + (x.local ? '<em>In this offer</em>' : OUT) + "</a>";
  }).join("");
  document.getElementById("clCount").textContent = local.length + " in this offer · " + LIVE.length + " on rajkamalprakashan.com";
})();
