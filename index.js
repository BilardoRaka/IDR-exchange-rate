const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
let cors = require("cors");
app.use(cors());

async function getKurs() {
  try {
    const siteUrl =
      "https://www.bi.go.id/en/statistik/informasi-kurs/transaksi-bi/Default.aspx";
    const { data } = await axios({
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
      },
      method: "GET",
      url: siteUrl,
    });

    const $ = cheerio.load(data);
    const elemSelector1 =
      "#ctl00_PlaceHolderMain_g_6c89d4ad_107f_437d_bd54_8fda17b556bf_ctl00_GridView1 > table > tbody > tr";
    const keys = ["valas", "value", "sell_price", "buy_price", "middle_price"];
    const kursArr = [];
    const elemSelector2 =
      "#tableData > div > div:nth-child(4) > div.row > div:nth-child(1) > div > div > span";

    $(elemSelector1).each((parentIdx, parentElem) => {
      let keyIdx = 0;
      const kursObj = {};

      $(parentElem)
        .children()
        .each((childIdx, childElem) => {
          var tdValue = $(childElem).text();
          if (tdValue) {
            tdValue = tdValue.split(" ").join("");
            kursObj[keys[keyIdx]] = tdValue;
            keyIdx++;
          }
        });
      kursArr.push(kursObj);
    });
    return {
      rate: kursArr,
      date: $(elemSelector2).text(),
    };
  } catch (err) {
    console.error(err);
  }
}

app.get("/", async (req, res) => {
  try {
    const { rate, date } = await getKurs();
    return res.status(200).json({
      date,
      rate,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

// PORT
const server = app.listen(process.env.PORT || 5000, () => {
  const port = server.address().port;
  console.log(`Express is working on port ${port}`);
});
