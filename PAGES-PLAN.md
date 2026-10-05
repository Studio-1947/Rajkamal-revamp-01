# Rajkamal revamp — page rollout plan & handoff

**Read this first if you're picking up the work.** It's kept up to date at every checkpoint so any agent can continue.

## The goal

Rebuild every page type of the live site (https://www.rajkamalprakashan.com) in the new UI, phase by phase. The live site has **42 unique page types** (~8,800 URLs; most are copies of the book page and author page templates). After each phase the user reviews the pages before the next phase starts — **do one phase at a time, then stop and ask for review.** Commit only when the user agrees.

## Current status

- **Last updated:** 2026-10-05 (review checklist added; phone discount tags + strip slider done)
- **Phase in progress:** none — **all 7 phases are built.** All 42 page types of the live site now exist in the new UI. Phase 7 (policies, footer wiring, final QA) done by Claude on 2026-10-05.
- **Next step:** user reviews every page with the **Review checklist** below, plus the open content questions; commit/push when the user agrees; merge `checkout-page` → `main` for the Vercel production deploy.
- **Git:** Phase 7 and everything after it (strip slider, discount tags, this file) are **not yet committed** (ask first). Everything before them is committed and pushed — branch **`checkout-page`** (in sync with `origin/checkout-page`), latest commits `f316058 major addition incomming`, `52a74ce for vercel deploy`, `1015beb final update for 2nd October`. `main` is behind; merge `checkout-page` into `main` when the user is ready (Vercel production deploys from `main` by default; other branches get preview URLs). Ask before committing or merging.

### Phase 7 (2026-10-05) — done

| Step | State |
|---|---|
| Policy pages from the live text (verbatim; Cloudflare-obfuscated emails decoded: privacy → privacy@, shipping/returns → online@, terms → info@): `privacy-policy/`, `privacy-cookies-policy/`, `terms-and-conditions/`, `shipping-policy/`, `return-refund-policy/` — same URLs as the live site | done |
| Layout reuses `kt/content.css` (hero, sticky side panel, cards) + `kt/policy.css`: side panel = switcher between the 5 policies + "On this page" (highlights the section in view, `kt/policy.js`); phones keep the switcher as a sideways strip. Shipping timeline/charges shown as tiles; T&C contact block | done |
| Cookie Settings: working panel on `privacy-cookies-policy/#cookie-settings` (necessary always on; analytics/marketing toggles saved to `localStorage["rk-cookie-prefs"]`; footer link scrolls to and highlights it) | done |
| Generator: the pages were built by `build_policies.py` in Claude's scratchpad from the live HTML (not kept in the repo). To change a policy, edit its `index.html` directly | note |
| Footer on all 48 pages: every link real (Work With Us, Publish With Us, Report an Issue, Return & Exchange, Privacy & Cookies, Shipping, T&C, Cookie Settings) and the 15 social icons point to the real accounts of Rajkamal, Radhakrishna, Lokbharti, Rajkamal Urdu (from the live footer). `404.html` uses root-absolute links. `forms/_build.py` copies the catalogues footer, so rebuilt form pages keep it | done |
| To-dos from the 2026-10-05 review: Track Order "Report an Issue" → `../report-issue/`; event "Contact Support" no longer opens a new tab; `kt/forms.js` duplicates removed and the fallback now matches whole words of the field name/id (verified: every field on all 13 form pages keeps exactly the same rule; "shipping"/"opinion"/"contact-email" are no longer caught) | done |
| Found and fixed in QA: author pages' blurred photo fill requested `/photos/…` (a CSS variable's `url()` resolves against the stylesheet) → full URL via `new URL(...)`; hidden phone burger menu's "All Books" and "WhatsApp" were `#`; policy pages' text was clipped on phones (column widened by the sideways strip) | done |
| **Final QA (2026-10-05):** 47 pages + 7 detail/404 URLs on desktop — 0 JS errors, 0 failed requests, 0 broken images, 396 internal links all resolve, 0 `href="#"` left; 360px phone — no page scrolls sideways and no content is clipped (50 pages); cookie panel save/reload works; `forms/_check.js` ALL CHECKS PASSED | done |

### Phase 5–6 review (2026-10-02)
- **Automated sweep, all 11 pages:** 0 page errors, 0 failed requests, 0 broken images, 0 broken internal links; header/footer present; phone pages don't scroll sideways (About/FAQ section nav is an intentional sideways chip strip). `forms/_check.js`: **ALL CHECKS PASSED** (it needed one line to fill Publish-with-us's required Book title).
- **Fixed by Claude** (CSS only, appended to `kt/content.css`, version bumped to v=4 incl. `forms/_build.py`): hero headings used Noto Sans Devanagari for Latin text and weight 700 → now Google Sans Flex first and 600 (site rule); breadcrumbs were unstyled (styles live in product.css) → added; FAQ selected category was invisible (inline `background:none` beat `.is-active`) → `button.cnt-side__link.is-active` override.
- **Open content questions for the user (not changed):**
  - About → Offices: "Lokbharti Campus, Prayagraj" and "Fort / Dadar Literary Hub, Mumbai" aren't on the live site (live lists only the Delhi head office). Also not on live: "Nayi Kahani" detail, Bhisham Sahni and Kedarnath Singh in the author list.
  - Phone number: live About page says +91-11-2327-4463; our pages/footer use 011 4263 8228 — which the live **Terms & Conditions** page also lists (with +91 98102 81912), so the footer number is confirmed by the live site.
  - Team page uses "Lorem Ipsum" placeholders (live team page is itself a placeholder).
- **`kt/forms.js` (edited by the user):** works on every current form (checked field-by-field), but has duplicate `name` rule and `nameOk` definitions (the later one wins) and a second, broader substring match in `ruleFor` ("pin" also matches "shipping"/"opinion", "contact" would make a contact-email field a phone field). Suggest removing the first copies and the broad fallback, or adding `data-rule` to unusual fields.

### Review feedback applied

