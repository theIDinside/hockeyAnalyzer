const C = require('cheerio');
const Constants = require('../util/constants');
const puppeteer = require('puppeteer');
let axios = require('axios');
const {anyOf, daysFrom, dateStringify, getFullTeamName, l, Int, Float, removePrefixOf, dateString} = require('../util/utilities');
const {Goal, ScoringSummary} = require('./ScoringSummary');
const {Time, MakeTime} = require('../util/Time');


const getGamesListItem = (dateString) => `nhl-scores__${dateString}`;
const getGamePageURL = (gameNumber) => `https://www.nhl.com/gamecenter/201802${gameNumber}`;
const getGameSummaryURL = (gameID) => {
    let tmp = gameID.toString();
    return `http://www.nhl.com/scores/htmlreports/20182019/GS02${removePrefixOf(tmp, 6)}.HTM`
};


/// This function, retrieves from the site, the games for the coming 6 days (including the provided date in the argument. This is I guess somehow, what the site prefetches or something.)
async function getGameIDsAtDate(date) {
        let currDate = new Date(date);
        let stopDate = new Date(currDate);
        stopDate.setUTCDate(stopDate.getUTCDate() + 1);
        date = dateString(date);
        let gamesDateURL = `https://www.nhl.com/scores/${date}`;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(gamesDateURL, {waitUntil: "networkidle2"});
        const _ = page.evaluate(() => {});
        const htmlData = await page.content();
        l(`Requesting data from: ${gamesDateURL}... Please wait`);
        let navData = C.load(htmlData);
        let gamesAtDate = getGamesListItem(date);
        stopDate = dateStringify(stopDate);
        let gameStopListItem = getGamesListItem(stopDate);
        let games = navData(`#${gamesAtDate}`).nextUntil(`#${gameStopListItem}`).map((i, e) => navData(e).children().children().children().first().attr("id")).get();
        browser.close();
        return games;
}
function getGameIDsAtDateHTML(date, htmlData) {
    let currDate = new Date(date);
    let stopDate = new Date(currDate);
    stopDate.setUTCDate(stopDate.getUTCDate() + 1);
    date = dateString(date);
    let navData = C.load(htmlData);
    let gamesAtDate = getGamesListItem(date);
    stopDate = dateStringify(stopDate);
    let gameStopListItem = getGamesListItem(stopDate);
    let games = navData(`#${gamesAtDate}`).nextUntil(`#${gameStopListItem}`).map((i, e) => navData(e).children().children().children().first().attr("id")).get();
    return games;
}

/**
 * 
 * @param { string } summaryReportURL  
 * @param { string } season 
 * @returns { Promise<ScoringSummary> }
 */
async function scrapeGameSummaryReport(summaryReportURL, season="20182019") {
    // let summaryURL = `http://www.nhl.com/scores/htmlreports/${season}/GS${gameID}.HTM`
    return axios(summaryReportURL).then(res => {
        l("Summary report data downloaded. Begin scraping...");
        return new ScoringSummary(res.data);
    }).catch(err => {
        l(`Error while trying to download the data: ${err}`)
    });
}

module.exports = {
    getGameIDsAtDate,
    getGameIDsAtDateHTML,
    ScoringSummary,
    scrapeGameSummaryReport,
    removePrefixOf,
    getGameSummaryURL,
    getGamePageURL
};