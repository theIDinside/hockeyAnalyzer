// THIS WILL LATER BE REMOVED. This file should later on define the startup sequence for the server. It now is a test placeholder
const gs = require('./scrape/gameScraper');
const st = require('./scrape/seasonTable');
const {anyOf, daysFrom} = require('./utilities');
const l = (msg) => console.log(msg);
const req = require('request-promise');
let axios = require('axios');
const puppeteer = require('puppeteer');

async function getHTMLData(url) {
    let d = new Date("2019-01-12");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let response = await page.goto(url, {waitUntil: 'networkidle2'});
    // const _ = await page.evaluate(() => {});
    let htmlContent = await page.content();
    l(`HTML data size: ${htmlContent.length}`);
    await browser.close();
    return htmlContent;
}

(async function() {
    let today = new Date().toISOString().split("T")[0]
    console.log(`Today's date: ${today}`);
    l(`Tomorrows date: ${daysFrom(today, 1).toISOString().split("T")[0]}`)
    let d = new Date("2019-01-12");
    let d2 = d.toISOString().split("T")[0];
    let gamesDateURL = `https://www.nhl.com/scores/${d2}`;
    let htmlData = await getHTMLData(gamesDateURL);
    let arr = gs.getGameIDsAtDateHTML(d, htmlData);
    l(`Game ID results count: ${arr.length}`);
    for(let a of arr) {
        l(`Game id: ${a}`);
    }
    let summaryURL = "http://www.nhl.com/scores/htmlreports/20182019/GS020687.HTM";
    l(`Begin scraping of example summary page: ${summaryURL}`);
    gs.scrapeGameSummaryReport(summaryURL).then(summary => {
        l("Summary fetchede and processed! Printing: ");
        summary.printScoringSummary();
    }).catch(err => {
        l(err);
    })
    let standings = await st.getTeamStandingsData();
    l("NHL Table")
    for(let t of standings) {
        l(t.getRawData());
    }
})()