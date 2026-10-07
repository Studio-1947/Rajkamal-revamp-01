/* Touch screens have no hover: the row of thumbnails nearest the middle of the screen (or the one just tapped) shows the "hover" look,
   with its diya lit, so people can see which card a tap will open. */
(function () {
  if (!window.matchMedia("(hover: none)").matches) return;
  var grid = document.getElementById("cardGrid");
  if (!grid) return;
  var cards = [], active = [], ticking = false, pinnedUntil = 0;

  /* light every card in the chosen row (phones show two per row — lighting only one left the right-hand card dark) */
  function setActive(list) {
    active.forEach(function (c) { if (list.indexOf(c) < 0) c.classList.remove("is-active"); });
    list.forEach(function (c) { c.classList.add("is-active"); });
    active = list;
  }
  function pick() {
    ticking = false;
    if (Date.now() < pinnedUntil) return;
    var mid = window.innerHeight * 0.5, bestD = Infinity, bestTop = null, rects = [];
    cards.forEach(function (c) {
      var r = c.getBoundingClientRect();
      rects.push(r);
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD - 0.5) { bestD = d; bestTop = r.top; }
    });
    setActive(bestTop === null ? [] : cards.filter(function (c, i) { return Math.abs(rects[i].top - bestTop) < 4; }));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(pick); } }

  function init() {
    cards = Array.prototype.slice.call(grid.querySelectorAll(".book-card"));
    if (!cards.length) return;
    cards.forEach(function (c) {
      c.addEventListener("click", function () { pinnedUntil = Date.now() + 2500; setActive([c]); });
    });
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }
  if (grid.children.length) init(); else window.addEventListener("load", init);
})();
