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
  res.render('index', { results: [], error: null });
});

// Handle form submission
app.post('/scrape', async (req, res) => {
  try {
    const query = req.body.query;
    const url = `https://www.giustizia-amministrativa.it/web/guest/dcsnprr?p_p_id=GaSearch_INSTANCE_2NDgCF3zWBwk&p_p_state=normal&p_p_mode=view&_GaSearch_INSTANCE_2NDgCF3zWBwk_javax.portlet.action=searchProvvedimenti&p_auth=pMaLCt4Z&p_p_lifecycle=0&_GaSearch_INSTANCE_2NDgCF3zWBwk_searchPhrase=${encodeURIComponent(query)}`;
    
    console.log("Fetching main page:", url);

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const results = [];

    $('.ricerca--item__footer').each((index, element) => {
      const link = $(element).find('a.visited-provvedimenti');
      const linkText = link.text();
      const linkUrl = link.attr('href');
      
      console.log(`Result ${index + 1}:`, linkText, linkUrl);

      results.push({
        text: linkText,
        href: linkUrl
      });
    });

    console.log("Scraping complete");
    res.render('index', { results: results, error: null });
  } catch (error) {
    console.error("Error occurred during scraping:", error);
    res.render('index', { results: [], error: "There was an error processing your request. Please try again later." });
  }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
