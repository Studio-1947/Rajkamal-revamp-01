/* Touch screens have no hover: the thumbnail nearest the middle of the screen (or the one just tapped) shows the "hover" look,
   with its diya lit, so people can see which card a tap will open. */
(function () {
  if (!window.matchMedia("(hover: none)").matches) return;
  var grid = document.getElementById("cardGrid");
  if (!grid) return;
  var cards = [], active = null, ticking = false, pinnedUntil = 0;

  function setActive(c) {
    if (c === active) return;
    if (active) active.classList.remove("is-active");
    active = c;
    if (active) active.classList.add("is-active");
  }
  function pick() {
    ticking = false;
    if (Date.now() < pinnedUntil) return;
    var mid = window.innerHeight * 0.5, best = null, bestD = Infinity;
    cards.forEach(function (c) {
      var r = c.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) { bestD = d; best = c; }
    });
    setActive(best);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(pick); } }

  function init() {
    cards = Array.prototype.slice.call(grid.querySelectorAll(".book-card"));
    if (!cards.length) return;
    cards.forEach(function (c) {
      c.addEventListener("click", function () { pinnedUntil = Date.now() + 2500; setActive(c); });
    });
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }
  if (grid.children.length) init(); else window.addEventListener("load", init);
})();
