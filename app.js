const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cheerio = require('cheerio');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function fetchCovidData(country, callback) {
  const url = country ? `https://www.worldometers.info/coronavirus/country/${country}/` : "https://www.worldometers.info/coronavirus/";
  request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);
      let totalCases = $(".maincounter-number").eq(0).text().trim();
      let deaths = $(".maincounter-number").eq(1).text().trim();
      let recovered = $(".maincounter-number").eq(2).text().trim();
      callback(null, { totalCases, deaths, recovered, country });
    } else {
      callback(error, null);
    }
  });
}

app.get("/", function (req, res) {
  fetchCovidData(null, function (error, data) {
    if (error) {
      res.send("Error fetching data");
    } else {
      res.render("index", { ...data, country: null });
    }
  });
});

app.post("/search", function (req, res) {
  const country = req.body.country.toLowerCase();
  fetchCovidData(country, function (error, data) {
    if (error) {
      res.send("Error fetching data");
    } else {
      res.render("index", { ...data, country });
    }
  });
});

app.listen(4000, function () {
  console.log("Hosted on port 4000");
});
