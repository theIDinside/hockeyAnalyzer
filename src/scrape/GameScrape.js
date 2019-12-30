const C = require('cheerio');
const Constants = require('../util/constants');
const puppeteer = require('puppeteer');
let axios = require('axios');
const {dumpErrorStackTrace, anyOf, daysFrom, dateStringify, getFullTeamName, l, Int, Float, removePrefixOf, dateString} = require('../util/utilities');
const {Goal, ScoringSummary} = require('./ScoringSummary');
const {Time, MakeTime} = require('../util/Time');


const getGamesListItem = (dateString) => `nhl-scores__${dateString}`;


const SEASON = process.env.SEASON || "19/20";

const getGamePageURL = (gameID) => {
    return `https://www.nhl.com/gamecenter/${gameID}`;
}

function getSeasonString() {    
    let start = Number.parseInt(SEASON.split("/")[0]);
    let end = Number.parseInt(SEASON.split("/")[1]);
    let result = `20${start}20${end}`;
    return result;
}

/**
 * Returns parsed game summary URL for game with game id gameID
 * @param {Number} gameID The id of the game to retrieve summary URL for.
 * @return {String} Returns full URL to summary report of game.
 */
const getGameSummaryURL = (gameID) => {
    return `http://www.nhl.com/scores/htmlreports/${getSeasonString()}/GS02${removePrefixOf(gameID.toString(), 6)}.HTM`;
}

/**
 * Returns shot summary URL for game with id gameID.
 * @param {number} gameID
 * @returns {string} the URL as string.
 */
const getShotSummaryURL = (gameID) => {
    let id = gameID.toString();
    if(id.length !== 10) throw Error("Game id passed to getShotSummaryURL(gameID) has to be of length 10");
    let game_number = [...id].splice(id.length-4, id.length).join("");
    return `http://www.nhl.com/scores/htmlreports/20192020/SS02${game_number}.HTM`;
}

/// This function, retrieves from the site, the games for the coming 6 days (including the provided date in the argument. This is I guess somehow, what the site prefetches or something.)
async function getGameIDsAtDate(date) {
        let currDate = new Date(date);
        let stopDate = new Date(currDate);
        stopDate.setUTCDate(stopDate.getUTCDate() + 1);
        date = dateString(date);
        console.log(`Games at date: ${date}`);
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
 * Returns a scoring summary that contains the HTML data from the summary report. This can then be translated into a MongoDB model, using the .model method. Notice that it uses the getter
 * so no () is used at the end of that method call.
 * @param { string } summaryReportURL  pp
 * @returns { Promise<ScoringSummary> }
 */
async function scrapeGameSummaryReport(summaryReportURL) {
    return axios(summaryReportURL).then(res => {
        l("Summary report data downloaded. Begin scraping...");
        return new ScoringSummary(res.data);
    }).catch(err => {
        l(`Error while trying to download the data: ${err}`)
        dumpErrorStackTrace(err);
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