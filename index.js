const express = require('express');
const chromium = require('chrome-aws-lambda');
const app = express();

app.get('/', async (req, res) => {
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
    await page.goto(url, { waitUntil: 'networkidle2' });

    const content = await page.content();
    const title = await page.title();

    res.json({ title, content });
  } catch (error) {
    res.status(500).send({ error: 'Scraping failed', details: error.message });
  } finally {
    if (browser !== null) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
