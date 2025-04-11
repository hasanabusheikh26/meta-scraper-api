const { chromium } = require('playwright');

async function scrapeMetaAds(competitor = "Slack") {
  const browser = await chromium.launch({
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

  try {
    console.log(`[SCRAPER] Navigating to: ${searchURL}`);
    await page.goto(searchURL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Let Facebook's JS load
    await page.waitForTimeout(10000);

    // Debug: count ads
    const adCount = await page.$$eval('[data-testid="ad-library-ad-card"]', (cards) => cards.length);
    console.log(`[SCRAPER] Found ${adCount} ad cards`);

    // Scrape ad content
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
    await browser.close();
    throw err;
  }
}

module.exports = scrapeMetaAds;
