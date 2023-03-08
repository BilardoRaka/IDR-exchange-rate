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
      method: "GET",
      url: siteUrl,
    });

    const $ = cheerio.load(data);
    const elemSelector =
      "#ctl00_PlaceHolderMain_g_6c89d4ad_107f_437d_bd54_8fda17b556bf_ctl00_GridView1 > table > tbody > tr";
    const keys = ["Valas", "Value", "HargaJual", "HargaBeli", "HargaTengah"];
    const kursArr = [];

    $(elemSelector).each((parentIdx, parentElem) => {
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
    return kursArr;
  } catch (err) {
    console.error(err);
  }
}

async function getDate() {
  try {
    const siteUrl =
      "https://www.bi.go.id/en/statistik/informasi-kurs/transaksi-bi/Default.aspx";
    const { data } = await axios({
      method: "GET",
      url: siteUrl,
    });

    const $ = cheerio.load(data);
    const elemSelector =
      "#tableData > div > div:nth-child(4) > div.row > div:nth-child(1) > div > div > span";
    return $(elemSelector).text();
  } catch (error) {
    console.log(error);
  }
}

app.get("/", async (req, res) => {
  try {
    const kursFeed = await getKurs();
    const Date = await getDate();
    return res.status(200).json({
      kursFeed,
      Date,
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
