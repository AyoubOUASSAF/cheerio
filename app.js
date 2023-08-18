const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

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

        const $ = cheerio.load(response.data);

        const linkElements = $('.visited-provvedimenti');
        const linkUrls = linkElements.map((index, element) => $(element).attr('href')).get();

        const results = [];

        for (let i = 0; i < Math.min(limit, linkUrls.length); i++) {
            const linkUrl = linkUrls[i];
            const linkResponse = await axios.get(linkUrl);
            const linkHtml = linkResponse.data;
            const linkTitle = cheerio.load(linkHtml)('title').text();
            results.push({
                text: linkTitle,
                href: linkUrl
            });
        }

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
