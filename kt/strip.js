/* Sideways chip strips — content pages' side panel (About, FAQ, policies), the account page's section menu, and the
   chip rows of listing pages (All Books sort/filter, Authors, E-Books, Categories, Events).
   When a strip scrolls sideways (phones/tablets), show that it does: edge fades, a slim slider bar under it
   (thumb = the visible part; drag it or tap the track), the selected chip scrolled into view, and one gentle
   nudge per visit. The wrapper is display:contents until the strip actually scrolls, so desktop layouts
   (sticky side panels) are untouched. Strips added later (the account page redraws on every tab) are picked up too.
   Styles: end of kt/styles.css. */
(function () {
  var TARGETS = [".cnt-side", ".acc-side ul", ".bk-filters", ".au-chips"];
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setup(sc) {
    if (sc.__strip) return; sc.__strip = true;
    var wrap = document.createElement("div");
    wrap.className = "rk-strip" + (sc.closest(".acc-side") ? " rk-strip--acc" : "");
    sc.parentNode.insertBefore(wrap, sc);
    wrap.appendChild(sc);
    var bar = document.createElement("div");
    bar.className = "rk-strip__bar"; bar.setAttribute("aria-hidden", "true"); // the chips themselves stay keyboard / swipe reachable
    bar.innerHTML = "<i></i>";
    wrap.appendChild(bar);
    var thumb = bar.firstChild;

    function scrolls() { var o = getComputedStyle(sc).overflowX; return (o === "auto" || o === "scroll") && sc.scrollWidth - sc.clientWidth > 4; }
    function state() {
      var on = scrolls(), max = sc.scrollWidth - sc.clientWidth, x = sc.scrollLeft;
      wrap.classList.toggle("is-on", on);
      /* the row's own bottom spacing goes below the bar instead, so the bar sits right under the chips */
      if (on && !sc.__mb) { sc.__mb = getComputedStyle(sc).marginBottom; wrap.style.marginBottom = sc.__mb; sc.style.marginBottom = "0px"; }
      else if (!on && sc.__mb) { sc.style.marginBottom = ""; wrap.style.marginBottom = ""; sc.__mb = null; }
      wrap.classList.toggle("can-left", on && x > 4);
      wrap.classList.toggle("can-right", on && x < max - 4);
      if (on) {
        thumb.style.width = (sc.clientWidth / sc.scrollWidth * 100) + "%";   // thumb width = share that's visible
        thumb.style.transform = "translateX(" + (x / sc.clientWidth * 100) + "%)";
      }
      return on;
    }
    /* tap the track to jump, or drag the thumb */
    function seek(clientX) {
      var r = bar.getBoundingClientRect(), tw = thumb.getBoundingClientRect().width;
      var f = Math.min(1, Math.max(0, (clientX - r.left - tw / 2) / Math.max(1, r.width - tw)));
      sc.scrollLeft = f * (sc.scrollWidth - sc.clientWidth);
    }
    bar.addEventListener("pointerdown", function (e) {
      bar.setPointerCapture && bar.setPointerCapture(e.pointerId); bar.classList.add("is-drag"); seek(e.clientX);
      function mv(ev) { seek(ev.clientX); }
      function up() { bar.classList.remove("is-drag"); bar.removeEventListener("pointermove", mv); bar.removeEventListener("pointerup", up); bar.removeEventListener("pointercancel", up); }
      bar.addEventListener("pointermove", mv); bar.addEventListener("pointerup", up); bar.addEventListener("pointercancel", up);
    });
    sc.addEventListener("scroll", function () { requestAnimationFrame(state); }, { passive: true });
    window.addEventListener("resize", function () { requestAnimationFrame(update); });

    /* re-check whenever the strip's contents change (chip rows are often filled by the page's script after this runs) */
    var first = true;
    function update() { if (state() && first) { first = false; firstOn(); } }
    new MutationObserver(function () { requestAnimationFrame(update); }).observe(sc, { childList: true, subtree: true });
    window.addEventListener("load", update);
    update();

    /* the first time the bar appears: bring the selected chip into view (clear of the left fade), then nudge once per visit */
    function firstOn() {
      var on = sc.querySelector(".is-active, .is-on, [aria-pressed=\"true\"]");
      if (on) { var r = on.getBoundingClientRect(), s = sc.getBoundingClientRect(); if (r.right > s.right - 40) sc.scrollLeft += r.left - s.left - 56; }
      state();
      var seen = false; try { seen = sessionStorage.getItem("rk-strip-nudged") === "1"; } catch (e) {}
      if (!calm && !seen && wrap.classList.contains("can-right")) {
        try { sessionStorage.setItem("rk-strip-nudged", "1"); } catch (e) {}
        setTimeout(function () { sc.scrollBy({ left: 48, behavior: "smooth" }); setTimeout(function () { sc.scrollBy({ left: -48, behavior: "smooth" }); }, 450); }, 600);
      }
    }
  }
  function scan() { document.querySelectorAll(TARGETS.join(",")).forEach(setup); }
  if (document.readyState === "complete") scan(); else window.addEventListener("load", scan);
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
