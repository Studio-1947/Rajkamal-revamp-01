/* Thumbnails open their book catalogue (books/?c=<collection>). */
(function () {
  var SLUGS = ["khud-se-judein", "mitti-se-judein", "vicharon-se-judein", "bhasha-se-judein", "sawalon-se-dudein",
    "yatraon-se-judein", "virasat-se-judein", "nai-kalam-se-judein", "geeton-se-judein",
    "geeton-se-judein", "yatraon-se-judein", "khud-se-judein"]; // Set 3's extra cards
  /* which page the visitor came from, so the catalogue's Back link returns there (offers/ or hp/) */
  var m = location.pathname.match(/\/(offers|hp)\/?(?:index\.html)?$/);
  var page = m ? m[1] : "home";
  function wire() {
    var cards = document.querySelectorAll("#cardGrid .book-card");
    if (!cards.length) return false;
    cards.forEach(function (c, i) {
      var slug = SLUGS[i % SLUGS.length];
      var t = (c.querySelector("h3") || {}).textContent || "";
      var url = "../books/?c=" + slug + "&t=" + encodeURIComponent(t.trim()) + "&from=" + page;
      c.setAttribute("role", "link");
      c.setAttribute("tabindex", "0");
      c.setAttribute("aria-label", t.trim() + " — view books");
      c.addEventListener("click", function () { setTimeout(function () { location.href = url; }, 60); });
      c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); location.href = url; } });
    });
    return true;
  }
  if (!wire()) window.addEventListener("load", wire);
})();
