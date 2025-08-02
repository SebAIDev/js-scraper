import express from "express";
import { chromium } from "playwright";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const content = await page.evaluate(() => {
      return document.body.innerText;
    });

    await browser.close();
    res.json({ url, content });
  } catch (error) {
    res.status(500).json({ error: "Scraping failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`JS scraper running on port ${PORT}`);
});