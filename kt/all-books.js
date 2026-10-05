/* "All Books" navigation: browse-by-genre mega dropdown on desktop, a searchable A–Z bottom sheet on phones. */
(function () {
  var GENRES = [
    "Aadivasi Literature",
    "Administration",
    "Ancient History",
    "Anthology",
    "Application Drafting",
    "Article",
    "Arts",
    "Autobiographical Novel",
    "Autobiography",
    "Bhakti Sahitya",
    "Biographical Novel",
    "Biography",
    "Chaar Phool Hain Aur Duniya Hai",
    "Children Book",
    "Cinema",
    "Collected Works - Rachnawali",
    "Colletion",
    "Combo",
    "Communication and Media Studies",
    "Computer",
    "Contemporary",
    "Crime",
    "Cultural history",
    "Cultural Novel",
    "Culture",
    "Cyclopedia",
    "Dairy",
    "Dalit literature",
    "Dalit Vimarsh",
    "Dance",
    "Deh-Bhasha Kosh",
    "Development",
    "Diary",
    "Dictionary",
    "Dictionary and Language Studies",
    "Discourse",
    "Dramas in Indian Languages",
    "Economics",
    "Education Books",
    "Encyclopedia",
    "Environment",
    "Epic",
    "Essay",
    "Ethic",
    "Feminism",
    "Fiction : Stories",
    "Functional Hindi",
    "Gandhi Literature",
    "General Studies",
    "Geography",
    "Health and Fitness",
    "Historical Narrative",
    "Historical Novel",
    "History",
    "Indian History",
    "India Studies",
    "Interview",
    "Jail Notebook",
    "Jansampark",
    "Journalism",
    "Language Teaching",
    "Law",
    "Lectures",
    "Letter",
    "Letters",
    "Linguistics",
    "Literary Criticism",
    "Lok-Sahitya",
    "Love",
    "Lyrics",
    "Magazine",
    "Management",
    "Manzarnama",
    "Marxvad",
    "Media",
    "Memoirs",
    "Music",
    "Mythological novel",
    "Nagarjun",
    "Nature",
    "Navgeet",
    "Non Fiction",
    "Novel",
    "Patkatha",
    "Personality Development",
    "Philosophy",
    "Planing",
    "Play",
    "Poem",
    "Poems in Indian languages",
    "Poetry",
    "Political Novel",
    "Politics",
    "Portrait",
    "Pragatiwad",
    "Prose",
    "Prose Poetry",
    "Psychology",
    "public administration",
    "Rachanwali",
    "Ram Sahitya",
    "Reference Book",
    "Regional Novel",
    "Religion",
    "Religious Literature",
    "Reportage",
    "Representative Poems",
    "Representative Stories",
    "Review",
    "Revolutionary Literature",
    "Romance Novel",
    "Sabhyata-Samiksha",
    "Sahitya Academy Awards",
    "Samalochana",
    "Sampoorana Kahaniyan",
    "Samvad",
    "Sanchayan",
    "Satire",
    "Satirical Novel",
    "Science",
    "Screenplay",
    "Self-Help",
    "Shayari",
    "Sketch",
    "Social Novel",
    "Social Studies",
    "Sociology",
    "Sociology and Politics",
    "Soor Sahitya",
    "Sports",
    "Sprituality",
    "Student Politics",
    "Technology",
    "Thought",
    "Translation",
    "Travelogue",
    "Trending Now",
    "Tribal Literature",
    "True Accounts",
    "True Stories",
    "Women's Novel",
    "Women Studies",
  ];
  /* shortcuts shown above the A–Z list */
  var POPULAR = [
    "Trending Now",
    "Sahitya Academy Awards",
    "Novel",
    "Poetry",
    "Fiction : Stories",
    "Biography",
    "History",
    "Children Book",
    "Combo",
  ];

  function slug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  var list = GENRES.map(function (n) {
    return { name: n, slug: slug(n), key: n.toLowerCase() };
  }).sort(function (a, b) {
    return a.key.localeCompare(b.key);
  });
  window.RK_GENRES = list;

  var ROOT = (function () {
    var s = document.querySelector('script[src*="all-books.js"]');
    return s ? s.src.replace(/kt\/all-books\.js.*$/, "") : "../";
  })();
  function href(g) {
    return ROOT + "books/?g=" + encodeURIComponent(g);
  }
  var current = new URLSearchParams(location.search).get("g");
  if (!/\/books\/(index\.html)?$/.test(location.pathname)) current = null;

  var groups = [];
  list.forEach(function (g) {
    var L = g.name.charAt(0).toUpperCase();
    if (!groups.length || groups[groups.length - 1].letter !== L)
      groups.push({ letter: L, items: [] });
    groups[groups.length - 1].items.push(g);
  });
  var bySlug = {};
  list.forEach(function (g) {
    bySlug[g.slug] = g;
  });

  function link(g, cls, extra) {
    return (
      '<a class="' +
      cls +
      '" href="' +
      href(g.slug) +
      '" data-key="' +
      esc(g.key) +
      '"' +
      (g.slug === current ? ' aria-current="page"' : "") +
      ">" +
      '<span class="ab-name">' +
      esc(g.name) +
      "</span>" +
      (extra || "") +
      "</a>"
    );
  }
  function groupsHtml(prefix, itemCls, extra) {
    return groups
      .map(function (gr) {
        return (
          '<section class="' +
          prefix +
          '__group" data-letter="' +
          gr.letter +
          '" id="' +
          prefix +
          "-" +
          gr.letter +
          '">' +
          '<h3 class="' +
          prefix +
          '__letter">' +
          gr.letter +
          "</h3><ul>" +
          gr.items
            .map(function (g) {
              return "<li>" + link(g, itemCls, extra) + "</li>";
            })
            .join("") +
          "</ul></section>"
        );
      })
      .join("");
  }
  /* filter a rendered list: hide non-matching links and empty groups, highlight the match */
  function filter(root, prefix, q) {
    q = q.trim().toLowerCase();
    var shown = 0;
    root.querySelectorAll("." + prefix + "__group").forEach(function (sec) {
      var any = false;
      sec.querySelectorAll("a[data-key]").forEach(function (a) {
        var key = a.getAttribute("data-key"),
          i = q ? key.indexOf(q) : 0,
          hit = i >= 0;
        a.parentNode.hidden = !hit;
        var nameEl = a.querySelector(".ab-name"),
          name = bySlug[slug(key)]
            ? bySlug[slug(key)].name
            : nameEl.textContent;
        nameEl.innerHTML =
          hit && q
            ? esc(name.slice(0, i)) +
              "<mark>" +
              esc(name.slice(i, i + q.length)) +
              "</mark>" +
              esc(name.slice(i + q.length))
            : esc(name);
        if (hit) {
          any = true;
          shown++;
        }
      });
      sec.hidden = !any;
    });
    return shown;
  }
  var CHEV =
    '<svg class="ab-go" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  var SEARCH_IC =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
  var CLOSE_IC =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /* ================= desktop: themed mega dropdown — a rail of themes, each pane fits without scrolling ================= */
  var THEMES = [
    [
      "Fiction & Novels",
      [
        "Novel",
        "Fiction : Stories",
        "Historical Novel",
        "Social Novel",
        "Political Novel",
        "Regional Novel",
        "Cultural Novel",
        "Mythological novel",
        "Romance Novel",
        "Satirical Novel",
        "Women's Novel",
        "Autobiographical Novel",
        "Biographical Novel",
        "Crime",
        "Representative Stories",
        "Sampoorana Kahaniyan",
        "Love",
        "Satire",
        "Contemporary",
      ],
    ],
    [
      "Poetry & Lyrics",
      [
        "Poetry",
        "Poem",
        "Poems in Indian languages",
        "Representative Poems",
        "Prose Poetry",
        "Navgeet",
        "Shayari",
        "Lyrics",
        "Epic",
        "Bhakti Sahitya",
        "Soor Sahitya",
        "Ram Sahitya",
      ],
    ],
    [
      "Drama, Cinema & Arts",
      [
        "Play",
        "Dramas in Indian Languages",
        "Patkatha",
        "Screenplay",
        "Manzarnama",
        "Samvad",
        "Cinema",
        "Music",
        "Dance",
        "Arts",
      ],
    ],
    [
      "Lives, Letters & Travel",
      [
        "Biography",
        "Autobiography",
        "Memoirs",
        "Diary",
        "Dairy",
        "Jail Notebook",
        "Letter",
        "Letters",
        "Interview",
        "Portrait",
        "Sketch",
        "Travelogue",
        "Reportage",
        "True Accounts",
        "True Stories",
        "Historical Narrative",
      ],
    ],
    [
      "Essays & Criticism",
      [
        "Non Fiction",
        "Essay",
        "Article",
        "Prose",
        "Literary Criticism",
        "Samalochana",
        "Review",
        "Thought",
        "Discourse",
        "Lectures",
        "Sabhyata-Samiksha",
        "Anthology",
        "Sanchayan",
      ],
    ],
    [
      "History & Culture",
      [
        "History",
        "Indian History",
        "Ancient History",
        "India Studies",
        "Cultural history",
        "Culture",
        "Lok-Sahitya",
        "Aadivasi Literature",
        "Tribal Literature",
        "Dalit literature",
        "Dalit Vimarsh",
        "Nature",
        "Environment",
        "Geography",
      ],
    ],
    [
      "Society & Politics",
      [
        "Politics",
        "Sociology",
        "Sociology and Politics",
        "Social Studies",
        "Economics",
        "Development",
        "Feminism",
        "Women Studies",
        "Gandhi Literature",
        "Marxvad",
        "Pragatiwad",
        "Revolutionary Literature",
        "Student Politics",
        "Law",
        "Administration",
        "public administration",
        "Planing",
        "Jansampark",
      ],
    ],
    [
      "Philosophy & Self",
      [
        "Philosophy",
        "Religion",
        "Religious Literature",
        "Sprituality",
        "Ethic",
        "Psychology",
        "Self-Help",
        "Personality Development",
        "Health and Fitness",
        "Sports",
      ],
    ],
    [
      "Language, Media & Learning",
      [
        "Linguistics",
        "Language Teaching",
        "Functional Hindi",
        "Translation",
        "Dictionary",
        "Dictionary and Language Studies",
        "Deh-Bhasha Kosh",
        "Encyclopedia",
        "Cyclopedia",
        "Reference Book",
        "Education Books",
        "General Studies",
        "Application Drafting",
        "Media",
        "Journalism",
        "Communication and Media Studies",
        "Magazine",
        "Computer",
        "Science",
        "Technology",
        "Management",
      ],
    ],
    [
      "Collections & Specials",
      [
        "Trending Now",
        "Sahitya Academy Awards",
        "Children Book",
        "Combo",
        "Collected Works - Rachnawali",
        "Rachanwali",
        "Colletion",
        "Nagarjun",
        "Chaar Phool Hain Aur Duniya Hai",
      ],
    ],
  ].map(function (t) {
    return {
      name: t[0],
      items: t[1]
        .map(function (n) {
          return bySlug[slug(n)];
        })
        .filter(Boolean),
    };
  });
  /* anything not placed in a theme still shows up, under the last one */
  (function () {
    var placed = {};
    THEMES.forEach(function (t) {
      t.items.forEach(function (g) {
        placed[g.slug] = 1;
      });
    });
    list.forEach(function (g) {
      if (!placed[g.slug]) THEMES[THEMES.length - 1].items.push(g);
    });
  })();
  window.RK_GENRE_THEMES = THEMES; // also used by the Categories page
  var MAX_RESULTS = 24; // 3 columns x 8 rows: the most a pane shows

  (function () {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var trigger = Array.prototype.filter.call(
      header.querySelectorAll(".header-nav-main li > a"),
      function (a) {
        return a.textContent.trim() === "All Books";
      },
    )[0];
    if (!trigger) return;

    var startTheme = 0;
    if (current)
      THEMES.forEach(function (t, i) {
        if (
          t.items.some(function (g) {
            return g.slug === current;
          })
        )
          startTheme = i;
      });

    var menu = document.createElement("div");
    menu.className = "ab-menu";
    menu.id = "abMenu";
    menu.hidden = true;
    menu.setAttribute("role", "region");
    menu.setAttribute("aria-label", "All Books — browse by genre");
    menu.innerHTML =
      '<div class="ab-menu__rail" role="tablist" aria-orientation="vertical" aria-label="Genre themes">' +
      THEMES.map(function (t, i) {
        return (
          '<button type="button" class="ab-tab" role="tab" id="abTab' +
          i +
          '" data-theme="' +
          i +
          '" aria-controls="abPane' +
          i +
          '" aria-selected="false" tabindex="-1">' +
          "<span>" +
          esc(t.name) +
          "</span><i>" +
          t.items.length +
          "</i></button>"
        );
      }).join("") +
      "</div>" +
      '<div class="ab-menu__main">' +
      '<div class="ab-menu__top">' +
      '<h2 class="ab-menu__title" id="abTitle"></h2>' +
      '<label class="ab-menu__search">' +
      SEARCH_IC +
      '<input type="search" placeholder="Search all ' +
      list.length +
      ' genres…" aria-label="Search all genres" autocomplete="off"></label>' +
      "</div>" +
      THEMES.map(function (t, i) {
        return (
          '<ul class="ab-pane" role="tabpanel" id="abPane' +
          i +
          '" aria-labelledby="abTab' +
          i +
          '" hidden>' +
          t.items
            .map(function (g, n) {
              return '<li style="--i:' + n + '">' + link(g, "ab-menu__link") + "</li>";
            })
            .join("") +
          "</ul>"
        );
      }).join("") +
      '<ul class="ab-pane ab-pane--results" hidden></ul>' +
      '<p class="ab-menu__note" hidden></p>' +
      /* browse-everything links live in the panel's footer, so nothing in the category list looks selected */
      '<div class="ab-menu__foot"><span>Not sure where to start?</span>' +
      '<a class="ab-menu__cats" href="' +
      ROOT +
      'categories/">All categories</a>' +
      '<a class="ab-menu__all" href="' +
      href("all") +
      '">View all books <span aria-hidden="true">→</span></a></div>' +
      "</div>";
    header.appendChild(menu);

    var input = menu.querySelector("input"),
      title = menu.querySelector("#abTitle"),
      note = menu.querySelector(".ab-menu__note");
    var tabs = menu.querySelectorAll(".ab-tab"),
      panes = menu.querySelectorAll(".ab-pane:not(.ab-pane--results)");
    var results = menu.querySelector(".ab-pane--results");
    var active = -1;
    trigger.setAttribute("href", href("all"));
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "abMenu");
    trigger.classList.add("ab-trigger");

    function showTheme(i) {
      if (input.value) {
        input.value = "";
        search();
      }
      if (i === active) return;
      active = i;
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panes.forEach(function (p, j) {
        p.hidden = j !== i;
      });
      title.innerHTML =
        '<small class="ab-menu__eyebrow">Genres in</small>' +
        esc(THEMES[i].name) +
        " <span>" +
        THEMES[i].items.length +
        " genres</span>";
    }
    function search() {
      var q = input.value.trim().toLowerCase();
      menu.classList.toggle("is-searching", !!q);
      if (!q) {
        results.hidden = true;
        note.hidden = true;
        panes.forEach(function (p, j) {
          p.hidden = j !== active;
        });
        if (active >= 0)
          title.innerHTML =
            '<small class="ab-menu__eyebrow">Genres in</small>' +
            esc(THEMES[active].name) +
            " <span>" +
            THEMES[active].items.length +
            " genres</span>";
        return;
      }
      var hits = list.filter(function (g) {
        return g.key.indexOf(q) >= 0;
      });
      /* names that start with the query first */
      hits.sort(function (a, b) {
        return (
          (a.key.indexOf(q) === 0 ? 0 : 1) - (b.key.indexOf(q) === 0 ? 0 : 1)
        );
      });
      panes.forEach(function (p) {
        p.hidden = true;
      });
      results.hidden = false;
      results.innerHTML = hits
        .slice(0, MAX_RESULTS)
        .map(function (g) {
          var i = g.key.indexOf(q);
          return (
            '<li><a class="ab-menu__link" href="' +
            href(g.slug) +
            '"' +
            (g.slug === current ? ' aria-current="page"' : "") +
            '><span class="ab-name">' +
            esc(g.name.slice(0, i)) +
            "<mark>" +
            esc(g.name.slice(i, i + q.length)) +
            "</mark>" +
            esc(g.name.slice(i + q.length)) +
            "</span></a></li>"
          );
        })
        .join("");
      title.innerHTML =
        "Results <span>" +
        hits.length +
        (hits.length === 1 ? " genre" : " genres") +
        "</span>";
      note.hidden = hits.length && hits.length <= MAX_RESULTS;
      note.innerHTML = hits.length
        ? hits.length - MAX_RESULTS + " more — keep typing to narrow it down"
        : 'No genre matches that. <a href="' +
          href("all") +
          '">Browse all books</a>';
    }

    var wide = window.matchMedia("(min-width: 981px)");
    var hoverable = window.matchMedia("(hover: hover) and (pointer: fine)");
    var openT, closeT, tabT;
    function setOpen(open, focus) {
      clearTimeout(openT);
      clearTimeout(closeT);
      if (open && !wide.matches) return;
      if (open === !menu.hidden) {
        if (open && focus) tabs[active].focus();
        return;
      }
      menu.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      trigger.classList.toggle("is-open", open);
      if (open) {
        showTheme(startTheme);
        requestAnimationFrame(function () {
          menu.classList.add("is-open");
        });
        if (focus) tabs[active].focus();
      } else {
        menu.classList.remove("is-open");
        if (input.value) {
          input.value = "";
          search();
        }
      }
    }

    /* a click on "All Books" opens the All Books page (hover already shows the menu; ↓ opens it from the keyboard).
       Only touch screens without hover use the tap to open / close the menu — they reach the page from its footer. */
    trigger.addEventListener("click", function (e) {
      if (!wide.matches || hoverable.matches || e.detail === 0) return;
      e.preventDefault();
      setOpen(menu.hidden, false);
    });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true, true);
      }
    });
    /* hover intent: a short delay before opening, a longer one before closing so the pointer can travel into the panel */
    [trigger, menu].forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (!hoverable.matches) return;
        clearTimeout(closeT);
        if (menu.hidden)
          openT = setTimeout(function () {
            setOpen(true, false);
          }, 140);
      });
      el.addEventListener("mouseleave", function () {
        if (!hoverable.matches) return;
        clearTimeout(openT);
        if (document.activeElement === input && input.value) return; // keep it open while they're searching
        closeT = setTimeout(function () {
          setOpen(false);
        }, 260);
      });
    });

    /* rail: hovering a theme switches the pane after a beat, so sliding the pointer across to the pane
       doesn't flip through every theme it passes over */
    tabs.forEach(function (t, i) {
      t.addEventListener("mouseenter", function () {
        clearTimeout(tabT);
        tabT = setTimeout(function () {
          showTheme(i);
        }, 90);
      });
      t.addEventListener("mouseleave", function () {
        clearTimeout(tabT);
      });
      t.addEventListener("click", function () {
        clearTimeout(tabT);
        showTheme(i);
      });
      t.addEventListener("keydown", function (e) {
        var n = tabs.length,
          to = null;
        if (e.key === "ArrowDown") to = (i + 1) % n;
        else if (e.key === "ArrowUp") to = (i - 1 + n) % n;
        else if (e.key === "Home") to = 0;
        else if (e.key === "End") to = n - 1;
        else if (e.key === "ArrowRight") {
          e.preventDefault();
          var a = panes[i].querySelector("a");
          if (a) a.focus();
          return;
        }
        if (to === null) return;
        e.preventDefault();
        showTheme(to);
        tabs[to].focus();
      });
    });
    menu
      .querySelector(".ab-menu__main")
      .addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft" && e.target.closest(".ab-pane")) {
          e.preventDefault();
          tabs[active].focus();
        }
      });

    input.addEventListener("input", search);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = results.querySelector("a");
        if (first && input.value.trim()) {
          e.preventDefault();
          location.href = first.href;
        }
      } else if (e.key === "ArrowDown") {
        var a = (input.value.trim() ? results : panes[active]).querySelector(
          "a",
        );
        if (a) {
          e.preventDefault();
          a.focus();
        }
      }
    });
    document.addEventListener("click", function (e) {
      if (
        !menu.hidden &&
        !menu.contains(e.target) &&
        !trigger.contains(e.target)
      )
        setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        var back = menu.contains(document.activeElement);
        setOpen(false);
        if (back) trigger.focus();
      }
    });
    menu.addEventListener("focusout", function (e) {
      if (
        e.relatedTarget &&
        !menu.contains(e.relatedTarget) &&
        e.relatedTarget !== trigger
      )
        setOpen(false);
    });
    wide.addEventListener &&
      wide.addEventListener("change", function (e) {
        if (!e.matches) setOpen(false);
      });
  })();

  /* ================= desktop: Publications dropdown — the 12 imprints, opens on hover ================= */
  (function () {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var trigger = Array.prototype.filter.call(
      header.querySelectorAll(".header-nav-main li > a"),
      function (a) {
        return (
          a.textContent.replace(/\s+/g, " ").trim().indexOf("Publications") ===
          0
        );
      },
    )[0];
    if (!trigger) return;
    /* names + title counts as on rajkamalprakashan.com/publications (full data: publications/publications-data.js) */
    var IMPRINTS = [
      ["rajkamal-prakashan", "Rajkamal Prakashan", 3251],
      ["radhakrishna-prakashan", "Radhakrishna Prakashan", 1159],
      ["lokbharti-prakashan", "Lokbharti Prakashan", 1229],
      ["sarthak", "Sarthak", 53],
      ["funda", "Funda", 21],
      ["hans-prakashan", "Hans Prakashan", 0],
      ["remadhav", "Remadhav", 33],
      ["purvodaya", "Purvodaya", 0],
      ["sahitya-bhawan", "Sahitya Bhawan", 8],
      ["saransh", "Saransh", 0],
      ["banyan-tree-books", "Banyan Tree Books", 21],
      ["akshar-prakashan", "Akshar", 29],
    ];
    var menu = document.createElement("div");
    menu.className = "pb-menu";
    menu.id = "pbMenu";
    menu.hidden = true;
    menu.setAttribute("role", "region");
    menu.setAttribute("aria-label", "Publications — our imprints");
    menu.innerHTML =
      '<div class="pb-menu__head"><b>Our family of imprints</b><a href="' +
      ROOT +
      'publications/">All publications <span aria-hidden="true">→</span></a></div>' +
      '<ul class="pb-menu__grid">' +
      IMPRINTS.map(function (x) {
        return (
          '<li><a class="pb-menu__item" href="' +
          ROOT +
          "publications/imprint/?id=" +
          x[0] +
          '"><img src="' +
          ROOT +
          "publications/logos/" +
          x[0] +
          '.png" alt="" loading="lazy" width="40" height="40">' +
          "<span><b>" +
          esc(x[1]) +
          "</b><i>" +
          (x[2] ? x[2].toLocaleString("en-IN") + " titles" : "Coming soon") +
          "</i></span></a></li>"
        );
      }).join("") +
      "</ul>";
    header.appendChild(menu);
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "pbMenu");
    trigger.classList.add("pb-trigger");
    var wide = window.matchMedia("(min-width: 981px)"),
      hoverable = window.matchMedia("(hover: hover) and (pointer: fine)"),
      openT,
      closeT;
    function place() {
      /* line the panel up under the Publications link, kept inside the header pill */
      var h = header.getBoundingClientRect(),
        t = trigger.getBoundingClientRect(),
        w = menu.offsetWidth;
      menu.style.left =
        Math.max(
          12,
          Math.min(t.left + t.width / 2 - w / 2 - h.left, h.width - w - 12),
        ) + "px";
    }
    function setOpen(open, focus) {
      clearTimeout(openT);
      clearTimeout(closeT);
      if (open && !wide.matches) return;
      if (open === !menu.hidden) return;
      menu.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      trigger.classList.toggle("is-open", open);
      if (open) {
        place();
        requestAnimationFrame(function () {
          menu.classList.add("is-open");
        });
        if (focus) menu.querySelector("a").focus();
      } else menu.classList.remove("is-open");
    }
    [trigger, menu].forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (!hoverable.matches || !wide.matches) return;
        clearTimeout(closeT);
        clearTimeout(openT);
        if (menu.hidden)
          openT = setTimeout(function () {
            setOpen(true);
          }, 100);
      });
      el.addEventListener("mouseleave", function () {
        if (!hoverable.matches || !wide.matches) return;
        clearTimeout(openT);
        closeT = setTimeout(function () {
          setOpen(false);
        }, 420);
      });
    });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true, true);
      }
    });
    menu.addEventListener("focusout", function (e) {
      if (
        e.relatedTarget &&
        !menu.contains(e.relatedTarget) &&
        e.relatedTarget !== trigger
      )
        setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        var back = menu.contains(document.activeElement);
        setOpen(false);
        if (back) trigger.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (
        !menu.hidden &&
        !menu.contains(e.target) &&
        !trigger.contains(e.target)
      )
        setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (!menu.hidden) place();
    });
    wide.addEventListener &&
      wide.addEventListener("change", function (e) {
        if (!e.matches) setOpen(false);
      });
  })();

  /* ================= phones: full-height bottom sheet with search + A–Z scrubber ================= */
  var sheet = document.createElement("div");
  sheet.className = "ab-sheet";
  sheet.hidden = true;
  sheet.innerHTML =
    '<div class="ab-sheet__scrim" data-ab-close></div>' +
    '<div class="ab-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="abSheetTitle">' +
    '<div class="ab-sheet__head">' +
    '<div class="ab-sheet__grab" data-ab-close></div>' +
    '<button type="button" class="ab-sheet__close" data-ab-close aria-label="Close">' +
    CLOSE_IC +
    "</button>" +
    '<h2 class="ab-sheet__title" id="abSheetTitle">All Books <span>' +
    list.length +
    " genres</span></h2>" +
    '<label class="ab-sheet__search">' +
    SEARCH_IC +
    '<input type="search" placeholder="Search genres…" aria-label="Search genres" autocomplete="off" enterkeyhint="go"></label>' +
    "</div>" +
    '<div class="ab-sheet__body">' +
    '<div class="ab-sheet__intro">' +
    '<a class="ab-sheet__allrow" href="' +
    href("all") +
    '"><span>View all books</span>' +
    CHEV +
    "</a>" +
    '<a class="ab-sheet__catsrow" href="' +
    ROOT +
    'categories/">See all categories by theme' +
    CHEV +
    "</a>" +
    '<p class="ab-sheet__eyebrow">Popular</p>' +
    '<div class="ab-sheet__chips">' +
    POPULAR.map(function (n) {
      var g = bySlug[slug(n)];
      return (
        '<a class="ab-chip" href="' +
        href(g.slug) +
        '"' +
        (g.slug === current ? ' aria-current="page"' : "") +
        ">" +
        esc(g.name) +
        "</a>"
      );
    }).join("") +
    "</div>" +
    "</div>" +
    '<div class="ab-sheet__list">' +
    groupsHtml("ab-sheet", "ab-sheet__link", CHEV) +
    "</div>" +
    '<p class="ab-sheet__empty" hidden>No genre matches that.<br><a href="' +
    href("all") +
    '">Browse all books</a></p>' +
    "</div>" +
    '<nav class="ab-sheet__index" aria-label="Jump to letter">' +
    groups
      .map(function (gr) {
        return (
          '<button type="button" data-jump="' +
          gr.letter +
          '" tabindex="-1">' +
          gr.letter +
          "</button>"
        );
      })
      .join("") +
    "</nav>" +
    '<div class="ab-sheet__bubble" aria-hidden="true"></div>' +
    "</div>";
  document.body.appendChild(sheet);

  var sInput = sheet.querySelector("input"),
    body = sheet.querySelector(".ab-sheet__body");
  var sList = sheet.querySelector(".ab-sheet__list"),
    intro = sheet.querySelector(".ab-sheet__intro");
  var sEmpty = sheet.querySelector(".ab-sheet__empty"),
    index = sheet.querySelector(".ab-sheet__index"),
    bubble = sheet.querySelector(".ab-sheet__bubble");
  var lastFocus = null;

  function setSheet(open) {
    if (open === !sheet.hidden) return;
    sheet.hidden = !open;
    document.documentElement.classList.toggle("ab-lock", open);
    if (open) {
      lastFocus = document.activeElement;
      body.scrollTop = 0;
      requestAnimationFrame(function () {
        sheet.classList.add("is-open");
      });
      setTimeout(function () {
        sheet.querySelector(".ab-sheet__close").focus({ preventScroll: true });
      }, 50);
    } else {
      sheet.classList.remove("is-open");
      if (sInput.value) {
        sInput.value = "";
        sUpdate();
      }
      if (lastFocus && lastFocus.focus)
        lastFocus.focus({ preventScroll: true });
    }
  }
  function sUpdate() {
    var q = sInput.value.trim(),
      n = filter(sList, "ab-sheet", sInput.value);
    intro.hidden = !!q;
    index.hidden = !!q;
    sEmpty.hidden = n > 0;
    body.scrollTop = 0;
  }
  sInput.addEventListener("input", sUpdate);
  sInput.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var first = sList.querySelector("li:not([hidden]) a");
    if (first && sInput.value.trim()) {
      e.preventDefault();
      location.href = first.href;
    }
  });
  sheet.addEventListener("click", function (e) {
    if (e.target.closest("[data-ab-close]")) setSheet(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !sheet.hidden) setSheet(false);
  });

  /* A–Z scrubber: tap or drag along the letters to jump; a bubble shows the current letter */
  function jump(letter) {
    var sec = sList.querySelector('[data-letter="' + letter + '"]');
    if (!sec) return;
    body.scrollTop = sec.offsetTop;
    bubble.textContent = letter;
    index.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("is-on", b.dataset.jump === letter);
    });
  }
  function letterAt(x, y) {
    var el = document.elementFromPoint(x, y);
    var b = el && el.closest && el.closest("[data-jump]");
    return b && index.contains(b) ? b.dataset.jump : null;
  }
  var scrubbing = false;
  index.addEventListener("pointerdown", function (e) {
    scrubbing = true;
    index.setPointerCapture && index.setPointerCapture(e.pointerId);
    sheet.classList.add("is-scrubbing");
    var L = letterAt(e.clientX, e.clientY);
    if (L) jump(L);
    e.preventDefault();
  });
  index.addEventListener("pointermove", function (e) {
    if (!scrubbing) return;
    var r = index.getBoundingClientRect();
    var L = letterAt(
      r.left + r.width / 2,
      Math.min(Math.max(e.clientY, r.top + 1), r.bottom - 1),
    );
    if (L) jump(L);
  });
  function endScrub() {
    if (!scrubbing) return;
    scrubbing = false;
    sheet.classList.remove("is-scrubbing");
    index.querySelectorAll("button.is-on").forEach(function (b) {
      b.classList.remove("is-on");
    });
  }
  index.addEventListener("pointerup", endScrub);
  index.addEventListener("pointercancel", endScrub);
  index.addEventListener("click", function (e) {
    var b = e.target.closest("[data-jump]");
    if (b) jump(b.dataset.jump);
  });

  window.RKAllBooks = {
    open: function () {
      setSheet(true);
    },
    close: function () {
      setSheet(false);
    },
    href: href,
  };
})();
