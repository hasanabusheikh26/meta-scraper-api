const { chromium } = require('playwright');

async function scrapeMetaAds(competitor = "Slack") {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const searchURL = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(competitor)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped`;

  await page.goto(searchURL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  const ads = await page.$$eval('[data-testid="ad-library-ad-card"]', (cards) => {
    return cards.slice(0, 10).map((card) => {
      const headline = card.querySelector('div[dir="auto"]')?.innerText || "N/A";
      const image = card.querySelector('img')?.src || null;
      const ctaEl = [...card.querySelectorAll('a')].find(a => a.innerText?.match(/Learn More|Shop Now|Sign Up|Apply Now|Get Offer/i));
      const cta = ctaEl ? ctaEl.innerText : "N/A";
      return { headline, cta, image };
    });
  });

  await browser.close();
  return ads;
}

module.exports = scrapeMetaAds;
