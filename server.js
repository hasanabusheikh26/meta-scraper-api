const express = require('express');
const scrapeMetaAds = require('./meta_scraper');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/meta-scrape', async (req, res) => {
  try {
    const { competitor } = req.body;
    if (!competitor) return res.status(400).json({ error: 'Missing competitor name' });

    const ads = await scrapeMetaAds(competitor);
    res.json(ads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
