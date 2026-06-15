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

app.post("/submit", (req, res) => {

    console.log("受信");

    console.log(req.body);

    res.json({
        success: true
    });

});
