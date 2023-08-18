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
        const searchButton = $('button#_GaSearch_INSTANCE_2NDgCF3zWBwk_submitButton');

        inputElement.val(query);
        searchButton.click();

        // Introduce a delay after clicking the search button
        await new Promise(resolve => setTimeout(resolve, 5000)); // Adjust the delay time as needed

        const trovatiHTML = $('.col-sm-12').html();

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
