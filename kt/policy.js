/* Policy pages: highlight the section you're reading in "On This Page", and the cookie settings panel
   (choices saved in localStorage "rk-cookie-prefs"; necessary cookies are always on). */
(function () {
  var links = [].slice.call(document.querySelectorAll(".pl-toc a"));
  if (links.length && "IntersectionObserver" in window) {
    var byId = {}; links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-here"); });
        var a = byId[e.target.id]; if (a) a.classList.add("is-here");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  var panel = document.getElementById("cookie-settings");
  if (!panel) return;
  var KEY = "rk-cookie-prefs", status = panel.querySelector(".pl-cookies__status");
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
  var prefs = read() || { analytics: false, marketing: false };
  panel.querySelectorAll("[data-cookie]").forEach(function (i) { i.checked = !!prefs[i.dataset.cookie]; });
  if (read()) status.textContent = "Your saved choices are shown above.";
  function store(all) {
    var p = { necessary: true, at: new Date().toISOString() };
    panel.querySelectorAll("[data-cookie]").forEach(function (i) { if (all) i.checked = true; p[i.dataset.cookie] = i.checked; });
    save(p);
    status.textContent = "Saved — " + (p.analytics || p.marketing ? [p.analytics && "analytics", p.marketing && "marketing"].filter(Boolean).join(" and ") + " cookies allowed." : "only necessary cookies will be used.");
  }
  panel.querySelector("[data-cookie-save]").addEventListener("click", function () { store(false); });
  panel.querySelector("[data-cookie-all]").addEventListener("click", function () { store(true); });
  /* footer "Cookie Settings" lands on #cookie-settings: bring the panel into view and highlight it */
  function flash() {
    if (location.hash !== "#cookie-settings") return;
    panel.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    panel.focus({ preventScroll: true }); panel.classList.add("is-flash");
    setTimeout(function () { panel.classList.remove("is-flash"); }, 1600);
  }
  flash(); window.addEventListener("hashchange", flash);
})();
