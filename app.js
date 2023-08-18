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
    res.render('index', { results: null, error: null, trovati: null });
});

// Handle form submission
app.post('/scrape', async (req, res) => {
    try {
        const query = req.body.query;
        const limit = parseInt(req.body.limit, 10);

        const url = "https://www.giustizia-amministrativa.it/web/guest/dcsnprr";
        const response = await axios.get(url);

        const $ = cheerio.load(response.data);

        const inputElement = $('input#_GaSearch_INSTANCE_2NDgCF3zWBwk_searchPhrase');
        const form = $('form#fm1'); // Select the form by its ID

        inputElement.val(query);

        // Submit the form using Axios
        const formData = new URLSearchParams(new FormData(form[0]));
        const searchResponse = await axios.post(url, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const searchResultHTML = searchResponse.data;
        const searchResult$ = cheerio.load(searchResultHTML);

        const trovatiHTML = searchResult$('.ricerca--item').html();

        const results = []; // Modify your scraping logic here

        res.render('index', { results: results, error: null, trovati: trovatiHTML });
    } catch (error) {
        console.error("Error occurred during scraping:", error);
        res.render('index', { results: null, error: "There was an error processing your request. Please try again later.", trovati: null });
    }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
