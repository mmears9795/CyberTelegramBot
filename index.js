require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const puppeteer = require('puppeteer');
const promises =  require("fs");
const FormData = require('form-data');

const {TELEGRAM_API_TOKEN, ENGROK_URL} = process.env;
const TELEGRAM_API = 'https://api.telegram.org/bot' + TELEGRAM_API_TOKEN;
const URI = '/webhook/' + TELEGRAM_API_TOKEN;
const WEBHOOK_URL = ENGROK_URL + URI;

const app = express();
app.use(bodyParser.json());

const init = async () => {
    const res = await axios.get(TELEGRAM_API + '/setWebhook?url=' + WEBHOOK_URL);
    console.log(res.data);
};

app.post(URI, async (req, res) => {
    console.log(req.body);

    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;

    if(text === '/chart') {
        var dextools = "https://www.dextools.io/app/ether/pair-explorer/0x4bbd1ddc2ded3c287b74dbf3c2e500631de4bf50";


        var errorPrintscreen = false;
        

        async function getChart() {

            const delay = ms => new Promise(res => setTimeout(res, ms));
                        
            const browser = await puppeteer.launch(2);
            

            const page = await browser.newPage();
            await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36");
            await page.setViewport({ width: 1560, height: 900 });
            page.setDefaultNavigationTimeout(0);

            await page.goto(dextools, { waitUntil: 'networkidle0' }).catch(() => console.log('timeout go to...'));

            // await page.screenshot({path: 'example.png'}).catch((e) => console.log('timeout... screenshot' + e));

            await delay(5000);

            var dateNowVar = Date.now();

            await page.screenshot({
                path: 'charts/chart_'+ dateNowVar +'.png',
                clip: {
                x: 364,
                y: 357,
                width: 894,
                height: 510,
                }
            }).catch((e) => {
                errorPrintscreen = true;
                getChart();
                
            });

            if(!errorPrintscreen){



                const file = "charts/chart_"+ dateNowVar +".png";

                var formData = new FormData();

                await axios.post(TELEGRAM_API + '/sendphoto', {
                    // headers: {
                    //     'Content-Type': 'multipart/form-data'
                    // },
                    chat_id: chatId,
                    photo: formData
                });

                console.log("chart sent");

            }

            

            await browser.close();

        }

        try {
            getChart();
        } catch(err) {
            console.log("Get Chart error: ", err);
        }
    };

    // await axios.post(TELEGRAM_API + "/sendMessage", {
    //     chat_id: chatId,
    //     text: text
    // });

    return res.send();
})

app.listen(process.env.PORT || 5000, async () => {
    console.log('App running on port', process.env.PORT || 5000);
    await init()
});

