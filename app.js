const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const app = express();

// Middleware to parse POST data
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve the form on the root route
app.get('/', (req, res) => {
    res.render('index', { results: null, error: null });
});

// Handle form submission
app.post('/scrape', async (req, res) => {
    try {
        const query = req.body.query;
        const limit = parseInt(req.body.limit, 10);

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const url = "https://www.giustizia-amministrativa.it/dcsnprr";
        await page.goto(url);

        const advancedSearchSelector = 'div:contains("Ricerca Avanzata")';
        await page.click(advancedSearchSelector);

        const inputSelector = '#_GaSearch_INSTANCE_2NDgCF3zWBwk_searchPhrase';
        await page.type(inputSelector, query);

        const searchButtonSelector = '#_GaSearch_INSTANCE_2NDgCF3zWBwk_submitButton';
        await page.click(searchButtonSelector);

        await page.waitForTimeout(5000);

        const linkUrls = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('.visited-provvedimenti'));
            return links.map(link => link.href);
        });

        const results = [];

        for (let i = 0; i < Math.min(limit, linkUrls.length); i++) {
            const linkUrl = linkUrls[i];
            results.push({
                text: `Link ${i + 1}`,
                href: linkUrl
            });
        }

        await browser.close();

        res.render('index', { results: results, error: null });
    } catch (error) {
        console.error("Error occurred during scraping:", error);
        res.render('index', { results: null, error: "There was an error processing your request. Please try again later." });
    }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
