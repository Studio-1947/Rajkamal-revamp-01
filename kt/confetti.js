/* Light theme background: gold confetti drifting down over pure white, drawn on a canvas (no video). */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.createElement("canvas");
  canvas.className = "bg-video bg-confetti";
  canvas.setAttribute("aria-hidden", "true");
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext("2d");
  var COLORS = ["#D9A400", "#E8B923", "#F2CD4A", "#C99A12", "#FFD966", "#B8860B"];
  var parts = [], w = 0, h = 0, dpr = 1, raf = 0, last = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function make(startAnywhere) {
    return {
      x: rnd(0, w),
      y: startAnywhere ? rnd(0, h) : rnd(-40, -4),
      len: rnd(4, 9),
      wid: rnd(1.6, 3.2),
      vy: rnd(28, 70),               // px per second
      sway: rnd(6, 22),              // horizontal drift amplitude
      swaySpeed: rnd(0.6, 1.8),
      phase: rnd(0, Math.PI * 2),
      rot: rnd(0, Math.PI * 2),
      spin: rnd(-2.2, 2.2),
      flip: rnd(1.2, 3.4),
      color: COLORS[(Math.random() * COLORS.length) | 0],
      alpha: rnd(0.5, 0.95)
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(320, Math.round((w * h) / 4200));
    while (parts.length < n) parts.push(make(true));
    parts.length = n;
  }

  function draw(t, dt) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (dt) {
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        if (p.y > h + 12) parts[i] = p = make(false);
      }
      var x = p.x + Math.sin(t * p.swaySpeed + p.phase) * p.sway;
      var flip = Math.abs(Math.cos(t * p.flip + p.phase));   // fake 3D tumble
      ctx.save();
      ctx.translate(x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha * (0.45 + 0.55 * flip);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.len / 2, (-p.wid / 2) * (0.35 + flip), p.len, p.wid * (0.35 + flip));
      ctx.restore();
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    draw(now / 1000, dt);
  }

  function isLight() { return root.getAttribute("data-theme") === "light"; }

  function sync() {
    if (isLight() && !document.hidden) {
      if (!w) resize();
      if (reduce) { draw(0, 0); return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    } else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  window.addEventListener("resize", function () { if (w) { resize(); if (reduce && isLight()) draw(0, 0); } });
  document.addEventListener("visibilitychange", sync);
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  sync();
})();
