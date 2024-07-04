require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlparser = require('url');

const client = new MongoClient(process.env.MONGO_URL)
const db = client.db('freecodecamp')
const urls = db.collection('urls')


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const dnslookup = dns.lookup(urlparser.parse(req.body.url).hostname, async(err,address) => {
    const url = await urls.findOne({original_url : req.body.url},{projection: {original_url:1,short_url:1,'_id':0}})
    console.log(url);
    if(url) { res.json(url)}
    else{
    if (!address){ res.json({error: 'Invalid URL'})}
    else {
      const result = await urls.countDocuments({})
      console.log(result)
      const urlDoc = { original_url : req.body.url, short_url: result }
      const insert = await urls.insertOne(urlDoc);
      res.json({ original_url : req.body.url, short_url: result });
    }
  }})

});


app.get("/api/shorturl/:short_url", async(req, res) => {
  get_url = await urls.findOne({short_url : +req.params.short_url}, {projection:{_id:0,original_url:1}})
  redirect_url = get_url.original_url;
  res.redirect(redirect_url);

});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

