const express = require("express");

const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Server Running");
});

app.post("/submit", async (req, res) => {

    const { name, date, start, end } = req.body;

    try {

        const response = await axios.post(
            `https://${process.env.KINTONE_DOMAIN}/k/v1/record.json`,
            {
                app: Number(process.env.KINTONE_APP_ID),
                record: {
                    name: {
                        value: name
                    },
                    date: {
                        value: date
                    },
                    start: {
                        value: start
                    },
                    end: {
                        value: end
                    }
                }
            },
            {
                headers: {
                    "X-Cybozu-API-Token":
                        process.env.KINTONE_API_TOKEN
                }
            }
        );

        console.log(response.data);

        res.json({
            success: true
        });

    } catch (error) {

        console.log(error.response?.data);

        res.status(500).json({
            success: false
        });

    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Start");
});


