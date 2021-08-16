require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const mongoose = require("mongoose");
const uri =
  "MONGO_URI";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var bodyParser = require("body-parser");
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var id = 0;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const Schema = mongoose.Schema;
var counter = 0;

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

const urlSchema = new Schema({
  original_url: { type: String },
  short_url: { type: Number, required: true }
});

const Url = mongoose.model("Url", urlSchema);
app.get("/api/shorturl/:url", function(req, res) {
  var num = req.params.url;
  Url.findOne({ short_url: num }, function(err, url) {
    if (err || !url) {
      res.json({ error: "No Url found for the given ShortURL" });
    } else {
      console.log(url);
      res.redirect(302, url.original_url);
    }
  });
});

app.post("/api/shorturl", async function(req, res) {
  var count = await Url.countDocuments({});
  var current = req.body.url.toLowerCase();
  var curr = await Url.findOne({ original_url: current });
  if (curr) {
    res.json({ original_url: curr.original_url, short_url: curr.short_url });
  }
  else if (!isValidHttpUrl(req.body.url)) {
    res.json({ error: 'invalid url' });
  } else {
    var insert = new Url({ original_url: req.body.url, short_url: count });
    insert.save(function(err, data) {
      if (err) console.log("issue here");
      res.json({ original_url: data.original_url, short_url: data.short_url });
    });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
