const express = require('express');
const scrapeMetaAds = require('./meta_scraper');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/meta-scrape', async (req, res) => {
  try {
    // Accept either "competitor" or "competitor_name" from body
    const competitor = req.body.competitor || req.body.competitor_name;

    if (!competitor) {
      return res.status(400).json({ error: 'Missing competitor name' });
    }

    const ads = await scrapeMetaAds(competitor);
    return res.status(200).json(ads);
  } catch (error) {
    console.error("Scraper failed:", error.message);
    return res.status(500).json({ error: 'Scraping failed' });
  }
});

app.get('/', (req, res) => {
  res.send('Meta Scraper API is running');
});

app.listen(port, () => {
  console.log(`Server is live on port ${port}`);
});
