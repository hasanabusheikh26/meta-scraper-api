const scrapeMetaAds = require('./meta_scraper');

async function main() {
  try {
    console.log('Starting to scrape Meta ads...');
    const ads = await scrapeMetaAds('Slack');
    console.log('Scraped ads:', JSON.stringify(ads, null, 2));
  } catch (error) {
    console.error('Error scraping ads:', error);
  }
}

main(); 