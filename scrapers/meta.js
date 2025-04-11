const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const fs = require('fs');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function scrapeMetaAds(competitor = "Slack") {
  const browser = await puppeteer.launch({
    headless: "new", // switch to false to see it run
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
    await page.goto(searchURL, { waitUntil: 'networkidle0', timeout: 60000 });

    console.log('[SCRAPER] Waiting for JS content...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Take screenshot
    await page.screenshot({ path: 'page.png', fullPage: true });
    console.log('[SCRAPER] Screenshot saved as page.png');

    // Save HTML content
    const html = await page.content();
    fs.writeFileSync('debug.html', html);
    console.log('[SCRAPER] HTML saved as debug.html');

    const ads = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="ad-library-ad-card"]'));
      return cards.slice(0, 10).map(card => {
        const headline = card.querySelector('div[dir="auto"]')?.innerText || "N/A";
        const image = card.querySelector('img')?.src || null;
        const ctaEl = [...card.querySelectorAll('a')].find(a =>
          a.innerText?.match(/Learn More|Shop Now|Sign Up|Apply Now|Get Offer/i)
        );
        const cta = ctaEl ? ctaEl.innerText : "N/A";
        return { headline, cta, image };
      });
    });

    console.log(`[SCRAPER] Found ${ads.length} ads.`);
    await browser.close();
    return ads;

  } catch (err) {
    console.error('[SCRAPER ERROR]', err.message || err);
    if (browser) await browser.close();
    throw new Error(`Failed to scrape ads: ${err.message}`);
  }
}

module.exports = scrapeMetaAds;
