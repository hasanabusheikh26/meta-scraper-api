const express = require('express');
const scrapeMetaAds = require('./scrapers/meta');
// Future support: const scrapeGoogleAds = require('./scrapers/google');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Middleware to parse JSON body
app.use(express.json());

// 🏠 Health check route
app.get('/', (req, res) => {
  res.send('Ad Scraper API is running 🎯');
});

// 🔥 Scrape endpoint
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
    else {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    return res.status(200).json(ads);
  } catch (err) {
    console.error('[SERVER] Scraper failed:', err.message || err);
    return res.status(500).json({
      error: 'Failed to scrape ads',
      details: err.message || 'Unknown error'
    });
  }
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`🚀 Server is live on http://localhost:${port}`);
});
