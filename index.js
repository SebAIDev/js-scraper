const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing URL parameter" });

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    const content = await page.content();
    const title = await page.title();
    await browser.close();

    res.json({ title, content });
  } catch (err) {
    res.status(500).json({ error: "Scraping failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});