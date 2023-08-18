const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { JSDOM } = require('jsdom');

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

        const url = "https://www.giustizia-amministrativa.it/dcsnprr";
        const response = await axios.get(url);

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        const linkElements = document.querySelectorAll('.visited-provvedimenti');
        const linkUrls = Array.from(linkElements).map(element => element.getAttribute('href'));

        const results = [];

        for (let i = 0; i < Math.min(limit, linkUrls.length); i++) {
            const linkUrl = linkUrls[i];
            console.log(`Fetching: ${linkUrl}`);
            const linkResponse = await axios.get(linkUrl);
            const linkHtml = linkResponse.data;
            const linkDom = new JSDOM(linkHtml);
            const linkTitle = linkDom.window.document.querySelector('title').textContent;
            results.push({
                text: linkTitle,
                href: linkUrl
            });
        }

        console.log("Scraping complete");
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
