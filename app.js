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

        const searchUrl = "https://www.giustizia-amministrativa.it/web/guest/dcsnprr?p_p_id=GaSearch_INSTANCE_2NDgCF3zWBwk&p_p_state=normal&p_p_mode=view&_GaSearch_INSTANCE_2NDgCF3zWBwk_javax.portlet.action=searchProvvedimenti&p_auth=pMaLCt4Z&p_p_lifecycle=0";
        
        const response = await axios.post(searchUrl, `_GaSearch_INSTANCE_2NDgCF3zWBwk_searchPhrase=${encodeURIComponent(query)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const $ = cheerio.load(response.data);

        const results = [];

        $('.ricerca--item').each((index, element) => {
            const linkElement = $(element).find('.visited-provvedimenti');
            const link = linkElement.attr('href');
            const title = linkElement.find('a').text();
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
