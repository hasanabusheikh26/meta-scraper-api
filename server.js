const express = require('express');
const scrapeMetaAds = require('./meta_scraper');
// Future support:
// const scrapeGoogleAds = require('./scrapers/google');
// const scrapeLinkedInAds = require('./scrapers/linkedin');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Ad Scraper API is running 🎯');
});

app.get('/scrape', async (req, res) => {
  try {
    const competitor = req.query.competitor || 'Slack';
    console.log(`Scraping ads for competitor: ${competitor}`);
    const ads = await scrapeMetaAds(competitor);
    res.json(ads);
  } catch (error) {
    console.error('Error in /scrape endpoint:', error);
    res.status(500).json({ error: 'Failed to scrape ads' });
  }
});

app.post('/scrape', async (req, res) => {
  const { competitor_name, platform } = req.body;

  if (!competitor_name || !platform) {
    return res.status(400).json({ error: 'Missing competitor_name or platform' });
  }

  try {
    let ads = [];

    if (platform === 'Meta') {
      ads = await scrapeMetaAds(competitor_name);
    }
    // else if (platform === 'Google') {
    //   ads = await scrapeGoogleAds(competitor_name);
    // }
    // else if (platform === 'LinkedIn') {
    //   ads = await scrapeLinkedInAds(competitor_name);
    // }
    else {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    return res.status(200).json(ads);
  } catch (err) {
    console.error('[SERVER] Scraper failed:', err);
    return res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is live on http://localhost:${port}`);
});
