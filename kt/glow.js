/* Hero banner hover: warm diya-style glow (same feel as the thumbnails) that follows the cursor. */
(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll(".hero-img, .hp-banner").forEach(function (img) {
    var frame = document.createElement("div");
    frame.className = "glow-frame";
    var clip = document.createElement("div");
    clip.className = "glow-frame__clip";
    var glow = document.createElement("div");
    glow.className = "glow-frame__glow";
    glow.setAttribute("aria-hidden", "true");
    var target = img.parentNode.tagName === "PICTURE" ? img.parentNode : img;
    target.parentNode.insertBefore(frame, target);
    frame.appendChild(clip);
    clip.appendChild(target);
    var copy = frame.parentNode.querySelector(".hero-copy");
    if (copy) clip.appendChild(copy);
    clip.appendChild(glow);
    frame.addEventListener("pointermove", function (e) {
      var r = frame.getBoundingClientRect();
      frame.style.setProperty("--mx", (e.clientX - r.left) + "px");
      frame.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  });
})();
