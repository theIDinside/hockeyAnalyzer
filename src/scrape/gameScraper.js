const C = require('cheerio')
const Constants = require('../constants')
const puppeteer = require('puppeteer');
let axios = require('axios');
const {anyOf, daysFrom, dateStringify, getFullTeamName, l} = require('../utilities');
const {Goal, ScoringSummary} = require('./ScoringSummary')
const getGamesListItem = (dateString) => `nhl-scores__${dateString}`;
const getGamePageURL = (gameNumber) => `https://www.nhl.com/gamecenter/201802${gameNumber}`
const getGameSummaryURL = (gameID) => {
    let tmp = gameID.toString();
    return `http://www.nhl.com/scores/htmlreports/20182019/GS02${removePrefixOf(tmp, 6)}.HTM`
}

const removePrefixOf = (str, len) => {
    try {
        if(str.length < len) {
            throw Error("Prefix length is longer than actual string");
        }
        return str.split().splice(0, len).join();
    } catch(err) {
        return str;
    }
}


/// This function, retrieves from the site, the games for the coming 6 days (including the provided date in the argument. This is I guess somehow, what the site prefetches or something.)
async function getGameIDsAtDate(date) {
        let currDate = new Date(date);
        let stopDate = new Date(currDate);
        stopDate.setUTCDate(stopDate.getUTCDate() + 1);
        if (date !== String)
            date = date.toISOString().split("T")[0]
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
    if(date !== String)
        date = date.toISOString().split("T")[0]
    let navData = C.load(htmlData);
    let gamesAtDate = getGamesListItem(date);
    stopDate = dateStringify(stopDate);
    let gameStopListItem = getGamesListItem(stopDate);
    let games = navData(`#${gamesAtDate}`).nextUntil(`#${gameStopListItem}`).map((i, e) => navData(e).children().children().children().first().attr("id")).get();
    return games;
}

async function scrapeGame(gameID) {
    let [away, home, atDate] = getTeamsPlayingIn(gameID);
    let [y,m,d] = atDate.toISOString().split("T")[0].split("-")

    // OBS OBS OBS NB NB NB! In NHL, different from SHL or how european standard define home and away, is different. So SHL, it would look like: Home vs Away. In NHL it's Away vs Home
    let gameStatsURL = `https://www.nhl.com/gamecenter/${away}-vs-${home}/${y}/${m}/${d}/${gameID}#game=${gameID},game_state=final,game_tab=stats`
    let summaryURL = getGameSummaryURL(gameID);
    let summary = scrapeGameSummaryReport(summaryURL);
    let gameStats = scrapeGameStats(gameStatsURL);

    Promise.all([summary, gameStats]).then(values => {
        let [summaryReportResult, gameStatsResult] = values;

    })

}

async function scrapeGameStats(gameStatsURL) {

}

/**
 * 
 * @param { string } summaryReportURL  
 * @param { string } season 
 * @returns { Promise<ScoringSummary> }
 */
async function scrapeGameSummaryReport(summaryReportURL, season="20182019") {
    // let summaryURL = `http://www.nhl.com/scores/htmlreports/${season}/GS${gameID}.HTM`
    let htmlData = await axios(summaryReportURL).then(res => {
        l("Summary report data downloaded. Begin scraping...")
        return res.data
    }).catch(err => {
        l(`Error while trying to download the data: ${err}`)
    });
    let summary = new ScoringSummary(htmlData);
    return summary;
}






module.exports.getGameIDsAtDate = getGameIDsAtDate;
module.exports.getGameIDsAtDateHTML = getGameIDsAtDateHTML;
module.exports.ScoringSummary = ScoringSummary;
module.exports.scrapeGameSummaryReport = scrapeGameSummaryReport;
module.exports.removePrefixOf = removePrefixOf;