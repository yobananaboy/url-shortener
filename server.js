// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var router = express.Router();

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var validator = require('validator');
var _ = require('underscore');
var database = ('database');

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;

// connect to database
MongoClient.connect(uri, (err, db) => {
  // handle error connecting to database
  if(err) throw err;
  var urlCollection = db.collection(process.env.COLLECTION);
  // http://expressjs.com/en/starter/static-files.html
  app.use(express.static('public'));
  app.use('/new', router);

  // for displaying index with instructions
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
  });
  
  // for handling shorturl
  app.get('/:shorturl', (req, res) => {
    var shorturl = req.params.shorturl;
    // check user has entered url in correct format
    if(1000 <= +shorturl && shorturl <= 9999) {
      handleShortUrl(shorturl, db, urlCollection, res);
    } else {
      incorrectUrl(res);
    }
  });

  // for handling url in paramater, is user visits /new/foo
  router
    .route('/*')
    .get((req, res, next) => {
      // access url parameter
      var url = req.params[0].toString();
      // validate url
      // check if url without protocol
      if(validator.isURL(url)) {
        // check if url is not with protocol and add https if that is the case
        if(!validator.isURL(url, {require_protocol: true})) {
          url = "https://" + url;
        }
        // once we have correct url, check if it is in database
        handleNewUrl(url, db, urlCollection, res);
      } else {
        // invalid url provided, notify user
        incorrectUrl(res);
      }
  });
  
  // error handling
  app.get('*', (req, res, next) => {
    var err = new Error();
    err.status = 404;
    next(err);
  });

  // handling 404 errors
  app.use(function(err, req, res, next) {
    if(err.status !== 404) {
      return next();
    }

    res.send(err.message || "Whoops! That page doesn't exist.");
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // listen for requests :)
  var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });

  function updateDb(db, collection, file) {
      collection.insert(file, (err, res) => {
        if(err) throw err;
        console.log(res);
      });
  }
  
  function handleShortUrl(url, db, collection, response) {
    // check if user url is in database
    var query = { shorturl: +url },
        projection = { _id: true, url: true, shorturl: true };
    // try and find short url
    collection.findOne(query, projection, (err, res) => {
      if (err) throw err;
      // if result not in database, throw error
      if(!res) {
        incorrectUrl(response);
        return false;
      }
      response.redirect(res.url);
    });
  }

  function handleNewUrl(url, db, collection, response) {
    var query = { url: url },
        projection = { _id: true, url: true, shorturl: true },
        json = {};
      // try and find file
      collection.findOne(query, projection, (err, res) => {
        if (err) throw err;
        // if result is not in databse, create new entry
        if(!res) {
          var rand = _.random(1000, 9999);
          var newFile = {
            _id: rand,
            url: url,
            shorturl: rand
          };
          var short = rand;
          updateDb(db, collection, newFile);
        }
        if(res) {
          short = res.shorturl;
        }
        // send json telling user url and shorturl
        json = {
          original_url: url,
          short_url: short
        };
        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(json));
    });
  }
  
  function incorrectUrl(res) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({error: 'URL in incorrect format. Please double check and try again.'}));
  }
});