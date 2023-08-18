const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Parser } = require('htmlparser2');

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

        const results = [];
        let insideLink = false;
        let currentLink = '';

        const parser = new Parser({
            onopentag(name, attributes) {
                if (name === 'a' && attributes.class === 'visited-provvedimenti') {
                    insideLink = true;
                    currentLink = attributes.href;
                }
            },
            ontext(text) {
                if (insideLink) {
                    console.log(`Fetching: ${currentLink}`);
                    results.push({
                        text: text.trim(),
                        href: currentLink
                    });
                }
            },
            onclosetag(name) {
                if (name === 'a') {
                    insideLink = false;
                    currentLink = '';
                }
            }
        }, { decodeEntities: true });

        parser.write(response.data);
        parser.end();

        console.log("Scraping complete");
        res.render('index', { results: results.slice(0, limit), error: null });
    } catch (error) {
        console.error("Error occurred during scraping:", error);
        res.render('index', { results: null, error: "There was an error processing your request. Please try again later." });
    }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
