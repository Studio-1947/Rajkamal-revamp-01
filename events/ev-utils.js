/* Shared helpers for the events pages: dates, upcoming / live / past status, and an "Add to calendar" (.ics) file. */
window.RKEv = (function () {
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function dt(s) { return new Date(s); }
  function sameDay(a, b) { return a.toDateString() === b.toDateString(); }
  function time(d) { return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }); }
  /* "Sun, 21 Sept 2026 · 5:00 pm – 6:30 pm" or "Fri, 23 Oct 2026, 11:00 am → Tue, 27 Oct, 8:00 pm" */
  function when(e) {
    var s = dt(e.start), t = dt(e.end), o = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
    return sameDay(s, t) ? s.toLocaleDateString("en-IN", o) + " · " + time(s) + " – " + time(t)
      : s.toLocaleDateString("en-IN", o) + ", " + time(s) + " → " + t.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + ", " + time(t);
  }
  /* calendar-page style block: { day: "23–27", month: "Oct" } */
  function block(e) {
    var s = dt(e.start), t = dt(e.end), m = s.toLocaleDateString("en-IN", { month: "short" });
    return { day: sameDay(s, t) ? String(s.getDate()) : s.getDate() + "–" + t.getDate() + (s.getMonth() !== t.getMonth() ? " " + t.toLocaleDateString("en-IN", { month: "short" }) : ""), month: m };
  }
  function status(e) {
    var now = new Date(), s = dt(e.start), t = dt(e.end);
    if (now < s) { var n = Math.ceil((new Date(s.toDateString()) - new Date(now.toDateString())) / 864e5); return { k: "soon", label: n <= 0 ? "Today" : n === 1 ? "Tomorrow" : "In " + n + " days" }; }
    if (now <= t) return { k: "live", label: "Happening now" };
    return { k: "past", label: "Past event" };
  }
  function ics(e, url) {
    function z(s) { return s.replace(/[-:]/g, "") + "00"; } // local time, floating
    function fold(s) { return String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n"); }
    var body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rajkamal Prakashan//Events//HI", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + e.id + "@rajkamalprakashan.com", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
      "DTSTART:" + z(e.start), "DTEND:" + z(e.end), "SUMMARY:" + fold(e.title), "LOCATION:" + fold(e.venue || ""),
      "DESCRIPTION:" + fold((e.sub ? e.sub + "\n" : "") + (url || "")), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
    a.download = e.id + ".ics"; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function byId(id) { return (window.RK_EVENTS || []).filter(function (e) { return e.id === id; })[0]; }
  return { esc: esc, when: when, block: block, status: status, ics: ics, byId: byId, time: time };
})();
