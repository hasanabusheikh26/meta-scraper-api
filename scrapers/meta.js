const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function scrapeMetaAds(competitor = "Slack") {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  const searchURL = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(
    competitor
  )}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped`;

  try {
    console.log(`[SCRAPER] Navigating to: ${searchURL}`);
    await page.goto(searchURL, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForTimeout(8000); // give it time to render

    const adCards = await page.$$('[data-testid="ad-library-ad-card"]');

    console.log(`[SCRAPER] Found ${adCards.length} ads`);

    const ads = [];
    for (const card of adCards.slice(0, 10)) {
      const headline = await card.$eval('div[dir="auto"]', el => el.innerText).catch(() => "N/A");
      const image = await card.$eval('img', el => el.src).catch(() => null);
      const cta = await card.$$eval('a', links => {
        const found = links.find(a =>
          /Learn More|Shop Now|Sign Up|Apply Now|Get Offer/i.test(a.innerText)
        );
        return found ? found.innerText : "N/A";
      }).catch(() => "N/A");

      ads.push({ headline, cta, image });
    }

    await browser.close();
    return ads;
  } catch (err) {
    console.error('[SCRAPER ERROR]', err.message || err);
    await browser.close();
    throw err;
  }
}

module.exports = scrapeMetaAds;
