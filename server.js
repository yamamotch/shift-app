const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Server Running");
});

app.get("/options/:fieldCode", async (req, res) => {
    const fieldCode = req.params.fieldCode;

    try {
        const response = await axios.get(
            `https://${process.env.KINTONE_DOMAIN}/k/v1/app/form/fields.json`,
            {
                params: {
                    app: process.env.KINTONE_APP_ID
                },
                headers: {
                    "X-Cybozu-API-Token": process.env.KINTONE_API_TOKEN
                }
            }
        );

        const field = response.data.properties[fieldCode];

        const options = Object.keys(field.options);

        res.json(options);

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json({ success: false });
    }
});

app.post("/submit", async (req, res) => {
    const { name, shifts } = req.body;

    // バリデーション: シフトデータが空、または配列ではない場合
    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
        return res.status(400).json({
            success: false,
            message: "送信されたシフトデータが空、または不正です。"
        });
    }

    try {
        // フロントエンドの配列を、kintoneの複数一括登録（records.json）用のデータ構造にマッピング
        const records = shifts.map(shift => {

            const startDateTime = `${shift.date}T${shift.start}:00+09:00`;
            const endDateTime = `${shift.date}T${shift.end}:00+09:00`;

            return {
                name: { value: name },
                date: { value: shift.date },
                start: { value: startDateTime },
                end: { value: endDateTime }
            };
        });

        // エンドポイントを /k/v1/records.json（複数形）に変更して一括リクエスト
        const response = await axios.post(
            `https://${process.env.KINTONE_DOMAIN}/k/v1/records.json`,
            {
                app: Number(process.env.KINTONE_APP_ID),
                records: records
            },
            {
                headers: {
                    "X-Cybozu-API-Token": process.env.KINTONE_API_TOKEN,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("kintone Success:", response.data);

        res.json({
            success: true,
            ids: response.data.ids
        });

    } catch (error) {
        // エラー出力
        if (error.response && error.response.data) {
            console.error("kintone API Error:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Server Error:", error.message);
        }

        res.status(500).json({
            success: false,
            error: error.response?.data || "Internal Server Error"
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});