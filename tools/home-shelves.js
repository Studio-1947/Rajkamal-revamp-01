/* Registers the homepage shelves as collections in books/books-data.js, so each shelf's "View all" has its own page.
   Run from the project root: node tools/home-shelves.js */
global.window = {};
require("../books/books-data.js"); require("../home/home-data.js");
const C = window.RK_COLLECTIONS, H = window.RK_HOME, fs = require("fs"), L = "https://www.rajkamalprakashan.com";
const rows = {}; for (const k in C) C[k].books.forEach(b => { if (!rows[b[4]]) rows[b[4]] = b; });
const MAP = { "हिन्दी दिवस": ["hindi-divas", "हिन्दी दिवस", L + "/hindi-divas"], "New Releases": ["new-releases", "New Releases", L + "/collections/new-releases"],
  "Award Winners": ["award-winners", "Award Winners", L + "/collections/award-winners"], "World Classic": ["world-classic", "World Classic", L + "/collections/world-classic"], "Magazine": ["magazine", "Magazine", L + "/collections/magazine"] };
const out = {};
for (const k in MAP) { const [slug, name, live] = MAP[k]; out[slug] = { name, books: H.sections[k].map(b => rows[b.id]).filter(Boolean), live }; console.log(slug, out[slug].books.length); }
const MARK = "\n/* ---- home shelves as collections (Hindi Divas, New Releases, Award Winners, World Classic, Magazine): the books shown\n   on the homepage shelf, so each shelf's \"View all\" has its own page (books/?c=<slug>). Bestsellers gets a live link too. ---- */\n";
let s = fs.readFileSync("books/books-data.js", "utf8"); const i = s.indexOf(MARK); if (i >= 0) s = s.slice(0, i);
s = s.replace(/\n+$/, "") + "\n" + MARK + "Object.assign(window.RK_COLLECTIONS," + JSON.stringify(out) + ");\nwindow.RK_COLLECTIONS.bestsellers.live=\"" + L + "/collections/bestsellers\";\n";
fs.writeFileSync("books/books-data.js", s);