- **Book page: photo viewer** (user: clicking the image must open it): the photo frame is a button (zoom-in cursor, an expand badge on hover / always on phones; Enter / Space from the keyboard). It opens a **full-screen viewer** of the current format's photos, starting at the one showing: ‹ › arrows, "2 / 5" counter, a thumbnail strip, ← / → keys, swipe on touch; **click / tap the photo to zoom 2× at that spot** (move to pan, click again to zoom out); closes with ✕, Esc or the dark area; scroll is locked while open, focus stays inside and returns to the photo. Photos slide in from the side you move to; no motion under reduced motion; a broken photo falls back to our local cover. `books/product/product.js` v=11 (`lightbox()`), `product.css` v=22 (`.pd-lb`). Verified 1440 / 1024 / 390: the whole photo always fits between the top bar and the strip, 0 errors.
- **Book page, round 3** (user): **Paperback · Hardcover · E-Book are always offered**, in that order — a format the book doesn't come in still shows, greyed with a dashed border and "Not available", and can't be picked (magazines / text books / combos keep just their own format). **One clean heart everywhere**: the old hand-drawn heart path was replaced site-wide (book page, book cards `kt/book-card.js` v=2, account, wishlist drawer, phone tab bar + profile sheet, sign-in pages) with the nav's heart; on cards and the book page it fills and beats on hover and stays filled once saved (rule at the end of `kt/styles.css` v=b48). Versions: `product.js` v=10, `product.css` v=19, `mobile-nav.js` v=37, `account.js` v=6, `auth.js` v=5, `wishlist.js` v=4. Still open: the cart stores book ids only, so it always charges the catalogue format's price whichever format is picked.
- **Book page, round 2** (user: image takes the left half; "Available Offers" was boxes inside a box — make it fluid): on ≥801px the page is **two equal columns**; the photo frame fills the left half and is as tall as the screen allows (`min(100vh − 210px, 760px)`, rounded, photo never cropped; thumbnails below; the column stays sticky). The main photo is now the **live site's ~830px image** (sharp at this size), falling back to our local ~300px cover (`data-fb`) and then to the title card. **Offers are three equal columns** (5% / 7% / 10%, same size and colour, split by thin vertical rules — an earlier dots-on-a-line ladder made 10% look selected), no boxes; the **trust points** are open too (icon + two lines, thin dividers, rules above and below). `books/product/product.js` v=9, `product.css` v=18. Verified 1440 / 1024 / 390, light + dark; blocked remote image → local cover.
- **Nav icons — one set** (user: better WhatsApp / wishlist logos that react to hover → keep colours thematic, no WhatsApp green → do the rest too): **Profile, WhatsApp, Wishlist, Cart and the Sun / Moon theme toggle** all have fresh matching outline icons (the real WhatsApp glyph; replaced in all 48 page headers, heart in `kt/mobile-nav.js` v=36) and **one hover system in the site's palette**: the button lifts and fills terracotta #a0361f with a white icon and a soft glow (dark: coral #f28b7d with a deep-maroon icon), presses in on click, the badge nudges up — and each icon has its own move: profile nods, WhatsApp wiggles, the heart beats and fills, the cart rolls, the moon rocks / the sun turns. Saved books keep the heart filled in brand red (white on hover). Same on keyboard focus; no motion under reduced motion. Styles at the end of `kt/styles.css` (v=b47). **Open question:** the desktop WhatsApp button has no click action (the phone menu links to bare `https://wa.me/`) — needs the WhatsApp number to link to.
- **All Books: sort / filter bar** (user: same line as the title, sticky but optimised while scrolling, simpler and realistic options):
  - **Layout (round 2, user: "keep the whole banner" instead of a separate nav-like bar):** title, count and sort / filter live in one **title banner** (`#bkBanner`). On ≥1024px the controls sit on the title's line (right side); below that they sit under the title. While scrolling, the **whole banner stays pinned under the nav** (top = the nav's measured height; phones: the top edge) as a band in the page's own colour, condensed (smaller title, eyebrow kept on desktop; phones keep title + count on one line), with a soft shadow underneath; pinned, its background also runs up behind the nav so no books show between them. When it condenses, `books.js` grows its bottom margin by exactly the height it lost, so the books below don't jump (measured: ≤1px). Phones: the sort / filter panels open as a sheet **above** the bottom tab bar.
  - **Options (only what the catalogue really has):** Sort — Recommended, Newest first, Price low → high, Price high → low, Biggest discount, Title A–Z. Filter — Format (Paperback / Hardcover / E-Book, multi-select), Price (Under ₹200 / ₹200–300 / ₹300–500 / ₹500+), Offer (Any / 10% off or more / 20% off), In stock only. Removed: the 30 / 50 / 70% discount options and the "50% or more" chip — no book is over 20% off. Each option shows how many books it leaves (given the other choices) and is disabled if none; the Filter button shows a badge with the number of active filters; the panel's button reads "Show N books"; quick chips **In stock** and **20% off** stay in sync with the panel; "No books match" offers Clear filters.
  - **Round 3 (user):** **no shadow** under the pinned banner. A **format segment** on the bar — All · Paperback · Hardcover · E-Book with counts (one at a time; the Filter panel still allows several; they stay in sync). **"20% off" became a Discount dropdown** — Any / 10% or more / 20% or more / 30% or more / 50% or more with counts; options with no books (today 30% and 50%) are disabled, so bigger discounts start working on their own when such books are added; the button reads e.g. "20%+ off" when set. On ≥1024px the controls drop under the title if they don't fit beside it. Phones: the segment gets its own full-width row on top, the other controls one row below (Sort icon-only; ≤360px Filter icon-only too). Verified 1440 / 1100 / 700 / 430 / 390 / 360 / 320: 0 errors, no overflow.
  - **Data:** new `books/books-facets.js` (12 KB, `RK_FACETS[id] = [formats bitmask 1 PB · 2 HB · 4 EB, first publication year, in stock 1/0]`, generated from `books-formats.js` + `books-detail.js`; 15 books out of stock).
  - Files: `books/index.html` (`#bkBanner` > `.bk-head` + `#bkBar`), `books/books.js` v=13, `books/books.css` v=27. Verified 1440 / 1100 / 820 / 390, light + dark, `?g=all`, `?g=<genre>`, `?c=<collection>`: 0 errors, no overlap.
