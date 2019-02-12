const express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    mongoose = require('mongoose'),
    axios = require('axios'),
    cheerio = require('cheerio')
db = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamenews';

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect('mongodb://original1:original1password@ds131905.mlab.com:31905/heroku_mznt974k');
}

mongoose.Promise = Promise;

mongoose.connect(MONGODB_URI, function (err) {
    if (err) throw err;
    console.log('Successfully connected');
});

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));

app.get('/scrape', function (req, res) {
    axios.get('https://www.ign.com/articles?tags=news').then(function (response) {
        var $ = cheerio.load(response.data);
        $('div.listElmnt-blogItem').each(function (i, element) {
            let result = {};
            result.headline = $(element).find('a.listElmnt-storyHeadline').text();
            result.link = $(element).find('a.listElmnt-storyHeadline').attr('href');
            result.summary = $(element).find('p').text();
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

app.get('/articles', function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get('/articles/:id', function (req, res) {
    db.Article.findOne({
            _id: req.params.id
        })
        .populate('note')
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.post('/article/:id', function (req, res) {
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

app.listen(PORT, function () {
    console.log('App listening on port ' + PORT + '!');
});