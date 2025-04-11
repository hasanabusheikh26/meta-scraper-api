const { chromium } = require('playwright');

async function scrapeMetaAds(competitor_name = "Slack") {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    const searchURL = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(competitor_name)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped`;

    console.log('Navigating to:', searchURL);
    await page.goto(searchURL, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log('Waiting for page to load...');
    await page.waitForTimeout(10000);

    console.log('Extracting ads...');
    const ads = await page.$$eval('[data-testid="ad-library-ad-card"]', (cards) => {
      return cards.slice(0, 10).map((card) => {
        const headline = card.querySelector('div[dir="auto"]')?.innerText || "N/A";
        const image = card.querySelector('img')?.src || null;
        const ctaEl = [...card.querySelectorAll('a')].find(a => a.innerText?.match(/Learn More|Shop Now|Sign Up|Apply Now|Get Offer/i));
        const cta = ctaEl ? ctaEl.innerText : "N/A";
        return { headline, cta, image };
      });
    });

    console.log(`Found ${ads.length} ads`);
    return ads;
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = scrapeMetaAds;
