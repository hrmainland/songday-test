if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const cors = require('cors');
const express = require("express");
const app = express();
const path = require('path');
const port = process.env.PORT || 3500;

const mongoose = require('mongoose');

const Track = require('./models/track');

async function quickSeedTracks(){
  await Track.deleteMany({});
  const tracks = [
    new Track({title: 'Crazy Frogs', spotify_id: 'abc123'}),
    new Track({title: 'Thottiana', spotify_id: 'abc124'}),
    new Track({title: 'Ram Ranch', spotify_id: 'abc125'}),
  ]

  for (let track of tracks){
    await track.save();
  }
}

async function trackTitles(){
  const tracks = await Track.find({});
  const titles = tracks.map(track => track.title)
  return titles
}

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/song-day';

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connection Open - Yay")
  // quickSeedTracks()

} 

main().catch(err => console.log(err));


app.use(cors());

app.get("/players", async (req, res) => {
  var list = ["Mark", "Timmy", "Mary", "James"];
  res.json(list);
});

app.get("/tracks", async (req, res) => {
  const titles = await trackTitles();
  res.json(titles);
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Define a catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => console.log(`Listening on port ${port}`));