- **All Books dropdown, round 2** (user): "View all books" (a filled red button that looked like a selected category) and "All categories" moved out of the category list into a **footer strip** of the genre panel ("Not sure where to start?" · All categories · View all books → as an outlined pill). The **genre panel is its own tinted surface** and the selected category's tab joins it like a folder tab (accent bar on the tab's left), with a "GENRES IN" eyebrow over the category name — so the genres read as *belonging to* that category, not as another list. **Genres are chips** (pill, fills accent on hover; the current genre outlined) that **stagger in** on each category switch; search results use the same chips. `kt/all-books.js` v=8, styles at the end of `kt/styles.css` (v=b41). Desktop only — the phone genre sheet is unchanged. The ▾ arrows beside All Books and Publications now sit ~5px from the text (was ~13px): `.header-nav-main a { gap: 0 }` + `.chev { margin-left: 1px }` at the end of `kt/styles.css` (v=b43). **Fix:** clicking "All Books" on desktop only toggled the menu (the click was cancelled) and never opened the page — now a mouse click (and Enter) goes to `books/?g=all`; hover still opens the menu, ↓ opens it from the keyboard, and only wide touch screens without hover keep tap-to-open (they reach the page via the menu footer). `kt/all-books.js` v=9.
- **Bestsellers tint is a panel, not a full-width band** (user): the red tint now ends just past the cards (a rounded panel, 18px of breathing room; the shelf arrows sit outside it); outside it the page keeps its normal background. On 721–1339px the heading is indented to line up with the cards (the shelf has arrow gutters there); phones get a 6px inset. `home/home.css` v=93 (`#hm-sec-bestsellers .hm-wrap::before`). The other alternating sections (`.hm-sec--alt`) still use full-width tints.
- **New Releases: month timeline instead of month chips** (user: chips → "a movable scale"; then "too basic — end to end on large screens, smoother animation"): a **full-width timeline** (edge to edge of the content; "All" and the last month flush with the edges) — All, then the months oldest → newest with full names (short names on phones), 8 ticks per month (major / mid / minor). The **handle rides a spring**: it follows the pointer with a slight ease while dragging and settles with a soft overshoot when it snaps to the nearest month on release; **ticks swell** around it, **labels lift and brighten** as it passes, a **bubble above it** names the month + book count (stays inside the section at both ends), and the shelf's **books rise in one after another** when the month changes. Click a label or the line to glide there; ←/→/Home/End step by month. Accessible: an invisible real `<input type="range">` sits on the line (keyboard, touch, `aria-valuetext`), plus a screen-reader-only live caption. Reduced motion: no spring / rise. Months and counts come from `RK_HOME.sections["New Releases"][].month`. Code: `home/home.js` v=47 (`.hm-scale`; shelves refresh their arrows on `hm:filtered`), styles `home/home.css` v=90. Round 3 (user: "more animation" + "what if books are added in October or December?"):
  - **New months just work** — the timeline is built from the books' `month` values, which may be `"October"`, `"October 2026"` or `"2026-10"` (`monthKey()` in `home/home.js`). A month name without a year means the latest such month up to today, so December → January stays in order. Months are sorted by date; **months in between with no books are shown greyed and skipped** by the handle, keys and clicks; at most the **last 12 months** are shown (older books stay under All); ticks per month drop from 8 → 4 → 2 as months grow; **labels that would collide are hidden** (selected month first, then the ends, then months with books) and a year mark (’26 / ’27) appears when the range spans two years. Tip: when adding books, prefer `"2026-10"` style months. Tested by injecting October, October + December (November empty), and Dec 2026 + Jan 2027 + 2025 months, at 1366 and 390px.
  - **More motion:** the line draws in when the section first scrolls into view (ticks rise in a wave, labels follow, the handle drops in with a bounce); the handle breathes while idle; the bubble tilts with drag speed and grows while dragging; a ripple marks each snap; the filled line shimmers while dragging; a dot grows under the selected month; books leaving the shelf fade out before the new month's books rise in. All off under reduced motion. `home/home.js` v=50, `home/home.css` v=91.
- **Home collection tiles redesigned** (user: no icons, nicer background, every name on two lines; then "too colourful — add ethnic-style SVGs"): the six tiles share **one warm palette** — sand cards with terracotta line art (dark theme: maroon with gold) — and each carries its own **traditional SVG motif**, drawn in code in `home/home.js` (`MOTIFS`, v=45): mandala, paisley (buta), lotus, jaali lattice, kolam, toran garland; plus a thin inner frame. The motif brightens on hover (mandala and kolam turn slightly). Every name is set on **exactly two balanced lines** (`twoLines()`); at ≤400px the text scales with the screen so "Representative" never truncates (checked 1366 / 900 / 390 / 360 / 320). Styles: `home/home.css` v=85. Round 3 (user): **no borders** (outer border and inner frame removed), a deeper layered **shadow** so the cards lift off the page (the tile row is `z-index: 1` with extra bottom room — the next section used to paint over the shadow), and **more readable names** (darker / lighter text per theme, slightly larger, a soft halo in the card colour so the motif never crosses the letters; motifs a little fainter). `home/home.css` v=87.
- **Home hero search: flipping placeholder** (user): "Search by" + **Title → Author → Publisher → Category** rolls upwards every 2.5s (CSS only, `.hm-ph` in `home/home.css` v=81; hidden while focused or typing; static under reduced motion). Same box size as before (420×60). The search itself now also matches **category** (`books-cats.js`) and **publisher / imprint** (new 9 KB `books/books-pubs.js`, `RK_PUBS.of(id)`, generated from `books-formats.js`) as well as title and author. Loaded on `home/` and the root `index.html`.
- **Desktop navbar** (user, 2026-10-05). Rules at the end of `hp/hp.css` (v=b4; every `body.hp` page) + logo hand-over in `kt/styles.css` (v=b39) + highlight in `kt/mobile-nav.js` (v=35):
  - **Double logo fixed:** the emblem-only mark used to sit at full opacity under the full logo, so both showed while the nav shrank. Now the mark is hidden until scrolled, and the two fade one after the other (out, then in) — never both at once.
  - **At the top of the page the nav is part of the page** — no pill background, border or shadow; the floating pill + shadow fade in once you scroll (`html[data-theme] .hp .site-header:not(.scrolled) .header-top`).
  - **More space** between nav items (each item is now a padded pill; gaps between logo / search / menu / icons widened).
  - **Search box = the width of "Search by Publishers"** (250px, its longest placeholder) in both states — it no longer stretches when the logo shrinks.
  - **Current section highlighted** (`.is-current` + `aria-current="page"`): books / categories / collections → All Books (not the cart flow `books/checkout|order`), authors, ebooks, publications, catalogues, events.
  - **Narrow laptops:** 981–1279px use the emblem-only logo and tighter spacing (and 981–1040 less side padding) so all six items fit. Verified 981–1920px on 6 pages, top + scrolled: no menu item cut off, 0 JS errors. (Before this, 1024px already lost "Publications". Note 721–980px has no top menu and no burger — the burger is phone-only; unchanged.)
