
const cors = require('cors');
const express = require("express");
const app = express();
const path = require('path');
const port = process.env.PORT || 3500;


app.use(cors());


app.get("/players", (req, res) => {
  var list = ["Mark", "John", "Mary", "James"];
  res.json(list);
});

app.get("/api", (req, res) => {
    res.send({ message: "Hello from Express!" });
  });

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Define a catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => console.log(`Listening on port ${port}`));