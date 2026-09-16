```js
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// JSON-Anfragen erlauben
app.use(express.json());

// Web-App aus dem Hauptordner bereitstellen
app.use(express.static(path.join(__dirname)));

// Startseite
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API-Test
app.get("/api/status", (req, res) => {
  res.sendFile({
    success: true,
    message: "PreisChecker API ist aktiviert"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`PreisChecker läuft auf Port ${PORT}`);
});
'''
