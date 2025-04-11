const { chromium } = require('playwright');
const fs = require('fs');

async function scrapeMetaAds(competitor = "Slack") {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-accelerated-2d-canvas',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-zygote'
      ]
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    });

    const page = await context.newPage();

    const searchURL = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(
      competitor
    )}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped`;

    console.log(`[SCRAPER] Navigating to: ${searchURL}`);

    await page.goto(searchURL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForTimeout(10000);

    // Debugging: Screenshot + HTML
    await page.screenshot({ path: 'page.png', fullPage: true });
    fs.writeFileSync('debug.html', await page.content());

    const adCount = await page.$$eval('[data-testid="ad-library-ad-card"]', (cards) => cards.length);
    console.log(`[SCRAPER] Found ${adCount} ad cards`);

    const ads = await page.$$eval('[data-testid="ad-library-ad-card"]', (cards) => {
      return cards.slice(0, 10).map((card) => {
        const headline = card.querySelector('div[dir="auto"]')?.innerText || "N/A";
        const image = card.querySelector('img')?.src || null;
        const ctaEl = [...card.querySelectorAll('a')].find((a) =>
          a.innerText?.match(/Learn More|Shop Now|Sign Up|Apply Now|Get Offer/i)
        );
        const cta = ctaEl ? ctaEl.innerText : "N/A";
        return { headline, cta, image };
      });
    });

    await browser.close();
    return ads;

  } catch (err) {
    console.error('[SCRAPER ERROR]', err.message || err);
    if (browser) await browser.close();
    throw new Error(`Failed to scrape ads: ${err.message}`);
  }
}

module.exports = scrapeMetaAds;
