/* Phone thumbnails: zoom each picture in on its subject (faces, books, the scene's focal point) instead of showing the whole frame.
   Each entry is [focalX%, focalY%, zoom]; the transform origin is solved so the focal point lands in the middle of the card. */
(function () {
  var SAND = [ // Kitab Teras (Set 1)
    [50, 46, 1.4], [58, 40, 1.45], [52, 34, 1.45], [52, 46, 1.4], [52, 42, 1.35],
    [66, 48, 1.3], [48, 46, 1.4], [55, 45, 1.45], [60, 45, 1.25]
  ];
  var SET2 = [ // Set 2 + Set 3 artwork
    [46, 55, 1.35], [55, 45, 1.35], [46, 48, 1.3], [50, 50, 1.25], [56, 68, 1.4],
    [72, 55, 1.35], [50, 45, 1.35], [60, 46, 1.35], [55, 44, 1.35]
  ];
  var path = location.pathname;
  var data = /\/kt\/?(index\.html)?$/.test(path) || /\/kt\//.test(path) && !/\/kt[23]\//.test(path) ? SAND : SET2;
  var SET3_EXTRA = [4, 7, 1]; // Set 3's extra cards reuse Set 2 artwork 5, 8 and 2

  function origin(p, z) { // point p (0..1) should end up at 0.5 after scaling by z
    var o = (z * p - 0.5) / (z - 1);
    return Math.max(0, Math.min(1, o)) * 100;
  }
  function apply() {
    var imgs = document.querySelectorAll("#cardGrid .card-art img");
    if (!imgs.length) return false;
    imgs.forEach(function (img, i) {
      var f = data[i] || (data === SET2 && SET3_EXTRA[i - 9] !== undefined ? data[SET3_EXTRA[i - 9]] : null);
      if (!f) return;
      img.style.setProperty("--z", f[2]);
      img.style.setProperty("--ox", origin(f[0] / 100, f[2]).toFixed(1) + "%");
      img.style.setProperty("--oy", origin(f[1] / 100, f[2]).toFixed(1) + "%");
    });
    return true;
  }
  if (!apply()) window.addEventListener("load", apply);
})();