- **Book page matches the live product page** (user: "a UI update, so include everything the live page has"; compared with rajkamalprakashan.com/products/pratinidhi-kahaniyan-shiv-kumar-shiv). `books/product/product.js` (v=8) + `product.css` (v=15) now render: **photo gallery** (front cover + the live page's other photos as thumbnails; whole image, never cropped), **ISBN + Edition** under the title, **format switcher** (Hardcover / Paperback / E-Book / Magazine…, each with its own price, MRP, % off, ISBN, edition, stock, weight, size, year, publication and photos), **E-Book → "Buy on Kindle / Google Play"** buttons instead of the cart, **out of stock** formats say so and hide Add to cart, **Available Offers** (5% above ₹2,000 · 7% above ₹5,000 · 10% above ₹10,000, applied in the cart), **trust strip** (Ships in 7 Days · 100% Original · Easy Returns · Free above ₹1,200 — replaces the old wrong "Free delivery on this offer" line), **"About Book"** with **contributor cards** (Author / Editor / Translator with photo; our author page for the 20 featured authors, the live author page otherwise; initials when there is no photo) and **Book Details** (Author, Editor, Translator, Format, ISBN-13, Publication, Publisher, Edition, Pages, Language, Category, Publication Year, Reprint Year, Weight, Dimensions — per format). Not copied: SKU and Tax Rate rows (internal).
  - Data: new **`books/books-formats.js`** (`window.RK_FORMATS[id]`, 295 KB, all 316 catalogue books; scraped from each product page's embedded Next.js record — find `"variants":[`, walk back to the enclosing `{`, bracket-match, `json.loads(strict=False)`). Author emails are not stored.
  - **Descriptions fixed:** 161 books in `books/books-detail.js` (now v=3) had `"$39"`-style text — an unresolved Next.js reference — as their description. Resolved from the page's flight stream (`<key>:T<hex byte length>,<text>`). 12 books have no description on the live site either, and with the books lacking detail data, 24 pages show the Lorem placeholder (`<p data-placeholder>`).
  - **Remote images:** gallery photos and non-featured contributor photos load from `images.rajkamalprakashan.com`, which returns 403 to other sites' referrers — the `<img>`s carry `referrerpolicy="no-referrer"` (keep it). The first photo of the catalogue's own format is the local `books/covers/<id>.jpg`.
  - **Known limit:** the cart stores book ids only (`RKStore.addToCart(id)`), so it always charges the catalogue format's price; choosing Hardcover and adding to cart still adds the catalogue format. Per-format cart lines need a change to `kt/mobile-nav.js` + checkout — not done yet.
  - Verified: all 316 book pages at 390px — 0 JS errors, 0 sideways overflow, details rendered; format switching, e-book links, cart, gallery on desktop + phone, light + dark.
- **Slider bar on listing chip rows too** (user): `kt/strip.js` now also covers `.bk-filters` (All Books sort / filter / quick chips) and `.au-chips` (Authors filters, E-Books genre + price, Categories theme jump, Events city filter) — added to those 5 pages. The script re-checks a strip whenever its contents change (rows are filled by page scripts after it runs), moves the row's bottom margin below the bar so the bar sits 10px under the chips, and scrolls the selected chip (`.is-active` / `.is-on` / `aria-pressed="true"`) into view the first time the bar appears. Also fixed: on desktop the All Books filter row no longer scrolls (`books/books.css`), which had been clipping the Sort / Filter pop-ups (pre-existing). Page background for the fades comes from `--strip-page-bg` (`kt/styles.css`).
- **One book card everywhere** (user): All Books, author pages, imprint pages, product-page related books and Offers used a different (wide, 2-per-row) card from the home shelves. Now every book list uses the **home card**: `kt/book-card.js` (`RKBookCard(o)`, `RKBookCard.fromRow(row, href, coverBase)`) + `kt/book-card.css` (card styles moved out of `home/home.css`; `.bk-grid` = as many per row as fit — 5 on a 1440px screen, 2 on phones; Offers 4 per row). One site-wide click handler in `book-card.js` does Add to cart / wishlist / Buy now for every card (the pages' own copies were removed; the product page keeps its handler for the main book only). Category line comes from the small `books/books-cats.js` (id → category, generated from `books-detail.js`; 250 of 316 catalogue books have one). Verified on all 6 page types at 1440 and 390px: 0 old cards left, rows aligned, covers whole, one click = one cart item, wishlist toggles once, sort/filter re-render fine. The old `.bk-card` / `.bk-cover` rules in `books/books.css` are now unused.
- **Home collection tiles look centred** (user): the label always reserved two lines (`height: 2.5em`), so one-line labels left an empty line and the icon + text sat high. Now the label is `height: auto; max-height: 2.5em; text-wrap: balance`, the icon + label are centred as one group, and icons are a fixed 30px (22px on phones) — end of `home/home.css`. Verified at 1440 / 1024 / 390 / 360px: equal space above and below the content in every tile, for one- and two-line labels.
- **Home page: no seam between the navbar strip and the hero** (user, light mode): the hero's radial tint started 78px down, below the sticky navbar, leaving a visible line. On ≥721px `.hm-top` now gets `margin-top: -78px; border-top: 78px solid transparent; background-origin: border-box` (end of `home/home.css`), so the tint starts at the very top behind the transparent navbar while every padding rule and the content position (154px from the top) stay the same. If the header height changes, update the 78px.
- **Phone Search & Profile sheets fit every screen** (user, twice): real phones lose height to the browser's address bar and toolbar, so the sheets are sized for the *visible* area. Search sheet = "Search by Book Names" search-box row + a 2-column grid of one-line tiles with short labels (Categories, Authors, E-Books, Collections, Publications, Offers, All Sections) — `.mobile-search-sheet__find` / `__grid` / `__tile` in `kt/mobile-nav.js`, styles at the end of `kt/styles.css`; 495px → 362px tall. Profile sheet rows tightened (491px → 426px). Both may use up to 88dvh and show a bottom fade (`.has-more`, `sheetCue()` in `kt/mobile-nav.js`) if they still overflow. Verified at visible sizes 320×480, 360×560 (Android Chrome), 375×553 (iPhone SE Safari), 390×664 (iPhone 14 Safari), 412×732: every option fully visible, no scrolling needed (Profile scrolls by 4px only at 320×480); tiles ≥ 46px tall; no label truncated. Keep new sheet rows within this budget.
- **iOS Safari's floating bottom address bar** (user): it overlays the bottom ~70px of the page and can't be measured from the page, so `kt/mobile-nav.js` adds `html.ios-safari` (iPhone/iPad Safari only — not Chrome/Firefox/Edge on iOS, not home-screen web apps), and the end of `kt/styles.css` pads the Search and Profile sheets (76px + safe area) and the All Books genre sheet's list (96px + safe area) so their last rows sit above it. Verified with an iPhone Safari user-agent: last rows end 76px / 96px above the bottom, no scrolling; other browsers unchanged (20–24px). **To check on a real iPhone:** whether the bottom tab bar itself also sits under Safari's bar.
- **Phone cards: discount tag always under the price** (user): on ≤720px the "10% off" / "20% off" tag sits on its own line below the price on every card, whatever the price length — home shelves (`.hm-price` → 2-column grid, `.hm-off` spans the row; `home/home.css`), catalogue / author / imprint / related cards (`.bk-price` column, `.bk-price__now` no-wrap; `books/books.css`) and Offers deals (`.of-deal__p`; `kt/extras.css`). The price area has a fixed height so cards with and without a discount still line up. Verified at 360 and 390px: every tagged card has the tag below the price, 0 rows with misaligned buttons.
- **Sideways chip strips show they scroll** (user, after Phase 7): on phones/tablets the content pages' side panel (About, FAQ, the 5 policies) **and the account page's section menu** scroll sideways. `kt/strip.js` (on those 8 pages) wraps each strip in `.rk-strip` — `display:contents` until the strip actually scrolls, so desktop sticky panels are untouched — and adds edge fades (`can-left` / `can-right`) plus a slim slider bar (`.rk-strip__bar`: thumb width = visible share, moves as you swipe; tap the track or drag the thumb), scrolls the selected chip into view clear of the fade, and nudges once per session (skipped with reduced motion). It watches the DOM, so strips redrawn later (the account page re-renders on every tab) get it too. Targets are listed in `TARGETS` at the top of the script; styles are at the end of `kt/styles.css` (pages set `--strip-bg` for the fade colour and `--strip-r` for the corner radius). `kt/content.css` also forces `.cnt-grid` to `minmax(0, 1fr)` on ≤900px so a long strip can't widen the column past the screen. The user preferred the slider to an arrow button. On ≤900px the account menu is styled like `.cnt-side` (the bordered box is the scrolling `ul`, the bar sits below it outside the border, same colours/chips — end of `account/account.css`), so both strips look identical.
- **Home page shelves** (user, after Phase 5–6 review): no visible scrollbar on any shelf; on large screens the ← → buttons sit on the shelf's own left/right edges, centred on the covers, and fade out at each end (`.hm-rail` with `is-start` / `is-end` / `no-scroll`, set by `railState()` at the end of `home/home.js`); on phones there are no buttons — a finger swipe snaps card by card (`scroll-snap-type: x mandatory`, edge-to-edge bleed) with a small position bar (`.hm-progress`). Hindi Divas stays a 5×2 grid on desktop.
- **Discount tags never break** (user): `.hm-off`, `.bk-off` and the offers `em` are `white-space: nowrap`; the price row wraps so the whole tag moves under the price on narrow cards.
- **Type-safe forms, no prefill** (user, Phase 5 start): `kt/forms.js` on every page — phone fields take digits (one leading "+" for international), 10 digits for Indian numbers; PIN 6 digits; amounts digits; names/city letters only (Hindi works) plus . ' -; AWB/codes upper-case letters+digits; caret kept while filtering; pasting is filtered too. Submit checks use `window.RKForms.nameOk/phoneOk/emailOk/pinOk`. Event registration and gift cards no longer prefill from the profile (account edit forms still show saved values on purpose). Gift card amount is a digits-only text field (number fields accept e/+/-).
- **Header** (user): Authors and E-Books lost their dropdown arrows (they're plain links). Publications opens a hover dropdown of the 12 imprints (logos + title counts; 120 ms open / 220 ms close delay; ArrowDown/Esc; click still goes to `publications/`) — in `kt/all-books.js`, styles at the end of `kt/styles.css`.
- **Book covers are never cropped and nothing is drawn on them** (user, Phase 4 start): every book cover uses `object-fit: contain` (cards, product page, cart, checkout, account, home shelves, offers deals, thumbnails) with a soft neutral fill; fanned cover stacks use natural height. Discount badges moved off the image to beside the price (home shelves `hm-off`, offers deals). Keep this rule for any new book card.
- Signed out: the account page shows only a "You are signed out" card with Sign in / Create account (no profile/orders/wishlist menu); the phone Profile sheet swaps My Account / My Orders / Wishlist for Sign in / Create account (`data-when="in|out"` rows in `kt/mobile-nav.js`, synced on open from `rk-signed-in`).

### Phase 3 progress (Shop extras)

| Step | State |
|---|---|
| Live content: `/offers` (placeholder + Azadi banner), `/gift-cards` (copy, ₹10–₹10,000, fields, RKGC code format), `/track` (AWB field + help text) | done |
| `offers/` + `offers/offers-data.js`: 3 real campaigns (Kitab Teras 10–20 Oct from `kt/`, Hindi Pakhwara 15–30 Sep from `hp/` banner alt text, Azadi 8–23 Aug from the live banner) with live/soon/ended worked out from today's date; every-day order discount (5/7/10%, from live product pages); biggest catalogue discounts; images in `offers/img/` | done |
| `gift-cards/`: presets (our addition) + custom amount, email/code delivery, live card preview, demo purchase → code, "Add to my account" writes `rk-giftcards` | done |
| `track/`: AWB form, demo timeline (uses the order's own dates for your account orders), signed-in recent orders, help cards. "Report an Issue" still links to the live site — see Phase 7 to-do | done |
| Links: phone Search sheet "Best Offers" → `offers/`; account gift card tab "Buy a gift card" → `gift-cards/`. Footer "Track Your Order" still `#` — wire in Phase 7 | done |
| Shared CSS `kt/extras.css` | done |
| Browser check (all flows, desktop/phone/dark; fixed: form help text re-showing old errors in gift cards + auth, deals grid orphan, phone gift-card order) | done — 0 errors, 0 broken requests |
| User review | **waiting** |

### Phase 1 progress (Browse indexes)

| Step | State |
|---|---|
| Live content gathered (collections list, 12 imprints, imprint books) | done |
| Imprint book covers → `books/covers/`, logos → `publications/logos/`, collection images → `collections/img/` | done |
| `publications/publications-data.js` (12 imprints + first 8 books each, registered as `imprint-<slug>` collections + RK_DETAIL; loaded by `books/` and `books/product/` too) | done |
| `categories/` (142 genres by the 10 themes, search, jump chips) — uses `window.RK_GENRE_THEMES` exported from `kt/all-books.js` | done |
| `collections/` (11 shoppable shelves with cover stacks + 26 live collections linking out; data in `collections/collections-data.js`) | done |
| `publications/` index + `publications/imprint/?id=` page; shared CSS `kt/browse.css` | done |
| Links: header "Publications" on all pages; "All categories" in the All Books menu (desktop + phone); Collections + Publications rows in the phone Search sheet | done |
| Browser check + screenshots (desktop, phone, dark; all 12 imprint pages; imprint book → book page → cart) | done — 0 errors, 0 broken requests |
| User review | **waiting** |

### Phase 4 progress (Events)

| Step | State |
|---|---|
| Live content: 8 events from the sitemap (title, subtitle, description, date/time, venue, map link, tags, photos) + the registration form (bilingual labels, category + "how did you hear" options) | done |
| `events/events-data.js` (year 2026 is ours — live pages show day + month only), photos in `events/img/`, helpers `events/ev-utils.js` (dates, upcoming/live/past from today, .ics "Add to calendar") | done |
| `events/` list (upcoming featured + past with city filter), `events/event/?id=` (cover, description, gallery viewer, details card), `events/register/?id=` (live form fields; saved to `rk-event-regs`; closed state for past events) | done |
| Header "Events" link wired on all pages | done |
| "Contact Support" on event pages → `../../contact/` (switched; still opens in a new tab — see Phase 7 to-do) | done |
| Browser check (list, all 8 event pages, gallery viewer, .ics file, registration errors/success/closed; desktop/phone/dark; phone puts the details card under the cover) | done — 0 errors, 0 broken requests |
| User review | **waiting** |

## Review checklist — all 42 page types

Start the server from the repo root with `python3 -m http.server 8765`, then open each link. Check every page on desktop **and** a phone-width window, in light **and** dark mode (moon button). ✅ = built and browser-checked; tick the last column as you review.

**Shop & discovery**

| # | Page | Open | Try | Reviewed |
|---|---|---|---|---|
| 1 | Home | http://localhost:8765/home/ (also `/`) | shelves: side arrows (desktop), swipe + bar (phone); All Books / Publications menus | ☐ |
| 2 | Book listing | http://localhost:8765/books/?g=all · `?g=poetry` · `?c=mitti-se-judein` · `?c=imprint-funda` | sort, filter, 50%+/In stock chips | ☐ |
| 3 | Book page | http://localhost:8765/books/product/?id=godan&c=mitti-se-judein | whole cover + photo thumbnails, formats switch price/ISBN/details, e-book store links, offers box, trust strip, contributor cards, add to cart / wishlist, related | ☐ |
| 4 | E-books + e-book page | http://localhost:8765/ebooks/ · http://localhost:8765/ebooks/ebook/?id=metronama | genre/price filters, Kindle / Google Play buttons | ☐ |
| 5 | Categories | http://localhost:8765/categories/ | search, theme chips | ☐ |
| 6 | Collections | http://localhost:8765/collections/ | cover fans, live collections open in new tab | ☐ |
| 7 | Authors directory | http://localhost:8765/authors/ | search (English/Hindi), filters, sort | ☐ |
| 8 | Author profile | http://localhost:8765/authors/author/?id=premchand | full photo, notable works, books, ← → keys | ☐ |
| 9 | Publications | http://localhost:8765/publications/ | 12 imprints | ☐ |
| 10 | Imprint page | http://localhost:8765/publications/imprint/?id=sarthak · `?id=hans-prakashan` (no titles) | books → book page → cart | ☐ |
| 11 | Campaign landings | http://localhost:8765/hp/ · http://localhost:8765/kt/ (variants `/kt2/`, `/mobile/`; `/kt3` redirects on Vercel) | | ☐ |
| 12 | Offers | http://localhost:8765/offers/ | live / soon / ended badges, biggest discounts | ☐ |
| 13 | Gift cards | http://localhost:8765/gift-cards/ | amount, live preview, buy, "Get the code" → Add to my account | ☐ |
| 14 | Cart | cart icon in the header on any page | drawer, quantities | ☐ |
| 15 | Checkout + order placed | http://localhost:8765/books/checkout/ → place order → `/books/order/` | form rules (digits / letters) | ☐ |
| 16 | Track order | http://localhost:8765/track/ (try `DL1234567890IN`) | timeline; your orders when signed in | ☐ |

**Sign-in & account**

| # | Page | Open | Try | Reviewed |
|---|---|---|---|---|
| 17 | Sign in | http://localhost:8765/auth/login/ · `?mode=password` | number → any 6 digits; Email OTP tab | ☐ |
| 18 | Create account | http://localhost:8765/auth/register/ | mobile → code → name; email & password meter | ☐ |
| 19 | Forgot password | http://localhost:8765/auth/forgot-password/ | | ☐ |
| 20 | Reset password | http://localhost:8765/auth/reset-password/?token=x (and without `?token`) | | ☐ |
| 21 | Verify email | http://localhost:8765/auth/verify/?token=x (and without `?token`) | | ☐ |
| 22–26 | Account: profile, orders, wishlist, addresses, gift cards (+ reward points) | http://localhost:8765/account/ (`?tab=orders`, `wishlist`, `address`, `giftcard`, `rewards`) | phone: section strip + slider bar; sign out → only the "signed out" card shows | ☐ |

**Events**

| # | Page | Open | Try | Reviewed |
|---|---|---|---|---|
| 27 | Events list | http://localhost:8765/events/ | city filter, Add to calendar | ☐ |
| 28 | Event page | http://localhost:8765/events/event/?id=kitab-utsav-bareilly · `?id=meri-maan-meri-gangster-book-launch-and-discussion` (gallery) | gallery viewer, arrows, Esc | ☐ |
| 29 | Event registration | http://localhost:8765/events/register/?id=kitab-utsav-bareilly | empty fields, "Other", register, reload | ☐ |

**Company, forms & policies**

| # | Page | Open | Try | Reviewed |
|---|---|---|---|---|
| 30 | About | http://localhost:8765/about/ | phone: section strip + slider bar | ☐ |
| 31 | Meet our team | http://localhost:8765/about/team/ | (placeholder names) | ☐ |
| 32 | Catalogues | http://localhost:8765/catalogues/ | search, view / download | ☐ |
| 33 | Newsletter | http://localhost:8765/newsletter/ | | ☐ |
| 34 | FAQ | http://localhost:8765/faq/ | search, categories, phone strip | ☐ |
| 35 | Publishing guidelines | http://localhost:8765/publishing-guidelines/ | | ☐ |
| 36 | Contact us | http://localhost:8765/contact/ | form rules, success panel | ☐ |
| 37 | Publish with us | http://localhost:8765/publish-with-us/ | | ☐ |
| 38 | Work with us | http://localhost:8765/work-with-us/ | | ☐ |
| 39 | Report an issue | http://localhost:8765/report-issue/ | | ☐ |
| 40 | Policies (5) | http://localhost:8765/privacy-policy/ · /privacy-cookies-policy/ · /terms-and-conditions/ · /shipping-policy/ · /return-refund-policy/ | policy switcher, "On this page", phone strip + slider | ☐ |
| 40a | Cookie settings | footer "Cookie Settings" → http://localhost:8765/privacy-cookies-policy/#cookie-settings | toggle, save, reload | ☐ |
| 41 | Coming soon (blog, press) | http://localhost:8765/coming-soon/ | | ☐ |
| 42 | 404 | http://localhost:8765/404.html (on Vercel: any unknown address) | | ☐ |

**Everywhere:** header links and dropdowns, footer links and social icons, phone bottom bar (Search sheet rows, Profile sheet signed in / out), dark mode, book covers never cropped.

## Deploying to Vercel

Checked on 2026-10-02 — the site deploys as-is.

- **Settings:** Framework Preset = **Other**, no build command, no install command, output directory = project root. No environment variables.
- **Branch:** the work is on `checkout-page` (pushed). Vercel deploys `main` to production and other branches as previews — merge `checkout-page` into `main` for production.
- **`vercel.json`:** `"trailingSlash": true` (required — pages load CSS/JS with relative paths like `../books.css`, so `/books/product?id=x` without the slash would load unstyled; Vercel now redirects to `/books/product/?id=x`) plus the `/kt3` → `/mobile/` redirects. Keep `trailingSlash` if you edit this file.
- **`.vercelignore`:** keeps dev-only files off the live site — `forms/_build.py`, `forms/_check.js`, `forms/_frags/`, `PAGES-PLAN.md`, `.vscode`, `.freebuff`. Add any new dev scripts here.
- **404:** the root `404.html` is served automatically for unknown URLs; its links are root-absolute (`/home/`, `/kt/…`) so it works at any depth. Keep it that way.
- **Verified locally (case-sensitive drive, same as Vercel):** all 42 pages load with 0 failed requests and 0 JS errors; every href/src matches a real file with exact upper/lower case; no file over 10 MB (whole site ≈ 50 MB).
- **Demo data:** sign-in, cart, wishlist, gift cards, event registrations and form submissions live in each visitor's `localStorage` only — nothing is sent to a server until a backend is connected.
- **After deploying, spot-check:** `/`, `/home/`, `/books/product/?id=godan&c=mitti-se-judein`, `/books/product?id=godan` (should redirect to the slash version), `/authors/author/?id=premchand`, `/kt3` (→ `/mobile/`), and any made-up URL (→ 404 page).

## Phases

| Phase | Pages | Shared layout | Status |
|---|---|---|---|
| 1. Browse indexes | Categories, Collections, Publications, Imprint page | `kt/browse.css` | built — in review |
| 2. Sign in | Sign in, Create account, Forgot password, Reset password, Verify email + 404 | `auth/auth.css` | built — in review |
| 3. Shop extras | Offers, Gift cards, Track order | `kt/extras.css` | built — in review |
| 4. Events | Events list, Event page, Event registration | `events/events.css` | built — in review |
| 5. Company & content | About, Meet our team, Catalogues, Newsletter, FAQ, Publishing guidelines, Coming soon (blog, press) | `kt/content.css` | built by user — reviewed |
| 6. Forms | Contact us, Publish with us, Work with us, Report an issue | `forms/forms.css` | built by user — reviewed |
| 7. Policies + final pass | Privacy, Privacy & cookies, Terms, Shipping, Returns; footer links site-wide; full QA | `kt/policy.css` | built — in review |

### Already done before the phases

| Page type | Path |
|---|---|
| Home | `home/` (also `index.html` at the root) |
| Book listing (also handles `?c=<collection>`, `?g=<genre>`, `?g=all`) | `books/` |
| Book page | `books/product/?id=` |
| E-book listing + page (Kindle / Google Play buttons, no cart) | `ebooks/`, `ebooks/ebook/?id=` |
| Authors directory + profile | `authors/`, `authors/author/?id=` |
| Campaign landings | `hp/` (Hindi Pakhwara), `kt/`, `kt2/`, `kt3/`, `mobile/` (Kitab Teras variants) |
| Cart (slide-out drawer), checkout, order placed | `books/cart.js`, `books/checkout/`, `books/order/` |
| Account: profile, orders, wishlist, addresses, gift cards (tabs) | `account/` |
| "All Books" genre menu (desktop mega menu + phone bottom sheet) | `kt/all-books.js` |

## How the site is built (conventions)

- **Static HTML + vanilla JS + CSS.** No build step, no framework. Each page is a folder with `index.html`. Data lives in `*-data.js` files that set `window.RK_*` globals.
- **Shared on every page:** `kt/styles.css` (header, footer, theme, All Books menu styles), `kt/mobile-nav.js` (phone tab bar, Search and Profile sheets, burger menu, cart/wishlist store `window.RKStore`, toasts), `kt/all-books.js` (genre menu, `window.RK_GENRES`, `window.RKAllBooks`).
- **New pages are generated from an existing page** so header, footer and shared scripts are identical: use `books/index.html` as the template for a folder one level deep, `books/product/index.html` for two levels deep. Swap only `<title>`, the page CSS link, `<main>…</main>` and the page scripts after `all-books.js`. Then fix relative paths (e.g. `books.css` → `../books/books.css`). See the Python `build()` snippet pattern used for `authors/` and `ebooks/` (regex replace of those four spots).
- **Header nav links** are real paths (relative to each page's folder). "Authors" and "E-Books" are wired on all pages; the current page gets `aria-current="page"`. Update every `index.html` (42 pages now, plus `404.html` with root-absolute links) when adding a nav target (compute the relative path with `os.path.relpath`).
- **Phone:** the top header is hidden ≤720px; the bottom tab bar's **Search** sheet (in `kt/mobile-nav.js`) holds entries like Browse Authors and E-Books — add new top-level sections there too.
- **Theme:** `html[data-theme="light"|"dark"]`. Every new style needs a dark variant. Pages use CSS variables `--au-accent`, `--au-card`, `--au-border`, `--au-soft` (defined per page container, e.g. `.au-main`, `.eb-main`).
- **Book cards:** always use `RKBookCard` from `kt/book-card.js` (+ `kt/book-card.css`, `books/books-cats.js`) inside a `.bk-grid` — never write card HTML by hand. Its click handler covers cart / wishlist / buy, so pages don't add their own.
- **Reuse shared classes:** `bk-*` (buttons, eyebrow/title/count headings), `pd-*` (detail pages: crumbs, share, chip, title, table, sections), `au-*` (search box, sort select, filter chips, empty state) from `authors/authors.css`.
- **Cards line up:** text slots have fixed heights (title clamp, one-line subtitles, footer pinned with `margin-top:auto`). Check with the alignment measurement below.
- **Images are shown whole** (never cropped) where the user asked: author photos and e-book covers use `object-fit: contain` in a fixed frame.
- **Cache-busting:** bump `?v=N` on any changed CSS/JS in every page that links it.
- **Data honesty:** content comes from the live site. Anything we invent (genre groupings, themes, copy) must be called out to the user.

## Tools & commands

- **Local server:** `python3 -m http.server 8765` from the repo root (stop it afterwards with `pkill -f "http.server 8765"`).
- **Browser checks:** Playwright with the cached Chromium — `require('/home/santamisusingfidora/.npm/_npx/ac56acf9ae97d38a/node_modules/playwright-core')`, `executablePath: '/home/santamisusingfidora/.cache/ms-playwright/chromium-1140/chrome-linux/chrome'`. Check 1440×900, 1024, 390×844 (`isMobile`), and dark mode (`document.documentElement.setAttribute('data-theme','dark')`). Log `pageerror` and any HTTP ≥400 responses.
- **Alignment check:** for each card row, the top of each text slot must be equal across cards (see `test4.js` pattern: group cards by `getBoundingClientRect().top`).
- **Images:** ImageMagick `magick` (resize `-resize 'WxH>' -strip -quality 82-84`; use `-colorspace sRGB` for CMYK and `-auto-orient` before `-strip`).
- **Live data:** product/author pages are server-rendered — `curl -sL -A "Mozilla/5.0"` then read the `application/ld+json` block (`@type: Book`) and the `rich-text-content` div (full description). Listing pages (collections, publications, categories, offers…) render in the browser — use WebFetch for those, and verify any links WebFetch returns against raw HTML.
- **Deploy:** Vercel — see "Deploying to Vercel" above.
- **Git:** remote `git@github.com:Studio-1947/Rajkamal-revamp-01.git`, working branch `checkout-page` (SSH works; the HTTPS token on this machine is invalid). `core.fileMode=false` is set (NTFS drive). End commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Data sources (live site)

- Collections index: 26 collections (slug, name, 9 have images) — `collections/img/<slug>.jpg`.
- Imprints (12): rajkamal-prakashan (3,251 titles), radhakrishna-prakashan (1,159), lokbharti-prakashan (1,229), sarthak (53), funda (21), hans-prakashan (0), remadhav (32), purvodaya (0), sahitya-bhawan (7), saransh (0), banyan-tree-books (20), akshar-prakashan (28). Logos in `publications/logos/<slug>.png`. First 8 books of each imprint: covers in `books/covers/<id>.jpg`; titles, prices, authors, ISBN, pages, descriptions were scraped to the scratchpad (`imprints.json`, `imprint-books.json`) — if those are gone, re-scrape `https://www.rajkamalprakashan.com/publications/<slug>` (book cards are in the embedded Next.js data: `"href":"/products/<id>"…"src":"<cover>","alt":"<title>"`, prices follow as `"children":"₹…"`).
- Categories: the 142 genres are already in `kt/all-books.js` (`GENRES`, plus `THEMES` grouping into 10 themes, which we made up).
