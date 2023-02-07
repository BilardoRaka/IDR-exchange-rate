const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
let cors = require("cors");
app.use(cors());

async function getKurs() {
  try {
    const siteUrl =
      "https://kurs.dollar.web.id/kurs-transaksi-bank-indonesia.php";
    const { data } = await axios({
      method: "GET",
      url: siteUrl,
    });

    const $ = cheerio.load(data);
    const elemSelector = "#main > div > div:nth-child(7) > table > tbody > tr";
    const keys = ["Valas", "HargaBeli", "HargaJual"];
    const kursArr = [];

    $(elemSelector).each((parentIdx, parentElem) => {
      let keyIdx = 0;
      const kursObj = {};

      $(parentElem)
        .children()
        .each((childIdx, childElem) => {
          const tdValue = $(childElem).text();
          if (tdValue) {
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

app.get("/", async (req, res) => {
  try {
    const kursFeed = await getKurs();
    return res.status(200).json({
      kursFeed,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

// PORT
app.listen(process.env.PORT || 3000, () => {
  console.log("running on port", port);
});
