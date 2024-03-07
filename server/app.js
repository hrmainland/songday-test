if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cors = require("cors");
const axios = require("axios");
const request = require("request");
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

// this obviously won't work in real code:
const access_token =
  "BQBynfQkH5rmTFaGdSNW1J6EKVFgCbr1Ty0sSsu6of4W6ykf5gJnTq5lT2VvIn8_TyTy6ZwpeL5PS8zvqD6sCXEQEYPugJYZkT7gNn4mE_WsWIZVRW33um-95_6OmBiSnrgHY4gK-g49mNdL6mgo6tQshTxfkr6yKZyBIoxjpPSE86ybXglt4keVIFH5zxspYVOZszMbKUU8";

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
  var scope = "playlist-read-private user-read-private user-read-email";

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

    // Make a request to the Spotify API token endpoint
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // Access the access_token from the response body
        var access_token = body.access_token;
        // You can now use this access_token in subsequent calls to Spotify API services
        console.log("Access Token:", access_token);
      } else {
        console.log("Error:", error);
      }
    });

    res.redirect("/");
  }
});

app.get("/playlists", async (req, res) => {
  const options = {
    url: "https://api.spotify.com/v1/users/hrmainland/playlists",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };

  request.get(options, (error, response, body) => {
    if (error) {
      console.error("Error:", error);
      return;
    }
    // console.log("Response:", body);
    const jsonBody = JSON.parse(body);
    const names = jsonBody.items.map((playlist) => playlist.name);
    console.log(names);
    res.send(names);
  });
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
