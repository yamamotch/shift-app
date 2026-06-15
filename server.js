const express = require("express");

const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Server Running");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Start");
});

console.log(process.env.KINTONE_DOMAIN);
console.log(process.env.KINTONE_APP_ID);