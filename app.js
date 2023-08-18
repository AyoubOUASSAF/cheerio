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
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q; // Get the search query from the URL parameter

        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl);

        const $ = cheerio.load(response.data);

        const results = [];

        $('h3').each((index, element) => {
            const title = $(element).text();
            const link = $(element).parent().attr('href');
            results.push({ title, link });
        });

        res.render('index', { results: results, error: null });
    } catch (error) {
        console.error("Error occurred during search:", error);
        res.render('index', { results: null, error: "There was an error processing your request. Please try again later." });
    }
});

// Start the server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
