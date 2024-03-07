if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cors = require("cors");
const axios = require("axios");
const express = require("express");
const app = express();
const path = require("path");
// const port = process.env.PORT || 3500;
const port = 3500;

const mongoose = require("mongoose");

const querystring = require("querystring");

const Track = require("./models/track");

const client_id = "3db1ac7a10994db384064b7ae0b88369";
const client_secret = "c9b89cb0640943309975e8774efecacb";
const redirect_uri = `http://localhost:3500/callback`;

function generateRandomString(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  var scope = "user-read-private user-read-email";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", async function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    console.log("I am here");
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    // Make a POST request to the Spotify token endpoint using axios
    axios
      .post(authOptions.url, querystring.stringify(authOptions.form), {
        headers: authOptions.headers,
      })
      .then((response) => {
        // Handle successful response
        const accessToken = response.data.access_token;
        console.log("Access Token:", accessToken);
        // You can use this access token for subsequent calls to Spotify Web API services
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error.response.data);
      });
  }
});

async function quickSeedTracks() {
  await Track.deleteMany({});
  const tracks = [
    new Track({ title: "Crazy Frogs", spotify_id: "abc123" }),
    new Track({ title: "Thottiana", spotify_id: "abc124" }),
    new Track({ title: "Ram Ranch", spotify_id: "abc125" }),
  ];

  for (let track of tracks) {
    await track.save();
  }
}

async function trackTitles() {
  const tracks = await Track.find({});
  const titles = tracks.map((track) => track.title);
  return titles;
}

// const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/song-day";
const dbUrl = "mongodb://127.0.0.1:27017/song-day";

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connection Open - Yay");
  // quickSeedTracks()
}

main().catch((err) => console.log(err));

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
app.use(express.static(path.join(__dirname, "../client/dist")));

// Define a catch-all route to serve the main HTML file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
