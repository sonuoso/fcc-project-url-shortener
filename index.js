require('dotenv').config();
const express = require('express');
const cors = require('cors');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect("mongodb+srv://develop:develop@cluster0.zqksdmc.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use('/api/shorturl', bodyParser.urlencoded({ extended: false })); //Initiating Middleware for bodyParser

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let UrlDb;

//Creating Schema for storing url
const urlSchema = new mongoose.Schema({
  url: {
    required: true,
    type: String
  }
})

//Creating UrlDb model
UrlDb = mongoose.model('UrlDb', urlSchema);

let urlDb;
let newUrl;
//List of strings to chek URL format
let urlCheck = ["https://", "http://"];

// Your first API endpoint
app.post('/api/shorturl',function(req, res) {
  newUrl = req.body.url;
  if (urlCheck.some(x => newUrl.startsWith(x))) {
    try {
      new URL(newUrl);
      urlDb = new UrlDb(
        { url: newUrl }
      )
      urlDb.save();
      console.log(urlDb)
      res.json({ "original_url": urlDb.url, "short_url": urlDb._id })
    }
    catch (err) {
      res.json({ error: 'invalid url' })
    }
  }
  else {
    res.json({ error: 'invalid url' })
  }
});

//Find document by _id in UrlDb corresponding to sort_url route parameter
app.get('/api/shorturl/:short_url?', function(req, res) {
  let short_url = req.params.short_url;
   UrlDb.findById({_id : short_url},function(err,data){
     res.redirect(data.url);
   })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
