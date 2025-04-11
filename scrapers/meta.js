const { chromium } = require('playwright');

async function scrapeMetaAds(competitor = "Slack") {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const searchURL = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(
    competitor
  )}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped`;

  try {
    console.log(`[SCRAPER] Navigating to: ${searchURL}`);
    await page.goto(searchURL, { waitUntil: 'networkidle', timeout: 30000 });

    // Optional wait for ad card
    await page.waitForTimeout(5000);

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

    console.log(`[SCRAPER] Found ${ads.length} ads`);
    await browser.close();
    return ads;
  } catch (err) {
    console.error('[SCRAPER ERROR]', err.message || err);
    await browser.close();
    throw err;
  }
}

module.exports = scrapeMetaAds;
