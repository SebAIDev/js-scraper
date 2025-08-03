const express = require('express');
const chromium = require('chrome-aws-lambda');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send({ error: 'Missing ?url=' });

  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
	args: chromium.args,
	defaultViewport: chromium.defaultViewport,
	executablePath: await chromium.executablePath,
	headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const html = await page.content();
    const title = await page.title();

    res.json({ title, html });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
