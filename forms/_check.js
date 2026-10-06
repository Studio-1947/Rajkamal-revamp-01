const pw = require('/home/santamisusingfidora/.npm/_npx/ac56acf9ae97d38a/node_modules/playwright-core');
const EXE = '/home/santamisusingfidora/.cache/ms-playwright/chromium-1140/chrome-linux/chrome';
const BASE = 'http://localhost:8765';
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ok  ' : '  FAIL') + ' ' + m); if (!c) fails++; };

(async () => {
  const browser = await pw.chromium.launch({ executablePath: EXE });
  async function ctx(w, h, isMobile) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile });
    const page = await context.newPage();
    page.on('pageerror', (e) => { console.log('  PAGEERROR', String(e).slice(0, 160)); fails++; });
    page.on('response', (r) => { if (r.status() >= 400) { console.log('  HTTP', r.status(), r.url()); fails++; } });
    return { context, page };
  }

  const pages = ['contact', 'publish-with-us', 'work-with-us', 'report-issue'];
  for (const p of pages) {
    console.log('[' + p + ']');
    const { context, page } = await ctx(1440, 900, false);
    await page.goto(BASE + '/' + p + '/', { waitUntil: 'networkidle' });
    ok((await page.title()).length > 5, 'title renders: ' + (await page.title()));
    await page.click('#fmForm button[type=submit]');
    ok(await page.locator('.fm-field.is-bad').count() > 0, 'empty submit flags required fields');
    if (await page.locator('input[name=booktitle]').count()) await page.fill('input[name=booktitle]', 'Ret Ki Machhali'); // publish-with-us has a required book title
    await page.fill('input[name=name]', 'Ashok Kumar');
    await page.fill('input[name=phone]', '9810281912');
    await page.fill('input[name=email]', 'ashok@example.com');
    const sel = page.locator('#fmForm select[required]');
    if (await sel.count()) await sel.first().selectOption({ index: 1 });
    const ta = page.locator('#fmForm textarea[required]');
    if (await ta.count()) await ta.first().fill('Test message from the browser check.');
    const cb = page.locator('#fmForm input[type=checkbox][required]');
    if (await cb.count()) await cb.check();
    await page.click('#fmForm button[type=submit]');
    await page.waitForTimeout(200);
    ok(await page.locator('.fm-formcard.is-done').count() === 1, 'valid submit shows success panel');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('rk-form-subs') || '[]'));
    ok(stored.length === 1 && stored[0].type === p, 'submission saved to rk-form-subs');
    await page.click('[data-fm-again]');
    ok(await page.locator('.fm-formcard.is-done').count() === 0, 'submit-another resets the form');
    await context.close();

    // phone viewport, one page (report-issue) also dark
    const { context: c2, page: p2 } = await ctx(390, 844, true);
    await p2.goto(BASE + '/' + p + '/', { waitUntil: 'networkidle' });
    ok(await p2.locator('#fmForm').isVisible(), 'form visible on phone');
    ok(await p2.locator('.fm-side').first().isVisible(), 'info cards stack above form on phone');
    if (p === 'report-issue') {
      await p2.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      const bg = await p2.evaluate(() => getComputedStyle(document.querySelector('.fm-formcard')).backgroundColor);
      ok(bg && !/255,\s*25[23]/.test(bg), 'dark theme changes card bg: ' + bg);
    }
    await c2.close();
  }

  console.log('[home — Hindi Divas mobile + product cover]');
  const { context, page } = await ctx(390, 844, true);
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const shelf = await page.evaluate(() => {
    const sec = document.getElementById('hm-sec-') || document.querySelector('.hm-sec');
    const el = sec && sec.querySelector('.hm-shelf');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const card = el.querySelector('.hm-card');
    const author = card && card.querySelector('.hm-author');
    return { cols: cs.gridAutoColumns, flow: cs.gridAutoFlow, authorVisible: author ? getComputedStyle(author).display : 'n/a', off: (card && card.querySelector('.hm-off') || {}).textContent || null, offH: (card && card.querySelector('.hm-off')) ? card.querySelector('.hm-off').getBoundingClientRect().height : 0 };
  });
  ok(shelf && shelf.cols === '168px', 'Hindi Divas mobile shelf uses standard 168px cards: ' + (shelf && shelf.cols));
  ok(shelf && shelf.flow.indexOf('column') !== -1, 'Hindi Divas mobile shelf scrolls like the others: ' + (shelf && shelf.flow));
  ok(shelf && shelf.authorVisible !== 'none', 'standard card fields (author) visible again: ' + (shelf && shelf.authorVisible));
  ok(shelf && shelf.offH > 0 && shelf.offH < 26, 'off badge on one line, h=' + (shelf && Math.round(shelf.offH)) + 'px: "' + (shelf && shelf.off) + '"');
  await context.close();

  const { context: c3, page: p3 } = await ctx(1440, 900, false);
  await p3.goto(BASE + '/books/product/?id=satyapan', { waitUntil: 'networkidle' });
  await p3.waitForTimeout(400);
  const ar = await p3.evaluate(() => { const el = document.querySelector('.pd-cover'); return el ? getComputedStyle(el).aspectRatio : null; });
  ok(ar === '2 / 3', 'product cover frame is 2/3 (edge-to-edge art): ' + ar);
  await c3.close();

  await browser.close();
  console.log(fails ? ('FAILURES: ' + fails) : 'ALL CHECKS PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
