const express = require('express'),
        bodyParser = require('body-parser'),
        logger = require('morgan'),
        mongoose = require('mongoose'),
        axios = require('axios'),
        cheerio = require('cheerio')
        db = require('./models');

const MONGOGB_URI = process.env.MONGOGB_URI || 'mongodb://localhost:27017/gamenews';

mongoose.Promise = Promise;

mongoose.connect(MONGOGB_URI, function(err) {
    if (err) throw err;
    console.log('Successfully connected');
});

// const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));

app.get('/scrape', function(req, res) {
    axios.get('https://www.ign.com/articles?tags=news').then(function(response) {
        var $ = cheerio.load(response.data);
        $('div.listElmnt-blogItem').each(function(i, element) {
            let result = {};
            result.headline = $(element).children().text();
            result.link = $(element).find('a.listElmnt-storyHeadline').attr('href'),
            result.summary = $(element).find('p')
            console.log(result);
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    return res.json(err);
                });
        });
        res.send('Scrape Complete');
    });
});

app.get('/articles', function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });


app.post('/articles/:id', function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneandUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.listen(PORT, function() {
    console.log('App listening on port ' + PORT + '!');
});